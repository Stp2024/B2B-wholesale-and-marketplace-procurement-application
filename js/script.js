/*
==========================================================
 TradeNest - Shared JavaScript
 Covers:
 - Shared navigation and active page state
 - Smooth scrolling
 - Back-to-top button
 - Product search, filters and sorting
 - Supplier search, filters and sorting
 - Discover Suppliers search
 - Contact form validation and demo submission
 - FAQ/details interaction
 - CTA handling
 - URL query parameters
 - Image fallback handling
 - Toast notifications
 - Basic accessibility helpers
 - Demo-only localStorage for recent searches
==========================================================
*/

"use strict";

document.addEventListener("DOMContentLoaded", function () {
    initSharedNavigation();
    initHomePageAuthState();
    initSmoothScrolling();
    initBackToTop();
    initHomeProductCatalog();
    initProductPage();
    initSupplierPage();
    initDiscoverSuppliersPage();
    initContactForm();
    initFAQ();
    initButtonsAndLinks();
    initImageFallbacks();
    initAccessibility();
    restoreSearchState();
});


/* =========================================================
   GENERAL HELPERS
========================================================= */

function $(selector, parent) {
    return (parent || document).querySelector(selector);
}

function $$(selector, parent) {
    return Array.from((parent || document).querySelectorAll(selector));
}

function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function escapeCatalogueText(value) {
    return String(value === null || value === undefined ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getNumber(value) {
    if (value === null || value === undefined) {
        return 0;
    }

    var cleaned = String(value)
        .replace(/₹/g, "")
        .replace(/,/g, "")
        .replace(/[^\d.]/g, "");

    var number = parseFloat(cleaned);

    return Number.isFinite(number) ? number : 0;
}

function getText(element, selector) {
    var child = selector ? $(selector, element) : element;

    return child ? child.textContent.trim() : "";
}


/* =========================================================
   TOAST NOTIFICATION
========================================================= */

function showToast(message, type) {
    var existing = $("#tradenest-toast");

    if (!existing) {
        existing = document.createElement("div");

        existing.id = "tradenest-toast";
        existing.setAttribute("role", "status");
        existing.setAttribute("aria-live", "polite");

        Object.assign(existing.style, {
            position: "fixed",
            right: "24px",
            bottom: "24px",
            zIndex: "9999",
            maxWidth: "360px",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "#29252b",
            color: "#ffffff",
            fontSize: "14px",
            lineHeight: "1.5",
            boxShadow: "0 10px 30px rgba(0,0,0,.18)",
            opacity: "0",
            transform: "translateY(12px)",
            transition:
                "opacity .25s ease, transform .25s ease"
        });

        document.body.appendChild(existing);
    }

    if (type === "error") {
        existing.style.background = "#8b3a3a";
    } else if (type === "success") {
        existing.style.background = "#496b55";
    } else {
        existing.style.background = "#29252b";
    }

    existing.textContent = message;

    existing.style.opacity = "1";
    existing.style.transform = "translateY(0)";

    clearTimeout(existing._toastTimer);

    existing._toastTimer = setTimeout(function () {
        existing.style.opacity = "0";
        existing.style.transform = "translateY(12px)";
    }, 3200);
}


/* =========================================================
   NO RESULTS MESSAGE
========================================================= */

function createNoResultsMessage(container, message) {
    var oldMessage = $(".tn-no-results", container);

    if (oldMessage) {
        oldMessage.remove();
    }

    var element = document.createElement("div");

    element.className = "tn-no-results";
    element.textContent =
        message || "No matching results found.";

    Object.assign(element.style, {
        gridColumn: "1 / -1",
        padding: "32px",
        textAlign: "center",
        borderRadius: "12px",
        background: "#f7f5f6",
        color: "#706a72",
        border: "1px solid #e5dfe4",
        marginTop: "10px"
    });

    container.appendChild(element);
}

function removeNoResultsMessage(container) {
    var oldMessage = $(".tn-no-results", container);

    if (oldMessage) {
        oldMessage.remove();
    }
}


/* =========================================================
   RECENT SEARCH STORAGE
========================================================= */

function saveRecentSearch(key, value) {
    if (!value) {
        return;
    }

    try {
        var saved = JSON.parse(
            localStorage.getItem("tradenest_" + key) || "[]"
        );

        if (!Array.isArray(saved)) {
            saved = [];
        }

        saved = saved.filter(function (item) {
            return item !== value;
        });

        saved.unshift(value);

        saved = saved.slice(0, 5);

        localStorage.setItem(
            "tradenest_" + key,
            JSON.stringify(saved)
        );
    } catch (error) {
        // localStorage is optional for this frontend demo.
    }
}


/* =========================================================
   SHARED NAVIGATION
========================================================= */

function initSharedNavigation() {
    var currentPath = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    if (!currentPath) {
        currentPath = "index.html";
    }

    $$(".nav-link, .main-navigation a, .nav-menu a").forEach(
        function (link) {
            var href = link.getAttribute("href");

            if (
                !href ||
                href === "#" ||
                href.indexOf("javascript:") === 0
            ) {
                return;
            }

            var linkPath = href
                .split("?")[0]
                .split("#")[0]
                .split("/")
                .pop()
                .toLowerCase();

            if (
                linkPath === currentPath &&
                currentPath !== "index.html"
            ) {
                link.classList.add("active");
            }
        }
    );

    var brandLinks = $$(
        ".tn-brand, .brand-logo-link, .brand-logo, .footer-logo, .footer-brand-link"
    );

    brandLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            // Normal browser navigation is intentionally preserved.
        });
    });
}


/* =========================================================
   HOME PAGE AUTHENTICATION & ROLE-BASED PROFILE STATE
========================================================= */

