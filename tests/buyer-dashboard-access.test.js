const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const dashboardScripts = [
  "js/buyer/dashboard.js",
  "js/buyer/modules.js"
];

function runDashboardScript(relativePath, storedUser) {
  let readyHandler;
  let redirect;
  let ensureDemoStateCalls = 0;
  const context = vm.createContext({
    console: { error() {} },
    localStorage: {
      getItem(key) {
        return key === "tradenestCurrentUser" ? storedUser : null;
      }
    },
    document: {
      body: { dataset: { page: "dashboard" } },
      addEventListener(event, handler) {
        if (event === "DOMContentLoaded") readyHandler = handler;
      }
    }
  });
  context.window = context;
  context.location = {
    replace(pathname) {
      redirect = pathname;
    }
  };
  context.TradeNestStore = {
    CURRENT_USER_KEY: "tradenestCurrentUser",
    ensureDemoState() {
      ensureDemoStateCalls += 1;
    }
  };

  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  vm.runInContext(source, context, { filename: relativePath });
  readyHandler();

  return { redirect, ensureDemoStateCalls };
}

for (const script of dashboardScripts) {
  test(`${script} redirects visitors without a buyer session before initialization`, () => {
    for (const storedUser of [
      null,
      "{invalid json",
      JSON.stringify({ role: "supplier" })
    ]) {
      const result = runDashboardScript(script, storedUser);
      assert.equal(result.redirect, "../../auth/login.html");
      assert.equal(result.ensureDemoStateCalls, 0);
    }
  });
}

test("buyer dashboard explains the buyer toolkit and links to its procurement features", () => {
  const dashboard = fs.readFileSync(
    path.join(root, "pages/buyer/dashboard.html"),
    "utf8"
  );

  for (const destination of [
    "rfqs.html",
    "products.html",
    "suppliers.html",
    "purchase-history.html",
    "request-quote.html",
    "compare-quotes.html"
  ]) {
    assert.match(dashboard, new RegExp(`href="${destination}"`));
  }

  assert.match(dashboard, /Why source with TradeNest\?/);
  assert.match(dashboard, /request samples before a larger order/);
  assert.match(dashboard, /follow orders, payments\s+and deliveries/);
  assert.match(dashboard, /id="totalOrders"/);
  assert.match(dashboard, /id="activeQuotes"/);
});

test("buyer profile page displays registration details saved in nested fields", () => {
  let readyHandler;
  const account = {
    id: "buyer-registered-01",
    role: "buyer",
    fullName: "Maya Rao",
    email: "maya@example.com",
    phone: "9876543210",
    business: {
      name: "Rao Wholesale",
      type: "Distributor",
      category: "Office Supplies",
      gst: "29ABCDE1234F1Z5"
    },
    address: {
      address: "12 Market Road",
      city: "Mysuru",
      state: "Karnataka",
      pincode: "570001"
    }
  };
  const container = { innerHTML: "" };
  const form = {
    dataset: {},
    addEventListener() {},
    fullName: { value: "" },
    email: { value: "" },
    phone: { value: "" },
    businessName: { value: "" },
    businessType: { value: "" },
    businessCategory: { value: "" },
    gstin: { value: "" },
    address: { value: "" },
    city: { value: "" },
    state: { value: "" },
    pincode: { value: "" }
  };
  const context = vm.createContext({
    console,
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {}
    },
    document: {
      body: { dataset: { page: "profile" } },
      addEventListener(event, handler) {
        if (event === "DOMContentLoaded") readyHandler = handler;
      },
      getElementById(id) {
        if (id === "buyer-profile-card") return container;
        if (id === "buyer-profile-form") return form;
        return null;
      }
    },
    TradeNestStore: {
      ensureDemoState() {},
      getCurrentUser() {
        return account;
      }
    }
  });
  context.window = context;
  context.addEventListener = function () {};

  const source = fs.readFileSync(
    path.join(root, "js/buyer/modules.js"),
    "utf8"
  );
  vm.runInContext(source, context, { filename: "js/buyer/modules.js" });
  readyHandler();

  assert.match(container.innerHTML, /Maya Rao/);
  assert.match(container.innerHTML, /Rao Wholesale/);
  assert.match(container.innerHTML, /maya@example\.com/);
  assert.match(container.innerHTML, /29ABCDE1234F1Z5/);
  assert.match(container.innerHTML, /12 Market Road/);
  assert.match(container.innerHTML, /Mysuru, Karnataka - 570001/);
  assert.equal(form.businessName.value, "Rao Wholesale");
  assert.equal(form.businessType.value, "Distributor");
});
