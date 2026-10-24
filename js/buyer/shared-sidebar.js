(() => {
  const applyBuyerTheme = (theme) => {
    const isSystem = theme === "System default";
    const isDark = isSystem
      ? window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      : theme === "Dark";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  };
  window.TradeNestBuyerTheme = { apply: applyBuyerTheme };
  try {
    const settings = JSON.parse(localStorage.getItem("tradenestBuyerSettings") || "{}");
    applyBuyerTheme(settings.theme || "Light");
  } catch (error) {
    applyBuyerTheme("Light");
  }

  const systemThemeQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const syncSystemTheme = () => {
    try {
      const settings = JSON.parse(localStorage.getItem("tradenestBuyerSettings") || "{}");
      if (settings.theme === "System default") applyBuyerTheme("System default");
    } catch (error) {
      // Keep the currently applied theme when stored settings cannot be read.
    }
  };
  if (systemThemeQuery) {
    if (systemThemeQuery.addEventListener) systemThemeQuery.addEventListener("change", syncSystemTheme);
    else if (systemThemeQuery.addListener) systemThemeQuery.addListener(syncSystemTheme);
  }
  window.addEventListener("storage", (event) => {
    if (event.key !== "tradenestBuyerSettings") return;
    try {
      const settings = JSON.parse(event.newValue || "{}");
      applyBuyerTheme(settings.theme || "Light");
    } catch (error) {
      applyBuyerTheme("Light");
    }
  });

  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  const isRootDashboard = window.location.pathname.endsWith("/buyer-dashboard.html");
  const page = isRootDashboard
    ? "dashboard"
    : window.location.pathname.split("/").pop().replace(/\.html?$/i, "");
  const buyerPath = (file) => `${isRootDashboard ? "pages/buyer/" : ""}${file}`;
  const svg = (body) => `<svg class="tn-ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

  const icons = {
    dashboard: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    products: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    suppliers: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="22" x2="9" y2="22.01"/><line x1="15" y1="22" x2="15" y2="22.01"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/>',
    orders: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    quote: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    tag: '<path d="M20.59 13.41 13.4 20.6a2 2 0 0 1-2.82 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    compare: '<line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    saved: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/>',
    folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    profile: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    samples: '<path d="M10 2v7.31L3.29 20.7A2 2 0 0 0 5 22h14a2 2 0 0 0 1.71-1.3L14 9.31V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/>',
    team: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    messages: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    payments: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    delivery: '<rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    recommendations: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    reviews: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  };

  const groups = [
    { title: "Main Menu", links: [
      ["dashboard.html", "Dashboard", "dashboard", "dashboard"],
      ["products.html", "Products", "products", "products"],
      ["suppliers.html", "Suppliers", "suppliers", "suppliers"],
      ["orders.html", "My Orders", "orders", "orders"],
      ["purchase-history.html", "Purchase History", "document", "purchase-history"],
    ] },
    { title: "Quotes", links: [
      ["rfqs.html", "RFQs", "document", "rfqs"],
      ["quotations.html", "Quotations", "quote", "quotations"],
      ["compare-quotes.html", "Compare Quotes", "compare", "compare-quotes"],
    ] },
    { title: "Account", links: [
      ["saved-products.html", "Saved Products", "saved", "saved-products"],
      ["saved-suppliers.html", "Saved Suppliers", "folder", "saved-suppliers"],
      ["profile.html", "Profile", "profile", "profile"],
      ["settings.html", "Settings", "settings", "settings"],
    ] },
    { title: "Workspace", links: [
      ["samples.html", "Samples", "samples", "samples"],
      ["collaboration.html", "Collaboration", "team", "collaboration"],
      ["messages.html", "Messages", "messages", "messages"],
      ["payments.html", "Payments", "payments", "payments"],
      ["delivery.html", "Delivery", "delivery", "delivery"],
      ["reviews-feedback.html", "Reviews & Feedback", "reviews", "reviews-feedback"],
    ] },
  ];

  const linkMarkup = ([file, label, iconName, activePage]) => {
    const active = activePage === page;
    return `<li><a href="${buyerPath(file)}" class="nav-link${active ? " active" : ""}"${active ? ' aria-current="page"' : ""}><span class="nav-icon">${svg(icons[iconName])}</span><span class="nav-label">${label}</span></a></li>`;
  };

  const navMarkup = groups.map((group) =>
    `<div class="nav-section"><span class="nav-section-title">${group.title}</span><ul class="nav-list">${group.links.map(linkMarkup).join("")}</ul></div>`
  ).join("");

  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <a href="${buyerPath("dashboard.html")}" class="brand-logo" aria-label="Buyer dashboard home">
        <img src="${isRootDashboard ? "images/TradeNest.webp" : "../../images/TradeNest.webp"}" alt="TradeNest" class="dashboard-brand-image" />
      </a>
      <span class="brand-subtitle">Buyer Workspace</span>
    </div>
    <nav class="sidebar-nav" aria-label="Buyer navigation">${navMarkup}</nav>
    <div class="sidebar-footer">
      <a href="${isRootDashboard ? "index.html" : "../../index.html"}" class="nav-link"><span class="nav-icon">${svg(icons.home)}</span><span class="nav-label">Back to home page</span></a>
      <button type="button" class="logout-link-btn" id="sidebarLogoutButton"><span class="nav-icon">${svg(icons.logout)}</span><span class="nav-label">Logout</span></button>
    </div>`;

  sidebar.classList.add("buyer-sidebar");
  sidebar.querySelector("#sidebarLogoutButton")?.addEventListener("click", () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    try {
      localStorage.removeItem("tradenestCurrentUser");
      sessionStorage.clear();
    } catch (error) {
      console.error("Unable to clear the current session:", error);
    }
    window.location.href = isRootDashboard ? "auth/login.html" : "../../auth/login.html";
  });
})();
