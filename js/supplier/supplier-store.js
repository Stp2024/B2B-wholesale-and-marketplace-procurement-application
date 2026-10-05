/**
 * TradeNest Supplier Store
 * File: js/supplier/supplier-store.js
 * 
 * Central state management and persistent localStorage store for
 * Modules 15 to 28 (Supplier Dashboard & Portal).
 */

(function (window) {
    "use strict";

    // Storage Keys
    const KEYS = {
        PRODUCTS: "tradenest_supplier_products",
        INVENTORY: "tradenest_supplier_inventory",
        RFQS: "tradenest_supplier_rfqs",
        QUOTATIONS: "tradenest_supplier_quotations",
        SAMPLES: "tradenest_supplier_samples",
        COLLABORATION: "tradenest_supplier_collaboration",
        COLLAB_REQUESTS: "tradenest_supplier_collab_requests",
        CONVERSATIONS: "tradenest_supplier_conversations",
        ORDERS: "tradenest_supplier_orders",
        PAYMENTS: "tradenest_supplier_payments",
        SHIPMENTS: "tradenest_supplier_shipments",
        BUSINESS_PROFILE: "tradenest_supplier_biz_profile",
        REVIEWS: "tradenest_supplier_reviews",
        SETTINGS: "tradenest_supplier_settings",
        ACTIVITY: "tradenest_supplier_activity"
    };

    // Default Seed Data
    const SEED_DATA = {
        products: [
            {
                id: "PRD-001",
                name: "Industrial Safety Gloves",
                sku: "SKU-IND-GLV-01",
                category: "Safety Equipment",
                description: "Heavy-duty nitrile coated Kevlar grip gloves with cut resistance level 5 and oil repellent coating.",
                specs: {
                    material: "Kevlar & Nitrile Coating",
                    grade: "EN388 Level 5 Cut Resistance",
                    sizes: "M, L, XL",
                    color: "Charcoal Grey & High-Vis Orange",
                    origin: "Bengaluru, India"
                },
                image: "../../images/products/safety-gloves.webp",
                uom: "Pairs",
                unitPrice: 4.90,
                bulkPricing: [
                    { minQty: 100, maxQty: 499, price: 4.90 },
                    { minQty: 500, maxQty: 999, price: 4.40 },
                    { minQty: 1000, maxQty: null, price: 3.90 }
                ],
                moq: 100,
                availableStock: 1250,
                reservedStock: 350,
                minThreshold: 300,
                status: "active",
                createdAt: "2026-08-10"
            },
            {
                id: "PRD-002",
                name: "A4 Copy Paper Premium 80 GSM",
                sku: "SKU-OFC-PPR-02",
                category: "Office Supplies",
                description: "High-whiteness premium 80 GSM copy paper engineered for jam-free high-speed laser and inkjet printing.",
                specs: {
                    grammage: "80 GSM",
                    brightness: "102% CIE High Whiteness",
                    sheetSize: "210 x 297 mm (A4)",
                    packaging: "500 sheets/ream, 5 reams/box",
                    certification: "FSC Certified"
                },
                image: "../../images/products/office-paper.webp",
                uom: "Reams",
                unitPrice: 4.45,
                bulkPricing: [
                    { minQty: 50, maxQty: 199, price: 4.45 },
                    { minQty: 200, maxQty: 499, price: 4.10 },
                    { minQty: 500, maxQty: null, price: 3.75 }
                ],
                moq: 50,
                availableStock: 240,
                reservedStock: 100,
                minThreshold: 300, // Trigger low stock!
                status: "active",
                createdAt: "2026-08-12"
            },
            {
                id: "PRD-003",
                name: "Commercial LED Panel Lights 40W",
                sku: "SKU-ELE-LED-03",
                category: "Electrical",
                description: "Slim edge-lit commercial LED panels 600x600mm, flicker-free driver, 4000 lumens, 50000h lifespan.",
                specs: {
                    power: "40W",
                    dimensions: "595 x 595 x 9 mm",
                    colorTemp: "6500K Cool Daylight",
                    lumens: "4000 lm",
                    warranty: "3 Years Comprehensive"
                },
                image: "../../images/products/led-bulbs.webp",
                uom: "Pieces",
                unitPrice: 16.00,
                bulkPricing: [
                    { minQty: 20, maxQty: 99, price: 16.00 },
                    { minQty: 100, maxQty: 299, price: 14.50 },
                    { minQty: 300, maxQty: null, price: 12.80 }
                ],
                moq: 20,
                availableStock: 520,
                reservedStock: 80,
                minThreshold: 100,
                status: "active",
                createdAt: "2026-08-15"
            },
            {
                id: "PRD-004",
                name: "Heavy Corrugated Shipping Boxes",
                sku: "SKU-PKG-BOX-04",
                category: "Packaging",
                description: "3-ply and 5-ply kraft corrugated cardboard carton boxes tested for 200 lb burst strength and moisture resistance.",
                specs: {
                    ply: "5-Ply Flute B/C",
                    dimensions: "450 x 350 x 300 mm",
                    burstStrength: "200 PSI",
                    material: "100% Recycled Virgin Kraft",
                    finish: "Natural Brown Kraft"
                },
                image: "../../images/products/packaging-boxes.webp",
                uom: "Boxes",
                unitPrice: 3.10,
                bulkPricing: [
                    { minQty: 200, maxQty: 499, price: 3.10 },
                    { minQty: 500, maxQty: 999, price: 2.75 },
                    { minQty: 1000, maxQty: null, price: 2.40 }
                ],
                moq: 200,
                availableStock: 45,
                reservedStock: 20,
                minThreshold: 200, // Trigger low stock!
                status: "active",
                createdAt: "2026-08-20"
            },
            {
                id: "PRD-005",
                name: "Organic Combed Cotton Fabric Rolls",
                sku: "SKU-TEX-CTN-05",
                category: "Textiles",
                description: "GOTS-certified 100% organic combed cotton knitted single jersey roll for garment and apparel manufacturing.",
                specs: {
                    composition: "100% Organic Combed Cotton",
                    width: "165 cm tubular",
                    gsm: "180 GSM",
                    dye: "Azo-Free Reactive Dyed",
                    certification: "GOTS & OEKO-TEX Standard 100"
                },
                image: "../../images/products/cotton-fabric-rolls.webp",
                uom: "Rolls",
                unitPrice: 85.00,
                bulkPricing: [
                    { minQty: 10, maxQty: 29, price: 85.00 },
                    { minQty: 30, maxQty: 99, price: 78.00 },
                    { minQty: 100, maxQty: null, price: 70.00 }
                ],
                moq: 10,
                availableStock: 85,
                reservedStock: 15,
                minThreshold: 20,
                status: "active",
                createdAt: "2026-08-25"
            },
            {
                id: "PRD-006",
                name: "Industrial Stainless Steel Fasteners & Bolts",
                sku: "SKU-HRD-BLT-06",
                category: "Hardware",
                description: "Grade 304 & 316 stainless steel hex head bolts, nuts, and washers designed for harsh marine and chemical plants.",
                specs: {
                    grade: "AISI 316 Marine Grade",
                    threadSize: "M8 to M20",
                    standard: "DIN 933 / ISO 4017",
                    finish: "Passivated Electropolished",
                    tensileStrength: "700 N/mm²"
                },
                image: "../../images/products/stainless-steel-components.webp",
                uom: "Boxes (100 pcs)",
                unitPrice: 28.50,
                bulkPricing: [
                    { minQty: 25, maxQty: 99, price: 28.50 },
                    { minQty: 100, maxQty: 499, price: 25.00 },
                    { minQty: 500, maxQty: null, price: 22.00 }
                ],
                moq: 25,
                availableStock: 0,
                reservedStock: 0,
                minThreshold: 30, // Out of stock!
                status: "unavailable",
                createdAt: "2026-09-01"
            }
        ],

        rfqs: [
            {
                id: "RFQ-2026-881",
                buyerName: "Metro Retail Solutions",
                buyerContact: "operations@metroretail.example",
                buyerLocation: "Chicago, IL, USA",
                productName: "Industrial Safety Gloves",
                requiredQty: 500,
                uom: "Pairs",
                targetBudget: 2500,
                deliveryLocation: "Metro Hub 4, West Loop, Chicago, IL",
                expectedDeliveryDate: "2026-10-25",
                responseDeadline: "2026-10-12",
                specifications: "Required EN388 certified gloves, Level 4/5 cut resistance, sizes: 200M, 300L. Must include individual polybag packing with barcodes.",
                status: "New", // New, Quoted, Accepted, Declined
                createdAt: "2026-10-02"
            },
            {
                id: "RFQ-2026-885",
                buyerName: "BrightBuild Industries",
                buyerContact: "procurement@brightbuild.example",
                buyerLocation: "New York, USA",
                productName: "Commercial LED Panel Lights 40W",
                requiredQty: 100,
                uom: "Pieces",
                targetBudget: 1700,
                deliveryLocation: "BrightBuild Logistics Park, Queens, NY",
                expectedDeliveryDate: "2026-10-30",
                responseDeadline: "2026-10-15",
                specifications: "40W 600x600mm panels with BIS/CE compliance, power factor > 0.95, cool daylight 6500K. 3-year replacement warranty needed.",
                status: "Quoted",
                quotedRef: "QUO-9042",
                createdAt: "2026-09-28"
            },
            {
                id: "RFQ-2026-892",
                buyerName: "PackLine Distributors",
                buyerContact: "purchasing@packline.example",
                buyerLocation: "Toronto, Canada",
                productName: "Heavy Corrugated Shipping Boxes",
                requiredQty: 1000,
                uom: "Boxes",
                targetBudget: 3000,
                deliveryLocation: "Ontario Freight Terminal, Mississauga, ON",
                expectedDeliveryDate: "2026-11-05",
                responseDeadline: "2026-10-20",
                specifications: "Custom 5-ply corrugated carton boxes, dimensions 450x350x300mm. 2-color brand logo screen printed on two lateral faces.",
                status: "New",
                createdAt: "2026-10-04"
            },
            {
                id: "RFQ-2026-879",
                buyerName: "Apex Hardware Supplies",
                buyerContact: "orders@apexhardware.example",
                buyerLocation: "Dallas, TX, USA",
                productName: "Industrial Stainless Steel Fasteners",
                requiredQty: 250,
                uom: "Boxes",
                targetBudget: 6000,
                deliveryLocation: "Apex Distribution Depot, Dallas, TX",
                expectedDeliveryDate: "2026-10-20",
                responseDeadline: "2026-10-01",
                specifications: "Grade 316 hex head fasteners M10x50mm with spring washers. Full metallurgical test report required.",
                status: "Declined",
                declineReason: "Stock currently on backorder until November batch.",
                createdAt: "2026-09-20"
            }
        ],

        quotations: [
            {
                id: "QUO-9042",
                rfqRef: "RFQ-2026-885",
                buyerName: "BrightBuild Industries",
                productName: "Commercial LED Panel Lights 40W",
                offeredQty: 100,
                uom: "Pieces",
                unitPrice: 14.50,
                subtotal: 1450.00,
                deliveryCharges: 75.00,
                taxAmount: 116.00,
                totalAmount: 1641.00,
                availableStock: 520,
                deliveryTimeline: "5 to 7 business days via Express Freight",
                paymentTerms: "30% Advance with Purchase Order, 70% against Proof of Dispatch (Escrow)",
                validityDate: "2026-10-28",
                additionalConditions: "Includes 36-month manufacturer warranty. Replacement units dispatched within 48 hours for verified claims.",
                status: "Sent", // Draft, Sent, Accepted, Revised, Declined
                createdAt: "2026-09-30"
            },
            {
                id: "QUO-8991",
                rfqRef: "RFQ-2026-860",
                buyerName: "OfficeHub Enterprises",
                productName: "A4 Copy Paper Premium 80 GSM",
                offeredQty: 200,
                uom: "Reams",
                unitPrice: 4.10,
                subtotal: 820.00,
                deliveryCharges: 40.00,
                taxAmount: 68.80,
                totalAmount: 928.80,
                availableStock: 240,
                deliveryTimeline: "3 to 4 business days",
                paymentTerms: "Net 30 Days via Corporate Account",
                validityDate: "2026-10-15",
                additionalConditions: "Palletized shipment shrink-wrapped for all-weather protection.",
                status: "Accepted",
                createdAt: "2026-09-22"
            },
            {
                id: "QUO-9055",
                rfqRef: "RFQ-2026-881",
                buyerName: "Metro Retail Solutions",
                productName: "Industrial Safety Gloves",
                offeredQty: 500,
                uom: "Pairs",
                unitPrice: 4.40,
                subtotal: 2200.00,
                deliveryCharges: 110.00,
                taxAmount: 184.80,
                totalAmount: 2494.80,
                availableStock: 1250,
                deliveryTimeline: "4 business days from PO receipt",
                paymentTerms: "TradeShield B2B Escrow - 100% Release upon Inspection",
                validityDate: "2026-10-25",
                additionalConditions: "Complimentary batch test certificate and individual retail-ready barcode bagging included.",
                status: "Draft",
                createdAt: "2026-10-04"
            }
        ],

        sampleRequests: [
            {
                id: "SMP-402",
                buyerName: "Metro Retail Solutions",
                buyerContact: "metro.procure@example.com | +1 312 555 0192",
                deliveryAddress: "400 N Michigan Ave, Suite 1200, Chicago, IL 60611",
                productName: "Industrial Safety Gloves",
                sampleQty: "2 Pairs (Size M & L)",
                requestDate: "2026-10-01",
                status: "Dispatched", // Pending, Approved, Dispatched, Delivered, Rejected
                dispatchDetails: {
                    courier: "BlueDart Express / DHL Air",
                    trackingNumber: "BD-98217361",
                    dispatchDate: "2026-10-03",
                    estimatedArrival: "2026-10-07",
                    notes: "Sample kit includes certificate of compliance and cut-test swatch."
                }
            },
            {
                id: "SMP-409",
                buyerName: "Apex Packaging Co",
                buyerContact: "samples@apexpkg.example | +1 415 555 8821",
                deliveryAddress: "782 Industrial Blvd, Oakland, CA 94607",
                productName: "Heavy Corrugated Shipping Boxes",
                sampleQty: "1 Box (Flattened sample)",
                requestDate: "2026-10-03",
                status: "Approved",
                dispatchDetails: null
            },
            {
                id: "SMP-415",
                buyerName: "Symphony Hotel Group",
                buyerContact: "facilities@symphonyhotels.example",
                deliveryAddress: "Grand Symphony Tower, San Francisco, CA",
                productName: "Commercial LED Panel Lights 40W",
                sampleQty: "1 Piece",
                requestDate: "2026-10-04",
                status: "Pending",
                dispatchDetails: null
            }
        ],

        collaboration: {
            discoverSuppliers: [
                {
                    id: "COL-SUP-01",
                    businessName: "SteelCraft Global Works",
                    location: "Pune, Maharashtra, India",
                    rating: 4.8,
                    trustTier: "Platinum Tier",
                    categories: ["Hardware", "Industrial Components", "Steel Forging"],
                    monthlySurplusCapacity: "50,000 units / month",
                    specialization: "High-precision CNC machined bolts, nuts, and industrial brackets.",
                    badge: "Verified ISO 9001:2015"
                },
                {
                    id: "COL-SUP-02",
                    businessName: "EcoPolymer Packaging Ltd",
                    location: "Ahmedabad, Gujarat, India",
                    rating: 4.7,
                    trustTier: "Gold Tier",
                    categories: ["Packaging", "Biodegradable Polymers"],
                    monthlySurplusCapacity: "120,000 meters / month",
                    specialization: "Biodegradable cushioning wrap, pallet shrink wraps, and corrugated corners.",
                    badge: "Zero-Carbon Certified"
                },
                {
                    id: "COL-SUP-03",
                    businessName: "Vanguard Textiles & Safety",
                    location: "Tirupur, Tamil Nadu, India",
                    rating: 4.9,
                    trustTier: "Platinum Tier",
                    categories: ["Safety Equipment", "Textiles", "PPE"],
                    monthlySurplusCapacity: "80,000 pairs / month",
                    specialization: "Specialized heat-resistant Kevlar yarn spinning and chemical dipping facilities.",
                    badge: "CE & OSHA Compliant"
                }
            ],
            requests: [
                {
                    id: "COL-REQ-101",
                    type: "received",
                    partnerName: "SteelCraft Global Works",
                    productCategory: "Hardware & Fasteners",
                    requirementTitle: "North American Infrastructure Tender - Split Fulfillment",
                    requiredQty: "25,000 Bolt Sets",
                    proposedContribution: "Partner handles 15,000; Your company handles 10,000",
                    status: "Pending", // Pending, Accepted, Rejected
                    notes: "Large tender closing Oct 20th. Seeking reliable joint partner to satisfy MOQ requirements without overextending single-line capacity.",
                    date: "2026-10-03"
                },
                {
                    id: "COL-REQ-102",
                    type: "sent",
                    partnerName: "Vanguard Textiles & Safety",
                    productCategory: "Safety Equipment",
                    requirementTitle: "Industrial Safety Gloves - Bulk Nitrile Dipping",
                    requiredQty: "20,000 Pairs",
                    proposedContribution: "We supply woven liner blanks; Vanguard provides nitrile dipping and finishing",
                    status: "Accepted",
                    notes: "Joint execution for Metro Retail Solutions extended annual framework contract.",
                    date: "2026-09-28"
                }
            ]
        },

        conversations: [
            {
                id: "CONV-01",
                buyerName: "Metro Retail Solutions",
                contactPerson: "David Miller (Procurement Director)",
                avatar: "M",
                lastMessage: "Thank you for the sample dispatch tracking number. We will inspect it as soon as it arrives.",
                lastTimestamp: "10:45 AM",
                unread: 0,
                context: {
                    type: "Sample & RFQ",
                    ref: "RFQ-2026-881 / SMP-402",
                    product: "Industrial Safety Gloves"
                },
                messages: [
                    {
                        sender: "buyer",
                        text: "Hello! We have submitted RFQ-2026-881 for 500 pairs of cut-resistant gloves. Could you confirm if sample dispatch is possible?",
                        time: "Yesterday, 3:15 PM"
                    },
                    {
                        sender: "supplier",
                        text: "Hi David! Yes, we have received your request and approved sample SMP-402. We are packing two pairs today.",
                        time: "Yesterday, 4:20 PM"
                    },
                    {
                        sender: "supplier",
                        text: "The sample has been dispatched via BlueDart Express (AWB: BD-98217361). Expected delivery is Oct 7th.",
                        time: "Today, 9:30 AM"
                    },
                    {
                        sender: "buyer",
                        text: "Thank you for the sample dispatch tracking number. We will inspect it as soon as it arrives.",
                        time: "Today, 10:45 AM"
                    }
                ]
            },
            {
                id: "CONV-02",
                buyerName: "BrightBuild Industries",
                contactPerson: "Elena Rostova (Lead Sourcing Engineer)",
                avatar: "B",
                lastMessage: "Could you confirm if the 3-year warranty covers driver unit replacement as well?",
                lastTimestamp: "Yesterday",
                unread: 1,
                context: {
                    type: "Quotation",
                    ref: "QUO-9042",
                    product: "Commercial LED Panel Lights 40W"
                },
                messages: [
                    {
                        sender: "supplier",
                        text: "Greetings Elena, we have prepared quotation QUO-9042 for your 100 LED panel lights with bulk tiered pricing.",
                        time: "Oct 1, 11:00 AM"
                    },
                    {
                        sender: "buyer",
                        text: "Could you confirm if the 3-year warranty covers driver unit replacement as well?",
                        time: "Yesterday, 2:10 PM"
                    }
                ]
            },
            {
                id: "CONV-03",
                buyerName: "PackLine Distributors",
                contactPerson: "Marcus Vance (Logistics Manager)",
                avatar: "P",
                lastMessage: "We submitted RFQ-2026-892 for 1,000 custom 5-ply cartons. Can you print our brand logo in 2 colors?",
                lastTimestamp: "2 days ago",
                unread: 0,
                context: {
                    type: "RFQ",
                    ref: "RFQ-2026-892",
                    product: "Heavy Corrugated Shipping Boxes"
                },
                messages: [
                    {
                        sender: "buyer",
                        text: "We submitted RFQ-2026-892 for 1,000 custom 5-ply cartons. Can you print our brand logo in 2 colors?",
                        time: "Oct 2, 4:05 PM"
                    },
                    {
                        sender: "supplier",
                        text: "Hello Marcus! Yes, our flexo and screen-printing lines support up to 4 colors. We will include that in the quotation.",
                        time: "Oct 3, 10:15 AM"
                    }
                ]
            }
        ],

        orders: [
            {
                id: "ORD-98231",
                buyerName: "Metro Retail Solutions",
                buyerContact: "operations@metroretail.example",
                deliveryAddress: "Metro Logistics Center, Dock 14, Chicago, IL 60611",
                productName: "Industrial Safety Gloves",
                productSku: "SKU-IND-GLV-01",
                orderedQty: 500,
                uom: "Pairs",
                unitPrice: 4.90,
                orderAmount: 2450.00,
                taxAmount: 196.00,
                shippingAmount: 110.00,
                totalAmount: 2756.00,
                orderDate: "2026-09-29",
                expectedDeliveryDate: "2026-10-15",
                status: "In Production", // Pending, Confirmed, In Production, Shipped, Delivered, Cancelled
                linkedQuote: "QUO-8940",
                paymentStatus: "Escrow Protected",
                shipmentRef: "SHP-7701"
            },
            {
                id: "ORD-98190",
                buyerName: "OfficeHub Enterprises",
                buyerContact: "supplies@officehub.example",
                deliveryAddress: "OfficeHub Tower, Suite 400, Chicago, IL 60601",
                productName: "A4 Copy Paper Premium 80 GSM",
                productSku: "SKU-OFC-PPR-02",
                orderedQty: 200,
                uom: "Reams",
                unitPrice: 4.45,
                orderAmount: 890.00,
                taxAmount: 71.20,
                shippingAmount: 40.00,
                totalAmount: 1001.20,
                orderDate: "2026-09-25",
                expectedDeliveryDate: "2026-10-06",
                status: "Shipped",
                linkedQuote: "QUO-8991",
                paymentStatus: "Released to Supplier",
                shipmentRef: "SHP-7690"
            },
            {
                id: "ORD-97845",
                buyerName: "BrightBuild Industries",
                buyerContact: "receiving@brightbuild.example",
                deliveryAddress: "BrightBuild Construction Site 12, Queens, NY",
                productName: "Commercial LED Panel Lights 40W",
                productSku: "SKU-ELE-LED-03",
                orderedQty: 100,
                uom: "Pieces",
                unitPrice: 16.00,
                orderAmount: 1600.00,
                taxAmount: 128.00,
                shippingAmount: 75.00,
                totalAmount: 1803.00,
                orderDate: "2026-09-18",
                expectedDeliveryDate: "2026-09-28",
                status: "Delivered",
                linkedQuote: "QUO-8820",
                paymentStatus: "Released to Supplier",
                shipmentRef: "SHP-7612"
            },
            {
                id: "ORD-97612",
                buyerName: "PackLine Distributors",
                buyerContact: "orders@packline.example",
                deliveryAddress: "PackLine Central Depot, Mississauga, ON, Canada",
                productName: "Heavy Corrugated Shipping Boxes",
                productSku: "SKU-PKG-BOX-04",
                orderedQty: 1000,
                uom: "Boxes",
                unitPrice: 3.10,
                orderAmount: 3100.00,
                taxAmount: 248.00,
                shippingAmount: 180.00,
                totalAmount: 3528.00,
                orderDate: "2026-10-01",
                expectedDeliveryDate: "2026-10-22",
                status: "Confirmed",
                linkedQuote: "QUO-9011",
                paymentStatus: "Escrow Protected",
                shipmentRef: null
            }
        ],

        payments: [
            {
                id: "TXN-88412",
                orderRef: "ORD-98231",
                buyerName: "Metro Retail Solutions",
                amount: 2756.00,
                date: "2026-09-29",
                method: "TradeShield Escrow (Commercial Card)",
                status: "Escrow Protected", // Escrow Protected, Released, Pending Clearance, Refunded
                invoiceRef: "INV-2026-091"
            },
            {
                id: "TXN-88401",
                orderRef: "ORD-98190",
                buyerName: "OfficeHub Enterprises",
                amount: 1001.20,
                date: "2026-09-27",
                method: "NEFT / Direct Corporate Wire",
                status: "Released",
                invoiceRef: "INV-2026-088"
            },
            {
                id: "TXN-88350",
                orderRef: "ORD-97845",
                buyerName: "BrightBuild Industries",
                amount: 1803.00,
                date: "2026-09-22",
                method: "TradeShield Escrow (Released on Delivery)",
                status: "Released",
                invoiceRef: "INV-2026-084"
            },
            {
                id: "TXN-88440",
                orderRef: "ORD-97612",
                buyerName: "PackLine Distributors",
                amount: 3528.00,
                date: "2026-10-01",
                method: "TradeShield Escrow (Letter of Credit LC)",
                status: "Escrow Protected",
                invoiceRef: "INV-2026-095"
            }
        ],

        shipments: [
            {
                id: "SHP-7701",
                orderRef: "ORD-98231",
                buyerName: "Metro Retail Solutions",
                courier: "BlueDart Express / DHL Freight",
                trackingNumber: "BLU-99281726",
                dispatchDate: "2026-10-02",
                expectedDeliveryDate: "2026-10-15",
                deliveryAddress: "Metro Logistics Center, Dock 14, Chicago, IL 60611",
                status: "In Transit", // Dispatched, In Transit, Out for Delivery, Delivered
                history: [
                    { time: "2026-10-02 14:00", step: "Dispatched", note: "Package picked up from supplier facility, Bengaluru Hub." },
                    { time: "2026-10-03 08:30", step: "In Transit", note: "Departed Sort Facility - Air Cargo Terminal." },
                    { time: "2026-10-04 18:45", step: "In Transit", note: "Customs clearance completed in transit hub." }
                ]
            },
            {
                id: "SHP-7690",
                orderRef: "ORD-98190",
                buyerName: "OfficeHub Enterprises",
                courier: "Delhivery B2B Freight",
                trackingNumber: "DLV-88273612",
                dispatchDate: "2026-09-28",
                expectedDeliveryDate: "2026-10-06",
                deliveryAddress: "OfficeHub Tower, Suite 400, Chicago, IL 60601",
                status: "Out for Delivery",
                history: [
                    { time: "2026-09-28 10:00", step: "Dispatched", note: "Loaded into linehaul container." },
                    { time: "2026-09-30 16:20", step: "In Transit", note: "Arrived at regional distribution sorting center." },
                    { time: "2026-10-05 07:15", step: "Out for Delivery", note: "Courier van out for morning dock drop." }
                ]
            },
            {
                id: "SHP-7612",
                orderRef: "ORD-97845",
                buyerName: "BrightBuild Industries",
                courier: "FedEx Freight Cargo",
                trackingNumber: "FDX-10293847",
                dispatchDate: "2026-09-20",
                expectedDeliveryDate: "2026-09-28",
                deliveryAddress: "BrightBuild Construction Site 12, Queens, NY",
                status: "Delivered",
                history: [
                    { time: "2026-09-20 11:00", step: "Dispatched", note: "Pallets accepted at cargo terminal." },
                    { time: "2026-09-23 15:40", step: "In Transit", note: "Interstate highway transit completed." },
                    { time: "2026-09-28 11:20", step: "Delivered", note: "Delivered & signed by Receiving Foreman: T. Higgins." }
                ]
            }
        ],

        businessProfile: {
            businessName: "TradeNest Supplies Pvt. Ltd.",
            businessType: "Manufacturer & Wholesale Supplier",
            description: "Leading ISO 9001 certified industrial safety gear, precision packaging, and electrical equipment manufacturer supplying wholesale buyers globally.",
            primaryCategory: "Safety Equipment & Industrial Supplies",
            secondaryCategory: "Packaging & Commercial Electrical",
            registeredAddress: "Plot 42, Peenya Industrial Area, Phase 2, Bengaluru, Karnataka, India - 560058",
            gstin: "29AABCU9603R1ZM",
            pan: "AABCU9603R",
            iec: "IEC-IND-8829102",
            contactPerson: "Rajesh Sharma",
            designation: "Director of Sales & Operations",
            phone: "+91 98765 43210",
            email: "supplier@example.com",
            supportEmail: "support.supplies@tradenest.example",
            logo: "../../images/TradeNest.webp",
            verificationStatus: "Verified Tier-1 Supplier (Demo Only)",
            verificationDate: "2026-01-15",
            verificationBadge: "Demonstration Verification - Active",
            documents: [
                { id: "DOC-01", name: "GST_Registration_Certificate.pdf", type: "Tax Document", size: "1.4 MB", uploadDate: "2026-01-10", status: "Demo Verified" },
                { id: "DOC-02", name: "Certificate_of_Incorporation_MCA.pdf", type: "Legal Entity", size: "2.8 MB", uploadDate: "2026-01-11", status: "Demo Verified" },
                { id: "DOC-03", name: "MSME_Udyam_Registration.pdf", type: "Enterprise Verification", size: "950 KB", uploadDate: "2026-01-12", status: "Demo Verified" },
                { id: "DOC-04", name: "ISO_9001_2015_Quality_Audit.pdf", type: "Quality Standards", size: "3.2 MB", uploadDate: "2026-01-14", status: "Demo Verified" }
            ]
        },

        reviews: [
            {
                id: "REV-01",
                buyerName: "Metro Retail Solutions",
                rating: 5,
                date: "2026-09-20",
                comment: "Exceptional safety gloves quality! Cut resistance and stitching matched lab test sheets. Prompt communication and dispatch."
            },
            {
                id: "REV-02",
                buyerName: "BrightBuild Industries",
                rating: 5,
                date: "2026-09-29",
                comment: "Commercial LED panels arrived in flawless condition. 4000 lumens verified. Looking forward to our next quarterly procurement."
            },
            {
                id: "REV-03",
                buyerName: "OfficeHub Enterprises",
                rating: 4.8,
                date: "2026-09-28",
                comment: "Copy paper rolls were well shrink-wrapped, zero moisture damage during transit. Competitive bulk discount."
            }
        ],

        settings: {
            emailNotifications: true,
            smsAlerts: true,
            rfqInstantAlert: true,
            orderStatusNotification: true,
            lowStockThresholdAlert: true,
            marketingUpdates: false,
            currency: "USD ($)",
            timezone: "GMT+5:30 (India Standard Time)",
            autoAcceptRFQUnder: 0,
            twoFactorAuth: false
        },

        activity: [
            { id: "ACT-01", icon: "📥", text: "New RFQ (RFQ-2026-892) received from PackLine Distributors", time: "1 hour ago", link: "rfqs" },
            { id: "ACT-02", icon: "🚚", text: "Shipment SHP-7690 is now Out for Delivery to OfficeHub Enterprises", time: "3 hours ago", link: "shipping" },
            { id: "ACT-03", icon: "💰", text: "Payment of $2,756.00 for Order #ORD-98231 secured in TradeShield Escrow", time: "Yesterday", link: "payments" },
            { id: "ACT-04", icon: "🧪", text: "Sample Request SMP-402 dispatched via BlueDart Express", time: "2 days ago", link: "samples" },
            { id: "ACT-05", icon: "⚠️", text: "Low stock alert: A4 Copy Paper Premium has 240 reams remaining", time: "2 days ago", link: "inventory" }
        ]
    };

    // Helper: Safe Read
    function readStorage(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return fallback;
            return JSON.parse(data);
        } catch (e) {
            console.warn(`[SupplierStore] Error reading key ${key}:`, e);
            return fallback;
        }
    }

    // Helper: Safe Write
    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[SupplierStore] Error writing key ${key}:`, e);
            return false;
        }
    }

    // Initialize Store
    function initStore() {
        if (!localStorage.getItem(KEYS.PRODUCTS)) writeStorage(KEYS.PRODUCTS, SEED_DATA.products);
        if (!localStorage.getItem(KEYS.RFQS)) writeStorage(KEYS.RFQS, SEED_DATA.rfqs);
        if (!localStorage.getItem(KEYS.QUOTATIONS)) writeStorage(KEYS.QUOTATIONS, SEED_DATA.quotations);
        if (!localStorage.getItem(KEYS.SAMPLES)) writeStorage(KEYS.SAMPLES, SEED_DATA.sampleRequests);
        if (!localStorage.getItem(KEYS.COLLABORATION)) writeStorage(KEYS.COLLABORATION, SEED_DATA.collaboration.discoverSuppliers);
        if (!localStorage.getItem(KEYS.COLLAB_REQUESTS)) writeStorage(KEYS.COLLAB_REQUESTS, SEED_DATA.collaboration.requests);
        if (!localStorage.getItem(KEYS.CONVERSATIONS)) writeStorage(KEYS.CONVERSATIONS, SEED_DATA.conversations);
        if (!localStorage.getItem(KEYS.ORDERS)) writeStorage(KEYS.ORDERS, SEED_DATA.orders);
        if (!localStorage.getItem(KEYS.PAYMENTS)) writeStorage(KEYS.PAYMENTS, SEED_DATA.payments);
        if (!localStorage.getItem(KEYS.SHIPMENTS)) writeStorage(KEYS.SHIPMENTS, SEED_DATA.shipments);
        if (!localStorage.getItem(KEYS.BUSINESS_PROFILE)) writeStorage(KEYS.BUSINESS_PROFILE, SEED_DATA.businessProfile);
        if (!localStorage.getItem(KEYS.REVIEWS)) writeStorage(KEYS.REVIEWS, SEED_DATA.reviews);
        if (!localStorage.getItem(KEYS.SETTINGS)) writeStorage(KEYS.SETTINGS, SEED_DATA.settings);
        if (!localStorage.getItem(KEYS.ACTIVITY)) writeStorage(KEYS.ACTIVITY, SEED_DATA.activity);

        // Sync supplier products to buyer catalogue store
        syncProductsToBuyerCatalogue();
    }

    // Sync products so they appear in buyer views
    function syncProductsToBuyerCatalogue() {
        try {
            const products = getProducts();
            localStorage.setItem("tradenest_custom_products", JSON.stringify(products));
        } catch (err) {
            console.warn("[SupplierStore] sync error:", err);
        }
    }

    // Add activity log
    function logActivity(icon, text, link) {
        const activities = readStorage(KEYS.ACTIVITY, SEED_DATA.activity);
        const newAct = {
            id: "ACT-" + Date.now(),
            icon: icon || "📌",
            text: text,
            time: "Just now",
            link: link || "overview"
        };
        activities.unshift(newAct);
        if (activities.length > 20) activities.pop();
        writeStorage(KEYS.ACTIVITY, activities);
        notifyChange();
    }

    // Event system for real-time reactive UI updates
    const listeners = [];
    function subscribe(callback) {
        if (typeof callback === "function") {
            listeners.push(callback);
        }
    }
    function notifyChange(moduleName) {
        listeners.forEach(fn => {
            try { fn(moduleName); } catch (e) { console.error(e); }
        });
        syncProductsToBuyerCatalogue();
    }

    // ==========================================
    // MODULE 17 & 18: Products & Inventory
    // ==========================================
    function getProducts() {
        return readStorage(KEYS.PRODUCTS, SEED_DATA.products);
    }

    function getProductById(id) {
        const products = getProducts();
        return products.find(p => p.id === id || p.sku === id) || null;
    }

    function saveProduct(productData) {
        const products = getProducts();
        const existingIdx = products.findIndex(p => p.id === productData.id);

        if (existingIdx >= 0) {
            products[existingIdx] = { ...products[existingIdx], ...productData, updatedAt: new Date().toISOString() };
            logActivity("📦", `Product "${productData.name}" updated`, "products");
        } else {
            const newId = "PRD-" + String(products.length + 1).padStart(3, "0");
            const newProduct = {
                id: newId,
                status: "active",
                createdAt: new Date().toISOString().split("T")[0],
                ...productData
            };
            products.unshift(newProduct);
            logActivity("➕", `New product "${newProduct.name}" added to catalogue`, "products");
        }

        writeStorage(KEYS.PRODUCTS, products);
        notifyChange("products");
        return true;
    }

    function deleteProduct(id) {
        let products = getProducts();
        const prod = products.find(p => p.id === id);
        if (prod) {
            products = products.filter(p => p.id !== id);
            writeStorage(KEYS.PRODUCTS, products);
            logActivity("🗑️", `Product "${prod.name}" removed from catalogue`, "products");
            notifyChange("products");
            return true;
        }
        return false;
    }

    function toggleProductStatus(id) {
        const products = getProducts();
        const prod = products.find(p => p.id === id);
        if (prod) {
            prod.status = prod.status === "active" ? "unavailable" : "active";
            writeStorage(KEYS.PRODUCTS, products);
            logActivity("🔄", `Product "${prod.name}" marked as ${prod.status}`, "products");
            notifyChange("products");
            return prod.status;
        }
        return null;
    }

    function updateStock(id, newAvailableStock, newMinThreshold) {
        const products = getProducts();
        const prod = products.find(p => p.id === id);
        if (prod) {
            prod.availableStock = parseInt(newAvailableStock, 10) || 0;
            if (newMinThreshold !== undefined && newMinThreshold !== null) {
                prod.minThreshold = parseInt(newMinThreshold, 10) || 0;
            }
            prod.lastStockUpdated = new Date().toISOString().split("T")[0];
            writeStorage(KEYS.PRODUCTS, products);
            logActivity("📑", `Stock for "${prod.name}" updated to ${prod.availableStock} ${prod.uom}`, "inventory");
            notifyChange("inventory");
            return true;
        }
        return false;
    }

    // ==========================================
    // MODULE 19: Incoming RFQs
    // ==========================================
    function getRFQs() {
        return readStorage(KEYS.RFQS, SEED_DATA.rfqs);
    }

    function getRFQById(id) {
        return getRFQs().find(r => r.id === id) || null;
    }

    function updateRFQStatus(id, newStatus, reason) {
        const rfqs = getRFQs();
        const rfq = rfqs.find(r => r.id === id);
        if (rfq) {
            rfq.status = newStatus;
            if (reason) rfq.declineReason = reason;
            writeStorage(KEYS.RFQS, rfqs);
            logActivity(
                newStatus === "Accepted" ? "✅" : (newStatus === "Declined" ? "❌" : "📝"),
                `RFQ ${id} from ${rfq.buyerName} marked as ${newStatus}`,
                "rfqs"
            );
            notifyChange("rfqs");
            return true;
        }
        return false;
    }

    // ==========================================
    // MODULE 20: Quotations
    // ==========================================
    function getQuotations() {
        return readStorage(KEYS.QUOTATIONS, SEED_DATA.quotations);
    }

    function getQuotationById(id) {
        return getQuotations().find(q => q.id === id) || null;
    }

    function saveQuotation(quoteData) {
        const quotations = getQuotations();
        const existingIdx = quotations.findIndex(q => q.id === quoteData.id);

        if (existingIdx >= 0) {
            quotations[existingIdx] = { ...quotations[existingIdx], ...quoteData, updatedAt: new Date().toISOString() };
            logActivity("📝", `Quotation ${quoteData.id} revised for ${quoteData.buyerName}`, "quotations");
        } else {
            const newId = "QUO-" + (9000 + quotations.length + 1);
            const newQuote = {
                id: newId,
                status: "Sent",
                createdAt: new Date().toISOString().split("T")[0],
                ...quoteData
            };
            quotations.unshift(newQuote);

            // Mark RFQ as Quoted if linked
            if (quoteData.rfqRef) {
                const rfqs = getRFQs();
                const matchedRFQ = rfqs.find(r => r.id === quoteData.rfqRef);
                if (matchedRFQ) {
                    matchedRFQ.status = "Quoted";
                    matchedRFQ.quotedRef = newId;
                    writeStorage(KEYS.RFQS, rfqs);
                }
            }

            logActivity("📤", `Quotation ${newId} sent to ${quoteData.buyerName} ($${quoteData.totalAmount || quoteData.subtotal})`, "quotations");
        }

        writeStorage(KEYS.QUOTATIONS, quotations);
        notifyChange("quotations");
        return true;
    }

    function deleteQuotation(id) {
        let quotations = getQuotations();
        quotations = quotations.filter(q => q.id !== id);
        writeStorage(KEYS.QUOTATIONS, quotations);
        notifyChange("quotations");
        return true;
    }

    // ==========================================
    // MODULE 21: Sample Requests
    // ==========================================
    function getSampleRequests() {
        return readStorage(KEYS.SAMPLES, SEED_DATA.sampleRequests);
    }

    function getSampleRequestById(id) {
        return getSampleRequests().find(s => s.id === id) || null;
    }

    function updateSampleStatus(id, newStatus, dispatchDetails) {
        const samples = getSampleRequests();
        const sample = samples.find(s => s.id === id);
        if (sample) {
            sample.status = newStatus;
            if (dispatchDetails) {
                sample.dispatchDetails = dispatchDetails;
            }
            writeStorage(KEYS.SAMPLES, samples);
            logActivity(
                newStatus === "Dispatched" ? "🚚" : "🧪",
                `Sample Request ${id} for ${sample.buyerName} updated to ${newStatus}`,
                "samples"
            );
            notifyChange("samples");
            return true;
        }
        return false;
    }

    // ==========================================
    // MODULE 22: Supplier Collaboration Network
    // ==========================================
    function getCollaborationSuppliers() {
        return readStorage(KEYS.COLLABORATION, SEED_DATA.collaboration.discoverSuppliers);
    }

    function getCollaborationRequests() {
        return readStorage(KEYS.COLLAB_REQUESTS, SEED_DATA.collaboration.requests);
    }

    function saveCollaborationRequest(reqData) {
        const requests = getCollaborationRequests();
        const newReq = {
            id: "COL-REQ-" + (requests.length + 101),
            type: "sent",
            status: "Pending",
            date: new Date().toISOString().split("T")[0],
            ...reqData
        };
        requests.unshift(newReq);
        writeStorage(KEYS.COLLAB_REQUESTS, requests);
        logActivity("🤝", `Collaboration proposal sent to ${reqData.partnerName}`, "collaboration");
        notifyChange("collaboration");
        return newReq;
    }

    function updateCollaborationStatus(id, newStatus) {
        const requests = getCollaborationRequests();
        const req = requests.find(r => r.id === id);
        if (req) {
            req.status = newStatus;
            writeStorage(KEYS.COLLAB_REQUESTS, requests);
            logActivity("🤝", `Collaboration request ${id} ${newStatus.toLowerCase()}`, "collaboration");
            notifyChange("collaboration");
            return true;
        }
        return false;
    }

    // ==========================================
    // MODULE 23: Buyer Communication
    // ==========================================
    function getConversations() {
        return readStorage(KEYS.CONVERSATIONS, SEED_DATA.conversations);
    }

    function getConversationById(id) {
        return getConversations().find(c => c.id === id) || null;
    }

    function sendMessage(convId, text, sender) {
        const conversations = getConversations();
        const conv = conversations.find(c => c.id === convId);
        if (!conv) return null;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMsg = {
            sender: sender || "supplier",
            text: text,
            time: timeStr
        };

        conv.messages.push(newMsg);
        conv.lastMessage = text;
        conv.lastTimestamp = timeStr;
        if (sender === "buyer") conv.unread = (conv.unread || 0) + 1;

        writeStorage(KEYS.CONVERSATIONS, conversations);
        notifyChange("communication");

        // Simulate Buyer response if supplier sent message
        if (sender === "supplier") {
            setTimeout(() => {
                simulateBuyerReply(convId);
            }, 1800);
        }

        return newMsg;
    }

    function simulateBuyerReply(convId) {
        const conversations = getConversations();
        const conv = conversations.find(c => c.id === convId);
        if (!conv) return;

        const replies = [
            "Thank you for the quick clarification! We are reviewing the terms now.",
            "Acknowledged. Our logistics team will inspect the dispatch details.",
            "Great, please ensure the commercial invoice includes the GSTIN reference.",
            "Sounds good! We have forwarded this to our finance desk for milestone release.",
            "Perfect. We appreciate the prompt turnaround on this procurement."
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        conv.messages.push({
            sender: "buyer",
            text: randomReply,
            time: timeStr
        });
        conv.lastMessage = randomReply;
        conv.lastTimestamp = timeStr;
        conv.unread = 1;

        writeStorage(KEYS.CONVERSATIONS, conversations);
        notifyChange("communication");
    }

    // ==========================================
    // MODULE 24: Orders Management
    // ==========================================
    function getOrders() {
        return readStorage(KEYS.ORDERS, SEED_DATA.orders);
    }

    function getOrderById(id) {
        return getOrders().find(o => o.id === id) || null;
    }

    function updateOrderStatus(id, newStatus) {
        const orders = getOrders();
        const order = orders.find(o => o.id === id);
        if (order) {
            order.status = newStatus;
            
            // If marked delivered, update payment to Released if in escrow
            if (newStatus === "Delivered") {
                order.paymentStatus = "Released to Supplier";
                const payments = getPayments();
                const txn = payments.find(p => p.orderRef === id);
                if (txn) {
                    txn.status = "Released";
                    writeStorage(KEYS.PAYMENTS, payments);
                }
            }

            writeStorage(KEYS.ORDERS, orders);
            logActivity("🛒", `Order #${id} status updated to "${newStatus}"`, "orders");
            notifyChange("orders");
            return true;
        }
        return false;
    }

    // ==========================================
    // MODULE 25: Payments & Transactions
    // ==========================================
    function getPayments() {
        return readStorage(KEYS.PAYMENTS, SEED_DATA.payments);
    }

    function getPaymentByOrder(orderId) {
        return getPayments().find(p => p.orderRef === orderId) || null;
    }

    // ==========================================
    // MODULE 26: Shipping & Delivery
    // ==========================================
    function getShipments() {
        return readStorage(KEYS.SHIPMENTS, SEED_DATA.shipments);
    }

    function getShipmentById(id) {
        return getShipments().find(s => s.id === id) || null;
    }

    function createShipment(shipmentData) {
        const shipments = getShipments();
        const newId = "SHP-" + (7700 + shipments.length + 1);
        const newShipment = {
            id: newId,
            status: "Dispatched",
            dispatchDate: new Date().toISOString().split("T")[0],
            history: [
                {
                    time: new Date().toLocaleString(),
                    step: "Dispatched",
                    note: `Dispatched via ${shipmentData.courier || "Express Cargo"}. Tracking AWB generated.`
                }
            ],
            ...shipmentData
        };

        shipments.unshift(newShipment);
        writeStorage(KEYS.SHIPMENTS, shipments);

        // Also update linked order to "Shipped"
        if (shipmentData.orderRef) {
            const orders = getOrders();
            const ord = orders.find(o => o.id === shipmentData.orderRef);
            if (ord) {
                ord.status = "Shipped";
                ord.shipmentRef = newId;
                writeStorage(KEYS.ORDERS, orders);
            }
        }

        logActivity("🚚", `Shipment ${newId} dispatched for Order ${shipmentData.orderRef || ""}`, "shipping");
        notifyChange("shipping");
        return newShipment;
    }

    function updateShipmentStatus(shipmentId, newStatus, note) {
        const shipments = getShipments();
        const shipment = shipments.find(s => s.id === shipmentId);
        if (shipment) {
            shipment.status = newStatus;
            shipment.history.push({
                time: new Date().toLocaleString(),
                step: newStatus,
                note: note || `Shipment advanced to milestone: ${newStatus}`
            });

            // If delivered, update order to delivered
            if (newStatus === "Delivered" && shipment.orderRef) {
                updateOrderStatus(shipment.orderRef, "Delivered");
            }

            writeStorage(KEYS.SHIPMENTS, shipments);
            logActivity("🚚", `Shipment ${shipmentId} milestone: ${newStatus}`, "shipping");
            notifyChange("shipping");
            return true;
        }
        return false;
    }

    // ==========================================
    // MODULE 16 & 28: Business Profile & Verification
    // ==========================================
    function getBusinessProfile() {
        return readStorage(KEYS.BUSINESS_PROFILE, SEED_DATA.businessProfile);
    }

    function saveBusinessProfile(profileData) {
        const current = getBusinessProfile();
        const updated = { ...current, ...profileData };
        writeStorage(KEYS.BUSINESS_PROFILE, updated);
        logActivity("🏢", "Business profile and GSTIN credentials updated", "business-profile");
        notifyChange("business-profile");
        return updated;
    }

    function addDocument(docName, docType, docSize) {
        const profile = getBusinessProfile();
        const newDoc = {
            id: "DOC-" + String(profile.documents.length + 1).padStart(2, "0"),
            name: docName,
            type: docType || "Verification Document",
            size: docSize || "1.2 MB",
            uploadDate: new Date().toISOString().split("T")[0],
            status: "Demo Verification: Under Simulation Review"
        };
        profile.documents.push(newDoc);
        writeStorage(KEYS.BUSINESS_PROFILE, profile);
        logActivity("📄", `Uploaded document "${docName}" (Demonstration Verification)`, "business-profile");
        notifyChange("business-profile");
        return newDoc;
    }

    // ==========================================
    // MODULE 27: Performance & Trust Score
    // ==========================================
    function getReviews() {
        return readStorage(KEYS.REVIEWS, SEED_DATA.reviews);
    }

    function calculateTrustMetrics() {
        const orders = getOrders();
        const shipments = getShipments();
        const rfqs = getRFQs();
        const reviews = getReviews();

        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => o.status === "Delivered").length;
        const fulfilmentRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : "98.4";

        const deliveredShipments = shipments.filter(s => s.status === "Delivered");
        const onTimeDeliveries = deliveredShipments.length;
        const onTimeDeliveryRate = deliveredShipments.length > 0 ? "96.8" : "96.5";

        const avgResponseTime = "1.8 hours";

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = (totalRating / reviews.length).toFixed(1);

        // Calculate demonstration Trust Score (out of 100)
        // Formula weighting: 40% fulfilment, 30% on-time, 20% ratings, 10% compliance
        const trustScore = 96;

        return {
            trustScore: trustScore,
            tier: "Platinum Tier Verified",
            fulfilmentRate: fulfilmentRate + "%",
            onTimeDeliveryRate: onTimeDeliveryRate + "%",
            avgResponseTime: avgResponseTime,
            completedOrdersCount: completedOrders,
            totalOrdersCount: totalOrders,
            rating: avgRating,
            reviewsCount: reviews.length,
            isDemonstration: true
        };
    }

    // ==========================================
    // MODULE 28: Settings
    // ==========================================
    function getSettings() {
        return readStorage(KEYS.SETTINGS, SEED_DATA.settings);
    }

    function saveSettings(settingsData) {
        const current = getSettings();
        const updated = { ...current, ...settingsData };
        writeStorage(KEYS.SETTINGS, updated);
        logActivity("⚙️", "Supplier preferences and notification settings saved", "settings");
        notifyChange("settings");
        return updated;
    }

    // ==========================================
    // MODULE 15: Calculate Dashboard Statistics
    // ==========================================
    function getDashboardStatistics() {
        const products = getProducts();
        const rfqs = getRFQs();
        const quotations = getQuotations();
        const samples = getSampleRequests();
        const orders = getOrders();

        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.status === "active").length;
        const incomingRFQs = rfqs.filter(r => r.status === "New").length;
        const pendingQuotations = quotations.filter(q => q.status === "Sent" || q.status === "Draft").length;
        const sampleRequests = samples.filter(s => s.status === "Pending" || s.status === "Approved").length;
        const activeOrders = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length;
        const completedOrders = orders.filter(o => o.status === "Delivered").length;
        const lowStockProducts = products.filter(p => p.availableStock <= p.minThreshold).length;

        const totalRevenue = orders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);

        return {
            totalProducts,
            activeProducts,
            incomingRFQs,
            pendingQuotations,
            sampleRequests,
            activeOrders,
            completedOrders,
            lowStockProducts,
            totalRevenue: "$" + totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        };
    }

    function getActivityFeed() {
        return readStorage(KEYS.ACTIVITY, SEED_DATA.activity);
    }

    // Auto-run init
    initStore();

    // Export Store API to Window
    window.SupplierStore = {
        initStore,
        subscribe,
        notifyChange,
        logActivity,
        // Module 15
        getDashboardStatistics,
        getActivityFeed,
        // Module 16 & 28
        getBusinessProfile,
        saveBusinessProfile,
        addDocument,
        // Module 17 & 18
        getProducts,
        getProductById,
        saveProduct,
        deleteProduct,
        toggleProductStatus,
        updateStock,
        // Module 19
        getRFQs,
        getRFQById,
        updateRFQStatus,
        // Module 20
        getQuotations,
        getQuotationById,
        saveQuotation,
        deleteQuotation,
        // Module 21
        getSampleRequests,
        getSampleRequestById,
        updateSampleStatus,
        // Module 22
        getCollaborationSuppliers,
        getCollaborationRequests,
        saveCollaborationRequest,
        updateCollaborationStatus,
        // Module 23
        getConversations,
        getConversationById,
        sendMessage,
        // Module 24
        getOrders,
        getOrderById,
        updateOrderStatus,
        // Module 25
        getPayments,
        getPaymentByOrder,
        // Module 26
        getShipments,
        getShipmentById,
        createShipment,
        updateShipmentStatus,
        // Module 27
        getReviews,
        calculateTrustMetrics,
        // Module 28
        getSettings,
        saveSettings
    };

})(window);
