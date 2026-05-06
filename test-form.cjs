const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto("https://lvr.land.moi.gov.tw/jsp/index.jsp", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 2000));
  
  // 買賣, 板橋區
  await page.evaluate(() => {
    localStorage.setItem("form-data", JSON.stringify({
        systemType: "1", type: "1", qryType: "biz",
        city: "F", town: "F01",
        starty: "115", startm: "01",
        endy: "115", endm: "04",
        ptype: "1,2",
        urban: "1,2,3,4,5,6,7,8",
        nurban: "1,2,3,4,5,6,7,8,9,10,11",
        ftype: "1,2,3,4,5,6,7,8",
        pattern: "1,2,3,4,5",
        transaction: "1,2,3,4,5",
        p_purpose: "1,2,3,4,5,6,7,8,9,10",
        build_purpose: "1,2,3,4,5,6",
        rent_type: "1,2,3,4,5",
        unit: "1",
        pmoney_unit: "1",
        p_build: "",
        price_s: "",
        price_e: "",
        area_s: "",
        area_e: "",
        buildyear_s: "",
        buildyear_e: "",
        p_unusual_yn: "N", p_unusualcode: "", show_avg: "N", doorno: "", community: "", floor: "", urbantext: "", aa12: "", QB41: "",
        rent_order: "2"
    }));
  });
  
  page.on('request', async req => {
    if (req.url().includes('QueryPrice')) {
       console.log('QueryPrice req:', req.url());
    }
  }); // To dump the url
  
  await page.goto("https://lvr.land.moi.gov.tw/jsp/list.jsp", { waitUntil: "networkidle2" });
  
  await new Promise(r => setTimeout(r, 5000));
  
  const text = await page.evaluate(() => document.querySelector('.dataTables_empty')?.innerText);
  console.log("Empty text:", text);
  
  const tables = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('table')).map(t => t.id).filter(t => t !== '');
    return list;
  });
  console.log("Tables found:", tables);
  
  const firstRow = await page.evaluate(() => {
    return document.querySelector('#bizList_table tbody tr')?.innerText;
  });
  console.log("First row data (bizList_table):", firstRow);

  console.log("Done");
  await browser.close();
})();
