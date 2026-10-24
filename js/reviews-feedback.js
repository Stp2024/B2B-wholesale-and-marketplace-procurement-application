(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const store = window.TradeNestStore;
    if (!store) return;
    const buyer = store.getCurrentUser() || {};
    const buyerId = buyer.id || "buyer-001";
    const orderList = document.getElementById("buyer-order-review-list");
    const productList = document.getElementById("buyer-product-review-list");
    const platformForm = document.getElementById("platform-feedback-form");
    const platformList = document.getElementById("platform-feedback-list");
    const params = new URLSearchParams(window.location.search);
    const requestedOrderId = params.get("orderId");

    function readPlatformFeedback() {
      try {
        const records = JSON.parse(localStorage.getItem("tradenestPlatformFeedback") || "[]");
        return Array.isArray(records) ? records : [];
      } catch (_) {
        return [];
      }
    }

    function node(tag, className, content) {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (content !== undefined) element.textContent = content;
      return element;
    }

    function makeReviewCard({ author, rating, comment, date, detail }) {
      const card = node("article", "product-review-card");
      const header = node("div", "product-review-header");
      header.append(node("strong", "", author || "TradeNest buyer"));
      if (date) header.append(node("time", "", date));
      const score = node("div", "product-review-rating", rating ? `${"★".repeat(rating)}${"☆".repeat(5 - rating)}  ${rating}/5` : "Feedback");
      const message = node("p", "", comment);
      card.append(header, score, message);
      if (detail) card.append(node("small", "", detail));
      return card;
    }

    function renderProductReviews(state) {
      if (!productList) return;
      const samples = (state.sampleRequests || []).filter((sample) => sample.buyerId === buyerId && sample.feedback);
      const orders = (state.orders || []).filter((order) => order.buyerId === buyerId && order.productReview);
      const reviews = [
        ...samples.map((sample) => ({
          productId: sample.productId,
          productName: sample.productName,
          rating: Number(sample.feedback && sample.feedback.rating) || 0,
          comment: typeof sample.feedback === "string" ? sample.feedback : sample.feedback.comment || "Product rating submitted.",
          date: sample.feedback && sample.feedback.submittedAt ? new Date(sample.feedback.submittedAt).toLocaleDateString() : "",
          quantity: sample.requestedQuantity,
          unit: sample.unit
        })),
        ...orders.map((order) => ({
          productId: order.productId,
          productName: order.productName,
          rating: Number(order.productReview.rating) || 0,
          comment: order.productReview.comment,
          date: order.productReview.submittedAt ? new Date(order.productReview.submittedAt).toLocaleDateString() : "",
          quantity: order.quantity,
          unit: order.unit
        }))
      ];
      if (!reviews.length) {
        productList.replaceChildren(node("p", "product-reviews-empty", "You have not submitted any product reviews yet. Submit feedback on a delivered sample or review a delivered order below."));
        return;
      }
      productList.replaceChildren();
      reviews.forEach((review) => {
        const card = makeReviewCard({
          author: review.productName || "Product review",
          rating: review.rating,
          comment: review.comment,
          date: review.date,
          detail: review.quantity ? `Quantity reviewed: ${review.quantity} ${review.unit || "units"}` : "Sample review"
        });
        const link = node("a", "btn btn-secondary small", "View product reviews");
        link.href = `../product-details.html?id=${encodeURIComponent(review.productId || "")}`;
        card.append(link);
        productList.append(card);
      });
    }

    function makeOrderReviewForm(order, kind) {
      const existing = order[kind];
      const section = node("div", "order-review-item");
      const heading = kind === "productReview" ? "Product review" : "Supplier review";
      section.append(node("h4", "", heading));
      if (existing) {
        section.append(makeReviewCard({
          author: "Your review",
          rating: Number(existing.rating) || 0,
          comment: existing.comment || "",
          date: existing.submittedAt ? new Date(existing.submittedAt).toLocaleDateString() : "",
          detail: kind === "productReview" ? order.productName : order.supplierName
        }));
        return section;
      }

      const form = document.createElement("form");
      form.className = "order-review-form";
      form.dataset.orderId = order.id;
      form.dataset.reviewKind = kind;
      const ratingLabel = node("label", "", "Rating");
      const rating = document.createElement("select");
      rating.name = "rating";
      rating.required = true;
      ["", "5", "4", "3", "2", "1"].forEach((value, index) => {
        const option = document.createElement("option");
        option.value = value;
        const labels = { 1: "Poor", 2: "Needs improvement", 3: "Fair", 4: "Good", 5: "Excellent" };
        option.textContent = index === 0 ? "Select a rating" : `${value} - ${labels[value]}`;
        rating.append(option);
      });
      ratingLabel.append(rating);
      const commentLabel = node("label", "", "Your review");
      const comment = document.createElement("textarea");
      comment.name = "comment";
      comment.rows = 3;
      comment.maxLength = 1200;
      comment.required = true;
      comment.placeholder = kind === "productReview" ? "How did the product perform?" : "Share your experience with this supplier and order.";
      commentLabel.append(comment);
      const button = node("button", "btn btn-primary small", "Submit review");
      button.type = "submit";
      form.append(ratingLabel, commentLabel, button);
      section.appendChild(form);
      return section;
    }

    function renderOrderReviews(state) {
      if (!orderList) return;
      const delivered = (state.orders || []).filter((order) => order.buyerId === buyerId && ["delivered", "completed"].includes(String(order.status || "").toLowerCase()));
      if (!delivered.length) {
        orderList.replaceChildren(node("p", "product-reviews-empty", "Your delivered orders will appear here when they are ready for review."));
        return;
      }
      orderList.replaceChildren();
      delivered.forEach((order) => {
        const card = node("article", "buyer-order-review-card");
        card.id = `order-review-${order.id}`;
        const header = node("div", "buyer-order-review-header");
        const identity = node("div");
        identity.append(node("h3", "", order.productName || "Order"), node("p", "", `Order #${order.id} · ${order.supplierName || "Supplier"}`));
        const status = node("span", "buyer-review-ready", "Delivered");
        header.append(identity, status);
        const forms = node("div", "order-reviews-grid");
        forms.append(makeOrderReviewForm(order, "productReview"), makeOrderReviewForm(order, "supplierReview"));
        card.append(header, forms);
        orderList.append(card);
      });
      if (requestedOrderId) {
        const target = document.getElementById(`order-review-${requestedOrderId}`);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.classList.add("is-review-target");
        }
      }
    }

    function renderPlatformFeedback() {
      if (!platformList) return;
      const records = readPlatformFeedback().filter((record) => record.buyerId === buyerId);
      if (!records.length) {
        platformList.replaceChildren(node("p", "product-reviews-empty", "Your feedback to TradeNest will appear here after you send it."));
        return;
      }
      platformList.replaceChildren();
      records.slice().reverse().forEach((record) => {
        platformList.append(makeReviewCard({
          author: record.topic || "TradeNest feedback",
          rating: Number(record.rating) || 0,
          comment: record.comment,
          date: record.submittedAt ? new Date(record.submittedAt).toLocaleDateString() : "",
          detail: "Sent privately to the TradeNest platform team"
        }));
      });
    }

    function render() {
      const state = store.getStore();
      renderProductReviews(state);
      renderOrderReviews(state);
      renderPlatformFeedback();
    }

    if (orderList) {
      orderList.addEventListener("submit", function (event) {
        const form = event.target.closest(".order-review-form");
        if (!form) return;
        event.preventDefault();
        const state = store.getStore();
        const order = (state.orders || []).find((item) => item.id === form.dataset.orderId && item.buyerId === buyerId);
        const kind = form.dataset.reviewKind;
        if (!order || !["delivered", "completed"].includes(String(order.status || "").toLowerCase()) || order[kind]) return;
        const data = new FormData(form);
        const rating = Number(data.get("rating"));
        const comment = String(data.get("comment") || "").trim();
        if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) return;
        order[kind] = { rating, comment, submittedAt: new Date().toISOString(), buyerId };
        store.saveStore(state);
        if (typeof store.addActivity === "function") store.addActivity("Review", `Submitted ${kind === "productReview" ? "product" : "supplier"} review for order ${order.id}`);
        render();
      });
    }

    if (platformForm) {
      platformForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const data = new FormData(platformForm);
        const comment = String(data.get("comment") || "").trim();
        if (!comment) return;
        const records = readPlatformFeedback();
        records.push({
          id: `platform-feedback-${Date.now()}`,
          buyerId,
          buyerName: buyer.fullName || buyer.businessName || "TradeNest buyer",
          topic: String(data.get("topic") || "Other"),
          rating: Number(data.get("rating")),
          comment,
          submittedAt: new Date().toISOString()
        });
        try {
          localStorage.setItem("tradenestPlatformFeedback", JSON.stringify(records));
        } catch (_) {
          window.alert("TradeNest could not save this feedback in browser storage. Please try again.");
          return;
        }
        platformForm.reset();
        renderPlatformFeedback();
      });
    }

    render();
  });
})();
