const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto("https://lvr.land.moi.gov.tw/jsp/index.jsp", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  
  const forms = await page.evaluate(() => {
     let res = {};
     res.sale = {
       type: document.querySelector('#p_sale_type')?.value,
       systemType: document.querySelector('#p_sale_systemType')?.value,
       qryType: document.querySelector('#p_sale_qryType')?.value
     };
     res.rent = {
       type: document.querySelector('#p_rent_type')?.value,
       systemType: document.querySelector('#p_rent_systemType')?.value,
       qryType: document.querySelector('#p_rent_qryType')?.value
     };
     res.presale = {
       type: document.querySelector('#p_presale_type')?.value,
       systemType: document.querySelector('#p_presale_systemType')?.value,
       qryType: document.querySelector('#p_presale_qryType')?.value
     };
     return res;
  });
  console.log("Forms payload info:", forms);
  
  await browser.close();
})();
