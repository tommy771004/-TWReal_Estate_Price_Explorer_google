/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Table2,
} from "lucide-react";
import { CITIES, TRANSACTION_TYPES, CITY_DISTRICTS } from "./constants";
import { DEFAULT_APP_TEXTS, type AppTexts } from "./constants/texts";
import { LocationSelectionModal } from "./components/LocationSelectionModal";
import { TransactionCard } from "./components/TransactionCard";
import { AffiliateMarquee } from "./components/AffiliateMarquee";
import { SiteNav } from "./components/SiteNav";
import { useGeocoding } from "./hooks/useGeocoding";
import { 
  YEARS, 
  MONTHS, 
  getPeriodValue, 
  getPeriodFromValue, 
  formatPrice, 
  formatDate, 
  getDefaultPeriod,
  formatPeriodLabel,
  isDefaultPeriod,
  exportTransactionsCsv,
  formatCachedAtLabel,
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
// Table icon used for results table view
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
import { CompareBar, MAX_COMPARE, buildCompareQueryParam, parseCompareIdsFromSearch } from "./components/CompareBar";
import { QueryAssistBar } from "./components/QueryAssistBar";
import { ResultDeltaBanner } from "./components/ResultDeltaBanner";
import { GeocodeProgress } from "./components/GeocodeProgress";
import type { QueryPreset, QueryPresetId } from "./constants/queryPresets";
import {
  buildFilterSnapshotKey,
  buildResultSnapshot,
  loadSnapshots,
  saveSnapshot,
  diffSnapshot,
  exportUserDataBundle,
  downloadJsonFile,
  parseUserDataImport,
  type SnapshotDelta,
} from "./lib/userDataPortability";
import { useFilteredTransactions } from "./hooks/useFilteredTransactions";
import { useMarketAnalytics } from "./hooks/useMarketAnalytics";
import { SeoAboutSection } from "./components/explorer/SeoAboutSection";
import { SettingsDialog } from "./components/explorer/SettingsDialog";
import { FeedbackModal } from "./components/explorer/FeedbackModal";
import { TransactionDetailDialog } from "./components/explorer/TransactionDetailDialog";
import { TrendDistrictDialog } from "./components/explorer/TrendDistrictDialog";
import { MarketHeader } from "./components/explorer/MarketHeader";
import { SearchFilterPanel } from "./components/explorer/SearchFilterPanel";
import { ResultsWorkspace } from "./components/explorer/ResultsWorkspace";
import { ExplorerUiProvider } from "./components/explorer/ExplorerUiContext";
import { useFetchRealEstate } from "./hooks/useFetchRealEstate";
import type { SavedSearch, ViewMode } from "./types/app";
import { FEATURED_CITY_NAMES } from "./constants/app-ui";
import { PinnedKpiCompare } from "./components/PinnedKpiCompare";
import {
  formatSnapshotLabel,
  type PinnedMarketSnapshot,
} from "./utils/market-snapshot";

const ResultsCharts = lazy(() => import("./components/ResultsCharts"));
const ResultsMap = lazy(() => import("./components/MapViews"));

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
  /** 預設排除親友／關係人等特殊交易，避免扭曲行情 */
  const [excludeSpecial, setExcludeSpecial] = useState(true);
  /** 總價上限（萬元），預算反查用 */
  const [totalPriceMaxWan, setTotalPriceMaxWan] = useState("");
  const [activePresetId, setActivePresetId] = useState<QueryPresetId | null>(null);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");
  const [compareShareStatus, setCompareShareStatus] = useState<"idle" | "copied" | "error">("idle");
  const [resultDelta, setResultDelta] = useState<SnapshotDelta | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement | null>(null);
  /** 從 URL ?cmp= 待還原的比較 id */
  const pendingCompareIdsRef = useRef<string[]>(
    typeof window !== "undefined" ? parseCompareIdsFromSearch(window.location.search) : []
  );
  /** 避免同一條件反覆寫快照造成無限 diff */
  const lastSnapshotWrittenKey = useRef<string>("");
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
  const [viewMode, setViewMode] = useState<ViewMode>("list");
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
  const imageSliderRef = React.useRef<HTMLDivElement>(null);
  const sortScrollRef = React.useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const scrollSort = (direction: 'left' | 'right') => {
    if (sortScrollRef.current) {
      const scrollAmount = 200;
      sortScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const [dataSource, setDataSource] = useState<string | null>(null);
  const [dataCachedAt, setDataCachedAt] = useState<string | null>(null);
  /** 詳情房貸試算（等額本息，僅前端估算） */
  const [mortgageLtv, setMortgageLtv] = useState(0.8);
  const [mortgageYears, setMortgageYears] = useState(30);
  const [mortgageRate, setMortgageRate] = useState(2.1);

  const { fetchData } = useFetchRealEstate({
    cityName,
    typeName,
    district,
    search,
    propertyTypes,
    period,
    unitPrice,
    area,
    age,
    setCityName,
    setDistrict,
    setSearch,
    setData,
    setLoading,
    setError,
    setDataSource,
    setDataCachedAt,
    setRobotStatus,
    setIsSearchExpanded,
    addRecentSearch,
    addAuditLog,
    fetchTrendingSearches,
  });

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


  // 僅掛載時初始化一次（勿把 fetchData 放進 deps，否則參數變動會重跑 + 舊版 isFetching 互鎖卡 loading）
  useEffect(() => {
    let cancelled = false;
    const initLocationAndFetch = async () => {
      const decision = localStorage.getItem("location_sharing_permisson_decision");
      let activeLoc: UserLocation;
      if (decision === "allow") {
        activeLoc = await triggerGpsLocation();
      } else if (decision === "deny") {
        activeLoc = await triggerBaseStationLocation();
      } else {
        setShowLocationModal(true);
        activeLoc = await triggerBaseStationLocation();
      }
      if (cancelled) return;
      fetchData("", activeLoc.county || undefined, activeLoc.district || undefined);
      fetchTrendingSearches();
      addAuditLog("app_mount", "User opened price explorer", activeLoc);
    };
    initLocationAndFetch();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only bootstrap
  }, []);

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

  const filteredData = useFilteredTransactions({
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
  });

  const {
    districtAveragePrices,
    historyCounts,
    priceDistribution,
    priceTrend,
    aggregatedPreSaleData,
    marketSnapshot: marketSnapshotFromHook,
  } = useMarketAnalytics(data, filteredData, typeName);


  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortConfig, district, propertyTypes, period, unitPrice, area, age, cityName, excludeSpecial, roomsMin, hasManagement, parkingFilter, nearbyKm, focusBuildCase, totalPriceMaxWan]);

  // URL ?cmp= 在資料就緒後還原比較清單
  useEffect(() => {
    const ids = pendingCompareIdsRef.current;
    if (!ids.length || data.length === 0) return;
    const found = ids
      .map((id) => data.find((d) => d.id === id))
      .filter((x): x is Transaction => Boolean(x))
      .slice(0, MAX_COMPARE);
    if (found.length > 0) {
      setCompareList(found);
      pendingCompareIdsRef.current = [];
    }
  }, [data]);

  const applyQueryPreset = React.useCallback((preset: QueryPreset) => {
    setActivePresetId(preset.id);
    setTypeName(preset.typeName);
    setPropertyTypes([...preset.propertyTypes]);
    setRoomsMin(preset.roomsMin);
    setAge({ ...preset.age });
    setUnitPrice({ ...preset.unitPrice });
    setArea({ ...preset.area });
    setHasManagement(preset.hasManagement);
    setParkingFilter(preset.parking);
    setExcludeSpecial(preset.excludeSpecial);
    setTotalPriceMaxWan("");
    setFocusBuildCase(null);
    if (preset.typeName === "預售屋") setViewMode("aggregated");
    else setViewMode("list");
    setIsAdvancedSearchOpen(true);
    setIsSearchExpanded(true);
  }, []);

  const applyBudgetWan = React.useCallback((maxWan: number) => {
    setTotalPriceMaxWan(String(maxWan));
    setActivePresetId(null);
    setIsSearchExpanded(true);
  }, []);

  const copyCompareShareLink = React.useCallback(async () => {
    if (typeof window === "undefined" || compareList.length === 0) return;
    const base = buildShareableUrl(
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
    const cmp = buildCompareQueryParam(compareList.map((c) => c.id));
    const url = base.includes("?") ? `${base}&${cmp}` : `${base}?${cmp}`;
    try {
      await navigator.clipboard.writeText(url);
      setCompareShareStatus("copied");
      addAuditLog("share_compare", JSON.stringify({ count: compareList.length }));
    } catch {
      setCompareShareStatus("error");
    }
    window.setTimeout(() => setCompareShareStatus("idle"), 2000);
  }, [
    compareList,
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

  // 條件結果快照：與上次同條件查詢比對筆數／中位價
  useEffect(() => {
    if (loading || data.length === 0) return;
    if (filteredData.length === 0 && data.length === 0) return;

    const key = buildFilterSnapshotKey({
      cityName,
      typeName,
      district,
      periodLabel: formatPeriodLabel(period),
      search,
      totalPriceMaxWan,
    });
    const label = `${cityName}${district !== "全部" ? `·${district}` : ""} ${typeName} ${formatPeriodLabel(period)}`;
    const current = buildResultSnapshot(key, label, filteredData);
    const prevMap = loadSnapshots();
    const previous = prevMap[key];
    const delta = diffSnapshot(previous, current);
    if (delta) setResultDelta(delta);

    // 寫入新快照（同一 key 短時間內不重複寫）
    if (lastSnapshotWrittenKey.current !== `${key}:${current.count}`) {
      saveSnapshot(current);
      lastSnapshotWrittenKey.current = `${key}:${current.count}`;
    }
  }, [
    loading,
    data.length,
    filteredData,
    cityName,
    typeName,
    district,
    period,
    search,
    totalPriceMaxWan,
  ]);

  const exportLocalUserData = React.useCallback(() => {
    const text = exportUserDataBundle({
      favorites,
      savedSearches,
      compare: compareList,
      pinnedKpis,
      snapshots: Object.values(loadSnapshots()),
    });
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJsonFile(`tw-real-estate-backup-${stamp}.json`, text);
    addAuditLog("export_user_data", JSON.stringify({ favorites: favorites.length, saved: savedSearches.length }));
  }, [favorites, savedSearches, compareList, pinnedKpis, addAuditLog]);

  const importLocalUserData = React.useCallback(
    async (file: File) => {
      try {
        const raw = await file.text();
        const result = parseUserDataImport(raw);
        if (!result.ok || !result.data) {
          setImportStatus(result.error || "匯入失敗");
          return;
        }
        const d = result.data;
        if (d.favorites.length) {
          setFavorites(d.favorites);
          try {
            localStorage.setItem("explorer_favorites", JSON.stringify(d.favorites));
          } catch {
            /* ignore */
          }
        }
        if (d.savedSearches.length) {
          setSavedSearches(d.savedSearches as SavedSearch[]);
          try {
            localStorage.setItem("explorer_saved_searches", JSON.stringify(d.savedSearches));
          } catch {
            /* ignore */
          }
        }
        if (d.compare.length) {
          setCompareList(d.compare.slice(0, MAX_COMPARE));
        }
        if (Array.isArray(d.pinnedKpis) && d.pinnedKpis.length) {
          setPinnedKpis(d.pinnedKpis as any);
        }
        setImportStatus(
          `已匯入：收藏 ${d.favorites.length}、條件 ${d.savedSearches.length}、比較 ${d.compare.length}`
        );
        addAuditLog(
          "import_user_data",
          JSON.stringify({
            favorites: d.favorites.length,
            saved: d.savedSearches.length,
            compare: d.compare.length,
          })
        );
        window.setTimeout(() => setImportStatus(null), 4000);
      } catch {
        setImportStatus("讀取檔案失敗");
      }
    },
    [addAuditLog]
  );

  const handleSort = (key: keyof Transaction) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const marketSnapshot = marketSnapshotFromHook;

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

  const explorerUi = {
    cityName, setCityName, typeName, setTypeName, district, setDistrict,
    search, setSearch, propertyTypes, setPropertyTypes,
    period, setPeriod, unitPrice, setUnitPrice, area, setArea, age, setAge,
    roomsMin, setRoomsMin, hasManagement, setHasManagement,
    parkingFilter, setParkingFilter, excludeSpecial, setExcludeSpecial,
    totalPriceMaxWan, setTotalPriceMaxWan, activePresetId, setActivePresetId,
    nearbyKm, setNearbyKm, nearbyAnchor, setNearbyAnchor,
    focusBuildCase, setFocusBuildCase, userLocation,
    isSearchExpanded, setIsSearchExpanded, isAdvancedSearchOpen, setIsAdvancedSearchOpen,
    isLocationModalOpen, setIsLocationModalOpen, showLocationModal, setShowLocationModal,
    showSuggestions, setShowSuggestions, loading, robotStatus,
    appTexts, viewMode, setViewMode,
    data, filteredData, paginatedData, dataSource, dataCachedAt,
    error, fetchData, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    totalPages, sortConfig, setSortConfig, handleSort, scrollSort, sortScrollRef,
    resultsContainerRef,
    addressSuggestions, recentSearches, clearRecentSearches, trendingSearches,
    handleTrendingClick, savedSearches, applySavedSearch, deleteSavedSearch,
    isSavingSearch, setIsSavingSearch, newSearchName, setNewSearchName, saveCurrentSearch,
    applyQueryPreset, applyBudgetWan,
    marketSnapshot, marketKpis, pinCurrentMarket, pinnedKpis, setPinnedKpis,
    priceDistribution, priceTrend, aggregatedPreSaleData, showChartsMobile, setShowChartsMobile,
    resultDelta, setResultDelta, isGeocoding, geocodedCount, totalToGeocode,
    districtAveragePrices, historyCounts, globalFacilities,
    favorites, toggleFavorite, compareList, toggleCompare,
    setSelectedItem, setTrendDistrict, setNearbyFromItem,
    mapLayer, setMapLayer, showFacilities, setShowFacilities,
    shareStatus, copyShareLink, handleExportCsv,
    districts: (CITY_DISTRICTS[cityName] || []).map((d) => d.name),
  };

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
        {/* Header + explorer workspace */}
        <div className="px-4 sm:px-6 pt-6 pb-2 shrink-0 relative z-20 w-full">
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
                <button 
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "table" ? "bg-coral-500 text-white shadow-md" : "text-slate-500 hover:text-ink dark:hover:text-white"}`}
                >
                  <Table2 size={14} /> 表格視圖
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

          <ExplorerUiProvider value={explorerUi}>
          <MarketHeader
            cityName={cityName}
            district={district}
            typeName={typeName}
            filteredCount={filteredData.length}
            dataSource={dataSource}
            dataCachedAt={dataCachedAt}
            excludeSpecial={excludeSpecial}
            marketSnapshotCount={marketSnapshot.count}
            marketKpis={marketKpis}
            pinCurrentMarket={pinCurrentMarket}
            onSelectCity={(city) => {
              setCityName(city);
              setDistrict("全部");
              setIsSearchExpanded(true);
            }}
          />

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

          <SearchFilterPanel />

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
                  onChange={(e) => setNewSearchName(e.target.value)}
                  className="liquid-glass-input border-none h-12 rounded-xl text-md font-bold"
                  onKeyDown={(e) => e.key === "Enter" && saveCurrentSearch()}
                />
                <div className="pt-2 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setIsSavingSearch(false)} className="rounded-xl font-bold">
                    取消
                  </Button>
                  <Button
                    onClick={saveCurrentSearch}
                    disabled={!newSearchName.trim()}
                    className="bg-coral-600 hover:bg-coral-500 text-white rounded-xl font-bold px-6"
                  >
                    儲存設定
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <ResultsWorkspace />
          </ExplorerUiProvider>
        </div>

        <SeoAboutSection />
      </motion.div>

      <TrendDistrictDialog
        trendDistrict={trendDistrict}
        onClose={() => setTrendDistrict(null)}
        data={data}
      />

      <TransactionDetailDialog
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        cityName={cityName}
        typeName={typeName}
        buildingImages={buildingImages}
        isBuildingImagesLoading={isBuildingImagesLoading}
        imageSliderRef={imageSliderRef}
        detailShowTopMask={detailShowTopMask}
        detailShowBottomMask={detailShowBottomMask}
        onDetailShowTopMask={setDetailShowTopMask}
        onDetailShowBottomMask={setDetailShowBottomMask}
        communityItems={communityItems}
        communityChartData={communityChartData}
        mortgageLtv={mortgageLtv}
        mortgageYears={mortgageYears}
        mortgageRate={mortgageRate}
        onMortgageLtvChange={setMortgageLtv}
        onMortgageYearsChange={setMortgageYears}
        onMortgageRateChange={setMortgageRate}
        compareList={compareList}
        toggleCompare={toggleCompare}
        setNearbyFromItem={setNearbyFromItem}
        focusBuildCase={focusBuildCase}
        onFocusBuildCase={setFocusBuildCase}
        onSearch={setSearch}
      />

      <SettingsDialog
        open={isSettingsModalOpen}
        onOpenChange={setIsSettingsModalOpen}
        appTexts={appTexts}
        updateAppTexts={updateAppTexts}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onExport={exportLocalUserData}
        onImportClick={() => importFileRef.current?.click()}
        importFileRef={importFileRef}
        onImportFile={(f) => void importLocalUserData(f)}
        importStatus={importStatus}
      />

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
      <FeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        category={feedbackCategory}
        setCategory={setFeedbackCategory}
        content={feedbackContent}
        setContent={setFeedbackContent}
        contact={feedbackContact}
        setContact={setFeedbackContact}
        status={feedbackStatus}
        setStatus={setFeedbackStatus}
        errorMsg={feedbackErrorMsg}
        userLocation={userLocation}
        addAuditLog={addAuditLog}
      />

      <CompareBar
        items={compareList}
        onRemove={(id) => setCompareList((prev) => prev.filter((p) => p.id !== id))}
        onClear={() => setCompareList([])}
        onSelectItem={setSelectedItem}
        onShareCompare={copyCompareShareLink}
        shareStatus={compareShareStatus}
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

