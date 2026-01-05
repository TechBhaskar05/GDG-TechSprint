import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Filter, X, ArrowLeft } from "lucide-react";
import { Header } from "./Header";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { mockIssues, categories } from "../data/mockData";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";

// Fix for default marker icons not showing in React Leaflet
import "leaflet/dist/leaflet.css";
const customIcon = (color) =>
  new L.DivIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

export function MapView() {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const navigate = useAppStore((state) => state.navigate);
  const userRole = useAuthStore((state) => state.userRole);
  const logout = useAuthStore((state) => state.logout);

  const defaultCenter = [26.8467, 80.9462];

  const filteredIssues = useMemo(() => {
    return mockIssues.filter((issue) => {
      if (filterCategory && issue.category !== filterCategory) return false;
      if (filterPriority && issue.priority !== filterPriority) return false;
      return true;
    });
  }, [filterCategory, filterPriority]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#22c55e";
      default:
        return "#3b82f6";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {userRole ? (
        <Header userRole={userRole} onLogout={logout} onNavigate={navigate} />
      ) : (
        <div className="p-4 border-b">Logo and Nav</div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative z-0">
          <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {filteredIssues.map((issue) => (
              <Marker
                key={issue.id}
                position={[issue.location.lat, issue.location.lng]}
                icon={customIcon(getPriorityColor(issue.priority))}
                eventHandlers={{ click: () => setSelectedIssue(issue) }}
              />
            ))}
          </MapContainer>

          {/* Floating UI remains the same */}
          <div className="absolute top-4 left-4 z-[1000]">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white dark:bg-slate-800 shadow-md"
            >
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
          </div>
        </div>

        {/* Sidebar logic remains exactly the same */}
        <div className="w-96 bg-white dark:bg-slate-900 border-l overflow-y-auto">
          {/* Your Sidebar JSX here */}
          <div className="p-6">
            <h3 className="font-bold mb-4">Nearby Issues</h3>
            {filteredIssues.map((issue) => (
              <Card
                key={issue.id}
                className="mb-2 p-3 cursor-pointer hover:bg-slate-100"
                onClick={() => setSelectedIssue(issue)}
              >
                {issue.title}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
