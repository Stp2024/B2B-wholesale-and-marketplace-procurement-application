/**
 * TradeNest Admin Dashboard Controller
 * File: js/admin/dashboard.js
 * 
 * Implements complete interactive logic, SPA hash routing, reactive statistics,
 * data filtering, moderation workflows, SVG charts, and report exports for:
 * - Admin Overview
 * - Module 30: Buyer & Supplier Management
 * - Module 31: Business Verification
 * - Module 32: Product Monitoring
 * - Module 33: Risk & Activity Monitoring
 * - Module 34: Order & Transaction Monitoring
 * - Module 35: Complaints & Reports
 * - Module 36: Trust Score Monitoring
 * - Module 37: Reports & Analytics
 */

"use strict";

document.addEventListener("DOMContentLoaded", function () {
  let currentUser = null;
  try {
    const storedUser = localStorage.getItem("tradenestCurrentUser");
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error validating admin dashboard session:", error);
  }

  const currentRole = String(
    currentUser && (currentUser.role || currentUser.accountType) || ""
  ).trim().toLowerCase();
  if (!currentUser || currentRole !== "admin") {
    window.location.href = "../../auth/admin-login.html";
    return;
  }

  if (!window.AdminStore) {
    console.error("AdminStore is missing! Ensure admin-store.js is loaded first.");
    return;
  }

  const store = window.AdminStore;
  const logoutButton = document.getElementById("adminLogoutBtn");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      localStorage.removeItem("tradenestCurrentUser");
      window.location.href = "../../auth/admin-login.html";
    });
  }

  // DOM Elements
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("adminSidebar");
  const navLinks = document.querySelectorAll(".admin-sidebar .nav-item a[data-view]");
  const viewSections = document.querySelectorAll(".view-section");
  const currentViewTitle = document.getElementById("currentViewTitle");
  const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");

  // Topbar badges
  const topPendingVerifBadge = document.getElementById("topPendingVerifBadge");
  const topRiskBadge = document.getElementById("topRiskBadge");
  const navVerifBadge = document.getElementById("navVerifBadge");
  const navRiskBadge = document.getElementById("navRiskBadge");
  const navComplaintsBadge = document.getElementById("navComplaintsBadge");

  // Modal elements
  const adminModalOverlay = document.getElementById("adminModalOverlay");
  const adminModalTitle = document.getElementById("adminModalTitle");
  const adminModalBody = document.getElementById("adminModalBody");
  const adminModalFooter = document.getElementById("adminModalFooter");
  const adminModalCloseBtn = document.getElementById("adminModalCloseBtn");

  // State
  let currentActiveView = "overview";

  // ==========================================================================
  // 1. VIEW ROUTER (SPA HASH ROUTING)
  // ==========================================================================
  const viewTitles = {
    overview: "Dashboard Overview",
    users: "Buyer & Supplier Management",
    verification: "Business Verification",
    products: "Product Monitoring",
    risk: "Risk & Activity Monitoring",
    orders: "Order & Transaction Monitoring",
    complaints: "Complaints & Reports",
    trust: "Trust Score Monitoring",
    reports: "Reports & Analytics"
  };

  function switchView(viewName) {
    if (!viewTitles[viewName]) {
      viewName = "overview";
    }

    currentActiveView = viewName;
    window.location.hash = viewName;

    // Update active nav link
    navLinks.forEach((link) => {
      if (link.getAttribute("data-view") === viewName) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Update view panels
    viewSections.forEach((section) => {
      if (section.id === `view-${viewName}`) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });

    // Update header breadcrumb
    if (currentViewTitle) currentViewTitle.textContent = viewTitles[viewName];
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = viewTitles[viewName];

    // Close mobile sidebar if open
    if (sidebar && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
    }

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Render corresponding view data
    renderViewData(viewName);
  }

  function renderViewData(viewName) {
    switch (viewName) {
      case "overview":
        renderOverview();
        break;
      case "users":
        renderUsers();
        break;
      case "verification":
        renderVerification();
        break;
      case "products":
        renderProducts();
        break;
      case "risk":
        renderRisk();
        break;
      case "orders":
        renderOrders();
        break;
      case "complaints":
        renderComplaints();
        break;
      case "trust":
        renderTrustScores();
        break;
      case "reports":
        renderReports();
        break;
      default:
        renderOverview();
    }
    updateGlobalBadges();
  }

  // ==========================================================================
  // 2. TOAST UTILITY
  // ==========================================================================
  function showToast(message, type = "success") {
    let container = document.getElementById("adminToastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "adminToastContainer";
      container.className = "admin-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "admin-toast";
    const icon = type === "success" ? "✓" : type === "warning" ? "⚠️" : type === "danger" ? "✕" : "ℹ️";
    toast.innerHTML = `<span style="font-size: 1.1rem;">${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(40px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ==========================================================================
  // 3. MODAL UTILITY
  // ==========================================================================
  function openModal(title, bodyHtml, footerHtml = "", isLarge = false) {
    if (!adminModalOverlay) return;
    adminModalTitle.textContent = title;
    adminModalBody.innerHTML = bodyHtml;
    adminModalFooter.innerHTML = footerHtml;

    const container = adminModalOverlay.querySelector(".modal-container");
    if (container) {
      if (isLarge) {
        container.classList.add("modal-lg");
      } else {
        container.classList.remove("modal-lg");
      }
    }

    adminModalOverlay.classList.add("active");
  }

  function closeModal() {
    if (!adminModalOverlay) return;
    adminModalOverlay.classList.remove("active");
  }

  if (adminModalCloseBtn) adminModalCloseBtn.addEventListener("click", closeModal);
  if (adminModalOverlay) {
    adminModalOverlay.addEventListener("click", function (e) {
      if (e.target === adminModalOverlay) closeModal();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  // Administrator Profile Modal
  function openAdminProfileModal() {
    const adminUser = store.getAdminStore().adminUser || store.defaultAdmin;
    const bodyHtml = `
      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
        <div class="admin-avatar" style="width: 58px; height: 58px; font-size: 1.35rem; background: linear-gradient(135deg, #d87543, #f59e0b);">${adminUser.avatar}</div>
        <div>
          <h3 style="font-size: 1.25rem; color: #0f172a; margin: 0 0 4px 0;">${adminUser.fullName}</h3>
          <p style="color: #64748b; font-size: 0.88rem; margin: 0;">${adminUser.designation} • <span class="status-pill status-approved" style="font-size:0.7rem; padding: 2px 7px;">Clearance Level 4</span></p>
        </div>
      </div>

      <div class="verif-meta-list" style="margin-bottom: 20px;">
        <div><span class="meta-field-label">Official Email</span><div class="meta-field-val">${adminUser.email}</div></div>
        <div><span class="meta-field-label">Department</span><div class="meta-field-val">${adminUser.department || "Risk, Trust & Safety"}</div></div>
        <div><span class="meta-field-label">Platform Node ID</span><div class="meta-field-val">NODE-IN-BLR-01 (₹ Core)</div></div>
        <div><span class="meta-field-label">Session Encryption</span><div class="meta-field-val"><span style="color:#10b981; font-weight:700;">● Active Encrypted Session</span></div></div>
        <div><span class="meta-field-label">Governance Scope</span><div class="meta-field-val">Full Marketplace Arbitration & Catalog Moderation</div></div>
        <div><span class="meta-field-label">Active Time</span><div class="meta-field-val">Current Browser Session</div></div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
        <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Arbitration Capabilities</div>
        <p style="font-size: 0.84rem; color: #475569; margin: 0; line-height: 1.5;">This administrator profile holds live authority to arbitrate order escrow disbursements, delist non-compliant products, review corporate GST credentials, and suspend high-risk enterprise accounts.</p>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.closeAdminModal()">Close</button>
      <button class="btn btn-danger" onclick="localStorage.removeItem('tradenestCurrentUser'); window.location.href='../../auth/admin-login.html';">Logout Session</button>
    `;

    openModal("Administrator Security Clearance & Session", bodyHtml, footerHtml);
  }

  // Modal: Add Enterprise Account
  function openAddUserModal() {
    const bodyHtml = `
      <form id="adminAddUserForm" onsubmit="return false;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Full Name *</label>
            <input type="text" id="newUserName" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="e.g. Rahul Sharma" required />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Business / Entity Name *</label>
            <input type="text" id="newUserBiz" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="e.g. Apex Industrial Supplies Pvt Ltd" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Account Role *</label>
            <select id="newUserRole" class="select-filter" style="width:100%;">
              <option value="buyer">Procurement Buyer</option>
              <option value="supplier">Verified Supplier</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Official Email *</label>
            <input type="email" id="newUserEmail" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="e.g. rahul@apexsupplies.com" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Phone Number</label>
            <input type="text" id="newUserPhone" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="+91 98450 12345" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Industry Sector</label>
            <input type="text" id="newUserCategory" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="e.g. Industrial Equipment" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">City</label>
            <input type="text" id="newUserCity" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="Bengaluru" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">State</label>
            <input type="text" id="newUserState" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="Karnataka" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">GSTIN</label>
            <input type="text" id="newUserGst" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="29AABCU9603R1ZM" />
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.closeAdminModal()">Cancel</button>
      <button class="btn btn-primary" onclick="window.submitAdminAddUser()">Create Account</button>
    `;

    openModal("Add Enterprise Account", bodyHtml, footerHtml);
  }

  window.submitAdminAddUser = function () {
    const name = document.getElementById("newUserName")?.value.trim();
    const biz = document.getElementById("newUserBiz")?.value.trim();
    const email = document.getElementById("newUserEmail")?.value.trim();
    const role = document.getElementById("newUserRole")?.value || "buyer";
    const phone = document.getElementById("newUserPhone")?.value.trim() || "+91 98000 00000";
    const category = document.getElementById("newUserCategory")?.value.trim() || "General Commerce";
    const city = document.getElementById("newUserCity")?.value.trim() || "Bengaluru";
    const state = document.getElementById("newUserState")?.value.trim() || "Karnataka";
    const gstin = document.getElementById("newUserGst")?.value.trim() || "29AAAAA0000A1Z5";

    if (!name || !biz || !email) {
      showToast("Please provide name, business name, and official email.", "warning");
      return;
    }

    store.addUserAccount({
      fullName: name,
      businessName: biz,
      email,
      role,
      phone,
      category,
      city,
      state,
      gstin,
      verificationStatus: "Verified"
    });

    showToast(`Enterprise account created for ${name} (${role.toUpperCase()}).`);
    closeModal();
    renderUsers();
    renderOverview();
  };

  // Modal: Queue Business Verification
  function openAddVerifModal() {
    const bodyHtml = `
      <form id="adminAddVerifForm" onsubmit="return false;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Enterprise Legal Name *</label>
            <input type="text" id="newVerifBiz" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="e.g. Apex Global Solutions" required />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Entity Role *</label>
            <select id="newVerifRole" class="select-filter" style="width:100%;">
              <option value="supplier">Supplier / Manufacturer</option>
              <option value="buyer">Procurement Enterprise</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Industry Sector *</label>
            <input type="text" id="newVerifCat" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="e.g. Industrial Equipment" required />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">GSTIN *</label>
            <input type="text" id="newVerifGst" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="e.g. 29AABCU9603R1ZM" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Principal Contact Person</label>
            <input type="text" id="newVerifPerson" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="e.g. S. Ramanathan" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Official Email</label>
            <input type="email" id="newVerifEmail" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="e.g. contact@enterprise.com" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">City & State</label>
            <input type="text" id="newVerifCity" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="Bengaluru, Karnataka" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Compliance Notes</label>
            <input type="text" id="newVerifNotes" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" placeholder="Incorporation proof attached" />
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.closeAdminModal()">Cancel</button>
      <button class="btn btn-primary" onclick="window.submitAdminAddVerif()">Queue Application</button>
    `;

    openModal("Queue Verification Proof", bodyHtml, footerHtml);
  }

  window.submitAdminAddVerif = function () {
    const biz = document.getElementById("newVerifBiz")?.value.trim();
    const role = document.getElementById("newVerifRole")?.value || "supplier";
    const cat = document.getElementById("newVerifCat")?.value.trim() || "Industrial Equipment";
    const gstin = document.getElementById("newVerifGst")?.value.trim() || "29AABCU9603R1ZM";
    const person = document.getElementById("newVerifPerson")?.value.trim() || "Compliance Officer";
    const email = document.getElementById("newVerifEmail")?.value.trim() || "legal@enterprise.com";
    const cityState = document.getElementById("newVerifCity")?.value.trim() || "Bengaluru, Karnataka";
    const notes = document.getElementById("newVerifNotes")?.value.trim() || "Proof documents uploaded.";

    if (!biz || !gstin) {
      showToast("Enterprise Name and GSTIN are required.", "warning");
      return;
    }

    const parts = cityState.split(",");
    const city = (parts[0] || "Bengaluru").trim();
    const state = (parts[1] || "Karnataka").trim();

    store.addBusinessVerification({
      businessName: biz,
      userRole: role,
      category: cat,
      gstin,
      contactPerson: person,
      email,
      city,
      state,
      notes
    });

    showToast(`Verification proof queued for ${biz}.`);
    closeModal();
    renderVerification();
    renderOverview();
  };

  // Modal: Simulate Procurement Order
  function openSimulateOrderModal() {
    const products = store.getUnifiedProducts();
    const prodOptions = products.map(p => `<option value="${p.name}|${p.price}|${p.supplierName}">${p.name} (Supplier: ${p.supplierName} - ${store.formatCurrency(p.price)})</option>`).join("");

    const bodyHtml = `
      <form id="adminSimulateOrderForm" onsubmit="return false;">
        <div style="margin-bottom: 14px;">
          <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Select Wholesale Product *</label>
          <select id="simOrderProd" class="select-filter" style="width:100%;" onchange="window.updateSimOrderPrice(this)">
            ${prodOptions}
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Buyer Enterprise *</label>
            <input type="text" id="simOrderBuyer" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" value="North Star Retail Pvt. Ltd." />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Buyer Contact Name</label>
            <input type="text" id="simOrderBuyerName" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" value="Aisha Patel" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Order Quantity *</label>
            <input type="number" id="simOrderQty" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" value="500" min="1" oninput="window.calcSimOrderTotal()" />
          </div>
          <div>
            <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:4px; color:#0f172a;">Unit Price (₹) *</label>
            <input type="number" id="simOrderPrice" class="search-input" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px;" value="180" oninput="window.calcSimOrderTotal()" />
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.88rem; font-weight: 700; color: #475569;">Total Procurement Escrow Value:</span>
          <span id="simOrderTotalDisplay" style="font-size: 1.15rem; font-weight: 800; color: #d87543;">₹90,000</span>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.closeAdminModal()">Cancel</button>
      <button class="btn btn-primary" onclick="window.submitAdminSimulateOrder()">Execute Order</button>
    `;

    openModal("Simulate Procurement Order", bodyHtml, footerHtml);
  }

  window.updateSimOrderPrice = function (sel) {
    const parts = (sel.value || "").split("|");
    if (parts.length >= 2) {
      const priceInput = document.getElementById("simOrderPrice");
      if (priceInput) {
        priceInput.value = parts[1];
        window.calcSimOrderTotal();
      }
    }
  };

  window.calcSimOrderTotal = function () {
    const qty = parseInt(document.getElementById("simOrderQty")?.value, 10) || 0;
    const price = parseFloat(document.getElementById("simOrderPrice")?.value) || 0;
    const totalEl = document.getElementById("simOrderTotalDisplay");
    if (totalEl) {
      totalEl.textContent = store.formatCurrency(qty * price);
    }
  };

  window.submitAdminSimulateOrder = function () {
    const sel = document.getElementById("simOrderProd");
    const parts = (sel?.value || "").split("|");
    const prodName = parts[0] || "Wholesale Merchandise";
    const supplierName = parts[2] || "Apex Gear Co.";
    const buyerBiz = document.getElementById("simOrderBuyer")?.value.trim() || "North Star Retail Pvt. Ltd.";
    const buyerName = document.getElementById("simOrderBuyerName")?.value.trim() || "Aisha Patel";
    const qty = parseInt(document.getElementById("simOrderQty")?.value, 10) || 100;
    const price = parseFloat(document.getElementById("simOrderPrice")?.value) || 100;

    const order = store.simulateProcurementOrder({
      buyerName,
      buyerBusiness: buyerBiz,
      supplierName,
      productName: prodName,
      quantity: qty,
      unitPrice: price,
      orderStatus: "In Production",
      paymentStatus: "Escrow Funded"
    });

    showToast(`Order ${order.id} executed for ${store.formatCurrency(order.totalAmount)}.`);
    closeModal();
    renderOrders();
    renderOverview();
  };

  function initAdminIdentity() {
    const adminUser = store.getAdminStore().adminUser || store.defaultAdmin;

    // Sidebar
    const sName = document.getElementById("sidebarAdminName");
    const sRole = document.getElementById("sidebarAdminRole");
    const sAvatar = document.getElementById("sidebarAdminAvatar");
    const sCard = document.getElementById("sidebarAdminCard");

    if (sName) sName.textContent = adminUser.fullName;
    if (sRole) sRole.textContent = adminUser.designation || "Governance Head";
    if (sAvatar) sAvatar.textContent = adminUser.avatar;
    if (sCard) sCard.addEventListener("click", openAdminProfileModal);

    // Topbar
    const tName = document.getElementById("topbarAdminName");
    const tEmail = document.getElementById("topbarAdminEmail");
    const tAvatar = document.getElementById("topbarAdminAvatar");
    const tChip = document.getElementById("topbarAdminChip");

    if (tName) tName.textContent = adminUser.fullName;
    if (tEmail) tEmail.textContent = adminUser.email;
    if (tAvatar) tAvatar.textContent = adminUser.avatar;
    if (tChip) tChip.addEventListener("click", openAdminProfileModal);

    // Header buttons
    const btnAddUser = document.getElementById("btnAdminAddUser");
    if (btnAddUser) btnAddUser.addEventListener("click", openAddUserModal);

    const btnAddVerif = document.getElementById("btnAdminAddVerif");
    if (btnAddVerif) btnAddVerif.addEventListener("click", openAddVerifModal);

    const btnSimOrder = document.getElementById("btnAdminSimulateOrder");
    if (btnSimOrder) btnSimOrder.addEventListener("click", openSimulateOrderModal);
  }

  // Mobile menu toggle
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });
  }

  // Hash change listener
  window.addEventListener("hashchange", function () {
    const hash = window.location.hash.replace("#", "") || "overview";
    switchView(hash);
  });

  // Navigation click handlers
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = this.getAttribute("data-view");
      switchView(target);
    });
  });

  // Global badging update
  function updateGlobalBadges() {
    const stats = store.calculateAdminStats();
    if (topPendingVerifBadge) topPendingVerifBadge.textContent = stats.pendingVerifications;
    if (topRiskBadge) topRiskBadge.textContent = stats.highRiskItems;
    if (navVerifBadge) navVerifBadge.textContent = stats.pendingVerifications;
    if (navRiskBadge) navRiskBadge.textContent = stats.highRiskItems;
    if (navComplaintsBadge) navComplaintsBadge.textContent = stats.openComplaints;
  }

  // ==========================================================================
  // 4. OVERVIEW MODULE (KPIs, Activity, SVG Charts)
  // ==========================================================================
  function renderOverview() {
    const stats = store.calculateAdminStats();
    const adminState = store.getAdminStore();

    // Render KPI Cards
    const kpiContainer = document.getElementById("overviewKpiGrid");
    if (kpiContainer) {
      kpiContainer.innerHTML = `
        <div class="kpi-card kpi-primary">
          <div class="kpi-header">
            <span class="kpi-title">Total Buyers</span>
            <div class="kpi-icon-wrap">🏢</div>
          </div>
          <div class="kpi-value">${stats.totalBuyers}</div>
          <div class="kpi-footer">
            <span class="kpi-badge positive">Active</span>
            <span>Registered procurement entities</span>
          </div>
        </div>

        <div class="kpi-card kpi-success">
          <div class="kpi-header">
            <span class="kpi-title">Total Suppliers</span>
            <div class="kpi-icon-wrap">🏭</div>
          </div>
          <div class="kpi-value">${stats.totalSuppliers}</div>
          <div class="kpi-footer">
            <span class="kpi-badge positive">Verified</span>
            <span>Catalog & factory partners</span>
          </div>
        </div>

        <div class="kpi-card kpi-info">
          <div class="kpi-header">
            <span class="kpi-title">Listed Products</span>
            <div class="kpi-icon-wrap">📦</div>
          </div>
          <div class="kpi-value">${stats.totalProducts}</div>
          <div class="kpi-footer">
            <span class="kpi-badge positive">Active</span>
            <span>Wholesale catalog items</span>
          </div>
        </div>

        <div class="kpi-card kpi-purple">
          <div class="kpi-header">
            <span class="kpi-title">Total RFQs</span>
            <div class="kpi-icon-wrap">📝</div>
          </div>
          <div class="kpi-value">${stats.totalRfqs}</div>
          <div class="kpi-footer">
            <span class="kpi-badge positive">Sourcing</span>
            <span>Procurement quotes requested</span>
          </div>
        </div>

        <div class="kpi-card kpi-warning">
          <div class="kpi-header">
            <span class="kpi-title">Total Orders</span>
            <div class="kpi-icon-wrap">🛒</div>
          </div>
          <div class="kpi-value">${stats.totalOrders}</div>
          <div class="kpi-footer">
            <span class="kpi-badge attention">GMV ${stats.formattedGMV}</span>
            <span>Processed orders</span>
          </div>
        </div>

        <div class="kpi-card kpi-danger">
          <div class="kpi-header">
            <span class="kpi-title">Pending Verifications</span>
            <div class="kpi-icon-wrap">🛡️</div>
          </div>
          <div class="kpi-value">${stats.pendingVerifications}</div>
          <div class="kpi-footer">
            <span class="kpi-badge critical">Action Required</span>
            <span>GST & entity review</span>
          </div>
        </div>
      `;
    }

    // Render Recent Activity Stream
    const activityContainer = document.getElementById("overviewActivityStream");
    if (activityContainer) {
      const activities = adminState.activities.slice(0, 5);
      activityContainer.innerHTML = activities.map((act) => `
        <div class="activity-item">
          <div class="activity-icon">${act.icon || "📌"}</div>
          <div class="activity-content">
            <div class="activity-title">${act.title}</div>
            <div class="activity-desc">${act.description}</div>
            <div class="activity-meta">
              <span>👤 ${act.actor}</span>
              <span>•</span>
              <span>🕒 ${store.formatTimeAgo(act.timestamp)}</span>
            </div>
          </div>
        </div>
      `).join("");
    }

    // Render Interactive SVG Trend Chart
    renderOverviewGmvChart();

    // Render Category Distribution Donut Chart
    renderOverviewCategoryDonut();
  }

  function renderOverviewGmvChart() {
    const chartEl = document.getElementById("overviewGmvChart");
    if (!chartEl) return;

    const orders = store.getUnifiedOrders();
    const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    const baseCurve = [120000, 240000, 390000, 480000, 680000];
    const totalOrderGMV = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const liveOctGMV = Math.max(totalOrderGMV, 520000);
    const projectedGMV = Math.round(liveOctGMV * 1.32);

    const values = [...baseCurve, liveOctGMV, projectedGMV];
    const maxVal = Math.max(...values, 1200000);

    const width = 650;
    const height = 220;
    const paddingLeft = 56;
    const paddingRight = 30;
    const paddingTop = 26;
    const paddingBottom = 40;
    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const points = values.map((val, idx) => {
      const x = paddingLeft + (idx / (values.length - 1)) * plotWidth;
      const y = paddingTop + plotHeight - (val / maxVal) * plotHeight;
      return { x: Math.round(x), y: Math.round(y), val };
    });

    const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
    const polygonPoints = `${points[0].x},${paddingTop + plotHeight} ${polylinePoints} ${points[points.length - 1].x},${paddingTop + plotHeight}`;

    const labels = [...months, "Proj"];
    const yGridSteps = [
      { ratio: 0, label: maxVal >= 100000 ? `₹${(maxVal / 100000).toFixed(1)}L` : `₹${Math.round(maxVal / 1000)}k` },
      { ratio: 0.33, label: maxVal >= 100000 ? `₹${((maxVal * 0.67) / 100000).toFixed(1)}L` : `₹${Math.round((maxVal * 0.67) / 1000)}k` },
      { ratio: 0.67, label: maxVal >= 100000 ? `₹${((maxVal * 0.33) / 100000).toFixed(1)}L` : `₹${Math.round((maxVal * 0.33) / 1000)}k` },
      { ratio: 1, label: "₹0" }
    ];

    chartEl.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 650 220" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gmvAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#d87543" stop-opacity="0.38" />
            <stop offset="100%" stop-color="#d87543" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Dynamic Grid Lines -->
        ${yGridSteps.map((step) => {
          const y = paddingTop + step.ratio * plotHeight;
          return `
            <line x1="${paddingLeft}" y1="${Math.round(y)}" x2="${width - paddingRight}" y2="${Math.round(y)}" stroke="${step.ratio === 1 ? '#cbd5e1' : '#f1f5f9'}" stroke-width="1" />
            <text x="${paddingLeft - 10}" y="${Math.round(y + 4)}" font-size="10" fill="#94a3b8" text-anchor="end">${step.label}</text>
          `;
        }).join("")}

        <!-- Dynamic Area Fill -->
        <polygon points="${polygonPoints}" fill="url(#gmvAreaGrad)" />

        <!-- Dynamic Line Path -->
        <polyline points="${polylinePoints}" fill="none" stroke="#d87543" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Data Point Nodes -->
        ${points.map((p, idx) => {
          const isProj = idx === points.length - 1;
          const formatted = store.formatCurrency(p.val);
          return `
            <circle cx="${p.x}" cy="${p.y}" r="${isProj ? 5.5 : 4.5}" fill="${isProj ? '#d87543' : '#ffffff'}" stroke="#d87543" stroke-width="${isProj ? 2 : 3}">
              <title>${labels[idx]}: ${formatted}</title>
            </circle>
          `;
        }).join("")}

        <!-- Axis Labels -->
        ${points.map((p, idx) => {
          const isProj = idx === points.length - 1;
          return `
            <text x="${p.x}" y="204" font-size="11" fill="${isProj ? '#d87543' : '#94a3b8'}" font-weight="${isProj ? '700' : '500'}" text-anchor="middle">${labels[idx]}</text>
          `;
        }).join("")}
      </svg>
    `;
  }

  function renderOverviewCategoryDonut() {
    const donutEl = document.getElementById("overviewCategoryDonut");
    if (!donutEl) return;

    const products = store.getUnifiedProducts();
    const catCounts = {};
    products.forEach((p) => {
      const cat = p.category || "General Equipment";
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    const categories = Object.keys(catCounts).map((k) => ({ name: k, count: catCounts[k] }));
    categories.sort((a, b) => b.count - a.count);

    const topCategories = categories.slice(0, 4);
    const totalCount = products.length || 1;
    const colors = ["#0f172a", "#d87543", "#10b981", "#3b82f6"];

    const circumference = 2 * Math.PI * 38; // approx 238.76
    let offset = 0;

    const segments = topCategories.map((c, idx) => {
      const pct = Math.round((c.count / totalCount) * 100);
      const dash = (c.count / totalCount) * circumference;
      const currentOffset = offset;
      offset += dash;
      return {
        name: c.name,
        count: c.count,
        pct,
        dash: dash.toFixed(1),
        rem: (circumference - dash).toFixed(1),
        offset: (-currentOffset).toFixed(1),
        color: colors[idx % colors.length]
      };
    });

    donutEl.innerHTML = `
      <div class="donut-wrap">
        <svg width="190" height="190" viewBox="0 0 100 100">
          ${segments.map((s) => `
            <circle cx="50" cy="50" r="38" fill="transparent" stroke="${s.color}" stroke-width="14" stroke-dasharray="${s.dash} ${s.rem}" stroke-dashoffset="${s.offset}" />
          `).join("")}
        </svg>
        <div class="donut-center-label">
          <div class="donut-big-val">${topCategories.length}</div>
          <div class="donut-sub-text">Top Sectors</div>
        </div>
      </div>
      <div class="chart-legend">
        ${segments.map((s) => `
          <div class="legend-item"><div class="legend-color" style="background:${s.color};"></div>${s.name} (${s.pct}%)</div>
        `).join("")}
      </div>
    `;
  }

  // ==========================================================================
  // 5. MODULE 30: BUYER & SUPPLIER MANAGEMENT
  // ==========================================================================
  let userSearchTerm = "";
  let userRoleFilter = "all";
  let userStatusFilter = "all";

  function renderUsers() {
    const users = store.getUnifiedUsers();
    const tbody = document.getElementById("usersTableBody");
    const countEl = document.getElementById("usersTotalCount");
    if (!tbody) return;

    const filtered = users.filter((u) => {
      const matchSearch =
        !userSearchTerm ||
        u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.businessName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchTerm.toLowerCase());

      const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
      const matchStatus = userStatusFilter === "all" || u.accountStatus.toLowerCase() === userStatusFilter.toLowerCase();

      return matchSearch && matchRole && matchStatus;
    });

    if (countEl) countEl.textContent = `${filtered.length} of ${users.length} Records`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 32px; color: #64748b;">
            No users match the search criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((u) => {
      const roleBadgeClass = `role-${u.role}`;
      const statusPillClass = `status-${u.accountStatus.toLowerCase().replace(/[^a-z]/g, "")}`;
      const verifPillClass = `status-${u.verificationStatus.toLowerCase().replace(/[^a-z]/g, "")}`;

      return `
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-avatar-mini">${u.name.substring(0, 2).toUpperCase()}</div>
              <div>
                <div class="user-meta-name">${u.name}</div>
                <div class="user-meta-sub">${u.businessName}</div>
              </div>
            </div>
          </td>
          <td><span class="role-badge ${roleBadgeClass}">${u.role}</span></td>
          <td>${u.email}</td>
          <td>${store.formatDate(u.registrationDate)}</td>
          <td><span class="status-pill ${statusPillClass}">${u.accountStatus}</span></td>
          <td><span class="status-pill ${verifPillClass}">${u.verificationStatus}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary btn-sm" onclick="window.adminInspectUser('${u.id}')">View</button>
              <button class="btn ${u.accountStatus === "Active" ? "btn-warning" : "btn-success"} btn-sm" onclick="window.adminToggleUserStatus('${u.id}', '${u.accountStatus}')">
                ${u.accountStatus === "Active" ? "Suspend" : "Activate"}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  // Global methods for inline table actions
  window.adminInspectUser = function (userId) {
    const users = store.getUnifiedUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const bodyHtml = `
      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
        <div class="admin-avatar" style="width: 54px; height: 54px; font-size: 1.25rem;">${user.name.substring(0, 2).toUpperCase()}</div>
        <div>
          <h3 style="font-size: 1.2rem; color: #0f172a;">${user.name}</h3>
          <p style="color: #64748b; font-size: 0.88rem;">${user.businessName} • <span class="role-badge role-${user.role}">${user.role}</span></p>
        </div>
      </div>
      <div class="verif-meta-list" style="grid-template-columns: 1fr 1fr; margin-bottom: 20px;">
        <div><span class="meta-field-label">Official Email</span><div class="meta-field-val">${user.email}</div></div>
        <div><span class="meta-field-label">Phone</span><div class="meta-field-val">${user.phone}</div></div>
        <div><span class="meta-field-label">Location</span><div class="meta-field-val">${user.city}, ${user.state}</div></div>
        <div><span class="meta-field-label">GSTIN</span><div class="meta-field-val">${user.gstin}</div></div>
        <div><span class="meta-field-label">Category</span><div class="meta-field-val">${user.category}</div></div>
        <div><span class="meta-field-label">Joined</span><div class="meta-field-val">${store.formatDate(user.registrationDate)}</div></div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
        <div style="font-weight: 700; font-size: 0.82rem; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Administrative Status</div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <span class="status-pill status-${user.accountStatus.toLowerCase()}">${user.accountStatus}</span>
          <span class="status-pill status-${user.verificationStatus.toLowerCase()}">Verification: ${user.verificationStatus}</span>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.closeAdminModal()">Close</button>
      <button class="btn ${user.accountStatus === "Active" ? "btn-danger" : "btn-success"}" onclick="window.adminToggleUserStatus('${user.id}', '${user.accountStatus}'); window.closeAdminModal();">
        ${user.accountStatus === "Active" ? "Suspend Account" : "Activate Account"}
      </button>
    `;

    openModal("User & Entity Profile", bodyHtml, footerHtml);
  };

  window.adminToggleUserStatus = function (userId, currentStatus) {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    store.updateUserAccountStatus(userId, nextStatus);
    showToast(`Account status updated to '${nextStatus}'.`);
    renderUsers();
    renderOverview();
  };

  window.closeAdminModal = closeModal;

  // Filter attachments for Module 30
  const userSearch = document.getElementById("userSearchInput");
  if (userSearch) {
    userSearch.addEventListener("input", function () {
      userSearchTerm = this.value.trim();
      renderUsers();
    });
  }

  const roleSelect = document.getElementById("userRoleSelect");
  if (roleSelect) {
    roleSelect.addEventListener("change", function () {
      userRoleFilter = this.value;
      renderUsers();
    });
  }

  const statusSelect = document.getElementById("userStatusSelect");
  if (statusSelect) {
    statusSelect.addEventListener("change", function () {
      userStatusFilter = this.value;
      renderUsers();
    });
  }

  // ==========================================================================
  // 6. MODULE 31: BUSINESS VERIFICATION
  // ==========================================================================
  let verifStatusTab = "all";

  function renderVerification() {
    const adminState = store.getAdminStore();
    const grid = document.getElementById("verificationGrid");
    if (!grid) return;

    const filtered = adminState.verifications.filter((v) => {
      if (verifStatusTab === "all") return true;
      if (verifStatusTab === "pending") return v.status === "Pending Review" || v.status === "Information Requested";
      if (verifStatusTab === "approved") return v.status === "Approved";
      if (verifStatusTab === "rejected") return v.status === "Rejected";
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: white; border-radius: 12px; border: 1px dashed #cbd5e1; color: #64748b;">
          No verification applications in this tab.
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((v) => {
      const statusPillClass = `status-${v.status.toLowerCase().replace(/[^a-z]/g, "")}`;
      return `
        <div class="verif-card">
          <div class="verif-card-header">
            <div>
              <div class="verif-biz-name">${v.businessName}</div>
              <div class="verif-biz-id">${v.id} • Submitted ${store.formatDate(v.submissionDate)}</div>
            </div>
            <span class="status-pill ${statusPillClass}">${v.status}</span>
          </div>

          <div class="verif-meta-list">
            <div><span class="meta-field-label">Category</span><div class="meta-field-val">${v.category}</div></div>
            <div><span class="meta-field-label">GSTIN</span><div class="meta-field-val">${v.gstin}</div></div>
            <div><span class="meta-field-label">PAN</span><div class="meta-field-val">${v.pan}</div></div>
            <div><span class="meta-field-label">City/State</span><div class="meta-field-val">${v.city}, ${v.state}</div></div>
          </div>

          <div>
            <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Uploaded Documents (${v.documents.length})</div>
            <div class="verif-doc-pills">
              ${v.documents.map((d) => `
                <div class="doc-pill">
                  <span class="doc-name">📄 ${d.name}</span>
                  <span class="doc-status-icon">${d.verified ? "✅" : "⏳"}</span>
                </div>
              `).join("")}
            </div>
          </div>

          ${v.reviewNotes ? `
            <div style="font-size: 0.78rem; color: #475569; background: #f8fafc; padding: 10px; border-radius: 6px; border-left: 3px solid #cbd5e1;">
              <strong>Admin Note:</strong> ${v.reviewNotes}
            </div>
          ` : ""}

          <div class="verif-card-actions">
            <button class="btn btn-secondary btn-sm" onclick="window.adminPreviewVerification('${v.id}')">Inspect & Preview</button>
            <button class="btn btn-success btn-sm" onclick="window.adminQuickApproveVerification('${v.id}')">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="window.adminQuickRejectVerification('${v.id}')">Reject</button>
          </div>
        </div>
      `;
    }).join("");
  }

  window.adminPreviewVerification = function (verifId) {
    const adminState = store.getAdminStore();
    const v = adminState.verifications.find((item) => item.id === verifId);
    if (!v) return;

    const bodyHtml = `
      <div class="demo-disclaimer-banner" style="margin-bottom: 16px;">
        <span class="disclaimer-icon">🛡️</span>
        <div class="disclaimer-text">
          <strong>Demonstration Workflow:</strong> All verification actions occur locally in the client demonstration. No real legal verification or government registry lookup is executed.
        </div>
      </div>

      <div class="document-preview-frame">
        <div class="doc-watermark-header">
          <div>
            <div class="doc-gov-title">Government of India — GST Certificate of Registration</div>
            <div style="font-size: 0.74rem; color: #64748b;">FORM GST REG-06 [Rule 10(1)]</div>
          </div>
          <div class="doc-stamp">${v.status === "Approved" ? "ACTIVE & VERIFIED" : "PENDING AUDIT"}</div>
        </div>

        <div class="doc-grid-fields">
          <div><strong>Registration Legal Name:</strong> ${v.businessName}</div>
          <div><strong>GSTIN / UIN:</strong> ${v.gstin}</div>
          <div><strong>Permanent Account Number:</strong> ${v.pan}</div>
          <div><strong>Corporate Identification:</strong> ${v.cin}</div>
          <div><strong>Principal Place of Business:</strong> ${v.address}, ${v.city}, ${v.state} - ${v.pincode}</div>
          <div><strong>Contact Person:</strong> ${v.contactPerson} (${v.phone})</div>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 0.84rem; font-weight: 700; margin-bottom: 6px; color: #0f172a;">Administrative Review Notes:</label>
        <textarea id="modalVerifNotes" style="width: 100%; height: 75px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.86rem;" placeholder="Add verification findings or notes...">${v.reviewNotes || ""}</textarea>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.closeAdminModal()">Cancel</button>
      <button class="btn btn-warning" onclick="window.adminSubmitVerifAction('${v.id}', 'Information Requested')">Request Information</button>
      <button class="btn btn-danger" onclick="window.adminSubmitVerifAction('${v.id}', 'Rejected')">Reject</button>
      <button class="btn btn-success" onclick="window.adminSubmitVerifAction('${v.id}', 'Approved')">Approve Verification</button>
    `;

    openModal(`Verify Business: ${v.businessName}`, bodyHtml, footerHtml, true);
  };

  window.adminSubmitVerifAction = function (verifId, status) {
    const notesEl = document.getElementById("modalVerifNotes");
    const notes = notesEl ? notesEl.value.trim() : "";
    store.updateVerificationStatus(verifId, status, notes);
    showToast(`Verification status set to '${status}'.`);
    closeModal();
    renderVerification();
    renderOverview();
  };

  window.adminQuickApproveVerification = function (verifId) {
    store.updateVerificationStatus(verifId, "Approved", "Approved via fast-track review.");
    showToast("Business verification approved.");
    renderVerification();
    renderOverview();
  };

  window.adminQuickRejectVerification = function (verifId) {
    store.updateVerificationStatus(verifId, "Rejected", "Rejected due to incomplete corporate documentation.");
    showToast("Business verification rejected.");
    renderVerification();
    renderOverview();
  };

  // Tab filters for verification
  const verifTabs = document.querySelectorAll("#verifTabPills .tab-pill");
  verifTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      verifTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      verifStatusTab = this.getAttribute("data-tab");
      renderVerification();
    });
  });

  // ==========================================================================
  // 7. MODULE 32: PRODUCT MONITORING
  // ==========================================================================
  let prodSearchTerm = "";
  let prodStatusFilter = "all";

  function renderProducts() {
    const products = store.getUnifiedProducts();
    const tbody = document.getElementById("productsTableBody");
    const countEl = document.getElementById("productsTotalCount");
    if (!tbody) return;

    const filtered = products.filter((p) => {
      const matchSearch =
        !prodSearchTerm ||
        p.name.toLowerCase().includes(prodSearchTerm.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(prodSearchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(prodSearchTerm.toLowerCase());

      const matchStatus = prodStatusFilter === "all" || p.moderationStatus.toLowerCase() === prodStatusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });

    if (countEl) countEl.textContent = `${filtered.length} of ${products.length} Products`;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: #64748b;">No products found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((p) => {
      const statusClass = `status-${p.moderationStatus.toLowerCase().replace(/[^a-z]/g, "")}`;
      return `
        <tr>
          <td>
            <div class="product-cell">
              <img src="${p.image}" alt="${p.name}" class="product-thumb" onerror="this.src='../../images/products/industrial-safety-gloves.webp'" />
              <div>
                <div style="font-weight: 700; color: #0f172a;">${p.name}</div>
                <div style="font-size: 0.76rem; color: #64748b;">ID: ${p.id}</div>
              </div>
            </div>
          </td>
          <td>${p.supplierName}</td>
          <td><span class="role-badge role-buyer">${p.category}</span></td>
          <td><strong>${store.formatCurrency(p.price)}</strong></td>
          <td>${p.moq} (Stock: ${p.stock})</td>
          <td>
            <span class="status-pill ${statusClass}">${p.moderationStatus}</span>
            ${p.reportedCount > 0 ? `<div class="report-flag-badge" style="margin-top: 4px;">🚩 ${p.reportedCount} Flags</div>` : ""}
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary btn-sm" onclick="window.adminInspectProduct('${p.id}')">Moderate</button>
              ${p.moderationStatus === "Approved" ? `
                <button class="btn btn-danger btn-sm" onclick="window.adminQuickProductStatus('${p.id}', 'Flagged')">Flag</button>
              ` : `
                <button class="btn btn-success btn-sm" onclick="window.adminQuickProductStatus('${p.id}', 'Approved')">Approve</button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  window.adminInspectProduct = function (productId) {
    const products = store.getUnifiedProducts();
    const p = products.find((item) => item.id === productId);
    if (!p) return;

    const bodyHtml = `
      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
        <img src="${p.image}" alt="${p.name}" style="width: 80px; height: 80px; border-radius: 10px; object-fit: cover; border: 1px solid #e2e8f0;" onerror="this.src='../../images/products/industrial-safety-gloves.webp'" />
        <div>
          <h3 style="font-size: 1.15rem; color: #0f172a;">${p.name}</h3>
          <p style="color: #64748b; font-size: 0.88rem;">Supplier: <strong>${p.supplierName}</strong> • Category: <strong>${p.category}</strong></p>
          <div style="margin-top: 6px;">
            <span class="status-pill status-${p.moderationStatus.toLowerCase()}">${p.moderationStatus}</span>
            ${p.reportedCount > 0 ? `<span class="report-flag-badge">🚩 Reported ${p.reportedCount} times</span>` : ""}
          </div>
        </div>
      </div>

      <div class="verif-meta-list" style="margin-bottom: 16px;">
        <div><span class="meta-field-label">Unit Price</span><div class="meta-field-val">${store.formatCurrency(p.price)}</div></div>
        <div><span class="meta-field-label">Minimum Order Qty</span><div class="meta-field-val">${p.moq} units</div></div>
        <div><span class="meta-field-label">Warehouse Stock</span><div class="meta-field-val">${p.stock} units</div></div>
        <div><span class="meta-field-label">Compliance Score</span><div class="meta-field-val">${p.complianceScore}/100</div></div>
      </div>

      ${p.lastReportReason ? `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 0.84rem; color: #991b1b;">
          <strong>Recent Flag Trigger:</strong> ${p.lastReportReason}
        </div>
      ` : ""}

      <div>
        <label style="display: block; font-size: 0.84rem; font-weight: 700; margin-bottom: 6px; color: #0f172a;">Admin Moderation Remarks:</label>
        <textarea id="modalProductNotes" style="width: 100%; height: 75px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.86rem;" placeholder="Add remarks or justification...">${p.reviewNotes || ""}</textarea>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.closeAdminModal()">Close</button>
      <button class="btn btn-danger" onclick="window.adminSubmitProductAction('${p.id}', 'Delisted')">Delist Product</button>
      <button class="btn btn-warning" onclick="window.adminSubmitProductAction('${p.id}', 'Flagged')">Flag for Review</button>
      <button class="btn btn-success" onclick="window.adminSubmitProductAction('${p.id}', 'Approved')">Approve Listing</button>
    `;

    openModal(`Moderate Listing: ${p.name}`, bodyHtml, footerHtml);
  };

  window.adminSubmitProductAction = function (productId, status) {
    const notesEl = document.getElementById("modalProductNotes");
    const notes = notesEl ? notesEl.value.trim() : "";
    store.updateProductModeration(productId, status, notes);
    showToast(`Product moderation status updated to '${status}'.`);
    closeModal();
    renderProducts();
    renderOverview();
  };

  window.adminQuickProductStatus = function (productId, status) {
    store.updateProductModeration(productId, status, "Fast action toggle.");
    showToast(`Product status set to '${status}'.`);
    renderProducts();
    renderOverview();
  };

  const prodSearch = document.getElementById("productSearchInput");
  if (prodSearch) {
    prodSearch.addEventListener("input", function () {
      prodSearchTerm = this.value.trim();
      renderProducts();
    });
  }

  const prodFilterSelect = document.getElementById("productStatusSelect");
  if (prodFilterSelect) {
    prodFilterSelect.addEventListener("change", function () {
      prodStatusFilter = this.value;
      renderProducts();
    });
  }

  // ==========================================================================
  // 8. MODULE 33: RISK & ACTIVITY MONITORING
  // ==========================================================================
  function renderRisk() {
    const adminState = store.getAdminStore();
    const grid = document.getElementById("riskCardsGrid");
    const tableBody = document.getElementById("riskTableBody");

    const highCount = adminState.riskRecords.filter((r) => r.riskLevel === "High").length;
    const medCount = adminState.riskRecords.filter((r) => r.riskLevel === "Medium").length;
    const lowCount = adminState.riskRecords.filter((r) => r.riskLevel === "Low").length;

    if (grid) {
      grid.innerHTML = `
        <div class="kpi-card kpi-danger">
          <div class="kpi-header"><span class="kpi-title">High Risk Flags</span><div class="kpi-icon-wrap">🚨</div></div>
          <div class="kpi-value">${highCount}</div>
          <div class="kpi-footer"><span class="kpi-badge critical">Immediate Review</span></div>
        </div>
        <div class="kpi-card kpi-warning">
          <div class="kpi-header"><span class="kpi-title">Medium Risk Warnings</span><div class="kpi-icon-wrap">⚠️</div></div>
          <div class="kpi-value">${medCount}</div>
          <div class="kpi-footer"><span class="kpi-badge attention">Under Watch</span></div>
        </div>
        <div class="kpi-card kpi-info">
          <div class="kpi-header"><span class="kpi-title">Low Risk Notices</span><div class="kpi-icon-wrap">ℹ️</div></div>
          <div class="kpi-value">${lowCount}</div>
          <div class="kpi-footer"><span class="kpi-badge positive">System Noted</span></div>
        </div>
        <div class="kpi-card kpi-purple">
          <div class="kpi-header"><span class="kpi-title">Total Flagged Incidents</span><div class="kpi-icon-wrap">🛡️</div></div>
          <div class="kpi-value">${adminState.riskRecords.length}</div>
          <div class="kpi-footer"><span class="kpi-badge positive">Audit Tracked</span></div>
        </div>
      `;
    }

    if (tableBody) {
      tableBody.innerHTML = adminState.riskRecords.map((r) => {
        const riskLevelClass = `status-${r.riskLevel.toLowerCase()}`;
        const statusClass = `status-${r.status.toLowerCase().replace(/[^a-z]/g, "")}`;

        return `
          <tr>
            <td><strong>${r.id}</strong></td>
            <td>
              <div style="font-weight: 700; color: #0f172a;">${r.entityName}</div>
              <div style="font-size: 0.76rem; color: #64748b;">${r.entityType} • ${r.relatedParty}</div>
            </td>
            <td><span class="status-pill ${riskLevelClass}">Risk: ${r.riskScore}/100</span></td>
            <td>
              <div style="font-weight: 600; font-size: 0.82rem; color: #334155;">${r.triggerRule}</div>
              <div style="font-size: 0.76rem; color: #64748b;">${r.description.substring(0, 70)}...</div>
            </td>
            <td><span class="status-pill ${statusClass}">${r.status}</span></td>
            <td>${store.formatTimeAgo(r.detectedDate)}</td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="window.adminInspectRisk('${r.id}')">Investigate</button>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  window.adminInspectRisk = function (riskId) {
    const adminState = store.getAdminStore();
    const r = adminState.riskRecords.find((item) => item.id === riskId);
    if (!r) return;

    const bodyHtml = `
      <div class="demo-disclaimer-banner" style="margin-bottom: 16px;">
        <span class="disclaimer-icon">⚠️</span>
        <div class="disclaimer-text">
          <strong>Limitation:</strong> Actual fraud and risk detection algorithms require backend machine learning services and heuristic microservices. This interface demonstrates administrative risk triage and manual review flows using frontend demonstration data.
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h4 style="color: #0f172a; font-size: 1.05rem;">${r.entityName}</h4>
          <span class="status-pill status-${r.riskLevel.toLowerCase()}">${r.riskLevel} (Score ${r.riskScore})</span>
        </div>
        <div style="font-size: 0.85rem; color: #475569; margin-bottom: 8px;">
          <strong>Trigger Rule:</strong> ${r.triggerRule}
        </div>
        <p style="font-size: 0.85rem; color: #64748b; line-height: 1.5;">${r.description}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Action History</div>
        <ul style="padding-left: 20px; font-size: 0.84rem; color: #475569;">
          ${(r.actionHistory || []).map((h) => `<li>${h}</li>`).join("")}
        </ul>
      </div>

      <div>
        <label style="display: block; font-size: 0.84rem; font-weight: 700; margin-bottom: 6px; color: #0f172a;">Administrative Review Notes:</label>
        <textarea id="modalRiskNotes" style="width: 100%; height: 75px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.86rem;" placeholder="Record mitigation notes or clear status...">${r.adminNotes || ""}</textarea>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.closeAdminModal()">Close</button>
      <button class="btn btn-warning" onclick="window.adminSubmitRiskAction('${r.id}', 'Under Investigation')">Keep Under Watch</button>
      <button class="btn btn-success" onclick="window.adminSubmitRiskAction('${r.id}', 'Resolved')">Mark Resolved / Cleared</button>
      <button class="btn btn-danger" onclick="window.adminSubmitRiskAction('${r.id}', 'Escalated to Legal')">Escalate Account</button>
    `;

    openModal(`Risk Investigation: ${r.id}`, bodyHtml, footerHtml);
  };

  window.adminSubmitRiskAction = function (riskId, status) {
    const notesEl = document.getElementById("modalRiskNotes");
    const notes = notesEl ? notesEl.value.trim() : "";
    store.updateRiskStatus(riskId, status, notes);
    showToast(`Risk ticket status set to '${status}'.`);
    closeModal();
    renderRisk();
    renderOverview();
  };

  // ==========================================================================
  // 9. MODULE 34: ORDER & TRANSACTION MONITORING
  // ==========================================================================
  let orderSearchTerm = "";
  let orderStatusFilter = "all";

  function renderOrders() {
    const orders = store.getUnifiedOrders();
    const tbody = document.getElementById("ordersTableBody");
    const finStrip = document.getElementById("ordersFinancialStrip");
    if (!tbody) return;

    // Financial Metrics Calculation
    const totalGMV = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const escrowHeld = orders
      .filter((o) => o.paymentStatus === "Escrow Funded")
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const completedPayouts = orders
      .filter((o) => o.paymentStatus === "Released to Supplier")
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const avgOrderVal = orders.length ? Math.round(totalGMV / orders.length) : 0;

    if (finStrip) {
      finStrip.innerHTML = `
        <div class="fin-item">
          <span class="fin-label">Total Platform Volume</span>
          <div class="fin-amount">${store.formatCurrency(totalGMV)}</div>
          <span class="fin-sub">${orders.length} transactions executed</span>
        </div>
        <div class="fin-item">
          <span class="fin-label">Escrow Funds Protected</span>
          <div class="fin-amount">${store.formatCurrency(escrowHeld)}</div>
          <span class="fin-sub">Pending milestone verification</span>
        </div>
        <div class="fin-item">
          <span class="fin-label">Settled Payouts</span>
          <div class="fin-amount">${store.formatCurrency(completedPayouts)}</div>
          <span class="fin-sub">Disbursed to suppliers</span>
        </div>
        <div class="fin-item">
          <span class="fin-label">Average Order Size</span>
          <div class="fin-amount">${store.formatCurrency(avgOrderVal)}</div>
          <span class="fin-sub">Wholesale basket size</span>
        </div>
      `;
    }

    const filtered = orders.filter((o) => {
      const matchSearch =
        !orderSearchTerm ||
        o.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        o.buyerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        o.supplierName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        o.productName.toLowerCase().includes(orderSearchTerm.toLowerCase());

      const matchStatus = orderStatusFilter === "all" || o.orderStatus.toLowerCase() === orderStatusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: #64748b;">No orders found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((o) => {
      const ordClass = `status-${o.orderStatus.toLowerCase().replace(/[^a-z]/g, "")}`;
      const payClass = `status-${o.paymentStatus.toLowerCase().replace(/[^a-z]/g, "")}`;

      return `
        <tr>
          <td><strong>${o.id}</strong><div style="font-size: 0.76rem; color: #64748b;">${store.formatDate(o.createdAt)}</div></td>
          <td>
            <div style="font-weight: 700; color: #0f172a;">${o.buyerName}</div>
            <div style="font-size: 0.76rem; color: #64748b;">${o.buyerBusiness}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: #0f172a;">${o.supplierName}</div>
          </td>
          <td>
            <strong>${store.formatCurrency(o.totalAmount)}</strong>
            <div style="font-size: 0.74rem; color: #64748b;">${o.quantity} ${o.unit}</div>
          </td>
          <td><span class="status-pill ${ordClass}">${o.orderStatus}</span></td>
          <td><span class="status-pill ${payClass}">${o.paymentStatus}</span></td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="window.adminInspectOrder('${o.id}')">Inspect</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  window.adminInspectOrder = function (orderId) {
    const orders = store.getUnifiedOrders();
    const o = orders.find((item) => item.id === orderId);
    if (!o) return;

    const bodyHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #e2e8f0;">
        <div>
          <h3 style="font-size: 1.25rem; color: #0f172a; margin: 0 0 4px 0;">Order: ${o.id}</h3>
          <p style="color: #64748b; font-size: 0.88rem; margin: 0;">Created ${store.formatDate(o.createdAt)}</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.4rem; font-weight: 800; color: #0f172a;">${store.formatCurrency(o.totalAmount)}</div>
          <span class="status-pill status-${o.paymentStatus.toLowerCase().replace(/[^a-z]/g, "")}">${o.paymentStatus}</span>
        </div>
      </div>

      <div class="verif-meta-list" style="margin-bottom: 20px;">
        <div><span class="meta-field-label">Procuring Buyer</span><div class="meta-field-val">${o.buyerName} (${o.buyerBusiness})</div></div>
        <div><span class="meta-field-label">Fulfilling Supplier</span><div class="meta-field-val">${o.supplierName}</div></div>
        <div><span class="meta-field-label">Escrow Reference</span><div class="meta-field-val">${o.escrowTransactionId || "ESC-GEN-TN"}</div></div>
        <div><span class="meta-field-label">Courier Logistics</span><div class="meta-field-val">${o.courier || "BlueDart"} (${o.trackingNo || "Pending"})</div></div>
      </div>

      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #f8fafc; margin-bottom: 16px;">
        <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Order Line Item</div>
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
          <span><strong>${o.productName}</strong></span>
          <span>${o.quantity} ${o.unit} @ ${store.formatCurrency(o.unitPrice)}</span>
        </div>
      </div>

      <div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 4px;">Administrative Mediation Controls</div>
        <p style="font-size: 0.82rem; color: #64748b; margin: 0; line-height: 1.45;">As platform arbitrator, you have live authority to disburse escrow funds to supplier upon delivery verification, freeze payouts during dispute, or remit refunds to buyer.</p>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.closeAdminModal()">Close</button>
      <button class="btn btn-warning" onclick="window.adminMediateEscrow('${o.id}', 'Escrow On Hold')">Place On Hold</button>
      <button class="btn btn-danger" onclick="window.adminMediateEscrow('${o.id}', 'Refunded to Buyer')">Refund to Buyer</button>
      <button class="btn btn-success" onclick="window.adminMediateEscrow('${o.id}', 'Released to Supplier')">Release to Supplier</button>
    `;

    openModal(`Order Detail & Escrow Mediation: ${o.id}`, bodyHtml, footerHtml);
  };

  window.adminMediateEscrow = function (orderId, targetPaymentStatus) {
    let orderStatus = "In Production";
    if (targetPaymentStatus === "Released to Supplier") {
      orderStatus = "Delivered";
    } else if (targetPaymentStatus === "Refunded to Buyer") {
      orderStatus = "Cancelled";
    }

    store.updateOrderStatus(orderId, orderStatus, targetPaymentStatus, `Escrow arbitrated by Admin: ${targetPaymentStatus}`);
    showToast(`Escrow status updated: '${targetPaymentStatus}'.`);
    closeModal();
    renderOrders();
    renderOverview();
  };

  const orderSearch = document.getElementById("orderSearchInput");
  if (orderSearch) {
    orderSearch.addEventListener("input", function () {
      orderSearchTerm = this.value.trim();
      renderOrders();
    });
  }

  const orderFilterSelect = document.getElementById("orderStatusSelect");
  if (orderFilterSelect) {
    orderFilterSelect.addEventListener("change", function () {
      orderStatusFilter = this.value;
      renderOrders();
    });
  }

  // ==========================================================================
  // 10. MODULE 35: COMPLAINTS & REPORTS
  // ==========================================================================
  let complaintTab = "all";
  let complaintSearchQuery = "";
  let complaintCategoryFilter = "all";
  let complaintSeverityFilter = "all";

  function renderDisputeKpis() {
    const kpiEl = document.getElementById("disputeKpiGrid");
    if (!kpiEl) return;
    const stats = store.calculateAdminStats();
    kpiEl.innerHTML = `
      <div class="kpi-card kpi-primary">
        <div class="kpi-header"><span class="kpi-title">Active Inquiries</span><div class="kpi-icon-wrap">⚖️</div></div>
        <div class="kpi-value">${stats.openComplaints}</div>
        <div class="kpi-footer"><span>Under active arbitration</span></div>
      </div>
      <div class="kpi-card kpi-danger">
        <div class="kpi-header"><span class="kpi-title">High Severity</span><div class="kpi-icon-wrap">🚨</div></div>
        <div class="kpi-value">${stats.highSeverityComplaints || 0}</div>
        <div class="kpi-footer"><span style="color:#ef4444; font-weight:700;">Critical escalation holds</span></div>
      </div>
      <div class="kpi-card kpi-warning">
        <div class="kpi-header"><span class="kpi-title">Disputed Escrow</span><div class="kpi-icon-wrap">🛡️</div></div>
        <div class="kpi-value">${stats.formattedDisputedEscrow || "₹0"}</div>
        <div class="kpi-footer"><span>Protected platform funds</span></div>
      </div>
      <div class="kpi-card kpi-success">
        <div class="kpi-header"><span class="kpi-title">Resolution Rate</span><div class="kpi-icon-wrap">✅</div></div>
        <div class="kpi-value">${stats.complaintResolutionRate || 100}%</div>
        <div class="kpi-footer"><span>Historical mediation closure</span></div>
      </div>
    `;
  }

  function renderComplaints() {
    renderDisputeKpis();
    const adminState = store.getAdminStore();
    const tbody = document.getElementById("complaintsTableBody");
    const countEl = document.getElementById("complaintsTotalCount");
    if (!tbody) return;

    const filtered = adminState.complaints.filter((c) => {
      // Tab pill filter
      if (complaintTab === "open" && !(c.status === "Open" || c.status === "In Review")) return false;
      if (complaintTab === "resolved" && !(c.status === "Resolved" || c.status === "Dismissed")) return false;
      if (complaintTab === "high" && c.severity !== "High") return false;

      // Category filter
      if (complaintCategoryFilter !== "all") {
        const cat = (c.category || "").toLowerCase();
        if (complaintCategoryFilter === "specification" && !cat.includes("specification") && !cat.includes("warranty")) return false;
        if (complaintCategoryFilter === "damage" && !cat.includes("damage") && !cat.includes("moisture")) return false;
        if (complaintCategoryFilter === "delay" && !cat.includes("delay") && !cat.includes("sla") && !cat.includes("dispatch")) return false;
        if (complaintCategoryFilter === "sample" && !cat.includes("sample")) return false;
        if (complaintCategoryFilter === "escrow" && !cat.includes("escrow") && !cat.includes("pricing")) return false;
      }

      // Severity filter
      if (complaintSeverityFilter !== "all") {
        if (c.severity.toLowerCase() !== complaintSeverityFilter.toLowerCase()) return false;
      }

      // Search query
      if (complaintSearchQuery) {
        const q = complaintSearchQuery.toLowerCase();
        const hay = [
          c.id,
          c.complainantName,
          c.complainantBusiness,
          c.reportedPartyName,
          c.subject,
          c.description,
          c.relatedOrderId,
          c.category
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${adminState.complaints.length} tickets`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 36px; color: #64748b;">No disputes match the current filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((c) => {
      const sevClass = `status-${c.severity.toLowerCase()}`;
      const statClass = `status-${c.status.toLowerCase().replace(/[^a-z]/g, "")}`;
      const isResolved = c.status === "Resolved" || c.status === "Dismissed";
      const escrowBadge = isResolved
        ? `<span class="badge-pill" style="font-size:0.7rem; background:#dcfce7; color:#15803d; font-weight:700;">Settled</span>`
        : `<span class="badge-pill" style="font-size:0.7rem; background:#fee2e2; color:#b91c1c; font-weight:700;">Escrow Held</span>`;

      const roleBadge = c.complainantRole === "buyer" 
        ? `<span class="role-badge role-buyer" style="font-size:0.68rem;">Buyer</span>`
        : `<span class="role-badge role-supplier" style="font-size:0.68rem;">Supplier</span>`;

      const counterBadge = c.reportedPartyRole === "supplier"
        ? `<span class="role-badge role-supplier" style="font-size:0.68rem;">Supplier</span>`
        : `<span class="role-badge role-buyer" style="font-size:0.68rem;">Buyer</span>`;

      return `
        <tr>
          <td>
            <strong>${c.id}</strong>
            <div style="font-size: 0.74rem; color: #64748b;">${store.formatDate(c.submissionDate)}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: #0f172a; display:flex; align-items:center; gap:6px;">
              ${c.complainantName} ${roleBadge}
            </div>
            <div style="font-size: 0.76rem; color: #64748b;">${c.complainantBusiness || ""}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: #0f172a; display:flex; align-items:center; gap:6px;">
              ${c.reportedPartyName} ${counterBadge}
            </div>
          </td>
          <td>
            <span class="role-badge role-supplier" style="font-size: 0.74rem; max-width: 170px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${c.category}">
              ${c.category}
            </span>
            <div style="font-size: 0.74rem; color: #475569; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;" title="${c.subject}">
              ${c.subject}
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: #0f172a; font-size: 0.88rem;">${store.formatCurrency(c.disputedAmount || 25000)}</div>
            ${escrowBadge}
          </td>
          <td><span class="status-pill ${sevClass}">${c.severity}</span></td>
          <td><span class="status-pill ${statClass}">${c.status}</span></td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="window.adminInspectComplaint('${c.id}')">Review Case</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  window.adminInspectComplaint = function (complaintId) {
    const adminState = store.getAdminStore();
    const c = adminState.complaints.find((item) => item.id === complaintId);
    if (!c) return;

    const timeline = c.timeline || [];
    const timelineHtml = timeline.length > 0
      ? timeline.map((t) => `
          <div style="display: flex; gap: 12px; margin-bottom: 10px; font-size: 0.82rem;">
            <div style="min-width: 110px; color: #64748b; font-weight: 600;">${t.date}</div>
            <div style="background: #e2e8f0; width: 2px; position: relative;">
              <span style="position: absolute; left: -4px; top: 3px; width: 10px; height: 10px; border-radius: 50%; background: #0f172a;"></span>
            </div>
            <div style="flex: 1; padding-left: 6px;">
              <strong style="color: #0f172a;">${t.actor}:</strong> <span style="color: #334155;">${t.event}</span>
            </div>
          </div>
        `).join("")
      : `<div style="color: #64748b; font-size: 0.82rem;">No timeline events recorded yet.</div>`;

    const bodyHtml = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span class="status-pill status-${c.status.toLowerCase().replace(/[^a-z]/g, "")}">${c.status}</span>
            <span class="status-pill status-${c.severity.toLowerCase()}">Severity: ${c.severity}</span>
            <span style="font-size: 0.78rem; color: #64748b;">Filed ${store.formatDate(c.submissionDate)}</span>
          </div>
          <h3 style="font-size: 1.15rem; color: #0f172a; margin: 0;">Dispute ${c.id}: ${c.subject}</h3>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.74rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Disputed Value</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: #0f172a;">${store.formatCurrency(c.disputedAmount || 25000)}</div>
        </div>
      </div>

      <div class="verif-meta-list" style="margin-bottom: 16px;">
        <div>
          <span class="meta-field-label">Complainant (${(c.complainantRole || "buyer").toUpperCase()})</span>
          <div class="meta-field-val" style="font-weight: 700;">${c.complainantName}</div>
          <div style="font-size: 0.76rem; color: #64748b;">${c.complainantBusiness || ""}</div>
        </div>
        <div>
          <span class="meta-field-label">Respondent (${(c.reportedPartyRole || "supplier").toUpperCase()})</span>
          <div class="meta-field-val" style="font-weight: 700;">${c.reportedPartyName}</div>
        </div>
        <div>
          <span class="meta-field-label">Procurement Reference</span>
          <div class="meta-field-val">${c.relatedOrderId || "Direct Order"}</div>
          <div style="font-size: 0.76rem; color: #64748b;">RFQ: ${c.relatedRfqId || "Standard Contract"}</div>
        </div>
        <div>
          <span class="meta-field-label">Arbitration Category</span>
          <div class="meta-field-val">${c.category}</div>
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Complainant Grievance Statement</div>
        <p style="font-size: 0.86rem; color: #334155; line-height: 1.5; margin: 0;">${c.description}</p>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">Arbitration Activity &amp; Audit Trail</div>
        <div style="max-height: 140px; overflow-y: auto; padding-right: 6px;">
          ${timelineHtml}
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 0.84rem; font-weight: 700; margin-bottom: 6px; color: #0f172a;">
          Mediator Findings &amp; Resolution Order:
        </label>
        <textarea id="modalComplaintNotes" style="width: 100%; height: 70px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.86rem;" placeholder="Record binding resolution terms, escrow distribution, or corrective action...">${c.adminNotes || ""}</textarea>
      </div>

      <div style="background: #f1f5f9; border-radius: 8px; padding: 10px 14px; font-size: 0.8rem; color: #475569;">
        <strong>Escrow Settlement Protocol:</strong> Executing a refund or escrow release automatically synchronizes with the order ledger, modifying escrow state and buyer/supplier account balances.
      </div>
    `;

    const footerHtml = `
      <div style="display: flex; gap: 8px; width: 100%; justify-content: flex-end; flex-wrap: wrap;">
        <button class="btn btn-secondary" onclick="window.closeAdminModal()">Close</button>
        <button class="btn btn-warning" onclick="window.adminSubmitComplaintAction('${c.id}', 'In Review', 'Investigation active; notices served to counterparty.', null)">Set In Review</button>
        <button class="btn btn-danger" onclick="window.adminSubmitComplaintAction('${c.id}', 'Dismissed', 'Claim dismissed as unsubstantiated.', null)">Dismiss</button>
        <button class="btn btn-info" style="background: #8b5cf6; color: white;" onclick="window.adminSubmitComplaintAction('${c.id}', 'Resolved', 'Partial credit voucher settlement agreed.', 'partial_refund')">Partial Credit Note</button>
        <button class="btn btn-primary" onclick="window.adminSubmitComplaintAction('${c.id}', 'Resolved', 'Escrow released to supplier upon specification validation.', 'release_supplier')">Release to Supplier</button>
        <button class="btn btn-success" onclick="window.adminSubmitComplaintAction('${c.id}', 'Resolved', '100% Escrow refunded to buyer account.', 'refund_buyer')">Full Refund to Buyer</button>
      </div>
    `;

    openModal(`Dispute Resolution: ${c.id}`, bodyHtml, footerHtml);
  };

  window.adminSubmitComplaintAction = function (complaintId, status, defaultNotes, orderAction) {
    const notesEl = document.getElementById("modalComplaintNotes");
    const notes = notesEl && notesEl.value.trim() ? notesEl.value.trim() : (defaultNotes || "");
    const settlementAction = defaultNotes || (status === "Resolved" ? "Dispute Resolved by Mediator" : status);

    store.updateComplaintStatus(complaintId, status, notes, settlementAction, orderAction);
    showToast(`Dispute ticket ${complaintId} updated to '${status}'.`);
    closeModal();
    renderComplaints();
    renderOverview();
    if (currentActiveView === "reports") {
      renderReports();
    }
  };

  function openAddDisputeModal() {
    const orders = store.getUnifiedOrders();
    const orderOptions = orders.slice(0, 10).map((o) => `
      <option value="${o.id}">${o.id} - ${o.productName} (₹${Number(o.totalAmount || 0).toLocaleString("en-IN")})</option>
    `).join("");

    const bodyHtml = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Complainant Business / Name *</label>
            <input type="text" id="addDisputeComplainantName" class="search-input" style="width: 100%; border: 1px solid #cbd5e1;" placeholder="e.g. Kaveri Engineering Works" required />
          </div>
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Complainant Role *</label>
            <select id="addDisputeComplainantRole" class="select-filter" style="width: 100%;">
              <option value="buyer">Buyer</option>
              <option value="supplier">Supplier</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Reported Counterparty *</label>
            <input type="text" id="addDisputeReportedParty" class="search-input" style="width: 100%; border: 1px solid #cbd5e1;" placeholder="e.g. PackRight Corp." required />
          </div>
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Dispute Category *</label>
            <select id="addDisputeCategory" class="select-filter" style="width: 100%;">
              <option value="Warranty & Specification Misrepresentation">Warranty &amp; Specification Misrepresentation</option>
              <option value="Transit Moisture Damage">Transit Moisture Damage</option>
              <option value="Late Dispatch Penalty Inquiry">Late Dispatch Penalty Inquiry</option>
              <option value="Unreasonable Sample Evaluation Delay">Unreasonable Sample Evaluation Delay</option>
              <option value="Escrow & Pricing">Escrow &amp; Pricing</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Related Order Reference</label>
            <select id="addDisputeOrderRef" class="select-filter" style="width: 100%;">
              ${orderOptions}
              <option value="ORD-DIRECT">Direct Purchase Order</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Severity Level *</label>
            <select id="addDisputeSeverity" class="select-filter" style="width: 100%;">
              <option value="Medium">Medium Severity</option>
              <option value="High">High Severity</option>
              <option value="Low">Low Severity</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Disputed Escrow (₹) *</label>
            <input type="number" id="addDisputeAmount" class="search-input" style="width: 100%; border: 1px solid #cbd5e1;" placeholder="45000" value="35000" min="100" />
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Dispute Subject / Headline *</label>
          <input type="text" id="addDisputeSubject" class="search-input" style="width: 100%; border: 1px solid #cbd5e1;" placeholder="e.g. Specification mismatch on safety helmet impact rating" required />
        </div>

        <div>
          <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #0f172a;">Detailed Grievance Narrative *</label>
          <textarea id="addDisputeDesc" style="width: 100%; height: 80px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.86rem;" placeholder="Detail the timeline, breach of agreement, delivery defects, or monetary claims..." required></textarea>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.closeAdminModal()">Cancel</button>
      <button class="btn btn-primary" onclick="window.submitAdminAddDispute()">Submit Dispute Ticket</button>
    `;

    openModal("File Formal Dispute Ticket", bodyHtml, footerHtml);
  }

  window.submitAdminAddDispute = function () {
    const compName = document.getElementById("addDisputeComplainantName")?.value.trim();
    const compRole = document.getElementById("addDisputeComplainantRole")?.value || "buyer";
    const repParty = document.getElementById("addDisputeReportedParty")?.value.trim();
    const category = document.getElementById("addDisputeCategory")?.value;
    const orderRef = document.getElementById("addDisputeOrderRef")?.value;
    const severity = document.getElementById("addDisputeSeverity")?.value || "Medium";
    const amount = Number(document.getElementById("addDisputeAmount")?.value) || 25000;
    const subject = document.getElementById("addDisputeSubject")?.value.trim();
    const desc = document.getElementById("addDisputeDesc")?.value.trim();

    if (!compName || !repParty || !subject || !desc) {
      showToast("Please complete all required fields.", "warning");
      return;
    }

    const created = store.addComplaint({
      complainantName: compName,
      complainantBusiness: compName,
      complainantRole: compRole,
      reportedPartyName: repParty,
      reportedPartyRole: compRole === "buyer" ? "supplier" : "buyer",
      category,
      relatedOrderId: orderRef,
      severity,
      disputedAmount: amount,
      subject,
      description: desc,
      status: "Open"
    });

    showToast(`Dispute ticket ${created.id} created successfully.`);
    closeModal();
    renderComplaints();
    renderOverview();
  };

  const btnAddDispute = document.getElementById("btnAdminAddDispute");
  if (btnAddDispute) {
    btnAddDispute.addEventListener("click", openAddDisputeModal);
  }

  const complaintSearchInput = document.getElementById("complaintSearchInput");
  if (complaintSearchInput) {
    complaintSearchInput.addEventListener("input", function () {
      complaintSearchQuery = this.value.trim();
      renderComplaints();
    });
  }

  const complaintCatSelect = document.getElementById("complaintCategorySelect");
  if (complaintCatSelect) {
    complaintCatSelect.addEventListener("change", function () {
      complaintCategoryFilter = this.value;
      renderComplaints();
    });
  }

  const complaintSevSelect = document.getElementById("complaintSeveritySelect");
  if (complaintSevSelect) {
    complaintSevSelect.addEventListener("change", function () {
      complaintSeverityFilter = this.value;
      renderComplaints();
    });
  }

  const complaintTabs = document.querySelectorAll("#complaintTabPills .tab-pill");
  complaintTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      complaintTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      complaintTab = this.getAttribute("data-tab");
      renderComplaints();
    });
  });

  // ==========================================================================
  // 11. MODULE 36: TRUST SCORE MONITORING
  // ==========================================================================
  function renderTrustScores() {
    const adminState = store.getAdminStore();
    const tbody = document.getElementById("trustScoresTableBody");
    if (!tbody) return;

    tbody.innerHTML = adminState.trustScores.map((t) => {
      let scoreClass = "score-fair";
      if (t.trustScore >= 90) scoreClass = "score-elite";
      else if (t.trustScore >= 80) scoreClass = "score-good";
      else if (t.trustScore < 60) scoreClass = "score-risk";

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: #0f172a;">${t.entityName}</div>
            <div style="font-size: 0.76rem; color: #64748b;">${t.role.toUpperCase()} • ${t.category}</div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="score-badge-large ${scoreClass}">${t.trustScore}</span>
              <div>
                <div style="font-weight: 700; font-size: 0.85rem; color: #0f172a;">${t.tier}</div>
                <div style="font-size: 0.72rem; color: #64748b;">Rank Verified</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-size: 0.82rem; font-weight: 700; margin-bottom: 4px;">${t.fulfillmentRate}%</div>
            <div class="progress-track" style="width: 100px;"><div class="progress-fill" style="width: ${t.fulfillmentRate}%; background: #10b981;"></div></div>
          </td>
          <td>
            <div style="font-size: 0.82rem; font-weight: 700; margin-bottom: 4px;">${t.onTimeDelivery}%</div>
            <div class="progress-track" style="width: 100px;"><div class="progress-fill" style="width: ${t.onTimeDelivery}%; background: #3b82f6;"></div></div>
          </td>
          <td><span class="status-pill ${t.disputeRatio < 1 ? "status-approved" : "status-pending"}">${t.disputeRatio}%</span></td>
          <td>⭐ <strong>${t.buyerRating}</strong> / 5.0</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="window.adminInspectTrustScore('${t.entityId}')">Breakdown</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  window.adminInspectTrustScore = function (entityId) {
    const adminState = store.getAdminStore();
    const t = adminState.trustScores.find((item) => item.entityId === entityId);
    if (!t) return;

    const b = t.breakdown || { identityVerification: 25, operationalReliability: 30, buyerSatisfaction: 18, complianceFinancials: 16 };

    const bodyHtml = `
      <div class="demo-disclaimer-banner" style="margin-bottom: 16px;">
        <span class="disclaimer-icon">ℹ️</span>
        <div class="disclaimer-text">
          <strong>Demonstration Data:</strong> Trust Scores displayed are mock illustrative algorithms for workflow testing. They do not constitute certified credit or third-party credit bureau ratings.
        </div>
      </div>

      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
        <span class="score-badge-large ${t.trustScore >= 90 ? "score-elite" : "score-good"}" style="width: 60px; height: 60px; font-size: 1.5rem;">${t.trustScore}</span>
        <div>
          <h3 style="font-size: 1.25rem; color: #0f172a;">${t.entityName}</h3>
          <p style="color: #64748b; font-size: 0.88rem;">Tier: <strong>${t.tier}</strong> • Avg Response Time: <strong>${t.responseTime}</strong></p>
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            ${(t.badges || []).map((b) => `<span class="badge-pill" style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:0.75rem;">${b}</span>`).join("")}
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
            <span>Identity & Legal Verification</span>
            <span>${b.identityVerification} / 25 pts</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width: ${(b.identityVerification / 25) * 100}%; background: #10b981;"></div></div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
            <span>Operational & Fulfillment Reliability</span>
            <span>${b.operationalReliability} / 35 pts</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width: ${(b.operationalReliability / 35) * 100}%; background: #3b82f6;"></div></div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
            <span>Buyer Feedback & Rating Sentiment</span>
            <span>${b.buyerSatisfaction} / 20 pts</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width: ${(b.buyerSatisfaction / 20) * 100}%; background: #d87543;"></div></div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
            <span>Financial & Tax Compliance</span>
            <span>${b.complianceFinancials} / 20 pts</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width: ${(b.complianceFinancials / 20) * 100}%; background: #8b5cf6;"></div></div>
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 0.85rem; color: #475569;">
        <strong>Marketplace Feedback Sample:</strong> "${t.recentFeedback}"
      </div>
    `;

    const footerHtml = `<button class="btn btn-secondary" onclick="window.closeAdminModal()">Close</button>`;
    openModal(`TrustScore Audit: ${t.entityName}`, bodyHtml, footerHtml);
  };

  // ==========================================================================
  // 12. MODULE 37: REPORTS & ANALYTICS
  // ==========================================================================
  let reportDateRange = "30days";
  let reportAuditTab = "financial";

  const dateRangeConfig = {
    "30days": { factor: 1.0, label: "Last 30 Days (MTD)", userDelta: 18, orderDelta: 0 },
    "quarter": { factor: 2.6, label: "Current Quarter (Q3 2026)", userDelta: 47, orderDelta: 14 },
    "90days": { factor: 3.4, label: "Last 90 Days", userDelta: 62, orderDelta: 22 },
    "ytd": { factor: 5.2, label: "Year-to-Date (FY 26-27)", userDelta: 115, orderDelta: 38 }
  };

  function renderReports() {
    const stats = store.calculateAdminStats();
    const metricsGrid = document.getElementById("reportsMetricsGrid");
    const cfg = dateRangeConfig[reportDateRange] || dateRangeConfig["30days"];

    const scaledGMV = Math.round(stats.totalGMV * cfg.factor);
    const scaledOrders = Math.round(stats.totalOrders * cfg.factor) + cfg.orderDelta;
    const formattedScaledGMV = scaledGMV >= 10000000 
      ? `₹${(scaledGMV / 10000000).toFixed(2)} Cr`
      : scaledGMV >= 100000 
      ? `₹${(scaledGMV / 100000).toFixed(2)} Lakhs` 
      : store.formatCurrency(scaledGMV);

    if (metricsGrid) {
      metricsGrid.innerHTML = `
        <div class="kpi-card kpi-primary">
          <div class="kpi-header"><span class="kpi-title">User Growth Index</span><div class="kpi-icon-wrap">👥</div></div>
          <div class="kpi-value">${stats.totalUsers}</div>
          <div class="kpi-footer"><span>+${cfg.userDelta} onboarded in ${cfg.label}</span></div>
        </div>
        <div class="kpi-card kpi-success">
          <div class="kpi-header"><span class="kpi-title">Procurement GMV</span><div class="kpi-icon-wrap">📈</div></div>
          <div class="kpi-value">${formattedScaledGMV}</div>
          <div class="kpi-footer"><span>${scaledOrders} orders settled across network</span></div>
        </div>
        <div class="kpi-card kpi-info">
          <div class="kpi-header"><span class="kpi-title">On-Time Dispatch SLA</span><div class="kpi-icon-wrap">🚚</div></div>
          <div class="kpi-value">97.6%</div>
          <div class="kpi-footer"><span>Avg 3.2 days transit delivery</span></div>
        </div>
        <div class="kpi-card kpi-purple">
          <div class="kpi-header"><span class="kpi-title">Arbitration Turnaround</span><div class="kpi-icon-wrap">⏱️</div></div>
          <div class="kpi-value">22.8h</div>
          <div class="kpi-footer"><span>${stats.complaintResolutionRate || 100}% dispute resolution closure</span></div>
        </div>
      `;
    }

    renderCategoryVolumeBarChart();
    renderDisputeAnalyticsChart();
    renderReportsAuditTable();
  }

  function renderCategoryVolumeBarChart() {
    const barEl = document.getElementById("reportsCategoryBarChart");
    if (!barEl) return;

    const cfg = dateRangeConfig[reportDateRange] || dateRangeConfig["30days"];
    const orders = store.getUnifiedOrders();
    const catMap = {
      "Industrial Equipment": 0,
      "Electrical & Electronics": 0,
      "Packaging & Freight": 0,
      "Office Supplies": 0
    };

    orders.forEach((o) => {
      const pName = (o.productName || "").toLowerCase();
      const amt = Number(o.totalAmount) || 0;
      if (pName.includes("safety") || pName.includes("jack") || pName.includes("industrial") || pName.includes("glove")) {
        catMap["Industrial Equipment"] += amt;
      } else if (pName.includes("led") || pName.includes("light") || pName.includes("electric") || pName.includes("panel")) {
        catMap["Electrical & Electronics"] += amt;
      } else if (pName.includes("box") || pName.includes("carton") || pName.includes("pack") || pName.includes("shipping")) {
        catMap["Packaging & Freight"] += amt;
      } else if (pName.includes("paper") || pName.includes("office") || pName.includes("copy")) {
        catMap["Office Supplies"] += amt;
      } else {
        catMap["Industrial Equipment"] += amt;
      }
    });

    const entries = [
      { name: "Industrial Equipment", val: Math.round((catMap["Industrial Equipment"] || 4250000) * cfg.factor), color: "#0f172a" },
      { name: "Electrical & Solar", val: Math.round((catMap["Electrical & Electronics"] || 3120000) * cfg.factor), color: "#d87543" },
      { name: "Machinery & Tools", val: Math.round(((catMap["Industrial Equipment"] || 4250000) * 0.65) * cfg.factor), color: "#8b5cf6" },
      { name: "Packaging Materials", val: Math.round((catMap["Packaging & Freight"] || 1640000) * cfg.factor), color: "#10b981" }
    ];

    const maxVal = Math.max(...entries.map((e) => e.val), 100000);
    const maxBarWidth = 430;

    barEl.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 650 200" preserveAspectRatio="none">
        <!-- Grid lines -->
        <line x1="150" y1="20" x2="620" y2="20" stroke="#f1f5f9" stroke-width="1" />
        <line x1="150" y1="65" x2="620" y2="65" stroke="#f1f5f9" stroke-width="1" />
        <line x1="150" y1="110" x2="620" y2="110" stroke="#f1f5f9" stroke-width="1" />
        <line x1="150" y1="155" x2="620" y2="155" stroke="#f1f5f9" stroke-width="1" />

        ${entries.map((e, idx) => {
          const yText = 38 + idx * 45;
          const yRect = 24 + idx * 45;
          const barWidth = Math.max(25, Math.round((e.val / maxVal) * maxBarWidth));
          const displayStr = e.val >= 10000000 
            ? `₹${(e.val / 10000000).toFixed(2)} Cr`
            : e.val >= 100000 
            ? `₹${(e.val / 100000).toFixed(1)} Lakhs` 
            : store.formatCurrency(e.val);
          return `
            <text x="140" y="${yText}" font-size="11" fill="#475569" font-weight="600" text-anchor="end">${e.name}</text>
            <rect x="150" y="${yRect}" width="${barWidth}" height="20" rx="4" fill="${e.color}" />
            <text x="${150 + barWidth + 10}" y="${yText}" font-size="11" fill="${e.color}" font-weight="700">${displayStr}</text>
          `;
        }).join("")}
      </svg>
    `;
  }

  function renderDisputeAnalyticsChart() {
    const chartEl = document.getElementById("reportsDisputeAnalyticsChart");
    if (!chartEl) return;
    const adminState = store.getAdminStore();
    const complaints = adminState.complaints || [];

    let refunds = 0;
    let released = 0;
    let credits = 0;
    let active = 0;

    complaints.forEach((c) => {
      const act = (c.settlementAction || "").toLowerCase();
      const st = (c.status || "").toLowerCase();
      if (act.includes("refund") || act.includes("buyer")) {
        refunds++;
      } else if (act.includes("release") || act.includes("supplier")) {
        released++;
      } else if (act.includes("credit") || act.includes("partial") || act.includes("addendum")) {
        credits++;
      } else if (st === "open" || st === "in review") {
        active++;
      } else {
        refunds++;
      }
    });

    const slices = [
      { label: "Refunded to Buyer", count: Math.max(1, refunds), color: "#ef4444" },
      { label: "Released to Supplier", count: Math.max(1, released), color: "#10b981" },
      { label: "Credit Note / Addendum", count: Math.max(1, credits), color: "#f59e0b" },
      { label: "Active Arbitration", count: Math.max(1, active), color: "#3b82f6" }
    ];

    const sliceTotal = slices.reduce((s, x) => s + x.count, 0);

    let currentAngle = 0;
    const center = 75;
    const radius = 55;
    const strokeWidth = 22;
    const circumference = 2 * Math.PI * radius;

    const circles = slices.map((s) => {
      const pct = s.count / sliceTotal;
      const strokeDash = pct * circumference;
      const strokeDashoffset = -currentAngle * circumference;
      currentAngle += pct;
      return `
        <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${s.color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDash} ${circumference - strokeDash}"
          stroke-dashoffset="${strokeDashoffset}"
          style="transition: all 0.4s ease;" />
      `;
    }).join("");

    chartEl.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-around; gap: 16px; flex-wrap: wrap;">
        <div style="position: relative; width: 150px; height: 150px;">
          <svg width="150" height="150" viewBox="0 0 150 150" style="transform: rotate(-90deg);">
            ${circles}
          </svg>
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
            <span style="font-size: 1.35rem; font-weight: 800; color: #0f172a;">${complaints.length}</span>
            <span style="font-size: 0.68rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Disputes</span>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; min-width: 190px;">
          ${slices.map((s) => {
            const pctStr = Math.round((s.count / sliceTotal) * 100);
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: ${s.color};"></span>
                  <span style="color: #334155; font-weight: 600;">${s.label}</span>
                </div>
                <span style="font-weight: 700; color: #0f172a;">${s.count} (${pctStr}%)</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function renderReportsAuditTable() {
    const wrap = document.getElementById("reportsAuditTableWrap");
    if (!wrap) return;

    if (reportAuditTab === "financial") {
      const orders = store.getUnifiedOrders();
      wrap.innerHTML = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order ID &amp; Date</th>
              <th>Buyer Enterprise</th>
              <th>Supplier Partner</th>
              <th>Order GMV</th>
              <th>Platform Take Rate (2%)</th>
              <th>Net Escrow / Disbursed</th>
              <th>Settlement State</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map((o) => {
              const amt = Number(o.totalAmount) || 0;
              const fee = Math.round(amt * 0.02);
              const net = amt - fee;
              const isDelivered = o.orderStatus === "Delivered";
              const isCancelled = o.orderStatus === "Cancelled";
              const statusPill = isDelivered
                ? `<span class="status-pill status-approved">Disbursed to Supplier</span>`
                : isCancelled
                ? `<span class="status-pill status-rejected">Refunded to Buyer</span>`
                : `<span class="status-pill status-pending">Held in Escrow</span>`;

              return `
                <tr>
                  <td><strong>${o.id}</strong><div style="font-size:0.74rem; color:#64748b;">${store.formatDate(o.createdAt)}</div></td>
                  <td><div style="font-weight:700; color:#0f172a;">${o.buyerName}</div></td>
                  <td><div style="font-weight:700; color:#0f172a;">${o.supplierName}</div></td>
                  <td><strong style="color:#0f172a;">${store.formatCurrency(amt)}</strong></td>
                  <td style="color:#64748b; font-weight:600;">${store.formatCurrency(fee)}</td>
                  <td style="color:#10b981; font-weight:700;">${store.formatCurrency(net)}</td>
                  <td>${statusPill}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      `;
    } else if (reportAuditTab === "disputes") {
      const complaints = store.getAdminStore().complaints || [];
      wrap.innerHTML = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Ticket Ref</th>
              <th>Disputing Parties</th>
              <th>Category</th>
              <th>Disputed Value</th>
              <th>Status</th>
              <th>Settlement Terms &amp; Mediator Ruling</th>
              <th>Filing Date</th>
            </tr>
          </thead>
          <tbody>
            ${complaints.map((c) => {
              const statClass = `status-${c.status.toLowerCase().replace(/[^a-z]/g, "")}`;
              return `
                <tr>
                  <td><strong>${c.id}</strong></td>
                  <td>
                    <div style="font-weight:700; color:#0f172a;">${c.complainantName} (${c.complainantRole || "buyer"})</div>
                    <div style="font-size:0.74rem; color:#64748b;">vs. ${c.reportedPartyName} (${c.reportedPartyRole || "supplier"})</div>
                  </td>
                  <td><span class="role-badge role-supplier">${c.category}</span></td>
                  <td><strong>${store.formatCurrency(c.disputedAmount || 25000)}</strong></td>
                  <td><span class="status-pill ${statClass}">${c.status}</span></td>
                  <td>
                    <div style="font-weight:600; color:#334155; font-size:0.82rem;">${c.settlementAction || "Under Mediation"}</div>
                    <div style="font-size:0.74rem; color:#64748b; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.adminNotes || "Pending mediator review"}</div>
                  </td>
                  <td style="font-size:0.8rem; color:#64748b;">${store.formatDate(c.submissionDate)}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      `;
    } else if (reportAuditTab === "logistics") {
      const orders = store.getUnifiedOrders();
      const carriers = ["BlueDart Surface Express", "Delhivery Heavy Cargo B2B", "V-Trans Integrated Logistics", "Gati-KWE Logistics"];
      wrap.innerHTML = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Waybill Docket</th>
              <th>Order Ref &amp; Buyer</th>
              <th>Logistics Carrier</th>
              <th>Dispatch Date</th>
              <th>Delivery SLA Target</th>
              <th>Transit Status</th>
              <th>SLA Performance</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map((o, idx) => {
              const carrier = carriers[idx % carriers.length];
              const waybill = `TN-EXP-${88000 + idx * 137}`;
              const isDelivered = o.orderStatus === "Delivered";
              const isShipped = o.orderStatus === "Shipped";
              const transitStatus = isDelivered
                ? `<span class="status-pill status-approved">Delivered &amp; Gate-Signed</span>`
                : isShipped
                ? `<span class="status-pill status-pending">In Interstate Transit</span>`
                : `<span class="status-pill status-warning">Awaiting Warehouse Pickup</span>`;

              const slaBadge = isDelivered
                ? `<span style="font-weight:700; color:#10b981; font-size:0.82rem;">✓ Met (100%)</span>`
                : `<span style="font-weight:700; color:#3b82f6; font-size:0.82rem;">⏱️ On Track</span>`;

              return `
                <tr>
                  <td><strong>${waybill}</strong></td>
                  <td>
                    <div style="font-weight:700; color:#0f172a;">${o.id}</div>
                    <div style="font-size:0.76rem; color:#64748b;">${o.buyerName}</div>
                  </td>
                  <td><div style="font-weight:600; color:#0f172a;">${carrier}</div></td>
                  <td style="font-size:0.82rem; color:#64748b;">${store.formatDate(o.createdAt)}</td>
                  <td style="font-size:0.82rem; color:#475569; font-weight:600;">${store.formatDate(o.createdAt)} + 4 days</td>
                  <td>${transitStatus}</td>
                  <td>${slaBadge}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      `;
    }
  }

  // Reports Date Range Selector & Audit Tab Listeners
  const reportDateRangeSelect = document.getElementById("reportDateRangeSelect");
  if (reportDateRangeSelect) {
    reportDateRangeSelect.addEventListener("change", function () {
      reportDateRange = this.value;
      renderReports();
      const cfg = dateRangeConfig[reportDateRange] || dateRangeConfig["30days"];
      showToast(`Reports updated for: ${cfg.label}`);
    });
  }

  const reportAuditTabs = document.querySelectorAll("#reportAuditTabPills .tab-pill");
  reportAuditTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      reportAuditTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      reportAuditTab = this.getAttribute("data-report-tab");
      renderReportsAuditTable();
    });
  });

  // Export handlers
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", function () {
      const orders = store.getUnifiedOrders();
      let csvContent = "data:text/csv;charset=utf-8,Order ID,Date,Buyer,Supplier,Product,Quantity,Unit Price,Total Amount,Status,Payment Status\n";

      orders.forEach((o) => {
        const row = [
          o.id,
          o.createdAt,
          `"${o.buyerName}"`,
          `"${o.supplierName}"`,
          `"${o.productName}"`,
          o.quantity,
          o.unitPrice,
          o.totalAmount,
          o.orderStatus,
          o.paymentStatus
        ].join(",");
        csvContent += row + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `tradenest_analytics_report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("CSV analytics report generated and downloaded.");
    });
  }

  const exportJsonBtn = document.getElementById("exportJsonBtn");
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener("click", function () {
      const reportData = {
        exportedAt: new Date().toISOString(),
        platform: "TradeNest B2B Marketplace",
        stats: store.calculateAdminStats(),
        verifications: store.getAdminStore().verifications,
        riskSummary: store.getAdminStore().riskRecords,
        complaints: store.getAdminStore().complaints,
        trustScores: store.getAdminStore().trustScores
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
      const dlAnchor = document.createElement("a");
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", `tradenest_governance_report_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
      showToast("JSON governance audit export generated and downloaded.");
    });
  }

  const printReportBtn = document.getElementById("printReportBtn");
  if (printReportBtn) {
    printReportBtn.addEventListener("click", function () {
      window.print();
    });
  }

  // Reset local demonstration data button
  const resetDemoBtn = document.getElementById("resetAdminDemoBtn");
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener("click", function () {
      if (confirm("Reset administrative demonstration data to factory defaults?")) {
        store.resetAdminStore();
        initAdminIdentity();
        showToast("Demonstration data reset to initial state.");
        switchView(currentActiveView);
      }
    });
  }

  // Subscribe to store updates for live reactivity
  store.subscribe(() => {
    updateGlobalBadges();
  });

  // Cross-Tab and Cross-Store Real-time Synchronization
  const trackedSyncKeys = [
    "tradenest_demo_store_v1",
    "tradenest_shared_products_v2",
    "tradenest_supplier_products",
    "tradenest_supplier_orders",
    "tradenestUsers",
    "tradenestCurrentUser",
    "tradenest_admin_store_v1"
  ];

  window.addEventListener("storage", function (event) {
    if (trackedSyncKeys.includes(event.key)) {
      initAdminIdentity();
      updateGlobalBadges();
      switchView(currentActiveView);
    }
  });

  // Custom event listener for product moderation updates
  window.addEventListener("tradenest:product-moderated", function () {
    updateGlobalBadges();
    switchView(currentActiveView);
  });

  // Initialize Admin Identity & Session from tradenestCurrentUser
  initAdminIdentity();

  // Initialize view from URL hash on load
  const initialHash = window.location.hash.replace("#", "") || "overview";
  switchView(initialHash);
});
