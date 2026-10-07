/*
==========================================================
 TradeNest - Shared JavaScript
 Covers:
 - Shared navigation and active page state
 - Smooth scrolling
 - Back-to-top button
 - Product search, filters and sorting
 - Supplier search, filters and sorting
 - Discover Suppliers search
 - Contact form validation and demo submission
 - FAQ/details interaction
 - CTA handling
 - URL query parameters
 - Image fallback handling
 - Toast notifications
 - Basic accessibility helpers
 - Demo-only localStorage for recent searches
==========================================================
*/

"use strict";

document.addEventListener("DOMContentLoaded", function () {
    initSharedNavigation();
    initSmoothScrolling();
    initBackToTop();
    initProductPage();
    initSupplierPage();
    initDiscoverSuppliersPage();
    initContactForm();
    initFAQ();
    initButtonsAndLinks();
    initImageFallbacks();
    initAccessibility();
    restoreSearchState();
});


/* =========================================================
   GENERAL HELPERS
========================================================= */

function $(selector, parent) {
    return (parent || document).querySelector(selector);
}

function $$(selector, parent) {
    return Array.from((parent || document).querySelectorAll(selector));
}

function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function getNumber(value) {
    if (value === null || value === undefined) {
        return 0;
    }

    var cleaned = String(value)
        .replace(/₹/g, "")
        .replace(/,/g, "")
        .replace(/[^\d.]/g, "");

    var number = parseFloat(cleaned);

    return Number.isFinite(number) ? number : 0;
}

function getText(element, selector) {
    var child = selector ? $(selector, element) : element;

    return child ? child.textContent.trim() : "";
}


/* =========================================================
   TOAST NOTIFICATION
========================================================= */

function showToast(message, type) {
    var existing = $("#tradenest-toast");

    if (!existing) {
        existing = document.createElement("div");

        existing.id = "tradenest-toast";
        existing.setAttribute("role", "status");
        existing.setAttribute("aria-live", "polite");

        Object.assign(existing.style, {
            position: "fixed",
            right: "24px",
            bottom: "24px",
            zIndex: "9999",
            maxWidth: "360px",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "#29252b",
            color: "#ffffff",
            fontSize: "14px",
            lineHeight: "1.5",
            boxShadow: "0 10px 30px rgba(0,0,0,.18)",
            opacity: "0",
            transform: "translateY(12px)",
            transition:
                "opacity .25s ease, transform .25s ease"
        });

        document.body.appendChild(existing);
    }

    if (type === "error") {
        existing.style.background = "#8b3a3a";
    } else if (type === "success") {
        existing.style.background = "#496b55";
    } else {
        existing.style.background = "#29252b";
    }

    existing.textContent = message;

    existing.style.opacity = "1";
    existing.style.transform = "translateY(0)";

    clearTimeout(existing._toastTimer);

    existing._toastTimer = setTimeout(function () {
        existing.style.opacity = "0";
        existing.style.transform = "translateY(12px)";
    }, 3200);
}


/* =========================================================
   NO RESULTS MESSAGE
========================================================= */

function createNoResultsMessage(container, message) {
    var oldMessage = $(".tn-no-results", container);

    if (oldMessage) {
        oldMessage.remove();
    }

    var element = document.createElement("div");

    element.className = "tn-no-results";
    element.textContent =
        message || "No matching results found.";

    Object.assign(element.style, {
        gridColumn: "1 / -1",
        padding: "32px",
        textAlign: "center",
        borderRadius: "12px",
        background: "#f7f5f6",
        color: "#706a72",
        border: "1px solid #e5dfe4",
        marginTop: "10px"
    });

    container.appendChild(element);
}

function removeNoResultsMessage(container) {
    var oldMessage = $(".tn-no-results", container);

    if (oldMessage) {
        oldMessage.remove();
    }
}


/* =========================================================
   RECENT SEARCH STORAGE
========================================================= */

function saveRecentSearch(key, value) {
    if (!value) {
        return;
    }

    try {
        var saved = JSON.parse(
            localStorage.getItem("tradenest_" + key) || "[]"
        );

        if (!Array.isArray(saved)) {
            saved = [];
        }

        saved = saved.filter(function (item) {
            return item !== value;
        });

        saved.unshift(value);

        saved = saved.slice(0, 5);

        localStorage.setItem(
            "tradenest_" + key,
            JSON.stringify(saved)
        );
    } catch (error) {
        // localStorage is optional for this frontend demo.
    }
}


/* =========================================================
   SHARED NAVIGATION
========================================================= */

function initSharedNavigation() {
    var currentPath = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    if (!currentPath) {
        currentPath = "index.html";
    }

    $$(".nav-link, .main-navigation a, .nav-menu a").forEach(
        function (link) {
            var href = link.getAttribute("href");

            if (
                !href ||
                href === "#" ||
                href.indexOf("javascript:") === 0
            ) {
                return;
            }

            var linkPath = href
                .split("?")[0]
                .split("#")[0]
                .split("/")
                .pop()
                .toLowerCase();

            if (
                linkPath === currentPath &&
                currentPath !== "index.html"
            ) {
                link.classList.add("active");
            }
        }
    );

    var brandLinks = $$(
        ".tn-brand, .brand-logo-link, .brand-logo, .footer-logo, .footer-brand-link"
    );

    brandLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            // Normal browser navigation is intentionally preserved.
        });
    });
}


