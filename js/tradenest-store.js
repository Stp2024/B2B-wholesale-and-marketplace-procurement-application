(function () {
  const STORAGE_KEY = "tradenest_demo_store_v1";
  const CURRENT_USER_KEY = "tradenestCurrentUser";
  const STORE_SCRIPT_URL = document.currentScript ? document.currentScript.src : "";

  const demoBuyer = {
    id: "buyer-001",
    role: "buyer",
    fullName: "Aisha Patel",
    email: "aisha.patel@tradenest.com",
    phone: "+91 98765 43210",
    businessName: "North Star Retail",
    businessType: "Wholesale Buyer",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India"
  };

  const demoSuppliers = [
    {
      id: "supplier-001",
      businessName: "Apex Gear Co.",
      category: "Industrial Equipment",
      location: "Bengaluru",
      description: "Precision industrial safety and warehouse supplies manufacturer.",
      verificationStatus: "Verified",
      trustScore: 92,
      logo: "A",
      products: ["product-001", "product-002"]
    },
    {
      id: "supplier-002",
      businessName: "PaperPro Solutions",
      category: "Office Supplies",
      location: "Mumbai",
      description: "Reliable office stationery and paper distribution partner.",
      verificationStatus: "Verified",
      trustScore: 88,
      logo: "P",
      products: ["product-003", "product-004"]
    },
    {
      id: "supplier-003",
      businessName: "Lumina Electric",
      category: "Electrical",
      location: "Delhi NCR",
      description: "Commercial electrical products and lighting solutions supplier.",
      verificationStatus: "Verified",
      trustScore: 94,
      logo: "L",
      products: ["product-005", "product-010"]
    },
    {
      id: "supplier-004",
      businessName: "PackRight Corp.",
      category: "Packaging",
      location: "Ahmedabad",
      description: "Corrugated and protective packaging manufacturing specialist.",
      verificationStatus: "Verified",
      trustScore: 86,
      logo: "P",
      products: ["product-006", "product-007"]
    },
    {
      id: "supplier-005",
      businessName: "SteelCraft Ltd.",
      category: "Machinery",
      location: "Pune",
      description: "Heavy-duty storage and industrial fabrication solutions.",
      verificationStatus: "Verified",
      trustScore: 90,
      logo: "S",
      products: ["product-008"]
    },
    {
      id: "supplier-006",
      businessName: "Vardhman Weaves & Tex",
      category: "Textiles",
      location: "Coimbatore",
      description: "Bulk cotton fabrics and textile materials for garment and uniform manufacturers.",
      verificationStatus: "Verified",
      trustScore: 89,
      logo: "V",
      products: ["product-009"]
    },
    {
      id: "supplier-007",
      businessName: "BioPack Green Solutions",
      category: "Packaging",
      location: "Ahmedabad",
      description: "Food-service packaging and material options for commercial buyers.",
      verificationStatus: "Verified",
      trustScore: 88,
      logo: "B",
      products: ["product-012"]
    },
    {
      id: "supplier-008",
      businessName: "Precision Tooling Works",
      category: "Machinery",
      location: "Pune",
      description: "Precision cutting tools and consumables for CNC machining operations.",
      verificationStatus: "Verified",
      trustScore: 96,
      logo: "P",
      products: ["product-013"]
    },
    {
      id: "supplier-009",
      businessName: "GreenChem Polymers Corp.",
      category: "Materials",
      location: "Vadodara",
      description: "Biodegradable polymer materials for commercial processing and packaging.",
      verificationStatus: "Verified",
      trustScore: 95,
      logo: "G",
      products: ["product-014"]
    },
    {
      id: "supplier-010",
      businessName: "UrbanWork Office Systems",
      category: "Office Supplies",
      location: "Bengaluru",
      description: "Commercial workspace furniture and ergonomic seating for business offices.",
      verificationStatus: "Verified",
      trustScore: 90,
      logo: "U",
      products: ["product-015"]
    }
  ];

  const demoProducts = [
    {
      id: "product-001",
      name: "Industrial Safety Gloves",
      description: "Heavy-duty cut and heat resistant gloves for warehouse and manufacturing workflows.",
      category: "Industrial Equipment",
      supplierId: "supplier-001",
      supplierName: "Apex Gear Co.",
      price: 180,
      bulkPrice: 165,
      moq: 500,
      stock: 1200,
      unit: "pair",
      availability: "In Stock",
      specifications: "Nitrile coating, palm grip, reinforced stitching, heat resistance up to 350°C",
      image: "/images/products/industrial-safety-gloves.webp"
    },
    {
      id: "product-002",
      name: "Industrial Safety Helmets",
      description: "Impact-resistant hard hats designed to protect crews on construction sites, in warehouses and across industrial facilities.",
      category: "Industrial Equipment",
      supplierId: "supplier-001",
      supplierName: "Apex Gear Co.",
      price: 520,
      bulkPrice: 480,
      moq: 200,
      stock: 760,
      unit: "unit",
      availability: "In Stock",
      specifications: "Durable ABS shell, adjustable 6-point suspension, ratchet fit, chin-strap compatible",
      image: "/images/products/industrial-safety-helmets.webp"
    },
    {
      id: "product-003",
      name: "A4 Premium Copy Paper",
      description: "Smooth, high-brightness A4 sheets for crisp everyday printing, copying and professional office documents.",
      category: "Office Supplies",
      supplierId: "supplier-002",
      supplierName: "PaperPro Solutions",
      price: 420,
      bulkPrice: 390,
      moq: 100,
      stock: 2500,
      unit: "ream",
      availability: "In Stock",
      specifications: "80 GSM, 210 x 297 mm, high opacity, jam-resistant finish, 500 sheets per ream",
      image: "/images/products/a4-premium-copy-paper.webp"
    },
    {
      id: "product-004",
      name: "Executive Desk Organizer",
      description: "A refined desktop organizer that keeps pens, notes and everyday office essentials neatly within reach.",
      category: "Office Supplies",
      supplierId: "supplier-002",
      supplierName: "PaperPro Solutions",
      price: 1180,
      bulkPrice: 1090,
      moq: 50,
      stock: 420,
      unit: "set",
      availability: "Low Stock",
      specifications: "Solid wood construction, multi-slot pen and pencil storage, smooth finish, compact desk footprint",
      image: "/images/products/executive-desk-organizer.webp"
    },
    {
      id: "product-005",
      name: "Commercial LED Panel Lights",
      description: "Low-glare LED panel lighting delivers even, energy-efficient illumination for offices, retail floors and commercial interiors.",
      category: "Electrical",
      supplierId: "supplier-003",
      supplierName: "Lumina Electric",
      price: 1650,
      bulkPrice: 1520,
      moq: 30,
      stock: 200,
      unit: "piece",
      availability: "In Stock",
      specifications: "40W, 4000K neutral white, wide beam, low-glare diffuser, 3-year warranty",
      image: "/images/products/commercial-led-panel-lights.webp"
    },
    {
      id: "product-006",
      name: "Corrugated Packaging Boxes",
      description: "Custom heavy-duty corrugated shipping boxes for secure and efficient dispatch.",
      category: "Packaging",
      supplierId: "supplier-004",
      supplierName: "PackRight Corp.",
      price: 55,
      bulkPrice: 48,
      moq: 1000,
      stock: 9600,
      unit: "box",
      availability: "In Stock",
      specifications: "3-ply and 5-ply corrugated board options, recyclable kraft paper, custom dimensions and print options",
      image: "/images/products/corrugated-packaging-boxes.webp"
    },
    {
      id: "product-007",
      name: "Protective Foam Inserts",
      description: "Precision-cut foam inserts cushion fragile equipment and components through storage, handling and shipment.",
      category: "Packaging",
      supplierId: "supplier-004",
      supplierName: "PackRight Corp.",
      price: 230,
      bulkPrice: 210,
      moq: 300,
      stock: 640,
      unit: "set",
      availability: "Low Stock",
      specifications: "Custom-cut foam profiles, shock-absorbing cushioning, configurable fit, reusable design",
      image: "/images/products/protective-foam-inserts.webp"
    },
    {
      id: "product-008",
      name: "Heavy Duty Warehouse Shelving",
      description: "Steel shelving system designed for bulk inventory and logistics planning.",
      category: "Machinery",
      supplierId: "supplier-005",
      supplierName: "SteelCraft Ltd.",
      price: 5300,
      bulkPrice: 5000,
      moq: 10,
      stock: 85,
      unit: "unit",
      availability: "In Stock",
      specifications: "Powder coated steel, modular design, 800kg load per shelf",
      image: "/images/products/stainless-steel-components.webp"
    },
    {
      id: "product-009",
      name: "Cotton Fabric Rolls",
      description: "Bulk cotton fabric supplied in production-ready rolls for apparel, uniforms and textile manufacturing.",
      category: "Textiles",
      supplierId: "supplier-006",
      supplierName: "Vardhman Weaves & Tex",
      price: 145,
      bulkPrice: 132,
      moq: 100,
      stock: 3200,
      unit: "meter",
      availability: "In Stock",
      specifications: "100% cotton, 180 GSM, 180 cm usable width, roll-packed, color and finish options available by order",
      image: "/images/products/cotton-fabric-rolls.webp"
    },
    {
      id: "product-010",
      name: "Commercial LED Bulbs",
      description: "Energy-efficient LED bulbs for offices, retail spaces and other commercial interiors.",
      category: "Electrical",
      supplierId: "supplier-003",
      supplierName: "Lumina Electric",
      price: 120,
      bulkPrice: 105,
      moq: 100,
      stock: 1800,
      unit: "piece",
      availability: "In Stock",
      specifications: "9W LED, B22 or E27 base options, 6500K daylight, 220-240V input, non-dimmable",
      image: "/images/products/led-bulbs.webp"
    },
    {
      id: "product-012",
      name: "Food Packaging Materials",
      description: "Bulk food-service packaging for takeaways, caterers and food processors, with formats suited to packing and dispatch.",
      category: "Packaging",
      supplierId: "supplier-007",
      supplierName: "BioPack Green Solutions",
      price: 450,
      bulkPrice: 410,
      moq: 100,
      stock: 850,
      unit: "pack",
      availability: "In Stock",
      specifications: "Food-grade packaging options, heat-sealable pouches, leak-resistant trays, pack sizes configurable by order",
      image: "/images/products/food-packaging-materials.webp"
    },
    {
      id: "product-013",
      name: "Carbide CNC Milling Cutters",
      description: "Precision carbide end mills for machining metal components and production parts on CNC milling equipment.",
      category: "Machinery",
      supplierId: "supplier-008",
      supplierName: "Precision Tooling Works",
      price: 1150,
      bulkPrice: 1050,
      moq: 25,
      stock: 500,
      unit: "piece",
      availability: "In Stock",
      specifications: "Solid carbide cutting tool, end-mill format, multiple diameters and flute options, for CNC milling",
      image: "/images/products/featured-cnc-milling-cutters.webp"
    },
    {
      id: "product-014",
      name: "Biodegradable Trash Bags",
      description: "Bulk-supplied biodegradable refuse bags for commercial facilities, retail operations and workplace waste collection.",
      category: "Packaging",
      supplierId: "supplier-009",
      supplierName: "GreenChem Polymers Corp.",
      price: 210,
      bulkPrice: 190,
      moq: 100,
      stock: 4000,
      unit: "pack",
      availability: "In Stock",
      specifications: "Biodegradable bag material, roll-packed, multiple bag sizes and thickness options, bulk case quantities available",
      image: "/images/products/featured-biodegradable-polymers.webp"
    },
    {
      id: "product-015",
      name: "Commercial Ergonomic Office Chairs",
      description: "Ergonomic seating for offices and shared workspaces, designed for everyday desk-based use.",
      category: "Office Supplies",
      supplierId: "supplier-010",
      supplierName: "UrbanWork Office Systems",
      price: 4850,
      bulkPrice: 4500,
      moq: 20,
      stock: 160,
      unit: "chair",
      availability: "In Stock",
      specifications: "Breathable mesh back, lumbar support, adjustable seat height, rolling casters, assembly required",
      image: "/images/products/featured-office-ergonomic-chairs.webp"
    }
  ];

  const demoRFQs = [
    {
      id: "rfq-001",
      buyerId: "buyer-001",
      title: "Industrial Safety Gloves",
      productId: "product-001",
      supplierId: "supplier-001",
      productName: "Industrial Safety Gloves",
      quantity: 800,
      unit: "pairs",
      targetPrice: 170,
      deliveryLocation: "Bengaluru",
      expectedDate: "2026-10-20",
      notes: "Need gloves suitable for warehouse operations and shift handling teams.",
      status: "Pending",
      responseDeadline: "2026-10-15",
      createdAt: "2026-10-01"
    },
    {
      id: "rfq-002",
      buyerId: "buyer-001",
      title: "LED Panel Lighting",
      productId: "product-005",
      supplierId: "supplier-003",
      productName: "Commercial LED Panel Lights",
      quantity: 150,
      unit: "pieces",
      targetPrice: 1600,
      deliveryLocation: "Bengaluru",
      expectedDate: "2026-10-28",
      notes: "Commercial office fit-out for multiple floors.",
      status: "Quoted",
      responseDeadline: "2026-10-12",
      createdAt: "2026-10-02"
    },
    {
      id: "rfq-003",
      buyerId: "buyer-001",
      title: "Packaging Material",
      productId: "product-006",
      supplierId: "supplier-004",
      productName: "Corrugated Packaging Boxes",
      quantity: 2500,
      unit: "boxes",
      targetPrice: 50,
      deliveryLocation: "Chennai",
      expectedDate: "2026-11-03",
      notes: "Need branded packaging for product dispatch and mini-bundles.",
      status: "In Review",
      responseDeadline: "2026-10-16",
      createdAt: "2026-10-04"
    }
  ];

  const demoQuotations = [
    {
      id: "quote-001",
      rfqId: "rfq-001",
      supplierId: "supplier-001",
      supplierName: "Apex Gear Co.",
      productId: "product-001",
      productName: "Industrial Safety Gloves",
      quantity: 800,
      unitPrice: 175,
      deliveryCharges: 1200,
      deliveryTimeline: "5-7 business days",
      paymentTerms: "50% advance, 50% on delivery",
      validityDate: "2026-10-22",
      status: "Pending",
      buyerId: "buyer-001"
    },
    {
      id: "quote-002",
      rfqId: "rfq-001",
      supplierId: "supplier-005",
      supplierName: "SteelCraft Ltd.",
      productId: "product-008",
      productName: "Heavy Duty Warehouse Shelving",
      quantity: 20,
      unitPrice: 5480,
      deliveryCharges: 2500,
      deliveryTimeline: "10-12 business days",
      paymentTerms: "Partial advance",
      validityDate: "2026-10-26",
      status: "Pending",
      buyerId: "buyer-001"
    },
    {
      id: "quote-003",
      rfqId: "rfq-002",
      supplierId: "supplier-003",
      supplierName: "Lumina Electric",
      productId: "product-005",
      productName: "Commercial LED Panel Lights",
      quantity: 150,
      unitPrice: 1580,
      deliveryCharges: 900,
      deliveryTimeline: "4-6 business days",
      paymentTerms: "Net 15",
      validityDate: "2026-10-20",
      status: "Accepted",
      buyerId: "buyer-001"
    }
  ];

  const demoSampleRequests = [
    {
      id: "sample-001",
      buyerId: "buyer-001",
      productId: "product-001",
      productName: "Industrial Safety Gloves",
      supplierId: "supplier-001",
      supplierName: "Apex Gear Co.",
      requestedQuantity: 50,
      deliveryAddress: "North Star Retail, Bengaluru",
      contactName: "Aisha Patel",
      contactInfo: "+91 98765 43210",
      notes: "Need product sample before large order confirmation.",
      requestDate: "2026-10-03",
      status: "Approved",
      dispatchDetails: "Courier dispatched on 2026-10-04",
      feedback: "Sample quality matches expectations and product dimensions are good."
    },
    {
      id: "sample-002",
      buyerId: "buyer-001",
      productId: "product-005",
      productName: "Commercial LED Panel Lights",
      supplierId: "supplier-003",
      supplierName: "Lumina Electric",
      requestedQuantity: 10,
      deliveryAddress: "North Star Retail, Bengaluru",
      contactName: "Aisha Patel",
      contactInfo: "+91 98765 43210",
      notes: "Inspect brightness and installation compatibility.",
      requestDate: "2026-10-01",
      status: "Delivered",
      dispatchDetails: "Courier delivered on 2026-10-05",
      feedback: "Lighting output is consistent and installation is straightforward."
    }
  ];

  const demoCollaborations = [
    {
      id: "collab-001",
      buyerId: "buyer-001",
      rfqId: "rfq-003",
      requiredQuantity: 2500,
      primarySupplierId: "supplier-004",
      primarySupplierName: "PackRight Corp.",
      participatingSuppliers: [
        { supplierId: "supplier-004", supplierName: "PackRight Corp.", allocatedQty: 1400 },
        { supplierId: "supplier-002", supplierName: "PaperPro Solutions", allocatedQty: 1100 }
      ],
      status: "Active",
      fulfilmentDetails: "Shared packaging production across two suppliers for phased fulfilment."
    }
  ];

  const demoConversations = [
    {
      id: "conversation-001",
      buyerId: "buyer-001",
      supplierId: "supplier-001",
      supplierName: "Apex Gear Co.",
      rfqId: "rfq-001",
      quotationId: "quote-001",
      preview: "We can revise the packaging and match your requested MOQ.",
      updatedAt: "2026-10-05T11:40:00"
    }
  ];

  const demoMessages = [
    {
      id: "message-001",
      conversationId: "conversation-001",
      buyerId: "buyer-001",
      supplierId: "supplier-001",
      sender: "supplier",
      text: "We can match your requirement with a revised bulk pack size for 800 unit orders.",
      sentAt: "2026-10-05T09:30:00"
    },
    {
      id: "message-002",
      conversationId: "conversation-001",
      buyerId: "buyer-001",
      supplierId: "supplier-001",
      sender: "buyer",
      text: "Thanks. Please confirm the revised packaging and price adjustment.",
      sentAt: "2026-10-05T10:15:00"
    },
    {
      id: "message-003",
      conversationId: "conversation-001",
      buyerId: "buyer-001",
      supplierId: "supplier-001",
      sender: "supplier",
      text: "We can revise and send a final quotation with the updated scope by tomorrow.",
      sentAt: "2026-10-05T11:40:00"
    }
  ];

  const demoOrders = [
    {
      id: "order-001",
      buyerId: "buyer-001",
      quotationId: "quote-003",
      supplierId: "supplier-003",
      supplierName: "Lumina Electric",
      productId: "product-005",
      productName: "Commercial LED Panel Lights",
      quantity: 150,
      unitPrice: 1580,
      totalAmount: 237000,
      orderDate: "2026-10-06",
      expectedDate: "2026-10-20",
      status: "Processing",
      shipmentStatus: "Pending Dispatch"
    }
  ];

  const demoPayments = [
    {
      id: "payment-001",
      orderId: "order-001",
      supplierId: "supplier-003",
      supplierName: "Lumina Electric",
      amount: 237000,
      paymentDate: "2026-10-06",
      paymentMethod: "Bank Transfer",
      status: "Pending"
    }
  ];

  const demoInvoices = [
    {
      id: "invoice-001",
      orderId: "order-001",
      supplierId: "supplier-003",
      supplierName: "Lumina Electric",
      buyerName: "North Star Retail",
      invoiceNumber: "INV-TRN-2026-1001",
      lineItems: [
        { product: "Commercial LED Panel Lights", quantity: 150, unitPrice: 1580, total: 237000 }
      ],
      totalAmount: 237000
    }
  ];

  const demoShipments = [
    {
      id: "shipment-001",
      orderId: "order-001",
      shipmentReference: "SHIP-TRN-1001",
      courierName: "BlueRoute Logistics",
      trackingNumber: "BRL-909821",
      dispatchDate: "2026-10-07",
      expectedDate: "2026-10-20",
      deliveryAddress: "North Star Retail, Bengaluru",
      status: "Processing",
      timeline: [
        { status: "Order Confirmed", date: "2026-10-06" },
        { status: "Processing", date: "2026-10-07" },
        { status: "Dispatched", date: "2026-10-08" },
        { status: "In Transit", date: "2026-10-12" },
        { status: "Out for Delivery", date: "2026-10-19" }
      ]
    }
  ];

  const demoActivityRecords = [
    {
      id: "activity-001",
      type: "RFQ",
      title: "RFQ created for Industrial Safety Gloves",
      createdAt: "2026-10-01T09:30:00"
    },
    {
      id: "activity-002",
      type: "Quotation",
      title: "Quotation received from Lumina Electric",
      createdAt: "2026-10-02T14:00:00"
    },
    {
      id: "activity-003",
      type: "Sample",
      title: "Sample request approved for LED panel lights",
      createdAt: "2026-10-03T08:00:00"
    },
    {
      id: "activity-004",
      type: "Order",
      title: "Order placed for LED panel lights",
      createdAt: "2026-10-06T16:00:00"
    }
  ];

  const baseState = {
    users: [demoBuyer],
    buyerProfiles: [demoBuyer],
    supplierProfiles: demoSuppliers,
    products: demoProducts,
    inventory: demoProducts,
    rfqs: demoRFQs,
    quotations: demoQuotations,
    sampleRequests: demoSampleRequests,
    collaborations: demoCollaborations,
    conversations: demoConversations,
    messages: demoMessages,
    orders: demoOrders,
    payments: demoPayments,
    invoices: demoInvoices,
    shipments: demoShipments,
    activityRecords: demoActivityRecords
  };

  function clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function defaultState() {
    const state = clone(baseState);
    return state;
  }

  function safeParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function normalizeAssetPath(value) {
    if (typeof value !== "string") return value;

    const legacyImageMap = {
      "warehouse-shelving.webp": "stainless-steel-components.webp",
      "warehouse-shelving.png": "stainless-steel-components.webp"
    };

    const fileName = value.split(/[\\/]/).pop()?.toLowerCase();
    const resolvedFileName = legacyImageMap[fileName] || fileName;
    return STORE_SCRIPT_URL
      ? new URL(`../images/products/${resolvedFileName}`, STORE_SCRIPT_URL).href
      : `/images/products/${resolvedFileName}`;
  }

  function normalizeStorePaths(state) {
    if (!state || typeof state !== "object") return state;
    if (Array.isArray(state.products)) {
      state.products = state.products.map((product) => ({
        ...product,
        image: normalizeAssetPath(product.image)
      }));
    }
    if (Array.isArray(state.inventory)) {
      state.inventory = state.inventory.map((product) => ({
        ...product,
        image: normalizeAssetPath(product.image)
      }));
    }
    return state;
  }

  function ensureCollections(state) {
    const fallback = defaultState();
    const merged = clone(fallback);
    Object.keys(fallback).forEach((key) => {
      if (Array.isArray(state[key])) {
        merged[key] = clone(state[key]);
      }
    });
    const addedProductIds = new Set([
      "product-009",
      "product-010",
      "product-012",
      "product-013",
      "product-014",
      "product-015"
    ]);
    const removedProductIds = new Set(["product-011"]);
    fallback.supplierProfiles.forEach((seedSupplier) => {
      const supplier = merged.supplierProfiles.find((item) => item.id === seedSupplier.id);
      if (!supplier) {
        merged.supplierProfiles.push(clone(seedSupplier));
        return;
      }
      const addedSupplierProducts = seedSupplier.products.filter((productId) => addedProductIds.has(productId));
      supplier.products = [...new Set([...(supplier.products || []).filter((productId) => !removedProductIds.has(productId)), ...addedSupplierProducts])];
    });
    const refreshedProductIds = new Set([
      "product-002",
      "product-003",
      "product-004",
      "product-005",
      "product-006",
      "product-007"
    ]);
    ["products", "inventory"].forEach((collectionName) => {
      if (!Array.isArray(merged[collectionName])) return;
      const products = merged[collectionName].filter((product) => !removedProductIds.has(product.id)).map((product) => {
        const currentProduct = fallback.products.find((item) => item.id === product.id);
        if (addedProductIds.has(product.id) && currentProduct) {
          return { ...product, ...currentProduct };
        }
        if (!refreshedProductIds.has(product.id) || !currentProduct) return product;
        return {
          ...product,
          name: currentProduct.name,
          description: currentProduct.description,
          specifications: currentProduct.specifications,
          image: currentProduct.image
        };
      });
      const existingProductIds = new Set(products.map((product) => product.id));
      fallback.products.forEach((product) => {
        if (addedProductIds.has(product.id) && !existingProductIds.has(product.id)) {
          products.push(clone(product));
        }
      });
      merged[collectionName] = products;
    });
    // Supplier workspace catalogue records are shared through localStorage.
    // Replace the managed subset each read so removals and edits stay visible
    // in buyer pages even when the canonical store was initialized later.
    const supplierProfile = safeParse(localStorage.getItem("tradenest_supplier_business_profile"), null);
    const catalogueSupplier = merged.supplierProfiles.find((supplier) => supplier.id === "supplier-001");
    if (catalogueSupplier && supplierProfile && typeof supplierProfile === "object") {
      const addressParts = String(supplierProfile.registeredAddress || "").split(",").map((part) => part.trim()).filter(Boolean);
      catalogueSupplier.businessName = supplierProfile.businessName || catalogueSupplier.businessName;
      catalogueSupplier.category = supplierProfile.primaryCategory || catalogueSupplier.category;
      catalogueSupplier.location = addressParts[Math.max(0, addressParts.length - 3)] || catalogueSupplier.location;
      catalogueSupplier.description = supplierProfile.description || catalogueSupplier.description;
      catalogueSupplier.verificationStatus = String(supplierProfile.verificationStatus || "").toLowerCase().includes("verified") ? "Verified" : "Unverified";
    }
    const supplierProducts = safeParse(localStorage.getItem("tradenest_custom_products"), []);
    if (Array.isArray(supplierProducts)) {
      const activeProducts = supplierProducts.filter((product) => (product.status || "active") === "active");
      const mappedProducts = activeProducts.map((product) => {
        const stock = Number(product.availableStock) || 0;
        return {
          id: product.id,
          name: product.name || "",
          description: product.description || "",
          category: product.category || "Other",
          supplierId: "supplier-001",
          supplierName: merged.supplierProfiles.find((supplier) => supplier.id === "supplier-001")?.businessName || "TradeNest Supplies Pvt. Ltd.",
          // Supplier workspace prices are stored in USD; catalogue prices are INR.
          price: (Number(product.unitPrice) || 0) * 80,
          bulkPrice: (Number(product.unitPrice) || 0) * 80,
          moq: Number(product.moq) || 1,
          stock,
          unit: product.uom || "unit",
          availability: stock <= 0 ? "Out of Stock" : (stock <= (Number(product.minThreshold) || 0) ? "Low Stock" : "In Stock"),
          specifications: typeof product.specs === "string" ? product.specs : Object.entries(product.specs || {}).map(([key, value]) => `${key}: ${value}`).join(", "),
          image: product.image || "",
          supplierManaged: true
        };
      });
      ["products", "inventory"].forEach((collectionName) => {
        merged[collectionName] = [...merged[collectionName].filter((product) => !product.supplierManaged && !String(product.id).startsWith("PRD-")), ...clone(mappedProducts)];
      });
      const supplier = merged.supplierProfiles.find((item) => item.id === "supplier-001");
      if (supplier) {
        supplier.products = (supplier.products || []).filter((id) => !String(id).startsWith("PRD-"));
        supplier.products.push(...mappedProducts.map((product) => product.id));
      }
    }
    return normalizeStorePaths(merged);
  }

  function getStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const fresh = normalizeStorePaths(ensureCollections(defaultState()));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        return clone(fresh);
      }
      const parsed = safeParse(raw, defaultState());
      const normalized = normalizeStorePaths(ensureCollections(parsed));
      const serialized = JSON.stringify(normalized);
      if (raw !== serialized) localStorage.setItem(STORAGE_KEY, serialized);
      return normalized;
    } catch (error) {
      return clone(normalizeStorePaths(defaultState()));
    }
  }

  function saveStore(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    } catch (error) {
      return state;
    }
  }

  function normalizeBuyer(user) {
    const merged = { ...demoBuyer, ...(user || {}) };
    if (String(merged.email || "").includes("@tradenest.demo")) {
      merged.email = demoBuyer.email;
    }
    return merged;
  }

  function ensureDemoState() {
    const store = getStore();
    const current = safeParse(localStorage.getItem(CURRENT_USER_KEY), null);
    const normalized = normalizeBuyer(current);
    if (!current || JSON.stringify(current) !== JSON.stringify(normalized)) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalized));
    }
    return store;
  }

  function resetDemoData() {
    const state = defaultState();
    saveStore(state);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoBuyer));
    return state;
  }

  function getCurrentUser() {
    try {
      const user = safeParse(localStorage.getItem(CURRENT_USER_KEY), demoBuyer);
      if (user && typeof user === "object") {
        return normalizeBuyer(user);
      }
    } catch (error) {
      return demoBuyer;
    }
    return demoBuyer;
  }

  function getBuyerId() {
    return getCurrentUser().id || "buyer-001";
  }

  function formatCurrency(value) {
    const amount = Number(value) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  }

  function getSupplier(productId) {
    const state = getStore();
    const product = state.products.find((item) => item.id === productId);
    if (!product) return null;
    return state.supplierProfiles.find((supplier) => supplier.id === product.supplierId) || null;
  }

  function getProduct(productId) {
    return getStore().products.find((item) => item.id === productId) || null;
  }

  function updateCollection(collectionName, updater) {
    const state = getStore();
    const updated = updater(clone(state[collectionName] || []));
    state[collectionName] = updated;
    saveStore(state);
    return updated;
  }

  function addActivity(type, title) {
    const state = getStore();
    state.activityRecords.unshift({
      id: `activity-${Date.now()}`,
      type,
      title,
      createdAt: new Date().toISOString()
    });
    saveStore(state);
  }

  function validatePurchase(productId, requestedQuantity) {
    const state = getStore();
    const product = state.products.find(item => item.id === productId);
    if (!product) {
      return { valid: false, error: "Product not found in marketplace catalog." };
    }
    
    const isAvailable = product.availability !== "Out of Stock" && 
                        product.availability !== "Unavailable" && 
                        (product.status === undefined || product.status === "Active" || product.status === "active");
    if (!isAvailable) {
      return { valid: false, error: `Product "${product.name}" is currently unavailable or out of stock.`, product };
    }

    const qty = Number(requestedQuantity);
    const moq = Number(product.moq) || 1;
    if (isNaN(qty) || qty <= 0) {
      return { valid: false, error: "Please enter a valid positive order quantity.", product };
    }

    if (qty < moq) {
      return { valid: false, error: `Minimum order quantity (MOQ) for ${product.name} is ${moq} ${product.unit || 'units'}.`, product };
    }

    const currentStock = Number(product.stock !== undefined ? product.stock : (product.availableStock || 0));
    if (qty > currentStock) {
      return { valid: false, error: `Requested quantity (${qty}) exceeds available stock (${currentStock} ${product.unit || 'units'}).`, product };
    }

    return { valid: true, product };
  }

  function calculateOrderTotals(product, requestedQuantity, paymentMethod) {
    const qty = Math.max(Number(requestedQuantity) || 1, Number(product.moq) || 1);
    const regularPrice = Number(product.price) || 0;
    const bulkPrice = Number(product.bulkPrice) || regularPrice;
    
    const unitPrice = (bulkPrice > 0 && bulkPrice < regularPrice && qty >= (Number(product.moq) || 1))
      ? bulkPrice 
      : regularPrice;
    
    const subtotal = Math.round(qty * unitPrice);
    const bulkDiscount = Math.round((regularPrice - unitPrice) * qty);
    const gstRate = 0.18;
    const gst = Math.round(subtotal * gstRate);
    const shippingFee = subtotal >= 50000 ? 0 : 750;
    const totalAmount = subtotal + gst + shippingFee;

    return {
      quantity: qty,
      unitPrice,
      regularPrice,
      bulkPrice,
      subtotal,
      bulkDiscount,
      gst,
      taxAmount: gst,
      gstRate,
      shippingFee,
      totalAmount
    };
  }

  function createOrder(orderData, currentUser) {
    const user = currentUser || getCurrentUser();
    const productId = orderData.productId;
    const qty = Number(orderData.quantity) || 1;
    
    const isQuoteOrder = !!orderData.quotationId;
    let product = getProduct(productId);
    
    if (!isQuoteOrder) {
      const val = validatePurchase(productId, qty);
      if (!val.valid) {
        throw new Error(val.error);
      }
      product = val.product;
    } else if (!product && orderData.productName) {
      product = {
        id: productId || "custom",
        name: orderData.productName,
        price: orderData.unitPrice,
        unit: orderData.unit || "unit",
        supplierId: orderData.supplierId || "supplier-001",
        supplierName: orderData.supplierName || "TradeNest Supplier"
      };
    }

    const totals = orderData.totalAmount 
      ? {
          subtotal: orderData.subtotal || (orderData.unitPrice * qty),
          gst: orderData.gst || Math.round((orderData.subtotal || (orderData.unitPrice * qty)) * 0.18),
          shippingFee: orderData.shippingFee || 0,
          totalAmount: orderData.totalAmount
        }
      : calculateOrderTotals(product, qty, orderData.paymentMethod);

    const now = new Date();
    const orderId = orderData.id || `ORD-${Date.now()}`;
    const paymentId = `PAY-${Date.now()}`;
    const invoiceId = `INV-TRN-${Date.now().toString().slice(-6)}`;
    const shipmentId = `SHIP-TRN-${Date.now().toString().slice(-6)}`;

    const payMethod = String(orderData.paymentMethod || "UPI").toLowerCase();
    const isFailed = payMethod.includes("fail");
    const isEscrow = payMethod.includes("escrow");
    const isCredit = payMethod.includes("credit") || payMethod.includes("net 30") || payMethod.includes("net 60");
    const isBank = payMethod.includes("bank") || payMethod.includes("neft") || payMethod.includes("rtgs");
    const isBankOrCredit = isBank || isCredit;

    let paymentStatus = "Paid";
    if (isFailed) {
      paymentStatus = "Failed";
    } else if (isCredit || isBank) {
      paymentStatus = "Pending";
    } else if (isEscrow) {
      paymentStatus = "Escrow Funded";
    }

    let orderPaymentStatus = "Paid";
    if (isFailed) {
      orderPaymentStatus = "Payment Failed";
    } else if (isCredit) {
      orderPaymentStatus = "Pending Verification";
    } else if (isBank) {
      orderPaymentStatus = "Payment Pending";
    } else if (isEscrow) {
      orderPaymentStatus = "Escrow Funded";
    }

    const orderStatus = isFailed ? "Cancelled" : (isBankOrCredit ? "Pending Payment Confirmation" : "Placed");
    const shipmentStatus = isFailed ? "Cancelled" : "Processing";

    const newOrder = {
      id: orderId,
      buyerId: user.id || "buyer-001",
      buyerName: orderData.buyerName || user.fullName || "North Star Retail",
      buyerBusiness: user.businessName || user.company || "North Star Retail",
      productId: product ? product.id : productId,
      productName: product ? product.name : orderData.productName,
      supplierId: product ? (product.supplierId || orderData.supplierId || "supplier-001") : (orderData.supplierId || "supplier-001"),
      supplierName: product ? (product.supplierName || orderData.supplierName || "TradeNest Supplier") : (orderData.supplierName || "TradeNest Supplier"),
      quantity: qty,
      unit: product ? (product.unit || "unit") : (orderData.unit || "unit"),
      unitPrice: orderData.unitPrice || totals.unitPrice || (product ? product.price : 0),
      subtotal: totals.subtotal,
      gst: totals.gst,
      shippingFee: totals.shippingFee,
      totalAmount: totals.totalAmount,
      amount: totals.totalAmount,
      paymentMethod: orderData.paymentMethod || "UPI",
      paymentStatus: orderPaymentStatus,
      status: orderStatus,
      orderStatus: orderStatus,
      shipmentStatus: shipmentStatus,
      fulfillmentStatus: shipmentStatus,
      deliveryAddress: orderData.deliveryAddress || "102 Brigade Gateway, Bengaluru, Karnataka",
      buyerAddress: orderData.buyerAddress || null,
      notes: orderData.notes || "",
      quotationId: orderData.quotationId || null,
      orderType: isQuoteOrder ? "quotation" : "direct",
      orderDate: now.toISOString().slice(0, 10),
      expectedDate: orderData.expectedDate || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const newPayment = {
      id: paymentId,
      orderId: orderId,
      supplierId: newOrder.supplierId,
      supplierName: newOrder.supplierName,
      buyerId: newOrder.buyerId,
      buyerName: newOrder.buyerName,
      amount: totals.totalAmount,
      paymentDate: now.toISOString().slice(0, 10),
      paymentMethod: newOrder.paymentMethod,
      status: paymentStatus,
      transactionRef: orderData.transactionRef || `TXN-${Date.now()}`
    };

    const newInvoice = {
      id: invoiceId,
      orderId: orderId,
      invoiceNumber: invoiceId,
      supplierId: newOrder.supplierId,
      supplierName: newOrder.supplierName,
      buyerName: newOrder.buyerName,
      lineItems: [
        { product: newOrder.productName, quantity: qty, unitPrice: newOrder.unitPrice, total: totals.subtotal }
      ],
      subtotal: totals.subtotal,
      gst: totals.gst,
      totalAmount: totals.totalAmount,
      createdAt: now.toISOString()
    };

    const newShipment = {
      id: shipmentId,
      orderId: orderId,
      shipmentReference: shipmentId,
      courierName: "TradeNest Logistics Express",
      trackingNumber: `TN${Date.now().toString().slice(-8)}`,
      status: shipmentStatus,
      dispatchDate: now.toISOString().slice(0, 10),
      expectedDate: newOrder.expectedDate,
      deliveryAddress: newOrder.deliveryAddress,
      timeline: [
        { status: "Order Placed", date: now.toISOString() },
        { status: "Processing", date: now.toISOString() }
      ]
    };

    const state = getStore();
    state.orders = [newOrder, ...(state.orders || []).filter(o => o.id !== orderId)];
    state.payments = [newPayment, ...(state.payments || []).filter(p => p.id !== paymentId)];
    state.invoices = [newInvoice, ...(state.invoices || []).filter(i => i.id !== invoiceId)];
    state.shipments = [newShipment, ...(state.shipments || []).filter(s => s.id !== shipmentId)];

    if (product && !isFailed) {
      ["products", "inventory"].forEach(col => {
        if (Array.isArray(state[col])) {
          const item = state[col].find(p => p.id === product.id);
          if (item) {
            const currentStock = Number(item.stock !== undefined ? item.stock : item.availableStock) || 0;
            const updatedStock = Math.max(0, currentStock - qty);
            if (item.stock !== undefined) item.stock = updatedStock;
            if (item.availableStock !== undefined) item.availableStock = updatedStock;
            if (updatedStock <= 0) {
              item.availability = "Out of Stock";
            } else if (item.minThreshold && updatedStock <= item.minThreshold) {
              item.availability = "Low Stock";
            }
          }
        }
      });

      if (window.TradeNestProductService && typeof window.TradeNestProductService.updateStockSync === "function") {
        try {
          const currentStock = Number(product.stock !== undefined ? product.stock : product.availableStock) || 0;
          const updatedStock = Math.max(0, currentStock - qty);
          window.TradeNestProductService.updateStockSync(product.id, updatedStock, product.minThreshold, user);
        } catch(e) {
          console.warn("Stock sync error:", e);
        }
      }
    }

    saveStore(state);
    addActivity("Order", `Order placed: ${newOrder.productName} × ${qty} (${formatCurrency(totals.totalAmount)})`);

    // Auto-create notifications
    try {
      const orderTotalAmt = Number(newOrder.totalAmount || totals.totalAmount || 0);
      addNotification({
        recipientId: newOrder.buyerId,
        role: "buyer",
        type: "order",
        title: "Order Placed",
        message: `Order #${newOrder.id} for ₹${orderTotalAmt.toLocaleString("en-IN")} was created successfully.`,
        link: "pages/buyer/orders.html"
      });
      addNotification({
        recipientId: newOrder.supplierId,
        role: "supplier",
        type: "order",
        title: "New Order Received",
        message: `New order #${newOrder.id} received from ${newOrder.buyerName || "Buyer"} (₹${orderTotalAmt.toLocaleString("en-IN")}).`,
        link: "pages/supplier/orders.html"
      });
    } catch(e) {
      console.warn("Error triggering order notifications:", e);
    }

    try {
      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent("tradenest:order-created", { detail: { order: newOrder, payment: newPayment, shipment: newShipment } }));
      }
    } catch(e) {}

    return {
      order: newOrder,
      payment: newPayment,
      invoice: newInvoice,
      shipment: newShipment
    };
  }

  function convertQuoteToOrder(quoteId, currentUser, paymentMethod, deliveryAddress) {
    const user = currentUser || getCurrentUser();
    let state = getStore();
    const quote = (state.quotations || []).find(q => q.id === quoteId);
    if (!quote) {
      return { success: false, error: "Quotation not found." };
    }

    if (quote.status === "Accepted") {
      const existing = (state.orders || []).find(o => o.id === quote.convertedOrderId || o.quotationId === quote.id);
      return { success: false, error: "This quotation has already been converted into an order.", order: existing };
    }

    const orderResult = createOrder({
      id: `ORD-Q-${Date.now()}`,
      quotationId: quote.id,
      productId: quote.productId,
      productName: quote.productName,
      supplierId: quote.supplierId,
      supplierName: quote.supplierName,
      quantity: quote.quantity,
      unitPrice: quote.unitPrice,
      shippingFee: quote.deliveryCharges || 0,
      totalAmount: (quote.unitPrice * quote.quantity) + (quote.deliveryCharges || 0),
      paymentMethod: paymentMethod || "Online Escrow",
      deliveryAddress: deliveryAddress || `${user.businessName || user.fullName}, Bengaluru`,
      expectedDate: quote.validityDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      orderType: "quotation"
    }, user);

    state = getStore();
    const updatedQuote = (state.quotations || []).find(q => q.id === quoteId);
    if (updatedQuote) {
      updatedQuote.status = "Accepted";
      updatedQuote.convertedOrderId = orderResult.order.id;
    }
    saveStore(state);

    try {
      addNotification({
        recipientId: quote.supplierId,
        role: "supplier",
        type: "quotation",
        title: "Quotation Accepted",
        message: `Quotation #${quoteId} has been accepted and converted to order #${orderResult.order.id}.`,
        link: "pages/supplier/orders.html"
      });
    } catch(e) {}

    return { success: true, ...orderResult };
  }

  function updateOrderStatus(orderId, newStatus) {
    const state = getStore();
    const order = (state.orders || []).find(o => o.id === orderId);
    if (!order) return false;

    order.status = newStatus;
    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === "Delivered") {
      order.shipmentStatus = "Delivered";
      order.fulfillmentStatus = "Delivered";
      const payment = (state.payments || []).find(p => p.orderId === orderId);
      if (payment && payment.status !== "Failed") {
        payment.status = "Released";
      }
      const shipment = (state.shipments || []).find(s => s.orderId === orderId);
      if (shipment) {
        shipment.status = "Delivered";
        shipment.timeline.push({ status: "Delivered", date: new Date().toISOString() });
      }
    } else if (newStatus === "Shipped") {
      order.shipmentStatus = "In Transit";
      order.fulfillmentStatus = "In Transit";
      const shipment = (state.shipments || []).find(s => s.orderId === orderId);
      if (shipment) {
        shipment.status = "In Transit";
        shipment.timeline.push({ status: "In Transit", date: new Date().toISOString() });
      }
    }

    saveStore(state);
    addActivity("Order", `Order #${orderId} status updated to ${newStatus}`);

    try {
      addNotification({
        recipientId: order.buyerId,
        role: "buyer",
        type: "shipment",
        title: `Order ${newStatus}`,
        message: `Order #${orderId} is now ${newStatus}.`,
        link: "pages/buyer/tracking.html"
      });
      addNotification({
        recipientId: order.supplierId,
        role: "supplier",
        type: "order",
        title: `Order Status: ${newStatus}`,
        message: `Order #${orderId} marked as ${newStatus}.`,
        link: "pages/supplier/orders.html"
      });
    } catch(e) {}

    return true;
  }

  /* =====================================================
     EXTRA FEATURE 3 — RECENTLY VIEWED PRODUCTS
     ===================================================== */
  const RECENTLY_VIEWED_KEY = "tradenest_recently_viewed";

  function recordRecentlyViewed(productId) {
    if (!productId) return;
    try {
      let list = [];
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (raw) {
        list = JSON.parse(raw);
        if (!Array.isArray(list)) list = [];
      }
      list = list.filter(id => id !== productId);
      list.unshift(productId);
      list = list.slice(0, 8);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent("tradenest:recently-viewed-updated", { detail: { productId, list } }));
      }
    } catch (e) {
      console.warn("Could not record recently viewed product:", e);
    }
  }

  function getRecentlyViewed(limit = 8) {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return [];
      const state = getStore();
      const products = state.products || [];
      const results = [];
      for (const id of list) {
        const prod = products.find(p => p.id === id && p.status !== "Inactive");
        if (prod) {
          results.push(prod);
          if (results.length >= limit) break;
        }
      }
      return results;
    } catch (e) {
      console.warn("Error getting recently viewed products:", e);
      return [];
    }
  }

  /* =====================================================
     EXTRA FEATURE 6 — NOTIFICATION CENTER
     ===================================================== */
  const NOTIFICATIONS_KEY = "tradenest_notifications";

  function getNotifications(recipientId, role) {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_KEY);
      let all = [];
      if (raw) {
        all = JSON.parse(raw);
        if (!Array.isArray(all)) all = [];
      } else {
        // Seed contextual initial notifications
        all = [
          {
            id: "notif-seed-01",
            recipientId: "buyer-001",
            role: "buyer",
            type: "quotation",
            title: "Quotation Received",
            message: "Apex Gear Co. submitted quotation #QT-2026-001 for Heavy Duty Industrial Gloves.",
            link: "pages/buyer/quotations.html",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false
          },
          {
            id: "notif-seed-02",
            recipientId: "buyer-001",
            role: "buyer",
            type: "order",
            title: "Order In Transit",
            message: "Shipment for Order #ORD-2026-003 is on schedule for delivery.",
            link: "pages/buyer/tracking.html",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true
          },
          {
            id: "notif-seed-03",
            recipientId: "supplier-001",
            role: "supplier",
            type: "rfq",
            title: "New RFQ Received",
            message: "Buyer Aisha Patel submitted RFQ-2026-001 for 200 units.",
            link: "pages/supplier/quote-requests.html",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: false
          },
          {
            id: "notif-seed-04",
            recipientId: "admin",
            role: "admin",
            type: "system",
            title: "Supplier Verification Pending",
            message: "Precision Tooling Works uploaded business license for verification.",
            link: "pages/admin/verification.html",
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            read: false
          }
        ];
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
      }

      return all.filter(n => {
        if (recipientId && n.recipientId === recipientId) return true;
        if (role && n.role === role) return true;
        if (!recipientId && !role) return true;
        return false;
      }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (e) {
      console.warn("Error getting notifications:", e);
      return [];
    }
  }

  function getUnreadNotificationCount(recipientId, role) {
    const list = getNotifications(recipientId, role);
    return list.filter(n => !n.read).length;
  }

  function addNotification(data) {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_KEY);
      let all = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(all)) all = [];

      const now = Date.now();
      // Deduplicate recent notifications within 30 seconds
      const isDup = all.some(n =>
        n.recipientId === data.recipientId &&
        n.type === data.type &&
        n.title === data.title &&
        (now - new Date(n.timestamp).getTime()) < 30000
      );
      if (isDup) return null;

      const notif = {
        id: "notif-" + now + "-" + Math.random().toString(36).substr(2, 5),
        recipientId: data.recipientId || "general",
        role: data.role || "buyer",
        type: data.type || "system",
        title: data.title || "Notification",
        message: data.message || "",
        link: data.link || "",
        timestamp: new Date().toISOString(),
        read: false
      };

      all.unshift(notif);
      if (all.length > 100) all = all.slice(0, 100);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));

      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent("tradenest:notification-added", { detail: notif }));
      }
      return notif;
    } catch (e) {
      console.warn("Error adding notification:", e);
      return null;
    }
  }

  function markNotificationAsRead(id) {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_KEY);
      if (!raw) return;
      let all = JSON.parse(raw);
      if (!Array.isArray(all)) return;
      const notif = all.find(n => n.id === id);
      if (notif) {
        notif.read = true;
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
        if (typeof window !== "undefined" && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent("tradenest:notification-updated", { detail: notif }));
        }
      }
    } catch (e) {
      console.warn("Error marking notification read:", e);
    }
  }

  function markAllNotificationsAsRead(recipientId, role) {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_KEY);
      if (!raw) return;
      let all = JSON.parse(raw);
      if (!Array.isArray(all)) return;
      all.forEach(n => {
        if ((recipientId && n.recipientId === recipientId) || (role && n.role === role) || (!recipientId && !role)) {
          n.read = true;
        }
      });
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent("tradenest:notification-updated", { detail: { allRead: true } }));
      }
    } catch (e) {
      console.warn("Error marking all notifications read:", e);
    }
  }

  /* =====================================================
     EXTRA FEATURE 4 — GLOBAL SEARCH ENGINE
     ===================================================== */
  function searchCatalog(query, options = {}) {
    if (!query || typeof query !== "string") {
      return { query: "", products: [], categories: [], suppliers: [] };
    }
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) return { query: "", products: [], categories: [], suppliers: [] };

    const state = getStore();
    const products = (state.products || []).filter(p => p.status !== "Inactive");
    const suppliers = state.supplierProfiles || state.suppliers || [];

    const matchedProducts = products.filter(p => {
      return (p.name && p.name.toLowerCase().includes(cleanQ)) ||
             (p.category && p.category.toLowerCase().includes(cleanQ)) ||
             (p.description && p.description.toLowerCase().includes(cleanQ)) ||
             (p.supplierName && p.supplierName.toLowerCase().includes(cleanQ)) ||
             (p.sku && p.sku.toLowerCase().includes(cleanQ));
    }).slice(0, 8);

    const categoriesSet = new Set();
    products.forEach(p => {
      if (p.category && p.category.toLowerCase().includes(cleanQ)) {
        categoriesSet.add(p.category);
      }
    });

    const matchedSuppliers = suppliers.filter(s => {
      return (s.businessName && s.businessName.toLowerCase().includes(cleanQ)) ||
             (s.category && s.category.toLowerCase().includes(cleanQ)) ||
             (s.location && s.location.toLowerCase().includes(cleanQ)) ||
             (s.description && s.description.toLowerCase().includes(cleanQ));
    }).slice(0, 6);

    return {
      query: cleanQ,
      products: matchedProducts,
      categories: Array.from(categoriesSet),
      suppliers: matchedSuppliers
    };
  }

  window.TradeNestStore = {
    STORAGE_KEY,
    CURRENT_USER_KEY,
    RECENTLY_VIEWED_KEY,
    NOTIFICATIONS_KEY,
    demoBuyer,
    ensureDemoState,
    getStore,
    saveStore,
    resetDemoData,
    getCurrentUser,
    getBuyerId,
    getSupplier,
    getProduct,
    formatCurrency,
    updateCollection,
    addActivity,
    defaultState,
    validatePurchase,
    calculateOrderTotals,
    createOrder,
    convertQuoteToOrder,
    updateOrderStatus,
    recordRecentlyViewed,
    getRecentlyViewed,
    getNotifications,
    getUnreadNotificationCount,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    searchCatalog
  };
})();
