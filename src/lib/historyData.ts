/**
 * 歷史實價登錄分片讀取（由 scripts/history/build-history.ts 產生）。
 *
 * 靜態主機上的結構：
 *   manifest.json                 涵蓋期間
 *   {city}/{tx}/index.json        { months: { "11509": 筆數 } }
 *   {city}/{tx}/{yyymm}.json.gz   該月成交列（與本期 XLS 相同欄位順序）
 *
 * 未設定 VITE_HISTORY_BASE_URL 時整個功能關閉，呼叫端改走 /api/proxy-search。
 */

import type { PeriodRange } from "../utils/real-estate-helpers";

type TxCode = "a" | "b" | "c";
type Row = string[];

export type CoverageWindow = { from: string; to: string };

type Manifest = {
  updatedAt: string;
  coverage: Record<TxCode, CoverageWindow[]>;
};

type MonthIndex = { months: Record<string, number> };

const BASE = ((import.meta.env.VITE_HISTORY_BASE_URL as string | undefined) || "").replace(/\/+$/, "");

export const isHistoryEnabled = () => BASE !== "";

// ---------------------------------------------------------------- 下載與解壓

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`歷史資料讀取失敗（${res.status}）`);
  const buf = new Uint8Array(await res.arrayBuffer());
  // 主機若已用 Content-Encoding: gzip 傳送，瀏覽器會先解壓；只有收到原始 gzip 才自行解壓
  const isGzip = buf.length > 2 && buf[0] === 0x1f && buf[1] === 0x8b;
  const text = isGzip
    ? await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).text()
    : new TextDecoder().decode(buf);
  return JSON.parse(text) as T;
}

let manifestPromise: Promise<Manifest> | null = null;
const indexPromises = new Map<string, Promise<MonthIndex>>();

/** 月份資料的記憶體快取：切換行政區、關鍵字時不必重新下載與解壓 */
const MONTH_CACHE_LIMIT = 120;
const monthCache = new Map<string, Promise<Row[]>>();

export function loadManifest(signal?: AbortSignal): Promise<Manifest> {
  if (!manifestPromise) {
    manifestPromise = fetchJson<Manifest>(`${BASE}/manifest.json`, signal).catch((err) => {
      manifestPromise = null;
      throw err;
    });
  }
  return manifestPromise;
}

function loadIndex(city: string, tx: TxCode, signal?: AbortSignal): Promise<MonthIndex> {
  const key = `${city}/${tx}`;
  let p = indexPromises.get(key);
  if (!p) {
    p = fetchJson<MonthIndex>(`${BASE}/${key}/index.json`, signal).catch((err) => {
      indexPromises.delete(key);
      throw err;
    });
    indexPromises.set(key, p);
  }
  return p;
}

function loadMonth(city: string, tx: TxCode, ym: string, signal?: AbortSignal): Promise<Row[]> {
  const key = `${city}/${tx}/${ym}`;
  const hit = monthCache.get(key);
  if (hit) {
    // 重新插入以維持 LRU 順序
    monthCache.delete(key);
    monthCache.set(key, hit);
    return hit;
  }
  const p = fetchJson<Row[]>(`${BASE}/${key}.json.gz`, signal).catch((err) => {
    monthCache.delete(key);
    throw err;
  });
  monthCache.set(key, p);
  while (monthCache.size > MONTH_CACHE_LIMIT) {
    monthCache.delete(monthCache.keys().next().value as string);
  }
  return p;
}

/** 以固定並行數執行，避免一次對主機發出上百個請求 */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

// ---------------------------------------------------------------- 期間與篩選

/** 期間內的所有交易年月（民國，如 "11509"） */
export function monthsInPeriod(period: PeriodRange): string[] {
  const sY = parseInt(period.startY, 10);
  const sM = parseInt(period.startM, 10);
  const eY = parseInt(period.endY, 10);
  const eM = parseInt(period.endM, 10);
  const out: string[] = [];
  for (let y = sY, m = sM; y < eY || (y === eY && m <= eM); m === 12 ? (y++, (m = 1)) : m++) {
    out.push(`${y}${String(m).padStart(2, "0")}`);
    if (out.length > 600) break; // 防呆：最多 50 年
  }
  return out;
}

/** 關鍵字比對的欄位：地址、備註，預售屋另含建案名稱（欄位位置見 build 腳本的 LAYOUT） */
const KEYWORD_COLS: Record<TxCode, number[]> = { a: [2, 26], b: [2, 26, 28], c: [2, 27] };

function filterRows(rows: Row[], tx: TxCode, district: string, keyword: string): Row[] {
  const kw = keyword.trim();
  return rows.filter((r) => {
    if (district && district !== "全部" && r[0] !== district) return false;
    if (kw && !KEYWORD_COLS[tx].some((i) => (r[i] || "").includes(kw))) return false;
    return true;
  });
}

