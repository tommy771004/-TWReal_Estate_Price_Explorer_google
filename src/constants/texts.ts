export interface AppTexts {
  transactionType: string;
  propertyType: string;
  advancedSearch: string;
  saveSearch: string;
  recentSearches: string;
  trendingSearches: string;
  allDistricts: string;
  clearAll: string;
  searchPlaceholder: string;
  
  settingsTitle: string;
  textSizeSetting: string;
  textSizeSmall: string;
  textSizeMedium: string;
  textSizeLarge: string;
  textSizeSmallDesc: string;
  textSizeMediumDesc: string;
  textSizeLargeDesc: string;
  closeBtn: string;

  totalPrice: string;
  unitPrice: string;
  area: string;
  floor: string;
  age: string;
  remarks: string;
  
  loading: string;
  noData: string;
}

export const DEFAULT_APP_TEXTS: AppTexts = {
  transactionType: "交易型態",
  propertyType: "標的種類",
  advancedSearch: "進階篩選",
  saveSearch: "儲存搜尋",
  recentSearches: "最近搜尋",
  trendingSearches: "熱門搜尋",
  allDistricts: "全部行政區",
  clearAll: "清除全部",
  searchPlaceholder: "輸入地址、社區、道路、地號或捷運站...",
  
  settingsTitle: "介面與文字設定",
  textSizeSetting: "全域文字與版面大小",
  textSizeSmall: "精簡模式 (小)",
  textSizeMedium: "標準模式 (中)",
  textSizeLarge: "放大模式 (大)",
  textSizeSmallDesc: "適合希望單一畫面呈現最多資訊的使用者",
  textSizeMediumDesc: "預設之最舒適、平衡的閱讀比例",
  textSizeLargeDesc: "適合長輩或偏好大字體與清晰元件的使用者",
  closeBtn: "關閉並套用設定",

  totalPrice: "總價",
  unitPrice: "單價/坪",
  area: "建物面積",
  floor: "移轉層次",
  age: "屋齡",
  remarks: "備註",
  
  loading: "正在載入最新實價登錄資料...",
  noData: "找不到符合條件的成交紀錄。請重設或放寬您的篩選範圍。"
};
