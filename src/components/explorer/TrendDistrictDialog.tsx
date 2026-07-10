import React from "react";
import { motion } from "motion/react";
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Transaction } from "../../types/real-estate";
import { getLatestThreeMonthsForDistrict } from "../../utils/real-estate-helpers";

type Props = {
  trendDistrict: string | null;
  onClose: () => void;
  data: Transaction[];
};

export function TrendDistrictDialog({ trendDistrict, onClose, data }: Props) {
  return (
    <>
      <Dialog open={!!trendDistrict} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[90vw] sm:max-w-md w-full p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-ink dark:text-white">
              <span className="p-1.5 rounded-lg bg-coral-500/10 dark:bg-coral-500/20 text-coral-600 dark:text-coral-400">
                <TrendingUp size={18} />
              </span>
              <span>區域熱度分析</span>
            </DialogTitle>
          </DialogHeader>
          
          {trendDistrict && (() => {
            const trendData = getLatestThreeMonthsForDistrict(trendDistrict, data);
            const totalVolume = trendData.reduce((acc, curr) => acc + curr.count, 0);
            
            let changeText = "";
            let changeStatus: "up" | "down" | "flat" = "flat";
            let changePercent = 0;
            if (trendData.length >= 2) {
              const prev = trendData[trendData.length - 2].count;
              const curr = trendData[trendData.length - 1].count;
              if (prev > 0) {
                changePercent = ((curr - prev) / prev) * 100;
                if (changePercent > 0) {
                  changeStatus = "up";
                  changeText = `月增 ${changePercent.toFixed(1)}%`;
                } else if (changePercent < 0) {
                  changeStatus = "down";
                  changeText = `月減 ${Math.abs(changePercent).toFixed(1)}%`;
                } else {
                  changeStatus = "flat";
                  changeText = "與上月持平";
                }
              } else if (curr > 0) {
                changeStatus = "up";
                changeText = "成長顯著";
              } else {
                changeText = "無變化";
              }
            }

            let vitalityDesc = "市場觀望";
            let vitalityColor = "text-slate-500 dark:text-slate-400 bg-slate-500/10";
            if (totalVolume >= 15) {
              vitalityDesc = "熱絡度極高";
              vitalityColor = "text-rose-600 bg-rose-500/12 dark:text-rose-400 dark:bg-rose-500/15";
            } else if (totalVolume >= 8) {
              vitalityDesc = "市場活絡";
              vitalityColor = "text-coral-600 bg-coral-500/12 dark:text-coral-400 dark:bg-coral-500/15";
            } else if (totalVolume >= 3) {
              vitalityDesc = "交易平穩";
              vitalityColor = "text-teal-600 bg-teal-500/12 dark:text-teal-400 dark:bg-teal-500/15";
            }

            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">【{trendDistrict}】近3月成交</span>
                    <div className="text-2xl font-black font-display text-ink dark:text-white mt-1">
                      {totalVolume} <span className="text-sm font-bold text-slate-400 dark:text-slate-500">筆</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block text-right">市場活絡度</span>
                    <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black tracking-wider mt-1.5 ${vitalityColor}`}>
                      {vitalityDesc}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block px-1">成交量走勢</span>
                  <div className="h-[180px] w-full bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-850 p-4 flex flex-col justify-between">
                    <div className="h-[120px] w-full flex items-end justify-around pb-2 border-b border-slate-100 dark:border-slate-800/50">
                      {trendData.map((d, index) => {
                        const maxCount = Math.max(...trendData.map(t => t.count), 1);
                        const heightPct = `${Math.max((d.count / maxCount) * 100, 8)}%`;
                        const isLatest = index === trendData.length - 1;
                        
                        return (
                          <div key={d.month} className="flex flex-col items-center gap-2 group w-12">
                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {d.count} 筆
                            </span>
                            <div className="w-8 relative flex justify-center bg-slate-100 dark:bg-slate-800/50 rounded-t-lg h-[90px] items-end">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: heightPct }}
                                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                                className={`w-full rounded-t-md transition-colors ${
                                  isLatest 
                                    ? "bg-gradient-to-t from-coral-600 to-coral-400 shadow-[0_4px_12px_rgba(237,111,92,0.2)]" 
                                    : "bg-slate-400/30 dark:bg-slate-700 hover:bg-slate-500/40"
                                }`}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                              {d.month.split('/')[1]}月
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1.5 px-1">
                      <span>統計區間：{trendData[0]?.month} - {trendData[2]?.month}</span>
                      {changeText && (
                        <span className={`font-black flex items-center gap-0.5 ${
                          changeStatus === 'up' 
                            ? 'text-rose-600 dark:text-rose-400' 
                            : changeStatus === 'down' 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-slate-500'
                        }`}>
                          {changeStatus === 'up' && <ArrowUp size={12} />}
                          {changeStatus === 'down' && <ArrowDown size={12} />}
                          {changeText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 bg-slate-500/5 dark:bg-black/15 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  💡 統計說明：成交量係指該行政區於特定月份之實價登錄移轉件數。若近一期較前一期有顯著增長，表示該區買氣與流動性極佳，適合買方積極考慮。
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

    </>
  );
}
