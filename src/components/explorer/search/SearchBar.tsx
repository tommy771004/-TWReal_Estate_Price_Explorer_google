import { ChevronDown, Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeywordInput, type TrendingSearch } from "./KeywordInput";

type Props = {
  cityName: string;
  district: string;
  onOpenLocation: () => void;

  search: string;
  setSearch: (v: string) => void;
  placeholder: string;
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  addressSuggestions: string[];
  recentSearches: string[];
  clearRecentSearches: () => void;
  trendingSearches: TrendingSearch[];
  onPickRecent: (q: string) => void;
  onPickTrending: (t: TrendingSearch) => void;

  loading: boolean;
  onSubmit: () => void;
};

/**
 * 常駐搜尋列：區域 + 關鍵字 + 查詢。
 *
 * 手機（< md）：區域縮成 chip 和搜尋框同一列，查詢鈕縮成搜尋框右端的圓形按鈕。
 * md 以上：區域卡片 + 搜尋框 + 獨立的「查詢」按鈕（lg 起同一列）。
 */
export function SearchBar({
  cityName,
  district,
  onOpenLocation,
  search,
  setSearch,
  placeholder,
  showSuggestions,
  setShowSuggestions,
  addressSuggestions,
  recentSearches,
  clearRecentSearches,
  trendingSearches,
  onPickRecent,
  onPickTrending,
  loading,
  onSubmit,
}: Props) {
  const locationLabel = `${cityName}${district !== "全部" ? ` · ${district}` : ""}`;

  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 flex-row gap-2 md:gap-2.5">
        <button
          type="button"
          onClick={onOpenLocation}
          aria-label={`縣市 / 行政區：${locationLabel}`}
          className="flex h-12 max-w-[42%] shrink-0 items-center gap-1.5 rounded-full bg-surface-container-highest border border-outline-variant/60 px-3 text-left outline-none transition-all hover:bg-surface-container-highest/80 hover:border-outline focus:ring-2 focus:ring-primary/20 shadow-xs md:h-[52px] md:w-[220px] md:max-w-none md:justify-between md:gap-3 md:px-4"
        >
          <span className="flex min-w-0 items-center gap-1.5 md:gap-2.5">
            <MapPin size={16} className="shrink-0 text-primary md:hidden" aria-hidden="true" />
            <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container md:flex">
              <MapPin size={16} aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="hidden text-[10px] font-bold uppercase tracking-wider leading-none text-on-surface-variant md:block">
                縣市 / 行政區
              </span>
              <span className="truncate text-sm font-semibold leading-none text-on-surface">
                {locationLabel}
              </span>
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-on-surface-variant/70" aria-hidden="true" />
        </button>

        <KeywordInput
          value={search}
          onChange={setSearch}
          placeholder={placeholder}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          addressSuggestions={addressSuggestions}
          recentSearches={recentSearches}
          clearRecentSearches={clearRecentSearches}
          trendingSearches={trendingSearches}
          onPickRecent={onPickRecent}
          onPickTrending={onPickTrending}
          onSubmit={onSubmit}
          trailing={
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              aria-label={loading ? "查詢中" : "查詢"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          }
        />
      </div>

      <div className="hidden items-center gap-2.5 md:flex">
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="h-[52px] flex-1 whitespace-nowrap rounded-full bg-primary text-on-primary hover:bg-primary/90 hover:shadow-[var(--md-elevation-1)] px-8 text-sm font-semibold shadow-xs transition-all lg:flex-none"
        >
          <Search className="mr-2 h-4 w-4" />
          {loading ? "查詢中…" : "查詢"}
        </Button>
      </div>
    </div>
  );
}
