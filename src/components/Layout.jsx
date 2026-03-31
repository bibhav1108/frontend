import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import API from "../services/api";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: "dashboard" },
  { to: "/needs", label: "Active Needs", icon: "emergency" },
  { to: "/marketplace", label: "Marketplace", icon: "notifications_active" },
  { to: "/campaigns", label: "Mission Control", icon: "rocket_launch" },
  { to: "/volunteers", label: "Volunteers", icon: "groups" },
  { to: "/dispatches", label: "Dispatch History", icon: "history" },
  { to: "/inventory", label: "Inventory", icon: "inventory_2" },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(true);
  const [panelWidth, setPanelWidth] = useState(340);
  const [isDragging, setIsDragging] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);

  const prevIdsRef = useRef(new Set());
  const loadingRef = useRef({
    notifications: false,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userRes = await API.get("/users/me");
        setUser(userRes.data);
      } catch (err) {
        console.error("User profile load failed", err);
      }

      try {
        const orgRes = await API.get("/organizations/me");
        setOrg(orgRes.data);
      } catch (err) {
        console.error("Org profile load failed", err);
      }
    };

    loadProfile();
  }, []);

  const loadNotifications = async () => {
    if (loadingRef.current.notifications) return;
    loadingRef.current.notifications = true;

    try {
      const res = await API.get("/marketplace/needs/alerts");

      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      const prevIds = prevIdsRef.current;
      const newOnes = sorted.filter((a) => !prevIds.has(a.id));

      if (newOnes.length > 0) {
        try {
          new Audio("/ping.mp3").play();
        } catch {}

        setToasts((prev) => [
          ...newOnes.map((a) => ({
            ...a,
            toastId: Math.random(),
          })),
          ...prev,
        ]);
      }

      prevIdsRef.current = new Set(sorted.map((a) => a.id));
      setNotifications(sorted.slice(0, 6));
    } catch (err) {
      console.error(err);
    } finally {
      loadingRef.current.notifications = false;
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.toastId !== toast.toastId));
      }, 5000),
    );

    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 260 && newWidth < 520) {
        setPanelWidth(newWidth);
      }
    };

    const stopDragging = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-org-dropdown]")) {
        setOrgMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#191c1e] antialiased">
      {/* Toast stack */}
      <div className="fixed left-[17rem] top-20 z-[9999] space-y-3">
        {toasts.map((t) => (
          <div
            key={t.toastId}
            onClick={() => {
              navigate("/marketplace");
              setToasts((prev) => prev.filter((x) => x.toastId !== t.toastId));
            }}
            className="animate-slide-in cursor-pointer rounded-xl border-l-4 border-purple-500 bg-white p-4 shadow-xl transition hover:scale-[1.02] w-80"
          >
            <p className="text-sm font-semibold text-purple-600">
              📦 New Donor Alert
            </p>
            <p className="mt-1 text-xs text-gray-700">{t.message_body}</p>
            {t.donor_name && (
              <p className="mt-1 text-[11px] text-gray-500">
                👤 {t.donor_name}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/40 bg-white/70 px-5 pt-5 pb-6 shadow backdrop-blur-2xl">
        <div className="mb-6 flex justify-center">
          <img src="/sahyog_setu.png" className="w-32" alt="Sahyog Setu" />
        </div>

        <nav className="flex-1 space-y-1 text-sm">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                  active
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className={`${active ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User profile back at bottom-left */}
        {user && (
          <div className="mt-auto rounded-xl bg-slate-100 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white shadow">
                {user.full_name
                  ? user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "U"}
              </div>

              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user.full_name || "User"}
                </p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Top bar */}
      <header
        className="fixed top-0 z-40 flex h-16 items-center justify-between border-b bg-white/80 px-6 shadow-sm backdrop-blur-md"
        style={{ left: "16rem", right: 0 }}
      >
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400">
            search
          </span>
          <input
            className="w-full rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 py-2 pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-indigo-300"
            placeholder="Search..."
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <span className="material-symbols-outlined">
              notifications_active
            </span>

            {notifications.length > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Org dropdown */}
          {org && (
            <div className="relative" data-org-dropdown>
              <button
                onClick={() => setOrgMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 shadow-sm transition hover:from-indigo-100 hover:to-purple-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white shadow">
                  {org.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="text-left leading-tight">
                  <p className="text-sm font-semibold text-slate-800">
                    {org.name}
                  </p>
                  <p className="text-[10px] text-slate-500">Organization</p>
                </div>

                <span className="material-symbols-outlined text-sm text-slate-500">
                  expand_more
                </span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main style={{ marginLeft: "16rem", paddingTop: "4rem" }}>
        <div className="p-6">{children}</div>
      </main>

      {/* Org dropdown rendered at top level so it stays above the notification panel */}
      {orgMenuOpen && org && (
        <div
          className="fixed right-6 top-16 z-[9999] w-72 rounded-xl border bg-white p-4 shadow-xl animate-slide-in"
          data-org-dropdown-panel
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold text-white">
              {org.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold">{org.name}</p>
              <p className="truncate text-xs text-slate-500">
                {org.contact_email}
              </p>
            </div>
          </div>

          <div className="mt-3 border-t pt-3 space-y-1">
            <p className="text-xs text-slate-500">{org.contact_phone}</p>
            <p className="text-xs text-slate-500">{org.status}</p>
          </div>

          <div className="mt-4 border-t pt-3">
            <button
              onClick={logout}
              className="text-sm font-medium text-red-500 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Notification panel */}
      <div
        className="fixed right-0 top-16 z-40 h-[calc(100vh-4rem)] bg-white shadow-lg border-l overflow-hidden transition-all duration-300"
        style={{
          width: showNotifications ? panelWidth : 0,
        }}
      >
        <div className="relative h-full overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500">No alerts</p>
          ) : (
            notifications.map((a) => (
              <div
                key={a.id}
                onClick={() => {
                  navigate("/marketplace");
                  setShowNotifications(false);
                }}
                className="cursor-pointer rounded-xl border-l-4 border-purple-500 bg-purple-50 p-3 transition hover:scale-[1.02]"
              >
                <p className="text-sm font-semibold">📦 Alert</p>
                <p className="mt-1 text-xs text-slate-700">{a.message_body}</p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {new Date(a.created_at).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div
          onMouseDown={() => setIsDragging(true)}
          className="absolute left-0 top-0 h-full w-[4px] cursor-ew-resize"
        />
      </div>
    </div>
  );
};

export default Layout;
