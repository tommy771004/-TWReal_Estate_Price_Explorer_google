import { AnimatePresence, motion } from "motion/react";
import { Clock, Search, TrendingUp } from "lucide-react";

export type TrendingSearch = { query: string; count: number };

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  showSuggestions: boolean;
  setShowSuggestions: (open: boolean) => void;
  addressSuggestions: string[];
  recentSearches: string[];
  clearRecentSearches: () => void;
  trendingSearches: TrendingSearch[];
  /** 點擊最近搜尋：直接以該關鍵字重新查詢 */
  onPickRecent: (query: string) => void;
  onPickTrending: (item: TrendingSearch) => void;
};

/** 關鍵字輸入 + 自動完成 / 最近搜尋 / 熱門搜尋下拉。 */
export function KeywordInput({
  value,
  onChange,
  placeholder,
  showSuggestions,
  setShowSuggestions,
  addressSuggestions,
  recentSearches,
  clearRecentSearches,
  trendingSearches,
  onPickRecent,
  onPickTrending,
}: Props) {
  const hasDropdown =
    addressSuggestions.length > 0 || recentSearches.length > 0 || trendingSearches.length > 0;

  return (
    <div className="relative group flex-1">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-on-surface-variant group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-200" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-11 pr-4 h-[52px] rounded-full bg-surface-container-highest border border-outline-variant/60 text-on-surface placeholder:text-on-surface-variant/60 outline-none text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />

      <AnimatePresence>
        {showSuggestions && hasDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-[calc(100%+8px)] left-0 w-full bg-surface-container-high border border-outline-variant/40 rounded-[24px] shadow-[var(--md-elevation-3)] overflow-hidden py-3 z-50 max-h-[460px] overflow-y-auto"
          >
            {addressSuggestions.length > 0 ? (
              addressSuggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="mx-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-on-surface hover:bg-on-surface/8 cursor-pointer transition-colors"
                  onClick={() => {
                    onChange(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </div>
              ))
            ) : (
              <div className="flex flex-col gap-4">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-4 pb-2 mb-1 border-b border-outline-variant/30">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" /> 最近搜尋
                      </span>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={clearRecentSearches}
                        className="text-xs font-semibold text-primary hover:underline transition-colors"
                      >
                        清除
                      </button>
                    </div>
                    <div className="flex flex-col gap-0.5 px-1.5">
                      {recentSearches.map((query) => (
                        <div
                          key={query}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-on-surface hover:bg-on-surface/8 cursor-pointer transition-colors"
                          onClick={() => {
                            setShowSuggestions(false);
                            onPickRecent(query);
                          }}
                        >
                          <Clock className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                          <span className="truncate">{query}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trendingSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-4 pb-2 mb-2 border-b border-outline-variant/30">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" /> 熱門搜尋
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 px-3">
                      {trendingSearches.map((item, idx) => (
                        <div
                          key={item.query}
                          onMouseDown={(e) => e.preventDefault()}
                          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-on-surface bg-surface-container hover:bg-primary-container/40 hover:text-on-primary-container cursor-pointer border border-outline-variant/30 rounded-xl transition-colors"
                          onClick={() => onPickTrending(item)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`flex items-center justify-center rounded-md text-[10px] font-bold shrink-0 ${
                                idx < 3
                                  ? "bg-primary text-on-primary"
                                  : "bg-surface-container-highest text-on-surface-variant"
                              }`}
                              style={{ width: "18px", height: "18px" }}
                            >
                              {idx + 1}
                            </span>
                            <span className="truncate pr-1">{item.query}</span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant scale-90 origin-right shrink-0">
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
  );
}
