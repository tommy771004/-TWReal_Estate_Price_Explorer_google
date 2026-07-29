import { ChevronDown, Database, ShieldCheck, Clock, Zap, Pin } from "lucide-react";
import { FEATURED_CITY_NAMES } from "../../constants/app-ui";
import { formatCachedAtLabel } from "../../utils/real-estate-helpers";
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
  excludeSpecial: boolean;
  marketSnapshotCount: number;
  marketKpis: MarketKpi[];
  pinCurrentMarket: () => void;
  onSelectCity: (city: string) => void;
};

export function MarketHeader({
  cityName,
  district,
  typeName,
  filteredCount,
  dataSource,
  dataCachedAt,
  excludeSpecial,
  marketSnapshotCount,
  marketKpis,
  pinCurrentMarket,
  onSelectCity,
}: Props) {
  return (
            <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-3 px-0 pt-1 pb-2">
              {/* 標題 + 徽章：滿寬單欄，避免雙欄左側大片空白 */}
              <section aria-labelledby="search-summary-heading" className="flex flex-col gap-2.5">
                <div className="min-w-0 flex flex-col gap-2">
                  <h2 id="search-summary-heading" className="text-2xl sm:text-[1.75rem] font-display font-black tracking-tight text-ink dark:text-white leading-tight">
                    {cityName}{district !== "全部" ? ` · ${district}` : ""}{typeName ? ` ${typeName}` : ""}成交行情
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-coral-400/40 bg-coral-500/10 px-3 py-1.5 text-[12px] font-bold text-coral-700 dark:text-coral-300">
                      <Database size={13} /> 共 {filteredCount.toLocaleString()} 筆成交
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 dark:border-white/10 bg-white/45 dark:bg-slate-900/35 px-3 py-1.5 text-[12px] font-bold text-slate-600 dark:text-slate-300">
                      <ShieldCheck size={13} className="text-emerald-500" /> 內政部開放資料
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 dark:border-white/10 bg-white/45 dark:bg-slate-900/35 px-3 py-1.5 text-[12px] font-bold text-slate-600 dark:text-slate-300">
                      <Clock size={13} className="text-coral-500" /> 每 10 日更新
                    </span>
                    {dataSource && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold ${
                          dataSource === "cache"
                            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-sky-400/40 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                        }`}
                        title="同一縣市＋交易型態 6 小時內重用後端快取"
                      >
                        <Zap size={13} />
                        
                        {formatCachedAtLabel(dataCachedAt)
                          ? ` · ${formatCachedAtLabel(dataCachedAt)}`
                          : ""}
                      </span>
                    )}
                    {excludeSpecial && (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/40 bg-rose-500/10 px-3 py-1.5 text-[12px] font-bold text-rose-700 dark:text-rose-300"
                        title="已排除親友／關係人等特殊交易，點條件列可改回顯示"
                      >
                        <ShieldCheck size={13} />
                        已排除特殊交易
                      </span>
                    )}
                  </div>
                </div>
              </section>
  
              {/* 市場摘要：滿寬小卡片，同一列自適應 */}
              <section aria-labelledby="market-summary" className="flex flex-col gap-2.5">
                <details className="group overflow-hidden rounded-2xl border border-slate-200/50 bg-white/80 shadow-none dark:border-slate-800/60 dark:bg-slate-900/50">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 outline-none transition-colors hover:bg-slate-50/80 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral-500/40 dark:hover:bg-slate-800/40 sm:p-3.5 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0">
                      <h3 id="market-summary" className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                        市場摘要
                      </h3>
                      <p className="mt-0.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        依目前條件即時計算
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300 sm:inline-flex">
                        <ShieldCheck size={12} /> Open Data
                      </span>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-500 transition-transform group-open:rotate-180 dark:border-slate-700/70 dark:bg-slate-950/40 dark:text-slate-300">
                        <ChevronDown size={16} aria-hidden="true" />
                      </span>
                    </div>
                  </summary>
                  <div className="border-t border-slate-200/60 p-3 dark:border-slate-800/70 sm:p-3.5">
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300 sm:hidden">
                        <ShieldCheck size={12} /> Open Data
                      </span>
                      <button
                        type="button"
                        onClick={pinCurrentMarket}
                        disabled={marketSnapshotCount === 0}
                        title="釘選此區 KPI，可與另一區對照"
                        className="inline-flex items-center gap-1 rounded-full border border-coral-300/50 bg-coral-500/10 px-2.5 py-1 text-[10px] font-black text-coral-700 transition hover:bg-coral-500/15 disabled:opacity-40 dark:text-coral-300"
                      >
                        <Pin size={11} /> 釘選比價
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {marketKpis.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.label}
                            className="min-w-0 rounded-xl border border-slate-200/70 bg-white/80 px-2.5 py-2 dark:border-slate-800/80 dark:bg-slate-950/30"
                          >
                            <div className="mb-1 flex items-center justify-between gap-1">
                              <span className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                                {item.label}
                              </span>
                              <Icon size={12} className="shrink-0 text-coral-500" />
                            </div>
                            <div className="truncate text-lg font-black tracking-tight text-ink dark:text-white sm:text-xl">
                              {item.value}
                            </div>
                            <div className="mt-0.5 truncate text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              {item.helper}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </details>
  
                <div className="flex flex-wrap items-center gap-2">
                  <h3 id="featured-cities" className="mr-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    熱門查詢城市
                  </h3>
                  {FEATURED_CITY_NAMES.map((featuredCity) => (
                    <button
                      key={featuredCity}
                      onClick={() => onSelectCity(featuredCity)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${
                        cityName === featuredCity
                          ? "border-coral-400/60 bg-coral-500/12 text-coral-700 dark:text-coral-400"
                          : "border-white/60 dark:border-white/10 bg-white/45 dark:bg-slate-900/35 text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      {featuredCity}
                    </button>
                  ))}
                </div>
              </section>
            </div>
  
  );
}