/* =========================================================
   SMOOTH SCROLLING
========================================================= */

function initSmoothScrolling() {
    $$('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
            var href = link.getAttribute("href");

            if (!href || href === "#") {
                event.preventDefault();
                return;
            }

            var target = $(href);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            if (history.pushState) {
                history.pushState(null, "", href);
            }
        });
    });
}


/* =========================================================
   BACK TO TOP
========================================================= */

function initBackToTop() {
    var button = document.createElement("button");

    button.type = "button";
    button.id = "tradenest-back-to-top";
    button.setAttribute("aria-label", "Back to top");
    button.textContent = "↑";

    Object.assign(button.style, {
        position: "fixed",
        right: "24px",
        bottom: "24px",
        width: "44px",
        height: "44px",
        border: "0",
        borderRadius: "50%",
        background: "#5b4b63",
        color: "#ffffff",
        fontSize: "20px",
        cursor: "pointer",
        zIndex: "9998",
        opacity: "0",
        visibility: "hidden",
        transform: "translateY(10px)",
        transition:
            "opacity .25s ease, transform .25s ease, visibility .25s ease"
    });

    document.body.appendChild(button);

    function updateButton() {
        if (window.scrollY > 450) {
            button.style.opacity = "1";
            button.style.visibility = "visible";
            button.style.transform = "translateY(0)";
        } else {
            button.style.opacity = "0";
            button.style.visibility = "hidden";
            button.style.transform = "translateY(10px)";
        }
    }

    window.addEventListener(
        "scroll",
        updateButton,
        { passive: true }
    );

    button.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    updateButton();
}


/* =========================================================
   PRODUCT PAGE
========================================================= */

