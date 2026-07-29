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
      <DialogContent className="grid max-h-[calc(100dvh-0.75rem)] w-[calc(100vw-0.75rem)] max-w-none grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-0 text-slate-900 shadow-2xl dark:border-slate-700/80 dark:bg-slate-950 dark:text-slate-100 sm:max-h-[min(90dvh,760px)] sm:max-w-xl sm:rounded-[2rem]">
        <DialogHeader className="border-b border-slate-200/80 bg-white px-4 py-4 pr-14 dark:border-slate-800 dark:bg-slate-950 sm:px-6 sm:py-5 sm:pr-16">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
            <Settings className="w-5 h-5 text-coral-500" />
            {appTexts.settingsTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 touch-pan-y space-y-5 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:space-y-6 sm:px-6 sm:pb-6 sm:pt-5">
          <div className="space-y-3">
            <div className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              本機資料備份
            </div>
            <p className="text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              匯出收藏、儲存條件、比較清單為 JSON；可在其他瀏覽器匯入還原（不經伺服器）。
            </p>
            <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={onExport}
              >
                <Download size={14} className="mr-1.5" />
                匯出 JSON
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={onImportClick}
              >
                <Save size={14} className="mr-1.5" />
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
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{importStatus}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
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
                  className={`flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500/40 ${
                    fontSize === item.value
                      ? "border-coral-500/40 bg-coral-500/10 text-coral-600 shadow-inner dark:border-coral-400/60 dark:bg-coral-500/15 dark:text-coral-300"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`font-bold ${
                      item.value === "small" ? "text-xs" : item.value === "medium" ? "text-sm" : "text-base"
                    }`}
                  >
                    {item.label.split(" (")[0]}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {fontSize === "small" && appTexts.textSizeSmallDesc}
              {fontSize === "medium" && appTexts.textSizeMediumDesc}
              {fontSize === "large" && appTexts.textSizeLargeDesc}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                介面文案
              </label>
              <button
                type="button"
                className="rounded-md px-1 py-0.5 text-[11px] font-bold text-coral-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500/40 dark:text-coral-400"
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base font-medium text-slate-800 caret-coral-500 outline-none transition focus:border-coral-500/70 focus:bg-white focus:ring-2 focus:ring-coral-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-coral-400/70 dark:focus:bg-slate-900 sm:py-2 sm:text-xs"
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
