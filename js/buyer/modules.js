document.addEventListener("DOMContentLoaded", function () {
  if (!window.TradeNestStore) {
    return;
  }

  const store = window.TradeNestStore;
  const page = document.body.dataset.page;
  store.ensureDemoState();

  function showToast(message, type) {
    const existing = document.getElementById("tn-toast");
    const toast = existing || document.createElement("div");
    toast.id = "tn-toast";
    toast.textContent = message;
    toast.className = `tn-toast tn-toast-${type || "info"}`;
    if (!existing) {
      document.body.appendChild(toast);
    }
    setTimeout(function () {
      toast.classList.add("is-visible");
    }, 10);
    clearTimeout(toast.hideTimer);
    toast.hideTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  function formatCurrency(value) {
    return store.formatCurrency(value);
  }

  function getState() {
    return store.getStore();
  }

  function saveState(nextState) {
    store.saveStore(nextState);
  }

  function getBuyer() {
    return store.getCurrentUser();
  }

  function readJsonStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function getSavedProducts() {
    const list = readJsonStorage("tradenest_saved_products", []);
    return Array.isArray(list) ? list.filter((item) => item && item.id) : [];
  }

  function saveSavedProducts(list) {
    return writeJsonStorage("tradenest_saved_products", Array.isArray(list) ? list : []);
  }

  function getSavedSuppliers() {
    const list = readJsonStorage("tradenest_saved_suppliers", []);
    return Array.isArray(list) ? list.filter((item) => item && item.id) : [];
  }

  function saveSavedSuppliers(list) {
    return writeJsonStorage("tradenest_saved_suppliers", Array.isArray(list) ? list : []);
  }

  function addSavedProduct(productId) {
    const state = getState();
    const product = state.products.find((item) => item.id === productId);
    if (!product) return false;

    const saved = getSavedProducts();
    if (saved.some((item) => item.id === productId)) return false;

    saved.push({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      supplierName: product.supplierName,
      price: product.price,
      bulkPrice: product.bulkPrice,
      moq: product.moq,
      stock: product.stock,
      availability: product.availability,
      image: product.image
    });

    saveSavedProducts(saved);
    return true;
  }

  function removeSavedProduct(productId) {
    const saved = getSavedProducts().filter((item) => item.id !== productId);
    saveSavedProducts(saved);
    return true;
  }

  function addSavedSupplier(supplierId) {
    const state = getState();
    const supplier = state.supplierProfiles.find((item) => item.id === supplierId);
    if (!supplier) return false;

    const saved = getSavedSuppliers();
    if (saved.some((item) => item.id === supplierId)) return false;

    saved.push({
      id: supplier.id,
      businessName: supplier.businessName,
      description: supplier.description,
      category: supplier.category,
      location: supplier.location,
      verificationStatus: supplier.verificationStatus,
      trustScore: supplier.trustScore,
      productCategories: supplier.products || [],
      logo: supplier.logo
    });

    saveSavedSuppliers(saved);
    return true;
  }

  function removeSavedSupplier(supplierId) {
    const saved = getSavedSuppliers().filter((item) => item.id !== supplierId);
    saveSavedSuppliers(saved);
    return true;
  }

  function getBuyerProfileDefaults() {
    const buyer = getBuyer();
    return {
      fullName: buyer.fullName || "Aisha Patel",
      email: buyer.email || "aisha.patel@tradenest.com",
      phone: buyer.phone || "+91 98765 43210",
      businessName: buyer.businessName || buyer.company || "North Star Retail",
      businessType: buyer.businessType || "Wholesale Buyer",
      businessCategory: buyer.businessCategory || "Retail & Distribution",
      gstin: buyer.gstin || "29ABCDE1234F1Z5",
      address: buyer.address || "18th Cross Road",
      city: buyer.city || "Bengaluru",
      state: buyer.state || "Karnataka",
      pincode: buyer.pincode || "560001",
      profileImage: buyer.profileImage || "AP"
    };
  }

  function getBuyerProfile() {
    const current = getBuyer();
    const stored = readJsonStorage("tradenestBuyerProfile", {});
    return {
      ...getBuyerProfileDefaults(),
      ...stored,
      ...current,
      businessName: stored.businessName || current.businessName || current.company || getBuyerProfileDefaults().businessName,
      fullName: stored.fullName || current.fullName || getBuyerProfileDefaults().fullName,
      email: stored.email || current.email || getBuyerProfileDefaults().email,
      phone: stored.phone || current.phone || getBuyerProfileDefaults().phone,
      city: stored.city || current.city || getBuyerProfileDefaults().city,
      state: stored.state || current.state || getBuyerProfileDefaults().state
    };
  }

  function saveBuyerProfile(profile) {
    const normalized = {
      ...getBuyerProfileDefaults(),
      ...(profile || {})
    };

    const user = getBuyer();
    localStorage.setItem("tradenestBuyerProfile", JSON.stringify(normalized));
    localStorage.setItem("tradenestCurrentUser", JSON.stringify({
      ...user,
      ...normalized,
      businessName: normalized.businessName,
      company: normalized.businessName,
      city: normalized.city,
      state: normalized.state,
      country: user.country || "India"
    }));
    return normalized;
  }

  function getBuyerSettingsDefaults() {
    return {
      emailAlerts: true,
      appNotifications: true,
      orderUpdates: true,
      priceAlerts: true,
      supplierUpdates: false,
      newsletterEmails: true,
      profilePrivacy: "Private to my account",
      theme: "Light",
      autoSaveDrafts: true
    };
  }

  function getBuyerSettings() {
    const stored = readJsonStorage("tradenestBuyerSettings", {});
    return { ...getBuyerSettingsDefaults(), ...stored };
  }

  function saveBuyerSettings(settings) {
    const normalized = { ...getBuyerSettingsDefaults(), ...(settings || {}) };
    localStorage.setItem("tradenestBuyerSettings", JSON.stringify(normalized));
    return normalized;
  }

  function renderSavedProducts() {
    const list = document.getElementById("saved-product-list");
    if (!list) return;

    const state = getState();
    const searchInput = document.getElementById("saved-product-search");
    const categorySelect = document.getElementById("saved-product-category");
    const supplierSelect = document.getElementById("saved-product-supplier");
    const sortSelect = document.getElementById("saved-product-sort");

    const savedIds = getSavedProducts().map((item) => item.id);
    const savedItems = state.products.filter((product) => savedIds.includes(product.id));

    if (categorySelect) {
      const categories = [...new Set(savedItems.map((product) => product.category))];
      categorySelect.innerHTML = '<option value="">All categories</option>' + categories.map((category) => `<option value="${category}">${category}</option>`).join("");
    }

    if (supplierSelect) {
      const suppliers = [...new Set(savedItems.map((product) => product.supplierId))];
      supplierSelect.innerHTML = '<option value="">All suppliers</option>' + suppliers.map((supplierId) => {
        const supplier = state.supplierProfiles.find((entry) => entry.id === supplierId);
        return `<option value="${supplierId}">${supplier ? supplier.businessName : supplierId}</option>`;
      }).join("");
    }

    function applyFilters() {
      const searchTerm = (searchInput ? searchInput.value : "").toLowerCase();
      const category = categorySelect ? categorySelect.value : "";
      const supplier = supplierSelect ? supplierSelect.value : "";
      const sort = sortSelect ? sortSelect.value : "name";

      let results = savedItems.filter((product) => {
        const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm) || product.supplierName.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        const matchesSupplier = !supplier || product.supplierId === supplier;
        return matchesSearch && matchesCategory && matchesSupplier;
      });

      results.sort((a, b) => {
        if (sort === "price-low") return a.price - b.price;
        if (sort === "price-high") return b.price - a.price;
        if (sort === "name") return a.name.localeCompare(b.name);
        return 0;
      });

      if (!savedItems.length) {
        list.innerHTML = '<div class="empty-state large"><h3>No Saved Products Yet</h3><p>Your saved product list is empty. Browse products and save the ones you want to revisit later.</p><a href="products.html" class="btn btn-primary" style="margin-top:12px;">Browse Products</a></div>';
        return;
      }

      if (!results.length) {
        list.innerHTML = '<div class="empty-state large">No Results Found.</div>';
        return;
      }

      list.innerHTML = results.map((product) => `
        <article class="product-card">
          <div class="product-image-wrap">
            <img src="${product.image}" alt="${product.name}" />
            <span class="badge">${product.category}</span>
          </div>
          <div class="product-body">
            <h3>${product.name}</h3>
            <p class="muted">Supplier: ${product.supplierName}</p>
            <p>${product.description}</p>
            <div class="info-row"><span>Unit Price</span><strong>${formatCurrency(product.price)}</strong></div>
            <div class="info-row"><span>Bulk Price</span><strong>${formatCurrency(product.bulkPrice)}</strong></div>
            <div class="info-row"><span>MOQ</span><strong>${product.moq} ${product.unit}</strong></div>
            <div class="info-row"><span>Stock</span><strong>${product.stock}</strong></div>
            <div class="info-row"><span>Status</span><strong>${product.availability}</strong></div>
            <div class="button-row">
              <button class="btn btn-primary small" type="button" data-open-product="${product.id}">View Product</button>
              <button class="btn btn-danger small" type="button" data-remove-saved-product="${product.id}">Remove</button>
            </div>
          </div>
        </article>
      `).join("");
    }

    [searchInput, categorySelect, supplierSelect, sortSelect].forEach((element) => {
      if (element) element.addEventListener("input", applyFilters);
      if (element) element.addEventListener("change", applyFilters);
    });

    const resetBtn = document.getElementById("saved-product-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (searchInput) searchInput.value = "";
        if (categorySelect) categorySelect.value = "";
        if (supplierSelect) supplierSelect.value = "";
        if (sortSelect) sortSelect.value = "name";
        applyFilters();
      });
    }

    if (document.body.dataset.savedProductClickBound !== "true") {
      document.body.dataset.savedProductClickBound = "true";
      document.addEventListener("click", function (event) {
        const removeButton = event.target.closest("[data-remove-saved-product]");
        if (removeButton) {
          const productId = removeButton.getAttribute("data-remove-saved-product");
          removeSavedProduct(productId);
          renderSavedProducts();
          showToast("Product removed from saved list.", "success");
          return;
        }

        const openButton = event.target.closest("[data-open-product]");
        if (openButton) {
          const productId = openButton.getAttribute("data-open-product");
          localStorage.setItem("tradenestSelectedProductId", JSON.stringify(productId));
          window.location.href = `product-details.html?id=${encodeURIComponent(productId)}`;
        }
      });
    }

    applyFilters();
  }

  function renderSavedSuppliers() {
    const list = document.getElementById("saved-supplier-list");
    if (!list) return;

    const state = getState();
    const searchInput = document.getElementById("saved-supplier-search");
    const categorySelect = document.getElementById("saved-supplier-category");
    const locationSelect = document.getElementById("saved-supplier-location");
    const sortSelect = document.getElementById("saved-supplier-sort");

    const savedIds = getSavedSuppliers().map((item) => item.id);
    const savedItems = state.supplierProfiles.filter((supplier) => savedIds.includes(supplier.id));

    if (categorySelect) {
      const categories = [...new Set(savedItems.map((supplier) => supplier.category))];
      categorySelect.innerHTML = '<option value="">All categories</option>' + categories.map((category) => `<option value="${category}">${category}</option>`).join("");
    }

    if (locationSelect) {
      const locations = [...new Set(savedItems.map((supplier) => supplier.location))];
      locationSelect.innerHTML = '<option value="">All locations</option>' + locations.map((location) => `<option value="${location}">${location}</option>`).join("");
    }

    function applyFilters() {
      const searchTerm = (searchInput ? searchInput.value : "").toLowerCase();
      const category = categorySelect ? categorySelect.value : "";
      const location = locationSelect ? locationSelect.value : "";
      const sort = sortSelect ? sortSelect.value : "name";

      let results = savedItems.filter((supplier) => {
        const matchesSearch = !searchTerm || supplier.businessName.toLowerCase().includes(searchTerm) || supplier.category.toLowerCase().includes(searchTerm) || supplier.location.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || supplier.category === category;
        const matchesLocation = !location || supplier.location === location;
        return matchesSearch && matchesCategory && matchesLocation;
      });

      results.sort((a, b) => sort === "name" ? a.businessName.localeCompare(b.businessName) : b.trustScore - a.trustScore);

      if (!savedItems.length) {
        list.innerHTML = '<div class="empty-state large"><h3>No Saved Suppliers Yet</h3><p>Your saved supplier list is currently empty. Save trusted suppliers you want to compare.</p><a href="suppliers.html" class="btn btn-primary" style="margin-top:12px;">Browse Suppliers</a></div>';
        return;
      }

      if (!results.length) {
        list.innerHTML = '<div class="empty-state large">No Results Found.</div>';
        return;
      }

      list.innerHTML = results.map((supplier) => `
        <article class="supplier-card">
          <div class="supplier-card-head">
            <div class="supplier-logo">${supplier.logo}</div>
            <div>
              <h3>${supplier.businessName}</h3>
              <span>${supplier.category}</span>
            </div>
          </div>
          <p>${supplier.description}</p>
          <div class="meta-grid">
            <span>Location</span><strong>${supplier.location}</strong>
            <span>Verification</span><strong>${supplier.verificationStatus}</strong>
            <span>Trust</span><strong>${supplier.trustScore}/100</strong>
            <span>Product categories</span><strong>${supplier.products ? supplier.products.length : 0}</strong>
          </div>
          <div class="button-row">
            <button class="btn btn-primary small" type="button" data-supplier-id="${supplier.id}">View Supplier</button>
            <button class="btn btn-danger small" type="button" data-remove-saved-supplier="${supplier.id}">Remove</button>
          </div>
        </article>
      `).join("");
    }

    [searchInput, categorySelect, locationSelect, sortSelect].forEach((element) => {
      if (element) element.addEventListener("input", applyFilters);
      if (element) element.addEventListener("change", applyFilters);
    });

    const resetBtn = document.getElementById("saved-supplier-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (searchInput) searchInput.value = "";
        if (categorySelect) categorySelect.value = "";
        if (locationSelect) locationSelect.value = "";
        if (sortSelect) sortSelect.value = "name";
        applyFilters();
      });
    }

    if (document.body.dataset.savedSupplierClickBound !== "true") {
      document.body.dataset.savedSupplierClickBound = "true";
      document.addEventListener("click", function (event) {
        const removeButton = event.target.closest("[data-remove-saved-supplier]");
        if (removeButton) {
          const supplierId = removeButton.getAttribute("data-remove-saved-supplier");
          removeSavedSupplier(supplierId);
          renderSavedSuppliers();
          showToast("Supplier removed from saved list.", "success");
          return;
        }

        const profileButton = event.target.closest("[data-supplier-id]");
        if (profileButton) {
          const supplierId = profileButton.getAttribute("data-supplier-id");
          localStorage.setItem("tradenestSelectedSupplierId", JSON.stringify(supplierId));
          window.location.href = `supplier-details.html?id=${encodeURIComponent(supplierId)}`;
        }
      });
    }

    applyFilters();
  }

  function renderBuyerProfilePage() {
    const container = document.getElementById("buyer-profile-card");
    const form = document.getElementById("buyer-profile-form");
    if (!container && !form) return;

    const profile = getBuyerProfile();

    if (container) {
      const initials = (profile.fullName || "Buyer").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
      container.innerHTML = `
        <div class="profile-summary">
          <div class="profile-avatar">${initials}</div>
          <div>
            <h2>${profile.fullName}</h2>
            <p>${profile.businessName} • ${profile.businessType}</p>
          </div>
        </div>
        <div class="profile-detail-grid">
          <div class="profile-detail-card"><span>Email</span><strong>${profile.email}</strong></div>
          <div class="profile-detail-card"><span>Phone</span><strong>${profile.phone}</strong></div>
          <div class="profile-detail-card"><span>GSTIN</span><strong>${profile.gstin}</strong></div>
          <div class="profile-detail-card"><span>Business Category</span><strong>${profile.businessCategory}</strong></div>
          <div class="profile-detail-card"><span>Address</span><strong>${profile.address}</strong></div>
          <div class="profile-detail-card"><span>Location</span><strong>${profile.city}, ${profile.state} - ${profile.pincode}</strong></div>
        </div>
      `;
    }

    if (form) {
      form.fullName.value = profile.fullName || "";
      form.email.value = profile.email || "";
      form.phone.value = profile.phone || "";
      form.businessName.value = profile.businessName || "";
      form.businessType.value = profile.businessType || "";
      form.businessCategory.value = profile.businessCategory || "";
      form.gstin.value = profile.gstin || "";
      form.address.value = profile.address || "";
      form.city.value = profile.city || "";
      form.state.value = profile.state || "";
      form.pincode.value = profile.pincode || "";

      if (form.dataset.bound !== "profile") {
        form.dataset.bound = "profile";
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          const nextProfile = {
            fullName: form.fullName.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            businessName: form.businessName.value.trim(),
            businessType: form.businessType.value.trim(),
            businessCategory: form.businessCategory.value.trim(),
            gstin: form.gstin.value.trim(),
            address: form.address.value.trim(),
            city: form.city.value.trim(),
            state: form.state.value.trim(),
            pincode: form.pincode.value.trim()
          };

          saveBuyerProfile(nextProfile);
          renderBuyerProfilePage();
          showToast("Buyer profile updated successfully.", "success");
        });
      }
    }
  }

  function renderBuyerSettingsPage() {
    const form = document.getElementById("buyer-settings-form");
    if (!form) return;

    const settings = getBuyerSettings();
    Object.entries(settings).forEach(([key, value]) => {
      const input = form.elements.namedItem(key);
      if (!input) return;
      if (input.type === "checkbox") {
        input.checked = Boolean(value);
      } else {
        input.value = value;
      }
    });

    if (form.dataset.bound !== "settings") {
      form.dataset.bound = "settings";
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const nextSettings = {};
        Array.from(form.elements).forEach((element) => {
          if (!element.name) return;
          if (element.type === "checkbox") {
            nextSettings[element.name] = element.checked;
          } else if (element.type !== "submit") {
            nextSettings[element.name] = element.value;
          }
        });
        saveBuyerSettings(nextSettings);
        showToast("Buyer settings saved successfully.", "success");
      });
    }
  }

  function getStatusBadgeClass(status) {
    const value = String(status || "").toLowerCase().trim();
    if (!value) return "pending";
    if (value.includes("processing") || value.includes("review") || value.includes("under")) return "processing";
    if (value.includes("shipped") || value.includes("dispatch") || value.includes("in transit")) return "shipped";
    if (value.includes("delivered") || value.includes("completed") || value.includes("approved") || value.includes("accepted")) return "delivered";
    if (value.includes("pending") || value.includes("quote") || value.includes("offer")) return "pending";
    return "pending";
  }

  function renderDashboard() {
    const state = getState();
    const buyer = getBuyer();
    const buyerId = buyer && buyer.id ? buyer.id : "buyer-001";
    const rfqs = (state.rfqs || []).filter((item) => item.buyerId === buyerId);
    const quotations = (state.quotations || []).filter((item) => item.buyerId === buyerId);
    const sampleRequests = (state.sampleRequests || []).filter((item) => item.buyerId === buyerId);
    const orders = (state.orders || []).filter((item) => item.buyerId === buyerId);
    const activeOrders = orders.filter((item) => !["Completed", "Delivered", "Cancelled", "Rejected"].includes(item.status));
    const completedOrders = orders.filter((item) => ["Completed", "Delivered"].includes(item.status));

    const totalRfqs = rfqs.length;
    const pendingQuotations = quotations.filter((item) => ["Pending", "In Review", "Under Review", "Offer Received"].includes(item.status)).length;
    const activeSamples = sampleRequests.filter((item) => !["Delivered", "Feedback Submitted", "Rejected"].includes(item.status)).length;
    const activeOrderCount = activeOrders.length;
    const completedOrderCount = completedOrders.length;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((item) => !["Completed", "Delivered", "Cancelled", "Rejected"].includes(item.status)).length;
    const completedPurchases = completedOrders.length;
    const totalSpent = orders.reduce((sum, item) => sum + (Number(item.totalAmount || item.amount || 0) || 0), 0);
    const savedProductsCount = getSavedProducts().length;
    const activeQuotesCount = quotations.filter((item) => !["Accepted", "Rejected", "Cancelled"].includes(item.status)).length;

    const topStatEls = {
      totalOrders: document.getElementById("totalOrders"),
      activeQuotes: document.getElementById("activeQuotes"),
      pendingOrders: document.getElementById("pendingOrders"),
      completedPurchases: document.getElementById("completedPurchases"),
      savedProducts: document.getElementById("savedProducts"),
      totalSpent: document.getElementById("totalSpent")
    };

    if (topStatEls.totalOrders) topStatEls.totalOrders.textContent = totalOrders;
    if (topStatEls.activeQuotes) topStatEls.activeQuotes.textContent = activeQuotesCount;
    if (topStatEls.pendingOrders) topStatEls.pendingOrders.textContent = pendingOrders;
    if (topStatEls.completedPurchases) topStatEls.completedPurchases.textContent = completedPurchases;
    if (topStatEls.savedProducts) topStatEls.savedProducts.textContent = savedProductsCount;
    if (topStatEls.totalSpent) topStatEls.totalSpent.textContent = formatCurrency(totalSpent);

    const statEls = {
      totalRfqs: document.getElementById("stat-total-rfqs"),
      pendingQuotations: document.getElementById("stat-pending-quotations"),
      activeSamples: document.getElementById("stat-active-samples"),
      activeOrders: document.getElementById("stat-active-orders"),
      completedOrders: document.getElementById("stat-completed-orders")
    };

    if (statEls.totalRfqs) statEls.totalRfqs.textContent = totalRfqs;
    if (statEls.pendingQuotations) statEls.pendingQuotations.textContent = pendingQuotations;
    if (statEls.activeSamples) statEls.activeSamples.textContent = activeSamples;
    if (statEls.activeOrders) statEls.activeOrders.textContent = activeOrderCount;
    if (statEls.completedOrders) statEls.completedOrders.textContent = completedOrderCount;

    const recentFeed = document.getElementById("dashboard-activity-list");
    if (recentFeed) {
      const activity = [
        ...rfqs.map((item) => ({
          title: `RFQ ${item.status}: ${item.title}`,
          meta: `Reference ${item.id}`,
          type: "rfq"
        })),
        ...quotations.map((item) => ({
          title: `Quotation ${item.status}: ${item.productName}`,
          meta: `${item.supplierName}`,
          type: "quote"
        })),
        ...orders.map((item) => ({
          title: `Order update: ${item.productName}`,
          meta: `Status ${item.status}`,
          type: "order"
        }))
      ].slice(0, 6);

      recentFeed.innerHTML = activity.map((item) => `
        <li class="activity-item">
          <span class="activity-chip ${item.type}">${item.type.toUpperCase()}</span>
          <div>
            <strong>${item.title}</strong>
            <small>${item.meta}</small>
          </div>
        </li>
      `).join("") || '<li class="empty-state">No activity recorded yet.</li>';
    }

    const recentOrderTable = document.querySelector(".recent-orders-card tbody");
    if (recentOrderTable) {
      const rows = orders.slice(0, 4);
      recentOrderTable.innerHTML = rows.length ? rows.map((order) => `
        <tr>
          <td><strong>#${order.id}</strong></td>
          <td>${order.productName} (x${order.quantity})</td>
          <td>${order.supplierName}</td>
          <td>${formatCurrency(order.totalAmount || order.amount || 0)}</td>
          <td><span class="status-badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
        </tr>
      `).join("") : '<tr><td colspan="5"><div class="empty-state">No purchase orders yet.</div></td></tr>';
    }

    const activeQuotesList = document.querySelector(".active-quotes-card .quotes-list");
    if (activeQuotesList) {
      const list = quotations.slice(0, 3);
      activeQuotesList.innerHTML = list.length ? list.map((quote) => `
        <div class="quote-item">
          <div class="quote-info">
            <h3 class="quote-product">${quote.productName}</h3>
            <p class="quote-meta">Qty: ${quote.quantity} ${quote.unit || "Units"} • Supplier: <strong>${quote.supplierName}</strong></p>
          </div>
          <div class="quote-details">
            <span class="quote-amount">${formatCurrency(quote.totalAmount || quote.unitPrice * (quote.quantity || 1) || 0)}</span>
            <span class="status-badge ${getStatusBadgeClass(quote.status)}">${quote.status}</span>
          </div>
        </div>
      `).join("") : '<div class="empty-state">No active quotes right now.</div>';
    }

    const recommended = document.getElementById("recommended-suppliers");
    if (recommended) {
      recommended.innerHTML = state.supplierProfiles.slice(0, 3).map((supplier) => `
        <article class="supplier-card compact">
          <div class="supplier-card-head">
            <div class="supplier-logo">${supplier.logo}</div>
            <div>
              <h3>${supplier.businessName}</h3>
              <span>${supplier.category}</span>
            </div>
          </div>
          <p>${supplier.description}</p>
          <div class="info-row">
            <span>Trust Score</span>
            <strong>${supplier.trustScore}/100</strong>
          </div>
          <button class="btn btn-secondary small" type="button" data-supplier-id="${supplier.id}">View profile</button>
        </article>
      `).join("");
    }

    const profileName = document.getElementById("welcomeUserName");
    if (profileName) {
      profileName.textContent = buyer.fullName || buyer.businessName || "Buyer";
    }

    const resetBtn = document.getElementById("reset-demo-data-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        store.resetDemoData();
        renderDashboard();
        renderProducts();
        renderSuppliers();
        renderRFQs();
        renderQuotations();
        renderSamples();
        renderCollaborations();
        renderMessages();
        renderOrders();
        renderPayments();
        renderDelivery();
        showToast("Local data reset successfully.", "success");
      });
    }
  }

  function renderProducts() {
    const list = document.getElementById("product-list");
    if (!list) return;

    const state = getState();
    const searchInput = document.getElementById("product-search");
    const categorySelect = document.getElementById("product-category");
    const supplierSelect = document.getElementById("product-supplier");
    const availabilitySelect = document.getElementById("product-availability");
    const sortSelect = document.getElementById("product-sort");

    let productsList = [];
    if (window.TradeNestProductService && typeof window.TradeNestProductService.getAllProducts === "function") {
      const rawProducts = window.TradeNestProductService.getAllProducts();
      productsList = rawProducts.map((p) => {
        const calculatedPrice = p.price !== undefined ? p.price : (p.unitPrice && p.moq ? Math.round(p.unitPrice * p.moq) : (p.unitPrice || 0));
        return {
          id: p.id,
          name: p.name,
          category: p.category || "General",
          supplierId: p.supplierId || "supplier-001",
          supplierName: p.supplierName || "Apex Gear Co.",
          description: p.description || "",
          price: calculatedPrice,
          unitPrice: p.unitPrice || calculatedPrice,
          moq: p.moq || 1,
          unit: p.uom || p.unit || "units",
          stock: p.availableStock !== undefined ? p.availableStock : (p.stock || 0),
          availability: (p.availableStock > 0 || p.stock > 0 || p.status === "Active") ? "In Stock" : "Low Stock",
          image: p.image || "../../images/products/industrial-safety-gloves.webp",
          deliveryInfo: p.deliveryInfo || "3-5 business days"
        };
      });
    } else {
      productsList = state.products || [];
    }

    if (supplierSelect) {
      const uniqueSuppliers = [...new Map(productsList.map((p) => [p.supplierId || p.supplierName, p.supplierName])).entries()];
      supplierSelect.innerHTML = '<option value="">All suppliers</option>' + uniqueSuppliers.map(([id, name]) => `<option value="${id}">${name}</option>`).join("");
    }

    if (categorySelect) {
      const categories = [...new Set(productsList.map((product) => product.category).filter(Boolean))];
      categorySelect.innerHTML = '<option value="">All categories</option>' + categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("");
    }

    function applyFilters() {
      const searchTerm = (searchInput ? searchInput.value : "").toLowerCase();
      const category = categorySelect ? categorySelect.value : "";
      const supplier = supplierSelect ? supplierSelect.value : "";
      const availability = availabilitySelect ? availabilitySelect.value : "";
      const sort = sortSelect ? sortSelect.value : "name";

      let results = productsList.filter((product) => {
        const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm) || product.supplierName.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        const matchesSupplier = !supplier || product.supplierId === supplier || product.supplierName === supplier;
        const matchesAvailability = !availability || product.availability === availability;
        return matchesSearch && matchesCategory && matchesSupplier && matchesAvailability;
      });

      results.sort((a, b) => {
        if (sort === "price-low") return a.price - b.price;
        if (sort === "price-high") return b.price - a.price;
        if (sort === "name") return a.name.localeCompare(b.name);
        return 0;
      });

      if (!results.length) {
        list.innerHTML = '<div class="empty-state large">No matching records found. Try changing your search or filters.</div>';
        return;
      }

      list.innerHTML = results.map((product) => {
        let img = product.image || "../../images/products/industrial-safety-gloves.webp";
        if (img.startsWith("../../../")) {
          img = img.replace("../../../", "../../");
        } else if (!img.startsWith("../../") && !img.startsWith("http") && !img.startsWith("data:")) {
          img = "../../" + img.replace(/^\/+/, "");
        }

        return `
          <article class="product-card" data-product-id="${product.id}">
            <div class="product-image-wrap">
              <img src="${img}" alt="${product.name}" onerror="this.src='../../images/products/industrial-safety-gloves.webp'" />
              <span class="badge">${product.category}</span>
            </div>
            <div class="product-body">
              <h3>${product.name}</h3>
              <p class="muted">🏢 Supplier: <strong>${product.supplierName}</strong></p>
              <p>${product.description}</p>
              <div class="info-row">
                <span>Unit Price</span>
                <strong>${formatCurrency(product.price)}</strong>
              </div>
              <div class="info-row">
                <span>MOQ</span>
                <strong>${product.moq} ${product.unit}</strong>
              </div>
              <div class="info-row">
                <span>Stock</span>
                <strong>${product.stock} ${product.unit}</strong>
              </div>
              <div class="info-row">
                <span>Availability</span>
                <strong style="color: ${product.stock > 0 ? '#10b981' : '#ef4444'};">${product.availability}</strong>
              </div>
              <div class="info-row" style="font-size: 0.8rem; color: #64748b;">
                <span>Delivery</span>
                <strong>🚚 ${product.deliveryInfo || '3-5 business days'}</strong>
              </div>
              <div class="button-row" style="margin-top: 10px;">
                <button class="btn btn-primary small" type="button" data-open-product="${product.id}">Open details</button>
                <button class="btn btn-secondary small" type="button" data-save-product="${product.id}">${getSavedProducts().some((item) => item.id === product.id) ? "Saved" : "Save Product"}</button>
              </div>
            </div>
          </article>
        `;
      }).join("");
    }

    [searchInput, categorySelect, supplierSelect, availabilitySelect, sortSelect].forEach((element) => {
      if (element) element.addEventListener("input", applyFilters);
      if (element) element.addEventListener("change", applyFilters);
    });

    const resetBtn = document.getElementById("product-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (searchInput) searchInput.value = "";
        if (categorySelect) categorySelect.value = "";
        if (supplierSelect) supplierSelect.value = "";
        if (availabilitySelect) availabilitySelect.value = "";
        if (sortSelect) sortSelect.value = "name";
        applyFilters();
      });
    }

    if (document.body.dataset.productClickBound !== "true") {
      document.body.dataset.productClickBound = "true";
      document.addEventListener("click", function (event) {
        const saveButton = event.target.closest("[data-save-product]");
        if (saveButton) {
          const productId = saveButton.getAttribute("data-save-product");
          const saved = addSavedProduct(productId);
          if (saved) {
            saveButton.textContent = "Saved";
            showToast("Product saved successfully.", "success");
          } else {
            showToast("This product is already saved.", "info");
          }
          return;
        }

        const button = event.target.closest("[data-open-product]");
        if (!button) return;
        const productId = button.getAttribute("data-open-product");
        const product = productsList.find((item) => item.id === productId);
        if (product) {
          localStorage.setItem("tradenestSelectedProductId", JSON.stringify(productId));
          window.location.href = `product-details.html?id=${encodeURIComponent(productId)}`;
        }
      });
    }

    if (document.body.dataset.productsSyncBound !== "true") {
      document.body.dataset.productsSyncBound = "true";
      window.addEventListener("tradenest:products-changed", renderProducts);
      window.addEventListener("storage", function (e) {
        if (e.key === "tradenest_shared_products_v2" || e.key === "tradenest_supplier_products") {
          renderProducts();
        }
      });
    }

    applyFilters();
  }

  function renderSuppliers() {
    const list = document.getElementById("supplier-list");
    if (!list) return;
    const state = getState();
    const searchInput = document.getElementById("supplier-search");
    const locationFilter = document.getElementById("supplier-location");
    const categoryFilter = document.getElementById("supplier-category");
    const sortFilter = document.getElementById("supplier-sort");

    function applyFilters() {
      const query = (searchInput ? searchInput.value : "").toLowerCase();
      const location = locationFilter ? locationFilter.value : "";
      const category = categoryFilter ? categoryFilter.value : "";
      const sort = sortFilter ? sortFilter.value : "trust";

      let results = state.supplierProfiles.filter((supplier) => {
        const matchesSearch = !query || supplier.businessName.toLowerCase().includes(query) || supplier.category.toLowerCase().includes(query) || supplier.location.toLowerCase().includes(query);
        const matchesLocation = !location || supplier.location.toLowerCase().includes(location.toLowerCase());
        const matchesCategory = !category || supplier.category === category;
        return matchesSearch && matchesLocation && matchesCategory;
      });

      results.sort((a, b) => sort === "trust" ? b.trustScore - a.trustScore : a.businessName.localeCompare(b.businessName));

      if (!results.length) {
        list.innerHTML = '<div class="empty-state large">No matching suppliers found. Try a different search or filter.</div>';
        return;
      }

      list.innerHTML = results.map((supplier) => `
        <article class="supplier-card">
          <div class="supplier-card-head">
            <div class="supplier-logo">${supplier.logo}</div>
            <div>
              <h3>${supplier.businessName}</h3>
              <span>${supplier.category}</span>
            </div>
          </div>
          <p>${supplier.description}</p>
          <div class="meta-grid">
            <span>Location</span><strong>${supplier.location}</strong>
            <span>Verification</span><strong>${supplier.verificationStatus}</strong>
            <span>Trust</span><strong>${supplier.trustScore}/100</strong>
          </div>
          <div class="button-row">
            <button class="btn btn-primary small" type="button" data-supplier-id="${supplier.id}">Open profile</button>
            <button class="btn btn-secondary small" type="button" data-save-supplier="${supplier.id}">${getSavedSuppliers().some((item) => item.id === supplier.id) ? "Saved" : "Save Supplier"}</button>
            <button class="btn btn-secondary small" type="button" data-enquiry-supplier="${supplier.id}">Send enquiry</button>
          </div>
        </article>
      `).join("");
    }

    if (categoryFilter) {
      const categories = [...new Set(state.supplierProfiles.map((supplier) => supplier.category))];
      categoryFilter.innerHTML = '<option value="">All categories</option>' + categories.map((category) => `<option value="${category}">${category}</option>`).join("");
    }

    [searchInput, locationFilter, categoryFilter, sortFilter].forEach((element) => {
      if (element) element.addEventListener("input", applyFilters);
      if (element) element.addEventListener("change", applyFilters);
    });

    const resetBtn = document.getElementById("supplier-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (searchInput) searchInput.value = "";
        if (locationFilter) locationFilter.value = "";
        if (categoryFilter) categoryFilter.value = "";
        if (sortFilter) sortFilter.value = "trust";
        applyFilters();
      });
    }

    if (document.body.dataset.supplierClickBound !== "true") {
      document.body.dataset.supplierClickBound = "true";
      document.addEventListener("click", function (event) {
        const saveSupplierBtn = event.target.closest("[data-save-supplier]");
        if (saveSupplierBtn) {
          const supplierId = saveSupplierBtn.getAttribute("data-save-supplier");
          const saved = addSavedSupplier(supplierId);
          if (saved) {
            saveSupplierBtn.textContent = "Saved";
            showToast("Supplier saved successfully.", "success");
          } else {
            showToast("This supplier is already saved.", "info");
          }
          return;
        }

        const profileBtn = event.target.closest("[data-supplier-id]");
        if (profileBtn) {
          const supplierId = profileBtn.getAttribute("data-supplier-id");
          localStorage.setItem("tradenestSelectedSupplierId", JSON.stringify(supplierId));
          window.location.href = `supplier-details.html?id=${encodeURIComponent(supplierId)}`;
        }
        const enquiryBtn = event.target.closest("[data-enquiry-supplier]");
        if (enquiryBtn) {
          const supplierId = enquiryBtn.getAttribute("data-enquiry-supplier");
          const supplier = state.supplierProfiles.find((item) => item.id === supplierId);
          showToast(`Enquiry drafted for ${supplier ? supplier.businessName : "supplier"}.`, "success");
        }
      });
    }

    applyFilters();
  }

  function renderRFQs() {
    const list = document.getElementById("rfq-list");
    const state = getState();
    const buyer = getBuyer();

    const form = document.getElementById("rfq-form");
    if (form) {
      const productSelect = document.getElementById("rfq-product");
      const supplierSelect = document.getElementById("rfq-supplier");
      if (productSelect) {
        productSelect.innerHTML = '<option value="">Select product</option>' + state.products.map((product) => `<option value="${product.id}">${product.name}</option>`).join("");
      }
      if (supplierSelect) {
        supplierSelect.innerHTML = '<option value="">Select supplier</option>' + state.supplierProfiles.map((supplier) => `<option value="${supplier.id}">${supplier.businessName}</option>`).join("");
      }
      if (form.dataset.bound !== "rfq") {
        form.dataset.bound = "rfq";
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          const formData = new FormData(form);
          const title = formData.get("title")?.trim();
          const productId = formData.get("productId");
          const supplierId = formData.get("supplierId");
          const quantity = Number(formData.get("quantity"));
          const targetPrice = Number(formData.get("targetPrice"));
          if (!title || !productId || !supplierId || !quantity || !targetPrice) {
            showToast("Please complete all required RFQ fields.", "error");
            return;
          }
          const product = state.products.find((item) => item.id === productId);
          const supplier = state.supplierProfiles.find((item) => item.id === supplierId);
          const newRFQ = {
            id: `rfq-${Date.now()}`,
            buyerId: buyer.id,
            title,
            productId,
            supplierId,
            productName: product ? product.name : "Product",
            quantity,
            unit: formData.get("unit") || "units",
            targetPrice,
            deliveryLocation: formData.get("deliveryLocation") || "Bengaluru",
            expectedDate: formData.get("expectedDate") || new Date().toISOString().slice(0, 10),
            notes: formData.get("notes") || "",
            status: "Pending",
            responseDeadline: formData.get("responseDeadline") || new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString()
          };
          state.rfqs.unshift(newRFQ);
          saveState(state);
          store.addActivity("RFQ", `RFQ created for ${newRFQ.productName}`);
          form.reset();
          renderRFQs();
          showToast("RFQ saved successfully.", "success");
        });
      }
    }

    if (!list) return;

    const rfqs = state.rfqs.filter((item) => item.buyerId === buyer.id);
    list.innerHTML = rfqs.length ? rfqs.map((rfq) => `
      <article class="record-card">
        <div class="record-header">
          <div>
            <strong>${rfq.id}</strong>
            <h3>${rfq.title}</h3>
          </div>
          <span class="status-badge ${rfq.status.toLowerCase().replace(/\s+/g, "-")}">${rfq.status}</span>
        </div>
        <div class="meta-grid">
          <span>Product</span><strong>${rfq.productName}</strong>
          <span>Quantity</span><strong>${rfq.quantity} ${rfq.unit}</strong>
          <span>Target price</span><strong>${formatCurrency(rfq.targetPrice)}</strong>
          <span>Supplier</span><strong>${rfq.supplierId || "Open"}</strong>
        </div>
        <div class="button-row">
          <button class="btn btn-secondary small" type="button" data-rfq-status="${rfq.id}" data-next-status="In Review">Mark in review</button>
          <button class="btn btn-danger small" type="button" data-rfq-cancel="${rfq.id}">Cancel</button>
        </div>
      </article>
    `).join("") : '<div class="empty-state large">No RFQs available yet.</div>';

    if (document.body.dataset.rfqHandlersBound !== "true") {
      document.body.dataset.rfqHandlersBound = "true";
      document.addEventListener("click", function (event) {
        const cancelBtn = event.target.closest("[data-rfq-cancel]");
        if (cancelBtn) {
          const rfqId = cancelBtn.getAttribute("data-rfq-cancel");
          const rfqState = getState();
          rfqState.rfqs = rfqState.rfqs.filter((item) => item.id !== rfqId);
          saveState(rfqState);
          renderRFQs();
          showToast("RFQ cancelled.", "success");
        }
        const statusBtn = event.target.closest("[data-rfq-status]");
        if (statusBtn) {
          const rfqId = statusBtn.getAttribute("data-rfq-status");
          const nextStatus = statusBtn.getAttribute("data-next-status");
          const rfqState = getState();
          const item = rfqState.rfqs.find((record) => record.id === rfqId);
          if (item) {
            item.status = nextStatus;
            saveState(rfqState);
            renderRFQs();
            showToast(`RFQ updated to ${nextStatus}.`, "success");
          }
        }
      });
    }
  }

  function renderQuotations() {
    const list = document.getElementById("quotation-list");
    if (!list) return;
    const state = getState();
    const buyer = getBuyer();
    const quotations = state.quotations.filter((item) => item.buyerId === buyer.id);

    list.innerHTML = quotations.length ? quotations.map((quote) => `
      <article class="record-card">
        <div class="record-header">
          <div>
            <strong>${quote.id}</strong>
            <h3>${quote.productName}</h3>
          </div>
          <span class="status-badge ${quote.status.toLowerCase().replace(/\s+/g, "-")}">${quote.status}</span>
        </div>
        <div class="meta-grid">
          <span>Supplier</span><strong>${quote.supplierName}</strong>
          <span>Qty</span><strong>${quote.quantity}</strong>
          <span>Unit Price</span><strong>${formatCurrency(quote.unitPrice)}</strong>
          <span>Delivery</span><strong>${quote.deliveryTimeline}</strong>
        </div>
        <div class="button-row">
          <button class="btn btn-primary small" type="button" data-accept-quote="${quote.id}">Accept</button>
          <button class="btn btn-secondary small" type="button" data-reject-quote="${quote.id}">Reject</button>
        </div>
      </article>
    `).join("") : '<div class="empty-state large">No quotations received yet.</div>';

    if (document.body.dataset.quotationHandlersBound !== "true") {
      document.body.dataset.quotationHandlersBound = "true";
      document.addEventListener("click", function (event) {
        const acceptBtn = event.target.closest("[data-accept-quote]");
        if (acceptBtn) {
          const quoteId = acceptBtn.getAttribute("data-accept-quote");
          const stateNow = getState();
          const quote = stateNow.quotations.find((item) => item.id === quoteId);
          if (!quote) return;
          quote.status = "Accepted";
          saveState(stateNow);
          store.addActivity("Quotation", `Quotation accepted for ${quote.productName}`);
          const orderId = `order-${Date.now()}`;
          stateNow.orders.unshift({
            id: orderId,
            buyerId: buyer.id,
            quotationId: quote.id,
            supplierId: quote.supplierId,
            supplierName: quote.supplierName,
            productId: quote.productId,
            productName: quote.productName,
            quantity: quote.quantity,
            unitPrice: quote.unitPrice,
            totalAmount: (quote.unitPrice * quote.quantity) + (quote.deliveryCharges || 0),
            orderDate: new Date().toISOString().slice(0, 10),
            expectedDate: quote.validityDate || new Date().toISOString().slice(0, 10),
            status: "Placed",
            shipmentStatus: "Pending Dispatch"
          });
          const paymentId = `payment-${Date.now()}`;
          stateNow.payments.unshift({
            id: paymentId,
            orderId,
            supplierId: quote.supplierId,
            supplierName: quote.supplierName,
            amount: (quote.unitPrice * quote.quantity) + (quote.deliveryCharges || 0),
            paymentDate: new Date().toISOString().slice(0, 10),
            paymentMethod: "Bank Transfer",
            status: "Pending"
          });
          stateNow.invoices.unshift({
            id: `invoice-${Date.now()}`,
            orderId,
            supplierId: quote.supplierId,
            supplierName: quote.supplierName,
            buyerName: buyer.businessName || buyer.fullName,
            invoiceNumber: `INV-TRN-${Date.now()}`,
            lineItems: [{ product: quote.productName, quantity: quote.quantity, unitPrice: quote.unitPrice, total: (quote.unitPrice * quote.quantity) }],
            totalAmount: (quote.unitPrice * quote.quantity) + (quote.deliveryCharges || 0)
          });
          stateNow.shipments.unshift({
            id: `shipment-${Date.now()}`,
            orderId,
            shipmentReference: `SHIP-TRN-${Date.now()}`,
            courierName: "BlueRoute Logistics",
            trackingNumber: `BRL-${Date.now()}`,
            dispatchDate: new Date().toISOString().slice(0, 10),
            expectedDate: quote.validityDate || new Date().toISOString().slice(0, 10),
            deliveryAddress: `${buyer.businessName || buyer.fullName}, Bengaluru`,
            status: "Confirmed",
            timeline: [
              { status: "Order Confirmed", date: new Date().toISOString().slice(0, 10) },
              { status: "Processing", date: new Date().toISOString().slice(0, 10) },
              { status: "Dispatched", date: new Date().toISOString().slice(0, 10) }
            ]
          });
          saveState(stateNow);
          renderQuotations();
          renderOrders();
          renderPayments();
          renderDelivery();
          showToast("Quotation accepted and order created.", "success");
        }

        const rejectBtn = event.target.closest("[data-reject-quote]");
        if (rejectBtn) {
          const quoteId = rejectBtn.getAttribute("data-reject-quote");
          const stateNow = getState();
          const quote = stateNow.quotations.find((item) => item.id === quoteId);
          if (quote) {
            quote.status = "Rejected";
            saveState(stateNow);
            renderQuotations();
            showToast("Quotation rejected.", "success");
          }
        }
      });
    }
  }

  function renderComparison() {
    const container = document.getElementById("comparison-list");
    const table = document.getElementById("comparison-table");
    if (!container || !table) return;

    const state = getState();
    const buyer = getBuyer();
    const sameRFQ = state.rfqs.filter((item) => item.buyerId === buyer.id).map((item) => item.id);
    const quotes = state.quotations.filter((item) => buyer.id === item.buyerId && sameRFQ.includes(item.rfqId));
    const selected = quotes.slice(0, 2);

    container.innerHTML = quotes.map((quote) => `
      <label class="compare-option">
        <input type="checkbox" checked value="${quote.id}" />
        <span>${quote.supplierName} • ${quote.productName}</span>
      </label>
    `).join("");

    function recalc() {
      const checked = [...container.querySelectorAll("input:checked")].map((input) => input.value);
      const activeQuotes = quotes.filter((quote) => checked.includes(quote.id));
      if (!activeQuotes.length) {
        table.innerHTML = '<div class="empty-state">Select at least two quotations to compare.</div>';
        return;
      }
      table.innerHTML = `
        <table class="data-table compact">
          <thead><tr><th>Field</th>${activeQuotes.map((quote) => `<th>${quote.supplierName}</th>`).join("")}</tr></thead>
          <tbody>
            <tr><td>Unit price</td>${activeQuotes.map((quote) => `<td>${formatCurrency(quote.unitPrice)}</td>`).join("")}</tr>
            <tr><td>Total quoted</td>${activeQuotes.map((quote) => `<td>${formatCurrency((quote.unitPrice * quote.quantity) + (quote.deliveryCharges || 0))}</td>`).join("")}</tr>
            <tr><td>Available qty</td>${activeQuotes.map((quote) => `<td>${quote.quantity}</td>`).join("")}</tr>
            <tr><td>Delivery</td>${activeQuotes.map((quote) => `<td>${quote.deliveryTimeline}</td>`).join("")}</tr>
            <tr><td>Payment</td>${activeQuotes.map((quote) => `<td>${quote.paymentTerms}</td>`).join("")}</tr>
            <tr><td>Validity</td>${activeQuotes.map((quote) => `<td>${formatDate(quote.validityDate)}</td>`).join("")}</tr>
          </tbody>
        </table>
      `;
    }
    container.querySelectorAll("input").forEach((input) => input.addEventListener("change", recalc));
    recalc();
  }

  function renderSamples() {
    const list = document.getElementById("sample-list");
    if (!list) return;
    const state = getState();
    const buyer = getBuyer();
    const samples = state.sampleRequests.filter((item) => item.buyerId === buyer.id);

    const form = document.getElementById("sample-form");
    if (form) {
      const productSelect = document.getElementById("sample-product");
      const supplierSelect = document.getElementById("sample-supplier");
      if (productSelect) productSelect.innerHTML = '<option value="">Select product</option>' + state.products.map((product) => `<option value="${product.id}">${product.name}</option>`).join("");
      if (supplierSelect) supplierSelect.innerHTML = '<option value="">Select supplier</option>' + state.supplierProfiles.map((supplier) => `<option value="${supplier.id}">${supplier.businessName}</option>`).join("");
      if (form.dataset.sampleBound !== "true") {
        form.dataset.sampleBound = "true";
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          const formData = new FormData(form);
          const productId = formData.get("productId");
          const supplierId = formData.get("supplierId");
          const quantity = Number(formData.get("quantity"));
          if (!productId || !supplierId || !quantity) {
            showToast("Complete sample request details before saving.", "error");
            return;
          }
          const product = state.products.find((item) => item.id === productId);
          const supplier = state.supplierProfiles.find((item) => item.id === supplierId);
          const newSample = {
            id: `sample-${Date.now()}`,
            buyerId: buyer.id,
            productId,
            productName: product ? product.name : "Product",
            supplierId,
            supplierName: supplier ? supplier.businessName : "Supplier",
            requestedQuantity: quantity,
            deliveryAddress: formData.get("deliveryAddress") || "Bengaluru",
            contactName: buyer.fullName,
            contactInfo: buyer.phone,
            notes: formData.get("notes") || "",
            requestDate: new Date().toISOString().slice(0, 10),
            status: "Requested",
            dispatchDetails: "Awaiting dispatch confirmation",
            feedback: ""
          };
          state.sampleRequests.unshift(newSample);
          saveState(state);
          store.addActivity("Sample", `Sample request created for ${newSample.productName}`);
          form.reset();
          renderSamples();
          showToast("Sample request created.", "success");
        });
      }
    }

    list.innerHTML = samples.length ? samples.map((sample) => `
      <article class="record-card">
        <div class="record-header">
          <div>
            <strong>${sample.id}</strong>
            <h3>${sample.productName}</h3>
          </div>
          <span class="status-badge ${sample.status.toLowerCase().replace(/\s+/g, "-")}">${sample.status}</span>
        </div>
        <div class="meta-grid">
          <span>Supplier</span><strong>${sample.supplierName}</strong>
          <span>Qty</span><strong>${sample.requestedQuantity}</strong>
          <span>Status</span><strong>${sample.status}</strong>
          <span>Dispatch</span><strong>${sample.dispatchDetails}</strong>
        </div>
        <div class="button-row">
          <button class="btn btn-secondary small" type="button" data-sample-feedback="${sample.id}">Submit feedback</button>
          <button class="btn btn-primary small" type="button" data-sample-status="${sample.id}" data-next-status="Processing">Set processing</button>
        </div>
      </article>
    `).join("") : '<div class="empty-state large">No sample requests available.</div>';

    if (document.body.dataset.sampleHandlersBound !== "true") {
      document.body.dataset.sampleHandlersBound = "true";
      document.addEventListener("click", function (event) {
        const statusBtn = event.target.closest("[data-sample-status]");
        if (statusBtn) {
          const sampleId = statusBtn.getAttribute("data-sample-status");
          const nextStatus = statusBtn.getAttribute("data-next-status");
          const sampleState = getState();
          const sample = sampleState.sampleRequests.find((item) => item.id === sampleId);
          if (sample) {
            sample.status = nextStatus;
            saveState(sampleState);
            renderSamples();
            showToast(`Sample status updated to ${nextStatus}.`, "success");
          }
        }
        const feedbackBtn = event.target.closest("[data-sample-feedback]");
        if (feedbackBtn) {
          const sampleId = feedbackBtn.getAttribute("data-sample-feedback");
          const sampleState = getState();
          const sample = sampleState.sampleRequests.find((item) => item.id === sampleId);
          if (sample) {
            sample.feedback = sample.feedback || "Expected quality and timely dispatch were confirmed by the buyer.";
            sample.status = "Feedback Submitted";
            saveState(sampleState);
            renderSamples();
            showToast("Sample feedback submitted.", "success");
          }
        }
      });
    }
  }

  function renderCollaborations() {
    const list = document.getElementById("collaboration-list");
    if (!list) return;
    const state = getState();
    const buyer = getBuyer();
    const collaborations = state.collaborations.filter((item) => item.buyerId === buyer.id);

    list.innerHTML = collaborations.length ? collaborations.map((item) => `
      <article class="record-card">
        <div class="record-header">
          <div>
            <strong>${item.id}</strong>
            <h3>RFQ ${item.rfqId}</h3>
          </div>
          <span class="status-badge ${item.status.toLowerCase().replace(/\s+/g, "-")}">${item.status}</span>
        </div>
        <div class="meta-grid">
          <span>Required qty</span><strong>${item.requiredQuantity}</strong>
          <span>Primary supplier</span><strong>${item.primarySupplierName}</strong>
          <span>Participants</span><strong>${item.participatingSuppliers.length}</strong>
          <span>Fulfilment</span><strong>${item.fulfilmentDetails}</strong>
        </div>
      </article>
    `).join("") : '<div class="empty-state large">No collaboration records found.</div>';
  }

  function renderMessages() {
    const convoList = document.getElementById("conversation-list");
    const thread = document.getElementById("message-thread");
    if (!convoList || !thread) return;
    const state = getState();
    const buyer = getBuyer();
    const conversations = state.conversations.filter((item) => item.buyerId === buyer.id);

    function openConversation(conversationId) {
      const conversation = state.conversations.find((item) => item.id === conversationId);
      const messages = state.messages.filter((item) => item.conversationId === conversationId);
      thread.innerHTML = messages.map((message) => `
        <div class="message ${message.sender === "buyer" ? "self" : "other"}">
          <strong>${message.sender === "buyer" ? "You" : conversation.supplierName}</strong>
          <p>${message.text}</p>
          <small>${formatDate(message.sentAt)}</small>
        </div>
      `).join("");
      const form = document.getElementById("message-form");
      if (form) {
        form.dataset.conversationId = conversationId;
      }
    }

    convoList.innerHTML = conversations.map((conversation) => `
      <button type="button" class="conversation-item" data-conversation-id="${conversation.id}">
        <strong>${conversation.supplierName}</strong>
        <span>${conversation.preview}</span>
      </button>
    `).join("");

    if (document.body.dataset.messagesHandlersBound !== "true") {
      document.body.dataset.messagesHandlersBound = "true";
      document.addEventListener("click", function (event) {
        const convo = event.target.closest("[data-conversation-id]");
        if (convo) {
          openConversation(convo.getAttribute("data-conversation-id"));
        }
      });
    }

    const form = document.getElementById("message-form");
    if (form && form.dataset.messageBound !== "true") {
      form.dataset.messageBound = "true";
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const conversationId = form.dataset.conversationId;
        const message = document.getElementById("message-input");
        if (!conversationId || !message || !message.value.trim()) return;
        const stateNow = getState();
        stateNow.messages.push({
          id: `message-${Date.now()}`,
          conversationId,
          buyerId: buyer.id,
          supplierId: stateNow.conversations.find((item) => item.id === conversationId)?.supplierId || "",
          sender: "buyer",
          text: message.value.trim(),
          sentAt: new Date().toISOString()
        });
        const convo = stateNow.conversations.find((item) => item.id === conversationId);
        if (convo) {
          convo.preview = message.value.trim();
          convo.updatedAt = new Date().toISOString();
        }
        saveState(stateNow);
        message.value = "";
        openConversation(conversationId);
        renderMessages();
        showToast("Message added to the conversation.", "success");
      });
    }

    if (conversations.length) openConversation(conversations[0].id);
  }

  function renderOrders() {
    const list = document.getElementById("order-list");
    if (!list) return;
    const state = getState();
    const buyer = getBuyer();
    const orders = state.orders.filter((item) => item.buyerId === buyer.id);

    list.innerHTML = orders.length ? orders.map((order) => `
      <article class="record-card">
        <div class="record-header">
          <div>
            <strong>${order.id}</strong>
            <h3>${order.productName}</h3>
          </div>
          <span class="status-badge ${order.status.toLowerCase().replace(/\s+/g, "-")}">${order.status}</span>
        </div>
        <div class="meta-grid">
          <span>Supplier</span><strong>${order.supplierName}</strong>
          <span>Qty</span><strong>${order.quantity}</strong>
          <span>Total</span><strong>${formatCurrency(order.totalAmount)}</strong>
          <span>Expected</span><strong>${formatDate(order.expectedDate)}</strong>
        </div>
      </article>
    `).join("") : '<div class="empty-state large">No orders exist yet.</div>';
  }

  function renderPayments() {
    const list = document.getElementById("payment-list");
    if (!list) return;
    const state = getState();
    const buyer = getBuyer();
    const orders = state.orders.filter((item) => item.buyerId === buyer.id);
    const paymentData = state.payments.filter((item) => orders.some((order) => order.id === item.orderId));

    list.innerHTML = paymentData.length ? paymentData.map((payment) => {
      const invoice = state.invoices.find((item) => item.orderId === payment.orderId);
      const order = state.orders.find((item) => item.id === payment.orderId);
      const isPending = payment.status === "Pending";
      return `
        <article class="record-card">
          <div class="record-header">
            <div>
              <strong>${payment.id}</strong>
              <h3>${payment.supplierName}</h3>
            </div>
            <span class="status-badge ${payment.status.toLowerCase().replace(/\s+/g, "-")}">${payment.status}</span>
          </div>
          <div class="meta-grid">
            <span>Order</span><strong>${payment.orderId}</strong>
            <span>Amount</span><strong>${formatCurrency(payment.amount)}</strong>
            <span>Date</span><strong>${formatDate(payment.paymentDate)}</strong>
            <span>Method</span><strong>${payment.paymentMethod}</strong>
            <span>Invoice</span><strong>${invoice ? invoice.invoiceNumber : "—"}</strong>
            <span>Product</span><strong>${order ? order.productName : "—"}</strong>
          </div>
          <div class="button-row">
            <button class="btn btn-primary small" type="button" data-payment-status="${payment.id}" data-next-status="${isPending ? "Paid" : "Pending"}">${isPending ? "Mark paid" : "Mark pending"}</button>
          </div>
        </article>
      `;
    }).join("") : '<div class="empty-state large">No payment records found.</div>';

    if (document.body.dataset.paymentHandlersBound !== "true") {
      document.body.dataset.paymentHandlersBound = "true";
      document.addEventListener("click", function (event) {
        const button = event.target.closest("[data-payment-status]");
        if (!button) return;
        const paymentId = button.getAttribute("data-payment-status");
        const nextStatus = button.getAttribute("data-next-status");
        const stateNow = getState();
        const payment = stateNow.payments.find((item) => item.id === paymentId);
        if (!payment) return;
        payment.status = nextStatus;
        const order = stateNow.orders.find((item) => item.id === payment.orderId);
        if (order) {
          order.status = nextStatus === "Paid" ? "Confirmed" : "Processing";
        }
        saveState(stateNow);
        renderPayments();
        renderOrders();
        showToast(`Payment marked as ${nextStatus}.`, "success");
      });
    }
  }

  function renderDelivery() {
    const list = document.getElementById("shipment-list");
    if (!list) return;
    const state = getState();
    const buyer = getBuyer();
    const shipments = state.shipments.filter((item) => state.orders.some((order) => order.id === item.orderId && order.buyerId === buyer.id));

    list.innerHTML = shipments.length ? shipments.map((shipment) => {
      const order = state.orders.find((item) => item.id === shipment.orderId);
      const statusFlow = ["Processing", "Dispatched", "In Transit", "Out for Delivery", "Delivered"];
      const currentIndex = statusFlow.indexOf(shipment.status);
      const nextStatus = statusFlow[currentIndex + 1] || "Delivered";
      return `
        <article class="record-card">
          <div class="record-header">
            <div>
              <strong>${shipment.shipmentReference}</strong>
              <h3>${shipment.courierName}</h3>
            </div>
            <span class="status-badge ${shipment.status.toLowerCase().replace(/\s+/g, "-")}">${shipment.status}</span>
          </div>
          <div class="meta-grid">
            <span>Tracking</span><strong>${shipment.trackingNumber}</strong>
            <span>Order</span><strong>${shipment.orderId}</strong>
            <span>Expected</span><strong>${formatDate(shipment.expectedDate)}</strong>
            <span>Product</span><strong>${order ? order.productName : "—"}</strong>
            <span>Address</span><strong>${shipment.deliveryAddress}</strong>
            <span>Next step</span><strong>${nextStatus}</strong>
          </div>
          <ul class="timeline">
            ${shipment.timeline.map((step) => `<li><span>${step.status}</span><small>${formatDate(step.date)}</small></li>`).join("")}
          </ul>
          <div class="button-row">
            <button class="btn btn-secondary small" type="button" data-shipment-status="${shipment.id}" data-next-status="${nextStatus}">Update status</button>
          </div>
        </article>
      `;
    }).join("") : '<div class="empty-state large">No shipment tracking available.</div>';

    if (document.body.dataset.shipmentHandlersBound !== "true") {
      document.body.dataset.shipmentHandlersBound = "true";
      document.addEventListener("click", function (event) {
        const button = event.target.closest("[data-shipment-status]");
        if (!button) return;
        const shipmentId = button.getAttribute("data-shipment-status");
        const nextStatus = button.getAttribute("data-next-status");
        const stateNow = getState();
        const shipment = stateNow.shipments.find((item) => item.id === shipmentId);
        if (!shipment) return;
        shipment.status = nextStatus;
        shipment.timeline.push({ status: nextStatus, date: new Date().toISOString().slice(0, 10) });
        const order = stateNow.orders.find((item) => item.id === shipment.orderId);
        if (order) {
          order.shipmentStatus = nextStatus;
          if (nextStatus === "Delivered") {
            order.status = "Delivered";
          }
        }
        saveState(stateNow);
        renderDelivery();
        renderOrders();
        showToast(`Shipment updated to ${nextStatus}.`, "success");
      });
    }
  }

  function initGlobalActions() {
    const resetBtn = document.getElementById("reset-demo-data-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        store.resetDemoData();
        window.location.reload();
      });
    }
  }

  if (page === "dashboard") renderDashboard();
  if (page === "products") renderProducts();
  if (page === "suppliers") renderSuppliers();
  if (page === "saved-products") renderSavedProducts();
  if (page === "saved-suppliers") renderSavedSuppliers();
  if (page === "profile") renderBuyerProfilePage();
  if (page === "settings") renderBuyerSettingsPage();
  if (page === "rfqs") renderRFQs();
  if (page === "quotations") renderQuotations();
  if (page === "comparison") renderComparison();
  if (page === "samples") renderSamples();
  if (page === "collaboration") renderCollaborations();
  if (page === "messages") renderMessages();
  if (page === "orders") renderOrders();
  if (page === "payments") renderPayments();
  if (page === "delivery") renderDelivery();
  initGlobalActions();
});
