import { useCallback, useRef, type Dispatch, type SetStateAction } from "react";
import Papa from "papaparse";
import { CITIES, TRANSACTION_TYPES } from "../constants";
import type { Transaction } from "../types/real-estate";
import type { PeriodRange } from "../utils/real-estate-helpers";
import { mapCsvRows, mapTransactionRow } from "../utils/mapTransactionRows";

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
  setRobotStatus: Dispatch<SetStateAction<string>>;
  setIsSearchExpanded: Dispatch<SetStateAction<boolean>>;
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

  const fetchData = useCallback(
    async (keywordOverride?: string, cityOverride?: string, districtOverride?: string) => {
      const p = paramsRef.current;
      const activeKeyword =
        typeof keywordOverride === "string" ? keywordOverride : p.search;
      const activeCity = cityOverride || p.cityName;
      const activeDistrict = districtOverride || p.district;

      if (typeof keywordOverride === "string" && keywordOverride !== p.search) {
        p.setSearch(keywordOverride);
      }
      if (cityOverride) p.setCityName(cityOverride);
      if (districtOverride) p.setDistrict(districtOverride);

      p.addRecentSearch(activeKeyword);
      p.addAuditLog(
        "search_properties",
        JSON.stringify({
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
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        p.setIsSearchExpanded(false);
      }

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
            p.setError("連線逾時或請求已取消，請再按「開始查詢」重試。");
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

  return { fetchData, abortControllerRef };
}
