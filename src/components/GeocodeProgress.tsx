import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Loader2 } from "lucide-react";

type Props = {
  isGeocoding: boolean;
  geocodedCount: number;
  totalToGeocode: number;
};

/** 列表／地圖旁顯示地理編碼進度，避免使用者以為卡住。 */
export function GeocodeProgress({ isGeocoding, geocodedCount, totalToGeocode }: Props) {
  const pct =
    totalToGeocode > 0 ? Math.min(100, Math.round((geocodedCount / totalToGeocode) * 100)) : 0;
  const show = isGeocoding && totalToGeocode > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mx-1.5 mb-3 sm:mx-6"
        >
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/90 px-3.5 py-2.5 shadow-sm dark:border-amber-500/25 dark:bg-amber-950/35">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-[11px] font-bold text-amber-900 dark:text-amber-100">
                <Loader2 size={14} className="shrink-0 animate-spin text-amber-600" />
                <MapPin size={13} className="shrink-0 text-amber-600" />
                <span className="truncate">
                  地圖定位中 {geocodedCount}/{totalToGeocode}
                  <span className="ml-1 font-medium opacity-70">（門牌約略，限速請求）</span>
                </span>
              </div>
              <span className="shrink-0 text-[10px] font-black tabular-nums text-amber-700 dark:text-amber-300">
                {pct}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-200/60 dark:bg-amber-900/50">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-coral-500"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
