// 產生網站圖片的壓縮版（WebP 小／中／大），讓網頁先載小圖、再依顯示大小換成清楚的版本。
// 換圖或加圖後，提交前要跑一次，並把 assets/v 一起提交（沒跑的話網站會顯示舊的壓縮版）。
// 手動：node _tools/make-variants.mjs（只處理新圖或內容改過的圖）；--all 全部重做。
// 來源：assets/img、assets/photos、assets/plays 底下的 png/jpg，以及 assets/hero-g.png
// 輸出：assets/v/<原路徑去掉副檔名>-s.webp（寬 400）、-m.webp（寬 800）、-l.webp（寬 1600），不放大超過原圖。
// assets/v/manifest.json 記錄每張原圖的內容雜湊，原圖換掉就會重做；原圖刪掉，壓縮版也會刪掉。
import { readdirSync, statSync, mkdirSync, existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname, relative, extname } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const A = join(ROOT, "assets"), OUT = join(A, "v"), MAN = join(OUT, "manifest.json");
const FFMPEG = process.env.FFMPEG || "D:\\Tools\\ffmpeg-8.1-essentials\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe";
const SIZES = { s: 400, m: 800, l: 1600 };
const ALL = process.argv.includes("--all");

const walk = d => existsSync(d) ? readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; }) : [];
const files = [...walk(join(A, "img")), ...walk(join(A, "photos")), ...walk(join(A, "plays")), join(A, "hero-g.png")]
  .filter(f => /\.(png|jpe?g)$/i.test(f) && existsSync(f));
const old = existsSync(MAN) ? JSON.parse(readFileSync(MAN, "utf8")) : {};
const man = {};
let made = 0, skipped = 0, removed = 0;
for (const f of files) {
  const key = relative(A, f).replace(/\\/g, "/"), base = key.slice(0, -extname(key).length);
  const hash = createHash("sha1").update(readFileSync(f)).digest("hex").slice(0, 16);
  man[key] = hash;
  const outs = Object.keys(SIZES).map(k => join(OUT, `${base}-${k}.webp`));
  if (!ALL && old[key] === hash && outs.every(existsSync)) { skipped++; continue; }
  mkdirSync(dirname(outs[0]), { recursive: true });
  for (const [k, w] of Object.entries(SIZES))
    execFileSync(FFMPEG, ["-v", "error", "-y", "-i", f, "-vf", `scale='min(iw,${w})':-2:flags=lanczos`, "-c:v", "libwebp", "-quality", k === "s" ? "72" : "80", "-compression_level", "4", join(OUT, `${base}-${k}.webp`)]);
  made++;
}
for (const key of Object.keys(old)) if (!man[key]) {
  const base = key.slice(0, -extname(key).length);
  for (const k of Object.keys(SIZES)) rmSync(join(OUT, `${base}-${k}.webp`), { force: true });
  removed++;
}
writeFileSync(MAN, JSON.stringify(man, null, 1) + "\n");
console.log(`完成：重做 ${made} 張原圖，略過 ${skipped} 張，移除 ${removed} 張。`);
