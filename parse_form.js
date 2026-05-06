import fs from 'fs';

const html = fs.readFileSync('page.html', 'utf8');
const formMatch = html.substring(html.indexOf('<form id="main_form"'), html.indexOf('</form>'));

let names = new Set();
const regex = /name="([^"]+)"/g;
let match;
while ((match = regex.exec(formMatch)) !== null) {
  names.add(match[1]);
}
console.log(Array.from(names));
