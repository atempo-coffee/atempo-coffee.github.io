# ATEMPO COFFEE 官方網站（Komorebi 版）

採用 **YAML 資料驅動 + GitHub Actions 自動建置靜態網站**，專為本機使用 Antigravity / Sublime 維護並透過 `git push` 更新庫存而設計。

## 目錄結構

- `data/site.yaml`：品牌資訊、首頁文案、主打活動指定（`featuredCampaign`）、LINE 連結與訂購步驟。
- `data/campaigns/*.yaml`：各檔活動與豆單資料（例如 `2026-sample.yaml`）。
- `assets/images/`：活動主視覺與豆子產地故事照片。
- `src/`：模板、Komorebi 樣式、前端互動腳本與靜態建置腳本 `build.js`。
- `.github/workflows/deploy.yml`：推送到 `main` 分支時自動執行 `npm run build` 並發布到 GitHub Pages。

## 日常維護（更新庫存 / 賣貨便 / 新增活動）

1. 用 Sublime 或 Antigravity 開啟 `data/campaigns/<活動名稱>.yaml`。
2. 修改某款豆子的 `stock`：
   - 數字（如 `6`）：顯示 `剩餘 6`
   - `0`：顯示 `庫存：0`
   - `"完售"`：顯示 `完售`
   - `"下單後烘製"` 或 `"接單現烘"`：顯示 `接單現烘`
   - 其他文字（如 `"即將進貨"`）：原樣顯示該文字
   - 若個別規格（如 `drip` 掛耳包）需要獨立庫存，可在該規格下加 `stock:` 覆寫。
3. 若該活動已有 7-11 賣貨便賣場，填入 `myshipUrl:` 即可自動顯示賣貨便入口。
4. 存檔後執行：
   ```bash
   git add .
   git commit -m "update bean stock"
   git push
   ```
   GitHub Actions 會於約 1 分鐘內完成建置並更新網站。

## 本機開發與預覽

```bash
npm install      # 初次設定執行一次即可
npm run build    # 建置靜態檔至 dist/
npm run dev      # 啟動本機預覽 http://localhost:4173/ 並監聽檔案自動重建
```
