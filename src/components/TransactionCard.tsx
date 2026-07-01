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
  ArrowRight
} from "lucide-react";
import { Transaction, HistoryCounts } from "../types/real-estate";
import { 
  formatDate, 
  formatPrice, 
  getSpecialTags 
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
}) => {
  // Nearest facilities calculation
  let nearestStation: any = null;
  let nearestSchool: any = null;
  let minStDist = Infinity;
  let minScDist = Infinity;

  const itemLat = typeof item.lat === "string" ? parseFloat(item.lat) : item.lat;
  const itemLng = typeof item.lng === "string" ? parseFloat(item.lng) : item.lng;

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

  // History presence check
  let hasHistory = false;
  if (item.buildCase) {
    hasHistory = (historyCounts.buildCaseMap[item.buildCase] || 0) > 1;
  } else {
    const baseAddressMatch = item.address.match(/(.+?[路街道巷弄號])/);
    if (baseAddressMatch && baseAddressMatch[1] && baseAddressMatch[1].length >= 3) {
      const baseAddr = baseAddressMatch[1];
      const key = `${item.district}_${baseAddr}_${item.buildingType}`;
      hasHistory = (historyCounts.addressMap[key] || 0) > 1;
    }
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 30, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(5px)", transition: { duration: 0.2, delay: 0 } }}
      whileHover={{ y: -4, scale: 1.01, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min(idx, 8) * 0.04,
        layout: { type: "spring", bounce: 0.2, duration: 0.6, delay: 0 },
      }}
      key={item.id}
      onClick={() => setSelectedItem(item)}
      className="group relative liquid-glass-panel rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 cursor-pointer overflow-hidden ring-1 ring-black/5 dark:ring-white/10 hover:border-coral-500/30 dark:hover:border-coral-500/30 transition-all duration-300"
    >
      {/* Interactive Left Indicator line */}
      <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b from-coral-400 to-coral-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_12px_rgba(237,111,92,0.8)]" />

      <button
        onClick={(e) => toggleFavorite(item, e)}
        className={`absolute top-2 right-2 sm:top-2 sm:right-2 p-1.5 rounded-full transition-all z-10 ${
          isFavorite
            ? "text-red-500 bg-red-500/10"
            : "text-slate-300 dark:text-slate-600 hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <Heart size={16} className={isFavorite ? "fill-current" : ""} strokeWidth={2.5} />
      </button>

      {/* Content Grid */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-[70px_minmax(0,1fr)_minmax(120px,auto)] gap-2 sm:gap-4 items-center pl-1 sm:pl-2 w-full min-w-0">
        {/* Date Block */}
        <div className="flex sm:flex-col items-center sm:items-start justify-between border-b sm:border-y-0 border-slate-200/50 dark:border-slate-800 pb-1.5 sm:pb-0">
          <div className="text-lg sm:text-xl leading-none font-display font-medium text-ink/80 dark:text-white/80 tracking-tight">
            {formatDate(item.date).replace(/-/g, ".")}
          </div>
        </div>

        {/* Info Tags & Address */}
        <div className="flex flex-col justify-center items-start sm:items-center min-w-0 py-0.5">
          <div className="flex flex-wrap items-center justify-start sm:justify-center gap-1 mb-1 sm:mb-2.5 overflow-hidden max-h-[40px] sm:max-h-[20px]">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold tracking-widest uppercase border border-slate-200/60 dark:border-slate-700/60 shadow-sm leading-none shrink-0 truncate max-w-[80px]">
              {item.district}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 text-[10px] font-bold tracking-widest uppercase border border-coral-100 dark:border-coral-500/20 shadow-sm leading-none shrink-0 truncate max-w-[60px]">
              {item.buildingType.split("(")[0] || "土地"}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold tracking-widest uppercase border border-amber-100 dark:border-amber-500/20 shadow-sm leading-none shrink-0 truncate max-w-[80px]">
              {item.transactionType}
            </span>
            {typeName === "預售屋" && item.buildCase && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-widest uppercase border border-emerald-100 dark:border-emerald-500/20 shadow-sm leading-none truncate max-w-[120px] shrink-0">
                建案: {item.buildCase}
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-ink dark:text-slate-50 truncate group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors leading-snug w-full text-left sm:text-center">
            {item.address}
          </h3>

          {getSpecialTags(item.remarks).length > 0 && (
            <div className="flex flex-wrap items-center justify-start sm:justify-center gap-1 mt-1 sm:mt-2">
              {getSpecialTags(item.remarks).map((tag) => (
                <span
                  key={tag.label}
                  className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-black tracking-widest uppercase border leading-none shadow-sm flex items-center gap-1 ${tag.class}`}
                >
                  <ShieldCheck size={10} />
                  {tag.label}
                </span>
              ))}
            </div>
          )}

          <div className="text-[11px] font-bold mt-1 sm:mt-2.5 flex flex-wrap items-center justify-start sm:justify-center gap-1.5">
            <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-[6px]">
              <Maximize2 className="w-[10px] h-[10px]" />{" "}
              <span className="text-[10px] font-bold leading-none">
                {item.buildingArea ? (parseFloat(item.buildingArea) * 0.3025).toFixed(2) : "0.00"} 坪
              </span>
            </span>
            {item.floor && (
              <span className="flex items-center gap-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded-[6px]">
                <Layers className="w-[10px] h-[10px]" />{" "}
                <span className="text-[10px] font-bold leading-none">
                  {item.floor}
                  {item.totalFloor ? ` / ${item.totalFloor}` : ""}
                </span>
              </span>
            )}
            {item.rooms && item.rooms !== "0" && (
              <>
                <div className="flex items-center justify-start sm:justify-center gap-1">
                  <span className="flex items-center gap-1 bg-coral-500/10 text-coral-600 dark:text-coral-400 px-1.5 py-0.5 rounded-[6px]">
                    <Bed className="w-[10px] h-[10px]" />{" "}
                    <span className="text-[10px] font-bold leading-none">{item.rooms}</span>
                  </span>
                  {item.halls && item.halls !== "0" && (
                    <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-[6px]">
                      <Sofa className="w-[10px] h-[10px]" />{" "}
                      <span className="text-[10px] font-bold leading-none">{item.halls}</span>
                    </span>
                  )}
                  {item.bathrooms && item.bathrooms !== "0" && (
                    <span className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-[6px]">
                      <Bath className="w-[10px] h-[10px]" />{" "}
                      <span className="text-[10px] font-bold leading-none">{item.bathrooms}</span>
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {(nearestStation || nearestSchool) && (
            <div className="text-[10px] font-bold mt-1 sm:mt-2 flex flex-wrap items-center justify-start sm:justify-center gap-1.5">
              {nearestStation && (
                <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-[6px] border border-blue-100 dark:border-blue-800/30">
                  <Train className="w-3 h-3" />
                  <span>
                    {nearestStation.tags?.name || "捷運/車站"}
                    <span className="ml-1 opacity-70">
                      {minStDist < 1 ? `${Math.round(minStDist * 1000)}m` : `${minStDist.toFixed(1)}km`}
                    </span>
                  </span>
                </span>
              )}
              {nearestSchool && (
                <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-[6px] border border-amber-100 dark:border-amber-800/30">
                  <GraduationCap className="w-3 h-3" />
                  <span>
                    {nearestSchool.tags?.name || "學校"}
                    <span className="ml-1 opacity-70">
                      {minScDist < 1 ? `${Math.round(minScDist * 1000)}m` : `${minScDist.toFixed(1)}km`}
                    </span>
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price Block */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-200/50 dark:border-slate-800 pt-2 sm:pt-0 pl-1 sm:pl-4 sm:pr-8 mt-1.5 sm:mt-0 relative sm:h-full min-w-0 gap-1.5 shrink-0">
          <div className="flex flex-row sm:flex-col items-baseline sm:items-end sm:flex-1 sm:justify-center gap-2 sm:gap-1 min-w-0 flex-wrap">
            <div className="flex items-baseline gap-1.5 sm:gap-1.5 order-2 sm:order-1 shrink-0 overflow-hidden">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">{appTexts.totalPrice}</span>
              <span className="text-lg sm:text-2xl leading-none font-display font-medium text-coral-600 dark:text-coral-400 tracking-tight truncate">
                {formatPrice(item.totalPrice)}
              </span>
            </div>
            {item.parkingPrice && parseFloat(item.parkingPrice) > 0 ? (
              <div className="flex flex-col items-end gap-0.5 order-1 sm:order-2 shrink-0 truncate max-w-full">
                <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Home size={10} /> 房{" "}
                    {formatPrice((parseFloat(item.totalPrice) - parseFloat(item.parkingPrice)).toString())}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Car size={10} /> 車 {formatPrice(item.parkingPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1.5 w-full mt-1">
                  <div className="text-xs font-bold text-slate-400 truncate text-right">
                    {item.unitPrice ? `${(parseFloat(item.unitPrice) * 3.30578 / 10000).toFixed(1)} 萬/坪` : "-"}
                  </div>
                  {showPriceIndicator && (
                    <span
                      title={`與同區域(${item.district})平均成交單價 ${(avgPrice * 3.30578 / 10000).toFixed(1)} 萬/坪 相比的差異`}
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black leading-none ${
                        priceDiffPercentage >= 0
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                          : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"
                      }`}
                    >
                      {priceDiffPercentage >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      <span>{Math.abs(priceDiffPercentage).toFixed(1)}%</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs font-bold text-slate-400 sm:mt-0.5 order-1 sm:order-2 shrink-0 truncate max-w-full flex items-center justify-end gap-1.5">
                <span>{item.unitPrice ? `${(parseFloat(item.unitPrice) * 3.30578 / 10000).toFixed(1)} 萬/坪` : "-"}</span>
                {showPriceIndicator && (
                  <span
                    title={`與同區域(${item.district})平均成交單價 ${(avgPrice * 3.30578 / 10000).toFixed(1)} 萬/坪 相比的差異`}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black leading-none ${
                      priceDiffPercentage >= 0
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                        : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"
                    }`}
                  >
                    {priceDiffPercentage >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    <span>{Math.abs(priceDiffPercentage).toFixed(1)}%</span>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 ml-auto sm:ml-0 sm:self-end self-center flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-coral-600 dark:hover:text-coral-400 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                setTrendDistrict(item.district);
              }}
            >
              <TrendingUp className="w-3.5 h-3.5 text-coral-500" />
              <span>區域熱度</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-4 text-xs bg-slate-100 hover:bg-coral-500 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-coral-500/80 dark:hover:text-white rounded-xl font-bold tracking-widest uppercase transition-all shadow-sm flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem(item);
              }}
            >
              <span>詳情</span>
              <ArrowRight size={12} className="ml-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
