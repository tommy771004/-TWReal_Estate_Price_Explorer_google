import { Pin, X, ArrowRightLeft } from "lucide-react";
import type { PinnedMarketSnapshot } from "../utils/market-snapshot";
import { medianUnitPriceDeltaPct } from "../utils/market-snapshot";

interface PinnedKpiCompareProps {
  pins: PinnedMarketSnapshot[];
  onUnpin: (id: string) => void;
  onClear: () => void;
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-highest p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className="mt-0.5 truncate text-base font-bold text-on-surface">
        {value}
        {unit ? <span className="ml-0.5 text-xs font-medium text-on-surface-variant">{unit}</span> : null}
      </div>
    </div>
  );
}

function PinCard({
  pin,
  onUnpin,
  highlight,
}: {
  pin: PinnedMarketSnapshot;
  onUnpin: (id: string) => void;
  highlight?: "higher" | "lower" | null;
}) {
  return (
    <div
      className={`relative flex-1 min-w-0 rounded-[20px] border p-3 transition-colors ${
        highlight === "higher"
          ? "border-rose-300/60 bg-rose-50/50 dark:border-rose-500/30 dark:bg-rose-950/20"
          : highlight === "lower"
            ? "border-emerald-300/60 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-950/20"
            : "border-outline-variant/40 bg-surface-container"
      }`}
    >
      <button
        type="button"
        onClick={() => onUnpin(pin.id)}
        className="absolute right-2 top-2 rounded-full p-1.5 text-on-surface-variant hover:bg-on-surface/8 hover:text-error transition-colors"
        aria-label={`取消釘選 ${pin.label}`}
      >
        <X size={14} />
      </button>
      <div className="mb-2 flex items-start gap-1.5 pr-6">
        <Pin size={14} className="mt-0.5 shrink-0 text-primary" />
        <div className="min-w-0">
          <div className="truncate text-xs font-bold text-on-surface">{pin.label}</div>
          <div className="text-[11px] font-medium text-on-surface-variant">{pin.sampleHint}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Metric label="筆數" value={pin.count.toLocaleString()} />
        <Metric
          label="中位單價"
          value={pin.medianUnitPrice != null ? pin.medianUnitPrice.toFixed(1) : "—"}
          unit="萬/坪"
        />
        <Metric
          label="平均單價"
          value={pin.avgUnitPrice != null ? pin.avgUnitPrice.toFixed(1) : "—"}
          unit="萬/坪"
        />
        <Metric
          label="中位總價"
          value={pin.medianTotalPrice != null ? pin.medianTotalPrice.toFixed(0) : "—"}
          unit="萬"
        />
      </div>
    </div>
  );
}

export function PinnedKpiCompare({ pins, onUnpin, onClear }: PinnedKpiCompareProps) {
  if (pins.length === 0) return null;

  const [a, b] = pins;
  const delta = a && b ? medianUnitPriceDeltaPct(a.medianUnitPrice, b.medianUnitPrice) : null;
  const aHighlight =
    delta == null ? null : delta > 0.5 ? ("higher" as const) : delta < -0.5 ? ("lower" as const) : null;
  const bHighlight =
    delta == null ? null : delta < -0.5 ? ("higher" as const) : delta > 0.5 ? ("lower" as const) : null;

  return (
    <section
      className="rounded-[28px] border border-outline-variant/40 bg-surface-container-high p-4 shadow-[var(--md-elevation-1)] text-on-surface"
      aria-labelledby="pinned-kpi-compare"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3
            id="pinned-kpi-compare"
            className="text-xs font-bold uppercase tracking-wider text-on-surface-variant"
          >
            釘選比價
          </h3>
          <p className="mt-0.5 text-xs font-medium text-on-surface-variant">
            {pins.length === 1 ? "再釘選另一區即可對照" : "中位單價對照"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold text-primary hover:underline"
        >
          清空
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        {a && <PinCard pin={a} onUnpin={onUnpin} highlight={pins.length === 2 ? aHighlight : null} />}
        {pins.length === 2 && (
          <div className="flex shrink-0 flex-col items-center justify-center gap-1 px-1 py-1 text-center">
            <ArrowRightLeft size={16} className="text-on-surface-variant" />
            {delta != null && (
              <span
                className={`text-xs font-bold ${
                  delta > 0 ? "text-rose-600 dark:text-rose-400" : delta < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-on-surface-variant"
                }`}
              >
                {delta > 0 ? "A 高 " : delta < 0 ? "A 低 " : "相近 "}
                {Math.abs(delta).toFixed(1)}%
              </span>
            )}
          </div>
        )}
        {b && <PinCard pin={b} onUnpin={onUnpin} highlight={bHighlight} />}
      </div>
    </section>
  );
}
