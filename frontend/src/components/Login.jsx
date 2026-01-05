import { useState } from "react";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import { registerUser, loginUser } from "../services/auth.service";

export function Login({ isSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [loading, setLoading] = useState(false);

  const navigate = useAppStore((state) => state.navigate);
  const setAuth = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* =========================
         SIGNUP FLOW (OTP)
      ========================== */
      if (isSignup) {
        const res = await registerUser({
          name: email.split("@")[0],
          email,
          password,
          role,
        });

        console.log(res);
        

        // Backend sends OTP to email
        sessionStorage.setItem("pendingEmail", email);
        console.log("Stored pendingEmail:", sessionStorage.getItem("pendingEmail"));
        navigate("verify-otp");

        return;
      }

      /* =========================
         LOGIN FLOW
      ========================== */
      const res = await loginUser({ email, password });
      console.log("reached here");
      console.log(res);
      const { user, accessToken } = res.data;

      console.log(user);

      console.log("reached here");

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("role", user.role);

      console.log("reached here");

      setAuth(user.role);

      console.log("reached");

      setTimeout(() => {
        navigate(
          user.role === "authority"
            ? "authority-dashboard"
            : "citizen-dashboard"
        );
      }, 0);

        console.log("reachedidhar");

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
          <ArrowLeft size={18} />
          Back
        </button>

        <Card className="p-8">
          <h2 className="text-xl font-semibold text-center mb-6">
            {isSignup ? "Create Account" : "Sign In"}
          </h2>

          {/* Role Selection */}
          <div className="flex gap-2 mb-4">
            {["citizen", "authority"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded ${role === r
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Please wait..."
                : isSignup
                  ? "Create Account"
                  : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate(isSignup ? "login" : "signup")}
              className="text-blue-600"
            >
              {isSignup
                ? "Already have an account? Sign in"
                : "New user? Sign up"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