function initProductPage() {
    // Dynamic injection of supplier products from Supplier Workspace
    try {
        var grid = $(".products-grid");
        var rawSupplierProducts = localStorage.getItem("tradenest_supplier_products");
        if (grid && rawSupplierProducts) {
            var sProducts = JSON.parse(rawSupplierProducts);
            sProducts.forEach(function (sp) {
                if (sp.status === "active" && !$('[data-product-id="' + sp.id + '"]', grid)) {
                    var card = document.createElement("article");
                    card.className = "product-card";
                    card.setAttribute("data-product-id", sp.id);
                    var imgPath = sp.image ? sp.image.replace(/^\.\.\/\.\.\//, "../") : "../images/products/industrial-safety-gloves.webp";
                    card.innerHTML = `
                        <div class="product-image-container">
                            <img src="${imgPath}" alt="${sp.name}" class="product-image" />
                            <span class="badge badge-stock">${sp.availableStock > 0 ? "In Stock" : "Out of Stock"}</span>
                        </div>
                        <div class="product-content">
                            <span class="product-category">${sp.category}</span>
                            <h3 class="product-title">${sp.name}</h3>
                            <p class="product-description">${sp.description}</p>
                            <div class="product-pricing-info">
                                <span class="product-price">INR ${Math.round(sp.unitPrice * 80)} <small>/ ${sp.uom}</small></span>
                                <span class="product-moq">MOQ: ${sp.moq} ${sp.uom}</span>
                            </div>
                            <div class="product-supplier-info">
                                <span class="supplier-name">TradeNest Supplies Pvt. Ltd.</span>
                                <span class="verification-badge status-verified">Verified Supplier</span>
                            </div>
                            <div class="product-metrics">
                                <span class="trust-score">Trust Score: <strong>96/100</strong></span>
                                <span class="rating-stars" aria-label="Rating: 5 out of 5 stars"><small>5.0 / 5</small></span>
                            </div>
                            <div class="product-card-actions">
                                <a href="product-details.html?id=${sp.id}" class="btn btn-primary btn-sm">View Product</a>
                                <a href="supplier-details.html" class="btn btn-outline btn-sm">View Supplier</a>
                            </div>
                        </div>
                    `;
                    grid.prepend(card);
                }
            });
        }
    } catch (e) {
        console.warn("Could not inject supplier products into catalogue:", e);
    }
    var productCards = $$(".product-card");

    if (!productCards.length) {
        return;
    }

    var searchForm = $(".search-filter-form");
    var searchInput = $("#product-search-input");
    var category = $("#filter-category");
    var location = $("#filter-location");
    var verification = $("#filter-verification");
    var trustScore = $("#filter-trust-score");
    var availability = $("#filter-availability");
    var deliveryTime = $("#filter-delivery-time");
    var moq = $("#filter-moq");
    var rating = $("#filter-rating");
    var sortSelect = $("#sort-products");

    if (!searchForm && !searchInput && !sortSelect) {
        return;
    }

    function getProductData(card) {
        var priceText = getText(
            card,
            ".product-price"
        );

        var moqText = getText(
            card,
            ".product-moq"
        );

        var ratingText = getText(
            card,
            ".rating-value, .product-rating .rating-value"
        );

        var trustText = getText(
            card,
            ".trust-score, .product-trust-score"
        );

        var deliveryText = getText(
            card,
            ".delivery-time, .product-delivery"
        );

        var cardText = normalizeText(
            card.textContent
        );

        var ratingMatch =
            cardText.match(
                /(\d(?:\.\d)?)\s*\/\s*5/
            );

        var trustMatch =
            cardText.match(
                /(\d{2,3})\s*\/\s*100/
            );

        var deliveryMatch =
            cardText.match(
                /(\d+)\s*[–-]\s*(\d+)\s*business days/i
            );

        return {
            element: card,

            text: cardText,

            title: normalizeText(
                getText(card, ".product-title")
            ),

            category: normalizeText(
                getText(card, ".product-category")
            ),

            location: normalizeText(
                getText(card, ".supplier-location")
            ),

            supplier: normalizeText(
                getText(card, ".supplier-name")
            ),

            price: getNumber(priceText),

            moq: getNumber(moqText),

            rating: getNumber(
                ratingText ||
                (ratingMatch ? ratingMatch[1] : "")
            ),

            trust: getNumber(
                trustText ||
                (trustMatch ? trustMatch[1] : "")
            ),

            delivery: getNumber(
                deliveryText ||
                (deliveryMatch ? deliveryMatch[2] : "")
            ),

            availability:
                cardText.indexOf("made-to-order") !== -1
                    ? "made-to-order"
                    : cardText.indexOf("out of stock") !== -1
                        ? "out-of-stock"
                        : "in-stock"
        };
    }

    function applyProductFilters() {
        var query = normalizeText(
            searchInput ? searchInput.value : ""
        );

        var selectedCategory = category
            ? normalizeText(category.value)
            : "";

        var selectedLocation = location
            ? normalizeText(location.value)
            : "";

        var selectedVerification = verification
            ? normalizeText(verification.value)
            : "";

        var selectedTrust = trustScore
            ? getNumber(trustScore.value)
            : 0;

        var selectedAvailability = availability
            ? normalizeText(availability.value)
            : "";

        var selectedDelivery = deliveryTime
            ? getNumber(deliveryTime.value)
            : 0;

        var selectedMOQ = moq
            ? getNumber(moq.value)
            : 0;

        var selectedRating = rating
            ? getNumber(rating.value)
            : 0;

        var visibleCards = [];

        productCards.forEach(function (card) {
            var data = getProductData(card);

            var matchesQuery =
                !query ||
                data.text.indexOf(query) !== -1;

            var matchesCategory =
                !selectedCategory ||
                data.category.indexOf(
                    selectedCategory
                ) !== -1;

            var matchesLocation =
                !selectedLocation ||
                data.location.indexOf(
                    selectedLocation
                ) !== -1 ||
                data.text.indexOf(
                    selectedLocation
                ) !== -1;

            var matchesVerification =
                !selectedVerification ||
                data.text.indexOf(
                    selectedVerification
                ) !== -1 ||
                (
                    selectedVerification === "verified" &&
                    data.text.indexOf("verified") !== -1
                );

            var matchesTrust =
                !selectedTrust ||
                data.trust >= selectedTrust;

            var matchesAvailability =
                !selectedAvailability ||
                data.availability ===
                    selectedAvailability;

            var matchesDelivery =
                !selectedDelivery ||
                (
                    data.delivery > 0 &&
                    data.delivery <=
                        selectedDelivery
                );

            var matchesMOQ =
                !selectedMOQ ||
                (
                    data.moq > 0 &&
                    data.moq <= selectedMOQ
                );

            var matchesRating =
                !selectedRating ||
                (
                    data.rating > 0 &&
                    data.rating >= selectedRating
                );

            var visible =
                matchesQuery &&
                matchesCategory &&
                matchesLocation &&
                matchesVerification &&
                matchesTrust &&
                matchesAvailability &&
                matchesDelivery &&
                matchesMOQ &&
                matchesRating;

            card.style.display =
                visible ? "" : "none";

            if (visible) {
                visibleCards.push(card);
            }
        });

        var productGrid =
            productCards[0].parentElement;

        if (productGrid) {
            if (!visibleCards.length) {
                createNoResultsMessage(
                    productGrid,
                    "No products match your current search and filters."
                );
            } else {
                removeNoResultsMessage(
                    productGrid
                );
            }
        }

        if (query) {
            saveRecentSearch(
                "product_searches",
                query
            );
        }
    }

    function sortProducts() {
        if (!sortSelect || !productCards.length) {
            return;
        }

        var value = sortSelect.value;

        var grids = [];

        productCards.forEach(function (card) {
            if (
                card.parentElement &&
                grids.indexOf(card.parentElement) === -1
            ) {
                grids.push(card.parentElement);
            }
        });

        grids.forEach(function (grid) {
            var cards = Array.from(
                grid.querySelectorAll(
                    ":scope > .product-card"
                )
            );

            if (!cards.length) {
                return;
            }

            cards.sort(function (a, b) {
                var dataA = getProductData(a);
                var dataB = getProductData(b);

                if (value === "price-low") {
                    return dataA.price - dataB.price;
                }

                if (value === "price-high") {
                    return dataB.price - dataA.price;
                }

                if (value === "rating") {
                    return dataB.rating - dataA.rating;
                }

                if (value === "trust-score") {
                    return dataB.trust - dataA.trust;
                }

                if (value === "newest") {
                    var idA = getNumber(
                        a.getAttribute(
                            "data-product-id"
                        )
                    );

                    var idB = getNumber(
                        b.getAttribute(
                            "data-product-id"
                        )
                    );

                    return idB - idA;
                }

                return 0;
            });

            cards.forEach(function (card) {
                grid.appendChild(card);
            });
        });
    }

    if (searchForm) {
        searchForm.addEventListener(
            "submit",
            function (event) {
                event.preventDefault();

                applyProductFilters();
                sortProducts();

                showToast(
                    "Product search updated.",
                    "success"
                );
            }
        );

        searchForm.addEventListener(
            "reset",
            function () {
                setTimeout(function () {
                    applyProductFilters();
                    sortProducts();

                    showToast(
                        "Product filters cleared."
                    );
                }, 0);
            }
        );
    }

    [
        searchInput,
        category,
        location,
        verification,
        trustScore,
        availability,
        deliveryTime,
        moq,
        rating
    ].forEach(function (field) {
        if (!field) {
            return;
        }

        field.addEventListener(
            "change",
            applyProductFilters
        );

        if (field === searchInput) {
            field.addEventListener(
                "input",
                applyProductFilters
            );
        }
    });

    if (sortSelect) {
        sortSelect.addEventListener(
            "change",
            function () {
                sortProducts();
                applyProductFilters();
            }
        );
    }

    applyProductFilters();
    sortProducts();
}


/* =========================================================
   SUPPLIER PAGE
========================================================= */

function initSupplierPage() {
    var supplierCards = $$(".supplier-card");

    if (!supplierCards.length) {
        return;
    }

    var forms = $$(".supplier-search-form");

    forms.forEach(function (form) {
        var isDiscoverForm =
            $("#search-keyword", form) !== null;

        if (isDiscoverForm) {
            return;
        }

        var company =
            $("#search-company", form);

        var product =
            $("#search-product", form);

        var location =
            $("#filter-location", form);

        var industry =
            $("#filter-industry", form);

        var trust =
            $("#filter-trust-score", form);

        var rating =
            $("#filter-rating", form);

        var delivery =
            $("#filter-delivery-capability", form);

        var supplierMOQ =
            $("#filter-moq", form);

        var responseTime =
            $("#filter-response-time", form);

        var verified =
            $('input[name="verified_only"]', form);

        var sort =
            $("#supplier-sort", form);


        function getSupplierData(card) {
            var text =
                normalizeText(card.textContent);

            var trustText =
                getText(
                    card,
                    ".trust-score"
                ) ||
                getText(
                    card,
                    ".supplier-trust-score"
                ) ||
                (
                    text.match(
                        /(\d{2,3})\s*\/\s*100/
                    ) || []
                )[1];

            var ratingText =
                getText(
                    card,
                    ".rating-value"
                ) ||
                (
                    text.match(
                        /(\d(?:\.\d)?)\s*\/\s*5/
                    ) || []
                )[1];

            var responseText =
                getText(
                    card,
                    ".response-time"
                ) ||
                (
                    text.match(
                        /(\d+)\s*(?:hours?|hrs?)/i
                    ) || []
                )[1];

            return {
                element: card,

                text: text,

                company: normalizeText(
                    getText(
                        card,
                        ".supplier-name"
                    )
                ),

                product: normalizeText(
                    getText(
                        card,
                        ".supplier-description"
                    ) +
                    " " +
                    getText(
                        card,
                        ".supplier-industry"
                    )
                ),

                location: normalizeText(
                    getText(
                        card,
                        ".supplier-location"
                    )
                ),

                industry: normalizeText(
                    getText(
                        card,
                        ".supplier-industry"
                    )
                ),

                trust: getNumber(
                    trustText
                ),

                rating: getNumber(
                    ratingText
                ),

                responseHours:
                    getNumber(
                        responseText
                    ),

                verified:
                    text.indexOf(
                        "verified"
                    ) !== -1
            };
        }


        function applySupplierFilters() {
            var companyQuery =
                normalizeText(
                    company ? company.value : ""
                );

            var productQuery =
                normalizeText(
                    product ? product.value : ""
                );

            var selectedLocation =
                normalizeText(
                    location ? location.value : ""
                );

            var selectedIndustry =
                normalizeText(
                    industry ? industry.value : ""
                );

            var minTrust =
                getNumber(
                    trust ? trust.value : ""
                );

            var minRating =
                getNumber(
                    rating ? rating.value : ""
                );

            var capability =
                normalizeText(
                    delivery ? delivery.value : ""
                );

            var moqValue =
                normalizeText(
                    supplierMOQ
                        ? supplierMOQ.value
                        : ""
                );

            var responseValue =
                normalizeText(
                    responseTime
                        ? responseTime.value
                        : ""
                );

            var verifiedOnly =
                verified
                    ? verified.checked
                    : false;

            var visible = [];

            supplierCards.forEach(
                function (card) {
                    var data =
                        getSupplierData(card);

                    var matchesCompany =
                        !companyQuery ||
                        data.company.indexOf(
                            companyQuery
                        ) !== -1 ||
                        data.text.indexOf(
                            companyQuery
                        ) !== -1;

                    var matchesProduct =
                        !productQuery ||
                        data.product.indexOf(
                            productQuery
                        ) !== -1 ||
                        data.text.indexOf(
                            productQuery
                        ) !== -1;

                    var matchesLocation =
                        !selectedLocation ||
                        data.location.indexOf(
                            selectedLocation
                        ) !== -1 ||
                        data.text.indexOf(
                            selectedLocation
                        ) !== -1;

                    var matchesIndustry =
                        !selectedIndustry ||
                        data.industry.indexOf(
                            selectedIndustry
                        ) !== -1 ||
                        data.text.indexOf(
                            selectedIndustry
                        ) !== -1;

                    var matchesTrust =
                        !minTrust ||
                        data.trust >= minTrust;

                    var matchesRating =
                        !minRating ||
                        data.rating >= minRating;

                    var matchesVerified =
                        !verifiedOnly ||
                        data.verified;

                    var matchesCapability =
                        !capability ||
                        data.text.indexOf(
                            capability
                        ) !== -1;

                    var matchesMOQ = true;

                    if (moqValue === "low") {
                        var lowMOQ =
                            getNumber(
                                (
                                    data.text.match(
                                        /moq[^0-9]*(\d+)/i
                                    ) || []
                                )[1]
                            );

                        matchesMOQ =
                            data.text.indexOf(
                                "low"
                            ) !== -1 ||
                            lowMOQ < 100;
                    } else if (
                        moqValue === "medium"
                    ) {
                        var mediumMOQ =
                            getNumber(
                                (
                                    data.text.match(
                                        /moq[^0-9]*(\d+)/i
                                    ) || []
                                )[1]
                            );

                        matchesMOQ =
                            mediumMOQ >= 100 &&
                            mediumMOQ <= 1000;
                    } else if (
                        moqValue === "bulk"
                    ) {
                        var bulkMOQ =
                            getNumber(
                                (
                                    data.text.match(
                                        /moq[^0-9]*(\d+)/i
                                    ) || []
                                )[1]
                            );

                        matchesMOQ =
                            bulkMOQ > 1000 ||
                            data.text.indexOf(
                                "bulk"
                            ) !== -1;
                    }

                    var matchesResponse = true;

                    if (responseValue === "2h") {
                        matchesResponse =
                            data.responseHours > 0 &&
                            data.responseHours <= 2;
                    } else if (
                        responseValue === "12h"
                    ) {
                        matchesResponse =
                            data.responseHours > 0 &&
                            data.responseHours <= 12;
                    } else if (
                        responseValue === "24h"
                    ) {
                        matchesResponse =
                            data.responseHours > 0 &&
                            data.responseHours <= 24;
                    }

                    var isVisible =
                        matchesCompany &&
                        matchesProduct &&
                        matchesLocation &&
                        matchesIndustry &&
                        matchesTrust &&
                        matchesRating &&
                        matchesVerified &&
                        matchesCapability &&
                        matchesMOQ &&
                        matchesResponse;

                    card.style.display =
                        isVisible
                            ? ""
                            : "none";

                    if (isVisible) {
                        visible.push(card);
                    }
                }
            );

            var grid =
                supplierCards[0].parentElement;

            if (grid) {
                if (!visible.length) {
                    createNoResultsMessage(
                        grid,
                        "No suppliers match your selected criteria."
                    );
                } else {
                    removeNoResultsMessage(
                        grid
                    );
                }
            }

            if (companyQuery) {
                saveRecentSearch(
                    "supplier_searches",
                    companyQuery
                );
            }
        }


        function sortSuppliers() {
            if (!sort) {
                return;
            }

            var value = sort.value;

            var grids = [];

            supplierCards.forEach(
                function (card) {
                    if (
                        card.parentElement &&
                        grids.indexOf(
                            card.parentElement
                        ) === -1
                    ) {
                        grids.push(
                            card.parentElement
                        );
                    }
                }
            );

            grids.forEach(function (grid) {
                var cards =
                    Array.from(
                        grid.querySelectorAll(
                            ":scope > .supplier-card"
                        )
                    );

                cards.sort(
                    function (a, b) {
                        var dataA =
                            getSupplierData(a);

                        var dataB =
                            getSupplierData(b);

                        if (
                            value ===
                            "trust_score"
                        ) {
                            return (
                                dataB.trust -
                                dataA.trust
                            );
                        }

                        if (
                            value ===
                            "rating"
                        ) {
                            return (
                                dataB.rating -
                                dataA.rating
                            );
                        }

                        if (
                            value ===
                            "response_time"
                        ) {
                            return (
                                dataA.responseHours -
                                dataB.responseHours
                            );
                        }

                        if (
                            value ===
                            "newest"
                        ) {
                            return b.id.localeCompare(
                                a.id
                            );
                        }

                        return 0;
                    }
                );

                cards.forEach(
                    function (card) {
                        grid.appendChild(card);
                    }
                );
            });
        }


        form.addEventListener(
            "submit",
            function (event) {
                event.preventDefault();

                applySupplierFilters();
                sortSuppliers();

                showToast(
                    "Supplier search updated.",
                    "success"
                );
            }
        );


        form.addEventListener(
            "reset",
            function () {
                setTimeout(function () {
                    applySupplierFilters();
                    sortSuppliers();

                    showToast(
                        "Supplier filters cleared."
                    );
                }, 0);
            }
        );


        $$(
            "input, select",
            form
        ).forEach(function (field) {
            field.addEventListener(
                "change",
                applySupplierFilters
            );

            if (
                field.type === "text" ||
                field.type === "search"
            ) {
                field.addEventListener(
                    "input",
                    applySupplierFilters
                );
            }
        });


        if (sort) {
            sort.addEventListener(
                "change",
                function () {
                    sortSuppliers();
                    applySupplierFilters();
                }
            );
        }


        // URL Param pre-filter (e.g. ?industry=electronics)
        try {
            var urlParams = new URLSearchParams(window.location.search);
            var indParam = urlParams.get("industry");
            if (indParam) {
                var indSelect = document.getElementById("filter-industry");
                if (indSelect) {
                    indSelect.value = indParam;
                }
            }
        } catch (e) {}

        // Category Cards click delegation
        document.addEventListener("click", function(e) {
            var catCard = e.target.closest(".category-card, .category-link");
            if (catCard) {
                var card = catCard.closest(".category-card") || catCard;
                var industry = card.getAttribute("data-industry");
                if (industry) {
                    e.preventDefault();
                    var indSelect = document.getElementById("filter-industry");
                    if (indSelect) {
                        indSelect.value = industry;
                        applySupplierFilters();
                    }
                    var listingSec = document.querySelector(".supplier-listing-section") || document.querySelector(".supplier-cards-list");
                    if (listingSec) {
                        listingSec.scrollIntoView({ behavior: "smooth" });
                    }
                }
            }
        });

        applySupplierFilters();
        sortSuppliers();
    });
}


/* =========================================================
   DISCOVER SUPPLIERS PAGE
========================================================= */

function initDiscoverSuppliersPage() {
    var form =
        $(".supplier-search-form");

    if (
        !form ||
        !$("#search-keyword", form)
    ) {
        return;
    }

    var cards =
        $$(".supplier-card");

    if (!cards.length) {
        return;
    }

    var keyword =
        $("#search-keyword", form);

    var category =
        $("#category-filter", form);

    var location =
        $("#location-filter", form);

    var trust =
        $("#trust-score-filter", form);

    var verification =
        $("#verification-filter", form);

    var delivery =
        $("#delivery-filter", form);


    function getData(card) {
        var text =
            normalizeText(
                card.textContent
            );

        var trustValue =
            getNumber(
                getText(
                    card,
                    ".trust-score"
                ) ||
                (
                    text.match(
                        /(\d{2,3})\s*\/\s*100/
                    ) || []
                )[1]
            );

        return {
            text: text,

            trust: trustValue,

            verified:
                text.indexOf(
                    "verified"
                ) !== -1,

            location:
                normalizeText(
                    getText(
                        card,
                        ".supplier-location"
                    )
                ),

            industry:
                normalizeText(
                    getText(
                        card,
                        ".supplier-industry"
                    )
                )
        };
    }


    function filter() {
        var q =
            normalizeText(
                keyword.value
            );

        var cat =
            normalizeText(
                category.value
            );

        var loc =
            normalizeText(
                location.value
            );

        var minTrust =
            getNumber(
                trust.value
            );

        var verificationValue =
            normalizeText(
                verification.value
            );

        var deliveryValue =
            normalizeText(
                delivery.value
            );

        var visible = [];


        cards.forEach(
            function (card) {
                var data =
                    getData(card);

                var matchesKeyword =
                    !q ||
                    data.text.indexOf(
                        q
                    ) !== -1;

                var matchesCategory =
                    !cat ||
                    data.industry.indexOf(
                        cat
                    ) !== -1 ||
                    data.text.indexOf(
                        cat
                    ) !== -1;

                var matchesLocation =
                    !loc ||
                    data.location.indexOf(
                        loc
                    ) !== -1 ||
                    data.text.indexOf(
                        loc
                    ) !== -1;

                var matchesTrust =
                    !minTrust ||
                    data.trust >= minTrust;

                var matchesVerification =
                    !verificationValue ||
                    verificationValue ===
                        "all" ||
                    (
                        verificationValue ===
                            "verified" &&
                        data.verified
                    );

                var matchesDelivery =
                    !deliveryValue ||
                    deliveryValue ===
                        "any" ||
                    data.text.indexOf(
                        deliveryValue
                    ) !== -1 ||
                    (
                        deliveryValue ===
                            "fast" &&
                        (
                            data.text.indexOf(
                                "fast"
                            ) !== -1 ||
                            data.text.indexOf(
                                "24 hours"
                            ) !== -1 ||
                            data.text.indexOf(
                                "12 hours"
                            ) !== -1
                        )
                    );

                var visibleCard =
                    matchesKeyword &&
                    matchesCategory &&
                    matchesLocation &&
                    matchesTrust &&
                    matchesVerification &&
                    matchesDelivery;

                card.style.display =
                    visibleCard
                        ? ""
                        : "none";

                if (visibleCard) {
                    visible.push(card);
                }
            }
        );


        var grid =
            cards[0].parentElement;

        if (grid) {
            if (!visible.length) {
                createNoResultsMessage(
                    grid,
                    "No suppliers match your search. Try changing the filters."
                );
            } else {
                removeNoResultsMessage(
                    grid
                );
            }
        }


        if (q) {
            saveRecentSearch(
                "discover_supplier_searches",
                q
            );
        }
    }


    form.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            filter();

            showToast(
                "Supplier search completed.",
                "success"
            );
        }
    );


    form.addEventListener(
        "reset",
        function () {
            setTimeout(function () {
                filter();

                showToast(
                    "Supplier filters cleared."
                );
            }, 0);
        }
    );


    [
        keyword,
        category,
        location,
        trust,
        verification,
        delivery
    ].forEach(function (field) {
        if (!field) {
            return;
        }

        field.addEventListener(
            "change",
            filter
        );

        if (field === keyword) {
            field.addEventListener(
                "input",
                filter
            );
        }
    });


    filter();
}


