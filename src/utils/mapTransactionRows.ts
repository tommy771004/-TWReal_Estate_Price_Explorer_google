import { CITIES, CITY_DISTRICTS } from "../constants";
import type { Transaction } from "../types/real-estate";

const jitter = (scale = 0.005) => (Math.random() - 0.5) * scale;

function coordsForDistrict(cityName: string, districtName: string) {
  const cityDistricts = CITY_DISTRICTS[cityName] || [];
  const distInfo = cityDistricts.find(
    (d) => districtName.includes(d.name) || d.name.includes(districtName)
  );
  const cityInfo = CITIES.find((c) => c.name === cityName);
  return {
    lat: distInfo?.lat
      ? distInfo.lat + jitter(0.008)
      : cityInfo?.lat
        ? cityInfo.lat + jitter(0.03)
        : undefined,
    lng: distInfo?.lng
      ? distInfo.lng + jitter(0.008)
      : cityInfo?.lng
        ? cityInfo.lng + jitter(0.03)
        : undefined,
  };
}

/** 將 CSV／XLS 列對應為 Transaction（買賣／租賃欄位位移不同）。 */
export function mapTransactionRow(
  row: any[],
  index: number,
  cityName: string,
  typeName: string
): Transaction {
  const districtName = row[0] || "";
  const isRent = typeName === "租賃";
  const isPreSale = typeName === "預售屋";
  const { lat, lng } = coordsForDistrict(cityName, districtName);

  return {
    district: districtName,
    transactionType: row[1] || "",
    address: row[2] || "",
    area: row[3] || "",
    zoning: row[4] || row[5] || "",
    date: row[7] || "",
    content: row[8] || "",
    floor: row[9] || "",
    totalFloor: row[10] || "",
    buildingType: row[11] || "",
    mainUse: row[12] || "",
    material: row[13] || "",
    completionDate: row[14] || "",
    buildingArea: row[15] || "",
    rooms: row[16] || "",
    halls: row[17] || "",
    bathrooms: row[18] || "",
    hasPartition: row[19] || "",
    hasManagement: row[20] || "",
    totalPrice: isRent ? row[22] || "" : row[21] || "",
    unitPrice: isRent ? row[23] || "" : row[22] || "",
    parkingType: isRent ? row[24] || "" : row[23] || "",
    parkingArea: isRent ? row[25] || "" : row[24] || "",
    parkingPrice: isRent ? row[26] || "" : row[25] || "",
    remarks: isRent ? row[27] || "" : row[26] || "",
    id: String(isRent ? row[28] || `item-${index}` : row[27] || `item-${index}`),
    buildCase: isPreSale ? row[28] || undefined : undefined,
    lat,
    lng,
  };
}

export function mapCsvRows(
  rows: string[][],
  cityName: string,
  typeName: string
): Transaction[] {
  return rows
    .slice(2)
    .filter((row) => row.length > 1)
    .map((row, index) => mapTransactionRow(row, index, cityName, typeName));
}
