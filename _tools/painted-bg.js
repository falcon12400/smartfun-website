// 水彩風景背景（吉卜力式氛圍：藍天積雲、遠山、樹林、陽光草原）＋紙張紋理。回傳 SVG 內容字串。
// horizon：地平線 y（像素）。所有隨機用固定種子，重畫結果一樣。
export function paintedBackground(W, H, horizon) {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const cloud = (cx, cy, s) => {
    const puffs = [[0, 0, 1], [-.9, .25, .72], [.95, .2, .78], [-.45, -.45, .7], [.4, -.55, .8], [1.6, .4, .5], [-1.55, .45, .48], [.05, .35, .9]];
    const body = puffs.map(([x, y, r]) => `<circle cx="${cx + x * 60 * s}" cy="${cy + y * 50 * s}" r="${r * 52 * s}"/>`).join("");
    return `<g filter="url(#soft)"><g fill="#c9d7e6" transform="translate(${6 * s},${14 * s})">${body}</g><g fill="#fffdf8">${body}</g>
      <g fill="#ffe9c9" opacity=".55">${puffs.slice(3, 5).map(([x, y, r]) => `<circle cx="${cx + x * 60 * s - 10 * s}" cy="${cy + y * 50 * s - 12 * s}" r="${r * 34 * s}"/>`).join("")}</g></g>`;
  };
  // 遠方樹林：一團團圓
  const trees = (y, n, col, hi, sMin, sMax) => { let g = ""; for (let k = 0; k < n; k++) { const x = k / (n - 1) * (W + 80) - 40 + (rnd() - .5) * 30, r = sMin + rnd() * (sMax - sMin);
      g += `<circle cx="${x}" cy="${y - r * .5}" r="${r}" fill="${col}"/><circle cx="${x - r * .3}" cy="${y - r * .85}" r="${r * .55}" fill="${hi}" opacity=".55"/>`; } return `<g filter="url(#soft)">${g}</g>`; };
  // 草地筆觸
  let grass = "";
  for (let k = 0; k < 900; k++) { const y = horizon + Math.pow(rnd(), .8) * (H - horizon + 20), t = (y - horizon) / (H - horizon), x = rnd() * W;
    const len = 4 + t * 16, c = ["#8cc063", "#77ad4f", "#a5d273", "#6c9f45", "#b6dc80"][Math.floor(rnd() * 5)], a = (rnd() - .5) * .6;
    grass += `<path d="M${x.toFixed(1)},${y.toFixed(1)} q${(a * len).toFixed(1)},${(-len * .6).toFixed(1)} ${(a * len * 1.6).toFixed(1)},${(-len).toFixed(1)}" stroke="${c}" stroke-width="${(1 + t * 2).toFixed(1)}" stroke-linecap="round" opacity="${(.35 + t * .4).toFixed(2)}" fill="none"/>`; }
  let flowers = "";
  for (let k = 0; k < 40; k++) { const y = horizon + 30 + rnd() * (H - horizon - 30), x = rnd() * W, t = (y - horizon) / (H - horizon), c = ["#fff8e6", "#ffd9e0", "#ffe37a"][k % 3];
    flowers += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1 + t * 2.4).toFixed(1)}" fill="${c}" opacity=".9"/>`; }
  return `<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f9fd8"/><stop offset=".6" stop-color="#9ccbe9"/><stop offset="1" stop-color="#dcefe9"/></linearGradient>
    <linearGradient id="field" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ccc66"/><stop offset=".5" stop-color="#8dc05c"/><stop offset="1" stop-color="#76ab4b"/></linearGradient>
    <radialGradient id="sun" cx="78%" cy="8%" r="70%"><stop offset="0" stop-color="#fff6d8" stop-opacity=".9"/><stop offset=".45" stop-color="#fff2c8" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="pool" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#e9f5a8" stop-opacity=".55"/><stop offset="1" stop-color="#e9f5a8" stop-opacity="0"/></radialGradient>
    <radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3b2a10" stop-opacity=".22"/></radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="2"/><feDisplacementMap in="SourceGraphic" scale="9"/><feGaussianBlur stdDeviation=".9"/></filter>
    <filter id="wash"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="5" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 -.12"/></filter>
    <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .28  0 0 0 .55 -.18"/></filter>
  </defs>
  <rect width="${W}" height="${horizon + 40}" fill="url(#sky)"/>
  ${cloud(W * .2, horizon * .32, .85)}${cloud(W * .72, horizon * .45, 1.15)}${cloud(W * .47, horizon * .15, .55)}${cloud(W * .97, horizon * .1, .6)}
  <path d="M0,${horizon - 30} C${W * .2},${horizon - 85} ${W * .38},${horizon - 60} ${W * .55},${horizon - 70} S${W * .85},${horizon - 95} ${W},${horizon - 55} L${W},${horizon + 10} L0,${horizon + 10} Z" fill="#8fb3c4" opacity=".75" filter="url(#soft)"/>
  ${trees(horizon + 4, 26, "#4f8a4c", "#7fb35f", 16, 30)}
  <rect y="${horizon}" width="${W}" height="${H - horizon}" fill="url(#field)"/>
  ${trees(horizon + 10, 12, "#3f7a43", "#6ea455", 10, 18)}
  <ellipse cx="${W * .55}" cy="${horizon + (H - horizon) * .55}" rx="${W * .55}" ry="${(H - horizon) * .45}" fill="url(#pool)"/>
  <g>${grass}</g><g>${flowers}</g>
  <rect width="${W}" height="${H}" filter="url(#wash)" opacity=".5"/>
  <rect width="${W}" height="${H}" fill="url(#sun)"/>`;
}
export function paperOverlay(W, H) {
  return `<defs><filter id="paper2"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .28  0 0 0 .5 -.2"/></filter>
    <radialGradient id="vig2" cx="50%" cy="45%" r="75%"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3b2a10" stop-opacity=".2"/></radialGradient>
    <linearGradient id="warm" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd98a" stop-opacity=".22"/><stop offset=".6" stop-color="#ffd98a" stop-opacity="0"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#warm)"/><rect width="${W}" height="${H}" filter="url(#paper2)"/><rect width="${W}" height="${H}" fill="url(#vig2)"/>`;
}
