import type { ReactElement } from "react";
import { ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  label: string;
  /** 已套用時顯示的摘要，例如「≤1,500萬」 */
  summary: string | null;
  active: boolean;
  onClear: () => void;
  onOpenChange: (open: boolean) => void;
  /** 只有 xl 以上才顯示（窄螢幕收進「更多條件」） */
  xlOnly?: boolean;
  children: ReactElement;
};

/**
 * 一顆篩選膠囊 + 其 popover。
 * 抽成獨立元件是為了讓 `key` 落在一般 React 元件上——
 * base-ui 的 Popover.Root props 泛型不含 key，直接在它上面掛 key 會型別錯誤。
 */
export function FilterPill({
  label,
  summary,
  active,
  onClear,
  onOpenChange,
  xlOnly = false,
  children,
}: Props) {
  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger
        className={`hidden ${xlOnly ? "xl:inline-flex" : "md:inline-flex"} h-9 items-center gap-1 rounded-full border px-3 text-[12px] font-bold transition-all ${
          active
            ? "border-coral-400/55 bg-coral-500/12 text-coral-700 dark:border-coral-500/40 dark:text-coral-300"
            : "border-slate-200/90 bg-white text-slate-600 hover:border-coral-300/60 hover:text-coral-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
        }`}
      >
        {label}
        {summary && <span className="max-w-[9rem] truncate opacity-80">· {summary}</span>}
        {active ? (
          <span
            role="button"
            tabIndex={-1}
            aria-label={`清除${label}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClear();
            }}
            className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-coral-500 hover:text-white"
          >
            <X size={10} strokeWidth={3} />
          </span>
        ) : (
          <ChevronDown size={13} className="opacity-50" />
        )}
      </PopoverTrigger>
      <PopoverContent className="max-h-[70vh] overflow-y-auto">{children}</PopoverContent>
    </Popover>
  );
}
