# 聰明動 SMART FUN 教具網站

幼兒體能教具型錄網站。純靜態網頁（HTML／CSS／JavaScript），不需要建置。

- 網址：https://falcon12400.github.io/smartfun-website/ （GitHub Pages，發布來源為 `gh-pages` 分支）
- 共同規則、素材位置、隱私與分工：先讀 [AGENTS.md](AGENTS.md)

> ⚠️ 教具說明、玩法內容、年齡多為**示意**，正式內容待工作室提供。

## 內容

| 路徑 | 說明 |
|---|---|
| `index.html` | 直接轉到 `g/`（保留 `?cat=` 與 `#`） |
| `g/index.html` | 首頁＋教具列表（G 溫暖品牌風格） |
| `g/item.html?id=` | 教具頁（電腦版＋手機版，760px 以下切手機版）；用真實照片，不再顯示 3D |
| `g/contact.html` | 聯絡我們（LINE 官方帳號建立中，目前只有說明） |
| `assets/catalog.js` | 教具資料（目前 17 項＋聰明搖滾圈） |
| `assets/plays.js` | 玩法資料；陣列順序＝顯示順序（特別的玩法排前面）。一個玩法可放多張圖（`photos`）。檔內仍有 type／age 等欄位，但頁面已不顯示標籤、不做篩選 |
| `assets/item.js` | 教具頁共用程式（玩法卡、多圖切換、完整玩法、安全、教案組合） |
| `assets/mobile-nav.js` `.css` | 手機版選單 |
| `assets/img/` `assets/photos/` | 教具圖、Logo（`img/logo-smartfun.png`）、商品照、玩法寫實示意圖 |
| `assets/rocker3d.js` | 聰明搖滾圈 3D 模型（three.js）；網站已不使用，留給 `_tools/` 畫構圖草稿 |
| `_tools/` | 示意圖與 3D 構圖草稿產生器（不在網站導覽中） |
| `design/` `3d/` | 舊設計稿與 3D 試作，**沒有連結**，保留參考 |

## 本機預覽

```
node serve.mjs            # http://127.0.0.1:8720/
node serve.mjs <內網IP> 8720
```

## 跨專案依賴

本專案 ID 為 `prj-fa7aa2dc-87e5-48b8-af58-a6ddc507254c`。引用、改名或搬移前，請先閱讀 [PROJECT-DEPENDENCIES.md](PROJECT-DEPENDENCIES.md)。
