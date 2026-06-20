export type SeoContentSection = {
  heading: string;
  paragraphs: string[];
  items?: string[];
};

export type SeoContentPage = {
  path: string;
  title: string;
  description: string;
  intro: string;
  sections: SeoContentSection[];
  links?: { href: string; label: string }[];
};

export const SEO_CONTENT_PAGES: SeoContentPage[] = [
  {
    path: "/prices/",
    title: "台灣各縣市實價登錄查詢",
    description: "依縣市與交易類型進入台灣買賣、預售屋及租賃實價登錄查詢頁。",
    intro: "從縣市與交易類型選擇可索引的實價登錄入口；每個頁面提供對應查詢條件、成交資料、圖表與地圖，行政區頁則只在資料量與內容足夠時建立。",
    sections: [
      { heading: "六都熱門入口", paragraphs: ["先選擇最接近需求的縣市與交易類型，再於查詢工具內縮小行政區、期間、價格與坪數範圍。"] },
      { heading: "如何比較", paragraphs: ["跨縣市比較時應維持相同交易類型與期間，並同時考慮建物型態、屋齡、面積和車位拆分方式。"] },
    ],
    links: [
      { href: "/prices/%E8%87%BA%E5%8C%97%E5%B8%82/%E8%B2%B7%E8%B3%A3/", label: "臺北市買賣實價登錄" },
      { href: "/prices/%E6%96%B0%E5%8C%97%E5%B8%82/%E8%B2%B7%E8%B3%A3/", label: "新北市買賣實價登錄" },
      { href: "/prices/%E6%A1%83%E5%9C%92%E5%B8%82/%E9%A0%90%E5%94%AE%E5%B1%8B/", label: "桃園市預售屋實價登錄" },
      { href: "/prices/%E8%87%BA%E4%B8%AD%E5%B8%82/%E8%B2%B7%E8%B3%A3/", label: "臺中市買賣實價登錄" },
      { href: "/prices/%E8%87%BA%E5%8D%97%E5%B8%82/%E9%A0%90%E5%94%AE%E5%B1%8B/", label: "臺南市預售屋實價登錄" },
      { href: "/prices/%E9%AB%98%E9%9B%84%E5%B8%82/%E9%A0%90%E5%94%AE%E5%B1%8B/", label: "高雄市預售屋實價登錄" },
    ],
  },
  {
    path: "/guides/",
    title: "實價登錄使用指南",
    description: "實價登錄成交紀錄、預售屋比較與地圖位置限制的實用閱讀指南。",
    intro: "這些指南協助使用者判讀公開成交資料的條件與限制，避免只看單一每坪價格就做出不適當比較。",
    sections: [
      { heading: "從資料判讀開始", paragraphs: ["先確認交易標的、成交期間與價格口徑，再使用地圖和統計圖觀察分布；重要決策仍需回查官方資料並現場確認。"] },
    ],
    links: [
      { href: "/guides/transaction-records/", label: "如何閱讀實價登錄成交紀錄" },
      { href: "/guides/presale-vs-resale/", label: "預售屋與成屋實價登錄怎麼比較" },
      { href: "/guides/map-location-limitations/", label: "地圖位置為什麼可能不精確" },
    ],
  },
  {
    path: "/methodology/",
    title: "實價登錄資料方法與計算說明",
    description: "說明本站如何取得、清理、換算與呈現內政部實價登錄資料，以及統計結果的限制。",
    intro: "本站直接使用內政部公開的實價登錄資料，將原始交易欄位整理為可搜尋、比較與地圖檢視的格式；所有統計僅描述已申報成交紀錄，不是估價或投資建議。",
    sections: [
      { heading: "資料處理流程", paragraphs: ["系統依縣市與交易類型下載官方資料，保留買賣、預售屋與租賃的原始成交欄位，再依使用者選擇的行政區、期間、總價、單價、坪數與屋齡條件進行篩選。"], items: ["面積由平方公尺換算為坪時使用 1 平方公尺約等於 0.3025 坪。", "單價比較以資料中的交易價格與面積欄位為基礎。", "缺漏、格式異常或無法解析的欄位不應被推估補值。"] },
      { heading: "統計與比較限制", paragraphs: ["平均值會受到交易組成、特殊交易、車位拆分方式與樣本數影響。跨區比較前應同時查看交易類型、建物型態、屋齡、樓層和時間範圍，不能只比較單一平均單價。"] },
      { heading: "更新與更正", paragraphs: ["頁面日期代表本站內容或程式的建置日期；成交資料的公布與更正時程以內政部為準。官方資料更新後，重新查詢可能得到不同結果。"] },
    ],
  },
  {
    path: "/data-sources/",
    title: "實價登錄資料來源",
    description: "本站房價、預售屋與租賃成交資料的官方來源、使用方式與資料限制。",
    intro: "本站的交易資料主要來自內政部不動產交易實價查詢服務網與其公開下載資料，介面與衍生統計由本站整理，並非政府機關官方服務。",
    sections: [
      { heading: "主要官方來源", paragraphs: ["內政部不動產交易實價查詢服務網提供買賣、預售屋及租賃成交申報資料。查核個別交易時，應回到官方網站確認最新內容。"], items: ["官方查詢：https://lvr.land.moi.gov.tw/", "公開資料下載：https://plvr.land.moi.gov.tw/"] },
      { heading: "資料不包含什麼", paragraphs: ["實價登錄不是目前售價、銀行鑑價或未來價格預測。部分地址會為保護隱私而區間化，且申報、揭露與本站取得資料之間可能存在時間差。"] },
    ],
  },
  {
    path: "/about/",
    title: "關於實價登錄查詢",
    description: "了解 Taiwan Real Estate Price Explorer 的用途、定位與資料原則。",
    intro: "實價登錄查詢是一個免費、免註冊的台灣房地產成交資料探索工具，目標是讓公開資料更容易搜尋、比較與理解。",
    sections: [
      { heading: "我們的定位", paragraphs: ["本站不是房仲、代銷、估價機構或政府網站，不銷售物件，也不接受付費排序。工具聚焦在公開成交紀錄、篩選、圖表與地圖呈現。"] },
      { heading: "設計原則", paragraphs: ["我們優先呈現資料來源、計算限制與可重現的篩選條件，避免把單一統計數字包裝成確定的市場結論。"] },
    ],
  },
  {
    path: "/contact/",
    title: "聯絡與資料問題回報",
    description: "回報實價登錄資料顯示、網站功能或無障礙問題的建議格式。",
    intro: "如需回報資料或功能問題，請附上可重現資訊；個別交易的申報內容與更正仍應由內政部或所在地政機關處理。",
    sections: [
      { heading: "回報時請提供", paragraphs: ["為避免傳送敏感個資，請不要提供身分證、完整門牌住戶資料或私人合約。"], items: ["頁面網址與查詢條件", "縣市、行政區與交易類型", "預期結果與實際結果", "瀏覽器版本與錯誤畫面（如適用）"] },
      { heading: "專案聯絡方式", paragraphs: ["目前未設定公開客服信箱。專案維護者可在部署前透過環境或頁面設定補上可公開且持續維護的聯絡管道；在此之前不虛構聯絡資料。"] },
    ],
  },
  {
    path: "/privacy/",
    title: "隱私權與資料使用說明",
    description: "說明本站在搜尋、收藏、地圖與外部服務使用上的資料處理方式。",
    intro: "本站核心查詢不要求註冊。收藏、最近搜尋與介面偏好主要儲存在使用者瀏覽器；伺服器請求仍可能產生一般連線紀錄。",
    sections: [
      { heading: "瀏覽器端資料", paragraphs: ["收藏、儲存搜尋、最近搜尋與深色模式等功能可能使用 localStorage。清除瀏覽器網站資料即可移除這些內容。"] },
      { heading: "外部服務", paragraphs: ["地圖、字型、地理編碼或建物圖片可能由第三方服務提供，第三方可能依其政策處理 IP 位址、裝置與請求資訊。正式啟用分析工具前，本站應先更新本頁並取得必要同意。"] },
      { heading: "資料安全", paragraphs: ["請勿在關鍵字或回報內容輸入敏感個資。本站展示的實價登錄資料以政府公開內容為限。"] },
    ],
  },
  {
    path: "/guides/transaction-records/",
    title: "如何閱讀實價登錄成交紀錄",
    description: "從交易日期、總價、單價、坪數、屋齡、樓層與備註正確解讀實價登錄。",
    intro: "閱讀實價登錄時，應把每筆紀錄視為特定條件下的已成交案例；先確認交易類型與標的組成，再比較時間、面積、樓層、屋齡和車位，才能避免錯誤類比。",
    sections: [
      { heading: "先確認交易組成", paragraphs: ["房地、房地加車位、土地、建物與單獨車位的價格基礎不同。若車位價格或面積未拆分，單價不宜直接與無車位交易比較。"] },
      { heading: "再比較相近案例", paragraphs: ["優先選擇同一行政區、相近生活圈、類似建物型態與接近成交期間的案例，並查看備註中的特殊交易說明。"] },
    ],
  },
  {
    path: "/guides/presale-vs-resale/",
    title: "預售屋與成屋實價登錄怎麼比較",
    description: "比較預售屋與成屋成交資料時，應注意的時間、坪數、車位、屋齡與付款條件差異。",
    intro: "預售屋與成屋資料不能只用每坪單價直接比較。預售屋反映簽約時點與未完工產品條件，成屋則包含實際屋齡、樓層、維護狀況與可觀察環境。",
    sections: [
      { heading: "時間基準不同", paragraphs: ["預售屋從簽約到完工交屋可能跨越數年；比較時應對齊簽約月份，而不是只看揭露或交屋日期。"] },
      { heading: "面積與車位差異", paragraphs: ["確認主建物、附屬建物、公設與車位是否採相同口徑。不同建案或成屋社區的公設比與車位計價方式可能顯著影響表面單價。"] },
    ],
  },
  {
    path: "/guides/map-location-limitations/",
    title: "實價登錄地圖位置為什麼可能不精確",
    description: "說明實價登錄門牌區間化、地理編碼與地圖定位誤差的來源。",
    intro: "實價登錄公開資料中的門牌可能經過區間化處理，本站地圖需將文字地址轉換為座標，因此圖釘通常代表路段或附近位置，不應視為特定住戶或建物入口。",
    sections: [
      { heading: "誤差從哪裡來", paragraphs: ["地址可能缺少完整門牌、樓層或建物名稱；地理編碼服務也可能回傳道路中心、行政區中心或相近地址。"] },
      { heading: "如何正確使用", paragraphs: ["地圖適合觀察交易分布與生活圈，不適合確認產權界址、精確門牌或現場位置。重要決策應搭配官方資料、地籍資訊與現場查證。"] },
    ],
  },
];

export const getSeoContentPage = (pathname: string) =>
  SEO_CONTENT_PAGES.find((page) => page.path === pathname) ?? null;
