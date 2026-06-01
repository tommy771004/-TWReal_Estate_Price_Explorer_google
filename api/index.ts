import express from "express";
import type { Request } from "express";
import https from "https";
import xlsx from "xlsx";

const app = express();
app.use(express.json());

const getSiteOrigin = (req: Request) => {
  const configuredOrigin =
    process.env.VITE_SITE_URL?.trim() || process.env.SITE_URL?.trim() || process.env.APP_URL?.trim();

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/, "");
  }

  const forwardedProto = String(req.headers["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim();
  const forwardedHost = String(req.headers["x-forwarded-host"] || "")
    .split(",")[0]
    .trim();
  const protocol = forwardedProto || (req.secure ? "https" : "http");
  const host = forwardedHost || req.get("host") || "localhost:3000";

  return `${protocol}://${host}`;
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

app.get("/robots.txt", (req, res) => {
  const origin = getSiteOrigin(req);

  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.type("text/plain").send([
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
  ].join("\n"));
});

app.get("/sitemap.xml", (req, res) => {
  const origin = getSiteOrigin(req);
  const homepageUrl = `${origin}/`;
  const lastmod = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(homepageUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.type("application/xml").send(xml);
});

app.use("/api", (_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  next();
});

let currentActivePages = 0;

app.post("/api/proxy-search", async (req, res) => {
  if (currentActivePages > 5) {
    return res.status(429).json({ success: false, error: "系統忙碌中，請稍後再試。" });
  }

  currentActivePages++;

  try {
    const { cityCode, district, propertyTypes, transactionType, period, unitPrice, area, age, keyword } = req.body;
    
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
    
    return res.json({ success: true, data: rawData });

  } catch (error: any) {
    console.error(`❌ [任務失敗]:`, error.message);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    currentActivePages--;
  }
});

export default app;
