import React, { Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Filter,
  X,
  List,
  Table2,
  BarChart3,
  Map as MapIcon,
  Compass,
  Database,
  MapPinOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TransactionCard } from "../TransactionCard";
import { ResultDeltaBanner } from "../ResultDeltaBanner";
import { GeocodeProgress } from "../GeocodeProgress";
import { PinnedKpiCompare } from "../PinnedKpiCompare";
import { AffiliateMarquee } from "../AffiliateMarquee";

import {
  getDefaultPeriod,
  formatPeriodLabel,
  isDefaultPeriod,
  formatPrice,
  formatDate,
} from "../../utils/real-estate-helpers";
import { useExplorerUi } from "./ExplorerUiContext";
import { SORT_OPTIONS, type SortOptionValue } from "../../constants/filterLabels";

const ResultsCharts = React.lazy(() => import("../ResultsCharts"));
const ResultsMap = React.lazy(() => import("../MapViews"));

function sortConfigFromValue(value: SortOptionValue) {
  if (value === "default") return null;
  const [key, direction] = value.split("-");
  return { key: key as "date" | "totalPrice" | "unitPrice", direction: direction as "asc" | "desc" };
}

export function ResultsWorkspace() {
  /** 地圖液態玻璃懸浮：預設收合 */
  const [mapPeekOpen, setMapPeekOpen] = React.useState(false);
  const {
    cityName,
    typeName,
    district,
    setDistrict,
    search,
    setSearch,
    period,
    setPeriod,
    unitPrice,
    setUnitPrice,
    area,
    setArea,
    age,
    setAge,
    roomsMin,
    setRoomsMin,
    hasManagement,
    setHasManagement,
    parkingFilter,
    setParkingFilter,
    excludeSpecial,
    totalPriceMaxWan,
    setTotalPriceMaxWan,
    nearbyKm,
    setNearbyKm,
    setNearbyAnchor,
    focusBuildCase,
    setFocusBuildCase,
    loading,
    robotStatus,
    appTexts,
    viewMode,
    setViewMode,
    data,
    filteredData,
    paginatedData,
    error,
    fetchData,
    currentPage,
    setCurrentPage,
    totalPages,
    sortConfig,
    setSortConfig,
    resultsContainerRef,
    pinnedKpis,
    setPinnedKpis,
    priceDistribution,
    priceTrend,
    aggregatedPreSaleData,
    showChartsMobile,
    setShowChartsMobile,
    resultDelta,
    setResultDelta,
    isGeocoding,
    geocodedCount,
    totalToGeocode,
    districtAveragePrices,
    historyCounts,
    globalFacilities,
    favorites,
    toggleFavorite,
    compareList,
    toggleCompare,
    setSelectedItem,
    setTrendDistrict,
    mapLayer,
    setMapLayer,
    showFacilities,
    setShowFacilities,
  } = useExplorerUi();

  /** sortConfig <-> 下拉值（單一來源，避免兩處各自判斷方向） */
  const sortValue: SortOptionValue = !sortConfig
    ? "default"
    : (`${sortConfig.key}-${sortConfig.direction}` as SortOptionValue);

  /** 空狀態：是否有任何「會讓結果變少」的篩選可清 */
  const hasNarrowingFilters = Boolean(
    unitPrice.min || unitPrice.max || area.min || area.max || age.min || age.max ||
    roomsMin || hasManagement !== "any" || parkingFilter !== "any" ||
    totalPriceMaxWan || nearbyKm != null || focusBuildCase || !excludeSpecial
  );

  const clearNarrowingFilters = () => {
    setUnitPrice({ min: "", max: "", unit: "1" });
    setArea({ min: "", max: "", unit: "2" });
    setAge({ min: "", max: "" });
    setRoomsMin("");
    setHasManagement("any");
    setParkingFilter("any");
    setTotalPriceMaxWan("");
    setNearbyKm(null);
    setNearbyAnchor(null);
    setFocusBuildCase(null);
  };

  return (
    <>
              {/* Content */}
              <div ref={resultsContainerRef} className="relative z-20 flex w-full flex-1 flex-none flex-col px-0 pb-12 sm:px-6">
                <div
                  className={`mx-auto grid w-full max-w-[1600px] gap-4 ${
                    pinnedKpis.length > 0
                      ? "lg:grid-cols-[minmax(0,1fr)_320px]"
                      : "grid-cols-1"
                  }`}
                >
                <div className="relative mt-0 flex w-full flex-1 flex-col overflow-hidden rounded-t-none border-b-0 shadow-none liquid-glass sm:mt-4 sm:rounded-[2rem]">
                  <div className="relative flex items-center justify-between gap-2 border-b border-slate-200/80 bg-white px-3 py-2.5 dark:border-slate-800/80 dark:bg-slate-900 sm:px-5">
                    <div className="absolute inset-y-0 left-0 w-1 bg-coral-500" />
                    <div className="relative z-10 flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-coral-500/10 bg-coral-500/10">
                        <Filter className="h-4 w-4 text-coral-600 dark:text-coral-400" />
                      </div>
                      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink dark:text-white">
                          搜尋結果
                        </span>
                        <span className="truncate text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          目前找到 {filteredData.length.toLocaleString()} 筆
                          <span className="mx-1 text-slate-300 dark:text-slate-600">·</span>
                          {formatPeriodLabel(period)}
                        </span>
                      </div>
                    </div>
                    <div className="relative z-10 flex shrink-0 items-center rounded-lg border border-white/40 bg-white/40 p-0.5 dark:border-white/10 dark:bg-white/5">
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-bold transition-all ${viewMode === "list" ? "bg-coral-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                        title="列表"
                        aria-label="列表視圖"
                      >
                        <List size={14} />
                        <span className="hidden xl:inline">列表</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("table")}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-bold transition-all ${viewMode === "table" ? "bg-coral-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                        title="表格"
                        aria-label="表格視圖"
                      >
                        <Table2 size={14} />
                        <span className="hidden xl:inline">表格</span>
                      </button>
                      {typeName === "預售屋" && (
                        <button
                          type="button"
                          onClick={() => setViewMode("aggregated")}
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-bold transition-all ${viewMode === "aggregated" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                          title="建案聚合"
                          aria-label="建案聚合視圖"
                        >
                          <BarChart3 size={14} />
                          <span className="hidden xl:inline">建案</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setViewMode("map")}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-bold transition-all ${viewMode === "map" ? "bg-coral-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                        title="地圖"
                        aria-label="地圖視圖"
                      >
                        <MapIcon size={14} />
                        <span className="hidden xl:inline">地圖</span>
                      </button>
                    </div>
                  </div>

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading-spinner-view"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="p-8 sm:p-16 space-y-12 flex flex-col items-center justify-center min-h-[500px] w-full"
                    >
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-[-2px] rounded-full border-t-2 border-coral-500" 
                        />
                        <Database size={22} className="text-coral-500 relative z-10" />
                      </div>
                    </div>
                    
                    <div className="text-center space-y-3 z-10">
                      <h3 className="text-xl sm:text-2xl font-bold text-ink dark:text-white tracking-tight">{robotStatus || "正在擷取開放資料..."}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold max-w-sm mx-auto uppercase tracking-widest leading-relaxed">內政部 實價登錄 API 連線中<br/>即時解析開放資料集結構</p>
                    </div>
      
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl pt-8">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-3 p-6 liquid-glass-panel rounded-3xl border-transparent shadow-none opacity-40">
                          <Skeleton className="h-4 w-2/3 bg-slate-200/50 dark:bg-slate-800/50 rounded-full" />
                          <Skeleton className="h-10 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl" />
                          <Skeleton className="h-4 w-1/2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : viewMode === "aggregated" && typeName === "預售屋" ? (
                  <motion.div
                    key="aggregated-view"
                    initial={{ opacity: 0, scale: 0.99, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.99, y: -15 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 min-h-[300px] flex flex-col p-4 sm:p-6 overflow-x-auto w-full"
                  >
                    <Table className="min-w-[800px]">
                      <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 border-b border-slate-200/80 dark:border-slate-800/80">
                        <TableRow className="border-none hover:bg-transparent">
                          <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest pl-6">建案名稱/社區</TableHead>
                          <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest px-4">區域</TableHead>
                          <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest text-right px-4">成交件數</TableHead>
                          <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest text-right px-4">平均單價</TableHead>
                          <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest text-right px-4">單價區間</TableHead>
                          <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest text-right px-4">總價區間</TableHead>
                        </TableRow>
                      </TableHeader>
                      <AnimatePresence mode="wait">
                        <motion.tbody
                          key={`aggregated-${search}-${typeName}-${unitPrice.min}-${unitPrice.max}-${period.startY}-${period.startM}-${period.endY}-${period.endM}`}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={{
                            hidden: { opacity: 0 },
                            visible: { 
                              opacity: 1,
                              transition: { staggerChildren: 0.03 }
                            }
                          }}
                          className="[&_tr:last-child]:border-0"
                        >
                          {aggregatedPreSaleData.map((item) => (
                            <motion.tr 
                              key={item.buildCase + item.district}
                              variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.4 } }
                              }}
                              className="group hover:bg-white/60 dark:hover:bg-slate-800/60 border-b border-slate-200/50 dark:border-slate-800/50 cursor-pointer"
                              onClick={() => {
                                setSearch(item.buildCase);
                                setViewMode("list");
                              }}
                            >
                              <TableCell className="pl-6 font-bold text-ink/90 dark:text-slate-200 truncate max-w-[200px]">
                                {item.buildCase}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                                  {item.district}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-slate-700 dark:text-slate-300 font-mono font-medium">
                                {item.count} 筆
                              </TableCell>
                              <TableCell className="text-right text-coral-600 dark:text-coral-400 font-mono font-bold">
                                {(Math.round(item.avgUnitPrice * 10) / 10).toFixed(1)} 萬/坪
                              </TableCell>
                              <TableCell className="text-right text-slate-500 font-mono text-xs">
                                {(Math.round(item.minUnitPrice * 10) / 10).toFixed(1)} ~ {(Math.round(item.maxUnitPrice * 10) / 10).toFixed(1)} 萬
                              </TableCell>
                              <TableCell className="text-right text-slate-500 font-mono text-xs">
                                {(item.minPrice / 10000).toFixed(0)} ~ {(item.maxPrice / 10000).toFixed(0)} 萬
                              </TableCell>
                            </motion.tr>
                          ))}
                        </motion.tbody>
                      </AnimatePresence>
                    </Table>
                  </motion.div>
                ) : viewMode === "list" || viewMode === "table" ? (
                  <motion.div
                    key={viewMode === "table" ? "table-view" : "list-view"}
                    initial={{ opacity: 0, scale: 0.99, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.99, y: -15 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 min-h-[300px] flex flex-col max-w-[1600px] mx-auto w-full"
                  >
                    <ResultDeltaBanner delta={resultDelta} onDismiss={() => setResultDelta(null)} />
                    {/* 座標解析進度只跟地圖有關，列表／表格使用者不需要看到 */}
                    {viewMode === "map" && (
                      <GeocodeProgress
                        isGeocoding={isGeocoding}
                        geocodedCount={geocodedCount}
                        totalToGeocode={totalToGeocode}
                      />
                    )}
                    {!loading && (priceDistribution.length > 0 || priceTrend.length > 0) && (
                      <Suspense
                        fallback={
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mx-0 sm:mx-6 mt-6 mb-2">
                            <Skeleton className="h-[220px] rounded-3xl bg-white/40 dark:bg-slate-900/40" />
                            <Skeleton className="h-[220px] rounded-3xl bg-white/40 dark:bg-slate-900/40" />
                          </div>
                        }
                      >
                        <ResultsCharts
                          priceDistribution={priceDistribution}
                          priceTrend={priceTrend}
                          showChartsMobile={showChartsMobile}
                          onToggleCharts={() => setShowChartsMobile(!showChartsMobile)}
                        />
                      </Suspense>
                    )}
                    <div className="w-full flex flex-col min-w-0">
                      {/* 排序：原本是可水平捲動的 chip 列 + 左右箭頭（共 6 個控制項），
                          收斂成一顆下拉，選項語意直接寫明方向 */}
                      <div className="mb-4 flex items-center justify-end gap-2 px-1.5 sm:px-6">
                        <label
                          htmlFor="results-sort"
                          className="text-[11px] font-bold text-slate-500 dark:text-slate-400"
                        >
                          排序
                        </label>
                        <select
                          id="results-sort"
                          value={sortValue}
                          onChange={(e) => setSortConfig(sortConfigFromValue(e.target.value as SortOptionValue))}
                          className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-700 outline-none transition-colors focus:border-coral-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {viewMode === "table" ? (
                        <div className="mx-0 overflow-x-auto rounded-2xl border border-slate-200/50 bg-white/80 shadow-none dark:border-slate-800/60 dark:bg-slate-900/40 sm:mx-6">
                          <Table className="min-w-[880px]">
                            <TableHeader>
                              <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-4 text-[10px] font-black uppercase tracking-widest text-slate-400">日期</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">地址</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">型態</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">坪數</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">單價</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">總價</TableHead>
                                <TableHead className="pr-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">操作</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedData.map((item) => {
                                const ping = item.buildingArea
                                  ? (parseFloat(item.buildingArea) * 0.3025).toFixed(1)
                                  : "—";
                                const unitWan = item.unitPrice
                                  ? ((parseFloat(item.unitPrice) * 3.30578) / 10000).toFixed(1)
                                  : "—";
                                const inCompare = compareList.some((c) => c.id === item.id);
                                return (
                                  <TableRow
                                    key={item.id}
                                    className="cursor-pointer border-slate-100 dark:border-slate-800/80"
                                    onClick={() => setSelectedItem(item)}
                                  >
                                    <TableCell className="pl-4 text-xs font-bold tabular-nums text-slate-500">
                                      {formatDate(item.date)}
                                    </TableCell>
                                    <TableCell className="max-w-[220px]">
                                      <div className="truncate text-xs font-bold text-ink dark:text-white" title={item.address}>
                                        {item.address}
                                      </div>
                                      <div className="mt-0.5 text-[10px] font-bold text-slate-400">{item.district}</div>
                                    </TableCell>
                                    <TableCell className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                      {(item.buildingType || "—").split("(")[0]}
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-bold tabular-nums text-slate-600 dark:text-slate-300">
                                      {ping}
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-bold tabular-nums text-slate-600 dark:text-slate-300">
                                      {unitWan}
                                    </TableCell>
                                    <TableCell className="text-right text-sm font-black tabular-nums text-coral-600 dark:text-coral-400">
                                      {formatPrice(item.totalPrice)}
                                    </TableCell>
                                    <TableCell className="pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-end gap-1">
                                        <button
                                          type="button"
                                          title={inCompare ? "移出比較" : "加入比較"}
                                          onClick={(e) => toggleCompare(item, e)}
                                          className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                                            inCompare
                                              ? "bg-coral-500/15 text-coral-600"
                                              : "bg-slate-100 text-slate-500 hover:text-coral-600 dark:bg-slate-800"
                                          }`}
                                        >
                                          比較
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedItem(item)}
                                          className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-coral-500 hover:text-white dark:bg-slate-800 dark:text-slate-300"
                                        >
                                          詳情
                                        </button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                          {paginatedData.length === 0 && !loading && (
                            <div className="py-12 text-center text-sm font-bold text-slate-400">此頁無資料</div>
                          )}
                        </div>
                      ) : (
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-3 px-0 sm:px-6 pb-2">
                          <AnimatePresence mode="popLayout">
                            {paginatedData.map((item, idx) => (
                              <TransactionCard
                                key={item.id}
                                item={item}
                                idx={idx}
                                typeName={typeName}
                                favorites={favorites}
                                toggleFavorite={toggleFavorite}
                                setSelectedItem={setSelectedItem}
                                setTrendDistrict={setTrendDistrict}
                                isInCompare={compareList.some((c) => c.id === item.id)}
                                toggleCompare={toggleCompare}
                                globalFacilities={globalFacilities}
                                historyCounts={historyCounts}
                                districtAveragePrices={districtAveragePrices}
                                appTexts={appTexts}
                                onFocusCommunity={(tx) => {
                                  if (tx.buildCase) {
                                    setFocusBuildCase(tx.buildCase);
                                    setSearch(tx.buildCase);
                                  } else {
                                    const base = tx.address.match(/(.+?[路街道巷弄號])/);
                                    if (base?.[1]) setSearch(base[1]);
                                  }
                                  setViewMode("list");
                                }}
                              />
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </div>
      
                    {filteredData.length > 0 && (
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 px-1.5 sm:px-6 mb-8">
                        <div className="text-sm font-medium text-slate-500">
                          共 {filteredData.length.toLocaleString()} 筆
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/60 dark:bg-slate-800/60 disabled:opacity-50"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          >
                            上一頁
                          </Button>
                          <div className="flex items-center gap-1 mx-2">
                            <span className="text-sm font-bold text-ink dark:text-white">
                              {currentPage}
                            </span>
                            <span className="text-sm text-slate-400">
                              / {totalPages}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/60 dark:bg-slate-800/60 disabled:opacity-50"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          >
                            下一頁
                          </Button>
                        </div>
                      </div>
                    )}
      
                    {filteredData.length > 0 && <AffiliateMarquee />}
      
                    {filteredData.length === 0 && !loading && !error && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 px-6 text-slate-400 dark:text-slate-500"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center mb-5 shadow-sm">
                          <Compass className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="font-sans font-bold text-base tracking-tight text-slate-800 dark:text-slate-200 text-center">
                          {data.length === 0
                            ? "尚未查詢或來源無資料"
                            : (appTexts.noData.includes("。") ? appTexts.noData.split("。")[0] : appTexts.noData)}
                        </p>
                        <p className="text-xs mt-1.5 font-medium text-slate-500 dark:text-slate-400 text-center max-w-sm">
                          {data.length === 0
                            ? "選擇區域後按「開始查詢」，或先放寬期間與關鍵字再試。"
                            : "可一鍵放寬條件後重新套用篩選（前端篩選立即生效）。"}
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                          {/* 原本最多會同時出現 9 顆「放寬某條件」按鈕；
                              保留三個最常見的單項，其餘統一由「清除全部篩選」處理 */}
                          {search.trim() && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-xs font-bold"
                              onClick={() => setSearch("")}
                            >
                              清除關鍵字
                            </Button>
                          )}
                          {district !== "全部" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-xs font-bold"
                              onClick={() => setDistrict("全部")}
                            >
                              改查全市
                            </Button>
                          )}
                          {!isDefaultPeriod(period) && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-xs font-bold"
                              onClick={() => setPeriod(getDefaultPeriod())}
                            >
                              改回近12月
                            </Button>
                          )}
                          {hasNarrowingFilters && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-xs font-bold"
                              onClick={clearNarrowingFilters}
                            >
                              清除全部篩選
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-xl text-xs font-bold bg-coral-600 hover:bg-coral-500 text-white"
                            onClick={() => fetchData()}
                          >
                            重新查詢
                          </Button>
                        </div>
                      </motion.div>
                    )}
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 px-6 text-red-500/80 dark:text-red-400/80"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-center mb-6 shadow-sm animate-pulse">
                          <X className="w-6 h-6 text-red-500" />
                        </div>
                        <p className="text-lg font-sans font-bold mb-2 tracking-tight text-red-700 dark:text-red-400">數據集載入失敗</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm text-center font-medium leading-relaxed mb-8">{error}</p>
                        <Button 
                          variant="outline" 
                          className="rounded-xl px-8 h-10 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold transition-all active:scale-95 text-xs shadow-sm"
                          onClick={fetchData}
                        >
                          重新載入資料
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="map-view"
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <Suspense
                      fallback={
                        <div className="p-4 sm:p-6">
                          <Skeleton className="h-[540px] rounded-[2rem] bg-white/40 dark:bg-slate-900/40" />
                        </div>
                      }
                    >
                      <ResultsMap
                        cityName={cityName}
                        district={district}
                        filteredData={filteredData}
                        formatPrice={formatPrice}
                        geocodedCount={geocodedCount}
                        isGeocoding={isGeocoding}
                        mapLayer={mapLayer}
                        onMapLayerChange={setMapLayer}
                        onSelectItem={setSelectedItem}
                        onToggleFacilities={() => setShowFacilities(!showFacilities)}
                        showFacilities={showFacilities}
                        totalToGeocode={totalToGeocode}
                      />
                    </Suspense>
                    <AffiliateMarquee />
                  </motion.div>
                )}
              </AnimatePresence>
                </div>
                {pinnedKpis.length > 0 && (
                  <aside className="mt-4 hidden lg:flex lg:flex-col gap-4">
                    <div className="sticky top-4 flex flex-col gap-4">
                      <PinnedKpiCompare
                        pins={pinnedKpis}
                        onUnpin={(id) => setPinnedKpis((prev) => prev.filter((p) => p.id !== id))}
                        onClear={() => setPinnedKpis([])}
                      />
                    </div>
                  </aside>
                )}
                </div>
              </div>

              {/* 地圖探索：液態玻璃懸浮圖示，預設收合；手機右下角 */}
              <div className="pointer-events-none fixed bottom-24 right-4 z-[55] flex flex-col items-end gap-2 sm:bottom-28 sm:right-6 lg:bottom-10 lg:right-8">
                <AnimatePresence>
                  {mapPeekOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.94 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="pointer-events-auto w-[min(92vw,22rem)] overflow-hidden rounded-[1.5rem] border border-slate-200/60 bg-white/90 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/90"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-white/40 px-3 py-2 dark:border-white/10">
                        <div className="min-w-0">
                          <p className="text-[11px] font-black tracking-wide text-ink dark:text-white">
                            地圖預覽
                          </p>
                          <p className="truncate text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {geocodedCount > 0
                              ? `${geocodedCount} 筆已定位`
                              : filteredData.length > 0
                                ? "定位中或約略座標"
                                : "查詢後顯示點位"}
                          </p>
                        </div>
                        
                      </div>
                      <div className="h-[220px] w-full bg-slate-100 dark:bg-slate-950/50">
                        {filteredData.length > 0 ? (
                          <Suspense
                            fallback={
                              <div className="flex h-full items-center justify-center">
                                <Skeleton className="h-full w-full" />
                              </div>
                            }
                          >
                            <ResultsMap
                              cityName={cityName}
                              district={district}
                              filteredData={filteredData.slice(0, 40)}
                              formatPrice={formatPrice}
                              geocodedCount={geocodedCount}
                              isGeocoding={isGeocoding}
                              mapLayer={mapLayer}
                              onMapLayerChange={setMapLayer}
                              onSelectItem={(item) => {
                                setSelectedItem(item);
                              }}
                              onToggleFacilities={() => setShowFacilities(!showFacilities)}
                              showFacilities={showFacilities}
                              totalToGeocode={totalToGeocode}
                            />
                          </Suspense>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                            <MapPinOff className="mb-2 h-7 w-7 text-slate-300 dark:text-slate-600" />
                            <p className="text-xs font-bold text-slate-500">尚無可定位資料</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => setMapPeekOpen((v) => !v)}
                  aria-expanded={mapPeekOpen}
                  aria-label={mapPeekOpen ? "收合地圖探索" : "展開地圖探索"}
                  title="地圖探索"
                  className="pointer-events-auto group relative flex h-14 w-14 items-center justify-center rounded-full border border-slate-200/70 bg-white/85 backdrop-blur-xl transition-transform hover:scale-105 active:scale-95 dark:border-slate-700/70 dark:bg-slate-900/80"
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-coral-400/15 via-transparent to-sky-400/10 opacity-80" />
                  {mapPeekOpen ? (
                    <X size={22} className="relative z-10 text-slate-700 dark:text-slate-100" strokeWidth={2.25} />
                  ) : (
                    <MapIcon size={22} className="relative z-10 text-coral-600 dark:text-coral-400" strokeWidth={2.25} />
                  )}
                  {geocodedCount > 0 && !mapPeekOpen && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1 text-[9px] font-black text-white shadow-sm">
                      {geocodedCount > 99 ? "99+" : geocodedCount}
                    </span>
                  )}
                </button>
              </div>
    </>
  );
}
