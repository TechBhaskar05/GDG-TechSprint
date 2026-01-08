import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Camera,
  MapPin,
  CheckCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { useAppStore } from "../store/useAppStore";
import { complaintService } from "../services/complaint.service";

import toast from "react-hot-toast";

export function ReportIssue() {
  const navigate = useAppStore((state) => state.navigate);
  const selectedLocation = useAppStore((state) => state.selectedLocation);
  const editingIssue = useAppStore((state) => state.editingIssue);

  // 🔧 Image preview + real file (logic only, UI unchanged)
  const image = useAppStore((state) => state.reportImage);
  const setImage = useAppStore((state) => state.setReportImage);
  const reportFile = useAppStore((state) => state.reportFile);
  const setReportFile = useAppStore((state) => state.setReportFile);
  const clearReportContext = useAppStore((state) => state.clearReportContext);

  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasNewImage, setHasNewImage] = useState(false);

  /** LOCATION PRIORITY LOGIC */
  const displayLat = selectedLocation?.lat ?? editingIssue?.location?.lat;
  const displayLng = selectedLocation?.lng ?? editingIssue?.location?.lng;

  useEffect(() => {
    if (editingIssue) {
      setDescription(editingIssue.description);
      setImage(editingIssue.imageUrl);
      setHasNewImage(false);
      setStep(2);
    } else if (selectedLocation) {
      setStep(2);
    }
  }, [editingIssue, selectedLocation, setImage]);

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB");
      return;
    }
    if (file) {
      setReportFile(file);                    // ✅ REAL FILE (FIX)
      setImage(URL.createObjectURL(file));    // preview (unchanged)
      setHasNewImage(true);
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("description", description);

      if (displayLat && displayLng) {
        formData.append("location[lat]", displayLat);
        formData.append("location[lng]", displayLng);
      }

      // ✅ REAL FILE SENT TO BACKEND (FIX)
      if (reportFile) {
        formData.append("image", reportFile);
      }

      if (editingIssue) {
        const res = await complaintService.updateComplaint(
          editingIssue._id,
          formData
        );
        if (res.success) {
          setSubmitted(true);
          clearReportContext();
          setTimeout(() => navigate("citizen-dashboard"), 2000);
        }
      } else {
        const res = await complaintService.createComplaint(formData);
        if (res.success) {
          toast.success("Report submitted successfully");

          setSubmitted(true);
          clearReportContext();
          setTimeout(() => navigate("citizen-dashboard"), 3000);
        }
      }
    } catch (error) {
      console.error("Submission error:", error.message);
      toast.error(error.response?.data?.message || "Failed to process report");

    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center shadow-2xl">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {editingIssue ? "Report Updated!" : "Report Submitted!"}
          </h2>
          <p className="text-slate-500 text-sm italic">
            Redirecting to your dashboard...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b sticky top-0 z-50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => {
              clearReportContext();
              navigate("citizen-dashboard");
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingIssue ? "Edit Report" : "Report New Issue"}
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 w-full flex-1">
        {/* STEP 1: IMAGE SELECTION */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card className="p-16 text-center border-dashed border-2 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <Camera className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {editingIssue ? "Update Evidence" : "Evidence Upload"}
              </h2>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <Button
                size="lg"
                onClick={() => fileInputRef.current.click()}
                className="px-10 py-6 rounded-2xl shadow-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-105 transition-transform"
              >
                Choose New Photo
              </Button>
            </Card>
          </div>
        )}

        {/* STEP 2: DETAILS & LOCATION */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-2 relative group overflow-hidden rounded-3xl min-h-[300px] flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <img
                  src={image}
                  className="w-full h-full object-cover rounded-2xl"
                  alt="Preview"
                />
                <button
                  onClick={() => setStep(1)}
                  className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-xl text-blue-600 dark:text-blue-400 flex items-center gap-2 text-xs font-bold hover:scale-105 transition-transform"
                >
                  <RefreshCw size={14} /> Change Photo
                </button>
              </Card>

              <Card className="p-7 space-y-4 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Location Verification
                  </label>
                  <button
                    onClick={() => navigate("map-view")}
                    className="text-blue-600 dark:text-blue-400 text-[10px] font-bold underline"
                  >
                    Open Map Selector
                  </button>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs font-mono font-bold text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                  <MapPin size={12} className="inline mr-1" />
                  {displayLat?.toFixed(4)}, {displayLng?.toFixed(4)}
                </div>

                <label className="text-[10px] font-black uppercase text-slate-400 mt-4 block tracking-widest">
                  Issue Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm min-h-[140px] outline-none focus:ring-2 focus:ring-blue-500 border border-slate-100 dark:border-slate-800 dark:text-white transition-all"
                  placeholder="Describe the issue..."
                />

                <Button
                  className="w-full h-14 font-bold rounded-2xl shadow-xl"
                  onClick={() => setStep(3)}
                >
                  Review Changes
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* STEP 3: FINAL AUDIT */}
        {step === 3 && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <Card className="p-8 rounded-[2.5rem] shadow-2xl dark:border-slate-800">
              <h2 className="font-black text-2xl dark:text-white mb-6 tracking-tighter italic">
                Submission Audit
              </h2>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <img
                  src={image}
                  className="w-32 h-32 object-cover rounded-2xl shadow-lg border-2 border-white dark:border-slate-800"
                  alt="Review"
                />
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    "{description}"
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {hasNewImage ? "New Image Attached" : "Original Image"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedLocation ? "New Location" : "Existing Location"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 h-14 rounded-2xl border-2"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] h-14 text-xl font-black rounded-2xl shadow-2xl shadow-blue-600/20"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : editingIssue ? (
                  "Save Changes"
                ) : (
                  "Confirm & Submit"
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
