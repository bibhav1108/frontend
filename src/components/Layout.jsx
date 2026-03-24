import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Layout = ({ children }) => {
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // 🔥 Load needs from localStorage
  const loadNotifications = () => {
    const stored = localStorage.getItem("needs");
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed.slice(0, 5)); // latest 5
    }
  };

  // 🔥 Run on mount + page focus
  useEffect(() => {
    loadNotifications();

    window.addEventListener("focus", loadNotifications);

    return () => {
      window.removeEventListener("focus", loadNotifications);
    };
  }, []);

  // 🔥 Auto open only on dashboard
  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setShowNotifications(true);
    } else {
      setShowNotifications(false);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-5">
        <h1 className="text-xl font-bold mb-6">Sahyog Setu</h1>

        <nav className="flex flex-col gap-3">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/create">Create Need</Link>
          <Link to="/volunteers">Volunteers</Link>
        </nav>
      </div>

      {/* 🔔 Notifications (MIDDLE PANEL) */}
      {showNotifications && (
        <div className="w-72 bg-white border-r p-4 flex flex-col gap-3">
          <h2 className="font-semibold mb-2">Notifications</h2>

          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-xl bg-gray-50 shadow-sm border hover:shadow-md transition"
              >
                {/* Top row */}
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-semibold">{n.type}</p>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded ${
                      n.urgency === "High"
                        ? "bg-red-100 text-red-600"
                        : n.urgency === "Medium"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {n.urgency}
                  </span>
                </div>

                <p className="text-xs text-gray-500">{n.quantity}</p>
                <p className="text-xs text-gray-400 truncate">{n.address}</p>

                <p className="text-[10px] text-gray-300 mt-1">
                  {new Date(n.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No notifications</p>
          )}
        </div>
      )}
      {/* Main */}
      <div className="flex-1 p-6">
        <div className="flex justify-between mb-6">
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔 Toggle Notifications
          </button>

          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Layout;
