import React, { RefObject } from "react";
import { Settings, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppTexts } from "../../constants/texts";
import { DEFAULT_APP_TEXTS } from "../../constants/texts";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appTexts: AppTexts;
  updateAppTexts: (partial: Partial<AppTexts>) => void;
  fontSize: "small" | "medium" | "large";
  setFontSize: (v: "small" | "medium" | "large") => void;
  onExport: () => void;
  onImportClick: () => void;
  importFileRef: RefObject<HTMLInputElement | null>;
  onImportFile: (file: File) => void;
  importStatus: string | null;
};

export function SettingsDialog({
  open,
  onOpenChange,
  appTexts,
  updateAppTexts,
  fontSize,
  setFontSize,
  onExport,
  onImportClick,
  importFileRef,
  onImportFile,
  importStatus,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[calc(100dvh-0.75rem)] w-[calc(100vw-0.75rem)] max-w-none grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[28px] border border-outline-variant/40 bg-surface-container-high p-0 text-on-surface shadow-[var(--md-elevation-3)] sm:max-h-[min(90dvh,760px)] sm:max-w-xl">
        <DialogHeader className="border-b border-outline-variant/30 bg-surface-container px-4 py-4 pr-14 sm:px-6 sm:py-5 sm:pr-16">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-on-surface">
            <Settings className="w-5 h-5 text-primary" />
            {appTexts.settingsTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 touch-pan-y space-y-5 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:space-y-6 sm:px-6 sm:pb-6 sm:pt-5">
          <div className="space-y-3">
            <div className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              本機資料備份
            </div>
            <p className="text-xs font-medium leading-relaxed text-on-surface-variant">
              匯出收藏、儲存條件、比較清單為 JSON；可在其他瀏覽器匯入還原（不經伺服器）。
            </p>
            <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full rounded-full border-outline-variant/50 bg-surface text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors"
                onClick={onExport}
              >
                <Download size={14} className="mr-1.5 text-primary" />
                匯出 JSON
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full rounded-full border-outline-variant/50 bg-surface text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors"
                onClick={onImportClick}
              >
                <Save size={14} className="mr-1.5 text-secondary" />
                匯入 JSON
              </Button>
              <input
                ref={importFileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onImportFile(f);
                  e.target.value = "";
                }}
              />
            </div>
            {importStatus && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{importStatus}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {appTexts.textSizeSetting}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "small" as const, label: appTexts.textSizeSmall },
                  { value: "medium" as const, label: appTexts.textSizeMedium },
                  { value: "large" as const, label: appTexts.textSizeLarge },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFontSize(item.value)}
                  className={`flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    fontSize === item.value
                      ? "border-primary/40 bg-primary-container text-on-primary-container shadow-xs font-bold"
                      : "border-outline bg-surface text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface font-medium"
                  }`}
                >
                  <span
                    className={`${
                      item.value === "small" ? "text-xs" : item.value === "medium" ? "text-sm" : "text-base"
                    }`}
                  >
                    {item.label.split(" (")[0]}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-on-surface-variant">
              {fontSize === "small" && appTexts.textSizeSmallDesc}
              {fontSize === "medium" && appTexts.textSizeMediumDesc}
              {fontSize === "large" && appTexts.textSizeLargeDesc}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                介面文案
              </label>
              <button
                type="button"
                className="rounded-full px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onClick={() => updateAppTexts(DEFAULT_APP_TEXTS)}
              >
                還原預設
              </button>
            </div>
            <div className="grid gap-3">
              {(
                [
                  ["advancedSearch", "進階搜尋"],
                  ["clearAll", "清除全部"],
                  ["totalPrice", "總價標籤"],
                  ["searchPlaceholder", "搜尋提示"],
                  ["noData", "無資料文案"],
                  ["loading", "載入中文案"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">{label}</span>
                  <input
                    className="w-full rounded-2xl border border-outline bg-surface px-4 py-2.5 text-sm font-medium text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    value={(appTexts as any)[key] ?? ""}
                    onChange={(e) => updateAppTexts({ [key]: e.target.value } as Partial<AppTexts>)}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
