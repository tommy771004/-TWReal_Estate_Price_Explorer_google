import express from "express";
import https from "https";
import xlsx from "xlsx";
import { query } from "./db.js";
import { sendTelemetry } from "./telemetry.js";

const app = express();
app.use(express.json());

const CITY_CODE_TO_NAME: Record<string, string> = {
  "A": "臺北市", "B": "臺中市", "C": "基隆市", "D": "臺南市",
  "E": "高雄市", "F": "新北市", "G": "宜蘭縣", "H": "桃園市",
  "I": "嘉義市", "J": "新竹縣", "K": "苗栗縣", "M": "南投縣",
  "N": "彰化縣", "O": "新竹市", "P": "雲林縣", "Q": "嘉義縣",
  "T": "屏東縣", "U": "花蓮縣", "V": "臺東縣", "W": "金門縣",
  "X": "澎湖縣", "Z": "連江縣"
};

/** 縣市+交易型態 原始表快取：避免每次查詢都重抓 plvr XLS */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 小時
const MAX_CACHE_ENTRIES = 48; // 約 22 縣市 × 3 型態，留餘裕

interface CityTypeCacheEntry {
  rows: any[][];
  fetchedAt: number;
}

const cityTypeCache = new Map<string, CityTypeCacheEntry>();
/** 同一 key 下載進行中時共用 Promise，避免 stampede */
const inflightDownloads = new Map<string, Promise<CityTypeCacheEntry>>();

function cacheKey(cCode: string, txCode: string): string {
  return `${cCode.toLowerCase()}_${txCode.toLowerCase()}`;
}

function getCachedEntry(key: string): CityTypeCacheEntry | null {
  const entry = cityTypeCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
    cityTypeCache.delete(key);
    return null;
  }
  return entry;
}

function setCacheEntry(key: string, entry: CityTypeCacheEntry) {
  // 簡單 LRU：滿了先刪最舊
  if (cityTypeCache.size >= MAX_CACHE_ENTRIES && !cityTypeCache.has(key)) {
    let oldestKey: string | null = null;
    let oldestAt = Infinity;
    for (const [k, v] of cityTypeCache) {
      if (v.fetchedAt < oldestAt) {
        oldestAt = v.fetchedAt;
        oldestKey = k;
      }
    }
    if (oldestKey) cityTypeCache.delete(oldestKey);
  }
  cityTypeCache.set(key, entry);
}

function downloadXlsBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          return reject(new Error(`下載失敗，狀態碼: ${response.statusCode}`));
        }
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        response.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

function parseXlsToRows(buffer: Buffer): any[][] {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName =
    workbook.SheetNames.find((s: string) => s.includes("買賣") || s.includes("租賃") || s.includes("預售")) ||
    workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  if (jsonData.length < 2) return [];
  // 第 0 row 中文 Header，第 1 row 英文 Header
  return jsonData.slice(2).filter((row) => row.length && row[0]);
}

async function loadCityTypeRows(cCode: string, txCode: string): Promise<{
  rows: any[][];
  source: "cache" | "live";
  cachedAt: number;
}> {
  const key = cacheKey(cCode, txCode);
  const hit = getCachedEntry(key);
  if (hit) {
    return { rows: hit.rows, source: "cache", cachedAt: hit.fetchedAt };
  }

  let downloadPromise = inflightDownloads.get(key);
  if (!downloadPromise) {
    const fileName = `${cCode}_lvr_land_${txCode}.xls`;
    const url = `https://plvr.land.moi.gov.tw/Download?fileName=${fileName}`;
    console.log(`\n📥 [資料下載任務] 啟動下載: ${url}`);

    downloadPromise = (async () => {
      const buffer = await downloadXlsBuffer(url);
      const rows = parseXlsToRows(buffer);
      const entry: CityTypeCacheEntry = { rows, fetchedAt: Date.now() };
      setCacheEntry(key, entry);
      console.log(`💾 [快取寫入] ${key} → ${rows.length} 筆，TTL ${CACHE_TTL_MS / 3600000}h`);
      return entry;
    })().finally(() => {
      inflightDownloads.delete(key);
    });

    inflightDownloads.set(key, downloadPromise);
  } else {
    console.log(`⏳ [下載去重] 等待進行中的 ${key}`);
  }

  const entry = await downloadPromise;
  return { rows: entry.rows, source: "live", cachedAt: entry.fetchedAt };
}

