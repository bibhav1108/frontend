import { Link, useLocation, useNavigate } from "react-router-dom";

const VolunteerLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // remove token (adjust if you use different key)
    localStorage.removeItem("access_token");

    // redirect to login
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* 🔹 SIDEBAR */}
      <aside className="w-64 bg-surface_lowest border-r p-6 flex flex-col justify-between">
        <div>
          <div className="text-xl font-bold mb-6">Volunteer</div>

          <Link
            to="/volunteer/profile"
            className={`block px-4 py-2 rounded-lg text-sm ${
              location.pathname === "/volunteer/profile"
                ? "bg-primary text-white"
                : "text-on_surface_variant hover:bg-surface_high"
            }`}
          >
            Profile
          </Link>
        </div>

        {/* 🔴 LOGOUT */}
        <button
          onClick={handleLogout}
          className="mt-6 px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </aside>

      {/* 🔹 MAIN */}
      <div className="flex-1">
        <div className="p-4 border-b font-semibold">Volunteer Profile</div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default VolunteerLayout;
