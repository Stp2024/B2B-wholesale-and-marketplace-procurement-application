/**
 * TradeNest — Products Catalog & Search Handler (js/products-page.js)
 * Navigates to product description based on product name searched by user,
 * provides live autocomplete suggestions, and handles catalog filtering.
 */

(function () {
  "use strict";

  // Canonical mapping for reliable product resolution
  const CANONICAL_CATALOG = [
    {
      id: "product-abc-001",
      sku: "SKU-ABC-IND-01",
      name: "ABC Heavy-Duty Industrial Tool Kit",
      category: "Industrial Equipment",
      price: 2450,
      moq: 10,
      image: "../images/products/industrial-safety-gloves.webp",
      supplierName: "ABC Traders",
      supplierId: "supplier-abc",
      location: "Bengaluru, Karnataka",
      verification: "Verified",
      rating: 4.9,
      trustScore: 96,
      description: "Professional grade 120-piece chrome vanadium alloy steel toolkit for plant maintenance and heavy manufacturing by ABC Traders."
    },
    {
      id: "product-abc-002",
      sku: "SKU-ABC-SAF-02",
      name: "ABC High-Grip Safety Work Gloves",
      category: "Industrial Equipment",
      price: 195,
      moq: 200,
      image: "../images/products/industrial-safety-gloves.webp",
      supplierName: "ABC Traders",
      supplierId: "supplier-abc",
      location: "Bengaluru, Karnataka",
      verification: "Verified",
      rating: 5.0,
      trustScore: 96,
      description: "Premium level-5 cut resistant industrial work gloves with reinforced micro-foam nitrile coating manufactured by ABC Traders."
    },
    {
      id: "product-abc-003",
      sku: "SKU-ABC-PKG-03",
      name: "ABC Premium Wholesale Storage Crates",
      category: "Packaging",
      price: 680,
      moq: 25,
      image: "../images/products/corrugated-packaging-boxes.webp",
      supplierName: "ABC Traders",
      supplierId: "supplier-abc",
      location: "Bengaluru, Karnataka",
      verification: "Verified",
      rating: 4.8,
      trustScore: 96,
      description: "High-density polyethylene heavy-duty stackable industrial storage crates for distribution centers and warehouse logistics by ABC Traders."
    },
    {
      id: "product-001",
      sku: "SKU-IND-GLV-01",
      name: "Industrial Safety Gloves",
      category: "Industrial Equipment",
      price: 180,
      moq: 500,
      image: "../images/products/industrial-safety-gloves.webp",
      supplierName: "Apex Safety Solutions Pvt Ltd",
      location: "Bengaluru, Karnataka",
      verification: "Verified",
      rating: 5.0,
      trustScore: 92
    },
    {
      id: "product-002",
      sku: "SKU-IND-HLM-02",
      name: "Industrial Safety Helmets",
      category: "Industrial Equipment",
      price: 520,
      moq: 200,
      image: "../images/products/industrial-safety-helmets.webp",
      supplierName: "Apex Safety Solutions Pvt Ltd",
      location: "Bengaluru, Karnataka",
      verification: "Verified",
      rating: 4.8,
      trustScore: 92
    },
    {
      id: "product-003",
      sku: "SKU-OFC-PPR-03",
      name: "A4 Premium Copy Paper",
      category: "Office Supplies",
      price: 420,
      moq: 50,
      image: "../images/products/a4-premium-copy-paper.webp",
      supplierName: "PaperPro Solutions",
      location: "Mumbai, Maharashtra",
      verification: "Verified",
      rating: 4.7,
      trustScore: 88
    },
    {
      id: "product-004",
      sku: "SKU-OFC-ORG-04",
      name: "Executive Desk Organiser",
      category: "Office Supplies",
      price: 1180,
      moq: 20,
      image: "../images/products/executive-desk-organizer.webp",
      supplierName: "PaperPro Solutions",
      location: "Mumbai, Maharashtra",
      verification: "Verified",
      rating: 4.6,
      trustScore: 88
    },
    {
      id: "product-005",
      sku: "SKU-ELE-LED-05",
      name: "Commercial LED Panel Lights",
      category: "Electronics",
      price: 1650,
      moq: 20,
      image: "../images/products/commercial-led-panel-lights.webp",
      supplierName: "Lumina Electric",
      location: "Delhi NCR",
      verification: "Verified",
      rating: 4.8,
      trustScore: 94
    },
    {
      id: "product-006",
      sku: "SKU-PKG-BOX-06",
      name: "Corrugated Packaging Boxes",
      category: "Packaging",
      price: 55,
      moq: 500,
      image: "../images/products/corrugated-packaging-boxes.webp",
      supplierName: "PackRight Corp.",
      location: "Ahmedabad, Gujarat",
      verification: "Verified",
      rating: 4.5,
      trustScore: 86
    },
    {
      id: "product-007",
      sku: "SKU-PKG-FPM-07",
      name: "Protective Foam Inserts",
      category: "Packaging",
      price: 230,
      moq: 150,
      image: "../images/products/protective-foam-inserts.webp",
      supplierName: "PackRight Corp.",
      location: "Ahmedabad, Gujarat",
      verification: "Verified",
      rating: 4.6,
      trustScore: 86
    },
    {
      id: "product-008",
      sku: "SKU-MCH-SHL-08",
      name: "Heavy Duty Warehouse Shelving",
      category: "Machinery",
      price: 5300,
      moq: 5,
      image: "../images/products/stainless-steel-components.webp",
      supplierName: "SteelCraft Ltd.",
      location: "Pune, Maharashtra",
      verification: "Verified",
      rating: 4.9,
      trustScore: 90
    },
    {
      id: "product-009",
      sku: "SKU-TEX-COT-09",
      name: "Cotton Fabric Rolls",
      category: "Textiles & Garments",
      price: 145,
      moq: 1000,
      image: "../images/products/cotton-fabric-rolls.webp",
      supplierName: "Vardhman Weaves & Tex",
      location: "Ahmedabad, Gujarat",
      verification: "Verified",
      rating: 4.9,
      trustScore: 89
    },
    {
      id: "product-010",
      sku: "SKU-ELE-BLB-10",
      name: "Commercial LED Bulbs",
      category: "Electronics",
      price: 120,
      moq: 100,
      image: "../images/products/commercial-led-panel-lights.webp",
      supplierName: "Lumina Electric",
      location: "Delhi NCR",
      verification: "Verified",
      rating: 4.7,
      trustScore: 94
    },
    {
      id: "product-012",
      sku: "SKU-PKG-MAT-12",
      name: "Food Packaging Materials",
      category: "Packaging",
      price: 450,
      moq: 100,
      image: "../images/products/corrugated-packaging-boxes.webp",
      supplierName: "BioPack Green Solutions",
      location: "Ahmedabad, Gujarat",
      verification: "Verified",
      rating: 4.8,
      trustScore: 88
    },
    {
      id: "product-013",
      sku: "SKU-MCH-CNC-13",
      name: "Carbide CNC Milling Cutters",
      category: "Machinery",
      price: 1150,
      moq: 25,
      image: "../images/products/industrial-safety-gloves.webp",
      supplierName: "Precision Tooling Works",
      location: "Pune, Maharashtra",
      verification: "Verified",
      rating: 4.9,
      trustScore: 96
    },
    {
      id: "product-014",
      sku: "SKU-RAW-BAG-14",
      name: "Biodegradable Trash Bags",
      category: "Raw Materials",
      price: 210,
      moq: 100,
      image: "../images/products/protective-foam-inserts.webp",
      supplierName: "GreenChem Polymers Corp.",
      location: "Ahmedabad, Gujarat",
      verification: "Verified",
      rating: 4.8,
      trustScore: 95
    },
    {
      id: "product-015",
      sku: "SKU-OFC-CHR-15",
      name: "Commercial Ergonomic Office Chairs",
      category: "Office Supplies",
      price: 4850,
      moq: 20,
      image: "../images/products/executive-desk-organizer.webp",
      supplierName: "UrbanWork Office Systems",
      location: "Bengaluru, Karnataka",
      verification: "Verified",
      rating: 4.8,
      trustScore: 90
    }
  ];

  // Helper to retrieve all products combining stored, service, and canonical sources
  function getAllProducts() {
    const list = [];
    const seenIds = new Set();

    // 1. Service products
    if (window.TradeNestProductService && typeof window.TradeNestProductService.getProductsSync === "function") {
      try {
        const sp = window.TradeNestProductService.getProductsSync({ includeAllStatuses: true });
        if (Array.isArray(sp)) {
          sp.forEach(p => {
            if (p && p.id && !seenIds.has(p.id)) {
              seenIds.add(p.id);
              list.push(normalizeProduct(p));
            }
          });
        }
      } catch (err) {
        console.warn("ProductService retrieval error:", err);
      }
    }

    // 2. TradeNestStore products
    if (window.TradeNestStore && typeof window.TradeNestStore.getStore === "function") {
      try {
        const store = window.TradeNestStore.getStore();
        if (store && Array.isArray(store.products)) {
          store.products.forEach(p => {
            if (p && p.id && !seenIds.has(p.id)) {
              seenIds.add(p.id);
              list.push(normalizeProduct(p));
            }
          });
        }
      } catch (err) {
        console.warn("TradeNestStore retrieval error:", err);
      }
    }

    // 3. Fallback / supplement with Canonical Catalog
    CANONICAL_CATALOG.forEach(p => {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        list.push(normalizeProduct(p));
      }
    });

    return list;
  }

  function normalizeProduct(p) {
    let img = p.image || p.imageUrl || "../images/products/industrial-safety-gloves.webp";
    if (img.startsWith("/")) {
      img = ".." + img;
    } else if (!img.startsWith("../") && !img.startsWith("http") && !img.startsWith("data:")) {
      img = "../" + img.replace(/^\/+/, "");
    }

    return {
      id: p.id,
      sku: p.sku || `SKU-${p.id}`,
      name: p.name || "Product",
      category: p.category || "General",
      description: p.description || "",
      price: Number(p.price || p.unitPrice || 0),
      moq: Number(p.moq || 1),
      image: img,
      supplierName: p.supplierName || "TradeNest Supplier",
      location: p.location || p.supplierLocation || "India",
      rating: Number(p.rating || 4.5),
      trustScore: Number(p.trustScore || 90),
      verification: p.verification || p.verificationStatus || "Verified",
      availability: p.availability || (p.stock > 0 ? "In Stock" : "Available")
    };
  }

  /**
   * Search / matching algorithm for product navigation
   * Matches by exact name, ID, SKU, startsWith, includes, or keywords.
   */
  function findMatchingProduct(query) {
    if (!query) return null;
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) return null;

    const products = getAllProducts();

    // 1. Exact ID or SKU match
    let match = products.find(p => p.id.toLowerCase() === cleanQ || (p.sku && p.sku.toLowerCase() === cleanQ));
    if (match) return match;

    // 2. Exact Name match (case-insensitive)
    match = products.find(p => p.name.trim().toLowerCase() === cleanQ);
    if (match) return match;

    // 3. Common name aliases
    const ALIASES = {
      "abc tools": "product-abc-001",
      "abc tool kit": "product-abc-001",
      "tool kit": "product-abc-001",
      "industrial tool kit": "product-abc-001",
      "abc gloves": "product-abc-002",
      "work gloves": "product-abc-002",
      "abc work gloves": "product-abc-002",
      "abc crates": "product-abc-003",
      "crates": "product-abc-003",
      "storage crates": "product-abc-003",
      "gloves": "product-001",
      "safety gloves": "product-001",
      "industrial gloves": "product-001",
      "helmets": "product-002",
      "safety helmets": "product-002",
      "paper": "product-003",
      "copy paper": "product-003",
      "a4 paper": "product-003",
      "desk organiser": "product-004",
      "desk organizer": "product-004",
      "led panel lights": "product-005",
      "led lights": "product-005",
      "led panels": "product-005",
      "packaging boxes": "product-006",
      "corrugated boxes": "product-006",
      "carton boxes": "product-006",
      "boxes": "product-006",
      "foam": "product-007",
      "foam inserts": "product-007",
      "shelving": "product-008",
      "warehouse shelving": "product-008",
      "steel shelving": "product-008",
      "cotton": "product-009",
      "cotton fabric": "product-009",
      "fabric rolls": "product-009",
      "led bulbs": "product-010",
      "bulbs": "product-010",
      "food packaging": "product-012",
      "cnc cutters": "product-013",
      "milling cutters": "product-013",
      "trash bags": "product-014",
      "garbage bags": "product-014",
      "office chairs": "product-015",
      "ergonomic chairs": "product-015",
      "chairs": "product-015"
    };

    if (ALIASES[cleanQ]) {
      const aliasMatch = products.find(p => p.id === ALIASES[cleanQ]);
      if (aliasMatch) return aliasMatch;
    }

    // 4. Product name starts with query
    match = products.find(p => p.name.trim().toLowerCase().startsWith(cleanQ));
    if (match) return match;

    // 5. Product name includes query
    match = products.find(p => p.name.toLowerCase().includes(cleanQ));
    if (match) return match;

    // 6. Query includes whole product name
    match = products.find(p => cleanQ.includes(p.name.toLowerCase().trim()));
    if (match) return match;

    // 7. Word-by-word token match (e.g. "safety", "gloves", "paper")
    const words = cleanQ.split(/\s+/).filter(w => w.length > 2);
    if (words.length > 0) {
      match = products.find(p => {
        const pName = p.name.toLowerCase();
        return words.every(w => pName.includes(w));
      });
      if (match) return match;

      // Partial word match
      match = products.find(p => {
        const pName = p.name.toLowerCase();
        return words.some(w => pName.includes(w));
      });
      if (match) return match;
    }

    // 8. Description or category match
    match = products.find(p =>
      (p.category && p.category.toLowerCase().includes(cleanQ)) ||
      (p.description && p.description.toLowerCase().includes(cleanQ))
    );
    if (match) return match;

    return null;
  }

  /**
   * Navigate directly to the product description page
   */
  function navigateToProductDescription(productId) {
    if (!productId) return;
    const targetUrl = `product-details.html?id=${encodeURIComponent(productId)}`;
    window.location.href = targetUrl;
  }

  /**
   * Escape HTML helper
   */
  function escapeHtml(str) {
    const el = document.createElement("div");
    el.textContent = String(str || "");
    return el.innerHTML;
  }

  /**
   * Highlight matched query characters
   */
  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return escapedText.replace(regex, "<mark>$1</mark>");
  }

  /**
   * Show toast notification
   */
  function showSearchToast(message) {
    let toast = document.querySelector(".tn-search-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "tn-search-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 4000);
  }

  /**
   * Initialize interactive search and autocomplete
   */
  function initProductSearch() {
    const searchForm = document.querySelector(".search-filter-form");
    const searchInput = document.getElementById("product-search-input");
    const suggestionsDropdown = document.getElementById("product-search-suggestions");
    const searchBtn = document.querySelector(".btn-search");
    const applyFiltersBtn = searchForm ? searchForm.querySelector("button[type='submit']:not(.btn-search)") : null;
    const clearFiltersBtn = searchForm ? searchForm.querySelector("button[type='reset']") : null;
    const productsGrid = document.querySelector(".products-grid");

    if (!searchInput) return;

    let activeIndex = -1;

    // Build or update the live suggestions dropdown
    function updateSuggestions() {
      if (!suggestionsDropdown) return;
      const query = searchInput.value.trim();

      if (!query) {
        suggestionsDropdown.style.display = "none";
        suggestionsDropdown.innerHTML = "";
        activeIndex = -1;
        return;
      }

      const cleanQ = query.toLowerCase();
      const all = getAllProducts();

      // Find all matching products by name, category, sku, OR supplier name
      const matched = all.filter(p => {
        const matchSup = (p.supplierName && p.supplierName.toLowerCase().includes(cleanQ)) ||
          ((cleanQ.includes("abc") || cleanQ.includes("treader") || cleanQ.includes("trader")) && (p.supplierName && p.supplierName.toLowerCase().includes("abc")));
        return (
          p.name.toLowerCase().includes(cleanQ) ||
          p.category.toLowerCase().includes(cleanQ) ||
          (p.sku && p.sku.toLowerCase().includes(cleanQ)) ||
          matchSup
        );
      }).slice(0, 7);

      if (matched.length === 0) {
        suggestionsDropdown.innerHTML = `
          <div class="search-suggestion-empty">
            No products found matching "<strong>${escapeHtml(query)}</strong>"
          </div>
        `;
        suggestionsDropdown.style.display = "block";
        activeIndex = -1;
        return;
      }

      let supplierHeaderHtml = "";
      const isAbc = cleanQ.includes("abc") || cleanQ.includes("treader") || cleanQ.includes("trader");
      if (isAbc) {
        supplierHeaderHtml = `
          <a class="search-suggestion-item" href="supplier-details.html?id=supplier-abc" style="background:#f7f5ef;border-bottom:2px solid #e5e1d6;">
            <div style="width:38px;height:38px;border-radius:6px;background:#000000;color:#ffffff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;flex-shrink:0;">ABC</div>
            <div class="search-suggestion-info">
              <div class="search-suggestion-name" style="color:#000000;">🏢 Supplier: ABC Traders</div>
              <div class="search-suggestion-meta">Verified Wholesale Partner &bull; View Supplier & All Products &rarr;</div>
            </div>
            <span class="search-suggestion-badge" style="background:#000000;color:#ffffff;">View Supplier</span>
          </a>
        `;
      }

      suggestionsDropdown.innerHTML = supplierHeaderHtml + matched.map((p, idx) => {
        return `
          <a class="search-suggestion-item" data-index="${idx}" data-product-id="${escapeHtml(p.id)}" href="product-details.html?id=${encodeURIComponent(p.id)}">
            <img class="search-suggestion-thumb" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.src='../images/products/industrial-safety-gloves.webp'" />
            <div class="search-suggestion-info">
              <div class="search-suggestion-name">${highlightMatch(p.name, query)}</div>
              <div class="search-suggestion-meta">
                <span>${escapeHtml(p.category)}</span>
                <span>&bull;</span>
                <span>By ${escapeHtml(p.supplierName || "TradeNest Supplier")}</span>
                <span>&bull;</span>
                <strong>₹${p.price.toLocaleString("en-IN")}</strong>
              </div>
            </div>
            <span class="search-suggestion-badge">View Description &rarr;</span>
          </a>
        `;
      }).join("");

      suggestionsDropdown.style.display = "block";
      activeIndex = -1;
    }

    // Input event for live autocomplete
    searchInput.addEventListener("input", updateSuggestions);

    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim()) {
        updateSuggestions();
      }
    });

    // Keyboard navigation in suggestions (Arrows + Enter)
    searchInput.addEventListener("keydown", (e) => {
      if (!suggestionsDropdown || suggestionsDropdown.style.display === "none") {
        if (e.key === "Enter") {
          e.preventDefault();
          executeSearch();
        }
        return;
      }

      const items = suggestionsDropdown.querySelectorAll(".search-suggestion-item");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        updateActiveItem(items);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        updateActiveItem(items);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          const pid = items[activeIndex].getAttribute("data-product-id");
          if (pid) navigateToProductDescription(pid);
        } else {
          executeSearch();
        }
      } else if (e.key === "Escape") {
        suggestionsDropdown.style.display = "none";
      }
    });

    function updateActiveItem(items) {
      items.forEach((item, idx) => {
        item.classList.toggle("is-active", idx === activeIndex);
        if (idx === activeIndex) {
          item.scrollIntoView({ block: "nearest" });
        }
      });
    }

    // Click on suggestion item
    if (suggestionsDropdown) {
      suggestionsDropdown.addEventListener("click", (e) => {
        const item = e.target.closest(".search-suggestion-item");
        if (item) {
          e.preventDefault();
          const pid = item.getAttribute("data-product-id");
          if (pid) {
            navigateToProductDescription(pid);
          }
        }
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !suggestionsDropdown?.contains(e.target)) {
        if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
      }
    });

    /**
     * Main search execution:
     * When user types a product name and clicks Search or hits Enter,
     * navigate directly to the product description page!
     */
    function executeSearch() {
      const query = searchInput.value.trim();
      if (!query) {
        searchInput.focus();
        showSearchToast("Please enter a product or supplier name to search.");
        return;
      }

      if (suggestionsDropdown) {
        suggestionsDropdown.style.display = "none";
      }

      const cleanQ = query.toLowerCase();
      const isSupplierQuery = cleanQ.includes("abc trader") || cleanQ.includes("abc treader") || cleanQ.includes("abc trade") ||
        cleanQ.includes("apex safety") || cleanQ.includes("paperpro") || cleanQ.includes("lumina") ||
        cleanQ.includes("packright") || cleanQ.includes("steelcraft") || cleanQ.includes("vardhman") ||
        cleanQ === "abc";

      if (isSupplierQuery) {
        filterProductCards();
        showSearchToast(`Showing all products from supplier "${query}".`);
        return;
      }

      const matchedProduct = findMatchingProduct(query);

      if (matchedProduct) {
        // Direct navigation to product description page!
        navigateToProductDescription(matchedProduct.id);
      } else {
        filterProductCards();
        showSearchToast(`Showing products matching "${query}".`);
      }
    }

    // Search button click
    if (searchBtn) {
      searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        executeSearch();
      });
    }

    // Intercept form submission
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        executeSearch();
      });
    }

    // Clear filters button
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", (e) => {
        setTimeout(() => {
          searchInput.value = "";
          if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
          filterProductCards();
        }, 10);
      });
    }

    // Filter secondary controls
    const filterCategory = document.getElementById("filter-category");
    const filterLocation = document.getElementById("filter-location");
    const filterPriceMin = document.getElementById("filter-price-min");
    const filterPriceMax = document.getElementById("filter-price-max");
    const filterVerification = document.getElementById("filter-verification");
    const filterTrust = document.getElementById("filter-trust-score");
    const filterAvailability = document.getElementById("filter-availability");
    const filterMoq = document.getElementById("filter-moq");
    const filterRating = document.getElementById("filter-rating");
    const sortSelect = document.getElementById("sort-products");

    function filterProductCards() {
      if (!productsGrid) return;
      const cards = Array.from(productsGrid.querySelectorAll(".product-card"));
      const query = (searchInput.value || "").trim().toLowerCase();
      const cat = (filterCategory?.value || "").toLowerCase();
      const loc = (filterLocation?.value || "").toLowerCase();
      const minPrice = parseFloat(filterPriceMin?.value) || 0;
      const maxPrice = parseFloat(filterPriceMax?.value) || Infinity;
      const verification = (filterVerification?.value || "").toLowerCase();
      const minTrust = parseFloat(filterTrust?.value) || 0;
      const availability = (filterAvailability?.value || "").toLowerCase();
      const maxMoq = parseFloat(filterMoq?.value) || Infinity;
      const minRating = parseFloat(filterRating?.value) || 0;

      let visibleCount = 0;

      cards.forEach(card => {
        const titleEl = card.querySelector(".product-title");
        const title = (titleEl?.textContent || "").toLowerCase();
        const categoryEl = card.querySelector(".product-category");
        const category = (categoryEl?.textContent || "").toLowerCase();
        const priceEl = card.querySelector(".product-price");
        const priceNum = parseFloat((priceEl?.textContent || "").replace(/[^0-9.]/g, "")) || 0;
        const moqEl = card.querySelector(".product-moq");
        const moqNum = parseFloat((moqEl?.textContent || "").replace(/[^0-9.]/g, "")) || 0;
        const scoreEl = card.querySelector(".trust-score strong");
        const trustNum = parseFloat(scoreEl?.textContent || "0") || 0;
        const ratingEl = card.querySelector(".rating-stars small");
        const ratingNum = parseFloat(ratingEl?.textContent || "0") || 0;

        let match = true;

        const supEl = card.querySelector(".supplier-name");
        const supplierName = (supEl?.textContent || "").toLowerCase();
        const isAbcMatch = (query.includes("abc") || query.includes("treader") || query.includes("trader")) && (supplierName.includes("abc") || title.includes("abc"));

        if (query && !title.includes(query) && !category.includes(query) && !supplierName.includes(query) && !isAbcMatch) {
          match = false;
        }
        if (cat && !category.includes(cat.replace("-", " "))) {
          match = false;
        }
        if (minPrice > 0 && priceNum < minPrice) {
          match = false;
        }
        if (maxPrice < Infinity && priceNum > maxPrice) {
          match = false;
        }
        if (maxMoq < Infinity && moqNum > maxMoq) {
          match = false;
        }
        if (minTrust > 0 && trustNum < minTrust) {
          match = false;
        }
        if (minRating > 0 && ratingNum < minRating) {
          match = false;
        }

        card.style.display = match ? "" : "none";
        if (match) visibleCount++;
      });

      // Handle empty state message
      let emptyMsg = productsGrid.querySelector(".grid-empty-state");
      if (visibleCount === 0) {
        if (!emptyMsg) {
          emptyMsg = document.createElement("div");
          emptyMsg.className = "grid-empty-state";
          emptyMsg.style.cssText = "grid-column: 1 / -1; padding: 40px; text-align: center; background: #ffffff; border: 1px dashed #d5cec5; border-radius: 12px; margin: 20px 0;";
          emptyMsg.innerHTML = `
            <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 8px;">No matching products found</h3>
            <p style="color: #666666; margin-bottom: 16px;">Try adjusting your search keywords or clearing filter criteria.</p>
            <button class="btn btn-secondary btn-sm" id="btn-reset-empty-filters">Reset Filters</button>
          `;
          productsGrid.appendChild(emptyMsg);
          emptyMsg.querySelector("#btn-reset-empty-filters")?.addEventListener("click", () => {
            if (clearFiltersBtn) clearFiltersBtn.click();
          });
        }
        emptyMsg.style.display = "block";
      } else if (emptyMsg) {
        emptyMsg.style.display = "none";
      }
    }

    // Sort select change
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        if (!productsGrid) return;
        const sortVal = sortSelect.value;
        const cards = Array.from(productsGrid.querySelectorAll(".product-card"));
        cards.sort((a, b) => {
          const priceA = parseFloat((a.querySelector(".product-price")?.textContent || "").replace(/[^0-9.]/g, "")) || 0;
          const priceB = parseFloat((b.querySelector(".product-price")?.textContent || "").replace(/[^0-9.]/g, "")) || 0;
          const titleA = a.querySelector(".product-title")?.textContent || "";
          const titleB = b.querySelector(".product-title")?.textContent || "";

          if (sortVal === "price-low") return priceA - priceB;
          if (sortVal === "price-high") return priceB - priceA;
          return titleA.localeCompare(titleB);
        });
        cards.forEach(card => productsGrid.appendChild(card));
      });
    }

    // Check URL parameters for direct queries
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get("query") || urlParams.get("q") || urlParams.get("search") || urlParams.get("name");
    if (initialQuery) {
      searchInput.value = initialQuery;
      // If direct product match and navigate flag was set
      if (urlParams.get("navigate") === "true") {
        const directMatch = findMatchingProduct(initialQuery);
        if (directMatch) {
          navigateToProductDescription(directMatch.id);
          return;
        }
      }
      filterProductCards();
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProductSearch);
  } else {
    initProductSearch();
  }
})();
