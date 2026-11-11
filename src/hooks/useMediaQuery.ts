import { useSyncExternalStore } from "react";

/** 同一個 query 共用一個 MediaQueryList，避免每張卡片各自建立 */
const lists = new Map<string, MediaQueryList>();
const getList = (query: string) => {
  let list = lists.get(query);
  if (!list) {
    list = window.matchMedia(query);
    lists.set(query, list);
  }
  return list;
};

/**
 * 回傳 media query 是否成立，視窗尺寸改變時更新。
 * 用來只渲染目前螢幕需要的那一套版面，而不是兩套都產生再用 CSS 隱藏其中一套。
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const list = getList(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => (typeof window !== "undefined" && window.matchMedia ? getList(query).matches : fallback),
    () => fallback
  );
}

/** Tailwind md（768px）以上 */
export const MD_UP = "(min-width: 768px)";
/** Tailwind lg（1024px）以上 */
export const LG_UP = "(min-width: 1024px)";
