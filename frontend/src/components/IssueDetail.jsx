import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ThumbsUp,
  MapPin,
  Calendar,
  ShieldCheck,
  Camera,
  Loader2,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { useAppStore } from "../store/useAppStore";
import { complaintService } from "../services/complaint.service";

export function IssueDetail({ issue, userRole }) {
  const navigate = useAppStore((state) => state.navigate);

  // Loading & Sync States
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // UI States initialization
  const [upvoted, setUpvoted] = useState(issue.hasUpvoted || false);
  useEffect(() => {
    console.log(issue.hasUpvoted);
    console.log(upvoted);

  }, []);
  useEffect(() => {
    const fetchIssue = async () => {
      const res = await complaintService.getComplaintById(issue._id);
      if (res.success) {
        useAppStore.setState({ selectedIssue: res.data });
      }
    };

    fetchIssue();
  }, [issue._id]);

  const [upvoteCount, setUpvoteCount] = useState(issue.upvoteCount || 0);

  /**
   * THE SOURCE OF TRUTH: voteStatusRef
   * Updates synchronously to prevent multiple clicks from triggering the same logic path.
   */
  const voteStatusRef = useRef(issue.hasUpvoted || false);

  // Sync state if the 'issue' prop changes (important for re-renders)
  useEffect(() => {
    voteStatusRef.current = issue.hasUpvoted || false;
    setUpvoted(issue.hasUpvoted || false);
    setUpvoteCount(issue.upvoteCount || 0);
  }, [issue]);


  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [status, setStatus] = useState(issue.status);
  const [remarks, setRemarks] = useState(issue.authorityRemarks || "");
  const [afterFixImage, setAfterFixImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "Date N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(date);
  };

  /**
   * HANDLER: Synchronous Toggle Logic with Self-Healing
   * Fixes the "reset to 0 on refresh" and "hits 400 error" cycle.
   */
  const handleUpvoteToggle = async () => {
    if (isVoting) return;

    const wasUpvoted = voteStatusRef.current;
    const willBeUpvoted = !wasUpvoted;
    const prevCount = upvoteCount;

    setIsVoting(true);

    // Optimistic UI
    voteStatusRef.current = willBeUpvoted;
    setUpvoted(willBeUpvoted);
    setUpvoteCount((c) => Math.max(0, willBeUpvoted ? c + 1 : c - 1));

    try {
      if (willBeUpvoted) {
        await complaintService.upvoteComplaint(issue._id);
      } else {
        await complaintService.removeUpvote(issue._id);
      }
    } catch (error) {
      const msg = error.response?.data?.message?.toLowerCase() || "";

      if (msg.includes("already upvoted")) {
        // self-heal
        voteStatusRef.current = true;
        setUpvoted(true);
      } else {
        // rollback
        voteStatusRef.current = wasUpvoted;
        setUpvoted(wasUpvoted);
        setUpvoteCount(prevCount);
      }
    } finally {
      setIsVoting(false);
    }
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfterFixImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("status", status);
      formData.append("authorityRemarks", remarks);
      if (afterFixImage) formData.append("image", afterFixImage);

      const res = await complaintService.updateComplaintStatus(
        issue._id,
        formData
      );

      if (res.success) {
        setShowUpdateForm(false);
        navigate("authority-dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() =>
              navigate(
                userRole === "authority"
                  ? "authority-dashboard"
                  : "citizen-dashboard"
              )
            }
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            Case ID: {issue._id}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white dark:bg-slate-900">
              <div className="relative aspect-video group bg-slate-200 dark:bg-slate-800">
                <img
                  src={
                    issue.imageUrl ||
                    "https://via.placeholder.com/800x450?text=No+Evidence"
                  }
                  className="w-full h-full object-cover"
                  alt="Evidence"
                />
                <div className="absolute top-6 left-6 flex gap-2">
                  <Badge status={status} className="shadow-lg border-none" />
                  <Badge
                    priority={issue.aiSeverity || "medium"}
                    className="shadow-lg border-none"
                  />
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400">
                    <Info size={18} />
                    <h2 className="text-[10px] font-black uppercase tracking-widest">
                      Initial Report
                    </h2>
                  </div>
                  {userRole === "citizen" && (
                    <Button
                      variant={upvoted ? "primary" : "outline"}
                      onClick={handleUpvoteToggle}
                      disabled={isVoting}
                      className={`h-10 rounded-xl transition-all ${upvoted
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : ""
                        }`}
                    >
                      {isVoting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <ThumbsUp
                          className={`w-4 h-4 mr-2 ${upvoted ? "fill-current" : ""}`}
                        />
                      )}

                      {upvoteCount} Community Votes
                    </Button>
                  )}
                </div>
                <p className="text-xl text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic">
                  "{issue.description || "No description provided."}"
                </p>
              </div>
            </Card>

            <Card className="p-6 dark:border-slate-800 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-slate-800/30">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                AI Vision Results
              </h3>
              <div className="flex flex-wrap gap-2">
                {issue.aiKeywords?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white dark:bg-slate-800 text-[10px] font-bold rounded-full border border-slate-200 dark:border-slate-700"
                  >
                    #{tag}
                  </span>
                )) || (
                    <span className="text-slate-400 italic text-xs">
                      Analysis pending...
                    </span>
                  )}
              </div>
            </Card>

            {(issue.authorityRemarks || issue.afterFixImageUrl) && (
              <Card className="p-8 border-none shadow-2xl bg-blue-600 text-white rounded-[2rem]">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck size={28} />
                  <h2 className="text-2xl font-bold italic">
                    Resolution Update
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <p className="text-blue-50 leading-relaxed font-medium">
                      {issue.authorityRemarks ||
                        "Maintenance team has addressed the reported issue."}
                    </p>
                    {issue.resolvedAt && (
                      <div className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                        Finalized: {formatDate(issue.resolvedAt)}
                      </div>
                    )}
                  </div>
                  {issue.afterFixImageUrl && (
                    <img
                      src={issue.afterFixImageUrl}
                      className="rounded-2xl shadow-2xl border-4 border-white/20"
                      alt="Fixed"
                    />
                  )}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6 dark:border-slate-800 rounded-3xl space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Location
                    </p>
                    <p className="text-xs font-bold dark:text-white mt-1">
                      {typeof issue.wardId === "object"
                        ? issue.wardId?.name
                        : "Prayagraj Ward"}
                    </p>
                    <p className="text-[10px] font-mono font-bold text-slate-400">
                      {issue.location?.lat?.toFixed(5)},{" "}
                      {issue.location?.lng?.toFixed(5)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Reported On
                    </p>
                    <p className="text-xs font-bold dark:text-white mt-1">
                      {formatDate(issue.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {userRole === "authority" && (
                <div className="pt-6 border-t dark:border-slate-800">
                  {!showUpdateForm ? (
                    <Button
                      className="w-full h-14 rounded-2xl shadow-xl bg-blue-600"
                      onClick={() => setShowUpdateForm(true)}
                    >
                      Update Status
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-sm border dark:border-slate-700 dark:text-white outline-none"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="acknowledged">Acknowledge</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Resolution details..."
                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs border dark:border-slate-700 dark:text-white resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowUpdateForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 bg-green-600"
                          onClick={handleUpdateStatus}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {issue.priorityScore > 0 && (
              <Card className="p-6 dark:border-slate-800 bg-orange-50/30 dark:bg-orange-950/20">
                <div className="flex justify-between items-center text-orange-600">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Priority Score
                    </span>
                  </div>
                  <span className="text-xl font-black">
                    {issue.priorityScore}%
                  </span>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