function initHomePageAuthState() {
    var profileModal = document.getElementById("userProfileModal");
    var closeProfileModalBtn = document.getElementById("closeUserProfileModalBtn");
    var homeProfileSec = document.getElementById("homeUserProfileSection");

    var staticAuthNav = document.getElementById("staticAuthNavigation");
    var profileAvatarInitials = document.getElementById("profileAvatarInitials");
    var profileFullName = document.getElementById("profileFullName");
    var profileBusinessName = document.getElementById("profileBusinessName");
    var profileRoleBadge = document.getElementById("profileRoleBadge");
    var profileVerifiedBadge = document.getElementById("profileVerifiedBadge");
    var profileEmail = document.getElementById("profileEmail");
    var profilePhone = document.getElementById("profilePhone");
    var profileRoleText = document.getElementById("profileRoleText");
    var profileVerificationText = document.getElementById("profileVerificationText");
    var profileDashboardBtn = document.getElementById("profileDashboardBtn");
    var profileDashboardBtnText = document.getElementById("profileDashboardBtnText");

    var profileViewBtn = document.getElementById("profileViewBtn");
    var profileEditBtn = document.getElementById("profileEditBtn");
    var profileLogoutBtn = document.getElementById("profileLogoutBtn");

    var viewModal = document.getElementById("viewProfileModal");
    var editModal = document.getElementById("editProfileModal");
    var closeViewBtn = document.getElementById("closeViewProfileBtn");
    var closeViewFooter = document.getElementById("closeViewProfileBtnFooter");
    var openEditFromView = document.getElementById("openEditFromViewBtn");
    var closeEditBtn = document.getElementById("closeEditProfileBtn");
    var cancelEditBtn = document.getElementById("cancelEditProfileBtn");
    var editForm = document.getElementById("homeEditProfileForm");

    function getLoggedInUser() {
        try {
            var raw = localStorage.getItem("tradenestCurrentUser");
            if (!raw) return null;
            var u = JSON.parse(raw);
            if (u && typeof u === "object" && (u.email || u.fullName || u.role)) {
                return u;
            }
        } catch (e) {
            console.warn("Error parsing user:", e);
        }
        return null;
    }

    function getInitials(name) {
        if (!name) return "TN";
        var parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function openProfileCardModal() {
        var user = getLoggedInUser();
        if (!user) {
            window.location.href = "auth/login.html";
            return;
        }
        if (typeof window.ensureUserProfileModal === "function") {
            window.ensureUserProfileModal();
        }
        var modal = document.getElementById("userProfileModal");
        renderAuthState();
        if (modal) {
            modal.style.display = "flex";
        }
    }

    function closeProfileCardModal() {
        var modal = document.getElementById("userProfileModal");
        if (modal) {
            modal.style.display = "none";
        }
    }

    window.openUserProfileModal = openProfileCardModal;
    window.closeUserProfileModal = closeProfileCardModal;

    function renderAuthState() {
        var user = getLoggedInUser();

        if (user) {
            if (homeProfileSec) homeProfileSec.style.display = "block";
            if (staticAuthNav) staticAuthNav.style.display = "none";

            var fullName = user.fullName || user.name || "TradeNest User";
            var businessName = user.businessName || (user.business && user.business.name) || "TradeNest Enterprise";
            var email = user.email || "user@tradenest.com";
            var phone = user.phone || user.phoneNumber || "+91 98765 43210";
            var role = (user.role || user.accountType || "buyer").toLowerCase();
            var verificationStatus = user.verificationStatus || "Verified";

            if (profileAvatarInitials) profileAvatarInitials.textContent = getInitials(fullName);
            if (profileFullName) profileFullName.textContent = fullName;
            if (profileBusinessName) {
                profileBusinessName.innerHTML = '<span class="profile-business-icon">🏢</span> ' + businessName;
            }
            if (profileEmail) profileEmail.textContent = email;
            if (profilePhone) profilePhone.textContent = phone;

            // Configure Role and Role-Based Dashboard option
            if (role === "supplier") {
                if (profileRoleBadge) {
                    profileRoleBadge.className = "tn-badge-role role-supplier";
                    profileRoleBadge.textContent = "Supplier";
                }
                if (profileRoleText) profileRoleText.textContent = "Supplier";
                if (profileDashboardBtnText) profileDashboardBtnText.textContent = "My Supplier Dashboard";
                if (profileDashboardBtn) {
                    profileDashboardBtn.href = "supplier-dashboard.html";
                    profileDashboardBtn.setAttribute("aria-label", "Open My Supplier Dashboard");
                }
            } else if (role === "admin") {
                if (profileRoleBadge) {
                    profileRoleBadge.className = "tn-badge-role role-admin";
                    profileRoleBadge.textContent = "Administrator";
                }
                if (profileRoleText) profileRoleText.textContent = "Administrator";
                if (profileDashboardBtnText) profileDashboardBtnText.textContent = "Admin Governance Console";
                if (profileDashboardBtn) {
                    profileDashboardBtn.href = "pages/admin/dashboard.html";
                    profileDashboardBtn.setAttribute("aria-label", "Open Admin Governance Console");
                }
            } else {
                // Buyer role
                if (profileRoleBadge) {
                    profileRoleBadge.className = "tn-badge-role role-buyer";
                    profileRoleBadge.textContent = "Buyer";
                }
                if (profileRoleText) profileRoleText.textContent = "Buyer";
                if (profileDashboardBtnText) profileDashboardBtnText.textContent = "My Buyer Dashboard";
                if (profileDashboardBtn) {
                    profileDashboardBtn.href = "buyer-dashboard.html";
                    profileDashboardBtn.setAttribute("aria-label", "Open My Buyer Dashboard");
                }
            }

            // Verification status
            var isVerified = verificationStatus.toLowerCase().includes("verif");
            if (profileVerifiedBadge) {
                profileVerifiedBadge.innerHTML = isVerified
                    ? '<span class="check-icon">✓</span> Profile Verified'
                    : '<span class="check-icon">⏳</span> Pending Verification';
                profileVerifiedBadge.style.color = isVerified ? "#15803d" : "#b45309";
                profileVerifiedBadge.style.background = isVerified ? "#f0fdf4" : "#fffbeb";
                profileVerifiedBadge.style.borderColor = isVerified ? "#bbf7d0" : "#fde68a";
            }
            if (profileVerificationText) {
                profileVerificationText.textContent = isVerified ? "Profile Verified" : "Pending Verification";
            }
        } else {
            // Not logged in: close modal and hide home profile section
            closeProfileCardModal();
            if (homeProfileSec) homeProfileSec.style.display = "none";
            if (staticAuthNav) staticAuthNav.style.display = "flex";
        }
    }

    // Attach to window so shared-nav or login can trigger update
    window.renderHomePageAuthState = renderAuthState;

    // Initial render
    renderAuthState();

    // Check query params if ?profile=1 or hash #profile
    if (window.location.search.includes("profile") || window.location.hash.includes("profile")) {
        setTimeout(openProfileCardModal, 150);
    }

    // Close profile popup modal listeners
    if (closeProfileModalBtn) {
        closeProfileModalBtn.addEventListener("click", closeProfileCardModal);
    }

    if (profileModal) {
        profileModal.addEventListener("click", function (e) {
            if (e.target === profileModal) {
                closeProfileCardModal();
            }
        });
    }

    // Escape key closes profile popup
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && profileModal && profileModal.style.display === "flex") {
            closeProfileCardModal();
        }
    });

    // Attach logout click listener
    if (profileLogoutBtn) {
        profileLogoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            closeProfileCardModal();
            if (typeof window.logoutTradeNestUser === "function") {
                window.logoutTradeNestUser();
            } else {
                localStorage.removeItem("tradenestCurrentUser");
                sessionStorage.clear();
                renderAuthState();
                if (typeof window.renderTradeNestNav === "function") window.renderTradeNestNav();
            }
        });
    }

    // View Profile Modal
    function openViewModal() {
        var user = getLoggedInUser();
        if (!user || !viewModal) return;

        var elFull = document.getElementById("viewModalFullName");
        var elRole = document.getElementById("viewModalRole");
        var elBiz = document.getElementById("viewModalBusiness");
        var elVer = document.getElementById("viewModalVerification");
        var elEmail = document.getElementById("viewModalEmail");
        var elPhone = document.getElementById("viewModalPhone");
        var elCategory = document.getElementById("viewModalCategory");
        var elStatus = document.getElementById("viewModalStatus");

        var roleStr = (user.role || "buyer").toUpperCase();
        if (elFull) elFull.textContent = user.fullName || "TradeNest User";
        if (elRole) elRole.textContent = roleStr;
        if (elBiz) elBiz.textContent = user.businessName || (user.business && user.business.name) || "TradeNest Enterprise";
        if (elVer) elVer.textContent = "✓ " + (user.verificationStatus || "Verified");
        if (elEmail) elEmail.textContent = user.email || "-";
        if (elPhone) elPhone.textContent = user.phone || "+91 98765 43210";
        if (elCategory) elCategory.textContent = (user.business && user.business.category) || "B2B Wholesale & Procurement";
        if (elStatus) elStatus.textContent = (user.status || "Active").toUpperCase();

        viewModal.style.display = "flex";
    }

    function closeViewModal() {
        if (viewModal) viewModal.style.display = "none";
    }

    if (profileViewBtn) profileViewBtn.addEventListener("click", function () {
        openViewModal();
    });
    if (closeViewBtn) closeViewBtn.addEventListener("click", closeViewModal);
    if (closeViewFooter) closeViewFooter.addEventListener("click", closeViewModal);
    if (openEditFromView) {
        openEditFromView.addEventListener("click", function () {
            closeViewModal();
            openEditModal();
        });
    }

    // Edit Profile Modal
    function openEditModal() {
        var user = getLoggedInUser();
        if (!user || !editModal) return;

        var inputName = document.getElementById("editProfileName");
        var inputBiz = document.getElementById("editProfileBusiness");
        var inputPhone = document.getElementById("editProfilePhone");
        var inputEmail = document.getElementById("editProfileEmail");

        if (inputName) inputName.value = user.fullName || "";
        if (inputBiz) inputBiz.value = user.businessName || (user.business && user.business.name) || "";
        if (inputPhone) inputPhone.value = user.phone || "";
        if (inputEmail) inputEmail.value = user.email || "";

        editModal.style.display = "flex";
        if (inputName) inputName.focus();
    }

    function closeEditModal() {
        if (editModal) editModal.style.display = "none";
    }

    if (profileEditBtn) profileEditBtn.addEventListener("click", function () {
        openEditModal();
    });
    if (closeEditBtn) closeEditBtn.addEventListener("click", closeEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEditModal);

    // Save Profile Form Submission
    if (editForm) {
        editForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var user = getLoggedInUser();
            if (!user) return;

            var inputName = document.getElementById("editProfileName");
            var inputBiz = document.getElementById("editProfileBusiness");
            var inputPhone = document.getElementById("editProfilePhone");

            var newName = inputName ? inputName.value.trim() : user.fullName;
            var newBiz = inputBiz ? inputBiz.value.trim() : user.businessName;
            var newPhone = inputPhone ? inputPhone.value.trim() : user.phone;

            if (!newName) {
                alert("Please enter a valid full name.");
                return;
            }

            user.fullName = newName;
            user.businessName = newBiz;
            if (user.business) user.business.name = newBiz;
            user.phone = newPhone;

            // Save updated user in tradenestCurrentUser
            localStorage.setItem("tradenestCurrentUser", JSON.stringify(user));

            // Also update in tradenestUsers if present
            try {
                var storedUsers = JSON.parse(localStorage.getItem("tradenestUsers") || "[]");
                if (Array.isArray(storedUsers)) {
                    var idx = storedUsers.findIndex(function (u) {
                        return u && u.email && u.email.toLowerCase() === user.email.toLowerCase();
                    });
                    if (idx !== -1) {
                        storedUsers[idx].fullName = newName;
                        storedUsers[idx].businessName = newBiz;
                        if (storedUsers[idx].business) storedUsers[idx].business.name = newBiz;
                        storedUsers[idx].phone = newPhone;
                        localStorage.setItem("tradenestUsers", JSON.stringify(storedUsers));
                    }
                }
            } catch (err) {
                console.warn("Could not sync tradenestUsers:", err);
            }

            closeEditModal();
            renderAuthState();
            if (typeof window.renderTradeNestNav === "function") window.renderTradeNestNav();
            showToast("Profile details updated successfully!", "success");
        });
    }

    // Close modals on backdrop click or ESC
    [viewModal, editModal].forEach(function (modal) {
        if (modal) {
            modal.addEventListener("click", function (e) {
                if (e.target === modal) {
                    modal.style.display = "none";
                }
            });
        }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeProfileCardModal();
            closeViewModal();
            closeEditModal();
        }
    });
}


