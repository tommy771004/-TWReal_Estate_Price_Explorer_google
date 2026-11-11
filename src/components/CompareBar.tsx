import React from "react";
import { GitCompare, X, Scale, Share2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Transaction } from "../types/real-estate";
import { formatDate, formatPrice } from "../utils/real-estate-helpers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const MAX_COMPARE = 4;

/** 將比較 id 編成 query 片段（不含 ?）。 */
export function buildCompareQueryParam(ids: string[]): string {
  if (!ids.length) return "";
  return `cmp=${ids.map(encodeURIComponent).join(",")}`;
}

export function parseCompareIdsFromSearch(search: string): string[] {
  try {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    const raw = params.get("cmp")?.trim();
    if (!raw) return [];
    return raw
      .split(",")
      .map((s) => decodeURIComponent(s.trim()))
      .filter(Boolean)
      .slice(0, MAX_COMPARE);
  } catch {
    return [];
  }
}

function unitPriceWan(item: Transaction): string {
  const v = parseFloat(item.unitPrice || "");
  if (!Number.isFinite(v) || v <= 0) return "—";
  return ((v * 3.30578) / 10000).toFixed(1);
}

function areaPing(item: Transaction): string {
  const v = parseFloat(item.buildingArea || item.area || "");
  if (!Number.isFinite(v)) return "—";
  return (v * 0.3025).toFixed(1);
}

function ageYears(item: Transaction): string {
  if (!item.completionDate) return "—";
  const compY = parseInt(item.completionDate.substring(0, 3), 10);
  if (Number.isNaN(compY)) return "—";
  const currentY = new Date().getFullYear() - 1911;
  return `${currentY - compY}`;
}

function layoutText(item: Transaction): string {
  const parts: string[] = [];
  if (item.rooms && item.rooms !== "0") parts.push(`${item.rooms}房`);
  if (item.halls && item.halls !== "0") parts.push(`${item.halls}廳`);
  if (item.bathrooms && item.bathrooms !== "0") parts.push(`${item.bathrooms}衛`);
  return parts.length ? parts.join("") : "—";
}

function parkingText(item: Transaction): string {
  if (item.parkingType || (item.parkingPrice && parseFloat(item.parkingPrice) > 0)) {
    const price =
      item.parkingPrice && parseFloat(item.parkingPrice) > 0
        ? ` ${formatPrice(item.parkingPrice)}`
        : "";
    return `${item.parkingType || "有車位"}${price}`;
  }
  return "無／未登錄";
}

const ROWS: { key: string; label: string; get: (t: Transaction) => string }[] = [
  { key: "district", label: "行政區", get: (t) => t.district || "—" },
  { key: "date", label: "交易日", get: (t) => formatDate(t.date) },
  { key: "total", label: "總價", get: (t) => formatPrice(t.totalPrice) },
  { key: "unit", label: "單價(萬/坪)", get: unitPriceWan },
  { key: "area", label: "建物坪數", get: (t) => `${areaPing(t)} 坪` },
  { key: "floor", label: "樓層", get: (t) => (t.floor ? `${t.floor}${t.totalFloor ? ` / ${t.totalFloor}` : ""}` : "—") },
  { key: "age", label: "屋齡(年)", get: ageYears },
  { key: "layout", label: "格局", get: layoutText },
  { key: "type", label: "建物型態", get: (t) => t.buildingType || "—" },
  { key: "mgmt", label: "管理組織", get: (t) => t.hasManagement || "—" },
  { key: "parking", label: "車位", get: parkingText },
  { key: "tx", label: "交易標的", get: (t) => t.transactionType || "—" },
];

