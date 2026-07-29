import React, { Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, MapPin, Filter, ArrowUpDown, X, ChevronRight, ChevronLeft, Bookmark, Trash2,
  Clock, List, Table2, BarChart3, Map as MapIcon, Download, Share2, CheckCircle2,
  Compass, Crosshair, Pin, SlidersHorizontal, ArrowUp, ArrowDown, TrendingUp, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QueryAssistBar } from "../QueryAssistBar";
import { TransactionCard } from "../TransactionCard";
import { ResultDeltaBanner } from "../ResultDeltaBanner";
import { GeocodeProgress } from "../GeocodeProgress";
import { PinnedKpiCompare } from "../PinnedKpiCompare";
import { AffiliateMarquee } from "../AffiliateMarquee";
import { DEFAULT_PROPERTY_TYPES } from "../../lib/urlState";
import { TRANSACTION_TYPES } from "../../constants";
import {
  YEARS, MONTHS,
  getDefaultPeriod, formatPeriodLabel, isDefaultPeriod, formatPrice, formatDate,
} from "../../utils/real-estate-helpers";
import { useExplorerUi } from "./ExplorerUiContext";

const ResultsCharts = React.lazy(() => import("../ResultsCharts"));
const ResultsMap = React.lazy(() => import("../MapViews"));

