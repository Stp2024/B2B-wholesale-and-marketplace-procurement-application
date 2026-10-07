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
  if (!window.AdminStore) {
    console.error("AdminStore is missing! Ensure admin-store.js is loaded first.");
    return;
  }

  const store = window.AdminStore;

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

  // Mobile menu toggle
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });
  }

  // Admin global back button handler
  const adminGlobalBackBtn = document.getElementById("adminGlobalBackBtn");
  if (adminGlobalBackBtn) {
    adminGlobalBackBtn.addEventListener("click", function () {
      const currentHash = window.location.hash.replace("#", "") || "overview";
      if (currentHash !== "overview") {
        // Return to overview if inside any subview
        switchView("overview");
      } else if (window.history.length > 1 && document.referrer && !document.referrer.endsWith("/dashboard.html")) {
        window.history.back();
      } else {
        window.location.href = "../../index.html";
      }
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

    // Monthly GMV Demonstration Vector Chart
    chartEl.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 650 220" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gmvAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#d87543" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#d87543" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <!-- Horizontal Grid Lines -->
        <line x1="40" y1="30" x2="630" y2="30" stroke="#f1f5f9" stroke-width="1" />
        <line x1="40" y1="80" x2="630" y2="80" stroke="#f1f5f9" stroke-width="1" />
        <line x1="40" y1="130" x2="630" y2="130" stroke="#f1f5f9" stroke-width="1" />
        <line x1="40" y1="180" x2="630" y2="180" stroke="#e2e8f0" stroke-width="1" />

        <!-- Area Fill -->
        <polygon points="50,180 50,150 150,130 250,95 350,110 450,60 550,45 620,35 620,180" fill="url(#gmvAreaGrad)" />

        <!-- Line Path -->
        <polyline points="50,150 150,130 250,95 350,110 450,60 550,45 620,35" fill="none" stroke="#d87543" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Data Point Nodes -->
        <circle cx="50" cy="150" r="4.5" fill="#ffffff" stroke="#d87543" stroke-width="3" />
        <circle cx="150" cy="130" r="4.5" fill="#ffffff" stroke="#d87543" stroke-width="3" />
        <circle cx="250" cy="95" r="4.5" fill="#ffffff" stroke="#d87543" stroke-width="3" />
        <circle cx="350" cy="110" r="4.5" fill="#ffffff" stroke="#d87543" stroke-width="3" />
        <circle cx="450" cy="60" r="4.5" fill="#ffffff" stroke="#d87543" stroke-width="3" />
        <circle cx="550" cy="45" r="4.5" fill="#ffffff" stroke="#d87543" stroke-width="3" />
        <circle cx="620" cy="35" r="5" fill="#d87543" stroke="#ffffff" stroke-width="2" />

        <!-- Axis Labels -->
        <text x="50" y="202" font-size="11" fill="#94a3b8" text-anchor="middle">May</text>
        <text x="150" y="202" font-size="11" fill="#94a3b8" text-anchor="middle">Jun</text>
        <text x="250" y="202" font-size="11" fill="#94a3b8" text-anchor="middle">Jul</text>
        <text x="350" y="202" font-size="11" fill="#94a3b8" text-anchor="middle">Aug</text>
        <text x="450" y="202" font-size="11" fill="#94a3b8" text-anchor="middle">Sep</text>
        <text x="550" y="202" font-size="11" fill="#94a3b8" text-anchor="middle">Oct (MTD)</text>
        <text x="620" y="202" font-size="11" fill="#d87543" font-weight="700" text-anchor="middle">Proj</text>

        <!-- Y Axis Markers -->
        <text x="32" y="34" font-size="10" fill="#94a3b8" text-anchor="end">₹15L</text>
        <text x="32" y="84" font-size="10" fill="#94a3b8" text-anchor="end">₹10L</text>
        <text x="32" y="134" font-size="10" fill="#94a3b8" text-anchor="end">₹5L</text>
        <text x="32" y="184" font-size="10" fill="#94a3b8" text-anchor="end">₹0</text>
      </svg>
    `;
  }

  function renderOverviewCategoryDonut() {
    const donutEl = document.getElementById("overviewCategoryDonut");
    if (!donutEl) return;

    donutEl.innerHTML = `
      <div class="donut-wrap">
        <svg width="190" height="190" viewBox="0 0 100 100">
          <!-- Industrial 35% -->
          <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0f172a" stroke-width="14" stroke-dasharray="83.5 155" stroke-dashoffset="0" />
          <!-- Electrical 25% -->
          <circle cx="50" cy="50" r="38" fill="transparent" stroke="#d87543" stroke-width="14" stroke-dasharray="59.6 179" stroke-dashoffset="-83.5" />
          <!-- Packaging 20% -->
          <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" stroke-width="14" stroke-dasharray="47.7 191" stroke-dashoffset="-143.1" />
          <!-- Office Supplies 20% -->
          <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" stroke-width="14" stroke-dasharray="47.7 191" stroke-dashoffset="-190.8" />
        </svg>
        <div class="donut-center-label">
          <div class="donut-big-val">4</div>
          <div class="donut-sub-text">Top Sectors</div>
        </div>
      </div>
      <div class="chart-legend">
        <div class="legend-item"><div class="legend-color" style="background:#0f172a;"></div>Industrial (35%)</div>
        <div class="legend-item"><div class="legend-color" style="background:#d87543;"></div>Electrical (25%)</div>
        <div class="legend-item"><div class="legend-color" style="background:#10b981;"></div>Packaging (20%)</div>
        <div class="legend-item"><div class="legend-color" style="background:#3b82f6;"></div>Office (20%)</div>
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
          <h3 style="font-size: 1.25rem; color: #0f172a;">Order: ${o.id}</h3>
          <p style="color: #64748b; font-size: 0.88rem;">Created ${store.formatDate(o.createdAt)}</p>
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
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.closeAdminModal()">Close</button>
      <button class="btn btn-primary" onclick="showToast('Order manifest downloaded.'); window.closeAdminModal();">Print Manifest</button>
    `;

    openModal(`Order Detail: ${o.id}`, bodyHtml, footerHtml);
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

  function renderComplaints() {
    const adminState = store.getAdminStore();
    const tbody = document.getElementById("complaintsTableBody");
    if (!tbody) return;

    const filtered = adminState.complaints.filter((c) => {
      if (complaintTab === "all") return true;
      if (complaintTab === "open") return c.status === "Open" || c.status === "In Review";
      if (complaintTab === "resolved") return c.status === "Resolved";
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: #64748b;">No complaints in this queue.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((c) => {
      const sevClass = `status-${c.severity.toLowerCase()}`;
      const statClass = `status-${c.status.toLowerCase().replace(/[^a-z]/g, "")}`;

      return `
        <tr>
          <td><strong>${c.id}</strong><div style="font-size: 0.76rem; color: #64748b;">${store.formatDate(c.submissionDate)}</div></td>
          <td>
            <div style="font-weight: 700; color: #0f172a;">${c.complainantName}</div>
            <div style="font-size: 0.76rem; color: #64748b;">${c.complainantBusiness}</div>
          </td>
          <td><div style="font-weight: 700; color: #0f172a;">${c.reportedPartyName}</div></td>
          <td><span class="role-badge role-supplier">${c.category}</span></td>
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

    const bodyHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <div>
          <h3 style="font-size: 1.15rem; color: #0f172a;">Dispute ${c.id}: ${c.subject}</h3>
          <p style="color: #64748b; font-size: 0.85rem;">Related Reference: <strong>${c.relatedOrderId || "Standard RFQ"}</strong></p>
        </div>
        <span class="status-pill status-${c.severity.toLowerCase()}">Severity: ${c.severity}</span>
      </div>

      <div class="verif-meta-list" style="margin-bottom: 16px;">
        <div><span class="meta-field-label">Complainant</span><div class="meta-field-val">${c.complainantName} (${c.complainantRole})</div></div>
        <div><span class="meta-field-label">Reported Party</span><div class="meta-field-val">${c.reportedPartyName} (${c.reportedPartyRole})</div></div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Complainant Narrative</div>
        <p style="font-size: 0.86rem; color: #334155; line-height: 1.5;">${c.description}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 0.84rem; font-weight: 700; margin-bottom: 6px; color: #0f172a;">Mediator Resolution Notes:</label>
        <textarea id="modalComplaintNotes" style="width: 100%; height: 75px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.86rem;" placeholder="Record dispute findings and settlement terms...">${c.adminNotes || ""}</textarea>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.closeAdminModal()">Close</button>
      <button class="btn btn-warning" onclick="window.adminSubmitComplaintAction('${c.id}', 'In Review')">Mark In Review</button>
      <button class="btn btn-danger" onclick="window.adminSubmitComplaintAction('${c.id}', 'Dismissed')">Dismiss Complaint</button>
      <button class="btn btn-success" onclick="window.adminSubmitComplaintAction('${c.id}', 'Resolved')">Resolve Dispute</button>
    `;

    openModal(`Dispute Resolution: ${c.id}`, bodyHtml, footerHtml);
  };

  window.adminSubmitComplaintAction = function (complaintId, status) {
    const notesEl = document.getElementById("modalComplaintNotes");
    const notes = notesEl ? notesEl.value.trim() : "";
    store.updateComplaintStatus(complaintId, status, notes);
    showToast(`Dispute ticket set to '${status}'.`);
    closeModal();
    renderComplaints();
    renderOverview();
  };

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
  let reportCategoryFilter = "all";

  function renderReports() {
    const stats = store.calculateAdminStats();
    const metricsGrid = document.getElementById("reportsMetricsGrid");
    if (!metricsGrid) return;

    metricsGrid.innerHTML = `
      <div class="kpi-card kpi-primary">
        <div class="kpi-header"><span class="kpi-title">User Growth Index</span><div class="kpi-icon-wrap">👥</div></div>
        <div class="kpi-value">${stats.totalUsers}</div>
        <div class="kpi-footer"><span>${stats.totalBuyers} Buyers • ${stats.totalSuppliers} Suppliers</span></div>
      </div>
      <div class="kpi-card kpi-success">
        <div class="kpi-header"><span class="kpi-title">RFQ Fulfillment Ratio</span><div class="kpi-icon-wrap">📈</div></div>
        <div class="kpi-value">84.2%</div>
        <div class="kpi-footer"><span>Avg 3.8 quotes per RFQ</span></div>
      </div>
      <div class="kpi-card kpi-info">
        <div class="kpi-header"><span class="kpi-title">On-Time Dispatch SLA</span><div class="kpi-icon-wrap">🚚</div></div>
        <div class="kpi-value">96.8%</div>
        <div class="kpi-footer"><span>Logistics compliance</span></div>
      </div>
      <div class="kpi-card kpi-purple">
        <div class="kpi-header"><span class="kpi-title">Verification Turnaround</span><div class="kpi-icon-wrap">⏱️</div></div>
        <div class="kpi-value">18.4h</div>
        <div class="kpi-footer"><span>Avg document clearance</span></div>
      </div>
    `;

    renderCategoryVolumeBarChart();
  }

  function renderCategoryVolumeBarChart() {
    const barEl = document.getElementById("reportsCategoryBarChart");
    if (!barEl) return;

    barEl.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 650 200" preserveAspectRatio="none">
        <!-- Grid lines -->
        <line x1="120" y1="20" x2="620" y2="20" stroke="#f1f5f9" stroke-width="1" />
        <line x1="120" y1="65" x2="620" y2="65" stroke="#f1f5f9" stroke-width="1" />
        <line x1="120" y1="110" x2="620" y2="110" stroke="#f1f5f9" stroke-width="1" />
        <line x1="120" y1="155" x2="620" y2="155" stroke="#f1f5f9" stroke-width="1" />

        <!-- Bars -->
        <text x="110" y="38" font-size="12" fill="#475569" font-weight="600" text-anchor="end">Industrial</text>
        <rect x="120" y="24" width="450" height="20" rx="4" fill="#0f172a" />
        <text x="580" y="38" font-size="11" fill="#0f172a" font-weight="700">₹42.5L</text>

        <text x="110" y="83" font-size="12" fill="#475569" font-weight="600" text-anchor="end">Electrical</text>
        <rect x="120" y="69" width="340" height="20" rx="4" fill="#d87543" />
        <text x="470" y="83" font-size="11" fill="#d87543" font-weight="700">₹31.2L</text>

        <text x="110" y="128" font-size="12" fill="#475569" font-weight="600" text-anchor="end">Machinery</text>
        <rect x="120" y="114" width="280" height="20" rx="4" fill="#8b5cf6" />
        <text x="410" y="128" font-size="11" fill="#8b5cf6" font-weight="700">₹25.8L</text>

        <text x="110" y="173" font-size="12" fill="#475569" font-weight="600" text-anchor="end">Packaging</text>
        <rect x="120" y="159" width="190" height="20" rx="4" fill="#10b981" />
        <text x="320" y="173" font-size="11" fill="#10b981" font-weight="700">₹16.4L</text>
      </svg>
    `;
  }

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
        showToast("Demonstration data reset to initial state.");
        switchView(currentActiveView);
      }
    });
  }

  // Subscribe to store updates for live reactivity
  store.subscribe(() => {
    updateGlobalBadges();
  });

  // Initialize view from URL hash on load
  const initialHash = window.location.hash.replace("#", "") || "overview";
  switchView(initialHash);
});
