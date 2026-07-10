import fs from "fs";

function balance(path, start, end) {
  const lines = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n").split("\n");
  let bal = 0;
  for (let i = start - 1; i < end && i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<div[\s>]/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    if (!opens && !closes) continue;
    bal += opens - closes;
    console.log(`${i + 1} bal=${bal} +${opens} -${closes} ${line.trim().slice(0, 90)}`);
  }
  console.log("final", bal);
}

console.log("=== App 1502-1720 ===");
balance("src/App.tsx", 1502, 1720);
console.log("=== SearchFilterPanel ===");
const fl = fs.readFileSync("src/components/explorer/SearchFilterPanel.tsx", "utf8").split("\n").length;
balance("src/components/explorer/SearchFilterPanel.tsx", 1, fl);
console.log("=== ResultsWorkspace ===");
const rl = fs.readFileSync("src/components/explorer/ResultsWorkspace.tsx", "utf8").split("\n").length;
balance("src/components/explorer/ResultsWorkspace.tsx", 1, rl);
