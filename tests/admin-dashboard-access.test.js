const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function runAdminDashboard(storedUser) {
  let readyHandler;
  let redirect;
  const context = vm.createContext({
    console: { error() {} },
    setTimeout() {},
    URLSearchParams,
    localStorage: {
      getItem(key) {
        return key === "tradenestCurrentUser" ? storedUser : null;
      }
    },
    document: {
      addEventListener(event, handler) {
        if (event === "DOMContentLoaded") readyHandler = handler;
      }
    }
  });
  context.window = context;
  context.location = {};
  Object.defineProperty(context.location, "href", {
    set(pathname) {
      redirect = pathname;
    }
  });
  context.AdminStore = {};
  context.window.location = context.location;

  const script = fs.readFileSync(
    path.join(root, "js/admin/dashboard.js"),
    "utf8"
  );
  vm.runInContext(script, context, { filename: "js/admin/dashboard.js" });
  readyHandler();

  return redirect;
}

test("admin dashboard redirects users without an admin session", () => {
  for (const storedUser of [
    null,
    "{invalid json",
    JSON.stringify({ role: "buyer" }),
    JSON.stringify({ role: "supplier" })
  ]) {
    assert.equal(
      runAdminDashboard(storedUser),
      "../../auth/admin-login.html"
    );
  }
});