/* =========================================================
   SMOOTH SCROLLING
========================================================= */

function initSmoothScrolling() {
    $$('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
            var href = link.getAttribute("href");

            if (!href || href === "#") {
                event.preventDefault();
                return;
            }

            var target = $(href);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            if (history.pushState) {
                history.pushState(null, "", href);
            }
        });
    });
}


/* =========================================================
   BACK TO TOP
========================================================= */

function initBackToTop() {
    var button = document.createElement("button");

    button.type = "button";
    button.id = "tradenest-back-to-top";
    button.setAttribute("aria-label", "Back to top");
    button.textContent = "↑";

    Object.assign(button.style, {
        position: "fixed",
        right: "24px",
        bottom: "24px",
        width: "44px",
        height: "44px",
        border: "0",
        borderRadius: "50%",
        background: "#5b4b63",
        color: "#ffffff",
        fontSize: "20px",
        cursor: "pointer",
        zIndex: "9998",
        opacity: "0",
        visibility: "hidden",
        transform: "translateY(10px)",
        transition:
            "opacity .25s ease, transform .25s ease, visibility .25s ease"
    });

    document.body.appendChild(button);

    function updateButton() {
        if (window.scrollY > 450) {
            button.style.opacity = "1";
            button.style.visibility = "visible";
            button.style.transform = "translateY(0)";
        } else {
            button.style.opacity = "0";
            button.style.visibility = "hidden";
            button.style.transform = "translateY(10px)";
        }
    }

    window.addEventListener(
        "scroll",
        updateButton,
        { passive: true }
    );

    button.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    updateButton();
}


/* =========================================================
   HOME PAGE PRODUCT CATALOG
   Connects to TradeNestProductService to display live products
========================================================= */

function initHomeProductCatalog() {
    var grid = document.getElementById("homeProductsGrid");
    if (!grid) {
        return;
    }

    var searchInput = document.getElementById("homeProductSearch") || document.getElementById("homeProductSearchInput");
    var categorySelect = document.getElementById("homeCategoryFilter") || document.getElementById("homeCategorySelect");
    var sortSelect = document.getElementById("homeSortFilter") || document.getElementById("homeSortSelect");
    var countEl = document.getElementById("homeProductsCount");
    var categoryPills = Array.from(document.querySelectorAll(".cat-pill, .b2b-category-card"));

    var currentCategory = "";

    function renderProducts() {
        var query = (searchInput && searchInput.value ? searchInput.value.toLowerCase().trim() : "");
        var selectedCat = (categorySelect && categorySelect.value ? categorySelect.value.toLowerCase().trim() : currentCategory);
        var sortBy = (sortSelect && sortSelect.value ? sortSelect.value : "featured");

        var products = [];
        if (window.TradeNestProductService) {
            products = window.TradeNestProductService.getProductsSync({ onlyActive: true });
        } else {
            try {
                var raw = localStorage.getItem("tradenest_shared_products_v2") || localStorage.getItem("tradenest_supplier_products");
                if (raw) {
                    products = JSON.parse(raw).filter(function(p) { return p.status === "active"; });
                }
            } catch (e) {}
        }

        // Filter
        var filtered = products.filter(function (p) {
            var name = (p.name || "").toLowerCase();
            var desc = (p.description || "").toLowerCase();
            var cat = (p.category || "").toLowerCase();
            var supplier = (p.supplierName || "").toLowerCase();

            var matchesQuery = !query || name.indexOf(query) !== -1 || desc.indexOf(query) !== -1 || cat.indexOf(query) !== -1 || supplier.indexOf(query) !== -1;
            var matchesCategory = !selectedCat || cat.indexOf(selectedCat) !== -1;

            return matchesQuery && matchesCategory;
        });

        // Sort
        filtered.sort(function (a, b) {
            var priceA = a.price || (a.unitPrice ? a.unitPrice * 80 : 0);
            var priceB = b.price || (b.unitPrice ? b.unitPrice * 80 : 0);
            var ratingA = a.rating || 4.5;
            var ratingB = b.rating || 4.5;

            if (sortBy === "price-low") return priceA - priceB;
            if (sortBy === "price-high") return priceB - priceA;
            if (sortBy === "rating") return ratingB - ratingA;
            if (sortBy === "moq-low") return (a.moq || 1) - (b.moq || 1);
            if (sortBy === "newest") return String(b.id || "").localeCompare(String(a.id || ""));
            return 0;
        });

        if (countEl) {
            countEl.textContent = "Showing " + filtered.length + " active wholesale products";
        }

        if (!filtered.length) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: #ffffff; border-radius: 12px; border: 1px dashed var(--border-color, #e2e8f0);">
                    <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
                    <h3 style="font-size: 1.15rem; font-weight: 600; color: #1e293b; margin-bottom: 8px;">No matching wholesale products found</h3>
                    <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 16px;">Try adjusting your search query or selecting a different category filter.</p>
                    <button type="button" id="btnResetHomeFilters" class="btn btn-outline btn-sm">Reset All Filters</button>
                </div>
            `;
            var btnReset = document.getElementById("btnResetHomeFilters");
            if (btnReset) {
                btnReset.addEventListener("click", function () {
                    if (searchInput) searchInput.value = "";
                    if (categorySelect) categorySelect.value = "";
                    currentCategory = "";
                    categoryPills.forEach(function (pill) {
                        pill.classList.remove("active");
                        if (!pill.getAttribute("data-category")) pill.classList.add("active");
                    });
                    renderProducts();
                });
            }
            return;
        }

        grid.innerHTML = filtered.map(function (p) {
            var img = p.image || "images/products/industrial-safety-gloves.webp";
            if (img.startsWith("../../")) {
                img = img.replace("../../", "");
            } else if (img.startsWith("../")) {
                img = img.replace("../", "");
            }

            var priceFormatted = "₹" + Math.round(p.price || (p.unitPrice ? p.unitPrice * 80 : 390)).toLocaleString();
            var uom = p.uom || "units";
            var moq = p.moq || 50;
            var supplier = p.supplierName || "TradeNest Verified Partner";
            var delivery = p.deliveryInfo || "3-5 business days";
            var stock = p.availableStock !== undefined ? p.availableStock : (p.stock || 100);

            return `
                <article class="product-card" data-product-id="${p.id}" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s;">
                    <div class="product-image-container" style="position: relative; height: 180px; background: #f8fafc; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        <img src="${img}" alt="${p.name}" class="product-image" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='images/products/industrial-safety-gloves.webp'" />
                        <span class="badge badge-stock" style="position: absolute; top: 10px; right: 10px; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; background: ${stock > 0 ? '#10b981' : '#ef4444'}; color: #ffffff;">
                            ${stock > 0 ? "In Stock (" + stock + ")" : "Out of Stock"}
                        </span>
                    </div>
                    <div class="product-content" style="padding: 16px; display: flex; flex-direction: column; flex-grow: 1;">
                        <span class="product-category" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #2563eb; letter-spacing: 0.05em; margin-bottom: 4px;">
                            ${p.category || "General"}
                        </span>
                        <h3 class="product-title" style="font-size: 1.05rem; font-weight: 600; color: #0f172a; margin-bottom: 6px; line-height: 1.3;">
                            ${p.name}
                        </h3>
                        <p class="product-description" style="font-size: 0.85rem; color: #64748b; margin-bottom: 12px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${p.description || "High quality wholesale supplies with verified manufacturing specifications."}
                        </p>
                        <div class="product-pricing-info" style="margin-top: auto; padding-top: 10px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                            <span class="product-price" style="font-size: 1.15rem; font-weight: 700; color: #0f172a;">
                                ${priceFormatted} <small style="font-size: 0.75rem; color: #64748b; font-weight: 400;">/ ${uom}</small>
                            </span>
                            <span class="product-moq" style="font-size: 0.8rem; font-weight: 500; color: #475569;">
                                MOQ: ${moq} ${uom}
                            </span>
                        </div>
                        <div class="product-supplier-info" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 0.8rem; color: #475569;">
                            <span class="supplier-name" style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 65%;">
                                🏢 ${supplier}
                            </span>
                            <span class="verification-badge status-verified" style="display: inline-flex; align-items: center; gap: 3px; font-size: 0.7rem; font-weight: 600; color: #059669; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">
                                ✓ Verified
                            </span>
                        </div>
                        <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 12px; display: flex; align-items: center; gap: 4px;">
                            <span>🚚</span> <span>${delivery}</span>
                        </div>
                        <div class="product-card-actions" style="display: flex; gap: 8px; margin-top: 4px;">
                            <a href="pages/product-details.html?id=${encodeURIComponent(p.id)}" class="btn btn-primary btn-sm" style="flex: 1; text-align: center; text-decoration: none; padding: 7px 10px; font-size: 0.8rem; border-radius: 6px;">
                                View Details
                            </a>
                            <a href="pages/buyer/rfqs.html?productId=${encodeURIComponent(p.id)}" class="btn btn-outline btn-sm" style="flex: 1; text-align: center; text-decoration: none; padding: 7px 10px; font-size: 0.8rem; border-radius: 6px;">
                                Request RFQ
                            </a>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    }

    if (searchInput) {
        searchInput.addEventListener("input", renderProducts);
    }
    if (categorySelect) {
        categorySelect.addEventListener("change", function () {
            currentCategory = categorySelect.value.toLowerCase().trim();
            categoryPills.forEach(function (pill) {
                var pillCat = (pill.getAttribute("data-category") || "").toLowerCase().trim();
                pill.classList.toggle("active", pillCat === currentCategory);
            });
            renderProducts();
        });
    }
    if (sortSelect) {
        sortSelect.addEventListener("change", renderProducts);
    }

    categoryPills.forEach(function (pill) {
        pill.addEventListener("click", function () {
            var cat = (pill.getAttribute("data-category") || "").toLowerCase().trim();
            currentCategory = cat;
            if (categorySelect) {
                categorySelect.value = cat;
            }
            categoryPills.forEach(function (p) { p.classList.remove("active"); });
            pill.classList.add("active");
            renderProducts();
        });
    });

    window.addEventListener("tradenest:products-changed", renderProducts);
    window.addEventListener("storage", function (e) {
        if (e.key === "tradenest_shared_products_v2" || e.key === "tradenest_supplier_products") {
            renderProducts();
        }
    });

    renderProducts();
}


