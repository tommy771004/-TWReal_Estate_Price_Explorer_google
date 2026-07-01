# Sitemap 驗證報告

更新日期：2026-07-01

## 結論

本專案的 sitemap inventory 共 100 個 canonical URL：

- 66 個縣市 × 交易類型查詢頁。
- 34 個指南、信任頁與六都行政區索引頁。
- 0 個 query string 舊網址。
- 0 個未審核的 `/districts/{city}/{district}/{type}/` 行政區深度頁。

`public/sitemap.xml` 與 production build 已改用 `src/lib/seoSitemap.ts` 的同一份 URL inventory，避免來源檔只列 11 頁、build 卻列 100 頁的漂移。

## 驗證結果

| 檢查 | 結果 | 證據 |
| --- | --- | --- |
| XML 格式 | 通過 | XML declaration 與 sitemap protocol `urlset` |
| URL 數量 | 通過 | 100，遠低於單檔 50,000 上限 |
| Canonical origin | 通過 | 全部使用正式 HTTPS origin |
| 重複 URL | 通過 | 100 個 URL 均唯一 |
| Query URL | 通過 | 未收錄 `?city=`、`?type=` 等舊路由 |
| Deprecated tags | 通過 | 未使用 `priority` 或 `changefreq` |
| robots.txt 宣告 | 通過 | 指向正式 `/sitemap.xml` |
| lastmod | 通過但需區分 | source inventory 不填假日期；production build 依頁面查核日或建置日寫入 |
| 行政區薄頁 | 通過 | 六都索引可收錄，未審核的行政區查詢頁不進 sitemap |

## Live Crawl 限制

本次 live crawl 未完成：Firecrawl 回傳無效憑證，備援公開抓取工具亦無法直接開啟此 Vercel 網址。因此本報告不能宣稱正式站上 100 個 URL 全部回傳 HTTP 200，也未量測 redirect chain、實際 content type 或部署後 canonical。

部署後仍需執行：

```bash
npm run seo:verify-live
```

並在 Google Search Console 確認 sitemap 可讀、發現 URL 數與預期相符。

## 嚴重度

- **Critical：無。**
- **High：部署後 HTTP 狀態與 sitemap content type 尚未取得外部證據。**
- **Medium：多數資料查詢頁的 `lastmod` 仍代表建置更新，不等於每筆官方成交資料的更新日。**
- **Low：若未來超過 50,000 URL，才需要拆分 sitemap index；目前不需要。**

