import { useMemo } from "react";
import type { Transaction } from "../types/real-estate";
import type { HistoryCounts } from "../types/real-estate";
import { computeMarketSnapshot } from "../utils/market-snapshot";

export type PriceBin = { name: string; count: number; sortValue: number };
export type PriceTrendPoint = { month: string; avgPrice: number; sortKey: number };
export type AggregatedPreSale = {
  buildCase: string;
  district: string;
  count: number;
  minPrice: number;
  maxPrice: number;
  sumPrice: number;
  minUnitPrice: number;
  maxUnitPrice: number;
  sumUnitPrice: number;
  unitPriceCount: number;
  lat?: number | string;
  lng?: number | string;
  avgPrice: number;
  avgUnitPrice: number;
};

export function useMarketAnalytics(
  data: Transaction[],
  filteredData: Transaction[],
  typeName: string
) {
  const districtAveragePrices = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    data.forEach((item) => {
      if (!item.district || !item.unitPrice) return;
      const price = parseFloat(item.unitPrice);
      if (isNaN(price) || price <= 0) return;
      const key = `${item.district}`;
      if (!map[key]) map[key] = { total: 0, count: 0 };
      map[key].total += price;
      map[key].count += 1;
    });
    const averages: Record<string, number> = {};
    Object.keys(map).forEach((dist) => {
      if (map[dist].count > 0) averages[dist] = map[dist].total / map[dist].count;
    });
    return averages;
  }, [data]);

  const historyCounts = useMemo((): HistoryCounts => {
    const buildCaseMap: Record<string, number> = {};
    const addressMap: Record<string, number> = {};
    data.forEach((item) => {
      if (item.buildCase) {
        buildCaseMap[item.buildCase] = (buildCaseMap[item.buildCase] || 0) + 1;
      }
      const baseAddressMatch = item.address.match(/(.+?[路街道巷弄號])/);
      if (baseAddressMatch && baseAddressMatch[1] && baseAddressMatch[1].length >= 3) {
        const baseAddr = baseAddressMatch[1];
        const key = `${item.district}_${baseAddr}_${item.buildingType}`;
        addressMap[key] = (addressMap[key] || 0) + 1;
      }
    });
    return { buildCaseMap, addressMap };
  }, [data]);

  const priceDistribution = useMemo((): PriceBin[] => {
    if (filteredData.length < 10) return [];
    const prices = filteredData.map((d) => parseFloat(d.totalPrice) / 10000).filter((p) => !isNaN(p));
    if (prices.length === 0) return [];
    let minP = prices[0];
    let maxP = prices[0];
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] < minP) minP = prices[i];
      if (prices[i] > maxP) maxP = prices[i];
    }
    const min = Math.floor(minP);
    const max = Math.ceil(maxP);
    const range = max - min;
    let step = 100;
    if (range > 10000) step = 2000;
    else if (range > 5000) step = 1000;
    else if (range > 2000) step = 500;
    else if (range > 1000) step = 200;
    else if (range > 500) step = 100;
    else if (range > 200) step = 50;
    else if (range > 100) step = 25;
    else if (range > 50) step = 10;
    else step = 5;

    const bins = new Map<number, number>();
    prices.forEach((p) => {
      const binStart = Math.floor(p / step) * step;
      bins.set(binStart, (bins.get(binStart) || 0) + 1);
    });
    return Array.from(bins.entries())
      .map(([binStart, count]) => ({
        name: `${binStart}-${binStart + step}萬`,
        count,
        sortValue: binStart,
      }))
      .sort((a, b) => a.sortValue - b.sortValue);
  }, [filteredData]);

  const priceTrend = useMemo((): PriceTrendPoint[] => {
    if (filteredData.length < 10) return [];
    const monthMap = new Map<string, { sum: number; count: number }>();
    filteredData.forEach((item) => {
      if (item.date && item.date.length >= 6) {
        const y = item.date.substring(0, item.date.length - 4);
        const m = item.date.substring(item.date.length - 4, item.date.length - 2);
        const priceVal = parseFloat(item.unitPrice);
        if (isNaN(priceVal) || priceVal <= 0) return;
        const pricePerPing = (priceVal * 3.30578) / 10000;
        const monthKey = `${y}/${m}`;
        const current = monthMap.get(monthKey) || { sum: 0, count: 0 };
        current.sum += pricePerPing;
        current.count += 1;
        monthMap.set(monthKey, current);
      }
    });
    return Array.from(monthMap.entries())
      .map(([month, d]) => ({
        month,
        avgPrice: Math.round((d.sum / d.count) * 10) / 10,
        sortKey: parseInt(month.replace("/", "")),
      }))
      .sort((a, b) => a.sortKey - b.sortKey);
  }, [filteredData]);

  const aggregatedPreSaleData = useMemo((): AggregatedPreSale[] => {
    if (typeName !== "預售屋" || filteredData.length === 0) return [];
    const map = new Map<
      string,
      {
        buildCase: string;
        district: string;
        count: number;
        minPrice: number;
        maxPrice: number;
        sumPrice: number;
        minUnitPrice: number;
        maxUnitPrice: number;
        sumUnitPrice: number;
        unitPriceCount: number;
        lat?: number | string;
        lng?: number | string;
      }
    >();

    filteredData.forEach((item) => {
      const bc = item.buildCase || "未知建案";
      const current = map.get(bc) || {
        buildCase: bc,
        district: item.district,
        count: 0,
        minPrice: Infinity,
        maxPrice: -Infinity,
        sumPrice: 0,
        minUnitPrice: Infinity,
        maxUnitPrice: -Infinity,
        sumUnitPrice: 0,
        unitPriceCount: 0,
        lat: item.lat,
        lng: item.lng,
      };
      current.count += 1;
      const p = parseFloat(item.totalPrice) || 0;
      if (p > 0) {
        if (p < current.minPrice) current.minPrice = p;
        if (p > current.maxPrice) current.maxPrice = p;
        current.sumPrice += p;
      }
      const up = parseFloat(item.unitPrice) || 0;
      if (up > 0) {
        const upPing = (up * 3.30578) / 10000;
        if (upPing < current.minUnitPrice) current.minUnitPrice = upPing;
        if (upPing > current.maxUnitPrice) current.maxUnitPrice = upPing;
        current.sumUnitPrice += upPing;
        current.unitPriceCount += 1;
      }
      if (!current.lat && item.lat) {
        current.lat = item.lat;
        current.lng = item.lng;
      }
      map.set(bc, current);
    });

    return Array.from(map.values())
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        avgPrice: item.sumPrice / item.count,
        avgUnitPrice: item.unitPriceCount > 0 ? item.sumUnitPrice / item.unitPriceCount : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData, typeName]);

  const marketSnapshot = useMemo(() => computeMarketSnapshot(filteredData), [filteredData]);

  return {
    districtAveragePrices,
    historyCounts,
    priceDistribution,
    priceTrend,
    aggregatedPreSaleData,
    marketSnapshot,
  };
}
