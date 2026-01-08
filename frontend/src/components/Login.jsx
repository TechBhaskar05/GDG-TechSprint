import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import { registerUser, loginUser, googleLogin } from "../services/auth.service";
import { fetchWards, fetchCities } from "../services/ward.service";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react";

export function Login({ isSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");

  // Authority Specific States
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [wardId, setWardId] = useState("");
  const [wards, setWards] = useState([]);
  const [wardLoading, setWardLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Global State for Location Detection
  const navigate = useAppStore((state) => state.navigate);
  const currentAddress = useAppStore((state) => state.currentAddress); // 🆕 Get detected city (e.g., Prayagraj)
  const setAuth = useAuthStore((state) => state.login);
  const userId = useAuthStore((state) => state.user?._id);
  /* FETCH CITIES (FOR AUTHORITY SIGNUP) */
  useEffect(() => {
    if (isSignup && role === "authority") {
      fetchCities()
        .then((res) => setCities(res.data.data || []))
        .catch(() => setCities([]));
    }
  }, [isSignup, role]);

  /* FETCH WARDS BASED ON SELECTED CITY */
  useEffect(() => {
    if (isSignup && role === "authority" && city) {
      setWardLoading(true);
      fetchWards(city)
        .then((res) => setWards(res.data.data || []))
        .catch(() => setWards([]))
        .finally(() => setWardLoading(false));
    }
  }, [city, role, isSignup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        if (role === "authority" && (!city || !wardId)) {
          toast.error("Please select both city and ward");
          setLoading(false);
          return;
        }

        const payload = {
          name: email.split("@")[0],
          email,
          password,
          role,
          // 🆕 FIX: Capture detected city (Prayagraj) for Citizens
          city: role === "citizen" ? currentAddress : city,
        };

        if (role === "authority") {
          payload.wardId = wardId;
        }

        await registerUser(payload);
        toast.success("OTP sent to your email");
        sessionStorage.setItem("pendingEmail", email);
        navigate("verify-otp");
        return;
      }

      /* LOGIN LOGIC */
      const res = await loginUser({ email, password, role });
      const { user, accessToken } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("role", user.role);
      setAuth(user.role,user);

      toast.success("Login successful");


      navigate(
        user.role === "authority" ? "authority-dashboard" : "citizen-dashboard"
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("landing")}
          className="flex items-center gap-2 text-slate-600 mb-6 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        <Card className="p-8 shadow-2xl border-none bg-white dark:bg-slate-800">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">
              {isSignup ? "Join CivicFix AI" : "Welcome Back"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {role === "citizen"
                ? "Improving your community"
                : "Managing city infrastructure"}
            </p>
          </div>

          {/* ROLE SELECTOR */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
            {["citizen", "authority"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  role === r
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full p-3 border dark:border-slate-700 rounded-xl bg-transparent outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-3 border dark:border-slate-700 rounded-xl bg-transparent outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* AUTHORITY SELECTORS */}
            {isSignup && role === "authority" && (
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setWardId("");
                  }}
                  required
                  className="p-3 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                >
                  <option value="">Select City</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={wardId}
                  onChange={(e) => setWardId(e.target.value)}
                  required
                  disabled={!city || wardLoading}
                  className="p-3 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm disabled:opacity-50"
                >
                  <option value="">
                    {wardLoading ? "Loading..." : "Select Ward"}
                  </option>
                  {wards.map((ward) => (
                    <option key={ward._id} value={ward._id}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : isSignup ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t dark:border-slate-700"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await googleLogin({
                    credential: credentialResponse.credential,
                    role,
                    city: role === "citizen" ? currentAddress : city, // 🆕 Sync Google signup location
                    wardId: role === "authority" ? wardId : null,
                  });
                  const { user, accessToken } = res.data;
                  localStorage.setItem("accessToken", accessToken);
                  localStorage.setItem("role", user.role);
                  setAuth(user.role,user);
                  navigate(
                    user.role === "authority"
                      ? "authority-dashboard"
                      : "citizen-dashboard"
                  );
                } catch (err) {
                  alert("Google login failed");
                }
              }}
              onError={() => alert("Google Sign In Failed")}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
