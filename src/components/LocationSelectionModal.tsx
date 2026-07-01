import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Search, X } from "lucide-react";
import { CITIES, CITY_DISTRICTS } from "../constants";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-slate-950/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full sm:h-[80vh] sm:max-h-[600px] sm:max-w-[500px] bg-white dark:bg-slate-900 shadow-2xl sm:rounded-[2rem] overflow-hidden flex flex-col border border-slate-200 dark:border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-500/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-coral-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">選擇區域</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">請選擇你要探索的地點</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="搜尋縣市或鄉鎮..."
              className="w-full h-10 bg-slate-100 dark:bg-slate-800/80 rounded-xl pl-9 pr-4 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 outline-none border border-transparent focus:border-coral-500/50 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 2-Column Selectors */}
        <div className="flex flex-1 overflow-hidden border-t border-slate-100 dark:border-white/5">
          {/* Left Column: Cities */}
          <div className="w-[140px] bg-slate-50 dark:bg-slate-800/30 overflow-y-auto no-scrollbar py-2">
            {filteredCities.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-xs font-bold">無結果</div>
            ) : (
              filteredCities.map(c => (
                <button
                  key={c.name}
                  onClick={() => setInternalCity(c.name)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                    internalCity === c.name 
                      ? 'bg-coral-50 dark:bg-coral-600 font-bold text-coral-600 dark:text-white relative' 
                      : 'text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="text-[15px] tracking-widest">{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    internalCity === c.name ? 'bg-coral-100 dark:bg-white/20 text-coral-600 dark:text-white' : 'bg-slate-200 dark:bg-slate-700/50 text-slate-500'
                  }`}>
                    {CITY_DISTRICTS[c.name]?.length || 0}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Right Column: Districts */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-2 bg-white dark:bg-slate-900/50 px-2 scroll-smooth">
            {filteredCities.some(c => c.name === internalCity) && (
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setCityName(internalCity);
                    setDistrict("全部");
                    onClose();
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl transition-colors font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                >
                  <span className="text-[15px] tracking-widest">全部</span>
                </button>
                
                {currentDistricts
                  .filter(d => d.name.includes(searchQuery))
                  .map(d => (
                  <button
                    key={d.name}
                    onClick={() => {
                      setCityName(internalCity);
                      setDistrict(d.name);
                      onClose();
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl transition-colors font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white relative"
                  >
                    <span className="text-[15px] tracking-widest">{d.name}</span>
                    {cityName === internalCity && district === d.name && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-coral-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
};
