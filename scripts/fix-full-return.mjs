import fs from "fs";
const lines = fs.readFileSync("src/App.tsx", "utf8").replace(/\r\n/g, "\n").split("\n");
let bal = 0;
const start = 1474; // return (
for (let i = start; i < lines.length; i++) {
  const line = lines[i];
  // crude: count open tags of div and motion.div and close
  const openDiv = (line.match(/<div[\s>]/g) || []).length;
  const openMotion = (line.match(/<motion\.div[\s>]/g) || []).length;
  const closeDiv = (line.match(/<\/div>/g) || []).length;
  const closeMotion = (line.match(/<\/motion\.div>/g) || []).length;
  const openProvider = (line.match(/<ExplorerUiProvider[\s>]/g) || []).length;
  const closeProvider = (line.match(/<\/ExplorerUiProvider>/g) || []).length;
  const d = openDiv + openMotion + openProvider - closeDiv - closeMotion - closeProvider;
  if (d !== 0) {
    bal += d;
    console.log(`${i + 1} bal=${bal} ${line.trim().slice(0, 100)}`);
  }
  if (line.trim() === ");" && i > 1800) {
    console.log("hit end return at", i + 1, "bal", bal);
    break;
  }
}
console.log("final bal", bal);
