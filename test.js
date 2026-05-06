import puppeteer from "puppeteer";

async function test() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto("https://lvr.land.moi.gov.tw/jsp/index.jsp", { waitUntil: "networkidle2" });

  const html = await page.content();
  console.log(html.substring(0, 500));
  
  const fd = await page.evaluate(() => localStorage.getItem("form-data"));
  console.log("form-data initial:", fd);

  await browser.close();
}

test().catch(console.error);
