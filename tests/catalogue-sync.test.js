const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function createStores() {
  const values = new Map();
  const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
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
    document: { currentScript: null }
  });
  context.window = context;
  for (const file of ["js/tradenest-store.js", "js/supplier/supplier-store.js"]) {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  }
  return context;
}

function catalogueProduct(context, id) {
  return context.TradeNestStore.getStore().products.find((product) => product.id === id);
}

test("supplier products map to the buyer catalogue using INR and supplier profile", () => {
  const context = createStores();
  const product = catalogueProduct(context, "PRD-001");
  assert.ok(product);
  assert.equal(product.price, 392);
  assert.equal(product.supplierName, "TradeNest Supplies Pvt. Ltd.");
  assert.equal(product.supplierId, "supplier-001");
});

test("supplier product edits and stock changes reach the buyer catalogue", () => {
  const context = createStores();
  const supplier = context.SupplierStore;
  const product = supplier.getProductById("PRD-001");
  supplier.saveProduct({ ...product, name: "Updated Gloves", unitPrice: 5.25 });
  assert.equal(catalogueProduct(context, "PRD-001").name, "Updated Gloves");
  assert.equal(catalogueProduct(context, "PRD-001").price, 420);

  supplier.updateStock("PRD-001", 0, 300);
  assert.equal(catalogueProduct(context, "PRD-001").availability, "Out of Stock");
});

test("inactive and deleted supplier products are absent from the buyer catalogue", () => {
  const context = createStores();
  const supplier = context.SupplierStore;
  supplier.toggleProductStatus("PRD-001");
  assert.equal(catalogueProduct(context, "PRD-001"), undefined);
  supplier.toggleProductStatus("PRD-001");
  assert.ok(catalogueProduct(context, "PRD-001"));
  supplier.deleteProduct("PRD-001");
  assert.equal(catalogueProduct(context, "PRD-001"), undefined);
});

test("new product IDs stay unique after an earlier product is deleted", () => {
  const context = createStores();
  const supplier = context.SupplierStore;
  supplier.deleteProduct("PRD-003");
  supplier.saveProduct({ name: "New Catalogue Item", unitPrice: 10, availableStock: 20, uom: "unit", moq: 1 });
  const ids = supplier.getProducts().map((product) => product.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes("PRD-007"));
});

test("supplier profile changes reach the buyer supplier record", () => {
  const context = createStores();
  context.SupplierStore.saveBusinessProfile({
    businessName: "Updated Supplier Ltd.",
    primaryCategory: "Updated Category",
    registeredAddress: "Unit 4, Bengaluru, Karnataka, India"
  });
  const supplier = context.TradeNestStore.getStore().supplierProfiles.find((item) => item.id === "supplier-001");
  assert.equal(supplier.businessName, "Updated Supplier Ltd.");
  assert.equal(supplier.category, "Updated Category");
  assert.equal(supplier.location, "Bengaluru");

  context.SupplierStore.saveBusinessProfile({ verificationStatus: "Pending Review" });
  const updatedSupplier = context.TradeNestStore.getStore().supplierProfiles.find((item) => item.id === "supplier-001");
  assert.equal(updatedSupplier.verificationStatus, "Unverified");
});

test("buyer RFQs reach the supplier workspace and supplier decisions return to buyers", () => {
  const context = createStores();
  const state = context.TradeNestStore.getStore();
  state.rfqs.unshift({
    id: "rfq-shared-01",
    buyerId: "buyer-001",
    supplierId: "supplier-001",
    productId: "product-001",
    productName: "Industrial Safety Gloves",
    quantity: 40,
    unit: "pairs",
    targetPrice: 200,
    deliveryLocation: "Bengaluru",
    expectedDate: "2026-11-01",
    responseDeadline: "2026-10-20",
    status: "Pending"
  });
  context.TradeNestStore.saveStore(state);

  const supplierRFQ = context.SupplierStore.getRFQById("rfq-shared-01");
  assert.equal(supplierRFQ.requiredQty, 40);
  assert.equal(supplierRFQ.targetBudget, 100);
  assert.equal(context.SupplierStore.updateRFQStatus("rfq-shared-01", "Accepted"), true);
  assert.equal(context.TradeNestStore.getStore().rfqs.find((rfq) => rfq.id === "rfq-shared-01").status, "Accepted");
});

