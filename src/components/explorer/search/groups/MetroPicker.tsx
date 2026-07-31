import { useMemo, useState } from "react";
import { Train } from "lucide-react";
import { stationsForCity, type MetroStation } from "../../../../constants/queryPresets";

type Props = {
  cityName: string;
  /** 目前中心標籤，例如「大安 · 1km」 */
  nearbyLabel: string | null;
  onPickStation: (station: MetroStation, km: number) => void;
  onClear: () => void;
};

const RADIUS_OPTIONS = [0.5, 1, 2];

/** 捷運生活圈：選站 + 半徑。由原 QueryAssistBar「捷運生活圈」段落搬來。 */
export function MetroPicker({ cityName, nearbyLabel, onPickStation, onClear }: Props) {
  const [km, setKm] = useState(1);
  const stations = useMemo(() => stationsForCity(cityName), [cityName]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-slate-500 dark:text-slate-400">
          <Train size={12} className="text-sky-500" />
          捷運生活圈
        </span>
        <div className="inline-flex rounded-full border border-slate-200/90 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-950/50">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setKm(r)}
              className={`h-7 rounded-full px-2.5 text-[10px] font-bold transition ${
                km === r
                  ? "bg-white text-sky-700 shadow-sm dark:bg-slate-800 dark:text-sky-300"
                  : "text-slate-400"
              }`}
            >
              {r < 1 ? `${r * 1000}m` : `${r}km`}
            </button>
          ))}
        </div>
      </div>

      {nearbyLabel && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-sky-500/10 px-2.5 py-1.5">
          <span className="truncate text-[11px] font-bold text-sky-700 dark:text-sky-300">
            目前中心：{nearbyLabel}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-[11px] font-bold text-sky-600/70 transition-colors hover:text-sky-800 dark:hover:text-sky-200"
          >
            取消
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {stations.map((s) => {
          const active = Boolean(nearbyLabel?.startsWith(s.name));
          return (
            <button
              key={s.id}
              type="button"
              title={s.lines ? `${s.name}（${s.lines}）` : s.name}
              onClick={() => onPickStation(s, km)}
              className={`inline-flex h-8 items-center gap-1 rounded-xl border px-2.5 text-[12px] font-bold transition-all whitespace-nowrap ${
                active
                  ? "border-sky-400/55 bg-sky-500/12 text-sky-800 dark:text-sky-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
              }`}
            >
              <Train size={11} className={active ? "text-sky-500" : "text-slate-400"} />
              {s.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
