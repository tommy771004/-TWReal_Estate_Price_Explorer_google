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
  Heart,
  Train,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Car,
  Leaf,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPinOff,
  Navigation,
  Settings,
  Download,
  Share2,
  Pin,
  Crosshair,
  Building,
} from "lucide-react";
import { CITIES, TRANSACTION_TYPES, CITY_DISTRICTS } from "./constants";
import { DEFAULT_APP_TEXTS, type AppTexts } from "./constants/texts";
import { LocationSelectionModal } from "./components/LocationSelectionModal";
import { TransactionCard } from "./components/TransactionCard";
import { AffiliateMarquee, AffiliateChips } from "./components/AffiliateMarquee";
import { SiteNav, SiteFooterNav } from "./components/SiteNav";
import { useGeocoding } from "./hooks/useGeocoding";
import { 
  YEARS, 
  MONTHS, 
  getPeriodValue, 
  getPeriodFromValue, 
  formatPrice, 
  formatDate, 
  getLatestThreeMonthsForDistrict,
  getSpecialTags,
  getDefaultPeriod,
  formatPeriodLabel,
  isDefaultPeriod,
  exportTransactionsCsv,
} from "./utils/real-estate-helpers";
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
import {
  parseSelectionFromUrl,
  parseQueryFiltersFromUrl,
  buildShareableUrl,
  DEFAULT_PROPERTY_TYPES,
  type ManagementFilter,
  type ParkingFilter,
} from "./lib/urlState";
import { calculateDistance } from "./lib/utils";
import type { Transaction } from "./types/real-estate";
import { MortgageCalculatorCta } from "./components/AffiliateSlot";
import { CompareBar, MAX_COMPARE } from "./components/CompareBar";
import { PinnedKpiCompare } from "./components/PinnedKpiCompare";
import {
  computeMarketSnapshot,
  formatSnapshotLabel,
  type PinnedMarketSnapshot,
} from "./utils/market-snapshot";

const ResultsCharts = lazy(() => import("./components/ResultsCharts"));
const CommunityTrendChart = lazy(() => import("./components/CommunityTrendChart"));
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
const SEO_CONTENT_UPDATED = __SEO_LAST_MODIFIED__;

const modalContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const modalItemVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export default function App() {
  const initialSelection = parseSelectionFromUrl();
  const initialFilters = parseQueryFiltersFromUrl();
  const [cityName, setCityName] = useState(initialSelection.cityName);
  const [typeName, setTypeName] = useState(initialSelection.typeName);
  const [district, setDistrict] = useState(initialSelection.district);
  const [search, setSearch] = useState(initialFilters.search);
  
  const [propertyTypes, setPropertyTypes] = useState<string[]>(initialFilters.propertyTypes);
  const [period, setPeriod] = useState(initialFilters.period);
  const [unitPrice, setUnitPrice] = useState(initialFilters.unitPrice); // 1:萬元/坪, 2:元/㎡
  const [area, setArea] = useState(initialFilters.area); // 1:㎡, 2:坪
  const [age, setAge] = useState(initialFilters.age);
  const [roomsMin, setRoomsMin] = useState(initialFilters.roomsMin);
  const [hasManagement, setHasManagement] = useState<ManagementFilter>(initialFilters.hasManagement);
  const [parkingFilter, setParkingFilter] = useState<ParkingFilter>(initialFilters.parking);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");
  const [compareList, setCompareList] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem("explorer_compare");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [compareToast, setCompareToast] = useState<string | null>(null);
  /** 附近 N 公里：null = 關閉 */
  const [nearbyKm, setNearbyKm] = useState<number | null>(null);
  /** 附近中心；null 時改用 GPS／IP 定位 */
  const [nearbyAnchor, setNearbyAnchor] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  /** 只看此建案（預售／同建案名） */
  const [focusBuildCase, setFocusBuildCase] = useState<string | null>(null);
  const [pinnedKpis, setPinnedKpis] = useState<PinnedMarketSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem("explorer_pinned_kpis");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('explorer_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('explorer_font_size');
      return (saved as "small" | "medium" | "large") || 'medium';
    }
    return 'medium';
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [appTexts, setAppTexts] = useState<AppTexts>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('explorer_app_texts');
      if (saved) {
        try {
          return { ...DEFAULT_APP_TEXTS, ...JSON.parse(saved) };
        } catch (e) {
          return DEFAULT_APP_TEXTS;
        }
      }
    }
    return DEFAULT_APP_TEXTS;
  });

  const updateAppTexts = (newTexts: Partial<AppTexts>) => {
    setAppTexts(prev => {
      const updated = { ...prev, ...newTexts };
      localStorage.setItem('explorer_app_texts', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    localStorage.setItem('explorer_font_size', fontSize);
    const root = document.documentElement;
    if (fontSize === 'small') {
      root.style.setProperty('--font-scale', '0.875');
    } else if (fontSize === 'medium') {
      root.style.setProperty('--font-scale', '1.0');
    } else if (fontSize === 'large') {
      root.style.setProperty('--font-scale', '1.15');
    }
  }, [fontSize]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('explorer_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('explorer_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    syncSeoMetadata({ cityName, district, typeName });
  }, [cityName, district, typeName]);

  // Reflect city/type/district + filters in the URL so links are shareable.
  // replaceState avoids polluting browser history while typing filters.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextUrl =
      buildShareableUrl(
        { cityName, typeName, district },
        {
          search,
          propertyTypes,
          period,
          unitPrice,
          area,
          age,
          roomsMin,
          hasManagement,
          parking: parkingFilter,
        }
      ) + window.location.hash;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [
    cityName,
    typeName,
    district,
    search,
    propertyTypes,
    period,
    unitPrice,
    area,
    age,
    roomsMin,
    hasManagement,
    parkingFilter,
  ]);

  useEffect(() => {
    try {
      localStorage.setItem("explorer_compare", JSON.stringify(compareList));
    } catch {
      /* ignore quota */
    }
  }, [compareList]);

  useEffect(() => {
    try {
      localStorage.setItem("explorer_pinned_kpis", JSON.stringify(pinnedKpis));
    } catch {
      /* ignore quota */
    }
  }, [pinnedKpis]);

  const toggleCompare = React.useCallback((item: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      if (exists) {
        setCompareToast(null);
        return prev.filter((p) => p.id !== item.id);
      }
      if (prev.length >= MAX_COMPARE) {
        setCompareToast(`最多比較 ${MAX_COMPARE} 筆，請先移除一筆`);
        window.setTimeout(() => setCompareToast(null), 2200);
        return prev;
      }
      setCompareToast(null);
      return [...prev, item];
    });
  }, []);

  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map" | "aggregated">("list");
  const [mapLayer, setMapLayer] = useState<"default" | "satellite" | "landmark">("default");
  const [showFacilities, setShowFacilities] = useState(false);
  const [showChartsMobile, setShowChartsMobile] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [globalFacilities, setGlobalFacilities] = useState<any[]>([]);
  
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

  // === 位置分享與與定位權限 ===
  interface UserLocation {
    latitude: number | null;
    longitude: number | null;
    county: string | null;
    district: string | null;
    location_method: "gps" | "base_station" | "unknown";
  }

  const [userLocation, setUserLocation] = useState<UserLocation>({
    latitude: null,
    longitude: null,
    county: null,
    district: null,
    location_method: "unknown",
  });
  
  const userLocationRef = useRef<UserLocation>({
    latitude: null,
    longitude: null,
    county: null,
    district: null,
    location_method: "unknown",
  });

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  const [showLocationModal, setShowLocationModal] = useState(false);

  // === 意見回饋狀態 ===
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState("系統錯誤");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackContact, setFeedbackContact] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedbackErrorMsg, setFeedbackErrorMsg] = useState("");

  // 根據 GPS 座標在 CITIES 以及 CITY_DISTRICTS 算歐氏距離，選出距離最近的縣市與鄉鎮
  const getClosestTaiwanLocation = React.useCallback((lat: number, lng: number): { county: string; district: string } => {
    let closestCity = CITIES[0]?.name || "臺北市";
    let minCityDist = Infinity;

    for (const city of CITIES) {
      if (city.lat && city.lng) {
        const dist = Math.hypot(lat - city.lat, lng - city.lng);
        if (dist < minCityDist) {
          minCityDist = dist;
          closestCity = city.name;
        }
      }
    }

    const districts = CITY_DISTRICTS[closestCity] || [];
    let closestDistrict = "全部";
    if (districts.length > 0) {
      let minDist = Infinity;
      for (const dist of districts) {
        if (dist.lat && dist.lng) {
          const d = Math.hypot(lat - dist.lat, lng - dist.lng);
          if (d < minDist) {
            minDist = d;
            closestDistrict = dist.name;
          }
        }
      }
    }

    return { county: closestCity, district: closestDistrict };
  }, []);

  const triggerBaseStationLocation = React.useCallback(async () => {
    // 1. First attempt: IP-API (highly CORS-friendly and less rate-limited)
    try {
      const res = await fetch("https://ip-api.com/json/");
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && data.lat !== undefined && data.lon !== undefined) {
          const lat = Number(data.lat);
          const lng = Number(data.lon);
          const resolved = getClosestTaiwanLocation(lat, lng);
          const loc: UserLocation = {
            latitude: lat,
            longitude: lng,
            county: resolved.county,
            district: resolved.district,
            location_method: "base_station",
          };
          setUserLocation(loc);
          if (resolved.county) {
            setCityName(resolved.county);
            setDistrict(resolved.district || "全部");
          }
          return loc;
        }
      }
    } catch (e) {
      console.warn("ip-api.com location tracking failed, trying fallback:", e);
    }

    // 2. Second attempt: ipapi.co fallback (might have CORS or rate-limiting)
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const lat = Number(data.latitude);
          const lng = Number(data.longitude);
          const resolved = getClosestTaiwanLocation(lat, lng);
          const loc: UserLocation = {
            latitude: lat,
            longitude: lng,
            county: resolved.county,
            district: resolved.district,
            location_method: "base_station",
          };
          setUserLocation(loc);
          if (resolved.county) {
            setCityName(resolved.county);
            setDistrict(resolved.district || "全部");
          }
          return loc;
        }
      }
    } catch (error) {
      console.warn("Base station fallback failed, estimating Taipei:", error);
    }

    const defaultCity = CITIES[0] || { name: "臺北市", lat: 25.0330, lng: 121.5654 };
    const defaultCityDistricts = CITY_DISTRICTS[defaultCity.name] || [];
    const defaultDistrict = defaultCityDistricts[0]?.name || "全部";

    const defaultLoc: UserLocation = {
      latitude: defaultCity.lat || 25.0330,
      longitude: defaultCity.lng || 121.5654,
      county: defaultCity.name,
      district: defaultDistrict,
      location_method: "unknown",
    };
    setUserLocation(defaultLoc);

    setCityName(defaultCity.name);
    setDistrict(defaultDistrict);
    return defaultLoc;
  }, [getClosestTaiwanLocation]);

  const triggerGpsLocation = React.useCallback(async () => {
    if (!navigator.geolocation) {
      return await triggerBaseStationLocation();
    }
    return new Promise<UserLocation>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const resolved = getClosestTaiwanLocation(lat, lng);
          const loc: UserLocation = {
            latitude: lat,
            longitude: lng,
            county: resolved.county,
            district: resolved.district,
            location_method: "gps",
          };
          setUserLocation(loc);
          localStorage.setItem("location_sharing_permisson_decision", "allow");
          
          if (resolved.county) {
            setCityName(resolved.county);
            setDistrict(resolved.district || "全部");
          }
          resolve(loc);
        },
        async (error) => {
          console.warn("GPS Geolocation failed, using base station:", error);
          const loc = await triggerBaseStationLocation();
          resolve(loc);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    });
  }, [getClosestTaiwanLocation, triggerBaseStationLocation]);

  const addAuditLog = React.useCallback(async (actionType: string, details?: string, overrideLoc?: UserLocation) => {
    const loc = overrideLoc || userLocationRef.current;
    try {
      await fetch("/api/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_type: actionType,
          details: details || "",
          latitude: loc.latitude,
          longitude: loc.longitude,
          county: loc.county,
          district: loc.district,
          location_method: loc.location_method,
        }),
      });
    } catch (error) {
      console.error("AuditLog upload error:", error);
    }
  }, []);

  // Esc key closes feedback pop-card
  useEffect(() => {
    const handleFeedbackKeys = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowFeedback(false);
      }
    };
    window.addEventListener("keydown", handleFeedbackKeys);
    return () => window.removeEventListener("keydown", handleFeedbackKeys);
  }, []);


  // Recent keyword searches (last 5), persisted to localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('explorer_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const addRecentSearch = (query: string) => {
    const q = query.trim();
    if (!q) return;
    setRecentSearches(prev => {
      const updated = [q, ...prev.filter(item => item !== q)].slice(0, 5);
      localStorage.setItem('explorer_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('explorer_recent_searches');
  };

  const [trendingSearches, setTrendingSearches] = useState<{ query: string; count: number; type: "city" | "district" | "keyword" }[]>([]);

  const fetchTrendingSearches = React.useCallback(async () => {
    try {
      const res = await fetch("/api/trending-searches");
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setTrendingSearches(result.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch trending searches:", error);
    }
  }, []);

  const toggleFavorite = (item: Transaction, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const isFav = favorites.some(f => f.id === item.id);
    addAuditLog("toggle_favorite", JSON.stringify({
      id: item.id,
      address: item.address,
      action: isFav ? "remove" : "add"
    }));
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
  
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [robotStatus, setRobotStatus] = useState("");
  const [selectedItem, setSelectedItem] = useState<Transaction | null>(null);
  const [detailShowTopMask, setDetailShowTopMask] = useState(false);
  const [detailShowBottomMask, setDetailShowBottomMask] = useState(true);

  // Reset detail scroll masks when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setDetailShowTopMask(false);
      setDetailShowBottomMask(true);
    }
  }, [selectedItem]);
  const [trendDistrict, setTrendDistrict] = useState<string | null>(null);
  const [buildingImages, setBuildingImages] = useState<string[]>([]);
  const [isBuildingImagesLoading, setIsBuildingImagesLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = React.useRef(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const imageSliderRef = React.useRef<HTMLDivElement>(null);
  const robotTimeoutsRef = React.useRef<NodeJS.Timeout[]>([]);
  const sortScrollRef = React.useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const scrollSort = (direction: 'left' | 'right') => {
    if (sortScrollRef.current) {
      const scrollAmount = 200;
      sortScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const [dataSource, setDataSource] = useState<string | null>(null);

  const fetchData = React.useCallback(async (
    keywordOverride?: string,
    cityOverride?: string,
    districtOverride?: string
  ) => {
    if (isFetchingRef.current) return;

    // keywordOverride lets callers (e.g. Recent Searches) run a query without
    // waiting for setSearch to flush. Guard with typeof so passing fetchData
    // directly as an event handler (event arg) falls back to current search.
    const activeKeyword = typeof keywordOverride === "string" ? keywordOverride : search;
    const activeCity = cityOverride || cityName;
    const activeDistrict = districtOverride || district;

    if (typeof keywordOverride === "string" && keywordOverride !== search) {
      setSearch(keywordOverride);
    }
    
    // Sync React states if overridden via location or direct triggers
    if (cityOverride) {
      setCityName(cityOverride);
    }
    if (districtOverride) {
      setDistrict(districtOverride);
    }

    addRecentSearch(activeKeyword);
    addAuditLog("search_properties", JSON.stringify({
      cityName: activeCity,
      district: activeDistrict,
      propertyTypes,
      keyword: activeKeyword,
      period,
      unitPrice,
      area,
      age
    }));

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    setDataSource(null);
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
      const cityCode = CITIES.find(c => c.name === activeCity)?.code || "A";
      const typeCode = TRANSACTION_TYPES.find(t => t.name === typeName)?.code || "A";
      
      const response = await fetch(`/api/proxy-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          cityCode,
          district: activeDistrict,
          propertyTypes,
          transactionType: typeCode,
          period,
          unitPrice,
          area,
          age,
          keyword: activeKeyword
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
        const textBody = await response.text().catch(() => "");
        console.error("Non-JSON response text:", textBody.substring(0, 500));
        if (textBody.includes("Starting Server...")) {
          throw new Error("伺服器正在啟動中，請等待幾秒鐘後再重新嘗試查詢。");
        }
        throw new Error("伺服器傳回非預期的資料格式，請稍後再重試。");
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
      fetchTrendingSearches();
    }
  }, [cityName, typeName, district, propertyTypes, period, unitPrice, area, age, search, fetchTrendingSearches]);


  const handleTrendingClick = React.useCallback((item: { query: string; type: "city" | "district" | "keyword" }) => {
    setShowSuggestions(false);
    addAuditLog("click_trending_search", JSON.stringify(item));
    if (item.type === "keyword") {
      setSearch(item.query);
      fetchData(item.query);
    } else if (item.type === "district") {
      const parts = item.query.split(" ");
      if (parts.length === 2) {
        setCityName(parts[0]);
        setDistrict(parts[1]);
        setSearch("");
        setTimeout(() => {
          fetchData("");
        }, 50);
      } else {
        setSearch(item.query);
        fetchData(item.query);
      }
    } else {
      setCityName(item.query);
      setDistrict("全部");
      setSearch("");
      setTimeout(() => {
        fetchData("");
      }, 50);
    }
  }, [fetchData]);


  useEffect(() => {
    // Automatically trigger data loading on mounting to display valid records instantly
    // and support query state setups passed via shared links
    const initLocationAndFetch = async () => {
      const decision = localStorage.getItem("location_sharing_permisson_decision");
      let activeLoc: UserLocation;
      if (decision === "allow") {
        activeLoc = await triggerGpsLocation();
      } else if (decision === "deny") {
        activeLoc = await triggerBaseStationLocation();
      } else {
        setShowLocationModal(true);
        // Default to base station silently first
        activeLoc = await triggerBaseStationLocation();
      }
      
      // Load initial search data based on dynamic geographical location and trending searches
      fetchData("", activeLoc.county || undefined, activeLoc.district || undefined);
      fetchTrendingSearches();
      
      // Submit audit log for initial entry
      addAuditLog("app_mount", "User opened price explorer", activeLoc);
    };

    initLocationAndFetch();

    return () => {
      abortControllerRef.current?.abort();
      isFetchingRef.current = false;
    };
  }, [triggerGpsLocation, triggerBaseStationLocation, fetchTrendingSearches, addAuditLog]);

  // Smoothly scroll to the results block when changing page numbers
  useEffect(() => {
    if (currentPage > 1 && resultsContainerRef.current) {
      resultsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

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
        const areaVal = parseFloat(item.buildingArea) || 0;
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

      // Rooms (minimum)
      let matchesRooms = true;
      if (roomsMin !== "") {
        const minRooms = parseInt(roomsMin, 10);
        const itemRooms = parseInt(item.rooms || "0", 10);
        if (!Number.isNaN(minRooms) && (Number.isNaN(itemRooms) || itemRooms < minRooms)) {
          matchesRooms = false;
        }
      }

      // Management organization
      let matchesManagement = true;
      if (hasManagement === "yes") {
        const v = (item.hasManagement || "").trim();
        matchesManagement = v === "有" || v.toLowerCase() === "y" || v === "是";
      } else if (hasManagement === "no") {
        const v = (item.hasManagement || "").trim();
        matchesManagement = v === "無" || v.toLowerCase() === "n" || v === "否" || v === "";
      }

      // Parking
      let matchesParking = true;
      if (parkingFilter === "with") {
        const hasPark =
          Boolean(item.parkingType && item.parkingType.trim()) ||
          (parseFloat(item.parkingPrice || "0") > 0) ||
          item.transactionType.includes("車位");
        matchesParking = hasPark;
      } else if (parkingFilter === "without") {
        const hasPark =
          Boolean(item.parkingType && item.parkingType.trim()) ||
          (parseFloat(item.parkingPrice || "0") > 0) ||
          item.transactionType.includes("車位");
        matchesParking = !hasPark;
      }

      // Focus build case
      let matchesFocus = true;
      if (focusBuildCase) {
        matchesFocus = Boolean(item.buildCase && item.buildCase === focusBuildCase);
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
        matchesFocus
      );
    });

    // 附近 N 公里（需座標；中心優先 nearbyAnchor，否則使用者定位）
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
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle numeric sorting for price and area
        if (["totalPrice", "unitPrice", "buildingArea", "area"].includes(sortConfig.key)) {
          const aNum = parseFloat(aValue as string) || 0;
          const bNum = parseFloat(bValue as string) || 0;
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        // Distance sort when nearby mode is on
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

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    } else if (nearbyKm != null) {
      // 開啟附近模式時預設由近到遠
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
    cityName,
    roomsMin,
    hasManagement,
    parkingFilter,
    focusBuildCase,
    nearbyKm,
    nearbyAnchor,
    userLocation.latitude,
    userLocation.longitude,
  ]);

  const districtAveragePrices = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    data.forEach(item => {
      if (!item.district || !item.unitPrice) return;
      const price = parseFloat(item.unitPrice);
      if (isNaN(price) || price <= 0) return;
      const key = `${item.district}`;
      if (!map[key]) {
        map[key] = { total: 0, count: 0 };
      }
      map[key].total += price;
      map[key].count += 1;
    });

    const averages: Record<string, number> = {};
    Object.keys(map).forEach(dist => {
      if (map[dist].count > 0) {
        averages[dist] = map[dist].total / map[dist].count;
      }
    });
    return averages;
  }, [data]);

  const historyCounts = useMemo(() => {
    const buildCaseMap: Record<string, number> = {};
    const addressMap: Record<string, number> = {};

    data.forEach(item => {
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortConfig, district, propertyTypes, period, unitPrice, area, age, cityName]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const communityItems = useMemo(() => {
    if (!selectedItem) return [];
    
    let matched = [];
    if (selectedItem.buildCase) {
      matched = data.filter(item => item.buildCase === selectedItem.buildCase && item.id !== selectedItem.id);
    } else {
      const baseAddressMatch = selectedItem.address.match(/(.+?[路街道巷弄號])/);
      if (baseAddressMatch && baseAddressMatch[1].length >= 3) {
        const baseAddr = baseAddressMatch[1];
        matched = data.filter(item => 
          item.district === selectedItem.district &&
          item.address.startsWith(baseAddr) && 
          item.id !== selectedItem.id &&
          item.buildingType === selectedItem.buildingType
        );
      }
    }

    return matched.sort((a, b) => {
      const aDate = parseInt(a.date.replace(/[^0-9]/g, "")) || 0;
      const bDate = parseInt(b.date.replace(/[^0-9]/g, "")) || 0;
      return bDate - aDate;
    }).slice(0, 20); // show up to 20 recent records
  }, [selectedItem, data]);

  const communityChartData = useMemo(() => {
    if (!selectedItem || communityItems.length === 0) return [];
    const allItems = [...communityItems, selectedItem].sort((a, b) => {
      const aDate = parseInt(a.date.replace(/[^0-9]/g, "")) || 0;
      const bDate = parseInt(b.date.replace(/[^0-9]/g, "")) || 0;
      return aDate - bDate; // Ascending for chart (Left to right: old to new)
    });

    return allItems.map(item => {
       let unitPrice = 0;
       const houseTotal = parseFloat(item.totalPrice) - parseFloat(item.parkingPrice || "0");
       const houseArea = parseFloat(item.buildingArea) - parseFloat(item.parkingArea || "0");
       if (houseTotal > 0 && houseArea > 0) {
          unitPrice = (houseTotal / houseArea) * 3.30578 / 10000;
       } else if (item.unitPrice && parseFloat(item.unitPrice) > 0) {
          unitPrice = (parseFloat(item.unitPrice) * 3.30578 / 10000);
       }
       return {
          date: item.date ? `${item.date.substring(0, item.date.length - 4)}/${item.date.substring(item.date.length - 4, item.date.length - 2)}` : '-', // format YY/MM
          unitPrice: parseFloat(unitPrice.toFixed(1)),
          isCurrent: item.id === selectedItem.id,
          address: item.address,
          floor: item.floor || '-',
          totalPrice: parseFloat(item.totalPrice),
       }
    }).filter(d => d.unitPrice > 0);
  }, [communityItems, selectedItem]);

  useEffect(() => {
    if (!selectedItem) {
      setBuildingImages([]);
      return;
    }
    
    let query = "";
    if (selectedItem.buildCase) {
      query = selectedItem.buildCase;
    } else {
      const cleanedAddress = selectedItem.address.replace(/[0-9]+(之|~|-)*[0-9]*號.*/, '');
      if (cleanedAddress.length >= 3) {
        query = `${cityName}${selectedItem.district}${cleanedAddress}`;
      } else {
        query = `${cityName}${selectedItem.district}${selectedItem.address}`;
      }
    }

    const fetchImages = async () => {
      setIsBuildingImagesLoading(false);
      setBuildingImages([]); // Disabled hallucinated wikimedia logic
    };

    fetchImages();
  }, [selectedItem, cityName]);

  useEffect(() => {
    if (!buildingImages.length) return;
    const interval = setInterval(() => {
      if (imageSliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = imageSliderRef.current;
        let nextScroll = scrollLeft + clientWidth * 0.8;
        if (nextScroll + clientWidth >= scrollWidth + 10) {
          nextScroll = 0; // wrap around
        }
        imageSliderRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' });
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [buildingImages]);

  useEffect(() => {
    // Only fetch facilities when district changes, using filteredData to roughly bounce
    const validItems = filteredData.slice(0, 50).filter(i => {
      const lat = typeof i.lat === 'string' ? parseFloat(i.lat) : i.lat;
      const lng = typeof i.lng === 'string' ? parseFloat(i.lng) : i.lng;
      return lat && lng && lat !== 0;
    });
    
    if (validItems.length === 0) return;
    
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    validItems.forEach(i => {
      const lat = typeof i.lat === 'string' ? parseFloat(i.lat) : parseFloat(i.lat as any);
      const lng = typeof i.lng === 'string' ? parseFloat(i.lng) : parseFloat(i.lng as any);
      if(lat < minLat) minLat = lat;
      if(lat > maxLat) maxLat = lat;
      if(lng < minLng) minLng = lng;
      if(lng > maxLng) maxLng = lng;
    });
    
    // Add margin (~5km)
    minLat -= 0.05;
    maxLat += 0.05;
    minLng -= 0.05;
    maxLng += 0.05;
    
    const fetchFac = async () => {
      const query = `
          [out:json][timeout:15];
          (
            node["amenity"="school"](${minLat},${minLng},${maxLat},${maxLng});
            node["station"="subway"](${minLat},${minLng},${maxLat},${maxLng});
            node["public_transport"="station"](${minLat},${minLng},${maxLat},${maxLng});
          );
          out center;
      `;
      try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await response.json();
        setGlobalFacilities(data.elements || []);
      } catch (err) {
        console.warn("Could not fetch facilities", err);
      }
    };
    
    // fetchFac(); // Optional: temporarily left commented to prevent IP bans if this triggers too heavily.
    // Uncomment when you have a dedicated backend proxy to cache the overpass data perfectly.
    // Currently disabled to guarantee stable preview performance.
  }, [cityName, district, filteredData.length]);

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

  // Custom Geocoding Hook to handle async Nominatim mappings & Thread-safe OSM cache
  const { isGeocoding, geocodedCount, totalToGeocode } = useGeocoding({
    cityName,
    filteredData,
    data,
    setData,
    selectedItem,
    setSelectedItem,
    search,
    district,
  });

  const handleSort = (key: keyof Transaction) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const marketSnapshot = useMemo(() => computeMarketSnapshot(filteredData), [filteredData]);

  const marketKpis = [
    {
      label: "成交筆數",
      value: marketSnapshot.count ? marketSnapshot.count.toLocaleString() : "0",
      helper: `${cityName}${district !== "全部" ? ` ${district}` : ""} · ${marketSnapshot.sampleHint}`,
      icon: Database,
    },
    {
      label: "中位單價",
      value: marketSnapshot.medianUnitPrice != null ? marketSnapshot.medianUnitPrice.toFixed(1) : "--",
      helper: marketSnapshot.avgUnitPrice != null
        ? `平均 ${marketSnapshot.avgUnitPrice.toFixed(1)} 萬/坪`
        : "萬/坪",
      icon: TrendingUp,
    },
    {
      label: "中位總價",
      value: marketSnapshot.medianTotalPrice != null ? marketSnapshot.medianTotalPrice.toFixed(0) : "--",
      helper: marketSnapshot.avgTotalPrice != null
        ? `平均 ${marketSnapshot.avgTotalPrice.toFixed(0)} 萬`
        : "萬元",
      icon: DollarSign,
    },
    {
      label: "最新登錄",
      value: marketSnapshot.latestDate,
      helper: marketSnapshot.topDistrict,
      icon: Calendar,
    },
  ];

  const pinCurrentMarket = React.useCallback(() => {
    const label = formatSnapshotLabel(cityName, district, typeName);
    const id = `${cityName}|${district}|${typeName}|${period.startY}${period.startM}-${period.endY}${period.endM}`;
    const pin: PinnedMarketSnapshot = {
      ...marketSnapshot,
      id,
      label,
      cityName,
      district,
      typeName,
      pinnedAt: Date.now(),
    };
    setPinnedKpis((prev) => {
      const withoutDup = prev.filter((p) => p.id !== id);
      const next = [pin, ...withoutDup].slice(0, 2);
      return next;
    });
    addAuditLog("pin_market_kpi", label);
  }, [cityName, district, typeName, period, marketSnapshot, addAuditLog]);

  const setNearbyFromItem = React.useCallback((item: Transaction) => {
    const lat = typeof item.lat === "string" ? parseFloat(item.lat) : item.lat;
    const lng = typeof item.lng === "string" ? parseFloat(item.lng) : item.lng;
    if (!lat || !lng || lat === 0) {
      setCompareToast("此筆尚無可用座標，請先開啟地圖等待定位或改用 GPS");
      window.setTimeout(() => setCompareToast(null), 2400);
      return;
    }
    setNearbyAnchor({ lat, lng, label: item.address });
    setNearbyKm((prev) => prev ?? 1);
    setViewMode("list");
  }, []);

  const copyShareLink = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    const url = buildShareableUrl(
      { cityName, typeName, district },
      {
        search,
        propertyTypes,
        period,
        unitPrice,
        area,
        age,
        roomsMin,
        hasManagement,
        parking: parkingFilter,
      },
      window.location.origin
    );
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      addAuditLog("share_link", url);
    } catch {
      try {
        // Fallback for older browsers / insecure contexts
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setShareStatus("copied");
      } catch {
        setShareStatus("error");
      }
    }
    window.setTimeout(() => setShareStatus("idle"), 2000);
  }, [
    cityName,
    typeName,
    district,
    search,
    propertyTypes,
    period,
    unitPrice,
    area,
    age,
    roomsMin,
    hasManagement,
    parkingFilter,
    addAuditLog,
  ]);

  const handleExportCsv = React.useCallback(() => {
    if (filteredData.length === 0) return;
    exportTransactionsCsv(filteredData, typeName, `${cityName}-${district}`);
    addAuditLog("export_csv", JSON.stringify({ count: filteredData.length, cityName, district, typeName }));
  }, [filteredData, typeName, cityName, district, addAuditLog]);

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col font-sans selection:bg-coral-500/30 bg-transparent  text-ink dark:text-slate-100 pb-20 overflow-x-hidden">
      <AnimatePresence>
        {isLocationModalOpen && (
          <LocationSelectionModal
            isOpen={isLocationModalOpen}
            onClose={() => setIsLocationModalOpen(false)}
            cityName={cityName}
            setCityName={setCityName}
            district={district}
            setDistrict={setDistrict}
          />
        )}
      </AnimatePresence>
      {/* Clean architectural grid */}
      <div className="immersive-bg opacity-100" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-coral-50/70 via-white/30 to-transparent dark:from-slate-900/70 dark:via-slate-950/20" />
        <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-slate-100/70 via-white/20 to-transparent dark:from-slate-950/80 dark:via-slate-950/20" />
      </div>
      
      {/* Main Container - Elegant Structure */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full flex-1 flex flex-col z-10"
      >
        <SiteNav onSettingsClick={() => setIsSettingsModalOpen(true)} settingsTitle={appTexts.settingsTitle} />
        {/* Header */}
        <div className="px-4 sm:px-6 pt-6 pb-2 shrink-0 relative z-20">
          <div className="max-w-[1600px] mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 sm:px-6 rounded-[2rem] relative z-10 group transition-all">
            <div className="absolute inset-0 bg-transparent rounded-[2rem] pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-coral-500/10 dark:bg-coral-500/15 flex items-center justify-center border border-coral-500/10">
                  <Database className="text-coral-600 dark:text-coral-400 w-6 h-6" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-3xl font-display font-black tracking-tighter text-ink dark:text-white leading-none whitespace-nowrap">
                    實價登錄查詢
                  </h1>
                  <div className="flex items-center gap-1.5 relative">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFavorites(!showFavorites)}
                      className={`w-8 h-8 rounded-full transition-all shadow-sm relative ${showFavorites ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 hover:bg-red-500/10 text-slate-600 dark:text-slate-400 hover:text-red-500'}`}
                      title="我的最愛"
                      aria-label="我的最愛"
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
                      aria-label="重新整理資料"
                    >
                      <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const nextMode = !darkMode;
                        setDarkMode(nextMode);
                        addAuditLog("toggle_dark_mode", nextMode ? "dark" : "light");
                      }}
                      className="w-8 h-8 rounded-full bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-slate-400 transition-all shadow-sm"
                      title={darkMode ? "切換至淺色模式" : "切換至深色模式"}
                      aria-label={darkMode ? "切換至淺色模式" : "切換至深色模式"}
                    >
                      {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowFeedback(!showFeedback);
                        addAuditLog("feedback_button_click", !showFeedback ? "open" : "close");
                      }}
                      className={`w-8 h-8 rounded-full shadow-sm transition-all flex items-center justify-center ${
                        showFeedback 
                          ? "bg-coral-500 text-white hover:bg-coral-600" 
                          : "bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-slate-400"
                      }`}
                      title="意見回饋"
                      aria-label="意見回饋"
                      id="feedback_floating_trigger"
                    >
                      <MessageSquare size={14} />
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
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-3 px-1 pt-1 pb-2">
            {/* 標題 + 徽章：滿寬單欄，避免雙欄左側大片空白 */}
            <section aria-labelledby="search-summary-heading" className="flex flex-col gap-2.5">
              <div className="min-w-0 flex flex-col gap-2">
                <h2 id="search-summary-heading" className="text-2xl sm:text-[1.75rem] font-display font-black tracking-tight text-ink dark:text-white leading-tight">
                  {cityName}{district !== "全部" ? ` · ${district}` : ""}{typeName ? ` ${typeName}` : ""}成交行情
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-coral-400/40 bg-coral-500/10 px-3 py-1.5 text-[12px] font-bold text-coral-700 dark:text-coral-300">
                    <Database size={13} /> 共 {filteredData.length.toLocaleString()} 筆成交
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 dark:border-white/10 bg-white/45 dark:bg-slate-900/35 px-3 py-1.5 text-[12px] font-bold text-slate-600 dark:text-slate-300">
                    <ShieldCheck size={13} className="text-emerald-500" /> 內政部開放資料
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 dark:border-white/10 bg-white/45 dark:bg-slate-900/35 px-3 py-1.5 text-[12px] font-bold text-slate-600 dark:text-slate-300">
                    <Clock size={13} className="text-coral-500" /> 每 10 日更新
                  </span>
                  {dataSource && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold ${
                        dataSource === "cache"
                          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-sky-400/40 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                      }`}
                      title="同一縣市＋交易型態 6 小時內重用後端快取"
                    >
                      <Zap size={13} />
                      {dataSource === "cache" ? "快取命中" : "即時下載"}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* 市場摘要：滿寬小卡片，同一列自適應 */}
            <section aria-labelledby="market-summary" className="flex flex-col gap-2.5">
              <div className="rounded-2xl border border-white/70 bg-white/70 p-3 sm:p-3.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 id="market-summary" className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      市場摘要
                    </h3>
                    <p className="mt-0.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      依目前條件即時計算
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={pinCurrentMarket}
                      disabled={marketSnapshot.count === 0}
                      title="釘選此區 KPI，可與另一區對照"
                      className="inline-flex items-center gap-1 rounded-full border border-coral-300/50 bg-coral-500/10 px-2.5 py-1 text-[10px] font-black text-coral-700 transition hover:bg-coral-500/15 disabled:opacity-40 dark:text-coral-300"
                    >
                      <Pin size={11} /> 釘選比價
                    </button>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                      <ShieldCheck size={12} /> Open Data
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {marketKpis.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="min-w-0 rounded-xl border border-slate-200/70 bg-white/80 px-2.5 py-2 dark:border-slate-800/80 dark:bg-slate-950/30"
                      >
                        <div className="mb-1 flex items-center justify-between gap-1">
                          <span className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                            {item.label}
                          </span>
                          <Icon size={12} className="shrink-0 text-coral-500" />
                        </div>
                        <div className="truncate text-lg font-black tracking-tight text-ink dark:text-white sm:text-xl">
                          {item.value}
                        </div>
                        <div className="mt-0.5 truncate text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {item.helper}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <h3 id="featured-cities" className="mr-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  熱門查詢城市
                </h3>
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

          {/* 手機也看得到釘選比價（桌面在右側 rail） */}
          {pinnedKpis.length > 0 && (
            <div className="max-w-[1600px] mx-auto w-full px-1 pb-3 lg:hidden">
              <PinnedKpiCompare
                pins={pinnedKpis}
                onUnpin={(id) => setPinnedKpis((prev) => prev.filter((p) => p.id !== id))}
                onClear={() => setPinnedKpis([])}
              />
            </div>
          )}

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
                initial={{ height: 0, opacity: 0, scale: 0.985, y: -8 }}
                animate={{ height: "auto", opacity: 1, scale: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, scale: 0.985, y: -8 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // smooth ease-out (like Apple)
                className="max-w-[1600px] mx-auto w-full z-10 overflow-hidden"
              >
                <motion.div 
                  layout="position"
                  animate={{
                    borderColor: loading ? "rgba(237, 111, 92, 0.45)" : "rgba(255, 255, 255, 0.15)",
                    boxShadow: loading 
                      ? "0 0 25px 6px rgba(237, 111, 92, 0.22), 0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
                      : "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  transition={{ duration: 0.4 }}
                  className="relative overflow-hidden flex flex-col gap-2 sm:gap-4 liquid-glass-panel p-3 sm:px-6 sm:py-4 rounded-[2rem] shadow-2xl mx-1 mb-2 sm:mb-4 mt-1 sm:mt-0"
                >
                  {/* Subtle running loading animation bar inside the filter panel header */}
                  <AnimatePresence>
                    {loading && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 2 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="absolute top-0 left-0 right-0 w-full bg-gradient-to-r from-transparent via-coral-400 to-transparent overflow-hidden"
                      >
                        <motion.div 
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
                          className="w-1/2 h-full bg-gradient-to-r from-coral-300 to-coral-500"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
            
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
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest leading-none mt-0.5">選擇區域</span>
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
                  placeholder={appTexts.searchPlaceholder} 
                  className="w-full pl-11 liquid-glass-input h-[52px] rounded-[1rem] outline-none text-sm font-bold placeholder:text-slate-400 shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                
                {/* Autocomplete Dropdown: typed suggestions, or Recent Searches & Trending Searches when empty */}
                <AnimatePresence>
                  {showSuggestions && (addressSuggestions.length > 0 || recentSearches.length > 0 || trendingSearches.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-xl shadow-lg overflow-hidden py-3 z-50 max-h-[460px] overflow-y-auto"
                    >
                      {addressSuggestions.length > 0 ? (
                        addressSuggestions.map(suggestion => (
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
                        ))
                      ) : (
                        <div className="flex flex-col gap-4">
                          {/* Recent Searches Block */}
                          {recentSearches.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between px-4 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800/80">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">
                                  <Clock className="w-3 h-3" /> 最近搜尋
                                </span>
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={clearRecentSearches}
                                  className="text-[10px] font-bold text-slate-400 hover:text-coral-500 transition-colors"
                                >
                                  清除
                                </button>
                              </div>
                              <div className="flex flex-col">
                                {recentSearches.map(query => (
                                  <div
                                    key={query}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-coral-500/5 hover:text-coral-600 dark:hover:text-coral-400 cursor-pointer transition-colors"
                                    onClick={() => {
                                      setShowSuggestions(false);
                                      fetchData(query);
                                    }}
                                  >
                                    <Clock className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                    <span className="truncate">{query}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Trending Searches Block */}
                          {trendingSearches.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between px-4 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">
                                  <TrendingUp className="w-3 h-3 text-coral-500" /> 熱門搜尋 (Trending)
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 px-4">
                                {trendingSearches.map((item, idx) => (
                                  <div
                                    key={item.query}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="flex items-center justify-between px-3 py-2 text-[12px] font-bold text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-coral-500/10 hover:text-coral-600 dark:bg-slate-850 dark:hover:bg-coral-500/10 dark:hover:text-coral-400 cursor-pointer border border-slate-100/80 dark:border-slate-800/60 rounded-xl transition-all duration-200 shadow-sm"
                                    onClick={() => handleTrendingClick(item)}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className={`flex items-center justify-center w-4-5 h-4-5 rounded-md text-[10px] font-black shrink-0 ${
                                        idx < 3 
                                          ? "bg-coral-500 text-white shadow-sm" 
                                          : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                      }`} style={{ width: "18px", height: "18px" }}>
                                        {idx + 1}
                                      </span>
                                      <span className="truncate pr-1">{item.query}</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 scale-90 origin-right shrink-0">
                                      {item.count}次
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tags Row: Type & Property Types + Search Actions (right-aligned) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end sm:justify-between">

              {/* Left: filter selectors */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center min-w-0">

              <div className="flex flex-col gap-1.5">
                
                <div className="flex bg-white/40 dark:bg-black/20 p-1.5 rounded-[1rem] shadow-inner border border-white/60 dark:border-white/5">
                  {TRANSACTION_TYPES.map(t => (
                    <button 
                      key={t.name}
                      onClick={() => {
                        setTypeName(t.name);
                        if (t.name === "預售屋") setViewMode("aggregated");
                        else setViewMode("list");
                      }}
                      className={`px-4 xl:px-6 h-9 font-bold text-xs sm:text-[13px] rounded-xl whitespace-nowrap transition-all ${typeName === t.name ? 'bg-white dark:bg-slate-800 text-coral-600 dark:text-coral-400 shadow-sm border border-slate-100 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      {t.name.replace("租賃", "租")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full sm:w-px h-px sm:h-10 bg-white/40 dark:bg-white/5 mx-0 sm:mx-2" />

              <div className="flex flex-col gap-1.5 w-full sm:w-auto min-w-0">
                
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

              {/* Right: search actions, aligned with filters */}
              <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
                <Button
                  variant="ghost"
                  onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
                  className={`flex-1 sm:flex-none text-xs sm:text-sm font-bold ${isAdvancedSearchOpen ? 'text-coral-600 dark:text-coral-400 bg-coral-500/10 dark:bg-coral-500/20' : 'text-slate-600 dark:text-slate-300'} hover:text-coral-700 hover:bg-coral-50 dark:hover:bg-coral-900/30 rounded-[1.25rem] h-11 transition-all gap-2 px-4 border border-transparent shadow-sm ${isAdvancedSearchOpen ? 'border-coral-500/30 shadow-inner' : ''}`}
                >
                  <div className="relative">
                    <SlidersHorizontal className="w-4 h-4" />
                    {isAdvancedSearchOpen && (
                      <motion.div id="search-dot" className="absolute -top-1 -right-1 w-2 h-2 bg-coral-500 shadow-[0_0_8px_rgba(237,111,92,0.5)] rounded-full" />
                    )}
                  </div>
                  {appTexts.advancedSearch}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setDistrict("全部");
                    setCityName("臺北市");
                    setPropertyTypes([...DEFAULT_PROPERTY_TYPES]);
                    setTypeName("買賣");
                    setPeriod(getDefaultPeriod());
                    setUnitPrice({ min: "", max: "", unit: "1" });
                    setArea({ min: "", max: "", unit: "2" });
                    setAge({ min: "", max: "" });
                    setRoomsMin("");
                    setHasManagement("any");
                    setParkingFilter("any");
                    setNearbyKm(null);
                    setNearbyAnchor(null);
                    setFocusBuildCase(null);
                  }}
                  className="flex-1 sm:flex-none h-11 px-4 rounded-[1.25rem] text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-coral-500/5 transition-all text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {appTexts.clearAll}
                </Button>
                <Button
                  onClick={() => setIsSavingSearch(true)}
                  variant="ghost"
                  className="flex-1 sm:flex-none bg-coral-500/10 hover:bg-coral-500/20 text-coral-600 dark:text-coral-400 border border-coral-500/20 rounded-[1.25rem] h-11 px-4 text-xs font-bold transition-all shadow-sm flex items-center justify-center"
                  title="儲存目前的搜尋設定"
                  aria-label="儲存目前的搜尋設定"
                >
                  <Bookmark size={14} className="mr-1.5" />
                  儲存條件
                </Button>
                <Button
                  onClick={fetchData}
                  disabled={loading}
                  className="flex-1 sm:flex-none liquid-glass-button-primary rounded-[1.25rem] px-8 h-11 whitespace-nowrap shadow-md text-sm font-bold flex items-center justify-center"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "處理中..." : "開始查詢"}
                </Button>
              </div>
            </div>

            {/* Active Filter Chips with entrance and exit animations */}
            <AnimatePresence>
              {(() => {
                const chips: { id: string; label: string; onClear?: () => void; muted?: boolean }[] = [];
                chips.push({
                  id: "city",
                  label: cityName,
                  muted: true,
                });
                if (district !== "全部") {
                  chips.push({
                    id: "district",
                    label: district,
                    onClear: () => setDistrict("全部"),
                  });
                }
                if (typeName !== "買賣") {
                  chips.push({
                    id: "typeName",
                    label: typeName,
                    onClear: () => {
                      setTypeName("買賣");
                      setViewMode("list");
                    },
                  });
                }
                // 期間：預設近 12 個月仍顯示，方便確認；非預設可一鍵還原
                chips.push({
                  id: "period",
                  label: isDefaultPeriod(period)
                    ? `近12月 ${formatPeriodLabel(period)}`
                    : `期間 ${formatPeriodLabel(period)}`,
                  onClear: isDefaultPeriod(period)
                    ? undefined
                    : () => setPeriod(getDefaultPeriod()),
                  muted: isDefaultPeriod(period),
                });
                if (search.trim()) {
                  chips.push({
                    id: "search",
                    label: `關鍵字: ${search}`,
                    onClear: () => setSearch(""),
                  });
                }
                // 僅在標的種類偏離預設時顯示（避免預設三種永遠佔版面）
                const isDefaultPts =
                  propertyTypes.length === DEFAULT_PROPERTY_TYPES.length &&
                  DEFAULT_PROPERTY_TYPES.every((pt) => propertyTypes.includes(pt));
                if (!isDefaultPts) {
                  if (propertyTypes.length === 0) {
                    chips.push({
                      id: "pt-none",
                      label: "種類: 未選",
                      onClear: () => setPropertyTypes([...DEFAULT_PROPERTY_TYPES]),
                    });
                  } else if (propertyTypes.length <= 3) {
                    propertyTypes.forEach((pt) => {
                      chips.push({
                        id: `pt-${pt}`,
                        label: pt,
                        onClear: () => {
                          const next = propertyTypes.filter((p) => p !== pt);
                          setPropertyTypes(next.length ? next : [...DEFAULT_PROPERTY_TYPES]);
                        },
                      });
                    });
                  } else {
                    chips.push({
                      id: "pt-many",
                      label: `種類 ${propertyTypes.length} 項`,
                      onClear: () => setPropertyTypes([...DEFAULT_PROPERTY_TYPES]),
                    });
                  }
                }
                if (unitPrice.min || unitPrice.max) {
                  chips.push({
                    id: "unitPrice",
                    label: `單價 ${unitPrice.min || "0"}–${unitPrice.max || "∞"} ${unitPrice.unit === "1" ? "萬/坪" : "元/㎡"}`,
                    onClear: () => setUnitPrice({ min: "", max: "", unit: "1" }),
                  });
                }
                if (area.min || area.max) {
                  chips.push({
                    id: "area",
                    label: `坪數 ${area.min || "0"}–${area.max || "∞"} ${area.unit === "2" ? "坪" : "㎡"}`,
                    onClear: () => setArea({ min: "", max: "", unit: "2" }),
                  });
                }
                if (age.min || age.max) {
                  chips.push({
                    id: "age",
                    label: `屋齡 ${age.min || "0"}–${age.max || "∞"} 年`,
                    onClear: () => setAge({ min: "", max: "" }),
                  });
                }
                if (roomsMin) {
                  chips.push({
                    id: "rooms",
                    label: `≥${roomsMin} 房`,
                    onClear: () => setRoomsMin(""),
                  });
                }
                if (hasManagement !== "any") {
                  chips.push({
                    id: "mgmt",
                    label: hasManagement === "yes" ? "有管理" : "無管理",
                    onClear: () => setHasManagement("any"),
                  });
                }
                if (parkingFilter !== "any") {
                  chips.push({
                    id: "parking",
                    label: parkingFilter === "with" ? "含車位" : "不含車位",
                    onClear: () => setParkingFilter("any"),
                  });
                }
                if (nearbyKm != null) {
                  chips.push({
                    id: "nearby",
                    label: nearbyAnchor
                      ? `附近 ${nearbyKm}km · ${nearbyAnchor.label.slice(0, 12)}${nearbyAnchor.label.length > 12 ? "…" : ""}`
                      : `附近 ${nearbyKm}km（我的位置）`,
                    onClear: () => {
                      setNearbyKm(null);
                      setNearbyAnchor(null);
                    },
                  });
                }
                if (focusBuildCase) {
                  chips.push({
                    id: "focus-bc",
                    label: `建案: ${focusBuildCase}`,
                    onClear: () => setFocusBuildCase(null),
                  });
                }

                return (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-wrap items-center gap-1.5 pb-1 border-t border-slate-100 dark:border-slate-800/60 pt-3 overflow-hidden ml-1"
                  >
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">條件:</span>
                    <AnimatePresence>
                      {chips.map(chip => (
                        <motion.span
                          key={chip.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm border ${
                            chip.muted
                              ? "bg-slate-100/80 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/50 text-slate-600 dark:text-slate-300"
                              : "bg-coral-500/10 dark:bg-coral-500/15 border-coral-200/50 dark:border-coral-500/30 text-coral-600 dark:text-coral-400"
                          }`}
                        >
                          {chip.label}
                          {chip.onClear && (
                            <button
                              type="button"
                              onClick={chip.onClear}
                              className="w-3.5 h-3.5 rounded-full hover:bg-coral-500 hover:text-white flex items-center justify-center transition-colors shrink-0"
                              aria-label={`清除 ${chip.label}`}
                            >
                              <X size={10} strokeWidth={3} />
                            </button>
                          )}
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* Row 3: Advanced Filters */}
            <AnimatePresence>
              {isAdvancedSearchOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -10 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden mt-2"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-5 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] shadow-sm mb-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5" />

                    {/* Period */}
                     <div className="space-y-2 relative z-10 flex flex-col justify-between">
                       <div>
                         <label className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-[0.2em] ml-2">交易期間</label>
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

                       <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                         {[
                           { label: "近12月", months: 12 },
                           { label: "近24月", months: 24 },
                           { label: "近3年", months: 36 },
                         ].map((preset) => (
                           <button
                             key={preset.label}
                             type="button"
                             onClick={() => {
                               const now = new Date();
                               const rocY = now.getFullYear() - 1911;
                               const m = now.getMonth() + 1;
                               let startY = rocY;
                               let startM = m - (preset.months - 1);
                               while (startM <= 0) {
                                 startY -= 1;
                                 startM += 12;
                               }
                               const clampY = (y: number) => Math.min(115, Math.max(101, y));
                               setPeriod({
                                 startY: String(clampY(startY)),
                                 startM: String(startM),
                                 endY: String(clampY(rocY)),
                                 endM: String(m),
                               });
                             }}
                             className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200/80 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:border-coral-300 hover:text-coral-600 transition-colors"
                           >
                             {preset.label}
                           </button>
                         ))}
                       </div>
                       <div className="space-y-1 mt-2.5 px-2 bg-slate-500/5 dark:bg-black/20 p-2.5 rounded-xl border border-white/40 dark:border-white/5">
                         <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                           <span>起: {period.startY}年{period.startM}月</span>
                           <span className="opacity-70 text-[9px]">拖曳快速調整</span>
                         </div>
                         <input 
                           type="range" 
                           min={0} 
                           max={179} 
                           value={getPeriodValue(period.startY, period.startM)}
                           onChange={(e) => {
                             const val = parseInt(e.target.value);
                             const { y, m } = getPeriodFromValue(val);
                             const endVal = getPeriodValue(period.endY, period.endM);
                             if (val <= endVal) {
                               setPeriod({ ...period, startY: y, startM: m });
                             } else {
                               setPeriod({ ...period, startY: y, startM: m, endY: y, endM: m });
                             }
                           }}
                           className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-coral-500"
                         />
                         <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                           <span>迄: {period.endY}年{period.endM}月</span>
                         </div>
                         <input 
                           type="range" 
                           min={0} 
                           max={179} 
                           value={getPeriodValue(period.endY, period.endM)}
                           onChange={(e) => {
                             const val = parseInt(e.target.value);
                             const { y, m } = getPeriodFromValue(val);
                             const startVal = getPeriodValue(period.startY, period.startM);
                             if (val >= startVal) {
                               setPeriod({ ...period, endY: y, endM: m });
                             } else {
                               setPeriod({ ...period, startY: y, startM: m, endY: y, endM: m });
                             }
                           }}
                           className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-coral-500"
                         />
                       </div>
                     </div>

                    {/* Unit Price */}
                    <div className="space-y-2 relative z-10">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-[0.2em] ml-2">單價</label>
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
                        <label className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-[0.2em] ml-2">面積</label>
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
                    <div className="space-y-2 flex flex-col justify-between relative z-10">
                      <div>
                        <label className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-[0.2em] ml-2">屋齡 (年)</label>
                        <div className="flex items-center gap-2">
                          <input type="number" placeholder="最小值" className="w-full liquid-glass-input h-12 px-4 rounded-2xl outline-none text-sm font-bold shadow-sm" value={age.min} onChange={e=>setAge({...age, min: e.target.value})} />
                          <span className="text-slate-400/50 font-bold">-</span>
                          <input type="number" placeholder="最大值" className="w-full liquid-glass-input h-12 px-4 rounded-2xl outline-none text-sm font-bold shadow-sm" value={age.max} onChange={e=>setAge({...age, max: e.target.value})} />
                        </div>
                      </div>

                      <div className="space-y-1 mt-2.5 px-2 bg-slate-500/5 dark:bg-black/20 p-2.5 rounded-xl border border-white/40 dark:border-white/5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          <span>最小屋齡: {age.min ? `${age.min}年` : "不限"}</span>
                          <span className="opacity-70 text-[9px]">拖曳包含範圍</span>
                        </div>
                        <input 
                          type="range" 
                          min={0} 
                          max={60} 
                          value={age.min === "" ? 0 : parseInt(age.min)}
                          onChange={(e) => {
                            const val = e.target.value;
                            const nextMin = val === "0" ? "" : val;
                            const currentMax = age.max === "" ? 60 : parseInt(age.max);
                            if (nextMin === "" || parseInt(nextMin) <= currentMax) {
                              setAge({ ...age, min: nextMin });
                            } else {
                              setAge({ ...age, min: nextMin, max: nextMin });
                            }
                          }}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-coral-500"
                        />
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                          <span>最大屋齡: {age.max ? `${age.max}年` : "不限"}</span>
                        </div>
                        <input 
                          type="range" 
                          min={0} 
                          max={60} 
                          value={age.max === "" ? 60 : parseInt(age.max)}
                          onChange={(e) => {
                            const val = e.target.value;
                            const nextMax = val === "60" ? "" : val;
                            const currentMin = age.min === "" ? 0 : parseInt(age.min);
                            if (nextMax === "" || parseInt(nextMax) >= currentMin) {
                              setAge({ ...age, max: nextMax });
                            } else {
                              setAge({ ...age, min: nextMax, max: nextMax });
                            }
                          }}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-coral-500"
                        />
                      </div>
                    </div>

                    {/* 附近距離 */}
                    <div className="lg:col-span-4 space-y-2 relative z-10 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                        <label className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-[0.2em]">
                          附近成交距離
                        </label>
                        <span className="text-[10px] font-bold text-slate-400">
                          {nearbyAnchor
                            ? `中心：${nearbyAnchor.label}`
                            : userLocation.latitude
                              ? `中心：定位 ${userLocation.county || ""} ${userLocation.district || ""}`
                              : "需定位或從物件「設為中心」"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 px-1">
                        {(
                          [
                            { v: null as number | null, label: "關閉" },
                            { v: 0.5, label: "500m" },
                            { v: 1, label: "1km" },
                            { v: 2, label: "2km" },
                            { v: 3, label: "3km" },
                            { v: 5, label: "5km" },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={String(opt.v)}
                            type="button"
                            onClick={() => {
                              setNearbyKm(opt.v);
                              if (opt.v === null) setNearbyAnchor(null);
                            }}
                            className={`px-3 h-9 rounded-xl text-xs font-bold border transition-all ${
                              nearbyKm === opt.v
                                ? "bg-coral-500/15 border-coral-400/50 text-coral-600 dark:text-coral-400"
                                : "bg-white/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-700 text-slate-500"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                        {nearbyAnchor && (
                          <button
                            type="button"
                            onClick={() => setNearbyAnchor(null)}
                            className="px-3 h-9 rounded-xl text-xs font-bold border border-slate-200 text-slate-500 hover:border-coral-300 hover:text-coral-600"
                          >
                            改用我的定位
                          </button>
                        )}
                        {!userLocation.latitude && !nearbyAnchor && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowLocationModal(true);
                            }}
                            className="px-3 h-9 rounded-xl text-xs font-bold border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300"
                          >
                            <Crosshair size={12} className="inline mr-1" />
                            取得定位
                          </button>
                        )}
                      </div>
                      <p className="px-1 text-[10px] font-medium text-slate-400 leading-relaxed">
                        依地圖座標過濾；部分點位為行政區近似，距離僅供參考。開啟後列表預設由近到遠排序。
                      </p>
                    </div>

                    {/* 格局 / 管理 / 車位 — 第二列 */}
                    <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-[0.2em] ml-2">
                          格局（最少房數）
                        </label>
                        <div className="flex flex-wrap gap-1.5 px-1">
                          {["", "1", "2", "3", "4"].map((n) => (
                            <button
                              key={n || "any"}
                              type="button"
                              onClick={() => setRoomsMin(n)}
                              className={`px-3 h-9 rounded-xl text-xs font-bold border transition-all ${
                                roomsMin === n
                                  ? "bg-coral-500/15 border-coral-400/50 text-coral-600 dark:text-coral-400"
                                  : "bg-white/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-700 text-slate-500"
                              }`}
                            >
                              {n === "" ? "不限" : `≥${n}房`}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-[0.2em] ml-2">
                          管理組織
                        </label>
                        <div className="flex flex-wrap gap-1.5 px-1">
                          {(
                            [
                              { v: "any" as const, label: "不限" },
                              { v: "yes" as const, label: "有" },
                              { v: "no" as const, label: "無" },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.v}
                              type="button"
                              onClick={() => setHasManagement(opt.v)}
                              className={`px-3 h-9 rounded-xl text-xs font-bold border transition-all ${
                                hasManagement === opt.v
                                  ? "bg-coral-500/15 border-coral-400/50 text-coral-600 dark:text-coral-400"
                                  : "bg-white/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-700 text-slate-500"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-[0.2em] ml-2">
                          車位
                        </label>
                        <div className="flex flex-wrap gap-1.5 px-1">
                          {(
                            [
                              { v: "any" as const, label: "不限" },
                              { v: "with" as const, label: "含車位" },
                              { v: "without" as const, label: "不含" },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.v}
                              type="button"
                              onClick={() => setParkingFilter(opt.v)}
                              className={`px-3 h-9 rounded-xl text-xs font-bold border transition-all ${
                                parkingFilter === opt.v
                                  ? "bg-coral-500/15 border-coral-400/50 text-coral-600 dark:text-coral-400"
                                  : "bg-white/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-700 text-slate-500"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

               </motion.div>
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
        <div ref={resultsContainerRef} className="flex-none px-1.5 sm:px-6 relative z-20 w-full pb-12 flex flex-col flex-1">
          <div className="grid w-full max-w-[1600px] mx-auto gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex-1 flex flex-col liquid-glass rounded-t-none sm:rounded-[2rem] w-full border-b-0 shadow-md mt-0 sm:mt-4 relative overflow-hidden">
            <div className="px-4 sm:px-8 py-5 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1 bg-coral-500" />
            <div className="flex items-center gap-3 relative z-10 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-coral-500/10 flex items-center justify-center border border-coral-500/10 shrink-0">
                <Filter className="w-5 h-5 text-coral-600 dark:text-coral-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-ink dark:text-white uppercase tracking-[0.22em] leading-none">搜尋結果</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1.5 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-coral-500 shrink-0" />
                  <span className="truncate">目前找到 {filteredData.length} 筆 · {formatPeriodLabel(period)}</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative z-10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={filteredData.length === 0}
                onClick={handleExportCsv}
                className="h-9 rounded-xl px-2.5 sm:px-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-coral-600 hover:bg-coral-500/10 disabled:opacity-40"
                title="匯出目前篩選結果 CSV"
                aria-label="匯出 CSV"
              >
                <Download size={14} className="sm:mr-1.5" />
                <span className="hidden sm:inline">匯出 CSV</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyShareLink}
                className={`h-9 rounded-xl px-2.5 sm:px-3 text-[11px] font-bold hover:bg-coral-500/10 ${
                  shareStatus === "copied"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : shareStatus === "error"
                      ? "text-red-500"
                      : "text-slate-600 dark:text-slate-300 hover:text-coral-600"
                }`}
                title="複製可分享查詢連結"
                aria-label="複製分享連結"
              >
                {shareStatus === "copied" ? (
                  <CheckCircle2 size={14} className="sm:mr-1.5" />
                ) : (
                  <Share2 size={14} className="sm:mr-1.5" />
                )}
                <span className="hidden sm:inline">
                  {shareStatus === "copied" ? "已複製" : shareStatus === "error" ? "複製失敗" : "分享連結"}
                </span>
              </Button>
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
          </div>
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading-spinner-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="p-8 sm:p-16 space-y-12 flex flex-col items-center justify-center min-h-[500px] w-full"
              >
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-2px] rounded-full border-t-2 border-coral-500" 
                  />
                  <Database size={22} className="text-coral-500 relative z-10" />
                </div>
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
            </motion.div>
          ) : viewMode === "aggregated" && typeName === "預售屋" ? (
            <motion.div
              key="aggregated-view"
              initial={{ opacity: 0, scale: 0.99, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 min-h-[300px] flex flex-col p-4 sm:p-6 overflow-x-auto w-full"
            >
              <Table className="min-w-[800px]">
                <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 border-b border-slate-200/80 dark:border-slate-800/80">
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
            </motion.div>
          ) : viewMode === "list" ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, scale: 0.99, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 min-h-[300px] flex flex-col max-w-[1600px] mx-auto w-full"
            >
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
                <div className="px-1.5 sm:px-6 mb-4 w-full min-w-0">
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

                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-3 px-1.5 sm:px-6 pb-2">
                  <AnimatePresence mode="popLayout">
                    {paginatedData.map((item, idx) => (
                      <TransactionCard
                        key={item.id}
                        item={item}
                        idx={idx}
                        typeName={typeName}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        setSelectedItem={setSelectedItem}
                        setTrendDistrict={setTrendDistrict}
                        isInCompare={compareList.some((c) => c.id === item.id)}
                        toggleCompare={toggleCompare}
                        globalFacilities={globalFacilities}
                        historyCounts={historyCounts}
                        districtAveragePrices={districtAveragePrices}
                        appTexts={appTexts}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              {filteredData.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4 px-1.5 sm:px-6 mb-8">
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

              {filteredData.length > 0 && <AffiliateMarquee />}

              {filteredData.length === 0 && !loading && !error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20 px-6 text-slate-400 dark:text-slate-500"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center mb-5 shadow-sm">
                    <Compass className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="font-sans font-bold text-base tracking-tight text-slate-800 dark:text-slate-200 text-center">
                    {data.length === 0
                      ? "尚未查詢或來源無資料"
                      : (appTexts.noData.includes("。") ? appTexts.noData.split("。")[0] : appTexts.noData)}
                  </p>
                  <p className="text-xs mt-1.5 font-medium text-slate-500 dark:text-slate-400 text-center max-w-sm">
                    {data.length === 0
                      ? "選擇區域後按「開始查詢」，或先放寬期間與關鍵字再試。"
                      : "可一鍵放寬條件後重新套用篩選（前端篩選立即生效）。"}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    {search.trim() && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs font-bold"
                        onClick={() => setSearch("")}
                      >
                        清除關鍵字
                      </Button>
                    )}
                    {district !== "全部" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs font-bold"
                        onClick={() => setDistrict("全部")}
                      >
                        改查全市
                      </Button>
                    )}
                    {!isDefaultPeriod(period) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs font-bold"
                        onClick={() => setPeriod(getDefaultPeriod())}
                      >
                        改回近12月
                      </Button>
                    )}
                    {(unitPrice.min ||
                      unitPrice.max ||
                      area.min ||
                      area.max ||
                      age.min ||
                      age.max ||
                      roomsMin ||
                      hasManagement !== "any" ||
                      parkingFilter !== "any") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs font-bold"
                        onClick={() => {
                          setUnitPrice({ min: "", max: "", unit: "1" });
                          setArea({ min: "", max: "", unit: "2" });
                          setAge({ min: "", max: "" });
                          setRoomsMin("");
                          setHasManagement("any");
                          setParkingFilter("any");
                        }}
                      >
                        清除進階篩選
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-xl text-xs font-bold bg-coral-600 hover:bg-coral-500 text-white"
                      onClick={() => fetchData()}
                    >
                      重新查詢
                    </Button>
                  </div>
                </motion.div>
              )}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20 px-6 text-red-500/80 dark:text-red-400/80"
                >
                  <div className="w-16 h-16 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-center mb-6 shadow-sm animate-pulse">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-lg font-sans font-bold mb-2 tracking-tight text-red-700 dark:text-red-400">數據集載入失敗</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm text-center font-medium leading-relaxed mb-8">{error}</p>
                  <Button 
                    variant="outline" 
                    className="rounded-xl px-8 h-10 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold transition-all active:scale-95 text-xs shadow-sm"
                    onClick={fetchData}
                  >
                    重新載入資料
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="map-view"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
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
              <AffiliateMarquee />
            </motion.div>
          )}
        </AnimatePresence>
          </div>
          <aside className="hidden lg:flex lg:flex-col gap-4 mt-4">
            <div className="sticky top-4 flex flex-col gap-4">
              <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70" aria-labelledby="rail-market-summary">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 id="rail-market-summary" className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      查詢概況
                    </h3>
                    <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                      {cityName}{district !== "全部" ? ` · ${district}` : ""} / {typeName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={pinCurrentMarket}
                      disabled={marketSnapshot.count === 0}
                      className="flex h-9 items-center gap-1 rounded-xl border border-coral-200 bg-coral-500/10 px-2.5 text-[10px] font-black text-coral-700 disabled:opacity-40 dark:border-coral-800 dark:text-coral-300"
                      title="釘選此區 KPI"
                    >
                      <Pin size={14} />
                      釘選
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-coral-300 hover:text-coral-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400"
                      title={isSearchExpanded ? "收合條件" : "展開條件"}
                      aria-label={isSearchExpanded ? "收合條件" : "展開條件"}
                    >
                      <SlidersHorizontal size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {marketKpis.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={`rail-${item.label}`} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/35">
                        <div className="mb-2 flex items-center justify-between text-slate-400">
                          <span className="text-[10px] font-black uppercase tracking-[0.14em]">{item.label}</span>
                          <Icon size={13} className="text-coral-500" />
                        </div>
                        <div className="truncate text-lg font-black tracking-tight text-ink dark:text-white">
                          {item.value}
                        </div>
                        <div className="mt-1 truncate text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {item.helper}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <PinnedKpiCompare
                pins={pinnedKpis}
                onUnpin={(id) => setPinnedKpis((prev) => prev.filter((p) => p.id !== id))}
                onClear={() => setPinnedKpis([])}
              />

              <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70" aria-labelledby="rail-map">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 id="rail-map" className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      地圖探索
                    </h3>
                    <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                      {geocodedCount > 0 ? `${geocodedCount} 筆已定位` : "查詢後顯示空間分布"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode("map")}
                    className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white shadow-sm transition-all hover:bg-coral-600 dark:bg-white dark:text-slate-950 dark:hover:bg-coral-200"
                  >
                    開啟地圖
                  </button>
                </div>
                {filteredData.length > 0 ? (
                  <div className="h-[250px] overflow-hidden rounded-[1.5rem] border border-slate-200/80 dark:border-slate-800/80">
                    <Suspense fallback={<Skeleton className="h-full w-full bg-slate-100 dark:bg-slate-800" />}>
                      <ResultsMap
                        cityName={cityName}
                        district={district}
                        filteredData={filteredData.slice(0, 60)}
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
                  </div>
                ) : (
                  <div className="flex h-[210px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 text-center dark:border-slate-800 dark:bg-slate-950/30">
                    <MapPinOff className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">尚無可定位資料</p>
                    <p className="mt-1 max-w-[220px] text-xs font-bold leading-relaxed text-slate-500 dark:text-slate-400">
                      執行查詢後，這裡會顯示成交點位與區域密度。
                    </p>
                  </div>
                )}
              </section>

              <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70" aria-labelledby="rail-actions">
                <h3 id="rail-actions" className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  快速動作
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdvancedSearchOpen(true)}
                    className="rounded-2xl bg-coral-500/10 px-3 py-3 text-left text-xs font-black text-coral-700 transition-all hover:bg-coral-500/15 dark:text-coral-300"
                  >
                    <SlidersHorizontal className="mb-2 h-4 w-4" />
                    進階篩選
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSavingSearch(true)}
                    className="rounded-2xl bg-slate-100 px-3 py-3 text-left text-xs font-black text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Bookmark className="mb-2 h-4 w-4" />
                    儲存條件
                  </button>
                  <button
                    type="button"
                    disabled={filteredData.length === 0}
                    onClick={handleExportCsv}
                    className="rounded-2xl bg-emerald-500/10 px-3 py-3 text-left text-xs font-black text-emerald-700 transition-all hover:bg-emerald-500/15 disabled:opacity-40 dark:text-emerald-300"
                  >
                    <Download className="mb-2 h-4 w-4" />
                    匯出 CSV
                  </button>
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="rounded-2xl bg-blue-500/10 px-3 py-3 text-left text-xs font-black text-blue-700 transition-all hover:bg-blue-500/15 dark:text-blue-300"
                  >
                    <Share2 className="mb-2 h-4 w-4" />
                    {shareStatus === "copied" ? "已複製連結" : "分享連結"}
                  </button>
                </div>
              </section>
            </div>
          </aside>
          </div>
        </div>

        {/* About & FAQ：統一欄寬與層級，避免左窄右空、卡片與內文寬度不一致 */}
        <div className="mx-auto mt-6 w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
          <div className="flex flex-col gap-10 rounded-[1.75rem] border border-white/60 bg-white/55 p-5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40 sm:gap-12 sm:p-8">
            <section className="flex flex-col gap-5" aria-labelledby="search-intent-overview">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-coral-700 dark:text-coral-400">
                  台灣房價查詢
                </span>
                <span className="h-px w-8 bg-coral-500/30" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  實價登錄
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <h2 id="search-intent-overview" className="text-xl font-black tracking-tight text-ink dark:text-white sm:text-2xl">
                  台灣實價登錄查詢與房價地圖
                </h2>
                <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[15px]">
                  查詢臺北市、新北市、桃園市、臺中市、臺南市、高雄市與全台各縣市的實價登錄成交紀錄，
                  支援買賣、預售屋與租賃資料，並可依總價、單價、坪數、屋齡與地圖位置快速篩選。
                </p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {FEATURED_QUERY_INTENTS.map((intent) => (
                    <span
                      key={intent}
                      className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-400"
                    >
                      {intent}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 id="search-coverage" className="text-base font-black tracking-tight text-ink dark:text-white sm:text-lg">
                  可查詢的實價登錄範圍
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className="flex h-full flex-col rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-4 dark:border-slate-700/60 dark:bg-slate-950/35"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-coral-500/10 text-[11px] font-black text-coral-600 dark:text-coral-400">
                          {index + 1}
                        </span>
                        <h4 className="text-sm font-black tracking-tight text-ink dark:text-white">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[13px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section
              className="flex flex-col gap-3 border-t border-slate-200/70 pt-8 dark:border-white/10"
              aria-labelledby="about-real-estate-search"
            >
              <h2 id="about-real-estate-search" className="text-xl font-black tracking-tight text-ink dark:text-white sm:text-2xl">
                關於實價登錄查詢
              </h2>
              <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400 sm:text-[15px]">
                實價登錄查詢是一個免費的台灣房地產實價登錄查詢工具，整合
                <a
                  href="https://lvr.land.moi.gov.tw/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-1 font-bold text-coral-700 underline decoration-coral-400/50 underline-offset-4 hover:text-coral-600 dark:text-coral-400"
                >
                  內政部不動產交易實價查詢服務網
                </a>
                開放資料，提供買賣、預售屋與租賃成交紀錄的快速搜尋。不需註冊即可查詢各縣市與行政區的總價、單價、坪數、樓層、屋齡與歷史交易資料，並透過地圖模式了解周邊設施與地理位置。
              </p>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                頁面資訊更新：<time dateTime={SEO_CONTENT_UPDATED}>{SEO_CONTENT_UPDATED}</time>；成交資料依官方發布時程同步。
              </p>
            </section>

            <section
              className="flex flex-col gap-3 border-t border-slate-200/70 pt-8 dark:border-white/10"
              aria-labelledby="real-estate-faq"
            >
              <h2 id="real-estate-faq" className="text-xl font-black tracking-tight text-ink dark:text-white sm:text-2xl">
                常見問題 FAQ
              </h2>
              <div className="flex flex-col gap-2.5">
                <details className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-white/10 dark:bg-slate-800/60">
                  <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 p-4 text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80 sm:px-5 [&::-webkit-details-marker]:hidden">
                    這個網站是免費的嗎？
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="border-t border-slate-100 p-4 pt-3 text-sm font-medium leading-relaxed text-slate-500 dark:border-white/5 dark:text-slate-400 sm:px-5">
                    是的，這個網站完全免費提供大家查詢使用，旨在提供更友善、直覺的實價登錄查詢體驗。
                  </div>
                </details>
                <details className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-white/10 dark:bg-slate-800/60">
                  <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 p-4 text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80 sm:px-5 [&::-webkit-details-marker]:hidden">
                    資料來源與更新頻率為何？
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="border-t border-slate-100 p-4 pt-3 text-sm font-medium leading-relaxed text-slate-500 dark:border-white/5 dark:text-slate-400 sm:px-5">
                    資料來源為內政部不動產交易實價查詢服務網的開放資料。更新頻率依據官方發布時程，通常為每月 3 次（約每 10 天更新一次）。
                  </div>
                </details>
                <details className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-white/10 dark:bg-slate-800/60">
                  <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 p-4 text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80 sm:px-5 [&::-webkit-details-marker]:hidden">
                    為什麼地圖上有些物件的定位不準確？
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="border-t border-slate-100 p-4 pt-3 text-sm font-medium leading-relaxed text-slate-500 dark:border-white/5 dark:text-slate-400 sm:px-5">
                    由於政府開放資料為了保護隱私，門牌號碼多半有區間遮蔽（例如：中正路1~30號），因此系統無法取得精確座標，這類地址會盡量定位在該路段附近。詳細位置請參考卡片內的門牌資訊。
                  </div>
                </details>
              </div>
            </section>
          </div>

          <div className="mt-10">
            <SiteFooterNav />
          </div>
        </div>

      </motion.div>

      {/* District Volume Trend Dialog */}
      <Dialog open={!!trendDistrict} onOpenChange={(open) => !open && setTrendDistrict(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-md w-full p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-ink dark:text-white">
              <span className="p-1.5 rounded-lg bg-coral-500/10 dark:bg-coral-500/20 text-coral-600 dark:text-coral-400">
                <TrendingUp size={18} />
              </span>
              <span>區域熱度分析</span>
            </DialogTitle>
          </DialogHeader>
          
          {trendDistrict && (() => {
            const trendData = getLatestThreeMonthsForDistrict(trendDistrict, data);
            const totalVolume = trendData.reduce((acc, curr) => acc + curr.count, 0);
            
            let changeText = "";
            let changeStatus: "up" | "down" | "flat" = "flat";
            let changePercent = 0;
            if (trendData.length >= 2) {
              const prev = trendData[trendData.length - 2].count;
              const curr = trendData[trendData.length - 1].count;
              if (prev > 0) {
                changePercent = ((curr - prev) / prev) * 100;
                if (changePercent > 0) {
                  changeStatus = "up";
                  changeText = `月增 ${changePercent.toFixed(1)}%`;
                } else if (changePercent < 0) {
                  changeStatus = "down";
                  changeText = `月減 ${Math.abs(changePercent).toFixed(1)}%`;
                } else {
                  changeStatus = "flat";
                  changeText = "與上月持平";
                }
              } else if (curr > 0) {
                changeStatus = "up";
                changeText = "成長顯著";
              } else {
                changeText = "無變化";
              }
            }

            let vitalityDesc = "市場觀望";
            let vitalityColor = "text-slate-500 dark:text-slate-400 bg-slate-500/10";
            if (totalVolume >= 15) {
              vitalityDesc = "熱絡度極高";
              vitalityColor = "text-rose-600 bg-rose-500/12 dark:text-rose-400 dark:bg-rose-500/15";
            } else if (totalVolume >= 8) {
              vitalityDesc = "市場活絡";
              vitalityColor = "text-coral-600 bg-coral-500/12 dark:text-coral-400 dark:bg-coral-500/15";
            } else if (totalVolume >= 3) {
              vitalityDesc = "交易平穩";
              vitalityColor = "text-teal-600 bg-teal-500/12 dark:text-teal-400 dark:bg-teal-500/15";
            }

            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">【{trendDistrict}】近3月成交</span>
                    <div className="text-2xl font-black font-display text-ink dark:text-white mt-1">
                      {totalVolume} <span className="text-sm font-bold text-slate-400 dark:text-slate-500">筆</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block text-right">市場活絡度</span>
                    <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black tracking-wider mt-1.5 ${vitalityColor}`}>
                      {vitalityDesc}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block px-1">成交量走勢</span>
                  <div className="h-[180px] w-full bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-850 p-4 flex flex-col justify-between">
                    <div className="h-[120px] w-full flex items-end justify-around pb-2 border-b border-slate-100 dark:border-slate-800/50">
                      {trendData.map((d, index) => {
                        const maxCount = Math.max(...trendData.map(t => t.count), 1);
                        const heightPct = `${Math.max((d.count / maxCount) * 100, 8)}%`;
                        const isLatest = index === trendData.length - 1;
                        
                        return (
                          <div key={d.month} className="flex flex-col items-center gap-2 group w-12">
                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {d.count} 筆
                            </span>
                            <div className="w-8 relative flex justify-center bg-slate-100 dark:bg-slate-800/50 rounded-t-lg h-[90px] items-end">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: heightPct }}
                                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                                className={`w-full rounded-t-md transition-colors ${
                                  isLatest 
                                    ? "bg-gradient-to-t from-coral-600 to-coral-400 shadow-[0_4px_12px_rgba(237,111,92,0.2)]" 
                                    : "bg-slate-400/30 dark:bg-slate-700 hover:bg-slate-500/40"
                                }`}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                              {d.month.split('/')[1]}月
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1.5 px-1">
                      <span>統計區間：{trendData[0]?.month} - {trendData[2]?.month}</span>
                      {changeText && (
                        <span className={`font-black flex items-center gap-0.5 ${
                          changeStatus === 'up' 
                            ? 'text-rose-600 dark:text-rose-400' 
                            : changeStatus === 'down' 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-slate-500'
                        }`}>
                          {changeStatus === 'up' && <ArrowUp size={12} />}
                          {changeStatus === 'down' && <ArrowDown size={12} />}
                          {changeText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 bg-slate-500/5 dark:bg-black/15 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  💡 統計說明：成交量係指該行政區於特定月份之實價登錄移轉件數。若近一期較前一期有顯著增長，表示該區買氣與流動性極佳，適合買方積極考慮。
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent showCloseButton={false} className="max-w-[95vw] sm:max-w-4xl w-full p-0 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
          {selectedItem && (
            <motion.div 
              initial={{ y: "40px", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.05,
                delayChildren: 0.05
              }}
              className="flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]"
            >
              {/* Premium Dialog Header */}
              <motion.div variants={modalItemVariants} className="py-4 px-6 sm:py-5 sm:px-8 bg-white/25 dark:bg-slate-950/20 backdrop-blur-2xl border-b border-slate-200/30 dark:border-slate-800/40 relative overflow-hidden shrink-0 z-10 transition-all">
                {/* Decorative background glows */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-coral-500/10 dark:bg-coral-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-coral-500/30 dark:via-coral-500/20 to-transparent" />
                
                {/* Custom Close Button */}
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-3.5 right-4 sm:top-5 sm:right-6 w-9 h-9 flex items-center justify-center rounded-full bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700/80 border border-slate-200/40 dark:border-slate-700/40 backdrop-blur-md shadow-sm transition-all z-50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-coral-500/50"
                  title="關閉"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>

                <div className="relative z-10 flex flex-col">
                  <div className="space-y-3 w-full sm:max-w-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                       <div className="flex items-center gap-2">
                         <Badge className="bg-coral-500/10 text-coral-600 dark:bg-coral-500/20 dark:text-coral-300 border-coral-500/20 px-2.5 py-0.5 rounded-full font-bold tracking-widest text-[10px] uppercase shadow-sm backdrop-blur-sm">
                           {selectedItem.district}
                         </Badge>
                       </div>
                       <div className="flex flex-row items-center sm:items-end gap-3 select-text">
                         <div className="flex items-baseline gap-1">
                           <span className="text-slate-500 dark:text-slate-400 text-[9px] uppercase font-black tracking-[0.2em]">登錄價</span>
                           <span className="text-2xl sm:text-3xl font-display font-black text-slate-800 dark:text-slate-100 tracking-tighter drop-shadow-sm leading-none">
                             {formatPrice(selectedItem.totalPrice)}
                           </span>
                         </div>
                         {selectedItem.parkingPrice && parseFloat(selectedItem.parkingPrice) > 0 && (
                            <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 bg-white/60 dark:bg-slate-950/60 px-2 py-0.5 rounded-md backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                              <span className="flex items-center gap-0.5 text-slate-700 dark:text-slate-300"><Home size={10} className="text-slate-400" /> {formatPrice((parseFloat(selectedItem.totalPrice) - parseFloat(selectedItem.parkingPrice)).toString())}</span>
                              <span className="text-slate-300 dark:text-slate-600">|</span>
                              <span className="flex items-center gap-0.5 text-slate-700 dark:text-slate-300"><Car size={10} className="text-slate-400" /> {formatPrice(selectedItem.parkingPrice)}</span>
                            </div>
                         )}
                       </div>
                    </div>
                    
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight leading-snug drop-shadow-sm pr-12 sm:pr-0 select-text">
                      {selectedItem.address}
                    </h2>

                    {getSpecialTags(selectedItem.remarks).length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {getSpecialTags(selectedItem.remarks).map(tag => (
                          <span key={tag.label} className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border leading-none shadow-xs flex items-center gap-1 ${tag.class} bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm`}>
                            <ShieldCheck size={11} />
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] pt-0.5">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium bg-white/60 dark:bg-slate-800/40 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-xs backdrop-blur-sm">
                        <Calendar size={12} className="text-coral-500 drop-shadow-sm" />
                        {formatDate(selectedItem.date)} 交易
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium bg-white/60 dark:bg-slate-800/40 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-xs backdrop-blur-sm">
                        <MapPin size={12} className="text-blue-500 drop-shadow-sm" />
                        {cityName}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
                {/* Top Liquid Glass Fade Mask */}
                <div 
                  className={`pointer-events-none absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 to-transparent z-25 backdrop-blur-[1px] transition-opacity duration-300 ${
                    detailShowTopMask ? "opacity-100" : "opacity-0"
                  }`}
                />

                <div 
                  onScroll={(e) => {
                    const target = e.currentTarget;
                    setDetailShowTopMask(target.scrollTop > 5);
                    setDetailShowBottomMask(target.scrollHeight - target.clientHeight - target.scrollTop > 5);
                  }}
                  className="flex-1 overflow-y-auto scrollbar-hide"
                >
                  <motion.div variants={modalContainerVariants} initial="hidden" animate="show" className="p-4 sm:p-10 space-y-6 sm:space-y-10">
                  {/* Building Images Slider */}
                  {isBuildingImagesLoading ? (
                    <motion.div variants={modalItemVariants} className="w-full h-48 sm:h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
                       <span className="text-slate-400 font-bold text-sm tracking-widest uppercase">載入外觀圖片中...</span>
                    </motion.div>
                  ) : buildingImages.length > 0 ? (
                    <motion.div variants={modalItemVariants} className="relative w-full overflow-hidden rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                      <div ref={imageSliderRef} className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide bg-slate-100/50 dark:bg-slate-900/50 p-2">
                        {buildingImages.map((src, idx) => (
                           <div key={idx} className="snap-center shrink-0 w-[85%] sm:w-[60%] first:ml-0 last:mr-0 rounded-xl overflow-hidden shadow-sm relative group bg-slate-200 dark:bg-slate-800">
                             <img
                               src={src}
                               alt={`${selectedItem.address} 建物外觀照片`}
                               width="1200"
                               height="800"
                               loading="lazy"
                               decoding="async"
                               className="w-full h-48 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                               referrerPolicy="no-referrer"
                             />
                             <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-xl pointer-events-none" />
                           </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}

                  {/* High Density Stats Grid */}
                  <motion.div variants={modalItemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
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
                      <div 
                        key={i}
                        className={`liquid-glass-input p-5 sm:p-6 rounded-[2rem] border-white/40 dark:border-white/10 relative overflow-hidden group transition-all hover:scale-101 hover:-translate-y-0.5`}
                      >
                         <div className={`absolute -right-2 -top-2 p-6 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color} rotate-12`}>{stat.icon}</div>
                         <div className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2">
                           <div className={`w-6 h-6 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
                           {stat.label}
                         </div>
                         <div className="text-2xl font-bold text-ink dark:text-white tracking-tight">{stat.value}</div>
                         {stat.sub && <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-2 opacity-60 tracking-wide">{stat.sub}</div>}
                      </div>
                    ))}
                  </motion.div>

                {/* Price Split Visualization */}
                  {selectedItem.parkingPrice && parseFloat(selectedItem.parkingPrice) > 0 && (
                    <motion.div variants={modalItemVariants} className="space-y-3">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm flex items-center gap-2">
                        <DollarSign size={12} className="text-emerald-500" /> 真實房屋單價拆算
                      </h3>
                      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 pointer-events-none">
                          <Car size={120} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 relative z-10">
                          {/* House Calculation */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">扣車位後總價</span>
                            <div className="text-2xl font-black text-ink dark:text-white tracking-tight flex items-baseline gap-1">
                              {formatPrice((parseFloat(selectedItem.totalPrice) - parseFloat(selectedItem.parkingPrice)).toString())}
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                              總價 {formatPrice(selectedItem.totalPrice)} - 車位 {formatPrice(selectedItem.parkingPrice)}
                            </span>
                          </div>

                          {/* Area Calculation */}
                          <div className="flex flex-col gap-1 sm:pl-4 sm:border-l sm:border-slate-200/60 dark:sm:border-slate-800">
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">扣車位後坪數</span>
                            <div className="text-2xl font-black text-ink dark:text-white tracking-tight">
                              {((parseFloat(selectedItem.buildingArea) - parseFloat(selectedItem.parkingArea || "0")) * 0.3025).toFixed(1)} <span className="text-lg opacity-60">坪</span>
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                              總坪 {(parseFloat(selectedItem.buildingArea) * 0.3025).toFixed(1)} - 車位 {(parseFloat(selectedItem.parkingArea || "0") * 0.3025).toFixed(1)}
                            </span>
                          </div>

                          {/* Final Unit Price */}
                          <div className="flex flex-col gap-1 sm:pl-4 sm:border-l sm:border-emerald-500/20">
                            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500 mb-1">真實房屋單價</span>
                            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                              {(() => {
                                const houseTotal = parseFloat(selectedItem.totalPrice) - parseFloat(selectedItem.parkingPrice);
                                const houseArea = parseFloat(selectedItem.buildingArea) - parseFloat(selectedItem.parkingArea || "0");
                                if (houseTotal > 0 && houseArea > 0) {
                                  const realUnitP = houseTotal / houseArea; // 元/平方米
                                  return (realUnitP * 3.30578 / 10000).toFixed(1);
                                }
                                return "-";
                              })()} <span className="text-base">萬/坪</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600/60 dark:text-emerald-400/60">
                              排除車位干擾的真實單價
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Map Preview */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm flex items-center gap-2">
                       <MapIcon size={12} className="text-coral-500" /> 地理位置
                    </h3>
                    <Suspense fallback={<Skeleton className="h-[160px] sm:h-[250px] rounded-[1.5rem] bg-white/40 dark:bg-slate-900/40" />}>
                      <TransactionMapPreview selectedItem={selectedItem} />
                    </Suspense>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-6">
                    <div className="space-y-3 relative">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm">土地資訊</h3>
                      <div className="grid grid-cols-2 gap-px bg-slate-200/40 dark:bg-slate-800/50 rounded-[1.5rem] overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                        <DetailRow label="土地使用分區" value={selectedItem.zoning || "-"} />
                        <DetailRow label="土地移轉面積" value={selectedItem.area ? `${selectedItem.area} ㎡ (約 ${(parseFloat(selectedItem.area) * 0.3025).toFixed(2)} 坪)` : "-"} />
                      </div>
                    </div>

                    {(selectedItem.buildingType || selectedItem.mainUse || selectedItem.buildCase) ? (
                      <div className="space-y-3 relative">
                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm">建物資訊</h3>
                        <div className="grid grid-cols-2 gap-px bg-slate-200/40 dark:bg-slate-800/50 rounded-[1.5rem] overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                          {selectedItem.buildCase && <DetailRow label="建案名稱" value={selectedItem.buildCase} fullWidth />}
                          <DetailRow label="建物型態" value={selectedItem.buildingType || "無"} />
                          <DetailRow label="移轉層次" value={selectedItem.floor ? `${selectedItem.floor} / ${selectedItem.totalFloor}` : "-"} />
                          <DetailRow label="主要用途" value={selectedItem.mainUse || "-"} />
                          <DetailRow label="主要建材" value={selectedItem.material || "-"} />
                          <DetailRow label="建築完成日" value={formatDate(selectedItem.completionDate)} />
                          <DetailRow label="管理組織" value={selectedItem.hasManagement || "-"} />
                          <DetailRow label="現況格局" value={
                            (selectedItem.rooms || selectedItem.halls || selectedItem.bathrooms) ? (
                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                {selectedItem.rooms && selectedItem.rooms !== '0' && <span className="flex items-center gap-1 bg-coral-500/10 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 px-2 py-0.5 rounded-full text-[10px] font-bold"><Bed className="w-3 h-3" /> {selectedItem.rooms} <span className="text-[9px] opacity-70">房</span></span>}
                                {selectedItem.halls && selectedItem.halls !== '0' && <span className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold"><Sofa className="w-3 h-3" /> {selectedItem.halls} <span className="text-[9px] opacity-70">廳</span></span>}
                                {selectedItem.bathrooms && selectedItem.bathrooms !== '0' && <span className="flex items-center gap-1 bg-blue-500/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold"><Bath className="w-3 h-3" /> {selectedItem.bathrooms} <span className="text-[9px] opacity-70">衛</span></span>}
                              </div>
                            ) : "-"
                          } fullWidth />
                        </div>
                      </div>
                    ) : null}

                    {selectedItem.parkingType ? (
                      <div className="space-y-3 relative">
                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm">車位資訊</h3>
                        <div className="grid grid-cols-2 gap-px bg-slate-200/40 dark:bg-slate-800/50 rounded-[1.5rem] overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                          <DetailRow label="車位類別" value={selectedItem.parkingType} />
                          <DetailRow label="車位總價" value={formatPrice(selectedItem.parkingPrice)} />
                          <DetailRow label="車位移轉面積" value={selectedItem.parkingArea ? `${selectedItem.parkingArea} ㎡ (約 ${(parseFloat(selectedItem.parkingArea) * 0.3025).toFixed(2)} 坪)` : "-"} />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Community Overview */}
                  {communityItems.length > 0 && communityChartData.length > 1 && (
                    <div className="space-y-3 relative pb-12">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm flex items-center gap-2">
                         <Building2 size={12} className="text-blue-500" /> 同社區/建案歷史紀錄 ({selectedItem.buildCase || '同路段相近建築'})
                      </h3>
                      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 shadow-sm overflow-hidden flex flex-col gap-6">
                         
                         {/* Header Stats */}
                         <div className="flex flex-wrap items-center justify-between gap-4">
                           <div className="flex flex-col gap-1">
                             <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">目前顯示紀錄</span>
                             <span className="text-2xl font-black text-ink dark:text-white leading-none">{communityChartData.length} <span className="text-sm font-bold text-slate-500">筆</span></span>
                           </div>
                           <div className="flex items-center gap-4">
                             <div className="flex flex-col items-end gap-1">
                               <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">最高單價</span>
                               <span className="text-sm font-black text-coral-600 dark:text-coral-400">{Math.max(...communityChartData.map(c => c.unitPrice)).toFixed(1)} <span className="text-[10px]">萬/坪</span></span>
                             </div>
                             <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/50" />
                             <div className="flex flex-col items-end gap-1">
                               <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">最低單價</span>
                               <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{Math.min(...communityChartData.map(c => c.unitPrice)).toFixed(1)} <span className="text-[10px]">萬/坪</span></span>
                             </div>
                           </div>
                         </div>

                         {/* Trend Chart */}
                         <div className="h-[180px] w-full -max-w-xs sm:max-w-none mt-2">
                            <Suspense fallback={<Skeleton className="h-full w-full rounded-2xl" />}>
                              <CommunityTrendChart data={communityChartData} />
                            </Suspense>
                         </div>
                         
                         {/* List of records */}
                         <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-slate-200/50 dark:border-slate-800">
                           <span className="text-[10px] font-bold text-slate-400 mb-1">近期成交明細</span>
                           <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 [scrollbar-width:thin]">
                             {[...communityChartData].reverse().map((record, i) => (
                               <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${record.isCurrent ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' : 'bg-white/40 dark:bg-slate-900/40 border-transparent hover:border-slate-200 dark:hover:border-slate-800'}`}>
                                 <div className="flex flex-col gap-0.5">
                                   <div className="flex items-center gap-2">
                                     <span className="text-xs font-bold text-slate-500">{record.date}</span>
                                     {record.isCurrent && <span className="px-1.5 py-[1px] bg-blue-500 text-white rounded text-[8px] font-bold">本戶</span>}
                                   </div>
                                   <span className="text-sm font-bold text-ink dark:text-slate-200 truncate max-w-[140px] sm:max-w-[200px]">{record.address}</span>
                                 </div>
                                 <div className="flex items-end flex-col gap-0.5 shrink-0">
                                   <span className="text-sm font-black text-ink dark:text-white leading-none">{record.unitPrice} <span className="text-[10px] font-bold text-slate-400">萬/坪</span></span>
                                   <span className="text-[10px] font-bold text-slate-500">{formatPrice(record.totalPrice.toString())} | {record.floor}</span>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                      </div>
                    </div>
                  )}

                  {/* Remarks */}
                  {selectedItem.remarks && (
                    <motion.div variants={modalItemVariants} className="space-y-3">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 drop-shadow-sm">備註</h3>
                      <div className="liquid-glass-input p-5 rounded-[1.5rem] text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-none prose prose-sm shadow-inner italic">
                         "{selectedItem.remarks}"
                      </div>
                    </motion.div>
                  )}

                  {/* 比較 / 附近 / 建案聚焦 */}
                  <motion.div variants={modalItemVariants} className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className={`rounded-xl text-xs font-bold ${
                        compareList.some((c) => c.id === selectedItem.id)
                          ? "border-coral-400/50 bg-coral-500/10 text-coral-600"
                          : ""
                      }`}
                      onClick={(e) => toggleCompare(selectedItem, e)}
                    >
                      {compareList.some((c) => c.id === selectedItem.id)
                        ? "已在比較清單（點擊移除）"
                        : `加入比較（${compareList.length}/${MAX_COMPARE}）`}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl text-xs font-bold"
                      onClick={() => setNearbyFromItem(selectedItem)}
                    >
                      <Crosshair size={14} className="mr-1.5" />
                      以此為中心找附近
                    </Button>
                    {selectedItem.buildCase && (
                      <Button
                        type="button"
                        variant="outline"
                        className={`rounded-xl text-xs font-bold ${
                          focusBuildCase === selectedItem.buildCase
                            ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : ""
                        }`}
                        onClick={() => {
                          if (focusBuildCase === selectedItem.buildCase) {
                            setFocusBuildCase(null);
                          } else {
                            setFocusBuildCase(selectedItem.buildCase || null);
                            setSearch(selectedItem.buildCase || "");
                            setSelectedItem(null);
                          }
                        }}
                      >
                        <Building size={14} className="mr-1.5" />
                        {focusBuildCase === selectedItem.buildCase ? "取消只看此建案" : "只看此建案"}
                      </Button>
                    )}
                  </motion.div>

                  {/* 房貸月付：用本筆登錄總價帶入試算，縮短查價→負擔評估路徑 */}
                  {typeName !== "租賃" && selectedItem.totalPrice && parseFloat(selectedItem.totalPrice) > 0 && (
                    <motion.div variants={modalItemVariants}>
                      <MortgageCalculatorCta
                        defaultPrice={Math.max(
                          100,
                          Math.round(parseFloat(selectedItem.totalPrice) / 10000)
                        )}
                      />
                    </motion.div>
                  )}

                  {/* 情境式導購：看完物件後的家具/家電/居家推薦（僅在設定連結時顯示） */}
                  <motion.div variants={modalItemVariants}>
                    <AffiliateChips title="入手這間房後，順手準備" />
                  </motion.div>
                </motion.div>
                
                {/* Bottom Liquid Glass Fade Mask */}
                <div 
                  className={`pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 to-transparent z-25 backdrop-blur-[1px] transition-opacity duration-300 ${
                    detailShowBottomMask ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </div>

              <div className="py-3 px-6 sm:py-4 sm:px-8 border-t border-slate-200/30 dark:border-slate-800/40 bg-white/25 dark:bg-slate-950/20 backdrop-blur-2xl flex justify-end shrink-0 z-10 transition-all">
                <Button 
                  onClick={() => setSelectedItem(null)}
                  variant="outline"
                  className="rounded-xl px-8 h-10 liquid-glass-button-primary shadow-lg border-white/10"
                >
                  確認並關閉
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog (Font size & customizable texts) */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl w-full p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Settings className="w-5 h-5 text-coral-500" />
              {appTexts.settingsTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {/* Font Size Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                {appTexts.textSizeSetting}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "small", label: appTexts.textSizeSmall, desc: appTexts.textSizeSmallDesc },
                  { value: "medium", label: appTexts.textSizeMedium, desc: appTexts.textSizeMediumDesc },
                  { value: "large", label: appTexts.textSizeLarge, desc: appTexts.textSizeLargeDesc },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFontSize(item.value as any)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      fontSize === item.value
                        ? "bg-coral-500/10 text-coral-600 dark:text-coral-400 border-coral-500/40 shadow-inner"
                        : "bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className={`font-bold ${item.value === 'small' ? 'text-xs' : item.value === 'medium' ? 'text-sm' : 'text-base'}`}>
                      {item.label.split(" (")[0]}
                    </span>
                    <span className="text-[10px] opacity-75">{item.value === 'small' ? 'Small' : item.value === 'medium' ? 'Medium' : 'Large'}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                {fontSize === "small" && appTexts.textSizeSmallDesc}
                {fontSize === "medium" && appTexts.textSizeMediumDesc}
                {fontSize === "large" && appTexts.textSizeLargeDesc}
              </p>
            </div>

            <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

            {/* Global Texts Customizable Editor */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider flex items-center justify-between">
                <span>編輯全域顯示文字 (Customize UI Labels)</span>
                <button 
                  onClick={() => {
                    if (window.confirm("確定要重設所有自訂文字嗎？")) {
                      updateAppTexts(DEFAULT_APP_TEXTS);
                    }
                  }}
                  className="text-[10px] text-coral-500 hover:underline font-bold"
                >
                  重設預設值
                </button>
              </label>

              <div className="max-h-[220px] overflow-y-auto pr-2 space-y-3.5 [scrollbar-width:thin]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">進階篩選按鈕</label>
                    <input
                      type="text"
                      value={appTexts.advancedSearch}
                      onChange={(e) => updateAppTexts({ advancedSearch: e.target.value })}
                      className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-xl focus:border-coral-500/40 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">清除篩選按鈕</label>
                    <input
                      type="text"
                      value={appTexts.clearAll}
                      onChange={(e) => updateAppTexts({ clearAll: e.target.value })}
                      className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-xl focus:border-coral-500/40 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">卡片 - 總價</label>
                    <input
                      type="text"
                      value={appTexts.totalPrice}
                      onChange={(e) => updateAppTexts({ totalPrice: e.target.value })}
                      className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-xl focus:border-coral-500/40 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">搜尋佔位符</label>
                    <input
                      type="text"
                      value={appTexts.searchPlaceholder}
                      onChange={(e) => updateAppTexts({ searchPlaceholder: e.target.value })}
                      className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-xl focus:border-coral-500/40 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">無資料提示文字</label>
                    <input
                      type="text"
                      value={appTexts.noData}
                      onChange={(e) => updateAppTexts({ noData: e.target.value })}
                      className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-xl focus:border-coral-500/40 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">載入中提示文字</label>
                    <input
                      type="text"
                      value={appTexts.loading}
                      onChange={(e) => updateAppTexts({ loading: e.target.value })}
                      className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-xl focus:border-coral-500/40 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-full h-11 bg-coral-500 hover:bg-coral-600 active:scale-[0.985] text-white font-bold tracking-wide rounded-xl shadow-md border border-transparent transition-all"
              >
                {appTexts.closeBtn}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Sharing Dialog */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-coral-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-coral-500/10 flex items-center justify-center text-coral-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">位置分享以優化定位</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location Services</p>
                </div>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed mb-4">
                是否允許本系統讀取並分享您的位置資訊？允許後將協助我們<b>自動帶入您附近的縣市與區域進行價格分析</b>，能大幅提升您的瀏覽體驗。若拒絕，本系統將依據估算網路基地台為您提供匿名的區域估測。
              </p>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setShowLocationModal(false);
                    localStorage.setItem("location_sharing_permisson_decision", "allow");
                    const loc = await triggerGpsLocation();
                    addAuditLog("location_permission_accept", "GPS Location Allowed", loc);
                    fetchData("", loc.county || undefined, loc.district || undefined);
                  }}
                  className="flex-1 py-1.5 px-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  是，啟用自動定位
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowLocationModal(false);
                    localStorage.setItem("location_sharing_permisson_decision", "deny");
                    const loc = await triggerBaseStationLocation();
                    addAuditLog("location_permission_deny", "Fallback to Base Station", loc);
                    fetchData("", loc.county || undefined, loc.district || undefined);
                  }}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  暫不分享
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Form Modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => {
              setShowFeedback(false);
              addAuditLog("feedback_modal_close", "click_outside");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-coral-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-coral-500/10 flex items-center justify-center text-coral-500">
                    <MessageSquare className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">系統改進與意見回饋</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Feedback & System Improvements</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedback(false);
                    addAuditLog("feedback_modal_close", "click_close_btn");
                  }}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-coral-500 hover:bg-coral-500/10 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {feedbackStatus === "success" ? (
                <motion.div 
                  initial={{ scale: 0.9 }} 
                  animate={{ scale: 1 }} 
                  className="py-6 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">謝謝您的回饋！</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mb-4">
                    資料已成功送出並寫入資料庫，我們非常感謝您抽空提供建議，本系統將因您的回饋獲得最佳改善！
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFeedback(false);
                      setFeedbackStatus("idle");
                      setFeedbackContent("");
                    }}
                    className="py-1.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-755 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    關閉視窗
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!feedbackContent.trim()) return;

                  setFeedbackStatus("submitting");
                  addAuditLog("feedback_submit_attempt", feedbackCategory);

                  try {
                    const res = await fetch("/api/feedback", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        category: feedbackCategory,
                        content: feedbackContent,
                        contact: feedbackContact || null,
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        county: userLocation.county,
                        district: userLocation.district,
                        location_method: userLocation.location_method,
                      })
                    });

                    if (res.ok) {
                      setFeedbackStatus("success");
                      addAuditLog("feedback_submit_success", feedbackCategory);
                    } else {
                      const data = await res.json();
                      throw new Error(data.error || "送出失敗，請稍後重試");
                    }
                  } catch (err: any) {
                    setFeedbackStatus("error");
                    setFeedbackErrorMsg(err.message || "網路連線異常");
                    addAuditLog("feedback_submit_error", err.message);
                  }
                }} className="flex flex-col gap-3.5">
                  
                  {/* Category Chips Selection */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 block">
                      意見分類 (Category) *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {["系統錯誤", "功能建議", "介面優化", "其它"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFeedbackCategory(cat)}
                          className={`py-1.5 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            feedbackCategory === cat
                              ? "bg-coral-500/10 text-coral-500 border-coral-500/30"
                              : "bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-350 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions Textarea */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">
                      詳細內容描述 (Content) *
                    </label>
                    <textarea
                      required
                      value={feedbackContent}
                      onChange={(e) => setFeedbackContent(e.target.value)}
                      placeholder="請詳述您遇見的狀況或對系統的想法..."
                      rows={4}
                      className="w-full text-xs font-medium p-3 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-xl focus:border-coral-500/40 focus:ring-1 focus:ring-coral-500/20 outline-none transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  {/* Contact Information */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">
                      聯絡方式 (Contact - Optional)
                    </label>
                    <input
                      type="text"
                      value={feedbackContact}
                      onChange={(e) => setFeedbackContact(e.target.value)}
                      placeholder="Email 或 手機號碼 (方便我們向您回報進度)"
                      className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-xl focus:border-coral-500/40 focus:ring-1 focus:ring-coral-500/20 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>



                  {feedbackStatus === "error" && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{feedbackErrorMsg || "送出失敗，請重試"}</span>
                    </div>
                  )}

                  {/* Footer Buttons */}
                  <div className="flex gap-2 mt-1">
                    <button
                      type="submit"
                      disabled={feedbackStatus === "submitting" || !feedbackContent.trim()}
                      className="flex-1 py-1.5 px-4 bg-coral-500 hover:bg-coral-600 disabled:bg-coral-500/50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {feedbackStatus === "submitting" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          處理中...
                        </>
                      ) : "送出回饋"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFeedback(false);
                        setFeedbackStatus("idle");
                        addAuditLog("feedback_modal_close", "click_cancel");
                      }}
                      className="py-1.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CompareBar
        items={compareList}
        onRemove={(id) => setCompareList((prev) => prev.filter((p) => p.id !== id))}
        onClear={() => setCompareList([])}
        onSelectItem={setSelectedItem}
      />

      <AnimatePresence>
        {compareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 shadow-lg dark:border-amber-500/30 dark:bg-amber-950 dark:text-amber-100"
          >
            {compareToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value, fullWidth = false }: { label: string; value: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={`flex flex-col p-3 sm:p-4 bg-white/80 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 group ${fullWidth ? 'col-span-2' : ''}`}>
      <span className="text-slate-500 dark:text-slate-400 font-bold group-hover:text-coral-500 transition-colors uppercase text-[9px] sm:text-[10px] tracking-widest mb-0.5">{label}</span>
      <div className="text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm tracking-tight break-all select-text">{value || "-"}</div>
    </div>
  );
}
