import { motion } from "motion/react";
import { BarChart3, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
  /** 手機是否展開（開關在市場摘要列上；lg 以上一律顯示） */
  showChartsMobile: boolean;
  /** 走勢的單價單位（買賣「萬/坪」、租賃「元/坪」） */
  unitLabel?: string;
  /** 租賃：分布圖是月租金而非成交總價 */
  rent?: boolean;
}

const CustomTooltip = ({ active, payload, label, unit = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-high border border-outline-variant/40 p-3 rounded-2xl shadow-[var(--md-elevation-2)] text-xs flex flex-col gap-1">
        <p className="font-semibold text-on-surface-variant">{label}</p>
        <p className="font-bold text-on-surface flex items-center gap-1">
          <span>{payload[0].name}:</span>
          <span className="text-primary font-bold">{payload[0].value}{unit}</span>
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
  unitLabel = "萬/坪",
  rent = false,
}: ResultsChartsProps) {
  if (priceDistribution.length === 0 && priceTrend.length === 0) {
    return null;
  }

  return (
    <div className={`${showChartsMobile ? "flex" : "hidden lg:flex"} flex-col gap-4 mx-0 sm:mx-6 mt-6 mb-2`}>
      <div className={`grid-cols-1 lg:grid-cols-2 gap-4 ${!showChartsMobile ? "hidden lg:grid" : "grid"}`}>
        {priceTrend.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 bg-surface-container border border-outline-variant/40 shadow-[var(--md-elevation-1)] rounded-[28px]"
          >
            <div className="flex items-center gap-2.5 mb-4 px-1">
              <div className="w-8 h-8 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">{rent ? "單坪月租走勢" : "成交單價走勢"}</span>
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-outline-variant/20" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "var(--on-surface-variant)", fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    domain={["dataMin - 5", "dataMax + 5"]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "var(--on-surface-variant)", fontWeight: 500 }}
                  />
                  <Tooltip content={<CustomTooltip unit={` ${unitLabel}`} />} />
                  <Area type="monotone" name="平均單價" dataKey="avgPrice" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {priceDistribution.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 bg-surface-container border border-outline-variant/40 shadow-[var(--md-elevation-1)] rounded-[28px]"
          >
            <div className="flex items-center gap-2.5 mb-4 px-1">
              <div className="w-8 h-8 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">{rent ? "月租金分布" : "成交總價分布"}</span>
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-outline-variant/20" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "var(--on-surface-variant)", fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "var(--on-surface-variant)", fontWeight: 500 }}
                  />
                  <Tooltip content={<CustomTooltip unit=" 筆" />} />
                  <Bar name="案件數" dataKey="count" fill="var(--tertiary)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
