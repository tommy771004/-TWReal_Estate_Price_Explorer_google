import { Transaction } from "../types/real-estate";

export const YEARS = Array.from({ length: 15 }, (_, i) => (101 + i).toString());
export const MONTHS = Array.from({ length: 12 }, (_, i) => (1 + i).toString());

export type PeriodRange = { startY: string; startM: string; endY: string; endM: string };

/** 民國年月：以「今天」為終點，回溯 N 個月組出查詢區間。 */
export const getPeriodForMonths = (months: number, now: Date = new Date()): PeriodRange => {
  const rocY = now.getFullYear() - 1911;
  const month = now.getMonth() + 1;
  let startY = rocY;
  let startM = month - (months - 1);
  while (startM <= 0) {
    startY -= 1;
    startM += 12;
  }
  // YEARS 目前涵蓋 101–115；若超出則夾到可用範圍
  const clampY = (y: number) => Math.min(115, Math.max(101, y));
  return {
    startY: String(clampY(startY)),
    startM: String(startM),
    endY: String(clampY(rocY)),
    endM: String(month),
  };
};

/** 預設查詢區間：近 12 個月。 */
export const getDefaultPeriod = (now: Date = new Date()): PeriodRange =>
  getPeriodForMonths(12, now);

/** period 是否等於「近 N 個月」的快捷區間。 */
export const isPeriodForMonths = (
  period: PeriodRange,
  months: number,
  now: Date = new Date()
): boolean => {
  const expect = getPeriodForMonths(months, now);
  return (
    period.startY === expect.startY &&
    period.startM === expect.startM &&
    period.endY === expect.endY &&
    period.endM === expect.endM
  );
};

export const formatPeriodLabel = (period: PeriodRange): string =>
  `${period.startY}/${period.startM}–${period.endY}/${period.endM}`;

export const isDefaultPeriod = (period: PeriodRange, now: Date = new Date()): boolean => {
  const def = getDefaultPeriod(now);
  return (
    period.startY === def.startY &&
    period.startM === def.startM &&
    period.endY === def.endY &&
    period.endM === def.endM
  );
};

export const getPeriodValue = (y: string, m: string): number => {
  const yearIdx = parseInt(y) - 101;
  const monthIdx = parseInt(m) - 1;
  return yearIdx * 12 + monthIdx;
};

export const getPeriodFromValue = (val: number): { y: string; m: string } => {
  const year = 101 + Math.floor(val / 12);
  const month = 1 + (val % 12);
  return { y: year.toString(), m: month.toString() };
};

/** 數值陣列中位數；空陣列回傳 null。 */
export const median = (values: number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
};

const csvEscape = (value: string | number | undefined | null): string => {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
};

/** 將篩選後成交列匯出為 UTF-8 BOM CSV（Excel 可正確開中文）。 */
export const exportTransactionsCsv = (
  rows: Transaction[],
  typeName: string,
  filenameBase = "real-estate-results"
): void => {
  if (typeof window === "undefined" || rows.length === 0) return;

  const headers = [
    "鄉鎮市區",
    "交易標的",
    "土地位置建物門牌",
    "交易年月日",
    "總價元",
    "單價元平方公尺",
    "建物移轉總面積平方公尺",
    "建物型態",
    "移轉層次",
    "總樓層數",
    "建物現況格局-房",
    "建物現況格局-廳",
    "建物現況格局-衛",
    "有無管理組織",
    "車位總價元",
    "車位移轉總面積平方公尺",
    "備註",
    "建案名稱",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.district,
        r.transactionType,
        r.address,
        r.date,
        r.totalPrice,
        r.unitPrice,
        r.buildingArea || r.area,
        r.buildingType,
        r.floor,
        r.totalFloor,
        r.rooms,
        r.halls,
        r.bathrooms,
        r.hasManagement,
        r.parkingPrice,
        r.parkingArea,
        r.remarks,
        r.buildCase || "",
      ]
        .map(csvEscape)
        .join(",")
    ),
  ];

  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${filenameBase}-${typeName}-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const formatPrice = (price: string): string => {
  const p = parseFloat(price);
  if (isNaN(p)) return price;
  if (p >= 10000) {
    const wan = p / 10000;
    return `${wan % 1 === 0 ? wan : parseFloat(wan.toFixed(2))} 萬`;
  }
  return `${p} 元`;
};

export const formatDate = (dateStr: string): string => {
  if (dateStr.length === 7) {
    const year = parseInt(dateStr.substring(0, 3)) + 1911;
    const month = dateStr.substring(3, 5);
    const day = dateStr.substring(5, 7);
    return `${year}/${month}/${day}`;
  }
  return dateStr;
};

