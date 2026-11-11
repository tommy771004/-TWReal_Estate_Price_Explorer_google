import { GitCompare, Pin, X } from "lucide-react";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Transaction } from "../types/real-estate";
import type { PinnedMarketSnapshot } from "../utils/market-snapshot";
import { MAX_COMPARE } from "./CompareBar";
import { PinnedKpiCompare } from "./PinnedKpiCompare";

interface CompareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Transaction[];
  onRemove: (id: string) => void;
  onSelectItem: (item: Transaction) => void;
  /** 開啟 CompareBar 的逐項比較表 */
  onStartCompare: () => void;
  pins: PinnedMarketSnapshot[];
  onUnpin: (id: string) => void;
  onClearPins: () => void;
}

function unitPriceWan(item: Transaction): string | null {
  const v = parseFloat(item.unitPrice || "");
  if (!Number.isFinite(v) || v <= 0) return null;
  return `${((v * 3.30578) / 10000).toFixed(1)} 萬/坪`;
}

/**
 * 底部導覽「比較」分頁（手機）：物件比較清單＋釘選的市場 KPI，集中在同一個底部彈層。
 * 桌面仍由 CompareBar 與右側 rail 的 PinnedKpiCompare 呈現。
 */
export function CompareSheet({
  open,
  onOpenChange,
  items,
  onRemove,
  onSelectItem,
  onStartCompare,
  pins,
  onUnpin,
  onClearPins,
}: CompareSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface-container-low text-on-surface dark:bg-surface-container-low">
        <SheetHeader className="border-outline-variant/30 dark:border-outline-variant/30">
          <SheetTitle className="text-on-surface dark:text-on-surface">比較</SheetTitle>
          <SheetClose
            aria-label="關閉"
            className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/8"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </SheetClose>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <section aria-labelledby="compare-sheet-items" className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h3 id="compare-sheet-items" className="text-sm font-bold text-on-surface">
                物件比較 <span className="font-medium text-on-surface-variant">{items.length}/{MAX_COMPARE}</span>
              </h3>
              <button
                type="button"
                disabled={items.length < 2}
                onClick={() => {
                  onOpenChange(false);
                  window.setTimeout(onStartCompare, 0);
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-on-primary disabled:opacity-40"
              >
                <GitCompare size={14} aria-hidden="true" />
                開始比較
              </button>
            </div>
            {items.length === 0 ? (
              <p className="rounded-2xl bg-surface-container px-4 py-3 text-xs font-medium leading-relaxed text-on-surface-variant">
                在成交紀錄卡片上按比較圖示（加入比較），最多可並排比較 {MAX_COMPARE} 筆。
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {items.map((item) => {
                  const price = unitPriceWan(item);
                  return (
                    <li key={item.id} className="flex items-center gap-1 rounded-2xl bg-surface-container p-1.5 pl-3">
                      <button
                        type="button"
                        onClick={() => {
                          onOpenChange(false);
                          window.setTimeout(() => onSelectItem(item), 0);
                        }}
                        className="flex min-w-0 flex-1 flex-col py-1 text-left"
                      >
                        <span className="truncate text-sm font-semibold text-on-surface">{item.address}</span>
                        <span className="text-xs text-on-surface-variant">
                          {item.district}
                          {price && <span className="ml-2 font-semibold text-primary">{price}</span>}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        aria-label={`移除 ${item.address}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/8"
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {items.length === 1 && (
              <p className="text-xs font-medium text-on-surface-variant">再加入 1 筆就能開始比較。</p>
            )}
          </section>

          <section aria-labelledby="compare-sheet-pins" className="flex flex-col gap-2">
            <h3 id="compare-sheet-pins" className="text-sm font-bold text-on-surface">
              釘選市場
            </h3>
            {pins.length === 0 ? (
              <p className="flex items-start gap-2 rounded-2xl bg-surface-container px-4 py-3 text-xs font-medium leading-relaxed text-on-surface-variant">
                <Pin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                展開「市場摘要」按「釘選比價」，就能對照不同縣市或行政區的行情。
              </p>
            ) : (
              <PinnedKpiCompare pins={pins} onUnpin={onUnpin} onClear={onClearPins} />
            )}
          </section>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
