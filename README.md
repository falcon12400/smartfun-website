# 聰明動 SMART FUN 教具網站（試作）

幼兒體能教具型錄網站的試作版。純靜態網頁（HTML／CSS／JavaScript），不需要建置。

> ⚠️ 試作階段：教具說明、玩法內容、年齡與數字多為**示意**，3D 模型尺寸是從照片估計的，正式內容待工作室提供。

## 內容

| 路徑 | 說明 |
|---|---|
| `index.html` | 選單：三種風格入口 |
| `a/` `e/` `g/` | 三種風格（A 北歐極簡、E 專業教學、G 溫暖品牌）；`index.html` 教具列表、`item.html?id=` 教具頁（電腦版＋手機版） |
| `design/` | 教具頁設計稿（先美術、後工程的畫面示意） |
| `3d/` | 聰明搖滾圈 3D 試作（可調尺寸） |
| `assets/catalog.js` | 教具資料 |
| `assets/plays.js` | 玩法資料（類型／年齡／限制標籤） |
| `assets/item.js` | 教具頁共用程式 |
| `assets/rocker3d.js` | 聰明搖滾圈 3D 模型（three.js） |
| `_tools/` | 玩法示意圖產生器 |

## 本機預覽

```
node serve.mjs            # http://127.0.0.1:8720/
node serve.mjs <內網IP> 8720
```


## 跨專案依賴

本專案 ID 為 `prj-fa7aa2dc-87e5-48b8-af58-a6ddc507254c`。引用、改名或搬移前，請先閱讀 [PROJECT-DEPENDENCIES.md](PROJECT-DEPENDENCIES.md)。
