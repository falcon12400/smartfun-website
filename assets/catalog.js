// 聰明動教具資料（試作版：說明文字、年齡為示意，正式版由工作室提供）
// 之後新增教具：在下面陣列加一筆，圖片放到 assets/img/。
const CATS = ["平衡", "跨越", "穿越鑽爬", "投擲打擊", "認知合作"];

const PRODUCTS = [
  { id: "rock", name: "聰明搖滾圈", cat: "平衡", skills: ["動態平衡", "核心穩定", "身體控制"], age: "3–6 歲", desc: "兩片半圓拱片加上五根條紋柱，可以排成拱橋、彩虹梯、搖椅、S 型小路和立柱關卡，一套就能玩好幾週。", star: true, model: "rocker", parts: "拱片×2、六角柱×4、半圓柱×1",
    tagline: "一套拱片，變出一整個學期的遊戲",
    photos: ["rock/hero.jpg", "rock/a1.png", "rock/a3.png", "rock/a2.png", "rock/b1.png"],
    modesInfo: [
      { m: "ladder", name: "雙拱彩虹梯", desc: "拱片立起，橫桿相連", img: "rock/a1.png" },
      { m: "rocker", name: "倒放搖椅", desc: "凹面朝上，兩人對坐", img: "rock/a3.png" },
      { m: "s", name: "S 型小路", desc: "兩片平放，接成彎路", img: "rock/a2.png" },
      { m: "posts", name: "平放立柱", desc: "柱子插上，變成障礙", img: "rock/b1.png" } ],
    safety: ["使用前檢查拱片與柱子有沒有破損、柱子有沒有插緊。", "放在軟墊或平坦地面上，四周留 1.5 公尺空間。", "一次一位孩子在拱片上，老師站在側邊保護。", "收納時把柱子拔下，拱片平放疊好，不要壓重物。"],
    combo: { name: "30 分鐘教案組合", desc: "熱身＋鑽山洞＋彩虹梯＋接力過橋，直接帶一堂課。", plays: [0, 1, 6] } },
  { id: "p13", name: "動動平衡組", cat: "平衡", skills: ["平衡", "核心穩定"], age: "3–6 歲", desc: "底部是弧形、上方有 U 形凹槽的軟式模組，可以搖、可以讓球在凹槽裡滾，排起來就是一條平衡路線。" },
  { id: "p04", name: "半圓專注石", cat: "平衡", skills: ["靜態平衡", "專注力", "下肢控制"], age: "3–6 歲", desc: "半圓形的條紋軟墊，平面朝下穩穩走，圓面朝下變成搖搖石，練習專注與平衡。" },
  { id: "p08", name: "翹翹板", cat: "平衡", skills: ["動態平衡", "重心轉移"], age: "3–6 歲", desc: "會左右搖擺的軟式翹翹板，練習站穩、蹲下、轉身。" },
  { id: "p17", name: "體能環", cat: "平衡", skills: ["平衡", "組合創意"], age: "4–6 歲", desc: "兩端有環的軟式長條，可以一節節接成長長的路線，走、跳、跨都適合。" },
  { id: "p06", name: "瑪卡龍", cat: "平衡", skills: ["平衡", "跳躍"], age: "3–6 歲", desc: "像瑪卡龍一樣的圓形軟墊，可疊高、可排成踏石路線，也能當跳躍目標。" },
  { id: "p01", name: "U型槓片", cat: "平衡", skills: ["平衡", "組合"], age: "3–6 歲", desc: "可插接組合的軟式槓片，搭配其他器材變化出不同高度。" },
  { id: "p12", name: "梯形錐", cat: "跨越", skills: ["下肢肌力", "協調"], age: "3–6 歲", desc: "一層層疊起來的軟式梯形錐，可以當標記、障礙或跨越關卡，也能拆開調整高度。" },
  { id: "p03", name: "聰明三明治", cat: "跨越", skills: ["跳躍", "滾翻"], age: "3–6 歲", desc: "斜坡與三角墊組合，做翻滾、爬坡、跳下的練習。" },
  { id: "p02", name: "六角訓練圈", cat: "穿越鑽爬", skills: ["鑽爬", "身體意識"], age: "3–6 歲", desc: "立起來是山洞，躺下是跳格，可接立柱與底座組成關卡。" },
  { id: "p05", name: "瑜伽滾輪", cat: "穿越鑽爬", skills: ["鑽爬", "平衡"], age: "3–6 歲", desc: "中空的軟式滾輪，可以滾、可以鑽，也能排成踏點。" },
  { id: "p16", name: "軟式呼拉圈", cat: "穿越鑽爬", skills: ["跳躍", "團體合作"], age: "3–6 歲", desc: "柔軟不傷手的呼拉圈，跳格子、鑽圈圈、團體遊戲都好用。" },
  { id: "p07", name: "板球拍", cat: "投擲打擊", skills: ["手眼協調", "揮擊"], age: "3–6 歲", desc: "軟式泡棉板球拍，拍面長、好打中，第一次揮擊練習也很安全。" },
  { id: "p18", name: "匹克球拍", cat: "投擲打擊", skills: ["手眼協調", "揮擊", "追視"], age: "4–6 歲", desc: "軟式泡棉匹克球拍，搭配洞洞球，輕巧好握，對打、顛球、打目標都適合。" },
  { id: "p11", name: "鎚球", cat: "投擲打擊", skills: ["手眼協調", "反應"], age: "3–6 歲", desc: "軟式槌子搭配球，推球、敲目標，練習瞄準與反應速度。" },
  { id: "p10", name: "數字磚", cat: "認知合作", skills: ["認知", "堆疊", "合作"], age: "3–6 歲", desc: "印有數字的軟磚，體能遊戲結合數數與順序。" },
  { id: "p19", name: "專注板", cat: "認知合作", skills: ["專注力", "手眼協調", "合作"], age: "3–6 歲", desc: "圓形軟板上有八角凹槽，可以放八角塊、托著球走，練習專注、穩定與兩人合作。" },
  { id: "p14", name: "活力熊掌", cat: "認知合作", skills: ["空間概念", "團體遊戲"], age: "2–6 歲", desc: "熊掌造型的軟墊，可以當踏點、島嶼或關卡標記，玩法無限。" },
];