/* =========================================================
   PRODUCT PAGE
========================================================= */

function initProductPage() {
    var productGrid = $(".products-listing-section .products-grid");
    var featuredProductGrid = $(".featured-products-section .featured-grid");
    var category = $("#filter-category");
    var location = $("#filter-location");
    var productCards = [];
    var catalogueState = null;

    function refreshProductCatalogue() {
        if (!window.TradeNestStore) {
            productCards = $$(".product-card");
            return;
        }

        catalogueState = window.TradeNestStore.getStore();
        var visibleProducts = catalogueState.products.filter(function (product) {
            return product.availability !== "Unavailable";
        });
        var cardMarkup = function (product, isFeatured) {
            var supplier = catalogueState.supplierProfiles.find(function (item) {
                return item.id === product.supplierId;
            }) || {};
            var rating = Number(product.rating) || 0;
            var stockBadge = Number(product.stock) <= 0
                ? "Out of Stock"
                : (product.availability || "In Stock");
            var image = product.image || "../images/products/industrial-safety-gloves.webp";
            if (!/^https?:|^data:/i.test(image)) {
                image = image.replace(/^\.\.\/\.\.\//, "../");
            }

            return `<article class="product-card${isFeatured ? " featured-card" : ""}" data-product-id="${escapeCatalogueText(product.id)}">
                <div class="product-image-container"><img src="${escapeCatalogueText(image)}" alt="${escapeCatalogueText(product.name)}" class="product-image" loading="lazy" />
                <span class="badge ${isFeatured ? "badge-featured" : "badge-stock"}">${isFeatured ? "Featured" : escapeCatalogueText(stockBadge)}</span></div>
                <div class="product-content"><span class="product-category">${escapeCatalogueText(product.category)}</span><h3 class="product-title">${escapeCatalogueText(product.name)}</h3>
                <p class="product-description">${escapeCatalogueText(product.description)}</p><div class="product-pricing-info">
                <span class="product-price">${escapeCatalogueText(window.TradeNestStore.formatCurrency(product.price))} <small>/ ${escapeCatalogueText(product.unit)}</small></span>
                <span class="product-moq">MOQ: ${escapeCatalogueText(product.moq)} ${escapeCatalogueText(product.unit)}</span></div>
                <div class="product-supplier-info"><span class="supplier-name">${escapeCatalogueText(supplier.businessName || product.supplierName)}</span>
                <span class="supplier-location" hidden>${escapeCatalogueText(supplier.location || "")}</span><span class="verification-badge ${supplier.verificationStatus === "Verified" ? "status-verified" : ""}">${supplier.verificationStatus === "Verified" ? "Verified Supplier" : "Verification Pending"}</span></div>
                <div class="product-metrics"><span class="trust-score">Trust Score: <strong>${Number(supplier.trustScore) || 0}/100</strong></span>
                <span class="rating-stars" aria-label="Rating: ${rating ? rating.toFixed(1) + " out of 5" : "Not yet rated"}"><small>${rating ? rating.toFixed(1) + " / 5" : "New"}</small></span></div>
                <div class="product-card-actions"><a href="product-details.html?id=${encodeURIComponent(product.id)}" class="btn btn-primary btn-sm">View Product</a>
                <a href="supplier-details.html?id=${encodeURIComponent(supplier.id || "")}" class="btn btn-outline btn-sm">View Supplier</a></div></div></article>`;
        };

        if (productGrid) {
            productGrid.innerHTML = visibleProducts.map(function (product) {
                return cardMarkup(product, false);
            }).join("");
        }
        if (featuredProductGrid) {
            featuredProductGrid.innerHTML = visibleProducts.slice(0, 3).map(function (product) {
                return cardMarkup(product, true);
            }).join("");
        }
        productCards = $$(".product-card");

        if (category) {
            var selectedCategory = category.value;
            var categories = Array.from(new Set(catalogueState.products.map(function (product) {
                return product.category;
            }).filter(Boolean))).sort();
            category.innerHTML = '<option value="">All Categories</option>' + categories.map(function (value) {
                return `<option value="${escapeCatalogueText(value)}">${escapeCatalogueText(value)}</option>`;
            }).join("");
            if (categories.includes(selectedCategory)) category.value = selectedCategory;
        }
        if (location) {
            var selectedLocation = location.value;
            var locations = Array.from(new Set(catalogueState.supplierProfiles.map(function (supplier) {
                return supplier.location;
            }).filter(Boolean))).sort();
            location.innerHTML = '<option value="">All Locations</option>' + locations.map(function (value) {
                return `<option value="${escapeCatalogueText(value)}">${escapeCatalogueText(value)}</option>`;
            }).join("");
            if (locations.includes(selectedLocation)) location.value = selectedLocation;
        }
    }

    refreshProductCatalogue();

    // Category cards click navigation
    $$(".category-card").forEach(function(card) {
        card.style.cursor = "pointer";
        card.addEventListener("click", function() {
            var catTitle = $("h3, .category-title", card);
            var catSelect = $("#filter-category");
            if (catTitle && catSelect) {
                var text = catTitle.textContent.trim().toLowerCase();
                for (var i = 0; i < catSelect.options.length; i++) {
                    var optText = catSelect.options[i].text.toLowerCase();
                    var optVal = catSelect.options[i].value.toLowerCase();
                    if (optText.indexOf(text) !== -1 || text.indexOf(optText) !== -1 || optVal.indexOf(text) !== -1) {
                        catSelect.value = catSelect.options[i].value;
                        break;
                    }
                }
                applyProductFilters();
                var listing = $(".products-listing-section");
                if (listing) {
                    listing.scrollIntoView({ behavior: "smooth" });
                }
            }
        });
    });

    $$(".category-link").forEach(function(link) {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            var parent = link.closest(".category-card");
            if (parent) {
                parent.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            }
        });
    });
    productCards = $$(".product-card");

    if (!productCards.length) {
        return;
    }

    var searchForm = $(".search-filter-form");
    var searchInput = $("#product-search-input");
    var verification = $("#filter-verification");
    var trustScore = $("#filter-trust-score");
    var availability = $("#filter-availability");
    var deliveryTime = $("#filter-delivery-time");
    var moq = $("#filter-moq");
    var rating = $("#filter-rating");
    var minPriceInput = $("#filter-price-min");
    var maxPriceInput = $("#filter-price-max");
    var sortSelect = $("#sort-products");

    if (!searchForm && !searchInput && !sortSelect) {
        return;
    }

    function getProductData(card) {
        var priceText = getText(
            card,
            ".product-price"
        );

        var moqText = getText(
            card,
            ".product-moq"
        );

        var ratingText = getText(
            card,
            ".rating-value, .product-rating .rating-value"
        );

        var trustText = getText(
            card,
            ".trust-score, .product-trust-score"
        );

        var deliveryText = getText(
            card,
            ".delivery-time, .product-delivery"
        );

        var cardText = normalizeText(
            card.textContent
        );

        var ratingMatch =
            cardText.match(
                /(\d(?:\.\d)?)\s*\/\s*5/
            );

        var trustMatch =
            cardText.match(
                /(\d{2,3})\s*\/\s*100/
            );

        var deliveryMatch =
            cardText.match(
                /(\d+)\s*[–-]\s*(\d+)\s*business days/i
            );

        return {
            element: card,

            text: cardText,

            title: normalizeText(
                getText(card, ".product-title")
            ),

            category: normalizeText(
                getText(card, ".product-category")
            ),

            location: normalizeText(
                getText(card, ".supplier-location")
            ),

            supplier: normalizeText(
                getText(card, ".supplier-name")
            ),

            price: getNumber(priceText),

            moq: getNumber(moqText),

            rating: getNumber(
                ratingText ||
                (ratingMatch ? ratingMatch[1] : "")
            ),

            trust: getNumber(
                trustText ||
                (trustMatch ? trustMatch[1] : "")
            ),

            delivery: getNumber(
                deliveryText ||
                (deliveryMatch ? deliveryMatch[2] : "")
            ),

            availability:
                cardText.indexOf("made-to-order") !== -1
                    ? "made-to-order"
                    : cardText.indexOf("out of stock") !== -1
                        ? "out-of-stock"
                        : "in-stock"
        };
    }

    function applyProductFilters() {
        var query = normalizeText(
            searchInput ? searchInput.value : ""
        );

        var selectedCategory = category
            ? normalizeText(category.value)
            : "";

        var selectedLocation = location
            ? normalizeText(location.value)
            : "";

        var selectedVerification = verification
            ? normalizeText(verification.value)
            : "";

        var selectedTrust = trustScore
            ? getNumber(trustScore.value)
            : 0;

        var selectedAvailability = availability
            ? normalizeText(availability.value)
            : "";

        var selectedDelivery = deliveryTime
            ? getNumber(deliveryTime.value)
            : 0;

        var selectedMOQ = moq
            ? getNumber(moq.value)
            : 0;

        var selectedRating = rating
            ? getNumber(rating.value)
            : 0;
        var selectedMinPrice = minPriceInput ? getNumber(minPriceInput.value) : 0;
        var selectedMaxPrice = maxPriceInput ? getNumber(maxPriceInput.value) : 0;

        var visibleCards = [];

        productCards.forEach(function (card) {
            var data = getProductData(card);

            var matchesQuery =
                !query ||
                data.text.indexOf(query) !== -1;

            var matchesCategory =
                !selectedCategory ||
                data.category.indexOf(
                    selectedCategory
                ) !== -1;

            var matchesLocation =
                !selectedLocation ||
                data.location.indexOf(
                    selectedLocation
                ) !== -1 ||
                data.text.indexOf(
                    selectedLocation
                ) !== -1;

            var matchesVerification =
                !selectedVerification ||
                data.text.indexOf(
                    selectedVerification
                ) !== -1 ||
                (
                    selectedVerification.indexOf("verified") !== -1 &&
                    data.text.indexOf("verified") !== -1
                );

            var matchesPrice = (!selectedMinPrice || data.price >= selectedMinPrice) &&
                (!selectedMaxPrice || data.price <= selectedMaxPrice);

            var matchesTrust =
                !selectedTrust ||
                data.trust >= selectedTrust;

            var matchesAvailability =
                !selectedAvailability ||
                data.availability ===
                    selectedAvailability;

            var matchesDelivery =
                !selectedDelivery ||
                !data.delivery ||
                (
                    data.delivery <=
                        selectedDelivery
                );

            var matchesMOQ =
                !selectedMOQ ||
                (
                    data.moq > 0 &&
                    data.moq <= selectedMOQ
                );

            var matchesRating =
                !selectedRating ||
                !data.rating ||
                (
                    data.rating >= selectedRating
                );

            var visible =
                matchesQuery &&
                matchesCategory &&
                matchesLocation &&
                matchesVerification &&
                matchesPrice &&
                matchesTrust &&
                matchesAvailability &&
                matchesDelivery &&
                matchesMOQ &&
                matchesRating;

            card.style.display =
                visible ? "" : "none";

            if (visible) {
                visibleCards.push(card);
            }
        });

        var productGrid =
            productCards[0].parentElement;

        if (productGrid) {
            if (!visibleCards.length) {
                createNoResultsMessage(
                    productGrid,
                    "No products match your current search and filters."
                );
            } else {
                removeNoResultsMessage(
                    productGrid
                );
            }
        }

        if (query) {
            saveRecentSearch(
                "product_searches",
                query
            );
        }
    }

    function sortProducts() {
        if (!sortSelect || !productCards.length) {
            return;
        }

        var value = sortSelect.value;

        var grids = [];

        productCards.forEach(function (card) {
            if (
                card.parentElement &&
                grids.indexOf(card.parentElement) === -1
            ) {
                grids.push(card.parentElement);
            }
        });

        grids.forEach(function (grid) {
            var cards = Array.from(
                grid.querySelectorAll(
                    ":scope > .product-card"
                )
            );

            if (!cards.length) {
                return;
            }

            cards.sort(function (a, b) {
                var dataA = getProductData(a);
                var dataB = getProductData(b);

                if (value === "price-low") {
                    return dataA.price - dataB.price;
                }

                if (value === "price-high") {
                    return dataB.price - dataA.price;
                }

                if (value === "rating") {
                    return dataB.rating - dataA.rating;
                }

                if (value === "trust-score") {
                    return dataB.trust - dataA.trust;
                }

                if (value === "newest") {
                    var idA = getNumber(
                        a.getAttribute(
                            "data-product-id"
                        )
                    );

                    var idB = getNumber(
                        b.getAttribute(
                            "data-product-id"
                        )
                    );

                    return idB - idA;
                }

                return 0;
            });

            cards.forEach(function (card) {
                grid.appendChild(card);
            });
        });
    }

    if (searchForm) {
        searchForm.addEventListener(
            "submit",
            function (event) {
                event.preventDefault();

                applyProductFilters();
                sortProducts();

                showToast(
                    "Product search updated.",
                    "success"
                );
            }
        );

        searchForm.addEventListener(
            "reset",
            function () {
                setTimeout(function () {
                    applyProductFilters();
                    sortProducts();

                    showToast(
                        "Product filters cleared."
                    );
                }, 0);
            }
        );
    }

    [
        searchInput,
        category,
        location,
        verification,
        trustScore,
        availability,
        deliveryTime,
        moq,
        rating,
        minPriceInput,
        maxPriceInput
    ].forEach(function (field) {
        if (!field) {
            return;
        }

        field.addEventListener(
            "change",
            applyProductFilters
        );

        if (field === searchInput) {
            field.addEventListener(
                "input",
                applyProductFilters
            );
        }
    });

    if (sortSelect) {
        sortSelect.addEventListener(
            "change",
            function () {
                sortProducts();
                applyProductFilters();
            }
        );
    }

    applyProductFilters();
    sortProducts();

    window.addEventListener("tradenest:products-changed", function () {
        refreshProductCatalogue();
        applyProductFilters();
        sortProducts();
    });

    window.addEventListener("storage", function (e) {
        if ([
            "tradenest_shared_products_v2",
            "tradenest_supplier_products",
            "tradenest_demo_store_v1",
            "tradenest_custom_products",
            "tradenest_supplier_business_profile"
        ].includes(e.key)) {
            refreshProductCatalogue();
            applyProductFilters();
            sortProducts();
        }
    });
}


