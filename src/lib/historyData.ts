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

/** 涵蓋期間的最後一天，轉成民國顯示（如 "115/10/31"） */
export function coverageEndLabel(coverage: CoverageWindow[]): string | null {
  const last = coverage[coverage.length - 1];
  if (!last) return null;
  const [y, m, d] = last.to.split("-").map(Number);
  return `${y - 1911}/${m}/${d}`;
}
