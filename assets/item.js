// 教具頁（第二層）共用程式 v3：資料、照片、篩選與玩法展開都在這裡；
// 三個風格的 item.html 只提供各自的卡片／資訊版型（cfg 裡的函式）與 CSS。
// 需要先載入 catalog.js（PRODUCTS、IMG、PHOTO）與 plays.js（PLAYS、PLAY_TYPES、PLAY_AGES）。
const $ = s => document.querySelector(s);
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const set = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; return el; };

export function initItem(cfg = {}) {
  const base = cfg.base || "../";
  const p = PRODUCTS.find(x => x.id === new URLSearchParams(location.search).get("id")) || PRODUCTS[0];
  const plays = PLAYS[p.id] || [];
  const modes = p.modesInfo || [];
  document.title = `${p.name}｜聰明動 SMART FUN`;
  const ctx = { p, plays, base, esc, modesCount: modes.length };

  // ---- 文字區 ----
  set("#crumb", `<a href="index.html#catalog">${cfg.crumbRoot || "教具系列"}</a><span>›</span><a href="index.html?cat=${encodeURIComponent(p.cat)}#catalog">${esc(p.cat)}</a><span>›</span><b>${esc(p.name)}</b>`);
  set("#name", esc(p.name)); set("#cat", esc(p.cat)); set("#desc", esc(p.desc)); set("#tagline", esc(p.tagline || ""));
  set("#badges", (p.star ? `<span class="b-star">${cfg.starLabel || "招牌教具"}</span>` : "") + `<span>${esc(p.cat)}</span>`);
  if (cfg.facts) set("#facts", cfg.facts(ctx));
  set("#play-count", plays.length ? String(plays.length) : "");

  // ---- 主視覺：商品照＋縮圖 ----
  const viewerEl = $("#viewer");
  if (viewerEl) {
    viewerEl.innerHTML = `<img class="viewer-photo show" src="${IMG(p, base)}" alt="${esc(p.name)}">`;
  }
  set("#modes", "");
  // 縮圖：點照片即更換主視覺
  const photos = p.photos || [];
  if ($("#thumbs") && photos.length) {
    $("#thumbs").innerHTML = photos.map((src, i) => `<button class="th${i === 0 ? " on" : ""}" data-ph="${src}"><img src="${PHOTO(src, base)}" alt=""></button>`).join("");
    $("#thumbs").addEventListener("click", e => {
      const b = e.target.closest(".th"); if (!b) return;
      document.querySelectorAll("#thumbs .th").forEach(x => x.classList.toggle("on", x === b));
      const photo = viewerEl.querySelector(".viewer-photo");
      if (photo) { photo.src = PHOTO(b.dataset.ph, base); vHook(photo); }
    });
  } else if ($("#thumbs")) $("#thumbs").hidden = true;

  // 擺法照片區
  if ($("#mode-gallery")) {
    if (modes.length) $("#mode-gallery").innerHTML = modes.map((mi, i) => (cfg.modeItem || defModeItem)(mi, i, ctx)).join("");
    else { const s = $("#mode-gallery").closest("section"); if (s) s.hidden = true; }
  }
  // 安全與收納
  if ($("#safety")) { if (p.safety) $("#safety").innerHTML = p.safety.map(x => `<li>${esc(x)}</li>`).join(""); else { const s = $("#safety").closest("section"); if (s) s.hidden = true; } }

  // ---- 玩法篩選 ----
  const st = { type: new Set(), age: new Set(), noLimit: false, combo: false };
  const cnt = (k, v) => plays.filter(pl => k === "type" ? pl.type === v : pl.age.includes(v)).length;
  const chip = (k, v, label) => `<button data-k="${k}" data-v="${esc(v)}"><span>${label || v}</span><i>${k === "all" ? plays.length : cnt(k, v)}</i></button>`;
  let lim = null;
  if (plays.length) {
    set("#f-type", chip("all", "", "全部") + PLAY_TYPES.filter(t => cnt("type", t)).map(t => chip("type", t)).join(""));
    set("#f-age", PLAY_AGES.map(a => chip("age", a)).join(""));
    set("#f-limit", `<label><input type="checkbox"> ${cfg.limitLabel || "只看不限場地與器材"}</label>`);
    lim = $("#f-limit input"); if (lim) lim.addEventListener("change", e => { st.noLimit = e.target.checked; draw(); });
    document.querySelectorAll("#f-type, #f-age").forEach(el => el.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return; const k = b.dataset.k, v = b.dataset.v;
      if (k === "all") { st.type.clear(); st.age.clear(); st.combo = false; }
      else { st.combo = false; st[k].has(v) ? st[k].delete(v) : st[k].add(v); }
      draw();
    }));
    if (p.combo && $("#combo")) {
      $("#combo").innerHTML = (cfg.combo || defCombo)(p.combo, ctx);
      $("#combo").addEventListener("click", e => { if (e.target.closest("[data-combo]")) { st.combo = !st.combo; st.type.clear(); st.age.clear(); draw(); $("#plays").scrollIntoView({ behavior: "smooth", block: "start" }); } });
    } else if ($("#combo")) $("#combo").hidden = true;
    const tg = $("#f-toggle"); if (tg) tg.addEventListener("click", () => document.body.classList.toggle("filters-open"));
    document.querySelectorAll(".f-close").forEach(b => b.addEventListener("click", () => document.body.classList.remove("filters-open")));
    const fa = $("#f-active"); if (fa) fa.addEventListener("click", e => { const b = e.target.closest("[data-rm]"); if (!b) return; const [k, v] = b.dataset.rm.split("|");
      if (k === "noLimit") { st.noLimit = false; if (lim) lim.checked = false; } else if (k === "combo") st.combo = false; else st[k].delete(v); draw(); });
  } else {
    document.querySelectorAll("#filters, #f-bar, #combo, #plays-more").forEach(el => el && (el.hidden = true));
    document.querySelectorAll("#print, .js-print").forEach(el => el.hidden = true);
  }

  // ---- 玩法卡 ----
  const tagsHTML = pl => `<span class="t t-type">${pl.type}</span>` + pl.age.map(a => `<span class="t t-age">${a}</span>`).join("") + pl.limit.map(l => `<span class="t t-limit">⚠ ${esc(l)}</span>`).join("");
  const propLink = id => { const x = PRODUCTS.find(q => q.id === id); return x ? `<a href="item.html?id=${x.id}">${esc(x.name)}</a>` : ""; };
  const detailHTML = pl => `<div class="detail" hidden>
      <h4>步驟</h4><ol>${pl.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
      <h4>安全提醒</h4><p>${esc(pl.safety)}</p>
      <h4>難度調整</h4><ul><li><b>簡單一點：</b>${esc(pl.easier)}</li><li><b>挑戰一點：</b>${esc(pl.harder)}</li></ul>
      ${pl.limit.length ? `<h4>需要準備</h4><p>${pl.limit.map(esc).join("；")}</p>` : ""}
      <h4>訓練能力</h4><p>${pl.skills.join("、")}</p>
      ${pl.props.length ? `<h4>需要器材</h4><p>${pl.props.map(propLink).join("、")}</p>` : ""}</div>`;
  const cardCtx = (pl, idx) => { const images = (pl.photos?.length ? pl.photos.map(src => PHOTO(src, base)) : [pl.photo ? PHOTO(pl.photo, base) : V(`${base}assets/plays/${p.id}-${idx + 1}.png`)]); return ({ pl, i: idx, no: String(idx + 1).padStart(2, "0"), n: idx + 1,
    img: images[0], images, pos: pl.pos || "center",
    tags: tagsHTML(pl), detail: detailHTML(pl), see: false, mode: pl.mode, esc }); };
  const playsEl = $("#plays"), moreBtn = $("#plays-more");
  let collapsed = !!moreBtn;
  const showN = cfg.mobileShow || 2;
  function draw() {
    const list = plays.filter(pl => st.combo ? p.combo.plays.includes(plays.indexOf(pl))
      : (!st.type.size || st.type.has(pl.type)) && (!st.age.size || pl.age.some(a => st.age.has(a))) && (!st.noLimit || !pl.limit.length));
    document.querySelectorAll("#f-type button, #f-age button").forEach(b => {
      const k = b.dataset.k, on = k === "all" ? (!st.type.size && !st.age.size && !st.combo) : st[k].has(b.dataset.v);
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
    });
    set("#play-shown", plays.length ? (st.combo ? `${p.combo.name}：${list.length} 種` : `${list.length} / ${plays.length} 種玩法`) : "");
    const fa = $("#f-active");
    if (fa) { const act = [...st.type].map(v => ["type", v]).concat([...st.age].map(v => ["age", v])); if (st.noLimit) act.push(["noLimit", "不限場地"]); if (st.combo) act.push(["combo", p.combo.name]);
      fa.innerHTML = act.map(([k, v]) => `<button data-rm="${k}|${esc(v)}">${esc(v)} ✕</button>`).join("");
      const badge = $("#f-toggle i"); if (badge) { badge.textContent = act.length; badge.hidden = !act.length; } }
    if (playsEl) {
      playsEl.innerHTML = plays.length
        ? (list.length ? list.map(pl => cfg.card(cardCtx(pl, plays.indexOf(pl)))).join("") : `<p class="empty">沒有符合條件的玩法，試著取消一些篩選。</p>`)
        : `<p class="empty">這項教具的玩法整理中，之後會從教案補上。</p>`;
      playsEl.classList.toggle("collapsed", collapsed && list.length > showN);
    }
    if (moreBtn) { moreBtn.hidden = !(collapsed && list.length > showN); moreBtn.textContent = `看全部 ${list.length} 種玩法 ↓`; }
  }
  if (moreBtn) moreBtn.addEventListener("click", () => { collapsed = false; draw(); });
  if (playsEl) playsEl.addEventListener("click", e => {
    const galleryButton = e.target.closest("[data-gallery-step]");
    if (galleryButton) {
      const gallery = galleryButton.closest("[data-gallery]");
      const images = [...gallery.querySelectorAll(".gallery-image")];
      const dots = [...gallery.querySelectorAll(".gallery-dot")];
      const current = images.findIndex(img => img.classList.contains("on"));
      const next = (current + Number(galleryButton.dataset.galleryStep) + images.length) % images.length;
      images.forEach((img, i) => img.classList.toggle("on", i === next));
      dots.forEach((dot, i) => { dot.classList.toggle("on", i === next); dot.setAttribute("aria-current", i === next ? "true" : "false"); });
      const count = gallery.querySelector(".gallery-count"); if (count) count.textContent = `${next + 1} / ${images.length}`;
      return;
    }
    const galleryDot = e.target.closest(".gallery-dot");
    if (galleryDot) {
      const gallery = galleryDot.closest("[data-gallery]");
      const next = Number(galleryDot.dataset.galleryIndex);
      gallery.querySelectorAll(".gallery-image").forEach((img, i) => img.classList.toggle("on", i === next));
      gallery.querySelectorAll(".gallery-dot").forEach((dot, i) => { dot.classList.toggle("on", i === next); dot.setAttribute("aria-current", i === next ? "true" : "false"); });
      const count = gallery.querySelector(".gallery-count"); if (count) count.textContent = `${next + 1} / ${gallery.querySelectorAll(".gallery-image").length}`;
      return;
    }
    const more = e.target.closest(".more");
    if (more) { const d = more.closest(".play").querySelector(".detail"), open = d.hidden; d.hidden = !open; more.setAttribute("aria-expanded", open); more.classList.toggle("open", open); more.textContent = open ? "收起 ▴" : (cfg.moreLabel || "完整玩法"); }
  });
  draw();

  // 列印：展開所有玩法
  document.querySelectorAll("#print, .js-print").forEach(b => b.addEventListener("click", () => { document.querySelectorAll(".play .detail").forEach(d => d.hidden = false); print(); }));

  // 相關教具（同分類）
  const rel = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, cfg.relCount || 4);
  set("#related", rel.map(x => (cfg.relItem || defRel)(x, IMG(x, base), ctx)).join(""));
}

const defModeItem = (mi, i, ctx) => `<div class="mg"><img src="${PHOTO(mi.img, ctx.base)}" alt=""><b><i>${String(i + 1).padStart(2, "0")}</i>${esc(mi.name)}</b><small>${esc(mi.desc)}</small></div>`;
const defCombo = c => `<div><b>📋 ${esc(c.name)}</b><p>${esc(c.desc)}</p></div><button data-combo>看教案 →</button>`;
const defRel = (x, src) => `<a class="rel" href="item.html?id=${x.id}&cat=${encodeURIComponent(x.cat)}"><span class="ri"><img src="${src}" alt="" loading="lazy"></span><b>${esc(x.name)}</b><small>${esc(x.cat)}・${esc(x.age)}</small></a>`;
