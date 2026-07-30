import { PROPERTY_TYPE_OPTIONS } from "../../../constants/filterLabels";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

/**
 * 標的種類多選。
 * 顯示白話標籤，但送出的值維持內政部官方字串。
 */
export function PropertyTypeChips({ value, onChange }: Props) {
  return (
    <div className="flex flex-nowrap sm:flex-wrap gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
      {PROPERTY_TYPE_OPTIONS.map((option) => (
        <label key={option.value} className="relative cursor-pointer group shrink-0 snap-start">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={value.includes(option.value)}
            onChange={(e) => {
              if (e.target.checked) onChange([...value, option.value]);
              else onChange(value.filter((p) => p !== option.value));
            }}
          />
          <div
            title={option.hint}
            className="px-2.5 sm:px-3 xl:px-4 h-[44px] flex items-center justify-center rounded-[1rem] border border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/50 text-[12px] sm:text-[13px] font-bold text-slate-500 dark:text-slate-400 peer-checked:bg-coral-500/10 dark:peer-checked:bg-coral-900/30 peer-checked:text-coral-600 dark:peer-checked:text-coral-400 peer-checked:border-coral-300 dark:peer-checked:border-coral-500/30 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:-translate-y-[1px] active:translate-y-0 whitespace-nowrap"
          >
            {option.label}
          </div>
        </label>
      ))}
    </div>
  );
}
