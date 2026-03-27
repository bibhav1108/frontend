import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      localStorage.setItem("org_id", data.org_id);
      localStorage.setItem("org_name", data.org_name);

      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc] relative overflow-hidden px-4">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-400/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-400/20 blur-[120px]" />
      </div>

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] px-8 py-10">
          {/* HEADER */}
          <div className="text-center mb-8">
            <img
              src="/sahyog_setu.png"
              alt="logo"
              className="w-20 h-20 mx-auto mb-4 drop-shadow"
            />

            <h1 className="text-2xl font-semibold text-gray-800">
              Sahyog Setu
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Kinetic Curator Logistics
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* EMAIL */}
            <div className="relative">
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full px-4 pt-5 pb-3 rounded-xl bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
              />
              <label
                className="absolute left-3 px-1 bg-white text-gray-500 text-sm transition-all 
                peer-focus:-top-2 peer-focus:text-xs peer-focus:text-indigo-600
                peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs"
              >
                Email Address
              </label>
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <input
                type="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full px-4 pt-5 pb-3 rounded-xl bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
              />
              <label
                className="absolute left-3 px-1 bg-white text-gray-500 text-sm transition-all 
                peer-focus:-top-2 peer-focus:text-xs peer-focus:text-indigo-600
                peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs"
              >
                Password
              </label>
            </div>

            {/* OPTIONS */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-gray-500">
                <input type="checkbox" className="accent-indigo-600" />
                Remember me
              </label>

              <span className="text-indigo-600 font-medium cursor-pointer hover:underline">
                Forgot Password?
              </span>
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition active:scale-[0.98]"
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* 🔥 TELEGRAM BUTTON */}
          <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#229ED9] hover:bg-[#1d8cc2] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition active:scale-[0.98]">
            <span className="material-symbols-outlined text-[20px]">send</span>
            Continue with Telegram
          </button>

          {/* FOOTER */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-indigo-600 font-semibold cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-6 flex justify-center gap-4 text-[11px] text-gray-400">
          <span className="hover:text-indigo-600 cursor-pointer">Privacy</span>
          <span>•</span>
          <span className="hover:text-indigo-600 cursor-pointer">Terms</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
