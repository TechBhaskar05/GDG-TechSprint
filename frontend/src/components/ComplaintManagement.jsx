import { useState } from 'react';
import { LayoutDashboard, FileText, Map, BarChart3, Search, Filter, Download } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { mockIssues, categories, wards } from '../data/mockData';
import { useAppStore } from '../store/useAppStore';

export function ComplaintManagement() {
  const onNavigate = useAppStore((state) => state.navigate);
  const onViewIssue = useAppStore((state) => state.viewIssue);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterWard, setFilterWard] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [sortBy, setSortBy] = useState('priority');

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  let filteredIssues = mockIssues.filter(issue => {
    if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCategory && issue.category !== filterCategory) return false;
    if (filterStatus && issue.status !== filterStatus) return false;
    if (filterPriority && issue.priority !== filterPriority) return false;
    return true;
  });

  // Sort issues
  filteredIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'date') {
      return b.reportedAt.getTime() - a.reportedAt.getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    } else {
      return b.upvotes - a.upvotes;
    }
  });

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
              onClick={() => onNavigate('authority-dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button 
              onClick={() => onNavigate('complaint-management')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-900 dark:text-cyan-400 bg-slate-100 dark:bg-gradient-to-r dark:from-cyan-900/30 dark:to-purple-900/30 rounded-lg dark:border dark:border-cyan-500/30"
            >
              <FileText className="w-5 h-5" />
              Complaints
            </button>
            <button 
              onClick={() => onNavigate('map-view')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <Map className="w-5 h-5" />
              Map View
            </button>
            <button 
              onClick={() => onNavigate('analytics')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
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
              <h1 className="text-slate-900 dark:text-white mb-2">Complaint Management</h1>
              <p className="text-slate-600 dark:text-slate-400">View and manage all civic issue reports</p>
            </div>

            {/* Filters and Search */}
            <Card className="p-6 mb-6 dark:border-slate-800">
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>

                <select
                  value={filterWard}
                  onChange={(e) => setFilterWard(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
                >
                  <option value="">All Wards</option>
                  {wards.map(ward => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
                >
                  <option value="">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">Priority:</span>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-3 py-1 border border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
                    >
                      <option value="">All</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-400">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 border border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
                    >
                      <option value="priority">Priority</option>
                      <option value="date">Date</option>
                      <option value="upvotes">Upvotes</option>
                    </select>
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </Card>

            {/* Results Summary */}
            <div className="mb-4 text-slate-600 dark:text-slate-400">
              Showing {filteredIssues.length} of {mockIssues.length} complaints
            </div>

            {/* Complaints Table */}
            <Card className="dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="text-left px-6 py-4 text-slate-600 dark:text-slate-400">Issue</th>
                      <th className="text-left px-6 py-4 text-slate-600 dark:text-slate-400">Category</th>
                      <th className="text-left px-6 py-4 text-slate-600 dark:text-slate-400">Location</th>
                      <th className="text-left px-6 py-4 text-slate-600 dark:text-slate-400">Priority</th>
                      <th className="text-left px-6 py-4 text-slate-600 dark:text-slate-400">Status</th>
                      <th className="text-left px-6 py-4 text-slate-600 dark:text-slate-400">Upvotes</th>
                      <th className="text-left px-6 py-4 text-slate-600 dark:text-slate-400">Date</th>
                      <th className="text-left px-6 py-4 text-slate-600 dark:text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredIssues.map(issue => (
                      <tr 
                        key={issue.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        onClick={() => onViewIssue(issue)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {issue.image && (
                              <img 
                                src={issue.image} 
                                alt={issue.title}
                                className="w-12 h-12 object-cover rounded ring-1 ring-slate-200 dark:ring-slate-700"
                              />
                            )}
                            <div>
                              <div className="text-slate-900 dark:text-white">{issue.title}</div>
                              <div className="text-slate-600 dark:text-slate-400 text-sm">{issue.reportedBy}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="text-xs">{issue.category}</Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {issue.location.address}
                        </td>
                        <td className="px-6 py-4">
                          <Badge priority={issue.priority} className="text-xs" />
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={issue.status} className="text-xs" />
                        </td>
                        <td className="px-6 py-4 text-slate-900 dark:text-cyan-400">
                          {issue.upvotes}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {formatDate(issue.reportedAt)}
                        </td>
                        <td className="px-6 py-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewIssue(issue);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
