import { useState } from "react";
import API from "../../services/api";
import PublicNavbar from "../../components/PublicNavbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.access_token);

      alert("Login success");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition">
              Login
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            Don’t have an account?{" "}
            <a href="/register" className="text-green-600 font-medium">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
