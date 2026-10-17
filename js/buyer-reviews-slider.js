/**
 * ================================================================
 * TRADENEST — BUYER REVIEWS SLIDER
 * js/buyer-reviews-slider.js
 *
 * DEMO CONTENT — Sample reviews are for demonstration purposes only.
 * Replace the .tn-review-card elements in index.html with actual
 * verified buyer testimonials when available.
 *
 * Features:
 *  - Auto-advances every 4.5 seconds
 *  - Pause on hover/focus, resume on mouse leave/blur
 *  - Previous / Next arrow buttons with direction-aware animation
 *  - Clickable pagination dots (jump to any review)
 *  - Smooth fade + horizontal slide transition (CSS-driven)
 *  - Infinite cycling (wraps after last / before first)
 *  - Touch/swipe support for mobile devices
 *  - Viewport entrance animations (IntersectionObserver)
 *  - Respects prefers-reduced-motion
 *  - Resets auto-timer after any manual navigation
 *  - No external dependencies
 * ================================================================
 */

(function () {
  'use strict';

  /* ── Constants ─────────────────────────────────────────── */
  var AUTO_INTERVAL_MS   = 4500;  /* 4.5 seconds between auto-advances */
  var TRANSITION_LOCK_MS = 580;   /* slightly > CSS transition (520ms) to prevent overlap */
  var SWIPE_THRESHOLD_PX = 50;    /* minimum horizontal swipe distance */

  /* ── State ─────────────────────────────────────────────── */
  var currentIndex    = 0;
  var autoTimer       = null;
  var isTransitioning = false;
  var isPaused        = false;
  var touchStartX     = 0;
  var touchStartY     = 0;

  /* Reduced-motion preference */
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── DOM References ────────────────────────────────────── */
  var section     = document.getElementById('buyer-reviews');
  var stage       = document.getElementById('tnReviewsStage');
  var prevBtn     = document.getElementById('tnReviewPrev');
  var nextBtn     = document.getElementById('tnReviewNext');
  var dotsWrapper = document.getElementById('tnReviewsDots');

  /* Bail out silently if the section is not on this page */
  if (!section || !stage || !prevBtn || !nextBtn || !dotsWrapper) return;

  var cards = Array.prototype.slice.call(stage.querySelectorAll('.tn-review-card'));
  var dots  = Array.prototype.slice.call(dotsWrapper.querySelectorAll('.tn-reviews-dot'));
  var total = cards.length;

  if (total < 2) {
    /* Single review — no slider needed; still run entrance anim */
    triggerEntranceAnimation();
    return;
  }

  /* ── Initialise Cards ──────────────────────────────────── */
  function initCards() {
    cards.forEach(function (card, i) {
      if (i === 0) {
        card.classList.add('tn-review-active');
        card.setAttribute('aria-hidden', 'false');
      } else {
        card.classList.remove('tn-review-active', 'tn-review-exit', 'tn-review-enter-from-left');
        card.setAttribute('aria-hidden', 'true');
      }
    });
    syncDots(0);
  }

  /* ── Transition to a given index ──────────────────────── */
  function goTo(nextIdx, direction) {
    if (isTransitioning) return;
    if (nextIdx === currentIndex) return;

    isTransitioning = true;

    var outCard = cards[currentIndex];
    var inCard  = cards[nextIdx];
    var enterFromRight = (direction === 'next');

    if (!prefersReducedMotion) {
      /* Position incoming card on the correct side before showing it */
      inCard.classList.remove('tn-review-enter-from-left');
      if (!enterFromRight) {
        inCard.classList.add('tn-review-enter-from-left');
      }
      /* Force reflow so browser registers the starting transform */
      void inCard.offsetWidth; /* eslint-disable-line no-void */
    }

    /* Make incoming card active (CSS transition handles slide-in) */
    inCard.classList.add('tn-review-active');
    inCard.setAttribute('aria-hidden', 'false');

    /* Slide-out the current card */
    outCard.classList.add('tn-review-exit');

    /* Cleanup after transition */
    setTimeout(function () {
      outCard.classList.remove('tn-review-active', 'tn-review-exit');
      outCard.setAttribute('aria-hidden', 'true');
      inCard.classList.remove('tn-review-enter-from-left');
      currentIndex    = nextIdx;
      isTransitioning = false;
      syncDots(currentIndex);
    }, TRANSITION_LOCK_MS);
  }

  /* ── Navigation helpers ────────────────────────────────── */
  function showNext() {
    var next = (currentIndex + 1) % total;
    goTo(next, 'next');
  }

  function showPrev() {
    var prev = (currentIndex - 1 + total) % total;
    goTo(prev, 'prev');
  }

  /* ── Dot sync ──────────────────────────────────────────── */
  function syncDots(activeIdx) {
    dots.forEach(function (dot, i) {
      var active = (i === activeIdx);
      dot.classList.toggle('tn-reviews-dot-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  /* ── Auto-play ─────────────────────────────────────────── */
  function startAuto() {
    stopAuto();
    if (prefersReducedMotion) return;
    autoTimer = setInterval(function () {
      if (!isPaused && !isTransitioning) showNext();
    }, AUTO_INTERVAL_MS);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  /* Reset timer after manual navigation to prevent an immediate auto-jump */
  function resetAuto() {
    stopAuto();
    startAuto();
  }

  /* ── Arrow button events ───────────────────────────────── */
  nextBtn.addEventListener('click', function () {
    showNext();
    resetAuto();
  });

  prevBtn.addEventListener('click', function () {
    showPrev();
    resetAuto();
  });

  /* ── Dot button events ─────────────────────────────────── */
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      if (i === currentIndex) return;
      goTo(i, i > currentIndex ? 'next' : 'prev');
      resetAuto();
    });
  });

  /* ── Hover pause / resume ──────────────────────────────── */
  section.addEventListener('mouseenter', function () { isPaused = true; });
  section.addEventListener('mouseleave', function () { isPaused = false; });
  section.addEventListener('focusin',    function () { isPaused = true; });
  section.addEventListener('focusout',   function () { isPaused = false; });

  /* ── Touch / swipe ─────────────────────────────────────── */
  stage.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  stage.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) showNext(); else showPrev();
    resetAuto();
  }, { passive: true });

  /* ── Section-level keyboard navigation ────────────────── */
  section.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('.tn-reviews-dots')) return;
    if (e.key === 'ArrowRight') { showNext(); resetAuto(); }
    if (e.key === 'ArrowLeft')  { showPrev(); resetAuto(); }
  });

  /* Roving keyboard within dots */
  dotsWrapper.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      var ni = (currentIndex + 1) % total;
      dots[ni].focus();
      goTo(ni, 'next');
      resetAuto();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      var pi = (currentIndex - 1 + total) % total;
      dots[pi].focus();
      goTo(pi, 'prev');
      resetAuto();
    }
  });

  /* ── Viewport Entrance Animation ──────────────────────── */
  function triggerEntranceAnimation() {
    var animTargets = Array.prototype.slice.call(
      section.querySelectorAll('[data-animate]')
    );

    if (prefersReducedMotion) {
      animTargets.forEach(function (el) { el.classList.add('tn-animate-in'); });
      return;
    }

    if (!animTargets.length) return;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('tn-animate-in');
            io.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -48px 0px'
      });
      animTargets.forEach(function (el) { io.observe(el); });
    } else {
      /* Fallback for older browsers */
      animTargets.forEach(function (el) { el.classList.add('tn-animate-in'); });
    }
  }

  /* ── Bootstrap ─────────────────────────────────────────── */
  initCards();
  triggerEntranceAnimation();
  startAuto();

}());
