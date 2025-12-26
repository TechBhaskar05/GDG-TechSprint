import { useState } from 'react';
import { ArrowLeft, ThumbsUp, MapPin, Calendar, User, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';
import { useAppStore } from '../store/useAppStore';

export function IssueDetail({ issue, userRole }) {
  const navigate = useAppStore((state) => state.navigate);

  const [upvoted, setUpvoted] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [status, setStatus] = useState(issue.status);
  const [remarks, setRemarks] = useState(issue.remarks || '');

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleUpvote = () => {
    setUpvoted(!upvoted);
  };

  const handleUpdateStatus = () => {
    setShowUpdateForm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button 
            onClick={() =>
              navigate(
                userRole === 'authority'
                  ? 'authority-dashboard'
                  : 'citizen-dashboard'
              )
            }
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 dark:border-slate-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-slate-900 dark:text-white mb-2">{issue.title}</h1>
                  <div className="flex items-center gap-3">
                    <Badge status={status} />
                    <Badge priority={issue.priority} />
                    <Badge>{issue.category}</Badge>
                  </div>
                </div>
                {userRole === 'citizen' && (
                  <Button
                    variant={upvoted ? 'primary' : 'outline'}
                    onClick={handleUpvote}
                    className={upvoted ? 'dark:shadow-lg dark:shadow-cyan-500/30' : ''}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {issue.upvotes + (upvoted ? 1 : 0)}
                  </Button>
                )}
              </div>

              {issue.image && (
                <img 
                  src={issue.image} 
                  alt={issue.title}
                  className="w-full h-96 object-cover rounded-lg mb-6 ring-1 ring-slate-200 dark:ring-slate-700"
                />
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-slate-900 dark:text-white mb-2">Description</h3>
                  <p className="text-slate-600 dark:text-slate-400">{issue.description}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-600 dark:text-slate-400 mb-1">Location</div>
                      <div className="text-slate-900 dark:text-white">{issue.location.address}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-600 dark:text-slate-400 mb-1">Reported</div>
                      <div className="text-slate-900 dark:text-white">{formatDate(issue.reportedAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-600 dark:text-slate-400 mb-1">Reported By</div>
                      <div className="text-slate-900 dark:text-white">{issue.reportedBy}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Community Validation */}
            {userRole === 'citizen' && (
              <Card className="p-6 dark:border-slate-800">
                <h3 className="text-slate-900 dark:text-white mb-4">Community Validation</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-slate-900 dark:text-white">
                        {issue.upvotes + (upvoted ? 1 : 0)} citizens support this
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        Help prioritize by upvoting
                      </div>
                    </div>
                    <Button
                      variant={upvoted ? 'primary' : 'outline'}
                      onClick={handleUpvote}
                      className={upvoted ? 'dark:shadow-lg dark:shadow-cyan-500/30' : ''}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {upvoted ? 'Upvoted' : 'Upvote'}
                    </Button>
                  </div>

                  {issue.similarCount > 0 && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-start gap-3 dark:border dark:border-amber-500/30">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <div className="text-amber-900 dark:text-amber-300 mb-1">
                          Similar Issues Nearby
                        </div>
                        <div className="text-amber-700 dark:text-amber-400">
                          {issue.similarCount} similar {issue.similarCount === 1 ? 'complaint' : 'complaints'} reported in this area
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Updates */}
            {remarks && (
              <Card className="p-6 dark:border-slate-800">
                <h3 className="text-slate-900 dark:text-white mb-4">Latest Update</h3>
                <div className="p-4 bg-blue-50 dark:bg-cyan-900/30 rounded-lg dark:border dark:border-cyan-500/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-200 dark:bg-cyan-500/30 rounded-full flex items-center justify-center flex-shrink-0 dark:border dark:border-cyan-500/50">
                      <span className="text-blue-700 dark:text-cyan-300">WO</span>
                    </div>
                    <div>
                      <div className="text-blue-900 dark:text-cyan-300 mb-1">Ward Officer</div>
                      <div className="text-blue-700 dark:text-cyan-400">{remarks}</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {issue.resolvedImage && (
              <Card className="p-6 dark:border-slate-800">
                <h3 className="text-slate-900 dark:text-white mb-4">Resolution Photo</h3>
                <img 
                  src={issue.resolvedImage} 
                  alt="Issue resolved"
                  className="w-full h-64 object-cover rounded-lg ring-1 ring-slate-200 dark:ring-slate-700"
                />
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Analysis */}
            <Card className="p-6 dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800/50">
              <h3 className="text-slate-900 dark:text-white mb-4">AI Analysis</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-slate-600 dark:text-slate-400 mb-1">Auto-detected Category</div>
                  <Badge>{issue.category}</Badge>
                </div>
                <div>
                  <div className="text-slate-600 dark:text-slate-400 mb-1">Priority Score</div>
                  <Badge priority={issue.priority} />
                </div>
                <div>
                  <div className="text-slate-600 dark:text-slate-400 mb-1">Impact Assessment</div>
                  <div className="text-slate-900 dark:text-white">
                    {issue.priority === 'high' && 'High impact on public safety and infrastructure'}
                    {issue.priority === 'medium' && 'Moderate impact requiring attention'}
                    {issue.priority === 'low' && 'Low priority, non-critical issue'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Authority Actions */}
            {userRole === 'authority' && (
              <Card className="p-6 dark:border-slate-800">
                <h3 className="text-slate-900 dark:text-white mb-4">Manage Issue</h3>
                {!showUpdateForm ? (
                  <div className="space-y-3">
                    <Button 
                      className="w-full"
                      onClick={() => setShowUpdateForm(true)}
                    >
                      Update Status
                    </Button>
                    <Button variant="outline" className="w-full">
                      Assign Team
                    </Button>
                    <Button variant="outline" className="w-full">
                      View Location on Map
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-2">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-2">Remarks</label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add update for citizens..."
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => setShowUpdateForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={handleUpdateStatus}
                      >
                        Save Update
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Issue Statistics */}
            <Card className="p-6 dark:border-slate-800 dark:border-purple-900/50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-purple-950/30">
              <h3 className="text-slate-900 dark:text-white mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Upvotes</span>
                  <span className="text-slate-900 dark:text-purple-400">
                    {issue.upvotes + (upvoted ? 1 : 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Similar Issues</span>
                  <span className="text-slate-900 dark:text-purple-400">{issue.similarCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Days Open</span>
                  <span className="text-slate-900 dark:text-purple-400">
                    {Math.floor((Date.now() - issue.reportedAt.getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