/* =========================================================
   SUPPLIER PAGE
========================================================= */

function initSupplierPage() {
    var supplierCards = $$(".supplier-card");

    if (!supplierCards.length) {
        return;
    }

    var forms = $$(".supplier-search-form");

    forms.forEach(function (form) {
        var isDiscoverForm =
            $("#search-keyword", form) !== null;

        if (isDiscoverForm) {
            return;
        }

        var company =
            $("#search-company", form);

        var product =
            $("#search-product", form);

        var location =
            $("#filter-location", form);

        var industry =
            $("#filter-industry", form);

        var trust =
            $("#filter-trust-score", form);

        var rating =
            $("#filter-rating", form);

        var delivery =
            $("#filter-delivery-capability", form);

        var supplierMOQ =
            $("#filter-moq", form);

        var responseTime =
            $("#filter-response-time", form);

        var verified =
            $('input[name="verified_only"]', form);

        var sort =
            $("#supplier-sort", form);


        function getSupplierData(card) {
            var text =
                normalizeText(card.textContent);

            var trustText =
                getText(
                    card,
                    ".trust-score"
                ) ||
                getText(
                    card,
                    ".supplier-trust-score"
                ) ||
                (
                    text.match(
                        /(\d{2,3})\s*\/\s*100/
                    ) || []
                )[1];

            var ratingText =
                getText(
                    card,
                    ".rating-value"
                ) ||
                (
                    text.match(
                        /(\d(?:\.\d)?)\s*\/\s*5/
                    ) || []
                )[1];

            var responseText =
                getText(
                    card,
                    ".response-time"
                ) ||
                (
                    text.match(
                        /(\d+)\s*(?:hours?|hrs?)/i
                    ) || []
                )[1];

            return {
                element: card,

                text: text,

                company: normalizeText(
                    getText(
                        card,
                        ".supplier-name"
                    )
                ),

                product: normalizeText(
                    getText(
                        card,
                        ".supplier-description"
                    ) +
                    " " +
                    getText(
                        card,
                        ".supplier-industry"
                    )
                ),

                location: normalizeText(
                    getText(
                        card,
                        ".supplier-location"
                    )
                ),

                industry: normalizeText(
                    getText(
                        card,
                        ".supplier-industry"
                    )
                ),

                trust: getNumber(
                    trustText
                ),

                rating: getNumber(
                    ratingText
                ),

                responseHours:
                    getNumber(
                        responseText
                    ),

                verified:
                    text.indexOf(
                        "verified"
                    ) !== -1
            };
        }


        function applySupplierFilters() {
            var companyQuery =
                normalizeText(
                    company ? company.value : ""
                );

            var productQuery =
                normalizeText(
                    product ? product.value : ""
                );

            var selectedLocation =
                normalizeText(
                    location ? location.value : ""
                );

            var selectedIndustry =
                normalizeText(
                    industry ? industry.value : ""
                );

            var minTrust =
                getNumber(
                    trust ? trust.value : ""
                );

            var minRating =
                getNumber(
                    rating ? rating.value : ""
                );

            var capability =
                normalizeText(
                    delivery ? delivery.value : ""
                );

            var moqValue =
                normalizeText(
                    supplierMOQ
                        ? supplierMOQ.value
                        : ""
                );

            var responseValue =
                normalizeText(
                    responseTime
                        ? responseTime.value
                        : ""
                );

            var verifiedOnly =
                verified
                    ? verified.checked
                    : false;

            var visible = [];

            supplierCards.forEach(
                function (card) {
                    var data =
                        getSupplierData(card);

                    var matchesCompany =
                        !companyQuery ||
                        data.company.indexOf(
                            companyQuery
                        ) !== -1 ||
                        data.text.indexOf(
                            companyQuery
                        ) !== -1;

                    var matchesProduct =
                        !productQuery ||
                        data.product.indexOf(
                            productQuery
                        ) !== -1 ||
                        data.text.indexOf(
                            productQuery
                        ) !== -1;

                    var matchesLocation =
                        !selectedLocation ||
                        data.location.indexOf(
                            selectedLocation
                        ) !== -1 ||
                        data.text.indexOf(
                            selectedLocation
                        ) !== -1;

                    var matchesIndustry =
                        !selectedIndustry ||
                        data.industry.indexOf(
                            selectedIndustry
                        ) !== -1 ||
                        data.text.indexOf(
                            selectedIndustry
                        ) !== -1;

                    var matchesTrust =
                        !minTrust ||
                        data.trust >= minTrust;

                    var matchesRating =
                        !minRating ||
                        data.rating >= minRating;

                    var matchesVerified =
                        !verifiedOnly ||
                        data.verified;

                    var matchesCapability =
                        !capability ||
                        data.text.indexOf(
                            capability
                        ) !== -1;

                    var matchesMOQ = true;

                    if (moqValue === "low") {
                        var lowMOQ =
                            getNumber(
                                (
                                    data.text.match(
                                        /moq[^0-9]*(\d+)/i
                                    ) || []
                                )[1]
                            );

                        matchesMOQ =
                            data.text.indexOf(
                                "low"
                            ) !== -1 ||
                            lowMOQ < 100;
                    } else if (
                        moqValue === "medium"
                    ) {
                        var mediumMOQ =
                            getNumber(
                                (
                                    data.text.match(
                                        /moq[^0-9]*(\d+)/i
                                    ) || []
                                )[1]
                            );

                        matchesMOQ =
                            mediumMOQ >= 100 &&
                            mediumMOQ <= 1000;
                    } else if (
                        moqValue === "bulk"
                    ) {
                        var bulkMOQ =
                            getNumber(
                                (
                                    data.text.match(
                                        /moq[^0-9]*(\d+)/i
                                    ) || []
                                )[1]
                            );

                        matchesMOQ =
                            bulkMOQ > 1000 ||
                            data.text.indexOf(
                                "bulk"
                            ) !== -1;
                    }

                    var matchesResponse = true;

                    if (responseValue === "2h") {
                        matchesResponse =
                            data.responseHours > 0 &&
                            data.responseHours <= 2;
                    } else if (
                        responseValue === "12h"
                    ) {
                        matchesResponse =
                            data.responseHours > 0 &&
                            data.responseHours <= 12;
                    } else if (
                        responseValue === "24h"
                    ) {
                        matchesResponse =
                            data.responseHours > 0 &&
                            data.responseHours <= 24;
                    }

                    var isVisible =
                        matchesCompany &&
                        matchesProduct &&
                        matchesLocation &&
                        matchesIndustry &&
                        matchesTrust &&
                        matchesRating &&
                        matchesVerified &&
                        matchesCapability &&
                        matchesMOQ &&
                        matchesResponse;

                    card.style.display =
                        isVisible
                            ? ""
                            : "none";

                    if (isVisible) {
                        visible.push(card);
                    }
                }
            );

            var grid =
                supplierCards[0].parentElement;

            if (grid) {
                if (!visible.length) {
                    createNoResultsMessage(
                        grid,
                        "No suppliers match your selected criteria."
                    );
                } else {
                    removeNoResultsMessage(
                        grid
                    );
                }
            }

            if (companyQuery) {
                saveRecentSearch(
                    "supplier_searches",
                    companyQuery
                );
            }
        }


        function sortSuppliers() {
            if (!sort) {
                return;
            }

            var value = sort.value;

            var grids = [];

            supplierCards.forEach(
                function (card) {
                    if (
                        card.parentElement &&
                        grids.indexOf(
                            card.parentElement
                        ) === -1
                    ) {
                        grids.push(
                            card.parentElement
                        );
                    }
                }
            );

            grids.forEach(function (grid) {
                var cards =
                    Array.from(
                        grid.querySelectorAll(
                            ":scope > .supplier-card"
                        )
                    );

                cards.sort(
                    function (a, b) {
                        var dataA =
                            getSupplierData(a);

                        var dataB =
                            getSupplierData(b);

                        if (
                            value ===
                            "trust_score"
                        ) {
                            return (
                                dataB.trust -
                                dataA.trust
                            );
                        }

                        if (
                            value ===
                            "rating"
                        ) {
                            return (
                                dataB.rating -
                                dataA.rating
                            );
                        }

                        if (
                            value ===
                            "response_time"
                        ) {
                            return (
                                dataA.responseHours -
                                dataB.responseHours
                            );
                        }

                        if (
                            value ===
                            "newest"
                        ) {
                            return b.id.localeCompare(
                                a.id
                            );
                        }

                        return 0;
                    }
                );

                cards.forEach(
                    function (card) {
                        grid.appendChild(card);
                    }
                );
            });
        }


        form.addEventListener(
            "submit",
            function (event) {
                event.preventDefault();

                applySupplierFilters();
                sortSuppliers();

                showToast(
                    "Supplier search updated.",
                    "success"
                );
            }
        );


        form.addEventListener(
            "reset",
            function () {
                setTimeout(function () {
                    applySupplierFilters();
                    sortSuppliers();

                    showToast(
                        "Supplier filters cleared."
                    );
                }, 0);
            }
        );


        $$(
            "input, select",
            form
        ).forEach(function (field) {
            field.addEventListener(
                "change",
                applySupplierFilters
            );

            if (
                field.type === "text" ||
                field.type === "search"
            ) {
                field.addEventListener(
                    "input",
                    applySupplierFilters
                );
            }
        });


        if (sort) {
            sort.addEventListener(
                "change",
                function () {
                    sortSuppliers();
                    applySupplierFilters();
                }
            );
        }


        // URL Param pre-filter (e.g. ?industry=electronics)
        try {
            var urlParams = new URLSearchParams(window.location.search);
            var indParam = urlParams.get("industry");
            if (indParam) {
                var indSelect = document.getElementById("filter-industry");
                if (indSelect) {
                    indSelect.value = indParam;
                }
            }
        } catch (e) {}

        // Category Cards click delegation
        document.addEventListener("click", function(e) {
            var catCard = e.target.closest(".category-card, .category-link");
            if (catCard) {
                var card = catCard.closest(".category-card") || catCard;
                var industry = card.getAttribute("data-industry");
                if (industry) {
                    e.preventDefault();
                    var indSelect = document.getElementById("filter-industry");
                    if (indSelect) {
                        indSelect.value = industry;
                        applySupplierFilters();
                    }
                    var listingSec = document.querySelector(".supplier-listing-section") || document.querySelector(".supplier-cards-list");
                    if (listingSec) {
                        listingSec.scrollIntoView({ behavior: "smooth" });
                    }
                }
            }
        });

        applySupplierFilters();
        sortSuppliers();
    });
}


