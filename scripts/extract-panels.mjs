import fs from "fs";

const src = fs.readFileSync("src/App.tsx", "utf8").replace(/\r\n/g, "\n");
const lines = src.split("\n");

const find = (pred) => lines.findIndex(pred);

const marketStart = find((l) => l.includes("max-w-[1600px] mx-auto w-full flex flex-col gap-3 px-1 pt-1 pb-2"));
const marketEnd = find((l) => l.includes("手機也看得到釘選比價"));
const filterStart = find((l) => l.includes("{/* Quick Access Saved Searches */}"));
const filterEnd = find((l) => l.includes("{/* Save Search Modal */}"));
const resultsStart = find((l) => l.includes("{/* Content */}"));
const resultsEnd = find((l) => l.includes("<SeoAboutSection"));

console.log({
  marketStart: marketStart + 1,
  marketEnd: marketEnd + 1,
  filterStart: filterStart + 1,
  filterEnd: filterEnd + 1,
  resultsStart: resultsStart + 1,
  resultsEnd: resultsEnd + 1,
});

fs.writeFileSync(
  "tmp-market-raw.txt",
  lines.slice(marketStart, marketEnd).join("\n")
);
fs.writeFileSync(
  "tmp-filter-raw.txt",
  lines.slice(filterStart, filterEnd).join("\n")
);
// Results includes Content through end of AnimatePresence before rail/aside - need careful
// Actually resultsEnd is SeoAboutSection which is too late - includes rail
// Find grid with rail instead
const gridStart = find((l) => l.includes('grid w-full max-w-[1600px] mx-auto gap-4 lg:grid-cols'));
const aboutStart = find((l) => l.includes("<SeoAboutSection"));
// Content block from {/* Content */} to just before SeoAbout - but that includes rail
// Better: extract only the left column results + map AnimatePresence

// From {/* Content */} to end of AnimatePresence after map (line ~3403) then leave rail in App
const afterMap = find(
  (l, i) => i > resultsStart && l.includes("</AnimatePresence>") && lines[i + 1]?.includes("</div>")
);
// find the AnimatePresence that wraps loading/list/map - after results header
console.log("first AnimatePresence after content", 
  lines.map((l,i)=>l.includes("AnimatePresence")?i+1:null).filter(Boolean).filter(n=>n>resultsStart).slice(0,8)
);

fs.writeFileSync(
  "tmp-results-raw.txt",
  lines.slice(resultsStart, aboutStart).join("\n")
);
console.log("wrote temps", {
  market: marketEnd - marketStart,
  filter: filterEnd - filterStart,
  results: aboutStart - resultsStart,
});
