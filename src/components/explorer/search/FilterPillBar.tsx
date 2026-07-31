import { Fragment, type ReactNode } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FILTER_GROUP_LABELS, type FilterGroupId } from "../../../constants/filterLabels";
import { FilterGroupRenderer } from "./FilterGroupRenderer";
import { FilterPill } from "./FilterPill";
import {
  ALL_GROUP_IDS,
  activeGroupCount,
  groupSummary,
  isGroupActive,
  type FilterDraft,
} from "./filterDraft";

type Props = {
  draft: FilterDraft;
  onPatch: (patch: Partial<FilterDraft>) => void;
  onClearGroup: (id: FilterGroupId) => void;
  onClearAll: () => void;
  cityName: string;
  onOpenChange: (open: boolean) => void;
  /** 手機用的「篩選」抽屜觸發鈕，與膠囊列同一行 */
  mobileTrigger?: ReactNode;
};

/** 窄螢幕時收進「更多條件」的群組 */
const XL_ONLY: FilterGroupId[] = ["propertyType", "period"];

/** 桌機膠囊列：一顆膠囊一個 popover，取代原本一次攤開的進階篩選面板。 */
export function FilterPillBar({
  draft,
  onPatch,
  onClearGroup,
  onClearAll,
  cityName,
  onOpenChange,
  mobileTrigger,
}: Props) {
  const total = activeGroupCount(draft);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {mobileTrigger}

      {/* key 掛在 Fragment 上：本專案未安裝 @types/react，
          明確標註 props 型別的元件不接受 key，且此處不能多包一層 DOM 破壞 flex 版面 */}
      {ALL_GROUP_IDS.map((id) => (
        <Fragment key={id}>
        <FilterPill
          label={FILTER_GROUP_LABELS[id]}
          summary={groupSummary(id, draft)}
          active={isGroupActive(id, draft)}
          onClear={() => onClearGroup(id)}
          onOpenChange={onOpenChange}
          xlOnly={XL_ONLY.includes(id)}
        >
          <FilterGroupRenderer id={id} draft={draft} onPatch={onPatch} cityName={cityName} />
        </FilterPill>
        </Fragment>
      ))}

      {/* 窄螢幕：把 xl-only 群組收進「更多條件」 */}
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger className="hidden h-9 items-center gap-1 rounded-full border border-slate-200/90 bg-white px-3 text-[12px] font-bold text-slate-600 transition-all hover:border-coral-300/60 hover:text-coral-600 md:inline-flex xl:hidden dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          <SlidersHorizontal size={13} className="opacity-60" />
          更多條件
          <ChevronDown size={13} className="opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            {XL_ONLY.map((id) => (
              <div key={id}>
                <FilterGroupRenderer
                  id={id}
                  draft={draft}
                  onPatch={onPatch}
                  cityName={cityName}
                />
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {total > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="hidden h-9 items-center gap-1 rounded-full px-2.5 text-[11px] font-bold text-slate-400 transition-colors hover:text-coral-500 md:inline-flex"
        >
          清除全部（{total}）
        </button>
      )}
    </div>
  );
}
