import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Map,
  BarChart3,
  Clock,
  CheckCircle,
  Activity,
  BarChart as BarChartIcon,
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

import { Card } from "./Card";
import { Header } from "./Header"; // ✅ Ensure Header is imported
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import { fetchAuthorityAnalytics } from "../services/analytics.service";

export function Analytics() {
  const onNavigate = useAppStore((state) => state.navigate);
  const onLogout = useAuthStore((state) => state.logout); // ✅ Needed for Header
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAuthorityAnalytics()
      .then((data) => setAnalytics(data))
      .catch(console.error);
  }, []);

  if (!analytics) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 transition-colors">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          Analyzing data patterns...
        </div>
      </div>
    );
  }

  /* ================== DATA PROCESSING ================== */

  const categoryData = Object.entries(analytics.categoryMap).map(
    ([name, count]) => ({ name: name.toUpperCase(), count })
  );

  const priorityData = [
    { name: "High", value: analytics.priority.high, color: "#ef4444" },
    { name: "Medium", value: analytics.priority.medium, color: "#f59e0b" },
    { name: "Low", value: analytics.priority.low, color: "#22c55e" },
  ];

  const totalIssues = Object.values(analytics.status).reduce(
    (a, b) => a + b,
    0
  );
  const resolutionRate =
    totalIssues > 0
      ? ((analytics.status.resolved / totalIssues) * 100).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* FIXED: Header added for consistent visibility across tabs */}
      <Header
        userRole="authority"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <div className="flex">
        {/* SIDEBAR - Fixed for light mode visibility */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-1">
            <button
              onClick={() => onNavigate("authority-dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>
            <button
              onClick={() => onNavigate("complaint-management")}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <FileText size={20} /> Complaints
            </button>
            <button
              onClick={() => onNavigate("map-view")}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <Map size={20} /> Map View
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl border border-cyan-200 dark:border-cyan-500/20">
              <BarChart3 size={20} /> Analytics
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              {/* FIXED: Text color for light mode */}
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                Analytics & Reports
              </h1>
              <p className="text-slate-500 font-medium">
                Monitoring resolution efficiency and issue density in Prayagraj
              </p>
            </div>

            {/* KEY METRICS GRID - Fixed for alignment */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                {
                  label: "Avg. Resolution",
                  value: `${analytics.avgResolutionTime} Days`,
                  icon: Clock,
                  color: "text-blue-500",
                },
                {
                  label: "Resolution Rate",
                  value: `${resolutionRate}%`,
                  icon: CheckCircle,
                  color: "text-green-500",
                },
                {
                  label: "Active Issues",
                  value:
                    analytics.status.submitted +
                    analytics.status.acknowledged +
                    analytics.status["in-progress"],
                  icon: Activity,
                  color: "text-orange-500",
                },
                {
                  label: "Total Resolved",
                  value: analytics.status.resolved,
                  icon: BarChartIcon,
                  color: "text-purple-500",
                },
              ].map((metric, i) => (
                <Card
                  key={i}
                  className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                      {metric.label}
                    </span>
                    <metric.icon size={16} className={metric.color} />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {metric.value}
                  </div>
                </Card>
              ))}
            </div>

            {/* CHARTS ROW 1 */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">
                  Issues by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      className="dark:hidden"
                    />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                      className="hidden dark:block"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">
                  Priority Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                    >
                      {priorityData.map((e, i) => (
                        <Cell key={i} fill={e.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* STATUS BREAKDOWN GRID - FIXED FOR ALIGNMENT AND LIGHT MODE */}
            <Card className="p-8 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-xl rounded-[2rem] mb-8">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                Status Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  {
                    label: "Submitted",
                    val: analytics.status.submitted,
                    color: "bg-slate-400",
                  },
                  {
                    label: "Acknowledged",
                    val: analytics.status.acknowledged,
                    color: "bg-blue-500",
                  },
                  {
                    label: "In Progress",
                    val: analytics.status["in-progress"],
                    color: "bg-orange-500",
                  },
                  {
                    label: "Resolved",
                    val: analytics.status.resolved,
                    color: "bg-green-500",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${item.color}`}
                      />
                      {item.label}
                    </div>
                    <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {item.val || 0}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* RESOLUTION TREND */}
            <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">
                Resolution Trend (Weekly)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.trend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    className="dark:hidden"
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                    className="hidden dark:block"
                  />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reported"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
