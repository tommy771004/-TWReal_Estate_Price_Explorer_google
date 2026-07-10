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
      <DialogContent className="max-w-[95vw] sm:max-w-xl w-full p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Settings className="w-5 h-5 text-coral-500" />
            {appTexts.settingsTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              本機資料備份
            </label>
            <p className="text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              匯出收藏、儲存條件、比較清單為 JSON；可在其他瀏覽器匯入還原（不經伺服器）。
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" className="rounded-xl text-xs font-bold" onClick={onExport}>
                <Download size={14} className="mr-1.5" />
                匯出 JSON
              </Button>
              <Button type="button" variant="outline" size="sm" className="rounded-xl text-xs font-bold" onClick={onImportClick}>
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
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              {appTexts.textSizeSetting}
            </label>
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
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    fontSize === item.value
                      ? "bg-coral-500/10 text-coral-600 dark:text-coral-400 border-coral-500/40 shadow-inner"
                      : "bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
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
            <p className="text-[11px] text-slate-400 font-medium">
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
                className="text-[11px] font-bold text-coral-600 hover:underline"
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-850"
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
