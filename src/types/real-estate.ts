export interface Transaction {
  district: string;
  transactionType: string;
  address: string;
  area: string;
  zoning: string;
  date: string;
  content: string;
  floor: string;
  totalFloor: string;
  buildingType: string;
  mainUse: string;
  material: string;
  completionDate: string;
  buildingArea: string;
  rooms: string;
  halls: string;
  bathrooms: string;
  hasPartition: string;
  hasManagement: string;
  totalPrice: string;
  unitPrice: string;
  parkingType: string;
  parkingArea: string;
  parkingPrice: string;
  remarks: string;
  id: string;
  buildCase?: string;
  /** 資料來源的交易型態（買賣／預售屋／租賃），決定價格單位；舊的收藏、比較資料可能沒有 */
  typeName?: string;
  lat?: number | string;
  lng?: number | string;
}

export interface HistoryCounts {
  buildCaseMap: Record<string, number>;
  addressMap: Record<string, number>;
}
