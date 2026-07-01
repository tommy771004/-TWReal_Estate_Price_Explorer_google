import { useEffect, useRef, useState } from "react";
import { NAV_GROUPS } from "../content/siteNav";
import { Settings } from "lucide-react";

interface SiteNavProps {
  onSettingsClick?: () => void;
  settingsTitle?: string;
}

// 頂部分組導覽列：每個分類以下拉選單收納指南頁，減少首頁資訊堆疊。
export function SiteNav({ onSettingsClick, settingsTitle }: SiteNavProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // 點擊外部或按 Esc 時關閉下拉
  useEffect(() => {
    if (!openGroup) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenGroup(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openGroup]);

  return (
    <nav
      ref={navRef}
      aria-label="主要導覽"
      className="relative z-30 border-b border-white/40 bg-white/55 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/40"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-8">
        <a href="/" className="flex shrink-0 items-center gap-2 py-3 text-sm font-black tracking-tight text-ink dark:text-white">
          <span className="h-2 w-2 rounded-full bg-coral-500" />
          實價登錄查詢
        </a>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Settings Button */}
          {onSettingsClick && (
            <button
              type="button"
              onClick={onSettingsClick}
              className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-coral-500 dark:text-slate-400 dark:hover:text-coral-400 transition cursor-pointer"
              title={settingsTitle || "設定"}
            >
              <Settings className="w-5 h-5 animate-hover-spin" />
            </button>
          )}

          {/* 桌面：下拉選單 */}
          <ul className="hidden items-center gap-1 md:flex">
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

          {/* 行動：展開全部選單 */}
          <button
            type="button"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300 md:hidden"
          >
            選單
          </button>
        </div>
      </div>

      {/* 行動展開內容 */}
      {mobileOpen && (
        <div className="border-t border-white/40 px-4 pb-4 dark:border-white/10 md:hidden">
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
