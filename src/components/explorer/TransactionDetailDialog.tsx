import React, { Suspense, lazy, type RefObject } from "react";
import { motion } from "motion/react";
import {
  X,
  Home,
  Car,
  Calendar,
  MapPin,
  DollarSign,
  Maximize2,
  Layers,
  Clock,
  Map as MapIcon,
  MapPinOff,
  Building2,
  Bed,
  Sofa,
  Bath,
  Crosshair,
  Building,
  ShieldCheck,
} from "lucide-react";
import { MAX_COMPARE } from "../CompareBar";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "../../types/real-estate";
import {
  formatPrice,
  formatDate,
  getSpecialTags,
  estimateMortgageMonthly,
} from "../../utils/real-estate-helpers";
import { DetailRow } from "../DetailRow";
import { AffiliateChips } from "../AffiliateMarquee";
import {
  AFFILIATE_LINK_REL,
  offersByCategory,
  trackAffiliateEvent,
  useAffiliateOffers,
} from "../../lib/affiliates";
import { modalContainerVariants, modalItemVariants } from "../../constants/app-ui";

const CommunityTrendChart = lazy(() => import("../CommunityTrendChart"));
const TransactionMapPreview = lazy(() =>
  import("../MapViews").then((m) => ({ default: m.TransactionMapPreview }))
);

export type CommunityChartPoint = {
  date: string;
  unitPrice: number;
  totalPrice: number;
  address?: string;
  isCurrent?: boolean;
  id?: string;
  [key: string]: unknown;
};

type Props = {
  selectedItem: Transaction | null;
  onClose: () => void;
  cityName: string;
  typeName: string;
  buildingImages: string[];
  isBuildingImagesLoading: boolean;
  imageSliderRef: RefObject<HTMLDivElement | null>;
  detailShowTopMask: boolean;
  detailShowBottomMask: boolean;
  onDetailShowTopMask: (v: boolean) => void;
  onDetailShowBottomMask: (v: boolean) => void;
  communityItems: Transaction[];
  communityChartData: CommunityChartPoint[];
  mortgageLtv: number;
  mortgageYears: number;
  mortgageRate: number;
  onMortgageLtvChange: (v: number) => void;
  onMortgageYearsChange: (v: number) => void;
  onMortgageRateChange: (v: number) => void;
  compareList: Transaction[];
  toggleCompare: (item: Transaction, e: React.MouseEvent) => void;
  setNearbyFromItem: (item: Transaction) => void;
  focusBuildCase: string | null;
  onFocusBuildCase: (v: string | null | ((prev: string | null) => string | null)) => void;
  onSearch: (q: string) => void;
};

