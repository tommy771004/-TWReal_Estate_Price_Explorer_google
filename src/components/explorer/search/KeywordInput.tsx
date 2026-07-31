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
        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-coral-500 group-focus-within:scale-110 transition-all duration-300" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-11 liquid-glass-input h-[52px] rounded-[1rem] outline-none text-sm font-bold placeholder:text-slate-400 shadow-sm"
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
            className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-xl shadow-lg overflow-hidden py-3 z-50 max-h-[460px] overflow-y-auto"
          >
            {addressSuggestions.length > 0 ? (
              addressSuggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-coral-500/10 hover:text-coral-600 dark:hover:text-coral-400 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
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
                      {recentSearches.map((query) => (
                        <div
                          key={query}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-coral-500/5 hover:text-coral-600 dark:hover:text-coral-400 cursor-pointer transition-colors"
                          onClick={() => {
                            setShowSuggestions(false);
                            onPickRecent(query);
                          }}
                        >
                          <Clock className="w-3.5 h-3.5 opacity-40 shrink-0" />
                          <span className="truncate">{query}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trendingSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-4 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">
                        <TrendingUp className="w-3 h-3 text-coral-500" /> 熱門搜尋
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 px-4">
                      {trendingSearches.map((item, idx) => (
                        <div
                          key={item.query}
                          onMouseDown={(e) => e.preventDefault()}
                          className="flex items-center justify-between px-3 py-2 text-[12px] font-bold text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-coral-500/10 hover:text-coral-600 dark:bg-slate-850 dark:hover:bg-coral-500/10 dark:hover:text-coral-400 cursor-pointer border border-slate-100/80 dark:border-slate-800/60 rounded-xl transition-all duration-200 shadow-sm"
                          onClick={() => onPickTrending(item)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`flex items-center justify-center rounded-md text-[10px] font-black shrink-0 ${
                                idx < 3
                                  ? "bg-coral-500 text-white shadow-sm"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                              }`}
                              style={{ width: "18px", height: "18px" }}
                            >
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
  );
}
