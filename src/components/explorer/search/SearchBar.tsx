import { ChevronDown, MapPin, Search } from "lucide-react";
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

/** 常駐搜尋列：區域 + 關鍵字 + 查詢。標的種類與交易型態在下一列的分類區。 */
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
  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
      <div className="flex flex-1 flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={onOpenLocation}
          className="flex h-[52px] shrink-0 items-center justify-between gap-3 rounded-full bg-surface-container-highest border border-outline-variant/60 px-4 text-left outline-none transition-all hover:bg-surface-container-highest/80 hover:border-outline focus:ring-2 focus:ring-primary/20 sm:w-[220px] shadow-xs"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              <MapPin size={16} />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-on-surface-variant">
                縣市 / 行政區
              </span>
              <span className="truncate text-sm font-semibold leading-none text-on-surface">
                {cityName}
                {district !== "全部" ? ` · ${district}` : ""}
              </span>
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-on-surface-variant/70" />
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
        />
      </div>

      <div className="flex items-center gap-2.5">
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
