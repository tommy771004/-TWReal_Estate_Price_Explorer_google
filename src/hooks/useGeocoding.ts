import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { Transaction } from "../types/real-estate";

interface UseGeocodingProps {
  cityName: string;
  filteredData: Transaction[];
  data: Transaction[];
  setData: Dispatch<SetStateAction<Transaction[]>>;
  selectedItem: Transaction | null;
  setSelectedItem: Dispatch<SetStateAction<Transaction | null>>;
  search: string;
  district: string;
}

export const useGeocoding = ({
  cityName,
  filteredData,
  data,
  setData,
  selectedItem,
  setSelectedItem,
  search,
  district,
}: UseGeocodingProps) => {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedCount, setGeocodedCount] = useState(0);
  const [totalToGeocode, setTotalToGeocode] = useState(0);

  const locationCache = useRef<Record<string, { lat: number; lng: number }>>({});

  // Load cache
  useEffect(() => {
    try {
      const savedCache = localStorage.getItem("real_estate_loc_cache");
      if (savedCache) {
        locationCache.current = JSON.parse(savedCache);
      }
    } catch (e) {
      console.warn("Could not read geocoding cache from localStorage:", e);
    }
  }, []);

  // Save cache helper
  const saveCache = () => {
    try {
      localStorage.setItem("real_estate_loc_cache", JSON.stringify(locationCache.current));
    } catch (e) {
      console.warn("Could not write geocoding cache to localStorage:", e);
    }
  };

  // Batch geocoding forfilteredData on map view or general list changes
  useEffect(() => {
    if (filteredData.length === 0) return;

    const maxToGeocode = 40;
    const itemsToProcess = filteredData.slice(0, maxToGeocode);

    // Check if we already have precision for these items
    const needsGeocoding = itemsToProcess.filter((item) => {
      const cleanedAddress = item.address.replace(/(\d+)\s*[~～-]\s*\d+[號號]?/g, "$1號");
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

      itemsToProcess.forEach((item) => {
        const cleanedAddress = item.address.replace(/(\d+)\s*[~～-]\s*\d+[號號]?/g, "$1號");
        const cacheKey = `${cityName}${item.district}${cleanedAddress}`;
        if (locationCache.current[cacheKey]) {
          const { lat, lng } = locationCache.current[cacheKey];
          const idx = updatedFullData.findIndex((p) => p.id === item.id);
          if (
            idx !== -1 &&
            (!updatedFullData[idx].lat ||
              updatedFullData[idx].lat === 0 ||
              updatedFullData[idx].lat.toString().includes("."))
          ) {
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

      const batchSize = 1; // Strict Nominatim compliance (1 req/sec)

      for (let i = 0; i < needsGeocoding.length; i += batchSize) {
        if (!active) break;
        const currentBatch = needsGeocoding.slice(i, i + batchSize);

        await Promise.all(
          currentBatch.map(async (item) => {
            try {
              const cleanedAddress = item.address.replace(/(\d+)\s*[~～-]\s*\d+[號號]?/g, "$1號");
              const cacheKey = `${cityName}${item.district}${cleanedAddress}`;

              const query = encodeURIComponent(`${cityName}${item.district}${cleanedAddress}`);
              const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
                {
                  headers: { "Accept-Language": "zh-TW", "User-Agent": "TaiwanRealEstate/1.0" },
                }
              );

              if (!response.ok) return;
              const results = await response.json();

              if (results && results.length > 0 && active) {
                const lat = parseFloat(results[0].lat);
                const lng = parseFloat(results[0].lon);
                locationCache.current[cacheKey] = { lat, lng };
                setData((prev) =>
                  prev.map((p) => (p.id === item.id ? { ...p, lat, lng } : p))
                );
              }
            } catch (e) {
              console.warn(`Geocoding failed for ${item.address}:`, e);
            } finally {
              if (active) setGeocodedCount((prev) => prev + 1);
            }
          })
        );

        saveCache();
        if (i + batchSize < needsGeocoding.length && active) {
          await new Promise((r) => setTimeout(r, 1200));
        }
      }
      if (active) setIsGeocoding(false);
    };

    geocodeBatch();
    return () => {
      active = false;
    };
  }, [filteredData.length, cityName, search, district]);

  // Priority geocoding for single selectedItem
  useEffect(() => {
    if (!selectedItem || (selectedItem.lat !== undefined && selectedItem.lng !== undefined)) return;

    const geocodeSingle = async () => {
      try {
        const cleanedAddress = selectedItem.address.replace(/(\d+)\s*[~～-]\s*\d+[號號]?/g, "$1號");
        const cacheKey = `${cityName}${selectedItem.district}${cleanedAddress}`;

        // Check Cache first
        if (locationCache.current[cacheKey]) {
          const { lat, lng } = locationCache.current[cacheKey];
          setData((prev) =>
            prev.map((p) => (p.id === selectedItem.id ? { ...p, lat, lng } : p))
          );
          setSelectedItem((prev) =>
            prev && prev.id === selectedItem.id ? { ...prev, lat, lng } : prev
          );
          return;
        }

        // Priority 1: Full cleaned address
        const query = encodeURIComponent(`${cityName}${selectedItem.district}${cleanedAddress}`);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
          {
            headers: { "Accept-Language": "zh-TW", "User-Agent": "TaiwanRealEstate/1.0" },
          }
        );
        const results = await response.json();

        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);

          locationCache.current[cacheKey] = { lat, lng };
          saveCache();

          setData((prev) =>
            prev.map((p) => (p.id === selectedItem.id ? { ...p, lat, lng } : p))
          );
          setSelectedItem((prev) =>
            prev && prev.id === selectedItem.id ? { ...prev, lat, lng } : prev
          );
        } else {
          // Priority 2: Road name only
          const roadName = cleanedAddress.split(/[0-9]/)[0];
          if (roadName && roadName.length > 2) {
            const roadQuery = encodeURIComponent(`${cityName}${selectedItem.district}${roadName}`);
            const rResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${roadQuery}&limit=1`,
              {
                headers: { "Accept-Language": "zh-TW", "User-Agent": "TaiwanRealEstate/1.0" },
              }
            );
            const rResults = await rResponse.json();
            if (rResults && rResults.length > 0) {
              const lat = parseFloat(rResults[0].lat);
              const lng = parseFloat(rResults[0].lon);
              setData((prev) =>
                prev.map((p) => (p.id === selectedItem.id ? { ...p, lat, lng } : p))
              );
              setSelectedItem((prev) =>
                prev && prev.id === selectedItem.id ? { ...prev, lat, lng } : prev
              );
              return;
            }
          }

          // Fallback to district if all fails
          const districtQuery = encodeURIComponent(`${cityName}${selectedItem.district}`);
          const dResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${districtQuery}&limit=1`,
            {
              headers: { "Accept-Language": "zh-TW", "User-Agent": "TaiwanRealEstate/1.0" },
            }
          );
          const dResults = await dResponse.json();
          if (dResults && dResults.length > 0) {
            const lat = parseFloat(dResults[0].lat);
            const lng = parseFloat(dResults[0].lon);
            setData((prev) =>
              prev.map((p) => (p.id === selectedItem.id ? { ...p, lat, lng } : p))
            );
            setSelectedItem((prev) =>
              prev && prev.id === selectedItem.id ? { ...prev, lat, lng } : prev
            );
          } else {
            setSelectedItem((prev) =>
              prev && prev.id === selectedItem.id ? { ...prev, lat: 0, lng: 0 } : prev
            );
          }
        }
      } catch (e) {
        console.warn(`Geocoding failed for ${selectedItem.address}:`, e);
        setSelectedItem((prev) =>
          prev && prev.id === selectedItem.id ? { ...prev, lat: 0, lng: 0 } : prev
        );
      }
    };

    geocodeSingle();
  }, [selectedItem?.id, cityName]);

  return {
    isGeocoding,
    geocodedCount,
    totalToGeocode,
  };
};