export function SearchFilterPanel() {
  const [isQueryAssistOpen, setIsQueryAssistOpen] = React.useState(false);
  const {
    cityName,
    setCityName,
    typeName,
    setTypeName,
    district,
    setDistrict,
    search,
    setSearch,
    propertyTypes,
    setPropertyTypes,
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
    setExcludeSpecial,
    totalPriceMaxWan,
    setTotalPriceMaxWan,
    activePresetId,
    setActivePresetId,
    nearbyKm,
    setNearbyKm,
    nearbyAnchor,
    setNearbyAnchor,
    focusBuildCase,
    setFocusBuildCase,
    userLocation,
    isSearchExpanded,
    setIsSearchExpanded,
    isAdvancedSearchOpen,
    setIsAdvancedSearchOpen,
    isLocationModalOpen,
    setIsLocationModalOpen,
    showLocationModal,
    setShowLocationModal,
    showSuggestions,
    setShowSuggestions,
    loading,
    robotStatus,
    appTexts,
    viewMode,
    setViewMode,
    data,
    filteredData,
    paginatedData,
    dataSource,
    dataCachedAt,
    error,
    fetchData,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    sortConfig,
    setSortConfig,
    handleSort,
    scrollSort,
    sortScrollRef,
    resultsContainerRef,
    addressSuggestions,
    recentSearches,
    clearRecentSearches,
    trendingSearches,
    handleTrendingClick,
    savedSearches,
    applySavedSearch,
    deleteSavedSearch,
    isSavingSearch,
    setIsSavingSearch,
    newSearchName,
    setNewSearchName,
    saveCurrentSearch,
    applyQueryPreset,
    applyBudgetWan,
    marketSnapshot,
    marketKpis,
    pinCurrentMarket,
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
    setNearbyFromItem,
    mapLayer,
    setMapLayer,
    showFacilities,
    setShowFacilities,
    shareStatus,
    copyShareLink,
    handleExportCsv,
    districts
  } = useExplorerUi();

  return (
    <>
                {/* Quick Access Saved Searches */}
                <AnimatePresence>
                  {savedSearches.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="max-w-[1600px] mx-auto w-full flex items-center gap-2 overflow-x-auto pb-4 px-2 no-scrollbar"
                    >
                      <div className="flex items-center gap-1.5 mr-1 text-slate-500 dark:text-slate-400">
                        <Bookmark size={12} className="text-coral-500 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shrink-0">最近使用：</span>
                      </div>
                      {savedSearches.map(s => (
                        <button
                          key={s.id}
                          onClick={() => applySavedSearch(s)}
                          className="group flex items-center gap-2 whitespace-nowrap px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full border border-white/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                        >
                          {s.name}
                          <div 
                            onClick={(e) => { e.stopPropagation(); deleteSavedSearch(s.id); }} 
                            className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:!bg-coral-500 hover:text-white transition-all scale-75 group-hover:scale-100 overflow-hidden"
                          >
                            <X size={10} />
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
      
                {/* Mobile Collapsed State */}
                <AnimatePresence>
                  {!isSearchExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="max-w-[1600px] mx-auto w-full md:hidden flex items-center justify-between liquid-glass-panel px-5 py-3 rounded-2xl shadow-none cursor-pointer hover:bg-white/40 active:scale-[0.98] transition-all overflow-hidden mb-2"
                      onClick={() => setIsSearchExpanded(true)}
                    >
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <MapPin size={14} className="text-coral-500" />
                        <span className="font-bold text-sm truncate max-w-[150px] sm:max-w-none">{cityName} {district !== "全部" ? `· ${district}` : ''}</span>
                        {search && <span className="text-xs opacity-70 truncate max-w-[80px]">"{search}"</span>}
                      </div>
                      <div className="flex items-center gap-1.5 text-coral-500 font-bold text-[10px] bg-coral-500/10 px-2.5 py-1.5 rounded-lg shrink-0">
                        <Filter size={12} /> 展開條件
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
      
                {/* Filters Grid */}
                <AnimatePresence initial={false}>
                  {isSearchExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0, scale: 0.985, y: -8 }}
                      animate={{ height: "auto", opacity: 1, scale: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, scale: 0.985, y: -8 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // smooth ease-out (like Apple)
                      className="max-w-[1600px] mx-auto w-full z-10 overflow-hidden"
                    >
                      <motion.div 
                        layout="position"
                        animate={{
                          borderColor: loading ? "rgba(237, 111, 92, 0.45)" : "rgba(255, 255, 255, 0.15)",
                          boxShadow: loading 
                            ? "0 0 25px 6px rgba(237, 111, 92, 0.22), 0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
                            : "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                        }}
                        transition={{ duration: 0.4 }}
                      className="relative overflow-hidden flex flex-col gap-2 sm:gap-4 liquid-glass-panel p-3 sm:px-6 sm:py-4 rounded-[2rem] shadow-none mx-0 mb-2 sm:mx-1 sm:mb-4 mt-1 sm:mt-0"
                      >
                        {/* Subtle running loading animation bar inside the filter panel header */}
                        <AnimatePresence>
                          {loading && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 2 }}
                              exit={{ opacity: 0, height: 0 }}
                              className="absolute top-0 left-0 right-0 w-full bg-gradient-to-r from-transparent via-coral-400 to-transparent overflow-hidden"
                            >
                              <motion.div 
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
                                className="w-1/2 h-full bg-gradient-to-r from-coral-300 to-coral-500"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                  
                  {/* Top Row: Location & Search */}
                  <div className="flex flex-col sm:flex-row gap-4 z-40">
                    <button
                      onClick={() => setIsLocationModalOpen(true)}
                      className="liquid-glass-input h-[52px] px-4 sm:px-5 rounded-[1rem] flex items-center justify-between gap-3 hover:border-coral-500/50 hover:shadow-md transition-all sm:w-[220px] shrink-0 outline-none text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-coral-500/10 flex items-center justify-center shrink-0">
                          <MapPin size={16} className="text-coral-500" />
                        </div>
                        <div className="flex flex-col items-start gap-0.5 justify-center">
                          <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest leading-none mt-0.5">選擇區域</span>
                          <span className="font-bold text-ink dark:text-white text-[15px] leading-none mb-0.5 mt-0.5 truncate max-w-[120px]">{cityName} {district !== "全部" ? `· ${district}` : ''}</span>
                        </div>
                      </div>
                      <ArrowUpDown className="w-3 h-3 opacity-30 shrink-0" />
                    </button>
      
                    <div className="relative group flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-coral-500 group-focus-within:scale-110 transition-all duration-300" />
                      </div>
                      <input 
                        type="text"
                        placeholder={appTexts.searchPlaceholder} 
                        className="w-full pl-11 liquid-glass-input h-[52px] rounded-[1rem] outline-none text-sm font-bold placeholder:text-slate-400 shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      />
                      
                      {/* Autocomplete Dropdown: typed suggestions, or Recent Searches & Trending Searches when empty */}
                      <AnimatePresence>
                        {showSuggestions && (addressSuggestions.length > 0 || recentSearches.length > 0 || trendingSearches.length > 0) && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-xl shadow-lg overflow-hidden py-3 z-50 max-h-[460px] overflow-y-auto"
                          >
                            {addressSuggestions.length > 0 ? (
                              addressSuggestions.map(suggestion => (
                                <div
                                  key={suggestion}
                                  className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-coral-500/10 hover:text-coral-600 dark:hover:text-coral-400 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                                  onClick={() => {
                                    setSearch(suggestion);
                                    setShowSuggestions(false);
                                  }}
                                >
                                  {suggestion}
                                </div>
                              ))
                            ) : (
                              <div className="flex flex-col gap-4">
                                {/* Recent Searches Block */}
                                {recentSearches.length > 0 && (
                                  <div>
                                    <div className="flex items-center justify-between px-4 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800/80">
                                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">
                                        <Clock className="w-3 h-3" /> 最近搜尋
                                      </span>
                                      <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={clearRecentSearches}
                                        className="text-[10px] font-bold text-slate-400 hover:text-coral-500 transition-colors"
                                      >
                                        清除
                                      </button>
                                    </div>
                                    <div className="flex flex-col">
                                      {recentSearches.map(query => (
                                        <div
                                          key={query}
                                          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-coral-500/5 hover:text-coral-600 dark:hover:text-coral-400 cursor-pointer transition-colors"
                                          onClick={() => {
                                            setShowSuggestions(false);
                                            fetchData(query);
                                          }}
                                        >
                                          <Clock className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                          <span className="truncate">{query}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
      
                                {/* Trending Searches Block */}
                                {trendingSearches.length > 0 && (
                                  <div>
                                    <div className="flex items-center justify-between px-4 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80">
                                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">
                                        <TrendingUp className="w-3 h-3 text-coral-500" /> 熱門搜尋 (Trending)
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 px-4">
                                      {trendingSearches.map((item, idx) => (
                                        <div
                                          key={item.query}
                                          onMouseDown={(e) => e.preventDefault()}
                                          className="flex items-center justify-between px-3 py-2 text-[12px] font-bold text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-coral-500/10 hover:text-coral-600 dark:bg-slate-850 dark:hover:bg-coral-500/10 dark:hover:text-coral-400 cursor-pointer border border-slate-100/80 dark:border-slate-800/60 rounded-xl transition-all duration-200 shadow-sm"
                                          onClick={() => handleTrendingClick(item)}
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className={`flex items-center justify-center w-4-5 h-4-5 rounded-md text-[10px] font-black shrink-0 ${
                                              idx < 3 
                                                ? "bg-coral-500 text-white shadow-sm" 
                                                : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                            }`} style={{ width: "18px", height: "18px" }}>
                                              {idx + 1}
                                            </span>
                                            <span className="truncate pr-1">{item.query}</span>
                                          </div>
                                          <span className="text-[9px] text-slate-400 dark:text-slate-500 scale-90 origin-right shrink-0">
                                            {item.count}次
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
      
                  {/* Tags Row: Type & Property Types + Search Actions (right-aligned) */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end sm:justify-between">
      
                    {/* Left: filter selectors */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center min-w-0">
      
                    <div className="flex flex-col gap-1.5">
                      
                      <div className="flex bg-white/40 dark:bg-black/20 p-1.5 rounded-[1rem] shadow-inner border border-white/60 dark:border-white/5">
                        {TRANSACTION_TYPES.map(t => (
                          <button 
                            key={t.name}
                            onClick={() => {
                              setTypeName(t.name);
                              if (t.name === "預售屋") setViewMode("aggregated");
                              else setViewMode("list");
                            }}
                            className={`px-4 xl:px-6 h-9 font-bold text-xs sm:text-[13px] rounded-xl whitespace-nowrap transition-all ${typeName === t.name ? 'bg-white dark:bg-slate-800 text-coral-600 dark:text-coral-400 shadow-sm border border-slate-100 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                          >
                            {t.name.replace("租賃", "租")}
                          </button>
                        ))}
                      </div>
                    </div>
      
                    <div className="w-full sm:w-px h-px sm:h-10 bg-white/40 dark:bg-white/5 mx-0 sm:mx-2" />
      
                    <div className="flex flex-col gap-1.5 w-full sm:w-auto min-w-0">
                      
                       <div className="flex flex-nowrap sm:flex-wrap gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
                         {["房地", "房地(車)", "建物", "車位", "土地"].map(pt => (
                            <label key={pt} className="relative cursor-pointer group shrink-0 snap-start">
                              <input type="checkbox" className="sr-only peer" 
                                checked={propertyTypes.includes(pt)}
                                onChange={(e) => {
                                  if (e.target.checked) setPropertyTypes([...propertyTypes, pt]);
                                  else setPropertyTypes(propertyTypes.filter(p => p !== pt));
                                }}
                              />
                              <div className="px-2.5 sm:px-3 xl:px-4 h-[44px] flex items-center justify-center rounded-[1rem] border border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/50 text-[12px] sm:text-[13px] font-bold text-slate-500 dark:text-slate-400 peer-checked:bg-coral-500/10 dark:peer-checked:bg-coral-900/30 peer-checked:text-coral-600 dark:peer-checked:text-coral-400 peer-checked:border-coral-300 dark:peer-checked:border-coral-500/30 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:-translate-y-[1px] active:translate-y-0 whitespace-nowrap">
                                {pt}
                              </div>
                            </label>
                         ))}
                       </div>
                    </div>
                    </div>
      
                    {/* Right: search actions, aligned with filters */}
                    <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
                      <Button
                        variant="ghost"
                        onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
                        className={`flex-1 sm:flex-none text-xs sm:text-sm font-bold ${isAdvancedSearchOpen ? 'text-coral-600 dark:text-coral-400 bg-coral-500/10 dark:bg-coral-500/20' : 'text-slate-600 dark:text-slate-300'} hover:text-coral-700 hover:bg-coral-50 dark:hover:bg-coral-900/30 rounded-[1.25rem] h-11 transition-all gap-2 px-4 border border-transparent shadow-sm ${isAdvancedSearchOpen ? 'border-coral-500/30 shadow-inner' : ''}`}
                      >
                        <div className="relative">
                          <SlidersHorizontal className="w-4 h-4" />
                          {isAdvancedSearchOpen && (
                            <motion.div id="search-dot" className="absolute -top-1 -right-1 w-2 h-2 bg-coral-500 shadow-[0_0_8px_rgba(237,111,92,0.5)] rounded-full" />
                          )}
                        </div>
                        {appTexts.advancedSearch}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsQueryAssistOpen(true)}
                        className={`flex-1 sm:flex-none h-11 gap-2 rounded-[1.25rem] border border-transparent px-4 text-xs font-bold shadow-sm transition-all sm:text-sm ${
                          activePresetId || totalPriceMaxWan || nearbyKm != null
                            ? "border-violet-400/40 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                            : "text-slate-600 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-violet-950/30"
                        }`}
                        title="場景、預算、捷運生活圈"
                      >
                        <div className="relative">
                          <Sparkles className="h-4 w-4" />
                          {(activePresetId || totalPriceMaxWan || nearbyKm != null) && (
                            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                          )}
                        </div>
                        查詢加速
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSearch("");
                          setDistrict("全部");
                          setCityName("臺北市");
                          setPropertyTypes([...DEFAULT_PROPERTY_TYPES]);
                          setTypeName("買賣");
                          setPeriod(getDefaultPeriod());
                          setUnitPrice({ min: "", max: "", unit: "1" });
                          setArea({ min: "", max: "", unit: "2" });
                          setAge({ min: "", max: "" });
                          setRoomsMin("");
                          setHasManagement("any");
                          setParkingFilter("any");
                          setNearbyKm(null);
                          setNearbyAnchor(null);
                          setFocusBuildCase(null);
                          setExcludeSpecial(true);
                          setTotalPriceMaxWan("");
                          setActivePresetId(null);
                        }}
                        className="flex-1 sm:flex-none h-11 px-4 rounded-[1.25rem] text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-coral-500/5 transition-all text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {appTexts.clearAll}
                      </Button>
                      <Button
                        onClick={() => setIsSavingSearch(true)}
                        variant="ghost"
                        className="flex-1 sm:flex-none bg-coral-500/10 hover:bg-coral-500/20 text-coral-600 dark:text-coral-400 border border-coral-500/20 rounded-[1.25rem] h-11 px-4 text-xs font-bold transition-all shadow-sm flex items-center justify-center"
                        title="儲存目前的搜尋設定"
                        aria-label="儲存目前的搜尋設定"
                      >
                        <Bookmark size={14} className="mr-1.5" />
                        儲存條件
                      </Button>
                      <Button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex-1 sm:flex-none liquid-glass-button-primary rounded-[1.25rem] px-8 h-11 whitespace-nowrap shadow-md text-sm font-bold flex items-center justify-center"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        {loading ? "處理中..." : "開始查詢"}
                      </Button>
                    </div>
                  </div>
      
                  {/* 查詢加速彈窗 */}
                  <Dialog open={isQueryAssistOpen} onOpenChange={setIsQueryAssistOpen}>
                    <DialogContent className="max-h-[90vh] max-w-[min(96vw,32rem)] overflow-y-auto rounded-[1.75rem] border-slate-200/80 bg-white p-0 dark:border-slate-800 dark:bg-slate-950 sm:max-w-lg">
                      <DialogHeader className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                        <DialogTitle className="flex items-center gap-2 text-base font-black text-ink dark:text-white">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/12 text-violet-600 dark:text-violet-300">
                            <Sparkles size={16} />
                          </span>
                          查詢加速
                        </DialogTitle>
                        <p className="pt-1 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          場景預設、預算上限、捷運生活圈 — 快速帶入條件後仍可微調
                        </p>
                      </DialogHeader>
                      <div className="px-5 py-4">
                        <QueryAssistBar
                          cityName={cityName}
                          activePresetId={activePresetId}
                          totalPriceMaxWan={totalPriceMaxWan}
                          onApplyPreset={applyQueryPreset}
                          onApplyBudgetWan={applyBudgetWan}
                          nearbyLabel={
                            nearbyAnchor
                              ? `${nearbyAnchor.label}${nearbyKm != null ? ` · ${nearbyKm}km` : ""}`
                              : null
                          }
                          onPickStation={(station, km) => {
                            setCityName(station.city);
                            setDistrict("全部");
                            setNearbyAnchor({ lat: station.lat, lng: station.lng, label: station.name });
                            setNearbyKm(km);
                            setActivePresetId(null);
                            setViewMode("list");
                            setIsSearchExpanded(true);
                          }}
                          onDone={() => setIsQueryAssistOpen(false)}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* 已套用條件 */}
                  <AnimatePresence>
                    {(() => {
                      const chips: { id: string; label: string; onClear?: () => void; muted?: boolean }[] = [];
                      chips.push({
                        id: "city",
                        label: cityName,
                        muted: true,
                      });
                      if (district !== "全部") {
                        chips.push({
                          id: "district",
                          label: district,
                          onClear: () => setDistrict("全部"),
                        });
                      }
                      if (typeName !== "買賣") {
                        chips.push({
                          id: "typeName",
                          label: typeName,
                          onClear: () => {
                            setTypeName("買賣");
                            setViewMode("list");
                          },
                        });
                      }
                      // 期間：預設近 12 個月仍顯示，方便確認；非預設可一鍵還原
                      chips.push({
                        id: "period",
                        label: isDefaultPeriod(period)
                          ? `近12月 ${formatPeriodLabel(period)}`
                          : `期間 ${formatPeriodLabel(period)}`,
                        onClear: isDefaultPeriod(period)
                          ? undefined
                          : () => setPeriod(getDefaultPeriod()),
                        muted: isDefaultPeriod(period),
                      });
                      if (search.trim()) {
                        chips.push({
                          id: "search",
                          label: `關鍵字: ${search}`,
                          onClear: () => setSearch(""),
                        });
                      }
                      // 僅在標的種類偏離預設時顯示（避免預設三種永遠佔版面）
                      const isDefaultPts =
                        propertyTypes.length === DEFAULT_PROPERTY_TYPES.length &&
                        DEFAULT_PROPERTY_TYPES.every((pt) => propertyTypes.includes(pt));
                      if (!isDefaultPts) {
                        if (propertyTypes.length === 0) {
                          chips.push({
                            id: "pt-none",
                            label: "種類: 未選",
                            onClear: () => setPropertyTypes([...DEFAULT_PROPERTY_TYPES]),
                          });
                        } else if (propertyTypes.length <= 3) {
                          propertyTypes.forEach((pt) => {
                            chips.push({
                              id: `pt-${pt}`,
                              label: pt,
                              onClear: () => {
                                const next = propertyTypes.filter((p) => p !== pt);
                                setPropertyTypes(next.length ? next : [...DEFAULT_PROPERTY_TYPES]);
                              },
                            });
                          });
                        } else {
                          chips.push({
                            id: "pt-many",
                            label: `種類 ${propertyTypes.length} 項`,
                            onClear: () => setPropertyTypes([...DEFAULT_PROPERTY_TYPES]),
                          });
                        }
                      }
                      if (unitPrice.min || unitPrice.max) {
                        chips.push({
                          id: "unitPrice",
                          label: `單價 ${unitPrice.min || "0"}–${unitPrice.max || "∞"} ${unitPrice.unit === "1" ? "萬/坪" : "元/㎡"}`,
                          onClear: () => setUnitPrice({ min: "", max: "", unit: "1" }),
                        });
                      }
                      if (area.min || area.max) {
                        chips.push({
                          id: "area",
                          label: `坪數 ${area.min || "0"}–${area.max || "∞"} ${area.unit === "2" ? "坪" : "㎡"}`,
                          onClear: () => setArea({ min: "", max: "", unit: "2" }),
                        });
                      }
                      if (age.min || age.max) {
                        chips.push({
                          id: "age",
                          label: `屋齡 ${age.min || "0"}–${age.max || "∞"} 年`,
                          onClear: () => setAge({ min: "", max: "" }),
                        });
                      }
                      if (roomsMin) {
                        chips.push({
                          id: "rooms",
                          label: `≥${roomsMin} 房`,
                          onClear: () => setRoomsMin(""),
                        });
                      }
                      if (hasManagement !== "any") {
                        chips.push({
                          id: "mgmt",
                          label: hasManagement === "yes" ? "有管理" : "無管理",
                          onClear: () => setHasManagement("any"),
                        });
                      }
                      if (parkingFilter !== "any") {
                        chips.push({
                          id: "parking",
                          label: parkingFilter === "with" ? "含車位" : "不含車位",
                          onClear: () => setParkingFilter("any"),
                        });
                      }
                      if (nearbyKm != null) {
                        chips.push({
                          id: "nearby",
                          label: nearbyAnchor
                            ? `附近 ${nearbyKm}km · ${nearbyAnchor.label.slice(0, 12)}${nearbyAnchor.label.length > 12 ? "…" : ""}`
                            : `附近 ${nearbyKm}km（我的位置）`,
                          onClear: () => {
                            setNearbyKm(null);
                            setNearbyAnchor(null);
                          },
                        });
                      }
                      if (focusBuildCase) {
                        chips.push({
                          id: "focus-bc",
                          label: `建案: ${focusBuildCase}`,
                          onClear: () => setFocusBuildCase(null),
                        });
                      }
                      if (excludeSpecial) {
                        chips.push({
                          id: "exclude-special",
                          label: "已排除特殊交易",
                          onClear: () => setExcludeSpecial(false),
                          muted: true,
                        });
                      }
                      if (totalPriceMaxWan) {
                        chips.push({
                          id: "budget-max",
                          label: `總價 ≤ ${totalPriceMaxWan} 萬`,
                          onClear: () => setTotalPriceMaxWan(""),
                        });
                      }
                      if (activePresetId) {
                        const presetLabel =
                          activePresetId === "first-home"
                            ? "首購自住"
                            : activePresetId === "rent"
                              ? "租屋行情"
                              : "投資置產";
                        chips.push({
                          id: "preset",
                          label: `預設: ${presetLabel}`,
                          onClear: () => setActivePresetId(null),
                          muted: true,
                        });
                      }
      
                      return (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex flex-wrap items-center gap-1.5 overflow-hidden"
                        >
                          <span className="mr-0.5 text-[10px] font-black tracking-wide text-slate-400">已套用</span>
                          <AnimatePresence>
                            {chips.map(chip => (
                              <motion.span
                                key={chip.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                                  chip.muted
                                    ? "border-slate-200/80 bg-slate-100/80 text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/60 dark:text-slate-300"
                                    : "border-coral-200/60 bg-coral-500/10 text-coral-600 dark:border-coral-500/30 dark:bg-coral-500/15 dark:text-coral-400"
                                }`}
                              >
                                {chip.label}
                                {chip.onClear && (
                                  <button
                                    type="button"
                                    onClick={chip.onClear}
                                    className="w-3.5 h-3.5 rounded-full hover:bg-coral-500 hover:text-white flex items-center justify-center transition-colors shrink-0"
                                    aria-label={`清除 ${chip.label}`}
                                  >
                                    <X size={10} strokeWidth={3} />
                                  </button>
                                )}
                              </motion.span>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
      
                  {/* 進階篩選：去重後精簡 — 期間用快捷+年月、屋齡僅數字；附近改走上方捷運列 */}
                  <AnimatePresence>
                    {isAdvancedSearchOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, y: -8 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -8 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="relative space-y-4 rounded-[1.5rem] border border-slate-200/50 bg-white p-4 shadow-none dark:border-slate-800/60 dark:bg-slate-900 sm:p-5">
                          {/* 列 1：期間 · 單價 · 面積 · 屋齡 */}
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {/* 期間：快捷為主 + 年月微調（移除雙滑桿） */}
                            <div className="space-y-2">
                              <label className="ml-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                交易期間
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { label: "近12月", months: 12 },
                                  { label: "近24月", months: 24 },
                                  { label: "近3年", months: 36 },
                                ].map((preset) => {
                                  const now = new Date();
                                  const rocY = now.getFullYear() - 1911;
                                  const m = now.getMonth() + 1;
                                  let sy = rocY;
                                  let sm = m - (preset.months - 1);
                                  while (sm <= 0) {
                                    sy -= 1;
                                    sm += 12;
                                  }
                                  const clampY = (y: number) => Math.min(115, Math.max(101, y));
                                  const expect = {
                                    startY: String(clampY(sy)),
                                    startM: String(sm),
                                    endY: String(clampY(rocY)),
                                    endM: String(m),
                                  };
                                  const isActive =
                                    period.startY === expect.startY &&
                                    period.startM === expect.startM &&
                                    period.endY === expect.endY &&
                                    period.endM === expect.endM;
                                  return (
                                    <button
                                      key={preset.label}
                                      type="button"
                                      onClick={() => setPeriod(expect)}
                                      className={`h-8 rounded-lg border px-2.5 text-[11px] font-bold transition-colors ${
                                        isActive
                                          ? "border-coral-400/50 bg-coral-500/12 text-coral-700 dark:text-coral-300"
                                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-coral-300 hover:text-coral-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300"
                                      }`}
                                    >
                                      {preset.label}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 dark:border-slate-700 dark:bg-slate-950/40">
                                <select
                                  className="h-9 min-w-0 flex-1 appearance-none rounded-lg bg-transparent text-center text-xs font-bold outline-none"
                                  value={period.startY}
                                  onChange={(e) => setPeriod({ ...period, startY: e.target.value })}
                                >
                                  {YEARS.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                  ))}
                                </select>
                                <select
                                  className="h-9 w-12 appearance-none rounded-lg bg-transparent text-center text-xs font-bold outline-none"
                                  value={period.startM}
                                  onChange={(e) => setPeriod({ ...period, startM: e.target.value })}
                                >
                                  {MONTHS.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                                <span className="text-slate-300 dark:text-slate-600">–</span>
                                <select
                                  className="h-9 min-w-0 flex-1 appearance-none rounded-lg bg-transparent text-center text-xs font-bold outline-none"
                                  value={period.endY}
                                  onChange={(e) => setPeriod({ ...period, endY: e.target.value })}
                                >
                                  {YEARS.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                  ))}
                                </select>
                                <select
                                  className="h-9 w-12 appearance-none rounded-lg bg-transparent text-center text-xs font-bold outline-none"
                                  value={period.endM}
                                  onChange={(e) => setPeriod({ ...period, endM: e.target.value })}
                                >
                                  {MONTHS.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* 單價 */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                  單價
                                </label>
                                <div className="flex rounded-full border border-slate-200/80 bg-slate-50 p-0.5 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-950/50">
                                  <button
                                    type="button"
                                    onClick={() => setUnitPrice({ ...unitPrice, unit: "1" })}
                                    className={`rounded-full px-2 py-0.5 ${unitPrice.unit === "1" ? "bg-white text-coral-600 shadow-sm dark:bg-slate-800" : "text-slate-400"}`}
                                  >
                                    萬/坪
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setUnitPrice({ ...unitPrice, unit: "2" })}
                                    className={`rounded-full px-2 py-0.5 ${unitPrice.unit === "2" ? "bg-white text-coral-600 shadow-sm dark:bg-slate-800" : "text-slate-400"}`}
                                  >
                                    元/㎡
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  placeholder="最低"
                                  className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm font-bold outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-950/40"
                                  value={unitPrice.min}
                                  onChange={(e) => setUnitPrice({ ...unitPrice, min: e.target.value })}
                                />
                                <span className="text-slate-300">–</span>
                                <input
                                  type="number"
                                  placeholder="最高"
                                  className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm font-bold outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-950/40"
                                  value={unitPrice.max}
                                  onChange={(e) => setUnitPrice({ ...unitPrice, max: e.target.value })}
                                />
                              </div>
                            </div>

                            {/* 面積 */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                  面積
                                </label>
                                <div className="flex rounded-full border border-slate-200/80 bg-slate-50 p-0.5 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-950/50">
                                  <button
                                    type="button"
                                    onClick={() => setArea({ ...area, unit: "2" })}
                                    className={`rounded-full px-2 py-0.5 ${area.unit === "2" ? "bg-white text-coral-600 shadow-sm dark:bg-slate-800" : "text-slate-400"}`}
                                  >
                                    坪
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setArea({ ...area, unit: "1" })}
                                    className={`rounded-full px-2 py-0.5 ${area.unit === "1" ? "bg-white text-coral-600 shadow-sm dark:bg-slate-800" : "text-slate-400"}`}
                                  >
                                    ㎡
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  placeholder="最低"
                                  className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm font-bold outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-950/40"
                                  value={area.min}
                                  onChange={(e) => setArea({ ...area, min: e.target.value })}
                                />
                                <span className="text-slate-300">–</span>
                                <input
                                  type="number"
                                  placeholder="最高"
                                  className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm font-bold outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-950/40"
                                  value={area.max}
                                  onChange={(e) => setArea({ ...area, max: e.target.value })}
                                />
                              </div>
                            </div>

                            {/* 屋齡：僅數字（移除雙滑桿） */}
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                屋齡（年）
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  placeholder="最低"
                                  min={0}
                                  max={80}
                                  className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm font-bold outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-950/40"
                                  value={age.min}
                                  onChange={(e) => setAge({ ...age, min: e.target.value })}
                                />
                                <span className="text-slate-300">–</span>
                                <input
                                  type="number"
                                  placeholder="最高"
                                  min={0}
                                  max={80}
                                  className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm font-bold outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-950/40"
                                  value={age.max}
                                  onChange={(e) => setAge({ ...age, max: e.target.value })}
                                />
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {[
                                  { label: "5年內", min: "", max: "5" },
                                  { label: "10年內", min: "", max: "10" },
                                  { label: "20–40年", min: "20", max: "40" },
                                ].map((p) => (
                                  <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => setAge({ min: p.min, max: p.max })}
                                    className="h-7 rounded-md border border-slate-200 px-2 text-[10px] font-bold text-slate-500 hover:border-coral-300 hover:text-coral-600 dark:border-slate-700"
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* 列 2：格局 · 管理 · 車位 · 排除特殊（同一列 chip） */}
                          <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 dark:border-slate-800/80 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="mr-1 text-[10px] font-black uppercase tracking-wider text-slate-400">格局</span>
                              {["", "1", "2", "3", "4"].map((n) => (
                                <button
                                  key={n || "any"}
                                  type="button"
                                  onClick={() => setRoomsMin(n)}
                                  className={`h-8 rounded-lg border px-2.5 text-[11px] font-bold transition-all ${
                                    roomsMin === n
                                      ? "border-coral-400/50 bg-coral-500/12 text-coral-700 dark:text-coral-300"
                                      : "border-slate-200 text-slate-500 dark:border-slate-700"
                                  }`}
                                >
                                  {n === "" ? "不限" : `≥${n}房`}
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="mr-1 text-[10px] font-black uppercase tracking-wider text-slate-400">管理</span>
                              {(
                                [
                                  { v: "any" as const, label: "不限" },
                                  { v: "yes" as const, label: "有" },
                                  { v: "no" as const, label: "無" },
                                ] as const
                              ).map((opt) => (
                                <button
                                  key={opt.v}
                                  type="button"
                                  onClick={() => setHasManagement(opt.v)}
                                  className={`h-8 rounded-lg border px-2.5 text-[11px] font-bold transition-all ${
                                    hasManagement === opt.v
                                      ? "border-coral-400/50 bg-coral-500/12 text-coral-700 dark:text-coral-300"
                                      : "border-slate-200 text-slate-500 dark:border-slate-700"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="mr-1 text-[10px] font-black uppercase tracking-wider text-slate-400">車位</span>
                              {(
                                [
                                  { v: "any" as const, label: "不限" },
                                  { v: "with" as const, label: "含" },
                                  { v: "without" as const, label: "不含" },
                                ] as const
                              ).map((opt) => (
                                <button
                                  key={opt.v}
                                  type="button"
                                  onClick={() => setParkingFilter(opt.v)}
                                  className={`h-8 rounded-lg border px-2.5 text-[11px] font-bold transition-all ${
                                    parkingFilter === opt.v
                                      ? "border-coral-400/50 bg-coral-500/12 text-coral-700 dark:text-coral-300"
                                      : "border-slate-200 text-slate-500 dark:border-slate-700"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={excludeSpecial}
                              title="排除親友／關係人等特殊交易"
                              onClick={() => setExcludeSpecial((v: boolean) => !v)}
                              className={`ml-auto inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[11px] font-bold transition-all ${
                                excludeSpecial
                                  ? "border-rose-300/50 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                  : "border-slate-200 text-slate-500 dark:border-slate-700"
                              }`}
                            >
                              <span
                                className={`relative h-3.5 w-6 rounded-full transition-colors ${
                                  excludeSpecial ? "bg-rose-500" : "bg-slate-300 dark:bg-slate-600"
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow transition-transform ${
                                    excludeSpecial ? "left-3" : "left-0.5"
                                  }`}
                                />
                              </span>
                              排除特殊交易
                            </button>
                          </div>

                          <p className="text-[10px] font-medium leading-relaxed text-slate-400">
                            附近距離請用上方「捷運／地標附近」；物件詳情也可「以此為中心找附近」。
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                     </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
      
    </>
  );
}
