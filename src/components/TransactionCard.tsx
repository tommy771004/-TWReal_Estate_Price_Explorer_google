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
      initial={{ opacity: 0, scale: 0.96, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2, delay: 0 } }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{
        duration: 0.35,
        ease: [0.2, 0, 0, 1],
        delay: Math.min(idx, 8) * 0.03,
        layout: { type: "spring", bounce: 0.2, duration: 0.5, delay: 0 },
      }}
      key={item.id}
      onClick={() => setSelectedItem(item)}
      className="@container group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[24px] bg-surface-container-low border border-outline-variant/40 p-4 transition-all duration-200 hover:shadow-[var(--md-elevation-2)] hover:border-outline-variant hover:bg-surface-container [content-visibility:auto] [contain-intrinsic-size:auto_220px]"
    >
      {/* ── Top: tags + actions ── */}
      <div className="flex min-w-0 items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <span className="max-w-[6.5rem] truncate rounded-full bg-surface-container-highest px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
            {item.district}
          </span>
          <span className="max-w-[5.5rem] truncate rounded-full bg-secondary-container px-2 py-0.5 text-[11px] font-semibold text-on-secondary-container">
            {buildingTypeLabel}
          </span>
          <span className="max-w-[7rem] truncate rounded-full bg-surface-container-highest px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
            {item.transactionType}
          </span>
          {typeName === "預售屋" && item.buildCase && (
            <span className="max-w-[8rem] truncate rounded-full bg-tertiary-container px-2 py-0.5 text-[11px] font-semibold text-on-tertiary-container">
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
              className="inline-flex max-w-[7.5rem] items-center gap-1 truncate rounded-full border border-primary/20 bg-surface-container-high px-2 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary-container/30"
            >
              <History size={11} className="shrink-0" />
              社區 {communityCount} 筆
            </button>
          )}
          {hasCoords && (
            <span
              title="官方門牌多為區間遮蔽，地圖座標為約略定位"
              className="inline-flex items-center gap-0.5 rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] font-medium text-on-surface-variant/80"
            >
              <MapPinOff size={10} className="shrink-0" />
              約略
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {toggleCompare && (
            <button
              type="button"
              onClick={(e) => toggleCompare(item, e)}
              title={isInCompare ? "移出比較" : "加入比較"}
              aria-label={isInCompare ? "移出比較" : "加入比較"}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                isInCompare
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant/70 hover:bg-on-surface/8 hover:text-on-surface"
              }`}
            >
              <GitCompare size={15} strokeWidth={2.2} />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => toggleFavorite(item, e)}
            aria-label={isFavorite ? "取消收藏" : "加入收藏"}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              isFavorite
                ? "bg-error-container text-error"
                : "text-on-surface-variant/70 hover:bg-on-surface/8 hover:text-error"
            }`}
          >
            <Heart size={15} className={isFavorite ? "fill-current" : ""} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* ── Main: address + price ── */}
      <div className="mt-3 flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <time
            dateTime={displayDate}
            className="mb-1 block text-xs font-medium tabular-nums tracking-wide text-on-surface-variant/70"
          >
            {displayDate}
          </time>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-on-surface transition-colors group-hover:text-primary">
            {item.address}
          </h3>

          {specialTags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              {specialTags.map((tag) => (
                <span
                  key={tag.label}
                  className="inline-flex items-center gap-1 rounded-md bg-error-container px-1.5 py-0.5 text-[10px] font-semibold text-on-error-container"
                >
                  <ShieldCheck size={11} />
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
          <div className="flex flex-wrap items-baseline justify-end gap-x-1">
            <span className="text-xs font-medium text-on-surface-variant">{appTexts.totalPrice}</span>
            <span className="font-display text-xl font-bold leading-none tracking-tight text-primary tabular-nums">
              {formatPrice(item.totalPrice)}
            </span>
          </div>

          {hasParking ? (
            <div className="mt-1 flex max-w-[11rem] flex-col items-end gap-0.5">
              <div className="inline-flex max-w-full flex-wrap items-center justify-end gap-1 rounded-md bg-surface-container-highest px-1.5 py-0.5 text-[10px] font-medium text-on-surface-variant">
                <span className="inline-flex items-center gap-0.5">
                  <Home size={10} />
                  房 {formatPrice((parseFloat(item.totalPrice) - parseFloat(item.parkingPrice!)).toString())}
                </span>
                <span className="text-outline-variant">|</span>
                <span className="inline-flex items-center gap-0.5">
                  <Car size={10} />
                  車 {formatPrice(item.parkingPrice!)}
                </span>
              </div>
            </div>
          ) : null}

          <div className="mt-0.5 flex flex-wrap items-center justify-end gap-1.5">
            <span className="text-xs font-semibold tabular-nums text-on-surface-variant">{unitPriceLabel}</span>
            {showPriceIndicator && (
              <span
                title={`與同區域(${item.district})平均成交單價 ${((avgPrice * 3.30578) / 10000).toFixed(1)} 萬/坪 相比的差異`}
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                  priceDiffPercentage >= 0
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-error-container text-on-error-container"
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
      <div className="mt-3 flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-lg bg-surface-container-highest px-2 py-1 text-on-surface-variant text-[11px] font-medium">
          <Maximize2 className="h-3 w-3 shrink-0 text-primary" />
          <span className="tabular-nums font-semibold">
            {item.buildingArea ? (parseFloat(item.buildingArea) * 0.3025).toFixed(2) : "0.00"} 坪
          </span>
        </span>
        {item.floor && (
          <span className="inline-flex max-w-full items-center gap-1 truncate rounded-lg bg-surface-container-highest px-2 py-1 text-on-surface-variant text-[11px] font-medium">
            <Layers className="h-3 w-3 shrink-0 text-secondary" />
            <span className="truncate">
              {item.floor}
              {item.totalFloor ? ` / ${item.totalFloor}` : ""}
            </span>
          </span>
        )}
        {item.rooms && item.rooms !== "0" && (
          <>
            <span className="inline-flex items-center gap-1 rounded-lg bg-surface-container-highest px-2 py-1 text-on-surface-variant text-[11px] font-medium">
              <Bed className="h-3 w-3 shrink-0 text-tertiary" />
              <span>{item.rooms} 房</span>
            </span>
            {item.halls && item.halls !== "0" && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-surface-container-highest px-2 py-1 text-on-surface-variant text-[11px] font-medium">
                <Sofa className="h-3 w-3 shrink-0 text-on-surface-variant" />
                <span>{item.halls} 廳</span>
              </span>
            )}
            {item.bathrooms && item.bathrooms !== "0" && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-surface-container-highest px-2 py-1 text-on-surface-variant text-[11px] font-medium">
                <Bath className="h-3 w-3 shrink-0 text-on-surface-variant" />
                <span>{item.bathrooms} 衛</span>
              </span>
            )}
          </>
        )}
      </div>

      {/* ── Nearby facilities ── */}
      {(nearestStation || nearestSchool) && (
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
          {nearestStation && (
            <span className="inline-flex max-w-full items-center gap-1 truncate rounded-md bg-secondary-container px-2 py-0.5 text-[11px] font-medium text-on-secondary-container">
              <Train className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {nearestStation.tags?.name || "捷運/車站"}
                <span className="ml-1 opacity-80">
                  {minStDist < 1 ? `${Math.round(minStDist * 1000)}m` : `${minStDist.toFixed(1)}km`}
                </span>
              </span>
            </span>
          )}
          {nearestSchool && (
            <span className="inline-flex max-w-full items-center gap-1 truncate rounded-md bg-tertiary-container px-2 py-0.5 text-[11px] font-medium text-on-tertiary-container">
              <GraduationCap className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {nearestSchool.tags?.name || "學校"}
                <span className="ml-1 opacity-80">
                  {minScDist < 1 ? `${Math.round(minScDist * 1000)}m` : `${minScDist.toFixed(1)}km`}
                </span>
              </span>
            </span>
          )}
        </div>
      )}

      {/* ── Footer actions ── */}
      <div className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant/30 pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 rounded-full border border-outline-variant bg-surface px-3 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setTrendDistrict(item.district);
          }}
        >
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span>區域熱度</span>
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1 rounded-full bg-primary text-on-primary hover:bg-primary/90 px-4 text-xs font-semibold shadow-xs transition-all"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem(item);
          }}
        >
          <span>詳情</span>
          <ArrowRight size={13} />
        </Button>
      </div>
    </motion.div>
  );
};
