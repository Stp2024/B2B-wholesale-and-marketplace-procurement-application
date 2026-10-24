(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById("product-reviews-list");
    const summary = document.getElementById("product-reviews-summary");
    const store = window.TradeNestStore;
    if (!list || !summary || !store) return;

    const params = new URLSearchParams(window.location.search);
    let productId = params.get("id");
    if (!productId) {
      try {
        productId = JSON.parse(localStorage.getItem("tradenestSelectedProductId") || "null");
      } catch (_) {
        productId = null;
      }
    }

    const samples = store.getStore().sampleRequests || [];
    const sampleReviews = samples.filter((sample) => {
      const feedback = sample.feedback;
      return String(sample.productId) === String(productId)
        && feedback
        && (typeof feedback === "string" || feedback.comment || feedback.rating);
    });
    const orderReviews = (store.getStore().orders || []).filter((order) => String(order.productId) === String(productId) && order.productReview);
    const reviews = [
      ...sampleReviews.map((sample) => ({
        author: sample.contactName || "TradeNest buyer",
        rating: Number(sample.feedback && sample.feedback.rating),
        comment: typeof sample.feedback === "string" ? sample.feedback : sample.feedback.comment || "The buyer submitted a rating.",
        submittedAt: sample.feedback && sample.feedback.submittedAt,
        quantity: sample.requestedQuantity,
        unit: sample.unit
      })),
      ...orderReviews.map((order) => ({
        author: order.buyerName || "TradeNest buyer",
        rating: Number(order.productReview.rating),
        comment: order.productReview.comment || "The buyer submitted a rating.",
        submittedAt: order.productReview.submittedAt,
        quantity: order.quantity,
        unit: order.unit
      }))
    ];
    const ratedReviews = reviews.filter((review) => review.rating >= 1);
    const average = ratedReviews.length
      ? ratedReviews.reduce((total, review) => total + review.rating, 0) / ratedReviews.length
      : 0;
    summary.textContent = ratedReviews.length
      ? `${average.toFixed(1)} / 5 · ${ratedReviews.length} ${ratedReviews.length === 1 ? "rating" : "ratings"}`
      : `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`;

    if (!reviews.length) {
      const empty = document.createElement("p");
      empty.className = "product-reviews-empty";
      empty.textContent = "No buyer reviews yet. Feedback appears here after a buyer receives and reviews a sample.";
      list.replaceChildren(empty);
      return;
    }

    reviews.forEach((review) => {
      const rating = review.rating;
      const card = document.createElement("article");
      card.className = "product-review-card";

      const header = document.createElement("div");
      header.className = "product-review-header";
      const author = document.createElement("strong");
      author.textContent = review.author;
      const date = document.createElement("time");
      if (review.submittedAt) {
        const parsedDate = new Date(review.submittedAt);
        if (!Number.isNaN(parsedDate.getTime())) {
          date.dateTime = parsedDate.toISOString();
          date.textContent = parsedDate.toLocaleDateString();
        }
      }
      header.append(author, date);

      const score = document.createElement("div");
      score.className = "product-review-rating";
      score.setAttribute("aria-label", rating >= 1 && rating <= 5 ? `${rating} out of 5 stars` : "Buyer review");
      score.textContent = rating >= 1 && rating <= 5 ? `${"★".repeat(rating)}${"☆".repeat(5 - rating)}  ${rating}/5` : "Buyer review";

      const comment = document.createElement("p");
      comment.textContent = review.comment;

      const product = document.createElement("small");
      product.textContent = `Quantity reviewed: ${review.quantity || "—"} ${review.unit || "units"}`;
      card.append(header, score, comment, product);
      list.appendChild(card);
    });
  });
})();
