const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const init = await axios.get('https://lvr.land.moi.gov.tw/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    validateStatus: () => true
  });
  
  const cookieString = (init.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
  
  const params = new URLSearchParams();
  params.append('city', 'A');
  params.append('district', '全部');
  params.append('tradeType', 'A');
  
  const res = await axios.post('https://lvr.land.moi.gov.tw/jsp/list.jsp', params.toString(), { 
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 
      'Cookie': cookieString, 
      'Content-Type': 'application/x-www-form-urlencoded' 
    }
  });
  
  const html = res.data;
  const $ = cheerio.load(html);
  
  console.log('Tbody rows:', $('table tbody tr').length);
  
  $('table tbody tr').slice(0, 3).each((i, el) => {
    const tds = $(el).find('td');
    const cols = tds.map((_, td) => $(td).text().trim()).get();
    console.log('Tbody Row', i, '=>', cols.join(' | '));
  });
}
test();
