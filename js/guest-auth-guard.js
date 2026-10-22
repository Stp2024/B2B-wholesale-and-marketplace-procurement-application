/**
 * TradeNest Guest Auth Guard
 * js/guest-auth-guard.js
 *
 * Allows any visitor to browse suppliers & products freely.
 * When a guest tries to perform an action that requires login
 * (Request Quote, Place Order, Contact Supplier, etc.) this module
 * intercepts and shows a premium modal prompting them to log in or register.
 *
 * Usage:
 *   - Automatically wires to any element with  data-auth-required="true"
 *   - Or call  window.TradeNestAuthGuard.requireAuth(actionLabel)  imperatively
 */
(function () {
  "use strict";

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function getLoggedInUser() {
    try {
      const raw = localStorage.getItem("tradenestCurrentUser");
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u && (u.email || u.role) ? u : null;
    } catch (_) {
      return null;
    }
  }

  function getRelativeRoot() {
    const path = window.location.pathname.replace(/\\/g, "/");
    if (/\/(?:pages\/(?:buyer|supplier|admin))\//.test(path)) return "../../";
    if (/\/(?:pages|auth)\//.test(path)) return "../";
    return "./";
  }

  function escHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ─── Modal styles (injected once) ───────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById("tn-auth-guard-styles")) return;
    const style = document.createElement("style");
    style.id = "tn-auth-guard-styles";
    style.textContent = `
      /* Auth Guard Overlay */
      #tnAuthGuardOverlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.52);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 99990;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: tnFadeIn 0.2s ease;
      }
      #tnAuthGuardOverlay.is-open { display: flex; }
      @keyframes tnFadeIn { from { opacity:0; } to { opacity:1; } }

      #tnAuthGuardModal {
        background: #fff;
        border-radius: 18px;
        max-width: 440px;
        width: 100%;
        box-shadow: 0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10);
        overflow: hidden;
        animation: tnSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1);
        position: relative;
      }
      @keyframes tnSlideUp {
        from { transform: translateY(28px) scale(0.96); opacity:0; }
        to   { transform: translateY(0)    scale(1);    opacity:1; }
      }

      .tn-ag-banner {
        background: linear-gradient(135deg, #0f4c4c 0%, #196565 60%, #1a7a6e 100%);
        padding: 28px 28px 22px;
        text-align: center;
        position: relative;
      }
      .tn-ag-banner-icon {
        width: 56px; height: 56px;
        background: rgba(255,255,255,0.15);
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        backdrop-filter: blur(6px);
      }
      .tn-ag-banner h2 {
        margin: 0 0 6px;
        font-size: 1.2rem;
        font-weight: 700;
        color: #fff;
        letter-spacing: -0.01em;
      }
      .tn-ag-banner p {
        margin: 0;
        font-size: 0.84rem;
        color: rgba(255,255,255,0.80);
        line-height: 1.5;
      }
      .tn-ag-action-label {
        display: inline-block;
        margin-top: 10px;
        background: rgba(255,255,255,0.18);
        color: #fff;
        font-size: 0.78rem;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.3);
      }
      .tn-ag-close-btn {
        position: absolute;
        top: 12px; right: 14px;
        width: 30px; height: 30px;
        background: rgba(255,255,255,0.15);
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #fff;
        font-size: 1.1rem;
        transition: background 0.2s;
      }
      .tn-ag-close-btn:hover { background: rgba(255,255,255,0.28); }

      .tn-ag-body {
        padding: 24px 28px 28px;
      }
      .tn-ag-perks {
        list-style: none;
        padding: 0; margin: 0 0 22px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .tn-ag-perks li {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.85rem;
        color: #374151;
      }
      .tn-ag-perk-icon {
        width: 28px; height: 28px;
        background: #f0faf7;
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        color: #0f4c4c;
      }
      .tn-ag-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .tn-ag-btn-login {
        flex: 1;
        display: inline-flex; align-items: center; justify-content: center; gap: 7px;
        padding: 11px 18px;
        background: #0f4c4c;
        color: #fff;
        border: none;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
        transition: background 0.2s, transform 0.15s;
        min-width: 120px;
      }
      .tn-ag-btn-login:hover { background: #0a3535; transform: translateY(-1px); }
      .tn-ag-btn-register {
        flex: 1;
        display: inline-flex; align-items: center; justify-content: center; gap: 7px;
        padding: 11px 18px;
        background: #fff;
        color: #0f4c4c;
        border: 1.5px solid #0f4c4c;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
        transition: background 0.2s, transform 0.15s;
        min-width: 120px;
      }
      .tn-ag-btn-register:hover { background: #e8f5f0; transform: translateY(-1px); }
      .tn-ag-divider {
        text-align: center;
        font-size: 0.78rem;
        color: #9ca3af;
        margin: 0 0 14px;
        position: relative;
      }
      .tn-ag-divider::before, .tn-ag-divider::after {
        content: "";
        position: absolute;
        top: 50%;
        width: 38%;
        height: 1px;
        background: #e5e7eb;
      }
      .tn-ag-divider::before { left: 0; }
      .tn-ag-divider::after  { right: 0; }

      .tn-ag-browse-note {
        text-align: center;
        font-size: 0.78rem;
        color: #6b7280;
        margin-top: 14px;
      }
      .tn-ag-browse-note strong { color: #0f4c4c; }
    `;
    document.head.appendChild(style);
  }

  // ─── Modal DOM ───────────────────────────────────────────────────────────────

  function buildModal() {
    if (document.getElementById("tnAuthGuardOverlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "tnAuthGuardOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "tnAgTitle");

    overlay.innerHTML = `
      <div id="tnAuthGuardModal">
        <div class="tn-ag-banner">
          <button class="tn-ag-close-btn" id="tnAgCloseBtn" aria-label="Close">&times;</button>
          <div class="tn-ag-banner-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 id="tnAgTitle">Login Required</h2>
          <p>You're browsing as a guest. Sign in to unlock full procurement features.</p>
          <span class="tn-ag-action-label" id="tnAgActionLabel"></span>
        </div>
        <div class="tn-ag-body">
          <ul class="tn-ag-perks">
            <li>
              <span class="tn-ag-perk-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Request quotes &amp; place wholesale orders
            </li>
            <li>
              <span class="tn-ag-perk-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Contact suppliers &amp; manage RFQs
            </li>
            <li>
              <span class="tn-ag-perk-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Track orders &amp; view your procurement history
            </li>
          </ul>
          <div class="tn-ag-divider">or continue with</div>
          <div class="tn-ag-actions">
            <a class="tn-ag-btn-login" id="tnAgLoginBtn" href="#">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Log In
            </a>
            <a class="tn-ag-btn-register" id="tnAgRegisterBtn" href="#">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              Register Free
            </a>
          </div>
          <p class="tn-ag-browse-note">
            <strong>✓ Browsing is always free.</strong> No account needed to explore suppliers &amp; products.
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    // Close button
    overlay.querySelector("#tnAgCloseBtn").addEventListener("click", closeModal);

    // Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  function openModal(actionLabel) {
    const overlay = document.getElementById("tnAuthGuardOverlay");
    const labelEl = overlay && overlay.querySelector("#tnAgActionLabel");
    if (labelEl) {
      labelEl.textContent = actionLabel ? `Trying to: ${actionLabel}` : "";
      labelEl.style.display = actionLabel ? "inline-block" : "none";
    }

    const root = getRelativeRoot();
    const currentPage = encodeURIComponent(window.location.pathname + window.location.search);
    const loginHref = `${root}auth/login.html?redirect=${currentPage}`;
    const registerHref = `${root}auth/register.html`;

    const loginBtn = overlay && overlay.querySelector("#tnAgLoginBtn");
    const regBtn   = overlay && overlay.querySelector("#tnAgRegisterBtn");
    if (loginBtn)  loginBtn.href  = loginHref;
    if (regBtn)    regBtn.href    = registerHref;

    if (overlay) {
      overlay.classList.add("is-open");
      overlay.querySelector("#tnAgCloseBtn").focus();
    }
  }

  function closeModal() {
    const overlay = document.getElementById("tnAuthGuardOverlay");
    if (overlay) overlay.classList.remove("is-open");
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  /**
   * requireAuth(actionLabel)
   * Returns true if user is logged in.
   * Returns false and shows the modal if guest.
   */
  function requireAuth(actionLabel) {
    if (getLoggedInUser()) return true;
    buildModal();
    openModal(actionLabel || "");
    return false;
  }

  // ─── Auto-wire: intercept data-auth-required elements ───────────────────────

  function wireAuthGuard() {
    injectStyles();
    buildModal();

    // Use event delegation so dynamically rendered cards also get intercepted
    document.addEventListener("click", function (e) {
      const target = e.target.closest("[data-auth-required]");
      if (!target) return;

      // Already logged in — let through
      if (getLoggedInUser()) return;

      e.preventDefault();
      e.stopPropagation();
      const label = target.getAttribute("data-auth-action") || target.textContent.trim().slice(0, 40) || "Perform action";
      openModal(label);
    }, true); // capture phase so we intercept before page scripts
  }

  // ─── Init ────────────────────────────────────────────────────────────────────

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireAuthGuard);
  } else {
    wireAuthGuard();
  }

  // Expose globally
  window.TradeNestAuthGuard = {
    requireAuth,
    openModal,
    closeModal,
    isLoggedIn: function () { return !!getLoggedInUser(); }
  };
})();
