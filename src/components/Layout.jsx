import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import API from "../services/api";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: "dashboard" },
  { to: "/needs", label: "Active Needs", icon: "emergency" },
  { to: "/surplus", label: "Alerts", icon: "notifications_active" },
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

  const prevIdsRef = useRef(new Set());

  const loadingRef = useRef({
    notifications: false,
  });

  // 🔥 LOAD ALERTS + DETECT NEW
  const loadNotifications = async () => {
    if (loadingRef.current.notifications) return;
    loadingRef.current.notifications = true;

    try {
      const res = await API.get("/needs/surplus-alerts");

      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      const prevIds = prevIdsRef.current;

      const newOnes = sorted.filter((a) => !prevIds.has(a.id));

      if (newOnes.length > 0) {
        // 🔊 sound
        try {
          new Audio("/ping.mp3").play();
        } catch {}

        // 🔥 push toasts
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

  // 🔥 AUTO REMOVE TOASTS
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.toastId !== toast.toastId));
      }, 5000),
    );

    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  // 🔥 RESIZE PANEL
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

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#191c1e] antialiased">
      {/* 🔥 TOAST STACK */}
      <div className="fixed left-[17rem] top-24 z-[999] space-y-3">
        {toasts.map((t) => (
          <div
            key={t.toastId}
            onClick={() => {
              navigate("/surplus");
              setToasts((prev) => prev.filter((x) => x.toastId !== t.toastId));
            }}
            className="cursor-pointer bg-white shadow-xl border-l-4 border-purple-500 rounded-xl p-4 w-80 animate-slide-in"
          >
            <p className="text-sm font-semibold text-purple-600">
              📦 New Surplus Alert
            </p>

            <p className="text-xs mt-1 text-gray-700">{t.message_body}</p>

            {t.donor_name && (
              <p className="text-[11px] mt-1 text-gray-500">
                👤 {t.donor_name}
              </p>
            )}

            {/* ⏳ progress bar */}
            <div className="mt-2 h-1 bg-gray-200 rounded overflow-hidden">
              <div className="h-full bg-purple-500 animate-progress" />
            </div>
          </div>
        ))}
      </div>

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/40 bg-white/70 p-6 shadow backdrop-blur-2xl">
        <div className="mb-10 flex justify-center">
          <img src="/sahyog_setu.png" className="w-36" />
        </div>

        <nav className="flex-1 space-y-2 text-sm font-medium">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <Link
            to="/create"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-white font-semibold"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Create Relief Request
          </Link>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="w-full text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* TOP BAR */}
      <header
        className="fixed top-0 z-40 flex h-20 items-center justify-between px-8 bg-white/70 backdrop-blur border-b"
        style={{ left: "16rem", right: 0 }}
      >
        <div className="flex-1 max-w-xl relative">
          <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400">
            search
          </span>
          <input
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-gray-100 text-sm outline-none"
            placeholder="Search..."
          />
        </div>

        <button
          onClick={() => setShowNotifications((prev) => !prev)}
          className="relative p-2 text-slate-600"
        >
          <span className="material-symbols-outlined">
            notifications_active
          </span>

          {notifications.length > 0 && (
            <span className="absolute right-1 top-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>
      </header>

      {/* MAIN */}
      <main style={{ marginLeft: "16rem", paddingTop: "5rem" }}>
        <div className="p-6">{children}</div>
      </main>

      {/* 🔔 PANEL */}
      <div
        className="fixed right-0 top-20 z-50 h-[calc(100vh-5rem)] bg-white shadow-lg border-l"
        style={{
          width: showNotifications ? panelWidth : 0,
          transition: "width 0.25s ease",
        }}
      >
        <div className="p-4 space-y-3 overflow-y-auto h-full">
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500">No alerts</p>
          ) : (
            notifications.map((a) => (
              <div
                key={a.id}
                onClick={() => {
                  navigate("/surplus");
                  setShowNotifications(false);
                }}
                className="cursor-pointer rounded-xl p-3 border-l-4 bg-purple-100 border-purple-500 hover:scale-[1.02] transition"
              >
                <p className="text-sm font-semibold">📦 Surplus Alert</p>

                <p className="text-xs mt-1 text-slate-700">{a.message_body}</p>

                <p className="text-[10px] mt-1 text-slate-400">
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
