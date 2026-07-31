import { FilterGroupShell } from "../FilterGroupShell";
import { PROPERTY_TYPE_OPTIONS, propertyTypeLabel } from "../../../../constants/filterLabels";
import { DEFAULT_PROPERTY_TYPES } from "../../../../lib/urlState";

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
 * 標的種類多選。顯示白話標籤，送出的值維持內政部官方字串。
 */
export function PropertyTypeFilterGroup({ value, onChange }: Props) {
  const toggle = (pt: string) => {
    if (value.includes(pt)) onChange(value.filter((p) => p !== pt));
    else onChange([...value, pt]);
  };

  return (
    <FilterGroupShell
      title="類型"
      active={isPropertyTypeActive(value)}
      onClear={() => onChange([...DEFAULT_PROPERTY_TYPES])}
    >
      <div className="space-y-1.5">
        {PROPERTY_TYPE_OPTIONS.map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2 transition-all ${
                checked
                  ? "border-coral-400/55 bg-coral-500/10"
                  : "border-slate-200 bg-white hover:border-coral-300 dark:border-slate-700 dark:bg-slate-900/60"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={() => toggle(opt.value)}
              />
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${
                  checked
                    ? "border-coral-500 bg-coral-500 text-white"
                    : "border-slate-300 dark:border-slate-600"
                }`}
                aria-hidden="true"
              >
                {checked && (
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-none stroke-current stroke-[2.5]">
                    <path d="M2 6.5L4.5 9L10 3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-[13px] font-bold ${
                    checked
                      ? "text-coral-700 dark:text-coral-300"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {opt.label}
                </span>
                <span className="block text-[10px] font-medium text-slate-400">{opt.hint}</span>
              </span>
            </label>
          );
        })}
      </div>
      <p className="text-[10px] font-medium text-slate-400">
        預設已選：房屋＋土地、僅建物、土地
      </p>
    </FilterGroupShell>
  );
}
