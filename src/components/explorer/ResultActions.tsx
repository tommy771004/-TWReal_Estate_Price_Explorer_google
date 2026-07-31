import { Bookmark, Check, Download, Share2, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SavedSearch } from "../../types/app";

type Props = {
  savedSearches: SavedSearch[];
  onSaveCurrent: () => void;
  onApplySaved: (s: SavedSearch) => void;
  onDeleteSaved: (id: string | number) => void;

  onExportCsv: () => void;
  exportDisabled: boolean;

  onCopyShareLink: () => void;
  shareStatus: "idle" | "copied" | "error";
};

const iconButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-500/10 hover:text-coral-600 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:text-coral-400";

/**
 * 結果區的三個動作，只留 icon 不放文字：儲存條件 / 匯出 CSV / 分享連結。
 * 每顆都有 title 與 aria-label，讀螢幕與 hover tooltip 仍讀得到名稱。
 */
export function ResultActions({
  savedSearches,
  onSaveCurrent,
  onApplySaved,
  onDeleteSaved,
  onExportCsv,
  exportDisabled,
  onCopyShareLink,
  shareStatus,
}: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {/* 儲存條件：icon 開小選單，因為「套用已存條件」需要一個入口 */}
      <Popover>
        <PopoverTrigger
          className={`${iconButton} relative`}
          title="儲存條件"
          aria-label="儲存條件"
        >
          <Bookmark className={`h-4 w-4 ${savedSearches.length > 0 ? "fill-current" : ""}`} />
          {savedSearches.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-coral-500 px-0.5 text-[8px] font-black text-white ring-2 ring-white dark:ring-slate-900">
              {savedSearches.length}
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(20rem,calc(100vw-1.5rem))]">
          <PopoverHeader>
            <PopoverTitle>儲存的條件</PopoverTitle>
            <button
              type="button"
              onClick={onSaveCurrent}
              className="text-[11px] font-bold text-coral-600 transition-colors hover:text-coral-500 dark:text-coral-400"
            >
              儲存目前條件
            </button>
          </PopoverHeader>
          {savedSearches.length === 0 ? (
            <p className="py-4 text-center text-[12px] font-medium text-slate-400">
              尚未儲存任何條件
            </p>
          ) : (
            <ul className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
              {savedSearches.map((s) => (
                <li key={s.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onApplySaved(s)}
                    className="min-w-0 flex-1 rounded-lg px-2.5 py-2 text-left text-[13px] font-bold text-slate-600 transition-colors hover:bg-coral-500/10 hover:text-coral-600 dark:text-slate-300 dark:hover:text-coral-400"
                  >
                    <span className="block truncate">{s.name}</span>
                    <span className="block truncate text-[10px] font-medium text-slate-400">
                      {s.cityName}
                      {s.district && s.district !== "全部" ? ` · ${s.district}` : ""}
                      {s.typeName ? ` · ${s.typeName}` : ""}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSaved(s.id)}
                    aria-label={`刪除 ${s.name}`}
                    title={`刪除 ${s.name}`}
                    className="shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-red-500/10 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>

      <button
        type="button"
        onClick={onExportCsv}
        disabled={exportDisabled}
        className={iconButton}
        title="匯出 CSV"
        aria-label="匯出 CSV"
      >
        <Download className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onCopyShareLink}
        className={`${iconButton} ${shareStatus === "copied" ? "text-emerald-600 dark:text-emerald-400" : ""}`}
        title={shareStatus === "copied" ? "已複製連結" : "分享連結"}
        aria-label={shareStatus === "copied" ? "已複製連結" : "分享連結"}
      >
        {shareStatus === "copied" ? (
          <Check className="h-4 w-4" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
