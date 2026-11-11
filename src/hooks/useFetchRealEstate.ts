import { useCallback, useRef, type Dispatch, type SetStateAction } from "react";
import Papa from "papaparse";
import { CITIES, TRANSACTION_TYPES } from "../constants";
import type { Transaction } from "../types/real-estate";
import type { PeriodRange } from "../utils/real-estate-helpers";
import { mapCsvRows, mapTransactionRow } from "../utils/mapTransactionRows";
import {
  addCoverageWindow,
  fetchHistoryRows,
  isHistoryEnabled,
  mergeLatestRows,
  periodTouchesRecent,
  windowFromLvrTime,
  type CoverageWindow,
} from "../lib/historyData";

/** 補最新一期最多等多久（從查詢開始算）；逾時就先顯示分片，避免冷啟動下載拖慢查詢 */
const LATEST_WAIT_MS = 1500;

/**
 * 即時 API 的最新一期（內政部本期，約 10 天）。只當作分片的補充：
 * 任何失敗都回傳 null，不影響分片結果。
 */
async function fetchLatestRows(
  body: Record<string, unknown>,
  signal: AbortSignal
): Promise<{ rows: string[][]; lvrTime: string } | null> {
  try {
    const res = await fetch(`/api/proxy-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify(body),
    });
    if (!res.ok || !(res.headers.get("content-type") || "").includes("application/json")) return null;
    const json = await res.json();
    if (!json?.success || !Array.isArray(json.data)) return null;
    return { rows: json.data, lvrTime: typeof json.lvrTime === "string" ? json.lvrTime : "" };
  } catch {
    return null;
  }
}

/** 一次查詢實際向資料來源要的範圍（縣市、型態、行政區、關鍵字、期間） */
export type FetchedScope = {
  cityName: string;
  typeName: string;
  district: string;
  search: string;
  period: PeriodRange;
};

export type FetchOptions = {
  /** 由條件變更自動觸發（非使用者按查詢）：不計入熱門搜尋與最近搜尋 */
  auto?: boolean;
};

const scopeKey = (s: FetchedScope) =>
  [s.cityName, s.typeName, s.district, s.search.trim(), s.period.startY, s.period.startM, s.period.endY, s.period.endM].join("|");

export type FetchRealEstateParams = {
  cityName: string;
  typeName: string;
  district: string;
  search: string;
  propertyTypes: string[];
  period: PeriodRange;
  unitPrice: { min: string; max: string; unit: string };
  area: { min: string; max: string; unit: string };
  age: { min: string; max: string };
  setCityName: Dispatch<SetStateAction<string>>;
  setDistrict: Dispatch<SetStateAction<string>>;
  setSearch: Dispatch<SetStateAction<string>>;
  setData: Dispatch<SetStateAction<Transaction[]>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setDataSource: Dispatch<SetStateAction<string | null>>;
  setDataCachedAt: Dispatch<SetStateAction<string | null>>;
  /** 歷史分片的登記期間涵蓋範圍；走即時 API 時為 null */
  setDataCoverage: Dispatch<SetStateAction<CoverageWindow[] | null>>;
  setRobotStatus: Dispatch<SetStateAction<string>>;
  addRecentSearch: (kw: string) => void;
  addAuditLog: (action: string, details?: string) => void;
  fetchTrendingSearches: () => void;
};

/**
 * 用 ref 保存最新查詢參數，避免 fetchData 身分隨 period/city 變來變去，
 * 觸發 init useEffect 重跑 + isFetching 互鎖而永遠卡在 loading。
 */
export function useFetchRealEstate(p: FetchRealEstateParams) {
  const paramsRef = useRef(p);
  paramsRef.current = p;

  const abortControllerRef = useRef<AbortController | null>(null);
  const robotTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** 遞增請求世代：只採納最後一次請求的結果 */
  const requestIdRef = useRef(0);
  /** 最近一次發出的查詢範圍；自動查詢用它判斷現有資料夠不夠 */
  const lastScopeRef = useRef<FetchedScope | null>(null);
  /** 畫面上這份 data 是用哪個範圍查到的（查詢中仍是上一份）；結果快照比對用 */
  const dataScopeRef = useRef<FetchedScope | null>(null);
  /** 進行中請求的範圍 key：同範圍的重複呼叫（例如自動查詢＋按鈕）直接略過 */
  const inflightKeyRef = useRef<string | null>(null);

  const fetchData = useCallback(
    async (
      keywordOverride?: string,
      cityOverride?: string,
      districtOverride?: string,
      options?: FetchOptions
    ) => {
      const p = paramsRef.current;
      // 也會被直接當作 onClick 使用：非字串參數一律忽略
      const activeKeyword =
        typeof keywordOverride === "string" ? keywordOverride : p.search;
      const activeCity = (typeof cityOverride === "string" && cityOverride) || p.cityName;
      const activeDistrict = (typeof districtOverride === "string" && districtOverride) || p.district;
      const auto = options?.auto === true;

      const scope: FetchedScope = {
        cityName: activeCity,
        typeName: p.typeName,
        district: activeDistrict,
        search: activeKeyword,
        period: p.period,
      };
      const key = scopeKey(scope);
      if (inflightKeyRef.current === key) return;
      inflightKeyRef.current = key;
      lastScopeRef.current = scope;

      if (typeof keywordOverride === "string" && keywordOverride !== p.search) {
        p.setSearch(keywordOverride);
      }
      if (typeof cityOverride === "string" && cityOverride) p.setCityName(cityOverride);
      if (typeof districtOverride === "string" && districtOverride) p.setDistrict(districtOverride);

      if (!auto) p.addRecentSearch(activeKeyword);
      p.addAuditLog(
        "search_properties",
        JSON.stringify({
          auto,
          cityName: activeCity,
          district: activeDistrict,
          propertyTypes: p.propertyTypes,
          keyword: activeKeyword,
          period: p.period,
          unitPrice: p.unitPrice,
          area: p.area,
          age: p.age,
        })
      );

      // 取消前一請求，開始新世代
      abortControllerRef.current?.abort();
      const requestId = ++requestIdRef.current;
      const controller = new AbortController();
      abortControllerRef.current = controller;

      p.setLoading(true);
      p.setError(null);
      p.setDataSource(null);
      p.setDataCachedAt(null);
      p.setDataCoverage(null);
      robotTimeoutsRef.current.forEach(clearTimeout);
      robotTimeoutsRef.current = [];
      p.setRobotStatus("正在連線內政部開放資料...");
      robotTimeoutsRef.current.push(
        setTimeout(() => {
          if (requestIdRef.current === requestId) {
            p.setRobotStatus("正在下載與處理資料...");
          }
        }, 1500)
      );
      robotTimeoutsRef.current.push(
        setTimeout(() => {
          if (requestIdRef.current === requestId) {
            p.setRobotStatus("資料量大，需要幾秒鐘進行解析...");
          }
        }, 4000)
      );

      const isLatest = () => requestIdRef.current === requestId && !controller.signal.aborted;

      try {
        const cityCode = CITIES.find((c) => c.name === activeCity)?.code || "A";
        const typeCode = TRANSACTION_TYPES.find((t) => t.name === p.typeName)?.code || "A";

        // 優先讀靜態歷史分片（可涵蓋多年、沒有 Vercel 回應大小上限）；失敗才退回即時 API
        if (isHistoryEnabled()) {
          // 查近期時同步向即時 API 要最新一期，和分片平行進行；
          // 只等到 LATEST_WAIT_MS，畫面只更新一次（避免二次更新被當成「結果變動」）
          const startedAt = performance.now();
          const latestController = new AbortController();
          const abortLatest = () => latestController.abort();
          controller.signal.addEventListener("abort", abortLatest);
          let latest: { rows: string[][]; lvrTime: string } | null = null;
          let latestSettled = false;
          const latestPromise = periodTouchesRecent(p.period)
            ? fetchLatestRows(
                {
                  cityCode,
                  district: activeDistrict,
                  transactionType: typeCode,
                  period: p.period,
                  keyword: activeKeyword,
                  auto,
                },
                latestController.signal
              ).then((r) => {
                latest = r;
                latestSettled = true;
              })
            : null;

          try {
            const history = await fetchHistoryRows({
              cityCode,
              typeCode,
              period: p.period,
              district: activeDistrict,
              keyword: activeKeyword,
              signal: controller.signal,
            });
            if (latestPromise && !latestSettled) {
              const remaining = LATEST_WAIT_MS - (performance.now() - startedAt);
              if (remaining > 0) {
                await Promise.race([latestPromise, new Promise((r) => setTimeout(r, remaining))]);
              }
            }
            // 逾時就放棄這次的最新一期（伺服器端仍會下載完並寫入快取，下次查詢就快）
            if (!latestSettled) abortLatest();
            if (!isLatest()) return;

            let rows = history.rows;
            let coverage = history.coverage;
            const got = latest as { rows: string[][]; lvrTime: string } | null;
            if (got) {
              const merged = mergeLatestRows(rows, got.rows, typeCode);
              rows = merged.rows;
              const w = windowFromLvrTime(got.lvrTime, typeCode);
              if (w) coverage = addCoverageWindow(coverage, w);
            }

            p.setDataSource(got ? "history+latest" : "history");
            p.setDataCachedAt(history.updatedAt);
            p.setDataCoverage(coverage);
            dataScopeRef.current = scope;
            p.setData(rows.map((row, index) => mapTransactionRow(row, index, activeCity, p.typeName)));
            return;
          } catch (historyError: any) {
            abortLatest();
            if (historyError?.name === "AbortError" || !isLatest()) throw historyError;
            console.warn("[history] 讀取歷史分片失敗，改用即時 API：", historyError);
          }
        }

        // 額外逾時：避免網路掛起時 UI 永遠卡在 loading（與 abort 並用）
        const timeoutId = setTimeout(() => controller.abort(), 90_000);
        let response: Response;
        try {
          response = await fetch(`/api/proxy-search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              cityCode,
              district: activeDistrict,
              propertyTypes: p.propertyTypes,
              transactionType: typeCode,
              period: p.period,
              unitPrice: p.unitPrice,
              area: p.area,
              age: p.age,
              keyword: activeKeyword,
              auto,
            }),
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (!isLatest()) return;

        if (!response.ok) {
          let errorMsg = "無法從官方來源取得資料";
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            try {
              const errData = await response.json();
              errorMsg = errData.error || errorMsg;
            } catch {
              errorMsg = `伺服器錯誤 (${response.status})`;
            }
          } else {
            errorMsg = `伺服器連線異常 (${response.status})，請檢查網路或稍後再試。`;
          }
          throw new Error(errorMsg);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textBody = await response.text().catch(() => "");
          console.error("Non-JSON response text:", textBody.substring(0, 500));
          if (textBody.includes("Starting Server...")) {
            throw new Error("伺服器正在啟動中，請等待幾秒鐘後再重新嘗試查詢。");
          }
          throw new Error("伺服器傳回非預期的資料格式，請稍後再重試。");
        }

        const result = await response.json();
        if (!isLatest()) return;
        dataScopeRef.current = scope;

        p.setDataSource(result.source || null);
        p.setDataCachedAt(typeof result.cachedAt === "string" ? result.cachedAt : null);

        if (result.isCsv || (result.rawData && result.rawData.includes("鄉鎮市區"))) {
          await new Promise<void>((resolve, reject) => {
            Papa.parse(result.rawData, {
              header: false,
              complete: (parsed) => {
                try {
                  if (!isLatest()) {
                    resolve();
                    return;
                  }
                  const rows = parsed.data as string[][];
                  if (rows.length < 3) {
                    p.setData([]);
                  } else {
                    p.setData(mapCsvRows(rows, activeCity, p.typeName));
                  }
                  resolve();
                } catch (e) {
                  reject(e);
                }
              },
              error: (err) => reject(err),
            });
          });
        } else if (result.data && Array.isArray(result.data)) {
          const mappedData: Transaction[] = result.data.map((row: any[], index: number) =>
            mapTransactionRow(row, index, activeCity, p.typeName)
          );
          if (isLatest()) p.setData(mappedData);
        } else if (isLatest()) {
          p.setData([]);
        }
      } catch (error: any) {
        if (error?.name === "AbortError") {
          // 仍是最新請求卻被 abort → 多半是逾時；若已被更新請求取代則略過
          if (requestIdRef.current === requestId) {
            p.setError("連線逾時或請求已取消，請按「重新載入資料」再試一次。");
            p.setData([]);
          }
          return;
        }
        if (requestIdRef.current !== requestId) return;
        console.error("Fetch error details:", error);
        p.setError(error?.message || "發生網路錯誤，請稍後再試。");
        p.setData([]);
      } finally {
        // 僅最後一筆請求收尾 UI
        if (requestIdRef.current === requestId) {
          inflightKeyRef.current = null;
          robotTimeoutsRef.current.forEach(clearTimeout);
          robotTimeoutsRef.current = [];
          p.setRobotStatus("");
          p.setLoading(false);
          p.fetchTrendingSearches();
        }
      }
    },
    [] // 穩定身分：參數一律走 paramsRef
  );

  return { fetchData, abortControllerRef, lastScopeRef, dataScopeRef };
}
