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
        <DialogContent className="max-w-[90vw] sm:max-w-md w-full p-6 bg-surface-container-high border border-outline-variant/40 rounded-[28px] shadow-[var(--md-elevation-3)]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold flex items-center gap-2.5 text-on-surface">
              <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                <TrendingUp size={16} />
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
            let vitalityColor = "text-on-surface-variant bg-surface-variant";
            if (totalVolume >= 15) {
              vitalityDesc = "熱絡度極高";
              vitalityColor = "text-on-tertiary-container bg-tertiary-container";
            } else if (totalVolume >= 8) {
              vitalityDesc = "市場活絡";
              vitalityColor = "text-on-primary-container bg-primary-container";
            } else if (totalVolume >= 3) {
              vitalityDesc = "交易平穩";
              vitalityColor = "text-on-secondary-container bg-secondary-container";
            }

            return (
              <div className="space-y-5">
                <div className="flex items-center justify-between bg-surface-container p-4 rounded-[24px] border border-outline-variant/40">
                  <div>
                    <span className="text-xs font-semibold text-on-surface-variant">【{trendDistrict}】近3月成交</span>
                    <div className="text-2xl font-bold font-display text-on-surface mt-0.5">
                      {totalVolume} <span className="text-sm font-medium text-on-surface-variant">筆</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-variant block text-right">市場活絡度</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide mt-1.5 ${vitalityColor}`}>
                      {vitalityDesc}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-on-surface-variant block px-1">成交量走勢</span>
                  <div className="h-[180px] w-full bg-surface-container rounded-[24px] border border-outline-variant/40 p-4 flex flex-col justify-between">
                    <div className="h-[120px] w-full flex items-end justify-around pb-2 border-b border-outline-variant/30">
                      {trendData.map((d, index) => {
                        const maxCount = Math.max(...trendData.map(t => t.count), 1);
                        const heightPct = `${Math.max((d.count / maxCount) * 100, 8)}%`;
                        const isLatest = index === trendData.length - 1;
                        
                        return (
                          <div key={d.month} className="flex flex-col items-center gap-1.5 group w-12">
                            <span className="text-[11px] font-bold text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {d.count} 筆
                            </span>
                            <div className="w-8 relative flex justify-center bg-surface-container-highest rounded-t-lg h-[90px] items-end">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: heightPct }}
                                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                                className={`w-full rounded-t-md transition-colors ${
                                  isLatest 
                                    ? "bg-primary shadow-xs" 
                                    : "bg-secondary/40 hover:bg-secondary/60"
                                }`}
                              />
                            </div>
                            <span className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                              {d.month.split('/')[1]}月
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant pt-1.5 px-1">
                      <span>統計區間：{trendData[0]?.month} - {trendData[2]?.month}</span>
                      {changeText && (
                        <span className={`font-bold flex items-center gap-0.5 ${
                          changeStatus === 'up' 
                            ? 'text-primary' 
                            : changeStatus === 'down' 
                              ? 'text-secondary' 
                              : 'text-on-surface-variant'
                        }`}>
                          {changeStatus === 'up' && <ArrowUp size={12} />}
                          {changeStatus === 'down' && <ArrowDown size={12} />}
                          {changeText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs leading-relaxed text-on-surface-variant bg-surface-container p-3.5 rounded-2xl border border-outline-variant/30">
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
