import https from 'https';
import xlsx from 'xlsx';

https.get('https://plvr.land.moi.gov.tw/Download?fileName=a_lvr_land_b.xls', response => {
  const data: any[] = [];
  response.on('data', chunk => data.push(chunk));
  response.on('end', () => {
    try {
      const buffer = Buffer.concat(data);
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames.find((s) => s.includes("買賣")) || workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      console.log('First 2 rows:', jsonData.slice(0, 2));
    } catch (e) {
    }
  });
});
