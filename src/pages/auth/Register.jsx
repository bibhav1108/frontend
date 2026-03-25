import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import PublicNavbar from "../../components/PublicNavbar";

const Register = () => {
  const navigate = useNavigate();

  // Org
  const [orgName, setOrgName] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgEmail, setOrgEmail] = useState("");

  // Admin
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !orgName ||
      !orgPhone ||
      !orgEmail ||
      !adminName ||
      !adminEmail ||
      !adminPassword
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/organizations/register", {
        org_name: orgName,
        org_phone: orgPhone,
        org_email: orgEmail,
        admin_name: adminName,
        admin_email: adminEmail,
        admin_password: adminPassword,
      });

      alert(res.data.message || "Registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Register Your NGO
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* ORG INFO */}
            <h3 className="font-semibold text-gray-700">Organization Info</h3>

            <input
              type="text"
              placeholder="Organization Name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
            />

            <input
              type="text"
              placeholder="Organization Phone"
              value={orgPhone}
              onChange={(e) => setOrgPhone(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
            />

            <input
              type="email"
              placeholder="Organization Email"
              value={orgEmail}
              onChange={(e) => setOrgEmail(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
            />

            {/* ADMIN INFO */}
            <h3 className="font-semibold text-gray-700 mt-4">
              Coordinator Info
            </h3>

            <input
              type="text"
              placeholder="Your Name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
            />

            <input
              type="email"
              placeholder="Your Email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
            />

            <input
              type="password"
              placeholder="Password (min 8 chars)"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
            />

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-green-600 font-medium cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
