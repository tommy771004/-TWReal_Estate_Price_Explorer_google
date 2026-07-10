import React from "react";
import { motion } from "motion/react";
import {
  Heart,
  ShieldCheck,
  Maximize2,
  Layers,
  Bed,
  Sofa,
  Bath,
  Train,
  GraduationCap,
  Home,
  Car,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  GitCompare,
  MapPinOff,
  History,
} from "lucide-react";
import { Transaction, HistoryCounts } from "../types/real-estate";
import {
  formatDate,
  formatPrice,
  getSpecialTags,
  getCommunityHistoryKey,
} from "../utils/real-estate-helpers";
import { calculateDistance } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { DEFAULT_APP_TEXTS, type AppTexts } from "../constants/texts";

interface TransactionCardProps {
  item: Transaction;
  idx: number;
  typeName: string;
  favorites: Transaction[];
  toggleFavorite: (item: Transaction, e: React.MouseEvent) => void;
  setSelectedItem: (item: Transaction | null) => void;
  setTrendDistrict: (district: string) => void;
  globalFacilities: any[];
  historyCounts: HistoryCounts;
  districtAveragePrices: Record<string, number>;
  appTexts?: AppTexts;
  /** 是否已加入比較清單 */
  isInCompare?: boolean;
  /** 切換比較；回傳 false 表示已滿 */
  toggleCompare?: (item: Transaction, e: React.MouseEvent) => boolean | void;
  /** 點社區歷史徽章：聚焦同建案／路段 */
  onFocusCommunity?: (item: Transaction, e: React.MouseEvent) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  item,
  idx,
  typeName,
  favorites,
  toggleFavorite,
  setSelectedItem,
  setTrendDistrict,
  globalFacilities,
  historyCounts,
  districtAveragePrices,
  appTexts = DEFAULT_APP_TEXTS,
  isInCompare = false,
  toggleCompare,
  onFocusCommunity,
}) => {
  // Nearest facilities calculation
  let nearestStation: any = null;
  let nearestSchool: any = null;
  let minStDist = Infinity;
  let minScDist = Infinity;

  const itemLat = typeof item.lat === "string" ? parseFloat(item.lat) : item.lat;
  const itemLng = typeof item.lng === "string" ? parseFloat(item.lng) : item.lng;

  const historyKey = getCommunityHistoryKey(item);
  let communityCount = 0;
  if (historyKey) {
    communityCount =
      historyKey.kind === "buildCase"
        ? historyCounts.buildCaseMap[historyKey.key] || 0
        : historyCounts.addressMap[historyKey.key] || 0;
  }
  const hasCoords = Boolean(itemLat && itemLng && itemLat !== 0 && itemLng !== 0);

  if (itemLat && itemLng && globalFacilities.length > 0) {
    globalFacilities.forEach((f) => {
      const flat = f.lat || f.center?.lat;
      const flng = f.lon || f.center?.lon;
      if (!flat || !flng) return;

      const d = calculateDistance(itemLat, itemLng, flat, flng);
      if (d > 5) return;

      const isSchool = f.tags?.amenity === "school";
      if (isSchool) {
        if (d < minScDist) {
          minScDist = d;
          nearestSchool = f;
        }
      } else {
        if (d < minStDist) {
          minStDist = d;
          nearestStation = f;
        }
      }
    });
  }

  // Price differences relative to district averages
  let priceDiffPercentage = 0;
  let showPriceIndicator = false;
  const itemUnitPrice = parseFloat(item.unitPrice || "0");
  const avgPrice = districtAveragePrices[item.district] || 0;

  if (itemUnitPrice > 0 && avgPrice > 0) {
    priceDiffPercentage = ((itemUnitPrice - avgPrice) / avgPrice) * 100;
    showPriceIndicator = true;
  }

  const isFavorite = favorites.some((f) => f.id === item.id);
  const displayDate = formatDate(item.date).replace(/-/g, "/");
  const unitPriceLabel = item.unitPrice
    ? `${((parseFloat(item.unitPrice) * 3.30578) / 10000).toFixed(1)} 萬/坪`
    : "-";
  const buildingTypeLabel = item.buildingType.split("(")[0] || "土地";
  const specialTags = getSpecialTags(item.remarks);
  const hasParking = item.parkingPrice && parseFloat(item.parkingPrice) > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 30, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(5px)", transition: { duration: 0.2, delay: 0 } }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min(idx, 8) * 0.04,
        layout: { type: "spring", bounce: 0.2, duration: 0.6, delay: 0 },
      }}
      key={item.id}
      onClick={() => setSelectedItem(item)}
      className="@container group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl liquid-glass-panel p-3 transition-all duration-300 hover:border-coral-500/35 dark:hover:border-coral-500/30 sm:p-3.5 [content-visibility:auto] [contain-intrinsic-size:auto_220px]"
    >
      {/* Hover accent */}
      <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-gradient-to-b from-coral-400 to-coral-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* ── Top: tags + actions ── */}
      <div className="flex min-w-0 items-start gap-2 pl-1">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          <span className="max-w-[6.5rem] truncate rounded-md border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide text-slate-600 dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-300">
            {item.district}
          </span>
          <span className="max-w-[5.5rem] truncate rounded-md border border-coral-100 bg-coral-50 px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide text-coral-600 dark:border-coral-500/20 dark:bg-coral-500/10 dark:text-coral-400">
            {buildingTypeLabel}
          </span>
          <span className="max-w-[7rem] truncate rounded-md border border-amber-100 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
            {item.transactionType}
          </span>
          {typeName === "預售屋" && item.buildCase && (
            <span className="max-w-[8rem] truncate rounded-md border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide text-emerald-600 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              建案: {item.buildCase}
            </span>
          )}
          {communityCount > 1 && (
            <button
              type="button"
              title={item.buildCase ? `同建案共 ${communityCount} 筆` : `同路段相近建物共 ${communityCount} 筆`}
              onClick={(e) => {
                e.stopPropagation();
                onFocusCommunity?.(item, e);
              }}
              className="inline-flex max-w-[7.5rem] items-center gap-0.5 truncate rounded-md border border-sky-200/80 bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide text-sky-700 shadow-sm transition hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
            >
              <History size={10} className="shrink-0" />
              社區 {communityCount} 筆
            </button>
          )}
          {hasCoords && (
            <span
              title="官方門牌多為區間遮蔽，地圖座標為約略定位"
              className="inline-flex items-center gap-0.5 rounded-md border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400"
            >
              <MapPinOff size={10} className="shrink-0" />
              約略
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {toggleCompare && (
            <button
              type="button"
              onClick={(e) => toggleCompare(item, e)}
              title={isInCompare ? "移出比較" : "加入比較"}
              aria-label={isInCompare ? "移出比較" : "加入比較"}
              className={`rounded-full p-1.5 transition-all ${
                isInCompare
                  ? "bg-coral-500/15 text-coral-600 ring-1 ring-coral-400/40"
                  : "text-slate-300 hover:bg-slate-100 hover:text-coral-500 dark:text-slate-600 dark:hover:bg-slate-800"
              }`}
            >
              <GitCompare size={14} strokeWidth={2.5} />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => toggleFavorite(item, e)}
            aria-label={isFavorite ? "取消收藏" : "加入收藏"}
            className={`rounded-full p-1.5 transition-all ${
              isFavorite
                ? "bg-red-500/10 text-red-500"
                : "text-slate-300 hover:bg-slate-100 hover:text-red-400 dark:text-slate-600 dark:hover:bg-slate-800"
            }`}
          >
            <Heart size={15} className={isFavorite ? "fill-current" : ""} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Main: address + price ── */}
      <div className="mt-2.5 flex min-w-0 items-start gap-3 pl-1">
        <div className="min-w-0 flex-1">
          <time
            dateTime={displayDate}
            className="mb-1 block text-[11px] font-bold tabular-nums tracking-wide text-slate-400 dark:text-slate-500"
          >
            {displayDate}
          </time>
          <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-ink transition-colors group-hover:text-coral-600 dark:text-slate-50 dark:group-hover:text-coral-400 sm:text-sm">
            {item.address}
          </h3>

          {specialTags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              {specialTags.map((tag) => (
                <span
                  key={tag.label}
                  className={`inline-flex items-center gap-0.5 rounded-[4px] border px-1.5 py-0.5 text-[9px] font-black uppercase leading-none tracking-wide shadow-sm ${tag.class}`}
                >
                  <ShieldCheck size={10} />
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
          <div className="flex flex-wrap items-baseline justify-end gap-x-1 gap-y-0.5">
            <span className="text-[10px] font-bold text-slate-400">{appTexts.totalPrice}</span>
            <span className="font-display text-lg font-medium leading-none tracking-tight text-coral-600 tabular-nums dark:text-coral-400 sm:text-xl">
              {formatPrice(item.totalPrice)}
            </span>
          </div>

          {hasParking ? (
            <div className="mt-1 flex max-w-[11rem] flex-col items-end gap-0.5">
              <div className="inline-flex max-w-full flex-wrap items-center justify-end gap-1 rounded-md bg-slate-100/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 ring-1 ring-black/5 dark:bg-slate-800/80 dark:ring-white/5">
                <span className="inline-flex items-center gap-0.5">
                  <Home size={9} />
                  房 {formatPrice((parseFloat(item.totalPrice) - parseFloat(item.parkingPrice!)).toString())}
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="inline-flex items-center gap-0.5">
                  <Car size={9} />
                  車 {formatPrice(item.parkingPrice!)}
                </span>
              </div>
            </div>
          ) : null}

          <div className="mt-0.5 flex flex-wrap items-center justify-end gap-1">
            <span className="text-[11px] font-bold tabular-nums text-slate-400">{unitPriceLabel}</span>
            {showPriceIndicator && (
              <span
                title={`與同區域(${item.district})平均成交單價 ${((avgPrice * 3.30578) / 10000).toFixed(1)} 萬/坪 相比的差異`}
                className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-black leading-none ${
                  priceDiffPercentage >= 0
                    ? "border border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "border border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400"
                }`}
              >
                {priceDiffPercentage >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                <span>{Math.abs(priceDiffPercentage).toFixed(1)}%</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Specs ── */}
      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1 pl-1">
        <span className="inline-flex items-center gap-1 rounded-[6px] bg-indigo-500/10 px-1.5 py-0.5 text-indigo-600 dark:text-indigo-400">
          <Maximize2 className="h-[10px] w-[10px] shrink-0" />
          <span className="text-[10px] font-bold leading-none tabular-nums">
            {item.buildingArea ? (parseFloat(item.buildingArea) * 0.3025).toFixed(2) : "0.00"} 坪
          </span>
        </span>
        {item.floor && (
          <span className="inline-flex max-w-full items-center gap-1 truncate rounded-[6px] bg-teal-500/10 px-1.5 py-0.5 text-teal-600 dark:text-teal-400">
            <Layers className="h-[10px] w-[10px] shrink-0" />
            <span className="truncate text-[10px] font-bold leading-none">
              {item.floor}
              {item.totalFloor ? ` / ${item.totalFloor}` : ""}
            </span>
          </span>
        )}
        {item.rooms && item.rooms !== "0" && (
          <>
            <span className="inline-flex items-center gap-1 rounded-[6px] bg-coral-500/10 px-1.5 py-0.5 text-coral-600 dark:text-coral-400">
              <Bed className="h-[10px] w-[10px] shrink-0" />
              <span className="text-[10px] font-bold leading-none">{item.rooms}</span>
            </span>
            {item.halls && item.halls !== "0" && (
              <span className="inline-flex items-center gap-1 rounded-[6px] bg-amber-500/10 px-1.5 py-0.5 text-amber-600 dark:text-amber-400">
                <Sofa className="h-[10px] w-[10px] shrink-0" />
                <span className="text-[10px] font-bold leading-none">{item.halls}</span>
              </span>
            )}
            {item.bathrooms && item.bathrooms !== "0" && (
              <span className="inline-flex items-center gap-1 rounded-[6px] bg-blue-500/10 px-1.5 py-0.5 text-blue-600 dark:text-blue-400">
                <Bath className="h-[10px] w-[10px] shrink-0" />
                <span className="text-[10px] font-bold leading-none">{item.bathrooms}</span>
              </span>
            )}
          </>
        )}
      </div>

      {/* ── Nearby facilities ── */}
      {(nearestStation || nearestSchool) && (
        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1 pl-1">
          {nearestStation && (
            <span className="inline-flex max-w-full items-center gap-1 truncate rounded-[6px] border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-400">
              <Train className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {nearestStation.tags?.name || "捷運/車站"}
                <span className="ml-1 opacity-70">
                  {minStDist < 1 ? `${Math.round(minStDist * 1000)}m` : `${minStDist.toFixed(1)}km`}
                </span>
              </span>
            </span>
          )}
          {nearestSchool && (
            <span className="inline-flex max-w-full items-center gap-1 truncate rounded-[6px] border border-amber-100 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-400">
              <GraduationCap className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {nearestSchool.tags?.name || "學校"}
                <span className="ml-1 opacity-70">
                  {minScDist < 1 ? `${Math.round(minScDist * 1000)}m` : `${minScDist.toFixed(1)}km`}
                </span>
              </span>
            </span>
          )}
        </div>
      )}

      {/* ── Footer actions ── */}
      <div className="mt-auto flex flex-wrap items-center justify-end gap-1.5 border-t border-slate-200/50 pt-2.5 pl-1 dark:border-slate-800/80">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 rounded-xl border border-slate-200/60 bg-slate-50 px-2.5 text-xs font-bold text-slate-600 shadow-none transition-all hover:bg-slate-100 hover:text-coral-600 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-coral-400"
          onClick={(e) => {
            e.stopPropagation();
            setTrendDistrict(item.district);
          }}
        >
          <TrendingUp className="h-3.5 w-3.5 text-coral-500" />
          <span>區域熱度</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 rounded-xl bg-slate-100 px-3 text-xs font-bold tracking-wide text-slate-700 shadow-none transition-all hover:bg-coral-500 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-coral-500/80 dark:hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem(item);
          }}
        >
          <span>詳情</span>
          <ArrowRight size={12} />
        </Button>
      </div>
    </motion.div>
  );
};
