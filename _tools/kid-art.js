// 插畫人物素材：回傳 SVG 字串。姿勢：front 正面站、arms 張開雙手、side 側面走、reach 側面伸手、throw 側面丟、sit 側面坐、crawl 側面爬、adult 老師（側面伸手）
// 側面姿勢都面向右；flip=true 時左右翻轉。ax/ay 是腳底（或坐點）在圖中的比例位置，給 3D 貼圖對齊用。
const OUT = "#4a3328";
const SKIN = "#ffd7b5", SKIN_D = "#f0b48c";
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  r = Math.round(r * k); g = Math.round(g * k); b = Math.round(b * k); return "#" + ((1 << 24) | (Math.min(255, r) << 16) | (Math.min(255, g) << 8) | Math.min(255, b)).toString(16).slice(1); };
const S = `stroke="${OUT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

function headFront(cx, cy, r, hair, style = 0) {
  const hs = shade(hair, 1.4);
  let back = "";
  if (style === 1) back = `<circle cx="${cx - r * 1.02}" cy="${cy - r * .05}" r="${r * .32}" fill="${hair}" ${S}/><circle cx="${cx + r * 1.02}" cy="${cy - r * .05}" r="${r * .32}" fill="${hair}" ${S}/>`;
  if (style === 2) back = `<path d="M${cx - r * 1.05},${cy} Q${cx - r * 1.15},${cy + r * .9} ${cx - r * .7},${cy + r * .95} L${cx + r * .7},${cy + r * .95} Q${cx + r * 1.15},${cy + r * .9} ${cx + r * 1.05},${cy} Z" fill="${hair}" ${S}/>`;
  const front = `<path d="M${cx - r * .98},${cy + r * .05} C${cx - r * 1.05},${cy - r * 1.1} ${cx + r * 1.05},${cy - r * 1.15} ${cx + r * .98},${cy + r * .02}
    C${cx + r * .7},${cy - r * .35} ${cx + r * .35},${cy - r * .5} ${cx + r * .05},${cy - r * .42} C${cx - r * .2},${cy - r * .2} ${cx - r * .6},${cy - r * .3} ${cx - r * .98},${cy + r * .05} Z" fill="${hair}" ${S}/>
    <path d="M${cx - r * .5},${cy - r * .72} q${r * .35},${-r * .2} ${r * .7},${-r * .1}" fill="none" stroke="${hs}" stroke-width="${r * .12}" stroke-linecap="round" opacity=".8"/>`;
  return back + `<circle cx="${cx - r * .97}" cy="${cy + r * .15}" r="${r * .18}" fill="${SKIN}" ${S}/><circle cx="${cx + r * .97}" cy="${cy + r * .15}" r="${r * .18}" fill="${SKIN}" ${S}/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${SKIN}" ${S}/>
    <path d="M${cx + r * .35},${cy + r * .75} A${r},${r} 0 0 0 ${cx + r * .95},${cy + r * .1}" fill="none" stroke="${SKIN_D}" stroke-width="${r * .14}" opacity=".6"/>` + front
    + [-1, 1].map(s => `<ellipse cx="${cx + s * r * .36}" cy="${cy + r * .18}" rx="${r * .1}" ry="${r * .15}" fill="${OUT}"/><circle cx="${cx + s * r * .36 + r * .035}" cy="${cy + r * .12}" r="${r * .04}" fill="#fff"/>
      <ellipse cx="${cx + s * r * .58}" cy="${cy + r * .45}" rx="${r * .14}" ry="${r * .08}" fill="#ff8f86" opacity=".55"/>`).join("")
    + `<path d="M${cx - r * .16},${cy + r * .5} Q${cx},${cy + r * .66} ${cx + r * .16},${cy + r * .5}" fill="#c9524a" stroke="${OUT}" stroke-width="2.4" stroke-linejoin="round"/>`;
}
function headSide(cx, cy, r, hair, style = 0) {
  const hs = shade(hair, 1.4);
  const tail = style === 1 ? `<path d="M${cx - r * .85},${cy - r * .2} q${-r * .6},${r * .1} ${-r * .55},${r * .75} q${r * .3},${-r * .15} ${r * .55},${-r * .3}" fill="${hair}" ${S}/>` : "";
  return tail + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${SKIN}" ${S}/>
    <path d="M${cx + r * .9},${cy + r * .05} q${r * .2},${r * .12} ${r * .02},${r * .26}" fill="${SKIN}" ${S}/>
    <path d="M${cx - r * 1.0},${cy + r * .25} C${cx - r * 1.15},${cy - r * 1.1} ${cx + r * .9},${cy - r * 1.25} ${cx + r * .95},${cy - r * .2}
      C${cx + r * .6},${cy - r * .5} ${cx + r * .25},${cy - r * .45} ${cx},${cy - r * .3} C${cx - r * .15},${cy + r * .05} ${cx - r * .35},${cy + r * .35} ${cx - r * 1.0},${cy + r * .25} Z" fill="${hair}" ${S}/>
    <path d="M${cx - r * .4},${cy - r * .75} q${r * .35},${-r * .18} ${r * .7},${-r * .05}" fill="none" stroke="${hs}" stroke-width="${r * .12}" stroke-linecap="round" opacity=".8"/>
    <circle cx="${cx - r * .2}" cy="${cy + r * .12}" r="${r * .2}" fill="${SKIN}" ${S}/>
    <ellipse cx="${cx + r * .5}" cy="${cy + r * .12}" rx="${r * .1}" ry="${r * .15}" fill="${OUT}"/><circle cx="${cx + r * .54}" cy="${cy + r * .06}" r="${r * .04}" fill="#fff"/>
    <ellipse cx="${cx + r * .45}" cy="${cy + r * .45}" rx="${r * .15}" ry="${r * .08}" fill="#ff8f86" opacity=".55"/>
    <path d="M${cx + r * .58},${cy + r * .52} q${r * .14},${r * .1} ${r * .3},${-r * .04}" fill="none" stroke="${OUT}" stroke-width="2.4" stroke-linecap="round"/>`;
}
function limb(pts, w, fill) {
  const d = "M" + pts.map(p => p.join(",")).join(" L");
  return `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${w + 6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
const hand = (x, y, r = 6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${SKIN}" ${S}/>`;
const shoe = (x, y, dir = 1) => `<path d="M${x - 9 * dir},${y - 6} q${2 * dir},-6 ${12 * dir},-5 q${9 * dir},1 ${10 * dir},8 l0,3 l${-22 * dir},0 Z" fill="#fff" ${S}/>`;
function torso(x, y, w, h, shirt, stripe) {
  const sd = shade(shirt, .82);
  return `<path d="M${x - w / 2},${y + 10} Q${x - w / 2},${y} ${x - w / 2 + 10},${y} L${x + w / 2 - 10},${y} Q${x + w / 2},${y} ${x + w / 2},${y + 10} L${x + w / 2 + 3},${y + h} L${x - w / 2 - 3},${y + h} Z" fill="${shirt}" ${S}/>`
    + (stripe ? `<path d="M${x - w / 2 + 1},${y + h * .45} L${x + w / 2 + 1},${y + h * .45}" stroke="${stripe}" stroke-width="6"/>` : "")
    + `<path d="M${x + w / 2 - 8},${y + 6} L${x + w / 2 + 1},${y + h - 2} L${x + w / 2 - 10},${y + h - 2} Z" fill="${sd}" opacity=".7"/>`
    + `<path d="M${x - 8},${y + 1} q8,8 16,0" fill="none" stroke="${OUT}" stroke-width="2.5"/>`;
}
const wrap = (W, H, body, flip) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 2}" height="${H * 2}" viewBox="0 0 ${W} ${H}"><g ${flip ? `transform="translate(${W},0) scale(-1,1)"` : ""}>${body}</g></svg>`;

