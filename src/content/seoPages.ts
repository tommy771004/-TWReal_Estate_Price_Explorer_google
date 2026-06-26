import { CITY_DISTRICTS } from "../constants";

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

const STATIC_PAGES: SeoContentPage[] = [
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
      { href: "/guides/mortgage-calculator/", label: "房貸試算與首購貸款指南" },
      { href: "/guides/first-home-loan-subsidy/", label: "首購族貸款優惠與補貼方案總覽" },
      { href: "/guides/mortgage-approval-factors/", label: "影響房貸核貸與成數的關鍵因素" },
      { href: "/guides/refinance-mortgage/", label: "房貸轉貸與利率比較怎麼評估" },
      { href: "/guides/moving-in-checklist/", label: "交屋後入住準備清單" },
      { href: "/guides/renovation-budget/", label: "新居裝潢預算規劃指南" },
      { href: "/guides/small-space-furnishing/", label: "小坪數家具與收納規劃" },
    ],
  },
  {
    path: "/methodology/",
    title: "實價登錄資料方法與計算說明",
    description: "說明本站如何取得、清理、換算與呈現內政部實價登錄資料，以及統計結果的限制。",
    intro: "本站直接使用內政部公開的實價登錄資料，將原始交易欄位整理為可搜尋、比較與地圖檢視的格式；所有統計僅描述已申報成交紀錄，不是估價或投資建議。",
    sections: [
      { heading: "資料處理流程", paragraphs: ["系統依縣市與交易類型下載官方資料，保留買賣、預售屋與租賃的原始成交欄位，再依使用者選擇的行政區、期間、總價、單價、坪數與屋齡條件進行篩選。"], items: ["面積由平方公尺換算為坪時使用 1 平方公尺約等於 0.3025 坪。", "單價比較以資料中的交易價格與面積欄位為基礎。", "缺漏、格式異常或無法解析的欄位不應被推估補值。"] },
      { heading: "欄位與計算保守原則", paragraphs: ["本站只呈現公開資料中可辨識的欄位與由欄位直接換算出的結果，不以模型補齊缺漏價格、坪數、屋齡或座標。若原始資料缺少足以比較的條件，該筆資料應被視為限制較高的參考案例。"], items: ["交易總價、單價、面積與屋齡以官方揭露欄位或可直接換算欄位為基礎。", "地圖座標由地址文字推估時，僅用於觀察區域分布，不代表精確門牌。", "統計圖表只描述目前查詢條件下的樣本，不代表估價、鑑價或未來價格。"] },
      { heading: "統計與比較限制", paragraphs: ["平均值會受到交易組成、特殊交易、車位拆分方式與樣本數影響。跨區比較前應同時查看交易類型、建物型態、屋齡、樓層和時間範圍，不能只比較單一平均單價。"] },
      { heading: "更新與更正", paragraphs: ["頁面日期代表本站內容或程式的建置日期；成交資料的公布與更正時程以內政部為準。官方資料更新後，重新查詢可能得到不同結果。", "內容與資料處理說明查核日期：2026-06-26。若發現本站顯示與官方資料不一致，請附上官方查詢結果、頁面網址與查詢條件回報，本站會優先檢查資料取得、解析與篩選流程。"] },
    ],
    links: [
      { href: "/data-sources/", label: "實價登錄資料來源" },
      { href: "/contact/", label: "聯絡與資料問題回報" },
      { href: "https://lvr.land.moi.gov.tw/", label: "內政部不動產交易實價查詢服務網" },
      { href: "https://plvr.land.moi.gov.tw/", label: "內政部實價登錄公開資料下載" },
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
      { heading: "維護與更正原則", paragraphs: ["內容維護以官方資料、可重現查詢與使用者回報為依據。涉及貸款、補貼、租屋權益或稅務的資訊，只提供一般性整理，實際資格、額度、期限與權利義務應回到主管機關或專業人士確認。"], items: ["資料顯示問題：優先比對內政部官方查詢與公開下載資料。", "內容錯誤或過期：優先修正查核日期、官方來源與限制說明。", "個別交易爭議：本站不代替政府機關、銀行、地政士、律師或估價師作成判斷。"] },
    ],
  },
  {
    path: "/contact/",
    title: "聯絡與資料問題回報",
    description: "回報實價登錄資料顯示、網站功能或無障礙問題的建議格式。",
    intro: "如需回報資料或功能問題，請附上可重現資訊；個別交易的申報內容與更正仍應由內政部或所在地政機關處理。",
    sections: [
      { heading: "回報時請提供", paragraphs: ["為避免傳送敏感個資，請不要提供身分證、完整門牌住戶資料或私人合約。"], items: ["頁面網址與查詢條件", "縣市、行政區與交易類型", "預期結果與實際結果", "瀏覽器版本與錯誤畫面（如適用）"] },
      { heading: "專案聯絡方式", paragraphs: ["可先使用本頁意見回饋表單提交資料顯示、功能或無障礙問題。正式公開客服信箱尚未設定；專案維護者可在部署前透過環境或頁面設定補上可公開且持續維護的聯絡管道，在此之前不虛構聯絡資料。"] },
      { heading: "官方資料更正", paragraphs: ["本站無法更改內政部或地方政府的原始申報內容。若個別交易價格、標的或揭露內容疑似有誤，應回到內政部不動產交易實價查詢服務網或所在地政機關確認。"] },
    ],
    links: [
      { href: "/methodology/", label: "資料方法與計算說明" },
      { href: "/data-sources/", label: "實價登錄資料來源" },
      { href: "https://lvr.land.moi.gov.tw/", label: "內政部不動產交易實價查詢服務網" },
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
  {
    path: "/guides/mortgage-calculator/",
    title: "房貸試算與首購貸款指南",
    description: "了解房貸月付如何計算，認識貸款成數、自備款、利率、年限與寬限期，並學會用實價登錄資料輔助評估購屋預算。",
    intro: "買房前先估算每月還款負擔，能避免高估自己的可負擔範圍。本頁說明房貸月付的計算邏輯、影響貸款的關鍵條件，以及如何搭配實價登錄成交價推估購屋預算；內容為一般性說明，非貸款招攬、利率報價或投資建議，實際條件以各金融機構核定為準。",
    sections: [
      {
        heading: "房貸月付怎麼算",
        paragraphs: [
          "最常見的還款方式是「本息平均攤還」，每月固定繳一筆金額，其中利息與本金的比例會隨期數改變：初期利息占比高、後期本金占比高。",
          "月付金額同時受到貸款本金、年利率與貸款年限三項影響。本金越高、利率越高、年限越短，每月負擔就越重；拉長年限可降低月付，但總利息會增加。",
        ],
        items: [
          "貸款本金 = 房屋總價 × 貸款成數。",
          "月利率 = 年利率 ÷ 12；月期數 = 貸款年限 × 12。",
          "本站查詢結果頁附有房貸試算工具，可輸入總價、成數、利率與年限即時估算月付，作為初步參考。",
        ],
      },
      {
        heading: "貸款成數與自備款",
        paragraphs: [
          "貸款成數是銀行願意貸出的金額占房屋鑑價的比例，常見約七至八成，但會依屋況、區域、屋齡、借款人條件與政策而不同。成數越低，需準備的自備款越高。",
          "自備款除了房屋價金的差額，還要預留契稅、代書費、仲介費、裝潢與搬遷等周邊費用，建議在估算預算時一併納入，避免交屋後現金不足。",
        ],
      },
      {
        heading: "利率、年限與寬限期的取捨",
        paragraphs: [
          "利率有固定與機動之分，機動利率會隨指標利率調整，升息時月付可能上升，評估時可預留利率波動的緩衝。",
          "寬限期內通常只繳利息、不還本金，能暫時降低月付，但寬限期結束後本金壓縮在剩餘年限攤還，月付會明顯增加；使用前應確認寬限期後仍負擔得起。",
        ],
      },
      {
        heading: "用實價登錄輔助評估預算",
        paragraphs: [
          "鎖定目標區域與物件類型後，可用實價登錄觀察相近條件的成交總價區間，再回推所需自備款與貸款金額，並用月付試算檢視是否落在可負擔範圍。",
          "建議將每月房貸支出控制在家庭可支配所得的合理比例內，並保留緊急備用金；實際可貸條件、利率與額度仍須向銀行洽詢評估。",
        ],
      },
      {
        heading: "查核日期與官方來源",
        paragraphs: [
          "本頁內容查核日期：2026-06-26。房貸利率、寬限期、成數與申辦條件會依央行政策、銀行授信規則與個人條件變動，本站不提供即時利率報價或核貸保證。",
          "查證時可先確認財政部、財政部稅務入口網與承貸銀行公告；涉及契稅、房地合一稅或其他稅務成本時，應回到財政部稅務入口網或洽詢稅務機關。",
        ],
      },
    ],
    links: [
      { href: "/guides/transaction-records/", label: "如何閱讀實價登錄成交紀錄" },
      { href: "/guides/presale-vs-resale/", label: "預售屋與成屋實價登錄怎麼比較" },
      { href: "/prices/", label: "台灣各縣市實價登錄查詢" },
      { href: "https://www.mof.gov.tw/", label: "財政部全球資訊網" },
      { href: "https://www.etax.nat.gov.tw/etwmain/", label: "財政部稅務入口網" },
    ],
  },
  {
    path: "/guides/first-home-loan-subsidy/",
    title: "首購族貸款優惠與補貼方案總覽",
    description: "認識台灣首購族常見的政府優惠房貸與補貼方向，包含青年安心成家購屋貸款的概念、適用對象與評估重點。",
    intro: "首次購屋者除了一般房貸，還可能適用政府或銀行提供的優惠方案。本頁以一般性概念說明常見方案類型與評估方向，不代表任何方案的最新利率、額度或核定條件；實際資格與內容請以財政部、內政部與承貸銀行公告為準。",
    sections: [
      {
        heading: "常見的優惠方案類型",
        paragraphs: [
          "政府推動的首購相關房貸，常以「優於市場的利率」「較長的還款年限」與「一段寬限期」作為主要優惠方向，協助初次購屋者降低前期負擔。",
          "民間銀行也常推出首購專案，可能在利率、手續費或對保流程上提供條件，建議與政府方案一併比較總成本。",
        ],
        items: [
          "青年安心成家購屋優惠貸款：針對符合條件的購屋族，提供優惠利率與較長期間的政府支持方案。",
          "各地方政府與銀行可能另有利息補貼或專案，適用對象與額度不一。",
          "優惠方案通常設有屋齡、坪數、戶籍、年齡或所得等資格條件。",
        ],
      },
      {
        heading: "評估時要看什麼",
        paragraphs: [
          "不要只看「利率數字」，應比較整體還款總額、寬限期後的月付變化、手續費與提前清償的條款。",
          "優惠額度可能只涵蓋部分貸款金額，超出部分仍以一般利率計算，估算時要分段試算。",
        ],
      },
      {
        heading: "如何查證最新條件",
        paragraphs: [
          "方案內容與利率會隨政策調整，務必回到官方與承貸銀行確認最新公告，再依個人條件試算；本頁僅作概念說明，非招攬或保證核貸。",
          "本頁內容查核日期：2026-06-26。政府優惠貸款、住宅補貼、地方補助與銀行專案可能分屬不同主管機關，申請前應逐一確認受理期間、資格、利率、額度與文件要求。",
        ],
        items: [
          "購屋優惠貸款與財政政策：查詢財政部及承貸銀行公告。",
          "住宅補貼與租金補貼：查詢內政部、國土管理署與住宅補貼線上申請系統。",
          "個人是否適用：以承貸銀行審核、主管機關公告與最新申請須知為準。",
        ],
      },
    ],
    links: [
      { href: "/guides/mortgage-calculator/", label: "房貸試算與首購貸款指南" },
      { href: "/guides/mortgage-approval-factors/", label: "影響房貸核貸與成數的關鍵因素" },
      { href: "/prices/", label: "台灣各縣市實價登錄查詢" },
      { href: "https://www.mof.gov.tw/", label: "財政部全球資訊網" },
      { href: "https://www.nlma.gov.tw/", label: "內政部國土管理署" },
      { href: "https://has.nlma.gov.tw/subsidyOnline/", label: "住宅補貼線上申請系統" },
    ],
  },
  {
    path: "/guides/mortgage-approval-factors/",
    title: "影響房貸核貸與成數的關鍵因素",
    description: "了解銀行評估房貸額度、成數與利率時的常見考量，包含個人信用、收入負債比、屋況與區域條件。",
    intro: "同樣的房屋總價，不同借款人拿到的貸款成數與利率可能差很多。本頁整理銀行常見的評估面向，協助你在看房與議價前先掌握自身條件；實際核定仍以銀行鑑價與審查為準。",
    sections: [
      {
        heading: "個人條件面",
        paragraphs: [
          "銀行通常會參考信用紀錄、職業穩定度、收入與既有負債。負債比偏高或信用紀錄有瑕疵，可能影響成數與利率。",
        ],
        items: [
          "聯徵信用紀錄與往來情形。",
          "收入證明與工作穩定度。",
          "既有貸款、信用卡循環等負債負擔。",
        ],
      },
      {
        heading: "房屋與區域面",
        paragraphs: [
          "屋齡、建物型態、地段流通性與銀行鑑價結果都會影響可貸成數。偏遠、特殊用途或屋齡較高的物件，成數可能較保守。",
          "銀行核貸是以「鑑價」而非「成交價」為基礎，鑑價低於成交價時，自備款就要補上差額。",
        ],
      },
      {
        heading: "看房前能先做的準備",
        paragraphs: [
          "先用實價登錄了解目標區域的成交行情，避免買在明顯偏離行情的價格；同時預留自備款與周邊費用的緩衝，降低鑑價不如預期時的資金壓力。",
        ],
      },
      {
        heading: "查核日期與官方來源",
        paragraphs: [
          "本頁內容查核日期：2026-06-26。核貸條件屬銀行授信與個案審查，會受央行信用管制、銀行風險政策、借款人收入與擔保品狀況影響。",
          "若要確認最新政策限制，應查看中央銀行、財政部與各承貸銀行公告；若要確認稅費與申報事項，應查看財政部稅務入口網。",
        ],
      },
    ],
    links: [
      { href: "/guides/mortgage-calculator/", label: "房貸試算與首購貸款指南" },
      { href: "/guides/first-home-loan-subsidy/", label: "首購族貸款優惠與補貼方案總覽" },
      { href: "/guides/transaction-records/", label: "如何閱讀實價登錄成交紀錄" },
      { href: "https://www.mof.gov.tw/", label: "財政部全球資訊網" },
      { href: "https://www.etax.nat.gov.tw/etwmain/", label: "財政部稅務入口網" },
    ],
  },
  {
    path: "/guides/refinance-mortgage/",
    title: "房貸轉貸與利率比較怎麼評估",
    description: "說明房貸轉貸的概念、可能的成本與效益，以及比較不同銀行利率方案時應注意的重點。",
    intro: "當市場利率變動或自身條件改善時，部分屋主會考慮把房貸轉到條件較好的銀行。本頁說明轉貸的評估邏輯與隱藏成本，協助你判斷是否值得；內容為一般性說明，非個別理財建議。",
    sections: [
      {
        heading: "什麼情況可能適合轉貸",
        paragraphs: [
          "常見動機包括降低利率、調整年限或寬限期、整合其他負債。是否划算取決於『節省的利息』是否大於『轉貸的成本』。",
        ],
      },
      {
        heading: "別忽略的轉貸成本",
        paragraphs: [
          "轉貸可能涉及代書費、設定費、塗銷與重設抵押權等費用，原貸款也可能有綁約期或提前清償違約金。",
        ],
        items: [
          "原貸款是否仍在綁約期、有無提前清償費用。",
          "新貸款的開辦、設定、代書與規費。",
          "新方案的寬限期與利率調整方式（固定或機動）。",
        ],
      },
      {
        heading: "怎麼比較才公平",
        paragraphs: [
          "以『相同年限與相同本金』試算各方案的總還款額與月付，再扣除轉貸成本，才能看出真正的淨效益；必要時請各銀行提供完整費用明細。",
        ],
      },
      {
        heading: "查核日期與官方來源",
        paragraphs: [
          "本頁內容查核日期：2026-06-26。轉貸成本、提前清償違約金、抵押權設定與利率條件都可能依契約與銀行方案不同而改變，應以原貸款契約、新承貸銀行費用明細與主管機關公告為準。",
        ],
      },
    ],
    links: [
      { href: "/guides/mortgage-calculator/", label: "房貸試算與首購貸款指南" },
      { href: "/guides/mortgage-approval-factors/", label: "影響房貸核貸與成數的關鍵因素" },
      { href: "https://www.mof.gov.tw/", label: "財政部全球資訊網" },
      { href: "https://www.etax.nat.gov.tw/etwmain/", label: "財政部稅務入口網" },
    ],
  },
  {
    path: "/guides/moving-in-checklist/",
    title: "交屋後入住準備清單",
    description: "整理交屋到入住期間常見的檢查與採購項目，包含驗屋、水電、家電與家具的準備順序。",
    intro: "從交屋到正式入住，需要處理驗屋點交、基礎設備與家電家具採購。本頁提供一份通用的準備清單與順序建議，協助新屋主有條理地完成入住前的工作。",
    sections: [
      {
        heading: "交屋與驗屋",
        paragraphs: [
          "點交時確認房屋現況、設備是否正常、是否有滲漏或瑕疵，並核對合約附件與保固文件。發現問題應於約定期限內提出。",
        ],
        items: [
          "牆面、地板、門窗與防水狀況。",
          "水電、開關、插座與排水是否正常。",
          "既附設備（如有）清點與保固。",
        ],
      },
      {
        heading: "基礎設備與家電",
        paragraphs: [
          "入住前優先處理影響生活機能的設備，例如冷氣、熱水器、洗衣機與冰箱，並依空間大小選擇適合的規格，避免買到過大或不符需求的機型。",
        ],
      },
      {
        heading: "家具與收納",
        paragraphs: [
          "床、沙發、餐桌與收納櫃可依使用頻率與空間動線分批採購。先量好尺寸與走道，再決定家具大小，能減少退換貨與空間浪費。",
        ],
      },
    ],
    links: [
      { href: "/guides/renovation-budget/", label: "新居裝潢預算規劃指南" },
      { href: "/guides/small-space-furnishing/", label: "小坪數家具與收納規劃" },
    ],
  },
  {
    path: "/guides/renovation-budget/",
    title: "新居裝潢預算規劃指南",
    description: "說明裝潢預算如何分配、常見的費用項目，以及控制預算與避免追加的實用原則。",
    intro: "裝潢費用容易在過程中追加，事前把預算結構與優先順序想清楚，能避免超支。本頁說明常見費用組成與規劃原則，作為一般性參考，實際報價依設計與工班而定。",
    sections: [
      {
        heading: "常見費用組成",
        paragraphs: [
          "裝潢預算通常包含設計費、工程（泥作、水電、木作、油漆）、系統櫃與家具、家電與軟裝，以及一筆預留的彈性費用。",
        ],
        items: [
          "基礎工程：水電、防水、泥作等不易事後變更的項目，建議優先確保品質。",
          "機能與收納：系統櫃、廚衛設備依使用需求配置。",
          "彈性預備金：建議預留一定比例因應追加與意外。",
        ],
      },
      {
        heading: "控制預算的原則",
        paragraphs: [
          "先區分『一定要做』與『可以之後再做』，把預算集中在影響居住安全與機能的項目；裝飾性、可替換的項目可分階段進行。",
          "比較報價時要看清楚施工範圍、材料等級與付款方式，避免只比總價而忽略內容差異。",
        ],
      },
    ],
    links: [
      { href: "/guides/moving-in-checklist/", label: "交屋後入住準備清單" },
      { href: "/guides/small-space-furnishing/", label: "小坪數家具與收納規劃" },
    ],
  },
  {
    path: "/guides/small-space-furnishing/",
    title: "小坪數家具與收納規劃",
    description: "針對小坪數空間，說明選購家具與規劃收納的原則，兼顧機能、動線與視覺開闊感。",
    intro: "小坪數空間更講究機能與動線。本頁整理選家具與規劃收納的通用原則，協助在有限坪數中提升使用效率與舒適度。",
    sections: [
      {
        heading: "選家具的原則",
        paragraphs: [
          "優先選擇尺寸合適、可多功能或可收納的家具，例如沙發床、可延伸餐桌或附收納的床架，減少單一用途家具占用空間。",
          "採購前務必量測空間與走道寬度，預留開門、走動與電器散熱的距離。",
        ],
      },
      {
        heading: "收納與動線",
        paragraphs: [
          "善用垂直空間（高櫃、壁面層架）與畸零角落，把收納往上發展；維持主要動線淨空，能讓小空間看起來更開闊。",
        ],
        items: [
          "依使用頻率分層收納，常用品放在易取位置。",
          "統一櫃體與色系，降低視覺雜亂感。",
          "保留彈性留白，避免家具與收納塞滿每個角落。",
        ],
      },
    ],
    links: [
      { href: "/guides/moving-in-checklist/", label: "交屋後入住準備清單" },
      { href: "/guides/renovation-budget/", label: "新居裝潢預算規劃指南" },
    ],
  },
  {
    path: "/buying-guides/",
    title: "各縣市購屋指南",
    description: "六都首購與換屋的在地重點整理，搭配實價登錄查詢掌握各區成交行情、生活機能與選屋方向。",
    intro: "不同縣市的房市結構、產品型態與生活圈差異很大。這些在地購屋指南整理各都會的選屋重點與注意方向，並連到對應的實價登錄查詢，讓你用實際成交資料驗證行情；內容為一般性說明，不預測房價，也非投資建議。",
    sections: [
      { heading: "怎麼使用這些指南", paragraphs: ["先看目標縣市的指南掌握區域輪廓與選屋重點，再回到實價登錄查詢，鎖定行政區、期間與坪數比對實際成交，避免只憑印象判斷行情。"] },
      { heading: "跨縣市比較提醒", paragraphs: ["跨縣市比較時，應維持相同交易類型與期間，並考量建物型態（透天、公寓、電梯大樓）、屋齡、公設比與車位計價方式的差異。"] },
    ],
    links: [
      { href: "/buying-guides/taipei/", label: "臺北市首購指南" },
      { href: "/buying-guides/new-taipei/", label: "新北市購屋指南" },
      { href: "/buying-guides/taoyuan/", label: "桃園市買房指南" },
      { href: "/buying-guides/taichung/", label: "臺中市買房指南" },
      { href: "/buying-guides/tainan/", label: "臺南市購屋指南" },
      { href: "/buying-guides/kaohsiung/", label: "高雄市購屋指南" },
    ],
  },
  {
    path: "/buying-guides/taipei/",
    title: "臺北市首購指南",
    description: "臺北市首購族的選屋重點：蛋黃區與蛋白區取捨、中古屋與老屋比例、捷運生活圈與預算配置方向。",
    intro: "臺北市是全台房價最高的都會，首購族多半需要在地段、坪數與屋齡之間取捨。本頁整理選屋思考方向，並連到臺北市實價登錄查詢，協助你用實際成交資料檢視預算可負擔的區域。",
    sections: [
      { heading: "地段與預算的取捨", paragraphs: ["核心行政區（如大安、信義、中正）單價較高，預算有限時可往文山、北投、內湖等相對外圍或交通節點周邊評估；先確定可負擔總價，再回推可選的行政區與坪數。"] },
      { heading: "屋齡與產品型態", paragraphs: ["市區中古屋與老屋比例高，需留意屋況、管線、有無電梯與後續整修成本；新成屋與重劃案相對稀少且單價較高。"] },
      { heading: "用成交資料驗證", paragraphs: ["鎖定通勤可接受的捷運生活圈後，於實價登錄查詢比對同區、同型態、相近屋齡的成交，避免買在偏離行情的價格。"] },
    ],
    links: [
      { href: "/prices/%E8%87%BA%E5%8C%97%E5%B8%82/%E8%B2%B7%E8%B3%A3/", label: "臺北市買賣實價登錄查詢" },
      { href: "/buying-guides/taipei/districts/", label: "臺北市各行政區索引" },
      { href: "/guides/mortgage-calculator/", label: "房貸試算與首購貸款指南" },
      { href: "/buying-guides/", label: "各縣市購屋指南" },
    ],
  },
  {
    path: "/buying-guides/new-taipei/",
    title: "新北市購屋指南",
    description: "新北市購屋重點：板橋、新莊、三重、淡水、林口等生活圈差異，通勤取向與重劃區的選擇方向。",
    intro: "新北市幅員廣、各區生活圈差異大，常是雙北通勤族的首購主戰場。本頁說明不同生活圈的取向與選屋注意點，並連到新北市實價登錄查詢驗證行情。",
    sections: [
      { heading: "依通勤決定生活圈", paragraphs: ["靠近臺北的板橋、三重、新莊、中和通勤便利、單價較高；淡水、林口、三峽、樹林等地產品較新、單價相對親民，但要評估通勤時間與交通方式。"] },
      { heading: "重劃區與新成屋", paragraphs: ["林口、三重二重疏洪道周邊、新莊副都心等重劃區新案較多，留意公設比、生活機能成熟度與交屋時程。"] },
      { heading: "用成交資料驗證", paragraphs: ["先界定可接受的通勤範圍，再於實價登錄比對同生活圈、同型態的成交價與坪數，逐步縮小目標。"] },
    ],
    links: [
      { href: "/prices/%E6%96%B0%E5%8C%97%E5%B8%82/%E8%B2%B7%E8%B3%A3/", label: "新北市買賣實價登錄查詢" },
      { href: "/buying-guides/new-taipei/districts/", label: "新北市各行政區索引" },
      { href: "/guides/mortgage-approval-factors/", label: "影響房貸核貸與成數的關鍵因素" },
      { href: "/buying-guides/", label: "各縣市購屋指南" },
    ],
  },
  {
    path: "/buying-guides/taoyuan/",
    title: "桃園市買房指南",
    description: "桃園市買房重點：青埔高鐵特區、機場捷運沿線與各區重劃案的選屋方向與生活機能評估。",
    intro: "桃園市以重劃區與相對親民的單價吸引不少首購與雙北外溢族群。本頁整理選屋重點，並連到桃園市實價登錄查詢檢視行情。",
    sections: [
      { heading: "重劃區與交通建設", paragraphs: ["青埔高鐵特區、機場捷運沿線與中路、經國重劃區等地新案密集，購買前留意機能成熟度、嫌惡設施與生活便利性。"] },
      { heading: "自住與通勤評估", paragraphs: ["桃園往返雙北多依賴高鐵、台鐵與國道，評估時把通勤成本與時間納入長期負擔考量。"] },
      { heading: "用成交資料驗證", paragraphs: ["新案與中古屋的單價與公設比差異大，於實價登錄比對同區、同類型成交，較能掌握合理價位。"] },
    ],
    links: [
      { href: "/prices/%E6%A1%83%E5%9C%92%E5%B8%82/%E8%B2%B7%E8%B3%A3/", label: "桃園市買賣實價登錄查詢" },
      { href: "/buying-guides/taoyuan/districts/", label: "桃園市各行政區索引" },
      { href: "/guides/first-home-loan-subsidy/", label: "首購族貸款優惠與補貼方案總覽" },
      { href: "/buying-guides/", label: "各縣市購屋指南" },
    ],
  },
  {
    path: "/buying-guides/taichung/",
    title: "臺中市買房指南",
    description: "臺中市買房重點：七期與各重劃區、透天與電梯大樓產品差異，以及生活機能與通勤的評估方向。",
    intro: "臺中市重劃區多、產品型態多元，透天與電梯大樓並存。本頁說明選屋重點，並連到臺中市實價登錄查詢比對行情。",
    sections: [
      { heading: "重劃區與產品型態", paragraphs: ["七期、十四期、北屯與水湳等重劃區新案多；同時也有不少透天產品，購買前先確認自身對格局、車位與管理型態的需求。"] },
      { heading: "生活機能與發展", paragraphs: ["重劃區初期機能可能尚未成熟，評估學區、商圈、醫療與交通的現況與發展計畫，避免只看建案行銷。"] },
      { heading: "用成交資料驗證", paragraphs: ["透天與大樓的計價基礎不同，於實價登錄分別比對同型態成交，較能正確判讀單價與總價。"] },
    ],
    links: [
      { href: "/prices/%E8%87%BA%E4%B8%AD%E5%B8%82/%E8%B2%B7%E8%B3%A3/", label: "臺中市買賣實價登錄查詢" },
      { href: "/buying-guides/taichung/districts/", label: "臺中市各行政區索引" },
      { href: "/guides/renovation-budget/", label: "新居裝潢預算規劃指南" },
      { href: "/buying-guides/", label: "各縣市購屋指南" },
    ],
  },
  {
    path: "/buying-guides/tainan/",
    title: "臺南市購屋指南",
    description: "臺南市購屋重點：透天文化、南科帶動的區域發展，以及市區與郊區生活機能的選擇方向。",
    intro: "臺南市透天產品比例高，近年受科學園區發展帶動部分區域需求。本頁整理選屋重點，並連到臺南市實價登錄查詢檢視行情。",
    sections: [
      { heading: "透天與大樓的選擇", paragraphs: ["臺南透天文化盛行，但市區與重劃區也有電梯大樓；依家庭結構、管理需求與預算決定產品型態。"] },
      { heading: "區域發展與機能", paragraphs: ["科學園區周邊與安平、東區等地各有不同的生活圈特性，留意通勤、學區與生活便利性的實際情況。"] },
      { heading: "用成交資料驗證", paragraphs: ["於實價登錄比對同區、同型態的成交，並注意土地與建物面積的計價方式，避免單純以表面總價判斷。"] },
    ],
    links: [
      { href: "/prices/%E8%87%BA%E5%8D%97%E5%B8%82/%E8%B2%B7%E8%B3%A3/", label: "臺南市買賣實價登錄查詢" },
      { href: "/buying-guides/tainan/districts/", label: "臺南市各行政區索引" },
      { href: "/guides/transaction-records/", label: "如何閱讀實價登錄成交紀錄" },
      { href: "/buying-guides/", label: "各縣市購屋指南" },
    ],
  },
  {
    path: "/buying-guides/kaohsiung/",
    title: "高雄市購屋指南",
    description: "高雄市購屋重點：亞洲新灣區與各重劃區、透天與大樓產品，以及產業發展對區域需求的影響。",
    intro: "高雄市產品型態多元，亞洲新灣區與多個重劃區帶動部分區域發展。本頁說明選屋重點，並連到高雄市實價登錄查詢比對行情。",
    sections: [
      { heading: "重劃區與都會發展", paragraphs: ["亞洲新灣區、美術館特區、農十六與大樓重劃區等地各有特色；購買前評估機能成熟度與長期發展計畫。"] },
      { heading: "產品型態與需求", paragraphs: ["透天與電梯大樓並存，依生活型態、車位與管理需求選擇；新案與中古屋的單價、公設比差異需一併考量。"] },
      { heading: "用成交資料驗證", paragraphs: ["於實價登錄比對同區、同型態成交，並留意特殊交易與車位拆分，避免被單一數字誤導。"] },
    ],
    links: [
      { href: "/prices/%E9%AB%98%E9%9B%84%E5%B8%82/%E8%B2%B7%E8%B3%A3/", label: "高雄市買賣實價登錄查詢" },
      { href: "/buying-guides/kaohsiung/districts/", label: "高雄市各行政區索引" },
      { href: "/guides/mortgage-calculator/", label: "房貸試算與首購貸款指南" },
      { href: "/buying-guides/", label: "各縣市購屋指南" },
    ],
  },
  {
    path: "/renting-guides/",
    title: "租屋族指南",
    description: "租屋族必看：租金行情怎麼查、押金與租約注意事項、以及租屋權益與報稅補貼的方向整理。",
    intro: "租屋同樣需要做功課。這些指南協助你查租金行情、看懂租約與押金規則，並了解租屋族的權益與補助方向；內容為一般性說明，個別情形與最新規定請以官方公告與契約為準。",
    sections: [
      { heading: "租屋前先做的功課", paragraphs: ["先用實價登錄的租賃資料了解目標區域的租金區間，再看屋、議約；簽約前確認租約內容、押金與屋況點交。"] },
    ],
    links: [
      { href: "/renting-guides/rent-market/", label: "租金行情怎麼查與判讀" },
      { href: "/renting-guides/deposit-and-lease/", label: "租屋押金與租約注意事項" },
      { href: "/renting-guides/tenant-rights/", label: "租屋族權益與報稅補貼" },
    ],
  },
  {
    path: "/renting-guides/rent-market/",
    title: "租金行情怎麼查與判讀",
    description: "說明如何利用實價登錄租賃資料查詢租金行情，以及判讀租金時應注意的條件差異。",
    intro: "租金和買賣一樣有公開的實價登錄資料可參考。本頁說明如何查租金行情，以及比較時要注意的面向，避免只看單一數字。",
    sections: [
      { heading: "用實價登錄查租金", paragraphs: ["於查詢工具選擇『租賃』交易類型與目標行政區，觀察租金的分布區間，再對照坪數、屋齡與型態，掌握合理範圍。"] },
      { heading: "判讀租金的注意點", paragraphs: ["租金會受到屋況、樓層、是否含管理費或車位、傢俱家電配備與租期影響；比較時盡量挑選條件相近的案例。"] },
    ],
    links: [
      { href: "/prices/%E8%87%BA%E5%8C%97%E5%B8%82/%E7%A7%9F%E8%B3%83/", label: "臺北市租賃實價登錄查詢" },
      { href: "/renting-guides/deposit-and-lease/", label: "租屋押金與租約注意事項" },
      { href: "/renting-guides/", label: "租屋族指南" },
    ],
  },
  {
    path: "/renting-guides/deposit-and-lease/",
    title: "租屋押金與租約注意事項",
    description: "整理租屋押金的一般規則、租約應確認的重點，以及點交與押金返還的注意事項。",
    intro: "押金與租約是租屋糾紛的常見來源。本頁整理一般性的注意方向，協助你在簽約前後保護自身權益；實際規定與權利義務以現行法令與契約內容為準。",
    sections: [
      { heading: "押金的一般規則", paragraphs: ["依土地法相關規定，租屋擔保金（押金）一般以不超過二個月租金總額為限，超過部分租客得主張抵充租金；實際情形仍應確認契約與現行法令。"] },
      { heading: "租約要看清楚的項目", paragraphs: ["確認租期、租金與調整方式、押金金額與返還條件、修繕責任歸屬、提前終止的條件與違約金，以及是否含管理費、水電與網路。"], items: ["可參考內政部公告的房屋租賃定型化契約應記載及不得記載事項。", "點交時拍照記錄屋況與既有設備，作為退租時的依據。", "重要約定盡量以書面留存，避免僅口頭承諾。"] },
      { heading: "退租與押金返還", paragraphs: ["退租時依約完成點交與回復原狀，確認無欠費後請求返還押金；對於正常使用的耗損與人為損壞，責任歸屬應依契約與法令判斷。"] },
      { heading: "查核日期與官方來源", paragraphs: ["本頁內容查核日期：2026-06-26。租賃契約、押金、修繕責任與終止條款應以現行法令、內政部公告契約範本與雙方簽署契約為準；如有爭議，可洽地方政府消費者服務、租賃住宅主管機關或法律專業人士。"], items: ["法條查詢：全國法規資料庫。", "租賃契約範本與住宅政策：內政部、內政部國土管理署或不動產資訊平台。", "個案爭議：保留契約、匯款紀錄、點交照片與往來訊息。"] },
    ],
    links: [
      { href: "/renting-guides/tenant-rights/", label: "租屋族權益與報稅補貼" },
      { href: "/renting-guides/rent-market/", label: "租金行情怎麼查與判讀" },
      { href: "/renting-guides/", label: "租屋族指南" },
      { href: "https://law.moj.gov.tw/", label: "全國法規資料庫" },
      { href: "https://www.moi.gov.tw/", label: "內政部全球資訊網" },
      { href: "https://www.nlma.gov.tw/", label: "內政部國土管理署" },
    ],
  },
  {
    path: "/renting-guides/tenant-rights/",
    title: "租屋族權益與報稅補貼",
    description: "說明租屋族常見的權益保障方向、政府租金補貼概念，以及租金支出在綜所稅上的處理原則。",
    intro: "除了租約本身，租屋族還可留意政府補貼與報稅相關權益。本頁以一般性概念說明方向，實際資格、額度與申辦方式請以內政部、財政部與各主管機關最新公告為準。",
    sections: [
      { heading: "租金補貼的概念", paragraphs: ["政府會不定期推動住宅租金補貼，協助符合條件的租屋族減輕負擔；申請資格、補貼額度與受理期間依當年度公告而定，建議至內政部相關專區查詢最新內容。"] },
      { heading: "租金支出與報稅", paragraphs: ["符合條件的自用住宅租金支出，可依規定在綜合所得稅中列報扣除，但有排除情形（例如同時有自用住宅購屋借款利息扣除等）；額度、條件與申報方式以財政部最新規定為準。"] },
      { heading: "保障自身權益", paragraphs: ["保留租約、繳費紀錄與溝通往來，遇到爭議可洽詢地方政府消費者服務或租賃住宅相關主管機關尋求協助。"] },
      { heading: "查核日期與官方來源", paragraphs: ["本頁內容查核日期：2026-06-26。租金補貼、報稅扣除額、申報方式與受理期間可能每年調整，申請或報稅前應回到內政部、國土管理署、住宅補貼線上申請系統與財政部稅務入口網確認。"], items: ["住宅補貼：確認當年度申請資格、戶籍/所得限制、受理期間與補貼金額。", "租金報稅：確認綜合所得稅申報年度、可列報條件與排除情形。", "租賃權益：確認現行法令、定型化契約與地方政府租賃服務。"] },
    ],
    links: [
      { href: "/renting-guides/deposit-and-lease/", label: "租屋押金與租約注意事項" },
      { href: "/renting-guides/rent-market/", label: "租金行情怎麼查與判讀" },
      { href: "/renting-guides/", label: "租屋族指南" },
      { href: "https://has.nlma.gov.tw/subsidyOnline/", label: "住宅補貼線上申請系統" },
      { href: "https://www.nlma.gov.tw/", label: "內政部國土管理署" },
      { href: "https://www.etax.nat.gov.tw/etwmain/", label: "財政部稅務入口網" },
      { href: "https://law.moj.gov.tw/", label: "全國法規資料庫" },
    ],
  },
];

// 六都行政區索引頁：每都一頁，列出所有行政區並連到該區的實價登錄查詢（真實資料頁）。
const METRO_DISTRICT_INDEX_CITIES: { slug: string; city: string }[] = [
  { slug: "taipei", city: "臺北市" },
  { slug: "new-taipei", city: "新北市" },
  { slug: "taoyuan", city: "桃園市" },
  { slug: "taichung", city: "臺中市" },
  { slug: "tainan", city: "臺南市" },
  { slug: "kaohsiung", city: "高雄市" },
];

const METRO_DISTRICT_CONTEXT: Record<string, { heading: string; paragraphs: string[]; items: string[] }> = {
  臺北市: {
    heading: "臺北市在地判讀重點",
    paragraphs: [
      "臺北市行政區比較時，捷運生活圈與屋齡差異通常比單一行政區平均單價更重要。核心區、外圍住宅區與山線生活圈的產品組成差距大，應先用總價帶、屋齡與是否有電梯拆開觀察。",
    ],
    items: [
      "大安、信義、中正等核心區需留意中古屋比例、學區與捷運站距離。",
      "文山、北投、內湖等區域可分別比較捷運沿線、坡地或科技園區通勤條件。",
      "老公寓、華廈與電梯大樓應分開看，避免用同一個每坪單價判斷。",
    ],
  },
  新北市: {
    heading: "新北市在地判讀重點",
    paragraphs: [
      "新北市幅員大，通勤路線、重劃區成熟度與產品新舊落差會明顯影響成交。比較行政區時，應先區分雙北核心通勤圈、捷運末端、河岸重劃區與外圍自住型區域。",
    ],
    items: [
      "板橋、三重、中和、新莊等區域適合先用捷運或橋梁通勤條件分組。",
      "林口、淡水、三峽等區域需把通勤時間、生活機能成熟度與新案供給一起看。",
      "同一行政區內重劃區與舊市區可能價格結構不同，應拉回社區與路段比較。",
    ],
  },
  桃園市: {
    heading: "桃園市在地判讀重點",
    paragraphs: [
      "桃園市行政區判讀要同時看重劃區、機場捷運、高鐵與國道通勤。新案量較高的區域，應把公設比、交屋時間與生活機能成熟度納入比較。",
    ],
    items: [
      "中壢、桃園、八德與蘆竹可依台鐵、捷運、國道與工作地點分組。",
      "青埔、經國、中路等重劃區需觀察新成屋與預售屋成交時間差。",
      "跨區比較時，總價帶與車位計價方式通常比表面單價更能反映可負擔性。",
    ],
  },
  臺中市: {
    heading: "臺中市在地判讀重點",
    paragraphs: [
      "臺中市行政區比較要拆開重劃區、大樓產品與透天產品。七期、水湳、北屯與屯區生活圈的價格結構不同，不能只用行政區平均單價做結論。",
    ],
    items: [
      "西屯、南屯、北屯等區域需分別觀察重劃區、新案與中古大樓。",
      "太平、大里、烏日等外圍區域可搭配通勤路線與總價帶比較。",
      "透天與大樓的土地持分、坪數口徑與車位型態不同，應分開篩選。",
    ],
  },
  臺南市: {
    heading: "臺南市在地判讀重點",
    paragraphs: [
      "臺南市行政區判讀需同時看舊市區、南科通勤與透天產品比例。市中心、安平與永康等生活圈條件不同，單純平均單價容易混合不同產品。",
    ],
    items: [
      "東區、中西區、安平等區域可先比較生活機能、屋齡與停車條件。",
      "永康、善化、新市等區域需觀察南科通勤需求與新案供給。",
      "透天與大樓成交總價、土地面積與建物面積口徑不同，應分開判讀。",
    ],
  },
  高雄市: {
    heading: "高雄市在地判讀重點",
    paragraphs: [
      "高雄市行政區比較時，港灣與重劃區生活圈、捷運路網與產業園區通勤會影響需求結構。亞洲新灣區、美術館、農十六與外圍行政區應分組比較。",
    ],
    items: [
      "鼓山、左營、前鎮、苓雅等區域可依捷運、港灣與商圈條件分組。",
      "楠梓、橋頭、仁武等區域需搭配產業園區、通勤與新案供給觀察。",
      "透天、大樓與新成屋案量差異大，行政區平均值只適合當入口，不能直接當估價。",
    ],
  },
};

const districtQueryHref = (city: string, district: string) =>
  `/districts/${encodeURIComponent(city)}/${encodeURIComponent(district)}/${encodeURIComponent("買賣")}/`;

const METRO_DISTRICT_INDEX_PAGES: SeoContentPage[] = METRO_DISTRICT_INDEX_CITIES.map(({ slug, city }) => {
  const districts = (CITY_DISTRICTS[city] ?? []).map((d) => d.name);
  const localContext = METRO_DISTRICT_CONTEXT[city];
  return {
    path: `/buying-guides/${slug}/districts/`,
    title: `${city}各行政區實價登錄與購屋指南`,
    description: `${city}各行政區的實價登錄查詢入口與購屋重點，點選行政區即可查看該區買賣成交總價、單價、坪數與地圖。`,
    intro: `想了解${city}不同行政區的房價，先從下方選擇目標行政區，進入該區的實價登錄查詢，比對同區、同型態、相近屋齡的實際成交，再縮小看屋範圍。各區生活圈、產品型態與屋齡差異大，建議搭配購屋與貸款指南一起評估。`,
    sections: [
      {
        heading: `如何使用${city}行政區查詢`,
        paragraphs: [
          `點選下方任一行政區，會進入該區的實價登錄查詢，可再依期間、總價、單價、坪數與屋齡篩選，並切換地圖檢視周邊。`,
          `跨區比較時，盡量維持相同交易類型與期間，並考量建物型態、公設比與車位計價方式的差異，避免只看單一每坪單價。`,
        ],
      },
      localContext,
    ],
    links: [
      ...districts.map((district) => ({ href: districtQueryHref(city, district), label: `${city}${district}實價登錄` })),
      { href: `/buying-guides/${slug}/`, label: `${city}購屋指南` },
      { href: "/buying-guides/", label: "各縣市購屋指南" },
    ],
  };
});

export const SEO_CONTENT_PAGES: SeoContentPage[] = [...STATIC_PAGES, ...METRO_DISTRICT_INDEX_PAGES];

export const getSeoContentPage = (pathname: string) =>
  SEO_CONTENT_PAGES.find((page) => page.path === pathname) ?? null;
