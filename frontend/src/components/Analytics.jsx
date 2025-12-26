import { LayoutDashboard, FileText, Map, BarChart3, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from './Card';
import { Badge } from './Badge';
import { mockIssues, categories } from '../data/mockData';
import { useAppStore } from '../store/useAppStore';

export function Analytics() {
  const onNavigate = useAppStore((state) => state.navigate);

  // Process data for charts
  const categoryData = categories.map(cat => ({
    name: cat.split(' ')[0],
    count: mockIssues.filter(i => i.category === cat).length
  })).filter(d => d.count > 0);

  const priorityData = [
    { name: 'High', value: mockIssues.filter(i => i.priority === 'high').length, color: '#ef4444' },
    { name: 'Medium', value: mockIssues.filter(i => i.priority === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: mockIssues.filter(i => i.priority === 'low').length, color: '#22c55e' }
  ];

  const statusData = [
    { name: 'Submitted', value: mockIssues.filter(i => i.status === 'submitted').length },
    { name: 'Acknowledged', value: mockIssues.filter(i => i.status === 'acknowledged').length },
    { name: 'In Progress', value: mockIssues.filter(i => i.status === 'in-progress').length },
    { name: 'Resolved', value: mockIssues.filter(i => i.status === 'resolved').length }
  ];

  const trendData = [
    { week: 'Week 1', reported: 12, resolved: 8 },
    { week: 'Week 2', reported: 15, resolved: 10 },
    { week: 'Week 3', reported: 18, resolved: 14 },
    { week: 'Week 4', reported: 14, resolved: 16 }
  ];

  const avgResolutionTime = 4.2; // days
  const resolutionRate = ((mockIssues.filter(i => i.status === 'resolved').length / mockIssues.length) * 100).toFixed(1);

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
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
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
              <h1 className="text-slate-900 dark:text-white mb-2">Analytics & Reports</h1>
              <p className="text-slate-600 dark:text-slate-400">Comprehensive insights into civic issue patterns and resolution</p>
            </div>

            {/* AI Summary Card */}
            <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-cyan-900/30 dark:to-purple-900/30 border-blue-200 dark:border-cyan-500/30">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 dark:bg-gradient-to-br dark:from-cyan-500 dark:to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 dark:shadow-lg dark:shadow-cyan-500/50">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-slate-900 dark:text-white mb-2">AI Weekly Summary</h2>
                  <p className="text-slate-600 dark:text-slate-400">Generated insights for December 18-24, 2024</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg dark:border dark:border-slate-700">
                  <div className="text-slate-600 dark:text-slate-400 mb-1">Top Risk Category</div>
                  <div className="text-slate-900 dark:text-cyan-400">Waste Management</div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">High upvote concentration</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg dark:border dark:border-slate-700">
                  <div className="text-slate-600 dark:text-slate-400 mb-1">Hotspot Area</div>
                  <div className="text-slate-900 dark:text-purple-400">Andheri West</div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">Multiple high-priority issues</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg dark:border dark:border-slate-700">
                  <div className="text-slate-600 dark:text-slate-400 mb-1">Recommendation</div>
                  <div className="text-slate-900 dark:text-pink-400">Increase patrols</div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">Public safety concerns rising</div>
                </div>
              </div>
            </Card>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <Card className="p-6 dark:border-slate-800 dark:hover:shadow-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-600 dark:text-slate-400">Avg. Resolution Time</div>
                  <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-slate-900 dark:text-white mb-1">{avgResolutionTime} days</div>
                <div className="text-green-600 dark:text-green-400 text-sm">↓ 12% from last week</div>
              </Card>

              <Card className="p-6 dark:border-slate-800 dark:hover:shadow-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-600 dark:text-slate-400">Resolution Rate</div>
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-slate-900 dark:text-cyan-400 mb-1">{resolutionRate}%</div>
                <div className="text-green-600 dark:text-green-400 text-sm">↑ 8% from last week</div>
              </Card>

              <Card className="p-6 dark:border-slate-800 dark:hover:shadow-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-600 dark:text-slate-400">Citizen Satisfaction</div>
                  <div className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center dark:border dark:border-yellow-500/30">
                    <span className="text-yellow-600 dark:text-yellow-400 text-xs">★</span>
                  </div>
                </div>
                <div className="text-slate-900 dark:text-purple-400 mb-1">4.2/5.0</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">Based on feedback</div>
              </Card>

              <Card className="p-6 dark:border-slate-800 dark:hover:shadow-orange-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-600 dark:text-slate-400">Active Issues</div>
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-slate-900 dark:text-orange-400 mb-1">
                  {mockIssues.filter(i => i.status !== 'resolved').length}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">Requiring attention</div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Issues by Category */}
              <Card className="p-6 dark:border-slate-800">
                <h3 className="text-slate-900 dark:text-white mb-4">Issues by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                    <XAxis dataKey="name" stroke="#64748b" className="dark:stroke-slate-400" />
                    <YAxis stroke="#64748b" className="dark:stroke-slate-400" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Priority Distribution */}
              <Card className="p-6 dark:border-slate-800">
                <h3 className="text-slate-900 dark:text-white mb-4">Priority Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Resolution Trend */}
            <Card className="p-6 mb-6 dark:border-slate-800">
              <h3 className="text-slate-900 dark:text-white mb-4">Issues Reported vs Resolved</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="week" stroke="#64748b" className="dark:stroke-slate-400" />
                  <YAxis stroke="#64748b" className="dark:stroke-slate-400" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="reported" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Status Breakdown */}
            <Card className="p-6 dark:border-slate-800">
              <h3 className="text-slate-900 dark:text-white mb-4">Status Breakdown</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {statusData.map((status) => (
                  <div key={status.name} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg dark:border dark:border-slate-700">
                    <div className="text-slate-600 dark:text-slate-400 mb-2">{status.name}</div>
                    <div className="text-slate-900 dark:text-white mb-1">{status.value}</div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 dark:bg-cyan-400 h-2 rounded-full" 
                        style={{ width: `${(status.value / mockIssues.length) * 100}%` }}
                      ></div>
                    </div>
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