// ---------------------------------------------------------------- 對外 API

export type HistoryResult = {
  rows: Row[];
  /** 該型態已涵蓋的登記／訂約期間（西元日期） */
  coverage: CoverageWindow[];
  updatedAt: string;
  monthsLoaded: number;
};

export async function fetchHistoryRows(opts: {
  cityCode: string;
  typeCode: string;
  period: PeriodRange;
  district: string;
  keyword: string;
  signal?: AbortSignal;
}): Promise<HistoryResult> {
  const city = opts.cityCode.toLowerCase();
  const tx = opts.typeCode.toLowerCase() as TxCode;
  const [manifest, index] = await Promise.all([
    loadManifest(opts.signal),
    loadIndex(city, tx, opts.signal),
  ]);

  // 只抓實際有資料的月份，新到舊排列，結果自然是新的在前
  const months = monthsInPeriod(opts.period)
    .filter((ym) => index.months[ym])
    .reverse();
  const chunks = await mapLimit(months, 6, (ym) => loadMonth(city, tx, ym, opts.signal));
  const rows = filterRows(chunks.flat(), tx, opts.district, opts.keyword);

  return {
    rows,
    coverage: manifest.coverage[tx] || [],
    updatedAt: manifest.updatedAt,
    monthsLoaded: months.length,
  };
}

// ---------------------------------------------------------------- 合併最新一期（即時 API）

/** 編號欄位（與 build 腳本的 LAYOUT 相同：買賣、預售屋第 27 欄，租賃第 28 欄） */
const ID_COL: Record<TxCode, number> = { a: 27, b: 27, c: 28 };

/**
 * 查詢期間是否涵蓋近期：期間結束月份在 6 個月內才需要補最新一期。
 * 本期檔幾乎都是近幾個月的成交；查舊年份時不必多打一次 API。
 */
export function periodTouchesRecent(period: PeriodRange, now: Date = new Date()): boolean {
  const end = parseInt(period.endY, 10) * 12 + parseInt(period.endM, 10);
  const current = (now.getFullYear() - 1911) * 12 + (now.getMonth() + 1);
  return end >= current - 6;
}

/** 以編號去重，把最新一期中分片還沒有的列加進來（新的排前面）。回傳合併結果與新增筆數。 */
export function mergeLatestRows(
  historyRows: Row[],
  latestRows: Row[],
  typeCode: string
): { rows: Row[]; added: number } {
  const col = ID_COL[typeCode.toLowerCase() as TxCode] ?? 27;
  const seen = new Set(historyRows.map((r) => r[col]).filter(Boolean));
  const extra = latestRows.filter((r) => {
    const id = r[col];
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  return { rows: extra.length ? [...extra, ...historyRows] : historyRows, added: extra.length };
}

const rocToIso = (y: string, m: string, d: string) =>
  `${Number(y) + 1911}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;

/** 從本期期間說明取出該型態的期間（與 build 腳本的解析規則相同） */
export function windowFromLvrTime(lvrTime: string, typeCode: string): CoverageWindow | null {
  const label = { a: "買賣", b: "預售屋", c: "租賃" }[typeCode.toLowerCase() as TxCode];
  const re =
    /(\d+)年(\d+)月(\d+)日?\s*至\s*(\d+)年(\d+)月(\d+)日?\s*之(買賣|租賃、預售屋|租賃|預售屋)/g;
  for (const m of lvrTime.matchAll(re)) {
    if (m[7] === label || (m[7] === "租賃、預售屋" && label !== "買賣")) {
      return { from: rocToIso(m[1], m[2], m[3]), to: rocToIso(m[4], m[5], m[6]) };
    }
  }
  return null;
}

/** 加入一段期間並合併相鄰／重疊的區段 */
export function addCoverageWindow(coverage: CoverageWindow[], w: CoverageWindow): CoverageWindow[] {
  const sorted = [...coverage, w].sort((a, b) => a.from.localeCompare(b.from));
  const out: CoverageWindow[] = [];
  for (const cur of sorted) {
    const last = out[out.length - 1];
    if (last) {
      const next = new Date(`${last.to}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      if (cur.from <= next.toISOString().slice(0, 10)) {
        if (cur.to > last.to) last.to = cur.to;
        continue;
      }
    }
    out.push({ ...cur });
  }
  return out;
}

/** 涵蓋期間的最後一天，轉成民國顯示（如 "115/10/31"） */
export function coverageEndLabel(coverage: CoverageWindow[]): string | null {
  const last = coverage[coverage.length - 1];
  if (!last) return null;
  const [y, m, d] = last.to.split("-").map(Number);
  return `${y - 1911}/${m}/${d}`;
}
