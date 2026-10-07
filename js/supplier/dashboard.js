/**
 * TradeNest Supplier Workspace Dashboard JavaScript
 * File: js/supplier/dashboard.js
 *
 * Implements full operational logic, reactivity, interactive modals,
 * and view routing for MODULES 15 to 28.
 */

"use strict";

document.addEventListener("DOMContentLoaded", function () {
    // Check for SupplierStore
    if (!window.SupplierStore) {
        console.error("SupplierStore is not loaded!");
        return;
    }

    const store = window.SupplierStore;

    // ==========================================================================
    // 1. DOM REFERENCES
    // ==========================================================================

    // Navigation & Layout
    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menuToggle");
    const currentSectionTitle = document.getElementById("currentSectionTitle");
    const navLinks = document.querySelectorAll(".sidebar .nav-link[data-view]");
    const moduleViews = document.querySelectorAll(".module-view");
    const navbarSearch = document.getElementById("navbarSearch");
    const globalNotificationBadge = document.getElementById("globalNotificationBadge");

    // Profile Elements in Topbar
    const profileAvatar = document.getElementById("profileAvatar");
    const profileName = document.getElementById("profileName");
    const profileMenu = document.getElementById("profileMenu");
    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");
    const dropdownAvatar = document.getElementById("dropdownAvatar");
    const dropdownName = document.getElementById("dropdownName");
    const dropdownEmail = document.getElementById("dropdownEmail");
    const profileCompany = document.getElementById("profileCompany");
    const profileGstin = document.getElementById("profileGstin");
    const welcomeUserName = document.getElementById("welcomeUserName");

    // Logout
    const sidebarLogoutButton = document.getElementById("sidebarLogoutButton");
    const dropdownLogout = document.getElementById("dropdownLogout");

    // Modals
    const productModal = document.getElementById("productModal");
    const stockModal = document.getElementById("stockModal");
    const rfqModal = document.getElementById("rfqModal");
    const quoteModal = document.getElementById("quoteModal");
    const sampleDispatchModal = document.getElementById("sampleDispatchModal");
    const collabModal = document.getElementById("collabModal");
    const invoiceModal = document.getElementById("invoiceModal");
    const shipmentModal = document.getElementById("shipmentModal");
    const profileModal = document.getElementById("profileModal");
    const uploadDocModal = document.getElementById("uploadDocModal");

    // ==========================================================================
    // 2. TOAST NOTIFICATION UTILITY
    // ==========================================================================
    function showToast(message, type = "success") {
        let toast = document.getElementById("tradenest-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "tradenest-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            Object.assign(toast.style, {
                position: "fixed",
                right: "24px",
                bottom: "24px",
                zIndex: "99999",
                maxWidth: "380px",
                padding: "14px 18px",
                borderRadius: "10px",
                background: "#292625",
                color: "#ffffff",
                fontSize: "14px",
                lineHeight: "1.4",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                opacity: "0",
                transform: "translateY(12px)",
                transition: "opacity .25s ease, transform .25s ease"
            });
            document.body.appendChild(toast);
        }

        if (type === "error") {
            toast.style.background = "#a75d58";
        } else if (type === "warning") {
            toast.style.background = "#b48645";
        } else if (type === "info") {
            toast.style.background = "#667887";
        } else {
            toast.style.background = "#5f8068";
        }

        toast.textContent = message;
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";

        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(12px)";
        }, 3400);
    }

    // ==========================================================================
    // 3. ROUTER & VIEW SWITCHER
    // ==========================================================================
    const VIEW_TITLES = {
        overview: "Dashboard Overview",
        products: "Product Management",
        inventory: "Inventory Management",
        rfqs: "Incoming Requests for Quotation (RFQs)",
        quotations: "Quotation Management",
        samples: "Sample Request Management",
        collaboration: "Supplier Collaboration Network",
        communication: "Buyer Communication & Discussions",
        orders: "Order Management",
        payments: "Payments & Invoices",
        shipping: "Shipping & Delivery Progress",
        performance: "Performance & Trust Score",
        "business-profile": "Supplier Business Profile",
        settings: "Preferences & Settings"
    };

    function switchView(viewName) {
        if (!viewName || !VIEW_TITLES[viewName]) {
            viewName = "overview";
        }

        // Hide all views
        moduleViews.forEach(view => {
            view.classList.remove("active");
            if (view.id === `view-${viewName}`) {
                view.classList.add("active");
            }
        });

        // Update active sidebar nav link
        navLinks.forEach(link => {
            if (link.getAttribute("data-view") === viewName) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        // Update page title
        if (currentSectionTitle) {
            currentSectionTitle.textContent = VIEW_TITLES[viewName];
        }

        // Update top back button (hidden on overview, shown on other module views)
        const supplierBackBtn = document.getElementById("supplierTopBackButton");
        if (supplierBackBtn) {
            if (viewName === "overview") {
                supplierBackBtn.style.display = "none";
            } else {
                supplierBackBtn.style.display = "inline-flex";
                supplierBackBtn.onclick = function () {
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        switchView("overview");
                    }
                };
            }
        }

        // Close mobile sidebar if open
        if (sidebar && sidebar.classList.contains("open")) {
            sidebar.classList.remove("open");
        }

        // Trigger view-specific rendering
        renderActiveView(viewName);

        // Update URL hash without jumping
        if (window.location.hash !== `#${viewName}`) {
            history.pushState(null, "", `#${viewName}`);
        }

        // Scroll to top of main content
        const mainWrapper = document.querySelector(".main-wrapper");
        if (mainWrapper) {
            mainWrapper.scrollTo({ top: 0, behavior: "smooth" });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Handle clicks on data-view links anywhere in document
    document.addEventListener("click", function (event) {
        const target = event.target.closest("[data-view]");
        if (target) {
            event.preventDefault();
            const viewName = target.getAttribute("data-view");
            switchView(viewName);
        }
    });

    // Hash change listener
    window.addEventListener("hashchange", function () {
        const hash = window.location.hash.replace("#", "");
        if (hash && VIEW_TITLES[hash]) {
            switchView(hash);
        }
    });

    // ==========================================================================
    // 4. MODULE 15: SUPPLIER DASHBOARD OVERVIEW
    // ==========================================================================
    function renderOverview() {
        const stats = store.getDashboardStatistics();

        // Update 8 stats
        const statTotalProducts = document.getElementById("statTotalProducts");
        const statActiveProducts = document.getElementById("statActiveProducts");
        const statIncomingRFQs = document.getElementById("statIncomingRFQs");
        const statPendingQuotations = document.getElementById("statPendingQuotations");
        const statSampleRequests = document.getElementById("statSampleRequests");
        const statActiveOrders = document.getElementById("statActiveOrders");
        const statCompletedOrders = document.getElementById("statCompletedOrders");
        const statLowStockProducts = document.getElementById("statLowStockProducts");

        if (statTotalProducts) statTotalProducts.textContent = stats.totalProducts;
        if (statActiveProducts) statActiveProducts.textContent = stats.activeProducts;
        if (statIncomingRFQs) statIncomingRFQs.textContent = stats.incomingRFQs;
        if (statPendingQuotations) statPendingQuotations.textContent = stats.pendingQuotations;
        if (statSampleRequests) statSampleRequests.textContent = stats.sampleRequests;
        if (statActiveOrders) statActiveOrders.textContent = stats.activeOrders;
        if (statCompletedOrders) statCompletedOrders.textContent = stats.completedOrders;
        if (statLowStockProducts) statLowStockProducts.textContent = stats.lowStockProducts;

        // Nav Badges
        const navInventoryAlertBadge = document.getElementById("navInventoryAlertBadge");
        if (navInventoryAlertBadge) {
            navInventoryAlertBadge.style.display = stats.lowStockProducts > 0 ? "inline-flex" : "none";
        }
        const navRFQCountBadge = document.getElementById("navRFQCountBadge");
        if (navRFQCountBadge) {
            navRFQCountBadge.textContent = stats.incomingRFQs;
        }

        // Low Stock Alert Banner
        const stockAlertBanner = document.getElementById("overviewStockAlertBanner");
        const stockAlertText = document.getElementById("overviewStockAlertText");
        if (stockAlertBanner) {
            if (stats.lowStockProducts > 0) {
                stockAlertBanner.style.display = "flex";
                if (stockAlertText) {
                    stockAlertText.textContent = `${stats.lowStockProducts} products have dropped below minimum inventory thresholds. Please replenish stock soon.`;
                }
            } else {
                stockAlertBanner.style.display = "none";
            }
        }

        // Recent Orders Table
        const recentOrdersTbody = document.getElementById("overviewRecentOrdersTableBody");
        if (recentOrdersTbody) {
            const orders = store.getOrders().slice(0, 4);
            if (orders.length === 0) {
                recentOrdersTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No orders found.</td></tr>`;
            } else {
                recentOrdersTbody.innerHTML = orders.map(ord => `
                    <tr class="overview-order-row" data-order-id="${ord.id}" title="Click to view details for Order #${ord.id}">
                        <td><strong>#${ord.id}</strong></td>
                        <td>${escapeHtml(ord.buyerName)}</td>
                        <td>${escapeHtml(ord.productName)}</td>
                        <td>$${(ord.orderAmount || 0).toFixed(2)}</td>
                        <td><span class="badge-pill badge-${getStatusBadgeClass(ord.status)}">${ord.status}</span></td>
                    </tr>
                `).join("");
            }
        }

        // Recent Activity Feed
        const activityFeedList = document.getElementById("overviewActivityFeedList");
        if (activityFeedList) {
            const activities = store.getActivityFeed().slice(0, 5);
            activityFeedList.innerHTML = activities.map(act => `
                <div class="activity-item" style="cursor: pointer;" title="Click to view activity context" data-view="${act.view || 'orders'}">
                    <div class="activity-icon-wrap" aria-hidden="true">${act.icon || "📌"}</div>
                    <div class="activity-content">
                        <p class="activity-text">${escapeHtml(act.text)}</p>
                        <span class="activity-time">${escapeHtml(act.time)}</span>
                    </div>
                </div>
            `).join("");
        }
    }

    // Overview buttons & interactive rows
    const recentOrdersTbody = document.getElementById("overviewRecentOrdersTableBody");
    if (recentOrdersTbody) {
        recentOrdersTbody.addEventListener("click", function (e) {
            const row = e.target.closest(".overview-order-row");
            if (row) {
                const orderId = row.getAttribute("data-order-id");
                switchView("orders");
                const ordersSearchInput = document.getElementById("ordersSearchInput");
                if (ordersSearchInput) {
                    ordersSearchInput.value = orderId;
                    renderOrders();
                }
            }
        });
    }

    const activityFeedList = document.getElementById("overviewActivityFeedList");
    if (activityFeedList) {
        activityFeedList.addEventListener("click", function (e) {
            const item = e.target.closest(".activity-item");
            if (item) {
                const targetView = item.getAttribute("data-view") || "orders";
                switchView(targetView);
            }
        });
    }

    const btnQuickAddProduct = document.getElementById("btnQuickAddProduct");
    if (btnQuickAddProduct) {
        btnQuickAddProduct.addEventListener("click", () => openProductModal());
    }
    const btnQuickCreateQuote = document.getElementById("btnQuickCreateQuote");
    if (btnQuickCreateQuote) {
        btnQuickCreateQuote.addEventListener("click", () => openQuoteModal());
    }
    const btnReviewStockFromAlert = document.getElementById("btnReviewStockFromAlert");
    if (btnReviewStockFromAlert) {
        btnReviewStockFromAlert.addEventListener("click", () => switchView("inventory"));
    }

    // ==========================================================================
    // 5. MODULE 16: SUPPLIER BUSINESS PROFILE
    // ==========================================================================
    function renderBusinessProfile() {
        const profile = store.getBusinessProfile();

        const bizProfileCompanyName = document.getElementById("bizProfileCompanyName");
        const bizProfileType = document.getElementById("bizProfileType");
        const bizProfileDescription = document.getElementById("bizProfileDescription");
        const bizProfilePrimaryCat = document.getElementById("bizProfilePrimaryCat");
        const bizProfileSecondaryCat = document.getElementById("bizProfileSecondaryCat");
        const bizProfileLocation = document.getElementById("bizProfileLocation");

        const bizGstinVal = document.getElementById("bizGstinVal");
        const bizPanVal = document.getElementById("bizPanVal");
        const bizIecVal = document.getElementById("bizIecVal");
        const bizAddressVal = document.getElementById("bizAddressVal");

        const bizContactPersonVal = document.getElementById("bizContactPersonVal");
        const bizDesignationVal = document.getElementById("bizDesignationVal");
        const bizPhoneVal = document.getElementById("bizPhoneVal");
        const bizEmailVal = document.getElementById("bizEmailVal");
        const bizSupportEmailVal = document.getElementById("bizSupportEmailVal");

        if (bizProfileCompanyName) bizProfileCompanyName.textContent = profile.businessName;
        if (bizProfileType) bizProfileType.textContent = profile.businessType;
        if (bizProfileDescription) bizProfileDescription.textContent = profile.description;
        if (bizProfilePrimaryCat) bizProfilePrimaryCat.textContent = profile.primaryCategory;
        if (bizProfileSecondaryCat) bizProfileSecondaryCat.textContent = profile.secondaryCategory;
        if (bizProfileLocation) bizProfileLocation.textContent = profile.registeredAddress.split(",")[2] || "Bengaluru";

        if (bizGstinVal) bizGstinVal.textContent = profile.gstin;
        if (bizPanVal) bizPanVal.textContent = profile.pan;
        if (bizIecVal) bizIecVal.textContent = profile.iec;
        if (bizAddressVal) bizAddressVal.textContent = profile.registeredAddress;

        if (bizContactPersonVal) bizContactPersonVal.textContent = profile.contactPerson;
        if (bizDesignationVal) bizDesignationVal.textContent = profile.designation;
        if (bizPhoneVal) bizPhoneVal.textContent = profile.phone;
        if (bizEmailVal) bizEmailVal.textContent = profile.email;
        if (bizSupportEmailVal) bizSupportEmailVal.textContent = profile.supportEmail;

        // Render documents
        const docsContainer = document.getElementById("bizDocumentsListContainer");
        if (docsContainer) {
            docsContainer.innerHTML = (profile.documents || []).map(doc => `
                <div class="doc-item-card">
                    <div class="doc-info">
                        <span class="doc-icon">📄</span>
                        <div>
                            <div class="doc-title">${escapeHtml(doc.name)}</div>
                            <div class="doc-meta">${escapeHtml(doc.type)} • ${escapeHtml(doc.size)} • ${doc.uploadDate}</div>
                        </div>
                    </div>
                    <span class="badge-pill badge-active" style="font-size: 0.7rem;">${escapeHtml(doc.status)}</span>
                </div>
            `).join("");
        }
    }

    // Edit Business Profile Form Handling
    const btnEditBusinessProfile = document.getElementById("btnEditBusinessProfile");
    const headerEditProfileBtn = document.getElementById("headerEditProfileBtn");

    function openEditProfileModal() {
        const profile = store.getBusinessProfile();
        document.getElementById("editCompany").value = profile.businessName || "";
        document.getElementById("editBusinessType").value = profile.businessType || "";
        document.getElementById("editDescription").value = profile.description || "";
        document.getElementById("editPrimaryCat").value = profile.primaryCategory || "";
        document.getElementById("editSecondaryCat").value = profile.secondaryCategory || "";
        document.getElementById("editGstin").value = profile.gstin || "";
        document.getElementById("editPan").value = profile.pan || "";
        document.getElementById("editLocation").value = profile.registeredAddress || "";
        document.getElementById("editContactPerson").value = profile.contactPerson || "";
        document.getElementById("editPhone").value = profile.phone || "";
        document.getElementById("editEmail").value = profile.email || "";
        document.getElementById("editSupportEmail").value = profile.supportEmail || "";

        profileModal.hidden = false;
        closeProfileDropdown();
    }

    if (btnEditBusinessProfile) btnEditBusinessProfile.addEventListener("click", openEditProfileModal);
    if (headerEditProfileBtn) headerEditProfileBtn.addEventListener("click", openEditProfileModal);

    const closeProfileModal = document.getElementById("closeProfileModal");
    const cancelProfileEdit = document.getElementById("cancelProfileEdit");
    if (closeProfileModal) closeProfileModal.addEventListener("click", () => profileModal.hidden = true);
    if (cancelProfileEdit) cancelProfileEdit.addEventListener("click", () => profileModal.hidden = true);

    const profileEditForm = document.getElementById("profileEditForm");
    if (profileEditForm) {
        profileEditForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const updated = {
                businessName: document.getElementById("editCompany").value.trim(),
                businessType: document.getElementById("editBusinessType").value.trim(),
                description: document.getElementById("editDescription").value.trim(),
                primaryCategory: document.getElementById("editPrimaryCat").value.trim(),
                secondaryCategory: document.getElementById("editSecondaryCat").value.trim(),
                gstin: document.getElementById("editGstin").value.trim(),
                pan: document.getElementById("editPan").value.trim(),
                registeredAddress: document.getElementById("editLocation").value.trim(),
                contactPerson: document.getElementById("editContactPerson").value.trim(),
                phone: document.getElementById("editPhone").value.trim(),
                email: document.getElementById("editEmail").value.trim(),
                supportEmail: document.getElementById("editSupportEmail").value.trim()
            };
            store.saveBusinessProfile(updated);
            profileModal.hidden = true;
            renderBusinessProfile();
            updateTopBarProfile();
            showToast("Business profile details updated successfully!");
        });
    }

    // Document Upload Simulation
    const btnUploadDocTrigger = document.getElementById("btnUploadDocTrigger");
    const closeUploadDocModal = document.getElementById("closeUploadDocModal");
    const btnCancelUploadDoc = document.getElementById("btnCancelUploadDoc");
    const uploadDocForm = document.getElementById("uploadDocForm");
    const demoDocDropzone = document.getElementById("demoDocDropzone");

    if (btnUploadDocTrigger) {
        btnUploadDocTrigger.addEventListener("click", () => {
            uploadDocModal.hidden = false;
            document.getElementById("docFileName").value = "";
        });
    }
    if (closeUploadDocModal) closeUploadDocModal.addEventListener("click", () => uploadDocModal.hidden = true);
    if (btnCancelUploadDoc) btnCancelUploadDoc.addEventListener("click", () => uploadDocModal.hidden = true);

    if (demoDocDropzone) {
        demoDocDropzone.addEventListener("click", () => {
            const sampleNames = [
                "Factory_Safety_Compliance_Certificate.pdf",
                "ISO_14001_Environmental_Clearance.pdf",
                "BIS_Quality_Standard_Audit.pdf",
                "Export_Inspection_Agency_Report.pdf"
            ];
            const randomSample = sampleNames[Math.floor(Math.random() * sampleNames.length)];
            document.getElementById("docFileName").value = randomSample;
            showToast("Sample document selected: " + randomSample, "info");
        });
    }

    if (uploadDocForm) {
        uploadDocForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const fileName = document.getElementById("docFileName").value.trim();
            const cat = document.getElementById("docCategorySelect").value;
            if (!fileName) return;

            store.addDocument(fileName, cat, "1.5 MB");
            uploadDocModal.hidden = true;
            renderBusinessProfile();
            showToast(`Document "${fileName}" saved locally (Demonstration Verification)`, "success");
        });
    }

    // ==========================================================================
    // 6. MODULE 17: PRODUCT MANAGEMENT
    // ==========================================================================
    const productSearchInput = document.getElementById("productSearchInput");
    const productCategoryFilter = document.getElementById("productCategoryFilter");
    const productStatusFilter = document.getElementById("productStatusFilter");
    const productsMgmtGrid = document.getElementById("productsMgmtGrid");
    const productResultsCount = document.getElementById("productResultsCount");
    const btnAddNewProductModal = document.getElementById("btnAddNewProductModal");

    function renderProducts() {
        if (!productsMgmtGrid) return;

        let products = store.getProducts();
        const search = (productSearchInput ? productSearchInput.value : "").toLowerCase().trim();
        const category = productCategoryFilter ? productCategoryFilter.value : "all";
        const status = productStatusFilter ? productStatusFilter.value : "all";

        if (search) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(search) ||
                p.sku.toLowerCase().includes(search) ||
                p.description.toLowerCase().includes(search) ||
                (p.specs && Object.values(p.specs).some(val => String(val).toLowerCase().includes(search)))
            );
        }

        if (category !== "all") {
            products = products.filter(p => p.category === category);
        }

        if (status !== "all") {
            products = products.filter(p => p.status === status);
        }

        if (productResultsCount) {
            productResultsCount.textContent = `Showing ${products.length} product${products.length === 1 ? "" : "s"}`;
        }

        if (products.length === 0) {
            productsMgmtGrid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 40px; text-align: center; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius-md);">
                    <div style="font-size: 2rem; margin-bottom: 8px;">📦</div>
                    <h3>No products found</h3>
                    <p style="color: var(--text-light); margin-bottom: 14px;">Try changing filters or add a new wholesale product.</p>
                    <button type="button" class="btn btn-primary" onclick="document.getElementById('btnAddNewProductModal').click()">➕ Add New Product</button>
                </div>
            `;
            return;
        }

        productsMgmtGrid.innerHTML = products.map(prod => {
            const isLowStock = prod.availableStock <= prod.minThreshold;
            const isOutOfStock = prod.availableStock === 0;
            const statusBadge = isOutOfStock
                ? '<span class="badge-pill badge-outofstock">Out of Stock</span>'
                : (prod.status === "active" ? '<span class="badge-pill badge-active">Active</span>' : '<span class="badge-pill badge-unavailable">Unavailable</span>');

            const specsList = prod.specs ? Object.entries(prod.specs).slice(0, 2).map(([k, v]) => `<strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}`).join(" • ") : "";

            return `
                <article class="prod-mgmt-card">
                    <div class="prod-img-wrap">
                        <img src="${prod.image || '../../images/products/safety-gloves.webp'}" alt="${escapeHtml(prod.name)}" loading="lazy" />
                        <div class="prod-badge-overlay">${statusBadge}</div>
                        <div class="prod-sku-overlay">${escapeHtml(prod.sku)}</div>
                    </div>
                    <div class="prod-body">
                        <span class="prod-category-tag">${escapeHtml(prod.category)}</span>
                        <h3 class="prod-name">${escapeHtml(prod.name)}</h3>
                        <p class="prod-desc-snippet">${escapeHtml(prod.description)}</p>
                        ${specsList ? `<p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">${specsList}</p>` : ""}

                        <div class="prod-pricing-row">
                            <div>
                                <span class="prod-price-main">$${(prod.unitPrice || 0).toFixed(2)}</span>
                                <span style="font-size: 0.8rem; color: var(--text-muted);">/ ${escapeHtml(prod.uom)}</span>
                            </div>
                            <span class="prod-moq-label">MOQ: ${prod.moq} ${escapeHtml(prod.uom)}</span>
                        </div>

                        <div class="prod-stock-bar">
                            <span>Available Stock: <strong>${prod.availableStock}</strong></span>
                            <span style="color: ${isLowStock ? 'var(--danger)' : 'var(--text-muted)'}; font-weight: ${isLowStock ? '700' : 'normal'}">
                                ${isLowStock ? '⚠️ Low Threshold (' + prod.minThreshold + ')' : 'Min: ' + prod.minThreshold}
                            </span>
                        </div>

                        <div class="prod-actions-bar">
                            <button type="button" class="btn btn-sm btn-secondary btn-full btn-edit-product" data-id="${prod.id}">
                                ✏️ Edit
                            </button>
                            <button type="button" class="btn btn-sm btn-outline btn-full btn-toggle-status" data-id="${prod.id}">
                                ${prod.status === "active" ? "Mark Unavailable" : "Publish Active"}
                            </button>
                            <button type="button" class="btn btn-sm btn-outline btn-delete-product" data-id="${prod.id}" title="Delete Product" style="color: var(--danger); border-color: rgba(167,93,88,0.3);">
                                🗑️
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    }

    if (productSearchInput) productSearchInput.addEventListener("input", renderProducts);
    if (productCategoryFilter) productCategoryFilter.addEventListener("change", renderProducts);
    if (productStatusFilter) productStatusFilter.addEventListener("change", renderProducts);

    // Add / Edit Product Modal Handlers
    function openProductModal(prodId = null) {
        const prodFormId = document.getElementById("prodFormId");
        const productModalTitle = document.getElementById("productModalTitle");
        const prodFormName = document.getElementById("prodFormName");
        const prodFormSku = document.getElementById("prodFormSku");
        const prodFormCategory = document.getElementById("prodFormCategory");
        const prodFormUom = document.getElementById("prodFormUom");
        const prodFormDescription = document.getElementById("prodFormDescription");
        const prodFormUnitPrice = document.getElementById("prodFormUnitPrice");
        const prodFormMoq = document.getElementById("prodFormMoq");
        const prodFormStock = document.getElementById("prodFormStock");
        const prodFormThreshold = document.getElementById("prodFormThreshold");
        const prodFormImage = document.getElementById("prodFormImage");
        const prodFormSpecs = document.getElementById("prodFormSpecs");

        if (prodId) {
            const prod = store.getProductById(prodId);
            if (!prod) return;
            productModalTitle.textContent = "Edit Product";
            prodFormId.value = prod.id;
            prodFormName.value = prod.name;
            prodFormSku.value = prod.sku;
            prodFormCategory.value = prod.category;
            prodFormUom.value = prod.uom;
            prodFormDescription.value = prod.description;
            prodFormUnitPrice.value = prod.unitPrice;
            prodFormMoq.value = prod.moq;
            prodFormStock.value = prod.availableStock;
            prodFormThreshold.value = prod.minThreshold;
            prodFormImage.value = prod.image || "../../images/products/safety-gloves.webp";
            prodFormSpecs.value = prod.specs ? Object.entries(prod.specs).map(([k, v]) => `${k}: ${v}`).join("\n") : "";
        } else {
            productModalTitle.textContent = "Add New Product";
            prodFormId.value = "";
            prodFormName.value = "";
            prodFormSku.value = "SKU-" + Math.floor(1000 + Math.random() * 9000);
            prodFormCategory.value = "Safety Equipment";
            prodFormUom.value = "Pieces";
            prodFormDescription.value = "";
            prodFormUnitPrice.value = "15.00";
            prodFormMoq.value = "50";
            prodFormStock.value = "500";
            prodFormThreshold.value = "100";
            prodFormImage.value = "../../images/products/safety-gloves.webp";
            prodFormSpecs.value = "Material: High-Grade Industrial\nGrade: Certified Standard\nOrigin: India";
        }

        productModal.hidden = false;
    }

    if (btnAddNewProductModal) {
        btnAddNewProductModal.addEventListener("click", () => openProductModal());
    }

    const closeProductModal = document.getElementById("closeProductModal");
    const btnCancelProductModal = document.getElementById("btnCancelProductModal");
    if (closeProductModal) closeProductModal.addEventListener("click", () => productModal.hidden = true);
    if (btnCancelProductModal) btnCancelProductModal.addEventListener("click", () => productModal.hidden = true);

    const productForm = document.getElementById("productForm");
    if (productForm) {
        productForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const id = document.getElementById("prodFormId").value;
            const name = document.getElementById("prodFormName").value.trim();
            const sku = document.getElementById("prodFormSku").value.trim();
            const category = document.getElementById("prodFormCategory").value;
            const uom = document.getElementById("prodFormUom").value.trim();
            const description = document.getElementById("prodFormDescription").value.trim();
            const unitPrice = parseFloat(document.getElementById("prodFormUnitPrice").value) || 0;
            const moq = parseInt(document.getElementById("prodFormMoq").value, 10) || 1;
            const availableStock = parseInt(document.getElementById("prodFormStock").value, 10) || 0;
            const minThreshold = parseInt(document.getElementById("prodFormThreshold").value, 10) || 0;
            const image = document.getElementById("prodFormImage").value.trim() || "../../images/products/safety-gloves.webp";

            // Parse specs
            const specsText = document.getElementById("prodFormSpecs").value;
            const specs = {};
            specsText.split("\n").forEach(line => {
                const parts = line.split(":");
                if (parts.length >= 2) {
                    specs[parts[0].trim()] = parts.slice(1).join(":").trim();
                }
            });

            const productData = {
                id: id || undefined,
                name,
                sku,
                category,
                uom,
                description,
                unitPrice,
                moq,
                availableStock,
                minThreshold,
                image,
                specs
            };

            store.saveProduct(productData);
            productModal.hidden = true;
            renderProducts();
            showToast(`Product "${name}" saved and synced to buyer catalogue!`, "success");
        });
    }

    // Grid Actions Event Delegation (Edit, Toggle Status, Delete)
    if (productsMgmtGrid) {
        productsMgmtGrid.addEventListener("click", function (e) {
            const editBtn = e.target.closest(".btn-edit-product");
            if (editBtn) {
                const prodId = editBtn.getAttribute("data-id");
                openProductModal(prodId);
                return;
            }

            const toggleBtn = e.target.closest(".btn-toggle-status");
            if (toggleBtn) {
                const prodId = toggleBtn.getAttribute("data-id");
                const newStatus = store.toggleProductStatus(prodId);
                renderProducts();
                showToast(`Product status changed to: ${newStatus}`, "info");
                return;
            }

            const deleteBtn = e.target.closest(".btn-delete-product");
            if (deleteBtn) {
                const prodId = deleteBtn.getAttribute("data-id");
                if (confirm("Are you sure you want to delete this product listing from the catalogue?")) {
                    store.deleteProduct(prodId);
                    renderProducts();
                    showToast("Product listing removed.", "warning");
                }
            }
        });
    }

    // ==========================================================================
    // 7. MODULE 18: INVENTORY MANAGEMENT
    // ==========================================================================
    const inventoryTableBody = document.getElementById("inventoryTableBody");
    const inventorySearchInput = document.getElementById("inventorySearchInput");
    const inventoryStockFilter = document.getElementById("inventoryStockFilter");

    function renderInventory() {
        if (!inventoryTableBody) return;

        let products = store.getProducts();
        const search = (inventorySearchInput ? inventorySearchInput.value : "").toLowerCase().trim();
        const filter = inventoryStockFilter ? inventoryStockFilter.value : "all";

        // Calculate summary cards
        const invTotalSKUs = document.getElementById("invTotalSKUs");
        const invTotalUnits = document.getElementById("invTotalUnits");
        const invLowStockCount = document.getElementById("invLowStockCount");
        const invOutOfStockCount = document.getElementById("invOutOfStockCount");

        const totalSKUs = products.length;
        const totalUnits = products.reduce((sum, p) => sum + (p.availableStock || 0), 0);
        const lowStockCount = products.filter(p => p.availableStock <= p.minThreshold && p.availableStock > 0).length;
        const outOfStockCount = products.filter(p => p.availableStock === 0).length;

        if (invTotalSKUs) invTotalSKUs.textContent = totalSKUs;
        if (invTotalUnits) invTotalUnits.textContent = totalUnits.toLocaleString();
        if (invLowStockCount) invLowStockCount.textContent = lowStockCount;
        if (invOutOfStockCount) invOutOfStockCount.textContent = outOfStockCount;

        if (search) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(search) ||
                p.sku.toLowerCase().includes(search)
            );
        }

        if (filter === "low") {
            products = products.filter(p => p.availableStock <= p.minThreshold && p.availableStock > 0);
        } else if (filter === "out") {
            products = products.filter(p => p.availableStock === 0);
        } else if (filter === "in") {
            products = products.filter(p => p.availableStock > p.minThreshold);
        }

        if (products.length === 0) {
            inventoryTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">No inventory items matched your search filter.</td></tr>`;
            return;
        }

        inventoryTableBody.innerHTML = products.map(prod => {
            const isOut = prod.availableStock === 0;
            const isLow = prod.availableStock <= prod.minThreshold && !isOut;
            const badge = isOut
                ? '<span class="badge-pill badge-outofstock">Out of Stock</span>'
                : (isLow ? '<span class="badge-pill badge-lowstock">Low Stock</span>' : '<span class="badge-pill badge-instock">In Stock</span>');

            return `
                <tr>
                    <td>
                        <div style="font-weight: 700; color: var(--text);">${escapeHtml(prod.name)}</div>
                        <span style="font-family: monospace; font-size: 0.775rem; color: var(--text-muted);">${escapeHtml(prod.sku)}</span>
                    </td>
                    <td>${escapeHtml(prod.category)}</td>
                    <td style="font-size: 1.05rem; font-weight: 700; color: ${isLow || isOut ? 'var(--danger)' : 'var(--text)'};">
                        ${prod.availableStock} <span style="font-size: 0.8rem; font-weight: 400; color: var(--text-light);">${prod.uom}</span>
                    </td>
                    <td style="color: var(--text-light);">${prod.reservedStock || 0} ${prod.uom}</td>
                    <td style="font-weight: 600;">${prod.minThreshold} ${prod.uom}</td>
                    <td>${badge}</td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${prod.lastStockUpdated || prod.createdAt || "2026-10-01"}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-secondary btn-update-stock" data-id="${prod.id}">
                            📑 Adjust Stock
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    if (inventorySearchInput) inventorySearchInput.addEventListener("input", renderInventory);
    if (inventoryStockFilter) inventoryStockFilter.addEventListener("change", renderInventory);

    // Interactive Inventory KPI Cards
    const cardInvLowStock = document.getElementById("cardInvLowStock");
    if (cardInvLowStock) {
        cardInvLowStock.addEventListener("click", () => {
            if (inventoryStockFilter) inventoryStockFilter.value = "low";
            renderInventory();
            showToast("Filtering Low Stock items", "info");
        });
    }
    const cardInvOutOfStock = document.getElementById("cardInvOutOfStock");
    if (cardInvOutOfStock) {
        cardInvOutOfStock.addEventListener("click", () => {
            if (inventoryStockFilter) inventoryStockFilter.value = "out";
            renderInventory();
            showToast("Filtering Out of Stock items", "info");
        });
    }
    const cardInvTotalSKUs = document.getElementById("cardInvTotalSKUs");
    if (cardInvTotalSKUs) {
        cardInvTotalSKUs.addEventListener("click", () => {
            if (inventoryStockFilter) inventoryStockFilter.value = "all";
            renderInventory();
            showToast("Showing all tracked SKUs", "info");
        });
    }
    const cardInvTotalUnits = document.getElementById("cardInvTotalUnits");
    if (cardInvTotalUnits) {
        cardInvTotalUnits.addEventListener("click", () => {
            if (inventoryStockFilter) inventoryStockFilter.value = "all";
            renderInventory();
        });
    }

    // Stock Modal
    const stockFormProdId = document.getElementById("stockFormProdId");
    const stockFormProdName = document.getElementById("stockFormProdName");
    const stockFormNewQty = document.getElementById("stockFormNewQty");
    const stockFormMinThresh = document.getElementById("stockFormMinThresh");
    const closeStockModal = document.getElementById("closeStockModal");
    const btnCancelStockModal = document.getElementById("btnCancelStockModal");
    const stockForm = document.getElementById("stockForm");

    function openStockModal(prodId) {
        const prod = store.getProductById(prodId);
        if (!prod) return;
        stockFormProdId.value = prod.id;
        stockFormProdName.textContent = `${prod.name} (${prod.sku})`;
        stockFormNewQty.value = prod.availableStock;
        stockFormMinThresh.value = prod.minThreshold;
        stockModal.hidden = false;
    }

    if (inventoryTableBody) {
        inventoryTableBody.addEventListener("click", function (e) {
            const btn = e.target.closest(".btn-update-stock");
            if (btn) {
                const prodId = btn.getAttribute("data-id");
                openStockModal(prodId);
            }
        });
    }

    if (closeStockModal) closeStockModal.addEventListener("click", () => stockModal.hidden = true);
    if (btnCancelStockModal) btnCancelStockModal.addEventListener("click", () => stockModal.hidden = true);

    if (stockForm) {
        stockForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const id = stockFormProdId.value;
            const newQty = parseInt(stockFormNewQty.value, 10) || 0;
            const newThresh = parseInt(stockFormMinThresh.value, 10) || 0;
            store.updateStock(id, newQty, newThresh);
            stockModal.hidden = true;
            renderInventory();
            renderProducts();
            showToast("Inventory stock updated successfully!", "success");
        });
    }

    // ==========================================================================
    // 8. MODULE 19: INCOMING RFQs
    // ==========================================================================
    const rfqCardsContainer = document.getElementById("rfqCardsContainer");
    const rfqStatusTabs = document.getElementById("rfqStatusTabs");
    const rfqSearchInput = document.getElementById("rfqSearchInput");
    let activeRFQFilter = "all";

    function renderRFQs() {
        if (!rfqCardsContainer) return;

        let rfqs = store.getRFQs();
        const search = (rfqSearchInput ? rfqSearchInput.value : "").toLowerCase().trim();

        if (activeRFQFilter !== "all") {
            rfqs = rfqs.filter(r => r.status === activeRFQFilter);
        }

        if (search) {
            rfqs = rfqs.filter(r =>
                r.buyerName.toLowerCase().includes(search) ||
                r.productName.toLowerCase().includes(search) ||
                r.id.toLowerCase().includes(search)
            );
        }

        if (rfqs.length === 0) {
            rfqCardsContainer.innerHTML = `
                <div style="padding: 40px; text-align: center; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius-md);">
                    <div style="font-size: 2rem; margin-bottom: 8px;">📥</div>
                    <h3>No RFQs found in this category</h3>
                    <p style="color: var(--text-light);">Try selecting another status tab or clear the search query.</p>
                </div>
            `;
            return;
        }

        rfqCardsContainer.innerHTML = rfqs.map(rfq => {
            const statusClass = getStatusBadgeClass(rfq.status);
            return `
                <article class="rfq-card-item">
                    <div>
                        <div class="rfq-header-row">
                            <span class="rfq-ref-code">${rfq.id}</span>
                            <h3 class="rfq-buyer-title">${escapeHtml(rfq.buyerName)}</h3>
                            <span class="badge-pill badge-${statusClass}">${rfq.status}</span>
                            <span class="deadline-badge">⏳ Deadline: ${rfq.responseDeadline}</span>
                        </div>

                        <div style="font-size: 1rem; font-weight: 600; color: var(--text); margin-bottom: 4px;">
                            Requirement: ${escapeHtml(rfq.productName)} (Qty: ${rfq.requiredQty} ${escapeHtml(rfq.uom)})
                        </div>

                        <div class="rfq-specs-box">
                            <strong>Buyer Specifications:</strong> ${escapeHtml(rfq.specifications || "Standard commercial wholesale specs.")}
                        </div>

                        <div class="rfq-meta-grid">
                            <span class="rfq-meta-item">Target Budget: <strong>$${(rfq.targetBudget || 0).toLocaleString()}</strong></span>
                            <span class="rfq-meta-item">Delivery Destination: <strong>${escapeHtml(rfq.deliveryLocation)}</strong></span>
                            <span class="rfq-meta-item">Expected Arrival: <strong>${rfq.expectedDeliveryDate}</strong></span>
                            <span class="rfq-meta-item">Contact: <strong>${escapeHtml(rfq.buyerContact)}</strong></span>
                        </div>
                    </div>

                    <div class="rfq-side-actions">
                        <button type="button" class="btn btn-primary btn-full btn-quote-from-rfq" data-id="${rfq.id}">
                            📝 Create Quote
                        </button>
                        <button type="button" class="btn btn-secondary btn-full btn-view-rfq" data-id="${rfq.id}">
                            🔍 Details
                        </button>
                        ${rfq.status === "New" ? `
                            <div style="display: flex; gap: 8px;">
                                <button type="button" class="btn btn-sm btn-outline btn-full btn-accept-rfq" data-id="${rfq.id}" style="color: var(--success); border-color: rgba(95,128,104,0.4);">
                                    ✓ Accept
                                </button>
                                <button type="button" class="btn btn-sm btn-outline btn-full btn-decline-rfq" data-id="${rfq.id}" style="color: var(--danger); border-color: rgba(167,93,88,0.4);">
                                    ✕ Decline
                                </button>
                            </div>
                        ` : ""}
                    </div>
                </article>
            `;
        }).join("");
    }

    if (rfqStatusTabs) {
        rfqStatusTabs.addEventListener("click", function (e) {
            const btn = e.target.closest(".tab-btn");
            if (btn) {
                rfqStatusTabs.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeRFQFilter = btn.getAttribute("data-status");
                renderRFQs();
            }
        });
    }

    if (rfqSearchInput) rfqSearchInput.addEventListener("input", renderRFQs);

    // RFQ Actions
    if (rfqCardsContainer) {
        rfqCardsContainer.addEventListener("click", function (e) {
            const quoteBtn = e.target.closest(".btn-quote-from-rfq");
            if (quoteBtn) {
                const rfqId = quoteBtn.getAttribute("data-id");
                openQuoteModal(null, rfqId);
                return;
            }

            const viewBtn = e.target.closest(".btn-view-rfq");
            if (viewBtn) {
                const rfqId = viewBtn.getAttribute("data-id");
                openRFQDetailModal(rfqId);
                return;
            }

            const acceptBtn = e.target.closest(".btn-accept-rfq");
            if (acceptBtn) {
                const rfqId = acceptBtn.getAttribute("data-id");
                store.updateRFQStatus(rfqId, "Accepted");
                renderRFQs();
                showToast(`RFQ ${rfqId} accepted! You can now prepare quotation.`, "success");
                return;
            }

            const declineBtn = e.target.closest(".btn-decline-rfq");
            if (declineBtn) {
                const rfqId = declineBtn.getAttribute("data-id");
                const reason = prompt("Please provide a reason for declining this RFQ (e.g. Capacity constraint, Out of stock):", "Capacity currently committed to ongoing framework orders.");
                if (reason) {
                    store.updateRFQStatus(rfqId, "Declined", reason);
                    renderRFQs();
                    showToast(`RFQ ${rfqId} declined.`, "warning");
                }
            }
        });
    }

    function openRFQDetailModal(rfqId) {
        const rfq = store.getRFQById(rfqId);
        if (!rfq) return;

        const rfqModalBody = document.getElementById("rfqModalBody");
        rfqModalBody.innerHTML = `
            <div style="margin-bottom: 16px;">
                <span class="rfq-ref-code">${rfq.id}</span>
                <span class="badge-pill badge-${getStatusBadgeClass(rfq.status)}" style="margin-left: 10px;">${rfq.status}</span>
            </div>
            <h3 style="font-size: 1.3rem; margin-bottom: 4px;">${escapeHtml(rfq.buyerName)}</h3>
            <p style="color: var(--text-light); font-size: 0.85rem; margin-bottom: 16px;">Contact: ${escapeHtml(rfq.buyerContact)} • Location: ${escapeHtml(rfq.buyerLocation)}</p>

            <div class="rfq-specs-box" style="margin-bottom: 20px;">
                <h4 style="font-size: 0.95rem; margin-bottom: 6px;">Required Product &amp; Specifications:</h4>
                <div style="font-size: 1rem; font-weight: 700; margin-bottom: 6px;">${escapeHtml(rfq.productName)}</div>
                <p>${escapeHtml(rfq.specifications)}</p>
            </div>

            <div class="key-value-list">
                <div class="key-value-row">
                    <span class="kv-key">Required Quantity:</span>
                    <span class="kv-val">${rfq.requiredQty} ${escapeHtml(rfq.uom)}</span>
                </div>
                <div class="key-value-row">
                    <span class="kv-key">Target Budget:</span>
                    <span class="kv-val">$${(rfq.targetBudget || 0).toLocaleString()}</span>
                </div>
                <div class="key-value-row">
                    <span class="kv-key">Delivery Destination:</span>
                    <span class="kv-val">${escapeHtml(rfq.deliveryLocation)}</span>
                </div>
                <div class="key-value-row">
                    <span class="kv-key">Expected Arrival:</span>
                    <span class="kv-val">${rfq.expectedDeliveryDate}</span>
                </div>
                <div class="key-value-row">
                    <span class="kv-key">Response Deadline:</span>
                    <span class="kv-val" style="color: var(--warning);">${rfq.responseDeadline}</span>
                </div>
                ${rfq.declineReason ? `
                    <div class="key-value-row">
                        <span class="kv-key">Decline Reason:</span>
                        <span class="kv-val" style="color: var(--danger);">${escapeHtml(rfq.declineReason)}</span>
                    </div>
                ` : ""}
            </div>
        `;
        rfqModal.hidden = false;
    }

    const closeRFQModal = document.getElementById("closeRFQModal");
    const btnCloseRFQModalBtn = document.getElementById("btnCloseRFQModalBtn");
    if (closeRFQModal) closeRFQModal.addEventListener("click", () => rfqModal.hidden = true);
    if (btnCloseRFQModalBtn) btnCloseRFQModalBtn.addEventListener("click", () => rfqModal.hidden = true);

    // ==========================================================================
    // 9. MODULE 20: QUOTATION MANAGEMENT
    // ==========================================================================
    const quotationsTableBody = document.getElementById("quotationsTableBody");
    const btnCreateNewQuotationModal = document.getElementById("btnCreateNewQuotationModal");

    function renderQuotations() {
        if (!quotationsTableBody) return;
        const quotes = store.getQuotations();

        if (quotes.length === 0) {
            quotationsTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px;">No quotations created yet.</td></tr>`;
            return;
        }

        quotationsTableBody.innerHTML = quotes.map(q => {
            const badgeClass = getStatusBadgeClass(q.status);
            return `
                <tr>
                    <td><strong>${q.id}</strong></td>
                    <td>${q.rfqRef ? `<span class="rfq-ref-code">${q.rfqRef}</span>` : "Direct Quotation"}</td>
                    <td>${escapeHtml(q.buyerName)}</td>
                    <td>${escapeHtml(q.productName)}</td>
                    <td>${q.offeredQty} ${escapeHtml(q.uom || "Units")}</td>
                    <td style="font-weight: 700; color: var(--text);">$${(q.totalAmount || q.subtotal || 0).toFixed(2)}</td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${q.validityDate}</td>
                    <td><span class="badge-pill badge-${badgeClass}">${q.status}</span></td>
                    <td>
                        <button type="button" class="btn btn-sm btn-secondary btn-edit-quote" data-id="${q.id}">
                            ✏️ Edit
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // Quotation Creator Modal
    const quoteFormId = document.getElementById("quoteFormId");
    const quoteFormRfqRef = document.getElementById("quoteFormRfqRef");
    const quoteFormBuyer = document.getElementById("quoteFormBuyer");
    const quoteFormProductSelect = document.getElementById("quoteFormProductSelect");
    const quoteFormOfferedQty = document.getElementById("quoteFormOfferedQty");
    const quoteFormUnitPrice = document.getElementById("quoteFormUnitPrice");
    const quoteFormDeliveryFee = document.getElementById("quoteFormDeliveryFee");
    const quoteFormTimeline = document.getElementById("quoteFormTimeline");
    const quoteFormPaymentTerms = document.getElementById("quoteFormPaymentTerms");
    const quoteFormValidity = document.getElementById("quoteFormValidity");
    const quoteFormConditions = document.getElementById("quoteFormConditions");

    const calcSubtotal = document.getElementById("calcSubtotal");
    const calcTax = document.getElementById("calcTax");
    const calcDelivery = document.getElementById("calcDelivery");
    const calcGrandTotal = document.getElementById("calcGrandTotal");

    function calculateQuoteLive() {
        const qty = parseFloat(quoteFormOfferedQty.value) || 0;
        const unit = parseFloat(quoteFormUnitPrice.value) || 0;
        const delivery = parseFloat(quoteFormDeliveryFee.value) || 0;

        const sub = qty * unit;
        const tax = sub * 0.08; // 8% standard tax
        const total = sub + tax + delivery;

        if (calcSubtotal) calcSubtotal.textContent = `$${sub.toFixed(2)}`;
        if (calcTax) calcTax.textContent = `$${tax.toFixed(2)}`;
        if (calcDelivery) calcDelivery.textContent = `$${delivery.toFixed(2)}`;
        if (calcGrandTotal) calcGrandTotal.textContent = `$${total.toFixed(2)}`;

        return { sub, tax, delivery, total };
    }

    [quoteFormOfferedQty, quoteFormUnitPrice, quoteFormDeliveryFee].forEach(input => {
        if (input) input.addEventListener("input", calculateQuoteLive);
    });

    function openQuoteModal(quoteId = null, rfqId = null) {
        // Populate products dropdown
        const products = store.getProducts();
        quoteFormProductSelect.innerHTML = products.map(p => `
            <option value="${p.id}" data-name="${escapeHtml(p.name)}" data-price="${p.unitPrice}" data-uom="${escapeHtml(p.uom)}">
                ${escapeHtml(p.name)} ($${p.unitPrice}/${p.uom})
            </option>
        `).join("");

        // Pre-fill valid date 30 days ahead
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        quoteFormValidity.value = futureDate.toISOString().split("T")[0];

        if (quoteId) {
            const q = store.getQuotationById(quoteId);
            if (!q) return;
            quoteFormId.value = q.id;
            quoteFormRfqRef.value = q.rfqRef || "";
            quoteFormBuyer.value = q.buyerName;
            quoteFormOfferedQty.value = q.offeredQty;
            quoteFormUnitPrice.value = q.unitPrice;
            quoteFormDeliveryFee.value = q.deliveryCharges || 75.00;
            quoteFormTimeline.value = q.deliveryTimeline || "5 business days";
            quoteFormPaymentTerms.value = q.paymentTerms || "TradeShield B2B Escrow - 100% Release upon Inspection";
            quoteFormValidity.value = q.validityDate || futureDate.toISOString().split("T")[0];
            quoteFormConditions.value = q.additionalConditions || "";
        } else if (rfqId) {
            const rfq = store.getRFQById(rfqId);
            if (!rfq) return;
            quoteFormId.value = "";
            quoteFormRfqRef.value = rfq.id;
            quoteFormBuyer.value = rfq.buyerName;
            quoteFormOfferedQty.value = rfq.requiredQty;

            // Find matching product
            const matchProd = products.find(p => p.name.toLowerCase().includes(rfq.productName.toLowerCase()));
            if (matchProd) {
                quoteFormProductSelect.value = matchProd.id;
                quoteFormUnitPrice.value = matchProd.unitPrice;
            } else {
                quoteFormUnitPrice.value = (rfq.targetBudget / rfq.requiredQty).toFixed(2);
            }
            quoteFormDeliveryFee.value = 85.00;
            quoteFormTimeline.value = "5 to 7 business days from PO";
            quoteFormConditions.value = `Complies with buyer specifications in ${rfq.id}. Certificate of analysis and batch testing included.`;
        } else {
            quoteFormId.value = "";
            quoteFormRfqRef.value = "";
            quoteFormBuyer.value = "";
            quoteFormOfferedQty.value = "100";
            if (products[0]) quoteFormUnitPrice.value = products[0].unitPrice;
            quoteFormDeliveryFee.value = 75.00;
            quoteFormTimeline.value = "5 to 7 business days from PO";
            quoteFormConditions.value = "Prices valid for 30 days. Full replacement guarantee against manufacturing defects.";
        }

        calculateQuoteLive();
        quoteModal.hidden = false;
    }

    if (btnCreateNewQuotationModal) btnCreateNewQuotationModal.addEventListener("click", () => openQuoteModal());

    const closeQuoteModal = document.getElementById("closeQuoteModal");
    const btnCancelQuoteModal = document.getElementById("btnCancelQuoteModal");
    if (closeQuoteModal) closeQuoteModal.addEventListener("click", () => quoteModal.hidden = true);
    if (btnCancelQuoteModal) btnCancelQuoteModal.addEventListener("click", () => quoteModal.hidden = true);

    const quoteForm = document.getElementById("quoteForm");
    if (quoteForm) {
        quoteForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const id = quoteFormId.value;
            const rfqRef = quoteFormRfqRef.value;
            const buyerName = quoteFormBuyer.value.trim();
            const prodOpt = quoteFormProductSelect.selectedOptions[0];
            const productName = prodOpt ? prodOpt.getAttribute("data-name") : "Industrial Product";
            const uom = prodOpt ? prodOpt.getAttribute("data-uom") : "Units";
            const offeredQty = parseFloat(quoteFormOfferedQty.value) || 1;
            const unitPrice = parseFloat(quoteFormUnitPrice.value) || 0;
            const deliveryCharges = parseFloat(quoteFormDeliveryFee.value) || 0;
            const deliveryTimeline = quoteFormTimeline.value.trim();
            const paymentTerms = quoteFormPaymentTerms.value;
            const validityDate = quoteFormValidity.value;
            const additionalConditions = quoteFormConditions.value.trim();

            const calc = calculateQuoteLive();

            const quoteData = {
                id: id || undefined,
                rfqRef,
                buyerName,
                productName,
                uom,
                offeredQty,
                unitPrice,
                subtotal: calc.sub,
                taxAmount: calc.tax,
                deliveryCharges,
                totalAmount: calc.total,
                deliveryTimeline,
                paymentTerms,
                validityDate,
                additionalConditions
            };

            store.saveQuotation(quoteData);
            quoteModal.hidden = true;
            renderQuotations();
            renderRFQs();
            showToast(`Quotation sent to ${buyerName} for $${calc.total.toFixed(2)}!`, "success");
        });
    }

    if (quotationsTableBody) {
        quotationsTableBody.addEventListener("click", function (e) {
            const editBtn = e.target.closest(".btn-edit-quote");
            if (editBtn) {
                const qId = editBtn.getAttribute("data-id");
                openQuoteModal(qId);
            }
        });
    }

    // ==========================================================================
    // 10. MODULE 21: SAMPLE REQUEST MANAGEMENT
    // ==========================================================================
    const samplesTableBody = document.getElementById("samplesTableBody");

    function renderSamples() {
        if (!samplesTableBody) return;
        const samples = store.getSampleRequests();

        if (samples.length === 0) {
            samplesTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px;">No sample requests found.</td></tr>`;
            return;
        }

        samplesTableBody.innerHTML = samples.map(s => {
            const badgeClass = getStatusBadgeClass(s.status);
            const dispatchCol = s.dispatchDetails
                ? `<div><strong>${escapeHtml(s.dispatchDetails.courier)}</strong><br/><span style="font-family: monospace; font-size: 0.75rem;">AWB: ${escapeHtml(s.dispatchDetails.trackingNumber)}</span></div>`
                : `<span style="color: var(--text-muted); font-size: 0.8rem;">Not dispatched yet</span>`;

            return `
                <tr>
                    <td><strong>${s.id}</strong></td>
                    <td>
                        <div style="font-weight: 700;">${escapeHtml(s.buyerName)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(s.buyerContact)}</div>
                    </td>
                    <td>${escapeHtml(s.productName)}</td>
                    <td style="font-weight: 600;">${escapeHtml(s.sampleQty)}</td>
                    <td style="font-size: 0.8rem; max-width: 180px;">${escapeHtml(s.deliveryAddress)}</td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${s.requestDate}</td>
                    <td><span class="badge-pill badge-${badgeClass}">${s.status}</span></td>
                    <td>${dispatchCol}</td>
                    <td>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            ${s.status === "Pending" ? `
                                <button type="button" class="btn btn-sm btn-secondary btn-approve-sample" data-id="${s.id}">✓ Approve</button>
                                <button type="button" class="btn btn-sm btn-outline btn-reject-sample" data-id="${s.id}" style="color: var(--danger);">✕</button>
                            ` : ""}
                            ${s.status === "Approved" ? `
                                <button type="button" class="btn btn-sm btn-primary btn-dispatch-sample-trigger" data-id="${s.id}">🚚 Dispatch</button>
                            ` : ""}
                            ${s.status === "Dispatched" ? `
                                <span style="font-size: 0.75rem; color: var(--success); font-weight: 600;">In Transit</span>
                            ` : ""}
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // Sample Dispatch Modal Handling
    const sampleDispatchId = document.getElementById("sampleDispatchId");
    const sampleDispatchRefLabel = document.getElementById("sampleDispatchRefLabel");
    const sampleCourier = document.getElementById("sampleCourier");
    const sampleTrackingNo = document.getElementById("sampleTrackingNo");
    const sampleArrivalDate = document.getElementById("sampleArrivalDate");
    const sampleNotes = document.getElementById("sampleNotes");
    const closeSampleDispatchModal = document.getElementById("closeSampleDispatchModal");
    const btnCancelSampleDispatch = document.getElementById("btnCancelSampleDispatch");
    const sampleDispatchForm = document.getElementById("sampleDispatchForm");

    if (samplesTableBody) {
        samplesTableBody.addEventListener("click", function (e) {
            const approveBtn = e.target.closest(".btn-approve-sample");
            if (approveBtn) {
                const sId = approveBtn.getAttribute("data-id");
                store.updateSampleStatus(sId, "Approved");
                renderSamples();
                showToast(`Sample request ${sId} approved. Ready for dispatch packaging.`, "success");
                return;
            }

            const rejectBtn = e.target.closest(".btn-reject-sample");
            if (rejectBtn) {
                const sId = rejectBtn.getAttribute("data-id");
                if (confirm(`Decline sample request ${sId}?`)) {
                    store.updateSampleStatus(sId, "Rejected");
                    renderSamples();
                    showToast(`Sample request ${sId} rejected.`, "warning");
                }
                return;
            }

            const dispatchBtn = e.target.closest(".btn-dispatch-sample-trigger");
            if (dispatchBtn) {
                const sId = dispatchBtn.getAttribute("data-id");
                sampleDispatchId.value = sId;
                sampleDispatchRefLabel.textContent = sId;
                sampleTrackingNo.value = "BD-" + Math.floor(10000000 + Math.random() * 90000000);
                const estDate = new Date();
                estDate.setDate(estDate.getDate() + 4);
                sampleArrivalDate.value = estDate.toISOString().split("T")[0];
                sampleDispatchModal.hidden = false;
            }
        });
    }

    if (closeSampleDispatchModal) closeSampleDispatchModal.addEventListener("click", () => sampleDispatchModal.hidden = true);
    if (btnCancelSampleDispatch) btnCancelSampleDispatch.addEventListener("click", () => sampleDispatchModal.hidden = true);

    if (sampleDispatchForm) {
        sampleDispatchForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const sId = sampleDispatchId.value;
            const courier = sampleCourier.value;
            const tracking = sampleTrackingNo.value.trim();
            const est = sampleArrivalDate.value;
            const notes = sampleNotes.value.trim();

            store.updateSampleStatus(sId, "Dispatched", {
                courier,
                trackingNumber: tracking,
                dispatchDate: new Date().toISOString().split("T")[0],
                estimatedArrival: est,
                notes
            });

            sampleDispatchModal.hidden = true;
            renderSamples();
            showToast(`Sample ${sId} dispatched via ${courier} (AWB: ${tracking})!`, "success");
        });
    }

    // ==========================================================================
    // 11. MODULE 22: SUPPLIER COLLABORATION NETWORK
    // ==========================================================================
    const collabTabs = document.getElementById("collabTabs");
    const collabDiscoverPane = document.getElementById("collabDiscoverPane");
    const collabRequestsPane = document.getElementById("collabRequestsPane");
    const collabSuppliersGrid = document.getElementById("collabSuppliersGrid");
    const collabRequestsTableBody = document.getElementById("collabRequestsTableBody");
    const btnOpenNewCollabModal = document.getElementById("btnOpenNewCollabModal");

    function renderCollaboration() {
        // Render Discover Suppliers
        if (collabSuppliersGrid) {
            const peers = store.getCollaborationSuppliers();
            collabSuppliersGrid.innerHTML = peers.map(p => `
                <article class="collab-card">
                    <div>
                        <div class="collab-header">
                            <div>
                                <h3 class="collab-title">${escapeHtml(p.businessName)}</h3>
                                <span class="collab-location">📍 ${escapeHtml(p.location)}</span>
                            </div>
                            <span class="badge-pill badge-active">${escapeHtml(p.trustTier)}</span>
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 8px;">${escapeHtml(p.specialization)}</p>
                        <div class="collab-capacity-box">
                            <strong>Surplus Capacity:</strong> ${escapeHtml(p.monthlySurplusCapacity)}
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
                            ${(p.categories || []).map(cat => `<span class="meta-chip">${escapeHtml(cat)}</span>`).join("")}
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm btn-primary btn-full btn-propose-collab-to" data-name="${escapeHtml(p.businessName)}">
                        🤝 Propose Joint Execution
                    </button>
                </article>
            `).join("");
        }

        // Render Collaboration Requests
        if (collabRequestsTableBody) {
            const reqs = store.getCollaborationRequests();
            if (reqs.length === 0) {
                collabRequestsTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px;">No collaboration requests recorded.</td></tr>`;
            } else {
                collabRequestsTableBody.innerHTML = reqs.map(r => {
                    const badgeClass = getStatusBadgeClass(r.status);
                    return `
                        <tr>
                            <td><strong>${r.id}</strong></td>
                            <td><span class="badge-pill ${r.type === 'received' ? 'badge-lowstock' : 'badge-shipped'}">${r.type.toUpperCase()}</span></td>
                            <td><strong>${escapeHtml(r.partnerName)}</strong></td>
                            <td>
                                <div>${escapeHtml(r.requirementTitle)}</div>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(r.notes || "")}</span>
                            </td>
                            <td>${escapeHtml(r.requiredQty)}</td>
                            <td style="font-size: 0.85rem; font-weight: 600;">${escapeHtml(r.proposedContribution)}</td>
                            <td style="font-size: 0.8rem; color: var(--text-muted);">${r.date}</td>
                            <td><span class="badge-pill badge-${badgeClass}">${r.status}</span></td>
                            <td>
                                ${r.type === "received" && r.status === "Pending" ? `
                                    <div style="display: flex; gap: 4px;">
                                        <button type="button" class="btn btn-sm btn-secondary btn-collab-accept" data-id="${r.id}">Accept</button>
                                        <button type="button" class="btn btn-sm btn-outline btn-collab-decline" data-id="${r.id}" style="color: var(--danger);">Decline</button>
                                    </div>
                                ` : `<span style="font-size: 0.8rem; color: var(--text-muted);">Completed</span>`}
                            </td>
                        </tr>
                    `;
                }).join("");
            }
        }
    }

    if (collabTabs) {
        collabTabs.addEventListener("click", function (e) {
            const btn = e.target.closest(".tab-btn");
            if (btn) {
                collabTabs.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const tab = btn.getAttribute("data-collab-tab");
                if (tab === "discover") {
                    collabDiscoverPane.style.display = "block";
                    collabRequestsPane.style.display = "none";
                } else {
                    collabDiscoverPane.style.display = "none";
                    collabRequestsPane.style.display = "block";
                }
            }
        });
    }

    // Propose Collaboration Modal
    const closeCollabModal = document.getElementById("closeCollabModal");
    const btnCancelCollabModal = document.getElementById("btnCancelCollabModal");
    const collabForm = document.getElementById("collabForm");
    const collabPartnerSelect = document.getElementById("collabPartnerSelect");

    if (btnOpenNewCollabModal) {
        btnOpenNewCollabModal.addEventListener("click", () => {
            collabModal.hidden = false;
        });
    }

    if (collabSuppliersGrid) {
        collabSuppliersGrid.addEventListener("click", function (e) {
            const btn = e.target.closest(".btn-propose-collab-to");
            if (btn) {
                const partnerName = btn.getAttribute("data-name");
                if (collabPartnerSelect) collabPartnerSelect.value = partnerName;
                collabModal.hidden = false;
            }
        });
    }

    if (closeCollabModal) closeCollabModal.addEventListener("click", () => collabModal.hidden = true);
    if (btnCancelCollabModal) btnCancelCollabModal.addEventListener("click", () => collabModal.hidden = true);

    if (collabForm) {
        collabForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const partnerName = collabPartnerSelect.value;
            const category = document.getElementById("collabCategory").value.trim();
            const title = document.getElementById("collabTitle").value.trim();
            const reqQty = document.getElementById("collabReqQty").value.trim();
            const proposed = document.getElementById("collabProposed").value.trim();
            const notes = document.getElementById("collabNotes").value.trim();

            store.saveCollaborationRequest({
                partnerName,
                productCategory: category,
                requirementTitle: title,
                requiredQty: reqQty,
                proposedContribution: proposed,
                notes
            });

            collabModal.hidden = true;
            renderCollaboration();
            showToast(`Collaboration proposal dispatched to ${partnerName}!`, "success");
        });
    }

    if (collabRequestsTableBody) {
        collabRequestsTableBody.addEventListener("click", function (e) {
            const acceptBtn = e.target.closest(".btn-collab-accept");
            if (acceptBtn) {
                const id = acceptBtn.getAttribute("data-id");
                store.updateCollaborationStatus(id, "Accepted");
                renderCollaboration();
                showToast(`Collaboration proposal ${id} accepted!`, "success");
                return;
            }

            const declineBtn = e.target.closest(".btn-collab-decline");
            if (declineBtn) {
                const id = declineBtn.getAttribute("data-id");
                store.updateCollaborationStatus(id, "Declined");
                renderCollaboration();
                showToast(`Collaboration proposal ${id} declined.`, "warning");
            }
        });
    }

    // ==========================================================================
    // 12. MODULE 23: BUYER COMMUNICATION (CHAT)
    // ==========================================================================
    const chatThreadsContainer = document.getElementById("chatThreadsContainer");
    const chatMessagesStream = document.getElementById("chatMessagesStream");
    const activeChatBuyerName = document.getElementById("activeChatBuyerName");
    const activeChatContactPerson = document.getElementById("activeChatContactPerson");
    const activeChatContextBadge = document.getElementById("activeChatContextBadge");
    const chatMessageForm = document.getElementById("chatMessageForm");
    const chatMessageInput = document.getElementById("chatMessageInput");
    const chatSearchInput = document.getElementById("chatSearchInput");

    let currentConversationId = "CONV-01";

    function renderChat() {
        const conversations = store.getConversations();
        const search = (chatSearchInput ? chatSearchInput.value : "").toLowerCase().trim();

        let filtered = conversations;
        if (search) {
            filtered = conversations.filter(c =>
                c.buyerName.toLowerCase().includes(search) ||
                c.lastMessage.toLowerCase().includes(search)
            );
        }

        // Render Threads
        if (chatThreadsContainer) {
            chatThreadsContainer.innerHTML = filtered.map(c => `
                <div class="thread-item ${c.id === currentConversationId ? 'active' : ''}" data-conv-id="${c.id}">
                    <div class="thread-avatar">${c.avatar || c.buyerName.charAt(0)}</div>
                    <div class="thread-content">
                        <div class="thread-top-row">
                            <span class="thread-name">${escapeHtml(c.buyerName)}</span>
                            <span class="thread-time">${escapeHtml(c.lastTimestamp)}</span>
                        </div>
                        <p class="thread-snippet">${escapeHtml(c.lastMessage)}</p>
                    </div>
                </div>
            `).join("");
        }

        // Render Active Thread Messages
        const activeConv = store.getConversationById(currentConversationId) || conversations[0];
        if (activeConv) {
            currentConversationId = activeConv.id;
            if (activeChatBuyerName) activeChatBuyerName.textContent = activeConv.buyerName;
            if (activeChatContactPerson) activeChatContactPerson.textContent = activeConv.contactPerson || "Lead Sourcing";
            if (activeChatContextBadge) {
                activeChatContextBadge.textContent = activeConv.context
                    ? `Context: ${activeConv.context.ref} (${activeConv.context.product})`
                    : "General Discussion";
            }

            if (chatMessagesStream) {
                chatMessagesStream.innerHTML = (activeConv.messages || []).map(m => `
                    <div class="chat-bubble ${m.sender}">
                        <div>${escapeHtml(m.text)}</div>
                        <span class="chat-time-tick">${escapeHtml(m.time)} ${m.sender === 'supplier' ? '✓✓' : ''}</span>
                    </div>
                `).join("");
                chatMessagesStream.scrollTop = chatMessagesStream.scrollHeight;
            }
        }
    }

    if (chatThreadsContainer) {
        chatThreadsContainer.addEventListener("click", function (e) {
            const item = e.target.closest(".thread-item");
            if (item) {
                currentConversationId = item.getAttribute("data-conv-id");
                renderChat();
            }
        });
    }

    if (chatSearchInput) chatSearchInput.addEventListener("input", renderChat);

    if (chatMessageForm) {
        chatMessageForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const text = chatMessageInput.value.trim();
            if (!text) return;

            store.sendMessage(currentConversationId, text, "supplier");
            chatMessageInput.value = "";
            renderChat();
        });
    }

    // Quick Replies
    document.addEventListener("click", function (e) {
        const quickBtn = e.target.closest(".quick-reply-chip");
        if (quickBtn) {
            const reply = quickBtn.getAttribute("data-reply");
            if (reply) {
                store.sendMessage(currentConversationId, reply, "supplier");
                renderChat();
            }
        }
    });

    // ==========================================================================
    // 13. MODULE 24: ORDER MANAGEMENT
    // ==========================================================================
    const ordersTableBody = document.getElementById("ordersTableBody");
    const orderStatusTabs = document.getElementById("orderStatusTabs");
    const ordersSearchInput = document.getElementById("ordersSearchInput");
    let activeOrderFilter = "all";

    function renderOrders() {
        if (!ordersTableBody) return;
        let orders = store.getOrders();
        const search = (ordersSearchInput ? ordersSearchInput.value : "").toLowerCase().trim();

        if (activeOrderFilter !== "all") {
            orders = orders.filter(o => o.status === activeOrderFilter);
        }

        if (search) {
            orders = orders.filter(o =>
                o.id.toLowerCase().includes(search) ||
                o.buyerName.toLowerCase().includes(search) ||
                o.productName.toLowerCase().includes(search)
            );
        }

        if (orders.length === 0) {
            ordersTableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 24px;">No orders found in this status filter.</td></tr>`;
            return;
        }

        ordersTableBody.innerHTML = orders.map(ord => {
            const badgeClass = getStatusBadgeClass(ord.status);
            return `
                <tr>
                    <td><strong>#${ord.id}</strong></td>
                    <td>
                        <div style="font-weight: 700;">${escapeHtml(ord.buyerName)}</div>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(ord.buyerContact)}</span>
                    </td>
                    <td>${escapeHtml(ord.productName)}</td>
                    <td>${ord.orderedQty} ${escapeHtml(ord.uom || "Units")}</td>
                    <td style="font-weight: 700; color: var(--text);">$${(ord.totalAmount || ord.orderAmount || 0).toFixed(2)}</td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${ord.orderDate}</td>
                    <td style="font-size: 0.8rem; font-weight: 600;">${ord.expectedDeliveryDate}</td>
                    <td><span class="badge-pill badge-escrow">${escapeHtml(ord.paymentStatus || "Escrow Protected")}</span></td>
                    <td><span class="badge-pill badge-${badgeClass}">${ord.status}</span></td>
                    <td>
                        <div class="table-action-group">
                            <button type="button" class="btn btn-sm btn-secondary btn-order-advance" data-id="${ord.id}">
                                ⚡ Next Step
                            </button>
                            <button type="button" class="btn btn-sm btn-outline btn-view-invoice" data-order-id="${ord.id}" title="View Invoice">
                                🧾 Invoice
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    if (orderStatusTabs) {
        orderStatusTabs.addEventListener("click", function (e) {
            const btn = e.target.closest(".tab-btn");
            if (btn) {
                orderStatusTabs.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeOrderFilter = btn.getAttribute("data-status");
                renderOrders();
            }
        });
    }

    if (ordersSearchInput) ordersSearchInput.addEventListener("input", renderOrders);

    if (ordersTableBody) {
        ordersTableBody.addEventListener("click", function (e) {
            const advanceBtn = e.target.closest(".btn-order-advance");
            if (advanceBtn) {
                const orderId = advanceBtn.getAttribute("data-id");
                const ord = store.getOrderById(orderId);
                if (!ord) return;

                let nextStatus = "In Production";
                if (ord.status === "Confirmed") nextStatus = "In Production";
                else if (ord.status === "In Production") nextStatus = "Shipped";
                else if (ord.status === "Shipped") nextStatus = "Delivered";
                else if (ord.status === "Delivered") {
                    showToast("Order is already Delivered and completed!", "info");
                    return;
                }

                store.updateOrderStatus(orderId, nextStatus);
                renderOrders();
                showToast(`Order #${orderId} moved to milestone: ${nextStatus}!`, "success");
                return;
            }

            const invoiceBtn = e.target.closest(".btn-view-invoice");
            if (invoiceBtn) {
                const orderId = invoiceBtn.getAttribute("data-order-id");
                openInvoiceModal(orderId);
            }
        });
    }

    // ==========================================================================
    // 14. MODULE 25: PAYMENTS & INVOICES
    // ==========================================================================
    const paymentsTableBody = document.getElementById("paymentsTableBody");

    let currentPaymentFilter = "all";

    function renderPayments(filterStatus = null) {
        if (!paymentsTableBody) return;
        if (filterStatus !== null) {
            currentPaymentFilter = filterStatus;
        }

        let payments = store.getPayments();
        if (currentPaymentFilter !== "all") {
            payments = payments.filter(p => p.status === currentPaymentFilter);
        }

        if (payments.length === 0) {
            paymentsTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px;">No transactions found under "${currentPaymentFilter}" status.</td></tr>`;
            return;
        }

        paymentsTableBody.innerHTML = payments.map(p => {
            const isReleased = p.status === "Released";
            return `
                <tr>
                    <td><strong>${p.id}</strong></td>
                    <td><span class="rfq-ref-code">#${p.orderRef}</span></td>
                    <td>${escapeHtml(p.buyerName)}</td>
                    <td style="font-weight: 700; color: var(--text);">$${(p.amount || 0).toFixed(2)}</td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${p.date}</td>
                    <td style="font-size: 0.85rem;">${escapeHtml(p.method)}</td>
                    <td><span class="badge-pill ${isReleased ? 'badge-released' : 'badge-escrow'}">${p.status}</span></td>
                    <td><span style="font-family: monospace; font-size: 0.8rem; font-weight: 700;">${p.invoiceRef}</span></td>
                    <td>
                        <button type="button" class="btn btn-sm btn-secondary btn-open-invoice-modal" data-order-id="${p.orderRef}">
                            🧾 View Invoice
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // Payments KPI Cards click filtering
    const cardFinEscrow = document.getElementById("cardFinEscrow");
    if (cardFinEscrow) {
        cardFinEscrow.addEventListener("click", () => {
            renderPayments("Escrow");
            showToast("Filtering In-Escrow transactions", "info");
        });
    }
    const cardFinReleased = document.getElementById("cardFinReleased");
    if (cardFinReleased) {
        cardFinReleased.addEventListener("click", () => {
            renderPayments("Released");
            showToast("Filtering Released transactions", "info");
        });
    }
    const cardFinPending = document.getElementById("cardFinPending");
    if (cardFinPending) {
        cardFinPending.addEventListener("click", () => {
            renderPayments("Escrow");
            showToast("Filtering In-Escrow transactions", "info");
        });
    }
    const cardFinTotal = document.getElementById("cardFinTotal");
    if (cardFinTotal) {
        cardFinTotal.addEventListener("click", () => {
            renderPayments("all");
            showToast("Showing all transactions", "info");
        });
    }

    if (paymentsTableBody) {
        paymentsTableBody.addEventListener("click", function (e) {
            const btn = e.target.closest(".btn-open-invoice-modal");
            if (btn) {
                const orderId = btn.getAttribute("data-order-id");
                openInvoiceModal(orderId);
            }
        });
    }

    // Formal Tax Invoice Modal
    const invoiceModalBody = document.getElementById("invoiceModalBody");
    const closeInvoiceModal = document.getElementById("closeInvoiceModal");
    const btnCloseInvoiceBtn = document.getElementById("btnCloseInvoiceBtn");
    const btnPrintInvoice = document.getElementById("btnPrintInvoice");

    function openInvoiceModal(orderId) {
        const ord = store.getOrderById(orderId) || store.getOrders()[0];
        const biz = store.getBusinessProfile();
        const pmt = store.getPaymentByOrder(ord.id);

        invoiceModalBody.innerHTML = `
            <div class="invoice-paper">
                <div class="invoice-header-row">
                    <div class="invoice-logo-group">
                        <img src="../../images/TradeNest.webp" alt="TradeNest" />
                        <div style="font-weight: 700; font-size: 1.1rem; color: var(--primary-dark);">${escapeHtml(biz.businessName)}</div>
                        <div style="font-size: 0.8rem; color: var(--text-light); max-width: 320px;">${escapeHtml(biz.registeredAddress)}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">GSTIN: <strong>${biz.gstin}</strong> | PAN: <strong>${biz.pan}</strong></div>
                    </div>
                    <div class="invoice-title-block">
                        <h2>TAX INVOICE</h2>
                        <div style="font-family: monospace; font-weight: 700; font-size: 1rem;">${pmt ? pmt.invoiceRef : 'INV-2026-091'}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">Invoice Date: ${ord.orderDate}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">Order Ref: #${ord.id}</div>
                    </div>
                </div>

                <div class="invoice-grid-parties">
                    <div>
                        <strong style="color: var(--primary-dark); font-size: 0.85rem; text-transform: uppercase;">Billed To / Consignee:</strong>
                        <div style="font-size: 1.05rem; font-weight: 700; color: var(--text);">${escapeHtml(ord.buyerName)}</div>
                        <div style="font-size: 0.85rem; color: var(--text-light);">${escapeHtml(ord.deliveryAddress)}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Buyer Contact: ${escapeHtml(ord.buyerContact)}</div>
                    </div>
                    <div>
                        <strong style="color: var(--primary-dark); font-size: 0.85rem; text-transform: uppercase;">Payment &amp; Logistics:</strong>
                        <div style="font-size: 0.85rem;">Payment Terms: <strong>TradeShield B2B Escrow</strong></div>
                        <div style="font-size: 0.85rem;">Status: <strong style="color: var(--success);">${escapeHtml(ord.paymentStatus || 'Escrow Protected')}</strong></div>
                        <div style="font-size: 0.85rem;">Expected Delivery: <strong>${ord.expectedDeliveryDate}</strong></div>
                        <div style="font-size: 0.85rem;">Place of Supply: <strong>Interstate / Export Commercial</strong></div>
                    </div>
                </div>

                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Item Description</th>
                            <th>HSN Code</th>
                            <th>Qty</th>
                            <th>Unit Rate</th>
                            <th>Total ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>${escapeHtml(ord.productName)}</strong>
                                <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">SKU: ${escapeHtml(ord.productSku || 'SKU-IND-GLV-01')}</div>
                            </td>
                            <td>HSN-6116</td>
                            <td>${ord.orderedQty} ${ord.uom || 'Units'}</td>
                            <td>$${(ord.unitPrice || 4.90).toFixed(2)}</td>
                            <td style="font-weight: 700;">$${(ord.orderAmount || 2450.00).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="invoice-summary-block">
                    <table class="invoice-summary-table">
                        <tr>
                            <td>Taxable Value:</td>
                            <td style="text-align: right; font-weight: 600;">$${(ord.orderAmount || 2450.00).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>IGST / Tax (8%):</td>
                            <td style="text-align: right; font-weight: 600;">$${(ord.taxAmount || 196.00).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Freight &amp; Handling:</td>
                            <td style="text-align: right; font-weight: 600;">$${(ord.shippingAmount || 110.00).toFixed(2)}</td>
                        </tr>
                        <tr class="grand-total">
                            <td>Total Invoice Value:</td>
                            <td style="text-align: right;">$${(ord.totalAmount || 2756.00).toFixed(2)}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin-top: 24px; padding-top: 14px; border-top: 1px dashed var(--border); font-size: 0.775rem; color: var(--text-muted);">
                    * Computer generated demonstration tax invoice under TradeNest B2B Marketplace. No signature required. Simulation only.
                </div>
            </div>
        `;
        invoiceModal.hidden = false;
    }

    if (closeInvoiceModal) closeInvoiceModal.addEventListener("click", () => invoiceModal.hidden = true);
    if (btnCloseInvoiceBtn) btnCloseInvoiceBtn.addEventListener("click", () => invoiceModal.hidden = true);
    if (btnPrintInvoice) {
        btnPrintInvoice.addEventListener("click", () => {
            window.print();
        });
    }

    // ==========================================================================
    // 15. MODULE 26: SHIPPING AND DELIVERY
    // ==========================================================================
    const shipmentsTableBody = document.getElementById("shipmentsTableBody");
    const btnCreateShipmentModal = document.getElementById("btnCreateShipmentModal");
    const shipmentOrderSelect = document.getElementById("shipmentOrderSelect");
    const closeShipmentModal = document.getElementById("closeShipmentModal");
    const btnCancelShipmentModal = document.getElementById("btnCancelShipmentModal");
    const shipmentForm = document.getElementById("shipmentForm");

    function renderShipments() {
        if (!shipmentsTableBody) return;
        const shipments = store.getShipments();

        if (shipments.length === 0) {
            shipmentsTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px;">No shipments created yet.</td></tr>`;
            return;
        }

        shipmentsTableBody.innerHTML = shipments.map(s => {
            const badgeClass = getStatusBadgeClass(s.status);
            return `
                <tr>
                    <td><strong>${s.id}</strong></td>
                    <td><span class="rfq-ref-code">#${s.orderRef}</span></td>
                    <td>
                        <div style="font-weight: 700;">${escapeHtml(s.buyerName)}</div>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(s.deliveryAddress)}</span>
                    </td>
                    <td>${escapeHtml(s.courier)}</td>
                    <td style="font-family: monospace; font-weight: 700; color: var(--primary-dark);">${escapeHtml(s.trackingNumber)}</td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${s.dispatchDate}</td>
                    <td style="font-size: 0.8rem; font-weight: 600;">${s.expectedDeliveryDate}</td>
                    <td><span class="badge-pill badge-${badgeClass}">${s.status}</span></td>
                    <td>
                        <button type="button" class="btn btn-sm btn-secondary btn-advance-shipment" data-id="${s.id}">
                            🚚 Advance Tracking
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    if (btnCreateShipmentModal) {
        btnCreateShipmentModal.addEventListener("click", () => {
            const orders = store.getOrders().filter(o => o.status !== "Delivered");
            if (orders.length === 0) {
                showToast("All active orders have already been delivered!", "info");
                return;
            }

            shipmentOrderSelect.innerHTML = orders.map(o => `
                <option value="${o.id}" data-buyer="${escapeHtml(o.buyerName)}" data-addr="${escapeHtml(o.deliveryAddress)}">
                    Order #${o.id} - ${escapeHtml(o.buyerName)} (${escapeHtml(o.productName)})
                </option>
            `).join("");

            document.getElementById("shipmentTrackingNo").value = "BLU-" + Math.floor(10000000 + Math.random() * 90000000);
            const est = new Date();
            est.setDate(est.getDate() + 7);
            document.getElementById("shipmentExpectedDelivery").value = est.toISOString().split("T")[0];
            document.getElementById("shipmentAddress").value = orders[0].deliveryAddress;

            shipmentModal.hidden = false;
        });
    }

    if (shipmentOrderSelect) {
        shipmentOrderSelect.addEventListener("change", function () {
            const opt = shipmentOrderSelect.selectedOptions[0];
            if (opt) {
                document.getElementById("shipmentAddress").value = opt.getAttribute("data-addr");
            }
        });
    }

    if (closeShipmentModal) closeShipmentModal.addEventListener("click", () => shipmentModal.hidden = true);
    if (btnCancelShipmentModal) btnCancelShipmentModal.addEventListener("click", () => shipmentModal.hidden = true);

    if (shipmentForm) {
        shipmentForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const orderRef = shipmentOrderSelect.value;
            const opt = shipmentOrderSelect.selectedOptions[0];
            const buyerName = opt ? opt.getAttribute("data-buyer") : "Buyer";
            const courier = document.getElementById("shipmentCourier").value;
            const trackingNumber = document.getElementById("shipmentTrackingNo").value.trim();
            const expectedDeliveryDate = document.getElementById("shipmentExpectedDelivery").value;
            const deliveryAddress = document.getElementById("shipmentAddress").value.trim();

            store.createShipment({
                orderRef,
                buyerName,
                courier,
                trackingNumber,
                expectedDeliveryDate,
                deliveryAddress
            });

            shipmentModal.hidden = true;
            renderShipments();
            renderOrders();
            showToast(`Shipment dispatched for Order #${orderRef} via ${courier}!`, "success");
        });
    }

    if (shipmentsTableBody) {
        shipmentsTableBody.addEventListener("click", function (e) {
            const advBtn = e.target.closest(".btn-advance-shipment");
            if (advBtn) {
                const sId = advBtn.getAttribute("data-id");
                const s = store.getShipmentById(sId);
                if (!s) return;

                let next = "In Transit";
                if (s.status === "Dispatched") next = "In Transit";
                else if (s.status === "In Transit") next = "Out for Delivery";
                else if (s.status === "Out for Delivery") next = "Delivered";
                else if (s.status === "Delivered") {
                    showToast("Shipment is already delivered!", "info");
                    return;
                }

                store.updateShipmentStatus(sId, next);
                renderShipments();
                renderOrders();
                showToast(`Shipment ${sId} updated to milestone: ${next}!`, "success");
            }
        });
    }

    // ==========================================================================
    // 16. MODULE 27: PERFORMANCE AND TRUST SCORE
    // ==========================================================================
    function renderPerformance() {
        const metrics = store.calculateTrustMetrics();
        const reviews = store.getReviews();

        const perfTrustScoreNum = document.getElementById("perfTrustScoreNum");
        const perfTierBadge = document.getElementById("perfTierBadge");
        const metricFulfilmentRate = document.getElementById("metricFulfilmentRate");
        const metricOnTimeDelivery = document.getElementById("metricOnTimeDelivery");
        const metricResponseTime = document.getElementById("metricResponseTime");
        const metricCompletedOrders = document.getElementById("metricCompletedOrders");

        if (perfTrustScoreNum) perfTrustScoreNum.textContent = metrics.trustScore;
        if (perfTierBadge) perfTierBadge.textContent = metrics.tier.toUpperCase();
        if (metricFulfilmentRate) metricFulfilmentRate.textContent = metrics.fulfilmentRate;
        if (metricOnTimeDelivery) metricOnTimeDelivery.textContent = metrics.onTimeDeliveryRate;
        if (metricResponseTime) metricResponseTime.textContent = metrics.avgResponseTime;
        if (metricCompletedOrders) metricCompletedOrders.textContent = metrics.completedOrdersCount || "142";

        // Render Reviews
        const perfReviewsList = document.getElementById("perfReviewsList");
        if (perfReviewsList) {
            perfReviewsList.innerHTML = reviews.map(rev => {
                const revKey = rev.id || rev.buyerName.replace(/\s+/g, "_");
                return `
                <div class="activity-item">
                    <div class="activity-icon-wrap" style="color: #b48645;">★</div>
                    <div class="activity-content">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                            <strong>${escapeHtml(rev.buyerName)}</strong>
                            <span style="font-size: 0.8rem; color: #b48645; font-weight: 700;">★ ${rev.rating} / 5</span>
                        </div>
                        <p class="activity-text">${escapeHtml(rev.comment)}</p>
                        <span class="activity-time">${rev.date}</span>

                        <div style="margin-top: 8px;">
                            ${rev.reply ? `
                                <div style="background: rgba(122,92,82,0.06); border-left: 3px solid var(--primary); padding: 6px 10px; border-radius: 4px; font-size: 0.8rem; margin-top: 4px;">
                                    <strong>Your Response:</strong> ${escapeHtml(rev.reply)}
                                </div>
                            ` : `
                                <button type="button" class="btn btn-sm btn-outline btn-reply-review" data-rev-id="${revKey}" style="font-size: 0.75rem; padding: 3px 8px;">
                                    💬 Reply to Buyer
                                </button>
                                <div class="review-reply-form" id="replyForm-${revKey}" style="display: none; margin-top: 6px;">
                                    <div style="display: flex; gap: 8px;">
                                        <input type="text" class="form-control form-control-sm reply-input" placeholder="Type verified supplier response..." style="font-size: 0.8rem; padding: 5px 10px;" />
                                        <button type="button" class="btn btn-sm btn-primary btn-submit-review-reply" data-rev-id="${revKey}">Send</button>
                                    </div>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `}).join("");
        }
    }

    const perfReviewsList = document.getElementById("perfReviewsList");
    if (perfReviewsList) {
        perfReviewsList.addEventListener("click", function (e) {
            const toggleBtn = e.target.closest(".btn-reply-review");
            if (toggleBtn) {
                const revId = toggleBtn.getAttribute("data-rev-id");
                const form = document.getElementById(`replyForm-${revId}`);
                if (form) {
                    form.style.display = form.style.display === "none" ? "block" : "none";
                }
                return;
            }

            const submitBtn = e.target.closest(".btn-submit-review-reply");
            if (submitBtn) {
                const revId = submitBtn.getAttribute("data-rev-id");
                const form = document.getElementById(`replyForm-${revId}`);
                if (form) {
                    const input = form.querySelector(".reply-input");
                    const text = input ? input.value.trim() : "";
                    if (!text) {
                        showToast("Please enter a reply message.", "warning");
                        return;
                    }
                    const reviews = store.getReviews();
                    const targetRev = reviews.find(r => (r.id || r.buyerName.replace(/\s+/g, "_")) === revId);
                    if (targetRev) {
                        targetRev.reply = text;
                        renderPerformance();
                        showToast("Reply published to buyer review!", "success");
                    }
                }
            }
        });
    }

    // ==========================================================================
    // 17. MODULE 28: SETTINGS & PREFERENCES
    // ==========================================================================
    function renderSettings() {
        const set = store.getSettings();
        const setRfqEmail = document.getElementById("setRfqEmail");
        const setSmsAlerts = document.getElementById("setSmsAlerts");
        const setLowStockAlerts = document.getElementById("setLowStockAlerts");
        const setMarketingAlerts = document.getElementById("setMarketingAlerts");
        const setCurrency = document.getElementById("setCurrency");
        const setTimezone = document.getElementById("setTimezone");

        if (setRfqEmail) setRfqEmail.checked = set.rfqInstantAlert !== false;
        if (setSmsAlerts) setSmsAlerts.checked = set.smsAlerts !== false;
        if (setLowStockAlerts) setLowStockAlerts.checked = set.lowStockThresholdAlert !== false;
        if (setMarketingAlerts) setMarketingAlerts.checked = !!set.marketingUpdates;
        if (setCurrency) setCurrency.value = set.currency || "USD ($)";
        if (setTimezone) setTimezone.value = set.timezone || "GMT+5:30 (India Standard Time)";
    }

    const notificationSettingsForm = document.getElementById("notificationSettingsForm");
    if (notificationSettingsForm) {
        notificationSettingsForm.addEventListener("submit", function (e) {
            e.preventDefault();
            store.saveSettings({
                rfqInstantAlert: document.getElementById("setRfqEmail").checked,
                smsAlerts: document.getElementById("setSmsAlerts").checked,
                lowStockThresholdAlert: document.getElementById("setLowStockAlerts").checked,
                marketingUpdates: document.getElementById("setMarketingAlerts").checked
            });
            showToast("Notification preferences saved successfully!", "success");
        });
    }

    const operationalSettingsForm = document.getElementById("operationalSettingsForm");
    if (operationalSettingsForm) {
        operationalSettingsForm.addEventListener("submit", function (e) {
            e.preventDefault();
            store.saveSettings({
                currency: document.getElementById("setCurrency").value,
                timezone: document.getElementById("setTimezone").value
            });
            showToast("Operational settings saved successfully!", "success");
        });
    }

    // ==========================================================================
    // 18. TOPBAR & USER PROFILE INTEGRATION
    // ==========================================================================
    function updateTopBarProfile() {
        const currentUser = getLoggedInUser();
        const biz = store.getBusinessProfile();

        const name = currentUser ? (currentUser.fullName || currentUser.name || "Supplier Name") : biz.contactPerson;
        const comp = currentUser ? (currentUser.businessName || currentUser.company || biz.businessName) : biz.businessName;
        const initial = name.charAt(0).toUpperCase();

        if (profileAvatar) profileAvatar.textContent = initial;
        if (dropdownAvatar) dropdownAvatar.textContent = initial;
        if (profileName) profileName.textContent = name;
        if (dropdownName) dropdownName.textContent = name;
        if (dropdownEmail) dropdownEmail.textContent = currentUser ? currentUser.email : biz.email;
        if (profileCompany) profileCompany.textContent = comp;
        if (profileGstin) profileGstin.textContent = biz.gstin;
        if (welcomeUserName) welcomeUserName.textContent = name.split(" ")[0];
    }

    function getLoggedInUser() {
        try {
            const raw = localStorage.getItem("tradenestCurrentUser");
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    // ==========================================================================
    // NOTIFICATION CENTER
    // ==========================================================================
    const notificationButton = document.getElementById("notificationButton");
    const notificationDropdown = document.getElementById("notificationDropdown");
    const notificationMenu = document.getElementById("notificationMenu");
    const notifUnreadBadge = document.getElementById("notifUnreadBadge");
    const btnMarkAllNotifsRead = document.getElementById("btnMarkAllNotifsRead");
    const btnClearAllNotifs = document.getElementById("btnClearAllNotifs");
    const notificationDropdownList = document.getElementById("notificationDropdownList");

    let notifications = [
        {
            id: "notif-1",
            icon: "📥",
            title: "New RFQ Received",
            desc: "Metro Retail Solutions requested quote for 2,000 units Nitrile Gloves",
            time: "10 mins ago",
            view: "rfqs",
            unread: true
        },
        {
            id: "notif-2",
            icon: "💰",
            title: "TradeShield Escrow Funded",
            desc: "Payment of $6,284.00 funded in escrow for Order #ORD-2026-1049",
            time: "1 hour ago",
            view: "payments",
            unread: true
        },
        {
            id: "notif-3",
            icon: "⚠️",
            title: "Low Inventory Warning",
            desc: "Nitrile Industrial Gloves stock is below minimum threshold (200 units)",
            time: "3 hours ago",
            view: "inventory",
            unread: true
        },
        {
            id: "notif-4",
            icon: "⭐",
            title: "New 5-Star Buyer Review",
            desc: "BuildCraft Logistics rated order: 'Exceptional packing and prompt dispatch!'",
            time: "Yesterday",
            view: "performance",
            unread: false
        }
    ];

    function renderNotifications() {
        if (!notificationDropdownList) return;
        const unreadCount = notifications.filter(n => n.unread).length;
        if (globalNotificationBadge) {
            globalNotificationBadge.textContent = unreadCount;
            globalNotificationBadge.style.display = unreadCount > 0 ? "inline-flex" : "none";
        }
        if (notifUnreadBadge) {
            notifUnreadBadge.textContent = unreadCount > 0 ? `${unreadCount} New` : "All Read";
        }

        if (notifications.length === 0) {
            notificationDropdownList.innerHTML = `
                <div style="padding: 28px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                    <div>🔔</div>
                    <div style="margin-top: 6px;">No notifications at this time</div>
                </div>
            `;
            return;
        }

        notificationDropdownList.innerHTML = notifications.map(n => `
            <div class="notification-item ${n.unread ? 'unread' : ''}" data-view="${n.view}" data-id="${n.id}">
                <div class="notif-icon-wrap" aria-hidden="true">${n.icon}</div>
                <div class="notif-item-content">
                    <div class="notif-item-title">${escapeHtml(n.title)}</div>
                    <div class="notif-item-desc">${escapeHtml(n.desc)}</div>
                    <div class="notif-item-time">${escapeHtml(n.time)}</div>
                </div>
            </div>
        `).join("");
    }

    function closeNotificationDropdown() {
        if (notificationDropdown) notificationDropdown.hidden = true;
        if (notificationButton) notificationButton.setAttribute("aria-expanded", "false");
    }

    if (notificationButton) {
        notificationButton.addEventListener("click", function (e) {
            e.stopPropagation();
            closeProfileDropdown();
            const isHidden = notificationDropdown.hidden;
            notificationDropdown.hidden = !isHidden;
            notificationButton.setAttribute("aria-expanded", String(isHidden));
        });
    }

    if (notificationDropdownList) {
        notificationDropdownList.addEventListener("click", function (e) {
            const item = e.target.closest(".notification-item");
            if (item) {
                const notifId = item.getAttribute("data-id");
                const view = item.getAttribute("data-view");
                const targetNotif = notifications.find(n => n.id === notifId);
                if (targetNotif) targetNotif.unread = false;
                renderNotifications();
                closeNotificationDropdown();
                if (view) switchView(view);
            }
        });
    }

    if (btnMarkAllNotifsRead) {
        btnMarkAllNotifsRead.addEventListener("click", function (e) {
            e.stopPropagation();
            notifications.forEach(n => n.unread = false);
            renderNotifications();
            showToast("All notifications marked as read", "info");
        });
    }

    if (btnClearAllNotifs) {
        btnClearAllNotifs.addEventListener("click", function (e) {
            e.stopPropagation();
            notifications = [];
            renderNotifications();
            showToast("Notification list cleared", "info");
        });
    }

    // ==========================================================================
    // MODAL DISMISSAL & ESCAPE KEY ACCESSIBILITY
    // ==========================================================================
    function closeAllModals() {
        document.querySelectorAll(".module-modal-overlay").forEach(overlay => {
            overlay.hidden = true;
        });
    }

    // Modal backdrop click
    document.querySelectorAll(".module-modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) {
                overlay.hidden = true;
            }
        });
    });

    // Global Escape Key Listener (window & document)
    function handleGlobalEscape(e) {
        if (e.key === "Escape") {
            closeAllModals();
            closeProfileDropdown();
            closeNotificationDropdown();
        }
    }
    window.addEventListener("keydown", handleGlobalEscape);
    document.addEventListener("keydown", handleGlobalEscape);

    function closeProfileDropdown() {
        if (profileDropdown) profileDropdown.hidden = true;
        if (profileButton) profileButton.setAttribute("aria-expanded", "false");
    }

    if (profileButton) {
        profileButton.addEventListener("click", function (e) {
            e.stopPropagation();
            closeNotificationDropdown();
            const isExpanded = profileButton.getAttribute("aria-expanded") === "true";
            profileButton.setAttribute("aria-expanded", String(!isExpanded));
            profileDropdown.hidden = isExpanded;
        });
    }

    document.addEventListener("click", function (e) {
        if (profileMenu && !profileMenu.contains(e.target)) {
            closeProfileDropdown();
        }
        if (notificationMenu && !notificationMenu.contains(e.target)) {
            closeNotificationDropdown();
        }
    });

    // Mobile sidebar toggle
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", function () {
            sidebar.classList.toggle("open");
        });
    }

    // Navbar search global filter & live search
    if (navbarSearch) {
        navbarSearch.addEventListener("input", function () {
            const q = navbarSearch.value.trim().toLowerCase();
            const currentHash = window.location.hash.replace("#", "") || "overview";
            if (currentHash === "products" && productSearchInput) {
                productSearchInput.value = q;
                renderProducts();
            } else if (currentHash === "orders" && ordersSearchInput) {
                ordersSearchInput.value = q;
                renderOrders();
            } else if (currentHash === "rfqs" && rfqSearchInput) {
                rfqSearchInput.value = q;
                renderRFQs();
            } else if (currentHash === "inventory" && inventorySearchInput) {
                inventorySearchInput.value = q;
                renderInventory();
            }
        });

        navbarSearch.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                const query = navbarSearch.value.trim();
                if (!query) return;
                switchView("products");
                if (productSearchInput) {
                    productSearchInput.value = query;
                    renderProducts();
                }
                showToast(`Search results for "${query}"`, "info");
            }
        });
    }

    // Logout
    function handleLogout(e) {
        if (e) e.preventDefault();
        if (confirm("Are you sure you want to log out of the Supplier Workspace?")) {
            localStorage.removeItem("tradenestCurrentUser");
            sessionStorage.clear();
            window.location.href = "../../auth/login.html";
        }
    }

    if (sidebarLogoutButton) sidebarLogoutButton.addEventListener("click", handleLogout);
    if (dropdownLogout) dropdownLogout.addEventListener("click", handleLogout);

    // ==========================================================================
    // 19. VIEW ROUTER DISPATCHER
    // ==========================================================================
    function renderActiveView(viewName) {
        switch (viewName) {
            case "overview":
                renderOverview();
                break;
            case "business-profile":
                renderBusinessProfile();
                break;
            case "products":
                renderProducts();
                break;
            case "inventory":
                renderInventory();
                break;
            case "rfqs":
                renderRFQs();
                break;
            case "quotations":
                renderQuotations();
                break;
            case "samples":
                renderSamples();
                break;
            case "collaboration":
                renderCollaboration();
                break;
            case "communication":
                renderChat();
                break;
            case "orders":
                renderOrders();
                break;
            case "payments":
                renderPayments();
                break;
            case "shipping":
                renderShipments();
                break;
            case "performance":
                renderPerformance();
                break;
            case "settings":
                renderSettings();
                break;
            default:
                renderOverview();
                break;
        }
    }

    // Helper: Badge classes
    function getStatusBadgeClass(status) {
        const s = String(status || "").toLowerCase().replace(/[^a-z]/g, "");
        if (["active", "instock", "accepted", "delivered", "released"].includes(s)) return s;
        if (["lowstock", "pending", "processing", "underreview", "escrow", "intransit"].includes(s)) return s;
        if (["outofstock", "declined", "rejected", "cancelled", "unavailable"].includes(s)) return s;
        if (["shipped", "dispatched", "quoted", "sent", "approved"].includes(s)) return s;
        return "pending";
    }

    function escapeHtml(str) {
        if (str === null || str === undefined) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Subscribe to store updates for automatic reactivity
    store.subscribe((moduleName) => {
        const hash = window.location.hash.replace("#", "") || "overview";
        renderOverview(); // Always keep stats updated
        renderActiveView(hash);
    });

    // ==========================================================================
    // 20. INITIALIZATION
    // ==========================================================================
    updateTopBarProfile();
    renderNotifications();

    const initialHash = window.location.hash.replace("#", "") || "overview";
    switchView(initialHash);
});