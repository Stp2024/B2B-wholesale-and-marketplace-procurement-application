/**
 * TradeNest — Products Catalog & Search Handler (js/products-page.js)
 * Fully functional Advanced Product Search & Supplier Filters.
 * Connects Search Keywords, Category, Supplier Location, Price Range,
 * Supplier Verification, Minimum Trust Score, Product Availability,
 * Max Delivery Time, Max MOQ, Minimum Rating, and Catalog Sorting.
 */

(function () {
  "use strict";

  // Category and name-aware fallback product images
  function getDefaultProductImage(category, name) {
    const cat = String(category || "").toLowerCase();
    const nm = String(name || "").toLowerCase();

    // 1. Tool Kits & Mechanic Tools
    if (nm.includes("tool") || nm.includes("wrench") || nm.includes("drill") || nm.includes("spanner") || nm.includes("mechanic") || nm.includes("socket")) {
      return "../images/products/mechanics-tool-kit.webp";
    }
    // 2. Storage Crates & Heavy Bins
    if (nm.includes("crate") || nm.includes("bin") || nm.includes("storage crate") || nm.includes("pallet box")) {
      return "../images/products/industrial-storage-crates.webp";
    }
    // 3. Ergonomic Chairs & Workspace Furniture
    if (nm.includes("chair") || nm.includes("seating") || nm.includes("ergonomic") || nm.includes("stool") || (cat.includes("office") && (nm.includes("furniture") || nm.includes("seat")))) {
      return "../images/products/featured-office-ergonomic-chairs.webp";
    }
    // 4. Biodegradable Bags, Trash Bags & Polymers
    if (nm.includes("trash") || nm.includes("bag") || nm.includes("polymer") || nm.includes("refuse") || nm.includes("biodegradable") || cat.includes("raw material")) {
      return "../images/products/featured-biodegradable-polymers.webp";
    }
    // 5. CNC Cutters, Milling, End Mills & Machine Cutters
    if (nm.includes("cnc") || nm.includes("milling") || nm.includes("cutter") || nm.includes("end mill") || nm.includes("carbide") || (cat.includes("machin") && !nm.includes("shelv"))) {
      return "../images/products/featured-cnc-milling-cutters.webp";
    }
    // 6. Hard Hats & Helmets
    if (nm.includes("helmet") || nm.includes("hard hat") || nm.includes("head protection")) {
      return "../images/products/industrial-safety-helmets.webp";
    }
    // 7. Warehouse Shelving & Heavy Racks
    if (nm.includes("shelv") || nm.includes("rack") || nm.includes("pallet rack")) {
      return "../images/products/warehouse-shelving-rack.webp";
    }
    // 8. Work Gloves (strictly when name mentions glove)
    if (nm.includes("glove") || nm.includes("mitt")) {
      if (nm.includes("abc") || nm.includes("high-grip") || nm.includes("work glove")) {
        return "../images/products/high-grip-work-gloves.webp";
      }
      return "../images/products/industrial-safety-gloves.webp";
    }
    // 9. Desk Organizers & Accessories
    if (nm.includes("organis") || nm.includes("organiz") || nm.includes("caddy")) {
      return "../images/products/executive-desk-organizer.webp";
    }
    // 10. Protective Foam Inserts
    if (nm.includes("foam") || nm.includes("insert") || nm.includes("cushion")) {
      return "../images/products/protective-foam-inserts.webp";
    }
    // 11. Copy Paper & Stationery
    if (nm.includes("paper") || nm.includes("ream") || nm.includes("copy") || cat.includes("stationery")) {
      return "../images/products/a4-premium-copy-paper.webp";
    }
    // 12. Corrugated Boxes & Cartons
    if (nm.includes("box") || nm.includes("carton") || nm.includes("corrugated")) {
      return "../images/products/corrugated-packaging-boxes.webp";
    }
    // 13. LED Panels & Lighting
    if (cat.includes("electric") || cat.includes("light") || nm.includes("led") || nm.includes("bulb")) {
      return "../images/products/commercial-led-panel-lights.webp";
    }
    // 14. Textiles, Fabric & Apparel
    if (cat.includes("textil") || cat.includes("fabric") || nm.includes("cotton") || nm.includes("denim")) {
      return "../images/products/cotton-fabric-rolls.webp";
    }
    // 15. Food Packaging Materials
    if (nm.includes("food") || (cat.includes("food") && cat.includes("packag"))) {
      return "../images/products/food-packaging-materials.webp";
    }
    // 16. Stainless Steel Components
    if (nm.includes("steel") || nm.includes("stainless") || nm.includes("component")) {
      return "../images/products/stainless-steel-components.webp";
    }
    // Category fallbacks
    if (cat.includes("machin")) return "../images/products/featured-cnc-milling-cutters.webp";
    if (cat.includes("packag")) return "../images/products/corrugated-packaging-boxes.webp";
    if (cat.includes("office")) return "../images/products/featured-office-ergonomic-chairs.webp";

    return "../images/products/industrial-safety-gloves.webp";
  }

  // Canonical product catalog with verified attributes for all standard items
  const CANONICAL_CATALOG = [
    {
      id: "product-abc-001",
      sku: "SKU-ABC-IND-01",
      name: "ABC Heavy-Duty Industrial Tool Kit",
      category: "Industrial Equipment",
      price: 2450,
      moq: 10,
      unit: "kit",
      stock: 450,
      image: "../images/products/mechanics-tool-kit.webp",
      supplierId: "supplier-abc",
      supplierName: "ABC Traders",
      location: "Bengaluru, Karnataka",
      verificationStatus: "Premium Certified",
      rating: 4.9,
      trustScore: 96,
      deliveryDays: 4,
      deliveryInfo: "2-4 business days across India",
      availability: "In Stock",
      description: "Professional grade 120-piece chrome vanadium alloy steel toolkit for plant maintenance and heavy manufacturing by ABC Traders."
    },
    {
      id: "product-abc-002",
      sku: "SKU-ABC-SAF-02",
      name: "ABC High-Grip Safety Work Gloves",
      category: "Industrial Equipment",
      price: 195,
      moq: 200,
      unit: "pair",
      stock: 3500,
      image: "../images/products/high-grip-work-gloves.webp",
      supplierId: "supplier-abc",
      supplierName: "ABC Traders",
      location: "Bengaluru, Karnataka",
      verificationStatus: "Premium Certified",
      rating: 5.0,
      trustScore: 96,
      deliveryDays: 3,
      deliveryInfo: "2-3 business days across India",
      availability: "In Stock",
      description: "Premium level-5 cut resistant industrial work gloves with reinforced micro-foam nitrile coating manufactured by ABC Traders."
    },
    {
      id: "product-abc-003",
      sku: "SKU-ABC-PKG-03",
      name: "ABC Premium Wholesale Storage Crates",
      category: "Packaging",
      price: 680,
      moq: 25,
      unit: "crate",
      stock: 800,
      image: "../images/products/industrial-storage-crates.webp",
      supplierId: "supplier-abc",
      supplierName: "ABC Traders",
      location: "Bengaluru, Karnataka",
      verificationStatus: "Premium Certified",
      rating: 4.8,
      trustScore: 96,
      deliveryDays: 5,
      deliveryInfo: "3-5 business days bulk freight",
      availability: "In Stock",
      description: "High-density polyethylene heavy-duty stackable industrial storage crates for distribution centers and warehouse logistics by ABC Traders."
    },
    {
      id: "product-001",
      sku: "SKU-IND-GLV-01",
      name: "Industrial Safety Gloves",
      category: "Industrial Equipment",
      price: 180,
      moq: 500,
      unit: "pair",
      stock: 1250,
      image: "../images/products/industrial-safety-gloves.webp",
      supplierId: "supplier-001",
      supplierName: "Apex Safety Solutions Pvt Ltd",
      location: "Bengaluru, Karnataka",
      verificationStatus: "Verified",
      rating: 5.0,
      trustScore: 92,
      deliveryDays: 4,
      deliveryInfo: "2-4 business days across India",
      availability: "In Stock",
      description: "Heavy-duty nitrile coated Kevlar grip gloves with cut resistance level 5 and oil repellent coating."
    },
    {
      id: "product-002",
      sku: "SKU-IND-HLM-02",
      name: "Industrial Safety Helmets",
      category: "Industrial Equipment",
      price: 520,
      moq: 200,
      unit: "unit",
      stock: 760,
      image: "../images/products/industrial-safety-helmets.webp",
      supplierId: "supplier-001",
      supplierName: "Apex Safety Solutions Pvt Ltd",
      location: "Bengaluru, Karnataka",
      verificationStatus: "Verified",
      rating: 4.8,
      trustScore: 92,
      deliveryDays: 5,
      deliveryInfo: "3-5 business days across India",
      availability: "In Stock",
      description: "High-impact head protection with adjustable ratchet suspension and ANSI certification for heavy construction."
    },
    {
      id: "product-003",
      sku: "SKU-OFC-PPR-03",
      name: "A4 Premium Copy Paper",
      category: "Office Supplies",
      price: 420,
      moq: 50,
      unit: "ream",
      stock: 2500,
      image: "../images/products/a4-premium-copy-paper.webp",
      supplierId: "supplier-002",
      supplierName: "PaperPro Solutions",
      location: "Mumbai, Maharashtra",
      verificationStatus: "Verified",
      rating: 4.7,
      trustScore: 88,
      deliveryDays: 3,
      deliveryInfo: "2-3 business days in major metros",
      availability: "In Stock",
      description: "High-whiteness premium 80 GSM copy paper engineered for jam-free high-speed laser and inkjet printing."
    },
    {
      id: "product-004",
      sku: "SKU-OFC-ORG-04",
      name: "Executive Desk Organiser",
      category: "Office Supplies",
      price: 1180,
      moq: 20,
      unit: "set",
      stock: 420,
      image: "../images/products/executive-desk-organizer.webp",
      supplierId: "supplier-002",
      supplierName: "PaperPro Solutions",
      location: "Mumbai, Maharashtra",
      verificationStatus: "Verified",
      rating: 4.6,
      trustScore: 88,
      deliveryDays: 6,
      deliveryInfo: "3-6 business days standard shipping",
      availability: "In Stock",
      description: "Modular steel office desk organizer designed for high-density corporate workspaces and documents."
    },
    {
      id: "product-005",
      sku: "SKU-ELE-LED-05",
      name: "Commercial LED Panel Lights",
      category: "Electronics",
      price: 1650,
      moq: 20,
      unit: "panel",
      stock: 520,
      image: "../images/products/commercial-led-panel-lights.webp",
      supplierId: "supplier-003",
      supplierName: "Lumina Electric",
      location: "Delhi NCR",
      verificationStatus: "Verified",
      rating: 4.8,
      trustScore: 94,
      deliveryDays: 7,
      deliveryInfo: "4-7 business days with safe fragility pack",
      availability: "In Stock",
      description: "Energy-efficient 40W commercial edge-lit LED panels 600x600mm, flicker-free driver, 4000 lumens, 50,000h lifespan."
    },
    {
      id: "product-006",
      sku: "SKU-PKG-BOX-06",
      name: "Corrugated Packaging Boxes",
      category: "Packaging",
      price: 55,
      moq: 500,
      unit: "box",
      stock: 9600,
      image: "../images/products/corrugated-packaging-boxes.webp",
      supplierId: "supplier-004",
      supplierName: "PackRight Corp.",
      location: "Ahmedabad, Gujarat",
      verificationStatus: "Verified",
      rating: 4.5,
      trustScore: 86,
      deliveryDays: 5,
      deliveryInfo: "2-5 business days bulk freight",
      availability: "In Stock",
      description: "Heavy-duty triple-wall corrugated shipping boxes engineered for industrial export and freight protection."
    },
    {
      id: "product-007",
      sku: "SKU-PKG-FPM-07",
      name: "Protective Foam Inserts",
      category: "Packaging",
      price: 230,
      moq: 150,
      unit: "set",
      stock: 640,
      image: "../images/products/protective-foam-inserts.webp",
      supplierId: "supplier-004",
      supplierName: "PackRight Corp.",
      location: "Ahmedabad, Gujarat",
      verificationStatus: "Verified",
      rating: 4.6,
      trustScore: 86,
      deliveryDays: 5,
      deliveryInfo: "3-5 business days dispatch",
      availability: "In Stock",
      description: "Custom die-cut polyethylene anti-static foam inserts for electronics, instrumentation, and fragile logistics."
    },
    {
      id: "product-008",
      sku: "SKU-MCH-SHL-08",
      name: "Heavy Duty Warehouse Shelving",
      category: "Machinery",
      price: 5300,
      moq: 5,
      unit: "unit",
      stock: 85,
      image: "../images/products/warehouse-shelving-rack.webp",
      supplierId: "supplier-005",
      supplierName: "SteelCraft Ltd.",
      location: "Pune, Maharashtra",
      verificationStatus: "Verified",
      rating: 4.9,
      trustScore: 90,
      deliveryDays: 8,
      deliveryInfo: "5-8 business days freight delivery",
      availability: "In Stock",
      description: "Industrial cold-rolled steel modular rack shelving system supporting 800 kg per level for distribution centres."
    },
    {
      id: "product-009",
      sku: "SKU-TEX-COT-09",
      name: "Cotton Fabric Rolls",
      category: "Textiles & Garments",
      price: 145,
      moq: 1000,
      unit: "meter",
      stock: 4500,
      image: "../images/products/cotton-fabric-rolls.webp",
      supplierId: "supplier-006",
      supplierName: "Vardhman Weaves & Tex",
      location: "Ahmedabad, Gujarat",
      verificationStatus: "Verified",
      rating: 4.9,
      trustScore: 89,
      deliveryDays: 5,
      deliveryInfo: "3-5 business days dispatch",
      availability: "In Stock",
      description: "Premium quality 100% combed organic cotton fabric rolls, ideal for garment manufacturing."
    },
    {
      id: "product-010",
      sku: "SKU-ELE-BLB-10",
      name: "Commercial LED Bulbs",
      category: "Electronics",
      price: 120,
      moq: 100,
      unit: "piece",
      stock: 2200,
      image: "../images/products/commercial-led-panel-lights.webp",
      supplierId: "supplier-003",
      supplierName: "Lumina Electric",
      location: "Delhi NCR",
      verificationStatus: "Verified",
      rating: 4.7,
      trustScore: 94,
      deliveryDays: 4,
      deliveryInfo: "2-4 business days standard",
      availability: "In Stock",
      description: "High-lumen B22 commercial LED bulbs with surge protection for offices and industrial buildings."
    },
    {
      id: "product-011",
      sku: "SKU-IND-FST-11",
      name: "Stainless Steel Components",
      category: "Industrial Equipment",
      price: 320,
      moq: 200,
      unit: "unit",
      stock: 1800,
      image: "../images/products/stainless-steel-components.webp",
      supplierId: "supplier-005",
      supplierName: "Metalex Engineering Ltd",
      location: "Pune, Maharashtra",
      verificationStatus: "Verified",
      rating: 4.8,
      trustScore: 93,
      deliveryDays: 8,
      deliveryInfo: "5-8 business days freight delivery",
      availability: "In Stock",
      description: "Precision-machined Grade 316 stainless steel fittings, valves, and industrial fasteners."
    },
    {
      id: "product-012",
      sku: "SKU-PKG-MAT-12",
      name: "Food Packaging Materials",
      category: "Packaging",
      price: 450,
      moq: 100,
      unit: "pack",
      stock: 1400,
      image: "../images/products/food-packaging-materials.webp",
      supplierId: "supplier-007",
      supplierName: "BioPack Green Solutions",
      location: "Ahmedabad, Gujarat",
      verificationStatus: "Verified",
      rating: 4.1,
      trustScore: 88,
      deliveryDays: 5,
      deliveryInfo: "3-5 business days freight",
      availability: "In Stock",
      description: "Food-grade compostable vacuum seal pouches and heat-sealable trays for commercial catering."
    },
    {
      id: "product-013",
      sku: "SKU-MCH-CNC-13",
      name: "Carbide CNC Milling Cutters",
      category: "Machinery",
      price: 1150,
      moq: 25,
      unit: "piece",
      stock: 320,
      image: "../images/products/featured-cnc-milling-cutters.webp",
      supplierId: "supplier-008",
      supplierName: "Precision Tooling Works",
      location: "Pune, Maharashtra",
      verificationStatus: "Premium Certified",
      rating: 4.9,
      trustScore: 96,
      deliveryDays: 6,
      deliveryInfo: "3-6 business days express",
      availability: "In Stock",
      description: "Ultra-hard micro-grain tungsten carbide 4-flute end mills for high-speed CNC milling in aerospace and tooling."
    },
    {
      id: "product-014",
      sku: "SKU-RAW-BAG-14",
      name: "Biodegradable Trash Bags",
      category: "Raw Materials",
      price: 210,
      moq: 100,
      unit: "roll",
      stock: 2800,
      image: "../images/products/featured-biodegradable-polymers.webp",
      supplierId: "supplier-009",
      supplierName: "GreenChem Polymers Corp.",
      location: "Ahmedabad, Gujarat",
      verificationStatus: "Premium Certified",
      rating: 4.8,
      trustScore: 95,
      deliveryDays: 7,
      deliveryInfo: "3-7 business days freight",
      availability: "In Stock",
      description: "Plant-starch based certified compostable heavy-duty garbage bags for municipal and commercial hospitality procurement."
    },
    {
      id: "product-015",
      sku: "SKU-OFC-CHR-15",
      name: "Commercial Ergonomic Office Chairs",
      category: "Office Supplies",
      price: 4850,
      moq: 20,
      unit: "chair",
      stock: 150,
      image: "../images/products/featured-office-ergonomic-chairs.webp",
      supplierId: "supplier-010",
      supplierName: "UrbanWork Office Systems",
      location: "Bengaluru, Karnataka",
      verificationStatus: "Verified",
      rating: 4.8,
      trustScore: 90,
      deliveryDays: 8,
      deliveryInfo: "4-8 business days delivery",
      availability: "In Stock",
      description: "High-back breathable mesh ergonomic swivel task chairs with synchronous tilt lock and 3D adjustable armrests for enterprise facilities."
    }
  ];

  // Helper to extract maximum delivery days from deliveryInfo string
  function parseDeliveryDays(info, fallback) {
    if (typeof info === "number" && !isNaN(info)) return info;
    if (!info || typeof info !== "string") return fallback || 5;
    const matchRange = info.match(/(\d+)\s*[-–]\s*(\d+)\s*(?:business\s*)?days?/i);
    if (matchRange) return parseInt(matchRange[2], 10);
    const matchSingle = info.match(/(\d+)\s*(?:business\s*)?days?/i);
    if (matchSingle) return parseInt(matchSingle[1], 10);
    return fallback || 5;
  }

  // Helper to normalize image paths for pages/products.html context
  function normalizeProductImage(raw, category, name) {
    let img = raw || "";
    const nm = String(name || "").toLowerCase();
    const rawImg = String(img).toLowerCase();
    const isGloveProduct = nm.includes("glove") || nm.includes("mitt");
    const isGloveImage = rawImg.includes("glove") || rawImg.includes("safety-gloves");

    if (!img || rawImg.includes("placeholder") || (isGloveImage && !isGloveProduct)) {
      img = getDefaultProductImage(category, name);
    }
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
      return img;
    }
    if (img.startsWith("../")) return img;
    if (img.startsWith("./")) return "../" + img.replace(/^\.\//, "");
    if (img.startsWith("/")) return ".." + img;
    return "../" + img.replace(/^\/+/, "");
  }

  // Normalizes product objects from any source (Service, Store, or Canonical)
  function normalizeProduct(p) {
    const rawStock = typeof p.stock === "number" ? p.stock : (typeof p.availableStock === "number" ? p.availableStock : 100);
    const rawDeliveryDays = p.deliveryDays || parseDeliveryDays(p.deliveryInfo || p.delivery, 5);
    const rawTrust = typeof p.trustScore === "number" ? p.trustScore : (typeof p.trust_score === "number" ? p.trust_score : 90);
    const rawRating = (p.rating !== undefined && p.rating !== null && p.rating !== 0) ? Number(p.rating) : 4.5;
    const rawPrice = Number(p.price || p.unitPrice || 0);
    const rawMoq = Number(p.moq || 1);
    const rawVerif = p.verificationStatus || p.verification || "Verified";
    const isPremium = String(rawVerif).toLowerCase().includes("premium") || (rawTrust >= 95 && String(rawVerif).toLowerCase().includes("verified"));
    const finalVerif = isPremium ? "Premium Certified" : rawVerif;

    let avail = p.availability;
    if (!avail) {
      avail = rawStock > 0 ? "In Stock" : "Made to Order";
    }

    return {
      id: String(p.id),
      sku: p.sku || `SKU-${p.id}`,
      name: p.name || "Wholesale Product",
      category: p.category || "General",
      description: p.description || "High-quality certified wholesale product available for B2B procurement on TradeNest.",
      price: rawPrice,
      moq: rawMoq,
      unit: p.unit || p.uom || "unit",
      stock: rawStock,
      image: normalizeProductImage(p.image || p.imageUrl, p.category, p.name),
      supplierId: p.supplierId || "supplier-abc",
      supplierName: p.supplierName || "TradeNest Verified Supplier",
      location: p.location || p.supplierLocation || "Bengaluru, Karnataka",
      verificationStatus: finalVerif,
      trustScore: rawTrust,
      rating: rawRating,
      deliveryDays: rawDeliveryDays,
      deliveryInfo: p.deliveryInfo || `${rawDeliveryDays} business days standard delivery`,
      availability: avail
    };
  }

  // Helper to retrieve all active products combining TradeNestProductService, TradeNestStore, and Canonical Catalog
  function getAllProducts() {
    const list = [];
    const seenIds = new Set();

    // 1. TradeNestProductService
    if (window.TradeNestProductService && typeof window.TradeNestProductService.getProductsSync === "function") {
      try {
        const sp = window.TradeNestProductService.getProductsSync({ includeAllStatuses: true });
        if (Array.isArray(sp)) {
          sp.forEach(p => {
            if (p && p.id && !seenIds.has(p.id)) {
              if (window.TradeNestProductService.isProductDeleted && window.TradeNestProductService.isProductDeleted(p)) {
                return;
              }
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

    // 3. Guaranteed Canonical Catalog
    CANONICAL_CATALOG.forEach(p => {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        list.push(normalizeProduct(p));
      }
    });

    return list;
  }

  // HTML escaping helper
  function escapeHtml(str) {
    const el = document.createElement("div");
    el.textContent = String(str || "");
    return el.innerHTML;
  }

  // Highlight matched query characters in live suggestions
  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return escapedText.replace(regex, "<mark>$1</mark>");
  }

  // Show unobtrusive search feedback toast
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
    }, 3500);
  }

  // Renders a single product card matching the exact TradeNest design and HTML structure
  function renderProductCardHtml(p) {
    const isPremium = String(p.verificationStatus).toLowerCase().includes("premium") || (p.trustScore >= 95 && String(p.verificationStatus).toLowerCase().includes("verified"));
    const verifLabel = isPremium ? "Premium Certified" : (String(p.verificationStatus).toLowerCase().includes("verified") ? "Verified Supplier" : "Supplier");
    const isOutOfStock = p.availability === "Out of Stock" || p.stock === 0;
    const isMadeToOrder = p.availability === "Made to Order";
    const stockBadgeText = isOutOfStock ? "Out of Stock" : (isMadeToOrder ? "Made to Order" : "In Stock");
    const stockBadgeClass = isOutOfStock ? "badge-danger" : (isMadeToOrder ? "badge-order" : "badge-stock");
    const supplierId = p.supplierId || "supplier-abc";
    const fallbackImg = getDefaultProductImage(p.category, p.name);

    return `
      <article class="product-card" data-product-id="${escapeHtml(p.id)}"
        data-category="${escapeHtml(p.category)}"
        data-location="${escapeHtml(p.location)}"
        data-price="${p.price}"
        data-moq="${p.moq}"
        data-trust="${p.trustScore}"
        data-rating="${p.rating}"
        data-delivery="${p.deliveryDays}"
        data-verification="${escapeHtml(p.verificationStatus)}"
        data-availability="${escapeHtml(p.availability)}">
        <div class="product-image-container">
          <img
            src="${escapeHtml(p.image)}"
            alt="${escapeHtml(p.name)}"
            class="product-image"
            onerror="this.onerror=null; this.src='${fallbackImg}';"
          />
          <span class="badge ${stockBadgeClass}"> ${stockBadgeText} </span>
        </div>

        <div class="product-content">
          <span class="product-category"> ${escapeHtml(p.category)} </span>

          <h3 class="product-title">${escapeHtml(p.name)}</h3>

          <p class="product-description">
            ${escapeHtml(p.description)}
          </p>

          <div class="product-pricing-info">
            <span class="product-price">
              ₹${p.price.toLocaleString("en-IN")} <small>/ ${escapeHtml(p.unit)}</small>
            </span>

            <span class="product-moq"> MOQ: ${p.moq.toLocaleString("en-IN")} ${escapeHtml(p.unit)}s </span>
          </div>

          <div class="product-supplier-info">
            <span class="supplier-name"> ${escapeHtml(p.supplierName)} </span>

            <span class="verification-badge status-verified">
              ${verifLabel}
            </span>
          </div>

          <div class="product-metrics">
            <span class="trust-score">
              Trust Score:
              <strong>${p.trustScore}/100</strong>
            </span>

            <span
              class="rating-stars"
              aria-label="Rating: ${p.rating.toFixed(1)} out of 5 stars"
            >
              <small>${p.rating.toFixed(1)} / 5</small>
            </span>
          </div>

          <div class="product-card-actions">
            <a
              href="product-details.html?id=${encodeURIComponent(p.id)}"
              class="btn btn-primary btn-sm"
            >
              View Product
            </a>

            <a href="supplier-details.html?id=${encodeURIComponent(supplierId)}" class="btn btn-outline btn-sm">
              View Supplier
            </a>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Initializes Advanced Product Search & Supplier Filters
   */
  function initProductSearch() {
    const searchForm = document.querySelector(".search-filter-form");
    const searchInput = document.getElementById("product-search-input");
    const suggestionsDropdown = document.getElementById("product-search-suggestions");
    const searchBtn = document.querySelector(".btn-search");
    const applyFiltersBtn = searchForm ? searchForm.querySelector("button[type='submit']:not(.btn-search)") : null;
    const clearFiltersBtn = searchForm ? searchForm.querySelector("button[type='reset']") : null;
    const productsGrid = document.querySelector(".products-grid");
    const countBadge = document.getElementById("products-count-badge");
    const sortSelect = document.getElementById("sort-products");

    // Filter controls
    const filterCategory = document.getElementById("filter-category");
    const filterLocation = document.getElementById("filter-location");
    const filterPriceMin = document.getElementById("filter-price-min");
    const filterPriceMax = document.getElementById("filter-price-max");
    const filterVerification = document.getElementById("filter-verification");
    const filterTrust = document.getElementById("filter-trust-score");
    const filterAvailability = document.getElementById("filter-availability");
    const filterDelivery = document.getElementById("filter-delivery-time");
    const filterMoq = document.getElementById("filter-moq");
    const filterRating = document.getElementById("filter-rating");

    // Validation error elements
    const priceErrorEl = document.getElementById("filter-price-error");
    const moqErrorEl = document.getElementById("filter-moq-error");

    if (!productsGrid) return;

    // Load and render all products
    const allProducts = getAllProducts();

    // Populate extra available locations from supplier data if practical
    if (filterLocation) {
      const existingValues = new Set(Array.from(filterLocation.options).map(o => o.value.toLowerCase()));
      const availableLocations = new Set();
      allProducts.forEach(p => {
        if (p.location) {
          const city = p.location.split(",")[0].trim();
          const slug = city.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (slug && !existingValues.has(slug)) {
            availableLocations.add(JSON.stringify({ value: slug, label: p.location }));
          }
        }
      });
      availableLocations.forEach(itemStr => {
        const item = JSON.parse(itemStr);
        const opt = document.createElement("option");
        opt.value = item.value;
        opt.textContent = item.label;
        filterLocation.appendChild(opt);
      });
    }

    // Initial render of all products into grid
    function renderProductGrid(productsToDisplay) {
      productsGrid.innerHTML = productsToDisplay.map(renderProductCardHtml).join("");
    }

    renderProductGrid(allProducts);

    // Dynamic Autocomplete Suggestions
    let activeSuggestionIndex = -1;

    function updateSuggestions() {
      if (!suggestionsDropdown || !searchInput) return;
      const query = searchInput.value.trim();

      if (!query) {
        suggestionsDropdown.style.display = "none";
        suggestionsDropdown.innerHTML = "";
        activeSuggestionIndex = -1;
        return;
      }

      const cleanQ = query.toLowerCase();

      const matched = allProducts.filter(p => {
        const matchSup = p.supplierName && p.supplierName.toLowerCase().includes(cleanQ);
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
        activeSuggestionIndex = -1;
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
        const thumbFallback = getDefaultProductImage(p.category, p.name);
        return `
          <a class="search-suggestion-item" data-index="${idx}" data-product-id="${escapeHtml(p.id)}" href="product-details.html?id=${encodeURIComponent(p.id)}">
            <img class="search-suggestion-thumb" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.onerror=null; this.src='${thumbFallback}';" />
            <div class="search-suggestion-info">
              <div class="search-suggestion-name">${highlightMatch(p.name, query)}</div>
              <div class="search-suggestion-meta">
                <span>${escapeHtml(p.category)}</span>
                <span>&bull;</span>
                <span>By ${escapeHtml(p.supplierName)}</span>
                <span>&bull;</span>
                <strong>₹${p.price.toLocaleString("en-IN")}</strong>
              </div>
            </div>
            <span class="search-suggestion-badge">View &rarr;</span>
          </a>
        `;
      }).join("");

      suggestionsDropdown.style.display = "block";
      activeSuggestionIndex = -1;
    }

    if (searchInput) {
      searchInput.addEventListener("input", updateSuggestions);
      searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim()) updateSuggestions();
      });

      searchInput.addEventListener("keydown", (e) => {
        if (suggestionsDropdown && suggestionsDropdown.style.display !== "none") {
          const items = suggestionsDropdown.querySelectorAll(".search-suggestion-item");
          if (e.key === "ArrowDown") {
            e.preventDefault();
            activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
            updateActiveSuggestionItem(items);
            return;
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
            updateActiveSuggestionItem(items);
            return;
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeSuggestionIndex >= 0 && items[activeSuggestionIndex]) {
              const pid = items[activeSuggestionIndex].getAttribute("data-product-id");
              if (pid) {
                window.location.href = `product-details.html?id=${encodeURIComponent(pid)}`;
                return;
              }
            }
            suggestionsDropdown.style.display = "none";
            applyFilters();
            return;
          } else if (e.key === "Escape") {
            suggestionsDropdown.style.display = "none";
            return;
          }
        } else if (e.key === "Enter") {
          e.preventDefault();
          applyFilters();
        }
      });
    }

    function updateActiveSuggestionItem(items) {
      items.forEach((item, idx) => {
        item.classList.toggle("is-active", idx === activeSuggestionIndex);
        if (idx === activeSuggestionIndex) {
          item.scrollIntoView({ block: "nearest" });
        }
      });
    }

    document.addEventListener("click", (e) => {
      if (searchInput && suggestionsDropdown) {
        if (!searchInput.contains(e.target) && !suggestionsDropdown.contains(e.target)) {
          suggestionsDropdown.style.display = "none";
        }
      }
    });

    /**
     * Match product against all active filter parameters with AND logic
     */
    function testProductMatch(p, criteria) {
      // A. Search Keywords: name, description, brand/supplierName, category, sku, or multi-word tokens
      if (criteria.query) {
        const q = criteria.query.toLowerCase();
        const pName = (p.name || "").toLowerCase();
        const pDesc = (p.description || "").toLowerCase();
        const pSup = (p.supplierName || "").toLowerCase();
        const pCat = (p.category || "").toLowerCase();
        const pSku = (p.sku || "").toLowerCase();

        const singleMatch = pName.includes(q) || pDesc.includes(q) || pSup.includes(q) || pCat.includes(q) || pSku.includes(q);

        if (!singleMatch) {
          const tokens = q.split(/\s+/).filter(t => t.length > 1);
          const fullText = `${pName} ${pDesc} ${pSup} ${pCat} ${pSku}`;
          const multiMatch = tokens.length > 1 && tokens.every(token => fullText.includes(token));
          if (!multiMatch) return false;
        }
      }

      // B. Category Filter
      if (criteria.category) {
        const catVal = criteria.category.toLowerCase();
        const pCat = (p.category || "").toLowerCase();

        const CAT_MAP = {
          "electronics": ["electronic", "electrical", "semiconductor", "led"],
          "textiles-garments": ["textile", "garment", "fabric", "cotton", "apparel"],
          "food-beverages": ["food", "beverage", "catering", "produce", "packaging materials"],
          "industrial-equipment": ["industrial", "equipment", "supplies", "safety", "fastener", "tool"],
          "packaging": ["packaging", "box", "crate", "foam", "shipping"],
          "raw-materials": ["raw", "material", "polymer", "starch", "biodegradable"],
          "office-supplies": ["office", "supplies", "stationery", "paper", "organizer", "chair"],
          "machinery": ["machinery", "milling", "cutter", "cnc", "tooling", "shelving"],
          "chemicals": ["chemical", "polymer", "resin"],
          "home-commercial": ["home", "commercial", "furniture", "lighting"]
        };

        const targetKeywords = CAT_MAP[catVal] || [catVal.replace(/-/g, " ")];
        const matchesCategory = targetKeywords.some(kw => pCat.includes(kw));
        if (!matchesCategory) return false;
      }

      // C. Supplier Location
      if (criteria.location) {
        const locVal = criteria.location.toLowerCase();
        const pLoc = (p.location || "").toLowerCase();
        if (!pLoc.includes(locVal)) return false;
      }

      // D. Price Range (₹)
      if (criteria.minPrice > 0 && p.price < criteria.minPrice) {
        return false;
      }
      if (criteria.maxPrice < Infinity && p.price > criteria.maxPrice) {
        return false;
      }

      // E. Supplier Verification
      if (criteria.verification) {
        const verVal = criteria.verification.toLowerCase();
        const pVer = (p.verificationStatus || "").toLowerCase();
        const isPremium = pVer.includes("premium") || (p.trustScore >= 95 && pVer.includes("verified"));

        if (verVal === "verified-only") {
          if (!pVer.includes("verified") && !isPremium) return false;
        } else if (verVal === "premium-certified") {
          if (!isPremium) return false;
        }
      }

      // F. Minimum Trust Score
      if (criteria.minTrust > 0) {
        if ((p.trustScore || 0) < criteria.minTrust) return false;
      }

      // G. Product Availability
      if (criteria.availability) {
        const availVal = criteria.availability.toLowerCase();
        const pAvail = (p.availability || "").toLowerCase();
        const hasStock = p.stock > 0;

        if (availVal === "in-stock") {
          if (!hasStock || pAvail.includes("out of stock")) return false;
        } else if (availVal === "made-to-order") {
          if (hasStock && !pAvail.includes("order") && !pAvail.includes("request")) return false;
        }
      }

      // H. Max Delivery Time
      if (criteria.maxDeliveryTime < Infinity) {
        const pDays = p.deliveryDays || 999;
        if (pDays > criteria.maxDeliveryTime) return false;
      }

      // I. Max Minimum Order Quantity (MOQ)
      if (criteria.maxMoq < Infinity) {
        if (p.moq > criteria.maxMoq) return false;
      }

      // J. Minimum Rating
      if (criteria.minRating > 0) {
        if ((p.rating || 0) < criteria.minRating) return false;
      }

      return true;
    }

    /**
     * Validates input fields and returns parsed filter values
     */
    function getFilterCriteria() {
      let isValid = true;

      // Clear previous validation messages
      if (priceErrorEl) {
        priceErrorEl.textContent = "";
        priceErrorEl.style.display = "none";
      }
      if (moqErrorEl) {
        moqErrorEl.textContent = "";
        moqErrorEl.style.display = "none";
      }

      // Search Keywords
      const query = (searchInput?.value || "").trim();

      // Category & Location
      const category = (filterCategory?.value || "").trim();
      const location = (filterLocation?.value || "").trim();

      // Price Range Validation
      let minPrice = 0;
      let maxPrice = Infinity;
      const rawMinPrice = filterPriceMin?.value ? filterPriceMin.value.trim() : "";
      const rawMaxPrice = filterPriceMax?.value ? filterPriceMax.value.trim() : "";

      if (rawMinPrice !== "") {
        const val = parseFloat(rawMinPrice);
        if (isNaN(val) || val < 0) {
          if (priceErrorEl) {
            priceErrorEl.textContent = "Price cannot be negative.";
            priceErrorEl.style.display = "block";
          }
          isValid = false;
        } else {
          minPrice = val;
        }
      }

      if (rawMaxPrice !== "") {
        const val = parseFloat(rawMaxPrice);
        if (isNaN(val) || val < 0) {
          if (priceErrorEl) {
            priceErrorEl.textContent = "Price cannot be negative.";
            priceErrorEl.style.display = "block";
          }
          isValid = false;
        } else {
          maxPrice = val;
        }
      }

      if (rawMinPrice !== "" && rawMaxPrice !== "" && minPrice > maxPrice) {
        if (priceErrorEl) {
          priceErrorEl.textContent = `Minimum price (₹${minPrice}) cannot exceed maximum price (₹${maxPrice}).`;
          priceErrorEl.style.display = "block";
        }
        isValid = false;
      }

      // Supplier Verification
      const verification = (filterVerification?.value || "").trim();

      // Trust Score
      const minTrust = filterTrust?.value ? parseFloat(filterTrust.value) || 0 : 0;

      // Product Availability
      const availability = (filterAvailability?.value || "").trim();

      // Max Delivery Time
      const maxDeliveryTime = filterDelivery?.value ? parseFloat(filterDelivery.value) || Infinity : Infinity;

      // Max MOQ Validation
      let maxMoq = Infinity;
      const rawMoq = filterMoq?.value ? filterMoq.value.trim() : "";
      if (rawMoq !== "") {
        const val = parseFloat(rawMoq);
        if (isNaN(val) || val <= 0 || !Number.isInteger(val)) {
          if (moqErrorEl) {
            moqErrorEl.textContent = "MOQ must be a positive whole number.";
            moqErrorEl.style.display = "block";
          }
          isValid = false;
        } else {
          maxMoq = val;
        }
      }

      // Minimum Rating
      const minRating = filterRating?.value ? parseFloat(filterRating.value) || 0 : 0;

      return {
        isValid,
        query,
        category,
        location,
        minPrice,
        maxPrice,
        verification,
        minTrust,
        availability,
        maxDeliveryTime,
        maxMoq,
        minRating
      };
    }

    /**
     * Executes the filtered search and updates the product cards in .products-grid
     */
    function applyFilters() {
      if (suggestionsDropdown) {
        suggestionsDropdown.style.display = "none";
      }

      const criteria = getFilterCriteria();
      if (!criteria.isValid) {
        return;
      }

      // Filter products
      let matchingProducts = allProducts.filter(p => testProductMatch(p, criteria));

      // Apply Sort if selected
      if (sortSelect) {
        const sortVal = sortSelect.value;
        if (sortVal === "price-low") {
          matchingProducts.sort((a, b) => a.price - b.price);
        } else if (sortVal === "price-high") {
          matchingProducts.sort((a, b) => b.price - a.price);
        } else if (sortVal === "rating") {
          matchingProducts.sort((a, b) => b.rating - a.rating);
        } else if (sortVal === "trust-score") {
          matchingProducts.sort((a, b) => b.trustScore - a.trustScore);
        } else if (sortVal === "newest") {
          matchingProducts.sort((a, b) => b.id.localeCompare(a.id));
        }
      }

      // Render matching products or empty state
      if (matchingProducts.length > 0) {
        renderProductGrid(matchingProducts);
        if (countBadge) {
          countBadge.textContent = `Showing ${matchingProducts.length} product${matchingProducts.length === 1 ? '' : 's'}`;
        }
      } else {
        renderEmptyState();
        if (countBadge) {
          countBadge.textContent = "0 products found";
        }
      }
    }

    // Displays clear, beautiful empty state with reset button
    function renderEmptyState() {
      productsGrid.innerHTML = `
        <div class="grid-empty-state" style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; background: #ffffff; border: 1px dashed #d5cec5; border-radius: 12px; margin: 20px 0;">
          <div style="font-size: 2.2rem; margin-bottom: 12px;">🔍</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: #111111;">No matching products found</h3>
          <p style="color: #666666; margin-bottom: 20px; max-width: 480px; margin-left: auto; margin-right: auto; font-size: 0.95rem;">
            No products match your selected filters. Try changing your search criteria.
          </p>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-reset-empty-filters">Clear All Filters</button>
        </div>
      `;

      const resetBtn = productsGrid.querySelector("#btn-reset-empty-filters");
      if (resetBtn) {
        resetBtn.addEventListener("click", resetAllFilters);
      }
    }

    // Resets all filters back to default values and restores full catalog
    function resetAllFilters() {
      if (searchInput) searchInput.value = "";
      if (filterCategory) filterCategory.value = "";
      if (filterLocation) filterLocation.value = "";
      if (filterPriceMin) filterPriceMin.value = "";
      if (filterPriceMax) filterPriceMax.value = "";
      if (filterVerification) filterVerification.value = "";
      if (filterTrust) filterTrust.value = "";
      if (filterAvailability) filterAvailability.value = "";
      if (filterDelivery) filterDelivery.value = "";
      if (filterMoq) filterMoq.value = "";
      if (filterRating) filterRating.value = "";
      if (sortSelect) sortSelect.value = "relevance";

      if (priceErrorEl) {
        priceErrorEl.textContent = "";
        priceErrorEl.style.display = "none";
      }
      if (moqErrorEl) {
        moqErrorEl.textContent = "";
        moqErrorEl.style.display = "none";
      }
      if (suggestionsDropdown) {
        suggestionsDropdown.style.display = "none";
      }

      renderProductGrid(allProducts);
      if (countBadge) {
        countBadge.textContent = `Showing all ${allProducts.length} products`;
      }
      showSearchToast("All filters cleared.");
    }

    // Event Listeners for search & filter triggers
    if (searchBtn) {
      searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        applyFilters();
      });
    }

    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        applyFilters();
      });
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", (e) => {
        e.preventDefault();
        resetAllFilters();
      });
    }

    // Sort control listener
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        applyFilters();
      });
    }

    // Real-time input listeners to clear validation errors when user types valid values
    if (filterPriceMin) {
      filterPriceMin.addEventListener("input", () => {
        if (priceErrorEl && priceErrorEl.style.display !== "none") {
          const min = parseFloat(filterPriceMin.value) || 0;
          const max = parseFloat(filterPriceMax?.value) || Infinity;
          if (min >= 0 && min <= max) {
            priceErrorEl.style.display = "none";
          }
        }
      });
    }

    if (filterPriceMax) {
      filterPriceMax.addEventListener("input", () => {
        if (priceErrorEl && priceErrorEl.style.display !== "none") {
          const min = parseFloat(filterPriceMin?.value) || 0;
          const max = parseFloat(filterPriceMax.value) || Infinity;
          if (max >= 0 && min <= max) {
            priceErrorEl.style.display = "none";
          }
        }
      });
    }

    if (filterMoq) {
      filterMoq.addEventListener("input", () => {
        if (moqErrorEl && moqErrorEl.style.display !== "none") {
          const val = parseFloat(filterMoq.value);
          if (val > 0 && Number.isInteger(val)) {
            moqErrorEl.style.display = "none";
          }
        }
      });
    }

    // Category Cards in Browse Product Categories section
    document.querySelectorAll(".category-card .category-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const card = link.closest(".category-card");
        const title = card?.querySelector(".category-title")?.textContent.trim();
        if (!title || !filterCategory) return;

        for (let i = 0; i < filterCategory.options.length; i++) {
          const optText = filterCategory.options[i].text.toLowerCase();
          const tText = title.toLowerCase();
          if (optText.includes(tText) || tText.includes(optText)) {
            filterCategory.selectedIndex = i;
            break;
          }
        }

        applyFilters();

        const listingHeading = document.getElementById("products-listing-heading");
        if (listingHeading) {
          listingHeading.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // Check URL parameters for direct queries on page load
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get("query") || urlParams.get("q") || urlParams.get("search") || urlParams.get("name");
    const initialCat = urlParams.get("category");
    const initialLoc = urlParams.get("location");

    let hasUrlFilter = false;
    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
      hasUrlFilter = true;
    }
    if (initialCat && filterCategory) {
      filterCategory.value = initialCat;
      hasUrlFilter = true;
    }
    if (initialLoc && filterLocation) {
      filterLocation.value = initialLoc;
      hasUrlFilter = true;
    }

    if (hasUrlFilter) {
      applyFilters();
    } else {
      if (countBadge) {
        countBadge.textContent = `Showing all ${allProducts.length} products`;
      }
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProductSearch);
  } else {
    initProductSearch();
  }
})();
