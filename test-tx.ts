import https from "https";
import xlsx from "xlsx";

async function testBuy() {
  const fileNames = [`a_lvr_land_b.xls`];
  for (const f of fileNames) {
    const buffer = await new Promise<Buffer>((resolve) => {
      https.get(`https://plvr.land.moi.gov.tw/Download?fileName=${f}`, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        const data = [];
        res.on("data", d => data.push(d));
        res.on("end", () => resolve(Buffer.concat(data)));
      });
    });
    const wb = xlsx.read(buffer, { type: "buffer" });
    const sheetName = wb.SheetNames.find(n => n.includes("預售屋")) || wb.SheetNames[0];
    const json = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
    console.log(f, "Headers:", json[1]);
    console.log("Row 2:", json[2]);
    console.log("Row 28:", json[2][28]); // Build case
  }
}
testBuy();
