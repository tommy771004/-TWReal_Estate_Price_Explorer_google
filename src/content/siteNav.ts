// 全站導覽的單一資料來源：同時供頂部下拉選單與分組頁尾使用。
// 新增內容頁時，把連結加進對應分組即可，兩處導覽會一起更新。
export type NavLink = { href: string; label: string };
export type NavGroup = { label: string; links: NavLink[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "房價查詢",
    links: [
      { href: "/", label: "實價登錄查詢首頁" },
      { href: "/prices/", label: "各縣市實價登錄查詢" },
    ],
  },
  {
    label: "購屋指南",
    links: [
      { href: "/buying-guides/", label: "各縣市購屋指南" },
      { href: "/buying-guides/taipei/", label: "臺北市首購指南" },
      { href: "/buying-guides/new-taipei/", label: "新北市購屋指南" },
      { href: "/buying-guides/taoyuan/", label: "桃園市買房指南" },
      { href: "/buying-guides/taichung/", label: "臺中市買房指南" },
      { href: "/buying-guides/tainan/", label: "臺南市購屋指南" },
      { href: "/buying-guides/kaohsiung/", label: "高雄市購屋指南" },
    ],
  },
  {
    label: "各區索引",
    links: [
      { href: "/buying-guides/taipei/districts/", label: "臺北市各行政區" },
      { href: "/buying-guides/new-taipei/districts/", label: "新北市各行政區" },
      { href: "/buying-guides/taoyuan/districts/", label: "桃園市各行政區" },
      { href: "/buying-guides/taichung/districts/", label: "臺中市各行政區" },
      { href: "/buying-guides/tainan/districts/", label: "臺南市各行政區" },
      { href: "/buying-guides/kaohsiung/districts/", label: "高雄市各行政區" },
    ],
  },
  {
    label: "租屋指南",
    links: [
      { href: "/renting-guides/", label: "租屋族指南" },
      { href: "/renting-guides/rent-market/", label: "租金行情怎麼查與判讀" },
      { href: "/renting-guides/deposit-and-lease/", label: "租屋押金與租約注意事項" },
      { href: "/renting-guides/tenant-rights/", label: "租屋族權益與報稅補貼" },
    ],
  },
  {
    label: "貸款 / 金融",
    links: [
      { href: "/guides/mortgage-calculator/", label: "房貸試算與首購貸款指南" },
      { href: "/guides/first-home-loan-subsidy/", label: "首購族貸款優惠與補貼方案總覽" },
      { href: "/guides/mortgage-approval-factors/", label: "影響房貸核貸與成數的關鍵因素" },
      { href: "/guides/refinance-mortgage/", label: "房貸轉貸與利率比較怎麼評估" },
    ],
  },
  {
    label: "居家 / 裝潢",
    links: [
      { href: "/guides/moving-in-checklist/", label: "交屋後入住準備清單" },
      { href: "/guides/renovation-budget/", label: "新居裝潢預算規劃指南" },
      { href: "/guides/small-space-furnishing/", label: "小坪數家具與收納規劃" },
    ],
  },
  {
    label: "使用指南",
    links: [
      { href: "/guides/", label: "實價登錄使用指南" },
      { href: "/guides/transaction-records/", label: "如何閱讀實價登錄成交紀錄" },
      { href: "/guides/presale-vs-resale/", label: "預售屋與成屋實價登錄怎麼比較" },
      { href: "/guides/map-location-limitations/", label: "地圖位置為什麼可能不精確" },
    ],
  },
  {
    label: "網站資訊",
    links: [
      { href: "/about/", label: "關於實價登錄查詢" },
      { href: "/methodology/", label: "資料方法與計算說明" },
      { href: "/data-sources/", label: "實價登錄資料來源" },
      { href: "/privacy/", label: "隱私權與資料使用說明" },
      { href: "/contact/", label: "聯絡與資料問題回報" },
    ],
  },
];
