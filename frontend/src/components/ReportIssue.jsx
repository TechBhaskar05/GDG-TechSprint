import { useState } from "react";
import {
  ArrowLeft,
  Camera,
  MapPin,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { categories } from "../data/mockData";
import { useAppStore } from "../store/useAppStore";

export function ReportIssue() {
  const navigate = useAppStore((state) => state.navigate);

  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [image, setImage] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      navigate("citizen-dashboard");
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center dark:border-slate-800">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 dark:border dark:border-green-500/30 dark:shadow-lg dark:shadow-green-500/20">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-slate-900 dark:text-white mb-2">
            Issue Reported Successfully!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your report has been submitted. Our AI is analyzing it and will
            assign priority shortly.
          </p>
          <div className="p-4 bg-blue-50 dark:bg-cyan-900/30 rounded-lg text-left dark:border dark:border-cyan-500/30">
            <div className="text-blue-900 dark:text-cyan-300 mb-2">
              AI Analysis Complete
            </div>
            <div className="space-y-2 text-blue-700 dark:text-cyan-400">
              <div className="flex justify-between">
                <span>Category:</span>
                <Badge>{selectedCategory || "Road Damage"}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Priority:</span>
                <Badge priority={urgency} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("citizen-dashboard")}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-cyan-400"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-slate-900 dark:text-white">Report New Issue</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              1
            </div>
            <span className={step >= 1 ? "text-slate-900" : "text-slate-600"}>
              Upload Photo
            </span>
          </div>
          <div className="w-16 h-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              2
            </div>
            <span className={step >= 2 ? "text-slate-900" : "text-slate-600"}>
              Describe Issue
            </span>
          </div>
          <div className="w-16 h-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              3
            </div>
            <span className={step >= 3 ? "text-slate-900" : "text-slate-600"}>
              Review & Submit
            </span>
          </div>
        </div>

        {/* Step 1: Upload Image */}
        {step === 1 && (
          <Card className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-slate-900 dark:text-white mb-2">
                Upload Photo of the Issue
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                A clear photo helps authorities understand and resolve the issue
                faster
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button size="lg" as="span">
                  <Camera className="w-5 h-5" />
                  Choose Photo
                </Button>
              </label>
            </div>
          </Card>
        )}

        {/* Step 2: Describe Issue */}
        {step === 2 && (
          <div className="space-y-6">
            {image && (
              <Card className="p-6">
                <img
                  src={image}
                  alt="Uploaded issue"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </Card>
            )}

            <Card className="p-6">
              <label className="block mb-4">
                <span className="text-slate-900 dark:text-white mb-2 block">
                  Describe the issue
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about the location, severity, and any safety concerns..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </label>

              <div className="mb-4">
                <span className="text-slate-900 dark:text-white mb-2 block">
                  Category (optional)
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">AI will detect automatically</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <span className="text-slate-900 dark:text-white mb-3 block">
                  Urgency Level
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setUrgency("low")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      urgency === "low"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    Low
                  </button>
                  <button
                    onClick={() => setUrgency("medium")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      urgency === "medium"
                        ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setUrgency("high")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      urgency === "high"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    High
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg mb-6">
                <MapPin className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <div className="text-slate-900 mb-1">
                    Auto-detected Location
                  </div>
                  <div className="text-slate-600">
                    Main Street, Andheri West, Mumbai
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!description.trim()}
                  className="flex-1"
                >
                  Continue to Review
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-slate-900 dark:text-white mb-4">
                Review Your Report
              </h2>

              {image && (
                <img
                  src={image}
                  alt="Issue"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}

              <div className="space-y-4">
                <div>
                  <div className="text-slate-600 dark:text-slate-400 mb-1">
                    Description
                  </div>
                  <div className="text-slate-900 dark:text-white">
                    {description}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-slate-600 dark:text-slate-400 mb-1">
                      Location
                    </div>
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <MapPin className="w-4 h-4" />
                      Main Street, Andheri West, Mumbai
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-600 dark:text-slate-400 mb-1">
                      Urgency
                    </div>
                    <Badge priority={urgency} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-blue-900 mb-1">AI Analysis Preview</div>
                  <div className="text-blue-700">
                    Our AI will automatically classify this issue and assign
                    priority based on severity, location impact, and historical
                    patterns. You'll receive updates via notifications.
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back to Edit
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
