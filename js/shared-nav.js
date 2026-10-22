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

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function highlightMatch(text, query) {
    if (!text || !query) return escapeHtml(text || "");
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return escapedText.replace(regex, `<mark class="tn-search-highlight">$1</mark>`);
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

    let dashboardUrl = `${relativeRoot}buyer-dashboard.html`;
    let dashboardShort = "My Dashboard";
    if (userRole === "supplier") {
      dashboardUrl = `${relativeRoot}supplier-dashboard.html`;
      dashboardShort = "My Dashboard";
    } else if (userRole === "admin") {
      dashboardUrl = `${relativeRoot}pages/admin/dashboard.html`;
      dashboardShort = "Admin Dashboard";
    }

    const activePage = currentFile === "product-details.html" ? "products.html"
      : currentFile === "supplier-details.html" ? "suppliers.html"
      : currentFile;

    const baseNavLinks = [
      { label: "Home", href: `${relativeRoot}index.html`, file: "index.html" },
      { label: "About", href: resolvePath("pages/about.html"), file: "about.html" },
      { label: "Products", href: resolvePath("pages/products.html"), file: "products.html" },
      { label: "Suppliers", href: resolvePath("pages/suppliers.html"), file: "suppliers.html" },
      { label: "Contact", href: resolvePath("pages/contact.html"), file: "contact.html" }
    ];

    let existingHeader = document.querySelector(".tn-site-header");
    const header = existingHeader || document.createElement("header");
    header.className = "tn-site-header main-header";
    header.id = "mainSiteHeader";

    let navListHtml = baseNavLinks.map((item) => {
      const isCurrent = (item.file === activePage && activePage !== "index.html");
      return `<li><a class="tn-nav-link${isCurrent ? " is-active" : ""}" href="${item.href}"${isCurrent ? ' aria-current="page"' : ""}>${item.label}</a></li>`;
    }).join("");

    // Global Search Component HTML
    const searchHtml = `
      <div class="tn-nav-search" id="tnNavSearch" role="search">
        <svg class="tn-nav-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" class="tn-nav-search-input" id="tnGlobalSearchInput" placeholder="Search products, suppliers..." aria-label="Global marketplace search" autocomplete="off" />
        <button type="button" class="tn-nav-search-clear" id="tnGlobalSearchClear" aria-label="Clear search">&times;</button>
        <button type="button" class="tn-nav-search-btn" id="tnGlobalSearchSubmit" aria-label="Search">Search</button>
        <div class="tn-search-dropdown" id="tnSearchDropdown" role="listbox" aria-label="Search suggestions"></div>
      </div>
    `;

    // Notification Center Component HTML (for logged-in users)
    let notifHtml = "";
    if (isLoggedIn && window.TradeNestStore && typeof window.TradeNestStore.getUnreadNotificationCount === "function") {
      const unreadCount = window.TradeNestStore.getUnreadNotificationCount(user.id, user.role);
      notifHtml = `
        <div class="tn-notif-wrapper" id="tnNotifWrapper">
          <button type="button" class="tn-notif-btn" id="tnNotifBtn" aria-label="Notifications" aria-haspopup="true" aria-expanded="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span class="tn-notif-badge${unreadCount > 0 ? "" : " is-hidden"}" id="tnNotifBadge">${unreadCount}</span>
          </button>
          <div class="tn-notif-dropdown" id="tnNotifDropdown" role="region" aria-label="Notification center">
            <div class="tn-notif-header">
              <span class="tn-notif-title">Notifications</span>
              <button type="button" class="tn-notif-mark-read" id="tnNotifMarkAllRead">Mark all read</button>
            </div>
            <ul class="tn-notif-list" id="tnNotifList"></ul>
          </div>
        </div>
      `;
    }

    let actionsHtml = "";
    if (isLoggedIn) {
      const displayName = user.fullName || user.businessName || (user.email ? user.email.split("@")[0] : "User");
      actionsHtml = `
        <div class="tn-nav-actions tn-nav-logged-in" id="navLoggedInActions">
          ${notifHtml}
          <button type="button" class="tn-nav-profile-btn" id="navProfileBtn" aria-label="View Profile" title="View Profile (${escapeHtml(displayName)})">
            <svg class="tn-nav-profile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          <a class="tn-nav-dash-pill tn-nav-dashboard-link" id="navDashboardLink" data-id="navDashPillBtn" href="${dashboardUrl}">${dashboardShort}</a>
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
          ${searchHtml}
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

    // Attach search handlers
    attachSearchListeners(header, relativeRoot, resolvePath);

    // Attach notification handlers
    if (isLoggedIn) {
      attachNotificationListeners(header, user, relativeRoot, resolvePath);
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
    const profileBtn = header.querySelector("#navProfileBtn");
    const profileLink = header.querySelector("#navProfileLink");
    const handleProfileClick = (e) => {
      e.preventDefault();
      openUserProfileModal(user, dashboardUrl);
    };
    if (profileBtn) profileBtn.addEventListener("click", handleProfileClick);
    if (profileLink) profileLink.addEventListener("click", handleProfileClick);
  }

  function openUserProfileModal(user, dashboardUrl) {
    if (!user) return;
    let modal = document.getElementById("viewProfileModal") || document.getElementById("userProfileModal");

    if (!modal) {
      let existingSharedModal = document.getElementById("sharedViewProfileModal");
      if (!existingSharedModal) {
        existingSharedModal = document.createElement("div");
        existingSharedModal.className = "tn-modal-backdrop";
        existingSharedModal.id = "sharedViewProfileModal";
        existingSharedModal.setAttribute("role", "dialog");
        existingSharedModal.setAttribute("aria-modal", "true");
        existingSharedModal.setAttribute("aria-labelledby", "sharedProfileModalTitle");
        existingSharedModal.innerHTML = `
          <div class="tn-modal-card">
            <div class="tn-modal-header">
              <h2 class="tn-modal-title" id="sharedProfileModalTitle">My Profile</h2>
              <button type="button" class="tn-modal-close" id="closeSharedProfileModal" aria-label="Close profile">&times;</button>
            </div>
            <div class="tn-modal-body">
              <div class="profile-modal-grid" id="sharedProfileModalContent"></div>
            </div>
            <div class="tn-modal-footer">
              <a href="${dashboardUrl || '#'}" class="btn btn-primary" id="sharedProfileDashBtn" style="margin-right:auto;">Go to Dashboard</a>
              <button type="button" class="btn btn-secondary" id="closeSharedProfileModalFooter">Close</button>
            </div>
          </div>
        `;
        document.body.appendChild(existingSharedModal);

        const closeFn = () => { existingSharedModal.style.display = "none"; };
        existingSharedModal.querySelector("#closeSharedProfileModal")?.addEventListener("click", closeFn);
        existingSharedModal.querySelector("#closeSharedProfileModalFooter")?.addEventListener("click", closeFn);
        existingSharedModal.addEventListener("click", (e) => {
          if (e.target === existingSharedModal) closeFn();
        });
      }
      modal = existingSharedModal;
    }

    const contentContainer = modal.querySelector("#profileModalContent") || modal.querySelector("#sharedProfileModalContent");
    if (contentContainer) {
      const displayName = user.fullName || user.businessName || (user.email ? user.email.split("@")[0] : "User");
      const role = (user.role || "buyer");
      const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
      const loc = [user.city, user.state, user.country].filter(Boolean).join(", ") || "—";
      contentContainer.innerHTML = [
        { label: "Full Name", value: displayName },
        { label: "Email", value: user.email },
        { label: "Phone", value: user.phone || "—" },
        { label: "Business", value: user.businessName || "—" },
        { label: "Role", value: formattedRole },
        { label: "Location", value: loc }
      ].map(f => `<div class="modal-field">
        <span class="field-label">${escapeHtml(f.label)}</span>
        <p class="field-value">${escapeHtml(f.value || "—")}</p>
      </div>`).join("");
    }

    modal.style.display = "flex";
  }

  function attachSearchListeners(header, relativeRoot, resolvePath) {
    const searchWrapper = header.querySelector("#tnNavSearch");
    const searchInput = header.querySelector("#tnGlobalSearchInput");
    const searchClear = header.querySelector("#tnGlobalSearchClear");
    const dropdown = header.querySelector("#tnSearchDropdown");
    if (!searchInput || !dropdown) return;

    function doSearch() {
      const query = searchInput.value.trim();
      if (!query) {
        searchWrapper.classList.remove("has-val");
        dropdown.classList.remove("is-open");
        dropdown.innerHTML = "";
        return;
      }
      searchWrapper.classList.add("has-val");

      if (!window.TradeNestStore || typeof window.TradeNestStore.searchCatalog !== "function") {
        return;
      }

      const results = window.TradeNestStore.searchCatalog(query);
      let html = "";

      if (results.products.length > 0) {
        html += `<div class="tn-search-group-title">Products (${results.products.length})</div>`;
        results.products.forEach(p => {
          const detailUrl = `${resolvePath("pages/product-details.html")}?id=${encodeURIComponent(p.id)}`;
          const imgUrl = p.image || p.imageUrl || `${relativeRoot}images/placeholder-product.svg`;
          html += `
            <a class="tn-search-item" href="${detailUrl}">
              <img class="tn-search-item-thumb" src="${imgUrl}" alt="${escapeHtml(p.name)}" onerror="this.src='${relativeRoot}images/placeholder-product.svg'" />
              <div class="tn-search-item-info">
                <div class="tn-search-item-name">${highlightMatch(p.name, query)}</div>
                <div class="tn-search-item-meta">${escapeHtml(p.category || "")} &bull; ₹${(p.price || 0).toLocaleString("en-IN")}</div>
              </div>
            </a>
          `;
        });
      }

      if (results.suppliers.length > 0) {
        html += `<div class="tn-search-group-title">Suppliers (${results.suppliers.length})</div>`;
        results.suppliers.forEach(s => {
          const supUrl = `${resolvePath("pages/supplier-details.html")}?id=${encodeURIComponent(s.id)}`;
          html += `
            <a class="tn-search-item" href="${supUrl}">
              <div class="tn-search-item-thumb" style="display:flex;align-items:center;justify-content:center;background:var(--color-soft-sky);color:var(--color-steel-blue);font-weight:700;">
                ${escapeHtml((s.businessName || "S")[0])}
              </div>
              <div class="tn-search-item-info">
                <div class="tn-search-item-name">${highlightMatch(s.businessName, query)}</div>
                <div class="tn-search-item-meta">${escapeHtml(s.category || "")} &bull; ${escapeHtml(s.location || "")}</div>
              </div>
            </a>
          `;
        });
      }

      if (results.products.length === 0 && results.suppliers.length === 0) {
        html = `
          <div style="padding: 16px 20px; font-size: 0.85rem; color: var(--color-text-secondary); text-align: center;">
            No products or suppliers found for "<strong>${escapeHtml(query)}</strong>"
          </div>
        `;
      }

      dropdown.innerHTML = html;
      dropdown.classList.add("is-open");
    }

    searchInput.addEventListener("input", doSearch);
    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim()) doSearch();
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        dropdown.classList.remove("is-open");
      } else if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `${resolvePath("pages/products.html")}?q=${encodeURIComponent(query)}`;
        }
      }
    });

    if (searchClear) {
      searchClear.addEventListener("click", () => {
        searchInput.value = "";
        searchWrapper.classList.remove("has-val");
        dropdown.classList.remove("is-open");
        searchInput.focus();
      });
    }

    const searchSubmit = header.querySelector("#tnGlobalSearchSubmit");
    if (searchSubmit) {
      searchSubmit.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `${resolvePath("pages/products.html")}?q=${encodeURIComponent(query)}`;
        } else {
          searchInput.focus();
        }
      });
    }

    document.addEventListener("click", (e) => {
      if (!searchWrapper.contains(e.target)) {
        dropdown.classList.remove("is-open");
      }
    });
  }

  function attachNotificationListeners(header, user, relativeRoot, resolvePath) {
    const btn = header.querySelector("#tnNotifBtn");
    const dropdown = header.querySelector("#tnNotifDropdown");
    const badge = header.querySelector("#tnNotifBadge");
    const list = header.querySelector("#tnNotifList");
    const markAllBtn = header.querySelector("#tnNotifMarkAllRead");
    if (!btn || !dropdown || !list) return;

    function renderNotificationItems() {
      if (!window.TradeNestStore || typeof window.TradeNestStore.getNotifications !== "function") return;
      const notifs = window.TradeNestStore.getNotifications(user.id, user.role);
      const unreadCount = notifs.filter(n => !n.read).length;

      if (badge) {
        badge.textContent = unreadCount;
        badge.classList.toggle("is-hidden", unreadCount === 0);
      }

      if (notifs.length === 0) {
        list.innerHTML = `
          <li style="padding: 24px; text-align: center; color: var(--color-text-secondary); font-size: 0.85rem;">
            No notifications yet.
          </li>
        `;
        return;
      }

      list.innerHTML = notifs.map(n => {
        const timeAgo = formatTimeAgo(n.timestamp);
        const resolvedLink = n.link ? resolvePath(n.link) : "javascript:void(0)";
        return `
          <li>
            <a class="tn-notif-item${n.read ? "" : " is-unread"}" href="${resolvedLink}" data-notif-id="${n.id}">
              <div class="tn-notif-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div class="tn-notif-item-body">
                <div class="tn-notif-item-title">${escapeHtml(n.title)}</div>
                <div class="tn-notif-item-msg">${escapeHtml(n.message)}</div>
                <div class="tn-notif-item-time">${timeAgo}</div>
              </div>
            </a>
          </li>
        `;
      }).join("");

      list.querySelectorAll(".tn-notif-item").forEach(item => {
        item.addEventListener("click", () => {
          const id = item.getAttribute("data-notif-id");
          if (id && window.TradeNestStore.markNotificationAsRead) {
            window.TradeNestStore.markNotificationAsRead(id);
          }
        });
      });
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        renderNotificationItems();
      }
    });

    if (markAllBtn) {
      markAllBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.TradeNestStore && window.TradeNestStore.markAllNotificationsAsRead) {
          window.TradeNestStore.markAllNotificationsAsRead(user.id, user.role);
          renderNotificationItems();
        }
      });
    }

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });

    // Listen for notification events
    window.addEventListener("tradenest:notification-added", renderNotificationItems);
    window.addEventListener("tradenest:notification-updated", renderNotificationItems);
  }

  function formatTimeAgo(isoString) {
    if (!isoString) return "just now";
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  // Global toast notification helper
  window.showTradeNestToast = function(message, type = "info", duration = 3500) {
    let container = document.querySelector(".tn-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "tn-toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `tn-toast tn-toast-${type}`;
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("is-leaving");
      setTimeout(() => toast.remove(), 250);
    }, duration);
  };

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
