const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const publicPages = [
  "index.html",
  "pages/about.html",
  "pages/contact.html",
  "pages/discover-suppliers.html",
  "pages/join-supplier-network.html",
  "pages/product-details.html",
  "pages/products.html",
  "pages/supplier-details.html",
  "pages/suppliers.html"
];
const accountRequiredAction =
  /^(?:request a quote|request a sample|compare suppliers|track orders|list products|manage quotes|manage orders|contact supplier)$/i;

test("public business actions route to account registration", () => {
  for (const relativePath of publicPages) {
    const html = fs.readFileSync(path.join(root, relativePath), "utf8");
    const anchors = html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi);

    for (const [, attributes, content] of anchors) {
      const label = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
      if (!accountRequiredAction.test(label)) {
        continue;
      }

      assert.match(
        attributes,
        /href=["'][^"']*auth\/register\.html(?:[?#][^"']*)?["']/i,
        `${relativePath} action "${label}" should lead to registration`
      );
    }

    assert.doesNotMatch(
      html,
      /href=["'][^"']*(?:buyer|supplier)\/(?:rfqs|compare-quotes|samples|orders|products|quotations|collaboration)\.html/i,
      `${relativePath} should not link directly to buyer or supplier operations`
    );
  }
});

test("public pages do not expose the admin console", () => {
  for (const relativePath of publicPages) {
    const html = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.doesNotMatch(html, /Admin Console|admin\/dashboard\.html/i);
  }
});

test("public footer links do not use dead placeholders or missing privacy pages", () => {
  for (const relativePath of [...publicPages, "auth/login.html"]) {
    const html = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.doesNotMatch(
      html,
      /href=["']#["']|privacy-policy\.html/i,
      `${relativePath} should not contain dead placeholder links`
    );
  }
});
