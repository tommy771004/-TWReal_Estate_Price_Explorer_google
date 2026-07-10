/** 首頁／探索器 UI 常數與動畫 variants */

export const FEATURED_CITY_NAMES = ["臺北市", "新北市", "桃園市", "臺中市", "臺南市", "高雄市"] as const;

export const FEATURED_QUERY_INTENTS = [
  "實價登錄查詢",
  "台灣房價地圖",
  "預售屋成交紀錄",
  "租賃實價登錄",
  "社區成交單價",
] as const;

export const SEO_CONTENT_UPDATED = __SEO_LAST_MODIFIED__;

export const modalContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const modalItemVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};
