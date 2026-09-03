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
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-high px-4 py-3 shadow-[var(--md-elevation-1)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-on-surface">
                <Loader2 size={14} className="shrink-0 animate-spin text-primary" />
                <MapPin size={14} className="shrink-0 text-primary" />
                <span className="truncate">
                  地圖定位中 {geocodedCount}/{totalToGeocode}
                  <span className="ml-1 text-[11px] font-normal text-on-surface-variant">（門牌約略，限速請求）</span>
                </span>
              </div>
              <span className="shrink-0 text-xs font-bold tabular-nums text-primary">
                {pct}%
              </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
              <motion.div
                className="h-full rounded-full bg-primary"
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
