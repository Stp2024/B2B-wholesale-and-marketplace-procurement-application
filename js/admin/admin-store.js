/**
 * TradeNest Admin Store
 * File: js/admin/admin-store.js
 * 
 * Central state management, data synthesis, and persistence engine
 * for TradeNest Administrative Platform:
 * - Admin Overview
 * - Module 30: Buyer and Supplier Management
 * - Module 31: Business Verification
 * - Module 32: Product Monitoring
 * - Module 33: Risk and Activity Monitoring
 * - Module 34: Order and Transaction Monitoring
 * - Module 35: Complaints and Reports
 * - Module 36: Trust Score Monitoring
 * - Module 37: Reports and Analytics
 */

(function (window) {
  "use strict";

  const ADMIN_STORAGE_KEY = "tradenest_admin_store_v1";
  const ADMIN_CURRENT_USER_KEY = "tradenestAdminCurrentUser";

  const defaultAdmin = {
    id: "admin-001",
    role: "admin",
    fullName: "Vikram Sengupta",
    email: "admin@tradenest.com",
    designation: "Head of Marketplace Governance & Operations",
    department: "Risk, Trust & Safety",
    avatar: "VS",
    lastLogin: "2026-10-06T09:30:00Z"
  };

  // Seed Verifications (Module 31)
  const seedVerifications = [
    {
      id: "VRF-2026-001",
      businessName: "Apex Gear Co.",
      userRole: "supplier",
      category: "Industrial Equipment",
      gstin: "29AABCU9603R1ZM",
      pan: "AABCU9603R",
      cin: "U29100KA2018PTC112345",
      address: "Plot 42, Peenya Industrial Area, Phase II",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560058",
      contactPerson: "Rajesh Kulkarni",
      email: "rajesh@apexgear.com",
      phone: "+91 98450 12345",
      submissionDate: "2026-09-28",
      status: "Approved",
      reviewedBy: "Vikram Sengupta",
      reviewedDate: "2026-09-30",
      reviewNotes: "GSTIN verified active in CBIC registry. PAN and CIN validated against MCA database. Factory inspection report cleared.",
      documents: [
        { name: "GST Registration Certificate (REG-06)", docNo: "29AABCU9603R1ZM", verified: true, type: "pdf", size: "1.4 MB" },
        { name: "Permanent Account Number (PAN)", docNo: "AABCU9603R", verified: true, type: "pdf", size: "850 KB" },
        { name: "Certificate of Incorporation", docNo: "U29100KA2018PTC112345", verified: true, type: "pdf", size: "2.1 MB" },
        { name: "ISO 9001:2015 Manufacturing Certificate", docNo: "QMS-IND-2024-88", verified: true, type: "pdf", size: "1.8 MB" }
      ]
    },
    {
      id: "VRF-2026-002",
      businessName: "PaperPro Solutions",
      userRole: "supplier",
      category: "Office Supplies",
      gstin: "27AABCP4412Q1ZX",
      pan: "AABCP4412Q",
      cin: "U21010MH2019PTC223411",
      address: "B-12, Lower Parel Mill Compound, S.B. Marg",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400013",
      contactPerson: "Neha Sharma",
      email: "neha@paperpro.com",
      phone: "+91 98200 98765",
      submissionDate: "2026-10-01",
      status: "Approved",
      reviewedBy: "Vikram Sengupta",
      reviewedDate: "2026-10-02",
      reviewNotes: "All documents aligned. Bank account cancelled cheque name matches registered business name.",
      documents: [
        { name: "GST Certificate (REG-06)", docNo: "27AABCP4412Q1ZX", verified: true, type: "pdf", size: "1.1 MB" },
        { name: "PAN Card", docNo: "AABCP4412Q", verified: true, type: "pdf", size: "720 KB" },
        { name: "FSC Chain of Custody Certificate", docNo: "FSC-C109923", verified: true, type: "pdf", size: "1.9 MB" }
      ]
    },
    {
      id: "VRF-2026-003",
      businessName: "Titan Fasteners & Alloys",
      userRole: "supplier",
      category: "Hardware & Tools",
      gstin: "07AAACT8819M1ZV",
      pan: "AAACT8819M",
      cin: "U28991DL2021PTC310928",
      address: "Sector 58, Industrial Corridor",
      city: "Faridabad",
      state: "Haryana",
      pincode: "121004",
      contactPerson: "Amit Verma",
      email: "amit@titanfasteners.in",
      phone: "+91 98110 54321",
      submissionDate: "2026-10-04",
      status: "Pending Review",
      reviewedBy: null,
      reviewedDate: null,
      reviewNotes: "Initial application received. Awaiting review of proof of registered office lease deed.",
      documents: [
        { name: "GST Certificate", docNo: "07AAACT8819M1ZV", verified: false, type: "pdf", size: "1.3 MB" },
        { name: "PAN Card", docNo: "AAACT8819M", verified: false, type: "pdf", size: "640 KB" },
        { name: "Registered Office Rent Agreement", docNo: "LEASE-2024-FBD", verified: false, type: "pdf", size: "3.2 MB" }
      ]
    },
    {
      id: "VRF-2026-004",
      businessName: "GreenAgro Organics India",
      userRole: "supplier",
      category: "Agricultural Supplies",
      gstin: "33AABCG5521H1ZQ",
      pan: "AABCG5521H",
      cin: "U01111TN2020PTC139044",
      address: "18, SIDCO Industrial Estate, Ambattur",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600098",
      contactPerson: "Karthik Raja",
      email: "karthik@greenagro.org",
      phone: "+91 94440 33211",
      submissionDate: "2026-10-05",
      status: "Information Requested",
      reviewedBy: "Vikram Sengupta",
      reviewedDate: "2026-10-05",
      reviewNotes: "GSTIN active, but PAN name has slight spelling variation vs incorporation certificate. Requested updated Board Resolution.",
      documents: [
        { name: "GST Certificate", docNo: "33AABCG5521H1ZQ", verified: true, type: "pdf", size: "1.2 MB" },
        { name: "PAN Business", docNo: "AABCG5521H", verified: false, type: "pdf", size: "790 KB" },
        { name: "Board Resolution for TradeNest Signatory", docNo: "BR-2026-GA", verified: false, type: "pdf", size: "950 KB" }
      ]
    },
    {
      id: "VRF-2026-005",
      businessName: "North Star Retail Pvt. Ltd.",
      userRole: "buyer",
      category: "Wholesale Buyer / Enterprise Retail",
      gstin: "29AABCN3209K1ZY",
      pan: "AABCN3209K",
      cin: "U52100KA2017PTC108922",
      address: "102, Brigade Gateway, Malleshwaram",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560055",
      contactPerson: "Aisha Patel",
      email: "aisha.patel@tradenest.com",
      phone: "+91 98765 43210",
      submissionDate: "2026-09-25",
      status: "Approved",
      reviewedBy: "Vikram Sengupta",
      reviewedDate: "2026-09-26",
      reviewNotes: "Enterprise procurement profile verified with multi-warehouse delivery addresses.",
      documents: [
        { name: "GST Certificate", docNo: "29AABCN3209K1ZY", verified: true, type: "pdf", size: "1.5 MB" },
        { name: "PAN Corporate", docNo: "AABCN3209K", verified: true, type: "pdf", size: "810 KB" },
        { name: "Trade License & Shop Act", docNo: "BBMP-TL-2024-541", verified: true, type: "pdf", size: "1.2 MB" }
      ]
    },
    {
      id: "VRF-2026-006",
      businessName: "QuickLogix Express Supplies",
      userRole: "supplier",
      category: "Packaging & Logistics",
      gstin: "19AABCQ9901F1ZT",
      pan: "AABCQ9901F",
      cin: "U63090WB2022PTC240188",
      address: "74, Taratala Road, Alipore",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700088",
      contactPerson: "Debanjan Das",
      email: "debanjan@quicklogix.in",
      phone: "+91 98300 77123",
      submissionDate: "2026-10-06",
      status: "Pending Review",
      reviewedBy: null,
      reviewedDate: null,
      reviewNotes: "Fresh submission today. Verification of MSME Udyam certificate and factory premises required.",
      documents: [
        { name: "GST Certificate", docNo: "19AABCQ9901F1ZT", verified: false, type: "pdf", size: "1.4 MB" },
        { name: "Udyam Registration Certificate", docNo: "UDYAM-WB-10-003411", verified: false, type: "pdf", size: "1.1 MB" }
      ]
    }
  ];

  // Seed Product Moderation (Module 32)
  const seedProductModeration = [
    {
      id: "product-001",
      name: "Industrial Safety Gloves (EN388 Level 5)",
      supplierId: "supplier-001",
      supplierName: "Apex Gear Co.",
      category: "Industrial Equipment",
      price: 180,
      moq: 500,
      stock: 1200,
      moderationStatus: "Approved",
      reportedCount: 0,
      lastReportReason: null,
      complianceScore: 98,
      reviewedDate: "2026-09-30",
      reviewNotes: "Certified CE/EN standard uploaded. Accurate technical description."
    },
    {
      id: "product-002",
      name: "High-Impact Industrial Safety Helmets",
      supplierId: "supplier-001",
      supplierName: "Apex Gear Co.",
      category: "Industrial Equipment",
      price: 520,
      moq: 200,
      stock: 850,
      moderationStatus: "Approved",
      reportedCount: 0,
      lastReportReason: null,
      complianceScore: 95,
      reviewedDate: "2026-09-30",
      reviewNotes: "IS 2925 standard test certificate verified."
    },
    {
      id: "product-003",
      name: "A4 Copy Paper Premium 80 GSM (500 Sheets)",
      supplierId: "supplier-002",
      supplierName: "PaperPro Solutions",
      category: "Office Supplies",
      price: 240,
      moq: 100,
      stock: 3500,
      moderationStatus: "Approved",
      reportedCount: 1,
      lastReportReason: "Buyer claimed 75 GSM delivered instead of 80 GSM in sample batch.",
      complianceScore: 91,
      reviewedDate: "2026-10-02",
      reviewNotes: "Sample laboratory report validated 80.2 GSM. Buyer complaint resolved."
    },
    {
      id: "product-004",
      name: "Corrugated Shipping Boxes - Heavy 5-Ply",
      supplierId: "supplier-004",
      supplierName: "PackRight Corp.",
      category: "Packaging",
      price: 35,
      moq: 1000,
      stock: 15000,
      moderationStatus: "Approved",
      reportedCount: 0,
      lastReportReason: null,
      complianceScore: 94,
      reviewedDate: "2026-10-01",
      reviewNotes: "Bursting strength certification verified."
    },
    {
      id: "product-005",
      name: "Industrial High-Bay LED Lights 150W",
      supplierId: "supplier-003",
      supplierName: "Lumina Electric",
      category: "Electrical",
      price: 1850,
      moq: 50,
      stock: 450,
      moderationStatus: "Flagged",
      reportedCount: 2,
      lastReportReason: "Mismatched warranty duration in description vs quotation terms.",
      complianceScore: 78,
      reviewedDate: "2026-10-04",
      reviewNotes: "Listing mentions 5-year replacement warranty, but invoice terms stated 2-year warranty. Under moderation."
    },
    {
      id: "product-006",
      name: "Industrial Stretch Film Roll 23 Micron",
      supplierId: "supplier-004",
      supplierName: "PackRight Corp.",
      category: "Packaging",
      price: 420,
      moq: 100,
      stock: 2200,
      moderationStatus: "Approved",
      reportedCount: 0,
      lastReportReason: null,
      complianceScore: 92,
      reviewedDate: "2026-10-03",
      reviewNotes: "Standard packaging spec."
    },
    {
      id: "product-007",
      name: "Industrial Hydraulic Floor Jack 5-Ton",
      supplierId: "supplier-005",
      supplierName: "SteelCraft Ltd.",
      category: "Machinery",
      price: 12500,
      moq: 10,
      stock: 140,
      moderationStatus: "Approved",
      reportedCount: 1,
      lastReportReason: "Buyer inquiry regarding overload safety valve certification.",
      complianceScore: 89,
      reviewedDate: "2026-10-02",
      reviewNotes: "Load test certificate provided by manufacturer."
    },
    {
      id: "product-008",
      name: "Stainless Steel Precision Ball Bearings",
      supplierId: "supplier-005",
      supplierName: "SteelCraft Ltd.",
      category: "Machinery",
      price: 340,
      moq: 250,
      stock: 4800,
      moderationStatus: "Pending Moderation",
      reportedCount: 0,
      lastReportReason: null,
      complianceScore: 85,
      reviewedDate: null,
      reviewNotes: "New listing with imported alloy specification. Awaiting mill test certificate upload."
    }
  ];

  // Seed Risk & Flagged Monitoring (Module 33)
  const seedRiskRecords = [
    {
      id: "RSK-1001",
      entityType: "Product",
      entityId: "product-005",
      entityName: "Industrial High-Bay LED Lights 150W",
      relatedParty: "Lumina Electric",
      riskLevel: "High",
      riskScore: 84,
      triggerRule: "Warranty & Specification Inconsistency Trigger",
      description: "Multiple buyer flags regarding mismatch between 5-year marketing claim and 2-year formal quotation warranty.",
      detectedDate: "2026-10-04T11:20:00Z",
      status: "Under Investigation",
      adminNotes: "Contacted supplier representative to harmonize marketing claims with formal warranty indemnity.",
      actionHistory: ["Flagged by Compliance Bot", "Moderator Assigned: Vikram Sengupta"]
    },
    {
      id: "RSK-1002",
      entityType: "Account",
      entityId: "buyer-009",
      entityName: "Zenith Global Import-Export",
      relatedParty: "Zenith Global",
      riskLevel: "High",
      riskScore: 89,
      triggerRule: "High-Volume Unfunded RFQ Surge",
      description: "Account created yesterday issued 48 high-value RFQs (>₹1.2 Crore total) in under 3 hours without completing GST profile.",
      detectedDate: "2026-10-05T14:45:00Z",
      status: "Open",
      adminNotes: "Account restricted from issuing new RFQs pending business verification document submission.",
      actionHistory: ["Velocity Check Triggered", "Outbound RFQ issuance temporarily throttled"]
    },
    {
      id: "RSK-1003",
      entityType: "Transaction",
      entityId: "order-105-TX",
      entityName: "Escrow Release Milestone #2",
      relatedParty: "Titan Fasteners & Alloys",
      riskLevel: "Medium",
      riskScore: 68,
      triggerRule: "Bank Account Details Changed Prior to Escrow Release",
      description: "Beneficiary bank account updated 4 hours before scheduled escrow payout of ₹2,40,000.",
      detectedDate: "2026-10-05T18:10:00Z",
      status: "Under Investigation",
      adminNotes: "Payout held for 48-hour cooling period. Telephonic dual-authorization initiated with CFO.",
      actionHistory: ["Cooling Period Invoked", "Dual Verification Requested"]
    },
    {
      id: "RSK-1004",
      entityType: "Account",
      entityId: "supplier-008",
      entityName: "SpeedyPrint Logistics",
      relatedParty: "SpeedyPrint",
      riskLevel: "Low",
      riskScore: 42,
      triggerRule: "Repeated Minor Quotation Revision",
      description: "Supplier revised quotation delivery lead times 3 times on the same active RFQ.",
      detectedDate: "2026-10-06T08:15:00Z",
      status: "Reviewed",
      adminNotes: "Supplier clarified raw material transport delays due to regional festival holidays. Cleared.",
      actionHistory: ["Logged for Quality Index", "Marked Reviewed"]
    }
  ];

  // Seed Complaints & Reports (Module 35)
  const seedComplaints = [
    {
      id: "CMP-2026-081",
      complainantName: "Aisha Patel",
      complainantBusiness: "North Star Retail Pvt. Ltd.",
      complainantRole: "buyer",
      reportedPartyName: "Lumina Electric",
      reportedPartyRole: "supplier",
      category: "Warranty & Specification Misrepresentation",
      relatedOrderId: "ORD-2026-042",
      relatedRfqId: "rfq-202",
      severity: "High",
      subject: "Inconsistent warranty certificate on commercial high-bay units",
      description: "We procured 60 units of commercial high bay lights based on the 5-year replacement guarantee clearly detailed in the catalog. The dispatch box included a 2-year warranty card with limited component coverage.",
      submissionDate: "2026-10-03",
      status: "In Review",
      adminNotes: "Supplier has agreed to issue an official 5-year comprehensive service letter for the specific serial numbers.",
      settlementAction: "Pending Supplier Addendum"
    },
    {
      id: "CMP-2026-082",
      complainantName: "Vikramaditya Rao",
      complainantBusiness: "Kaveri Engineering Works",
      complainantRole: "buyer",
      reportedPartyName: "PackRight Corp.",
      reportedPartyRole: "supplier",
      category: "Transit Moisture Damage",
      relatedOrderId: "ORD-2026-039",
      relatedRfqId: "rfq-204",
      severity: "Medium",
      subject: "Water seepage in corrugated boxes pallet batch",
      description: "Batch #4 of 5-ply cartons arrived with water staining along the base pallets due to unsealed tarp on the logistics vehicle.",
      submissionDate: "2026-09-29",
      status: "Resolved",
      adminNotes: "Supplier refunded ₹18,400 for damaged 500 units and logistics partner penalised. Buyer satisfied.",
      settlementAction: "Partial Escrow Refund Issued"
    },
    {
      id: "CMP-2026-083",
      complainantName: "Rajesh Kulkarni",
      complainantBusiness: "Apex Gear Co.",
      complainantRole: "supplier",
      reportedPartyName: "Metro Buildtech Consortium",
      reportedPartyRole: "buyer",
      category: "Unreasonable Sample Evaluation Delay",
      relatedOrderId: "SMP-2026-112",
      relatedRfqId: "rfq-201",
      severity: "Low",
      subject: "Physical sample holding for 24 days without feedback",
      description: "High-grade kevlar gloves samples worth ₹8,000 sent via express courier. Buyer confirmed receipt but has not provided lab test results or quote feedback.",
      submissionDate: "2026-10-01",
      status: "Open",
      adminNotes: "Administrative reminder sent to buyer procurement desk.",
      settlementAction: "Automated Reminder Triggered"
    },
    {
      id: "CMP-2026-084",
      complainantName: "Sunil Grover",
      complainantBusiness: "Delta Warehousing",
      complainantRole: "buyer",
      reportedPartyName: "SteelCraft Ltd.",
      reportedPartyRole: "supplier",
      category: "Late Dispatch Penalty Inquiry",
      relatedOrderId: "ORD-2026-031",
      relatedRfqId: "rfq-205",
      severity: "Medium",
      subject: "Delivery delayed by 9 business days beyond promised SLA",
      description: "Hydraulic floor jacks were critical for new fulfillment center commissioning. Delay caused warehouse operations downtime.",
      submissionDate: "2026-09-26",
      status: "Resolved",
      adminNotes: "Supplier offered 4% credit memo on subsequent consumable purchase. Buyer agreed to close.",
      settlementAction: "Credit Note Agreed"
    }
  ];

  // Seed Trust Scores & Metrics (Module 36)
  const seedTrustScores = [
    {
      entityId: "supplier-001",
      entityName: "Apex Gear Co.",
      role: "supplier",
      category: "Industrial Equipment",
      trustScore: 94,
      tier: "Elite Partner",
      fulfillmentRate: 99.1,
      onTimeDelivery: 97.4,
      disputeRatio: 0.4,
      buyerRating: 4.9,
      responseTime: "1.2 Hours",
      totalOrdersFulfilled: 142,
      gmvProcessed: 2845000,
      breakdown: {
        identityVerification: 25, // max 25
        operationalReliability: 34, // max 35
        buyerSatisfaction: 19, // max 20
        complianceFinancials: 16 // max 20
      },
      badges: ["ISO Certified", "Zero Open Disputes", "Verified GSTIN"],
      recentFeedback: "Outstanding industrial build quality and punctual bulk delivery."
    },
    {
      entityId: "supplier-003",
      entityName: "Lumina Electric",
      role: "supplier",
      category: "Electrical",
      trustScore: 91,
      tier: "Elite Partner",
      fulfillmentRate: 96.8,
      onTimeDelivery: 95.1,
      disputeRatio: 1.2,
      buyerRating: 4.7,
      responseTime: "2.1 Hours",
      totalOrdersFulfilled: 98,
      gmvProcessed: 3910000,
      breakdown: {
        identityVerification: 25,
        operationalReliability: 32,
        buyerSatisfaction: 18,
        complianceFinancials: 16
      },
      badges: ["Verified GSTIN", "Tested IS Standard"],
      recentFeedback: "High lumen output fixtures. Quotation documentation needs clearer warranty clauses."
    },
    {
      entityId: "supplier-005",
      entityName: "SteelCraft Ltd.",
      role: "supplier",
      category: "Machinery",
      trustScore: 89,
      tier: "Verified Standard",
      fulfillmentRate: 94.5,
      onTimeDelivery: 91.8,
      disputeRatio: 1.8,
      buyerRating: 4.6,
      responseTime: "3.4 Hours",
      totalOrdersFulfilled: 64,
      gmvProcessed: 5210000,
      breakdown: {
        identityVerification: 24,
        operationalReliability: 31,
        buyerSatisfaction: 18,
        complianceFinancials: 16
      },
      badges: ["Heavy Machinery Specialist", "Verified GSTIN"],
      recentFeedback: "Robust equipment construction, slight transit delays on heavy freight."
    },
    {
      entityId: "supplier-002",
      entityName: "PaperPro Solutions",
      role: "supplier",
      category: "Office Supplies",
      trustScore: 88,
      tier: "Verified Standard",
      fulfillmentRate: 98.2,
      onTimeDelivery: 96.5,
      disputeRatio: 0.9,
      buyerRating: 4.8,
      responseTime: "1.8 Hours",
      totalOrdersFulfilled: 210,
      gmvProcessed: 1840000,
      breakdown: {
        identityVerification: 24,
        operationalReliability: 32,
        buyerSatisfaction: 18,
        complianceFinancials: 14
      },
      badges: ["FSC Certified", "Verified GSTIN"],
      recentFeedback: "Clean cut paper, consistently jam-free in high-speed copiers."
    },
    {
      entityId: "supplier-004",
      entityName: "PackRight Corp.",
      role: "supplier",
      category: "Packaging",
      trustScore: 86,
      tier: "Verified Standard",
      fulfillmentRate: 95.0,
      onTimeDelivery: 92.4,
      disputeRatio: 1.5,
      buyerRating: 4.5,
      responseTime: "2.8 Hours",
      totalOrdersFulfilled: 115,
      gmvProcessed: 1420000,
      breakdown: {
        identityVerification: 23,
        operationalReliability: 30,
        buyerSatisfaction: 17,
        complianceFinancials: 16
      },
      badges: ["Verified GSTIN"],
      recentFeedback: "Reliable corrugated strength, packaging moisture protection can improve."
    },
    {
      entityId: "buyer-001",
      entityName: "North Star Retail Pvt. Ltd.",
      role: "buyer",
      category: "Enterprise Retail Buyer",
      trustScore: 96,
      tier: "Elite Partner",
      fulfillmentRate: 100.0,
      onTimeDelivery: 100.0,
      disputeRatio: 0.5,
      buyerRating: 4.9,
      responseTime: "1.0 Hours",
      totalOrdersFulfilled: 28,
      gmvProcessed: 1490000,
      breakdown: {
        identityVerification: 25,
        operationalReliability: 35,
        buyerSatisfaction: 19,
        complianceFinancials: 17
      },
      badges: ["Fast Escrow Funder", "Prompt PO Clearance", "Verified GSTIN"],
      recentFeedback: "Punctual escrow fundings and transparent RFQ specifications."
    }
  ];

  // Seed Admin Activity Log
  const seedAdminActivities = [
    {
      id: "ACT-ADM-01",
      type: "verification",
      icon: "🛡️",
      title: "Business Verification Approved",
      description: "Approved GST and PAN credentials for Apex Gear Co. (Supplier).",
      timestamp: "2026-10-06T09:12:00Z",
      actor: "Vikram Sengupta"
    },
    {
      id: "ACT-ADM-02",
      type: "moderation",
      icon: "🔍",
      title: "Product Listing Flagged for Moderation",
      description: "Flagged High-Bay LED Lights 150W for warranty claim verification.",
      timestamp: "2026-10-05T16:45:00Z",
      actor: "Compliance Bot / Vikram Sengupta"
    },
    {
      id: "ACT-ADM-03",
      type: "risk",
      icon: "⚠️",
      title: "High Risk Velocity Check Triggered",
      description: "Restricted Zenith Global Import-Export for issuing 48 unfunded RFQs.",
      timestamp: "2026-10-05T14:48:00Z",
      actor: "Risk Engine"
    },
    {
      id: "ACT-ADM-04",
      type: "complaint",
      icon: "⚖️",
      title: "Dispute Ticket CMP-2026-082 Resolved",
      description: "Escrow partial credit note of ₹18,400 confirmed between Kaveri Eng. & PackRight.",
      timestamp: "2026-10-04T12:30:00Z",
      actor: "Vikram Sengupta"
    },
    {
      id: "ACT-ADM-05",
      type: "order",
      icon: "📦",
      title: "High-Value Transaction Verified",
      description: "Escrow release of ₹1,25,000 cleared for SteelCraft Ltd. on Order #103.",
      timestamp: "2026-10-04T10:15:00Z",
      actor: "Financial Desk"
    }
  ];

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function getBaseAdminState() {
    return {
      adminUser: defaultAdmin,
      verifications: seedVerifications,
      productModerations: seedProductModeration,
      riskRecords: seedRiskRecords,
      complaints: seedComplaints,
      trustScores: seedTrustScores,
      activities: seedAdminActivities,
      settings: {
        autoFlagThresholdScore: 70,
        highRiskRfqVelocityLimit: 25,
        defaultEscrowHoldDays: 3,
        requireGstinVerificationForQuotes: true
      }
    };
  }

  function getAdminStore() {
    try {
      const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (!raw) {
        const fresh = getBaseAdminState();
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(fresh));
        return clone(fresh);
      }
      const parsed = JSON.parse(raw);
      // Ensure all arrays exist
      const fallback = getBaseAdminState();
      Object.keys(fallback).forEach((k) => {
        if (!parsed[k]) {
          parsed[k] = fallback[k];
        }
      });
      return parsed;
    } catch (e) {
      console.warn("[AdminStore] Corrupted storage. Resetting to defaults.", e);
      const fresh = getBaseAdminState();
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(fresh));
      return clone(fresh);
    }
  }

  function saveAdminStore(state) {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state));
      notifySubscribers();
      return state;
    } catch (e) {
      console.error("[AdminStore] Error saving store:", e);
      return state;
    }
  }

  function resetAdminStore() {
    const fresh = getBaseAdminState();
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(fresh));
    notifySubscribers();
    return fresh;
  }

  // Cross-Store Data Aggregation (Synthesizes live Buyer, Supplier, and User accounts)
  function getUnifiedUsers() {
    const adminState = getAdminStore();
    const result = [];

    // 1. Check registered accounts from tradenestUsers
    try {
      const regRaw = localStorage.getItem("tradenestUsers");
      if (regRaw) {
        const regUsers = JSON.parse(regRaw);
        if (Array.isArray(regUsers)) {
          regUsers.forEach((u) => {
            if (u && u.email) {
              result.push({
                id: u.id || `user-${Math.abs(u.email.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`,
                name: u.fullName || u.name || "Enterprise User",
                businessName: u.businessName || u.company || "Independent Enterprise",
                role: u.role || "buyer",
                email: u.email,
                phone: u.phone || "+91 98000 00000",
                category: u.category || "General Commerce",
                registrationDate: u.registeredAt || "2026-09-20",
                accountStatus: u.accountStatus || "Active",
                verificationStatus: u.verificationStatus || (u.role === "admin" ? "Verified" : "Pending"),
                city: u.city || "Bengaluru",
                state: u.state || "Karnataka",
                gstin: u.gst || u.gstin || "29AAAAA0000A1Z5"
              });
            }
          });
        }
      }
    } catch (e) {}

    // 2. Add Standard Demo Buyer
    const existingBuyer = result.find((u) => u.email === "aisha.patel@tradenest.com");
    if (!existingBuyer) {
      result.unshift({
        id: "buyer-001",
        name: "Aisha Patel",
        businessName: "North Star Retail Pvt. Ltd.",
        role: "buyer",
        email: "aisha.patel@tradenest.com",
        phone: "+91 98765 43210",
        category: "Wholesale Buyer / Enterprise Retail",
        registrationDate: "2026-08-15",
        accountStatus: "Active",
        verificationStatus: "Verified",
        city: "Bengaluru",
        state: "Karnataka",
        gstin: "29AABCN3209K1ZY"
      });
    }

    // 3. Add Standard Demo Suppliers from TradeNestStore
    const demoSuppliers = [
      { id: "supplier-001", name: "Rajesh Kulkarni", businessName: "Apex Gear Co.", role: "supplier", email: "rajesh@apexgear.com", phone: "+91 98450 12345", category: "Industrial Equipment", registrationDate: "2026-07-10", accountStatus: "Active", verificationStatus: "Verified", city: "Bengaluru", state: "Karnataka", gstin: "29AABCU9603R1ZM" },
      { id: "supplier-002", name: "Neha Sharma", businessName: "PaperPro Solutions", role: "supplier", email: "neha@paperpro.com", phone: "+91 98200 98765", category: "Office Supplies", registrationDate: "2026-08-01", accountStatus: "Active", verificationStatus: "Verified", city: "Mumbai", state: "Maharashtra", gstin: "27AABCP4412Q1ZX" },
      { id: "supplier-003", name: "Sunil Batra", businessName: "Lumina Electric", role: "supplier", email: "sunil@luminaelectric.in", phone: "+91 98100 23456", category: "Electrical", registrationDate: "2026-07-22", accountStatus: "Active", verificationStatus: "Verified", city: "Delhi NCR", state: "Delhi", gstin: "07AABCL3391K1ZS" },
      { id: "supplier-004", name: "Paresh Patel", businessName: "PackRight Corp.", role: "supplier", email: "paresh@packright.com", phone: "+91 98980 45678", category: "Packaging", registrationDate: "2026-08-19", accountStatus: "Active", verificationStatus: "Verified", city: "Ahmedabad", state: "Gujarat", gstin: "24AABCP7712M1ZN" },
      { id: "supplier-005", name: "Harpreet Singh", businessName: "SteelCraft Ltd.", role: "supplier", email: "harpreet@steelcraft.co.in", phone: "+91 98220 89012", category: "Machinery", registrationDate: "2026-07-05", accountStatus: "Active", verificationStatus: "Verified", city: "Pune", state: "Maharashtra", gstin: "27AABCS1190N1ZU" },
      { id: "supplier-006", name: "Amit Verma", businessName: "Titan Fasteners & Alloys", role: "supplier", email: "amit@titanfasteners.in", phone: "+91 98110 54321", category: "Hardware & Tools", registrationDate: "2026-10-04", accountStatus: "Active", verificationStatus: "Pending", city: "Faridabad", state: "Haryana", gstin: "07AAACT8819M1ZV" },
      { id: "buyer-009", name: "Sameer Joshi", businessName: "Zenith Global Import-Export", role: "buyer", email: "sameer@zenithglobal.com", phone: "+91 99887 76655", category: "Import / Export Trading", registrationDate: "2026-10-05", accountStatus: "Suspended", verificationStatus: "Pending", city: "Surat", state: "Gujarat", gstin: "24AAACZ9901F1Z2" }
    ];

    demoSuppliers.forEach((s) => {
      if (!result.some((u) => u.email === s.email)) {
        result.push(s);
      }
    });

    return result;
  }

  // Cross-Store Unified Orders
  function getUnifiedOrders() {
    let orders = [];
    if (window.TradeNestStore && typeof window.TradeNestStore.getStore === "function") {
      const tnStore = window.TradeNestStore.getStore();
      if (Array.isArray(tnStore.orders) && tnStore.orders.length > 0) {
        orders = clone(tnStore.orders);
      }
    }

    if (orders.length === 0) {
      try {
        const raw = localStorage.getItem("tradenest_demo_store_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.orders) && parsed.orders.length > 0) {
            orders = clone(parsed.orders);
          }
        }
      } catch (e) {}
    }

    // Comprehensive Fallback / Seed Orders
    if (orders.length === 0) {
      orders = [
        {
          id: "ORD-2026-101",
          buyerId: "buyer-001",
          buyerName: "Aisha Patel",
          buyerBusiness: "North Star Retail Pvt. Ltd.",
          supplierId: "supplier-001",
          supplierName: "Apex Gear Co.",
          productName: "Industrial Safety Gloves (EN388 Level 5)",
          quantity: 500,
          unit: "pairs",
          unitPrice: 180,
          totalAmount: 90000,
          orderStatus: "Delivered",
          paymentStatus: "Released to Supplier",
          shipmentStatus: "Delivered",
          courier: "BlueDart Express",
          trackingNo: "BD-98214401",
          createdAt: "2026-09-20",
          deliveredAt: "2026-09-24",
          escrowTransactionId: "ESC-88192-TN"
        },
        {
          id: "ORD-2026-102",
          buyerId: "buyer-001",
          buyerName: "Aisha Patel",
          buyerBusiness: "North Star Retail Pvt. Ltd.",
          supplierId: "supplier-002",
          supplierName: "PaperPro Solutions",
          productName: "A4 Copy Paper Premium 80 GSM",
          quantity: 200,
          unit: "reams",
          unitPrice: 240,
          totalAmount: 48000,
          orderStatus: "In Production",
          paymentStatus: "Escrow Funded",
          shipmentStatus: "Pending Dispatch",
          courier: "Delhivery Freight",
          trackingNo: "DLH-441209",
          createdAt: "2026-10-02",
          deliveredAt: null,
          escrowTransactionId: "ESC-88240-TN"
        },
        {
          id: "ORD-2026-103",
          buyerId: "buyer-001",
          buyerName: "Aisha Patel",
          buyerBusiness: "North Star Retail Pvt. Ltd.",
          supplierId: "supplier-005",
          supplierName: "SteelCraft Ltd.",
          productName: "Industrial Hydraulic Floor Jack 5-Ton",
          quantity: 10,
          unit: "units",
          unitPrice: 12500,
          totalAmount: 125000,
          orderStatus: "Shipped",
          paymentStatus: "Escrow Funded",
          shipmentStatus: "In Transit",
          courier: "GATI KWE Heavy",
          trackingNo: "GT-1092837",
          createdAt: "2026-10-03",
          deliveredAt: null,
          escrowTransactionId: "ESC-88295-TN"
        },
        {
          id: "ORD-2026-104",
          buyerId: "buyer-002",
          buyerName: "Karan Johar",
          buyerBusiness: "Westside Commercial Furnishings",
          supplierId: "supplier-003",
          supplierName: "Lumina Electric",
          productName: "High-Bay LED Lights 150W",
          quantity: 50,
          unit: "fixtures",
          unitPrice: 1850,
          totalAmount: 92500,
          orderStatus: "Confirmed",
          paymentStatus: "Payment Pending",
          shipmentStatus: "Unassigned",
          courier: "Safexpress",
          trackingNo: "SF-991204",
          createdAt: "2026-10-05",
          deliveredAt: null,
          escrowTransactionId: "ESC-88310-TN"
        },
        {
          id: "ORD-2026-105",
          buyerId: "buyer-003",
          buyerName: "Manish Agarwal",
          buyerBusiness: "Agarwal Logistics Logistics",
          supplierId: "supplier-004",
          supplierName: "PackRight Corp.",
          productName: "Corrugated Shipping Boxes - Heavy 5-Ply",
          quantity: 3000,
          unit: "boxes",
          unitPrice: 35,
          totalAmount: 105000,
          orderStatus: "Delivered",
          paymentStatus: "Released to Supplier",
          shipmentStatus: "Delivered",
          courier: "TCI Express",
          trackingNo: "TCI-66210",
          createdAt: "2026-09-28",
          deliveredAt: "2026-10-01",
          escrowTransactionId: "ESC-88177-TN"
        }
      ];
    }
    return orders;
  }

  // Unified RFQs
  function getUnifiedRFQs() {
    let rfqs = [];
    if (window.TradeNestStore && typeof window.TradeNestStore.getStore === "function") {
      const tnStore = window.TradeNestStore.getStore();
      if (Array.isArray(tnStore.rfqs) && tnStore.rfqs.length > 0) {
        rfqs = clone(tnStore.rfqs);
      }
    }

    if (rfqs.length === 0) {
      try {
        const raw = localStorage.getItem("tradenest_demo_store_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.rfqs)) rfqs = clone(parsed.rfqs);
        }
      } catch (e) {}
    }

    if (rfqs.length === 0) {
      rfqs = [
        { id: "RFQ-2026-201", title: "Bulk Requirement: EN388 Cut-Resistant Gloves", buyerName: "Aisha Patel", category: "Industrial Equipment", quantity: 1500, targetPrice: 170, status: "Offers Received", createdAt: "2026-09-27" },
        { id: "RFQ-2026-202", title: "Commercial High-Bay LED Lights 150W", buyerName: "Aisha Patel", category: "Electrical", quantity: 60, targetPrice: 1800, status: "Quotation Accepted", createdAt: "2026-10-01" },
        { id: "RFQ-2026-203", title: "Heavy Duty 5-Ply Corrugated Master Cartons", buyerName: "Manish Agarwal", category: "Packaging", quantity: 5000, targetPrice: 32, status: "Open for Bids", createdAt: "2026-10-04" },
        { id: "RFQ-2026-204", title: "A4 Copy Paper Reams 80 GSM (Quarterly Contract)", buyerName: "Vikramaditya Rao", category: "Office Supplies", quantity: 1200, targetPrice: 230, status: "Under Review", createdAt: "2026-10-05" }
      ];
    }
    return rfqs;
  }

  // Unified Products
  function getUnifiedProducts() {
    let products = [];
    if (window.TradeNestStore && typeof window.TradeNestStore.getStore === "function") {
      const tnStore = window.TradeNestStore.getStore();
      if (Array.isArray(tnStore.products) && tnStore.products.length > 0) {
        products = clone(tnStore.products);
      }
    }

    if (products.length === 0) {
      try {
        const raw = localStorage.getItem("tradenest_demo_store_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.products)) products = clone(parsed.products);
        }
      } catch (e) {}
    }

    // Merge with Product Moderation state
    const adminState = getAdminStore();
    const moderationMap = {};
    adminState.productModerations.forEach((item) => {
      moderationMap[item.id] = item;
    });

    const result = (products.length ? products : seedProductModeration).map((prod) => {
      const mod = moderationMap[prod.id] || {};
      return {
        id: prod.id,
        name: prod.name,
        category: prod.category,
        supplierName: prod.supplierName || mod.supplierName || "Verified Supplier",
        supplierId: prod.supplierId || mod.supplierId || "supplier-001",
        price: prod.price || mod.price || 0,
        moq: prod.moq || mod.moq || 100,
        stock: prod.stock || mod.stock || 500,
        image: prod.image || "../../images/products/industrial-safety-gloves.webp",
        moderationStatus: mod.moderationStatus || "Approved",
        reportedCount: mod.reportedCount || 0,
        lastReportReason: mod.lastReportReason || null,
        complianceScore: mod.complianceScore || 90,
        reviewNotes: mod.reviewNotes || "Complies with listing standards"
      };
    });

    return result;
  }

  // Activity Logger
  function logAdminActivity(type, title, description, actor) {
    const state = getAdminStore();
    const iconMap = {
      verification: "🛡️",
      moderation: "🔍",
      risk: "⚠️",
      complaint: "⚖️",
      order: "📦",
      user: "👥",
      system: "⚙️"
    };

    const newActivity = {
      id: `ACT-ADM-${Date.now()}`,
      type: type || "system",
      icon: iconMap[type] || "📌",
      title: title || "Administrative Action",
      description: description || "",
      timestamp: new Date().toISOString(),
      actor: actor || (state.adminUser ? state.adminUser.fullName : "Administrator")
    };

    state.activities.unshift(newActivity);
    if (state.activities.length > 50) {
      state.activities.pop();
    }
    saveAdminStore(state);
    return newActivity;
  }

  // Reactive Subscription Engine
  const subscribers = [];
  function subscribe(fn) {
    if (typeof fn === "function") {
      subscribers.push(fn);
    }
    return () => {
      const idx = subscribers.indexOf(fn);
      if (idx > -1) subscribers.splice(idx, 1);
    };
  }

  function notifySubscribers() {
    subscribers.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.warn("[AdminStore] Subscriber error:", err);
      }
    });
  }

  // Currency & Date Formatting Helpers
  function formatCurrency(val) {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  }

  function formatDate(isoStr) {
    if (!isoStr) return "—";
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function formatTimeAgo(isoStr) {
    if (!isoStr) return "Just now";
    const past = new Date(isoStr).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - past) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  }

  // Status Action Handlers
  function updateVerificationStatus(verifId, newStatus, notes) {
    const state = getAdminStore();
    const item = state.verifications.find((v) => v.id === verifId);
    if (!item) return false;

    item.status = newStatus;
    if (notes) item.reviewNotes = notes;
    item.reviewedBy = state.adminUser.fullName;
    item.reviewedDate = new Date().toISOString().split("T")[0];

    // If verified, update the unified user status in registered users
    if (newStatus === "Approved") {
      updateUserVerificationStatus(item.businessName, "Verified");
    } else if (newStatus === "Rejected") {
      updateUserVerificationStatus(item.businessName, "Rejected");
    }

    logAdminActivity(
      "verification",
      `Business Verification: ${newStatus}`,
      `${item.businessName} was updated to '${newStatus}' by ${state.adminUser.fullName}.`
    );

    saveAdminStore(state);
    return true;
  }

  function updateUserVerificationStatus(businessName, status) {
    try {
      const regRaw = localStorage.getItem("tradenestUsers");
      if (regRaw) {
        const users = JSON.parse(regRaw);
        if (Array.isArray(users)) {
          let touched = false;
          users.forEach((u) => {
            if (u && (u.businessName === businessName || u.company === businessName)) {
              u.verificationStatus = status;
              touched = true;
            }
          });
          if (touched) {
            localStorage.setItem("tradenestUsers", JSON.stringify(users));
          }
        }
      }
    } catch (e) {}
  }

  function updateUserAccountStatus(userId, newStatus) {
    try {
      const regRaw = localStorage.getItem("tradenestUsers");
      if (regRaw) {
        const users = JSON.parse(regRaw);
        if (Array.isArray(users)) {
          const user = users.find((u) => u.id === userId || u.email === userId);
          if (user) {
            user.accountStatus = newStatus;
            localStorage.setItem("tradenestUsers", JSON.stringify(users));
          }
        }
      }
    } catch (e) {}

    logAdminActivity(
      "user",
      `User Account Status: ${newStatus}`,
      `Account ${userId} status changed to '${newStatus}'.`
    );
    notifySubscribers();
    return true;
  }

  function updateProductModeration(productId, newStatus, notes) {
    const state = getAdminStore();
    let mod = state.productModerations.find((p) => p.id === productId);
    if (!mod) {
      mod = {
        id: productId,
        moderationStatus: newStatus,
        reviewedDate: new Date().toISOString().split("T")[0],
        reviewNotes: notes || ""
      };
      state.productModerations.push(mod);
    } else {
      mod.moderationStatus = newStatus;
      mod.reviewedDate = new Date().toISOString().split("T")[0];
      if (notes) mod.reviewNotes = notes;
      if (newStatus === "Approved") mod.reportedCount = 0;
    }

    logAdminActivity(
      "moderation",
      `Product Moderation: ${newStatus}`,
      `Product [${productId}] moderation status set to '${newStatus}'.`
    );

    saveAdminStore(state);
    return true;
  }

  function updateRiskStatus(riskId, newStatus, adminNotes) {
    const state = getAdminStore();
    const item = state.riskRecords.find((r) => r.id === riskId);
    if (!item) return false;

    item.status = newStatus;
    if (adminNotes) item.adminNotes = adminNotes;
    if (!item.actionHistory) item.actionHistory = [];
    item.actionHistory.push(`Marked '${newStatus}' by ${state.adminUser.fullName}`);

    logAdminActivity(
      "risk",
      `Risk Ticket ${newStatus}`,
      `Risk item ${item.id} (${item.entityName}) updated to '${newStatus}'.`
    );

    saveAdminStore(state);
    return true;
  }

  function updateComplaintStatus(complaintId, newStatus, notes, settlementAction) {
    const state = getAdminStore();
    const item = state.complaints.find((c) => c.id === complaintId);
    if (!item) return false;

    item.status = newStatus;
    if (notes) item.adminNotes = notes;
    if (settlementAction) item.settlementAction = settlementAction;

    logAdminActivity(
      "complaint",
      `Dispute ${item.id} ${newStatus}`,
      `Complaint between ${item.complainantName} & ${item.reportedPartyName} set to '${newStatus}'.`
    );

    saveAdminStore(state);
    return true;
  }

  // Calculation of Global Admin Statistics
  function calculateAdminStats() {
    const users = getUnifiedUsers();
    const buyers = users.filter((u) => u.role === "buyer");
    const suppliers = users.filter((u) => u.role === "supplier");
    const products = getUnifiedProducts();
    const orders = getUnifiedOrders();
    const rfqs = getUnifiedRFQs();
    const adminState = getAdminStore();

    const pendingVerifications = adminState.verifications.filter(
      (v) => v.status === "Pending Review" || v.status === "Information Requested"
    ).length;

    const flaggedProducts = products.filter(
      (p) => p.moderationStatus === "Flagged" || p.moderationStatus === "Pending Moderation"
    ).length;

    const highRiskItems = adminState.riskRecords.filter(
      (r) => r.riskLevel === "High" && r.status !== "Resolved"
    ).length;

    const openComplaints = adminState.complaints.filter(
      (c) => c.status === "Open" || c.status === "In Review"
    ).length;

    const totalGMV = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const completedOrders = orders.filter((o) => o.orderStatus === "Delivered").length;
    const pendingOrders = orders.filter((o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length;

    return {
      totalUsers: users.length,
      totalBuyers: buyers.length,
      totalSuppliers: suppliers.length,
      totalProducts: products.length,
      totalRfqs: rfqs.length,
      totalOrders: orders.length,
      completedOrders,
      pendingOrders,
      pendingVerifications,
      flaggedProducts,
      highRiskItems,
      openComplaints,
      totalGMV,
      formattedGMV: formatCurrency(totalGMV)
    };
  }

  // Export window namespace
  window.AdminStore = {
    ADMIN_STORAGE_KEY,
    defaultAdmin,
    getAdminStore,
    saveAdminStore,
    resetAdminStore,
    getUnifiedUsers,
    getUnifiedOrders,
    getUnifiedRFQs,
    getUnifiedProducts,
    calculateAdminStats,
    updateVerificationStatus,
    updateUserAccountStatus,
    updateProductModeration,
    updateRiskStatus,
    updateComplaintStatus,
    logAdminActivity,
    subscribe,
    notifySubscribers,
    formatCurrency,
    formatDate,
    formatTimeAgo
  };
})(window);
