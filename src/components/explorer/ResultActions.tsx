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
  "inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-surface/8 hover:text-on-surface disabled:pointer-events-none disabled:opacity-38";

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
    <div className="flex items-center gap-1">
      {/* 儲存條件：icon 開小選單 */}
      <Popover>
        <PopoverTrigger
          className={`${iconButton} relative`}
          title="儲存條件"
          aria-label="儲存條件"
        >
          <Bookmark className={`h-4 w-4 ${savedSearches.length > 0 ? "fill-current text-primary" : ""}`} />
          {savedSearches.length > 0 && (
            <span className="absolute 0 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-on-primary">
              {savedSearches.length}
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(20rem,calc(100vw-1.5rem))] rounded-[20px] bg-surface-container-high border-outline-variant/40 p-3 shadow-[var(--md-elevation-2)] text-on-surface">
          <PopoverHeader className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <PopoverTitle className="text-sm font-bold text-on-surface">儲存的條件</PopoverTitle>
            <button
              type="button"
              onClick={onSaveCurrent}
              className="text-xs font-semibold text-primary transition-colors hover:underline"
            >
              儲存目前條件
            </button>
          </PopoverHeader>
          {savedSearches.length === 0 ? (
            <p className="py-4 text-center text-xs font-medium text-on-surface-variant">
              尚未儲存任何條件
            </p>
          ) : (
            <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto pt-2">
              {savedSearches.map((s) => (
                <li key={s.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onApplySaved(s)}
                    className="min-w-0 flex-1 rounded-full px-3 py-1.5 text-left text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
                  >
                    <span className="block truncate">{s.name}</span>
                    <span className="block truncate text-[11px] font-medium text-on-surface-variant">
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
                    className="shrink-0 rounded-full p-1.5 text-on-surface-variant transition hover:bg-error-container hover:text-error"
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
