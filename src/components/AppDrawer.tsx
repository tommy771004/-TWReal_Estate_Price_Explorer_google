import { useState, type ReactNode } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  BookOpen,
  ChevronDown,
  Database,
  Info,
  MapPin,
  Menu,
  MessageSquare,
  Monitor,
  Moon,
  RotateCw,
  SlidersHorizontal,
  Sun,
  Type,
  X,
  type LucideIcon,
} from "lucide-react";
import { NAV_MENU_SECTIONS, SITE_NAME, groupsForSection } from "../content/siteNav";
import { CITIES } from "../constants";
import {
  readDefaultCity,
  writeDefaultCity,
  type FontSizePreference,
  type ThemePreference,
} from "../hooks/useDisplayPreferences";
import { DEFAULT_CITY } from "../lib/seoRoutes";

const SECTION_ICONS: Record<string, LucideIcon> = {
  查房價: MapPin,
  買租指南: BookOpen,
  關於本站: Info,
};

const SECTION_HINTS: Record<string, string> = {
  查房價: "各縣市・各區索引",
  買租指南: "購屋・租屋・貸款／金融・居家／裝潢",
  關於本站: "使用指南・網站資訊",
};

const FONT_SIZE_OPTIONS: ReadonlyArray<{ value: FontSizePreference; text: string; label: string }> = [
  { value: "small", text: "小", label: "小字級" },
  { value: "medium", text: "中", label: "中字級" },
  { value: "large", text: "大", label: "大字級" },
];

const THEME_OPTIONS: ReadonlyArray<{ value: ThemePreference; icon: LucideIcon; label: string }> = [
  { value: "light", icon: Sun, label: "淺色" },
  { value: "dark", icon: Moon, label: "深色" },
  { value: "system", icon: Monitor, label: "跟隨系統" },
];

const SECTION = "border-b border-outline-variant/30 py-2 last:border-b-0";
const SECTION_LABEL = "px-5 py-1.5 text-xs font-bold tracking-wider text-primary";
const ROW =
  "flex min-h-12 w-full items-center gap-3.5 px-5 py-1 text-left text-[15px] font-semibold text-on-surface transition-colors hover:bg-on-surface/8 focus-visible:bg-on-surface/8 focus-visible:outline-none";
const ROW_ICON = "h-[22px] w-[22px] shrink-0 text-on-surface-variant";
const SEGMENT = "flex shrink-0 rounded-[14px] bg-surface-container-highest p-0.5";
const SEGMENT_BUTTON =
  "flex h-11 w-10 items-center justify-center rounded-xl text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
const SEGMENT_ON = "bg-primary text-on-primary";
const SEGMENT_OFF = "text-on-surface-variant hover:text-on-surface";

export interface AppDrawerProps {
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  fontSize: FontSizePreference;
  onFontSizeChange: (size: FontSizePreference) => void;
  /** 只有查詢頁有：重新抓取資料 */
  onRefresh?: () => void;
  loading?: boolean;
  /** 查詢頁開啟回饋對話框；沒給時連到 /contact/ */
  onFeedback?: () => void;
  /** 查詢頁開啟「介面文字自訂」等進階設定 */
  onOpenAdvancedSettings?: () => void;
  /** 觸發按鈕（header 的漢堡鈕）額外樣式 */
  triggerClassName?: string;
}

/**
 * 側邊選單：header 漢堡鈕後面的浮動卡片，從左側滑出。
 * 收納原本擠在 header 的品牌、主題、設定、意見回饋，以及 mega-menu 的全部指南連結。
 * 以 base-ui Dialog 實作：開啟時鎖背景捲動、Esc 關閉、焦點留在選單內，關閉後回到漢堡鈕。
 */
