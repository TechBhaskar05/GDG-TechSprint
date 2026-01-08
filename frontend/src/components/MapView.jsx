import { useState, useMemo, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";
import {
  Filter,
  X,
  MapPin,
  Clock,
  Loader2,
  Target,
  ThumbsUp,
  Map as MapIcon,
  ChevronRight,
} from "lucide-react";

import { Header } from "./Header";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";

import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import { complaintService } from "../services/complaint.service";

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

const createCustomIcon = (color, isVoted = false) =>
  new L.DivIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${
      isVoted ? "#3b82f6" : color
    }; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; transition: all 0.2s transform;">
            ${
              isVoted
                ? '<div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>'
                : ""
            }
          </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

export function MapView() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newIssueLocation, setNewIssueLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  const navigate = useAppStore((state) => state.navigate);
  const setCurrentAddress = useAppStore((state) => state.setCurrentAddress);
  const selectedLocation = useAppStore((state) => state.selectedLocation);
  const onViewIssue = useAppStore((state) => state.viewIssue);

  // Default to Lucknow, but prioritize detected location from App.jsx
  const defaultCenter = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : [26.8467, 80.9462];

  useEffect(() => {
    fetchLiveIssues();
    if (selectedLocation && mapInstance) {
      mapInstance.setView([selectedLocation.lat, selectedLocation.lng], 14);
    }
  }, [mapInstance, selectedLocation]);

  const fetchLiveIssues = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAllComplaints();
      if (res.success) setIssues(res.data);
    } catch (err) {
      console.error("Map fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resilient Date Formatter
   */
  const formatDate = (dateString) => {
    if (!dateString) return "Date N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  /**
   * Geocoding with City/District Priority (Prevents "NH30" labels)
   */
  const handleLocationSelect = useCallback(
    async (lat, lng) => {
      setNewIssueLocation({ lat, lng });
      setIsGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();

        // Priority logic for location naming
        const locationName =
          data.address.city ||
          data.address.town ||
          data.address.district ||
          data.address.suburb ||
          "Detected Area";

        setCurrentAddress(locationName);
      } catch (error) {
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
          if (mapInstance) mapInstance.flyTo([latitude, longitude], 15);
          handleLocationSelect(latitude, longitude);
        },
        () => setIsGeocoding(false)
      );
    }
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (filterCategory && issue.aiCategory !== filterCategory) return false;
      return true;
    });
  }, [issues, filterCategory]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden text-white">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative z-0">
          {loading && (
            <div className="absolute inset-0 z-[2000] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
          )}

          <MapContainer
            center={defaultCenter}
            zoom={13}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
            ref={setMapInstance}
          >
            <LayersControl position="topright">
              <LayersControl.BaseLayer name="Satellite View">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Street View">
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution="&copy; OSM"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer checked name="Dark Mode">
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution="&copy; CARTO"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            <MapClickHandler onLocationSelect={handleLocationSelect} />

            {filteredIssues.map((issue) => (
              <Marker
                key={issue._id}
                position={[issue.location.lat, issue.location.lng]}
                icon={createCustomIcon(
                  issue.status === "resolved"
                    ? "#22c55e"
                    : issue.status === "in_progress"
                    ? "#f97316"
                    : "#ef4444",
                  issue.hasUpvoted
                )}
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

          {/* FLOATING ACTION BUTTONS */}
          <div className="absolute top-4 left-4 z-[1001] flex flex-col gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-slate-900/95 backdrop-blur border-slate-800 shadow-2xl"
              variant="secondary"
            >
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>

            <Button
              onClick={handleLocateUser}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl"
            >
              {isGeocoding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Target className="w-4 h-4 mr-2" />
              )}
              {isGeocoding ? "Locating..." : "My Location"}
            </Button>
          </div>

          {/* QUICK REPORT POPUP */}
          {newIssueLocation && (
            <Card className="absolute bottom-6 left-6 p-5 z-[1001] bg-slate-900/95 backdrop-blur border-blue-500 border-2 w-72 shadow-2xl animate-in slide-in-from-bottom-5">
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">
                  Target Selected
                </p>
                <button
                  onClick={() => setNewIssueLocation(null)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                onClick={() => navigate("report-issue", newIssueLocation)}
              >
                Report At This Pin
              </Button>
            </Card>
          )}
        </div>

        {/* SIDEBAR FEED */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-10 shadow-2xl">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <MapIcon size={18} className="text-blue-500" />
              <h3 className="text-lg font-black tracking-tighter">
                Live Community Feed
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {filteredIssues.length} active reports detected
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-20 text-slate-600">
                No reports found in this area.
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <Card
                  key={issue._id}
                  onClick={() => {
                    setSelectedIssue(issue);
                    mapInstance?.flyTo(
                      [issue.location.lat, issue.location.lng],
                      16
                    );
                  }}
                  className={`p-4 bg-slate-800/40 border-slate-700 cursor-pointer hover:border-blue-500 transition-all ${
                    selectedIssue?._id === issue._id
                      ? "ring-2 ring-blue-500 bg-slate-800"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-xs uppercase tracking-widest text-slate-200">
                      {issue.aiCategory}
                    </span>
                    <Badge status={issue.status} className="text-[9px]" />
                  </div>

                  <p className="text-xs text-slate-400 mb-4 line-clamp-1 italic">
                    "{issue.description}"
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-[10px] text-slate-500">
                        <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                        <span className="truncate max-w-[120px]">
                          Lat: {issue.location.lat.toFixed(3)}, Lng:{" "}
                          {issue.location.lng.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex items-center text-[10px] text-slate-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(issue.createdAt)}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewIssue(issue);
                      }}
                      className="p-2 bg-slate-700 hover:bg-blue-600 rounded-lg transition-colors group"
                    >
                      <ChevronRight
                        size={14}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
