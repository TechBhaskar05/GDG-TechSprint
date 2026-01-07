import { LayoutDashboard, FileText, Map, BarChart3, AlertTriangle } from 'lucide-react';
import { Header } from './Header';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { useEffect, useState } from "react";
import { fetchAuthorityDashboard } from "../services/ward.service";

import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';







export function AuthorityDashboard() {
  const onNavigate = useAppStore((state) => state.navigate);
  const onViewIssue = useAppStore((state) => state.viewIssueDetail);
  const onLogout = useAuthStore((state) => state.logout);

  const [stats, setStats] = useState({
  total: 0,
  highPriority: 0,
  inProgress: 0,
  resolvedToday: 0,
});

const [recentIssues, setRecentIssues] = useState([]);
useEffect(() => {
  fetchAuthorityDashboard()
    .then((res) => {
      setStats(res.data.stats);
      setRecentIssues(res.data.recent);
    })
    .catch(console.error);
}, []);

const highPriorityIssues = recentIssues.filter(
  (i) => i.priorityScore >= 80 && i.status !== "resolved"
);

const pendingIssues = recentIssues.filter(
  (i) => i.status !== "resolved"
);

const inProgressIssues = recentIssues.filter(
  (i) => i.status === "in_progress"
);

const resolvedToday = stats.resolvedToday;

const overdueIssues = highPriorityIssues.filter((issue) => {
  const daysOpen =
    (Date.now() - new Date(issue.createdAt).getTime()) /
    (1000 * 60 * 60 * 24);
  return daysOpen > 5;
});


  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header 
        userRole="authority" 
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-1">
            <button 
              onClick={() => onNavigate('authority-dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-900 dark:text-cyan-400 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-cyan-900/30 dark:to-purple-900/30 rounded-xl shadow-sm dark:shadow-cyan-500/10 dark:border dark:border-cyan-500/30"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button 
              onClick={() => onNavigate('complaint-management')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <FileText className="w-5 h-5" />
              Complaints
            </button>
            <button 
              onClick={() => onNavigate('map-view')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <Map className="w-5 h-5" />
              Map View
            </button>
            <button 
              onClick={() => onNavigate('analytics')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
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
              <h1 className="text-slate-900 dark:text-white mb-2 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
                Ward Officer Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Monitor and manage civic issues in your ward
              </p>
            </div>

            {/* Alert Banner */}
            {overdueIssues.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200 dark:border-red-500/30 rounded-xl flex items-start gap-3 shadow-md dark:shadow-red-500/20">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-500/30 rounded-lg flex items-center justify-center flex-shrink-0 dark:border dark:border-red-500/50">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="text-red-900 dark:text-red-300 mb-1">
                    High Priority Issues Overdue
                  </div>
                  <div className="text-red-700 dark:text-red-400">
                    {overdueIssues.length} high-priority {overdueIssues.length === 1 ? 'issue' : 'issues'} pending for more than 5 days. Immediate attention required.
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate('complaint-management')}
                  className="border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  View All
                </Button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 hover:shadow-xl dark:hover:shadow-cyan-500/20 transition-all group border-blue-200/50 dark:border-cyan-900/50 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-cyan-950/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-600 dark:text-slate-400">Total Complaints</div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-cyan-500 dark:to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 dark:shadow-cyan-500/50">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-slate-900 dark:text-cyan-400 mb-1 group-hover:scale-110 transition-transform origin-left">
                  {stats.total}

                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {pendingIssues.length} pending
                </div>
              </Card>

              <Card className="p-6 hover:shadow-xl dark:hover:shadow-red-500/20 transition-all group border-red-200/50 dark:border-red-900/50 bg-gradient-to-br from-white to-red-50/30 dark:from-slate-900 dark:to-red-950/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-600 dark:text-slate-400">High Priority</div>
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-500 dark:to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 dark:shadow-red-500/50">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-slate-900 dark:text-red-400 mb-1 group-hover:scale-110 transition-transform origin-left">
                  {highPriorityIssues.length}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Requires attention
                </div>
              </Card>

              <Card className="p-6 hover:shadow-xl dark:hover:shadow-orange-500/20 transition-all group border-orange-200/50 dark:border-orange-900/50 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-900 dark:to-orange-950/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-600 dark:text-slate-400">In Progress</div>
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-500 dark:to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 dark:shadow-orange-500/50">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-slate-900 dark:text-orange-400 mb-1 group-hover:scale-110 transition-transform origin-left">
                  {inProgressIssues.length}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Being worked on
                </div>
              </Card>

              <Card className="p-6 hover:shadow-xl dark:hover:shadow-green-500/20 transition-all group border-green-200/50 dark:border-green-900/50 bg-gradient-to-br from-white to-green-50/30 dark:from-slate-900 dark:to-green-950/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-600 dark:text-slate-400">Resolved Today</div>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-500 dark:to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 dark:shadow-green-500/50">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="text-slate-900 dark:text-green-400 mb-1 group-hover:scale-110 transition-transform origin-left">
                  {resolvedToday}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Great progress
                </div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* High Priority Issues */}
              <Card className="p-6 shadow-md hover:shadow-xl dark:hover:shadow-cyan-500/20 transition-all dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-slate-900 dark:text-white">High Priority Issues</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onNavigate('complaint-management')}
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {highPriorityIssues.slice(0, 5).map(issue => (
                    <div 
                      key={issue._id}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-cyan-500 hover:shadow-md dark:hover:shadow-cyan-500/10 cursor-pointer transition-all"
                      onClick={() => onViewIssue(issue)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-slate-900 dark:text-white mb-1">{issue.title}</div>
                          <div className="text-slate-600 dark:text-slate-400 text-sm line-clamp-1">
                            {issue.location.address}
                          </div>
                        </div>
                        <Badge status={issue.status} className="text-xs" />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge priority={issue.priority} className="text-xs" />
                        <span className="text-slate-600 dark:text-slate-400 text-sm">
                          {formatDate(issue.reportedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6 shadow-md hover:shadow-xl dark:hover:shadow-purple-500/20 transition-all dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-slate-900 dark:text-white">Recent Activity</h2>
                </div>
                <div className="space-y-4">
                  {recentIssues.slice(0, 5).map(issue => (
                    <div key={issue._id} className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          issue.status === 'resolved'
                            ? 'bg-green-500 dark:shadow-sm dark:shadow-green-500/50'
                            : issue.status === 'in-progress'
                            ? 'bg-orange-500 dark:shadow-sm dark:shadow-orange-500/50'
                            : issue.status === 'acknowledged'
                            ? 'bg-blue-500 dark:shadow-sm dark:shadow-blue-500/50'
                            : 'bg-slate-500 dark:shadow-sm dark:shadow-slate-500/50'
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="text-slate-900 dark:text-white">{issue.title}</div>
                        <div className="text-slate-600 dark:text-slate-400 text-sm">
                          {issue.status === 'resolved'
                            ? 'Marked as resolved'
                            : issue.status === 'in-progress'
                            ? 'Work in progress'
                            : issue.status === 'acknowledged'
                            ? 'Acknowledged'
                            : 'New submission'} • {formatDate(issue.reportedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6 mt-6 shadow-md dark:border-slate-800">
              <h2 className="text-slate-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => onNavigate('complaint-management')} className="shadow-md">
                  View All Complaints
                </Button>
                <Button variant="outline" onClick={() => onNavigate('map-view')}>
                  Open Map View
                </Button>
                <Button variant="outline" onClick={() => onNavigate('analytics')}>
                  View Analytics
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