export function AppDrawer({
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  onRefresh,
  loading = false,
  onFeedback,
  onOpenAdvancedSettings,
  triggerClassName = "",
}: AppDrawerProps) {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(NAV_MENU_SECTIONS[0]?.label ?? null);
  const [defaultCity, setDefaultCity] = useState<string>(() => readDefaultCity() || DEFAULT_CITY);

  // 先關選單再做事，讓接下來開啟的對話框拿到焦點
  const closeThen = (action?: () => void) => () => {
    setOpen(false);
    if (action) window.setTimeout(action, 0);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        aria-label="開啟選單"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${triggerClassName}`}
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          id="app-drawer"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] left-2 top-[calc(env(safe-area-inset-top)+0.5rem)] z-50 flex w-[78vw] min-w-[272px] max-w-[320px] flex-col overflow-hidden rounded-[28px] bg-surface-container-low text-on-surface shadow-[0_24px_48px_rgba(0,29,51,0.35)] outline-none duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left motion-reduce:animate-none"
        >
          <div className="flex shrink-0 items-center justify-between gap-2 bg-primary-container py-4 pl-5 pr-2 text-on-primary-container">
            <a href="/" className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary text-on-primary">
                <Database className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col">
                <DialogPrimitive.Title className="truncate text-xl font-black tracking-tight">{SITE_NAME}</DialogPrimitive.Title>
                <span className="truncate text-[11px] font-medium opacity-80">內政部開放資料・每 10 日更新</span>
              </span>
            </a>
            <DialogPrimitive.Close
              aria-label="關閉選單"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-on-primary-container/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>

          <nav aria-label="選單" className="flex-1 overflow-y-auto overscroll-contain">
            <section className={SECTION}>
              <h2 className={SECTION_LABEL}>瀏覽</h2>
              {NAV_MENU_SECTIONS.map((section) => {
                const Icon = SECTION_ICONS[section.label] ?? BookOpen;
                const expanded = openSection === section.label;
                const panelId = `drawer-section-${section.label}`;
                return (
                  <div key={section.label}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => setOpenSection(expanded ? null : section.label)}
                      className={`${ROW} ${expanded ? "bg-surface-container-highest" : ""}`}
                    >
                      <Icon className={`${ROW_ICON} ${expanded ? "text-primary" : ""}`} aria-hidden="true" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span>{section.label}</span>
                        {!expanded && (
                          <span className="truncate text-[11px] font-medium text-on-surface-variant">
                            {SECTION_HINTS[section.label]}
                          </span>
                        )}
                      </span>
                      <ChevronDown
                        className={`h-[18px] w-[18px] shrink-0 text-on-surface-variant transition-transform ${expanded ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                    {expanded && (
                      <div id={panelId} className="flex flex-col gap-3 bg-surface-container-highest pb-3 pl-14 pr-4 pt-1">
                        {groupsForSection(section).map((group) => (
                          <div key={group.label}>
                            <p className="px-1 pb-1 text-[11px] font-bold text-on-surface-variant">{group.label}</p>
                            <ul className="flex flex-col gap-1">
                              {group.links.map((link) => (
                                <li key={link.href}>
                                  <a
                                    href={link.href}
                                    className="block rounded-xl bg-surface-container-low px-3 py-2 text-[13px] font-medium text-on-surface transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
            </section>

            <section className={SECTION}>
              <h2 className={SECTION_LABEL}>設定</h2>
              <SettingRow icon={Type} label="字體大小">
                <div role="group" aria-label="字體大小" className={SEGMENT}>
                  {FONT_SIZE_OPTIONS.map((option) => {
                    const selected = fontSize === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-label={option.label}
                        aria-pressed={selected}
                        onClick={() => onFontSizeChange(option.value)}
                        className={`${SEGMENT_BUTTON} ${selected ? SEGMENT_ON : SEGMENT_OFF}`}
                      >
                        {option.text}
                      </button>
                    );
                  })}
                </div>
              </SettingRow>
              <SettingRow icon={Moon} label="外觀主題">
                <div role="group" aria-label="外觀主題" className={SEGMENT}>
                  {THEME_OPTIONS.map((option) => {
                    const selected = theme === option.value;
                    const OptionIcon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-label={option.label}
                        title={option.label}
                        aria-pressed={selected}
                        onClick={() => onThemeChange(option.value)}
                        className={`${SEGMENT_BUTTON} ${selected ? SEGMENT_ON : SEGMENT_OFF}`}
                      >
                        <OptionIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              </SettingRow>
              <label className={`${ROW} cursor-pointer`}>
                <MapPin className={ROW_ICON} aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span>預設縣市</span>
                  <span className="text-[11px] font-medium text-on-surface-variant">開啟首頁時先顯示</span>
                </span>
                <select
                  value={defaultCity}
                  onChange={(event) => {
                    setDefaultCity(event.target.value);
                    writeDefaultCity(event.target.value);
                  }}
                  className="h-10 max-w-[7.5rem] shrink-0 rounded-xl border border-outline-variant bg-surface px-2 text-[13px] font-semibold text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {CITIES.map((city) => (
                    <option key={city.code} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </label>
              {onOpenAdvancedSettings && (
                <button type="button" onClick={closeThen(onOpenAdvancedSettings)} className={ROW}>
                  <SlidersHorizontal className={ROW_ICON} aria-hidden="true" />
                  <span className="flex-1">進階設定</span>
                  <span className="text-xs font-medium text-on-surface-variant">介面文字・資料備份</span>
                </button>
              )}
            </section>

            <section className={SECTION}>
              <h2 className={SECTION_LABEL}>資料與支援</h2>
              {onRefresh && (
                <button type="button" onClick={closeThen(onRefresh)} disabled={loading} className={`${ROW} disabled:opacity-50`}>
                  <RotateCw className={`${ROW_ICON} ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
                  <span className="flex-1">重新整理資料</span>
                </button>
              )}
              {onFeedback ? (
                <button type="button" onClick={closeThen(onFeedback)} className={ROW}>
                  <MessageSquare className={ROW_ICON} aria-hidden="true" />
                  <span className="flex-1">意見回饋</span>
                </button>
              ) : (
                <a href="/contact/" className={ROW}>
                  <MessageSquare className={ROW_ICON} aria-hidden="true" />
                  <span className="flex-1">意見回饋</span>
                </a>
              )}
            </section>
          </nav>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function SettingRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[3.25rem] items-center gap-3.5 px-5 py-1">
      <Icon className={ROW_ICON} aria-hidden="true" />
      <span className="flex-1 text-[15px] font-semibold text-on-surface">{label}</span>
      {children}
    </div>
  );
}