export function TransactionDetailDialog({
  selectedItem,
  onClose,
  cityName,
  typeName,
  buildingImages,
  isBuildingImagesLoading,
  imageSliderRef,
  detailShowTopMask,
  detailShowBottomMask,
  onDetailShowTopMask,
  onDetailShowBottomMask,
  communityItems,
  communityChartData,
  mortgageLtv,
  mortgageYears,
  mortgageRate,
  onMortgageLtvChange,
  onMortgageYearsChange,
  onMortgageRateChange,
  compareList,
  toggleCompare,
  setNearbyFromItem,
  focusBuildCase,
  onFocusBuildCase,
  onSearch,
}: Props) {
  // 貸款夥伴 CTA：原本掛在下方重複的 MortgageCalculatorCta 上，
  // 該區塊移除後改掛在唯一保留的試算區，避免導購入口消失
  const affiliateOffers = useAffiliateOffers();
  const loanPartner = offersByCategory(affiliateOffers, "finance")[0];

  return (
    <>
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && onClose()}>
        <DialogContent showCloseButton={false} className="max-w-[95vw] sm:max-w-4xl w-full p-0 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
          {selectedItem && (
            <motion.div 
              initial={{ y: "40px", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.05,
                delayChildren: 0.05
              }}
              className="flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]"
            >
              {/* Premium Dialog Header */}
              <motion.div variants={modalItemVariants} className="py-4 px-6 sm:py-5 sm:px-8 bg-white/25 dark:bg-slate-950/20 backdrop-blur-2xl border-b border-slate-200/30 dark:border-slate-800/40 relative overflow-hidden shrink-0 z-10 transition-all">
                {/* Decorative background glows */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-coral-500/10 dark:bg-coral-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-coral-500/30 dark:via-coral-500/20 to-transparent" />
                
                {/* Custom Close Button */}
                <button 
                  onClick={() => onClose()}
                  className="absolute top-3.5 right-4 sm:top-5 sm:right-6 w-9 h-9 flex items-center justify-center rounded-full bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700/80 border border-slate-200/40 dark:border-slate-700/40 backdrop-blur-md shadow-sm transition-all z-50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-coral-500/50"
                  title="關閉"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>

                <div className="relative z-10 flex flex-col">
                  <div className="space-y-3 w-full sm:max-w-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                       <div className="flex items-center gap-2">
                         <Badge className="bg-coral-500/10 text-coral-600 dark:bg-coral-500/20 dark:text-coral-300 border-coral-500/20 px-2.5 py-0.5 rounded-full font-bold tracking-widest text-[10px] uppercase shadow-sm backdrop-blur-sm">
                           {selectedItem.district}
                         </Badge>
                       </div>
                       <div className="flex flex-row items-center sm:items-end gap-3 select-text">
                         <div className="flex items-baseline gap-1">
                           <span className="text-slate-500 dark:text-slate-400 text-[9px] uppercase font-black tracking-[0.2em]">登錄價</span>
                           <span className="text-2xl sm:text-3xl font-display font-black text-slate-800 dark:text-slate-100 tracking-tighter drop-shadow-sm leading-none">
                             {formatPrice(selectedItem.totalPrice)}
                           </span>
                         </div>
                         {selectedItem.parkingPrice && parseFloat(selectedItem.parkingPrice) > 0 && (
                            <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 bg-white/60 dark:bg-slate-950/60 px-2 py-0.5 rounded-md backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                              <span className="flex items-center gap-0.5 text-slate-700 dark:text-slate-300"><Home size={10} className="text-slate-400" /> {formatPrice((parseFloat(selectedItem.totalPrice) - parseFloat(selectedItem.parkingPrice)).toString())}</span>
                              <span className="text-slate-300 dark:text-slate-600">|</span>
                              <span className="flex items-center gap-0.5 text-slate-700 dark:text-slate-300"><Car size={10} className="text-slate-400" /> {formatPrice(selectedItem.parkingPrice)}</span>
                            </div>
                         )}
                       </div>
                    </div>
                    
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight leading-snug drop-shadow-sm pr-12 sm:pr-0 select-text">
                      {selectedItem.address}
                    </h2>

                    {getSpecialTags(selectedItem.remarks).length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {getSpecialTags(selectedItem.remarks).map(tag => (
                          <span key={tag.label} className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border leading-none shadow-xs flex items-center gap-1 ${tag.class} bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm`}>
                            <ShieldCheck size={11} />
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] pt-0.5">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium bg-white/60 dark:bg-slate-800/40 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-xs backdrop-blur-sm">
                        <Calendar size={12} className="text-coral-500 drop-shadow-sm" />
                        {formatDate(selectedItem.date)} 交易
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium bg-white/60 dark:bg-slate-800/40 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-xs backdrop-blur-sm">
                        <MapPin size={12} className="text-blue-500 drop-shadow-sm" />
                        {cityName}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
                {/* Top Liquid Glass Fade Mask */}
                <div 
                  className={`pointer-events-none absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 to-transparent z-25 backdrop-blur-[1px] transition-opacity duration-300 ${
                    detailShowTopMask ? "opacity-100" : "opacity-0"
                  }`}
                />

                <div 
                  onScroll={(e) => {
                    const target = e.currentTarget;
                    onDetailShowTopMask(target.scrollTop > 5);
                    onDetailShowBottomMask(target.scrollHeight - target.clientHeight - target.scrollTop > 5);
                  }}
                  className="flex-1 overflow-y-auto scrollbar-hide"
                >
                  <motion.div variants={modalContainerVariants} initial="hidden" animate="show" className="p-4 sm:p-10 space-y-6 sm:space-y-10">
                  {/* Building Images Slider */}
                  {isBuildingImagesLoading ? (
                    <motion.div variants={modalItemVariants} className="w-full h-48 sm:h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
                       <span className="text-slate-400 font-bold text-sm tracking-widest uppercase">載入外觀圖片中...</span>
                    </motion.div>
                  ) : buildingImages.length > 0 ? (
                    <motion.div variants={modalItemVariants} className="relative w-full overflow-hidden rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                      <div ref={imageSliderRef} className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide bg-slate-100/50 dark:bg-slate-900/50 p-2">
                        {buildingImages.map((src, idx) => (
                           <div key={idx} className="snap-center shrink-0 w-[85%] sm:w-[60%] first:ml-0 last:mr-0 rounded-xl overflow-hidden shadow-sm relative group bg-slate-200 dark:bg-slate-800">
                             <img
                               src={src}
                               alt={`${selectedItem.address} 建物外觀照片`}
                               width="1200"
                               height="800"
                               loading="lazy"
                               decoding="async"
                               className="w-full h-48 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                               referrerPolicy="no-referrer"
                             />
                             <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-xl pointer-events-none" />
                           </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}

                  {/* High Density Stats Grid */}
                  <motion.div variants={modalItemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { icon: <DollarSign size={20} />, label: "單價/坪", value: selectedItem.unitPrice ? `${(parseFloat(selectedItem.unitPrice) * 3.30578 / 10000).toFixed(1)} 萬` : "-", sub: "實價登錄單價", color: "text-coral-500", bg: "bg-coral-500/5" },
                      { icon: <Maximize2 size={20} />, label: "建物面積", value: `${selectedItem.buildingArea || selectedItem.area || "0"} ㎡`, sub: `約 ${(parseFloat(selectedItem.buildingArea || selectedItem.area || "0") * 0.3025).toFixed(2)} 坪`, color: "text-amber-500", bg: "bg-amber-500/5" },
                      { icon: <Layers size={20} />, label: "移轉層次", value: selectedItem.floor ? `${selectedItem.floor}F` : "土地", sub: `總樓層 ${selectedItem.totalFloor || "-"}F`, color: "text-purple-500", bg: "bg-purple-500/5" },
                      { icon: <Clock size={20} />, label: "屋齡", value: (() => {
                        if (!selectedItem.completionDate) return "新成屋";
                        const compY = parseInt(selectedItem.completionDate.substring(0, 3));
                        if (isNaN(compY)) return "新成屋";
                        const currentY = new Date().getFullYear() - 1911;
                        return `${currentY - compY} 年`;
                      })(), sub: "建屋完工至今", color: "text-amber-500", bg: "bg-amber-500/5" }
                    ].map((stat, i) => (
                      <div 
                        key={i}
                        className={`liquid-glass-input p-5 sm:p-6 rounded-[2rem] border-white/40 dark:border-white/10 relative overflow-hidden group transition-all hover:scale-101 hover:-translate-y-0.5`}
                      >
                         <div className={`absolute -right-2 -top-2 p-6 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color} rotate-12`}>{stat.icon}</div>
                         <div className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2">
                           <div className={`w-6 h-6 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
                           {stat.label}
                         </div>
                         <div className="text-2xl font-bold text-ink dark:text-white tracking-tight">{stat.value}</div>
                         {stat.sub && <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-2 opacity-60 tracking-wide">{stat.sub}</div>}
                      </div>
                    ))}
                  </motion.div>

                {/* Price Split Visualization */}
                  {selectedItem.parkingPrice && parseFloat(selectedItem.parkingPrice) > 0 && (
                    <motion.div variants={modalItemVariants} className="space-y-3">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm flex items-center gap-2">
                        <DollarSign size={12} className="text-emerald-500" /> 真實房屋單價拆算
                      </h3>
                      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 pointer-events-none">
                          <Car size={120} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 relative z-10">
                          {/* House Calculation */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">扣車位後總價</span>
                            <div className="text-2xl font-black text-ink dark:text-white tracking-tight flex items-baseline gap-1">
                              {formatPrice((parseFloat(selectedItem.totalPrice) - parseFloat(selectedItem.parkingPrice)).toString())}
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                              總價 {formatPrice(selectedItem.totalPrice)} - 車位 {formatPrice(selectedItem.parkingPrice)}
                            </span>
                          </div>

                          {/* Area Calculation */}
                          <div className="flex flex-col gap-1 sm:pl-4 sm:border-l sm:border-slate-200/60 dark:sm:border-slate-800">
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">扣車位後坪數</span>
                            <div className="text-2xl font-black text-ink dark:text-white tracking-tight">
                              {((parseFloat(selectedItem.buildingArea) - parseFloat(selectedItem.parkingArea || "0")) * 0.3025).toFixed(1)} <span className="text-lg opacity-60">坪</span>
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                              總坪 {(parseFloat(selectedItem.buildingArea) * 0.3025).toFixed(1)} - 車位 {(parseFloat(selectedItem.parkingArea || "0") * 0.3025).toFixed(1)}
                            </span>
                          </div>

                          {/* Final Unit Price */}
                          <div className="flex flex-col gap-1 sm:pl-4 sm:border-l sm:border-emerald-500/20">
                            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500 mb-1">真實房屋單價</span>
                            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                              {(() => {
                                const houseTotal = parseFloat(selectedItem.totalPrice) - parseFloat(selectedItem.parkingPrice);
                                const houseArea = parseFloat(selectedItem.buildingArea) - parseFloat(selectedItem.parkingArea || "0");
                                if (houseTotal > 0 && houseArea > 0) {
                                  const realUnitP = houseTotal / houseArea; // 元/平方米
                                  return (realUnitP * 3.30578 / 10000).toFixed(1);
                                }
                                return "-";
                              })()} <span className="text-base">萬/坪</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600/60 dark:text-emerald-400/60">
                              排除車位干擾的真實單價
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Map Preview */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm flex items-center gap-2">
                       <MapIcon size={12} className="text-coral-500" /> 地理位置
                    </h3>
                    <div className="mx-0 flex items-start gap-2 rounded-xl border border-amber-200/60 bg-amber-50/80 px-3 py-2 text-[11px] font-bold leading-relaxed text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                      <MapPinOff size={14} className="mt-0.5 shrink-0" />
                      <span>
                        官方開放資料門牌多為區間遮蔽（例如「中正路 1～30 號」），地圖座標為<strong className="mx-0.5">約略定位</strong>，實際位置請以卡片門牌為準。
                      </span>
                    </div>
                    <Suspense fallback={<Skeleton className="h-[160px] sm:h-[250px] rounded-[1.5rem] bg-white/40 dark:bg-slate-900/40" />}>
                      <TransactionMapPreview selectedItem={selectedItem} />
                    </Suspense>
                  </div>

                  {/* 簡易房貸月付試算（等額本息估算，非正式核貸） */}
                  {typeName !== "租賃" && parseFloat(selectedItem.totalPrice || "0") > 0 && (
                    <motion.div variants={modalItemVariants} className="space-y-3">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm flex items-center gap-2">
                        <DollarSign size={12} className="text-emerald-500" /> 簡易房貸月付試算
                      </h3>
                      <div className="rounded-[1.5rem] border border-slate-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/40 sm:p-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">貸款成數</label>
                            <div className="flex flex-wrap gap-1.5">
                              {[0.7, 0.8, 0.9].map((v) => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => onMortgageLtvChange(v)}
                                  className={`h-8 rounded-lg border px-2.5 text-xs font-bold transition ${
                                    mortgageLtv === v
                                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                      : "border-slate-200 bg-white/70 text-slate-500 dark:border-slate-700 dark:bg-slate-900/50"
                                  }`}
                                >
                                  {Math.round(v * 100)}%
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">年期</label>
                            <div className="flex flex-wrap gap-1.5">
                              {[20, 30, 40].map((y) => (
                                <button
                                  key={y}
                                  type="button"
                                  onClick={() => onMortgageYearsChange(y)}
                                  className={`h-8 rounded-lg border px-2.5 text-xs font-bold transition ${
                                    mortgageYears === y
                                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                      : "border-slate-200 bg-white/70 text-slate-500 dark:border-slate-700 dark:bg-slate-900/50"
                                  }`}
                                >
                                  {y} 年
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">年利率 %</label>
                            <input
                              type="number"
                              step="0.05"
                              min="0"
                              max="15"
                              value={mortgageRate}
                              onChange={(e) => onMortgageRateChange(parseFloat(e.target.value) || 0)}
                              className="h-9 w-full rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-bold text-ink outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950/40 dark:text-white"
                            />
                          </div>
                        </div>
                        {(() => {
                          const total = parseFloat(selectedItem.totalPrice || "0");
                          const monthly = estimateMortgageMonthly(total, mortgageLtv, mortgageRate, mortgageYears);
                          const loanAmt = total * mortgageLtv;
                          return (
                            <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-slate-200/60 pt-4 dark:border-slate-800">
                              <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">估算月付</div>
                                <div className="mt-1 font-display text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                                  {monthly != null
                                    ? `${Math.round(monthly).toLocaleString("zh-TW")} 元`
                                    : "—"}
                                </div>
                                <div className="mt-1 text-[11px] font-bold text-slate-500">
                                  貸款約 {formatPrice(String(loanAmt))} · 等額本息 · 僅供參考
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <a
                                  href="/guides/mortgage-calculator/"
                                  className="text-[11px] font-bold text-coral-600 underline-offset-2 hover:underline dark:text-coral-400"
                                >
                                  房貸指南 →
                                </a>
                                {loanPartner && (
                                  <a
                                    data-affiliate-id={loanPartner.id}
                                    href={loanPartner.url}
                                    target="_blank"
                                    rel={AFFILIATE_LINK_REL}
                                    onClick={() =>
                                      trackAffiliateEvent("affiliate_click", loanPartner, "mortgage_cta")
                                    }
                                    className="inline-flex items-center justify-center rounded-xl bg-coral-600 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-coral-700"
                                  >
                                    {loanPartner.ctaLabel} →
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}

                  {/* Details Grid */}
                  <div className="space-y-6">
                    <div className="space-y-3 relative">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm">土地資訊</h3>
                      <div className="grid grid-cols-2 gap-px bg-slate-200/40 dark:bg-slate-800/50 rounded-[1.5rem] overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <DetailRow label="土地使用分區" value={selectedItem.zoning || "-"} />
                        <DetailRow label="土地移轉面積" value={selectedItem.area ? `${selectedItem.area} ㎡ (約 ${(parseFloat(selectedItem.area) * 0.3025).toFixed(2)} 坪)` : "-"} />
                      </div>
                    </div>

                    {(selectedItem.buildingType || selectedItem.mainUse || selectedItem.buildCase) ? (
                      <div className="space-y-3 relative">
                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm">建物資訊</h3>
                        <div className="grid grid-cols-2 gap-px bg-slate-200/40 dark:bg-slate-800/50 rounded-[1.5rem] overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                          {selectedItem.buildCase && <DetailRow label="建案名稱" value={selectedItem.buildCase} fullWidth />}
                          <DetailRow label="建物型態" value={selectedItem.buildingType || "無"} />
                          <DetailRow label="移轉層次" value={selectedItem.floor ? `${selectedItem.floor} / ${selectedItem.totalFloor}` : "-"} />
                          <DetailRow label="主要用途" value={selectedItem.mainUse || "-"} />
                          <DetailRow label="主要建材" value={selectedItem.material || "-"} />
                          <DetailRow label="建築完成日" value={formatDate(selectedItem.completionDate)} />
                          <DetailRow label="管理組織" value={selectedItem.hasManagement || "-"} />
                          <DetailRow label="現況格局" value={
                            (selectedItem.rooms || selectedItem.halls || selectedItem.bathrooms) ? (
                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                {selectedItem.rooms && selectedItem.rooms !== '0' && <span className="flex items-center gap-1 bg-coral-500/10 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 px-2 py-0.5 rounded-full text-[10px] font-bold"><Bed className="w-3 h-3" /> {selectedItem.rooms} <span className="text-[9px] opacity-70">房</span></span>}
                                {selectedItem.halls && selectedItem.halls !== '0' && <span className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold"><Sofa className="w-3 h-3" /> {selectedItem.halls} <span className="text-[9px] opacity-70">廳</span></span>}
                                {selectedItem.bathrooms && selectedItem.bathrooms !== '0' && <span className="flex items-center gap-1 bg-blue-500/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold"><Bath className="w-3 h-3" /> {selectedItem.bathrooms} <span className="text-[9px] opacity-70">衛</span></span>}
                              </div>
                            ) : "-"
                          } fullWidth />
                        </div>
                      </div>
                    ) : null}

                    {selectedItem.parkingType ? (
                      <div className="space-y-3 relative">
                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm">車位資訊</h3>
                        <div className="grid grid-cols-2 gap-px bg-slate-200/40 dark:bg-slate-800/50 rounded-[1.5rem] overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                          <DetailRow label="車位類別" value={selectedItem.parkingType} />
                          <DetailRow label="車位總價" value={formatPrice(selectedItem.parkingPrice)} />
                          <DetailRow label="車位移轉面積" value={selectedItem.parkingArea ? `${selectedItem.parkingArea} ㎡ (約 ${(parseFloat(selectedItem.parkingArea) * 0.3025).toFixed(2)} 坪)` : "-"} />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Community Overview */}
                  {communityItems.length > 0 && communityChartData.length > 1 && (
                    <div className="space-y-3 relative pb-12">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm flex items-center gap-2">
                         <Building2 size={12} className="text-blue-500" /> 同社區/建案歷史紀錄 ({selectedItem.buildCase || '同路段相近建築'})
                      </h3>
                      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 shadow-sm overflow-hidden flex flex-col gap-6">
                         
                         {/* Header Stats */}
                         <div className="flex flex-wrap items-center justify-between gap-4">
                           <div className="flex flex-col gap-1">
                             <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">目前顯示紀錄</span>
                             <span className="text-2xl font-black text-ink dark:text-white leading-none">{communityChartData.length} <span className="text-sm font-bold text-slate-500">筆</span></span>
                           </div>
                           <div className="flex items-center gap-4">
                             <div className="flex flex-col items-end gap-1">
                               <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">最高單價</span>
                               <span className="text-sm font-black text-coral-600 dark:text-coral-400">{Math.max(...communityChartData.map(c => c.unitPrice)).toFixed(1)} <span className="text-[10px]">萬/坪</span></span>
                             </div>
                             <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/50" />
                             <div className="flex flex-col items-end gap-1">
                               <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">最低單價</span>
                               <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{Math.min(...communityChartData.map(c => c.unitPrice)).toFixed(1)} <span className="text-[10px]">萬/坪</span></span>
                             </div>
                           </div>
                         </div>

                         {/* Trend Chart */}
                         <div className="h-[180px] w-full -max-w-xs sm:max-w-none mt-2">
                            <Suspense fallback={<Skeleton className="h-full w-full rounded-2xl" />}>
                              <CommunityTrendChart data={communityChartData} />
                            </Suspense>
                         </div>
                         
                         {/* List of records */}
                         <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-slate-200/50 dark:border-slate-800">
                           <span className="text-[10px] font-bold text-slate-400 mb-1">近期成交明細</span>
                           <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 [scrollbar-width:thin]">
                             {[...communityChartData].reverse().map((record, i) => (
                               <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${record.isCurrent ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' : 'bg-white/40 dark:bg-slate-900/40 border-transparent hover:border-slate-200 dark:hover:border-slate-800'}`}>
                                 <div className="flex flex-col gap-0.5">
                                   <div className="flex items-center gap-2">
                                     <span className="text-xs font-bold text-slate-500">{record.date}</span>
                                     {record.isCurrent && <span className="px-1.5 py-[1px] bg-blue-500 text-white rounded text-[8px] font-bold">本戶</span>}
                                   </div>
                                   <span className="text-sm font-bold text-ink dark:text-slate-200 truncate max-w-[140px] sm:max-w-[200px]">{record.address}</span>
                                 </div>
                                 <div className="flex items-end flex-col gap-0.5 shrink-0">
                                   <span className="text-sm font-black text-ink dark:text-white leading-none">{record.unitPrice} <span className="text-[10px] font-bold text-slate-400">萬/坪</span></span>
                                   <span className="text-[10px] font-bold text-slate-500">{formatPrice(record.totalPrice.toString())} | {record.floor}</span>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                      </div>
                    </div>
                  )}

                  {/* Remarks */}
                  {selectedItem.remarks && (
                    <motion.div variants={modalItemVariants} className="space-y-3">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm">備註</h3>
                      <div className="liquid-glass-input p-5 rounded-[1.5rem] text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-none prose prose-sm shadow-inner italic">
                         "{selectedItem.remarks}"
                      </div>
                    </motion.div>
                  )}

                  {/* 比較 / 附近 / 建案聚焦 */}
                  <motion.div variants={modalItemVariants} className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className={`rounded-xl text-xs font-bold ${
                        compareList.some((c) => c.id === selectedItem.id)
                          ? "border-coral-400/50 bg-coral-500/10 text-coral-600"
                          : ""
                      }`}
                      onClick={(e) => toggleCompare(selectedItem, e)}
                    >
                      {compareList.some((c) => c.id === selectedItem.id)
                        ? "已在比較清單（點擊移除）"
                        : `加入比較（${compareList.length}/${MAX_COMPARE}）`}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl text-xs font-bold"
                      onClick={() => setNearbyFromItem(selectedItem)}
                    >
                      <Crosshair size={14} className="mr-1.5" />
                      以此為中心找附近
                    </Button>
                    {selectedItem.buildCase && (
                      <Button
                        type="button"
                        variant="outline"
                        className={`rounded-xl text-xs font-bold ${
                          focusBuildCase === selectedItem.buildCase
                            ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : ""
                        }`}
                        onClick={() => {
                          if (focusBuildCase === selectedItem.buildCase) {
                            onFocusBuildCase(null);
                          } else {
                            onFocusBuildCase(selectedItem.buildCase || null);
                            onSearch(selectedItem.buildCase || "");
                            onClose();
                          }
                        }}
                      >
                        <Building size={14} className="mr-1.5" />
                        {focusBuildCase === selectedItem.buildCase ? "取消只看此建案" : "只看此建案"}
                      </Button>
                    )}
                  </motion.div>

                  {/* 情境式導購：看完物件後的家具/家電/居家推薦（僅在設定連結時顯示） */}
                  <motion.div variants={modalItemVariants}>
                    <AffiliateChips title="入手這間房後，順手準備" />
                  </motion.div>
                </motion.div>
                
                {/* Bottom Liquid Glass Fade Mask */}
                <div 
                  className={`pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 to-transparent z-25 backdrop-blur-[1px] transition-opacity duration-300 ${
                    detailShowBottomMask ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </div>

              <div className="py-3 px-6 sm:py-4 sm:px-8 border-t border-slate-200/30 dark:border-slate-800/40 bg-white/25 dark:bg-slate-950/20 backdrop-blur-2xl flex justify-end shrink-0 z-10 transition-all">
                <Button 
                  onClick={() => onClose()}
                  variant="outline"
                  className="rounded-xl px-8 h-10 liquid-glass-button-primary shadow-lg border-white/10"
                >
                  確認並關閉
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