/* =========================================================
   DISCOVER SUPPLIERS PAGE
========================================================= */

function initDiscoverSuppliersPage() {
    var form =
        $(".supplier-search-form");

    if (
        !form ||
        !$("#search-keyword", form)
    ) {
        return;
    }

    var cards =
        $$(".supplier-card");

    if (!cards.length) {
        return;
    }

    var keyword =
        $("#search-keyword", form);

    var category =
        $("#category-filter", form);

    var location =
        $("#location-filter", form);

    var trust =
        $("#trust-score-filter", form);

    var verification =
        $("#verification-filter", form);

    var delivery =
        $("#delivery-filter", form);


    function getData(card) {
        var text =
            normalizeText(
                card.textContent
            );

        var trustValue =
            getNumber(
                getText(
                    card,
                    ".trust-score"
                ) ||
                (
                    text.match(
                        /(\d{2,3})\s*\/\s*100/
                    ) || []
                )[1]
            );

        return {
            text: text,

            trust: trustValue,

            verified:
                text.indexOf(
                    "verified"
                ) !== -1,

            location:
                normalizeText(
                    getText(
                        card,
                        ".supplier-location"
                    )
                ),

            industry:
                normalizeText(
                    getText(
                        card,
                        ".supplier-industry"
                    )
                )
        };
    }


    function filter() {
        var q =
            normalizeText(
                keyword.value
            );

        var cat =
            normalizeText(
                category.value
            );

        var loc =
            normalizeText(
                location.value
            );

        var minTrust =
            getNumber(
                trust.value
            );

        var verificationValue =
            normalizeText(
                verification.value
            );

        var deliveryValue =
            normalizeText(
                delivery.value
            );

        var visible = [];


        cards.forEach(
            function (card) {
                var data =
                    getData(card);

                var matchesKeyword =
                    !q ||
                    data.text.indexOf(
                        q
                    ) !== -1;

                var matchesCategory =
                    !cat ||
                    data.industry.indexOf(
                        cat
                    ) !== -1 ||
                    data.text.indexOf(
                        cat
                    ) !== -1;

                var matchesLocation =
                    !loc ||
                    data.location.indexOf(
                        loc
                    ) !== -1 ||
                    data.text.indexOf(
                        loc
                    ) !== -1;

                var matchesTrust =
                    !minTrust ||
                    data.trust >= minTrust;

                var matchesVerification =
                    !verificationValue ||
                    verificationValue ===
                        "all" ||
                    (
                        verificationValue ===
                            "verified" &&
                        data.verified
                    );

                var matchesDelivery =
                    !deliveryValue ||
                    deliveryValue ===
                        "any" ||
                    data.text.indexOf(
                        deliveryValue
                    ) !== -1 ||
                    (
                        deliveryValue ===
                            "fast" &&
                        (
                            data.text.indexOf(
                                "fast"
                            ) !== -1 ||
                            data.text.indexOf(
                                "24 hours"
                            ) !== -1 ||
                            data.text.indexOf(
                                "12 hours"
                            ) !== -1
                        )
                    );

                var visibleCard =
                    matchesKeyword &&
                    matchesCategory &&
                    matchesLocation &&
                    matchesTrust &&
                    matchesVerification &&
                    matchesDelivery;

                card.style.display =
                    visibleCard
                        ? ""
                        : "none";

                if (visibleCard) {
                    visible.push(card);
                }
            }
        );


        var grid =
            cards[0].parentElement;

        if (grid) {
            if (!visible.length) {
                createNoResultsMessage(
                    grid,
                    "No suppliers match your search. Try changing the filters."
                );
            } else {
                removeNoResultsMessage(
                    grid
                );
            }
        }


        if (q) {
            saveRecentSearch(
                "discover_supplier_searches",
                q
            );
        }
    }


    form.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            filter();

            showToast(
                "Supplier search completed.",
                "success"
            );
        }
    );


    form.addEventListener(
        "reset",
        function () {
            setTimeout(function () {
                filter();

                showToast(
                    "Supplier filters cleared."
                );
            }, 0);
        }
    );


    [
        keyword,
        category,
        location,
        trust,
        verification,
        delivery
    ].forEach(function (field) {
        if (!field) {
            return;
        }

        field.addEventListener(
            "change",
            filter
        );

        if (field === keyword) {
            field.addEventListener(
                "input",
                filter
            );
        }
    });


    filter();
}


