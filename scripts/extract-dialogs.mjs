import fs from "fs";

const src = fs.readFileSync("src/App.tsx", "utf8").replace(/\r\n/g, "\n");
const lines = src.split("\n");

const detailStart = lines.findIndex((l) => l.includes("{/* Detail Dialog */}"));
const settingsStart = lines.findIndex((l) => l.includes("<SettingsDialog"));
const trendStart = lines.findIndex((l) => l.includes("{/* District Volume Trend Dialog */}"));

console.log({ detailStart: detailStart + 1, settingsStart: settingsStart + 1, trendStart: trendStart + 1 });

const detailBody = lines.slice(detailStart, settingsStart).join("\n");
const trendBody = lines.slice(trendStart, detailStart).join("\n");

fs.writeFileSync("tmp-detail-raw.txt", detailBody);
fs.writeFileSync("tmp-trend-raw.txt", trendBody);
console.log("detail chars", detailBody.length, "trend chars", trendBody.length);
