const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto("https://lvr.land.moi.gov.tw/jsp/index.jsp", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
     const sel = document.querySelector('#p_city');
     if (sel) {
         sel.value = "A";
         sel.dispatchEvent(new Event('change', { bubbles: true }));
     }
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
     try {
       Array.from(document.querySelectorAll('.form-button')).find(el => el.innerText.includes('搜尋')).click();
     } catch(e) { console.log(e); }
  });
  
  await new Promise(r => setTimeout(r, 5000));
  
  const formData = await page.evaluate(() => localStorage.getItem("form-data"));
  console.log("Normal form-data from site:", formData);
  
  await browser.close();
})();
