// 聯盟行銷 / 導購夥伴設定
// ---------------------------------------------------------------------------
// 設計原則：
// 1. 連結一律由環境變數注入（VITE_AFF_*），未設定者「不會」顯示，避免上線出現空連結。
// 2. 受眾為「正在看房價、準備買房/換屋/裝潢」的高商業意圖使用者，
//    因此聚焦四大類：家具、家電/3C、居家裝潢、金融（房貸/信貸/信用卡）。
// 3. 申請平台：通路王 iChannels（門檻低）、聯盟網 Affiliates.One（品牌與金融方案多）。
//    取得專屬連結後填入對應的環境變數即可，毋須改動程式碼。

export type AffiliateCategory = "furniture" | "appliance" | "home" | "finance";

export type AffiliateNetwork = "ichannels" | "affiliatesone" | "direct";

export type AffiliatePartner = {
  id: string;
  /** 顯示名稱 */
  name: string;
  category: AffiliateCategory;
  /** 一句話導購文案 */
  blurb: string;
  /** 來源聯盟平台（僅供內部備註與揭露） */
  network: AffiliateNetwork;
  /** 對應的環境變數名稱；於 .env 設定專屬連結 */
  urlEnvKey: string;
};

export const AFFILIATE_CATEGORY_LABELS: Record<AffiliateCategory, string> = {
  furniture: "家具",
  appliance: "家電 / 3C",
  home: "居家 / 裝潢",
  finance: "房貸 / 金融",
};

// 候選夥伴清單。實際是否顯示，取決於對應環境變數是否填入連結。
export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  // 家具 ---------------------------------------------------------------
  { id: "nitori", name: "宜得利家居 NITORI", category: "furniture", network: "ichannels", urlEnvKey: "VITE_AFF_NITORI", blurb: "新家家具一次購齊，床墊、沙發、收納高 CP 值。" },
  { id: "trplus", name: "特力屋 TLW", category: "furniture", network: "affiliatesone", urlEnvKey: "VITE_AFF_TRPLUS", blurb: "裝潢五金、油漆與家具一站購足。" },
  { id: "hola", name: "HOLA 特力和樂", category: "furniture", network: "affiliatesone", urlEnvKey: "VITE_AFF_HOLA", blurb: "寢具、廚房與居家布置選品。" },

  // 家電 / 3C ----------------------------------------------------------
  { id: "momo", name: "momo 購物網", category: "appliance", network: "affiliatesone", urlEnvKey: "VITE_AFF_MOMO", blurb: "大型家電、冷氣、洗衣機品項齊、到貨快。" },
  { id: "pchome", name: "PChome 24h", category: "appliance", network: "affiliatesone", urlEnvKey: "VITE_AFF_PCHOME", blurb: "3C 與小家電當日／隔日到貨。" },
  { id: "tk3c", name: "燦坤快 3", category: "appliance", network: "ichannels", urlEnvKey: "VITE_AFF_TK3C", blurb: "家電比價與門市取貨服務。" },

  // 居家 / 裝潢 --------------------------------------------------------
  { id: "buy321", name: "生活市集", category: "home", network: "ichannels", urlEnvKey: "VITE_AFF_BUY321", blurb: "居家清潔、收納小物高頻團購。" },
  { id: "pcone", name: "松果購物", category: "home", network: "affiliatesone", urlEnvKey: "VITE_AFF_PCONE", blurb: "居家生活雜貨與家飾選品。" },

  // 房貸 / 金融 --------------------------------------------------------
  { id: "loan", name: "房貸 / 信貸試算與送件", category: "finance", network: "affiliatesone", urlEnvKey: "VITE_AFF_LOAN", blurb: "比較各家銀行房貸利率，線上預約諮詢。" },
  { id: "creditcard", name: "信用卡線上申辦", category: "finance", network: "affiliatesone", urlEnvKey: "VITE_AFF_CREDITCARD", blurb: "首購裝潢分期、回饋信用卡比較申辦。" },
];

const NETWORK_LABELS: Record<AffiliateNetwork, string> = {
  ichannels: "通路王",
  affiliatesone: "聯盟網",
  direct: "合作夥伴",
};

export type ResolvedPartner = AffiliatePartner & { url: string; networkLabel: string };

/** 讀取環境變數連結，只回傳「已設定連結」的夥伴。 */
export function getActivePartners(category?: AffiliateCategory): ResolvedPartner[] {
  const env = import.meta.env as Record<string, string | undefined>;
  return AFFILIATE_PARTNERS.filter((p) => !category || p.category === category)
    .map((p) => ({ ...p, url: (env[p.urlEnvKey] ?? "").trim(), networkLabel: NETWORK_LABELS[p.network] }))
    .filter((p) => p.url.length > 0);
}
