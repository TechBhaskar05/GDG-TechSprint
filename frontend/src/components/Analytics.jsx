import {
  LayoutDashboard,
  FileText,
  Map,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useState } from "react";
import { Card } from "./Card";
import { useAppStore } from "../store/useAppStore";
import { fetchAuthorityAnalytics } from "../services/analytics.service";

export function Analytics() {
  const onNavigate = useAppStore((state) => state.navigate);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAuthorityAnalytics()
      .then((data) => setAnalytics(data))
      .catch(console.error);
  }, []);

  if (!analytics) {
    return <div className="p-8">Loading analytics...</div>;
  }

  /* ================== DERIVED DATA (NO UI CHANGE) ================== */

  const categoryData = Object.entries(analytics.categoryMap).map(
    ([name, count]) => ({ name, count })
  );

  const priorityData = [
    { name: "High", value: analytics.priority.high, color: "#ef4444" },
    { name: "Medium", value: analytics.priority.medium, color: "#f59e0b" },
    { name: "Low", value: analytics.priority.low, color: "#22c55e" },
  ];

  const statusData = Object.entries(analytics.status).map(
    ([name, value]) => ({ name, value })
  );

  const totalIssues = Object.values(analytics.status).reduce(
    (a, b) => a + b,
    0
  );

  const avgResolutionTime = analytics.avgResolutionTime;

  const resolutionRate =
    totalIssues > 0
      ? ((analytics.status.resolved / totalIssues) * 100).toFixed(1)
      : 0;

      const trendData = analytics.trend || [];

  /* ================== UI (UNCHANGED) ================== */

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 dark:bg-gradient-to-br dark:from-cyan-500 dark:to-purple-600 rounded-lg flex items-center justify-center dark:shadow-lg dark:shadow-cyan-500/50">
              <span className="text-white">CF</span>
            </div>
            <span className="text-slate-900 dark:text-white">CivicFix AI</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-1">
            <button
              onClick={() => onNavigate("authority-dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => onNavigate("complaint-management")}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <FileText className="w-5 h-5" />
              Complaints
            </button>
            <button
              onClick={() => onNavigate("map-view")}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <Map className="w-5 h-5" />
              Map View
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-900 dark:text-cyan-400 bg-slate-100 dark:bg-gradient-to-r dark:from-cyan-900/30 dark:to-purple-900/30 rounded-lg dark:border dark:border-cyan-500/30"
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl">
            <div className="mb-8">
              <h1 className="text-slate-900 dark:text-white mb-2">
                Analytics & Reports
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Comprehensive insights into civic issue patterns and resolution
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <Card className="p-6">
                <div>Avg. Resolution Time</div>
                <div>{avgResolutionTime} days</div>
              </Card>

              <Card className="p-6">
                <div>Resolution Rate</div>
                <div>{resolutionRate}%</div>
              </Card>

              <Card className="p-6">
                <div>Active Issues</div>
                <div>
                  {analytics.status.submitted +
                    analytics.status.acknowledged +
                    analytics.status["in-progress"]}
                </div>
              </Card>

              <Card className="p-6">
                <div>Resolved</div>
                <div>{analytics.status.resolved}</div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <Card className="p-6">
                <h3>Issues by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3>Priority Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={priorityData} dataKey="value" outerRadius={100}>
                      {priorityData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
                      {/* Issues Reported vs Resolved */}
<Card className="p-6 mb-6">
  <h3>Issues Reported vs Resolved</h3>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={trendData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="label" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="reported"
        stroke="#3b82f6"
        strokeWidth={2}
      />
      <Line
        type="monotone"
        dataKey="resolved"
        stroke="#22c55e"
        strokeWidth={2}
      />
    </LineChart>
  </ResponsiveContainer>
</Card>

            {/* Status Breakdown */}
            <Card className="p-6">
              <h3>Status Breakdown</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {statusData.map((s) => (
                  <div key={s.name}>
                    <div>{s.name}</div>
                    <div>{s.value}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
