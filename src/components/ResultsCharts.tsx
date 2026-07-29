import { motion } from "motion/react";
import { ArrowUpDown, BarChart3, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";

type PriceTrendPoint = {
  month: string;
  avgPrice: number;
  sortKey: number;
};

type PriceDistributionPoint = {
  name: string;
  count: number;
  sortValue: number;
};

interface ResultsChartsProps {
  priceDistribution: PriceDistributionPoint[];
  priceTrend: PriceTrendPoint[];
  showChartsMobile: boolean;
  onToggleCharts: () => void;
}

const CustomTooltip = ({ active, payload, label, unit = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs flex flex-col gap-1 ring-1 ring-black/5">
        <p className="font-bold text-slate-400 dark:text-slate-500">{label}</p>
        <p className="font-bold text-slate-800 dark:text-slate-250 flex items-center gap-1">
          <span>{payload[0].name}:</span>
          <span className="text-coral-600 dark:text-coral-400 font-extrabold">{payload[0].value}{unit}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ResultsCharts({
  priceDistribution,
  priceTrend,
  showChartsMobile,
  onToggleCharts,
}: ResultsChartsProps) {
  if (priceDistribution.length === 0 && priceTrend.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 mx-0 sm:mx-6 mt-6 mb-2">
      <div className="lg:hidden">
        <Button
          variant="outline"
          className="w-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl h-12 font-bold shadow-none flex items-center justify-between"
          onClick={onToggleCharts}
        >
          <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <BarChart3 className="w-4 h-4 text-coral-600 dark:text-coral-400" />
            市場分析圖表
          </span>
          <motion.div animate={{ rotate: showChartsMobile ? 180 : 0 }}>
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
          </motion.div>
        </Button>
      </div>

      <div className={`grid-cols-1 lg:grid-cols-2 gap-4 ${!showChartsMobile ? "hidden lg:grid" : "grid"}`}>
        {priceTrend.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-none rounded-3xl"
          >
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-8 h-8 rounded-xl bg-coral-500/10 flex items-center justify-center border border-coral-500/10">
                <TrendingUp className="w-4 h-4 text-coral-600 dark:text-coral-400" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest font-sans">成交單價走勢</span>
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ed6f5c" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ed6f5c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" strokeOpacity={0.1} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    domain={["dataMin - 5", "dataMax + 5"]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                  />
                  <Tooltip content={<CustomTooltip unit=" 萬/坪" />} />
                  <Area type="monotone" name="平均單價" dataKey="avgPrice" stroke="#ed6f5c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {priceDistribution.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-none rounded-3xl"
          >
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/10">
                <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest font-sans">成交總價分布</span>
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" strokeOpacity={0.1} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                  />
                  <Tooltip content={<CustomTooltip unit=" 筆" />} />
                  <Bar name="案件數" dataKey="count" fill="#2dd4bf" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
