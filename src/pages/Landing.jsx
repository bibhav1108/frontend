import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center text-center px-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Bridge Surplus Food to Those in Need
          </h1>

          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Sahyog Setu helps NGOs coordinate food rescue missions efficiently
            with volunteers, real-time tracking, and secure verification.
          </p>

          <div className="space-x-4">
            <Link
              to="/register"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="px-6 py-3 border rounded-lg hover:bg-gray-200"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center p-4 text-gray-500 text-sm">
        © 2026 Sahyog Setu
      </div>
    </div>
  );
};

export default Landing;
