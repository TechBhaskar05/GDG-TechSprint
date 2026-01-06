import { useState, useMemo, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";
import {
  Filter,
  X,
  MapPin,
  List,
  Navigation,
  Loader2,
  Target,
} from "lucide-react";

import { Header } from "./Header";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";

import { mockIssues, categories } from "../data/mockData";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";

import "leaflet/dist/leaflet.css";

// --- Sub-Component: Map Events Handler ---
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

const createCustomIcon = (color) =>
  new L.DivIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

export function MapView() {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newIssueLocation, setNewIssueLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  const navigate = useAppStore((state) => state.navigate);
  const setCurrentAddress = useAppStore((state) => state.setCurrentAddress);
  const viewIssue = useAppStore((state) => state.viewIssue);
  const userRole = useAuthStore((state) => state.userRole);

  const defaultCenter = [26.8467, 80.9462]; // Lucknow Fallback

  const handleLocationSelect = useCallback(
    async (lat, lng) => {
      setNewIssueLocation({ lat, lng });
      setIsGeocoding(true);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        if (!res.ok) throw new Error("API Limit or Network Error");
        const data = await res.json();

        const locationName =
          data.address.city ||
          data.address.suburb ||
          data.address.town ||
          data.address.state ||
          "Detected Area";

        setCurrentAddress(locationName);
      } catch (error) {
        console.error("Geocoding failed:", error.message);
        setCurrentAddress("Current Location");
      } finally {
        setIsGeocoding(false);
      }
    },
    [setCurrentAddress]
  );

  const handleLocateUser = () => {
    if ("geolocation" in navigator) {
      setIsGeocoding(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapInstance) {
            mapInstance.flyTo([latitude, longitude], 15);
          }
          handleLocationSelect(latitude, longitude);
        },
        (err) => {
          console.error("GPS Access Denied:", err.message);
          setIsGeocoding(false);
        }
      );
    }
  };

  const filteredIssues = useMemo(() => {
    return mockIssues.filter((issue) => {
      if (filterCategory && issue.category !== filterCategory) return false;
      if (filterPriority && issue.priority !== filterPriority) return false;
      return true;
    });
  }, [filterCategory, filterPriority]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative z-0">
          <MapContainer
            center={defaultCenter}
            zoom={13}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
            ref={setMapInstance}
          >
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Street View">
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution="&copy; CARTO"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            <MapClickHandler onLocationSelect={handleLocationSelect} />

            {filteredIssues.map((issue) => (
              <Marker
                key={issue.id}
                position={[issue.location.lat, issue.location.lng]}
                icon={createCustomIcon("#ef4444")}
                eventHandlers={{ click: () => setSelectedIssue(issue) }}
              />
            ))}

            {newIssueLocation && (
              <Marker
                position={[newIssueLocation.lat, newIssueLocation.lng]}
                icon={createCustomIcon("#3b82f6")}
              />
            )}
          </MapContainer>

          {/* Map Controls - Z-index elevated to 1001 to stay above Leaflet layers */}
          <div className="absolute top-4 left-4 z-[1001] flex flex-col gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation(); // Stop event from reaching the map
                setShowFilters(!showFilters);
              }}
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-lg border-none hover:bg-white dark:hover:bg-slate-700 transition-all"
              variant="secondary"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? "Hide Filters" : "Filters"}
            </Button>

            {/* Filter Menu */}
            {showFilters && (
              <Card className="w-72 p-5 shadow-2xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur animate-in fade-in zoom-in duration-150">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm dark:text-white text-slate-900">
                    Refine View
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                  >
                    <X size={16} className="text-slate-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Category
                    </label>
                    <select
                      className="w-full p-2 text-sm rounded-md border dark:bg-slate-900 dark:border-slate-700 bg-white dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Priority
                    </label>
                    <select
                      className="w-full p-2 text-sm rounded-md border dark:bg-slate-900 dark:border-slate-700 bg-white dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                    >
                      <option value="">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => {
                      setFilterCategory("");
                      setFilterPriority("");
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </Card>
            )}

            <Button
              onClick={handleLocateUser}
              className="bg-blue-600 text-white shadow-xl border-none hover:bg-blue-700 transition-all font-bold"
            >
              {isGeocoding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Target className="w-4 h-4 mr-2" />
              )}
              {isGeocoding ? "Locating..." : "Use My Location"}
            </Button>
          </div>

          {newIssueLocation && (
            <Card className="absolute bottom-6 left-6 p-5 z-[1001] bg-white/95 dark:bg-slate-900/95 backdrop-blur border-blue-500 border-2 w-72 shadow-2xl animate-in fade-in slide-in-from-bottom-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-tight">
                    Location Captured
                  </p>
                </div>
                <button
                  onClick={() => setNewIssueLocation(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  <X size={14} className="text-slate-500" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-md">
                {newIssueLocation.lat.toFixed(6)},{" "}
                {newIssueLocation.lng.toFixed(6)}
              </p>
              <Button
                size="sm"
                className="w-full text-xs font-bold shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none"
                onClick={() => navigate("report-issue", newIssueLocation)}
                disabled={isGeocoding}
              >
                {isGeocoding ? "Processing..." : "Report at this spot"}
              </Button>
            </Card>
          )}
        </div>

        <div className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Active Reports
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {filteredIssues.length} issues in view
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredIssues.map((issue) => (
              <Card
                key={issue.id}
                onClick={() => {
                  setSelectedIssue(issue);
                  if (mapInstance)
                    mapInstance.flyTo(
                      [issue.location.lat, issue.location.lng],
                      15
                    );
                }}
                className="p-4 rounded-2xl border-white dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-blue-300 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm line-clamp-1 flex-1 dark:text-white tracking-tight">
                    {issue.title}
                  </span>
                  <Badge priority={issue.priority} className="ml-2 scale-90" />
                </div>
                <div className="flex items-center text-[10px] text-slate-400">
                  <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                  <span className="truncate">{issue.location.address}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
