/**
 * 本地使用者資料匯出／匯入與結果快照（條件變更摘要）。
 * 純前端，不需帳號。
 */

import type { Transaction } from "../types/real-estate";

export const USER_DATA_VERSION = 1 as const;
const SNAPSHOTS_KEY = "explorer_result_snapshots";

export type ResultSnapshot = {
  key: string;
  label: string;
  count: number;
  /** 前 30 筆 id，用於粗估新增／消失 */
  sampleIds: string[];
  medianUnitWan: number | null;
  at: number;
};

export type PortableUserData = {
  version: typeof USER_DATA_VERSION;
  exportedAt: string;
  favorites: Transaction[];
  compare: Transaction[];
  pinnedKpis?: unknown[];
  snapshots?: ResultSnapshot[];
};

export function buildFilterSnapshotKey(parts: {
  cityName: string;
  typeName: string;
  district: string;
  periodLabel: string;
  search?: string;
  totalPriceMaxWan?: string;
}): string {
  return [
    parts.cityName,
    parts.typeName,
    parts.district,
    parts.periodLabel,
    parts.search?.trim() || "",
    parts.totalPriceMaxWan || "",
  ].join("|");
}

export function computeMedianUnitWan(rows: Transaction[]): number | null {
  const vals = rows
    .map((r) => parseFloat(r.unitPrice || ""))
    .filter((v) => Number.isFinite(v) && v > 0)
    .map((v) => (v * 3.30578) / 10000)
    .sort((a, b) => a - b);
  if (!vals.length) return null;
  const mid = Math.floor(vals.length / 2);
  return vals.length % 2 === 0 ? (vals[mid - 1] + vals[mid]) / 2 : vals[mid];
}

export function buildResultSnapshot(
  key: string,
  label: string,
  rows: Transaction[]
): ResultSnapshot {
  const sampleIds = rows
    .slice(0, 40)
    .map((r) => r.id)
    .filter(Boolean)
    .sort();
  return {
    key,
    label,
    count: rows.length,
    sampleIds: sampleIds.slice(0, 30),
    medianUnitWan: computeMedianUnitWan(rows),
    at: Date.now(),
  };
}

export function loadSnapshots(): Record<string, ResultSnapshot> {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ResultSnapshot>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveSnapshot(snapshot: ResultSnapshot): void {
  try {
    const all = loadSnapshots();
    all[snapshot.key] = snapshot;
    // 最多保留 40 組
    const entries = Object.entries(all).sort((a, b) => b[1].at - a[1].at);
    const trimmed = Object.fromEntries(entries.slice(0, 40));
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(trimmed));
  } catch {
    /* quota */
  }
}

export type SnapshotDelta = {
  previous: ResultSnapshot;
  current: ResultSnapshot;
  countDelta: number;
  /** 粗估：目前 sample 中上次沒有的 id 數 */
  newSampleCount: number;
};

export function diffSnapshot(
  previous: ResultSnapshot | undefined,
  current: ResultSnapshot
): SnapshotDelta | null {
  if (!previous) return null;
  // 太新（同一次查詢）略過
  if (current.at - previous.at < 5000) return null;
  if (previous.count === current.count && previous.medianUnitWan === current.medianUnitWan) {
    return null;
  }
  const prevSet = new Set(previous.sampleIds);
  const newSampleCount = current.sampleIds.filter((id) => !prevSet.has(id)).length;
  return {
    previous,
    current,
    countDelta: current.count - previous.count,
    newSampleCount,
  };
}

export function exportUserDataBundle(data: Omit<PortableUserData, "version" | "exportedAt">): string {
  const bundle: PortableUserData = {
    version: USER_DATA_VERSION,
    exportedAt: new Date().toISOString(),
    favorites: data.favorites || [],
    compare: data.compare || [],
    pinnedKpis: data.pinnedKpis,
    snapshots: data.snapshots,
  };
  return JSON.stringify(bundle, null, 2);
}

export function downloadJsonFile(filename: string, jsonText: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([jsonText], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type ImportResult = {
  ok: boolean;
  error?: string;
  data?: PortableUserData;
};

export function parseUserDataImport(raw: string): ImportResult {
  try {
    const parsed = JSON.parse(raw) as PortableUserData;
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "檔案格式無效" };
    }
    if (parsed.version !== USER_DATA_VERSION && parsed.version == null) {
      // 寬鬆：無 version 也接受
    }
    if (!Array.isArray(parsed.favorites) && !Array.isArray(parsed.compare)) {
      return { ok: false, error: "找不到收藏或比較清單欄位" };
    }
    // 舊版備份可能含 savedSearches，該功能已移除，解析時直接忽略
    return {
      ok: true,
      data: {
        version: USER_DATA_VERSION,
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
        compare: Array.isArray(parsed.compare) ? parsed.compare : [],
        pinnedKpis: parsed.pinnedKpis,
        snapshots: parsed.snapshots,
      },
    };
  } catch {
    return { ok: false, error: "無法解析 JSON" };
  }
}
