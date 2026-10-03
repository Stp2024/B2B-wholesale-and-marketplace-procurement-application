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

  function renderDashboard() {
    const state = getState();
    const buyer = getBuyer();
    const rfqs = state.rfqs.filter((item) => item.buyerId === buyer.id);
    const quotations = state.quotations.filter((item) => item.buyerId === buyer.id);
    const sampleRequests = state.sampleRequests.filter((item) => item.buyerId === buyer.id);
    const orders = state.orders.filter((item) => item.buyerId === buyer.id);
    const activeOrders = orders.filter((item) => !["Completed", "Delivered"].includes(item.status));
    const completedOrders = orders.filter((item) => ["Completed", "Delivered"].includes(item.status));

    const totalRfqs = rfqs.length;
    const pendingQuotations = quotations.filter((item) => item.status === "Pending" || item.status === "In Review").length;
    const activeSamples = sampleRequests.filter((item) => !["Delivered", "Feedback Submitted"].includes(item.status)).length;
    const activeOrderCount = activeOrders.length;
    const completedOrderCount = completedOrders.length;

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
        ...state.rfqs.filter((item) => item.buyerId === buyer.id).map((item) => ({
          title: `RFQ ${item.status}: ${item.title}`,
          meta: `Reference ${item.id}`,
          type: "rfq"
        })),
        ...state.quotations.filter((item) => item.buyerId === buyer.id).map((item) => ({
          title: `Quotation ${item.status}: ${item.productName}`,
          meta: `${item.supplierName}`,
          type: "quote"
        })),
        ...state.orders.filter((item) => item.buyerId === buyer.id).map((item) => ({
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

    const profileName = document.getElementById("welcome-user-name");
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

    function applyFilters() {
      const searchTerm = (searchInput ? searchInput.value : "").toLowerCase();
      const category = categorySelect ? categorySelect.value : "";
      const supplier = supplierSelect ? supplierSelect.value : "";
      const availability = availabilitySelect ? availabilitySelect.value : "";
      const sort = sortSelect ? sortSelect.value : "name";

      let results = state.products.filter((product) => {
        const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm) || product.supplierName.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        const matchesSupplier = !supplier || product.supplierId === supplier;
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
              <strong>${product.availability}</strong>
            </div>
            <div class="button-row">
              <button class="btn btn-primary small" type="button" data-open-product="${product.id}">Open details</button>
            </div>
          </div>
        </article>
      `).join("");
    }

    if (supplierSelect) {
      supplierSelect.innerHTML = '<option value="">All suppliers</option>' + state.supplierProfiles.map((supplier) => `<option value="${supplier.id}">${supplier.businessName}</option>`).join("");
    }

    if (categorySelect) {
      const categories = [...new Set(state.products.map((product) => product.category))];
      categorySelect.innerHTML = '<option value="">All categories</option>' + categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("");
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

    document.addEventListener("click", function (event) {
      const button = event.target.closest("[data-open-product]");
      if (!button) return;
      const productId = button.getAttribute("data-open-product");
      const product = state.products.find((item) => item.id === productId);
      if (product) {
        localStorage.setItem("tradenestSelectedProductId", JSON.stringify(productId));
        window.location.href = "../product-details.html";
      }
    });

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

    document.addEventListener("click", function (event) {
      const profileBtn = event.target.closest("[data-supplier-id]");
      if (profileBtn) {
        const supplierId = profileBtn.getAttribute("data-supplier-id");
        localStorage.setItem("tradenestSelectedSupplierId", JSON.stringify(supplierId));
        window.location.href = "../supplier-details.html";
      }
      const enquiryBtn = event.target.closest("[data-enquiry-supplier]");
      if (enquiryBtn) {
        const supplierId = enquiryBtn.getAttribute("data-enquiry-supplier");
        const supplier = state.supplierProfiles.find((item) => item.id === supplierId);
        showToast(`Enquiry drafted for ${supplier ? supplier.businessName : "supplier"}.`, "success");
      }
    });

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

    document.addEventListener("click", function (event) {
      const convo = event.target.closest("[data-conversation-id]");
      if (convo) {
        openConversation(convo.getAttribute("data-conversation-id"));
      }
    });

    const form = document.getElementById("message-form");
    if (form) {
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

    list.innerHTML = paymentData.length ? paymentData.map((payment) => `
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
        </div>
      </article>
    `).join("") : '<div class="empty-state large">No payment records found.</div>';
  }

  function renderDelivery() {
    const list = document.getElementById("shipment-list");
    if (!list) return;
    const state = getState();
    const buyer = getBuyer();
    const shipments = state.shipments.filter((item) => state.orders.some((order) => order.id === item.orderId && order.buyerId === buyer.id));

    list.innerHTML = shipments.length ? shipments.map((shipment) => `
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
          <span>Address</span><strong>${shipment.deliveryAddress}</strong>
        </div>
        <ul class="timeline">
          ${shipment.timeline.map((step) => `<li><span>${step.status}</span><small>${formatDate(step.date)}</small></li>`).join("")}
        </ul>
      </article>
    `).join("") : '<div class="empty-state large">No shipment tracking available.</div>';
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
