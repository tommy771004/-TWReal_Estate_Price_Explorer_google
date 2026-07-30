import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpDown, MapPin, Search, SlidersHorizontal, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QueryAssistBar } from "../../QueryAssistBar";
import { DEFAULT_PROPERTY_TYPES } from "../../../lib/urlState";
import { getDefaultPeriod } from "../../../utils/real-estate-helpers";
import { useExplorerUi } from "../ExplorerUiContext";
import { MobileCollapsedSummary } from "./MobileCollapsedSummary";
import { KeywordInput } from "./KeywordInput";
import { TransactionTypeTabs } from "./TransactionTypeTabs";
import { PropertyTypeChips } from "./PropertyTypeChips";
import { AppliedFilterChips } from "./AppliedFilterChips";
import { AdvancedFilterBlock } from "./AdvancedFilterBlock";

export function SearchFilterPanel() {
  const [isQueryAssistOpen, setIsQueryAssistOpen] = React.useState(false);
  const {
    cityName, setCityName,
    typeName, setTypeName,
    district, setDistrict,
    search, setSearch,
    propertyTypes, setPropertyTypes,
    period, setPeriod,
    unitPrice, setUnitPrice,
    area, setArea,
    age, setAge,
    roomsMin, setRoomsMin,
    hasManagement, setHasManagement,
    parkingFilter, setParkingFilter,
    excludeSpecial, setExcludeSpecial,
    totalPriceMaxWan, setTotalPriceMaxWan,
    activePresetId, setActivePresetId,
    nearbyKm, setNearbyKm,
    nearbyAnchor, setNearbyAnchor,
    focusBuildCase, setFocusBuildCase,
    isSearchExpanded, setIsSearchExpanded,
    isAdvancedSearchOpen, setIsAdvancedSearchOpen,
    setIsLocationModalOpen,
    showSuggestions, setShowSuggestions,
    loading,
    appTexts,
    setViewMode,
    fetchData,
    addressSuggestions,
    recentSearches, clearRecentSearches,
    trendingSearches, handleTrendingClick,
    applyQueryPreset, applyBudgetWan,
  } = useExplorerUi();

  const resetAll = () => {
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
  };

  const hasAssistFilters = Boolean(activePresetId || totalPriceMaxWan || nearbyKm != null);

  return (
    <>
      <AnimatePresence>
        {!isSearchExpanded && (
          <MobileCollapsedSummary
            cityName={cityName}
            district={district}
            search={search}
            onExpand={() => setIsSearchExpanded(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isSearchExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, scale: 0.985, y: -8 }}
            animate={{ height: "auto", opacity: 1, scale: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, scale: 0.985, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[1600px] mx-auto w-full z-10 overflow-hidden"
          >
            <motion.div
              layout="position"
              animate={{
                borderColor: loading ? "rgba(237, 111, 92, 0.45)" : "rgba(255, 255, 255, 0.15)",
                boxShadow: loading
                  ? "0 0 25px 6px rgba(237, 111, 92, 0.22), 0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden flex flex-col gap-2 sm:gap-4 liquid-glass-panel p-3 sm:px-6 sm:py-4 rounded-[2rem] shadow-none mx-0 mb-2 sm:mx-1 sm:mb-4 mt-1 sm:mt-0"
            >
              {/* 載入中的細進度條 */}
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

              {/* 上排：區域 + 關鍵字 */}
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
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest leading-none mt-0.5">
                        選擇區域
                      </span>
                      <span className="font-bold text-ink dark:text-white text-[15px] leading-none mb-0.5 mt-0.5 truncate max-w-[120px]">
                        {cityName} {district !== "全部" ? `· ${district}` : ""}
                      </span>
                    </div>
                  </div>
                  <ArrowUpDown className="w-3 h-3 opacity-30 shrink-0" />
                </button>

                <KeywordInput
                  value={search}
                  onChange={setSearch}
                  placeholder={appTexts.searchPlaceholder}
                  showSuggestions={showSuggestions}
                  setShowSuggestions={setShowSuggestions}
                  addressSuggestions={addressSuggestions}
                  recentSearches={recentSearches}
                  clearRecentSearches={clearRecentSearches}
                  trendingSearches={trendingSearches}
                  onPickRecent={(query) => fetchData(query)}
                  onPickTrending={handleTrendingClick}
                />
              </div>

              {/* 下排：型態 / 種類 + 動作 */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end sm:justify-between">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center min-w-0">
                  <TransactionTypeTabs
                    value={typeName}
                    onChange={(name) => {
                      setTypeName(name);
                      setViewMode(name === "預售屋" ? "aggregated" : "list");
                    }}
                  />

                  <div className="w-full sm:w-px h-px sm:h-10 bg-white/40 dark:bg-white/5 mx-0 sm:mx-2" />

                  <div className="flex flex-col gap-1.5 w-full sm:w-auto min-w-0">
                    <PropertyTypeChips value={propertyTypes} onChange={setPropertyTypes} />
                  </div>
                </div>

                <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
                    className={`flex-1 sm:flex-none text-xs sm:text-sm font-bold ${
                      isAdvancedSearchOpen
                        ? "text-coral-600 dark:text-coral-400 bg-coral-500/10 dark:bg-coral-500/20 border-coral-500/30 shadow-inner"
                        : "text-slate-600 dark:text-slate-300 border-transparent"
                    } hover:text-coral-700 hover:bg-coral-50 dark:hover:bg-coral-900/30 rounded-[1.25rem] h-11 transition-all gap-2 px-4 border shadow-sm`}
                  >
                    <div className="relative">
                      <SlidersHorizontal className="w-4 h-4" />
                      {isAdvancedSearchOpen && (
                        <motion.div className="absolute -top-1 -right-1 w-2 h-2 bg-coral-500 shadow-[0_0_8px_rgba(237,111,92,0.5)] rounded-full" />
                      )}
                    </div>
                    {appTexts.advancedSearch}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsQueryAssistOpen(true)}
                    className={`flex-1 sm:flex-none h-11 gap-2 rounded-[1.25rem] border border-transparent px-4 text-xs font-bold shadow-sm transition-all sm:text-sm ${
                      hasAssistFilters
                        ? "border-violet-400/40 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                        : "text-slate-600 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-violet-950/30"
                    }`}
                    title="場景、預算、捷運生活圈"
                  >
                    <div className="relative">
                      <Sparkles className="h-4 w-4" />
                      {hasAssistFilters && (
                        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                      )}
                    </div>
                    查詢加速
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={resetAll}
                    className="flex-1 sm:flex-none h-11 px-4 rounded-[1.25rem] text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-coral-500/5 transition-all text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {appTexts.clearAll}
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

              <AnimatePresence>
                <AppliedFilterChips
                  values={{
                    cityName, district, typeName, period, search, propertyTypes,
                    unitPrice, area, age, roomsMin, hasManagement, parkingFilter,
                    nearbyKm, nearbyAnchor, focusBuildCase, excludeSpecial,
                    totalPriceMaxWan, activePresetId,
                  }}
                  actions={{
                    setDistrict, setTypeName, setViewMode, setPeriod, setSearch,
                    setPropertyTypes, setUnitPrice, setArea, setAge, setRoomsMin,
                    setHasManagement, setParkingFilter, setNearbyKm, setNearbyAnchor,
                    setFocusBuildCase, setExcludeSpecial, setTotalPriceMaxWan,
                    setActivePresetId,
                  }}
                />
              </AnimatePresence>

              <AnimatePresence>
                {isAdvancedSearchOpen && (
                  <AdvancedFilterBlock
                    period={period}
                    setPeriod={setPeriod}
                    unitPrice={unitPrice}
                    setUnitPrice={setUnitPrice}
                    area={area}
                    setArea={setArea}
                    age={age}
                    setAge={setAge}
                    roomsMin={roomsMin}
                    setRoomsMin={setRoomsMin}
                    hasManagement={hasManagement}
                    setHasManagement={setHasManagement}
                    parkingFilter={parkingFilter}
                    setParkingFilter={setParkingFilter}
                    excludeSpecial={excludeSpecial}
                    setExcludeSpecial={setExcludeSpecial}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
