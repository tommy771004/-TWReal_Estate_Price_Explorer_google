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
          className="liquid-glass-input flex h-[52px] shrink-0 items-center justify-between gap-3 rounded-[1rem] px-4 text-left outline-none transition-all hover:border-coral-500/50 hover:shadow-md sm:w-[210px]"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-coral-500/10">
              <MapPin size={16} className="text-coral-500" />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none text-slate-500 dark:text-slate-400">
                縣市 / 行政區
              </span>
              <span className="truncate text-[15px] font-bold leading-none text-ink dark:text-white">
                {cityName}
                {district !== "全部" ? ` · ${district}` : ""}
              </span>
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-40" />
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
          className="liquid-glass-button-primary h-[52px] flex-1 whitespace-nowrap rounded-[1rem] px-7 text-sm font-bold shadow-md lg:flex-none"
        >
          <Search className="mr-2 h-4 w-4" />
          {loading ? "查詢中…" : "查詢"}
        </Button>
      </div>
    </div>
  );
}
