import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV_GROUPS } from "../content/siteNav";
import {
  Database,
  Heart,
  MessageSquare,
  Moon,
  RotateCw,
  Settings,
  Sun,
} from "lucide-react";
import type { Transaction } from "../types/real-estate";

interface SiteNavProps {
  brandAsHeading?: boolean;
  onSettingsClick?: () => void;
  settingsTitle?: string;
  favorites?: Transaction[];
  onSelectFavorite?: (item: Transaction) => void;
  onToggleFavorite?: (item: Transaction, event?: ReactMouseEvent) => void;
  loading?: boolean;
  onRefresh?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  showFeedback?: boolean;
  onToggleFeedback?: () => void;
}

// 頂部分組導覽列：每個分類以下拉選單收納指南頁，減少首頁資訊堆疊。
export function SiteNav({
  brandAsHeading = false,
  onSettingsClick,
  settingsTitle,
  favorites = [],
  onSelectFavorite,
  onToggleFavorite,
  loading = false,
  onRefresh,
  darkMode = false,
  onToggleDarkMode,
  showFeedback = false,
  onToggleFeedback,
}: SiteNavProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // 點擊外部或按 Esc 時關閉下拉
  useEffect(() => {
    if (!openGroup && !favoritesOpen) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
        setFavoritesOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenGroup(null);
        setFavoritesOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [favoritesOpen, openGroup]);

  return (
    <nav
      ref={navRef}
      aria-label="主要導覽"
      className="relative z-30 border-b border-white/60 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85"
    >
      <div className="mx-auto flex min-h-14 max-w-[1600px] items-center justify-between gap-2 px-2 sm:min-h-16 sm:px-6">
        <a href="/" className="flex min-w-0 shrink items-center gap-2 py-2 text-ink dark:text-white sm:gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-coral-500/15 bg-coral-500/10 text-coral-600 dark:bg-coral-500/15 dark:text-coral-400 sm:h-10 sm:w-10">
            <Database className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </span>
          <span className="min-w-0">
            {brandAsHeading ? (
              <h1 className="truncate font-display text-base font-black tracking-tight sm:text-lg">
                實價登錄查詢
              </h1>
            ) : (
              <span className="block truncate font-display text-base font-black tracking-tight sm:text-lg">
                實價登錄查詢
              </span>
            )}
            <span className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 2xl:block">
              Taiwan Real Estate Price Explorer
            </span>
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {/* 桌面：下拉選單 */}
          <ul className="mr-1 hidden items-center gap-0.5 xl:flex">
            {NAV_GROUPS.map((group) => {
              const isOpen = openGroup === group.label;
              return (
                <li key={group.label} className="relative">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenGroup(isOpen ? null : group.label)}
                    className={`rounded-lg px-3 py-2 text-sm font-bold transition ${isOpen ? "bg-coral-500/10 text-coral-600 dark:text-coral-400" : "text-slate-600 hover:text-coral-600 dark:text-slate-300 dark:hover:text-coral-400"}`}
                  >
                    {group.label}
                  </button>
                  {isOpen && (
                    <div className="absolute left-0 top-full z-40 mt-1 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
                      <ul className="flex flex-col p-1.5">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <a
                              href={link.href}
                              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-coral-500/10 hover:text-coral-600 dark:text-slate-300 dark:hover:text-coral-400"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {onSelectFavorite && onToggleFavorite && (
            <div className="relative">
              <button
                type="button"
                aria-expanded={favoritesOpen}
                onClick={() => setFavoritesOpen((value) => !value)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition ${
                  favoritesOpen
                    ? "bg-red-500/10 text-red-500"
                    : "text-slate-500 hover:bg-red-500/10 hover:text-red-500 dark:text-slate-400"
                }`}
                title="我的最愛"
                aria-label="我的最愛"
              >
                <Heart className={`h-4.5 w-4.5 ${favorites.length > 0 ? "fill-current" : ""}`} />
                {favorites.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                    {favorites.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {favoritesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full z-50 mt-2 flex max-h-[min(400px,70dvh)] w-[min(18rem,calc(100vw-0.75rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/98 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/98"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <Heart className="h-3 w-3 fill-current text-red-500" /> 我的收藏
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{favorites.length} 筆</span>
                    </div>
                    <div className="flex flex-col gap-1.5 overflow-y-auto p-2 [scrollbar-width:none]">
                      {favorites.length === 0 ? (
                        <div className="py-6 text-center text-xs font-medium text-slate-400">目前沒有收藏任何物件</div>
                      ) : (
                        favorites.map((favorite) => (
                          <div
                            key={favorite.id}
                            className="flex items-start gap-1 rounded-xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800/80"
                          >
                            <button
                              type="button"
                              className="flex min-w-0 flex-1 flex-col p-1 text-left"
                              onClick={() => {
                                setFavoritesOpen(false);
                                onSelectFavorite(favorite);
                              }}
                            >
                              <span className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                                {favorite.address}
                              </span>
                              <span className="mt-0.5 flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-500">{favorite.district}</span>
                                {favorite.unitPrice && (
                                  <span className="text-[10px] font-bold text-coral-500">
                                    {((parseFloat(favorite.unitPrice) * 3.30578) / 10000).toFixed(1)} 萬/坪
                                  </span>
                                )}
                              </span>
                            </button>
                            <button
                              type="button"
                              aria-label="取消收藏"
                              onClick={(event) => onToggleFavorite(favorite, event)}
                              className="rounded-full p-1 text-red-400 transition hover:bg-red-500/10 hover:text-red-500"
                            >
                              <Heart className="h-3 w-3 fill-current" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-coral-600 transition hover:bg-coral-500/10 disabled:opacity-40 dark:text-coral-400 sm:flex"
              title="重新整理資料"
              aria-label="重新整理資料"
            >
              <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}

          {onToggleDarkMode && (
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-500/10 hover:text-coral-500 dark:text-slate-400 dark:hover:text-coral-400"
              title={darkMode ? "切換至淺色模式" : "切換至深色模式"}
              aria-label={darkMode ? "切換至淺色模式" : "切換至深色模式"}
            >
              {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          )}

          {onToggleFeedback && (
            <button
              type="button"
              onClick={onToggleFeedback}
              className={`hidden h-9 w-9 items-center justify-center rounded-lg transition sm:flex ${
                showFeedback
                  ? "bg-coral-500 text-white"
                  : "text-slate-500 hover:bg-slate-500/10 hover:text-coral-500 dark:text-slate-400 dark:hover:text-coral-400"
              }`}
              title="意見回饋"
              aria-label="意見回饋"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          )}

          {onSettingsClick && (
            <button
              type="button"
              onClick={onSettingsClick}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-coral-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-coral-400"
              title={settingsTitle || "設定"}
              aria-label={settingsTitle || "設定"}
            >
              <Settings className="h-4.5 w-4.5 animate-hover-spin" />
            </button>
          )}

          {/* 行動：展開全部選單 */}
          <button
            type="button"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition xl:hidden ${
              mobileOpen
                ? "border-coral-400/50 bg-coral-500/10 text-coral-600 dark:text-coral-400"
                : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            選單
          </button>
        </div>
      </div>

      {/* 行動展開內容 */}
      {mobileOpen && (
        <div className="border-t border-white/40 px-4 pb-4 dark:border-white/10 xl:hidden">
          {(onRefresh || onToggleFeedback) && (
            <div className="flex gap-2 border-b border-slate-200/70 py-3 dark:border-slate-800 sm:hidden">
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={loading}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-coral-500/10 px-3 py-2 text-xs font-bold text-coral-600 disabled:opacity-40 dark:text-coral-400"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  重新整理
                </button>
              )}
              {onToggleFeedback && (
                <button
                  type="button"
                  onClick={onToggleFeedback}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  意見回饋
                </button>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-1 text-[11px] font-black uppercase tracking-wide text-coral-700 dark:text-coral-400">{group.label}</p>
                <ul className="mt-1 flex flex-col">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className="block rounded-md px-1 py-1.5 text-[13px] font-medium text-slate-600 hover:text-coral-600 dark:text-slate-300">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

// 分組頁尾：把所有指南依分類排列，取代原本攤平的一長排連結。
export function SiteFooterNav() {
  return (
    <nav aria-label="網站地圖" className="border-t border-white/40 pt-8 dark:border-white/10">
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-coral-700 dark:text-coral-400">{group.label}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm font-medium text-slate-600 transition hover:text-coral-600 dark:text-slate-300 dark:hover:text-coral-400">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
