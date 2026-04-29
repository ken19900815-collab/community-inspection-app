# 社區巡檢雲端正式版 V2 - 已整合最終點檢項目

本版已整合：
- 16 個巡檢點
- 155 個點檢項目
- LINE LIFF ID：2009930434-iD9N0AwB
- LINE Bot Webhook：/api/webhook
- 多張照片上傳
- Vercel Blob 雲端儲存
- 主管後台：admin.html

## 部署方式

1. 將本資料夾所有檔案上傳 / 覆蓋 GitHub 專案。
2. Vercel 連動部署。
3. Vercel 專案需設定 Environment Variables：
   - CHANNEL_ACCESS_TOKEN
   - BLOB_READ_WRITE_TOKEN
4. LINE Developers / Official Account Webhook URL：
   https://community-inspection-app.vercel.app/api/webhook
5. 主管後台：
   https://community-inspection-app.vercel.app/admin.html

## 注意
照片與巡檢紀錄使用 Vercel Blob，必須在 Vercel 專案啟用 Blob Storage。
