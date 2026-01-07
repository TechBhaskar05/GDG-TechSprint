import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Map,
  BarChart3,
  Search,
  Filter,
  Download,
} from "lucide-react";

import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";

import { complaintService } from "../services/complaint.service";
import { useAppStore } from "../store/useAppStore";

export function ComplaintManagement() {
  const onNavigate = useAppStore((state) => state.navigate);
  const onViewIssue = useAppStore((state) => state.viewIssue);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [sortBy, setSortBy] = useState("priority");

  // ✅ Fetch from backend
  useEffect(() => {
    complaintService.
      getWardComplaints()
      .then((res) => {
        setComplaints(res.data);
      })
      .catch((err) => {
        console.error("Failed to load complaints", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));

  // ✅ Filtering
  let filteredIssues = complaints.filter((issue) => {
    if (
      searchQuery &&
      !issue.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    if (filterCategory && issue.aiCategory !== filterCategory) return false;
    if (filterStatus && issue.status !== filterStatus) return false;

    if (filterPriority) {
      const p =
        issue.priorityScore >= 80
          ? "high"
          : issue.priorityScore >= 50
          ? "medium"
          : "low";
      if (p !== filterPriority) return false;
    }

    return true;
  });

  // ✅ Sorting
  filteredIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (sortBy === "upvotes") {
      return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
    }

    return b.priorityScore - a.priorityScore;
  });

  // ✅ Loading safety
  if (loading) {
    return (
      <div className="p-8 text-slate-400">
        Loading complaints...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white">CF</span>
          </div>
          <span className="text-slate-900 dark:text-white">
            CivicFix AI
          </span>
        </div>
      </header>

      <div className="flex">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
          <nav className="p-4 space-y-1">
            <button onClick={() => onNavigate("authority-dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            <button onClick={() => onNavigate("complaint-management")}
              className="w-full flex items-center gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <FileText className="w-5 h-5" />
              Complaints
            </button>

            <button onClick={() => onNavigate("map-view")}
              className="w-full flex items-center gap-3 px-4 py-3">
              <Map className="w-5 h-5" />
              Map View
            </button>

            <button onClick={() => onNavigate("analytics")}
              className="w-full flex items-center gap-3 px-4 py-3">
              <BarChart3 className="w-5 h-5" />
              Analytics
            </button>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-8">
          <div className="mb-4 text-slate-600 dark:text-slate-400">
            Showing {filteredIssues.length} of {complaints.length} complaints
          </div>

          <Card>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left">Issue</th>
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-left">Location</th>
                  <th className="px-6 py-4 text-left">Priority</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Upvotes</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredIssues.map((issue) => (
                  <tr key={issue._id}
                    onClick={() => onViewIssue(issue)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">

                    <td className="px-6 py-4">
  <div className="flex items-center gap-3">
    {issue.imageUrl && (
      <img
        src={issue.imageUrl}
        alt={issue.title}
        className="w-12 h-12 object-cover rounded ring-1 ring-slate-200 dark:ring-slate-700"
      />
    )}

    <div>
      <div className="font-medium">{issue.title}</div>
      <div className="text-sm text-slate-400">
        {issue.reportedBy?.name}
      </div>
    </div>
  </div>
</td>


                    <td className="px-6 py-4">
                      <Badge>{issue.aiCategory}</Badge>
                    </td>

                    <td className="px-6 py-4 truncate max-w-xs">
                      {issue.location?.address}
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        priority={
                          issue.priorityScore >= 80
                            ? "high"
                            : issue.priorityScore >= 50
                            ? "medium"
                            : "low"
                        }
                      />
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={issue.status} />
                    </td>

                    <td className="px-6 py-4 text-cyan-400">
                      {issue.upvotes?.length || 0}
                    </td>

                    <td className="px-6 py-4">
                      {formatDate(issue.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </main>
      </div>
    </div>
  );
}