/* =========================================================
   CONTACT FORM
========================================================= */

function initContactForm() {
    var form =
        $(".contact-form");

    if (!form) {
        return;
    }

    var fullName =
        $("#full-name");

    var company =
        $("#company-name");

    var email =
        $("#email-address");

    var phone =
        $("#phone-number");

    var userType =
        $("#user-type");

    var subject =
        $("#subject");

    var message =
        $("#message");

    var consent =
        $("#consent-checkbox");


    function setFieldState(
        field,
        valid,
        messageText
    ) {
        if (!field) {
            return;
        }

        var oldError =
            field.parentElement
                ? $(".tn-field-error", field.parentElement)
                : null;

        if (oldError) {
            oldError.remove();
        }

        field.style.borderColor =
            valid
                ? ""
                : "#b44b4b";

        field.setAttribute(
            "aria-invalid",
            valid
                ? "false"
                : "true"
        );

        if (
            !valid &&
            messageText &&
            field.parentElement
        ) {
            var error =
                document.createElement(
                    "small"
                );

            error.className =
                "tn-field-error";

            error.textContent =
                messageText;

            Object.assign(error.style, {
                display: "block",
                marginTop: "5px",
                color: "#b44b4b",
                fontSize: "12px"
            });

            field.parentElement.appendChild(
                error
            );
        }
    }


    function validate() {
        var valid = true;

        var nameValue =
            fullName
                ? fullName.value.trim()
                : "";

        var emailValue =
            email
                ? email.value.trim()
                : "";

        var subjectValue =
            subject
                ? subject.value.trim()
                : "";


        if (!nameValue) {
            setFieldState(
                fullName,
                false,
                "Please enter your full name."
            );

            valid = false;
        } else {
            setFieldState(
                fullName,
                true
            );
        }


        if (!emailValue) {
            setFieldState(
                email,
                false,
                "Please enter your email address."
            );

            valid = false;
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                emailValue
            )
        ) {
            setFieldState(
                email,
                false,
                "Please enter a valid email address."
            );

            valid = false;
        } else {
            setFieldState(
                email,
                true
            );
        }


        if (!subjectValue) {
            setFieldState(
                subject,
                false,
                "Please enter a subject."
            );

            valid = false;
        } else {
            setFieldState(
                subject,
                true
            );
        }


        if (
            phone &&
            phone.value.trim()
        ) {
            var phoneDigits =
                phone.value.replace(
                    /\D/g,
                    ""
                );

            if (
                phoneDigits.length < 7 ||
                phoneDigits.length > 15
            ) {
                setFieldState(
                    phone,
                    false,
                    "Please enter a valid phone number."
                );

                valid = false;
            } else {
                setFieldState(
                    phone,
                    true
                );
            }
        }


        if (
            consent &&
            !consent.checked
        ) {
            setFieldState(
                consent,
                false,
                "Please confirm the consent checkbox."
            );

            valid = false;
        } else if (consent) {
            setFieldState(
                consent,
                true
            );
        }


        return valid;
    }


    form.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            if (!validate()) {
                showToast(
                    "Please correct the highlighted fields.",
                    "error"
                );

                return;
            }


            var formData = {
                fullName:
                    fullName
                        ? fullName.value.trim()
                        : "",

                company:
                    company
                        ? company.value.trim()
                        : "",

                email:
                    email
                        ? email.value.trim()
                        : "",

                phone:
                    phone
                        ? phone.value.trim()
                        : "",

                userType:
                    userType
                        ? userType.value
                        : "",

                subject:
                    subject
                        ? subject.value.trim()
                        : "",

                message:
                    message
                        ? message.value.trim()
                        : ""
            };


            try {
                sessionStorage.setItem(
                    "tradenest_last_enquiry",
                    JSON.stringify(formData)
                );
            } catch (error) {
                // Session storage is optional.
            }


            form.reset();


            $$(".tn-field-error", form)
                .forEach(function (error) {
                    error.remove();
                });


            $$(".form-control, .form-input", form)
                .forEach(function (field) {
                    field.style.borderColor = "";

                    field.setAttribute(
                        "aria-invalid",
                        "false"
                    );
                });


            showToast(
                "Your enquiry has been submitted successfully for this demo.",
                "success"
            );
        }
    );


    [
        fullName,
        email,
        phone,
        subject,
        message
    ].forEach(function (field) {
        if (!field) {
            return;
        }

        field.addEventListener(
            "blur",
            validate
        );
    });
}


/* =========================================================
   FAQ
========================================================= */

