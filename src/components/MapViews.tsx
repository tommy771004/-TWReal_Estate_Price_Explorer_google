import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Bath, Bed, Compass, MapPin, Search, Sofa } from "lucide-react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { CITIES, CITY_DISTRICTS } from "../constants";
import type { Transaction } from "../types/real-estate";

type MapLayer = "default" | "satellite" | "landmark";

interface ResultsMapProps {
  cityName: string;
  district: string;
  filteredData: Transaction[];
  formatPrice: (price: string) => string;
  geocodedCount: number;
  isGeocoding: boolean;
  mapLayer: MapLayer;
  onMapLayerChange: (layer: MapLayer) => void;
  onSelectItem: (item: Transaction) => void;
  onToggleFacilities: () => void;
  showFacilities: boolean;
  totalToGeocode: number;
}

interface TransactionMapPreviewProps {
  selectedItem: Transaction;
}

const getCoralIcon = (label: string) =>
  new L.DivIcon({
    className: "custom-div-icon",
    html: `<div class="relative group">
             <div class="w-2.5 h-2.5 bg-coral-500 rounded-full border border-white shadow-[0_0_8px_rgba(237,111,92,0.4)] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-transform duration-300">
               <div class="w-1 h-1 bg-white rounded-full"></div>
             </div>
             <div class="absolute left-2.5 top-[-10px] whitespace-nowrap bg-coral-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg border border-white/20 pointer-events-none group-hover:scale-110 transition-transform">
               ${label}
             </div>
           </div>`,
    iconSize: [0, 0],
  });

