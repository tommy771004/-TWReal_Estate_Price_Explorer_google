import puppeteer from "puppeteer";

async function test() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto("https://lvr.land.moi.gov.tw/jsp/index.jsp", { waitUntil: "domcontentloaded", timeout: 30000 });
  
  const formData = {
    qryType: "biz", city: "A", town: "A01", ptype: ["1"],
    starty: "114", startm: "1",
    endy:   "115", endm:   "4",
    ftype: "", p_build: "", price_s: "", price_e: "",
    unit_price_s: "", unit_price_e: "",
    area_s: "", area_e: "",
    build_s: "", build_e: "",
    buildyear_s: "", buildyear_e: "",
    doorno: "", pattern: "", community: "", floor: "", urban: "", urbantext: "", nurban: "", aa12: "",
    p_purpose: "", p_unusual_yn: "N", p_unusualcode: "", QB41: "", show_avg: "N", tmoney_unit: "1",
    pmoney_unit: "1", unit: "2", rent_type: "", rent_order: ""
  };
  
  await page.evaluate((data) => localStorage.setItem("form-data", JSON.stringify(data)), formData);

  const waitForQueryPrice = new Promise((resolve) => {
    const qpHandler = async (resp) => {
      if (!resp.url().includes("/SERVICE/QueryPrice/")) return;
      try {
        resolve({ status: resp.status(), body: await resp.text() });
      } catch {
        resolve({ status: resp.status(), body: "(error)" });
      } finally {
        page?.off("response", qpHandler);
      }
    };
    page?.on("response", qpHandler);
    setTimeout(() => { page?.off("response", qpHandler); resolve({ status: 0, body: "__QP_TIMEOUT__" }); }, 45000);
  });

  await page.goto("https://lvr.land.moi.gov.tw/jsp/list.jsp", { waitUntil: "domcontentloaded", timeout: 30000 });
  
  const res = await waitForQueryPrice;
  console.log("Status:", res.status);
  console.log("Body length:", res.body.length);
  
  await browser.close();
}

test().catch(console.error);
