(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const store = window.TradeNestStore;
    const list = document.getElementById("supplier-reviews-list");
    const summary = document.getElementById("supplier-reviews-summary");
    if (!store || !list || !summary) return;

    const params = new URLSearchParams(window.location.search);
    let supplierId = params.get("id") || params.get("supplier");
    if (!supplierId) {
      try {
        supplierId = JSON.parse(localStorage.getItem("tradenestSelectedSupplierId") || "null");
      } catch (_) {
        supplierId = null;
      }
    }
    const supplierName = (document.getElementById("supplier-name")
      || document.querySelector(".supplier-detail-title"))?.textContent.trim().toLowerCase() || "";
    const state = store.getStore();
    const reviews = (state.orders || []).filter((order) => {
      if (!order.supplierReview) return false;
      if (supplierId && order.supplierId) return String(order.supplierId) === String(supplierId);
      return supplierName && String(order.supplierName || "").trim().toLowerCase() === supplierName;
    });
    const ratings = reviews.map((order) => Number(order.supplierReview.rating)).filter((rating) => rating >= 1 && rating <= 5);
    const average = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
    summary.textContent = ratings.length
      ? `${average.toFixed(1)} / 5 · ${ratings.length} ${ratings.length === 1 ? "review" : "reviews"}`
      : "No reviews yet";
    list.replaceChildren();
    if (!reviews.length) {
      const empty = document.createElement("p");
      empty.className = "product-reviews-empty";
      empty.textContent = "No order reviews have been submitted for this supplier yet.";
      list.appendChild(empty);
      return;
    }
    reviews.forEach((order) => {
      const review = order.supplierReview;
      const card = document.createElement("article");
      card.className = "product-review-card";
      const header = document.createElement("div");
      header.className = "product-review-header";
      const author = document.createElement("strong");
      author.textContent = order.buyerName || "TradeNest buyer";
      const date = document.createElement("time");
      if (review.submittedAt) {
        const parsed = new Date(review.submittedAt);
        if (!Number.isNaN(parsed.getTime())) {
          date.dateTime = parsed.toISOString();
          date.textContent = parsed.toLocaleDateString();
        }
      }
      header.append(author, date);
      const rating = Number(review.rating);
      const score = document.createElement("div");
      score.className = "product-review-rating";
      score.textContent = rating >= 1 && rating <= 5 ? `${"★".repeat(rating)}${"☆".repeat(5 - rating)}  ${rating}/5` : "Supplier review";
      const comment = document.createElement("p");
      comment.textContent = review.comment || "The buyer submitted a supplier rating.";
      const orderInfo = document.createElement("small");
      orderInfo.textContent = `Order ${order.id} · ${order.productName || "TradeNest purchase"}`;
      card.append(header, score, comment, orderInfo);
      list.appendChild(card);
    });
  });
})();