/* =========================================================
   CONTACT FORM
========================================================= */

function initContactForm() {
    var form =
        $(".contact-form");

    if (!form) {
        return;
    }

    var fullName =
        $("#full-name");

    var company =
        $("#company-name");

    var email =
        $("#email-address");

    var phone =
        $("#phone-number");

    var userType =
        $("#user-type");

    var subject =
        $("#subject");

    var message =
        $("#message");

    var consent =
        $("#consent-checkbox");


    function setFieldState(
        field,
        valid,
        messageText
    ) {
        if (!field) {
            return;
        }

        var oldError =
            field.parentElement
                ? $(".tn-field-error", field.parentElement)
                : null;

        if (oldError) {
            oldError.remove();
        }

        field.style.borderColor =
            valid
                ? ""
                : "#b44b4b";

        field.setAttribute(
            "aria-invalid",
            valid
                ? "false"
                : "true"
        );

        if (
            !valid &&
            messageText &&
            field.parentElement
        ) {
            var error =
                document.createElement(
                    "small"
                );

            error.className =
                "tn-field-error";

            error.textContent =
                messageText;

            Object.assign(error.style, {
                display: "block",
                marginTop: "5px",
                color: "#b44b4b",
                fontSize: "12px"
            });

            field.parentElement.appendChild(
                error
            );
        }
    }


    function validate() {
        var valid = true;

        var nameValue =
            fullName
                ? fullName.value.trim()
                : "";

        var emailValue =
            email
                ? email.value.trim()
                : "";

        var subjectValue =
            subject
                ? subject.value.trim()
                : "";


        if (!nameValue) {
            setFieldState(
                fullName,
                false,
                "Please enter your full name."
            );

            valid = false;
        } else {
            setFieldState(
                fullName,
                true
            );
        }


        if (!emailValue) {
            setFieldState(
                email,
                false,
                "Please enter your email address."
            );

            valid = false;
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                emailValue
            )
        ) {
            setFieldState(
                email,
                false,
                "Please enter a valid email address."
            );

            valid = false;
        } else {
            setFieldState(
                email,
                true
            );
        }


        if (!subjectValue) {
            setFieldState(
                subject,
                false,
                "Please enter a subject."
            );

            valid = false;
        } else {
            setFieldState(
                subject,
                true
            );
        }


        if (
            phone &&
            phone.value.trim()
        ) {
            var phoneDigits =
                phone.value.replace(
                    /\D/g,
                    ""
                );

            if (
                phoneDigits.length < 7 ||
                phoneDigits.length > 15
            ) {
                setFieldState(
                    phone,
                    false,
                    "Please enter a valid phone number."
                );

                valid = false;
            } else {
                setFieldState(
                    phone,
                    true
                );
            }
        }


        if (
            consent &&
            !consent.checked
        ) {
            setFieldState(
                consent,
                false,
                "Please confirm the consent checkbox."
            );

            valid = false;
        } else if (consent) {
            setFieldState(
                consent,
                true
            );
        }


        return valid;
    }


    form.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            if (!validate()) {
                showToast(
                    "Please correct the highlighted fields.",
                    "error"
                );

                return;
            }


            var formData = {
                fullName:
                    fullName
                        ? fullName.value.trim()
                        : "",

                company:
                    company
                        ? company.value.trim()
                        : "",

                email:
                    email
                        ? email.value.trim()
                        : "",

                phone:
                    phone
                        ? phone.value.trim()
                        : "",

                userType:
                    userType
                        ? userType.value
                        : "",

                subject:
                    subject
                        ? subject.value.trim()
                        : "",

                message:
                    message
                        ? message.value.trim()
                        : ""
            };


            try {
                sessionStorage.setItem(
                    "tradenest_last_enquiry",
                    JSON.stringify(formData)
                );
            } catch (error) {
                // Session storage is optional.
            }


            form.reset();


            $$(".tn-field-error", form)
                .forEach(function (error) {
                    error.remove();
                });


            $$(".form-control, .form-input", form)
                .forEach(function (field) {
                    field.style.borderColor = "";

                    field.setAttribute(
                        "aria-invalid",
                        "false"
                    );
                });


            showToast(
                "Your enquiry has been submitted successfully for this demo.",
                "success"
            );
        }
    );


    [
        fullName,
        email,
        phone,
        subject,
        message
    ].forEach(function (field) {
        if (!field) {
            return;
        }

        field.addEventListener(
            "blur",
            validate
        );
    });
}


