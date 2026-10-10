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
    return normalizeStorePaths(merged);
  }

  function getStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const fresh = normalizeStorePaths(defaultState());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        return clone(fresh);
      }
      const parsed = safeParse(raw, defaultState());
      const normalized = normalizeStorePaths(ensureCollections(parsed));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
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

  window.TradeNestStore = {
    STORAGE_KEY,
    CURRENT_USER_KEY,
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
    defaultState
  };
})();
