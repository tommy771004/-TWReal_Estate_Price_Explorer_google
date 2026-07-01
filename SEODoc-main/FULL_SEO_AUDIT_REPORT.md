# 完整 SEO 稽核報告

更新日期：2026-07-01

## Executive Summary

**SEO Health Score：83/100**

網站類型：台灣實價登錄資料工具、購屋/租屋資訊指南。

本次以 repository、production build 與自動化 SEO tests 為主要證據。因 live crawl 與 Search Console/CrUX 權限不可用，HTTP 200、實際索引狀態、流量及 Core Web Vitals 不納入已驗證事實。

| 類別 | 權重 | 分數 | 摘要 |
| --- | ---: | ---: | --- |
| Technical SEO | 22% | 86 | prerender、canonical、robots、100 URL sitemap 完整 |
| Content Quality | 23% | 82 | 指南群與官方來源良好，部分頁面仍可增加原創資料判讀 |
| On-Page SEO | 20% | 84 | title、description、H1、breadcrumb 與內鏈齊全 |
| Schema | 10% | 88 | WebPage、Article、ItemList、Dataset、BreadcrumbList 已建立 |
| Performance | 10% | 70 | 已拆分 bundle，但缺正式站 lab/field evidence |
| AI Search Readiness | 10% | 85 | answer-first、表格、llms.txt、來源與限制訊號良好 |
| Images | 5% | 80 | OG PNG 已測試；內容頁視覺與圖片搜尋機會有限 |

## 優先發現

1. **High：live crawl 與 Search Console 證據缺口。** 目前無法確認正式站所有 sitemap URL 的狀態碼、索引涵蓋與 canonical 選擇。
2. **High：行政區查詢路由不應直接大量索引。** 目前 sitemap 正確排除深度路由；必須先有區域獨特資料與人工抽查才能逐批發布。
3. **Medium：資料頁 lastmod 語意仍偏粗。** 建置日可證明頁面版本更新，但不代表官方資料批次更新時間。
4. **Medium：競品/替代方案內容缺乏可驗證資料集。** 未建立公開比較頁是正確選擇，先完成來源與查核流程。
5. **Low：部分資訊頁仍可補充作者責任與修訂紀錄。** 現有 Organization publisher 與更正流程已提供基礎信任訊號。

## Quick Wins

- sitemap URL inventory 已集中到共用 helper，並新增 100 URL parity test。
- 每月 smoke checklist 加入 `test:seo-sitemap`。
- 在部署流程保存 `seo:verify-live` 結果，避免只驗證本機 build。
- 行政區深度頁採小批次發布，每批先抽查至少 10%。
- 競品比較頁只使用可追溯來源，保留查核日期與方法揭露。

## 技術與內容結論

- 公開頁允許 crawl，`/api/` 阻擋合理。
- build-time HTML 包含內容、metadata 與 JSON-LD，對無 JavaScript crawler 友善。
- 66 個縣市/交易類型頁提供真實互動資料價值，不只是關鍵字替換；但其靜態文字相似度仍需監控。
- 六都行政區索引具有城市別判讀內容，適合作為 hub；單一行政區頁目前不滿足規模化發布門檻。
- 金融、補貼、租屋權益頁已有查核日期、官方來源與非個別建議聲明。

## 未驗證項目

- 正式站逐頁 HTTP status、redirect 與 response header。
- Google Search Console 的 indexed/not indexed 分布。
- CrUX/Lighthouse 的 LCP、INP、CLS。
- 實際 SERP 排名、搜尋量、反向連結與 AI citation。