/* =========================================================
   FAQ
========================================================= */

function initFAQ() {
    var faqItems =
        $$("details.faq-item");

    if (!faqItems.length) {
        return;
    }

    faqItems.forEach(function (item) {
        item.addEventListener(
            "toggle",
            function () {
                if (!item.open) {
                    return;
                }

                faqItems.forEach(
                    function (other) {
                        if (other !== item) {
                            other.removeAttribute(
                                "open"
                            );
                        }
                    }
                );
            }
        );
    });
}


/* =========================================================
   BUTTONS AND DEMO ACTIONS
========================================================= */

function initButtonsAndLinks() {

    $$("a[href='#']").forEach(
        function (link) {
            link.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();

                    var label =
                        link.textContent.trim() ||
                        link.getAttribute(
                            "aria-label"
                        ) ||
                        "This action";

                    showToast(
                        label +
                        " is a frontend demo action.",
                        "success"
                    );
                }
            );
        }
    );


    $$(
        'a[href*="register.html"], ' +
        'a[href*="login.html"], ' +
        'a[href*="auth/register.html"], ' +
        'a[href*="auth/login.html"]'
    ).forEach(
        function (link) {
            link.addEventListener(
                "click",
                function () {
                    try {
                        sessionStorage.setItem(
                            "tradenest_last_intent",
                            link.textContent.trim()
                        );
                    } catch (error) {
                        // Optional.
                    }
                }
            );
        }
    );

    // Smart supplier details CTA handlers
    var btnContactSupp = document.getElementById("btnContactSupplierDetails");
    if (btnContactSupp) {
        btnContactSupp.addEventListener("click", function(e) {
            var user = null;
            try { user = JSON.parse(localStorage.getItem("tradenestCurrentUser")); } catch(err) {}
            if (user) {
                e.preventDefault();
                window.location.href = "buyer/messages.html?supplier=Example%20Manufacturing%20Co.";
            }
        });
    }
    var btnReqQuote = document.getElementById("btnRequestQuoteDetails");
    if (btnReqQuote) {
        btnReqQuote.addEventListener("click", function(e) {
            var user = null;
            try { user = JSON.parse(localStorage.getItem("tradenestCurrentUser")); } catch(err) {}
            if (user) {
                e.preventDefault();
                window.location.href = "buyer/rfqs.html?supplier=Example%20Manufacturing%20Co.";
            }
        });
    }


    $$(".product-card .btn, .supplier-card .btn")
        .forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    var label =
                        button.textContent.trim();

                    var lowerLabel =
                        label.toLowerCase();

                    if (
                        lowerLabel.indexOf(
                            "quote"
                        ) !== -1 ||
                        lowerLabel.indexOf(
                            "sample"
                        ) !== -1 ||
                        lowerLabel.indexOf(
                            "contact"
                        ) !== -1 ||
                        lowerLabel.indexOf(
                            "compare"
                        ) !== -1
                    ) {
                        try {
                            sessionStorage.setItem(
                                "tradenest_last_action",
                                label
                            );
                        } catch (error) {
                            // Optional.
                        }
                    }
                }
            );
        });
}


