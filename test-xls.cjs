const https = require('https');
const xlsx = require('xlsx');

https.get('https://plvr.land.moi.gov.tw/Download?fileName=a_lvr_land_b.xls', res => {
  let data = [];
  res.on('data', chunk => data.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    console.log("Sheet names B:", workbook.SheetNames);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    console.log("Cols B:", jsonData[0]);
  });
});
