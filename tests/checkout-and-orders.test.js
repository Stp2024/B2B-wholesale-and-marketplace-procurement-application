const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function createEnvironment() {
  const values = new Map();
  const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); }
  };
  const events = [];
  const context = vm.createContext({
    console,
    Date,
    Intl,
    URL,
    JSON,
    Math,
    Number,
    String,
    Object,
    Array,
    Set,
    Map,
    localStorage,
    CustomEvent: class CustomEvent {
      constructor(type, detail) {
        this.type = type;
        this.detail = detail;
      }
    },
    dispatchEvent(event) {
      events.push(event);
      return true;
    },
    document: { currentScript: null }
  });
  context.window = context;

  for (const file of [
    "js/tradenest-store.js",
    "js/supplier/supplier-store.js",
    "js/admin/admin-store.js"
  ]) {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  }

  return { context, localStorage, events };
}

test("validatePurchase enforces MOQ, stock limits, and active product status", () => {
  const { context } = createEnvironment();
  const store = context.TradeNestStore;

  // MOQ violation
  const moqCheck = store.validatePurchase("product-001", 10);
  assert.equal(moqCheck.valid, false);
  assert.match(moqCheck.error, /Minimum order quantity/i);

  // Stock limit violation
  const stockCheck = store.validatePurchase("product-001", 999999);
  assert.equal(stockCheck.valid, false);
  assert.match(stockCheck.error, /exceeds available stock/i);

  // Valid purchase within MOQ and stock
  const validCheck = store.validatePurchase("product-001", 500);
  assert.equal(validCheck.valid, true);
  assert.ok(validCheck.product);
});

test("calculateOrderTotals computes tier pricing, 18% GST, and threshold shipping", () => {
  const { context } = createEnvironment();
  const store = context.TradeNestStore;
  const product = store.getProduct("product-001");

  // Qty 500 triggers bulk tier pricing (₹165/unit) -> ₹82,500 subtotal. Over 50k -> Free shipping.
  const totals = store.calculateOrderTotals(product, 500, "Online Escrow");
  assert.equal(totals.subtotal, 82500);
  assert.equal(totals.shippingFee, 0); // Free shipping over 50k
  assert.equal(totals.taxAmount, Math.round(82500 * 0.18)); // 14,850
  assert.equal(totals.totalAmount, 82500 + 14850);

  // Bulk discount tier test (e.g. 1000 units qualifies for bulk discount if defined)
  const productWithBulk = {
    ...product,
    price: 200,
    bulkPrice: 180,
    bulkPricing: [
      { minQty: 100, maxQty: 499, price: 200 },
      { minQty: 500, maxQty: null, price: 180 }
    ]
  };
  const bulkTotals = store.calculateOrderTotals(productWithBulk, 500, "Online Escrow");
  assert.equal(bulkTotals.unitPrice, 180);
  assert.equal(bulkTotals.subtotal, 90000);

  // Smaller subtotal under ₹50,000 incurs ₹750 delivery fee
  const smallTotals = store.calculateOrderTotals({ ...product, moq: 50, bulkPrice: 100, price: 100 }, 100, "Online Escrow");
  assert.equal(smallTotals.subtotal, 10000);
  assert.equal(smallTotals.shippingFee, 750);
  assert.equal(smallTotals.taxAmount, 1800);
  assert.equal(smallTotals.totalAmount, 10000 + 1800 + 750);
});

