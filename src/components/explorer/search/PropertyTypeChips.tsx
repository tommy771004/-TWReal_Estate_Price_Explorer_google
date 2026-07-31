import { PROPERTY_TYPE_OPTIONS, propertyTypeLabel } from "../../../constants/filterLabels";
import { DEFAULT_PROPERTY_TYPES } from "../../../lib/urlState";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

export const isPropertyTypeActive = (v: string[]) =>
  !(v.length === DEFAULT_PROPERTY_TYPES.length &&
    DEFAULT_PROPERTY_TYPES.every((pt) => v.includes(pt)));

export const propertyTypeSummary = (v: string[]): string | null => {
  if (!isPropertyTypeActive(v)) return null;
  if (v.length === 0) return "未選";
  if (v.length === 1) return propertyTypeLabel(v[0]);
  return `${v.length} 項`;
};

/**
 * 標的種類：房地／房地(車)／建物／車位／土地。
 *
 * 這是資料集的主要大分類（土地、車位與住宅是不同商品），
 * 因此與交易型態同層常駐顯示，不收進次要的篩選膠囊。
 * 顯示白話標籤，送出的值維持內政部官方字串。
 */
export function PropertyTypeChips({ value, onChange }: Props) {
  const toggle = (pt: string) => {
    if (value.includes(pt)) onChange(value.filter((p) => p !== pt));
    else onChange([...value, pt]);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="hidden shrink-0 text-[10px] font-black tracking-wide text-slate-400 sm:inline">
        標的種類
      </span>
      <div className="-mx-3 flex flex-nowrap gap-1.5 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
        {PROPERTY_TYPE_OPTIONS.map((option) => {
          const checked = value.includes(option.value);
          return (
            <label key={option.value} className="shrink-0 cursor-pointer">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={checked}
                onChange={() => toggle(option.value)}
              />
              <span
                title={option.hint}
                className={`inline-flex h-9 items-center rounded-full border px-3.5 text-[12px] font-bold whitespace-nowrap transition-all ${
                  checked
                    ? "border-coral-400/55 bg-coral-500/12 text-coral-700 dark:border-coral-500/40 dark:text-coral-300"
                    : "border-slate-200/90 bg-white text-slate-500 hover:border-coral-300/60 hover:text-coral-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400"
                }`}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      {isPropertyTypeActive(value) && (
        <button
          type="button"
          onClick={() => onChange([...DEFAULT_PROPERTY_TYPES])}
          className="shrink-0 text-[11px] font-bold text-slate-400 transition-colors hover:text-coral-500"
        >
          回預設
        </button>
      )}
    </div>
  );
}
