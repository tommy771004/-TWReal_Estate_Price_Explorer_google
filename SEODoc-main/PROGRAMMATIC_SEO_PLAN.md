# Programmatic SEO 分析與發布計畫

更新日期：2026-07-01

## Programmatic SEO Score：78/100

| 類別 | 狀態 | 分數 |
| --- | --- | ---: |
| Data Quality | 良好 | 86 |
| Template Uniqueness | 注意 | 68 |
| URL Structure | 良好 | 90 |
| Internal Linking | 良好 | 82 |
| Thin Content Risk | 注意 | 66 |
| Index Management | 良好 | 84 |

## 現況

- 66 個縣市 × 買賣/預售屋/租賃頁由結構化 selection 產生。
- 34 個內容頁包含 6 個六都行政區索引 hub。
- sitemap 共 100 URL。
- 單一行政區查詢路由可供使用者操作，但目前不進 sitemap，也不做 build-time prerender。

縣市/交易類型頁的主要價值是實際成交資料、篩選、圖表與地圖，不只是替換地名；然而靜態 intro 與 template 相似度高，仍應用 Search Console 與抽樣內容檢查監控。

## 行政區深度頁發布閘門

行政區深度頁只有在下列條件全部通過後才能索引：

- 每頁至少 300 字可見且有用的獨特說明。
- 與同批其他頁相比，genuinely unique content 至少 40%。
- unique content 低於 30% 時為 hard stop，不得發布。
- 有該行政區獨特的成交樣本摘要、產品型態或生活圈判讀。
- 說明資料期間、樣本限制、車位/屋齡/建物型態比較口徑。
- 至少 2 條描述性站內連結，並能從城市 hub 抵達。
- 自我 canonical、BreadcrumbList、正確 title/H1/description。
- 每批人工抽查至少 10%，不合格頁整批暫停。

## 漸進發布

1. 先選六都各 1 區，共 6 個行政區試點。
2. 發布後觀察 2–4 週的 crawl、index、impression 與使用行為。
3. 指標正常且無近重複問題，再擴至每批最多 20 頁。
4. 不一次發布 100+ 行政區頁。

## 自動化檢查

- sitemap 不得出現未通過閘門的根路徑 `/districts/` 頁。
- URL 必須小寫英文固定 segment、編碼後地名，且無 query parameter。
- sitemap URL 唯一、canonical origin 一致。
- 生成頁數與預期 inventory 相同。
- 每月比對 intended URL、sitemap URL 與 Search Console indexed URL。

## 內部連結模型

- 六都行政區索引為 hub。
- 合格行政區深度頁為 spoke。
- spoke 連回城市指南、方法頁與相鄰/同生活圈頁。
- Anchor text 描述頁面內容，避免每頁重複完全相同的精準關鍵字。

