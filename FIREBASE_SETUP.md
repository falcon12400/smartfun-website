# SmartFun 測試網站後台：Firebase 設定

測試前台網址是 `/test/`，後台網址是 `/admin/`。正式 `/g/` 網站仍使用原本靜態資料，不會被測試後台改動。

## 使用的既有 Firebase 專案

- Firebase 專案：`smartfunyearendparty`（既有 SmartFunYearEndParty）
- Authentication：尚待在 Firebase Console 初始化並啟用 Google 登入
- Realtime Database：`smartfunyearendparty-default-rtdb`
- SmartFun 只使用：
  - `smartfunTest/equipment`：器材、封面路徑、分類、說明與排序
  - `smartfunTest/activities`：關卡、圖片路徑、步驟與安全提醒
  - `smartfunAdmins/{uid}`：SmartFun 後台管理員白名單

專案原有年末活動資料不會被搬移或覆寫；新的網站內容只放在 `smartfunTest/`。

## 第一次使用

1. 到 `/admin/` 使用已列入 `smartfunAdmins` 的 Google 帳號登入。
2. 若測試資料庫為空，按「匯入正式網站現有資料」。
3. 到 `/test/` 確認器材、封面與關卡。
4. 後續在後台修改並儲存，只會更新 `smartfunTest/`。

## 圖片

目前圖片檔仍放在網站的 `assets/`，資料庫保存圖片路徑或外部網址。這樣不需要 Cloud Storage，也不需要 Blaze 方案。若未來需要從手機直接上傳新圖片，再另行評估 Storage。

## 安全設計

- `smartfunTest/` 可公開讀取，供測試網站顯示。
- 只有 `smartfunAdmins/{uid}` 值為 `true` 的 Google 登入帳號可以寫入。
- `smartfunAdmins/` 不能由網頁自行新增或修改，只能由可信任的 Firebase 維護工具管理。
- 專案原有的年末活動路徑維持不可公開讀寫；部署與匯入不會刪除其資料。

## 規則位置與部署

Realtime Database 規則由 SmartFun 網站專案維護：

`D:\VSCode\smartfun-website\database.rules.json`

部署時明確指定既有專案：

```powershell
firebase deploy --only database --project smartfunyearendparty
```

