import { useMemo } from "react";
import type { Transaction } from "../types/real-estate";
import type { PeriodRange } from "../utils/real-estate-helpers";
import { isSpecialRelationTransaction } from "../utils/real-estate-helpers";
import { calculateDistance } from "../lib/utils";
import type { ManagementFilter, ParkingFilter } from "../lib/urlState";
import type { NearbyAnchor, SortConfig, UserLocation } from "../types/app";

export type FilterParams = {
  data: Transaction[];
  search: string;
  district: string;
  propertyTypes: string[];
  period: PeriodRange;
  unitPrice: { min: string; max: string; unit: string };
  area: { min: string; max: string; unit: string };
  age: { min: string; max: string };
  roomsMin: string;
  hasManagement: ManagementFilter;
  parkingFilter: ParkingFilter;
  focusBuildCase: string | null;
  excludeSpecial: boolean;
  totalPriceMaxWan: string;
  nearbyKm: number | null;
  nearbyAnchor: NearbyAnchor | null;
  userLocation: UserLocation;
  sortConfig: SortConfig | null;
};

export function useFilteredTransactions(params: FilterParams): Transaction[] {
  const {
    data,
    search,
    district,
    propertyTypes,
    period,
    unitPrice,
    area,
    age,
    roomsMin,
    hasManagement,
    parkingFilter,
    focusBuildCase,
    excludeSpecial,
    totalPriceMaxWan,
    nearbyKm,
    nearbyAnchor,
    userLocation,
    sortConfig,
  } = params;

  return useMemo(() => {
    let result = data.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.address.includes(search) ||
        item.district.includes(search) ||
        item.buildingType.includes(search) ||
        Boolean(item.buildCase && item.buildCase.includes(search));

      const matchesDistrict = district === "全部" || item.district === district;

      const matchesPropertyType =
        propertyTypes.length === 0 ||
        propertyTypes.some((pt) => {
          if (pt === "房地") {
            return item.transactionType === "房地(土地+建物)" || item.transactionType === "房地";
          }
          if (pt === "房地(車)") {
            return (
              item.transactionType === "房地(土地+建物)+車位" || item.transactionType.includes("車位")
            );
          }
          return item.transactionType === pt;
        });

      let matchesPeriod = true;
      if (item.date && item.date.length >= 6) {
        const itemY = parseInt(item.date.substring(0, item.date.length - 4));
        const itemM = parseInt(item.date.substring(item.date.length - 4, item.date.length - 2));
        const startY = parseInt(period.startY);
        const startM = parseInt(period.startM);
        const endY = parseInt(period.endY);
        const endM = parseInt(period.endM);
        const itemDateVal = itemY * 12 + itemM;
        const startDateVal = startY * 12 + startM;
        const endDateVal = endY * 12 + endM;
        matchesPeriod = itemDateVal >= startDateVal && itemDateVal <= endDateVal;
      }

      let matchesUnitPrice = true;
      if (unitPrice.min !== "" || unitPrice.max !== "") {
        const priceVal = parseFloat(item.unitPrice) || 0;
        let comparePrice = priceVal;
        if (unitPrice.unit === "1") {
          comparePrice = (priceVal * 3.30578) / 10000;
        }
        const min = parseFloat(unitPrice.min);
        const max = parseFloat(unitPrice.max);
        if (!isNaN(min) && comparePrice < min) matchesUnitPrice = false;
        if (!isNaN(max) && comparePrice > max) matchesUnitPrice = false;
      }

      let matchesArea = true;
      if (area.min !== "" || area.max !== "") {
        const areaVal = parseFloat(item.buildingArea) || 0;
        let compareArea = areaVal;
        if (area.unit === "2") {
          compareArea = areaVal * 0.3025;
        }
        const min = parseFloat(area.min);
        const max = parseFloat(area.max);
        if (!isNaN(min) && compareArea < min) matchesArea = false;
        if (!isNaN(max) && compareArea > max) matchesArea = false;
      }

      let matchesAge = true;
      if (age.min !== "" || age.max !== "") {
        if (!item.completionDate) {
          matchesAge = false;
        } else {
          const compY = parseInt(item.completionDate.substring(0, item.completionDate.length - 4));
          const currentY = new Date().getFullYear() - 1911;
          const itemAge = currentY - compY;
          const min = parseFloat(age.min);
          const max = parseFloat(age.max);
          if (!isNaN(min) && itemAge < min) matchesAge = false;
          if (!isNaN(max) && itemAge > max) matchesAge = false;
        }
      }

      let matchesRooms = true;
      if (roomsMin !== "") {
        const minRooms = parseInt(roomsMin, 10);
        const itemRooms = parseInt(item.rooms || "0", 10);
        if (!Number.isNaN(minRooms) && (Number.isNaN(itemRooms) || itemRooms < minRooms)) {
          matchesRooms = false;
        }
      }

      let matchesManagement = true;
      if (hasManagement === "yes") {
        const v = (item.hasManagement || "").trim();
        matchesManagement = v === "有" || v.toLowerCase() === "y" || v === "是";
      } else if (hasManagement === "no") {
        const v = (item.hasManagement || "").trim();
        matchesManagement = v === "無" || v.toLowerCase() === "n" || v === "否" || v === "";
      }

      let matchesParking = true;
      if (parkingFilter === "with") {
        const hasPark =
          Boolean(item.parkingType && item.parkingType.trim()) ||
          parseFloat(item.parkingPrice || "0") > 0 ||
          item.transactionType.includes("車位");
        matchesParking = hasPark;
      } else if (parkingFilter === "without") {
        const hasPark =
          Boolean(item.parkingType && item.parkingType.trim()) ||
          parseFloat(item.parkingPrice || "0") > 0 ||
          item.transactionType.includes("車位");
        matchesParking = !hasPark;
      }

      let matchesFocus = true;
      if (focusBuildCase) {
        matchesFocus = Boolean(item.buildCase && item.buildCase === focusBuildCase);
      }

      let matchesSpecial = true;
      if (excludeSpecial && isSpecialRelationTransaction(item.remarks)) {
        matchesSpecial = false;
      }

      let matchesBudget = true;
      if (totalPriceMaxWan !== "") {
        const maxWan = parseFloat(totalPriceMaxWan);
        const itemWan = (parseFloat(item.totalPrice) || 0) / 10000;
        if (!Number.isNaN(maxWan) && itemWan > maxWan) matchesBudget = false;
      }

      return (
        matchesSearch &&
        matchesDistrict &&
        matchesPropertyType &&
        matchesPeriod &&
        matchesUnitPrice &&
        matchesArea &&
        matchesAge &&
        matchesRooms &&
        matchesManagement &&
        matchesParking &&
        matchesFocus &&
        matchesSpecial &&
        matchesBudget
      );
    });

    if (nearbyKm != null && nearbyKm > 0) {
      const originLat = nearbyAnchor?.lat ?? userLocation.latitude;
      const originLng = nearbyAnchor?.lng ?? userLocation.longitude;
      if (originLat != null && originLng != null) {
        result = result.filter((item) => {
          const lat = typeof item.lat === "string" ? parseFloat(item.lat) : item.lat;
          const lng = typeof item.lng === "string" ? parseFloat(item.lng) : item.lng;
          if (!lat || !lng || lat === 0) return false;
          return calculateDistance(originLat, originLng, lat, lng) <= nearbyKm;
        });
      }
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Transaction];
        const bValue = b[sortConfig.key as keyof Transaction];

        if (["totalPrice", "unitPrice", "buildingArea", "area"].includes(sortConfig.key)) {
          const aNum = parseFloat(aValue as string) || 0;
          const bNum = parseFloat(bValue as string) || 0;
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        if (sortConfig.key === "address" && nearbyKm != null) {
          const originLat = nearbyAnchor?.lat ?? userLocation.latitude;
          const originLng = nearbyAnchor?.lng ?? userLocation.longitude;
          if (originLat != null && originLng != null) {
            const distOf = (item: Transaction) => {
              const lat = typeof item.lat === "string" ? parseFloat(item.lat) : item.lat;
              const lng = typeof item.lng === "string" ? parseFloat(item.lng) : item.lng;
              if (!lat || !lng) return Infinity;
              return calculateDistance(originLat, originLng, lat, lng);
            };
            const da = distOf(a);
            const db = distOf(b);
            return sortConfig.direction === "asc" ? da - db : db - da;
          }
        }

        if ((aValue as any) < (bValue as any)) return sortConfig.direction === "asc" ? -1 : 1;
        if ((aValue as any) > (bValue as any)) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    } else if (nearbyKm != null) {
      const originLat = nearbyAnchor?.lat ?? userLocation.latitude;
      const originLng = nearbyAnchor?.lng ?? userLocation.longitude;
      if (originLat != null && originLng != null) {
        result.sort((a, b) => {
          const latA = typeof a.lat === "string" ? parseFloat(a.lat) : a.lat;
          const lngA = typeof a.lng === "string" ? parseFloat(a.lng) : a.lng;
          const latB = typeof b.lat === "string" ? parseFloat(b.lat) : b.lat;
          const lngB = typeof b.lng === "string" ? parseFloat(b.lng) : b.lng;
          const da =
            latA && lngA ? calculateDistance(originLat, originLng, latA, lngA) : Infinity;
          const db =
            latB && lngB ? calculateDistance(originLat, originLng, latB, lngB) : Infinity;
          return da - db;
        });
      }
    }

    return result;
  }, [
    data,
    search,
    sortConfig,
    district,
    propertyTypes,
    period,
    unitPrice,
    area,
    age,
    roomsMin,
    hasManagement,
    parkingFilter,
    focusBuildCase,
    excludeSpecial,
    totalPriceMaxWan,
    nearbyKm,
    nearbyAnchor,
    userLocation.latitude,
    userLocation.longitude,
  ]);
}
