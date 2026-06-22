let pool: any = null;

/**
 * 取得資料庫連線池。如果未設定 DATABASE_URL，則返回 null。
 * 採 Lazy Initialization（延遲初始化）以避免在伺服器啟動時因缺密鑰而直接崩潰。
 * 在 Vercel 環境中採動態載入（Dynamic Import），防禦頂層載入之錯誤。
 */
export async function getDbPool() {
  const connectionString = process.env.DATABASE_URL;
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
        console.warn("[Database Init Warning] 找不到原生 ws 套件，嘗試預設設定：", wsErr);
      }
      pool = new Pool({
        connectionString,
      });
    } catch (err: any) {
      console.error("[Database Init Error] 無法初使化 Neon Database 連線池：", err.message);
      return null;
    }
  }
  return pool;
}

/**
 * 執行 SQL 查詢。若無 DATABASE_URL 連線設定則進入虛擬模擬模式，在伺服器印出 Log，避免阻礙前端使用。
 */
export async function query(text: string, params?: any[]) {
  try {
    const dbPool = await getDbPool();
    if (!dbPool) {
      console.log(`\n☁️ [Neon Database Simulation]`);
      console.log(`查詢語句: ${text}`);
      console.log(`參數資料:`, JSON.stringify(params));
      console.log(`狀態提示: DATABASE_URL 尚未設定。僅在記憶體模擬儲存行為。\n`);
      return { rows: [{ id: Math.floor(Math.random() * 1000000) }], isSimulation: true };
    }
    return await dbPool.query(text, params);
  } catch (err: any) {
    console.error("[Database Query Error] SQL 查詢失敗，降級執行模擬模式：", err.message);
    return { rows: [{ id: Math.floor(Math.random() * 1000000) }], isSimulation: true, error: err.message };
  }
}
