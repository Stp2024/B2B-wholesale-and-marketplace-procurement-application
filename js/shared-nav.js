(() => {
  const currentPath = window.location.pathname;
  const relativeRoot = /\/(?:pages|auth)\//.test(currentPath) ? "../" : "./";
  const inPagesDirectory = /\/pages\/[^/]+\.html$/.test(currentPath);
  const resolvePath = (path) => {
    if (inPagesDirectory && path.startsWith("pages/")) {
      return path.slice("pages/".length);
    }
    return `${relativeRoot}${path}`;
  };
  const currentFile = currentPath.split("/").pop() || "index.html";
  const isHomePage = currentFile === "index.html" || currentPath === "" || currentPath.endsWith("/");
  const activePage = currentFile === "product-details.html" ? "products.html"
    : currentFile === "supplier-details.html" ? "suppliers.html"
      : currentFile;

  const links = [
    ["Home", "index.html"],
    ["Products", "pages/products.html"],
    ["Suppliers", "pages/suppliers.html"],
    ["Discover", "pages/discover-suppliers.html"],
    ["Supplier network", "pages/join-supplier-network.html"],
    ["About", "pages/about.html"],
    ["Contact", "pages/contact.html"]
  ];

  const header = document.createElement("header");
  header.className = "tn-site-header";
  header.innerHTML = `
    <div class="tn-header-inner">
      <div class="tn-header-left">
        ${!isHomePage ? `
        <button class="tn-back-button" type="button" onclick="if(window.history.length > 1){window.history.back();}else{window.location.href='${relativeRoot}index.html';}" aria-label="Go back to previous page" title="Go back">
          <span class="tn-back-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </span>
          <span class="tn-back-label">Back</span>
        </button>` : ""}
        <a class="tn-brand" href="${relativeRoot}index.html" aria-label="TradeNest home">
          <img src="${relativeRoot}images/TradeNest.webp" alt="TradeNest" width="168" height="48">
        </a>
      </div>
      <button class="tn-menu-toggle" type="button" aria-expanded="false" aria-controls="tn-primary-navigation" aria-label="Open navigation">
        <span></span><span></span><span></span>
      </button>
      <nav class="tn-primary-navigation" id="tn-primary-navigation" aria-label="Main navigation">
        <ul class="tn-nav-list">
          ${links.map(([label, path]) => {
            const page = path.split("/").pop();
            const active = page === activePage;
            return `<li><a class="tn-nav-link${active ? " is-active" : ""}" href="${resolvePath(path)}"${active ? ' aria-current="page"' : ""}>${label}</a></li>`;
          }).join("")}
        </ul>
        <div class="tn-nav-actions">
          <a class="tn-nav-login" href="${resolvePath("auth/login.html")}">Log in</a>
          <a class="tn-nav-join" href="${resolvePath("auth/register.html")}">Create account</a>
        </div>
      </nav>
    </div>`;

  const oldHeader = document.querySelector("body > header.site-header, body > header.header");
  if (oldHeader) {
    oldHeader.replaceWith(header);
  } else {
    document.body.prepend(header);
  }

  const toggle = header.querySelector(".tn-menu-toggle");
  const navigation = header.querySelector(".tn-primary-navigation");
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !isOpen);
  });
})();