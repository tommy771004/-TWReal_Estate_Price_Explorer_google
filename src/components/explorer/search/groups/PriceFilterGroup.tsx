import { FilterGroupShell, groupNumberInput } from "../FilterGroupShell";
import { RangeChipGroup } from "./RangeChipGroup";
import { BudgetPicker } from "./BudgetPicker";
import { TOTAL_PRICE_PRESETS } from "../../../../constants/filterLabels";

export type PriceValue = {
  totalPriceMinWan: string;
  totalPriceMaxWan: string;
  unitPrice: { min: string; max: string; unit: string };
};

type Props = {
  value: PriceValue;
  onChange: (next: PriceValue) => void;
};

export const isPriceActive = (v: PriceValue) =>
  Boolean(v.totalPriceMinWan || v.totalPriceMaxWan || v.unitPrice.min || v.unitPrice.max);

export const priceSummary = (v: PriceValue): string | null => {
  if (v.totalPriceMinWan && v.totalPriceMaxWan)
    return `${v.totalPriceMinWan}–${v.totalPriceMaxWan}萬`;
  if (v.totalPriceMaxWan) return `≤${v.totalPriceMaxWan}萬`;
  if (v.totalPriceMinWan) return `≥${v.totalPriceMinWan}萬`;
  if (v.unitPrice.min && v.unitPrice.max)
    return `單價 ${v.unitPrice.min}–${v.unitPrice.max}`;
  if (v.unitPrice.max) return `單價 ≤${v.unitPrice.max}`;
  if (v.unitPrice.min) return `單價 ≥${v.unitPrice.min}`;
  return null;
};

/** 價格：總價區間（含月付反推）＋ 單價區間，單位固定「萬/坪」。 */
export function PriceFilterGroup({ value, onChange }: Props) {
  const clear = () =>
    onChange({
      totalPriceMinWan: "",
      totalPriceMaxWan: "",
      unitPrice: { min: "", max: "", unit: "1" },
    });

  return (
    <FilterGroupShell title="價格" active={isPriceActive(value)} onClear={clear}>
      <div className="space-y-3">
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">總價</span>
          <RangeChipGroup
            presets={TOTAL_PRICE_PRESETS}
            value={{ min: value.totalPriceMinWan, max: value.totalPriceMaxWan }}
            onChange={(r) =>
              onChange({ ...value, totalPriceMinWan: r.min, totalPriceMaxWan: r.max })
            }
            unitSuffix="萬"
          />
          <BudgetPicker
            totalPriceMaxWan={value.totalPriceMaxWan}
            onApplyBudgetWan={(wan) =>
              onChange({ ...value, totalPriceMaxWan: String(wan) })
            }
          />
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            單價（萬/坪）
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
            <span className="shrink-0 text-[11px] font-bold text-slate-400">萬/坪</span>
          </div>
        </div>
      </div>
    </FilterGroupShell>
  );
}
