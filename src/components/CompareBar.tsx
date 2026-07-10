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
}

export function CompareBar({
  items,
  onRemove,
  onClear,
  onSelectItem,
  onShareCompare,
  shareStatus = "idle",
}: CompareBarProps) {
  const [open, setOpen] = React.useState(false);

  if (items.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-4 left-1/2 z-[60] w-[min(96vw,720px)] -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/95 p-3 shadow-none backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral-500/10 text-coral-600 dark:text-coral-400">
              <Scale size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-ink dark:text-white">
                比較清單 {items.length}/{MAX_COMPARE}
              </div>
              <div className="mt-0.5 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
                {items.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex max-w-[140px] items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <button
                      type="button"
                      className="truncate hover:text-coral-600"
                      onClick={() => onSelectItem(item)}
                      title={item.address}
                    >
                      {item.address}
                    </button>
                    <button
                      type="button"
                      className="shrink-0 rounded-full p-0.5 hover:bg-coral-500 hover:text-white"
                      onClick={() => onRemove(item.id)}
                      aria-label={`移除 ${item.address}`}
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
              <Button
                type="button"
                size="sm"
                disabled={items.length < 2}
                onClick={() => setOpen(true)}
                className="h-9 rounded-xl bg-coral-600 px-3 text-xs font-bold text-white hover:bg-coral-500 disabled:opacity-40"
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
                  className={`h-9 rounded-xl px-3 text-xs font-bold ${
                    shareStatus === "copied"
                      ? "border-emerald-300 text-emerald-600"
                      : shareStatus === "error"
                        ? "border-red-300 text-red-500"
                        : ""
                  }`}
                  title="複製含比較清單的連結"
                >
                  {shareStatus === "copied" ? (
                    <CheckCircle2 size={14} className="mr-1" />
                  ) : (
                    <Share2 size={14} className="mr-1" />
                  )}
                  {shareStatus === "copied" ? "已複製" : "分享比較"}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-9 rounded-xl px-3 text-xs font-bold text-slate-500"
              >
                清空
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden rounded-[1.5rem] border-slate-200/80 bg-white p-0 dark:border-slate-800 dark:bg-slate-950 sm:max-w-4xl">
          <DialogHeader className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-base font-black">
              <GitCompare className="text-coral-500" size={18} />
              物件比較（{items.length} 筆）
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(90vh-5rem)] overflow-auto p-3 sm:p-5">
            <div className="min-w-[640px] overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 w-28 bg-slate-50 p-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:bg-slate-900">
                      項目
                    </th>
                    {items.map((item) => (
                      <th key={item.id} className="min-w-[140px] p-2 align-bottom">
                        <div className="rounded-xl border border-slate-200/80 bg-white p-2 dark:border-slate-800 dark:bg-slate-900/60">
                          <div className="line-clamp-2 text-xs font-black leading-snug text-ink dark:text-white">
                            {item.address}
                          </div>
                          <button
                            type="button"
                            className="mt-1 text-[10px] font-bold text-coral-600 hover:underline"
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
                    <tr key={row.key} className="border-t border-slate-100 dark:border-slate-800/80">
                      <th className="sticky left-0 z-10 bg-white p-2 text-[11px] font-bold text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                        {row.label}
                      </th>
                      {items.map((item) => (
                        <td
                          key={`${item.id}-${row.key}`}
                          className="p-2 text-xs font-bold text-slate-800 dark:text-slate-200"
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
