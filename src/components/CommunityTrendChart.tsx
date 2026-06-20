import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "../utils/real-estate-helpers";

type CommunityTrendPoint = {
  date: string;
  unitPrice: number;
  isCurrent: boolean;
  address: string;
  floor: string;
  totalPrice: number;
};

export default function CommunityTrendChart({ data }: { data: CommunityTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} dy={10} />
        <YAxis domain={["auto", "auto"]} hide />
        <Tooltip content={({ active, payload }) => {
          if (!active || !payload?.length) return null;
          const point = payload[0].payload as CommunityTrendPoint;
          return (
            <div className="flex min-w-[140px] flex-col gap-1.5 rounded-xl border border-slate-200 bg-white/90 p-3 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-500">{point.date}</span>
                {point.isCurrent && <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-600">當前點擊</span>}
              </div>
              <div className="flex items-baseline gap-1 text-lg font-black text-ink dark:text-white">
                {point.unitPrice} <span className="text-xs font-bold text-slate-400">萬/坪</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>總價: {formatPrice(point.totalPrice.toString())}</span>
                <span>樓層: {point.floor}</span>
              </div>
            </div>
          );
        }} />
        <Area type="monotone" dataKey="unitPrice" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPrice)" activeDot={{ r: 6, strokeWidth: 0, fill: "#3b82f6" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
