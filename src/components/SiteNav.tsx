import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV_GROUPS, NAV_MENU_SECTIONS, groupsForSection } from "../content/siteNav";
import {
  ChevronDown,
  Database,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Moon,
  RotateCw,
  Settings,
  Sun,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
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
      className="relative z-30 border-b border-outline-variant/40 bg-surface-container-low/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-2 px-3 sm:px-6">
        <a href="/" className="flex min-w-0 shrink items-center gap-2.5 py-2 text-on-surface sm:gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container shadow-xs">
            <Database className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            {brandAsHeading ? (
              <h1 className="truncate font-display text-base font-bold tracking-tight text-on-surface sm:text-lg">
                實價登錄查詢
              </h1>
            ) : (
              <span className="block truncate font-display text-base font-bold tracking-tight text-on-surface sm:text-lg">
                實價登錄查詢
              </span>
            )}
            <span className="hidden text-[10px] font-medium tracking-wide text-on-surface-variant/80 2xl:block">
              Taiwan Real Estate Price Explorer
            </span>
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {/* 桌面：3 個 mega-menu。分組標題沿用 NAV_GROUPS，連結一個不少 */}
          <ul className="mr-1 hidden items-center gap-1 xl:flex">
            {NAV_MENU_SECTIONS.map((section) => {
              const isOpen = openGroup === section.label;
              const groups = groupsForSection(section);
              return (
                <li key={section.label} className="relative">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenGroup(isOpen ? null : section.label)}
                    className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      isOpen
                        ? "bg-secondary-container text-on-secondary-container font-semibold"
                        : "text-on-surface-variant hover:bg-on-surface/8 hover:text-on-surface"
                    }`}
                  >
                    {section.label}
                    <ChevronDown
                      size={14}
                      className={`opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="absolute left-0 top-full z-40 mt-2 w-[min(46rem,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-outline-variant/40 bg-surface-container-high p-5 shadow-[var(--md-elevation-3)]">
                      <div
                        className={`grid gap-x-6 gap-y-4 ${groups.length > 2 ? "grid-cols-3" : "grid-cols-2"}`}
                      >
                        {groups.map((group) => (
                          <div key={group.label}>
                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                              {group.label}
                            </p>
                            <ul className="flex flex-col gap-0.5">
                              {group.links.map((link) => (
                                <li key={link.href}>
                                  <a
                                    href={link.href}
                                    className="block rounded-xl px-2.5 py-1.5 text-[13px] font-medium text-on-surface-variant transition-colors hover:bg-on-surface/8 hover:text-on-surface"
                                  >
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
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  favoritesOpen
                    ? "bg-error-container text-on-error-container"
                    : "text-on-surface-variant hover:bg-on-surface/8 hover:text-error"
                }`}
                title="我的最愛"
                aria-label="我的最愛"
              >
                <Heart className={`h-5 w-5 ${favorites.length > 0 ? "fill-current text-error" : ""}`} />
                {favorites.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] font-bold text-on-error ring-2 ring-surface">
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
                    className="absolute right-0 top-full z-50 mt-2 flex max-h-[min(400px,70dvh)] w-[min(19rem,calc(100vw-0.75rem))] flex-col overflow-hidden rounded-[28px] border border-outline-variant/40 bg-surface-container-high shadow-[var(--md-elevation-3)]"
                  >
                    <div className="flex items-center justify-between border-b border-outline-variant/30 bg-surface-container px-4 py-3">
                      <span className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                        <Heart className="h-4 w-4 fill-current text-error" /> 我的收藏
                      </span>
                      <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
                        {favorites.length} 筆
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 overflow-y-auto p-2 [scrollbar-width:none]">
                      {favorites.length === 0 ? (
                        <div className="py-6 text-center text-xs font-medium text-on-surface-variant">目前沒有收藏任何物件</div>
                      ) : (
                        favorites.map((favorite) => (
                          <div
                            key={favorite.id}
                            className="flex items-start gap-1 rounded-2xl p-2 transition-colors hover:bg-on-surface/8"
                          >
                            <button
                              type="button"
                              className="flex min-w-0 flex-1 flex-col p-0.5 text-left"
                              onClick={() => {
                                setFavoritesOpen(false);
                                onSelectFavorite(favorite);
                              }}
                            >
                              <span className="truncate text-xs font-semibold text-on-surface">
                                {favorite.address}
                              </span>
                              <span className="mt-0.5 flex items-center gap-1.5">
                                <span className="text-[11px] text-on-surface-variant">{favorite.district}</span>
                                {favorite.unitPrice && (
                                  <span className="text-[11px] font-semibold text-primary">
                                    {((parseFloat(favorite.unitPrice) * 3.30578) / 10000).toFixed(1)} 萬/坪
                                  </span>
                                )}
                              </span>
                            </button>
                            <button
                              type="button"
                              aria-label="取消收藏"
                              onClick={(event) => onToggleFavorite(favorite, event)}
                              className="rounded-full p-1.5 text-error transition-colors hover:bg-error/10"
                            >
                              <Heart className="h-4 w-4 fill-current" />
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

          {onToggleDarkMode && (
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-surface/8 hover:text-on-surface"
              title={darkMode ? "切換至淺色模式" : "切換至深色模式"}
              aria-label={darkMode ? "切換至淺色模式" : "切換至深色模式"}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          {/* 次要動作收進「更多」 */}
          {(onRefresh || onToggleFeedback) && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="hidden h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-surface/8 hover:text-on-surface sm:flex"
                title="更多"
                aria-label="更多"
              >
                <MoreHorizontal className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-2xl border border-outline-variant/40 bg-surface-container-high shadow-[var(--md-elevation-3)]">
                {onRefresh && (
                  <DropdownMenuItem onClick={onRefresh} disabled={loading} className="rounded-xl font-medium">
                    <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    重新整理資料
                  </DropdownMenuItem>
                )}
                {onToggleFeedback && (
                  <DropdownMenuItem onClick={onToggleFeedback} className="rounded-xl font-medium">
                    <MessageSquare className="h-4 w-4" />
                    意見回饋
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {onSettingsClick && (
            <button
              type="button"
              onClick={onSettingsClick}
              className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-surface/8 hover:text-on-surface"
              title={settingsTitle || "設定"}
              aria-label={settingsTitle || "設定"}
            >
              <Settings className="h-5 w-5 animate-hover-spin" />
            </button>
          )}

          {/* 行動：展開全部選單 */}
          <button
            type="button"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors xl:hidden ${
              mobileOpen
                ? "border-primary bg-primary-container text-on-primary-container"
                : "border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high"
            }`}
          >
            選單
          </button>
        </div>
      </div>

      {/* 行動展開內容 */}
      {mobileOpen && (
        <div className="border-t border-outline-variant/30 bg-surface-container-low px-4 pb-4 xl:hidden">
          {(onRefresh || onToggleFeedback) && (
            <div className="flex gap-2 border-b border-outline-variant/30 py-3 sm:hidden">
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={loading}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-secondary-container px-3 py-2 text-xs font-semibold text-on-secondary-container disabled:opacity-40"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  重新整理
                </button>
              )}
              {onToggleFeedback && (
                <button
                  type="button"
                  onClick={onToggleFeedback}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-container-highest px-3 py-2 text-xs font-semibold text-on-surface"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  意見回饋
                </button>
              )}
            </div>
          )}
          <div className="flex flex-col pt-2">
            {NAV_MENU_SECTIONS.map((section) => {
              const isOpen = openMobileSection === section.label;
              return (
                <div key={section.label} className="border-b border-outline-variant/30 last:border-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenMobileSection(isOpen ? null : section.label)}
                    className="flex w-full items-center justify-between gap-2 py-3 text-sm font-semibold text-on-surface"
                  >
                    {section.label}
                    <ChevronDown
                      size={15}
                      className={`opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 pb-3">
                      {groupsForSection(section).map((group) => (
                        <div key={group.label}>
                          <p className="px-1 text-xs font-bold uppercase tracking-wide text-primary">
                            {group.label}
                          </p>
                          <ul className="mt-1 flex flex-col">
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <a
                                  href={link.href}
                                  className="block rounded-lg px-2 py-1.5 text-[13px] font-medium text-on-surface-variant hover:bg-on-surface/8 hover:text-on-surface"
                                >
                                  {link.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

// 分組頁尾：把所有指南依分類排列，取代原本攤平的一長排連結。
export function SiteFooterNav() {
  return (
    <nav aria-label="網站地圖" className="border-t border-outline-variant/40 pt-8">
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">{group.label}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm font-medium text-on-surface-variant transition-colors hover:text-primary">
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
