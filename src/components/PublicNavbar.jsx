import { Link } from "react-router-dom";

const PublicNavbar = () => {
  return (
    <div className="flex justify-between items-center p-6 bg-white shadow">
      <h1 className="text-xl font-bold">Sahyog Setu</h1>

      <div className="space-x-3">
        <Link
          to="/login"
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default PublicNavbar;
