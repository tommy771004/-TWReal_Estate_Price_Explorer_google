const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto("https://lvr.land.moi.gov.tw/jsp/index.jsp", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  
  // get data of city and form data by directly evaluating a UI function?
  // We can just dump localStorage.getItem("form-data");
  
  page.on('dialog', async dialog => {
     await dialog.dismiss();
  });
  
  await page.evaluate(() => {
     let sel = document.querySelector('#changeQry_city');
     if (!sel) sel = Array.from(document.querySelectorAll('.custom-select')).find(el => el.offsetParent !== null);
     if (sel) {
         sel.value = "F";
         sel.dispatchEvent(new Event('change', {bubbles: true}));
     }
  });
  await new Promise(r => setTimeout(r, 1000));
  
  let targetPromise = new Promise(resolve => browser.once('targetcreated', resolve));
  await page.evaluate(() => {
     try {
       const btns = Array.from(document.querySelectorAll('.form-button')).filter(el => el.innerText.includes('搜尋') && el.offsetParent !== null);
       if (btns.length > 0) btns[0].click();
       else console.log("NO SEARCH BUTTON FOUND");
     } catch(e) { console.log(e); }
  });
  
  try {
      const target = await Promise.race([targetPromise, new Promise((_, rej) => setTimeout(() => rej('timeout'), 5000))]);
      const page2 = await target.page();
      await new Promise(r => setTimeout(r, 2000));
      
      const fData = await page2.evaluate(() => localStorage.getItem("form-data"));
      console.log("SALE TAB (default) form-data (from new page):", JSON.parse(fData || '{}'));
      await page2.close();
  } catch (e) {
      console.log("Wait for new page failed:", e);
      // Wait for navigation? Maybe it didn't open a new tab?
      const fData = await page.evaluate(() => localStorage.getItem("form-data"));
      console.log("SALE TAB (default) form-data (from current page):", JSON.parse(fData || '{}'));
  }
  
  // switch tab
  // ...
  await browser.close();
})();
