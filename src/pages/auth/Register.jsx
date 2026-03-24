import { useState } from "react";
import API from "../../services/api";
import PublicNavbar from "../../components/PublicNavbar";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", {
        email,
        password,
      });

      alert("Registered! Now login.");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Error registering");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Create Account
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition">
              Register
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-green-600 font-medium">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
