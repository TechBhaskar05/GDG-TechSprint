import { useState, useEffect } from "react";
import {
  Plus,
  MapPin,
  Clock,
  ThumbsUp,
  Loader2,
  Edit2,
  Trash2,
  Globe,
  User,
  Navigation,
} from "lucide-react";
import { Header } from "./Header";
import { Button } from "./Button";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import { complaintService } from "../services/complaint.service";

import toast from "react-hot-toast";

export function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("my-reports"); // "my-reports" | "discovery"
  const [loading, setLoading] = useState(true);

  const onNavigate = useAppStore((state) => state.navigate);
  const onViewIssue = useAppStore((state) => state.viewIssue);
  const currentAddress = useAppStore((state) => state.currentAddress);
  const setCurrentAddress = useAppStore((state) => state.setCurrentAddress);

  const {
    logout: onLogout,
    user,
    currentLocation,
    setLocation,
    setUserCity,
  } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res =
        activeTab === "my-reports"
          ? await complaintService.getMyComplaints()
          : await complaintService.getAllComplaints();

      if (res.success) {
        setComplaints(res.data);
      }
      console.log(res);
      
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * HANDLER: DELETE REPORT
   */
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Stop card from opening details
    if (window.confirm("Delete this report?")) {
      try {
        await complaintService.deleteComplaint(id);
        toast.success("Report deleted successfully");
        setComplaints((prev) => prev.filter((item) => item._id !== id));
      } catch (err) {
        toast.error(err.response?.data?.message || "Unable to delete this report")
      }
    }
  };


  /**
   * HANDLER: EDIT REPORT
   */
  const handleEdit = (e, issue) => {
    e.stopPropagation();
    useAppStore.setState({ editingIssue: issue });
    onNavigate("report-issue");
  };

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
   * FIX: Manual Location Request bypasses browser violations
   */
  const handleRequestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation(latitude, longitude);

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();

            // Prioritize City Name to avoid "NH30"
            const cityName =
              data.address.city ||
              data.address.town ||
              data.address.district ||
              "Prayagraj";

            setCurrentAddress(cityName);
            setUserCity(cityName);
          } catch (err) {
            console.error("Geocoding failed", err);
          }
        },
        (err) => alert("Please allow GPS access to see nearby issues.")
      );
    }
  };

