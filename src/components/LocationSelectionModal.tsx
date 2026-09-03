import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Search, X } from "lucide-react";
import { CITIES, CITY_DISTRICTS } from "../constants";
import { FEATURED_CITY_NAMES } from "../constants/app-ui";

interface LocationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  setCityName: (city: string) => void;
  district: string;
  setDistrict: (district: string) => void;
}

export const LocationSelectionModal: React.FC<LocationSelectionModalProps> = ({
  isOpen,
  onClose,
  cityName,
  setCityName,
  district,
  setDistrict
}) => {
  const [internalCity, setInternalCity] = useState(cityName);
  const [searchQuery, setSearchQuery] = useState("");

  // Update internal state when opened
  useEffect(() => {
    if (isOpen) {
      setInternalCity(cityName);
      setSearchQuery("");
    }
  }, [isOpen, cityName]);

  const currentDistricts = CITY_DISTRICTS[internalCity] || [];
  
  // Apply Search
  const filteredCities = CITIES.filter(c => 
    c.name.includes(searchQuery) || 
    (CITY_DISTRICTS[c.name] || []).some(d => d.name.includes(searchQuery))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-scrim/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
        className="w-full h-[85vh] sm:h-[80vh] sm:max-h-[600px] sm:max-w-[500px] bg-surface-container-high text-on-surface shadow-[var(--md-elevation-3)] rounded-[28px] overflow-hidden flex flex-col border border-outline-variant/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">選擇區域</h2>
              <p className="text-xs text-on-surface-variant font-medium">請選擇你要探索的地點</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="關閉"
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-on-surface/8 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="搜尋縣市或鄉鎮..."
              className="w-full h-11 bg-surface-container-highest rounded-full pl-10 pr-4 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/60 outline-none border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 熱門城市快選 */}
        <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
          <span className="mr-1 text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase">熱門</span>
          {FEATURED_CITY_NAMES.map((featured) => (
            <button
              key={featured}
              type="button"
              onClick={() => {
                setCityName(featured);
                setDistrict("全部");
                onClose();
              }}
              className={`h-8 rounded-full px-3 text-xs font-semibold transition-all ${
                cityName === featured
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
              }`}
            >
              {featured}
            </button>
          ))}
        </div>

        {/* 2-Column Selectors */}
        <div className="flex flex-1 overflow-hidden border-t border-outline-variant/30">
          {/* Left Column: Cities */}
          <div className="w-[140px] bg-surface-container overflow-y-auto no-scrollbar py-2">
            {filteredCities.length === 0 ? (
              <div className="text-center py-4 text-on-surface-variant text-xs font-medium">無結果</div>
            ) : (
              filteredCities.map(c => (
                <button
                  key={c.name}
                  onClick={() => setInternalCity(c.name)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                    internalCity === c.name 
                      ? 'bg-primary-container text-on-primary-container font-bold' 
                      : 'text-on-surface-variant font-medium hover:bg-on-surface/8 hover:text-on-surface'
                  }`}
                >
                  <span className="text-sm tracking-wide">{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    internalCity === c.name ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {CITY_DISTRICTS[c.name]?.length || 0}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Right Column: Districts */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-2 bg-surface px-2 scroll-smooth">
            {filteredCities.some(c => c.name === internalCity) && (
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setCityName(internalCity);
                    setDistrict("全部");
                    onClose();
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-full transition-colors text-sm font-semibold ${
                    district === "全部" && cityName === internalCity
                      ? "bg-secondary-container text-on-secondary-container"
                      : "text-on-surface hover:bg-surface-container-highest"
                  }`}
                >
                  <span className="tracking-wide">全部</span>
                </button>
                
                {currentDistricts
                  .filter(d => d.name.includes(searchQuery))
                  .map(d => {
                    const isSelected = cityName === internalCity && district === d.name;
                    return (
                      <button
                        key={d.name}
                        onClick={() => {
                          setCityName(internalCity);
                          setDistrict(d.name);
                          onClose();
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-full transition-colors text-sm font-medium relative flex items-center justify-between ${
                          isSelected
                            ? "bg-secondary-container text-on-secondary-container font-semibold"
                            : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                        }`}
                      >
                        <span className="tracking-wide">{d.name}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
};