/* =========================================================
   IMAGE FALLBACKS
========================================================= */

function initImageFallbacks() {
    $$("img").forEach(function (image) {
        image.addEventListener(
            "error",
            function () {
                if (
                    image.dataset.fallbackApplied ===
                    "true"
                ) {
                    return;
                }

                image.dataset.fallbackApplied =
                    "true";


                var fallback =
                    document.createElement(
                        "div"
                    );

                fallback.className =
                    "tn-image-fallback";

                fallback.textContent =
                    "TradeNest";


                Object.assign(
                    fallback.style,
                    {
                        width:
                            image.clientWidth
                                ? image.clientWidth +
                                  "px"
                                : "100%",

                        minHeight:
                            image.clientHeight
                                ? image.clientHeight +
                                  "px"
                                : "160px",

                        display: "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        background:
                            "#f0ecef",

                        color:
                            "#5b4b63",

                        borderRadius:
                            "10px",

                        fontWeight:
                            "600"
                    }
                );


                image.style.display =
                    "none";


                if (image.parentElement) {
                    image.parentElement.appendChild(
                        fallback
                    );
                }
            }
        );
    });
}


/* =========================================================
   ACCESSIBILITY HELPERS
========================================================= */

function initAccessibility() {

    $$(
        "input, select, textarea"
    ).forEach(function (field) {
        if (
            !field.hasAttribute(
                "aria-invalid"
            )
        ) {
            field.setAttribute(
                "aria-invalid",
                "false"
            );
        }
    });


    $$("button").forEach(
        function (button) {
            if (
                !button.getAttribute(
                    "type"
                )
            ) {
                button.setAttribute(
                    "type",
                    "button"
                );
            }
        }
    );
}