test("supplier quotations and order progress are visible in the buyer store", () => {
  const context = createStores();
  const state = context.TradeNestStore.getStore();
  state.rfqs.unshift({ id: "rfq-shared-02", buyerId: "buyer-001", supplierId: "supplier-001", productId: "product-001", productName: "Industrial Safety Gloves", quantity: 20, unit: "pairs", status: "Pending" });
  context.TradeNestStore.saveStore(state);

  context.SupplierStore.saveQuotation({
    rfqRef: "rfq-shared-02",
    productId: "PRD-001",
    buyerName: "North Star Retail",
    productName: "Industrial Safety Gloves",
    offeredQty: 20,
    unitPrice: 5,
    deliveryCharges: 2,
    totalAmount: 102,
    deliveryTimeline: "5 days",
    paymentTerms: "Advance",
    validityDate: "2026-11-01"
  });
  const buyerState = context.TradeNestStore.getStore();
  const quote = buyerState.quotations.find((item) => item.rfqId === "rfq-shared-02");
  assert.ok(quote);
  assert.equal(quote.unitPrice, 400);
  assert.equal(quote.id.startsWith("QUO-"), true);

  buyerState.orders.unshift({ id: "order-shared-01", buyerId: "buyer-001", supplierId: "supplier-001", productId: "PRD-001", productName: quote.productName, quantity: 20, unit: "pairs", totalAmount: 8100, orderDate: "2026-10-10", expectedDate: "2026-10-20", status: "Placed" });
  context.TradeNestStore.saveStore(buyerState);
  assert.equal(context.SupplierStore.getOrderById("order-shared-01").totalAmount, 101.25);
  context.SupplierStore.updateOrderStatus("order-shared-01", "In Production");
  assert.equal(context.TradeNestStore.getStore().orders.find((item) => item.id === "order-shared-01").status, "Processing");
});

test("supplier messages, sample updates, payments, and shipments write to buyer records", () => {
  const context = createStores();
  const state = context.TradeNestStore.getStore();
  state.conversations.unshift({ id: "conversation-shared-01", buyerId: "buyer-001", supplierId: "supplier-001", supplierName: "TradeNest Supplies Pvt. Ltd.", preview: "Hello", updatedAt: "2026-10-10" });
  state.messages.push({ id: "message-shared-01", conversationId: "conversation-shared-01", buyerId: "buyer-001", supplierId: "supplier-001", sender: "buyer", text: "Hello", sentAt: "2026-10-10" });
  state.sampleRequests.unshift({ id: "sample-shared-01", buyerId: "buyer-001", supplierId: "supplier-001", productId: "product-001", productName: "Industrial Safety Gloves", requestedQuantity: 2, status: "Requested" });
  state.orders.unshift({ id: "order-shared-02", buyerId: "buyer-001", supplierId: "supplier-001", productId: "product-001", productName: "Industrial Safety Gloves", quantity: 2, totalAmount: 8000, orderDate: "2026-10-10", expectedDate: "2026-10-20", status: "Shipped" });
  state.payments.unshift({ id: "payment-shared-01", orderId: "order-shared-02", supplierId: "supplier-001", supplierName: "TradeNest Supplies Pvt. Ltd.", amount: 8000, status: "Pending", paymentDate: "2026-10-10", paymentMethod: "Bank Transfer" });
  state.shipments.unshift({ id: "shipment-shared-01", shipmentReference: "shipment-shared-01", orderId: "order-shared-02", status: "Dispatched", courierName: "Express", trackingNumber: "TRACK-01", timeline: [] });
  context.TradeNestStore.saveStore(state);

  context.SupplierStore.sendMessage("conversation-shared-01", "Quote sent", "supplier");
  context.SupplierStore.updateSampleStatus("sample-shared-01", "Approved");
  context.SupplierStore.updateOrderStatus("order-shared-02", "Delivered");
  context.SupplierStore.updateShipmentStatus("shipment-shared-01", "Delivered");
  const updated = context.TradeNestStore.getStore();
  assert.equal(updated.messages.some((message) => message.conversationId === "conversation-shared-01" && message.text === "Quote sent"), true);
  assert.equal(updated.sampleRequests.find((item) => item.id === "sample-shared-01").status, "Processing");
  assert.equal(updated.orders.find((item) => item.id === "order-shared-02").status, "Delivered");
  assert.equal(updated.payments.find((item) => item.id === "payment-shared-01").status, "Released");
  assert.equal(updated.shipments.find((item) => item.id === "shipment-shared-01").status, "Delivered");
});
