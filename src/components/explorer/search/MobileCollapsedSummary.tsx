import { motion } from "motion/react";
import { Filter, MapPin } from "lucide-react";

type Props = {
  cityName: string;
  district: string;
  search: string;
  onExpand: () => void;
};

/** 手機收合狀態下的條件摘要列，點擊即展開完整搜尋區。 */
export function MobileCollapsedSummary({ cityName, district, search, onExpand }: Props) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-[1600px] mx-auto w-full md:hidden flex items-center justify-between liquid-glass-panel px-5 py-3 rounded-2xl shadow-none cursor-pointer hover:bg-white/40 active:scale-[0.98] transition-all overflow-hidden mb-2"
      onClick={onExpand}
    >
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
        <MapPin size={14} className="text-coral-500" />
        <span className="font-bold text-sm truncate max-w-[150px] sm:max-w-none">
          {cityName} {district !== "全部" ? `· ${district}` : ""}
        </span>
        {search && <span className="text-xs opacity-70 truncate max-w-[80px]">"{search}"</span>}
      </div>
      <div className="flex items-center gap-1.5 text-coral-500 font-bold text-[10px] bg-coral-500/10 px-2.5 py-1.5 rounded-lg shrink-0">
        <Filter size={12} /> 展開條件
      </div>
    </motion.div>
  );
}