export const getLatestThreeMonthsForDistrict = (dist: string, data: Transaction[]): { month: string; count: number }[] => {
  const districtItems = data.filter(item => item.district === dist);
  
  let maxYear = 0;
  let maxMonth = 0;
  
  data.forEach(item => {
    if (item.date && item.date.length >= 5) {
      const yStr = item.date.length === 7 ? item.date.substring(0, 3) : item.date.substring(0, 2);
      const mStr = item.date.length === 7 ? item.date.substring(3, 5) : item.date.substring(2, 4);
      const yr = parseInt(yStr) + 1911;
      const mo = parseInt(mStr);
      if (yr > maxYear || (yr === maxYear && mo > maxMonth)) {
        maxYear = yr;
        maxMonth = mo;
      }
    }
  });

  if (maxYear === 0) {
    maxYear = 2026;
    maxMonth = 6;
  }

  let m1Y = maxYear;
  let m1M = maxMonth - 1;
  if (m1M === 0) { m1M = 12; m1Y -= 1; }

  let m2Y = m1Y;
  let m2M = m1M - 1;
  if (m2M === 0) { m2M = 12; m2Y -= 1; }

  const targetMonths = [
    { year: m2Y, month: m2M, label: `${m2Y}/${m2M.toString().padStart(2, '0')}` },
    { year: m1Y, month: m1M, label: `${m1Y}/${m1M.toString().padStart(2, '0')}` },
    { year: maxYear, month: maxMonth, label: `${maxYear}/${maxMonth.toString().padStart(2, '0')}` }
  ];

  return targetMonths.map(tm => {
    const count = districtItems.filter(item => {
      if (item.date && item.date.length >= 5) {
        const yStr = item.date.length === 7 ? item.date.substring(0, 3) : item.date.substring(0, 2);
        const mStr = item.date.length === 7 ? item.date.substring(3, 5) : item.date.substring(2, 4);
        const yr = parseInt(yStr) + 1911;
        const mo = parseInt(mStr);
        return yr === tm.year && mo === tm.month;
      }
      return false;
    }).length;

    return {
      month: tm.label,
      count
    };
  });
};

/** 親友／關係人等非市場行情成交（會嚴重扭曲中位價）。 */
export const isSpecialRelationTransaction = (remarks?: string): boolean =>
  Boolean(remarks && /(親友|關係人|員工|特殊關係)/.test(remarks));

export const getSpecialTags = (remarks?: string): { label: string; class: string }[] => {
  if (!remarks) return [];
  const result: { label: string; class: string }[] = [];
  if (isSpecialRelationTransaction(remarks)) result.push({ label: "特殊交易", class: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30" });
  if (/(增建|加蓋|頂加)/.test(remarks)) result.push({ label: "含增建", class: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30" });
  if (/(毛胚|未隔間)/.test(remarks)) result.push({ label: "毛胚屋", class: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30" });
  if (/(瑕疵|漏水|凶宅|非自然|死亡)/.test(remarks)) result.push({ label: "屋況瑕疵", class: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30" });
  if (/(地上權|使用權)/.test(remarks)) result.push({ label: "限制產權", class: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30" });
  return result;
};

/** 同建案／同路段鍵，供歷史筆數對照。 */
export const getCommunityHistoryKey = (item: {
  district: string;
  address: string;
  buildingType: string;
  buildCase?: string;
}): { kind: "buildCase" | "address"; key: string } | null => {
  if (item.buildCase && item.buildCase.trim()) {
    return { kind: "buildCase", key: item.buildCase.trim() };
  }
  const baseAddressMatch = item.address.match(/(.+?[路街道巷弄號])/);
  if (baseAddressMatch?.[1] && baseAddressMatch[1].length >= 3) {
    return {
      kind: "address",
      key: `${item.district}_${baseAddressMatch[1]}_${item.buildingType}`,
    };
  }
  return null;
};

/**
 * 等額本息月付估算（元）。
 * @param totalPrice 總價（元）
 * @param ltv 成數 0–1（例 0.8 = 八成）
 * @param annualRatePct 年利率 %（例 2.1）
 * @param years 貸款年期
 */
export const estimateMortgageMonthly = (
  totalPrice: number,
  ltv: number,
  annualRatePct: number,
  years: number
): number | null => {
  if (!Number.isFinite(totalPrice) || totalPrice <= 0) return null;
  if (!Number.isFinite(ltv) || ltv <= 0 || ltv > 1) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  const principal = totalPrice * ltv;
  const months = Math.round(years * 12);
  if (months <= 0) return null;
  const monthlyRate = (Number.isFinite(annualRatePct) ? annualRatePct : 0) / 100 / 12;
  if (monthlyRate <= 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
};

/** 後端 cachedAt ISO 字串 → 顯示用短時間。 */
export const formatCachedAtLabel = (iso?: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}`;
};
