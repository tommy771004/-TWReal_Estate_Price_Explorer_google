import { Transaction } from "../types/real-estate";

export const YEARS = Array.from({ length: 15 }, (_, i) => (101 + i).toString());
export const MONTHS = Array.from({ length: 12 }, (_, i) => (1 + i).toString());

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

export const getSpecialTags = (remarks?: string): { label: string; class: string }[] => {
  if (!remarks) return [];
  const result: { label: string; class: string }[] = [];
  if (/(親友|關係人|員工|特殊關係)/.test(remarks)) result.push({ label: "特殊交易", class: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30" });
  if (/(增建|加蓋|頂加)/.test(remarks)) result.push({ label: "含增建", class: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30" });
  if (/(毛胚|未隔間)/.test(remarks)) result.push({ label: "毛胚屋", class: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30" });
  if (/(瑕疵|漏水|凶宅|非自然|死亡)/.test(remarks)) result.push({ label: "屋況瑕疵", class: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30" });
  if (/(地上權|使用權)/.test(remarks)) result.push({ label: "限制產權", class: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30" });
  return result;
};