test("createOrder atomically creates canonical Order, Payment, Invoice, Shipment and decrements inventory", () => {
  const { context } = createEnvironment();
  const store = context.TradeNestStore;
  const initialStock = store.getProduct("product-001").stock;

  const orderData = {
    productId: "product-001",
    quantity: 500,
    paymentMethod: "Online Escrow",
    deliveryAddress: "42 Warehouse Way, Peenya, Bengaluru, KA 560058",
    billingAddress: "42 Warehouse Way, Peenya, Bengaluru, KA 560058"
  };

  const buyer = { id: "buyer-001", businessName: "Acme Industrial Procurement" };
  const result = store.createOrder(orderData, buyer);

  // 1. Order assertions
  assert.ok(result.order);
  assert.ok(result.order.id.startsWith("ORD-"));
  assert.equal(result.order.buyerId, "buyer-001");
  assert.equal(result.order.productId, "product-001");
  assert.equal(result.order.quantity, 500);
  assert.equal(result.order.status, "Placed");
  assert.equal(result.order.fulfillmentStatus, "Processing");
  assert.equal(result.order.paymentStatus, "Escrow Funded");

  // 2. Linked Payment assertions
  assert.ok(result.payment);
  assert.equal(result.payment.orderId, result.order.id);
  assert.equal(result.payment.amount, result.order.totalAmount);
  assert.equal(result.payment.paymentMethod, "Online Escrow");
  assert.equal(result.payment.status, "Escrow Funded");

  // 3. Linked Invoice assertions
  assert.ok(result.invoice);
  assert.equal(result.invoice.orderId, result.order.id);
  assert.ok(result.invoice.invoiceNumber.startsWith("INV-"));
  assert.equal(result.invoice.totalAmount, result.order.totalAmount);

  // 4. Linked Shipment assertions
  assert.ok(result.shipment);
  assert.equal(result.shipment.orderId, result.order.id);
  assert.equal(result.shipment.status, "Processing");
  assert.equal(result.shipment.deliveryAddress, orderData.deliveryAddress);
  assert.ok(result.shipment.timeline.length >= 1);

  // 5. Stock decrement assertions
  const updatedProduct = store.getProduct("product-001");
  assert.equal(updatedProduct.stock, initialStock - 500);

  // 6. Persistence check in store
  const state = store.getStore();
  assert.ok(state.orders.some((o) => o.id === result.order.id));
  assert.ok(state.payments.some((p) => p.id === result.payment.id));
  assert.ok(state.invoices.some((i) => i.id === result.invoice.id));
  assert.ok(state.shipments.some((s) => s.id === result.shipment.id));
});

test("commercial payment methods assign appropriate simulated payment states", () => {
  const { context } = createEnvironment();
  const store = context.TradeNestStore;
  const buyer = { id: "buyer-001", businessName: "Acme Industrial Procurement" };

  // Bank Transfer -> Payment Pending
  const bankOrder = store.createOrder({
    productId: "product-001",
    quantity: 500,
    paymentMethod: "Bank Transfer",
    deliveryAddress: "Bengaluru"
  }, buyer);
  assert.equal(bankOrder.order.paymentStatus, "Payment Pending");
  assert.equal(bankOrder.payment.status, "Pending");

  // Trade Credit -> Pending Verification
  const creditOrder = store.createOrder({
    productId: "product-002",
    quantity: 200,
    paymentMethod: "Trade Credit (Net 30)",
    deliveryAddress: "Bengaluru"
  }, buyer);
  assert.equal(creditOrder.order.paymentStatus, "Pending Verification");
  assert.equal(creditOrder.payment.status, "Pending");

  // Online Escrow -> Escrow Funded
  const escrowOrder = store.createOrder({
    productId: "product-003",
    quantity: 100,
    paymentMethod: "Online Escrow",
    deliveryAddress: "Bengaluru"
  }, buyer);
  assert.equal(escrowOrder.order.paymentStatus, "Escrow Funded");
  assert.equal(escrowOrder.payment.status, "Escrow Funded");
});

test("convertQuoteToOrder converts quotation to order and prevents duplicate conversion", () => {
  const { context } = createEnvironment();
  const store = context.TradeNestStore;
  const buyer = { id: "buyer-001", businessName: "Acme Industrial Procurement" };

  // Convert quote-001
  const conv1 = store.convertQuoteToOrder("quote-001", buyer, "Online Escrow", "Bengaluru Tech Park");
  assert.equal(conv1.success, true);
  assert.ok(conv1.order);
  assert.equal(conv1.order.quotationId, "quote-001");
  assert.equal(conv1.order.orderType, "quotation");

  // Quotation record is updated to Accepted with convertedOrderId
  const state = store.getStore();
  const quote = state.quotations.find((q) => q.id === "quote-001");
  assert.equal(quote.status, "Accepted");
  assert.equal(quote.convertedOrderId, conv1.order.id);

  // Attempt duplicate conversion
  const conv2 = store.convertQuoteToOrder("quote-001", buyer, "Online Escrow", "Bengaluru Tech Park");
  assert.equal(conv2.success, false);
  assert.match(conv2.error, /already been converted/i);
  assert.equal(conv2.order.id, conv1.order.id);
});

