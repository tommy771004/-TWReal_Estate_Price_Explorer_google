import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BookOpen, GitCompareArrows, LayoutList, Map as MapIcon, TrendingUp, type LucideIcon } from "lucide-react";

export type BottomNavKey = "market" | "map" | "trend" | "compare" | "guides";

export type BottomNavItem = {
  key: BottomNavKey;
  label: string;
  icon: LucideIcon;
  /** 跨頁：指南頁上的分頁直接連回首頁 */
  href?: string;
  onSelect?: () => void;
  badge?: number;
};

export const BOTTOM_NAV_BASE: ReadonlyArray<Pick<BottomNavItem, "key" | "label" | "icon">> = [
  { key: "market", label: "行情", icon: LayoutList },
  { key: "map", label: "地圖", icon: MapIcon },
  { key: "trend", label: "趨勢", icon: TrendingUp },
  { key: "compare", label: "比較", icon: GitCompareArrows },
  { key: "guides", label: "指南", icon: BookOpen },
];

/**
 * 底部膠囊導覽（< lg）。目前分頁在 icon 右邊顯示文字，其餘分頁平分剩下的寬度；
 * 往下捲動時整條縮小，往上捲或回到頂端時恢復。桌面（≥ lg）不顯示，沿用結果區的分段切換。
 * z-40：低於比較匣（z-45）與所有對話框（z-50）。
 */
export function BottomNav({ items, activeKey }: { items: BottomNavItem[]; activeKey: BottomNavKey | null }) {
  const reduceMotion = useReducedMotion();
  const [shrunk, setShrunk] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    let lastY: number | null = null;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const delta = lastY === null ? 0 : y - lastY;
      if (y < 40) setShrunk(false);
      else if (Math.abs(delta) > 6) setShrunk(delta > 0);
      lastY = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduceMotion]);

  const spring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 34 };

  return (
    <nav
      aria-label="主要導覽"
      className="fixed bottom-[calc(0.375rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[360px] -translate-x-1/2 select-none lg:hidden"
    >
      <motion.div
        className="h-[52px] w-full rounded-full border border-white/20 bg-primary/95 p-0.5 shadow-[0_14px_36px_rgba(0,29,51,0.28),inset_0_1px_2px_rgba(255,255,255,0.22)] backdrop-blur-xl dark:border-primary/25 dark:bg-primary-container/95 dark:shadow-[0_14px_36px_rgba(0,0,0,0.5)]"
        style={{ transformOrigin: "bottom center" }}
        initial={false}
        animate={{ scale: shrunk ? 0.85 : 1, opacity: shrunk ? 0.92 : 1 }}
        transition={spring}
      >
        <ul className="flex h-full w-full">
          {items.map((item) => {
            const active = item.key === activeKey;
            const Icon = item.icon;
            const className = `relative flex h-full items-center justify-center rounded-full transition-colors duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
              active
                ? "gap-1.5 pl-3 pr-3.5 text-on-primary-container dark:text-primary-container"
                : "w-full text-on-primary/85 hover:text-on-primary dark:text-on-primary-container/85 dark:hover:text-on-primary-container"
            }`;
            const content = (
              <>
                {active && (
                  <motion.span
                    layoutId="bottom-nav-pill"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-primary-container shadow-[0_3px_10px_rgba(0,0,0,0.22),inset_0_1px_1.5px_rgba(255,255,255,0.42)] dark:bg-primary"
                    transition={spring}
                  />
                )}
                <Icon className="relative h-6 w-6 shrink-0" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                {active && <span className="relative whitespace-nowrap text-sm font-bold leading-none">{item.label}</span>}
                {!!item.badge && (
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-1.5 ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-tertiary-container px-1 text-[10px] font-extrabold text-on-tertiary-container"
                  >
                    {item.badge}
                  </span>
                )}
              </>
            );
            const ariaLabel = item.badge ? `${item.label}，${item.badge} 筆` : item.label;
            return (
              <li key={item.key} className={`h-full ${active ? "flex-none" : "min-w-0 flex-1"}`}>
                {item.href ? (
                  <a href={item.href} aria-label={ariaLabel} aria-current={active ? "page" : undefined} className={className}>
                    {content}
                  </a>
                ) : (
                  <button type="button" onClick={item.onSelect} aria-label={ariaLabel} aria-pressed={active} className={className}>
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </motion.div>
    </nav>
  );
}
