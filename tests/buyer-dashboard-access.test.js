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
