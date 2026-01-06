import { useState } from "react";
import {
  ArrowLeft,
  ThumbsUp,
  MapPin,
  Calendar,
  User,
  AlertTriangle,
  ShieldCheck,
  Camera,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { useAppStore } from "../store/useAppStore";
import { complaintService } from "../services/complaint.service";

export function IssueDetail({ issue, userRole }) {
  const navigate = useAppStore((state) => state.navigate);

  // States for handling updates
  const [isUpdating, setIsUpdating] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Form States for Authority
  const [status, setStatus] = useState(issue.status);
  const [remarks, setRemarks] = useState(issue.authorityRemarks || "");
  const [afterFixImage, setAfterFixImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(date));
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
      if (afterFixImage) {
        formData.append("image", afterFixImage);
      }

      // Using the service we created earlier
      const res = await complaintService.updateStatus(issue._id, formData);

      if (res.success) {
        setShowUpdateForm(false);
        // Refresh dashboard or local state
        navigate("authority-dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update issue");
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
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            Case ID: {issue._id.substring(0, 8)}...
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: Content & Evidence */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white dark:bg-slate-900">
              <div className="relative aspect-video group">
                <img
                  src={issue.imageUrl}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Issue Evidence"
                />
                <div className="absolute top-6 left-6 flex gap-2">
                  <Badge status={status} className="shadow-lg border-none" />
                  <Badge
                    priority={issue.aiSeverity}
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
                      onClick={() => setUpvoted(!upvoted)}
                      className={`h-10 rounded-xl transition-all ${
                        upvoted ? "shadow-lg shadow-blue-500/20" : ""
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      {issue.upvoteCount + (upvoted ? 1 : 0)} Upvotes
                    </Button>
                  )}
                </div>
                <p className="text-xl text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  "{issue.description}"
                </p>
              </div>
            </Card>

            {/* AI Analysis Card */}
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
                    Awaiting processing...
                  </span>
                )}
              </div>
            </Card>

            {/* Updates / Resolution Trail */}
            {(issue.authorityRemarks || issue.afterFixImageUrl) && (
              <Card className="p-8 border-none shadow-2xl bg-blue-600 text-white rounded-[2rem]">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck size={28} />
                  <h2 className="text-2xl font-bold tracking-tight italic">
                    Resolution Update
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <p className="text-blue-50 leading-relaxed font-medium">
                      {issue.authorityRemarks ||
                        "Work in progress by ward maintenance team."}
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

          {/* RIGHT: Sidebar Details */}
          <div className="space-y-6">
            <Card className="p-6 dark:border-slate-800 rounded-3xl space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Spatial Pin
                    </p>
                    <p className="text-xs font-mono font-bold dark:text-white mt-1">
                      {issue.location.lat.toFixed(5)},{" "}
                      {issue.location.lng.toFixed(5)}
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

              {/* Authority Action Panel */}
              {userRole === "authority" && (
                <div className="pt-6 border-t dark:border-slate-800">
                  {!showUpdateForm ? (
                    <Button
                      className="w-full h-14 rounded-2xl shadow-xl shadow-blue-600/20"
                      onClick={() => setShowUpdateForm(true)}
                    >
                      Update Case Status
                    </Button>
                  ) : (
                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                          New Status
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-700 dark:text-white"
                        >
                          <option value="acknowledged">Acknowledge</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>

                      {status === "resolved" && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-green-500 uppercase tracking-widest block">
                            Fix Evidence
                          </label>
                          <div className="border-2 border-dashed dark:border-slate-700 rounded-xl p-4 text-center">
                            {previewUrl ? (
                              <img
                                src={previewUrl}
                                className="w-full h-32 object-cover rounded-lg mb-2"
                                alt="Preview"
                              />
                            ) : (
                              <Camera className="mx-auto text-slate-400 mb-2" />
                            )}
                            <input
                              type="file"
                              id="afterFix"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                            <label
                              htmlFor="afterFix"
                              className="text-[10px] font-bold text-blue-500 cursor-pointer"
                            >
                              UPLOAD PHOTO
                            </label>
                          </div>
                        </div>
                      )}

                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Authority remarks..."
                        rows={4}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs outline-none border border-slate-200 dark:border-slate-700 dark:text-white resize-none"
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
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={handleUpdateStatus}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Save"
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
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Urgency Score
                    </span>
                  </div>
                  <span className="text-xl font-black text-orange-600">
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
