import { useState } from 'react';
import { Filter, X, ArrowLeft } from 'lucide-react';
import { Header } from './Header';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { mockIssues, categories } from '../data/mockData';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

export function MapView() {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const navigate = useAppStore((state) => state.navigate);
  const viewIssue = useAppStore((state) => state.viewIssue);

  const userRole = useAuthStore((state) => state.userRole);
  const logout = useAuthStore((state) => state.logout);

  const filteredIssues = mockIssues.filter(issue => {
    if (filterCategory && issue.category !== filterCategory) return false;
    if (filterPriority && issue.priority !== filterPriority) return false;
    if (filterStatus && issue.status !== filterStatus) return false;
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#22c55e';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {userRole ? (
        <Header 
          userRole={userRole} 
          onLogout={logout}
          onNavigate={navigate}
        />
      ) : (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button 
                onClick={() => navigate('landing')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-cyan-500 dark:to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 dark:shadow-cyan-500/50">
                  <span className="text-white">CF</span>
                </div>
                <span className="text-slate-900 dark:text-white">CivicFix AI</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('landing')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <Button variant="ghost" onClick={() => navigate('login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('signup')}>
                Get Started
              </Button>
            </div>
          </div>
        </header>
      )}

      <div className="flex-1 flex">
        {/* Map Area */}
        <div className="flex-1 relative bg-slate-200 dark:bg-slate-900">
          {/* Mock Map */}
          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-950">
            <svg className="w-full h-full">
              {/* Grid pattern for map background */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" className="dark:stroke-slate-800" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Issue markers */}
              {filteredIssues.map((issue, index) => {
                const x = 20 + (index * 80) % 800;
                const y = 100 + (Math.floor(index / 10) * 120);
                return (
                  <g 
                    key={issue.id}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r="20"
                      fill={getPriorityColor(issue.priority)}
                      opacity="0.3"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="12"
                      fill={getPriorityColor(issue.priority)}
                    />
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      className="text-xs"
                    >
                      {issue.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Filter Button */}
          <div className="absolute top-4 left-4">
            <Button onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4" />
              Filters
              {(filterCategory || filterPriority || filterStatus) && (
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              )}
            </Button>
          </div>

          {/* Legend */}
          <Card className="absolute bottom-4 left-4 p-4 dark:border-slate-800">
            <div className="text-slate-900 dark:text-white mb-3">Priority Levels</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 dark:shadow-sm dark:shadow-red-500/50"></div>
                <span className="text-slate-700 dark:text-slate-300">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500 dark:shadow-sm dark:shadow-yellow-500/50"></div>
                <span className="text-slate-700 dark:text-slate-300">Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 dark:shadow-sm dark:shadow-green-500/50"></div>
                <span className="text-slate-700 dark:text-slate-300">Low Priority</span>
              </div>
            </div>
          </Card>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="absolute top-20 left-4 w-80 p-6 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-900 dark:text-white">Filter Issues</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-2">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
                  >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setFilterCategory('');
                    setFilterPriority('');
                    setFilterStatus('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Side Panel */}
        <div className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
          {selectedIssue ? (
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-slate-900 dark:text-white">{selectedIssue.title}</h3>
                <button onClick={() => setSelectedIssue(null)}>
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {selectedIssue.image && (
                <img 
                  src={selectedIssue.image} 
                  alt={selectedIssue.title}
                  className="w-full h-48 object-cover rounded-lg mb-4 ring-1 ring-slate-200 dark:ring-slate-700"
                />
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-slate-600 dark:text-slate-400 mb-1">Description</div>
                  <div className="text-slate-900 dark:text-white">{selectedIssue.description}</div>
                </div>

                <div>
                  <div className="text-slate-600 dark:text-slate-400 mb-1">Location</div>
                  <div className="text-slate-900 dark:text-white">{selectedIssue.location.address}</div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-slate-600 dark:text-slate-400 mb-1">Category</div>
                    <Badge>{selectedIssue.category}</Badge>
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-600 dark:text-slate-400 mb-1">Priority</div>
                    <Badge priority={selectedIssue.priority} />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-slate-600 dark:text-slate-400 mb-1">Status</div>
                    <Badge status={selectedIssue.status} />
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-600 dark:text-slate-400 mb-1">Upvotes</div>
                    <div className="text-slate-900 dark:text-cyan-400">{selectedIssue.upvotes}</div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-600 dark:text-slate-400 mb-1">Reported By</div>
                  <div className="text-slate-900 dark:text-white">{selectedIssue.reportedBy}</div>
                </div>
              </div>

              <Button 
                className="w-full"
                onClick={() => viewIssue(selectedIssue)}
              >
                View Full Details
              </Button>
            </div>
          ) : (
            <div className="p-6">
              <h3 className="text-slate-900 dark:text-white mb-4">
                All Issues ({filteredIssues.length})
              </h3>
              <div className="space-y-3">
                {filteredIssues.map(issue => (
                  <Card
                    key={issue.id}
                    className="p-4 hover:shadow-sm dark:hover:shadow-cyan-500/10 dark:border-slate-800"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-2">
                        <div className="text-slate-900 dark:text-white mb-1">
                          {issue.title}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                          {issue.description}
                        </div>
                      </div>
                      <Badge priority={issue.priority} className="text-xs" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge status={issue.status} className="text-xs" />
                      <span className="text-slate-600 dark:text-slate-400 text-sm">
                        {issue.upvotes} upvotes
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
