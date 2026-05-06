const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto("https://plvr.land.moi.gov.tw/DownloadOpenData", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  
  // call the JS function
  await page.evaluate(() => {
     loadAjaxUrl('Download_ajax_active','tab_opendata_active_content');
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  const functionText = await page.evaluate(() => {
     return typeof startOpenData === 'function' ? startOpenData.toString() : 'no startOpenData';
  });
  console.log("startOpenData code:", functionText);
  
  await browser.close();
})();