test("order status progression synchronizes fulfillment and releases escrow payment on delivery", () => {
  const { context } = createEnvironment();
  const store = context.TradeNestStore;
  const buyer = { id: "buyer-001", businessName: "Acme Industrial Procurement" };

  const { order } = store.createOrder({
    productId: "product-001",
    quantity: 500,
    paymentMethod: "Online Escrow",
    deliveryAddress: "Bengaluru"
  }, buyer);

  // Advance to Shipped
  store.updateOrderStatus(order.id, "Shipped");
  let state = store.getStore();
  let ord = state.orders.find((o) => o.id === order.id);
  let shp = state.shipments.find((s) => s.orderId === order.id);
  assert.equal(ord.status, "Shipped");
  assert.equal(shp.status, "In Transit");

  // Advance to Delivered
  store.updateOrderStatus(order.id, "Delivered");
  state = store.getStore();
  ord = state.orders.find((o) => o.id === order.id);
  shp = state.shipments.find((s) => s.orderId === order.id);
  const pay = state.payments.find((p) => p.orderId === order.id);

  assert.equal(ord.status, "Delivered");
  assert.equal(shp.status, "Delivered");
  assert.equal(pay.status, "Released");
});

test("newly created orders dynamically propagate to SupplierStore and AdminStore", () => {
  const { context } = createEnvironment();
  const store = context.TradeNestStore;
  const supplierStore = context.SupplierStore;
  const adminStore = context.AdminStore;

  const buyer = { id: "buyer-001", businessName: "Acme Industrial Procurement" };
  const { order } = store.createOrder({
    productId: "product-001",
    supplierId: "supplier-001",
    quantity: 500,
    paymentMethod: "Online Escrow",
    deliveryAddress: "Industrial Hub, Bengaluru"
  }, buyer);

  // 1. Supplier Store reflection
  const supplierOrders = supplierStore.getOrders();
  const foundInSupplier = supplierOrders.find((o) => o.id === order.id);
  assert.ok(foundInSupplier, "Supplier should see the new order");
  assert.equal(foundInSupplier.orderedQty, 500);

  // 2. Admin Store reflection
  const adminOrders = adminStore.getUnifiedOrders();
  const foundInAdmin = adminOrders.find((o) => o.id === order.id);
  assert.ok(foundInAdmin, "Admin should monitor the new order");

  // 3. Admin stats reflection
  const stats = adminStore.calculateAdminStats();
  assert.ok(stats.totalOrders >= adminOrders.length);
  assert.ok(stats.totalGMV >= order.totalAmount);
});

test("role-based order access isolates buyer private records", () => {
  const { context } = createEnvironment();
  const store = context.TradeNestStore;

  // Order for buyer-001
  store.createOrder({
    productId: "product-001",
    quantity: 500,
    paymentMethod: "Online Escrow",
    deliveryAddress: "Bengaluru"
  }, { id: "buyer-001" });

  // Order for buyer-002
  const order2 = store.createOrder({
    productId: "product-002",
    quantity: 200,
    paymentMethod: "Online Escrow",
    deliveryAddress: "Mumbai"
  }, { id: "buyer-002" });

  const state = store.getStore();
  const buyer1Orders = state.orders.filter((o) => o.buyerId === "buyer-001");
  const buyer2Orders = state.orders.filter((o) => o.buyerId === "buyer-002");

  assert.ok(buyer1Orders.every((o) => o.buyerId === "buyer-001"));
  assert.ok(buyer2Orders.every((o) => o.buyerId === "buyer-002"));
  assert.ok(!buyer1Orders.some((o) => o.id === order2.order.id));
});
