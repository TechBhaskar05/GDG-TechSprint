import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import { registerUser, loginUser } from "../services/auth.service";
import { fetchWards, fetchCities } from "../services/ward.service";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../services/auth.service";

export function Login({ isSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");

  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [wardId, setWardId] = useState("");
  const [wards, setWards] = useState([]);
  const [wardLoading, setWardLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useAppStore((state) => state.navigate);
  const setAuth = useAuthStore((state) => state.login);

  /* =========================
     FETCH CITIES (ON SIGNUP)
  ========================= */
  useEffect(() => {
    if (isSignup && role === "authority") {
      fetchCities()
        .then((res) => {
          setCities(res.data.data || []);
        })
        .catch(() => {
          setCities([]);
        });
    }
  }, [isSignup, role]);


  /* FETCH WARDS BASED ON CITY */
  useEffect(() => {
    if (isSignup && role === "authority" && city) {
      console.log("Fetching wards for city:", city); // 👈 ADD THIS

      setWardLoading(true);

      fetchWards(city)
        .then((res) => {
          console.log("Ward API response:", res.data); // 👈 ADD THIS
          setWards(res.data.data || []);
        })
        .catch((err) => {
          console.error("Ward fetch error:", err);
          setWards([]);
        })
        .finally(() => {
          setWardLoading(false);
        });
    }
  }, [city, role, isSignup]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* SIGNUP */
      if (isSignup) {
        if (role === "authority" && (!city || !wardId)) {
          alert("Please select city and ward");
          setLoading(false);
          return;
        }

        const payload = {
          name: email.split("@")[0],
          email,
          password,
          role,
        };

        if (role === "authority") {
          payload.city = city;
          payload.wardId = wardId;
        }

        await registerUser(payload);

        sessionStorage.setItem("pendingEmail", email);
        navigate("verify-otp");
        return;
      }

      /* LOGIN */
      const res = await loginUser({ email, password, role });
      const { user, accessToken } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("role", user.role);

      setAuth(user.role);

      navigate(
        user.role === "authority"
          ? "authority-dashboard"
          : "citizen-dashboard"
      );
    } catch (err) {
      alert(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("landing")}
          className="flex items-center gap-2 text-slate-600 mb-6"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <Card className="p-8">
          <h2 className="text-xl font-semibold text-center mb-6">
            {isSignup ? "Create Account" : "Sign In"}
          </h2>

          {/* ROLE TABS */}
          <div className="flex gap-2 mb-4">
            {["citizen", "authority"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded ${role === r
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-slate-700"
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-2 border rounded"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-2 border rounded"
            />

            <GoogleLogin
  onSuccess={async (credentialResponse) => {
    try {
      const res = await googleLogin({
        credential: credentialResponse.credential,
        role,
        wardId: role === "authority" ? wardId : null,
      });

      const { user, accessToken } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("role", user.role);

      setAuth(user.role);

      navigate(
        user.role === "authority"
          ? "authority-dashboard"
          : "citizen-dashboard"
      );
    } catch (err) {
      alert(err.response?.data?.message || "Google login failed");
    }
  }}
  onError={() => {
    alert("Google Sign In Failed");
  }}
/>


            {/* CITY */}
            {isSignup && role === "authority" && (
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setWardId("");
                }}
                required
                className="w-full p-2 rounded-md border bg-slate-100 dark:bg-slate-800"
              >
                <option value="">Select City</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {/* WARD */}
            {isSignup && role === "authority" && city && (
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                required
                className="w-full p-2 rounded-md border bg-slate-100 dark:bg-slate-800"
              >
                <option value="">
                  {wardLoading ? "Loading wards..." : "Select Ward"}
                </option>

                {wards.map((ward) => (
                  <option key={ward._id} value={ward._id}>
                    {ward.name}
                  </option>
                ))}
              </select>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Please wait..."
                : isSignup
                  ? "Create Account"
                  : "Sign In"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
