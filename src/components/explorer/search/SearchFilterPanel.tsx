import { motion } from "motion/react";
import { getDefaultPeriod } from "../../../utils/real-estate-helpers";
import { hasHousingPropertyType, type FilterGroupId } from "../../../constants/filterLabels";
import { useExplorerUi } from "../ExplorerUiContext";
import { SearchBar } from "./SearchBar";
import { FilterPillBar } from "./FilterPillBar";
import { FilterSheet } from "./FilterSheet";
import { AppliedFilterChips } from "./AppliedFilterChips";
import { PropertyTypeChips } from "./PropertyTypeChips";
import { isRentType } from "../../../utils/priceUnits";
import { TransactionTypeTabs } from "./TransactionTypeTabs";
import { ScenarioPresetChips } from "./ScenarioPresetChips";
import { emptyDraft, type FilterDraft } from "./filterDraft";

export function SearchFilterPanel() {
  const {
    cityName,
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
    totalPriceMinWan, setTotalPriceMinWan,
    totalPriceMaxWan, setTotalPriceMaxWan,
    activePresetId, setActivePresetId,
    nearbyKm, setNearbyKm,
    nearbyAnchor, setNearbyAnchor,
    focusBuildCase, setFocusBuildCase,
    userLocation,
    setIsLocationModalOpen,
    setIsFilterMenuOpen,
    showSuggestions, setShowSuggestions,
    loading,
    appTexts,
    setViewMode,
    data,
    fetchData,
    addressSuggestions,
    recentSearches, clearRecentSearches,
    trendingSearches, handleTrendingClick,
    applyQueryPreset,
  } = useExplorerUi();

  /** context 的篩選值攤成單一草稿物件 */
  const applied: FilterDraft = {
    propertyTypes,
    totalPriceMinWan,
    totalPriceMaxWan,
    unitPrice,
    area,
    age,
    roomsMin,
    hasManagement,
    parkingFilter,
    period,
    excludeSpecial,
    nearbyKm,
    nearbyAnchor,
  };

  /** 把草稿差異寫回既有 setter（桌機即時、手機套用時一次呼叫） */
  const writeDraft = (patch: Partial<FilterDraft>) => {
    if (patch.propertyTypes !== undefined) setPropertyTypes(patch.propertyTypes);
    if (patch.totalPriceMinWan !== undefined) setTotalPriceMinWan(patch.totalPriceMinWan);
    if (patch.totalPriceMaxWan !== undefined) setTotalPriceMaxWan(patch.totalPriceMaxWan);
    if (patch.unitPrice !== undefined) setUnitPrice(patch.unitPrice);
    if (patch.area !== undefined) setArea(patch.area);
    if (patch.age !== undefined) setAge(patch.age);
    if (patch.roomsMin !== undefined) setRoomsMin(patch.roomsMin);
    if (patch.hasManagement !== undefined) setHasManagement(patch.hasManagement);
    if (patch.parkingFilter !== undefined) setParkingFilter(patch.parkingFilter);
    if (patch.period !== undefined) setPeriod(patch.period);
    if (patch.excludeSpecial !== undefined) setExcludeSpecial(patch.excludeSpecial);
    if (patch.nearbyKm !== undefined) setNearbyKm(patch.nearbyKm);
    if (patch.nearbyAnchor !== undefined) setNearbyAnchor(patch.nearbyAnchor);
  };

  const clearGroup = (id: FilterGroupId) => {
    const blank = emptyDraft();
    switch (id) {
      case "price":
        writeDraft({
          totalPriceMinWan: "",
          totalPriceMaxWan: "",
          unitPrice: blank.unitPrice,
        });
        break;
      case "area":
        writeDraft({ area: blank.area });
        break;
      case "layout":
        writeDraft({ roomsMin: "", parkingFilter: "any", hasManagement: "any" });
        break;
      case "age":
        writeDraft({ age: blank.age });
        break;
      case "period":
        writeDraft({ period: getDefaultPeriod() });
        break;
      case "more":
        writeDraft({ excludeSpecial: true, nearbyKm: null, nearbyAnchor: null });
        break;
    }
    setActivePresetId(null);
  };

  const clearAll = () => {
    writeDraft(emptyDraft());
    setFocusBuildCase(null);
    setActivePresetId(null);
  };

  /** 交易型態只在選了跟房子有關的標的時才有意義 */
  const showTransactionType = hasHousingPropertyType(propertyTypes);

  /** 只剩土地／車位時，預售屋與租屋不存在對應的實價登錄，
      必須把交易型態拉回買賣，否則會靜默篩成 0 筆 */
  const syncTypeNameWith = (nextPropertyTypes: string[]) => {
    if (!hasHousingPropertyType(nextPropertyTypes) && typeName !== "買賣") {
      setTypeName("買賣");
      setViewMode("list");
    }
  };

  const handlePropertyTypesChange = (next: string[]) => {
    writeDraft({ propertyTypes: next });
    syncTypeNameWith(next);
  };

  return (
    <div data-search-panel className="mx-auto mb-3 w-full max-w-[1600px] scroll-mt-3 sm:mb-4">
      <motion.div
        layout="position"
        animate={{
          boxShadow: loading
            ? "0 0 25px 6px rgba(237, 111, 92, 0.18), 0 20px 40px -18px rgba(0, 0, 0, 0.22)"
            : "0 20px 40px -18px rgba(0, 0, 0, 0.22)",
        }}
        transition={{ duration: 0.4 }}
        className="relative flex flex-col gap-2.5 overflow-visible rounded-[28px] bg-surface-container border border-outline-variant/40 p-3 sm:px-5 sm:py-4 md:gap-3.5 shadow-[var(--md-elevation-1)]"
      >
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-[28px] bg-primary-container"
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              className="h-full w-1/3 bg-primary rounded-full"
            />
          </motion.div>
        )}

        <SearchBar
          cityName={cityName}
          district={district}
          onOpenLocation={() => setIsLocationModalOpen(true)}
          search={search}
          setSearch={setSearch}
          placeholder={appTexts.searchPlaceholder}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          addressSuggestions={addressSuggestions}
          recentSearches={recentSearches}
          clearRecentSearches={clearRecentSearches}
          trendingSearches={trendingSearches}
          onPickRecent={(q) => fetchData(q)}
          onPickTrending={handleTrendingClick}
          loading={loading}
          onSubmit={() => fetchData()}
        />

        {/* 分類列：標的種類是主要大分類；交易型態附屬於它，
            只有選了跟房子有關的標的才出現。
            手機把標的種類收進篩選抽屜，這一列只剩交易型態＋「篩選」按鈕。 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* 租屋不套用標的種類（租賃資料的標的是「租賃房屋」等），不顯示這組選項 */}
          {!isRentType(typeName) && (
            <div className="hidden md:block">
              <PropertyTypeChips value={propertyTypes} onChange={handlePropertyTypesChange} />
            </div>
          )}

          {showTransactionType && (
            <div className="flex items-center gap-2">
              <span className="hidden shrink-0 text-[10px] font-black tracking-wide text-slate-400 sm:inline">
                交易型態
              </span>
              <TransactionTypeTabs
                value={typeName}
                onChange={(name) => {
                  setTypeName(name);
                  setViewMode(name === "預售屋" ? "aggregated" : "list");
                }}
              />
            </div>
          )}

          <div className="ml-auto md:hidden">
            <FilterSheet
              applied={applied}
              onApply={(draft, refetch) => {
                writeDraft(draft);
                syncTypeNameWith(draft.propertyTypes);
                if (refetch) window.setTimeout(() => fetchData(), 0);
              }}
              onOpenChange={setIsFilterMenuOpen}
              cityName={cityName}
              typeName={typeName}
              district={district}
              search={search}
              focusBuildCase={focusBuildCase}
              userLocation={userLocation}
              data={data}
              appliedPeriod={period}
            />
          </div>
        </div>

        <div className="hidden md:block">
          <FilterPillBar
            draft={applied}
            onPatch={writeDraft}
            onClearGroup={clearGroup}
            onClearAll={clearAll}
            cityName={cityName}
            onOpenChange={setIsFilterMenuOpen}
            rent={isRentType(typeName)}
          />
        </div>

        <AppliedFilterChips
            values={{
              cityName, district, typeName, period, search, propertyTypes,
              unitPrice, area, age, roomsMin, hasManagement, parkingFilter,
              nearbyKm, nearbyAnchor, focusBuildCase, excludeSpecial,
              totalPriceMinWan, totalPriceMaxWan, activePresetId,
            }}
            actions={{
              setDistrict, setTypeName, setViewMode, setPeriod, setSearch,
              setPropertyTypes, setUnitPrice, setArea, setAge, setRoomsMin,
              setHasManagement, setParkingFilter, setNearbyKm, setNearbyAnchor,
              setFocusBuildCase, setExcludeSpecial, setTotalPriceMinWan,
            setTotalPriceMaxWan, setActivePresetId,
          }}
          fallback={<ScenarioPresetChips onApplyPreset={applyQueryPreset} />}
        />
      </motion.div>
    </div>
  );
}
