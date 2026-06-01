/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useState, useEffect, useRef, useMemo } from "react";
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
  RotateCw,
  Moon,
  Sun,
  BarChart3,
  Bed,
  Sofa,
  Bath,
  ChevronLeft,
  ArrowDown,
  ArrowUp,
  Heart
} from "lucide-react";
import { CITIES, TRANSACTION_TYPES, CITY_DISTRICTS } from "./constants";
import { LocationSelectionModal } from "./components/LocationSelectionModal";
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
import { syncSeoMetadata } from "./lib/seo";
import type { Transaction } from "./types/real-estate";

const ResultsCharts = lazy(() => import("./components/ResultsCharts"));
const ResultsMap = lazy(() => import("./components/MapViews"));
const TransactionMapPreview = lazy(() =>
  import("./components/MapViews").then((module) => ({ default: module.TransactionMapPreview }))
);

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

const FEATURED_CITY_NAMES = ["臺北市", "新北市", "桃園市", "臺中市", "臺南市", "高雄市"] as const;
const FEATURED_QUERY_INTENTS = [
  "實價登錄查詢",
  "台灣房價地圖",
  "預售屋成交紀錄",
  "租賃實價登錄",
  "社區成交單價",
];

export default function App() {
  const [cityName, setCityName] = useState("臺北市");
  const [typeName, setTypeName] = useState("買賣");
  const [district, setDistrict] = useState("全部");
  const [search, setSearch] = useState("");
  
  const [propertyTypes, setPropertyTypes] = useState<string[]>(["房地", "建物", "土地"]);
  const [period, setPeriod] = useState({ startY: "101", startM: "1", endY: "115", endM: "12" });
  const [unitPrice, setUnitPrice] = useState({ min: "", max: "", unit: "1" }); // 1:萬元/坪, 2:元/㎡
  const [area, setArea] = useState({ min: "", max: "", unit: "2" }); // 1:㎡, 2:坪
  const [age, setAge] = useState({ min: "", max: "" });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('explorer_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('explorer_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('explorer_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    syncSeoMetadata({ cityName, district, typeName });
  }, [cityName, district, typeName]);

  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map" | "aggregated">("list");
  const [mapLayer, setMapLayer] = useState<"default" | "satellite" | "landmark">("default");
  const [showFacilities, setShowFacilities] = useState(false);
  const [showChartsMobile, setShowChartsMobile] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
  
  const [favorites, setFavorites] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('explorer_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showFavorites, setShowFavorites] = useState(false);

  const toggleFavorite = (item: Transaction, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setFavorites(prev => {
      const exists = prev.some(f => f.id === item.id);
      let updated;
      if (exists) {
        updated = prev.filter(f => f.id !== item.id);
      } else {
        updated = [item, ...prev];
      }
      localStorage.setItem('explorer_favorites', JSON.stringify(updated));
      return updated;
    });
  };

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
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [robotStatus, setRobotStatus] = useState("");
  const [selectedItem, setSelectedItem] = useState<Transaction | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = React.useRef(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const robotTimeoutsRef = React.useRef<NodeJS.Timeout[]>([]);
  const sortScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollSort = (direction: 'left' | 'right') => {
    if (sortScrollRef.current) {
      const scrollAmount = 200;
      sortScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

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
    if (window.innerWidth < 768) {
      setIsSearchExpanded(false);
    }

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
              
              const isRent = typeName === "租賃";
              const isPreSale = typeName === "預售屋";

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
                totalPrice: isRent ? row[22] : row[21],
                unitPrice: isRent ? row[23] : row[22],
                parkingType: isRent ? row[24] : row[23],
                parkingArea: isRent ? row[25] : row[24],
                parkingPrice: isRent ? row[26] : row[25],
                remarks: isRent ? row[27] : row[26],
                id: (isRent ? row[28] : row[27]) || `item-${index}`,
                buildCase: isPreSale ? row[28] : undefined,
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
          const isRent = typeName === "租賃";
          const isPreSale = typeName === "預售屋";

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
            totalPrice: isRent ? (row[22] || "") : (row[21] || ""),
            unitPrice: isRent ? (row[23] || "") : (row[22] || ""),
            parkingType: isRent ? (row[24] || "") : (row[23] || ""),
            parkingArea: isRent ? (row[25] || "") : (row[24] || ""),
            parkingPrice: isRent ? (row[26] || "") : (row[25] || ""),
            remarks: isRent ? (row[27] || "") : (row[26] || ""),
            id: String(isRent ? (row[28] || `item-${index}`) : (row[27] || `item-${index}`)),
            buildCase: isPreSale ? (row[28] || "") : undefined,
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

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAdvancedSearchOpen(false);
        setIsLocationModalOpen(false);
        setSelectedItem(null);
        setIsSavingSearch(false);
        setShowSuggestions(false);
        setShowFavorites(false);
      }
      
      if (e.key === 'Enter') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'button') return; // Do not conflict with default button 'Enter' click behavior
        
        if (isSavingSearch) {
          saveCurrentSearch();
          return;
        }

        if (isLocationModalOpen) return;
        if (selectedItem) return;
        
        // Always close suggestions on enter, trigger a fresh search
        setShowSuggestions(false);
        fetchData();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchData, isSavingSearch, isLocationModalOpen, selectedItem, saveCurrentSearch]);

  // Handle resize for search panel
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !isSearchExpanded) {
        setIsSearchExpanded(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSearchExpanded]);

  const uniqueDistricts = useMemo(() => {
    return ["全部", ...(CITY_DISTRICTS[cityName] || []).map(d => d.name)];
  }, [cityName]);

  const addressSuggestions = useMemo(() => {
    if (!search || search.trim().length === 0) return [];
    const validSearch = search.trim();
    const roads = new Set<string>();
    
    data.forEach(item => {
      if (item.buildCase && item.buildCase.includes(validSearch) && item.buildCase !== validSearch) {
        roads.add(item.buildCase);
      }
      
      let addr = item.address;
      if (addr.startsWith(cityName)) addr = addr.slice(cityName.length);
      if (addr.startsWith(item.district)) addr = addr.slice(item.district.length);
      
      const parts = addr.match(/[^路街段巷弄]+[路街段巷弄]/g) || [];
      let current = "";
      for (const p of parts) {
        current += p;
        if (current.includes(validSearch) && current !== validSearch) {
          roads.add(current);
        }
      }
    });
    
    return Array.from(roads).slice(0, 8);
  }, [data, search, cityName]);

  const filteredData = useMemo(() => {
    let result = data.filter((item) => {
      // Basic Search
      const matchesSearch = search === "" || item.address.includes(search) || item.district.includes(search) || item.buildingType.includes(search) || (item.buildCase && item.buildCase.includes(search));
      
      // District Filter
      const matchesDistrict = district === "全部" || item.district === district;

      // Property Type Filter
      const matchesPropertyType = propertyTypes.length === 0 || propertyTypes.some(pt => {
        if (pt === "房地") return item.transactionType === "房地(土地+建物)" || item.transactionType === "房地";
        if (pt === "房地(車)") return item.transactionType === "房地(土地+建物)+車位" || item.transactionType.includes("車位");
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortConfig, district, propertyTypes, period, unitPrice, area, age, cityName]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const priceDistribution = useMemo(() => {
    if (filteredData.length < 10) return [];
    
    // Convert to 萬 (10k)
    const prices = filteredData.map(d => parseFloat(d.totalPrice) / 10000).filter(p => !isNaN(p));
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
    let step = 100; // default 100萬 bins
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
    prices.forEach(p => {
      const binStart = Math.floor(p / step) * step;
      bins.set(binStart, (bins.get(binStart) || 0) + 1);
    });

    return Array.from(bins.entries())
      .map(([binStart, count]) => ({ 
        name: `${binStart}-${binStart + step}萬`, 
        count, 
        sortValue: binStart 
      }))
      .sort((a, b) => a.sortValue - b.sortValue);
  }, [filteredData]);

  const priceTrend = useMemo(() => {
    if (filteredData.length < 10) return [];

    const monthMap = new Map<string, { sum: number, count: number }>();
    
    filteredData.forEach(item => {
      if (item.date && item.date.length >= 6) {
        const y = item.date.substring(0, item.date.length - 4);
        const m = item.date.substring(item.date.length - 4, item.date.length - 2);
        
        const priceVal = parseFloat(item.unitPrice);
        if (isNaN(priceVal) || priceVal <= 0) return;
        
        // Convert to 萬元/坪. (rawUnitPrice * 3.30578) / 10000
        const pricePerPing = (priceVal * 3.30578) / 10000;
        
        // Let's use simple string format YYY/MM
        const monthKey = `${y}/${m}`;
        const current = monthMap.get(monthKey) || { sum: 0, count: 0 };
        current.sum += pricePerPing;
        current.count += 1;
        monthMap.set(monthKey, current);
      }
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
         month,
         avgPrice: Math.round((data.sum / data.count) * 10) / 10,
         sortKey: parseInt(month.replace('/', ''))
      }))
      .sort((a, b) => a.sortKey - b.sortKey);
  }, [filteredData]);

  const aggregatedPreSaleData = useMemo(() => {
    if (typeName !== "預售屋" || filteredData.length === 0) return [];
    
    const map = new Map<string, {
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
      lat?: number;
      lng?: number;
    }>();

    filteredData.forEach(item => {
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
        lng: item.lng
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
        // convert to 萬元/坪
        const upPing = (up * 3.30578) / 10000;
        if (upPing < current.minUnitPrice) current.minUnitPrice = upPing;
        if (upPing > current.maxUnitPrice) current.maxUnitPrice = upPing;
        current.sumUnitPrice += upPing;
        current.unitPriceCount += 1;
      }

      // update coordinates if found better ones
      if (!current.lat && item.lat) {
        current.lat = item.lat;
        current.lng = item.lng;
      }

      map.set(bc, current);
    });

    return Array.from(map.values())
      .filter(item => item.count > 0)
      .map(item => ({
        ...item,
        avgPrice: item.sumPrice / item.count,
        avgUnitPrice: item.unitPriceCount > 0 ? (item.sumUnitPrice / item.unitPriceCount) : 0,
      }))
      .sort((a, b) => b.count - a.count);

  }, [filteredData, typeName]);

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
      const wan = p / 10000;
      return `${wan % 1 === 0 ? wan : parseFloat(wan.toFixed(2))} 萬`;
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
    <div className="relative min-h-[100dvh] w-full flex flex-col font-sans selection:bg-coral-500/30 bg-transparent  text-ink dark:text-slate-100 pb-20 overflow-x-hidden">
      <LocationSelectionModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        cityName={cityName}
        setCityName={setCityName}
        district={district}
        setDistrict={setDistrict}
      />
      {/* Immersive Mesh Background */}
      <div className="immersive-bg opacity-100" />
      
      {/* Dynamic Animated Blobs */}
      <div className="immersive-bg">
        <motion.div 
          animate={{ 
            x: [-100, 100, -100],
            y: [-100, 100, -100],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-coral-500/15 dark:bg-coral-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [100, -100, 100],
            y: [50, -50, 50],
            scale: [1.2, 1, 1.2]
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-amber-500/15 dark:bg-amber-600/10 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.1, 0.8]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-[100px]" 
        />
      </div>

      {/* Glass Ornaments */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-[12%] left-[8%] opacity-10 dark:opacity-5 text-coral-500"><Sparkles size={64} /></motion.div>
        <motion.div animate={{ y: [0, 40, 0], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[45%] right-[12%] text-amber-500"><Compass size={48} /></motion.div>
      </div>
      
      {/* Main Container - Liquid Glass */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full flex-1 flex flex-col z-10"
      >
        {/* Header */}
        <div className="p-4 sm:px-8 sm:pt-4 sm:pb-4 border-b border-white/20 dark:border-white/10 liquid-glass flex flex-col gap-3 shrink-0 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 right-0 h-[px] bg-gradient-to-r from-transparent via-coral-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
          <div className="max-w-[1600px] mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.5rem] bg-gradient-to-tr from-slate-900 via-coral-800 to-coral-500 shadow-[0_10px_40px_rgba(20,184,166,0.4)] flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500 group-hover:scale-110">
                  <Database className="text-white w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, ease: "easeOut", duration: 0.5 }}
                  className="absolute -top-3 -right-3 w-7 h-7 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white dark:border-slate-900"
                >
                  <Sparkles size={12} className="text-white drop-shadow-sm" />
                </motion.div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-ink dark:text-white">
                    實價登錄查詢
                  </h1>
                  <div className="flex items-center gap-1.5 relative">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFavorites(!showFavorites)}
                      className={`w-8 h-8 rounded-full transition-all shadow-sm relative ${showFavorites ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 hover:bg-red-500/10 text-slate-600 dark:text-slate-400 hover:text-red-500'}`}
                      title="我的最愛"
                    >
                      <Heart size={14} className={favorites.length > 0 ? 'fill-current' : ''} />
                      {favorites.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                          {favorites.length}
                        </span>
                      )}
                    </Button>

                    <AnimatePresence>
                      {showFavorites && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-10 right-0 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]"
                        >
                          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                              <Heart size={12} className="text-red-500 fill-current" /> 我的收藏
                            </span>
                          </div>
                          <div className="overflow-y-auto p-2 flex flex-col gap-1.5 [scrollbar-width:none]">
                            {favorites.length === 0 ? (
                              <div className="py-6 text-center text-xs font-medium text-slate-400">目前沒有收藏任何物件</div>
                            ) : (
                              favorites.map(f => (
                                <div key={f.id} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex justify-between items-start gap-2" onClick={() => setSelectedItem(f)}>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{f.address}</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[10px] text-slate-500">{f.district}</span>
                                      {f.unitPrice && <span className="text-[10px] font-bold text-coral-500">{(parseFloat(f.unitPrice) * 3.30578 / 10000).toFixed(1)} 萬/坪</span>}
                                    </div>
                                  </div>
                                  <button onClick={(e) => toggleFavorite(f, e)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                                    <Heart size={12} className="fill-current" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={fetchData} 
                      disabled={loading}
                      className="w-8 h-8 rounded-full bg-coral-500/10 hover:bg-coral-500/20 text-coral-600 dark:text-coral-400 transition-all active:rotate-180 duration-500"
                      title="重新整理資料"
                    >
                      <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDarkMode(!darkMode)}
                      className="w-8 h-8 rounded-full bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-slate-400 transition-all shadow-sm"
                      title={darkMode ? "切換至淺色模式" : "切換至深色模式"}
                    >
                      {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1 opacity-80">
                  <span className="h-px w-6 bg-coral-500/30" />
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] flex items-center gap-1.5 leading-none">
                    <Waves size={10} className="text-coral-500 animate-pulse" />
                    Taiwan Real Estate Price Explorer
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl p-1 shadow-inner">
                <button 
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "list" ? "bg-coral-500 text-white shadow-md" : "text-slate-500 hover:text-ink dark:hover:text-white"}`}
                >
                  <List size={14} /> 列表視圖
                </button>
                {typeName === "預售屋" && (
                  <button 
                    onClick={() => setViewMode("aggregated")}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "aggregated" ? "bg-emerald-500 text-white shadow-md" : "text-slate-500 hover:text-ink dark:hover:text-white"}`}
                  >
                    <BarChart3 size={14} /> 建案聚合
                  </button>
                )}
                <button 
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "map" ? "bg-coral-500 text-white shadow-md" : "text-slate-500 hover:text-ink dark:hover:text-white"}`}
                >
                  <MapIcon size={14} /> 地圖探索
                </button>
              </div>

              <div className="hidden sm:flex items-center px-4 py-2 bg-coral-500/10 dark:bg-coral-400/5 border border-coral-500/10 rounded-full backdrop-blur-sm shadow-sm ring-1 ring-white/20">
                <div className="w-2 h-2 rounded-full bg-coral-500 animate-pulse mr-3 shadow-[0_0_12px_rgba(20,184,166,0.8)]"></div>
                <span className="text-[10px] font-bold text-coral-700 dark:text-coral-400 uppercase tracking-[0.2em]">Live</span>
              </div>
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto w-full grid gap-6 px-1 pt-1 pb-2 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
            <section aria-labelledby="search-intent-overview" className="flex flex-col gap-3">
              


            </section>

            <section aria-labelledby="search-intent-overview" className="flex flex-col gap-3">
              <div className="flex flex-col gap-3">
                <h3 id="featured-cities" className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  熱門查詢城市
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  快速切換
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {FEATURED_CITY_NAMES.map((featuredCity) => (
                  <button
                    key={featuredCity}
                    onClick={() => {
                      setCityName(featuredCity);
                      setDistrict("全部");
                      setIsSearchExpanded(true);
                    }}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${
                      cityName === featuredCity
                        ? "border-coral-400/60 bg-coral-500/12 text-coral-700 dark:text-coral-400"
                        : "border-white/60 dark:border-white/10 bg-white/45 dark:bg-slate-900/35 text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    {featuredCity}
                  </button>
                ))}
              </div>

              
            </section>
          </div>

          {/* Quick Access Saved Searches */}
          <AnimatePresence>
            {savedSearches.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-[1600px] mx-auto w-full flex items-center gap-2 overflow-x-auto pb-4 px-2 no-scrollbar"
              >
                <div className="flex items-center gap-1.5 mr-1 text-slate-500 dark:text-slate-400">
                  <Bookmark size={12} className="text-coral-500 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shrink-0">最近使用：</span>
                </div>
                {savedSearches.map(s => (
                  <button
                    key={s.id}
                    onClick={() => applySavedSearch(s)}
                    className="group flex items-center gap-2 whitespace-nowrap px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full border border-white/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    {s.name}
                    <div 
                      onClick={(e) => { e.stopPropagation(); deleteSavedSearch(s.id); }} 
                      className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:!bg-coral-500 hover:text-white transition-all scale-75 group-hover:scale-100 overflow-hidden"
                    >
                      <X size={10} />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Collapsed State */}
          <AnimatePresence>
            {!isSearchExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-[1600px] mx-auto w-full md:hidden flex items-center justify-between liquid-glass-panel px-5 py-3 rounded-2xl shadow-xl cursor-pointer hover:bg-white/40 active:scale-[0.98] transition-all overflow-hidden mb-2"
                onClick={() => setIsSearchExpanded(true)}
              >
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin size={14} className="text-coral-500" />
                  <span className="font-bold text-sm truncate max-w-[150px] sm:max-w-none">{cityName} {district !== "全部" ? `· ${district}` : ''}</span>
                  {search && <span className="text-xs opacity-70 truncate max-w-[80px]">"{search}"</span>}
                </div>
                <div className="flex items-center gap-1.5 text-coral-500 font-bold text-[10px] bg-coral-500/10 px-2.5 py-1.5 rounded-lg shrink-0">
                  <Filter size={12} /> 展開條件
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters Grid */}
          <AnimatePresence initial={false}>
            {isSearchExpanded && (
              <motion.div 
                initial={window.innerWidth < 768 ? { height: 0, opacity: 0 } : false}
                animate={{ height: "auto", opacity: 1 }}
                exit={window.innerWidth < 768 ? { height: 0, opacity: 0 } : false}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} // smooth ease-out (like Apple)
                className="max-w-[1600px] mx-auto w-full z-10 overflow-hidden"
              >
                <div className="flex flex-col gap-2 sm:gap-4 liquid-glass-panel p-3 sm:px-6 sm:py-4 rounded-[2rem] shadow-2xl mx-1 mb-2 sm:mb-4 mt-1 sm:mt-0">
            
            {/* Top Row: Location & Search */}
            <div className="flex flex-col sm:flex-row gap-4 z-40">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="liquid-glass-input h-[52px] px-4 sm:px-5 rounded-[1rem] flex items-center justify-between gap-3 hover:border-coral-500/50 hover:shadow-md transition-all sm:w-[220px] shrink-0 outline-none text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-coral-500/10 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-coral-500" />
                  </div>
                  <div className="flex flex-col items-start gap-0.5 justify-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">選擇區域</span>
                    <span className="font-bold text-ink dark:text-white text-[15px] leading-none mb-0.5 mt-0.5 truncate max-w-[120px]">{cityName} {district !== "全部" ? `· ${district}` : ''}</span>
                  </div>
                </div>
                <ArrowUpDown className="w-3 h-3 opacity-30 shrink-0" />
              </button>

              <div className="relative group flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400 group-focus-within:text-coral-500 group-focus-within:scale-110 transition-all duration-300" />
                </div>
                <input 
                  type="text"
                  placeholder="輸入關鍵字查詢..." 
                  className="w-full pl-11 liquid-glass-input h-[52px] rounded-[1rem] outline-none text-sm font-bold placeholder:text-slate-400 shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                
                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-[calc(100%+8px)] left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden py-2"
                    >
                      {addressSuggestions.map(suggestion => (
                        <div 
                          key={suggestion}
                          className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-coral-500/10 hover:text-coral-600 dark:hover:text-coral-400 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                          onClick={() => {
                            setSearch(suggestion);
                            setShowSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tags Row: Type & Property Types */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
              
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] ml-1 opacity-80">交易型態</span>
                <div className="flex bg-white/40 dark:bg-black/20 p-1.5 rounded-[1rem] shadow-inner border border-white/60 dark:border-white/5">
                  {TRANSACTION_TYPES.map(t => (
                    <button 
                      key={t.name}
                      onClick={() => {
                        setTypeName(t.name);
                        if (t.name === "預售屋") setViewMode("aggregated");
                        else setViewMode("list");
                      }}
                      className={`px-4 xl:px-6 h-9 font-bold text-xs sm:text-[13px] rounded-xl transition-all ${typeName === t.name ? 'bg-white dark:bg-slate-800 text-coral-600 dark:text-coral-400 shadow-sm border border-slate-100 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      {t.name.replace("租賃", "租")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full sm:w-px h-px sm:h-10 bg-white/40 dark:bg-white/5 mx-0 sm:mx-2" />

              <div className="flex flex-col gap-1.5 w-full min-w-0">
                 <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] ml-1 opacity-80 shrink-0">標的種類</span>
                 <div className="flex flex-nowrap sm:flex-wrap gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
                   {["房地", "房地(車)", "建物", "車位", "土地"].map(pt => (
                      <label key={pt} className="relative cursor-pointer group shrink-0 snap-start">
                        <input type="checkbox" className="sr-only peer" 
                          checked={propertyTypes.includes(pt)}
                          onChange={(e) => {
                            if (e.target.checked) setPropertyTypes([...propertyTypes, pt]);
                            else setPropertyTypes(propertyTypes.filter(p => p !== pt));
                          }}
                        />
                        <div className="px-2.5 sm:px-3 xl:px-4 h-[44px] flex items-center justify-center rounded-[1rem] border border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/50 text-[12px] sm:text-[13px] font-bold text-slate-500 dark:text-slate-400 peer-checked:bg-coral-500/10 dark:peer-checked:bg-coral-900/30 peer-checked:text-coral-600 dark:peer-checked:text-coral-400 peer-checked:border-coral-300 dark:peer-checked:border-coral-500/30 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:-translate-y-[1px] active:translate-y-0 whitespace-nowrap">
                          {pt}
                        </div>
                      </label>
                   ))}
                 </div>
              </div>
            </div>

            {/* Row 3: Advanced Filters */}
            <AnimatePresence>
              {isAdvancedSearchOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -10 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden mt-2"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-5 sm:p-7 bg-white/30 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-[2rem] shadow-[0_16px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] mb-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5" />

                    {/* Period */}
                     <div className="space-y-2 relative z-10">
                       <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] ml-2 opacity-80">交易期間</label>
                       <div className="flex items-center gap-1 liquid-glass-input rounded-2xl p-1.5 flex-wrap sm:flex-nowrap border-white/50 dark:border-white/10 shadow-sm">
                         <div className="flex-1 min-w-0 flex items-center bg-white/50 dark:bg-black/20 rounded-xl px-1.5 h-10 hover:bg-white/80 dark:hover:bg-black/40 transition-colors">
                           <select className="appearance-none bg-transparent border-none outline-none text-sm font-bold cursor-pointer w-full text-center pr-1 focus:ring-0" value={period.startY} onChange={e => setPeriod({...period, startY: e.target.value})}>
                             {YEARS.map(y => <option key={y} value={y} className="bg-white dark:bg-slate-800 text-ink dark:text-white">{y}</option>)}
                           </select>
                           <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Y</span>
                         </div>
                         <div className="flex-1 min-w-0 flex items-center bg-white/50 dark:bg-black/20 rounded-xl px-1.5 h-10 hover:bg-white/80 dark:hover:bg-black/40 transition-colors">
                           <select className="appearance-none bg-transparent border-none outline-none text-sm font-bold cursor-pointer w-full text-center pr-1 focus:ring-0" value={period.startM} onChange={e => setPeriod({...period, startM: e.target.value})}>
                             {MONTHS.map(m => <option key={m} value={m} className="bg-white dark:bg-slate-800 text-ink dark:text-white">{m}</option>)}
                           </select>
                           <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">M</span>
                         </div>
                         <span className="text-slate-400 dark:text-slate-600 font-bold shrink-0">-</span>
                         <div className="flex-1 min-w-0 flex items-center bg-white/50 dark:bg-black/20 rounded-xl px-1.5 h-10 hover:bg-white/80 dark:hover:bg-black/40 transition-colors">
                           <select className="appearance-none bg-transparent border-none outline-none text-sm font-bold cursor-pointer w-full text-center pr-1 focus:ring-0" value={period.endY} onChange={e => setPeriod({...period, endY: e.target.value})}>
                             {YEARS.map(y => <option key={y} value={y} className="bg-white dark:bg-slate-800 text-ink dark:text-white">{y}</option>)}
                           </select>
                           <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Y</span>
                         </div>
                         <div className="flex-1 min-w-0 flex items-center bg-white/50 dark:bg-black/20 rounded-xl px-1.5 h-10 hover:bg-white/80 dark:hover:bg-black/40 transition-colors">
                           <select className="appearance-none bg-transparent border-none outline-none text-sm font-bold cursor-pointer w-full text-center pr-1 focus:ring-0" value={period.endM} onChange={e => setPeriod({...period, endM: e.target.value})}>
                             {MONTHS.map(m => <option key={m} value={m} className="bg-white dark:bg-slate-800 text-ink dark:text-white">{m}</option>)}
                           </select>
                           <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">M</span>
                         </div>
                       </div>
                     </div>

                    {/* Unit Price */}
                    <div className="space-y-2 relative z-10">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] ml-2 opacity-80">單價</label>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-black/20 px-3 py-1 rounded-full border border-white/50 dark:border-white/10 shadow-sm">
                          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors"><input type="radio" name="up_unit" checked={unitPrice.unit==="1"} onChange={()=>setUnitPrice({...unitPrice, unit:"1"})} className="accent-coral-500 w-3.5 h-3.5"/> 萬元/坪</label>
                          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors"><input type="radio" name="up_unit" checked={unitPrice.unit==="2"} onChange={()=>setUnitPrice({...unitPrice, unit:"2"})} className="accent-coral-500 w-3.5 h-3.5"/> 元/㎡</label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="最小值" className="w-full liquid-glass-input h-12 px-4 rounded-2xl outline-none text-sm font-bold shadow-sm" value={unitPrice.min} onChange={e=>setUnitPrice({...unitPrice, min: e.target.value})} />
                        <span className="text-slate-400/50 font-bold">-</span>
                        <input type="number" placeholder="最大值" className="w-full liquid-glass-input h-12 px-4 rounded-2xl outline-none text-sm font-bold shadow-sm" value={unitPrice.max} onChange={e=>setUnitPrice({...unitPrice, max: e.target.value})} />
                      </div>
                    </div>

                    {/* Area */}
                    <div className="space-y-2 relative z-10">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] ml-2 opacity-80">面積</label>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-black/20 px-3 py-1 rounded-full border border-white/50 dark:border-white/10 shadow-sm">
                          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors"><input type="radio" name="a_unit" checked={area.unit==="1"} onChange={()=>setArea({...area, unit:"1"})} className="accent-coral-500 w-3.5 h-3.5"/> ㎡</label>
                          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors"><input type="radio" name="a_unit" checked={area.unit==="2"} onChange={()=>setArea({...area, unit:"2"})} className="accent-coral-500 w-3.5 h-3.5"/> 坪</label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="最小值" className="w-full liquid-glass-input h-12 px-4 rounded-2xl outline-none text-sm font-bold shadow-sm" value={area.min} onChange={e=>setArea({...area, min: e.target.value})} />
                        <span className="text-slate-400/50 font-bold">-</span>
                        <input type="number" placeholder="最大值" className="w-full liquid-glass-input h-12 px-4 rounded-2xl outline-none text-sm font-bold shadow-sm" value={area.max} onChange={e=>setArea({...area, max: e.target.value})} />
                      </div>
                    </div>

                    {/* Age */}
                    <div className="space-y-2 flex flex-col justify-end lg:pb-[2px] relative z-10">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] ml-2 opacity-80">屋齡 (年)</label>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="最小值" className="w-full liquid-glass-input h-12 px-4 rounded-2xl outline-none text-sm font-bold shadow-sm" value={age.min} onChange={e=>setAge({...age, min: e.target.value})} />
                        <span className="text-slate-400/50 font-bold">-</span>
                        <input type="number" placeholder="最大值" className="w-full liquid-glass-input h-12 px-4 rounded-2xl outline-none text-sm font-bold shadow-sm" value={age.max} onChange={e=>setAge({...age, max: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Row 4: Search Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-1 sm:mt-2 gap-3 sm:gap-4">
              {/* Upper row on mobile: Advanced & Clear buttons */}
              <div className="flex flex-row gap-2 w-full sm:w-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
                  className={`flex-1 sm:flex-none text-xs sm:text-sm font-bold ${isAdvancedSearchOpen ? 'text-coral-600 dark:text-coral-400 bg-coral-500/10 dark:bg-coral-500/20' : 'text-slate-600 dark:text-slate-300'} hover:text-coral-700 hover:bg-coral-50 dark:hover:bg-coral-900/30 rounded-[1.25rem] h-11 transition-all gap-2 px-4 border border-transparent shadow-sm ${isAdvancedSearchOpen ? 'border-coral-500/30 shadow-inner' : ''}`}
                >
                  <div className="relative">
                    <SlidersHorizontal className="w-4 h-4" />
                    {isAdvancedSearchOpen && (
                      <motion.div Id="search-dot" className="absolute -top-1 -right-1 w-2 h-2 bg-coral-500 shadow-[0_0_8px_rgba(20,184,166,0.5)] rounded-full" />
                    )}
                  </div>
                  進階篩選
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSearch("");
                    setDistrict("全部");
                    setCityName("台北市");
                    setPropertyTypes(["房地", "房地(車)", "建物", "車位", "土地"]);
                    setTypeName("買賣");
                    setPeriod({ startY: "112", startM: "1", endY: "113", endM: "12" });
                    setUnitPrice({ min: "", max: "", unit: "1" });
                    setArea({ min: "", max: "", unit: "2" });
                    setAge({ min: "", max: "" });
                  }}
                  className="flex-1 sm:flex-none h-11 px-4 rounded-[1.25rem] text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-coral-500/5 transition-all text-xs sm:text-sm font-bold flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  清除篩選
                </Button>
              </div>

              {/* Search execution group */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                <Button
                  onClick={() => setIsSavingSearch(true)}
                  variant="ghost"
                  className="flex-1 sm:flex-none bg-coral-500/10 hover:bg-coral-500/20 text-coral-600 dark:text-coral-400 border border-coral-500/20 rounded-[1.25rem] h-11 px-4 text-xs font-bold transition-all shadow-sm"
                  title="儲存目前的搜尋設定"
                >
                  <Bookmark size={14} className="mr-1.5" />
                  儲存條件
                </Button>
                <Button 
                  onClick={fetchData} 
                  disabled={loading}
                  className="flex-1 sm:flex-none liquid-glass-button-primary rounded-[1.25rem] px-8 h-11 whitespace-nowrap shadow-md text-sm font-bold"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "處理中..." : "開始查詢"}
                </Button>
              </div>
            </div>
               </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Save Search Modal */}
        <Dialog open={isSavingSearch} onOpenChange={setIsSavingSearch}>
          <DialogContent className="sm:max-w-[400px] rounded-[2rem] border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Bookmark className="text-coral-500" /> 儲存目前搜尋設定
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
                <Button onClick={saveCurrentSearch} disabled={!newSearchName.trim()} className="bg-coral-600 hover:bg-coral-500 text-white rounded-xl font-bold px-6">儲存設定</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Content */}
        <div className="flex-1 flex flex-col liquid-glass rounded-t-none sm:rounded-t-[2.5rem] mx-0 sm:mx-6 border-b-0 shadow-2xl sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)] mt-0 sm:-mt-6 relative z-20 pb-12 overflow-hidden">
          <div className="px-6 sm:px-8 py-4 border-b border-white/20 dark:border-white/10 flex items-center justify-between bg-white/30 dark:bg-black/20 backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1 bg-coral-500" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-coral-500/10 flex items-center justify-center border border-coral-500/10">
                <Filter className="w-5 h-5 text-coral-600 dark:text-coral-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-ink dark:text-white uppercase tracking-[0.22em] leading-none">搜尋結果</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1.5 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-coral-500" />
                  目前找到 {filteredData.length} 筆符合條件的成交紀錄
                </span>
              </div>
            </div>
            
            <div className="lg:hidden flex items-center bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl p-1">
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-coral-500 text-white shadow-md" : "text-slate-400"}`}
              >
                <List size={16} />
              </button>
              {typeName === "預售屋" && (
                <button 
                  onClick={() => setViewMode("aggregated")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "aggregated" ? "bg-emerald-500 text-white shadow-md" : "text-slate-400"}`}
                >
                  <BarChart3 size={16} />
                </button>
              )}
              <button 
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-lg transition-all ${viewMode === "map" ? "bg-coral-500 text-white shadow-md" : "text-slate-400"}`}
              >
                <MapIcon size={16} />
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 sm:p-16 space-y-12 flex flex-col items-center justify-center min-h-[500px]">
              <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] bg-coral-500/10 dark:bg-coral-500/20 flex items-center justify-center border border-coral-500/20 shadow-xl overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.2)_0%,transparent_70%)] animate-pulse" />
                  <Database size={48} className="text-coral-600 dark:text-coral-400 relative z-10 animate-float-blob" />
                </div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-2 border-2 border-dashed border-coral-500/20 rounded-[2.5rem]" 
                />
              </div>
              
              <div className="text-center space-y-3 z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-ink dark:text-white tracking-tight">{robotStatus || "正在擷取開放資料..."}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold max-w-sm mx-auto uppercase tracking-widest leading-relaxed">內政部 實價登錄 API 連線中<br/>即時解析開放資料集結構</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl pt-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3 p-6 liquid-glass-panel rounded-3xl border-transparent shadow-none opacity-40">
                    <Skeleton className="h-4 w-2/3 bg-slate-200/50 dark:bg-slate-800/50 rounded-full" />
                    <Skeleton className="h-10 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl" />
                    <Skeleton className="h-4 w-1/2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : viewMode === "aggregated" && typeName === "預售屋" ? (
            <div className="flex-1 min-h-[300px] flex flex-col p-4 sm:p-6 overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader className="sticky top-0 bg-white/40 dark:bg-black/30 backdrop-blur-3xl z-10 border-b border-white/20 dark:border-white/10">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest pl-6">建案名稱/社區</TableHead>
                    <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest px-4">區域</TableHead>
                    <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest text-right px-4">成交件數</TableHead>
                    <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest text-right px-4">平均單價</TableHead>
                    <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest text-right px-4">單價區間</TableHead>
                    <TableHead className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest text-right px-4">總價區間</TableHead>
                  </TableRow>
                </TableHeader>
                <AnimatePresence mode="wait">
                  <motion.tbody
                    key={`aggregated-${search}-${typeName}-${unitPrice.min}-${unitPrice.max}-${period.startY}-${period.startM}-${period.endY}-${period.endM}`}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { 
                        opacity: 1,
                        transition: { staggerChildren: 0.03 }
                      }
                    }}
                    className="[&_tr:last-child]:border-0"
                  >
                    {aggregatedPreSaleData.map((item) => (
                      <motion.tr 
                        key={item.buildCase + item.district}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.4 } }
                        }}
                        className="group hover:bg-white/60 dark:hover:bg-slate-800/60 border-b border-slate-200/50 dark:border-slate-800/50 cursor-pointer"
                        onClick={() => {
                          setSearch(item.buildCase);
                          setViewMode("list");
                        }}
                      >
                        <TableCell className="pl-6 font-bold text-ink/90 dark:text-slate-200 truncate max-w-[200px]">
                          {item.buildCase}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                            {item.district}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-slate-700 dark:text-slate-300 font-mono font-medium">
                          {item.count} 筆
                        </TableCell>
                        <TableCell className="text-right text-coral-600 dark:text-coral-400 font-mono font-bold">
                          {(Math.round(item.avgUnitPrice * 10) / 10).toFixed(1)} 萬/坪
                        </TableCell>
                        <TableCell className="text-right text-slate-500 font-mono text-xs">
                          {(Math.round(item.minUnitPrice * 10) / 10).toFixed(1)} ~ {(Math.round(item.maxUnitPrice * 10) / 10).toFixed(1)} 萬
                        </TableCell>
                        <TableCell className="text-right text-slate-500 font-mono text-xs">
                          {(item.minPrice / 10000).toFixed(0)} ~ {(item.maxPrice / 10000).toFixed(0)} 萬
                        </TableCell>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </AnimatePresence>
              </Table>
            </div>
          ) : viewMode === "list" ? (
            <div className="flex-1 min-h-[300px] flex flex-col">
              {!loading && (priceDistribution.length > 0 || priceTrend.length > 0) && (
                <Suspense
                  fallback={
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mx-4 sm:mx-6 mt-6 mb-2">
                      <Skeleton className="h-[220px] rounded-3xl bg-white/40 dark:bg-slate-900/40" />
                      <Skeleton className="h-[220px] rounded-3xl bg-white/40 dark:bg-slate-900/40" />
                    </div>
                  }
                >
                  <ResultsCharts
                    priceDistribution={priceDistribution}
                    priceTrend={priceTrend}
                    showChartsMobile={showChartsMobile}
                    onToggleCharts={() => setShowChartsMobile(!showChartsMobile)}
                  />
                </Suspense>
              )}
              <div className="w-full flex flex-col min-w-0">
                <div className="px-4 sm:px-6 mb-4 w-full min-w-0">
                  <div className="flex items-center gap-2 relative w-full max-w-full">
                    <button 
                      onClick={() => scrollSort('left')}
                      className="absolute left-0 z-10 w-8 h-full flex items-center justify-center bg-gradient-to-r from-white dark:from-slate-900 to-transparent focus:outline-none"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-500 hover:text-coral-500 transition-colors bg-white/50 dark:bg-slate-900/50 rounded-full shadow-sm" />
                    </button>
                    <div 
                      ref={sortScrollRef}
                      className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap px-8 py-1 scroll-smooth w-full"
                    >
                      <button
                        onClick={() => setSortConfig(null)}
                        className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all border whitespace-nowrap shrink-0 flex items-center gap-1.5 ${!sortConfig ? 'bg-coral-500/10 dark:bg-coral-500/20 text-coral-600 dark:text-coral-400 border-coral-500/30 shadow-sm shadow-coral-500/10' : 'bg-white/60 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-ink/5 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-700'}`}
                      >
                        預設
                      </button>
                      {[
                        { key: "date", label: "日期" },
                        { key: "totalPrice", label: "總價" },
                        { key: "unitPrice", label: "單價" }
                      ].map(opt => {
                        const isSelected = sortConfig?.key === opt.key;
                        const direction = isSelected ? sortConfig.direction : null;
                        return (
                          <button
                            key={opt.key}
                            onClick={() => {
                              if (isSelected) {
                                setSortConfig({ key: opt.key as any, direction: direction === 'desc' ? 'asc' : 'desc' });
                              } else {
                                setSortConfig({ key: opt.key as any, direction: 'desc' });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all border whitespace-nowrap shrink-0 flex items-center gap-1 ${isSelected ? 'bg-coral-500/10 dark:bg-coral-500/20 text-coral-600 dark:text-coral-400 border-coral-500/30 shadow-sm shadow-coral-500/10' : 'bg-white/60 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-ink/5 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-700'}`}
                          >
                            {opt.label}
                            {isSelected ? (
                              direction === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 opacity-40 text-slate-400 dark:text-slate-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <button 
                      onClick={() => scrollSort('right')}
                      className="absolute right-0 z-10 w-8 h-full flex items-center justify-center bg-gradient-to-l from-white dark:from-slate-900 to-transparent focus:outline-none"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-500 hover:text-coral-500 transition-colors bg-white/50 dark:bg-slate-900/50 rounded-full shadow-sm" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 px-4 sm:px-6 pb-2">
                  <AnimatePresence mode="popLayout">
                    {paginatedData.map((item, idx) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                        transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3), ease: [0.23, 1, 0.32, 1] }}
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="group relative bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-ink/5 dark:border-white/10 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden"
                      >
                        {/* Interactive Left Indicator line */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-coral-500/0 group-hover:bg-coral-500 transition-colors duration-300" />
                        
                        <button
                          onClick={(e) => toggleFavorite(item, e)}
                          className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 rounded-full transition-all z-10 ${
                            favorites.some(f => f.id === item.id)
                              ? 'text-red-500 bg-red-500/10'
                              : 'text-slate-300 dark:text-slate-600 hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Heart 
                            size={16} 
                            className={favorites.some(f => f.id === item.id) ? 'fill-current' : ''} 
                            strokeWidth={2.5} 
                          />
                        </button>

                        {/* Content Grid */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-[80px_1fr_minmax(110px,auto)] gap-2 sm:gap-3 items-center pl-1 sm:pl-2">
                          
                          {/* Date Block */}
                          <div className="flex sm:flex-col items-center sm:items-start justify-between border-b sm:border-y-0 border-slate-100 dark:border-slate-800 pb-2 sm:pb-0">
                            <div className="text-xl sm:text-[22px] leading-none font-display font-black text-ink dark:text-white tracking-tighter">
                              {formatDate(item.date).replace(/-/g, '.')}
                            </div>
                          </div>

                          {/* Info Tags & Address */}
                          <div className="flex flex-col justify-center min-w-0 py-0.5">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                               <span className="px-1.5 py-0.5 rounded-[4px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black tracking-widest uppercase border border-slate-200/60 dark:border-slate-700/60 shadow-sm leading-none">
                                 {item.district}
                               </span>
                               <span className="px-1.5 py-0.5 rounded-[4px] bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 text-[9px] font-black tracking-widest uppercase border border-coral-100 dark:border-coral-500/20 shadow-sm leading-none">
                                 {item.buildingType.split("(")[0] || "土地"}
                               </span>
                               <span className="px-1.5 py-0.5 rounded-[4px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black tracking-widest uppercase border border-amber-100 dark:border-amber-500/20 shadow-sm leading-none">
                                 {item.transactionType}
                               </span>
                               {typeName === "預售屋" && item.buildCase && (
                                 <span className="px-1.5 py-0.5 rounded-[4px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black tracking-widest uppercase border border-emerald-100 dark:border-emerald-500/20 shadow-sm leading-none truncate max-w-[150px]">
                                   建案: {item.buildCase}
                                 </span>
                               )}
                            </div>
                            <h3 className="text-[15px] sm:text-[16px] font-bold text-ink dark:text-slate-50 truncate group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors leading-snug">
                              {item.address}
                            </h3>
                            <div className="text-[11px] font-bold mt-1.5 flex flex-wrap items-center gap-1.5">
                              <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-[6px]">
                                <Maximize2 className="w-[10px] h-[10px]" /> <span className="text-[10px] font-bold leading-none">{item.buildingArea} ㎡</span>
                              </span>
                              {item.floor && (
                                <span className="flex items-center gap-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded-[6px]">
                                  <Layers className="w-[10px] h-[10px]" /> <span className="text-[10px] font-bold leading-none">{item.floor}{item.totalFloor ? ` / ${item.totalFloor}` : ''}</span>
                                </span>
                              )}
                              {item.rooms && item.rooms !== '0' && (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <span className="flex items-center gap-1 bg-coral-500/10 text-coral-600 dark:text-coral-400 px-1.5 py-0.5 rounded-[6px]"><Bed className="w-[10px] h-[10px]" /> <span className="text-[10px] font-bold leading-none">{item.rooms}</span></span>
                                    {item.halls && item.halls !== '0' && <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-[6px]"><Sofa className="w-[10px] h-[10px]" /> <span className="text-[10px] font-bold leading-none">{item.halls}</span></span>}
                                    {item.bathrooms && item.bathrooms !== '0' && <span className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-[6px]"><Bath className="w-[10px] h-[10px]" /> <span className="text-[10px] font-bold leading-none">{item.bathrooms}</span></span>}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Price Block */}
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 pl-1 sm:pl-4 sm:pr-8 mt-2 sm:mt-0 relative sm:h-full">
                            <div className="flex flex-col items-start sm:items-end sm:flex-1 sm:justify-start">
                              <div className="text-[11px] font-bold text-slate-400 mb-0.5 sm:mb-1">
                                 {item.unitPrice ? `${(parseFloat(item.unitPrice) * 3.30578 / 10000).toFixed(1)} 萬/坪` : <span className="opacity-0">-</span>}
                              </div>
                              <div className="flex items-baseline gap-1.5">
                                 <span className="text-[11px] font-bold text-slate-400">總價</span>
                                 <span className="text-xl sm:text-2xl leading-none font-display font-black text-red-500 tracking-tighter">
                                   {formatPrice(item.totalPrice)}
                                 </span>
                              </div>
                            </div>
                            <Button 
                               variant="ghost" 
                               size="sm" 
                               className="h-8 px-3 text-xs bg-coral-500/10 text-coral-600 hover:bg-coral-500/20 hover:text-coral-700 dark:bg-coral-900/30 dark:text-coral-400 dark:hover:bg-coral-900/50 flex-shrink-0 sm:self-end self-center rounded-lg font-bold tracking-widest uppercase transition-all group-hover:bg-coral-500 justify-center group-hover:text-white"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setSelectedItem(item);
                               }}
                            >
                               詳情 <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                          </div>

                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {filteredData.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4 px-4 sm:px-6 mb-8">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <span>每頁顯示</span>
                    <select
                      className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-coral-500/50"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span>筆，共 {filteredData.length} 筆</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/60 dark:bg-slate-800/60 disabled:opacity-50"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      上一頁
                    </Button>
                    <div className="flex items-center gap-1 mx-2">
                      <span className="text-sm font-bold text-ink dark:text-white">
                        {currentPage}
                      </span>
                      <span className="text-sm text-slate-400">
                        / {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/60 dark:bg-slate-800/60 disabled:opacity-50"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      下一頁
                    </Button>
                  </div>
                </div>
              )}

              {filteredData.length === 0 && !loading && !error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-32 text-slate-500/50 dark:text-slate-400/50"
                >
                  <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-coral-500/10 to-transparent group-hover:opacity-100 transition-opacity" />
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.1, 1] 
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                    >
                      <Compass className="w-10 h-10 opacity-50 text-coral-600/50 relative z-10" />
                    </motion.div>
                  </div>
                  <p className="font-display font-bold text-xl tracking-tight text-ink/90 dark:text-slate-200">還沒找到藏寶圖？</p>
                  <p className="text-sm mt-2 font-medium opacity-60">嘗試放寬您的篩選條件或更改關鍵字</p>
                </motion.div>
              )}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-24 px-6 text-red-500/80 dark:text-red-400/80"
                >
                  <div className="w-20 h-20 rounded-2xl bg-coral-100/50 dark:bg-coral-500/10 border border-red-500/20 flex items-center justify-center mb-8 shadow-sm">
                    <X className="w-10 h-10 opacity-60" />
                  </div>
                  <p className="text-2xl font-display font-extrabold mb-3 tracking-tight text-red-700 dark:text-red-400">數據連線中斷</p>
                  <p className="text-sm opacity-70 max-w-sm text-center font-medium leading-relaxed mb-10">{error}</p>
                  <Button 
                    variant="outline" 
                    className="rounded-2xl px-12 h-12 liquid-glass-button border-red-500/30 text-red-700 dark:text-red-400 hover:bg-coral-500/5 font-bold shadow-xl shadow-red-500/5 transition-all active:scale-95"
                    onClick={fetchData}
                  >
                    重新初始化掃描
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="p-4 sm:p-6">
                  <Skeleton className="h-[540px] rounded-[2rem] bg-white/40 dark:bg-slate-900/40" />
                </div>
              }
            >
              <ResultsMap
                cityName={cityName}
                district={district}
                filteredData={filteredData}
                formatPrice={formatPrice}
                geocodedCount={geocodedCount}
                isGeocoding={isGeocoding}
                mapLayer={mapLayer}
                onMapLayerChange={setMapLayer}
                onSelectItem={setSelectedItem}
                onToggleFacilities={() => setShowFacilities(!showFacilities)}
                showFacilities={showFacilities}
                totalToGeocode={totalToGeocode}
              />
            </Suspense>
          )}
        </div>

        {/* About & FAQ Section */}
        <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-10 py-8 px-4 sm:px-7 pb-24 mt-4">
          <section className="flex flex-col gap-4" aria-labelledby="search-coverage">
              
              <div className="flex flex-wrap gap-2">
                {FEATURED_QUERY_INTENTS.map((intent) => (
                  <span
                    key={intent}
                    className="inline-flex items-center rounded-full border border-white/60 dark:border-white/10 bg-white/45 dark:bg-slate-900/35 px-3 py-1.5 text-[11px] font-bold tracking-wide text-slate-600 dark:text-slate-300"
                  >
                    {intent}
                  </span>
                ))}
              </div>
               <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-coral-700 dark:text-coral-400">
                  台灣房價查詢
                </span>
                <span className="h-px w-8 bg-coral-500/30" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  實價登錄
                </span>
              </div>

              <div className="flex flex-col gap-2 max-w-4xl">
                <h2 id="search-intent-overview" className="text-lg sm:text-[1.45rem] font-black tracking-tight text-ink dark:text-white">
                  台灣實價登錄查詢與房價地圖
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed font-medium text-slate-600 dark:text-slate-300 max-w-3xl">
                  查詢臺北市、新北市、桃園市、臺中市、臺南市、高雄市與全台各縣市的實價登錄成交紀錄，
                  支援買賣、預售屋與租賃資料，並可依總價、單價、坪數、屋齡與地圖位置快速篩選。
                </p>
              </div>
            <h2 id="search-coverage" className="text-2xl font-black text-ink dark:text-white opacity-90 tracking-tight">
              可查詢的實價登錄範圍
            </h2>
            <div className="grid gap-4 lg:grid-cols-3">
              {[
                {
                  title: "查城市與行政區",
                  body: "支援全台縣市與行政區切換，可快速比較不同生活圈、區域房價與成交紀錄。",
                },
                {
                  title: "查買賣、預售屋、租賃",
                  body: "同一個查詢介面即可切換住宅買賣、預售屋成交與租賃資料，不必分站重找。",
                },
                {
                  title: "查單價、總價與坪數",
                  body: "可依總價、單價、坪數、屋齡與關鍵字做條件過濾，搭配地圖檢視更快找到目標區域。",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/45 dark:bg-slate-900/25 px-5 py-5">
                  <h3 className="text-sm font-black tracking-tight text-ink dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4" aria-labelledby="about-real-estate-search">
            <h2 id="about-real-estate-search" className="text-2xl font-black text-ink dark:text-white opacity-90 tracking-tight">關於實價登錄查詢</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-4xl text-sm sm:text-[15px]">
              實價登錄查詢是一個免費的台灣房地產實價登錄查詢工具，整合內政部實價登錄開放資料，提供買賣、預售屋與租賃成交紀錄的快速搜尋。不需註冊即可查詢各縣市與行政區的總價、單價、坪數、樓層、屋齡與歷史交易資料，並透過地圖模式了解周邊設施與地理位置。
            </p>
          </section>

          <section className="flex flex-col gap-4" aria-labelledby="real-estate-faq">
            <h2 id="real-estate-faq" className="text-2xl font-black text-ink dark:text-white opacity-90 tracking-tight">常見問題 FAQ</h2>
            <div className="flex flex-col gap-3 max-w-4xl">
              <details className="group bg-white/60 dark:bg-slate-800/60 rounded-xl border border-ink/5 dark:border-white/10 overflow-hidden shadow-sm">
                <summary className="list-none [&::-webkit-details-marker]:hidden font-bold text-[15px] text-slate-700 dark:text-slate-200 p-4 sm:px-6 cursor-pointer select-none flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                  這個網站是免費的嗎？
                  <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="p-4 sm:px-6 pt-0 text-sm text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-white/5 mt-2 pt-4 leading-relaxed">
                  是的，這個網站完全免費提供大家查詢使用，旨在提供更友善、直覺的實價登錄查詢體驗。
                </div>
              </details>
              <details className="group bg-white/60 dark:bg-slate-800/60 rounded-xl border border-ink/5 dark:border-white/10 overflow-hidden shadow-sm">
                <summary className="list-none [&::-webkit-details-marker]:hidden font-bold text-[15px] text-slate-700 dark:text-slate-200 p-4 sm:px-6 cursor-pointer select-none flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                  資料來源與更新頻率為何？
                  <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="p-4 sm:px-6 pt-0 text-sm text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-white/5 mt-2 pt-4 leading-relaxed">
                  資料來源為內政部不動產交易實價查詢服務網的開放資料。更新頻率依據官方發布時程，通常為每月 3 次（約每 10 天更新一次）。
                </div>
              </details>
              <details className="group bg-white/60 dark:bg-slate-800/60 rounded-xl border border-ink/5 dark:border-white/10 overflow-hidden shadow-sm">
                <summary className="list-none [&::-webkit-details-marker]:hidden font-bold text-[15px] text-slate-700 dark:text-slate-200 p-4 sm:px-6 cursor-pointer select-none flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                  為什麼地圖上有些物件的定位不準確？
                  <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="p-4 sm:px-6 pt-0 text-sm text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-white/5 mt-2 pt-4 leading-relaxed">
                  由於政府開放資料為了保護隱私，門牌號碼多半有區間遮蔽（例如：中正路1~30號），因此系統無法取得精確座標，這類地址會盡量定位在該路段附近。詳細位置請參考卡片內的門牌資訊。
                </div>
              </details>
            </div>
          </section>
        </div>

        {/* Footer Info */}
        <div className="fixed bottom-0 left-0 right-0 p-3 border-t border-white/20 dark:border-white/10 shrink-0 bg-white/40 dark:bg-black/40 backdrop-blur-xl flex items-center justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 z-50">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-medium">資料來源：內政部實價登錄</span>
            <span className="font-medium">更新頻率：每 10 日</span>
            {dataSource && (
              <Badge variant="outline" className="text-[10px] text-coral-600 dark:text-coral-300 border-coral-200 dark:border-coral-800 bg-white/50 dark:bg-black/50 shadow-sm font-bold">
                官方即時資料
              </Badge>
            )}
            <span className="text-ink/90 dark:text-slate-200 font-bold">當前顯示：{filteredData.length} 筆</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-coral-500"></span>
            </div>
            <span className="hidden sm:inline">系統連線正常</span>
          </div>
        </div>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl w-full p-0 overflow-hidden liquid-glass-panel border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.3)] dark:shadow-[0_32px_128px_rgba(0,0,0,0.6)]">
          {selectedItem && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Premium Dialog Header */}
              <div className="p-7 sm:p-10 bg-white/20 dark:bg-black/30 backdrop-blur-xl relative overflow-hidden shrink-0">
                <div className="absolute inset-0 mesh-gradient opacity-20 dark:opacity-30" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-coral-500/50 to-transparent" />
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Badge className="bg-coral-500/20 text-coral-600 dark:text-coral-300 border-coral-500/30 font-bold tracking-widest text-[10px] uppercase py-0.5 px-3 rounded-full">{selectedItem.district}</Badge>
                       <Badge variant="outline" className="text-slate-500 border-white/10 text-[10px] font-bold px-2 py-0.5 rounded-full">{selectedItem.id}</Badge>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-display font-bold text-ink dark:text-white tracking-tight leading-tight max-w-xl">
                      {selectedItem.address}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold bg-white/30 dark:bg-white/5 px-3 py-1.5 rounded-full border border-white/20 dark:border-white/5">
                        <Calendar size={14} className="text-coral-500" />
                        {formatDate(selectedItem.date)} 交易紀錄
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold bg-white/30 dark:bg-white/5 px-3 py-1.5 rounded-full border border-white/20 dark:border-white/5">
                        <MapPin size={14} className="text-coral-500" />
                        {cityName}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start sm:items-end bg-coral-500/10 dark:bg-coral-500/20 backdrop-blur-3xl p-4 sm:p-6 rounded-3xl border border-coral-500/20 shadow-[0_0_30px_rgba(20,184,166,0.1)]">
                    <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mb-1.5 opacity-70">官方登錄成交價</div>
                    <div className="text-3xl sm:text-5xl font-display font-bold text-coral-600 dark:text-coral-400 tracking-tighter drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                      {formatPrice(selectedItem.totalPrice)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="p-6 sm:p-10 space-y-10">
                  {/* High Density Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { icon: <DollarSign size={20} />, label: "單價/坪", value: selectedItem.unitPrice ? `${(parseFloat(selectedItem.unitPrice) * 3.30578 / 10000).toFixed(1)} 萬` : "-", sub: "實價登錄單價", color: "text-coral-500", bg: "bg-coral-500/5" },
                      { icon: <Maximize2 size={20} />, label: "建物面積", value: `${selectedItem.buildingArea || selectedItem.area || "0"} ㎡`, sub: `約 ${(parseFloat(selectedItem.buildingArea || selectedItem.area || "0") * 0.3025).toFixed(2)} 坪`, color: "text-amber-500", bg: "bg-amber-500/5" },
                      { icon: <Layers size={20} />, label: "移轉層次", value: selectedItem.floor ? `${selectedItem.floor}F` : "土地", sub: `總樓層 ${selectedItem.totalFloor || "-"}F`, color: "text-purple-500", bg: "bg-purple-500/5" },
                      { icon: <Clock size={20} />, label: "屋齡", value: (() => {
                        if (!selectedItem.completionDate) return "新成屋";
                        const compY = parseInt(selectedItem.completionDate.substring(0, 3));
                        if (isNaN(compY)) return "新成屋";
                        const currentY = new Date().getFullYear() - 1911;
                        return `${currentY - compY} 年`;
                      })(), sub: "建屋完工至今", color: "text-amber-500", bg: "bg-amber-500/5" }
                    ].map((stat, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`liquid-glass-input p-5 sm:p-6 rounded-[2rem] border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all`}
                      >
                         <div className={`absolute -right-2 -top-2 p-6 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color} rotate-12`}>{stat.icon}</div>
                         <div className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2">
                           <div className={`w-6 h-6 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
                           {stat.label}
                         </div>
                         <div className="text-2xl font-bold text-ink dark:text-white tracking-tight">{stat.value}</div>
                         {stat.sub && <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-2 opacity-60 tracking-wide">{stat.sub}</div>}
                      </motion.div>
                    ))}
                  </div>

                  {/* Map Preview */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm flex items-center gap-2">
                       <MapIcon size={12} className="text-coral-500" /> 地理位置
                    </h3>
                    <Suspense fallback={<Skeleton className="h-[200px] sm:h-[250px] rounded-[1.5rem] bg-white/40 dark:bg-slate-900/40" />}>
                      <TransactionMapPreview selectedItem={selectedItem} />
                    </Suspense>
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

                    {(selectedItem.buildingType || selectedItem.mainUse || selectedItem.buildCase) ? (
                      <div className="space-y-3 relative">
                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm">建物資訊</h3>
                        <div className="liquid-glass rounded-[1.5rem] overflow-hidden divide-y divide-white/20 dark:divide-white/10 border-white/80 dark:border-white/10">
                          {selectedItem.buildCase && <DetailRow label="建案名稱" value={selectedItem.buildCase} />}
                          <DetailRow label="建物型態" value={selectedItem.buildingType || "無"} />
                          <DetailRow label="移轉層次" value={selectedItem.floor ? `${selectedItem.floor} / ${selectedItem.totalFloor}` : "-"} />
                          <DetailRow label="主要用途" value={selectedItem.mainUse || "-"} />
                          <DetailRow label="主要建材" value={selectedItem.material || "-"} />
                          <DetailRow label="建築完成日" value={formatDate(selectedItem.completionDate)} />
                          <DetailRow label="現況格局" value={
                            (selectedItem.rooms || selectedItem.halls || selectedItem.bathrooms) ? (
                              <div className="flex items-center gap-2">
                                {selectedItem.rooms && selectedItem.rooms !== '0' && <span className="flex items-center gap-1 bg-coral-500/10 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 px-2 py-0.5 rounded-full"><Bed className="w-3.5 h-3.5" /> {selectedItem.rooms} <span className="text-[10px] opacity-70">房</span></span>}
                                {selectedItem.halls && selectedItem.halls !== '0' && <span className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full"><Sofa className="w-3.5 h-3.5" /> {selectedItem.halls} <span className="text-[10px] opacity-70">廳</span></span>}
                                {selectedItem.bathrooms && selectedItem.bathrooms !== '0' && <span className="flex items-center gap-1 bg-blue-500/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full"><Bath className="w-3.5 h-3.5" /> {selectedItem.bathrooms} <span className="text-[10px] opacity-70">衛</span></span>}
                              </div>
                            ) : "-"
                          } />
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

              <div className="p-4 sm:p-6 border-t border-white/10 bg-white/10 dark:bg-black/20 backdrop-blur-3xl flex justify-end">
                <Button 
                  onClick={() => setSelectedItem(null)}
                  variant="outline"
                  className="rounded-2xl px-12 h-12 liquid-glass-button-primary shadow-2xl border-white/20"
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

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 px-5 text-sm hover:bg-coral-500/5 transition-all group">
      <span className="text-slate-500 dark:text-slate-400 font-bold group-hover:text-coral-600 transition-colors uppercase text-[10px] tracking-widest">{label}</span>
      <span className="text-ink dark:text-slate-100 font-bold tracking-tight">{value || "-"}</span>
    </div>
  );
}
