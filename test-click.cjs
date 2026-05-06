const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto("https://lvr.land.moi.gov.tw/jsp/index.jsp", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  
  const html = await page.evaluate(() => {
     return Array.from(document.querySelectorAll('select, option')).map(el => ({
         tag: el.tagName,
         id: el.id,
         class: el.className,
         value: el.value,
         text: (el.innerText || el.textContent || '').trim()
     })).filter(x => x.text && x.text.includes('北') || x.id && x.id.includes('city') || x.class && typeof x.class === 'string' && x.class.includes('city'));
  });
  console.log("Elements:", html.slice(0, 50));
  
  await browser.close();
})();
