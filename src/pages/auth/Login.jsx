import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import PublicNavbar from "../../components/PublicNavbar";

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

      // 🔥 IMPORTANT: send as form-data
      const params = new URLSearchParams();
      params.append("username", email); // backend expects "username"
      params.append("password", password);

      const res = await API.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const data = res.data;

      // ✅ store everything useful
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("org_id", data.org_id);
      localStorage.setItem("org_name", data.org_name);

      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
            />

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-green-600 font-medium cursor-pointer"
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