function initFAQ() {
    var faqItems =
        $$("details.faq-item");

    if (!faqItems.length) {
        return;
    }

    faqItems.forEach(function (item) {
        item.addEventListener(
            "toggle",
            function () {
                if (!item.open) {
                    return;
                }

                faqItems.forEach(
                    function (other) {
                        if (other !== item) {
                            other.removeAttribute(
                                "open"
                            );
                        }
                    }
                );
            }
        );
    });
}


/* =========================================================
/* =========================================================
   BUTTONS AND MARKETPLACE ACTIONS
========================================================= */

function initButtonsAndLinks() {

    // Global Payment Action Modal / Setup Handler
    function handlePaymentAction(button, amount, orderId) {
        var existingModal = document.getElementById("tradenest-payment-modal");
        if (existingModal) existingModal.remove();

        var amtText = amount ? "₹" + Number(amount).toLocaleString("en-IN") : "₹24,500";
        var ordText = orderId ? "#" + orderId : "#ORD-98231";

        var modal = document.createElement("div");
        modal.id = "tradenest-payment-modal";
        modal.style.cssText = "position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;";
        modal.innerHTML = `
            <div style="background: #ffffff; border-radius: 14px; max-width: 480px; width: 100%; padding: 28px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; font-family: inherit;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">💳</div>
                    <div>
                        <h3 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: #0f172a;">TradeNest Secure Escrow Payment</h3>
                        <p style="margin: 0; font-size: 0.8rem; color: #64748b;">Order Reference: ${ordText}</p>
                    </div>
                </div>
                <div style="background: #f8fafc; border-radius: 8px; padding: 14px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;">
                        <span style="color: #64748b;">Payable Amount:</span>
                        <strong style="color: #0f172a; font-size: 1.05rem;">${amtText}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #64748b;">
                        <span>Escrow Release:</span>
                        <span style="color: #059669; font-weight: 600;">On Goods Verified Delivery</span>
                    </div>
                </div>
                <div style="margin-bottom: 20px; font-size: 0.825rem; color: #475569; line-height: 1.5; background: #fffbeb; border-left: 3px solid #f59e0b; padding: 10px 12px; border-radius: 0 6px 6px 0;">
                    <strong>Gateway Configuration Notice:</strong>
                    Live payment gateway (Razorpay / Stripe B2B Escrow API key) is pending backend environment variable binding. You can proceed with a simulated test settlement to verify the order fulfillment workflow.
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" id="btnCancelPaymentModal" class="btn btn-outline" style="padding: 9px 16px; border-radius: 6px; cursor: pointer;">Cancel</button>
                    <button type="button" id="btnSimulateEscrowPay" class="btn btn-primary" style="padding: 9px 16px; border-radius: 6px; cursor: pointer; background: #2563eb; color: #fff; border: none; font-weight: 600;">Simulate Test Escrow Deposit</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById("btnCancelPaymentModal").addEventListener("click", function() {
            modal.remove();
        });

        document.getElementById("btnSimulateEscrowPay").addEventListener("click", function() {
            modal.remove();
            showToast("Payment simulation successful. Funds held in TradeNest B2B Escrow.", "success");
            if (button) {
                button.textContent = "Paid (In Escrow)";
                button.disabled = true;
                button.style.background = "#10b981";
                button.style.color = "#ffffff";
            }
        });
    }

    // Attach payment buttons
    $$("[data-action='pay'], button.btn-pay, .btn-make-payment").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            var amt = btn.getAttribute("data-amount") || 24500;
            var ord = btn.getAttribute("data-order-id") || "ORD-98231";
            handlePaymentAction(btn, amt, ord);
        });
    });

    $$(
        'a[href*="register.html"], ' +
        'a[href*="login.html"], ' +
        'a[href*="auth/register.html"], ' +
        'a[href*="auth/login.html"]'
    ).forEach(
        function (link) {
            link.addEventListener(
                "click",
                function () {
                    try {
                        sessionStorage.setItem(
                            "tradenest_last_intent",
                            link.textContent.trim()
                        );
                    } catch (error) {
                        // Optional.
                    }
                }
            );
        }
    );

    // Smart supplier details CTA handlers
    var btnContactSupp = document.getElementById("btnContactSupplierDetails");
    if (btnContactSupp) {
        btnContactSupp.addEventListener("click", function(e) {
            var user = null;
            try { user = JSON.parse(localStorage.getItem("tradenestCurrentUser")); } catch(err) {}
            e.preventDefault();
            var target = user ? "buyer/messages.html?supplier=Example%20Manufacturing%20Co." : "../auth/login.html";
            window.location.href = target;
        });
    }
    var btnReqQuote = document.getElementById("btnRequestQuoteDetails");
    if (btnReqQuote) {
        btnReqQuote.addEventListener("click", function(e) {
            var user = null;
            try { user = JSON.parse(localStorage.getItem("tradenestCurrentUser")); } catch(err) {}
            e.preventDefault();
            var target = user ? "buyer/rfqs.html?supplier=Example%20Manufacturing%20Co." : "../auth/login.html";
            window.location.href = target;
        });
    }

    $$(".product-card .btn, .supplier-card .btn").forEach(function (button) {
        button.addEventListener("click", function () {
            var label = button.textContent.trim();
            var lowerLabel = label.toLowerCase();

            if (
                lowerLabel.indexOf("quote") !== -1 ||
                lowerLabel.indexOf("sample") !== -1 ||
                lowerLabel.indexOf("contact") !== -1 ||
                lowerLabel.indexOf("compare") !== -1
            ) {
                try {
                    sessionStorage.setItem("tradenest_last_action", label);
                } catch (error) {
                    // Optional.
                }
            }
        });
    });
}


/* =========================================================
   IMAGE FALLBACKS
========================================================= */

function initImageFallbacks() {
    $$("img").forEach(function (image) {
        image.addEventListener(
            "error",
            function () {
                if (
                    image.dataset.fallbackApplied ===
                    "true"
                ) {
                    return;
                }

                image.dataset.fallbackApplied =
                    "true";


                var fallback =
                    document.createElement(
                        "div"
                    );

                fallback.className =
                    "tn-image-fallback";

                fallback.textContent =
                    "TradeNest";


                Object.assign(
                    fallback.style,
                    {
                        width:
                            image.clientWidth
                                ? image.clientWidth +
                                  "px"
                                : "100%",

                        minHeight:
                            image.clientHeight
                                ? image.clientHeight +
                                  "px"
                                : "160px",

                        display: "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        background:
                            "#f0ecef",

                        color:
                            "#5b4b63",

                        borderRadius:
                            "10px",

                        fontWeight:
                            "600"
                    }
                );


                image.style.display =
                    "none";


                if (image.parentElement) {
                    image.parentElement.appendChild(
                        fallback
                    );
                }
            }
        );
    });
}


/* =========================================================
   ACCESSIBILITY HELPERS
========================================================= */

function initAccessibility() {

    $$(
        "input, select, textarea"
    ).forEach(function (field) {
        if (
            !field.hasAttribute(
                "aria-invalid"
            )
        ) {
            field.setAttribute(
                "aria-invalid",
                "false"
            );
        }
    });


    $$("button").forEach(
        function (button) {
            if (
                !button.getAttribute(
                    "type"
                )
            ) {
                button.setAttribute(
                    "type",
                    "button"
                );
            }
        }
    );
}


/* =========================================================
   RESTORE SEARCH STATE FROM URL
========================================================= */

function restoreSearchState() {
    var params =
        new URLSearchParams(
            window.location.search
        );

    if (!params.toString()) {
        return;
    }


    var role =
        params.get("role");


    if (role) {
        var userType =
            $("#user-type");

        if (userType) {
            var option =
                Array.from(
                    userType.options
                ).find(function (item) {
                    return (
                        normalizeText(
                            item.value
                        ) ===
                            normalizeText(
                                role
                            ) ||
                        normalizeText(
                            item.textContent
                        ).indexOf(
                            normalizeText(
                                role
                            )
                        ) !== -1
                    );
                });

            if (option) {
                userType.value =
                    option.value;
            }
        }
    }


    var query =
        params.get("query");


    if (
        query &&
        $("#product-search-input")
    ) {
        $(
            "#product-search-input"
        ).value = query;

        $(
            "#product-search-input"
        ).dispatchEvent(
            new Event("input")
        );
    }


    var supplierKeyword =
        params.get("keyword");


    if (
        supplierKeyword &&
        $("#search-keyword")
    ) {
        $("#search-keyword").value =
            supplierKeyword;

        $("#search-keyword").dispatchEvent(
            new Event("input")
        );
    }
}


/* =========================================================
   OPTIONAL PUBLIC API
   Useful if another script needs to trigger a refresh.
========================================================= */

window.TradeNest = {
    toast: showToast,

    clearToast: function () {
        var toast =
            $("#tradenest-toast");

        if (toast) {
            toast.style.opacity = "0";
            toast.style.visibility =
                "hidden";
        }
    },

    getUrlParameter: function (name) {
        return new URLSearchParams(
            window.location.search
        ).get(name);
    }
};
