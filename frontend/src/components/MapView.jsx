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
  Map as MapIcon,
  ChevronRight,
  Check,
  PlusCircle, // ✅ Necessary for the floating button
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
  const [newIssueLocation, setNewIssueLocation] = useState(null); // ✅ Tracking selection pointer
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  const navigate = useAppStore((state) => state.navigate);
  const setCurrentAddress = useAppStore((state) => state.setCurrentAddress);
  const setSelectedLocation = useAppStore((state) => state.setSelectedLocation);
  const selectedLocation = useAppStore((state) => state.selectedLocation);
  const onViewIssue = useAppStore((state) => state.viewIssue);

  const userRole = useAuthStore((state) => state.userRole);
  const onLogout = useAuthStore((state) => state.logout);

  const categories = ["GARBAGE", "ROAD", "LIGHTING", "DRAINAGE", "WATER"];

  const defaultCenter = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : [25.4358, 81.8463];

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

  const formatDate = (dateString) => {
    if (!dateString) return "Date N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const handleLocationSelect = useCallback(
    async (lat, lng) => {
      setNewIssueLocation({ lat, lng }); // ✅ Updates pointer position
      setIsGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        const locationName =
          data.address.city || data.address.town || "Detected Area";
        setCurrentAddress(locationName);
        setSelectedLocation({ lat, lng }); // Pre-fills global state for reporting
      } catch (error) {
        setCurrentAddress("Current Location");
      } finally {
        setIsGeocoding(false);
      }
    },
    [setCurrentAddress, setSelectedLocation]
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
      if (!filterCategory) return true;
      return issue.aiCategory?.toUpperCase() === filterCategory.toUpperCase();
    });
  }, [issues, filterCategory]);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden transition-colors">
      <Header userRole={userRole} onLogout={onLogout} onNavigate={navigate} />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative z-0">
          {loading && (
            <div className="absolute inset-0 z-[2000] bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm flex items-center justify-center">
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
              <LayersControl.BaseLayer checked name="Street View">
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution="&copy; OpenStreetMap"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satellite View">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Esri"
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

            {/* ✅ SELECTION POINTER: Renders the blue marker on click */}
            {newIssueLocation && (
              <Marker
                position={[newIssueLocation.lat, newIssueLocation.lng]}
                icon={createCustomIcon("#3b82f6")}
              />
            )}
          </MapContainer>

          {/* FLOATING ACTION BUTTONS */}
          <div className="absolute top-4 left-4 z-[1001] flex flex-col gap-2">
            <div className="relative">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className={`shadow-xl font-bold transition-all border-2 flex items-center h-11 px-4 rounded-xl ${
                  showFilters || filterCategory
                    ? "bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-500"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-lg"
                }`}
                variant="secondary"
              >
                <Filter className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
                <span className="text-slate-900 dark:text-white uppercase tracking-tighter text-sm font-black">
                  {filterCategory || "Filters"}
                </span>
                {filterCategory && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterCategory("");
                    }}
                    className="ml-3 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </Button>

              {showFilters && (
                <Card className="absolute top-14 left-0 w-56 p-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-2xl z-[1002] rounded-2xl">
                  <div className="text-[10px] font-black text-slate-400 uppercase p-3 tracking-widest border-b border-slate-50 dark:border-slate-800 mb-1">
                    Filter Category
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setFilterCategory(cat);
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between mb-0.5 ${
                        filterCategory === cat
                          ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {cat}{" "}
                      {filterCategory === cat && (
                        <Check
                          size={16}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      )}
                    </button>
                  ))}
                </Card>
              )}
            </div>

            <Button
              onClick={handleLocateUser}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl font-bold"
            >
              {isGeocoding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Target className="w-4 h-4 mr-2" />
              )}
              {isGeocoding ? "Locating..." : "My Location"}
            </Button>
          </div>

          {/* ✅ FLOATING REPORT BUTTON: Appears when a location is selected */}
          {newIssueLocation && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1001] animate-in slide-in-from-bottom-4 duration-300">
              <Button
                onClick={() => navigate("report-issue")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl shadow-2xl font-black uppercase tracking-tighter flex items-center gap-3 ring-4 ring-white dark:ring-slate-900"
              >
                <PlusCircle size={20} />
                Report at this location
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewIssueLocation(null);
                  }}
                  className="ml-2 p-1 hover:bg-blue-500 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </Button>
            </div>
          )}
        </div>

        {/* SIDEBAR FEED */}
        <div className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 shadow-2xl h-full overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2 mb-1 text-slate-900 dark:text-white font-black tracking-tighter uppercase text-lg">
              <MapIcon size={18} className="text-blue-500" /> Live Community
              Feed
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
              {filteredIssues.length} active reports detected
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-medium italic">
                No reports found matching this filter.
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
                  className={`p-4 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-500 transition-all ${
                    selectedIssue?._id === issue._id
                      ? "ring-2 ring-blue-500 bg-white dark:bg-slate-800"
                      : "bg-white dark:bg-slate-800/40"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-slate-200">
                      {issue.aiCategory}
                    </span>
                    <Badge status={issue.status} className="text-[9px]" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-1 italic font-medium">
                    "{issue.description}"
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-[10px] text-slate-500 font-bold">
                        <MapPin className="w-3 h-3 mr-1 text-blue-500" /> Lat:{" "}
                        {issue.location.lat.toFixed(3)}, Lng:{" "}
                        {issue.location.lng.toFixed(3)}
                      </div>
                      <div className="flex items-center text-[10px] text-slate-500 font-bold">
                        <Clock className="w-3 h-3 mr-1" />{" "}
                        {formatDate(issue.createdAt)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewIssue(issue);
                      }}
                      className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 text-slate-500 dark:text-white rounded-lg transition-colors"
                    >
                      <ChevronRight size={14} />
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
