import { FilterGroupShell, groupNumberInput } from "../FilterGroupShell";
import { RangeChipGroup } from "./RangeChipGroup";
import { BudgetPicker } from "./BudgetPicker";
import { RENT_PRICE_PRESETS, TOTAL_PRICE_PRESETS } from "../../../../constants/filterLabels";

export type PriceValue = {
  totalPriceMinWan: string;
  totalPriceMaxWan: string;
  unitPrice: { min: string; max: string; unit: string };
};

type Props = {
  value: PriceValue;
  onChange: (next: PriceValue) => void;
  /** 租賃：總價改為月租（元）、單價改為元/坪，不顯示房貸月付反推 */
  rent?: boolean;
};

const fmtYuan = (v: string) => Number(v).toLocaleString();

export const isPriceActive = (v: PriceValue) =>
  Boolean(v.totalPriceMinWan || v.totalPriceMaxWan || v.unitPrice.min || v.unitPrice.max);

export const priceSummary = (v: PriceValue, rent = false): string | null => {
  // 租賃時 totalPrice 欄位存的是月租（元）
  const lo = rent ? fmtYuan(v.totalPriceMinWan) : v.totalPriceMinWan;
  const hi = rent ? fmtYuan(v.totalPriceMaxWan) : v.totalPriceMaxWan;
  const unit = rent ? "元" : "萬";
  if (v.totalPriceMinWan && v.totalPriceMaxWan) return `${lo}–${hi}${unit}`;
  if (v.totalPriceMaxWan) return `≤${hi}${unit}`;
  if (v.totalPriceMinWan) return `≥${lo}${unit}`;
  if (v.unitPrice.min && v.unitPrice.max)
    return `單價 ${v.unitPrice.min}–${v.unitPrice.max}`;
  if (v.unitPrice.max) return `單價 ≤${v.unitPrice.max}`;
  if (v.unitPrice.min) return `單價 ≥${v.unitPrice.min}`;
  return null;
};

/** 價格：總價區間（含月付反推）＋ 單價區間。買賣為萬、萬/坪；租賃為月租元、元/坪。 */
export function PriceFilterGroup({ value, onChange, rent = false }: Props) {
  const unitLabel = rent ? "元/坪" : "萬/坪";
  const clear = () =>
    onChange({
      totalPriceMinWan: "",
      totalPriceMaxWan: "",
      unitPrice: { min: "", max: "", unit: "1" },
    });

  return (
    <FilterGroupShell title={rent ? "租金" : "價格"} active={isPriceActive(value)} onClear={clear}>
      <div className="space-y-3">
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {rent ? "月租" : "總價"}
          </span>
          <RangeChipGroup
            presets={rent ? RENT_PRICE_PRESETS : TOTAL_PRICE_PRESETS}
            value={{ min: value.totalPriceMinWan, max: value.totalPriceMaxWan }}
            onChange={(r) =>
              onChange({ ...value, totalPriceMinWan: r.min, totalPriceMaxWan: r.max })
            }
            unitSuffix={rent ? "元" : "萬"}
          />
          {!rent && (
            <BudgetPicker
              totalPriceMaxWan={value.totalPriceMaxWan}
              onApplyBudgetWan={(wan) =>
                onChange({ ...value, totalPriceMaxWan: String(wan) })
              }
            />
          )}
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {rent ? "單坪月租" : "單價"}（{unitLabel}）
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              inputMode="numeric"
              placeholder="最低"
              className={groupNumberInput}
              value={value.unitPrice.min}
              onChange={(e) =>
                onChange({ ...value, unitPrice: { ...value.unitPrice, min: e.target.value } })
              }
            />
            <span className="text-slate-300">–</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="最高"
              className={groupNumberInput}
              value={value.unitPrice.max}
              onChange={(e) =>
                onChange({ ...value, unitPrice: { ...value.unitPrice, max: e.target.value } })
              }
            />
            <span className="shrink-0 text-[11px] font-bold text-slate-400">{unitLabel}</span>
          </div>
        </div>
      </div>
    </FilterGroupShell>
  );
}
