const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

test("admin sign-in has a dedicated entry point and fixed admin role", () => {
  const adminLogin = read("auth/admin-login.html");
  const loginScript = read("js/login.js");
  const home = read("index.html");

  assert.match(adminLogin, /<body[^>]*data-login-role="admin"/i);
  assert.match(adminLogin, /id="selectedRoleInput" value="admin"/i);
  assert.match(adminLogin, /<script src="\.\.\/js\/login\.js"><\/script>/i);
  assert.match(home, /href="auth\/admin-login\.html"[^>]*>\s*Admin Portal\s*</i);
  assert.match(loginScript, /roleConfigs\[forcedRole\]\s*\|\|/);
  assert.match(loginScript, /if\s*\(!forcedRole\s*&&\s*redirectParam/);
});

test("regular login only offers buyer and supplier roles", () => {
  const login = read("auth/login.html");
  assert.match(login, /data-role="buyer"/);
  assert.match(login, /data-role="supplier"/);
  assert.doesNotMatch(login, /data-role="admin"/);
});