const previewIcon = new L.DivIcon({
  className: "custom-div-icon",
  html: `<div class="w-6 h-6 bg-coral-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(237,111,92,0.5)] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform duration-300">
           <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
         </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// Coral-themed cluster bubble; size scales with child count for readability.
const createClusterIcon = (cluster: { getChildCount: () => number }) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 34 : count < 100 ? 42 : 52;
  return L.divIcon({
    className: "custom-cluster-icon",
    html: `<div style="width:${size}px;height:${size}px"
             class="flex items-center justify-center rounded-full bg-coral-500/90 text-white font-bold border-2 border-white shadow-[0_0_12px_rgba(237,111,92,0.5)] backdrop-blur-sm hover:scale-110 transition-transform duration-200">
             <span class="text-xs tabular-nums">${count}</span>
           </div>`,
    iconSize: L.point(size, size, true),
  });
};

function FacilitiesOverlay({ show }: { show: boolean }) {
  const map = useMap();
  const [facilities, setFacilities] = useState<any[]>([]);

  useEffect(() => {
    if (!show) {
      setFacilities([]);
      return;
    }

    let isMounted = true;

    const fetchFacilities = async () => {
      try {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const query = `
          [out:json][timeout:15];
          (
            node["amenity"="school"](${sw.lat},${sw.lng},${ne.lat},${ne.lng});
            node["station"="subway"](${sw.lat},${sw.lng},${ne.lat},${ne.lng});
            node["public_transport"="station"](${sw.lat},${sw.lng},${ne.lat},${ne.lng});
          );
          out center;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (isMounted) {
          setFacilities(data.elements || []);
        }
      } catch (error) {
        console.error("Failed to fetch facilities", error);
      }
    };

    fetchFacilities();

    let timeout: NodeJS.Timeout;
    const onMoveEnd = () => {
      clearTimeout(timeout);
      timeout = setTimeout(fetchFacilities, 1000);
    };

    map.on("moveend", onMoveEnd);

    return () => {
      isMounted = false;
      map.off("moveend", onMoveEnd);
      clearTimeout(timeout);
    };
  }, [show, map]);

  if (!show || facilities.length === 0) {
    return null;
  }

  return (
    <>
      {facilities.map((facility, index) => {
        const lat = facility.lat || facility.center?.lat;
        const lng = facility.lon || facility.center?.lon;

        if (!lat || !lng) {
          return null;
        }

        const isSchool = facility.tags?.amenity === "school";
        const name = facility.tags?.name || (isSchool ? "學校" : "捷運/車站");

        return (
          <Marker
            key={`facility-${facility.id}-${index}`}
            position={[lat, lng]}
            icon={
              new L.DivIcon({
                className: "custom-facility-icon",
                html: `<div class="w-6 h-6 ${isSchool ? "bg-amber-500" : "bg-blue-500"} rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">${isSchool ? "學" : "站"}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })
            }
          >
            <Popup className="custom-popup">
              <div className="p-1 font-bold text-sm tracking-widest">{name}</div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

function MapBoundsManager({ items }: { items: Transaction[] }) {
  const map = useMap();
  const lastItemsLength = useRef(0);
  const lastValidCount = useRef(0);
  const hasFittedInitial = useRef(false);

  useEffect(() => {
    const validItems = items.filter((item) => {
      const lat = typeof item.lat === "string" ? parseFloat(item.lat) : item.lat;
      const lng = typeof item.lng === "string" ? parseFloat(item.lng) : item.lng;
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
        const boundsCoords = validItems.map((item) => {
          const lat = typeof item.lat === "string" ? parseFloat(item.lat) : item.lat!;
          const lng = typeof item.lng === "string" ? parseFloat(item.lng) : item.lng!;
          return [lat, lng] as [number, number];
        });
        const bounds = L.latLngBounds(boundsCoords);

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
          map.invalidateSize();
          lastItemsLength.current = items.length;
          lastValidCount.current = validCount;
          hasFittedInitial.current = true;
        }
      } catch (error) {
        console.warn("Could not calculate map bounds", error);
      }
    }
  }, [items, map]);

  return null;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);

  return null;
}

export function TransactionMapPreview({ selectedItem }: TransactionMapPreviewProps) {
  const lat = typeof selectedItem.lat === "string" ? parseFloat(selectedItem.lat) : selectedItem.lat;
  const lng = typeof selectedItem.lng === "string" ? parseFloat(selectedItem.lng) : selectedItem.lng;

  return (
    <div className="h-[160px] sm:h-[250px] w-full bg-surface-container-high rounded-[24px] overflow-hidden border border-outline-variant/40 shadow-[var(--md-elevation-1)] relative isolate group">
      {lat && lng && lat !== 0 ? (
        <>
          <MapContainer
            center={[lat, lng]}
            zoom={16}
            className="w-full h-full z-0"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <Marker position={[lat, lng]} icon={previewIcon} />
            <MapController center={[lat, lng]} />
          </MapContainer>

          <div className="absolute top-3 left-3 right-3 z-[1000]">
            <p className="rounded-full bg-surface/90 text-on-surface px-3 py-1.5 text-xs font-medium border border-outline-variant/40 backdrop-blur-md shadow-[var(--md-elevation-1)] inline-block">
              地圖位置可能為近似座標，請以門牌資訊為準
            </p>
          </div>
          <div className="absolute bottom-3 right-3 z-[1000] flex flex-col sm:flex-row gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-surface-container-high rounded-full text-xs font-semibold text-on-surface border border-outline-variant/40 shadow-[var(--md-elevation-1)] flex items-center gap-1.5 hover:bg-surface-container-highest transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Google Maps
            </a>
            <a
              href={`https://maps.apple.com/?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-surface-container-high rounded-full text-xs font-semibold text-on-surface border border-outline-variant/40 shadow-[var(--md-elevation-1)] flex items-center gap-1.5 hover:bg-surface-container-highest transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-on-surface" />
              Apple Maps
            </a>
          </div>
        </>
      ) : selectedItem.lat === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low p-4 text-center">
          <MapPin className="w-8 h-8 text-on-surface-variant/40 mb-2" />
          <p className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">無法精確定位地址</p>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            因開放資料地址遮蔽，無法自動解析座標
            <br />
            請參考明細中的門牌資訊
          </p>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low">
          <Compass className="w-8 h-8 text-on-surface-variant/40 animate-spin-slow mb-2" />
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">正在解析座標...</p>
        </div>
      )}
    </div>
  );
}

export default function ResultsMap({
  cityName,
  district,
  filteredData,
  formatPrice,
  geocodedCount,
  isGeocoding,
  mapLayer,
  onMapLayerChange,
  onSelectItem,
  onToggleFacilities,
  showFacilities,
  totalToGeocode,
}: ResultsMapProps) {
  if (filteredData.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mb-4">
          <Search className="text-on-surface-variant" size={28} />
        </div>
        <p className="text-on-surface font-semibold text-sm">無資料</p>
      </div>
    );
  }

  const cityInfo = CITIES.find((city) => city.name === cityName);
  const districtInfo = (CITY_DISTRICTS[cityName] || []).find((item) => item.name === district);
  const center = districtInfo?.lat
    ? ([districtInfo.lat, districtInfo.lng] as [number, number])
    : cityInfo?.lat
      ? ([cityInfo.lat, cityInfo.lng] as [number, number])
      : ([25.033, 121.5654] as [number, number]);

  return (
    <div className="flex-1 flex flex-col bg-transparent relative min-h-[500px] sm:min-h-[600px] rounded-[28px] overflow-hidden border border-outline-variant/40 shadow-[var(--md-elevation-1)]">
      <div className="flex-1 relative">
        {/* 定位精度說明：地址 geocode 與行政區近似點並存，避免誤判為精準門牌 */}

        <MapContainer
          center={center}
          zoom={district !== "全部" ? 14 : 12}
          className="w-full h-full z-0 absolute inset-0"
          scrollWheelZoom
          key={`map-container-${cityName}-${district}`}
        >
          {mapLayer === "default" && (
            <TileLayer
              key="default-layer"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          {mapLayer === "satellite" && (
            <TileLayer
              key="satellite-layer"
              attribution="&copy; Esri, Maxar, Earthstar Geographics"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          {mapLayer === "landmark" && (
            <TileLayer
              key="landmark-layer"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
          )}

          <MapBoundsManager items={filteredData} />
          <FacilitiesOverlay show={showFacilities} />

          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom
            iconCreateFunction={createClusterIcon}
          >
            {filteredData.map((item) => {
              const lat = typeof item.lat === "string" ? parseFloat(item.lat) : item.lat;
              const lng = typeof item.lng === "string" ? parseFloat(item.lng) : item.lng;

              if (!lat || !lng || lat === 0) {
                return null;
              }

              let label = item.district;
              const sectionMatch = item.address.match(/([^路街巷]+段)/);
              if (sectionMatch) {
                label = sectionMatch[1].length > 6 ? item.district : sectionMatch[1];
              }

              return (
                <Marker
                  key={item.id}
                  position={[lat, lng]}
                  icon={getCoralIcon(label)}
                  eventHandlers={{ click: () => onSelectItem(item) }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1">
                      <div className="flex items-center gap-1.5 mb-1 border-b border-outline-variant/30 pb-1">
                        <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-1.5 py-0.5 rounded-full">{label}</span>
                        <p className="font-bold text-on-surface text-xs truncate">{item.address}</p>
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-primary font-bold text-sm leading-none">{formatPrice(item.totalPrice)}</p>
                        <p className="text-xs text-on-surface-variant font-medium leading-none">
                          {item.buildingType} | {item.buildingArea} ㎡
                        </p>
                        {item.rooms && item.rooms !== "0" && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="flex items-center gap-0.5 bg-primary-container text-on-primary-container px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                              <Bed className="w-2.5 h-2.5" />
                              {item.rooms}
                            </span>
                            {item.halls && item.halls !== "0" && (
                              <span className="flex items-center gap-0.5 bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                                <Sofa className="w-2.5 h-2.5" />
                                {item.halls}
                              </span>
                            )}
                            {item.bathrooms && item.bathrooms !== "0" && (
                              <span className="flex items-center gap-0.5 bg-tertiary-container text-on-tertiary-container px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                                <Bath className="w-2.5 h-2.5" />
                                {item.bathrooms}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[1000] items-end">
        <div className="flex items-center gap-2">
          <div className="bg-surface-container-high p-1 rounded-full shadow-[var(--md-elevation-2)] border border-outline-variant/40 flex items-center gap-0.5 pointer-events-auto">
            <button
              onClick={() => onMapLayerChange("default")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${mapLayer === "default" ? "bg-secondary-container text-on-secondary-container shadow-xs" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              標準
            </button>
            <button
              onClick={() => onMapLayerChange("satellite")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${mapLayer === "satellite" ? "bg-secondary-container text-on-secondary-container shadow-xs" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              衛星圖
            </button>
            <button
              onClick={() => onMapLayerChange("landmark")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${mapLayer === "landmark" ? "bg-secondary-container text-on-secondary-container shadow-xs" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              地標圖
            </button>
          </div>

          <button
            onClick={onToggleFacilities}
            className={`h-9 px-3.5 bg-surface-container-high rounded-full shadow-[var(--md-elevation-2)] border border-outline-variant/40 flex items-center gap-1.5 text-xs font-semibold transition-all pointer-events-auto ${showFacilities ? "text-on-primary-container bg-primary-container border-primary/40" : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"}`}
          >
            <div className={`w-2 h-2 rounded-full ${showFacilities ? "bg-primary" : "bg-outline"}`} />
            周邊設施
          </button>
        </div>

        {isGeocoding && (
          <div className="bg-surface-container-high p-3.5 rounded-[24px] shadow-[var(--md-elevation-3)] border border-outline-variant/40 w-52 transition-all animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-semibold text-on-surface uppercase tracking-wider">精準校正中...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(geocodedCount / (totalToGeocode || 1)) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-primary">
                {geocodedCount}/{totalToGeocode}
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-2 font-normal leading-tight">
              使用免費 Nominatim 引擎
              <br />
              正在獲取精準經緯度
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
