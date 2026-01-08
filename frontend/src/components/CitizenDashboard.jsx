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
  const [activeTab, setActiveTab] = useState("my-reports");
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
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this report?")) {
      try {
        await complaintService.deleteComplaint(id);
        toast.success("Report deleted successfully");
        setComplaints((prev) => prev.filter((item) => item._id !== id));
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Unable to delete this report"
        );
      }
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
            const cityName =
              data.address.city || data.address.town || "Prayagraj";
            setCurrentAddress(cityName);
            setUserCity(cityName);
          } catch (err) {
            console.error("Geocoding failed", err);
          }
        },
        () => alert("Please allow GPS access to see nearby issues.")
      );
    }
  };

  const handleUpvote = async (e, issue) => {
    e.stopPropagation();
    const wasUpvoted = issue.hasUpvoted;
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

    try {
      if (!wasUpvoted) await complaintService.upvoteComplaint(issue._id);
      else await complaintService.removeUpvote(issue._id);
    } catch (err) {
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header userRole="citizen" onLogout={onLogout} onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              {activeTab === "my-reports"
                ? "Citizen Portal"
                : "Community Discovery"}
            </h1>
            <p className="text-slate-500 font-medium">
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
                className="border-cyan-500 text-cyan-600 dark:text-cyan-400"
              >
                <Navigation size={16} className="mr-2" /> Find Nearby
              </Button>
            )}

            <div className="bg-white dark:bg-slate-900 p-1 rounded-xl flex border border-slate-200 dark:border-slate-800 shadow-sm">
              <button
                onClick={() => setActiveTab("my-reports")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "my-reports"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-400"
                }`}
              >
                <User size={16} className="inline mr-2" /> My Reports
              </button>
              <button
                onClick={() => setActiveTab("discovery")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "discovery"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-400"
                }`}
              >
                <Globe size={16} className="inline mr-2" /> Discovery
              </button>
            </div>
            <Button
              onClick={() => onNavigate("report-issue")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
            >
              <Plus className="mr-2" /> Report New
            </Button>
          </div>
        </div>

        {/* STATS SECTION - FIXED LIGHT MODE VISIBILITY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: "Total Filed",
              val: complaints.length,
              color: "text-slate-600 dark:text-slate-300",
            },
            {
              label: "Active",
              val: complaints.filter((i) =>
                ["submitted", "acknowledged", "in_progress"].includes(i.status)
              ).length,
              color: "text-orange-600 dark:text-orange-500",
            },
            {
              label: "Resolved",
              val: complaints.filter((i) => i.status === "resolved").length,
              color: "text-green-600 dark:text-green-500",
            },
            {
              label: "Support",
              val: complaints.reduce((sum, i) => sum + (i.upvoteCount || 0), 0),
              color: "text-blue-600 dark:text-blue-500",
              icon: true,
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="p-6 border-slate-200 dark:border-none shadow-xl bg-white dark:bg-slate-900/50 backdrop-blur-sm"
            >
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                {stat.label}
              </p>
              <div
                className={`text-4xl font-black ${stat.color} flex items-center gap-2`}
              >
                {stat.val}
                {stat.icon && <ThumbsUp size={24} className="opacity-20" />}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6">
          {loading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="animate-spin text-blue-500" />
            </div>
          ) : complaints.length === 0 ? (
            <Card className="p-12 text-center bg-white dark:bg-slate-900/20 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400">
                No issues found in this category.
              </p>
            </Card>
          ) : (
            complaints.map((issue) => (
              <Card
                key={issue._id}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 overflow-hidden group cursor-pointer hover:border-blue-400 dark:hover:border-slate-600 transition-all shadow-sm"
                onClick={() => onViewIssue(issue)}
              >
                <div className="flex flex-col md:flex-row">
                  <img
                    src={issue.imageUrl || "https://via.placeholder.com/300"}
                    className="md:w-64 aspect-video md:aspect-square object-cover"
                    alt="Issue"
                  />
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                          {issue.aiCategory}
                        </h3>
                        <div className="flex gap-4 text-[10px] text-slate-500 font-bold uppercase">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />{" "}
                            {issue.location?.lat?.toFixed(3)},{" "}
                            {issue.location?.lng?.toFixed(3)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {formatDate(issue.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        {activeTab === "discovery" && (
                          <button
                            onClick={(e) => handleUpvote(e, issue)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                              issue.hasUpvoted
                                ? "bg-blue-600 border-blue-500 text-white"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <ThumbsUp
                              size={14}
                              fill={issue.hasUpvoted ? "currentColor" : "none"}
                            />{" "}
                            {issue.upvoteCount || 0}
                          </button>
                        )}
                        {activeTab === "my-reports" &&
                          issue.status === "submitted" && (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate("report-issue", issue);
                                }}
                                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-lg"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, issue._id)}
                                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-600 rounded-lg"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        <Badge status={issue.status} />
                      </div>
                    </div>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 italic line-clamp-2">
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