function applyRowFilters(
  rawData: any[][],
  opts: {
    district?: string;
    keyword?: string;
    period?: { startY?: string; startM?: string; endY?: string; endM?: string };
  }
): any[][] {
  let data = rawData;

  if (opts.district && opts.district !== "全部") {
    data = data.filter((r) => r[0] === opts.district);
  }

  if (opts.keyword) {
    const kw = String(opts.keyword);
    data = data.filter((r) => {
      const addr = String(r[2] || "");
      const remark = String(r[26] || "");
      const buildCase = String(r[28] || "");
      return addr.includes(kw) || remark.includes(kw) || buildCase.includes(kw);
    });
  }

  if (opts.period) {
    const sY = parseInt(opts.period.startY || "0", 10);
    const sM = parseInt(opts.period.startM || "0", 10);
    const eY = parseInt(opts.period.endY || "999", 10);
    const eM = parseInt(opts.period.endM || "99", 10);

    data = data.filter((r) => {
      const tsDate = String(r[7] || "");
      if (tsDate.length >= 7) {
        const y = parseInt(tsDate.substring(0, tsDate.length - 4), 10);
        const m = parseInt(tsDate.substring(tsDate.length - 4, tsDate.length - 2), 10);
        if (y < sY || (y === sY && m < sM)) return false;
        if (y > eY || (y === eY && m > eM)) return false;
      }
      return true;
    });
  }

  return data;
}

interface TrendingQueryItem {
  query: string;
  count: number;
  type: "city" | "district" | "keyword";
}

let trendingQueries: TrendingQueryItem[] = [
  { query: "臺北市 信義區", count: 125, type: "district" },
  { query: "新北市 板橋區", count: 98, type: "district" },
  { query: "臺中市 西屯區", count: 87, type: "district" },
  { query: "和平東路", count: 64, type: "keyword" },
  { query: "桃園市 中壢區", count: 52, type: "district" },
  { query: "高雄市 鼓山區", count: 48, type: "district" },
  { query: "中山路", count: 43, type: "keyword" },
  { query: "臺北市 大安區", count: 39, type: "district" },
];

function updateTrendingQuery(query: string, type: "city" | "district" | "keyword") {
  const existing = trendingQueries.find((item) => item.query.toLowerCase() === query.toLowerCase());
  if (existing) {
    existing.count += 1;
  } else {
    trendingQueries.push({ query, count: 1, type });
  }
}

app.get("/api/trending-searches", (_req, res) => {
  const sorted = [...trendingQueries].sort((a, b) => b.count - a.count).slice(0, 8);
  return res.json({ success: true, data: sorted });
});

app.get("/api/cache-stats", (_req, res) => {
  const entries = [...cityTypeCache.entries()].map(([key, v]) => ({
    key,
    rows: v.rows.length,
    ageMinutes: Math.round((Date.now() - v.fetchedAt) / 60000),
  }));
  return res.json({
    success: true,
    ttlHours: CACHE_TTL_MS / 3600000,
    entryCount: cityTypeCache.size,
    inflight: [...inflightDownloads.keys()],
    entries,
  });
});

let currentActiveDownloads = 0;