interface CompareBarProps {
  items: Transaction[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onSelectItem: (item: Transaction) => void;
  /** 複製目前比較清單的可分享連結 */
  onShareCompare?: () => void | Promise<void>;
  shareStatus?: "idle" | "copied" | "error";
  /** 受控的比較對話框（底部導覽「比較」分頁也要能打開它） */
  dialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
}

export function CompareBar({
  items,
  onRemove,
  onClear,
  onSelectItem,
  onShareCompare,
  shareStatus = "idle",
  dialogOpen,
  onDialogOpenChange,
}: CompareBarProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = dialogOpen ?? uncontrolledOpen;
  const setOpen = onDialogOpenChange ?? setUncontrolledOpen;

  if (items.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          // 手機：浮在底部膠囊導覽上方 8px；桌面沒有膠囊，維持 bottom-4。
          // z-[45]：高於膠囊（z-40），低於所有對話框（z-50），開對話框時不會蓋住。
          className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-1/2 z-[45] w-[min(calc(100vw-1.5rem),720px)] -translate-x-1/2 lg:bottom-4"
        >
          <div className="flex items-center gap-2.5 rounded-[24px] border border-outline-variant/40 bg-surface-container-high p-2 pl-3 shadow-[var(--md-elevation-3)] sm:gap-3 sm:rounded-[28px] sm:p-3">
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container sm:flex">
              <Scale size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-on-surface">
                比較清單 {items.length}/{MAX_COMPARE}
              </div>
              <div className="mt-1 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
                {items.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex max-w-[140px] items-center gap-1 rounded-full bg-surface-container-highest px-2.5 py-0.5 text-[11px] font-medium text-on-surface-variant"
                  >
                    <button
                      type="button"
                      className="truncate hover:text-primary transition-colors"
                      onClick={() => onSelectItem(item)}
                      title={item.address}
                    >
                      {item.address}
                    </button>
                    <button
                      type="button"
                      className="shrink-0 rounded-full p-0.5 hover:bg-error-container hover:text-error transition-colors"
                      onClick={() => onRemove(item.id)}
                      aria-label={`移除 ${item.address}`}
                    >
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              <Button
                type="button"
                size="sm"
                disabled={items.length < 2}
                onClick={() => setOpen(true)}
                className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-on-primary hover:bg-primary/90 disabled:opacity-40 shadow-xs"
              >
                <GitCompare size={14} className="mr-1" />
                開始比較
              </Button>
              {onShareCompare && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={items.length < 1}
                  onClick={() => void onShareCompare()}
                  aria-label={shareStatus === "copied" ? "已複製比較連結" : "分享比較"}
                  className={`h-9 rounded-full border border-outline px-2.5 text-xs font-semibold sm:px-3.5 ${
                    shareStatus === "copied"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-surface text-on-surface hover:bg-surface-container-highest"
                  }`}
                  title="複製含比較清單的連結"
                >
                  {shareStatus === "copied" ? (
                    <CheckCircle2 size={14} className="sm:mr-1" />
                  ) : (
                    <Share2 size={14} className="sm:mr-1" />
                  )}
                  <span className="hidden sm:inline">{shareStatus === "copied" ? "已複製" : "分享比較"}</span>
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClear}
                aria-label="清空比較清單"
                className="h-9 rounded-full px-2.5 text-xs font-medium text-on-surface-variant hover:bg-on-surface/8 hover:text-on-surface sm:px-3"
              >
                <X size={16} className="sm:hidden" aria-hidden="true" />
                <span className="hidden sm:inline">清空</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden rounded-[28px] border-outline-variant/40 bg-surface-container-high text-on-surface p-0 shadow-[var(--md-elevation-3)] sm:max-w-4xl">
          <DialogHeader className="border-b border-outline-variant/30 px-5 py-4">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-on-surface">
              <GitCompare className="text-primary" size={18} />
              物件比較（{items.length} 筆）
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(90vh-5rem)] overflow-auto p-3 sm:p-5">
            <div className="min-w-[640px] overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 w-28 bg-surface-container p-2 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      項目
                    </th>
                    {items.map((item) => (
                      <th key={item.id} className="min-w-[140px] p-2 align-bottom">
                        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container p-2.5">
                          <div className="line-clamp-2 text-xs font-bold leading-snug text-on-surface">
                            {item.address}
                          </div>
                          <button
                            type="button"
                            className="mt-1 text-xs font-semibold text-primary hover:underline"
                            onClick={() => {
                              setOpen(false);
                              onSelectItem(item);
                            }}
                          >
                            查看詳情
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.key} className="border-t border-outline-variant/20">
                      <th className="sticky left-0 z-10 bg-surface-container-high p-2.5 text-xs font-semibold text-on-surface-variant">
                        {row.label}
                      </th>
                      {items.map((item) => (
                        <td
                          key={`${item.id}-${row.key}`}
                          className="p-2.5 text-xs font-medium text-on-surface"
                        >
                          {row.get(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