const IMG = (p, base) => `${base}assets/img/${p.id}.png`;
const PHOTO = (src, base) => `${base}assets/photos/${src}`;

// 渲染：grid 容器、篩選列容器、卡片模板函式
function initCatalog({ grid, filters, card, base = "../", allLabel = "全部", countEl }) {
  const g = document.querySelector(grid), f = filters && document.querySelector(filters);
  let cur = "全部";
  const draw = () => {
    const list = PRODUCTS.filter(p => cur === "全部" || p.cat === cur);
    list.forEach(p => { const n = (typeof PLAYS !== "undefined" && PLAYS[p.id] || []).length;
      p.badges = (p.model ? '<span class="bdg bdg-3d">3D</span>' : "") + (n ? `<span class="bdg bdg-n">${n} 種玩法</span>` : ""); });
    g.innerHTML = list.map(p => card(p, IMG(p, base))).join("");
    // 點卡片 → 進教具頁（第二層），帶著目前分類，返回時可以回到同樣的篩選
    g.querySelectorAll("[data-id]").forEach(el => el.addEventListener("click", e => {
      if (e.target.closest("a")) return;
      location.href = `item.html?id=${el.dataset.id}&cat=${encodeURIComponent(cur)}`;
    }));
    if (countEl) document.querySelector(countEl).textContent = `共 ${list.length} 項`;
  };
  if (f) {
    f.innerHTML = ["全部", ...CATS].map(c => `<button data-c="${c}">${c === "全部" ? allLabel : c}</button>`).join("");
    f.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      cur = b.dataset.c; f.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); draw();
    });
    f.querySelector("button").classList.add("on");
  }
  draw();
  // 從教具頁返回時，網址帶 ?cat= 就套用那個分類
  const qc = new URLSearchParams(location.search).get("cat");
  if (qc && f) { const b = f.querySelector(`[data-c="${qc}"]`); if (b) b.click(); }
  window.setCat = c => { const b = f && f.querySelector(`[data-c="${c}"]`); if (b) b.click(); };
}

function openModal(id, base) {
  const p = PRODUCTS.find(x => x.id === id);
  let m = document.getElementById("pm");
  if (!m) { m = document.createElement("div"); m.id = "pm"; document.body.appendChild(m);
    m.addEventListener("click", e => { if (e.target === m || e.target.closest(".pm-x")) m.classList.remove("show"); }); }
  m.innerHTML = `<div class="pm-box"><button class="pm-x" aria-label="關閉">×</button>
    <div class="pm-img"><img src="${IMG(p, base)}" alt="${p.name}"></div>
    <div class="pm-body"><span class="pm-cat">${p.cat}</span><h3>${p.name}</h3><p>${p.desc}</p>
    <dl><dt>訓練能力</dt><dd>${p.skills.join("、")}</dd><dt>適合年齡</dt><dd>${p.age}</dd>
    <dt>玩法</dt><dd>（玩法示範與教案待補）</dd><dt>安全提醒</dt><dd>（待補）</dd></dl>
    <a class="pm-cta" href="#contact" onclick="document.getElementById('pm').classList.remove('show')">詢問這項教具</a></div></div>`;
  m.classList.add("show");
}
