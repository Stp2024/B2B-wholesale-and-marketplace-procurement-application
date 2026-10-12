/**
 * TradeNest Centralized Product Management Service
 * File: js/product-service.js
 * 
 * Single source of truth for products across Home Page, Public Products,
 * Buyer Workspace, Supplier Workspace, and Admin Governance.
 */

(function (window) {
  "use strict";

  const STORAGE_KEY_SHARED = "tradenest_shared_products_v2";
  const STORAGE_KEY_SUPPLIER = "tradenest_supplier_products";
  const STORAGE_KEY_DEMO = "tradenest_demo_store_v1";
  const CURRENT_USER_KEY = "tradenestCurrentUser";

  // Default seed products representing registered verified suppliers
  const SEED_PRODUCTS = [
    {
      id: "product-001",
      sku: "SKU-IND-GLV-01",
      name: "Industrial Safety Gloves",
      category: "Industrial Equipment",
      description: "Heavy-duty nitrile coated Kevlar grip gloves with cut resistance level 5 and oil repellent coating.",
      image: "images/products/industrial-safety-gloves.webp",
      price: 180,
      bulkPrice: 165,
      moq: 100,
      stock: 1250,
      unit: "pairs",
      deliveryInfo: "2-4 business days across India",
      status: "Active",
      supplierId: "supplier-001",
      supplierName: "Apex Gear Co.",
      supplierLocation: "Bengaluru, Karnataka",
      trustScore: 92,
      verificationStatus: "Verified",
      rating: 4.9,
      specs: {
        "Material": "Kevlar & Nitrile Coating",
        "Grade": "EN388 Level 5 Cut Resistance",
        "Sizes": "M, L, XL",
        "Heat Resistance": "Up to 350°C"
      },
      createdAt: "2026-08-10",
      updatedAt: "2026-10-01"
    },
    {
      id: "product-002",
      sku: "SKU-IND-HLM-02",
      name: "Industrial Safety Helmets",
      category: "Industrial Equipment",
      description: "High-impact head protection with adjustable ratchet suspension and ANSI certification for heavy construction.",
      image: "images/products/industrial-safety-gloves.webp",
      price: 520,
      bulkPrice: 480,
      moq: 50,
      stock: 760,
      unit: "units",
      deliveryInfo: "3-5 business days across India",
      status: "Active",
      supplierId: "supplier-001",
      supplierName: "Apex Gear Co.",
      supplierLocation: "Bengaluru, Karnataka",
      trustScore: 92,
      verificationStatus: "Verified",
      rating: 4.8,
      specs: {
        "Material": "High-Density ABS Shell",
        "Certification": "ANSI/ISEA Z89.1 Type 1",
        "Suspension": "6-Point Ratchet Suspension",
        "Ventilation": "Optional Top Vents"
      },
      createdAt: "2026-08-12",
      updatedAt: "2026-10-02"
    },
    {
      id: "product-003",
      sku: "SKU-OFC-PPR-03",
      name: "A4 Premium Copy Paper",
      category: "Office Supplies",
      description: "High-whiteness premium 80 GSM copy paper engineered for jam-free high-speed laser and inkjet printing.",
      image: "images/products/office-paper.webp",
      price: 420,
      bulkPrice: 390,
      moq: 50,
      stock: 2500,
      unit: "reams",
      deliveryInfo: "2-3 business days in major metros",
      status: "Active",
      supplierId: "supplier-002",
      supplierName: "PaperPro Solutions",
      supplierLocation: "Mumbai, Maharashtra",
      trustScore: 88,
      verificationStatus: "Verified",
      rating: 4.7,
      specs: {
        "Grammage": "80 GSM",
        "Sheet Size": "210 x 297 mm (A4)",
        "Brightness": "102% CIE High Whiteness",
        "Packaging": "500 sheets/ream, 5 reams/box"
      },
      createdAt: "2026-08-14",
      updatedAt: "2026-10-03"
    },
    {
      id: "product-004",
      sku: "SKU-OFC-ORG-04",
      name: "Executive Desk Organiser",
      category: "Office Supplies",
      description: "Modular steel office desk organizer designed for high-density corporate workspaces and documents.",
      image: "images/products/office-paper.webp",
      price: 1180,
      bulkPrice: 1090,
      moq: 20,
      stock: 420,
      unit: "sets",
      deliveryInfo: "3-6 business days standard shipping",
      status: "Active",
      supplierId: "supplier-002",
      supplierName: "PaperPro Solutions",
      supplierLocation: "Mumbai, Maharashtra",
      trustScore: 88,
      verificationStatus: "Verified",
      rating: 4.6,
      specs: {
        "Material": "Cold-Rolled Carbon Steel",
        "Finish": "Matte Powder Coating",
        "Compartments": "5 Modular Slots + Pen Caddy",
        "Dimensions": "320 x 240 x 180 mm"
      },
      createdAt: "2026-08-18",
      updatedAt: "2026-10-03"
    },
    {
      id: "product-005",
      sku: "SKU-ELE-LED-05",
      name: "Commercial LED Panel Lights",
      category: "Electrical",
      description: "Energy-efficient 40W commercial edge-lit LED panels 600x600mm, flicker-free driver, 4000 lumens, 50,000h lifespan.",
      image: "images/products/led-bulbs.webp",
      price: 1650,
      bulkPrice: 1520,
      moq: 20,
      stock: 520,
      unit: "pieces",
      deliveryInfo: "4-7 business days with safe fragility pack",
      status: "Active",
      supplierId: "supplier-003",
      supplierName: "Lumina Electric",
      supplierLocation: "Delhi NCR",
      trustScore: 94,
      verificationStatus: "Verified",
      rating: 4.8,
      specs: {
        "Power": "40 Watts",
        "Color Temp": "4000K Neutral White / 6500K Daylight",
        "Lumens": "4000 lm Output",
        "Warranty": "3 Years Comprehensive"
      },
      createdAt: "2026-08-20",
      updatedAt: "2026-10-04"
    },
    {
      id: "product-006",
      sku: "SKU-PKG-BOX-06",
      name: "Corrugated Packaging Boxes",
      category: "Packaging",
      description: "Heavy-duty triple-wall corrugated shipping boxes engineered for industrial export and freight protection.",
      image: "images/products/packaging-boxes.webp",
      price: 55,
      bulkPrice: 48,
      moq: 500,
      stock: 9600,
      unit: "boxes",
      deliveryInfo: "2-5 business days bulk freight",
      status: "Active",
      supplierId: "supplier-004",
      supplierName: "PackRight Corp.",
      supplierLocation: "Ahmedabad, Gujarat",
      trustScore: 86,
      verificationStatus: "Verified",
      rating: 4.5,
      specs: {
        "Flute Type": "Double Wall BC Flute (5 Ply)",
        "Bursting Strength": "14 kg/sq cm",
        "Dimensions": "400 x 300 x 300 mm",
        "Eco-Friendly": "100% Recyclable Kraft"
      },
      createdAt: "2026-08-22",
      updatedAt: "2026-10-04"
    },
    {
      id: "product-007",
      sku: "SKU-PKG-FPM-07",
      name: "Protective Foam Inserts",
      category: "Packaging",
      description: "Custom die-cut polyethylene anti-static foam inserts for electronics, instrumentation, and fragile logistics.",
      image: "images/products/packaging-boxes.webp",
      price: 230,
      bulkPrice: 210,
      moq: 150,
      stock: 640,
      unit: "sets",
      deliveryInfo: "3-5 business days dispatch",
      status: "Active",
      supplierId: "supplier-004",
      supplierName: "PackRight Corp.",
      supplierLocation: "Ahmedabad, Gujarat",
      trustScore: 86,
      verificationStatus: "Verified",
      rating: 4.6,
      specs: {
        "Material": "Cross-linked Polyethylene (XLPE)",
        "Density": "33 kg/cu meter",
        "Feature": "Electrostatic Discharge (ESD) Safe",
        "Cut Type": "Precision CNC Routered"
      },
      createdAt: "2026-08-25",
      updatedAt: "2026-10-04"
    },
    {
      id: "product-008",
      sku: "SKU-MCH-SHL-08",
      name: "Heavy Duty Warehouse Shelving",
      category: "Machinery",
      description: "Industrial cold-rolled steel modular rack shelving system supporting 800 kg per level for distribution centres.",
      image: "images/products/stainless-steel-components.webp",
      price: 5300,
      bulkPrice: 5000,
      moq: 5,
      stock: 85,
      unit: "units",
      deliveryInfo: "5-8 business days freight delivery",
      status: "Active",
      supplierId: "supplier-005",
      supplierName: "SteelCraft Ltd.",
      supplierLocation: "Pune, Maharashtra",
      trustScore: 90,
      verificationStatus: "Verified",
      rating: 4.9,
      specs: {
        "Material": "High Tensile Cold-Rolled Steel",
        "Load Capacity": "800 kg Uniformly Distributed per shelf",
        "Dimensions": "2000(H) x 1800(W) x 600(D) mm",
        "Coating": "Anti-Corrosion Epoxy Powder Coating"
      },
      createdAt: "2026-08-28",
      updatedAt: "2026-10-05"
    }
  ];

  function safeParse(str, fallback) {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  }

  function getCurrentUser() {
    return safeParse(localStorage.getItem(CURRENT_USER_KEY), null);
  }

  // Get active directory depth to normalize image path
  function getRelativeImagePrefix() {
    const p = (window.location.pathname || "").replace(/\\/g, "/");
    if (/\/(?:pages\/(?:buyer|supplier|admin))\//.test(p)) {
      return "../../";
    }
    if (/\/(?:pages|auth)\//.test(p)) {
      return "../";
    }
    return "./";
  }

  function normalizeImagePath(rawPath) {
    if (!rawPath || typeof rawPath !== "string") {
      return getRelativeImagePrefix() + "images/products/industrial-safety-gloves.webp";
    }
    // If external URL or data URL
    if (rawPath.startsWith("http://") || rawPath.startsWith("https://") || rawPath.startsWith("data:")) {
      return rawPath;
    }
    // Strip leading ./ or ../ or /
    const clean = rawPath.replace(/^(?:\.\.\/|\.\/|\/)+/, "");
    return getRelativeImagePrefix() + clean;
  }

  // Read stored products with automated sync and migration
  function loadSharedProducts() {
    let list = safeParse(localStorage.getItem(STORAGE_KEY_SHARED), null);

    if (!Array.isArray(list) || list.length === 0) {
      // Check if existing products exist in supplier or demo stores
      const existingSup = safeParse(localStorage.getItem(STORAGE_KEY_SUPPLIER), null);
      if (Array.isArray(existingSup) && existingSup.length > 0) {
        // Merge supplier products into shared
        const merged = [...SEED_PRODUCTS];
        existingSup.forEach(supItem => {
          const matchIdx = merged.findIndex(p => p.id === supItem.id || p.sku === supItem.sku);
          const normalized = {
            id: supItem.id || `PRD-${Date.now()}`,
            sku: supItem.sku || `SKU-${supItem.id}`,
            name: supItem.name,
            category: supItem.category || "Industrial Equipment",
            description: supItem.description || "",
            image: supItem.image || "images/products/safety-gloves.webp",
            price: supItem.unitPrice ? Math.round(supItem.unitPrice * 80) : (supItem.price || 400),
            bulkPrice: supItem.bulkPrice || (supItem.unitPrice ? Math.round(supItem.unitPrice * 72) : 360),
            moq: supItem.moq || 50,
            stock: supItem.availableStock !== undefined ? supItem.availableStock : (supItem.stock || 100),
            unit: supItem.uom || supItem.unit || "units",
            deliveryInfo: supItem.deliveryInfo || "3-5 business days",
            status: supItem.status === "inactive" ? "Inactive" : (supItem.status === "unavailable" ? "Out of Stock" : "Active"),
            supplierId: supItem.supplierId || "supplier-001",
            supplierName: supItem.supplierName || "TradeNest Supplies",
            supplierLocation: supItem.supplierLocation || "Bengaluru, Karnataka",
            trustScore: supItem.trustScore || 92,
            verificationStatus: supItem.verificationStatus || "Verified",
            rating: supItem.rating || 4.8,
            specs: supItem.specs || {},
            createdAt: supItem.createdAt || new Date().toISOString().split("T")[0],
            updatedAt: supItem.updatedAt || new Date().toISOString().split("T")[0]
          };
          if (matchIdx >= 0) {
            merged[matchIdx] = { ...merged[matchIdx], ...normalized };
          } else {
            merged.push(normalized);
          }
        });
        list = merged;
      } else {
        list = [...SEED_PRODUCTS];
      }
      saveSharedProducts(list, false);
    }

    return list;
  }

  function saveSharedProducts(products, notify = true) {
    try {
      localStorage.setItem(STORAGE_KEY_SHARED, JSON.stringify(products));

      // Synchronize to tradenest_supplier_products for backward-compatibility
      const supplierProducts = products.map(p => ({
        id: p.id,
        sku: p.sku || `SKU-${p.id}`,
        name: p.name,
        category: p.category,
        description: p.description,
        image: p.image,
        uom: p.unit || "units",
        unitPrice: p.price ? Math.round(p.price / 80 * 100) / 100 : 5.0,
        moq: p.moq,
        availableStock: p.stock,
        minThreshold: p.minThreshold || Math.max(10, Math.floor(p.stock * 0.15)),
        status: (p.status || "Active").toLowerCase() === "active" ? "active" : "unavailable",
        supplierId: p.supplierId,
        supplierName: p.supplierName,
        deliveryInfo: p.deliveryInfo,
        specs: p.specs || {},
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }));
      localStorage.setItem(STORAGE_KEY_SUPPLIER, JSON.stringify(supplierProducts));

      // Synchronize to tradenest_demo_store_v1 for TradeNestStore compatibility
      const demoStore = safeParse(localStorage.getItem(STORAGE_KEY_DEMO), null);
      if (demoStore && typeof demoStore === "object") {
        demoStore.products = products.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          supplierId: p.supplierId,
          supplierName: p.supplierName,
          price: p.price,
          bulkPrice: p.bulkPrice || p.price,
          moq: p.moq,
          stock: p.stock,
          unit: p.unit || "unit",
          availability: p.status === "Active" ? (p.stock > 0 ? "In Stock" : "Out of Stock") : "Inactive",
          deliveryInfo: p.deliveryInfo,
          specifications: typeof p.specs === "object" ? Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join(", ") : (p.specs || ""),
          image: p.image
        }));
        demoStore.inventory = demoStore.products;
        localStorage.setItem(STORAGE_KEY_DEMO, JSON.stringify(demoStore));
      }

      if (notify) {
        broadcastChange({ type: "products-updated", timestamp: Date.now() });
      }
    } catch (e) {
      console.error("[TradeNestProductService] Error saving products:", e);
    }
  }

  function broadcastChange(payload) {
    try {
      const event = new CustomEvent("tradenest:products-changed", { detail: payload });
      window.dispatchEvent(event);
    } catch (e) {
      console.warn("Event dispatch error:", e);
    }
  }

  // Cross-tab storage synchronization listener
  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY_SHARED || e.key === STORAGE_KEY_SUPPLIER || e.key === STORAGE_KEY_DEMO) {
      broadcastChange({ type: "storage-sync", key: e.key });
    }
  });

  // Validation function
  function validateProductData(productData) {
    const errors = [];
    if (!productData) {
      return ["Product information is missing."];
    }
    if (!productData.name || typeof productData.name !== "string" || productData.name.trim().length < 3) {
      errors.push("Product name is required (minimum 3 characters).");
    }
    if (!productData.category || typeof productData.category !== "string" || !productData.category.trim()) {
      errors.push("Product category is required.");
    }
    if (!productData.description || typeof productData.description !== "string" || productData.description.trim().length < 10) {
      errors.push("Product description is required (minimum 10 characters).");
    }
    const price = Number(productData.price);
    if (isNaN(price) || price <= 0) {
      errors.push("Valid product price greater than 0 is required.");
    }
    const moq = Number(productData.moq);
    if (isNaN(moq) || moq < 1) {
      errors.push("Minimum order quantity (MOQ) must be at least 1.");
    }
    const stock = Number(productData.stock);
    if (isNaN(stock) || stock < 0) {
      errors.push("Available stock quantity must be 0 or greater.");
    }
    if (!productData.deliveryInfo || typeof productData.deliveryInfo !== "string" || !productData.deliveryInfo.trim()) {
      errors.push("Delivery information (e.g. lead time, dispatch timeline) is required.");
    }
    const allowedStatuses = ["Active", "Out of Stock", "Inactive"];
    if (productData.status && !allowedStatuses.includes(productData.status)) {
      errors.push(`Status must be one of: ${allowedStatuses.join(", ")}`);
    }
    return errors;
  }

  // Determine if a user is authorized to manage a specific product
  function canUserManageProduct(user, product) {
    if (!user) return false;
    const role = (user.role || "").toLowerCase();
    if (role === "admin") return true;
    if (role !== "supplier") return false;

    // If new product being created
    if (!product || !product.supplierId) return true;

    // Check supplier ID or matching email
    const uId = String(user.id || "").toLowerCase();
    const uEmail = String(user.email || "").toLowerCase();
    const pSupId = String(product.supplierId || "").toLowerCase();
    const pSupEmail = String(product.supplierEmail || "").toLowerCase();

    return (
      (uId && uId === pSupId) ||
      (uEmail && uEmail === pSupEmail) ||
      (uEmail && pSupId.includes("supplier") && user.role === "supplier")
    );
  }

  // Public Service Object
  const TradeNestProductService = {
    // Synchronous query
    getProductsSync(options = {}) {
      const all = loadSharedProducts();
      let filtered = [...all];

      // Filter by supplier
      if (options.supplierId) {
        filtered = filtered.filter(p => p.supplierId === options.supplierId);
      }

      // Filter by status (public views default to Active)
      if (options.status) {
        filtered = filtered.filter(p => (p.status || "Active").toLowerCase() === options.status.toLowerCase());
      } else if (options.onlyActive !== false && !options.includeAllStatuses) {
        filtered = filtered.filter(p => (p.status || "Active") === "Active");
      }

      // Filter by category
      if (options.category && options.category !== "all" && options.category !== "") {
        const catNorm = options.category.toLowerCase().replace(/[^a-z0-9]/g, "");
        filtered = filtered.filter(p => {
          const itemCat = (p.category || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          return itemCat === catNorm || itemCat.includes(catNorm);
        });
      }

      // Filter by search term
      if (options.search && options.search.trim()) {
        const q = options.search.trim().toLowerCase();
        filtered = filtered.filter(p =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.supplierName && p.supplierName.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q))
        );
      }

      // Price filter
      if (options.minPrice !== undefined && options.minPrice !== null && !isNaN(options.minPrice)) {
        filtered = filtered.filter(p => p.price >= Number(options.minPrice));
      }
      if (options.maxPrice !== undefined && options.maxPrice !== null && !isNaN(options.maxPrice)) {
        filtered = filtered.filter(p => p.price <= Number(options.maxPrice));
      }

      // Sorting
      if (options.sortBy) {
        if (options.sortBy === "price-low") {
          filtered.sort((a, b) => a.price - b.price);
        } else if (options.sortBy === "price-high") {
          filtered.sort((a, b) => b.price - a.price);
        } else if (options.sortBy === "moq-low") {
          filtered.sort((a, b) => a.moq - b.moq);
        } else if (options.sortBy === "rating") {
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (options.sortBy === "trust-score") {
          filtered.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
        } else if (options.sortBy === "newest") {
          filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        } else if (options.sortBy === "name") {
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
      }

      return filtered;
    },

    // Promise-based async method (simulates real API network call with latency/error handling)
    async getProducts(options = {}) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.getProductsSync(options));
        }, 15);
      });
    },

    // Get single product by ID or SKU
    getProductByIdSync(id) {
      if (!id) return null;
      const all = loadSharedProducts();
      return all.find(p => p.id === id || p.sku === id) || null;
    },

    async getProductById(id) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const item = this.getProductByIdSync(id);
          if (item) resolve(item);
          else reject(new Error(`Product with ID "${id}" was not found.`));
        }, 15);
      });
    },

    // Save product (Add or Update)
    saveProductSync(productData, userOverride = null) {
      const user = userOverride || getCurrentUser();
      if (!user) {
        throw new Error("Authentication required. Please log in as a registered supplier.");
      }
      const role = (user.role || "").toLowerCase();
      if (role !== "supplier" && role !== "admin") {
        throw new Error("Unauthorized. Only registered suppliers or administrators can manage products.");
      }

      const errors = validateProductData(productData);
      if (errors.length > 0) {
        throw new Error(errors.join(" "));
      }

      const products = loadSharedProducts();
      const existingIdx = productData.id ? products.findIndex(p => p.id === productData.id) : -1;

      if (existingIdx >= 0) {
        // Edit existing product
        const existing = products[existingIdx];
        if (!canUserManageProduct(user, existing)) {
          throw new Error("Unauthorized: You do not have permission to modify another supplier's product listing.");
        }

        const updated = {
          ...existing,
          name: productData.name.trim(),
          sku: productData.sku ? productData.sku.trim() : existing.sku,
          category: productData.category.trim(),
          description: productData.description.trim(),
          image: productData.image ? productData.image.trim() : existing.image,
          price: Number(productData.price),
          bulkPrice: productData.bulkPrice ? Number(productData.bulkPrice) : Math.round(Number(productData.price) * 0.9),
          moq: Number(productData.moq),
          stock: Number(productData.stock),
          unit: productData.unit ? productData.unit.trim() : existing.unit,
          deliveryInfo: productData.deliveryInfo.trim(),
          status: productData.status || (Number(productData.stock) === 0 ? "Out of Stock" : existing.status || "Active"),
          specs: productData.specs || existing.specs || {},
          updatedAt: new Date().toISOString().split("T")[0]
        };

        products[existingIdx] = updated;
        saveSharedProducts(products, true);
        return updated;
      } else {
        // Add new product
        const newId = "product-" + String(Date.now()).slice(-6);
        const supplierId = user.id || `supplier-${String(Date.now()).slice(-4)}`;
        const supplierName = user.businessName || (user.business && user.business.name) || user.fullName || "TradeNest Supplier";
        const supplierLocation = (user.city ? `${user.city}, ${user.state || ""}` : (user.location || "Bengaluru, India"));

        const newProduct = {
          id: newId,
          sku: productData.sku ? productData.sku.trim() : `SKU-${newId.toUpperCase()}`,
          name: productData.name.trim(),
          category: productData.category.trim(),
          description: productData.description.trim(),
          image: productData.image ? productData.image.trim() : "images/products/industrial-safety-gloves.webp",
          price: Number(productData.price),
          bulkPrice: productData.bulkPrice ? Number(productData.bulkPrice) : Math.round(Number(productData.price) * 0.9),
          moq: Number(productData.moq),
          stock: Number(productData.stock),
          unit: productData.unit ? productData.unit.trim() : "units",
          deliveryInfo: productData.deliveryInfo.trim(),
          status: productData.status || (Number(productData.stock) === 0 ? "Out of Stock" : "Active"),
          supplierId: supplierId,
          supplierName: supplierName,
          supplierEmail: user.email || "",
          supplierLocation: supplierLocation,
          trustScore: user.trustScore || 92,
          verificationStatus: user.verificationStatus || "Verified",
          rating: 5.0,
          specs: productData.specs || {},
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0]
        };

        products.unshift(newProduct);
        saveSharedProducts(products, true);
        return newProduct;
      }
    },

    async saveProduct(productData, userOverride = null) {
      return new Promise((resolve, reject) => {
        try {
          const saved = this.saveProductSync(productData, userOverride);
          resolve(saved);
        } catch (e) {
          reject(e);
        }
      });
    },

    // Delete product
    deleteProductSync(id, userOverride = null) {
      const user = userOverride || getCurrentUser();
      if (!user) {
        throw new Error("Authentication required.");
      }
      const products = loadSharedProducts();
      const existing = products.find(p => p.id === id);
      if (!existing) {
        throw new Error(`Product "${id}" not found.`);
      }
      if (!canUserManageProduct(user, existing)) {
        throw new Error("Unauthorized: You do not have permission to delete another supplier's product listing.");
      }

      const updatedList = products.filter(p => p.id !== id);
      saveSharedProducts(updatedList, true);
      return true;
    },

    async deleteProduct(id, userOverride = null) {
      return new Promise((resolve, reject) => {
        try {
          const res = this.deleteProductSync(id, userOverride);
          resolve(res);
        } catch (e) {
          reject(e);
        }
      });
    },

    // Toggle product status (Active <-> Inactive)
    toggleProductStatusSync(id, userOverride = null) {
      const user = userOverride || getCurrentUser();
      const products = loadSharedProducts();
      const prod = products.find(p => p.id === id);
      if (!prod) throw new Error("Product not found.");
      if (!canUserManageProduct(user, prod)) {
        throw new Error("Unauthorized to change status of this product.");
      }

      prod.status = prod.status === "Active" ? "Inactive" : "Active";
      prod.updatedAt = new Date().toISOString().split("T")[0];
      saveSharedProducts(products, true);
      return prod.status;
    },

    // Update stock & threshold
    updateStockSync(id, newStock, minThreshold = null, userOverride = null) {
      const user = userOverride || getCurrentUser();
      const products = loadSharedProducts();
      const prod = products.find(p => p.id === id);
      if (!prod) throw new Error("Product not found.");
      if (!canUserManageProduct(user, prod)) {
        throw new Error("Unauthorized to update inventory for this product.");
      }

      prod.stock = Math.max(0, parseInt(newStock, 10) || 0);
      if (minThreshold !== null && minThreshold !== undefined) {
        prod.minThreshold = parseInt(minThreshold, 10) || 0;
      }
      if (prod.stock === 0 && prod.status === "Active") {
        prod.status = "Out of Stock";
      } else if (prod.stock > 0 && prod.status === "Out of Stock") {
        prod.status = "Active";
      }
      prod.updatedAt = new Date().toISOString().split("T")[0];
      saveSharedProducts(products, true);
      return prod;
    },

    // Distinct list of categories
    getCategories() {
      const products = loadSharedProducts();
      const set = new Set();
      products.forEach(p => {
        if (p.category) set.add(p.category);
      });
      return Array.from(set).sort();
    },

    // Distinct list of suppliers
    getSuppliers() {
      const products = loadSharedProducts();
      const map = new Map();
      products.forEach(p => {
        if (p.supplierId && !map.has(p.supplierId)) {
          map.set(p.supplierId, {
            id: p.supplierId,
            name: p.supplierName,
            location: p.supplierLocation,
            trustScore: p.trustScore,
            verificationStatus: p.verificationStatus
          });
        }
      });
      return Array.from(map.values());
    },

    // Format currency (INR)
    formatCurrency(amount) {
      const num = Number(amount) || 0;
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      }).format(num);
    },

    // Resolve image path relative to current page
    normalizeImagePath,
    canUserManageProduct,
    SEED_PRODUCTS
  };

  // Expose to global window scope
  window.TradeNestProductService = TradeNestProductService;
})(window);
