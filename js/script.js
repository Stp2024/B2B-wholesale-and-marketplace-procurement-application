/* =====================================================
   TRADENEST — HOMEPAGE SCRIPT (script.js)
   Dynamic homepage rendering + session management
   ===================================================== */

(function () {
  "use strict";

  // =====================================================
  // CONSTANTS & CONFIG
  // =====================================================

  const CURRENT_USER_KEY = "tradenestCurrentUser";
  const WISHLIST_KEY = "tradenest_wishlist";
  const CART_KEY = "tradenest_cart";

  // Dedicated Admin routing: Administrators must not view public marketplace homepage
  try {
    const rawUser = localStorage.getItem(CURRENT_USER_KEY);
    if (rawUser) {
      const parsedUser = JSON.parse(rawUser);
      const userRole = String(parsedUser && (parsedUser.role || parsedUser.accountType) || "").trim().toLowerCase();
      if (userRole === "admin" || (parsedUser && parsedUser.email && parsedUser.email.toLowerCase() === "admin@tradenest.com")) {
        window.location.replace("pages/admin/dashboard.html");
        return;
      }
    }
  } catch (err) {
    console.warn("Session check error in homepage script:", err);
  }

  const HERO_STATS = [
    { number: "500+", label: "Verified Suppliers" },
    { number: "5,000+", label: "Products Listed" },
    { number: "10,000+", label: "Buyers Registered" },
    { number: "₹50Cr+", label: "Orders Facilitated" }
  ];

  const CATEGORIES = [
    { id: "Industrial Equipment", svgPath: "<path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'/>", name: "Industrial Equipment" },
    { id: "Office Supplies", svgPath: "<rect x='2' y='3' width='20' height='14' rx='2' ry='2'/><line x1='8' y1='21' x2='16' y2='21'/><line x1='12' y1='17' x2='12' y2='21'/>", name: "Office Supplies" },
    { id: "Packaging", svgPath: "<path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/><polyline points='3.27 6.96 12 12.01 20.73 6.96'/><line x1='12' y1='22.08' x2='12' y2='12'/>", name: "Packaging" },
    { id: "Electrical", svgPath: "<polyline points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/>", name: "Electrical" },
    { id: "Textiles", svgPath: "<path d='M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2'/>", name: "Textiles" },
    { id: "Machinery", svgPath: "<circle cx='12' cy='12' r='3'/><path d='M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14'/>", name: "Machinery" },
    { id: "Materials", svgPath: "<path d='M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z'/><path d='M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'/><path d='M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z'/><path d='M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z'/><path d='M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z'/><path d='M14 19.5v-1.5h1.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z'/><path d='M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z'/><path d='M10 4.5V6H8.5C7.67 6 7 5.33 7 4.5S7.67 3 8.5 3 10 3.67 10 4.5z'/>", name: "Materials" },
    { id: "Food & Beverage", svgPath: "<path d='M18 8h1a4 4 0 0 1 0 8h-1'/><path d='M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z'/><line x1='6' y1='1' x2='6' y2='4'/><line x1='10' y1='1' x2='10' y2='4'/><line x1='14' y1='1' x2='14' y2='4'/>", name: "Food & Beverage" }
  ];

  const HOW_IT_WORKS_STEPS = [
    { svgPath: "<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/>", title: "Register", desc: "Create a free account as a buyer, supplier or both. Verification builds trust." },
    { svgPath: "<circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/>", title: "Discover", desc: "Browse 5,000+ verified products across India's top wholesale categories." },
    { svgPath: "<path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/>", title: "Connect & Quote", desc: "Send RFQs directly to suppliers, compare quotes and negotiate terms." },
    { svgPath: "<polyline points='9 11 12 14 22 4'/><path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'/>", title: "Order & Track", desc: "Place orders, track milestones and manage payments in your dashboard." }
  ];

  const BENEFITS = [
    { svgPath: "<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/>", title: "Verified Suppliers", desc: "Every supplier undergoes multi-step business verification before being listed." },
    { svgPath: "<line x1='12' y1='1' x2='12' y2='23'/><path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/>", title: "Competitive Pricing", desc: "Compare wholesale prices from multiple suppliers to secure the best deal." },
    { svgPath: "<path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/><polyline points='10 9 9 9 8 9'/>", title: "Easy RFQ Process", desc: "Create and broadcast RFQs in minutes, receive quotes from multiple vendors." },
    { svgPath: "<line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/>", title: "Procurement Analytics", desc: "Track spending, supplier performance and savings through your dashboard." },
    { svgPath: "<path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/>", title: "Direct Communication", desc: "Message suppliers directly without unnecessary intermediaries." },
    { svgPath: "<rect x='1' y='3' width='15' height='13' rx='1'/><path d='M16 8h4l3 3v5h-7V8z'/><circle cx='5.5' cy='18.5' r='2.5'/><circle cx='18.5' cy='18.5' r='2.5'/>", title: "Order Tracking", desc: "Monitor orders from placement through production to final delivery." }
  ];

  const PROMO_BANNERS = [
    {
      style: "tn-promo-card-blue",
      eyebrow: "For Suppliers",
      title: "Grow Your B2B Business",
      desc: "List products, respond to RFQs and connect with 10,000+ verified buyers.",
      cta: "Join Supplier Network →",
      href: "pages/join-supplier-network.html"
    },
    {
      style: "tn-promo-card-light",
      eyebrow: "For Buyers",
      title: "Request Quotes in Minutes",
      desc: "Create detailed RFQs and receive competitive quotations from verified suppliers.",
      cta: "Start Sourcing →",
      href: "auth/register.html"
    },
    {
      style: "tn-promo-card-soft",
      eyebrow: "Platform Feature",
      title: "Smart Supplier Discovery",
      desc: "Filter by category, location, trust score and availability to find the perfect supplier.",
      cta: "Discover Suppliers →",
      href: "pages/suppliers.html"
    }
  ];

  const BUYER_FEATURES = [
    "Discover & compare verified suppliers",
    "Create & manage RFQs",
    "Compare quotes side-by-side",
    "Request product samples",
    "Track orders & deliveries",
    "Manage procurement analytics"
  ];

  const SUPPLIER_FEATURES = [
    "List products with bulk pricing",
    "Receive & respond to RFQs",
    "Manage inventory & stock",
    "Process orders & invoices",
    "Build your trust score",
    "Access sales analytics"
  ];

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  function safeGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage write failed:", e);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Number(amount) || 0);
  }

  function escapeHtml(str) {
    const el = document.createElement("div");
    el.textContent = String(str || "");
    return el.innerHTML;
  }

  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `tn-toast is-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(40px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function getWishlist() {
    return safeGet(WISHLIST_KEY, []);
  }

  function toggleWishlist(productId, productName) {
    let wishlist = getWishlist();
    const idx = wishlist.indexOf(productId);
    if (idx === -1) {
      wishlist.push(productId);
      safeSet(WISHLIST_KEY, wishlist);
      showToast(`${productName} added to wishlist`, "success");
    } else {
      wishlist.splice(idx, 1);
      safeSet(WISHLIST_KEY, wishlist);
      showToast(`${productName} removed from wishlist`, "info");
    }
    updateWishlistButtons();
  }

  function addToCart(productId, productName) {
    let cart = safeGet(CART_KEY, []);
    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({ id: productId, qty: 1 });
    }
    safeSet(CART_KEY, cart);
    showToast(`${productName} added to cart`, "success");
  }

  function updateWishlistButtons() {
    const wishlist = getWishlist();
    document.querySelectorAll(".tn-product-wishlist-btn[data-product-id]").forEach(btn => {
      const pid = btn.getAttribute("data-product-id");
      const isWishlisted = wishlist.includes(pid);
      btn.classList.toggle("is-wishlisted", isWishlisted);
      const wishSvg = `<svg viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
      btn.innerHTML = wishSvg;
      btn.style.color = isWishlisted ? 'var(--color-error)' : 'var(--color-muted)';
      btn.setAttribute("aria-label", isWishlisted ? "Remove from wishlist" : "Add to wishlist");
    });
  }

  // =====================================================
  // HERO STATS & SLIDER
  // =====================================================

  function renderHeroStats() {
    const container = document.getElementById("heroStats");
    if (!container) return;
    const store = window.TradeNestStore ? window.TradeNestStore.getStore() : null;
    const supplierCount = store && store.supplierProfiles ? store.supplierProfiles.filter(s => s.verificationStatus === "Verified").length : 5;
    const productCount = store && store.products ? store.products.length : 12;
    const buyerCount = store && store.users ? store.users.filter(u => u.role === "buyer").length : 8;
    const orderCount = store && store.orders ? store.orders.length : 16;

    const stats = [
      { number: `${supplierCount}+`, label: "Verified Suppliers" },
      { number: `${productCount}+`, label: "Products Listed" },
      { number: `${buyerCount}+`, label: "Active Buyers" },
      { number: `${orderCount}+`, label: "Orders Fulfilled" }
    ];

    container.innerHTML = stats.map(s =>
      `<div class="tn-hero-stat">
        <span class="tn-hero-stat-number">${escapeHtml(s.number)}</span>
        <span class="tn-hero-stat-label">${escapeHtml(s.label)}</span>
      </div>`
    ).join("");
  }

  function initHeroSlider() {
    const heroEl = document.getElementById("hero");
    const prevBtn = document.getElementById("heroPrevBtn");
    const nextBtn = document.getElementById("heroNextBtn");
    if (!heroEl) return;

    const backgrounds = [
      "images/industrial-warehouse-hero.jpg",
      "images/industrial-automation-hero.jpg"
    ];
    let currentIdx = 0;

    function setSlide(idx) {
      currentIdx = (idx + backgrounds.length) % backgrounds.length;
      heroEl.style.backgroundImage = `url("${backgrounds[currentIdx]}")`;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => setSlide(currentIdx - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => setSlide(currentIdx + 1));
    }
  }

  // =====================================================
  // CATEGORIES (TALL PHOTO CARDS — REFERENCE DESIGN)
  // =====================================================

  const CATEGORY_ITEMS = [
    { id: "Industrial Equipment", name: "Industrial Equipment", img: "images/cat-industrial-equipment.jpg", countLabel: "6 ITEMS" },
    { id: "Office Supplies", name: "Office Supplies & Furniture", img: "images/cat-office-supplies.jpg", countLabel: "7 ITEMS" },
    { id: "Packaging", name: "Packaging & Logistics", img: "images/cat-packaging-logistics.jpg", countLabel: "17 ITEMS" },
    { id: "Electrical", name: "Industrial Lighting", img: "images/cat-electrical-lighting.jpg", countLabel: "3 ITEMS" }
  ];

  function renderCategories() {
    const container = document.getElementById("categoryGrid");
    if (!container) return;

    const store = window.TradeNestStore ? window.TradeNestStore.getStore() : null;
    const products = store ? store.products : [];

    const categoryCounts = {};
    products.forEach(p => {
      const cat = p.category || "Other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    container.innerHTML = CATEGORY_ITEMS.map(cat => {
      const count = categoryCounts[cat.id] || 0;
      const countDisplay = count > 0 ? `${count} ITEMS` : cat.countLabel;
      return `<a class="tn-category-photo-card" href="pages/products.html?category=${encodeURIComponent(cat.id)}" aria-label="Browse ${cat.name}">
        <img src="${cat.img}" alt="${escapeHtml(cat.name)}" class="tn-category-photo-img" loading="lazy" />
        <div class="tn-category-photo-overlay">
          <div class="tn-category-photo-title">${escapeHtml(cat.name)}</div>
          <div class="tn-category-photo-count">${countDisplay}</div>
        </div>
      </a>`;
    }).join("");
  }

  // =====================================================
  // FEATURED / BESTSELLER PRODUCTS (REFERENCE DESIGN)
  // =====================================================

  function renderFeaturedProducts() {
    const container = document.getElementById("featuredProductGrid");
    if (!container) return;

    const store = window.TradeNestStore ? window.TradeNestStore.getStore() : null;
    if (!store) {
      container.innerHTML = '<p class="empty-state-text">Products loading…</p>';
      return;
    }

    const products = store.products.slice(0, 8);
    const wishlist = getWishlist();

    if (!products.length) {
      container.innerHTML = `<div class="tn-empty-state"><div class="tn-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div><h3 class="tn-empty-title">No products available</h3><p class="tn-empty-text">Check back soon for new inventory arrivals.</p></div>`;
      return;
    }

    container.innerHTML = products.map((p, idx) => {
      const isWishlisted = wishlist.includes(p.id);
      const isOut = p.availability === "Out of Stock" || p.stock <= 0;
      
      let badgeHtml = "";
      if (idx === 0) {
        badgeHtml = '<span class="tn-product-badge badge-discount" style="background:#000000;color:#E1DCC9;border:1px solid #E1DCC9;">-15% Tier</span>';
      } else if (isOut) {
        badgeHtml = '<span class="tn-product-badge badge-out" style="background:#000000;color:#ffffff;">Out of stock</span>';
      } else {
        badgeHtml = `<span class="tn-product-badge badge-instock" style="background:#E1DCC9;color:#000000;font-weight:700;">${escapeHtml(p.availability || "In Stock")}</span>`;
      }

      const wishSvg = `<svg viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
      return `<div class="tn-product-card" data-product-id="${escapeHtml(p.id)}">
        <div class="tn-img-container" style="background:#FFFFFF;display:flex;align-items:center;justify-content:center;padding:12px;">
          <img class="tn-product-img" src="${escapeHtml(p.image || 'images/placeholder-product.svg')}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.onerror=null; this.src='images/placeholder-product.svg';" style="max-height:180px;object-fit:contain;">
          ${badgeHtml}
          <button class="tn-product-wishlist-btn ${isWishlisted ? 'is-wishlisted' : ''}" data-product-id="${escapeHtml(p.id)}" aria-label="${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}" style="color:${isWishlisted ? 'var(--color-error)' : '#555555'}">${wishSvg}</button>
        </div>
        <div class="tn-product-body" style="padding:16px;">
          <span class="tn-product-category" style="color:#555555;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">${escapeHtml(p.category)}</span>
          <a href="pages/product-details.html?id=${encodeURIComponent(p.id)}" style="text-decoration:none;color:inherit;"><div class="tn-product-name" style="font-weight:700;margin:6px 0 10px;font-size:1rem;color:#000000;">${escapeHtml(p.name)}</div></a>
          <div class="tn-product-supplier" style="color:#555555;font-size:0.82rem;display:flex;align-items:center;gap:6px;margin-bottom:12px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            ${escapeHtml(p.supplierName || "TradeNest Verified Supplier")}
          </div>
          <div class="tn-product-pricing" style="display:flex;justify-content:space-between;align-items:baseline;padding-top:10px;border-top:1px solid #E5E1D6;">
            <span class="tn-product-price" style="font-size:1.15rem;font-weight:800;color:#000000;">${formatCurrency(p.price)}</span>
            <span class="tn-product-moq" style="font-size:0.75rem;color:#555555;font-weight:600;">MOQ: ${escapeHtml(String(p.moq))} ${escapeHtml(p.unit || "units")}</span>
          </div>
        </div>
        <div class="tn-product-actions" style="padding:0 16px 16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <button class="btn btn-secondary btn-sm tn-request-quote-btn" data-product-id="${escapeHtml(p.id)}" data-product-name="${escapeHtml(p.name)}" style="background:#F7F5EF;border:1px solid #E5E1D6;color:#000000;font-weight:600;border-radius:8px;">Request Quote</button>
          <button class="btn btn-primary btn-sm tn-buy-now-btn" data-product-id="${escapeHtml(p.id)}" data-product-name="${escapeHtml(p.name)}" data-moq="${escapeHtml(String(p.moq || 1))}" style="background:#000000;color:#FFFFFF;font-weight:700;border-radius:8px;">Buy Now</button>
        </div>
      </div>`;
    }).join("");

    // Event delegation for wishlist, quote & buy now
    container.addEventListener("click", e => {
      const wishBtn = e.target.closest(".tn-product-wishlist-btn");
      if (wishBtn) {
        const pid = wishBtn.getAttribute("data-product-id");
        const card = wishBtn.closest(".tn-product-card");
        const name = card ? card.querySelector(".tn-product-name")?.textContent : pid;
        toggleWishlist(pid, name || pid);
        return;
      }

      const quoteBtn = e.target.closest(".tn-request-quote-btn");
      if (quoteBtn) {
        const pid = quoteBtn.getAttribute("data-product-id");
        const user = safeGet(CURRENT_USER_KEY, null);
        if (user && user.role === "buyer") {
          window.location.href = "pages/buyer/rfqs.html?action=create&productId=" + encodeURIComponent(pid);
        } else {
          window.location.href = "auth/login.html?redirect=rfq&productId=" + encodeURIComponent(pid);
        }
        return;
      }

      const buyBtn = e.target.closest(".tn-buy-now-btn");
      if (buyBtn) {
        const pid = buyBtn.getAttribute("data-product-id");
        const moq = buyBtn.getAttribute("data-moq") || "1";
        const user = safeGet(CURRENT_USER_KEY, null);
        if (user && user.role === "buyer") {
          window.location.href = "pages/buyer/checkout.html?productId=" + encodeURIComponent(pid) + "&quantity=" + encodeURIComponent(moq);
        } else {
          window.location.href = "auth/login.html?redirect=checkout&productId=" + encodeURIComponent(pid) + "&quantity=" + encodeURIComponent(moq);
        }
      }
    });
  }

  // =====================================================
  // RECENTLY VIEWED PRODUCTS (EXTRA FEATURE 3)
  // =====================================================

  function renderRecentlyViewed() {
    const section = document.getElementById("recentlyViewedSection");
    const container = document.getElementById("recentlyViewedGrid");
    if (!section || !container) return;

    if (!window.TradeNestStore || typeof window.TradeNestStore.getRecentlyViewed !== "function") {
      section.style.display = "none";
      return;
    }

    const products = window.TradeNestStore.getRecentlyViewed(8);
    if (!products || products.length === 0) {
      section.style.display = "none";
      return;
    }

    section.style.display = "block";
    const wishlist = getWishlist();

    container.innerHTML = products.map(p => {
      const isWishlisted = wishlist.includes(p.id);
      const availClass = p.availability === "In Stock" ? "status-active" : p.availability === "Low Stock" ? "status-low-stock" : "status-cancelled";
      const wishSvg = `<svg viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
      return `<div class="tn-product-card" data-product-id="${escapeHtml(p.id)}">
        <div class="tn-img-container">
          <img class="tn-product-img" src="${escapeHtml(p.image || 'images/placeholder-product.svg')}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.onerror=null; this.src='images/placeholder-product.svg';">
          <span class="tn-product-badge badge ${availClass}">${escapeHtml(p.availability || "In Stock")}</span>
          <button class="tn-product-wishlist-btn ${isWishlisted ? 'is-wishlisted' : ''}" data-product-id="${escapeHtml(p.id)}" aria-label="${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}" style="color:${isWishlisted ? 'var(--color-error)' : 'var(--color-muted)'}">${wishSvg}</button>
        </div>
        <div class="tn-product-body">
          <span class="tn-product-category">${escapeHtml(p.category)}</span>
          <div class="tn-product-name">${escapeHtml(p.name)}</div>
          <div class="tn-product-supplier">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            ${escapeHtml(p.supplierName || "TradeNest Supplier")}
          </div>
          <div class="tn-product-pricing">
            <span class="tn-product-price">${formatCurrency(p.price)}</span>
            <span class="tn-product-moq">MOQ: ${escapeHtml(String(p.moq))} ${escapeHtml(p.unit || "units")}</span>
          </div>
        </div>
        <div class="tn-product-actions">
          <a href="pages/product-details.html?id=${encodeURIComponent(p.id)}" class="btn btn-primary btn-sm">View Details</a>
          <button class="btn btn-secondary btn-sm tn-add-to-cart" data-product-id="${escapeHtml(p.id)}" data-product-name="${escapeHtml(p.name)}">Add to Cart</button>
        </div>
      </div>`;
    }).join("");
  }

  // =====================================================
  // HOW IT WORKS
  // =====================================================

  function renderHowItWorks() {
    const container = document.getElementById("stepsGrid");
    if (!container) return;
    container.innerHTML = HOW_IT_WORKS_STEPS.map(s =>
      `<div class="tn-step">
        <div class="tn-step-number">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${s.svgPath}</svg>
        </div>
        <h3 class="tn-step-title">${escapeHtml(s.title)}</h3>
        <p class="tn-step-desc">${escapeHtml(s.desc)}</p>
      </div>`
    ).join("");
  }

  // =====================================================
  // VERIFIED SUPPLIERS
  // =====================================================

  function renderSuppliers() {
    const container = document.getElementById("supplierGrid");
    if (!container) return;

    const store = window.TradeNestStore ? window.TradeNestStore.getStore() : null;
    const suppliers = store ? store.supplierProfiles.filter(s => s.verificationStatus === "Verified").slice(0, 6) : [];

    if (!suppliers.length) {
      container.innerHTML = `<div class="empty-state"><p class="empty-state-title">Loading suppliers…</p></div>`;
      return;
    }

    container.innerHTML = suppliers.map(s => {
      const trustScore = s.trustScore || 85;
      const productCount = (s.products || []).length;
      return `<a class="tn-supplier-card" href="pages/supplier-details.html?id=${encodeURIComponent(s.id)}" aria-label="View ${s.businessName}">
        <div class="tn-supplier-card-header">
          <div class="tn-supplier-logo">${escapeHtml(s.logo || s.businessName?.charAt(0) || "S")}</div>
          <div>
            <div class="tn-supplier-name">${escapeHtml(s.businessName)}</div>
            <div class="tn-supplier-category">${escapeHtml(s.category)}</div>
          </div>
        </div>
        <div class="tn-supplier-desc">${escapeHtml(s.description || "Verified supplier on TradeNest.")}</div>
        <div class="tn-supplier-meta">
          <span class="tn-supplier-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${escapeHtml(s.location || "India")}
          </span>
          <span class="tn-supplier-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            ${productCount} product${productCount !== 1 ? "s" : ""}
          </span>
          ${s.verificationStatus === "Verified" ? `<span class="tn-badge-verified"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Verified</span>` : ""}
        </div>
        <div class="tn-supplier-trust">
          <div class="tn-trust-bar"><div class="tn-trust-fill" style="width:${trustScore}%"></div></div>
          <span class="tn-trust-score">Trust: ${trustScore}</span>
        </div>
      </a>`;
    }).join("");
  }

  // =====================================================
  // BENEFITS
  // =====================================================

  function renderBenefits() {
    const container = document.getElementById("benefitsGrid");
    if (!container) return;
    container.innerHTML = BENEFITS.map(b =>
      `<div class="tn-benefit-card">
        <div class="tn-benefit-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${b.svgPath}</svg>
        </div>
        <h3 class="tn-benefit-title">${escapeHtml(b.title)}</h3>
        <p class="tn-benefit-desc">${escapeHtml(b.desc)}</p>
      </div>`
    ).join("");
  }

  // =====================================================
  // PROMO BANNERS
  // =====================================================

  function renderPromoBanners() {
    const container = document.getElementById("promoGrid");
    if (!container) return;
    container.innerHTML = PROMO_BANNERS.map(p =>
      `<a class="tn-promo-card ${p.style}" href="${escapeHtml(p.href)}">
        <span class="tn-promo-eyebrow">${escapeHtml(p.eyebrow)}</span>
        <h3 class="tn-promo-title">${escapeHtml(p.title)}</h3>
        <p class="tn-promo-desc">${escapeHtml(p.desc)}</p>
        <span class="tn-promo-cta">${escapeHtml(p.cta)}</span>
      </a>`
    ).join("");
  }

  // =====================================================
  // PORTAL FEATURE LISTS
  // =====================================================

  function renderPortalFeatures() {
    const buyerList = document.getElementById("buyerFeatureList");
    const supplierList = document.getElementById("supplierFeatureList");

    if (buyerList) {
      buyerList.innerHTML = BUYER_FEATURES.map(f =>
        `<li class="tn-portal-feature">
          <span class="tn-portal-feature-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span>${escapeHtml(f)}</span>
        </li>`
      ).join("");
    }

    if (supplierList) {
      supplierList.innerHTML = SUPPLIER_FEATURES.map(f =>
        `<li class="tn-portal-feature">
          <span class="tn-portal-feature-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span>${escapeHtml(f)}</span>
        </li>`
      ).join("");
    }
  }

  // =====================================================
  // LOGGED-IN USER PROFILE CARD
  // =====================================================

  function initUserProfileCard() {
    const userRaw = localStorage.getItem(CURRENT_USER_KEY);
    if (!userRaw) return;

    let user;
    try {
      user = JSON.parse(userRaw);
    } catch (e) {
      return;
    }

    if (!user || typeof user !== "object") return;

    const section = document.getElementById("homeUserProfileSection");
    if (section) section.style.display = "block";

    const role = (user.role || "buyer").toLowerCase();
    const displayName = user.fullName || user.businessName || "TradeNest User";
    const initials = displayName.split(" ").map(w => w.charAt(0)).join("").substring(0, 2).toUpperCase();

    const avatarEl = document.getElementById("profileAvatarInitials");
    if (avatarEl) avatarEl.textContent = initials;

    const roleBadge = document.getElementById("profileRoleBadge");
    if (roleBadge) {
      roleBadge.textContent = role.charAt(0).toUpperCase() + role.slice(1);
      roleBadge.className = `tn-badge-role role-${role}`;
    }

    const fullNameEl = document.getElementById("profileFullName");
    if (fullNameEl) fullNameEl.textContent = displayName;

    const businessEl = document.getElementById("profileBusinessName");
    if (businessEl) {
      const svgIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
      businessEl.innerHTML = `${svgIcon} ${escapeHtml(user.businessName || "TradeNest Enterprise")}`;
    }

    const emailEl = document.getElementById("profileEmail");
    if (emailEl) emailEl.textContent = user.email || "user@tradenest.com";

    const phoneEl = document.getElementById("profilePhone");
    if (phoneEl) phoneEl.textContent = user.phone || "+91 98765 43210";

    const roleTextEl = document.getElementById("profileRoleText");
    if (roleTextEl) roleTextEl.textContent = role.charAt(0).toUpperCase() + role.slice(1);

    // Dashboard button
    const dashBtn = document.getElementById("profileDashboardBtn");
    const dashBtnText = document.getElementById("profileDashboardBtnText");
    if (dashBtn && dashBtnText) {
      if (role === "supplier") {
        dashBtn.href = "supplier-dashboard.html";
        dashBtnText.textContent = "My Supplier Dashboard";
      } else if (role === "admin") {
        dashBtn.href = "pages/admin/dashboard.html";
        dashBtnText.textContent = "Admin Dashboard";
      } else {
        dashBtn.href = "buyer-dashboard.html";
        dashBtnText.textContent = "My Buyer Dashboard";
      }
    }

    // Profile modal
    const profileModalContent = document.getElementById("profileModalContent");
    if (profileModalContent) {
      profileModalContent.innerHTML = [
        { label: "Full Name", value: displayName },
        { label: "Email", value: user.email },
        { label: "Phone", value: user.phone },
        { label: "Business", value: user.businessName },
        { label: "Role", value: role.charAt(0).toUpperCase() + role.slice(1) },
        { label: "Location", value: [user.city, user.state, user.country].filter(Boolean).join(", ") || "—" }
      ].map(f => `<div class="modal-field">
        <span class="field-label">${escapeHtml(f.label)}</span>
        <p class="field-value">${escapeHtml(f.value || "—")}</p>
      </div>`).join("");
    }

    // Logout button
    const logoutBtn = document.getElementById("profileLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem(CURRENT_USER_KEY);
        window.location.reload();
      });
    }

    // View profile modal
    const viewBtn = document.getElementById("profileViewBtn");
    const profileModal = document.getElementById("viewProfileModal");
    const closeModal = document.getElementById("closeViewProfileModal");
    const closeModalFooter = document.getElementById("closeViewProfileModalFooter");

    if (viewBtn && profileModal) {
      viewBtn.addEventListener("click", () => {
        profileModal.style.display = "flex";
      });
    }

    const closeModalFn = () => { if (profileModal) profileModal.style.display = "none"; };
    if (closeModal) closeModal.addEventListener("click", closeModalFn);
    if (closeModalFooter) closeModalFooter.addEventListener("click", closeModalFn);
    if (profileModal) {
      profileModal.addEventListener("click", e => {
        if (e.target === profileModal) closeModalFn();
      });
    }

    // Edit profile (placeholder)
    const editBtn = document.getElementById("profileEditBtn");
    if (editBtn) {
      const dashHref = dashBtn ? dashBtn.href : "buyer-dashboard.html";
      editBtn.addEventListener("click", () => {
        window.location.href = dashHref;
      });
    }
  }

  // =====================================================
  // KEYBOARD ESCAPE FOR MODALS
  // =====================================================

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      const modal = document.getElementById("viewProfileModal");
      if (modal && modal.style.display !== "none") {
        modal.style.display = "none";
      }
    }
  });

  // =====================================================
  // INITIALIZE ALL SECTIONS
  // =====================================================

  function init() {
    initHeroSlider();
    renderHeroStats();
    renderCategories();
    renderFeaturedProducts();
    renderRecentlyViewed();
    renderHowItWorks();
    renderSuppliers();
    renderBenefits();
    renderPromoBanners();
    renderPortalFeatures();
    initUserProfileCard();
    updateWishlistButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Listen for recently viewed updates
  window.addEventListener("tradenest:recently-viewed-updated", renderRecentlyViewed);

  // Sync across tabs
  window.addEventListener("storage", e => {
    if (e.key === CURRENT_USER_KEY) {
      initUserProfileCard();
    }
    if (e.key === WISHLIST_KEY) {
      updateWishlistButtons();
    }
    if (e.key === "tradenest_recently_viewed") {
      renderRecentlyViewed();
    }
  });

})();
