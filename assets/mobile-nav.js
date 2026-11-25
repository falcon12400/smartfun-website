(() => {
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  window.initMobileNav = function initMobileNav(options = {}) {
    const toggle = document.querySelector(".sf-menu-toggle");
    if (!toggle || document.querySelector(".sf-mobile-nav")) return;

    const home = options.home || "index.html";
    const item = options.item || "item.html";
    const contact = options.contact || "contact.html";
    const products = typeof PRODUCTS === "undefined" ? [] : PRODUCTS;
    const categories = typeof CATS === "undefined" ? [...new Set(products.map(product => product.cat))] : CATS;
    const categoryHTML = categories.map(category => {
      const list = products.filter(product => product.cat === category);
      return `<details><summary>${esc(category)}<span class="sf-menu-count">${list.length}</span></summary><div class="sf-menu-products">
        <a class="sf-menu-all" href="${home}?cat=${encodeURIComponent(category)}#catalog">查看全部${esc(category)}教具</a>
        ${list.map(product => `<a href="${item}?id=${encodeURIComponent(product.id)}&cat=${encodeURIComponent(category)}">${esc(product.name)}</a>`).join("")}
      </div></details>`;
    }).join("");

    document.body.insertAdjacentHTML("beforeend", `<aside class="sf-mobile-nav" aria-hidden="true">
      <button class="sf-menu-backdrop" type="button" aria-label="關閉目錄"></button>
      <div class="sf-menu-drawer" id="sf-mobile-drawer" role="dialog" aria-modal="true" aria-label="網站目錄">
        <div class="sf-menu-head"><div><b>聰明動</b><small>SMART FUN</small></div><button class="sf-menu-close" type="button" aria-label="關閉目錄">×</button></div>
        <nav class="sf-menu-primary" aria-label="主要頁面"><a href="${home}">首頁</a><a href="${home}#catalog">全部教具</a><a href="${contact}">聯絡我們</a></nav>
        <div class="sf-menu-label">依教具類別瀏覽</div><div class="sf-menu-cats">${categoryHTML}</div>
        <a class="sf-menu-note" href="https://line.me/ti/p/NvVe6gwYGX" target="_blank" rel="noopener">💬 加入 LINE 好友：教具洽詢、課程合作都可以聊</a>
      </div>
    </aside>`);

    const shell = document.querySelector(".sf-mobile-nav");
    const closeButtons = shell.querySelectorAll(".sf-menu-backdrop,.sf-menu-close");
    const open = () => {
      document.body.classList.add("sf-menu-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "關閉目錄");
      shell.setAttribute("aria-hidden", "false");
      shell.querySelector(".sf-menu-close").focus();
    };
    const close = () => {
      document.body.classList.remove("sf-menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "開啟目錄");
      shell.setAttribute("aria-hidden", "true");
    };
    toggle.addEventListener("click", () => document.body.classList.contains("sf-menu-open") ? close() : open());
    closeButtons.forEach(button => button.addEventListener("click", close));
    shell.querySelectorAll("a").forEach(link => link.addEventListener("click", close));
    document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
  };
})();
