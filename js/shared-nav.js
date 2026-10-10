(() => {
  function getRelativeRoot() {
    const path = window.location.pathname.replace(/\\/g, "/");
    if (/\/(?:pages\/(?:buyer|supplier|admin))\//.test(path)) {
      return "../../";
    }
    if (/\/(?:pages|auth)\//.test(path)) {
      return "../";
    }
    return "./";
  }

  function getLoggedInUser() {
    try {
      const raw = localStorage.getItem("tradenestCurrentUser");
      if (!raw) return null;
      const user = JSON.parse(raw);
      if (user && typeof user === "object" && (user.email || user.fullName || user.role)) {
        return user;
      }
    } catch (e) {
      console.warn("Error parsing tradenestCurrentUser:", e);
    }
    return null;
  }

  function renderNav() {
    const currentPath = window.location.pathname.replace(/\\/g, "/");
    const relativeRoot = getRelativeRoot();
    const inPagesDirectory = /\/pages\/[^/]+\.html$/.test(currentPath);
    
    const resolvePath = (path) => {
      if (inPagesDirectory && path.startsWith("pages/")) {
        return path.slice("pages/".length);
      }
      return `${relativeRoot}${path}`;
    };

    const currentFile = currentPath.split("/").pop() || "index.html";
    const user = getLoggedInUser();
    const isLoggedIn = !!user;
    const userRole = (user && user.role ? String(user.role).toLowerCase() : "buyer");

    // Resolve dashboard URL and label based on role
    let dashboardUrl = `${relativeRoot}buyer-dashboard.html`;
    let dashboardLabel = "My Buyer Dashboard";
    let dashboardShort = "My Dashboard";
    if (userRole === "supplier") {
      dashboardUrl = `${relativeRoot}supplier-dashboard.html`;
      dashboardLabel = "My Supplier Dashboard";
      dashboardShort = "My Dashboard";
    } else if (userRole === "admin") {
      dashboardUrl = `${relativeRoot}pages/admin/dashboard.html`;
      dashboardLabel = "Admin Governance";
      dashboardShort = "Admin Dashboard";
    }

    const activePage = currentFile === "product-details.html" ? "products.html"
      : currentFile === "supplier-details.html" ? "suppliers.html"
      : currentFile;

    // Navigation links
    const baseNavLinks = [
      { label: "Home", href: `${relativeRoot}index.html`, file: "index.html" },
      { label: "About", href: resolvePath("pages/about.html"), file: "about.html" },
      { label: "Products", href: resolvePath("pages/products.html"), file: "products.html" },
      { label: "Suppliers", href: resolvePath("pages/suppliers.html"), file: "suppliers.html" },
      { label: "Contact", href: resolvePath("pages/contact.html"), file: "contact.html" }
    ];

    let existingHeader = document.querySelector(".tn-site-header");
    const header = existingHeader || document.createElement("header");
    header.className = "tn-site-header";
    header.id = "mainSiteHeader";

    let navListHtml = baseNavLinks.map((item) => {
      const isCurrent = (item.file === activePage && activePage !== "index.html");
      return `<li><a class="tn-nav-link${isCurrent ? " is-active" : ""}" href="${item.href}"${isCurrent ? ' aria-current="page"' : ""}>${item.label}</a></li>`;
    }).join("");

    if (isLoggedIn) {
      navListHtml += `
        <li><a class="tn-nav-link tn-nav-dashboard-link" id="navDashboardLink" href="${dashboardUrl}">${dashboardLabel}</a></li>
        <li><a class="tn-nav-link tn-nav-profile-link" id="navProfileLink" href="${relativeRoot}index.html#user-profile">Profile</a></li>
      `;
    }

    let actionsHtml = "";
    if (isLoggedIn) {
      const displayName = user.fullName || user.businessName || (user.email ? user.email.split("@")[0] : "User");
      actionsHtml = `
        <div class="tn-nav-actions tn-nav-logged-in" id="navLoggedInActions">
          <span class="tn-nav-user-greeting">Hi, <strong>${displayName}</strong></span>
          <a class="tn-nav-dash-pill" id="navDashPillBtn" href="${dashboardUrl}">${dashboardShort}</a>
          <button type="button" class="tn-nav-logout-btn btn btn-outline" id="navLogoutBtn" aria-label="Log out of TradeNest">Logout</button>
        </div>
      `;
    } else {
      actionsHtml = `
        <div class="tn-nav-actions tn-nav-logged-out" id="navLoggedOutActions">
          <a class="tn-nav-login" id="navLoginLink" href="${resolvePath("auth/login.html")}">Login</a>
          <a class="tn-nav-join" id="navRegisterLink" href="${resolvePath("auth/register.html")}">Register</a>
        </div>
      `;
    }

    header.innerHTML = `
      <div class="tn-header-inner">
        <div class="tn-header-left">
          <a class="tn-brand" href="${relativeRoot}index.html" aria-label="TradeNest home">
            <img src="${relativeRoot}images/TradeNest.webp" alt="TradeNest" width="168" height="48">
          </a>
        </div>
        <button class="tn-menu-toggle" id="tnMenuToggle" type="button" aria-expanded="false" aria-controls="tn-primary-navigation" aria-label="Open navigation">
          <span></span><span></span><span></span>
        </button>
        <nav class="tn-primary-navigation" id="tn-primary-navigation" aria-label="Main navigation">
          <ul class="tn-nav-list" id="tnPrimaryNavList">
            ${navListHtml}
          </ul>
          ${actionsHtml}
        </nav>
      </div>
    `;

    if (!existingHeader) {
      const oldHeader = document.querySelector("body > header.site-header, body > header.header");
      if (oldHeader) {
        oldHeader.replaceWith(header);
      } else {
        document.body.prepend(header);
      }
    }

    // Attach menu toggle listener
    const toggle = header.querySelector(".tn-menu-toggle");
    const navigation = header.querySelector(".tn-primary-navigation");
    if (toggle && navigation) {
      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        toggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
        navigation.classList.toggle("is-open", !isOpen);
      });
    }

    // Attach logout button listener
    const logoutBtn = header.querySelector("#navLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.logoutTradeNestUser();
      });
    }

    // Attach Profile click listener
    const profileLink = header.querySelector("#navProfileLink");
    if (profileLink) {
      profileLink.addEventListener("click", (e) => {
        const profileModal = document.getElementById("viewProfileModal") || document.getElementById("userProfileModal");
        if (profileModal) {
          e.preventDefault();
          profileModal.style.display = "flex";
        }
      });
    }
  }

  // Global logout handler
  window.logoutTradeNestUser = function () {
    try {
      localStorage.removeItem("tradenestCurrentUser");
    } catch (e) {
      console.warn("Error removing tradenestCurrentUser:", e);
    }
    const relativeRoot = getRelativeRoot();
    window.location.href = `${relativeRoot}index.html`;
  };

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderNav);
  } else {
    renderNav();
  }

  // Sync across tabs
  window.addEventListener("storage", (e) => {
    if (e.key === "tradenestCurrentUser") {
      renderNav();
    }
  });

  window.renderTradeNestNav = renderNav;
})();