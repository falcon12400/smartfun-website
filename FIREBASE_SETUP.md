# SmartFun 網站後台：Firebase 設定

後台網址是 `/admin/`。尚未綁定 Firebase 時可用「先看後台畫面」測試介面，但不會儲存或改到公開網站。

## 一次性設定

1. 在 Firebase Console 建立或選擇一個專案，新增「Web 應用程式」。
2. 在 Authentication 啟用 **Google** 登入方式。
3. 建立 Cloud Firestore 資料庫。
4. 若要讓後台直接上傳圖片，再建立 Cloud Storage bucket。Firebase 自 2026-02-03 起要求使用 Cloud Storage 的專案採 Blaze 隨用隨付方案；即使使用量落在免費額度內，仍要先連結付款帳戶。未經使用者同意不要啟用。
5. 把 Firebase Console 顯示的 `firebaseConfig` 物件貼到 `assets/firebase-config.js`，取代目前的 `null`。
6. 在 Authentication 的授權網域加入：
   - `falcon12400.github.io`
   - 本機測試需要的 `localhost`
7. 發布本資料夾的 `firestore.rules`；有啟用圖片上傳時，再發布 `storage.rules`。
8. 管理者第一次用 Google 登入後，從 Authentication 複製該帳號的 UID；在 Firestore 手動建立：

   - Collection：`admins`
   - Document ID：該管理者 UID
   - 欄位：`enabled`（Boolean）=`true`

完成後，管理者可在後台登入。第一次發布會把網站現有的靜態教具資料匯入 `siteContent/main`；之後公開網站會優先讀取這份資料。

## 安全設計

- Firebase Web 設定會出現在瀏覽器裡，這是正常設計；真正的資料權限由 Security Rules 和管理員白名單控制。
- 公開網站只可讀 `siteContent` 和 `public/` 圖片。
- 只有 `admins/{uid}` 中 `enabled: true` 的登入帳號可修改內容或上傳圖片。
- 管理者無法從網站自行把別人加入白名單；白名單只能由 Firebase Console 或可信任的伺服器端工具維護。
- 圖片上傳後會產生 400、800、1600 像素的 WebP 版本，前台直接使用 800 像素版本。

## 發布 Rules

電腦目前沒有安裝 Firebase CLI。之後若要使用 CLI，先把 `.firebaserc.example` 複製成 `.firebaserc` 並填入專案 ID，再執行：

```powershell
firebase deploy --only firestore:rules,storage
```

也可以直接在 Firebase Console 的 Firestore Rules 與 Storage Rules 頁面貼上並發布，不必安裝 CLI。

