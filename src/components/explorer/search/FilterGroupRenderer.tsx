import type { ReactElement } from "react";
import type { FilterGroupId } from "../../../constants/filterLabels";
import type { MetroStation } from "../../../constants/queryPresets";
import type { FilterDraft } from "./filterDraft";
import { draftNearbyLabel } from "./filterDraft";
import { PriceFilterGroup } from "./groups/PriceFilterGroup";
import { AreaFilterGroup } from "./groups/AreaFilterGroup";
import { LayoutFilterGroup } from "./groups/LayoutFilterGroup";
import { AgeFilterGroup } from "./groups/AgeFilterGroup";
import { PeriodFilterGroup } from "./groups/PeriodFilterGroup";
import { MoreFilterGroup } from "./groups/MoreFilterGroup";

type Props = {
  id: FilterGroupId;
  draft: FilterDraft;
  onPatch: (patch: Partial<FilterDraft>) => void;
  cityName: string;
};

/**
 * 依 group id 渲染對應的篩選群組。
 * 桌機 popover 一次渲染一個、手機抽屜依序渲染全部，共用這一份。
 *
 * 回傳型別明確標註為 ReactElement：switch 雖然已窮盡 FilterGroupId，
 * TS 仍會把隱含的 fallthrough 推成 `| undefined`，導致它不被當成合法的 JSX 元件。
 */
export function FilterGroupRenderer({
  id,
  draft,
  onPatch,
  cityName,
}: Props): ReactElement {
  switch (id) {
    case "price":
      return (
        <PriceFilterGroup
          value={{
            totalPriceMinWan: draft.totalPriceMinWan,
            totalPriceMaxWan: draft.totalPriceMaxWan,
            unitPrice: draft.unitPrice,
          }}
          onChange={(v) => onPatch(v)}
        />
      );

    case "area":
      return <AreaFilterGroup value={draft.area} onChange={(area) => onPatch({ area })} />;

    case "layout":
      return (
        <LayoutFilterGroup
          value={{
            roomsMin: draft.roomsMin,
            parkingFilter: draft.parkingFilter,
            hasManagement: draft.hasManagement,
          }}
          onChange={(v) => onPatch(v)}
        />
      );

    case "age":
      return <AgeFilterGroup value={draft.age} onChange={(age) => onPatch({ age })} />;

    case "period":
      return <PeriodFilterGroup value={draft.period} onChange={(period) => onPatch({ period })} />;

    case "more":
      return (
        <MoreFilterGroup
          cityName={cityName}
          value={{
            excludeSpecial: draft.excludeSpecial,
            nearbyKm: draft.nearbyKm,
            nearbyLabel: draftNearbyLabel(draft),
          }}
          onChangeExcludeSpecial={(excludeSpecial) => onPatch({ excludeSpecial })}
          onPickStation={(station: MetroStation, km: number) =>
            onPatch({
              nearbyKm: km,
              nearbyAnchor: { lat: station.lat, lng: station.lng, label: station.name },
            })
          }
          onClearNearby={() => onPatch({ nearbyKm: null, nearbyAnchor: null })}
        />
      );
  }
}
