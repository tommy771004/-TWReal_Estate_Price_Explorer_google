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
  const existing = trendingQueries.find(item => item.query.toLowerCase() === query.toLowerCase());
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

let currentActivePages = 0;

app.post("/api/proxy-search", async (req, res) => {
  if (currentActivePages > 5) {
    return res.status(429).json({ success: false, error: "系統忙碌中，請稍後再試。" });
  }

  currentActivePages++;

  try {
    const { cityCode, district, propertyTypes, transactionType, period, unitPrice, area, age, keyword } = req.body;
    
    // Track query location
    const cName = CITY_CODE_TO_NAME[String(cityCode || "A").toUpperCase()] || "臺北市";
    if (keyword && String(keyword).trim()) {
      updateTrendingQuery(String(keyword).trim(), "keyword");
    } else if (district && district !== "全部") {
      updateTrendingQuery(`${cName} ${district}`, "district");
    } else {
      updateTrendingQuery(cName, "city");
    }

    const txCode = String(transactionType).toLowerCase() || "a";
    const cCode = String(cityCode).toLowerCase() || "a";
    
    const fileName = `${cCode}_lvr_land_${txCode}.xls`;
    const url = `https://plvr.land.moi.gov.tw/Download?fileName=${fileName}`;
    
    console.log(`\n📥 [資料下載任務] 啟動下載: ${url}`);
    
    const buffer = await new Promise<Buffer>((resolve, reject) => {
       https.get(url, (response) => {
          if (response.statusCode !== 200) {
             return reject(new Error(`下載失敗，狀態碼: ${response.statusCode}`));
          }
          const data: any[] = [];
          response.on("data", (chunk) => data.push(chunk));
          response.on("end", () => resolve(Buffer.concat(data)));
       }).on("error", reject);
    });
    
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames.find((s: string) => s.includes("買賣") || s.includes("租賃")) || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    if (jsonData.length < 2) {
        return res.json({ success: true, data: [] });
    }
    
    // 第 0 row 是中文 Header，第 1 row 是英文 Header
    let rawData = jsonData.slice(2).filter((row) => row.length && row[0]);
    
    // 根據前端需要的條件過濾
    if (district && district !== "全部") {
       rawData = rawData.filter(r => r[0] === district); // 鄉鎮市區
    }
    
    if (keyword) {
       rawData = rawData.filter(r => {
          const addr = String(r[2] || "");
          const remark = String(r[26] || "");
          return addr.includes(keyword) || remark.includes(keyword);
       });
    }
    
    // period
    if (period) {
       const sY = parseInt(period.startY || "0");
       const sM = parseInt(period.startM || "0");
       const eY = parseInt(period.endY || "999");
       const eM = parseInt(period.endM || "99");
       
       rawData = rawData.filter(r => {
           const tsDate = String(r[7] || ""); // 1130409
           if (tsDate.length >= 7) {
               const y = parseInt(tsDate.substring(0, tsDate.length - 4));
               const m = parseInt(tsDate.substring(tsDate.length - 4, tsDate.length - 2));
               if (y < sY || (y === sY && m < sM)) return false;
               if (y > eY || (y === eY && m > eM)) return false;
           }
           return true;
       });
    }
    
    // 統一回傳未經過濾但符合基礎條件的資料，複雜的進階篩選可以由前端處理
    console.log(`✅ [資料下載任務] 取得 ${rawData.length} 筆原始資料`);
    sendTelemetry('listing_search.completed', {
      city_code: cCode,
      result_count: rawData.length,
      has_district: Boolean(district && district !== '全部'),
      transaction_type: txCode,
    });
    
    return res.json({ success: true, data: rawData });

  } catch (error: any) {
    console.error(`❌ [任務失敗]:`, error.message);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    currentActivePages--;
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
      location_method || "unknown"
    ];

    const result = await query(sql, params);
    const newId = result.rows[0]?.id;
    sendTelemetry('feedback.submitted', { category: String(category).slice(0, 80) });

    return res.json({ 
      success: true, 
      message: "意見回饋已成功送出！", 
      data: { id: newId, isSimulation: (result as any).isSimulation || false } 
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
      location_method || "unknown"
    ];

    const result = await query(sql, params);
    const newId = result.rows[0]?.id;
    sendTelemetry('audit.recorded', { action_type: String(action_type).slice(0, 80) });

    return res.json({ 
      success: true, 
      data: { id: newId, isSimulation: (result as any).isSimulation || false } 
    });
  } catch (err: any) {
    console.error("❌ 送出使用者行為日誌失敗:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default app;
