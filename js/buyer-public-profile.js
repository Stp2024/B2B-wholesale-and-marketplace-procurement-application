(function () {
  "use strict";

  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && typeof value === "object" ? value : fallback;
    } catch (_) {
      return fallback;
    }
  }

  const user = read("tradenestCurrentUser", null);
  const profile = read("tradenestBuyerProfile", {});
  const settings = read("tradenestBuyerSettings", {});
  const role = String(user && (user.role || user.accountType) || "").trim().toLowerCase();
  const visibility = settings.profilePrivacy || "Private to my account";
  const ownerId = profile.ownerId || (user && role === "buyer" ? user.id : "");
  const isOwner = Boolean(user && role === "buyer" && user.id && ownerId === user.id);
  const supplierProfile = read("tradenest_supplier_business_profile", {});
  const verification = String(user && user.verificationStatus || supplierProfile.verificationStatus || "").trim();
  const isVerifiedSupplier = role === "supplier" && ((/\bverified\b/i.test(verification) && !/\bnot verified\b|\bunverified\b|\bpending\b|\brejected\b/i.test(verification)) || Boolean(user && user.isVerified === true));
  const canView = isOwner
    || (visibility === "Visible to verified suppliers" && isVerifiedSupplier)
    || (visibility === "Public to all buyers" && role === "buyer" && Boolean(user && user.id));

  if (!canView) {
    const main = document.getElementById("main-content");
    const notice = document.createElement("section");
    notice.className = "buyer-profile-access-denied";
    const title = document.createElement("h1");
    title.textContent = "Business profile unavailable";
    const message = document.createElement("p");
    if (visibility === "Private to my account") {
      message.textContent = "This buyer has chosen to keep their business profile private.";
    } else if (visibility === "Visible to verified suppliers") {
      message.textContent = "This profile is available to its owner and verified suppliers.";
    } else {
      message.textContent = "Sign in with a buyer account to view this business profile.";
    }
    const link = document.createElement("a");
    link.className = "buyer-profile-cta";
    link.href = user ? "../buyer-dashboard.html" : "../auth/login.html";
    link.textContent = user ? "Return to buyer workspace" : "Sign in to TradeNest";
    notice.append(title, message, link);
    if (main) main.replaceChildren(notice);
    document.title = "Business Profile Unavailable | TradeNest";
    return;
  }

  const business = user.business && typeof user.business === "object" ? user.business : {};
  const address = user.address && typeof user.address === "object" ? user.address : {};
  const name = business.name || user.businessName || user.companyName || profile.businessName || profile.company || "TradeNest Buyer";
  const type = business.type || user.businessType || profile.businessType || "Business Buyer";
  const category = business.category || user.businessCategory || profile.businessCategory || "General Merchandise";
  const city = address.city || user.city || profile.city || "";
  const state = address.state || user.state || profile.state || "";
  const location = [city, state].filter(Boolean).join(", ") || "India";
  const introduction = user.publicDescription || profile.publicDescription || `${name} is a ${type.toLowerCase()} sourcing ${category.toLowerCase()} through TradeNest.`;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "TN";
  const values = {
    buyerAvatar: initials,
    buyerBusinessName: name,
    buyerLocation: location,
    buyerIntroduction: introduction,
    buyerBusinessType: type,
    buyerCategory: category,
    buyerInfoName: name,
    buyerInfoType: type,
    buyerInfoCategory: category,
    buyerInfoLocation: location
  };
  Object.entries(values).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  });
  const avatar = document.getElementById("buyerAvatar");
  if (avatar && typeof profile.profileImage === "string" && profile.profileImage.startsWith("data:image/")) {
    const image = document.createElement("img");
    image.src = profile.profileImage;
    image.alt = `${name} profile photo`;
    avatar.replaceChildren(image);
  }
})();
