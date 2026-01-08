import { useState, useEffect } from "react";
import {
  Plus,
  MapPin,
  Clock,
  ThumbsUp,
  MessageSquare,
  Loader2,
  AlertTriangle,
  Edit2, // Added for Edit UI
  Trash2, // Added for Delete UI
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onNavigate = useAppStore((state) => state.navigate);
  const onViewIssue = useAppStore((state) => state.viewIssue);
  const onLogout = useAuthStore((state) => state.logout);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getMyComplaints();
      if (res.success) {
        setComplaints(res.data);
      }
    } catch (err) {
      setError("Unable to load your reports.");
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
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header userRole="citizen" onLogout={onLogout} onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2">Citizen Portal</h1>
            <p className="text-slate-400">
              Track and manage your local reports.
            </p>
          </div>
          <Button
            onClick={() => onNavigate("report-issue")}
            className="bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            <Plus className="mr-2" /> Report New Issue
          </Button>
        </div>

        {/* Dynamic Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 border-none shadow-xl bg-white dark:bg-slate-900/50 backdrop-blur-sm hover:translate-y-[-4px] transition-transform">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Total Filed
            </p>
            <div className="text-4xl font-black text-slate-900 dark:text-white">
              {complaints.length}
            </div>
          </Card>

          <Card className="p-6 border-none shadow-xl bg-white dark:bg-slate-900/50 backdrop-blur-sm hover:translate-y-[-4px] transition-transform">
            <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-2">
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

          <Card className="p-6 border-none shadow-xl bg-white dark:bg-slate-900/50 backdrop-blur-sm hover:translate-y-[-4px] transition-transform">
            <p className="text-xs font-black text-green-400 uppercase tracking-widest mb-2">
              Resolved
            </p>
            <div className="text-4xl font-black text-green-500">
              {complaints.filter((i) => i.status === "resolved").length}
            </div>
          </Card>

          <Card className="p-6 border-none shadow-xl bg-white dark:bg-slate-900/50 backdrop-blur-sm hover:translate-y-[-4px] transition-transform">
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">
              Community Support
            </p>
            <div className="text-4xl font-black text-blue-500 flex items-center gap-2">
              {complaints.reduce((sum, i) => sum + (i.upvoteCount || 0), 0)}
              <ThumbsUp size={24} className="opacity-30" />
            </div>
          </Card>
        </div>

        {/* ISSUES LIST WITH EDIT/DELETE ACTIONS */}
        <div className="grid gap-6">
          {complaints.map((issue) => (
            <Card
              key={issue._id}
              className="bg-slate-900/50 border-slate-800 overflow-hidden group cursor-pointer"
              onClick={() => onViewIssue(issue)}
            >
              <div className="flex flex-col md:flex-row">
                <img
                  src={issue.imageUrl}
                  className="md:w-64 object-cover"
                  alt="Issue"
                />

                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">
                        {issue.aiCategory?.toUpperCase()}
                      </h3>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {issue.location.lat.toFixed(3)},{" "}
                          {issue.location.lng.toFixed(3)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {formatDate(issue.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* NEW: MANAGEMENT BUTTONS */}
                    <div className="flex gap-2">
                      {issue.status === "submitted" && (
                        <>
                          <button
                            onClick={(e) => handleEdit(e, issue)}
                            className="p-2 bg-slate-800 hover:bg-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, issue._id)}
                            className="p-2 bg-slate-800 hover:bg-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      <Badge status={issue.status} />
                    </div>
                  </div>

                  <p className="mt-4 text-slate-400 line-clamp-2">
                    {issue.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
