(function () {
  "use strict";
  function read(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key)); return value && typeof value === "object" ? value : fallback; }
    catch (_) { return fallback; }
  }
  const user = read("tradenestCurrentUser", {});
  const saved = read("tradenestBuyerProfile", {});
  const business = user.business && typeof user.business === "object" ? user.business : {};
  const address = user.address && typeof user.address === "object" ? user.address : {};
  const name = business.name || user.businessName || user.companyName || saved.businessName || saved.company || "TradeNest Buyer";
  const type = business.type || user.businessType || saved.businessType || "Business Buyer";
  const category = business.category || user.businessCategory || saved.businessCategory || "General Merchandise";
  const city = address.city || user.city || saved.city || "";
  const state = address.state || user.state || saved.state || "";
  const location = [city, state].filter(Boolean).join(", ") || "India";
  const introduction = user.publicDescription || saved.publicDescription || `${name} is a ${type.toLowerCase()} sourcing ${category.toLowerCase()} through TradeNest.`;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "TN";
  const values = { buyerAvatar: initials, buyerBusinessName: name, buyerLocation: location, buyerIntroduction: introduction, buyerBusinessType: type, buyerCategory: category, buyerInfoName: name, buyerInfoType: type, buyerInfoCategory: category, buyerInfoLocation: location };
  Object.entries(values).forEach(([id, value]) => { const node = document.getElementById(id); if (node) node.textContent = value; });
})();
