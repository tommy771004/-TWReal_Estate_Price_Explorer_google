/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Papa from "papaparse";
import { 
  Search, 
  MapPin, 
  Building2, 
  Filter, 
  ArrowUpDown, 
  Info, 
  X,
  ChevronRight,
  Home,
  DollarSign,
  Maximize2,
  Calendar,
  Database,
  SlidersHorizontal
} from "lucide-react";
import { CITIES, TRANSACTION_TYPES, CITY_DISTRICTS } from "./constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  district: string; // 鄉鎮市區
  transactionType: string; // 交易標的
  address: string; // 土地位置建物門牌
  area: string; // 土地移轉總面積平方公尺
  zoning: string; // 都市土地使用分區
  date: string; // 交易年月日
  content: string; // 交易筆棟數
  floor: string; // 移轉層次
  totalFloor: string; // 總樓層數
  buildingType: string; // 建物型態
  mainUse: string; // 主要用途
  material: string; // 主要建材
  completionDate: string; // 建築完成年月
  buildingArea: string; // 建物移轉總面積平方公尺
  rooms: string; // 建物現況格局-房
  halls: string; // 建物現況格局-廳
  bathrooms: string; // 建物現況格局-衛
  hasPartition: string; // 建物現況格局-隔間
  hasManagement: string; // 有無管理組織
  totalPrice: string; // 總價元
  unitPrice: string; // 單價元/平方公尺
  parkingType: string; // 車位類別
  parkingArea: string; // 車位移轉總面積平方公尺
  parkingPrice: string; // 車位總價元
  remarks: string; // 備註
  id: string; // 編號
}

