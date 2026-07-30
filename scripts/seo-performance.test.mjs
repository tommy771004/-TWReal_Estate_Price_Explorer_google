import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("critical CSS uses the bundled local font instead of a render-blocking remote font", async () => {
  const [mainSource, cssSource] = await Promise.all([
    readFile(new URL("../src/main.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/index.css", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(cssSource, /fonts\.googleapis\.com/);
  assert.match(mainSource, /@fontsource-variable\/geist/);
  assert.match(cssSource, /--font-sans:\s*"Geist Variable"/);
});

test("the initial app does not directly import the charting runtime", async () => {
  const [appSource, detailDialogSource, chartSource] = await Promise.all([
    readFile(new URL("../src/App.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/explorer/TransactionDetailDialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/CommunityTrendChart.tsx", import.meta.url), "utf8").catch(() => ""),
  ]);

  assert.doesNotMatch(appSource, /from\s+["']recharts["']/);
  assert.doesNotMatch(detailDialogSource, /from\s+["']recharts["']/);
  // 社群趨勢圖只在交易詳情彈窗開啟時才載入，不進首屏 bundle
  assert.match(detailDialogSource, /lazy\(\(\) => import\(["']\.\.\/CommunityTrendChart["']\)\)/);
  assert.match(chartSource, /from\s+["']recharts["']/);
});
