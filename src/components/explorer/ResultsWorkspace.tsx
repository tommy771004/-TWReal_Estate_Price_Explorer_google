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
import { ResultActions } from "./ResultActions";

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
    savedSearches,
    applySavedSearch,
    deleteSavedSearch,
    setIsSavingSearch,
    shareStatus,
    copyShareLink,
    handleExportCsv,
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
                <div className="relative mt-0 flex w-full flex-1 flex-col overflow-hidden rounded-t-none border border-outline-variant/40 bg-surface-container-low shadow-[var(--md-elevation-1)] sm:mt-4 sm:rounded-[28px]">
                  <div className="relative flex items-center justify-between gap-2 border-b border-outline-variant/30 bg-surface-container px-3.5 py-3 sm:px-6">
                    <div className="relative z-10 flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-xs">
                        <Filter className="h-4 w-4" />
                      </div>
                      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                        <span className="truncate text-xs font-medium text-on-surface-variant">
                          結果 {filteredData.length.toLocaleString()} 筆
                          <span className="mx-1 text-outline-variant">·</span>
                          {formatPeriodLabel(period)}
                        </span>
                      </div>
                    </div>
                    <div className="relative z-10 flex shrink-0 items-center gap-2">
                    <ResultActions
                      savedSearches={savedSearches}
                      onSaveCurrent={() => setIsSavingSearch(true)}
                      onApplySaved={applySavedSearch}
                      onDeleteSaved={deleteSavedSearch}
                      onExportCsv={handleExportCsv}
                      exportDisabled={filteredData.length === 0}
                      onCopyShareLink={copyShareLink}
                      shareStatus={shareStatus}
                    />
                    {/* Material 3 Segmented Button */}
                    <div className="flex items-center rounded-full border border-outline-variant/50 bg-surface-container-highest p-1 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${viewMode === "list" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"}`}
                        title="列表"
                        aria-label="列表圖"
                      >
                        <List size={14} />
                        <span className="hidden xl:inline">列表</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("table")}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${viewMode === "table" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"}`}
                        title="表格"
                        aria-label="表格圖"
                      >
                        <Table2 size={14} />
                        <span className="hidden xl:inline">表格</span>
                      </button>
                      {typeName === "預售屋" && (
                        <button
                          type="button"
                          onClick={() => setViewMode("aggregated")}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${viewMode === "aggregated" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"}`}
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
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${viewMode === "map" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"}`}
                        title="地圖"
                        aria-label="地圖視圖"
                      >
                        <MapIcon size={14} />
                        <span className="hidden xl:inline">地圖</span>
                      </button>
                    </div>
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
                      <div className="w-16 h-16 rounded-full border-2 border-surface-container-highest flex items-center justify-center relative">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-[-2px] rounded-full border-t-2 border-primary" 
                        />
                        <Database size={22} className="text-primary relative z-10" />
                      </div>
                    </div>
                    
                    <div className="text-center space-y-3 z-10">
                      <h3 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">{robotStatus || "正在擷取開放資料..."}</h3>
                      <p className="text-xs sm:text-sm text-on-surface-variant font-medium max-w-sm mx-auto tracking-wide leading-relaxed">內政部 實價登錄 API 連線中<br/>即時解析開放資料集結構</p>
                    </div>
      
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl pt-8">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-3 p-6 rounded-[24px] bg-surface-container border border-outline-variant/30 shadow-none opacity-60">
                          <Skeleton className="h-4 w-2/3 bg-surface-container-highest rounded-full" />
                          <Skeleton className="h-10 w-full bg-surface-container-highest rounded-2xl" />
                          <Skeleton className="h-4 w-1/2 bg-surface-container-highest rounded-full" />
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
                      <TableHeader className="sticky top-0 bg-surface-container z-10 border-b border-outline-variant/30">
                        <TableRow className="border-none hover:bg-transparent">
                          <TableHead className="text-on-surface-variant font-bold text-xs uppercase tracking-wider pl-6">建案名稱/社區</TableHead>
                          <TableHead className="text-on-surface-variant font-bold text-xs uppercase tracking-wider px-4">區域</TableHead>
                          <TableHead className="text-on-surface-variant font-bold text-xs uppercase tracking-wider text-right px-4">成交件數</TableHead>
                          <TableHead className="text-on-surface-variant font-bold text-xs uppercase tracking-wider text-right px-4">平均單價</TableHead>
                          <TableHead className="text-on-surface-variant font-bold text-xs uppercase tracking-wider text-right px-4">單價區間</TableHead>
                          <TableHead className="text-on-surface-variant font-bold text-xs uppercase tracking-wider text-right px-4">總價區間</TableHead>
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
                              className="group hover:bg-surface-container-highest/60 border-b border-outline-variant/20 cursor-pointer transition-colors"
                              onClick={() => {
                                setSearch(item.buildCase);
                                setViewMode("list");
                              }}
                            >
                              <TableCell className="pl-6 font-bold text-on-surface truncate max-w-[200px]">
                                {item.buildCase}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="rounded-full bg-secondary-container text-on-secondary-container font-semibold text-xs px-2.5 py-0.5">
                                  {item.district}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-on-surface-variant font-mono font-medium">
                                {item.count} 筆
                              </TableCell>
                              <TableCell className="text-right text-primary font-mono font-bold">
                                {(Math.round(item.avgUnitPrice * 10) / 10).toFixed(1)} 萬/坪
                              </TableCell>
                              <TableCell className="text-right text-on-surface-variant font-mono text-xs">
                                {(Math.round(item.minUnitPrice * 10) / 10).toFixed(1)} ~ {(Math.round(item.maxUnitPrice * 10) / 10).toFixed(1)} 萬
                              </TableCell>
                              <TableCell className="text-right text-on-surface-variant font-mono text-xs">
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
                          className="text-xs font-semibold text-on-surface-variant"
                        >
                          排序
                        </label>
                        <select
                          id="results-sort"
                          value={sortValue}
                          onChange={(e) => setSortConfig(sortConfigFromValue(e.target.value as SortOptionValue))}
                          className="h-9 rounded-full border border-outline bg-surface px-3.5 text-xs font-semibold text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                          {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {viewMode === "table" ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-20px" }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="mx-0 overflow-x-auto rounded-[24px] border border-outline-variant/40 bg-surface-container-low shadow-[var(--md-elevation-1)] sm:mx-6"
                        >
                          <Table className="min-w-[880px]">
                            <TableHeader className="bg-surface-container border-b border-outline-variant/30">
                              <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="pl-5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">日期</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">地址</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">型態</TableHead>
                                <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">坪數</TableHead>
                                <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">單價</TableHead>
                                <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">總價</TableHead>
                                <TableHead className="pr-5 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">操作</TableHead>
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
                                    className="cursor-pointer border-b border-outline-variant/20 hover:bg-surface-container-highest/50 transition-colors"
                                    onClick={() => setSelectedItem(item)}
                                  >
                                    <TableCell className="pl-5 text-xs font-medium tabular-nums text-on-surface-variant">
                                      {formatDate(item.date)}
                                    </TableCell>
                                    <TableCell className="max-w-[220px]">
                                      <div className="truncate text-xs font-bold text-on-surface" title={item.address}>
                                        {item.address}
                                      </div>
                                      <div className="mt-0.5 text-[11px] font-medium text-on-surface-variant">{item.district}</div>
                                    </TableCell>
                                    <TableCell className="text-xs font-medium text-on-surface">
                                      {(item.buildingType || "—").split("(")[0]}
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-medium tabular-nums text-on-surface">
                                      {ping}
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-medium tabular-nums text-on-surface">
                                      {unitWan}
                                    </TableCell>
                                    <TableCell className="text-right text-sm font-bold tabular-nums text-primary">
                                      {formatPrice(item.totalPrice)}
                                    </TableCell>
                                    <TableCell className="pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          title={inCompare ? "移出比較" : "加入比較"}
                                          onClick={(e) => toggleCompare(item, e)}
                                          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                                            inCompare
                                              ? "bg-primary-container text-on-primary-container"
                                              : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                                          }`}
                                        >
                                          比較
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedItem(item)}
                                          className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container hover:bg-secondary-container/80 transition-colors"
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
                            <div className="py-12 text-center text-xs font-medium text-on-surface-variant">此頁無資料</div>
                          )}
                        </motion.div>
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
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-6 px-1.5 sm:px-6 mb-8">
                        <div className="text-xs font-semibold text-on-surface-variant">
                          共 {filteredData.length.toLocaleString()} 筆
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-full border border-outline bg-surface px-4 text-xs font-semibold text-on-surface hover:bg-surface-container-highest disabled:opacity-38"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          >
                            上一頁
                          </Button>
                          <div className="flex items-center gap-1 mx-2">
                            <span className="text-xs font-bold text-on-surface">
                              {currentPage}
                            </span>
                            <span className="text-xs font-medium text-on-surface-variant">
                              / {totalPages}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-full border border-outline bg-surface px-4 text-xs font-semibold text-on-surface hover:bg-surface-container-highest disabled:opacity-38"
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
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex flex-col items-center justify-center py-20 px-6 text-on-surface-variant"
                      >
                        <div className="w-16 h-16 rounded-full bg-surface-container-highest border border-outline-variant/40 flex items-center justify-center mb-5 shadow-xs">
                          <Compass className="w-6 h-6 text-primary" />
                        </div>
                        <p className="font-bold text-base tracking-tight text-on-surface text-center">
                          {data.length === 0
                            ? "尚未查詢或來源無資料"
                            : (appTexts.noData.includes("。") ? appTexts.noData.split("。")[0] : appTexts.noData)}
                        </p>
                        <p className="text-xs mt-1.5 font-medium text-on-surface-variant text-center max-w-sm">
                          {data.length === 0
                            ? "選擇區域後按「開始查詢」，或先放寬期間與關鍵字再試。"
                            : "可一鍵放寬條件後重新套用篩選（前端篩選立即生效）。"}
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                          {search.trim() && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full border border-outline bg-surface px-4 text-xs font-semibold text-on-surface hover:bg-surface-container-highest"
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
                              className="rounded-full border border-outline bg-surface px-4 text-xs font-semibold text-on-surface hover:bg-surface-container-highest"
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
                              className="rounded-full border border-outline bg-surface px-4 text-xs font-semibold text-on-surface hover:bg-surface-container-highest"
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
                              className="rounded-full border border-outline bg-surface px-4 text-xs font-semibold text-on-surface hover:bg-surface-container-highest"
                              onClick={clearNarrowingFilters}
                            >
                              清除全部篩選
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-full bg-primary px-5 text-xs font-semibold text-on-primary hover:bg-primary/90 shadow-xs"
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
                        className="flex flex-col items-center justify-center py-20 px-6 text-error"
                      >
                        <div className="w-16 h-16 rounded-full bg-error-container border border-error/20 flex items-center justify-center mb-6 shadow-xs">
                          <X className="w-6 h-6 text-error" />
                        </div>
                        <p className="text-base font-bold mb-1 tracking-tight text-on-surface">數據集載入失敗</p>
                        <p className="text-xs text-on-surface-variant max-w-sm text-center font-medium leading-relaxed mb-6">{error}</p>
                        <Button 
                          variant="outline" 
                          className="rounded-full px-6 h-10 border border-outline bg-surface text-on-surface hover:bg-surface-container-highest font-semibold text-xs shadow-xs"
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
                          <Skeleton className="h-[540px] rounded-[28px] bg-surface-container-highest" />
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

              {/* 地圖探索：M3 FAB 浮動按鈕 */}
              <div className="pointer-events-none fixed bottom-24 right-4 z-[55] flex flex-col items-end gap-2 sm:bottom-28 sm:right-6 lg:bottom-10 lg:right-8">
                <AnimatePresence>
                  {mapPeekOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.94 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="pointer-events-auto w-[min(92vw,22rem)] overflow-hidden rounded-[28px] border border-outline-variant/40 bg-surface-container-high shadow-[var(--md-elevation-3)] text-on-surface"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-outline-variant/30 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold tracking-tight text-on-surface">
                            地圖預覽
                          </p>
                          <p className="truncate text-[11px] font-medium text-on-surface-variant">
                            {geocodedCount > 0
                              ? `${geocodedCount} 筆已定位`
                              : filteredData.length > 0
                                ? "定位中或約略座標"
                                : "查詢後顯示點位"}
                          </p>
                        </div>
                        
                      </div>
                      <div className="h-[220px] w-full bg-surface-container">
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
                            <MapPinOff className="mb-2 h-7 w-7 text-on-surface-variant/40" />
                            <p className="text-xs font-semibold text-on-surface-variant">尚無可定位資料</p>
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
                  className="pointer-events-auto group relative flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-container text-on-primary-container shadow-[var(--md-elevation-3)] hover:shadow-[var(--md-elevation-4)] transition-all hover:bg-primary-container/90 active:scale-95"
                >
                  {mapPeekOpen ? (
                    <X size={22} className="relative z-10" strokeWidth={2.25} />
                  ) : (
                    <MapIcon size={22} className="relative z-10" strokeWidth={2.25} />
                  )}
                  {geocodedCount > 0 && !mapPeekOpen && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary shadow-xs">
                      {geocodedCount > 99 ? "99+" : geocodedCount}
                    </span>
                  )}
                </button>
              </div>
    </>
  );
}
