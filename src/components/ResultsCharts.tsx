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
    <div className="flex flex-col gap-4 mx-4 sm:mx-6 mt-6 mb-2">
      <div className="lg:hidden">
        <Button
          variant="outline"
          className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border-white/60 dark:border-white/10 rounded-2xl h-12 font-bold shadow-sm flex items-center justify-between"
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
            className="p-5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 shadow-xl rounded-3xl"
          >
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">成交單價走勢</span>
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" strokeOpacity={0.15} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    domain={["dataMin - 5", "dataMax + 5"]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      borderRadius: "16px",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                      backdropFilter: "blur(20px)",
                      color: "#0f172a",
                    }}
                    itemStyle={{ color: "#4f46e5", fontWeight: "900" }}
                    labelStyle={{
                      color: "#64748b",
                      fontWeight: "900",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: "4px",
                    }}
                    formatter={(value) => [`${value} 萬/坪`, "平均單價"]}
                  />
                  <Area type="monotone" name="平均單價" dataKey="avgPrice" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {priceDistribution.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 shadow-xl rounded-3xl"
          >
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-8 h-8 rounded-xl bg-coral-500/10 flex items-center justify-center border border-coral-500/20">
                <BarChart3 className="w-4 h-4 text-coral-600 dark:text-coral-400" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">成交總價分布</span>
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" strokeOpacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#14b8a6", opacity: 0.1 }}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      borderRadius: "16px",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                      backdropFilter: "blur(20px)",
                      color: "#0f172a",
                    }}
                    itemStyle={{ color: "#0d9488", fontWeight: "900" }}
                    labelStyle={{
                      color: "#64748b",
                      fontWeight: "900",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: "4px",
                    }}
                  />
                  <Bar name="案件數" dataKey="count" fill="#2dd4bf" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
