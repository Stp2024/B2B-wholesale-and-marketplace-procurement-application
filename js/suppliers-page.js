/**
 * TradeNest — Suppliers Page Search & Directory Script (js/suppliers-page.js)
 * Enables live searching, filtering, and product previews for suppliers (including ABC Traders).
 */

(function () {
  "use strict";

  const BASE_SUPPLIERS = [
    {
      id: "supplier-abc",
      businessName: "ABC Traders",
      altNames: ["ABC Treaders", "ABC Trade", "ABC Traders Pvt Ltd"],
      category: "Industrial Equipment",
      location: "Bengaluru, Karnataka",
      description: "Premier certified wholesale supplier of industrial safety equipment, heavy-duty toolkits, and commercial warehouse supplies across India.",
      verificationStatus: "Business Verified",
      trustScore: 96,
      rating: 4.9,
      responseTime: "Within 2 Hours",
      moq: "Medium (100 - 1000 units)",
      delivery: "Domestic Shipping",
      logo: "../images/suppliers/supplier-placeholder11.webp",
      productIds: ["product-abc-001", "product-abc-002", "product-abc-003"]
    },
    {
      id: "supplier-001",
      businessName: "Apex Gear Co.",
      altNames: ["Apex Safety Solutions Pvt Ltd"],
      category: "Industrial Equipment",
      location: "Bengaluru, Karnataka",
      description: "Manufacturer and exporter of high-precision industrial components, specialized machinery parts, and custom mechanical assemblies.",
      verificationStatus: "Business Verified",
      trustScore: 92,
      rating: 4.9,
      responseTime: "Within 12 Hours",
      moq: "Medium (100 - 1000 units)",
      delivery: "Domestic Shipping",
      logo: "../images/suppliers/supplier-placeholder11.webp",
      productIds: ["product-001", "product-002"]
    },
    {
      id: "supplier-002",
      businessName: "PaperPro Solutions",
      altNames: [],
      category: "Office Supplies",
      location: "Mumbai, Maharashtra",
      description: "Leading corporate supplier of premium copy paper, workspace organizers, and commercial stationery products.",
      verificationStatus: "Business Verified",
      trustScore: 88,
      rating: 4.7,
      responseTime: "Within 24 Hours",
      moq: "Low (< 100 units)",
      delivery: "Domestic Shipping",
      logo: "../images/suppliers/supplier-placeholder12.webp",
      productIds: ["product-003", "product-004"]
    },
    {
      id: "supplier-003",
      businessName: "Lumina Electric",
      altNames: [],
      category: "Electronics",
      location: "Delhi NCR",
      description: "Commercial lighting, commercial grade LED panel fixtures, drivers, and industrial electrical equipment.",
      verificationStatus: "Business Verified",
      trustScore: 94,
      rating: 4.8,
      responseTime: "Within 12 Hours",
      moq: "Low (< 100 units)",
      delivery: "Express Freight",
      logo: "../images/suppliers/supplier-placeholder13.webp",
      productIds: ["product-005", "product-010"]
    },
    {
      id: "supplier-004",
      businessName: "PackRight Corp.",
      altNames: [],
      category: "Packaging",
      location: "Ahmedabad, Gujarat",
      description: "Specialized manufacturer of multi-wall corrugated boxes, protective foam cushioning, and shipping packaging.",
      verificationStatus: "Business Verified",
      trustScore: 86,
      rating: 4.5,
      responseTime: "Within 24 Hours",
      moq: "Medium (100 - 1000 units)",
      delivery: "Domestic Shipping",
      logo: "../images/suppliers/supplier-placeholder14.webp",
      productIds: ["product-006", "product-007"]
    },
    {
      id: "supplier-005",
      businessName: "SteelCraft Ltd.",
      altNames: [],
      category: "Machinery",
      location: "Pune, Maharashtra",
      description: "Heavy-duty warehouse rack shelving, industrial fabrication systems, and material handling solutions.",
      verificationStatus: "Business Verified",
      trustScore: 90,
      rating: 4.9,
      responseTime: "Within 24 Hours",
      moq: "Low (< 100 units)",
      delivery: "Express Freight",
      logo: "../images/suppliers/supplier-placeholder15.webp",
      productIds: ["product-008"]
    },
    {
      id: "supplier-006",
      businessName: "Vardhman Weaves & Tex",
      altNames: [],
      category: "Textiles & Garments",
      location: "Ahmedabad, Gujarat",
      description: "Bulk pure combed cotton fabrics, commercial textiles, and raw garment rolls for manufacturing enterprises.",
      verificationStatus: "Business Verified",
      trustScore: 89,
      rating: 4.9,
      responseTime: "Within 12 Hours",
      moq: "Bulk (> 1000 units)",
      delivery: "Domestic Shipping",
      logo: "../images/suppliers/supplier-placeholder16.webp",
      productIds: ["product-009"]
    }
  ];

  function getCombinedSuppliers() {
    const list = [...BASE_SUPPLIERS];
    const seen = new Set(list.map(s => s.id));

    if (window.TradeNestStore && typeof window.TradeNestStore.getStore === "function") {
      try {
        const profiles = window.TradeNestStore.getStore().supplierProfiles || [];
        profiles.forEach(p => {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            list.push({
              id: p.id,
              businessName: p.businessName,
              altNames: p.altNames || [],
              category: p.category || "Industrial Equipment",
              location: p.location || "India",
              description: p.description || "",
              verificationStatus: p.verificationStatus || "Pending Verification",
              trustScore: (p.trustScore !== undefined && p.trustScore !== null) ? Number(p.trustScore) : 0,
              rating: (p.rating !== undefined && p.rating !== null) ? Number(p.rating) : 0.0,
              responseTime: "Within 24 Hours",
              moq: "Medium (100 - 1000 units)",
              delivery: "Domestic Shipping",
              logo: "../images/suppliers/supplier-placeholder11.webp",
              productIds: p.products || []
            });
          }
        });
      } catch (e) {}
    }

    // Include registered suppliers from tradenestUsers and current user session
    try {
      const stored = JSON.parse(localStorage.getItem("tradenestUsers") || "[]");
      const cur = JSON.parse(localStorage.getItem("tradenestCurrentUser") || "null");
      const candidates = Array.isArray(stored) ? [...stored] : [];
      if (cur) candidates.push(cur);

      candidates.forEach(u => {
        if (u && (u.role === "supplier" || u.accountType === "supplier" || u.isNewSupplier || String(u.id || "").startsWith("TN-"))) {
          const id = u.supplierId || u.id;
          if (id && !seen.has(id)) {
            seen.add(id);
            const bName = (u.business && u.business.name) || u.businessName || u.fullName || "Verified Supplier Co.";
            const cat = (u.business && u.business.category) || u.category || "Industrial Equipment";
            const loc = u.address ? `${u.address.city || ""}, ${u.address.state || ""}`.replace(/^,\s*|,\s*$/g, "") || "India" : (u.city || u.location || "India");
            const desc = u.description || (u.business && u.business.name ? `${u.business.name} is a verified wholesale supplier on TradeNest.` : "Verified wholesale supplier on TradeNest.");

            list.push({
              id: id,
              businessName: bName,
              altNames: [],
              category: cat,
              location: loc,
              description: desc,
              verificationStatus: u.verificationStatus || "Pending Verification",
              trustScore: (u.trustScore !== undefined && u.trustScore !== null) ? Number(u.trustScore) : 0,
              rating: (u.rating !== undefined && u.rating !== null) ? Number(u.rating) : 0.0,
              responseTime: "Within 24 Hours",
              moq: "Medium (100 - 1000 units)",
              delivery: "Domestic Shipping",
              logo: "../images/suppliers/supplier-placeholder11.webp",
              productIds: []
            });
          }
        }
      });
    } catch (e) {}

    return list;
  }

  function getProductsForSupplier(supplier) {
    const products = [];
    const seenPids = new Set();

    function matchSup(p) {
      if (!p) return false;
      if (p.supplierId && p.supplierId === supplier.id) return true;
      const sName = (supplier.businessName || "").toLowerCase();
      const pName = (p.supplierName || "").toLowerCase();
      if (pName && pName === sName) return true;
      if (supplier.altNames && supplier.altNames.some(a => a.toLowerCase() === pName)) return true;
      if (sName && pName && (pName.includes(sName) || sName.includes(pName))) return true;
      if (supplier.productIds && supplier.productIds.includes(p.id)) return true;
      return false;
    }

    if (window.TradeNestProductService && typeof window.TradeNestProductService.getProductsSync === "function") {
      try {
        const svcProds = window.TradeNestProductService.getProductsSync({ includeAllStatuses: true }) || [];
        svcProds.forEach(p => {
          if (matchSup(p) && !seenPids.has(p.id)) {
            seenPids.add(p.id);
            products.push(p);
          }
        });
      } catch (e) {}
    }

    if (window.TradeNestStore && typeof window.TradeNestStore.getStore === "function") {
      try {
        const storeProds = window.TradeNestStore.getStore().products || [];
        storeProds.forEach(p => {
          if (matchSup(p) && !seenPids.has(p.id)) {
            seenPids.add(p.id);
            products.push(p);
          }
        });
      } catch (e) {}
    }

    // 3. Guaranteed Canonical Fallback
    CANONICAL_SUPPLIER_PRODUCTS.forEach(p => {
      if (matchSup(p) && !seenPids.has(p.id)) {
        seenPids.add(p.id);
        products.push(p);
      }
    });

    // 4. Also check localStorage for supplier-specific product store
    try {
      const supKey = `tradenest_supplier_products_${supplier.id}`;
      const raw = localStorage.getItem(supKey) || (supplier.id === "supplier-001" ? localStorage.getItem("tradenest_supplier_products") : null);
      if (raw) {
        const stored = JSON.parse(raw);
        if (Array.isArray(stored)) {
          stored.forEach(p => {
            if (p && p.id && !seenPids.has(p.id)) {
              seenPids.add(p.id);
              products.push(p);
            }
          });
        }
      }
    } catch (e) {}

    return products;
  }

  const CANONICAL_SUPPLIER_PRODUCTS = [
    {
      id: "product-abc-001",
      name: "ABC Heavy-Duty Industrial Tool Kit",
      category: "Industrial Equipment",
      price: 2450,
      moq: 10,
      image: "../images/products/mechanics-tool-kit.webp",
      supplierName: "ABC Traders",
      supplierId: "supplier-abc",
      description: "Professional grade 120-piece chrome vanadium alloy steel toolkit for plant maintenance and heavy manufacturing by ABC Traders."
    },
    {
      id: "product-abc-002",
      name: "ABC High-Grip Safety Work Gloves",
      category: "Industrial Equipment",
      price: 195,
      moq: 200,
      image: "../images/products/high-grip-work-gloves.webp",
      supplierName: "ABC Traders",
      supplierId: "supplier-abc",
      description: "Premium level-5 cut resistant industrial work gloves with reinforced micro-foam nitrile coating manufactured by ABC Traders."
    },
    {
      id: "product-abc-003",
      name: "ABC Premium Wholesale Storage Crates",
      category: "Packaging",
      price: 680,
      moq: 25,
      image: "../images/products/industrial-storage-crates.webp",
      supplierName: "ABC Traders",
      supplierId: "supplier-abc",
      description: "High-density polyethylene heavy-duty stackable industrial storage crates for distribution centers and warehouse logistics by ABC Traders."
    },
    {
      id: "product-001",
      name: "Industrial Safety Gloves",
      category: "Industrial Equipment",
      price: 180,
      moq: 500,
      image: "../images/products/industrial-safety-gloves.webp",
      supplierName: "Apex Gear Co.",
      supplierId: "supplier-001"
    },
    {
      id: "product-002",
      name: "Industrial Safety Helmets",
      category: "Industrial Equipment",
      price: 520,
      moq: 200,
      image: "../images/products/industrial-safety-helmets.webp",
      supplierName: "Apex Gear Co.",
      supplierId: "supplier-001"
    },
    {
      id: "product-003",
      name: "A4 Premium Copy Paper",
      category: "Office Supplies",
      price: 420,
      moq: 50,
      image: "../images/products/a4-premium-copy-paper.webp",
      supplierName: "PaperPro Solutions",
      supplierId: "supplier-002"
    },
    {
      id: "product-005",
      name: "Commercial LED Panel Lights",
      category: "Electronics",
      price: 1650,
      moq: 20,
      image: "../images/products/commercial-led-panel-lights.webp",
      supplierName: "Lumina Electric",
      supplierId: "supplier-003"
    },
    {
      id: "product-006",
      name: "Corrugated Packaging Boxes",
      category: "Packaging",
      price: 55,
      moq: 500,
      image: "../images/products/corrugated-packaging-boxes.webp",
      supplierName: "PackRight Corp.",
      supplierId: "supplier-004"
    },
    {
      id: "product-008",
      name: "Heavy Duty Warehouse Shelving",
      category: "Machinery",
      price: 5300,
      moq: 5,
      image: "../images/products/warehouse-shelving-rack.webp",
      supplierName: "SteelCraft Ltd.",
      supplierId: "supplier-005"
    },
    {
      id: "product-009",
      name: "Cotton Fabric Rolls",
      category: "Textiles & Garments",
      price: 145,
      moq: 1000,
      image: "../images/products/cotton-fabric-rolls.webp",
      supplierName: "Vardhman Weaves & Tex",
      supplierId: "supplier-006"
    },
    {
      id: "product-013",
      name: "Carbide CNC Milling Cutters",
      category: "Machinery",
      price: 1150,
      moq: 25,
      image: "../images/products/featured-cnc-milling-cutters.webp",
      supplierName: "Precision Tooling Works",
      supplierId: "supplier-008"
    },
    {
      id: "product-014",
      name: "Biodegradable Trash Bags",
      category: "Packaging",
      price: 210,
      moq: 100,
      image: "../images/products/featured-biodegradable-polymers.webp",
      supplierName: "GreenChem Polymers Corp.",
      supplierId: "supplier-009"
    },
    {
      id: "product-015",
      name: "Commercial Ergonomic Office Chairs",
      category: "Office Supplies",
      price: 4850,
      moq: 20,
      image: "../images/products/featured-office-ergonomic-chairs.webp",
      supplierName: "UrbanWork Office Systems",
      supplierId: "supplier-010"
    }
  ];

  function escapeHtml(str) {
    const el = document.createElement("div");
    el.textContent = String(str || "");
    return el.innerHTML;
  }

  function renderSupplierCards(filteredList, container) {
    if (!container) return;

    if (filteredList.length === 0) {
      container.innerHTML = `
        <div class="empty-state-suppliers" style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; background: #ffffff; border: 1px dashed #d5cec5; border-radius: 12px; margin: 20px 0;">
          <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; color: #111111;">No matching suppliers found</h3>
          <p style="color: #666666; margin-bottom: 16px;">Try adjusting your company search keywords or clearing filter parameters.</p>
          <button class="btn btn-secondary btn-sm" id="btn-reset-supplier-search">Reset Supplier Search</button>
        </div>
      `;
      const resetBtn = container.querySelector("#btn-reset-supplier-search");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          const form = document.querySelector(".supplier-search-form");
          if (form) form.reset();
          renderSupplierCards(getCombinedSuppliers(), container);
        });
      }
      return;
    }

    container.innerHTML = filteredList.map(supplier => {
      const prods = getProductsForSupplier(supplier);
      const prodPreviewHtml = prods.length > 0
        ? `
          <div class="supplier-products-preview" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #f0ece3;">
            <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #555555; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
              <span>Products (${prods.length})</span>
              <a href="supplier-details.html?id=${encodeURIComponent(supplier.id)}" style="font-size: 0.78rem; text-decoration: none; color: #000000; font-weight: 700;">View All Products &rarr;</a>
            </div>
            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
              ${prods.slice(0, 3).map(p => {
                let img = p.image;
                const rawImgStr = String(img || "").toLowerCase();
                const nm = String(p.name || "").toLowerCase();
                const cat = String(p.category || "").toLowerCase();
                const isGloveProduct = nm.includes("glove") || nm.includes("mitt");
                const isGloveImage = rawImgStr.includes("glove") || rawImgStr.includes("safety-gloves");

                if (!img || rawImgStr.includes("placeholder") || (isGloveImage && !isGloveProduct)) {
                  if (nm.includes("tool") || nm.includes("drill") || nm.includes("wrench") || nm.includes("mechanic")) img = "../images/products/mechanics-tool-kit.webp";
                  else if (nm.includes("crate") || nm.includes("bin") || nm.includes("storage")) img = "../images/products/industrial-storage-crates.webp";
                  else if (nm.includes("chair") || nm.includes("seating") || nm.includes("ergonomic") || (cat.includes("office") && nm.includes("furniture"))) img = "../images/products/featured-office-ergonomic-chairs.webp";
                  else if (nm.includes("trash") || nm.includes("bag") || nm.includes("polymer") || nm.includes("biodegradable")) img = "../images/products/featured-biodegradable-polymers.webp";
                  else if (nm.includes("cnc") || nm.includes("milling") || nm.includes("cutter") || (cat.includes("machin") && !nm.includes("shelv"))) img = "../images/products/featured-cnc-milling-cutters.webp";
                  else if (nm.includes("helmet") || nm.includes("hat")) img = "../images/products/industrial-safety-helmets.webp";
                  else if (nm.includes("shelv") || nm.includes("rack")) img = "../images/products/warehouse-shelving-rack.webp";
                  else if (isGloveProduct) img = "../images/products/high-grip-work-gloves.webp";
                  else if (nm.includes("organis") || nm.includes("organiz")) img = "../images/products/executive-desk-organizer.webp";
                  else if (nm.includes("foam") || nm.includes("insert")) img = "../images/products/protective-foam-inserts.webp";
                  else if (cat.includes("electric") || cat.includes("light") || nm.includes("led") || nm.includes("bulb")) img = "../images/products/commercial-led-panel-lights.webp";
                  else if (cat.includes("packag") || nm.includes("box") || nm.includes("carton")) img = "../images/products/corrugated-packaging-boxes.webp";
                  else if (cat.includes("office") || nm.includes("paper")) img = "../images/products/a4-premium-copy-paper.webp";
                  else if (cat.includes("textil") || nm.includes("fabric") || nm.includes("cotton")) img = "../images/products/cotton-fabric-rolls.webp";
                  else if (nm.includes("food")) img = "../images/products/food-packaging-materials.webp";
                  else if (nm.includes("steel") || nm.includes("stainless")) img = "../images/products/stainless-steel-components.webp";
                  else img = "../images/products/mechanics-tool-kit.webp";
                }
                if (img.startsWith("/")) img = ".." + img;
                else if (!img.startsWith("../") && !img.startsWith("http") && !img.startsWith("data:")) {
                  img = "../" + img.replace(/^\/+/, "");
                }
                const priceStr = p.price ? `₹${Number(p.price).toLocaleString("en-IN")}` : "Contact";
                return `
                  <a href="product-details.html?id=${encodeURIComponent(p.id)}" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 8px; background: #faf9f5; border: 1px solid #e5e1d6; border-radius: 6px; padding: 6px 10px; font-size: 0.8rem; flex-shrink: 0; max-width: 200px;">
                    <img src="${img}" alt="${escapeHtml(p.name)}" onerror="this.src='../images/TradeNest.webp'" style="width: 28px; height: 28px; object-fit: contain; border-radius: 4px; background: #ffffff;" />
                    <div style="overflow: hidden;">
                      <div style="font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #111111;">${escapeHtml(p.name)}</div>
                      <div style="color: #666666; font-size: 0.75rem;">${priceStr}</div>
                    </div>
                  </a>
                `;
              }).join("")}
            </div>
          </div>
        `
        : `
          <div style="margin-top: 10px; font-size: 0.82rem; color: #777777;">
            No products cataloged yet.
          </div>
        `;

      return `
        <article class="supplier-card" id="${escapeHtml(supplier.id)}" style="background: #ffffff; border: 1px solid #e5e1d6; border-radius: 14px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.04); transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div class="supplier-card-header" style="display: flex; gap: 16px; align-items: flex-start;">
            <div class="supplier-logo-wrapper" style="width: 60px; height: 60px; background: #f0ece3; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: #111111; border: 1px solid #d5cec5; flex-shrink: 0;">
              ${escapeHtml(supplier.logo.length <= 4 ? supplier.logo : supplier.businessName.substring(0, 3).toUpperCase())}
            </div>
            <div class="supplier-primary-info" style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <h3 class="supplier-name" style="font-size: 1.25rem; font-weight: 800; color: #111111; margin: 0;">${escapeHtml(supplier.businessName)}</h3>
                ${(supplier.verificationStatus === "Business Verified" || supplier.verificationStatus === "Verified")
                  ? `<span class="badge badge-verified" style="background: #eef7ed; color: #2e7d32; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid #c8e6c9;">${escapeHtml(supplier.verificationStatus)}</span>`
                  : `<span class="badge badge-pending" style="background: #fef3c7; color: #92400e; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid #fde68a;">${escapeHtml(supplier.verificationStatus || "Pending Verification")}</span>`
                }
              </div>
              <p class="supplier-meta" style="color: #666666; font-size: 0.85rem; margin: 4px 0 0;">
                <span class="supplier-industry" style="font-weight: 600;">${escapeHtml(supplier.category)}</span>
                &bull;
                <span class="supplier-location">${escapeHtml(supplier.location)}</span>
              </p>
            </div>
          </div>

          <div class="supplier-card-body" style="margin-top: 14px;">
            <p class="supplier-description" style="color: #444444; font-size: 0.9rem; line-height: 1.5; margin: 0 0 12px;">
              ${escapeHtml(supplier.description)}
            </p>

            <dl class="supplier-metrics-list" style="display: flex; gap: 20px; flex-wrap: wrap; margin: 0; padding: 10px 14px; background: #faf9f5; border-radius: 8px; font-size: 0.85rem;">
              <div>
                <dt style="color: #666666; font-size: 0.75rem; text-transform: uppercase;">Trust Score</dt>
                <dd style="font-weight: 800; color: #111111; margin: 2px 0 0;">${supplier.trustScore} / 100</dd>
              </div>
              <div>
                <dt style="color: #666666; font-size: 0.75rem; text-transform: uppercase;">Rating</dt>
                <dd style="font-weight: 800; color: #111111; margin: 2px 0 0;">${supplier.rating} / 5.0</dd>
              </div>
              <div>
                <dt style="color: #666666; font-size: 0.75rem; text-transform: uppercase;">Delivery</dt>
                <dd style="font-weight: 800; color: #111111; margin: 2px 0 0;">${escapeHtml(supplier.delivery)}</dd>
              </div>
              <div>
                <dt style="color: #666666; font-size: 0.75rem; text-transform: uppercase;">Response</dt>
                <dd style="font-weight: 800; color: #111111; margin: 2px 0 0;">${escapeHtml(supplier.responseTime)}</dd>
              </div>
            </dl>

            ${prodPreviewHtml}
          </div>

          <div class="supplier-card-actions" style="margin-top: 16px; display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="supplier-details.html?id=${encodeURIComponent(supplier.id)}" class="btn btn-primary btn-sm" style="background: #000000; color: #ffffff; padding: 9px 16px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 0.85rem;">
              View Supplier & Products &rarr;
            </a>
            <a href="products.html?query=${encodeURIComponent(supplier.businessName)}" class="btn btn-secondary btn-sm" style="background: #faf9f5; color: #111111; border: 1px solid #d5cec5; padding: 9px 16px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.85rem;">
              Browse Catalogue
            </a>
          </div>
        </article>
      `;
    }).join("");
  }

  function initSuppliersPage() {
    const listContainer = document.querySelector(".supplier-cards-list");
    if (!listContainer) return;

    const allSuppliers = getCombinedSuppliers();

    const form = document.querySelector(".supplier-search-form");
    const companyInput = document.getElementById("search-company");
    const productInput = document.getElementById("search-product");
    const locationSelect = document.getElementById("filter-location");
    const industrySelect = document.getElementById("filter-industry");
    const trustSelect = document.getElementById("filter-trust-score");
    const ratingSelect = document.getElementById("filter-rating");
    const verifiedOnlyBox = form ? form.querySelector("input[name='verified_only']") : null;
    const sortSelect = document.getElementById("supplier-sort");

    function doFilter() {
      const compQ = (companyInput?.value || "").trim().toLowerCase();
      const prodQ = (productInput?.value || "").trim().toLowerCase();
      const locQ = (locationSelect?.value || "").trim().toLowerCase();
      const indQ = (industrySelect?.value || "").trim().toLowerCase();
      const minTrust = parseFloat(trustSelect?.value) || 0;
      const minRating = parseFloat(ratingSelect?.value) || 0;
      const verifiedOnly = verifiedOnlyBox?.checked || false;

      let filtered = allSuppliers.filter(s => {
        // Company search
        if (compQ) {
          const matchName = s.businessName.toLowerCase().includes(compQ);
          const matchAlt = s.altNames && s.altNames.some(alt => alt.toLowerCase().includes(compQ));
          const matchDesc = s.description.toLowerCase().includes(compQ);
          const prods = getProductsForSupplier(s);
          const matchProd = prods.some(p =>
            (p.name && p.name.toLowerCase().includes(compQ)) ||
            (p.category && p.category.toLowerCase().includes(compQ)) ||
            (p.description && p.description.toLowerCase().includes(compQ))
          );
          if (!matchName && !matchAlt && !matchDesc && !matchProd) return false;
        }

        // Product search
        if (prodQ) {
          const prods = getProductsForSupplier(s);
          const matchProd = prods.some(p =>
            (p.name && p.name.toLowerCase().includes(prodQ)) ||
            (p.category && p.category.toLowerCase().includes(prodQ)) ||
            (p.description && p.description.toLowerCase().includes(prodQ))
          );
          const matchCat = s.category.toLowerCase().includes(prodQ);
          if (!matchProd && !matchCat) return false;
        }

        // Location
        if (locQ && !s.location.toLowerCase().includes(locQ)) {
          return false;
        }

        // Industry
        if (indQ && !s.category.toLowerCase().includes(indQ.replace("-", " "))) {
          return false;
        }

        // Trust score
        if (minTrust > 0 && s.trustScore < minTrust) {
          return false;
        }

        // Rating
        if (minRating > 0 && s.rating < minRating) {
          return false;
        }

        return true;
      });

      // Sorting
      const sortVal = sortSelect?.value || "relevance";
      if (sortVal === "trust_score") {
        filtered.sort((a, b) => b.trustScore - a.trustScore);
      } else if (sortVal === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (sortVal === "newest") {
        filtered.sort((a, b) => a.businessName.localeCompare(b.businessName));
      }

      renderSupplierCards(filtered, listContainer);
    }

    // Attach listeners
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        doFilter();
      });
      form.addEventListener("reset", () => {
        setTimeout(() => {
          doFilter();
        }, 10);
      });
    }

    [companyInput, productInput].forEach(inp => {
      if (inp) {
        inp.addEventListener("input", doFilter);
      }
    });

    [locationSelect, industrySelect, trustSelect, ratingSelect, verifiedOnlyBox, sortSelect].forEach(ctrl => {
      if (ctrl) {
        ctrl.addEventListener("change", doFilter);
      }
    });

    // Handle industry category cards clicking
    document.querySelectorAll(".category-card, .category-link").forEach(el => {
      el.addEventListener("click", (e) => {
        const ind = el.getAttribute("data-industry");
        if (ind && industrySelect) {
          industrySelect.value = ind;
          doFilter();
          const target = document.getElementById("supplier-listing");
          if (target) target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // Initial check from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const initialCompany = urlParams.get("company") || urlParams.get("supplier") || urlParams.get("q") || "";
    const initialProduct = urlParams.get("product") || "";
    if (initialCompany && companyInput) {
      companyInput.value = initialCompany;
    }
    if (initialProduct && productInput) {
      productInput.value = initialProduct;
    }

    doFilter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSuppliersPage);
  } else {
    initSuppliersPage();
  }
})();
