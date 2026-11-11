import { useCallback, useEffect, useState } from "react";

/**
 * 顯示偏好：外觀主題與字級。每個頁面只由一個地方呼叫（App 或 SeoContentPage），
 * 再把值與 setter 往下傳給 header / 側邊選單 / 設定對話框，避免兩份狀態互相覆寫。
 *
 * localStorage：
 *   explorer_theme     "light" | "dark" | "system"（舊版只會有 light / dark，照樣讀得懂）
 *   explorer_font_size "small" | "medium" | "large"
 */
export type ThemePreference = "light" | "dark" | "system";
export type FontSizePreference = "small" | "medium" | "large";

const THEME_KEY = "explorer_theme";
const FONT_SIZE_KEY = "explorer_font_size";
const FONT_SCALE: Record<FontSizePreference, string> = {
  small: "0.875",
  medium: "1.0",
  large: "1.15",
};

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 無痕模式等情況寫不進去：只影響下次開啟，不影響目前畫面
  }
}

function readTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const saved = readStorage(THEME_KEY);
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

function readFontSize(): FontSizePreference {
  if (typeof window === "undefined") return "medium";
  const saved = readStorage(FONT_SIZE_KEY);
  return saved === "small" || saved === "large" ? saved : "medium";
}

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useDisplayPreferences() {
  const [theme, setThemeState] = useState<ThemePreference>(readTheme);
  const [fontSize, setFontSizeState] = useState<FontSizePreference>(readFontSize);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // 「跟隨系統」時，系統切換深淺色要即時反映
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [theme]);

  const isDark = theme === "dark" || (theme === "system" && systemDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", FONT_SCALE[fontSize]);
  }, [fontSize]);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    writeStorage(THEME_KEY, next);
  }, []);

  const setFontSize = useCallback((next: FontSizePreference) => {
    setFontSizeState(next);
    writeStorage(FONT_SIZE_KEY, next);
  }, []);

  return { theme, setTheme, isDark, fontSize, setFontSize };
}

export type DisplayPreferences = ReturnType<typeof useDisplayPreferences>;

/** 預設縣市：只在直接開啟首頁「/」且網址沒有指定縣市時套用。 */
const DEFAULT_CITY_KEY = "explorer_default_city";

export function readDefaultCity(): string | null {
  if (typeof window === "undefined") return null;
  return readStorage(DEFAULT_CITY_KEY);
}

export function writeDefaultCity(cityName: string) {
  writeStorage(DEFAULT_CITY_KEY, cityName);
}
