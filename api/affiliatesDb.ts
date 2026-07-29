let pool: any = null;

/**
 * 聯盟／合作推廣資料表使用獨立資料庫（SUP_DATABASE_URL），與主資料庫 DATABASE_URL 分開連線。
 * 未設定時回傳 null，呼叫端須視為「未啟用聯盟資料」，不得改用主資料庫代替（見 docs/affiliate-integration-spec.md 2.1）。
 */
export async function getAffiliatesDbPool() {
  const connectionString = process.env.SUP_DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  if (!pool) {
    try {
      const { Pool, neonConfig } = await import("@neondatabase/serverless");
      try {
        const wsObj = await import("ws");
        neonConfig.webSocketConstructor = (wsObj.default || wsObj) as any;
      } catch (wsErr) {
        console.warn("[Affiliates DB Init Warning] 找不到原生 ws 套件，嘗試預設設定：", wsErr);
      }
      pool = new Pool({ connectionString });
    } catch (err: any) {
      console.error("[Affiliates DB Init Error] 無法初始化聯盟推廣資料庫連線池：", err.message);
      return null;
    }
  }
  return pool;
}

/** 查詢聯盟推廣資料表。回傳 null 代表未設定 SUP_DATABASE_URL，呼叫端應視為「無資料」而非錯誤。 */
export async function queryAffiliates(text: string, params?: any[]) {
  const dbPool = await getAffiliatesDbPool();
  if (!dbPool) {
    return null;
  }
  return dbPool.query(text, params);
}