export function kidSVG(pose, o = {}) {
  const { shirt = "#ff8a65", pants = "#3f51b5", hair = "#4e342e", style = 0, stripe = null, flip = false } = o;
  const P = pants;
  if (pose === "front" || pose === "arms") {
    const W = pose === "arms" ? 220 : 130, cx = W / 2, H = 232;
    let b = limb([[cx - 10, 160], [cx - 11, 212]], 15, SKIN) + limb([[cx + 10, 160], [cx + 11, 212]], 15, SKIN);
    b += `<path d="M${cx - 27},146 L${cx + 27},146 L${cx + 29},178 L${cx + 3},178 L${cx},170 L${cx - 3},178 L${cx - 29},178 Z" fill="${P}" ${S}/>`;
    b += shoe(cx - 12, 226, -1) + shoe(cx + 12, 226, 1);
    if (pose === "arms") b += limb([[cx - 24, 110], [cx - 58, 112], [cx - 88, 104]], 12, shirt) + hand(cx - 92, 103) + limb([[cx + 24, 110], [cx + 58, 112], [cx + 88, 104]], 12, shirt) + hand(cx + 92, 103);
    else b += limb([[cx - 24, 110], [cx - 34, 132], [cx - 34, 150]], 12, shirt) + hand(cx - 34, 154) + limb([[cx + 24, 110], [cx + 34, 132], [cx + 34, 150]], 12, shirt) + hand(cx + 34, 154);
    b += torso(cx, 100, 50, 52, shirt, stripe) + headFront(cx, 58, 40, hair, style);
    return { svg: wrap(W, H, b, flip), w: W, h: H, ax: .5, ay: 1 - 226 / H };
  }
  if (pose === "side" || pose === "reach" || pose === "throw") {
    const W = 150, H = 232, cx = 62;
    let b = limb([[cx - 4, 160], [cx - 18, 188], [cx - 24, 214]], 15, SKIN) + shoe(cx - 22, 226);
    b += limb([[cx + 4, 160], [cx + 14, 190], [cx + 20, 214]], 15, SKIN) + shoe(cx + 24, 226);
    b += `<path d="M${cx - 20},146 L${cx + 20},146 L${cx + 24},176 L${cx - 24},176 Z" fill="${P}" ${S}/>`;
    if (pose === "side") b += limb([[cx - 2, 110], [cx - 16, 132], [cx - 20, 150]], 12, shade(shirt, .85)) + hand(cx - 21, 154);
    b += torso(cx, 100, 40, 52, shirt, stripe);
    if (pose === "side") b += limb([[cx + 4, 110], [cx + 18, 130], [cx + 24, 148]], 12, shirt) + hand(cx + 25, 152);
    if (pose === "reach") b += limb([[cx + 4, 110], [cx + 30, 116], [cx + 58, 112]], 12, shirt) + hand(cx + 62, 111);
    b += headSide(cx + 4, 58, 40, hair, style);
    if (pose === "throw") b += limb([[cx + 2, 108], [cx + 26, 96], [cx + 48, 70]], 12, shirt) + hand(cx + 51, 65);
    return { svg: wrap(W, H, b, flip), w: W, h: H, ax: (flip ? W - cx : cx) / W, ay: 1 - 226 / H };
  }
  if (pose === "sit") {
    const W = 160, H = 212, cx = 58, seat = 150;
    let b = limb([[cx + 6, seat - 4], [cx + 40, seat - 2], [cx + 46, seat + 34]], 15, P) + shoe(cx + 52, seat + 50);
    b += torso(cx, seat - 56, 40, 54, shirt, stripe);
    b += limb([[cx + 6, seat - 46], [cx + 30, seat - 30], [cx + 48, seat - 24]], 12, shirt) + hand(cx + 52, seat - 24);
    b += headSide(cx + 6, seat - 98, 40, hair, style);
    return { svg: wrap(W, H, b, flip), w: W, h: H, ax: (flip ? W - cx : cx) / W, ay: 1 - seat / H };
  }
  if (pose === "crawl") {
    const W = 240, H = 150, g = 144;
    let b = limb([[70, 96], [52, g - 4], [18, g - 6]], 15, P) + limb([[80, 96], [70, g - 4], [36, g - 2]], 15, shade(P, .85));
    b += limb([[150, 92], [158, 118], [164, g - 6]], 12, shade(shirt, .85)) + hand(166, g - 4);
    b += `<path d="M62,84 Q66,66 96,64 L146,66 Q166,70 164,92 L162,104 Q120,112 70,108 Z" fill="${shirt}" ${S}/>`;
    b += (stripe ? `<path d="M110,66 L108,108" stroke="${stripe}" stroke-width="6"/>` : "") + `<path d="M64,98 Q110,110 162,100 L162,106 Q120,112 70,108 Z" fill="${shade(shirt, .82)}" opacity=".7"/>`;
    b += limb([[144, 92], [148, 120], [150, g - 6]], 12, shirt) + hand(152, g - 4);
    b += headSide(186, 66, 36, hair, style);
    return { svg: wrap(W, H, b, flip), w: W, h: H, ax: .5, ay: 1 - g / H };
  }
  if (pose === "adult") {
    const W = 160, H = 330, cx = 64, gy = 322;
    let b = limb([[cx - 6, 210], [cx - 12, 262], [cx - 14, 306]], 17, "#4b5a78") + shoe(cx - 12, gy);
    b += limb([[cx + 6, 210], [cx + 10, 262], [cx + 14, 306]], 17, "#56678a") + shoe(cx + 18, gy);
    b += `<path d="M${cx - 28},120 Q${cx - 28},108 ${cx - 16},108 L${cx + 16},108 Q${cx + 28},108 ${cx + 28},120 L${cx + 30},214 L${cx - 30},214 Z" fill="#2e7d6f" ${S}/>`;
    b += `<path d="M${cx - 16},140 L${cx + 22},140 L${cx + 26},214 L${cx - 18},214 Z" fill="#fff4dc" ${S}/>`;
    b += limb([[cx + 4, 122], [cx + 34, 150], [cx + 66, 150]], 14, "#2e7d6f") + hand(cx + 70, 150, 7);
    b += headSide(cx + 4, 64, 40, "#3e2723", 1);
    return { svg: wrap(W, H, b, flip), w: W, h: H, ax: (flip ? W - cx : cx) / W, ay: 1 - gy / H };
  }
}
