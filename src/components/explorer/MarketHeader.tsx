import { ChevronDown, Database, ShieldCheck, Clock, Pin } from "lucide-react";
import { formatCachedAtLabel } from "../../utils/real-estate-helpers";
import { coverageEndLabel, type CoverageWindow } from "../../lib/historyData";
import type { LucideIcon } from "lucide-react";

export type MarketKpi = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
};

type Props = {
  cityName: string;
  district: string;
  typeName: string;
  filteredCount: number;
  dataSource: string | null;
  dataCachedAt: string | null;
  /** 歷史分片的登記期間涵蓋範圍（走即時 API 時為 null） */
  dataCoverage?: CoverageWindow[] | null;
  marketSnapshotCount: number;
  marketKpis: MarketKpi[];
  pinCurrentMarket: () => void;
};

const toRoc = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y - 1911}/${m}/${d}`;
};

const shiftDay = (iso: string, days: number) => {
  const t = new Date(`${iso}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + days);
  return t.toISOString().slice(0, 10);
};

/** 最近一段缺口（本期與上一季之間尚未發布的期間），如「115/9/11–115/10/20」 */
function latestGapLabel(coverage: CoverageWindow[]): string | null {
  if (coverage.length < 2) return null;
  const prev = coverage[coverage.length - 2];
  const last = coverage[coverage.length - 1];
  return `${toRoc(shiftDay(prev.to, 1))}–${toRoc(shiftDay(last.from, -1))}`;
}

const coverageTitle = (coverage: CoverageWindow[]) =>
  `已收錄的登記（租賃、預售屋為訂約／交易）期間：${coverage
    .map((w) => `${toRoc(w.from)}–${toRoc(w.to)}`)
    .join("、")}`;

export function MarketHeader({
  cityName,
  district,
  typeName,
  filteredCount,
  dataSource,
  dataCachedAt,
  dataCoverage,
  marketSnapshotCount,
  marketKpis,
  pinCurrentMarket,
}: Props) {
  return (
    <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-3 px-0 pt-1 pb-2">
      {/* 標題 + 徽章：滿寬單欄 */}
      <section aria-labelledby="search-summary-heading" className="flex flex-col gap-2">
        <div className="min-w-0 flex flex-col gap-1.5">
          <h2 id="search-summary-heading" className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-on-surface leading-tight">
            {cityName}{district !== "全部" ? ` · ${district}` : ""}{typeName ? ` ${typeName}` : ""}成交行情
          </h2>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
              <Database size={14} /> 共 {filteredCount.toLocaleString()} 筆成交
            </span>
            <span className="text-outline-variant">·</span>
            <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" /> 內政部開放資料
            </span>
            {dataCoverage && coverageEndLabel(dataCoverage) && (
              <>
                <span className="text-outline-variant">·</span>
                <span
                  className="inline-flex items-center gap-1.5 text-on-surface-variant"
                  title={coverageTitle(dataCoverage)}
                >
                  <Clock size={14} aria-hidden="true" /> 資料至 {coverageEndLabel(dataCoverage)}
                </span>
                {latestGapLabel(dataCoverage) && (
                  <span className="text-on-surface-variant/80">
                    （{latestGapLabel(dataCoverage)} 待內政部季資料補齊）
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </section>

      {/* 市場摘要：M3 Card */}
      <section aria-labelledby="market-summary" className="flex flex-col gap-2.5">
        <details className="group overflow-hidden rounded-[22px] border border-outline-variant/40 bg-surface-container shadow-xs">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1.5 pl-4 pr-1.5 outline-none transition-colors hover:bg-on-surface/8 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden">
            <div className="min-w-0">
              <h3 id="market-summary" className="text-xs font-bold uppercase tracking-wider text-primary">
                市場摘要
              </h3>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full bg-surface-container-highest px-2.5 py-0.5 text-xs font-semibold text-on-surface-variant sm:inline-flex">
                <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" /> Open Data
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant transition-transform group-open:rotate-180">
                <ChevronDown size={16} aria-hidden="true" />
              </span>
            </div>
          </summary>
          <div className="border-t border-outline-variant/30 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-highest px-3 py-1 text-xs font-semibold text-on-surface-variant sm:hidden">
                <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" /> Open Data
              </span>
              <button
                type="button"
                onClick={pinCurrentMarket}
                disabled={marketSnapshotCount === 0}
                title="釘選此區 KPI，可與另一區對照"
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1.5 text-xs font-semibold text-on-secondary-container transition hover:shadow-xs disabled:opacity-40"
              >
                <Pin size={12} /> 釘選比價
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {marketKpis.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="min-w-0 rounded-2xl bg-surface-container-high border border-outline-variant/30 p-3.5 shadow-xs"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-1">
                      <span className="truncate text-xs font-semibold text-on-surface-variant">
                        {item.label}
                      </span>
                      <Icon size={14} className="shrink-0 text-primary" />
                    </div>
                    <div className="truncate text-lg font-bold tracking-tight text-on-surface sm:text-xl">
                      {item.value}
                    </div>
                    <div className="mt-1 truncate text-[11px] font-medium text-on-surface-variant">
                      {item.helper}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </details>
      </section>
    </div>
  );
}