/* =========================================================
   RESTORE SEARCH STATE FROM URL
========================================================= */

function restoreSearchState() {
    var params =
        new URLSearchParams(
            window.location.search
        );

    if (!params.toString()) {
        return;
    }


    var role =
        params.get("role");


    if (role) {
        var userType =
            $("#user-type");

        if (userType) {
            var option =
                Array.from(
                    userType.options
                ).find(function (item) {
                    return (
                        normalizeText(
                            item.value
                        ) ===
                            normalizeText(
                                role
                            ) ||
                        normalizeText(
                            item.textContent
                        ).indexOf(
                            normalizeText(
                                role
                            )
                        ) !== -1
                    );
                });

            if (option) {
                userType.value =
                    option.value;
            }
        }
    }


    var query =
        params.get("query");


    if (
        query &&
        $("#product-search-input")
    ) {
        $(
            "#product-search-input"
        ).value = query;

        $(
            "#product-search-input"
        ).dispatchEvent(
            new Event("input")
        );
    }


    var supplierKeyword =
        params.get("keyword");


    if (
        supplierKeyword &&
        $("#search-keyword")
    ) {
        $("#search-keyword").value =
            supplierKeyword;

        $("#search-keyword").dispatchEvent(
            new Event("input")
        );
    }
}


/* =========================================================
   OPTIONAL PUBLIC API
   Useful if another script needs to trigger a refresh.
========================================================= */

window.TradeNest = {
    toast: showToast,

    clearToast: function () {
        var toast =
            $("#tradenest-toast");

        if (toast) {
            toast.style.opacity = "0";
            toast.style.visibility =
                "hidden";
        }
    },

    getUrlParameter: function (name) {
        return new URLSearchParams(
            window.location.search
        ).get(name);
    }
};