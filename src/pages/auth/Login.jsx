import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import logo from "../../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // 🔥 Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false); // 👈 Added success state

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const res = await API.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const data = res.data;

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("org_id", data.org_id || "");
      localStorage.setItem("org_name", data.org_name || "");

      switch (data.role) {
        case "VOLUNTEER":
          navigate("/volunteer/profile");
          break;
        case "NGO_ADMIN":
        case "NGO_COORDINATOR":
          navigate("/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= SEND OTP =================
  const handleSendOTP = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Enter your email first");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/forgot-password", { email });

      setMessage(res.data.message);
      setOtpSent(true);
    } catch (err) {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESET PASSWORD =================
  const handleResetPassword = async () => {
    setError("");
    setMessage("");

    if (!otp || !newPassword) {
      setError("OTP and new password required");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/reset-password", {
        email,
        otp,
        new_password: newPassword,
      });

      // Show success visual feedback
      setResetSuccess(true);
      setMessage("Password has been reset, you can now login.");

      // Clear the sensitive inputs right away
      setOtp("");
      setNewPassword("");
      setPassword("");

      // 👈 Wait 3.5 seconds before navigating back to login screen
      setTimeout(() => {
        setResetSuccess(false);
        setShowForgot(false);
        setOtpSent(false);
        setMessage("");
      }, 3500); 

    } catch (err) {
      setError(err.response?.data?.detail || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-surface_lowest p-10 rounded-xl shadow-soft">

          {/* HEADER */}
          <div className="text-center mb-8">
            <img src={logo} className="w-40 h-40 mx-auto" />
            <p className="text-sm text-on_surface_variant">
              {showForgot ? "Reset your password" : "Sign in to continue"}
            </p>
          </div>

          {/* ================= LOGIN ================= */}
          {!showForgot && (
            <form onSubmit={handleLogin} className="space-y-6">
              <Input label="Email" value={email} setValue={setEmail} />
              <Input label="Password" value={password} setValue={setPassword} type="password" />

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primaryGradient text-white font-bold rounded-lg shadow-soft hover:opacity-90 transition"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* ================= FORGOT PASSWORD ================= */}
          {showForgot && (
            <div className="space-y-4">
              {resetSuccess ? (
                // 👈 SUCCESS STATE UI
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <p className="text-green-600 font-medium text-lg">{message}</p>
                  <p className="text-sm text-on_surface_variant mt-2">Redirecting to login...</p>
                </div>
              ) : (
                // 👈 REGULAR FORGOT PASSWORD UI
                <>
                  <Input label="Email" value={email} setValue={setEmail} />

                  {!otpSent ? (
                    <button
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full py-3 bg-primary text-white rounded-lg"
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  ) : (
                    <>
                      <Input label="OTP" value={otp} setValue={setOtp} />
                      <Input
                        label="New Password"
                        value={newPassword}
                        setValue={setNewPassword}
                        type="password"
                      />

                      <button
                        onClick={handleResetPassword}
                        disabled={loading}
                        className="w-full py-3 bg-green-600 text-white rounded-lg"
                      >
                        {loading ? "Resetting..." : "Reset Password"}
                      </button>
                    </>
                  )}

                  {message && !resetSuccess && (
                    <p className="text-green-500 text-sm text-center">{message}</p>
                  )}

                  {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* TOGGLE */}
          {/* 👈 Hide the toggle options if we are in the middle of showing the success screen */}
          {!resetSuccess && (
            <p className="text-sm text-center mt-6">
              {!showForgot ? (
                <span
                  onClick={() => {
                    setShowForgot(true);
                    setError("");
                    setMessage("");
                  }}
                  className="text-primary font-medium cursor-pointer"
                >
                  Forgot Password?
                </span>
              ) : (
                <span
                  onClick={() => {
                    setShowForgot(false);
                    setError("");
                    setMessage("");
                  }}
                  className="text-primary font-medium cursor-pointer"
                >
                  Back to Login
                </span>
              )}
            </p>
          )}

          {/* REGISTER */}
          {!showForgot && !resetSuccess && (
            <p className="text-sm text-center mt-4">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-primary font-medium cursor-pointer"
              >
                Sign up
              </span>
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-center text-xs text-on_surface_variant">
          <span className="cursor-pointer hover:text-primary">Privacy</span>
          {" • "}
          <span className="cursor-pointer hover:text-primary">Terms</span>
        </div>
      </div>
    </div>
  );
};

/* INPUT COMPONENT */
const Input = ({ label, value, setValue, type = "text" }) => {
  const isActive = value && value.length > 0;

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="
          peer w-full px-4 pt-6 pb-2 rounded-lg
          bg-surface_high text-sm
          focus:outline-none focus:ring-2 focus:ring-primary/40
        "
      />

      <label
        className={`
          absolute left-3 transition-all duration-200
          pointer-events-none text-on_surface_variant
          ${isActive ? "top-1 text-xs" : "top-1/2 -translate-y-1/2 text-sm"}
          peer-focus:top-1 peer-focus:translate-y-0
          peer-focus:text-xs
        `}
      >
        {label}
      </label>
    </div>
  );
};

export default Login;
