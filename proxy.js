const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio'); // 【新增】用於解析真實的 HTML DOM

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 設定常見的 User-Agent 偽裝成真實瀏覽器，避免被阻擋
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

app.get('/api/real-estate', async (req, res) => {
  try {
    const { city, district, type } = req.query;
    console.log(`[真實爬蟲啟動] 準備抓取: ${city} - ${district} - ${type}`);

    /* =========================================================
       步驟 1：取得目標網站的 Session Cookie (JSESSIONID)
       為了讓 list.jsp 認為我們是合法使用者，先拜訪首頁獲取憑證
       ========================================================= */
    const initResponse = await axios.get('https://lvr.land.moi.gov.tw/', {
      headers: { 'User-Agent': USER_AGENT },
      validateStatus: () => true // 即使是 404/500 也不要直接噴錯，方便我們觀察
    });
    
    // 提取伺服器回傳的 Cookies
    const cookies = initResponse.headers['set-cookie'] || [];
    const cookieString = cookies.map(c => c.split(';')[0]).join('; ');
    console.log(`[取得 Cookie]: ${cookieString || '無 (或網站不需要)'}`);

    /* =========================================================
       步驟 2：準備 POST 參數
       JSP 表單通常接收 x-www-form-urlencoded 格式。
       (註：此處的 city, district 欄位名稱需與目標網站的 <input name="..."> 完全一致)
       ========================================================= */
    const params = new URLSearchParams();
    params.append('city', city);
    params.append('district', district);
    params.append('tradeType', type);
    // params.append('action', 'search'); // 若表單有隱藏欄位 (hidden input) 也需一併加上

    /* =========================================================
       步驟 3：對目標網址發送真實的 POST 請求
       ========================================================= */
    const targetUrl = 'https://lvr.land.moi.gov.tw/jsp/list.jsp'; // 您指定的目標網址
    
    const response = await axios.post(targetUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
        'User-Agent': USER_AGENT,
        'Referer': 'https://lvr.land.moi.gov.tw/' // 欺騙伺服器我們是從首頁點擊過來的
      },
      // 設定超時時間，避免政府網站回應過慢卡死
      timeout: 10000 
    });

    /* =========================================================
       步驟 4：解析回傳的 HTML，將表格轉換為 React 需要的 JSON
       ========================================================= */
    const html = response.data;
    const $ = cheerio.load(html);
    const results = [];

    // 【重要】：這裡的 'table.data-table tr' 必須替換成目標網站真實的 CSS 選擇器
    // 假設網站的資料放在一個 class 為 data-table 的 <table> 裡
    $('table tr').each((index, element) => {
      // 假設第 0 列是 <th> 標題，我們從資料列開始抓 (index > 0)
      if (index === 0) return; 

      const tds = $(element).find('td');
      
      // 確保這是一行有效的資料列
      if (tds.length >= 8) {
        results.push({
          id: index.toString(),
          address: $(tds[0]).text().trim(),
          tradeDate: $(tds[1]).text().trim(),
          target: $(tds[2]).text().trim(),
          usage: $(tds[3]).text().trim(),
          floor: $(tds[4]).text().trim(),
          area: $(tds[5]).text().trim(),
          unitPrice: $(tds[6]).text().trim(),
          totalPrice: $(tds[7]).text().trim(),
        });
      }
    });

    console.log(`[解析完成] 共抓取到 ${results.length} 筆真實資料`);

    // 如果抓出來是空的，可能是網站擋下了請求，或者 CSS 選擇器抓錯了
    if (results.length === 0) {
      console.warn('警告：抓取成功但未解析到任何資料。可能原因：網站有圖形驗證碼(Captcha) 或 HTML 結構與預期不符。');
    }

    /* =========================================================
       步驟 5：將真實資料回傳給前端 React
       ========================================================= */
    res.status(200).json(results);

  } catch (error) {
    console.error('[真實抓取失敗]:', error.message);
    res.status(500).json({ 
      error: '真實伺服器抓取資料失敗', 
      details: error.message 
    });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`✅ 真實爬蟲代理伺服器已啟動！(Port: ${PORT})`);
  console.log(`👉 您現在可以從 React 介面發送真實請求了。`);
});