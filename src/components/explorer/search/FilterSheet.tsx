import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Transaction } from "../../../types/real-estate";
import type { UserLocation } from "../../../types/app";
import type { PeriodRange } from "../../../utils/real-estate-helpers";
import { needsRefetch } from "../../../lib/filterScope";
import { useDraftFilterCount } from "../../../hooks/useDraftFilterCount";
import { PROPERTY_TYPE_OPTIONS } from "../../../constants/filterLabels";
import { DEFAULT_PROPERTY_TYPES } from "../../../lib/urlState";
import { FilterGroupRenderer } from "./FilterGroupRenderer";
import { FilterGroupShell, groupChip } from "./FilterGroupShell";
import { isPropertyTypeActive } from "./PropertyTypeChips";
import { ALL_GROUP_IDS, activeGroupCount, emptyDraft, type FilterDraft } from "./filterDraft";

type Props = {
  /** 目前已套用的條件，開啟時作為草稿種子 */
  applied: FilterDraft;
  onApply: (draft: FilterDraft, refetch: boolean) => void;
  onOpenChange: (open: boolean) => void;
  cityName: string;
  typeName: string;
  district: string;
  search: string;
  focusBuildCase: string | null;
  userLocation: UserLocation;
  data: Transaction[];
  appliedPeriod: PeriodRange;
};

/** 手機的篩選數量：一般群組＋標的種類（手機上標的種類只在抽屜裡）。 */
const sheetActiveCount = (d: FilterDraft) =>
  activeGroupCount(d) + (isPropertyTypeActive(d.propertyTypes) ? 1 : 0);

/**
 * 手機：單一「篩選」底部抽屜，footer 即時顯示筆數。
 * 標的種類在手機主畫面不常駐，放在抽屜最上方。
 */
export function FilterSheet({
  applied,
  onApply,
  onOpenChange,
  cityName,
  typeName,
  district,
  search,
  focusBuildCase,
  userLocation,
  data,
  appliedPeriod,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDraft>(applied);

  // 每次開啟時以目前已套用條件重新播種
  useEffect(() => {
    if (open) setDraft(applied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const patch = (p: Partial<FilterDraft>) => setDraft((d) => ({ ...d, ...p }));

  const mustRefetch = needsRefetch(
    { cityName, typeName, district, search, period: appliedPeriod },
    { cityName, typeName, district, search, period: draft.period }
  );

  const { count, pending } = useDraftFilterCount({
    data,
    draft,
    search,
    district,
    focusBuildCase,
    userLocation,
    skip: mustRefetch,
  });

  const total = sheetActiveCount(draft);
  const appliedCount = sheetActiveCount(applied);

  const togglePropertyType = (pt: string) =>
    setDraft((d) => ({
      ...d,
      propertyTypes: d.propertyTypes.includes(pt)
        ? d.propertyTypes.filter((p) => p !== pt)
        : [...d.propertyTypes, pt],
    }));

  const footerLabel = mustRefetch
    ? "重新查詢"
    : pending || count == null
      ? "計算中…"
      : count === 0
        ? "沒有符合的結果"
        : `顯示 ${count.toLocaleString()} 筆結果`;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChange(next);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-bold transition-all md:hidden ${
          appliedCount > 0
            ? "border-coral-400/55 bg-coral-500/12 text-coral-700 dark:border-coral-500/40 dark:text-coral-300"
            : "border-slate-200/90 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
        }`}
      >
        <SlidersHorizontal size={14} aria-hidden="true" />
        篩選
        {appliedCount > 0 && (
          <span
            aria-label={`已套用 ${appliedCount} 組條件`}
            className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-black text-white"
          >
            {appliedCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>篩選條件</SheetTitle>
          <button
            type="button"
            onClick={() => setDraft(emptyDraft())}
            className="text-[12px] font-bold text-slate-400 transition-colors hover:text-coral-500"
          >
            重設
          </button>
        </SheetHeader>

        <SheetBody>
          {mustRefetch && (
            <p className="mb-3 rounded-xl bg-amber-500/10 px-3 py-2 text-[11px] font-bold leading-relaxed text-amber-700 dark:text-amber-300">
              放寬期間或區域需重新向內政部取得資料，套用後會重新查詢。
            </p>
          )}
          <div className="space-y-5 pb-2">
            <FilterGroupShell
              title="標的種類"
              active={isPropertyTypeActive(draft.propertyTypes)}
              onClear={() => patch({ propertyTypes: [...DEFAULT_PROPERTY_TYPES] })}
            >
              <div role="group" aria-label="標的種類" className="flex flex-wrap gap-1.5">
                {PROPERTY_TYPE_OPTIONS.map((option) => {
                  const checked = draft.propertyTypes.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={checked}
                      title={option.hint}
                      onClick={() => togglePropertyType(option.value)}
                      className={groupChip(checked)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </FilterGroupShell>
            {ALL_GROUP_IDS.map((id) => (
              <div key={id}>
                <FilterGroupRenderer
                  id={id}
                  draft={draft}
                  onPatch={patch}
                  cityName={cityName}
                />
              </div>
            ))}
          </div>
        </SheetBody>

        <SheetFooter>
          <button
            type="button"
            onClick={() => setDraft(emptyDraft())}
            className="shrink-0 px-2 text-[12px] font-bold text-slate-500 dark:text-slate-400"
          >
            重設{total > 0 ? `（${total}）` : ""}
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft, mustRefetch);
              handleOpenChange(false);
            }}
            className="h-11 flex-1 rounded-full bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 shadow-xs transition-colors"
          >
            {footerLabel}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
