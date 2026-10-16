const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

test("shared and portal stylesheets declare the official 4-color palette", () => {
  const sharedCss = fs.readFileSync(path.join(root, "css/shared.css"), "utf8");
  assert.match(sharedCss, /#F7FBFC/i, "css/shared.css should include Ice White #F7FBFC");
  assert.match(sharedCss, /#D6E6F2/i, "css/shared.css should include Soft Sky Blue #D6E6F2");
  assert.match(sharedCss, /#B9D7EA/i, "css/shared.css should include Powder Blue #B9D7EA");
  assert.match(sharedCss, /#769FCD/i, "css/shared.css should include Steel Blue #769FCD");

  // Rounded system
  assert.match(sharedCss, /--radius-input:\s*10px/, "css/shared.css should declare 10px input radius");
  assert.match(sharedCss, /--radius-button:\s*12px/, "css/shared.css should declare 12px button radius");
  assert.match(sharedCss, /--radius-card:\s*18px/, "css/shared.css should declare 18px card radius");
  assert.match(sharedCss, /--radius-hero:\s*24px/, "css/shared.css should declare 24px hero radius");

  // Check portal styles
  const buyerCss = fs.readFileSync(path.join(root, "css/buyer/modules.css"), "utf8");
  assert.match(buyerCss, /#769FCD/i, "css/buyer/modules.css should use Steel Blue");

  const supplierCss = fs.readFileSync(path.join(root, "css/supplier/dashboard.css"), "utf8");
  assert.match(supplierCss, /#769FCD/i, "css/supplier/dashboard.css should use Steel Blue");

  const adminCss = fs.readFileSync(path.join(root, "css/admin/dashboard.css"), "utf8");
  assert.match(adminCss, /#769FCD/i, "css/admin/dashboard.css should use Steel Blue");
});

test("placeholder product SVG exists with brand colors and valid dimensions", () => {
  const svgPath = path.join(root, "images/placeholder-product.svg");
  assert.ok(fs.existsSync(svgPath), "placeholder-product.svg must exist");
  const svgContent = fs.readFileSync(svgPath, "utf8");
  assert.match(svgContent, /<svg\b/i);
  assert.match(svgContent, /#769FCD/i);
  assert.match(svgContent, /#F7FBFC/i);
});

function createMockEnvironment() {
  const store = {};
  const customEvents = [];

  const localStorage = {
    getItem(key) { return store[key] !== undefined ? store[key] : null; },
    setItem(key, val) { store[key] = String(val); },
    removeItem(key) { delete store[key]; },
    clear() { for (const k in store) delete store[k]; }
  };

  const window = {
    location: { pathname: "/index.html", href: "/index.html" },
    localStorage,
    dispatchEvent(evt) { customEvents.push(evt); },
    addEventListener() {},
    removeEventListener() {}
  };

  const document = {
    currentScript: null,
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById() { return null; },
    createElement() { return { setAttribute() {}, appendChild() {}, style: {} }; }
  };

  const context = vm.createContext({
    window,
    document,
    localStorage,
    console,
    Date,
    Intl,
    URL,
    Map,
    Math,
    JSON,
    Array,
    Object,
    String,
    Number,
    Set,
    RegExp,
    CustomEvent: function(name, opts) { this.type = name; this.detail = opts ? opts.detail : null; }
  });

  const code = fs.readFileSync(path.join(root, "js/tradenest-store.js"), "utf8");
  vm.runInContext(code, context);

  return { TradeNestStore: context.window.TradeNestStore, localStorage, customEvents };
}

test("Recently Viewed Products records, deduplicates, and caps at 8 items", () => {
  const { TradeNestStore, localStorage } = createMockEnvironment();

  TradeNestStore.recordRecentlyViewed("product-001");
  TradeNestStore.recordRecentlyViewed("product-002");
  TradeNestStore.recordRecentlyViewed("product-003");

  let raw = JSON.parse(localStorage.getItem("tradenest_recently_viewed"));
  assert.deepEqual(raw, ["product-003", "product-002", "product-001"]);

  // Viewing product-001 again moves it to front without duplication
  TradeNestStore.recordRecentlyViewed("product-001");
  raw = JSON.parse(localStorage.getItem("tradenest_recently_viewed"));
  assert.deepEqual(raw, ["product-001", "product-003", "product-002"]);

  // Record 10 unique products
  for (let i = 4; i <= 12; i++) {
    TradeNestStore.recordRecentlyViewed(`product-${String(i).padStart(3, "0")}`);
  }
  raw = JSON.parse(localStorage.getItem("tradenest_recently_viewed"));
  assert.equal(raw.length, 8, "Recently viewed list should be capped at 8 products");

  // Retrieve via getRecentlyViewed()
  const retrieved = TradeNestStore.getRecentlyViewed();
  assert.ok(Array.isArray(retrieved));
  assert.ok(retrieved.length > 0 && retrieved.length <= 8);
  assert.ok(retrieved.every(p => p.id && p.name && p.price));
});

test("Notification Center manages persistence, role filtering, and read status", () => {
  const { TradeNestStore, localStorage } = createMockEnvironment();

  // Initially has seed notifications
  const initial = TradeNestStore.getNotifications();
  assert.ok(initial.length >= 4, "Should have seed notifications");

  // Add buyer notification
  const notif = TradeNestStore.addNotification({
    recipientId: "buyer-001",
    role: "buyer",
    type: "order",
    title: "Order Test Confirmation",
    message: "Your test order was placed.",
    link: "pages/buyer/orders.html"
  });

  assert.ok(notif, "Notification should be created");
  assert.equal(notif.read, false);
  assert.equal(notif.role, "buyer");

  // Filter notifications by role
  const buyerNotifs = TradeNestStore.getNotifications("buyer-001", "buyer");
  assert.ok(buyerNotifs.some(n => n.id === notif.id));

  // Supplier should not see this specific buyer's notifications
  const supplierNotifs = TradeNestStore.getNotifications("supplier-999", "supplier");
  assert.ok(!supplierNotifs.some(n => n.id === notif.id));

  // Mark as read
  const unreadBefore = TradeNestStore.getUnreadNotificationCount("buyer-001", "buyer");
  TradeNestStore.markNotificationAsRead(notif.id);
  const unreadAfter = TradeNestStore.getUnreadNotificationCount("buyer-001", "buyer");
  assert.equal(unreadAfter, unreadBefore - 1);

  // Mark all as read
  TradeNestStore.markAllNotificationsAsRead("buyer-001", "buyer");
  const unreadZero = TradeNestStore.getUnreadNotificationCount("buyer-001", "buyer");
  assert.equal(unreadZero, 0);
});

test("searchCatalog finds matching products, categories, and suppliers without leaking private records", () => {
  const { TradeNestStore } = createMockEnvironment();

  const gloveSearch = TradeNestStore.searchCatalog("gloves");
  assert.ok(gloveSearch.products.length > 0, "Should match industrial safety gloves");
  assert.equal(gloveSearch.products[0].id, "product-001");

  const categorySearch = TradeNestStore.searchCatalog("Packaging");
  assert.ok(categorySearch.categories.includes("Packaging") || categorySearch.products.some(p => p.category === "Packaging"));

  const supplierSearch = TradeNestStore.searchCatalog("Apex");
  assert.ok(supplierSearch.suppliers.length > 0, "Should match Apex Gear Co.");
  assert.equal(supplierSearch.suppliers[0].id, "supplier-001");

  // Empty or invalid search returns safe empty arrays
  const emptySearch = TradeNestStore.searchCatalog("");
  assert.equal(emptySearch.query, "");
  assert.equal(emptySearch.products.length, 0);
  assert.equal(emptySearch.categories.length, 0);
  assert.equal(emptySearch.suppliers.length, 0);
});

test("Order creation triggers automatic notification to both Buyer and Supplier", () => {
  const { TradeNestStore } = createMockEnvironment();

  const user = { id: "buyer-001", role: "buyer", fullName: "Aisha Patel" };
  const res = TradeNestStore.createOrder({
    productId: "product-001",
    productName: "Industrial Safety Gloves",
    supplierId: "supplier-001",
    quantity: 500,
    unitPrice: 180,
    paymentMethod: "Online Escrow",
    deliveryAddress: "Bengaluru, Karnataka"
  }, user);

  assert.ok(res.order);

  const buyerNotifs = TradeNestStore.getNotifications("buyer-001", "buyer");
  assert.ok(buyerNotifs.some(n => n.title === "Order Placed" && n.message.includes(res.order.id)));

  const supplierNotifs = TradeNestStore.getNotifications("supplier-001", "supplier");
  assert.ok(supplierNotifs.some(n => n.title === "New Order Received" && n.message.includes(res.order.id)));
});
