const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto("https://lvr.land.moi.gov.tw/jsp/index.jsp", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  
  page.on('dialog', async dialog => {
     await dialog.dismiss();
  });
  let results = {};
  for (let tab of ['#pills-sale-tab', '#pills-rent-tab', '#pills-presale-tab', '#pills-saleremark-tab']) {
     await page.evaluate((t) => document.querySelector(t)?.click(), tab);
     await new Promise(r => setTimeout(r, 1000));
     
     // choose a city to avoid dialog
     await page.evaluate(() => {
        const c = Array.from(document.querySelectorAll('.custom-select')).filter(el => el.offsetParent !== null);
        if (c.length > 0) {
            c[0].value = 'C'; c[0].dispatchEvent(new Event('change', {bubbles: true}));
        }
     });
     await new Promise(r => setTimeout(r, 1000));
     
     // try to click search
     const targetPromise = new Promise(resolve => browser.once('targetcreated', resolve));
     await page.evaluate(() => {
       try {
         const btns = Array.from(document.querySelectorAll('.form-button'))
           .filter(el => el.innerText.includes('搜尋') && el.offsetParent !== null);
         if (btns.length > 0) btns[0].click();
       } catch(e) { console.log(e); }
     });
     
     let page2;
     try {
       const target = await Promise.race([targetPromise, new Promise((_, rej) => setTimeout(() => rej('timeout'), 5000))]);
       page2 = await target.page();
       await new Promise(r => setTimeout(r, 2000));
       const fData = await page2.evaluate(() => localStorage.getItem("form-data"));
       results[tab] = JSON.parse(fData || '{}');
       await page2.close();
     } catch (e) {
       console.log("Error for", tab, e);
     }
  }
  console.log("Tab payloads:", JSON.stringify(results, null, 2));
  
  await browser.close();
})();