export default function App() {
  const [cityName, setCityName] = useState("臺北市");
  const [typeName, setTypeName] = useState("買賣");
  const [district, setDistrict] = useState("全部");
  const [search, setSearch] = useState("");
  
  const [propertyTypes, setPropertyTypes] = useState<string[]>(["土地"]);
  const [period, setPeriod] = useState({ startY: "101", startM: "1", endY: "115", endM: "12" });
  const [unitPrice, setUnitPrice] = useState({ min: "", max: "", unit: "1" }); // 1:萬元/坪, 2:元/㎡
  const [area, setArea] = useState({ min: "", max: "", unit: "2" }); // 1:㎡, 2:坪
  const [age, setAge] = useState({ min: "", max: "" });
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [robotStatus, setRobotStatus] = useState("");
  const [selectedItem, setSelectedItem] = useState<Transaction | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: "asc" | "desc" } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = React.useRef(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const robotTimeoutsRef = React.useRef<NodeJS.Timeout[]>([]);

  const YEARS = Array.from({ length: 15 }, (_, i) => (101 + i).toString());
  const MONTHS = Array.from({ length: 12 }, (_, i) => (1 + i).toString());

  const [dataSource, setDataSource] = useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    setDataSource(null);
    setRobotStatus("準備擷取開放資料...");

    robotTimeoutsRef.current.forEach(clearTimeout);
    robotTimeoutsRef.current = [];
    setRobotStatus("正在連線內政部開放資料...");
    robotTimeoutsRef.current.push(setTimeout(() => setRobotStatus("正在下載與處理資料..."), 1500));
    robotTimeoutsRef.current.push(setTimeout(() => setRobotStatus("資料量大，需要幾秒鐘進行解析..."), 4000));

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const cityCode = CITIES.find(c => c.name === cityName)?.code || "A";
      const typeCode = TRANSACTION_TYPES.find(t => t.name === typeName)?.code || "A";
      
      const response = await fetch(`/api/proxy-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          cityCode,
          district,
          propertyTypes,
          transactionType: typeCode,
          period,
          unitPrice,
          area,
          age,
          keyword: search
        })
      });

      if (!response.ok) {
        let errorMsg = "無法從官方來源取得資料";
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
          } catch (e) {
            errorMsg = `伺服器錯誤 (${response.status})`;
          }
        } else {
          errorMsg = `伺服器連線異常 (${response.status})，請檢查網路或稍後再試。`;
        }
        throw new Error(errorMsg);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textBody = await response.text().catch(() => "could not read body");
        console.error("Non-JSON response text:", textBody.substring(0, 500));
        throw new Error("伺服器傳回非預期的資料格式，請稍後再試。");
      }

      const result = await response.json();
      setDataSource(result.source);
      
      // If we got CSV data back (either intercepted or mock fallback)
      if (result.isCsv || (result.rawData && result.rawData.includes('鄉鎮市區'))) {
        Papa.parse(result.rawData, {
          header: false,
          complete: (parsed) => {
            const rows = parsed.data as string[][];
            if (rows.length < 3) {
              setData([]);
              setLoading(false);
              return;
            }

            const mappedData: Transaction[] = rows.slice(2).filter(row => row.length > 1).map((row, index) => ({
              district: row[0],
              transactionType: row[1],
              address: row[2],
              area: row[3],
              zoning: row[4],
              date: row[7],
              content: row[8],
              floor: row[9],
              totalFloor: row[10],
              buildingType: row[11],
              mainUse: row[12],
              material: row[13],
              completionDate: row[14],
              buildingArea: row[15],
              rooms: row[16],
              halls: row[17],
              bathrooms: row[18],
              hasPartition: row[19],
              hasManagement: row[20],
              totalPrice: row[21],
              unitPrice: row[22],
              parkingType: row[23],
              parkingArea: row[24],
              parkingPrice: row[25],
              remarks: row[26],
              id: row[27] || `item-${index}`,
            }));
            
            setData(mappedData);
            setLoading(false);
          },
        });
      } else if (result.data && Array.isArray(result.data)) {
        // DOM-extracted rows
        const tableId: string = result.tableId || 'bizList_table';

        const mapXlsRow = (row: any[], index: number): Transaction => ({
          district: row[0] || "",
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
          totalPrice: row[21] || "",
          unitPrice: row[22] || "",
          parkingType: row[23] || "",
          parkingArea: row[24] || "",
          parkingPrice: row[25] || "",
          remarks: row[26] || "",
          id: String(row[27] || `item-${index}`),
        });

        const mappedData: Transaction[] = result.data.map(mapXlsRow);
        setData(mappedData);
        setLoading(false);
      } else {
        setData([]);
        setLoading(false);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was intentionally cancelled (e.g. React StrictMode remount) — ignore silently
        return;
      }
      console.error("Fetch error details:", error);
      setError(error.message || "發生網路錯誤，請稍後再試。");
    } finally {
      robotTimeoutsRef.current.forEach(clearTimeout);
      setRobotStatus("");
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [cityName, typeName, district, propertyTypes, period, unitPrice, area, age, search]);


  useEffect(() => {
    // Cleanup only: abort any in-flight request when component unmounts.
    // fetchData is NOT called here — query only starts when the user clicks the button.
    return () => {
      abortControllerRef.current?.abort();
      isFetchingRef.current = false;
    };
  }, []); // Only on mount

  const uniqueDistricts = useMemo(() => {
    return ["全部", ...(CITY_DISTRICTS[cityName] || []).map(d => d.name)];
  }, [cityName]);

  const filteredData = useMemo(() => {
    let result = data.filter((item) => {
      // Basic Search
      const matchesSearch = search === "" || item.address.includes(search) || item.district.includes(search) || item.buildingType.includes(search);
      
      // District Filter
      const matchesDistrict = district === "全部" || item.district === district;

      // Property Type Filter
      const matchesPropertyType = propertyTypes.length === 0 || propertyTypes.some(pt => {
        if (pt === "房地") return item.transactionType === "房地(土地+建物)";
        if (pt === "房地(車)") return item.transactionType === "房地(土地+建物)+車位";
        return item.transactionType === pt;
      });

      // Period Filter
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

      // Unit Price Filter
      let matchesUnitPrice = true;
      if (unitPrice.min !== "" || unitPrice.max !== "") {
        const priceVal = parseFloat(item.unitPrice) || 0;
        let comparePrice = priceVal;
        if (unitPrice.unit === "1") { // 萬元/坪
          comparePrice = (priceVal * 3.30578) / 10000;
        }
        const min = parseFloat(unitPrice.min);
        const max = parseFloat(unitPrice.max);
        if (!isNaN(min) && comparePrice < min) matchesUnitPrice = false;
        if (!isNaN(max) && comparePrice > max) matchesUnitPrice = false;
      }

      // Area Filter
      let matchesArea = true;
      if (area.min !== "" || area.max !== "") {
        const areaVal = parseFloat(item.area) || 0;
        let compareArea = areaVal;
        if (area.unit === "2") { // 坪
          compareArea = areaVal * 0.3025;
        }
        const min = parseFloat(area.min);
        const max = parseFloat(area.max);
        if (!isNaN(min) && compareArea < min) matchesArea = false;
        if (!isNaN(max) && compareArea > max) matchesArea = false;
      }

      // Age Filter
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

      return matchesSearch && matchesDistrict && matchesPropertyType && matchesPeriod && matchesUnitPrice && matchesArea && matchesAge;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle numeric sorting for price and area
        if (["totalPrice", "unitPrice", "buildingArea", "area"].includes(sortConfig.key)) {
          const aNum = parseFloat(aValue as string) || 0;
          const bNum = parseFloat(bValue as string) || 0;
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, sortConfig, district, propertyTypes, period, unitPrice, area, age]);

  const handleSort = (key: keyof Transaction) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const formatPrice = (price: string) => {
    const p = parseFloat(price);
    if (isNaN(p)) return price;
    if (p >= 10000) {
      return `${(p / 10000).toFixed(2)} 萬`;
    }
    return `${p} 元`;
  };

  const formatDate = (dateStr: string) => {
    if (dateStr.length === 7) {
      const year = parseInt(dateStr.substring(0, 3)) + 1911;
      const month = dateStr.substring(3, 5);
      const day = dateStr.substring(5, 7);
      return `${year}/${month}/${day}`;
    }
    return dateStr;
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col font-sans selection:bg-primary/20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Dynamic Liquid Background for Glass Refraction */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-teal-300/40 dark:bg-teal-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-60 animate-float-blob pointer-events-none" />
      <div className="fixed top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-cyan-300/40 dark:bg-cyan-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-60 animate-float-blob animation-delay-2000 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-sky-300/40 dark:bg-sky-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-60 animate-float-blob animation-delay-4000 pointer-events-none" />
      
      {/* Main Container - Liquid Glass */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full flex-1 flex flex-col z-10"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/20 dark:border-white/10 liquid-glass flex flex-col gap-6 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] bg-gradient-to-br from-teal-500/80 to-teal-400/40 dark:from-teal-600/80 dark:to-teal-500/20 border border-teal-200 dark:border-teal-700/50 shadow-lg backdrop-blur-md flex items-center justify-center">
                <Database className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">實價登錄開放資料查詢</h1>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wider">即時存取內政部開放資料</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center px-3 py-1.5 bg-teal-100/50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-full uppercase tracking-wider border border-teal-200 dark:border-teal-800">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse mr-2"></div>
                Robot Mode Active
              </div>
              <Button 
                variant="ghost"
                onClick={fetchData} 
                disabled={loading}
                className="rounded-[1rem] liquid-glass-button h-10 px-5 text-sm"
              >
                {loading ? "更新中..." : "重新整理"}
              </Button>
            </div>
          </div>

          {/* Filters Grid */}
          <div className="flex flex-col gap-4 liquid-glass-panel p-5 rounded-[1.5rem]">
            
            {/* Row 1: Location & Search */}
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3 items-end">
              <div className="space-y-1.5 col-span-1 sm:w-32">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest ml-1 drop-shadow-sm">縣市</label>
                <select className="w-full liquid-glass-input h-10 px-2 sm:px-3 rounded-[0.85rem] outline-none text-sm font-medium" value={cityName} onChange={e => { setCityName(e.target.value); setDistrict("全部"); }}>
                  {CITIES.map(c => <option key={c.name} value={c.name} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 col-span-1 sm:w-32">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest ml-1 drop-shadow-sm">鄉鎮市</label>
                <select className="w-full liquid-glass-input h-10 px-2 sm:px-3 rounded-[0.85rem] outline-none text-sm font-medium" value={district} onChange={e => setDistrict(e.target.value)}>
                  {uniqueDistricts.map(d => <option key={d} value={d} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 col-span-1 sm:w-32">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest ml-1 drop-shadow-sm">類型</label>
                <select className="w-full liquid-glass-input h-10 px-2 sm:px-3 rounded-[0.85rem] outline-none text-xs sm:text-sm font-medium" value={typeName} onChange={e => setTypeName(e.target.value)}>
                  {TRANSACTION_TYPES.map(t => <option key={t.name} value={t.name} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{t.name.replace("租賃", "租")}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 col-span-3 sm:flex-1 sm:min-w-[200px]">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest ml-1 drop-shadow-sm">門牌 / 社區名稱 / 地段</label>
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  <input 
                    type="text"
                    placeholder="請輸入關鍵字..." 
                    className="w-full pl-10 liquid-glass-input h-10 rounded-[0.85rem] outline-none text-sm font-medium placeholder:text-slate-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Property Types */}
            <div className="flex flex-wrap gap-4 items-center py-3 border-y border-white/20 dark:border-white/10">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest drop-shadow-sm">標的種類</span>
              {["房地", "房地(車)", "建物", "車位", "土地"].map(pt => (
                <label key={pt} className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="accent-teal-500 w-4 h-4 rounded border-white/40 shadow-sm" 
                    checked={propertyTypes.includes(pt)}
                    onChange={(e) => {
                      if (e.target.checked) setPropertyTypes([...propertyTypes, pt]);
                      else setPropertyTypes(propertyTypes.filter(p => p !== pt));
                    }}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{pt}</span>
                </label>
              ))}
            </div>

            {/* Row 3: Advanced Filters */}
            <AnimatePresence>
              {isAdvancedSearchOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-2">
                    {/* Period */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest ml-1 drop-shadow-sm">交易期間</label>
                      <div className="flex items-center gap-1 liquid-glass-input rounded-[0.85rem] p-1 flex-wrap sm:flex-nowrap">
                        <select className="bg-transparent border-none outline-none text-sm font-medium cursor-pointer flex-1 min-w-[50px] text-center" value={period.startY} onChange={e => setPeriod({...period, startY: e.target.value})}>
                          {YEARS.map(y => <option key={y} value={y} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{y}</option>)}
                        </select>
                        <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">年</span>
                        <select className="bg-transparent border-none outline-none text-sm font-medium cursor-pointer flex-1 min-w-[40px] text-center" value={period.startM} onChange={e => setPeriod({...period, startM: e.target.value})}>
                          {MONTHS.map(m => <option key={m} value={m} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{m}</option>)}
                        </select>
                        <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">月</span>
                        <span className="text-slate-300 dark:text-slate-600 mx-1">-</span>
                        <select className="bg-transparent border-none outline-none text-sm font-medium cursor-pointer flex-1 min-w-[50px] text-center" value={period.endY} onChange={e => setPeriod({...period, endY: e.target.value})}>
                          {YEARS.map(y => <option key={y} value={y} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{y}</option>)}
                        </select>
                        <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">年</span>
                        <select className="bg-transparent border-none outline-none text-sm font-medium cursor-pointer flex-1 min-w-[40px] text-center" value={period.endM} onChange={e => setPeriod({...period, endM: e.target.value})}>
                          {MONTHS.map(m => <option key={m} value={m} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{m}</option>)}
                        </select>
                        <span className="text-slate-400 dark:text-slate-500 text-xs font-medium pr-1">月</span>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest ml-1 drop-shadow-sm">單價</label>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                          <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="up_unit" checked={unitPrice.unit==="1"} onChange={()=>setUnitPrice({...unitPrice, unit:"1"})} className="accent-teal-500"/> 萬元/坪</label>
                          <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="up_unit" checked={unitPrice.unit==="2"} onChange={()=>setUnitPrice({...unitPrice, unit:"2"})} className="accent-teal-500"/> 元/㎡</label>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input type="number" placeholder="最小值" className="w-full liquid-glass-input h-10 px-3 rounded-[0.85rem] outline-none text-sm font-medium" value={unitPrice.min} onChange={e=>setUnitPrice({...unitPrice, min: e.target.value})} />
                        <span className="text-slate-400/50">-</span>
                        <input type="number" placeholder="最大值" className="w-full liquid-glass-input h-10 px-3 rounded-[0.85rem] outline-none text-sm font-medium" value={unitPrice.max} onChange={e=>setUnitPrice({...unitPrice, max: e.target.value})} />
                      </div>
                    </div>

                    {/* Area */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest ml-1 drop-shadow-sm">面積</label>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                          <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="a_unit" checked={area.unit==="1"} onChange={()=>setArea({...area, unit:"1"})} className="accent-teal-500"/> ㎡</label>
                          <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="a_unit" checked={area.unit==="2"} onChange={()=>setArea({...area, unit:"2"})} className="accent-teal-500"/> 坪</label>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input type="number" placeholder="最小值" className="w-full liquid-glass-input h-10 px-3 rounded-[0.85rem] outline-none text-sm font-medium" value={area.min} onChange={e=>setArea({...area, min: e.target.value})} />
                        <span className="text-slate-400/50">-</span>
                        <input type="number" placeholder="最大值" className="w-full liquid-glass-input h-10 px-3 rounded-[0.85rem] outline-none text-sm font-medium" value={area.max} onChange={e=>setArea({...area, max: e.target.value})} />
                      </div>
                    </div>

                    {/* Age */}
                    <div className="space-y-1.5 flex flex-col justify-end">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest ml-1 drop-shadow-sm">屋齡 (年)</label>
                      <div className="flex items-center gap-1.5">
                        <input type="number" placeholder="最小值" className="w-full liquid-glass-input h-10 px-3 rounded-[0.85rem] outline-none text-sm font-medium" value={age.min} onChange={e=>setAge({...age, min: e.target.value})} />
                        <span className="text-slate-400/50">-</span>
                        <input type="number" placeholder="最大值" className="w-full liquid-glass-input h-10 px-3 rounded-[0.85rem] outline-none text-sm font-medium" value={age.max} onChange={e=>setAge({...age, max: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Row 4: Search Button */}
            <div className="flex justify-between items-center mt-4">
              <Button 
                variant="ghost" 
                onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
                className={`text-sm font-bold ${isAdvancedSearchOpen ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'} hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-[1rem] h-10 transition-colors gap-2`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                進階搜尋
              </Button>

              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSearch("");
                    setDistrict("全部");
                    setPropertyTypes(["土地"]);
                    setPeriod({ startY: "101", startM: "1", endY: "115", endM: "12" });
                    setUnitPrice({ min: "", max: "", unit: "1" });
                    setArea({ min: "", max: "", unit: "2" });
                    setAge({ min: "", max: "" });
                  }}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-transparent hover:border-white/40 dark:hover:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 rounded-[1rem] h-10 font-medium transition-all"
                >
                  清除篩選
                </Button>
                <Button 
                  onClick={fetchData} 
                  disabled={loading}
                  className="liquid-glass-button-primary rounded-[1rem] px-8 h-10"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "資料擷取中..." : "開始查詢"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col liquid-glass rounded-t-none sm:rounded-t-[2rem] mx-0 sm:mx-6 border-b-0 shadow-none sm:shadow-lg mt-0 sm:-mt-4 relative z-20 pb-10">
          {loading ? (
            <div className="p-12 space-y-8 flex flex-col items-center justify-center min-h-[400px]">
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-500/20 p-6 rounded-2xl flex flex-col items-center justify-center animate-pulse shadow-sm max-w-sm w-full">
                <div className="bg-teal-500/10 dark:bg-teal-500/20 p-4 rounded-full mb-4">
                  <Database size={48} className="text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-teal-800 dark:text-teal-300 font-bold text-center text-lg">{robotStatus || "正在擷取開放資料..."}</span>
                <span className="text-teal-600/70 dark:text-teal-400/60 font-medium text-center text-sm mt-2">即時解析內政部實價登錄開放資料集</span>
              </div>
              
              <div className="w-full max-w-2xl space-y-4 opacity-50">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-12 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-[300px]">
              <Table className="min-w-[800px]">
                <TableHeader className="sticky top-0 bg-white/40 dark:bg-black/40 backdrop-blur-[24px] z-10 border-b border-white/20 dark:border-white/10">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">
                      <Button variant="ghost" className="hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 p-0 h-auto font-bold rounded-lg" onClick={() => handleSort("district")}>
                        地區 <ArrowUpDown className="ml-2 w-3 h-3 opacity-50" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">位置/社區</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">
                      <Button variant="ghost" className="hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 p-0 h-auto font-bold rounded-lg" onClick={() => handleSort("date")}>
                        交易日期 <ArrowUpDown className="ml-2 w-3 h-3 opacity-50" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">型態</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right">
                      <Button variant="ghost" className="hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 p-0 h-auto ml-auto font-bold rounded-lg" onClick={() => handleSort("totalPrice")}>
                        總價 <ArrowUpDown className="ml-2 w-3 h-3 opacity-50" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right">單價/坪</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredData.map((item) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={item.id} 
                        className="border-b border-white/20 dark:border-white/5 hover:bg-white/30 dark:hover:bg-white/5 cursor-pointer group transition-all"
                        onClick={() => setSelectedItem(item)}
                      >
                        <TableCell className="text-slate-900 dark:text-slate-100 font-bold">{item.district}</TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate text-slate-700 dark:text-slate-300 font-medium group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">{item.address}</div>
                          <div className="text-[10px] text-teal-600/70 dark:text-teal-300/70 font-semibold mt-0.5 tracking-wider">{item.transactionType}</div>
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400 font-medium">{formatDate(item.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white/50 dark:bg-black/20 text-slate-600 dark:text-slate-300 border-white/60 dark:border-white/10 font-medium shadow-sm">
                            {item.buildingType.split("(")[0] || "土地"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-slate-900 dark:text-slate-100 font-bold tracking-tight">
                          {formatPrice(item.totalPrice)}
                        </TableCell>
                        <TableCell className="text-right text-slate-500 dark:text-slate-400 font-mono text-sm font-medium">
                          {item.unitPrice ? `${(parseFloat(item.unitPrice) * 3.30578 / 10000).toFixed(1)} 萬` : "-"}
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-500 transition-colors group-hover:translate-x-1 duration-300" />
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
              {filteredData.length === 0 && !loading && !error && (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500/50 dark:text-slate-400/50">
                  <Info className="w-12 h-12 mb-4 opacity-50 drop-shadow-md" />
                  <p className="font-medium text-lg tracking-tight">未找到符合條件的資料</p>
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center justify-center py-24 text-red-500/80 dark:text-red-400/80">
                  <X className="w-12 h-12 mb-4 opacity-60 drop-shadow-md" />
                  <p className="text-base font-bold mb-2 tracking-tight">資料讀取失敗</p>
                  <p className="text-sm opacity-80 max-w-md text-center font-medium leading-relaxed">{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-6 liquid-glass-button border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                    onClick={fetchData}
                  >
                    重新嘗試
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="fixed bottom-0 left-0 right-0 p-3 border-t border-white/20 dark:border-white/10 shrink-0 bg-white/40 dark:bg-black/40 backdrop-blur-xl flex items-center justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 z-50">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-medium">資料來源：內政部實價登錄</span>
            <span className="font-medium">更新頻率：每 10 日</span>
            {dataSource && (
              <Badge variant="outline" className="text-[10px] text-teal-600 dark:text-teal-300 border-teal-200 dark:border-teal-800 bg-white/50 dark:bg-black/50 shadow-sm font-bold">
                官方即時資料
              </Badge>
            )}
            <span className="text-slate-800 dark:text-slate-200 font-bold">當前顯示：{filteredData.length} 筆</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
            </div>
            <span className="hidden sm:inline">系統連線正常</span>
          </div>
        </div>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-[48px] shadow-[0_16px_64px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_64px_rgba(0,0,0,0.4)] text-slate-900 dark:text-slate-100 max-w-2xl rounded-[2rem] overflow-hidden p-0 sm:max-w-2xl">
          {selectedItem && (
            <div className="flex flex-col">
              <div className="p-6 sm:p-8 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-transparent border-b border-white/30 dark:border-white/10">
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 border-teal-500/20 shadow-sm font-bold tracking-wider">
                      {selectedItem.district}
                    </Badge>
                    <Badge variant="outline" className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 font-medium drop-shadow-sm">
                      {selectedItem.transactionType}
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight drop-shadow-sm">
                    {selectedItem.address}
                  </DialogTitle>
                </DialogHeader>
              </div>

              <div className="max-h-[60vh] overflow-y-auto touch-pan-y custom-scrollbar">
                <div className="p-6 sm:p-8 space-y-8">
                  {/* Key Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="liquid-glass border-white/80 dark:border-white/10 p-4 rounded-[1.25rem] flex flex-col gap-1.5 shadow-sm transform transition-all hover:scale-105">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider drop-shadow-sm">
                        <DollarSign className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> 總價
                      </div>
                      <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{formatPrice(selectedItem.totalPrice)}</div>
                    </div>
                    <div className="liquid-glass border-white/80 dark:border-white/10 p-4 rounded-[1.25rem] flex flex-col gap-1.5 shadow-sm transform transition-all hover:scale-105">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider drop-shadow-sm">
                        <Maximize2 className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> 面積
                      </div>
                      <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{selectedItem.buildingArea || selectedItem.area} ㎡</div>
                      <div className="text-[10px] text-teal-600/70 dark:text-teal-300/70 font-semibold mt-auto tracking-wide">約 {(parseFloat(selectedItem.buildingArea || selectedItem.area) * 0.3025).toFixed(2)} 坪</div>
                    </div>
                    <div className="liquid-glass border-white/80 dark:border-white/10 p-4 rounded-[1.25rem] flex flex-col gap-1.5 shadow-sm transform transition-all hover:scale-105">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider drop-shadow-sm">
                        <Home className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> 型態
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedItem.buildingType.split("(")[0] || "土地"}</div>
                    </div>
                    <div className="liquid-glass border-white/80 dark:border-white/10 p-4 rounded-[1.25rem] flex flex-col gap-1.5 shadow-sm transform transition-all hover:scale-105">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider drop-shadow-sm">
                        <Calendar className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> 交易日
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(selectedItem.date)}</div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-6">
                    <div className="space-y-3 relative">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm">土地資訊</h3>
                      <div className="liquid-glass rounded-[1.5rem] overflow-hidden divide-y divide-white/20 dark:divide-white/10 border-white/80 dark:border-white/10">
                        <DetailRow label="土地使用分區" value={selectedItem.zoning || "-"} />
                        <DetailRow label="土地移轉面積" value={selectedItem.area ? `${selectedItem.area} ㎡ (約 ${(parseFloat(selectedItem.area) * 0.3025).toFixed(2)} 坪)` : "-"} />
                      </div>
                    </div>

                    {(selectedItem.buildingType || selectedItem.mainUse) ? (
                      <div className="space-y-3 relative">
                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm">建物資訊</h3>
                        <div className="liquid-glass rounded-[1.5rem] overflow-hidden divide-y divide-white/20 dark:divide-white/10 border-white/80 dark:border-white/10">
                          <DetailRow label="建物型態" value={selectedItem.buildingType || "無"} />
                          <DetailRow label="移轉層次" value={selectedItem.floor ? `${selectedItem.floor} / ${selectedItem.totalFloor}` : "-"} />
                          <DetailRow label="主要用途" value={selectedItem.mainUse || "-"} />
                          <DetailRow label="主要建材" value={selectedItem.material || "-"} />
                          <DetailRow label="建築完成日" value={formatDate(selectedItem.completionDate)} />
                          <DetailRow label="現況格局" value={selectedItem.rooms ? `${selectedItem.rooms} 房 / ${selectedItem.halls} 廳 / ${selectedItem.bathrooms} 衛` : "-"} />
                          <DetailRow label="管理組織" value={selectedItem.hasManagement || "-"} />
                        </div>
                      </div>
                    ) : null}

                    {selectedItem.parkingType ? (
                      <div className="space-y-3 relative">
                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm">車位資訊</h3>
                        <div className="liquid-glass rounded-[1.5rem] overflow-hidden divide-y divide-white/20 dark:divide-white/10 border-white/80 dark:border-white/10">
                          <DetailRow label="車位類別" value={selectedItem.parkingType} />
                          <DetailRow label="車位總價" value={formatPrice(selectedItem.parkingPrice)} />
                          <DetailRow label="車位移轉面積" value={selectedItem.parkingArea ? `${selectedItem.parkingArea} ㎡ (約 ${(parseFloat(selectedItem.parkingArea) * 0.3025).toFixed(2)} 坪)` : "-"} />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Remarks */}
                  {selectedItem.remarks && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm">備註</h3>
                      <div className="liquid-glass-input p-5 rounded-[1.5rem] text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-none prose prose-sm shadow-inner italic">
                         "{selectedItem.remarks}"
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-white/30 dark:border-white/10 bg-white/20 dark:bg-black/20 flex justify-end">
                <Button 
                  onClick={() => setSelectedItem(null)}
                  variant="outline"
                  className="rounded-[1rem] px-8 liquid-glass-button"
                >
                  關閉
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4 text-sm hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
      <span className="text-slate-600 dark:text-slate-400 font-bold">{label}</span>
      <span className="text-slate-900 dark:text-slate-100 font-bold tracking-tight">{value || "-"}</span>
    </div>
  );
}
