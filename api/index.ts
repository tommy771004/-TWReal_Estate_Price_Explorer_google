import express from "express";
import https from "https";
import xlsx from "xlsx";

const app = express();
app.use(express.json());

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
    const sheetName = workbook.SheetNames[0]; // 只需要 第一個 sheet，例如不動產買賣
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