const handleUpvote = async (e, issue) => {
  e.stopPropagation();
  const wasUpvoted = issue.hasUpvoted;

  try {
    // 1. Optimistic UI Update: update the count and toggle state immediately
    setComplaints((prev) =>
      prev.map((c) =>
        c._id === issue._id
          ? {
              ...c,
              upvoteCount: wasUpvoted ? c.upvoteCount - 1 : c.upvoteCount + 1,
              hasUpvoted: !wasUpvoted,
            }
          : c
      )
    );

    // 2. Logic Switch: Call the correct endpoint to avoid 400 errors
    if (!wasUpvoted) {
      // If not already upvoted, send POST request
      await complaintService.upvoteComplaint(issue._id);
    } else {
      // If already upvoted, send DELETE request to remove it
      await complaintService.removeUpvote(issue._id);
    }
  } catch (err) {
    // 3. Rollback: If server fails, revert to previous state
    fetchData();
    console.error("Upvote toggle failed:", err.response?.data?.message);
  }
};

  

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header userRole="citizen" onLogout={onLogout} onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {activeTab === "my-reports"
                ? "Citizen Portal"
                : "Community Discovery"}
            </h1>
            <p className="text-slate-400">
              {activeTab === "my-reports"
                ? `Tracking your reports in ${
                    user?.city || currentAddress || "your city"
                  }`
                : `Issues reported by others in ${
                    currentAddress || user?.city || "Prayagraj"
                  }`}
            </p>
          </div>

          <div className="flex gap-3">
            {!currentLocation && activeTab === "discovery" && (
              <Button
                onClick={handleRequestLocation}
                variant="outline"
                className="border-cyan-500 text-cyan-500"
              >
                <Navigation size={16} className="mr-2" /> Find Nearby
              </Button>
            )}

            <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-800">
              <button
                onClick={() => setActiveTab("my-reports")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "my-reports"
                    ? "bg-slate-800 text-white shadow-lg"
                    : "text-slate-500"
                }`}
              >
                <User size={16} className="inline mr-2" /> My Reports
              </button>
              <button
                onClick={() => setActiveTab("discovery")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "discovery"
                    ? "bg-slate-800 text-white shadow-lg"
                    : "text-slate-500"
                }`}
              >
                <Globe size={16} className="inline mr-2" /> Discovery
              </button>
            </div>
            <Button
              onClick={() => onNavigate("report-issue")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20"
            >
              <Plus className="mr-2" /> Report New
            </Button>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 border-none shadow-xl bg-slate-900/50 backdrop-blur-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Total Filed
            </p>
            <div className="text-4xl font-black text-white">
              {complaints.length}
            </div>
          </Card>
          <Card className="p-6 border-none shadow-xl bg-slate-900/50 backdrop-blur-sm">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">
              Active
            </p>
            <div className="text-4xl font-black text-orange-500">
              {
                complaints.filter((i) =>
                  ["submitted", "acknowledged", "in_progress"].includes(
                    i.status
                  )
                ).length
              }
            </div>
          </Card>
          <Card className="p-6 border-none shadow-xl bg-slate-900/50 backdrop-blur-sm">
            <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2">
              Resolved
            </p>
            <div className="text-4xl font-black text-green-500">
              {complaints.filter((i) => i.status === "resolved").length}
            </div>
          </Card>
          <Card className="p-6 border-none shadow-xl bg-slate-900/50 backdrop-blur-sm">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
              Support
            </p>
            <div className="text-4xl font-black text-blue-500 flex items-center gap-2">
              {complaints.reduce((sum, i) => sum + (i.upvoteCount || 0), 0)}
              <ThumbsUp size={24} className="opacity-20" />
            </div>
          </Card>
        </div>

        <div className="grid gap-6">
          {loading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="animate-spin text-cyan-500" />
            </div>
          ) : complaints.length === 0 ? (
            <Card className="p-12 text-center bg-slate-900/20 border-dashed border-slate-800">
              <p className="text-slate-500">
                No issues found in this category.
              </p>
            </Card>
          ) : (
            complaints.map((issue) => (
              <Card
                key={issue._id}
                className="bg-slate-900/50 border-slate-800 overflow-hidden group cursor-pointer hover:border-slate-600 transition-all"
                onClick={() => onViewIssue(issue)}
              >
                <div className="flex flex-col md:flex-row">
                  <img
                    src={
                      issue.imageUrl ||
                      "https://via.placeholder.com/300?text=No+Evidence"
                    }
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300?text=Load+Error";
                    }}
                    className="md:w-64 aspect-video md:aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="Issue Evidence"
                  />

                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-100 uppercase tracking-tight">
                          {issue.aiCategory?.toUpperCase()};
                        </h3>
                        <div className="flex gap-4 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />{" "}
                            {issue.location?.lat?.toFixed(3)},{" "}
                            {issue.location?.lng?.toFixed(3)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {formatDate(issue.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        {activeTab === "discovery" && (
                          <button
                            onClick={(e) => handleUpvote(e, issue)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                              issue.hasUpvoted
                                ? "bg-blue-600 border-blue-500 text-white"
                                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                            }`}
                          >
                            <ThumbsUp
                              size={16}
                              fill={issue.hasUpvoted ? "currentColor" : "none"}
                            />
                            <span className="font-bold">
                              {issue.upvoteCount || 0}
                            </span>
                          </button>
                        )}

                        {/* RESTORED EDIT AND DELETE BUTTONS */}
                        {activeTab === "my-reports" &&
                          issue.status === "submitted" && (
                            <div className="flex gap-2 mr-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate("report-issue", issue);
                                }}
                                className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-colors"
                                title="Edit Report"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, issue._id)}
                                className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-colors"
                                title="Delete Report"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        <Badge status={issue.status} />
                      </div>
                    </div>
                    <p className="mt-4 text-slate-400 italic line-clamp-2">
                      "{issue.description || "No description provided."}"
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
