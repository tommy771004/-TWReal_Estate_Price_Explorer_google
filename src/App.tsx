/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  SlidersHorizontal,
  Sparkles,
  Compass,
  Zap,
  Gem,
  Waves,
  Map as MapIcon,
  List,
  Bookmark,
  Trash2,
  Save,
  Clock,
  Layers,
  ArrowRightCircle,
  RotateCw
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
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Skeleton } from "@/components/ui/skeleton";

// Red marker icon generator
const getRedIcon = (label: string) => new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div class="relative group">
           <div class="w-2.5 h-2.5 bg-red-600 rounded-full border border-white shadow-[0_0_8px_rgba(220,38,38,0.4)] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-transform duration-300">
             <div class="w-1 h-1 bg-white rounded-full"></div>
           </div>
           <div class="absolute left-2.5 top-[-10px] whitespace-nowrap bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg border border-white/20 pointer-events-none group-hover:scale-110 transition-transform">
             ${label}
           </div>
         </div>`,
  iconSize: [0, 0],
});

// Fix for default Leaflet icons
const customIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(239,68,68,0.5)] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform duration-300">
           <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
         </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

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
  lat?: number;
  lng?: number;
}

interface SavedSearch {
  id: string;
  name: string;
  cityName: string;
  typeName: string | null;
  district: string;
  search: string;
  propertyTypes: string[];
  period: { startY: string; startM: string; endY: string; endM: string };
  unitPrice: { min: string; max: string; unit: string };
  area: { min: string; max: string; unit: string };
  age: { min: string; max: string };
  timestamp: number;
}

// Map center and bounds tracking component
function MapBoundsManager({ items }: { items: Transaction[] }) {
  const map = useMap();
  const lastItemsLength = useRef<number>(0);
  const lastValidCount = useRef<number>(0);
  const hasFittedInitial = useRef<boolean>(false);
  
  useEffect(() => {
    const validItems = items.filter(item => {
      const lat = typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat;
      const lng = typeof item.lng === 'string' ? parseFloat(item.lng) : item.lng;
      return lat && lng && lat !== 0;
    });
    const validCount = validItems.length;

    if (validCount === 0) {
      hasFittedInitial.current = false;
      return;
    }

    if (
      items.length !== lastItemsLength.current || 
      validCount > lastValidCount.current ||
      !hasFittedInitial.current
    ) {
      try {
        const boundsCoords = validItems.map(item => {
          const lat = typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat!;
          const lng = typeof item.lng === 'string' ? parseFloat(item.lng) : item.lng!;
          return [lat, lng] as [number, number];
        });
        const bounds = L.latLngBounds(boundsCoords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
          map.invalidateSize(); // Force redraw after resize or layout shift
          lastItemsLength.current = items.length;
          lastValidCount.current = validCount;
          hasFittedInitial.current = true;
        }
      } catch (e) {
        console.warn("Could not calculate map bounds", e);
      }
    }
  }, [items, map]);

  return null;
}

// Single item center sync
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);
  return null;
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
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [geocodedCount, setGeocodedCount] = useState(0);
  const [totalToGeocode, setTotalToGeocode] = useState(0);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // Saved Searches State
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    try {
      const saved = localStorage.getItem('explorer_saved_searches');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isSavingSearch, setIsSavingSearch] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");

  const saveCurrentSearch = () => {
    if (!newSearchName.trim()) return;
    
    const newSavedSearch: SavedSearch = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSearchName,
      cityName,
      typeName,
      district,
      search,
      propertyTypes,
      period,
      unitPrice,
      area,
      age,
      timestamp: Date.now()
    };

    const updated = [newSavedSearch, ...savedSearches];
    setSavedSearches(updated);
    localStorage.setItem('explorer_saved_searches', JSON.stringify(updated));
    setNewSearchName("");
    setIsSavingSearch(false);
  };

  const deleteSavedSearch = (id: string | number) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('explorer_saved_searches', JSON.stringify(updated));
  };

  const applySavedSearch = (s: SavedSearch) => {
    setCityName(s.cityName);
    setTypeName(s.typeName || "買賣");
    setDistrict(s.district);
    setSearch(s.search);
    setPropertyTypes(s.propertyTypes);
    setPeriod(s.period);
    setUnitPrice(s.unitPrice);
    setArea(s.area);
    setAge(s.age);
  };

  // Location Cache to avoid redundant API calls
  const locationCache = useRef<Record<string, { lat: number, lng: number }>>({});

  // Initialize cache from localStorage
  useEffect(() => {
    try {
      const savedCache = localStorage.getItem('real_estate_loc_cache');
      if (savedCache) {
        locationCache.current = JSON.parse(savedCache);
      }
    } catch (e) {
      console.warn("Failed to load map cache", e);
    }
  }, []);

  // Save cache helper
  const saveCache = () => {
    try {
      localStorage.setItem('real_estate_loc_cache', JSON.stringify(locationCache.current));
    } catch (e) {}
  };
  
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
    setGeocodedCount(0);
    setIsGeocoding(false);
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

            const mappedData: Transaction[] = rows.slice(2).filter(row => row.length > 1).map((row, index) => {
              const districtName = row[0];
              // Background mapping: Try to find district coordinates for instant display
              const cityDistricts = CITY_DISTRICTS[cityName] || [];
              const distInfo = cityDistricts.find(d => districtName.includes(d.name) || d.name.includes(districtName));
              const cityInfo = CITIES.find(c => c.name === cityName);
              
              // Add a small random jitter (approx 100-200m) so markers don't overlap perfectly
              const jitter = () => (Math.random() - 0.5) * 0.005;
              const jitterLarge = () => (Math.random() - 0.5) * 0.02;

              return {
                district: districtName,
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
                lat: distInfo?.lat ? distInfo.lat + jitter() : (cityInfo?.lat ? cityInfo.lat + jitterLarge() : undefined),
                lng: distInfo?.lng ? distInfo.lng + jitter() : (cityInfo?.lng ? cityInfo.lng + jitterLarge() : undefined),
              };
            });
            
            setData(mappedData);
            setLoading(false);
          },
        });
      } else if (result.data && Array.isArray(result.data)) {
        // DOM-extracted rows
        const tableId: string = result.tableId || 'bizList_table';

        const mapXlsRow = (row: any[], index: number): Transaction => {
          const districtName = row[0] || "";
          const cityDistricts = CITY_DISTRICTS[cityName] || [];
          const distInfo = cityDistricts.find(d => districtName.includes(d.name) || d.name.includes(districtName));
          const cityInfo = CITIES.find(c => c.name === cityName);
          const jitter = () => (Math.random() - 0.5) * 0.008;
          const jitterLarge = () => (Math.random() - 0.5) * 0.03;

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
            totalPrice: row[21] || "",
            unitPrice: row[22] || "",
            parkingType: row[23] || "",
            parkingArea: row[24] || "",
            parkingPrice: row[25] || "",
            remarks: row[26] || "",
            id: String(row[27] || `item-${index}`),
            lat: distInfo?.lat ? distInfo.lat + jitter() : (cityInfo?.lat ? cityInfo.lat + jitterLarge() : undefined),
            lng: distInfo?.lng ? distInfo.lng + jitter() : (cityInfo?.lng ? cityInfo.lng + jitterLarge() : undefined),
          };
        };

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
  }, [data, search, sortConfig, district, propertyTypes, period, unitPrice, area, age, cityName]);

  // Geocoding logic using Nominatim (OpenStreetMap) with fallback & Cache
  useEffect(() => {
    if (!filteredData.length) {
      setGeocodedCount(0);
      setIsGeocoding(false);
      return;
    }

    // We'll geocode the first N items to provide precision
    const maxToGeocode = 40;
    const itemsToProcess = filteredData.slice(0, maxToGeocode);
    
    // Check if we already have precision for these items
    const needsGeocoding = itemsToProcess.filter(item => {
      const cleanedAddress = item.address.replace(/(\d+)\s*[~～-]\s*\d+[號號]?/g, '$1號');
      const cacheKey = `${cityName}${item.district}${cleanedAddress}`;
      return !locationCache.current[cacheKey];
    });

    if (needsGeocoding.length === 0) {
      setGeocodedCount(itemsToProcess.length);
      setTotalToGeocode(itemsToProcess.length);
      setIsGeocoding(false);
      return;
    }

    let active = true;

    const geocodeBatch = async () => {
      if (!active) return;
      setGeocodedCount(0);
      setTotalToGeocode(itemsToProcess.length);
      setIsGeocoding(true);
      
      // Update data with cache immediately
      let newlyFoundFromCache = false;
      const updatedFullData = [...data];
      
      itemsToProcess.forEach(item => {
        const cleanedAddress = item.address.replace(/(\d+)\s*[~～-]\s*\d+[號號]?/g, '$1號');
        const cacheKey = `${cityName}${item.district}${cleanedAddress}`;
        if (locationCache.current[cacheKey]) {
          const { lat, lng } = locationCache.current[cacheKey];
          const idx = updatedFullData.findIndex(p => p.id === item.id);
          if (idx !== -1 && (!updatedFullData[idx].lat || updatedFullData[idx].lat === 0 || updatedFullData[idx].lat.toString().includes('.'))) {
             updatedFullData[idx] = { ...updatedFullData[idx], lat, lng };
             newlyFoundFromCache = true;
          }
        }
      });

      if (newlyFoundFromCache && active) {
        setData(updatedFullData);
      }

      // Progress count should start from cached items
      const cachedCount = itemsToProcess.length - needsGeocoding.length;
      if (active) setGeocodedCount(cachedCount);

      const batchSize = 2; // Keep it safe for Nominatim
      
      for (let i = 0; i < needsGeocoding.length; i += batchSize) {
        if (!active) break;
        const currentBatch = needsGeocoding.slice(i, i + batchSize);

        await Promise.all(currentBatch.map(async (item) => {
          try {
            const cleanedAddress = item.address.replace(/(\d+)\s*[~～-]\s*\d+[號號]?/g, '$1號');
            const cacheKey = `${cityName}${item.district}${cleanedAddress}`;
            
            let query = encodeURIComponent(`${cityName}${item.district}${cleanedAddress}`);
            let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
                headers: { 'Accept-Language': 'zh-TW', 'User-Agent': `ExplorerApp-v${Math.floor(Math.random()*10000)}` }
            });
            
            if (!response.ok) return;
            let results = await response.json();
            
            if (results && results.length > 0 && active) {
              const lat = parseFloat(results[0].lat);
              const lng = parseFloat(results[0].lon);
              locationCache.current[cacheKey] = { lat, lng };
              setData(prev => prev.map(p => p.id === item.id ? { ...p, lat, lng } : p));
            }
          } catch (e) {
            console.warn(`Geocoding failed for ${item.address}:`, e);
          } finally {
            if (active) setGeocodedCount(prev => prev + 1);
          }
        }));

        saveCache();
        if (i + batchSize < needsGeocoding.length && active) {
          await new Promise(r => setTimeout(r, 1200)); 
        }
      }
      if (active) setIsGeocoding(false);
    };

    geocodeBatch();
    return () => { active = false; };
  }, [filteredData.length, cityName, search, district]);

  // Priority geocoding for selectedItem
  useEffect(() => {
    if (!selectedItem || (selectedItem.lat !== undefined && selectedItem.lng !== undefined)) return;

    const geocodeSingle = async () => {
      try {
        const cleanedAddress = selectedItem.address.replace(/(\d+)\s*[~～-]\s*\d+[號號]?/g, '$1號');
        const cacheKey = `${cityName}${selectedItem.district}${cleanedAddress}`;

        // Check Cache first
        if (locationCache.current[cacheKey]) {
          const { lat, lng } = locationCache.current[cacheKey];
          setData(prev => prev.map(p => p.id === selectedItem.id ? { ...p, lat, lng } : p));
          setSelectedItem(prev => prev && prev.id === selectedItem.id ? { ...prev, lat, lng } : prev);
          return;
        }

        // Priority 1: Full cleaned address
        let query = encodeURIComponent(`${cityName}${selectedItem.district}${cleanedAddress}`);
        let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
          headers: { 'Accept-Language': 'zh-TW', 'User-Agent': `ExplorerDetail-v${Math.floor(Math.random()*1000)}` }
        });
        let results = await response.json();
        
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);
          
          locationCache.current[cacheKey] = { lat, lng };
          saveCache();

          setData(prev => prev.map(p => p.id === selectedItem.id ? { ...p, lat, lng } : p));
          setSelectedItem(prev => prev && prev.id === selectedItem.id ? { ...prev, lat, lng } : prev);
        } else {
          // Priority 2: Road name only
          const roadName = cleanedAddress.split(/[0-9]/)[0];
          if (roadName && roadName.length > 2) {
             const roadQuery = encodeURIComponent(`${cityName}${selectedItem.district}${roadName}`);
             const rResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${roadQuery}&limit=1`);
             const rResults = await rResponse.json();
             if (rResults && rResults.length > 0) {
                const lat = parseFloat(rResults[0].lat);
                const lng = parseFloat(rResults[0].lon);
                setData(prev => prev.map(p => p.id === selectedItem.id ? { ...p, lat, lng } : p));
                setSelectedItem(prev => prev && prev.id === selectedItem.id ? { ...prev, lat, lng } : prev);
                return;
             }
          }

          // Fallback to district if all fails
          const districtQuery = encodeURIComponent(`${cityName}${selectedItem.district}`);
          const dResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${districtQuery}&limit=1`);
          const dResults = await dResponse.json();
          if (dResults && dResults.length > 0) {
            const lat = parseFloat(dResults[0].lat);
            const lng = parseFloat(dResults[0].lon);
            setData(prev => prev.map(p => p.id === selectedItem.id ? { ...p, lat, lng } : p));
            setSelectedItem(prev => prev && prev.id === selectedItem.id ? { ...prev, lat, lng } : prev);
          } else {
             setSelectedItem(prev => prev && prev.id === selectedItem.id ? { ...prev, lat: 0, lng: 0 } : prev);
          }
        }
      } catch (e) {
        console.warn(`Geocoding failed for ${selectedItem.address}:`, e);
        setSelectedItem(prev => prev && prev.id === selectedItem.id ? { ...prev, lat: 0, lng: 0 } : prev);
      }
    };

    geocodeSingle();
  }, [selectedItem?.id, cityName]);

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
    <div className="relative min-h-[100dvh] w-full flex flex-col font-sans selection:bg-teal-500/30 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 overflow-x-hidden">
      {/* Immersive Mesh Background */}
      <div className="immersive-bg mesh-gradient opacity-60 dark:opacity-40" />
      
      {/* Dynamic Animated Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: [-100, 100, -100],
            y: [-100, 100, -100],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-600/5 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [100, -100, 100],
            y: [50, -50, 50],
            scale: [1.2, 1, 1.2]
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.1, 0.8]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-emerald-400/5 dark:bg-emerald-500/5 rounded-full blur-[100px]" 
        />
      </div>

      {/* Glass Ornaments */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-[12%] left-[8%] opacity-10 dark:opacity-5 text-teal-500"><Sparkles size={64} /></motion.div>
        <motion.div animate={{ y: [0, 40, 0], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[45%] right-[12%] text-blue-500"><Compass size={48} /></motion.div>
      </div>
      
      {/* Main Container - Liquid Glass */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full flex-1 flex flex-col z-10"
      >
        {/* Header */}
        <div className="p-4 sm:p-8 border-b border-white/20 dark:border-white/10 liquid-glass flex flex-col gap-8 shrink-0 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] bg-gradient-to-tr from-slate-900 via-teal-800 to-teal-500 shadow-[0_10px_40px_rgba(20,184,166,0.4)] flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500 group-hover:scale-110">
                  <Database className="text-white w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white dark:border-slate-900"
                >
                  <Sparkles size={14} className="text-white drop-shadow-sm" />
                </motion.div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400">
                    實價登錄查詢
                  </h1>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={fetchData} 
                    disabled={loading}
                    className="w-8 h-8 rounded-full bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 transition-all active:rotate-180 duration-500"
                    title="重新整理資料"
                  >
                    <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-1.5 opacity-80">
                  <span className="h-px w-6 bg-teal-500/30" />
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] flex items-center gap-1.5 leading-none">
                    <Waves size={10} className="text-teal-500 animate-pulse" />
                    Taiwan Real Estate Price Explorer
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl p-1 shadow-inner">
                <button 
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "list" ? "bg-teal-500 text-white shadow-md" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  <List size={14} /> 列表視圖
                </button>
                <button 
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "map" ? "bg-teal-500 text-white shadow-md" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  <MapIcon size={14} /> 地圖探索
                </button>
              </div>

              <div className="hidden sm:flex items-center px-4 py-2 bg-teal-500/10 dark:bg-teal-400/5 border border-teal-500/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse mr-3 shadow-[0_0_8px_rgba(20,184,166,0.8)]"></div>
                <span className="text-[10px] font-extrabold text-teal-700 dark:text-teal-400 uppercase tracking-widest">連線中</span>
              </div>
            </div>
          </div>

          {/* Filters Grid */}
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-4 liquid-glass-panel p-6 sm:p-7 rounded-[2rem] shadow-2xl">
            
            {/* Row 1: Location & Search */}
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-4 items-end">
              <div className="space-y-2 col-span-1 sm:w-36">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] ml-1 opacity-70">縣市</label>
                <select className="w-full liquid-glass-input h-11 px-3 rounded-[1rem] outline-none text-sm font-bold shadow-sm" value={cityName} onChange={e => { setCityName(e.target.value); setDistrict("全部"); }}>
                  {CITIES.map(c => <option key={c.name} value={c.name} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2 col-span-1 sm:w-36">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] ml-1 opacity-70">鄉鎮市</label>
                <select className="w-full liquid-glass-input h-11 px-3 rounded-[1rem] outline-none text-sm font-bold shadow-sm" value={district} onChange={e => setDistrict(e.target.value)}>
                  {uniqueDistricts.map(d => <option key={d} value={d} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{d}</option>)}
                </select>
              </div>
              <div className="space-y-2 col-span-1 sm:w-36">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] ml-1 opacity-70">類型</label>
                <select className="w-full liquid-glass-input h-11 px-3 rounded-[1rem] outline-none text-xs sm:text-sm font-bold shadow-sm" value={typeName} onChange={e => setTypeName(e.target.value)}>
                  {TRANSACTION_TYPES.map(t => <option key={t.name} value={t.name} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{t.name.replace("租賃", "租")}</option>)}
                </select>
              </div>
              <div className="space-y-2 col-span-3 sm:flex-1 sm:min-w-[240px]">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] ml-1 opacity-70">門牌 / 社區名稱 / 地段</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-teal-500 group-focus-within:scale-110 transition-all duration-300" />
                  </div>
                  <input 
                    type="text"
                    placeholder="輸入關鍵字查詢..." 
                    className="w-full pl-11 liquid-glass-input h-11 rounded-[1rem] outline-none text-sm font-bold placeholder:text-slate-400 shadow-sm"
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

            {/* Row 4: Search Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-6 gap-3 sm:gap-4">
              {/* Upper row on mobile: Advanced & Clear buttons */}
              <div className="flex flex-row gap-2 w-full sm:w-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
                  className={`flex-1 sm:flex-none text-xs sm:text-sm font-bold ${isAdvancedSearchOpen ? 'text-teal-600 dark:text-teal-400 bg-teal-500/5' : 'text-slate-500 dark:text-slate-400'} hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-[1rem] h-10 transition-all gap-2 px-3 sm:px-4 border border-transparent ${isAdvancedSearchOpen ? 'border-teal-500/20 shadow-inner' : ''}`}
                >
                  <div className="relative">
                    <SlidersHorizontal className="w-4 h-4" />
                    {isAdvancedSearchOpen && (
                      <motion.div layoutId="search-dot" className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full" />
                    )}
                  </div>
                  進階篩選
                </Button>

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
                  className="flex-1 sm:flex-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-transparent hover:border-white/40 dark:hover:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 rounded-[1rem] h-10 font-medium transition-all whitespace-nowrap px-3 sm:px-4"
                >
                  清除篩選
                </Button>
              </div>

              {/* Search execution group */}
              <div className="flex items-center gap-1 w-full sm:w-auto">
                <Button 
                  onClick={fetchData} 
                  disabled={loading}
                  className="flex-1 sm:flex-none liquid-glass-button-primary rounded-l-[1rem] rounded-r-none px-4 sm:px-6 h-10 border-r border-white/20 whitespace-nowrap"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "處理中..." : "查詢"}
                </Button>
                <Button
                  onClick={() => setIsSavingSearch(true)}
                  className="shrink-0 liquid-glass-button-primary rounded-r-[1rem] rounded-l-none h-10 px-3"
                  title="儲存此搜尋設定"
                >
                  <Bookmark size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Access Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 px-4 no-scrollbar">
              <span className="text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap">我的最愛：</span>
              {savedSearches.map(s => (
                <button
                  key={s.id}
                  onClick={() => applySavedSearch(s)}
                  className="group flex items-center gap-2 whitespace-nowrap px-3 py-1 bg-white/40 dark:bg-black/40 hover:bg-teal-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-full border border-white/40 dark:border-white/10 transition-all"
                >
                  {s.name}
                  <X size={10} onClick={(e) => { e.stopPropagation(); deleteSavedSearch(s.id); }} className="opacity-0 group-hover:opacity-100 hover:text-red-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save Search Modal */}
        <Dialog open={isSavingSearch} onOpenChange={setIsSavingSearch}>
          <DialogContent className="sm:max-w-[400px] rounded-[2rem] border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Bookmark className="text-teal-500" /> 儲存目前搜尋設定
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-500 font-medium">請輸入一個名稱，方便下次快速載入這些篩選條件。</p>
              <Input 
                placeholder="例如：臺北市大安區新成屋" 
                value={newSearchName}
                onChange={e => setNewSearchName(e.target.value)}
                className="liquid-glass-input border-none h-12 rounded-xl text-md font-bold"
                onKeyDown={(e) => e.key === 'Enter' && saveCurrentSearch()}
              />
              <div className="pt-2 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsSavingSearch(false)} className="rounded-xl font-bold">取消</Button>
                <Button onClick={saveCurrentSearch} disabled={!newSearchName.trim()} className="bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold px-6">儲存設定</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Content */}
        <div className="flex-1 flex flex-col liquid-glass rounded-t-none sm:rounded-t-[2.5rem] mx-0 sm:mx-6 border-b-0 shadow-2xl sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)] mt-0 sm:-mt-8 relative z-20 pb-12 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20 dark:border-white/10 flex items-center justify-between bg-white/20 dark:bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">搜尋結果 ({filteredData.length})</span>
            </div>
            
            <div className="lg:hidden flex items-center bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl p-1">
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-teal-500 text-white shadow-md" : "text-slate-400"}`}
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-lg transition-all ${viewMode === "map" ? "bg-teal-500 text-white shadow-md" : "text-slate-400"}`}
              >
                <MapIcon size={16} />
              </button>
            </div>
          </div>
          
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
          ) : viewMode === "list" ? (
            <div className="flex-1 min-h-[300px]">
              <Table className="min-w-[800px]">
                <TableHeader className="sticky top-0 bg-white/60 dark:bg-black/60 backdrop-blur-[32px] z-10 border-b border-white/20 dark:border-white/10">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest pl-8">
                      <Button variant="ghost" className="hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 p-0 h-auto font-bold rounded-lg text-[10px]" onClick={() => handleSort("district")}>
                        地區 <ArrowUpDown className="ml-1 w-3 h-3 opacity-50" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest px-4">位置/社區</TableHead>
                    <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest px-4">
                      <Button variant="ghost" className="hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 p-0 h-auto font-bold rounded-lg text-[10px]" onClick={() => handleSort("date")}>
                        交易日期 <ArrowUpDown className="ml-1 w-3 h-3 opacity-50" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest px-4">型態</TableHead>
                    <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest text-right px-4">
                      <Button variant="ghost" className="hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 p-0 h-auto ml-auto font-bold rounded-lg text-[10px]" onClick={() => handleSort("totalPrice")}>
                        總價 <ArrowUpDown className="ml-1 w-3 h-3 opacity-50" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest text-right px-4">單價/坪</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredData.map((item, idx) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.5) }}
                        key={item.id} 
                        className="border-b border-white/20 dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer group transition-all"
                        onClick={() => setSelectedItem(item)}
                      >
                        <TableCell className="text-slate-900 dark:text-slate-100 font-bold font-display pl-8">{item.district}</TableCell>
                        <TableCell className="max-w-[240px]">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                               <MapPin size={12} className="text-teal-600 dark:text-teal-400" />
                             </div>
                             <div className="truncate text-slate-800 dark:text-slate-200 font-bold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{item.address}</div>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 ml-8">
                            <span className="text-[9px] text-teal-600/70 dark:text-teal-400/70 font-black tracking-widest uppercase px-1.5 pt-0.5 rounded border border-teal-500/20 leading-none">{item.transactionType}</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">{item.buildingArea} ㎡</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm">{formatDate(item.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white/40 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-white/60 dark:border-white/10 font-bold px-2 py-0 h-6">
                            {item.buildingType.split("(")[0] || "土地"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-slate-900 dark:text-white font-display font-black tracking-tighter text-xl">
                            {formatPrice(item.totalPrice)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex flex-col items-end px-3 py-1 bg-white/40 dark:bg-white/5 rounded-xl border border-white/60 dark:border-white/10 group-hover:border-teal-500/30 transition-all">
                            <div className="text-slate-900 dark:text-white font-mono font-black text-sm">
                              {item.unitPrice ? `${(parseFloat(item.unitPrice) * 3.30578 / 10000).toFixed(1)} 萬` : "-"}
                            </div>
                            <div className="text-[8px] text-slate-500 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5 leading-none">萬元/坪</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-8 h-8 rounded-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110">
                            <ChevronRight className="w-4 h-4 text-teal-500" />
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
              {filteredData.length === 0 && !loading && !error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-32 text-slate-500/50 dark:text-slate-400/50"
                >
                  <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent group-hover:opacity-100 transition-opacity" />
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.1, 1] 
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                    >
                      <Compass className="w-10 h-10 opacity-50 text-teal-600/50 relative z-10" />
                    </motion.div>
                  </div>
                  <p className="font-display font-bold text-xl tracking-tight text-slate-800 dark:text-slate-200">還沒找到藏寶圖？</p>
                  <p className="text-sm mt-2 font-medium opacity-60">嘗試放寬您的篩選條件或更改關鍵字</p>
                </motion.div>
              )}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-24 px-6 text-red-500/80 dark:text-red-400/80"
                >
                  <div className="w-20 h-20 rounded-2xl bg-red-100/50 dark:bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8 shadow-sm">
                    <X className="w-10 h-10 opacity-60" />
                  </div>
                  <p className="text-2xl font-display font-extrabold mb-3 tracking-tight text-red-700 dark:text-red-400">數據連線中斷</p>
                  <p className="text-sm opacity-70 max-w-sm text-center font-medium leading-relaxed mb-10">{error}</p>
                  <Button 
                    variant="outline" 
                    className="rounded-2xl px-12 h-12 liquid-glass-button border-red-500/30 text-red-700 dark:text-red-400 hover:bg-red-500/5 font-bold shadow-xl shadow-red-500/5 transition-all active:scale-95"
                    onClick={fetchData}
                  >
                    重新初始化掃描
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 relative min-h-[500px] sm:min-h-[600px]">
              {filteredData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                   <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                     <Search className="text-slate-400" size={32} />
                   </div>
                   <p className="text-slate-500 font-bold">目前沒有可顯示的搜尋結果</p>
                </div>
              ) : (
                <div className="flex-1 relative">
                  <MapContainer 
                    center={(() => {
                      const cityInfo = CITIES.find(c => c.name === cityName);
                      const districtInfo = (CITY_DISTRICTS[cityName] || []).find(d => d.name === district);
                      if (districtInfo?.lat) return [districtInfo.lat, districtInfo.lng] as [number, number];
                      return cityInfo?.lat ? [cityInfo.lat, cityInfo.lng] as [number, number] : [25.0330, 121.5654] as [number, number];
                    })()} 
                    zoom={district !== "全部" ? 14 : 12} 
                    className="w-full h-full z-0 absolute inset-0"
                    scrollWheelZoom={true}
                    key={`map-container-${cityName}-${district}`}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Automatic bounds manager */}
                    <MapBoundsManager items={filteredData} />

                    {filteredData.map((item) => {
                      const lat = typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat;
                      const lng = typeof item.lng === 'string' ? parseFloat(item.lng) : item.lng;
                      
                      if (!lat || !lng || lat === 0) return null;

                      // Extract "section" from address if possible (e.g., "信義段")
                      let label = item.district;
                      const sectionMatch = item.address.match(/([^路街巷]+段)/);
                      if (sectionMatch) {
                        label = sectionMatch[1].length > 6 ? item.district : sectionMatch[1];
                      }

                      return (
                        <Marker 
                          key={item.id} 
                          position={[lat, lng]} 
                          icon={getRedIcon(label)}
                          eventHandlers={{
                            click: () => setSelectedItem(item),
                          }}
                        >
                            <Popup className="custom-popup">
                            <div className="p-1">
                              <div className="flex items-center gap-1.5 mb-1 border-b border-slate-100 pb-1">
                                <span className="bg-red-100 text-red-600 text-[9px] font-bold px-1 rounded">{label}</span>
                                <p className="font-bold text-slate-900 text-xs truncate">{item.address}</p>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <p className="text-red-600 font-black text-sm">{formatPrice(item.totalPrice)}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{item.buildingType} | {item.buildingArea} ㎡</p>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              )}
              
              {/* Map UI Overlays */}
              <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[1000]">
                {isGeocoding && (
                  <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 px-4 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 w-48 transition-all animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">精準校正中...</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${(geocodedCount / (totalToGeocode || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">{geocodedCount}/{totalToGeocode}</span>
                    </div>
                    <p className="text-[8px] text-slate-400 mt-2 font-medium leading-tight">使用免費 Nominatim 引擎<br/>正在獲取精準經緯度</p>
                  </div>
                )}
              </div>
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
        <DialogContent className="max-w-4xl p-0 overflow-hidden liquid-glass-panel border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.3)] dark:shadow-[0_32px_128px_rgba(0,0,0,0.6)]">
          {selectedItem && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Premium Dialog Header */}
              <div className="p-7 sm:p-10 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 mesh-gradient opacity-10" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 font-black tracking-widest text-[10px] uppercase py-0.5 px-3 rounded-full">{selectedItem.district}</Badge>
                       <Badge variant="outline" className="text-slate-500 border-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{selectedItem.id}</Badge>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight leading-tight max-w-xl">
                      {selectedItem.address}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-2 text-slate-400 font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        <Calendar size={14} className="text-teal-500" />
                        {formatDate(selectedItem.date)} 交易紀錄
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        <MapPin size={14} className="text-teal-500" />
                        {cityName}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start sm:items-end bg-teal-500/10 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-teal-500/20">
                    <div className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1.5 opacity-70">官方登錄成交價</div>
                    <div className="text-3xl sm:text-5xl font-display font-black text-teal-400 tracking-tighter drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                      {formatPrice(selectedItem.totalPrice)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="p-6 sm:p-10 space-y-10">
                  {/* High Density Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {[
                      { icon: <DollarSign size={20} />, label: "單價/坪", value: selectedItem.unitPrice ? `${(parseFloat(selectedItem.unitPrice) * 3.30578 / 10000).toFixed(1)} 萬` : "-", sub: "實價登錄單價", color: "text-teal-500", bg: "bg-teal-500/5" },
                      { icon: <Maximize2 size={20} />, label: "建物面積", value: `${selectedItem.buildingArea} ㎡`, sub: `約 ${(parseFloat(selectedItem.buildingArea) * 0.3025).toFixed(2)} 坪`, color: "text-blue-500", bg: "bg-blue-500/5" },
                      { icon: <Layers size={20} />, label: "移轉層次", value: selectedItem.floor ? `${selectedItem.floor}F` : "-", sub: `總樓層 ${selectedItem.totalFloor}F`, color: "text-purple-500", bg: "bg-purple-500/5" },
                      { icon: <Clock size={20} />, label: "屋齡", value: (() => {
                        if (!selectedItem.completionDate) return "新成屋";
                        const compY = parseInt(selectedItem.completionDate.substring(0, 3));
                        if (isNaN(compY)) return "-";
                        const currentY = new Date().getFullYear() - 1911;
                        return `${currentY - compY} 年`;
                      })(), sub: "建屋完工至今", color: "text-amber-500", bg: "bg-amber-500/5" }
                    ].map((stat, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`liquid-glass-input p-6 rounded-[2rem] border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all`}
                      >
                         <div className={`absolute -right-2 -top-2 p-6 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color} rotate-12`}>{stat.icon}</div>
                         <div className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2">
                           <div className={`w-6 h-6 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
                           {stat.label}
                         </div>
                         <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
                         {stat.sub && <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-2 opacity-60 tracking-wide">{stat.sub}</div>}
                      </motion.div>
                    ))}
                  </div>

                  {/* Map Preview */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm flex items-center gap-2">
                       <MapIcon size={12} className="text-teal-500" /> 地理位置
                    </h3>
                    <div className="h-[200px] sm:h-[250px] w-full liquid-glass rounded-[1.5rem] overflow-hidden border border-white/40 dark:border-white/10 shadow-inner relative isolate">
                       {selectedItem.lat && selectedItem.lng && selectedItem.lat !== 0 ? (
                         <MapContainer 
                           center={[selectedItem.lat, selectedItem.lng]} 
                           zoom={16} 
                           className="w-full h-full z-0"
                           zoomControl={false}
                           attributionControl={false}
                         >
                           <TileLayer
                             url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                           />
                           <Marker position={[selectedItem.lat, selectedItem.lng]} icon={customIcon} />
                           <MapController center={[selectedItem.lat, selectedItem.lng]} />
                         </MapContainer>
                       ) : selectedItem.lat === 0 ? (
                         <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 p-4 text-center">
                            <MapPin className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">無法精確定位地址</p>
                            <p className="text-[9px] text-slate-400 leading-relaxed font-medium">因開放資料地址遮蔽，無法自動解析座標<br/>請參考明細中的門牌資訊</p>
                         </div>
                       ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50">
                            <Compass className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-spin-slow mb-2" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">正在解析座標...</p>
                         </div>
                       )}
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

              <div className="p-4 sm:p-6 border-t border-white/30 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl flex justify-end">
                <Button 
                  onClick={() => setSelectedItem(null)}
                  variant="outline"
                  className="rounded-2xl px-12 h-12 liquid-glass-button-primary shadow-2xl"
                >
                  確認並關閉
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
    <div className="flex items-center justify-between p-4 px-5 text-sm hover:bg-teal-500/5 transition-all group">
      <span className="text-slate-500 dark:text-slate-400 font-bold group-hover:text-teal-600 transition-colors uppercase text-[10px] tracking-widest">{label}</span>
      <span className="text-slate-900 dark:text-slate-100 font-black tracking-tight">{value || "-"}</span>
    </div>
  );
}