app.post("/api/proxy-search", async (req, res) => {
  try {
    const { cityCode, district, transactionType, period, keyword } = req.body;

    const cName = CITY_CODE_TO_NAME[String(cityCode || "A").toUpperCase()] || "臺北市";
    if (keyword && String(keyword).trim()) {
      updateTrendingQuery(String(keyword).trim(), "keyword");
    } else if (district && district !== "全部") {
      updateTrendingQuery(`${cName} ${district}`, "district");
    } else {
      updateTrendingQuery(cName, "city");
    }

    const txCode = String(transactionType || "a").toLowerCase();
    const cCode = String(cityCode || "a").toLowerCase();
    const key = cacheKey(cCode, txCode);
    const alreadyCached = Boolean(getCachedEntry(key));

    // 僅對「需要實際下載」的請求做並發限制；快取命中不佔額度
    if (!alreadyCached && !inflightDownloads.has(key) && currentActiveDownloads > 5) {
      return res.status(429).json({ success: false, error: "系統忙碌中，請稍後再試。" });
    }

    const needsDownload = !alreadyCached && !inflightDownloads.has(key);
    if (needsDownload) currentActiveDownloads++;

    try {
      const { rows, source, cachedAt } = await loadCityTypeRows(cCode, txCode);
      const filtered = applyRowFilters(rows, { district, keyword, period });

      console.log(
        `✅ [查詢完成] ${key} source=${source} raw=${rows.length} filtered=${filtered.length}`
      );
      sendTelemetry("listing_search.completed", {
        city_code: cCode,
        result_count: filtered.length,
        has_district: Boolean(district && district !== "全部"),
        transaction_type: txCode,
        cache_source: source,
      });

      return res.json({
        success: true,
        data: filtered,
        source,
        cachedAt: new Date(cachedAt).toISOString(),
        rawCount: rows.length,
      });
    } finally {
      if (needsDownload) currentActiveDownloads--;
    }
  } catch (error: any) {
    console.error(`❌ [任務失敗]:`, error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 意見回饋 API Endpoint
app.post("/api/feedback", async (req, res) => {
  const { category, content, contact, latitude, longitude, county, district, location_method } = req.body;

  if (!category || !content) {
    return res.status(400).json({ success: false, error: "為必填欄位：分類與內容未填寫！" });
  }

  try {
    const sql = `
      INSERT INTO feedbacks (category, content, contact, latitude, longitude, county, district, location_method)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    const params = [
      category,
      content,
      contact || null,
      latitude !== undefined && latitude !== null ? Number(latitude) : null,
      longitude !== undefined && longitude !== null ? Number(longitude) : null,
      county || null,
      district || null,
      location_method || "unknown",
    ];

    const result = await query(sql, params);
    const newId = result.rows[0]?.id;
    sendTelemetry("feedback.submitted", { category: String(category).slice(0, 80) });

    return res.json({
      success: true,
      message: "意見回饋已成功送出！",
      data: { id: newId, isSimulation: (result as any).isSimulation || false },
    });
  } catch (err: any) {
    console.error("❌ 送出意見回饋失敗:", err.message);
    return res.status(500).json({ success: false, error: "資料庫寫入失敗：" + err.message });
  }
});

// 行動追蹤日誌 (Audit Log) API Endpoint
app.post("/api/audit-log", async (req, res) => {
  const { action_type, details, latitude, longitude, county, district, location_method } = req.body;

  if (!action_type) {
    return res.status(400).json({ success: false, error: "action_type 為必填欄位" });
  }

  try {
    const sql = `
      INSERT INTO audit_logs (action_type, details, latitude, longitude, county, district, location_method)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    const params = [
      action_type,
      details || null,
      latitude !== undefined && latitude !== null ? Number(latitude) : null,
      longitude !== undefined && longitude !== null ? Number(longitude) : null,
      county || null,
      district || null,
      location_method || "unknown",
    ];

    const result = await query(sql, params);
    const newId = result.rows[0]?.id;
    sendTelemetry("audit.recorded", { action_type: String(action_type).slice(0, 80) });

    return res.json({
      success: true,
      data: { id: newId, isSimulation: (result as any).isSimulation || false },
    });
  } catch (err: any) {
    console.error("❌ 送出使用者行為日誌失敗:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default app;
