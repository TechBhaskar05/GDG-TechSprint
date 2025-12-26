import { Plus } from 'lucide-react';
import { Header } from './Header';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';
import { mockUserIssues } from '../data/mockData';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

export function CitizenDashboard() {
  const onNavigate = useAppStore((state) => state.navigate);
  const onViewIssue = useAppStore((state) => state.viewIssueDetail);
  const onLogout = useAuthStore((state) => state.logout);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header 
        userRole="citizen" 
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-slate-900 dark:text-white mb-2 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Track your reported issues and help improve your community
          </p>
        </div>

        {/* Report Button */}
        <Button 
          size="lg" 
          onClick={() => onNavigate('report-issue')}
          className="mb-8 shadow-lg shadow-blue-600/20 dark:shadow-cyan-500/30 hover:shadow-xl hover:shadow-blue-600/30 dark:hover:shadow-cyan-500/50"
        >
          <Plus className="w-5 h-5" />
          Report New Issue
        </Button>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg dark:hover:shadow-cyan-500/20 transition-all group dark:border-slate-800">
            <div className="text-slate-600 dark:text-slate-400 mb-1">Total Reports</div>
            <div className="text-slate-900 dark:text-cyan-400 group-hover:scale-110 transition-transform origin-left">
              {mockUserIssues.length}
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg dark:hover:shadow-orange-500/20 transition-all group border-orange-200/50 dark:border-orange-900/50 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-900 dark:to-orange-950/30">
            <div className="text-slate-600 dark:text-slate-400 mb-1">In Progress</div>
            <div className="text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform origin-left">
              {mockUserIssues.filter(i => i.status === 'in-progress').length}
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg dark:hover:shadow-green-500/20 transition-all group border-green-200/50 dark:border-green-900/50 bg-gradient-to-br from-white to-green-50/30 dark:from-slate-900 dark:to-green-950/30">
            <div className="text-slate-600 dark:text-slate-400 mb-1">Resolved</div>
            <div className="text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform origin-left">
              {mockUserIssues.filter(i => i.status === 'resolved').length}
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg dark:hover:shadow-purple-500/20 transition-all group border-blue-200/50 dark:border-purple-900/50 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-purple-950/30">
            <div className="text-slate-600 dark:text-slate-400 mb-1">Total Upvotes</div>
            <div className="text-slate-900 dark:text-purple-400 group-hover:scale-110 transition-transform origin-left">
              {mockUserIssues.reduce((sum, issue) => sum + issue.upvotes, 0)}
            </div>
          </Card>
        </div>

        {/* Issues List */}
        <div>
          <h2 className="text-slate-900 dark:text-white mb-4">Your Reported Issues</h2>
          <div className="space-y-4">
            {mockUserIssues.map((issue) => (
              <Card 
                key={issue.id} 
                className="p-6 hover:shadow-xl dark:hover:shadow-cyan-500/20 transition-all hover:-translate-y-0.5 dark:border-slate-800"
                onClick={() => onViewIssue(issue)}
              >
                <div className="flex gap-6">
                  {issue.image && (
                    <div className="relative group/img">
                      <img 
                        src={issue.image} 
                        alt={issue.title}
                        className="w-32 h-32 object-cover rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 group-hover/img:ring-2 group-hover/img:ring-blue-400 dark:group-hover/img:ring-cyan-400 transition-all"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-slate-900 dark:text-white mb-1">{issue.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                          {issue.description}
                        </p>
                      </div>
                      <Badge status={issue.status} />
                    </div>
                    <div className="flex items-center gap-6 mt-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Badge className="text-xs">{issue.category}</Badge>
                      </div>
                      <div>{issue.location.address}</div>
                      <div>Reported {formatDate(issue.reportedAt)}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-blue-600 dark:text-cyan-400">{issue.upvotes}</span> upvotes
                      </div>
                    </div>
                    {issue.remarks && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-cyan-900/30 dark:to-purple-900/30 text-blue-700 dark:text-cyan-300 rounded-lg border border-blue-200/50 dark:border-cyan-500/30">
                        <span className="font-medium">Update: </span>{issue.remarks}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
