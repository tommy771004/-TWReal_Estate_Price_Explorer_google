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
  
  page.on('dialog', async dialog => {
     console.log("Dialog:", dialog.message());
     await dialog.dismiss();
  });
  
  const targetPromise = new Promise(resolve => browser.once('targetcreated', resolve));
  await page.evaluate(() => {
     try {
       const btns = Array.from(document.querySelectorAll('.form-button'))
         .filter(el => el.innerText.includes('搜尋') && el.offsetParent !== null);
       if (btns.length > 0) btns[0].click();
     } catch(e) { console.log(e); }
  });
  
  await targetPromise;
  await new Promise(r => setTimeout(r, 3000));
  
  const pages = await browser.pages();
  for (let p of pages) {
      if (p.url().includes('about:blank')) continue;
      const fData = await p.evaluate(() => localStorage.getItem("form-data"));
      console.log("Form data on", p.url(), ":", fData);
  }

  await browser.close();
})();
