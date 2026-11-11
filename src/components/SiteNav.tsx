import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV_GROUPS, NAV_MENU_SECTIONS, getRouteLabel, groupsForSection } from "../content/siteNav";
import { ChevronDown, Heart, Search } from "lucide-react";
import type { Transaction } from "../types/real-estate";
import type { FontSizePreference, ThemePreference } from "../hooks/useDisplayPreferences";
import { AppDrawer } from "./AppDrawer";

interface SiteNavProps {
  /** 首頁：頁名同時是頁面的 <h1> */
  brandAsHeading?: boolean;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  fontSize: FontSizePreference;
  onFontSizeChange: (size: FontSizePreference) => void;
  /** 查詢頁：聚焦地址／社區搜尋框；沒給時搜尋鈕連回首頁 */
  onSearchClick?: () => void;
  favorites?: Transaction[];
  onSelectFavorite?: (item: Transaction) => void;
  onToggleFavorite?: (item: Transaction, event?: ReactMouseEvent) => void;
  loading?: boolean;
  onRefresh?: () => void;
  onFeedback?: () => void;
  onOpenAdvancedSettings?: () => void;
}

const HEADER_ICON_BUTTON =
  "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

/**
 * Header：左側選單鈕＋目前頁名，右側只放搜尋與收藏。
 * 品牌、主題、字級、設定、意見回饋、重新整理都收進側邊選單（AppDrawer）。
 * xl 以上仍保留 3 組 mega-menu：桌面的可發現性，也讓指南連結常駐 DOM。
 */
export function SiteNav({
  brandAsHeading = false,
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  onSearchClick,
  favorites = [],
  onSelectFavorite,
  onToggleFavorite,
  loading = false,
  onRefresh,
  onFeedback,
  onOpenAdvancedSettings,
}: SiteNavProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const routeLabel = typeof window === "undefined" ? "實價登錄查詢" : getRouteLabel(window.location.pathname);

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

  const labelClass = "truncate font-display text-[17px] font-extrabold tracking-tight text-primary md:text-lg";

  return (
    <header
      ref={navRef}
      className="relative z-30 border-b border-outline-variant/40 bg-surface-container-low/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between gap-2 px-1 md:h-14 md:px-3">
        <div className="flex min-w-0 items-center gap-0.5">
          <AppDrawer
            theme={theme}
            onThemeChange={onThemeChange}
            fontSize={fontSize}
            onFontSizeChange={onFontSizeChange}
            onRefresh={onRefresh}
            loading={loading}
            onFeedback={onFeedback}
            onOpenAdvancedSettings={onOpenAdvancedSettings}
          />
          {brandAsHeading ? (
            <h1 className={labelClass}>{routeLabel}</h1>
          ) : (
            <a href="/" className={`${labelClass} rounded-lg hover:opacity-80`}>
              {routeLabel}
            </a>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/* 桌面：3 個 mega-menu。分組標題沿用 NAV_GROUPS，連結一個不少 */}
          <nav aria-label="網站分類" className="mr-1 hidden xl:block">
            <ul className="flex items-center gap-1">
              {NAV_MENU_SECTIONS.map((section) => {
                const isOpen = openGroup === section.label;
                const groups = groupsForSection(section);
                return (
                  <li key={section.label} className="relative">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenGroup(isOpen ? null : section.label)}
                      className={`inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-sm font-medium transition-colors ${
                        isOpen
                          ? "bg-secondary-container font-semibold text-on-secondary-container"
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
                      <div className="absolute right-0 top-full z-40 mt-2 w-[min(46rem,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-outline-variant/40 bg-surface-container-high p-5 shadow-[var(--md-elevation-3)]">
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
          </nav>

          {onSearchClick ? (
            <button type="button" onClick={onSearchClick} className={HEADER_ICON_BUTTON} aria-label="搜尋地址或社區" title="搜尋地址或社區">
              <Search className="h-[22px] w-[22px]" aria-hidden="true" />
            </button>
          ) : (
            <a href="/" className={HEADER_ICON_BUTTON} aria-label="前往實價登錄查詢" title="前往實價登錄查詢">
              <Search className="h-[22px] w-[22px]" aria-hidden="true" />
            </a>
          )}

          {onSelectFavorite && onToggleFavorite && (
            <div className="relative">
              <button
                type="button"
                aria-expanded={favoritesOpen}
                onClick={() => setFavoritesOpen((value) => !value)}
                className={`${HEADER_ICON_BUTTON} ${favoritesOpen ? "bg-primary/10" : ""}`}
                title="我的收藏"
                aria-label={favorites.length > 0 ? `我的收藏，${favorites.length} 筆` : "我的收藏"}
              >
                <Heart className={`h-[22px] w-[22px] ${favorites.length > 0 ? "fill-current" : ""}`} aria-hidden="true" />
                {favorites.length > 0 && (
                  <span className="absolute right-1 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-tertiary px-1 text-[10px] font-bold text-on-tertiary">
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
                    className="absolute right-0 top-full z-40 mt-2 flex max-h-[min(400px,70dvh)] w-[min(19rem,calc(100vw-0.75rem))] flex-col overflow-hidden rounded-[28px] border border-outline-variant/40 bg-surface-container-high shadow-[var(--md-elevation-3)]"
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
        </div>
      </div>
    </header>
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
