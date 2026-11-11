/**
 * 依交易型態決定價格單位。
 *
 * 內政部資料的「總價元」「單價元平方公尺」在買賣／預售屋是成交價，
 * 在租賃是「月租金」與「每平方公尺月租」。買賣習慣看「萬」「萬/坪」，
 * 租金只有幾千到幾萬元，同樣換成萬會變成 0.2 萬/坪，所以租賃改用「元/月」「元/坪」。
 */
import type { Transaction } from "../types/real-estate";

const SQM_PER_PING = 3.30578;

export const isRentType = (typeName: string | undefined | null) => typeName === "租賃";

/** 租賃資料中真正的住宅租賃（排除單獨出租的車位、土地），行情統計只看這些 */
export const isRentHousing = (item: Transaction) => item.transactionType.includes("房屋");

/** 單價（元/㎡）→ 每坪的顯示數值：買賣為萬元/坪，租賃為元/坪 */
export function unitPerPing(unitPerSqm: number, typeName: string): number {
  const perPing = unitPerSqm * SQM_PER_PING;
  return isRentType(typeName) ? perPing : perPing / 10000;
}

export const unitPerPingLabel = (typeName: string) => (isRentType(typeName) ? "元/坪" : "萬/坪");

/** 依單位決定小數位：萬/坪一位小數，元/坪取整數加千分位 */
export function formatUnitValue(value: number, typeName: string): string {
  return isRentType(typeName) ? Math.round(value).toLocaleString() : value.toFixed(1);
}

/** 原始單價（元/㎡ 字串）→「35.4 萬/坪」或「1,623 元/坪」；無資料回傳 "-" */
export function formatUnitPerPing(raw: string | number | undefined, typeName: string): string {
  const v = typeof raw === "number" ? raw : parseFloat(raw || "");
  if (!Number.isFinite(v) || v <= 0) return "-";
  return `${formatUnitValue(unitPerPing(v, typeName), typeName)} ${unitPerPingLabel(typeName)}`;
}

/** 總價（元）→ 顯示數值：買賣為萬元，租賃為元（月租） */
export const totalValue = (yuan: number, typeName: string) =>
  isRentType(typeName) ? yuan : yuan / 10000;

export const totalLabel = (typeName: string) => (isRentType(typeName) ? "元/月" : "萬");

/** 總價（元）→「1,782 萬」或「22,000 元/月」 */
export function formatTotal(raw: string | number | undefined, typeName: string): string {
  const v = typeof raw === "number" ? raw : parseFloat(raw || "");
  if (!Number.isFinite(v)) return String(raw ?? "");
  if (isRentType(typeName)) return `${Math.round(v).toLocaleString()} 元/月`;
  if (v >= 10000) {
    const wan = v / 10000;
    return `${wan % 1 === 0 ? wan : parseFloat(wan.toFixed(2))} 萬`;
  }
  return `${v} 元`;
}

/** 租賃不套用標的種類篩選（空陣列 = 不限）；其他型態照使用者的選擇 */
export const rentPropertyTypes = (typeName: string, propertyTypes: string[]): string[] =>
  isRentType(typeName) ? [] : propertyTypes;

/**
 * 單筆資料的交易型態。收藏、比較清單可能混有租賃與買賣，價格單位要跟著每筆資料走；
 * 舊資料沒有 typeName 時，以交易標的「租賃…」判斷，否則用呼叫端給的預設。
 */
export const itemTypeName = (item: Transaction, fallback = "買賣"): string =>
  item.typeName || (item.transactionType.startsWith("租賃") ? "租賃" : fallback);
