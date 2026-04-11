import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import DispatchVolunteersModal from "../components/DispatchVolunteersModal";
import Skeleton from "../components/Skeleton";

const Marketplace = ({ sidebarOpen }) => {
  const navigate = useNavigate();

  const [needs, setNeeds] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [needsLoading, setNeedsLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const [dispatchModal, setDispatchModal] = useState({
    open: false,
    needId: null,
  });

  const [claimingId, setClaimingId] = useState(null);
  const [filter, setFilter] = useState("OPEN");
  const [newNeedId, setNewNeedId] = useState(null);

  const MIN_ALERTS = 6;
  const MIN_NEEDS = 5;

  const sortByNewest = (items = []) =>
    [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const loadNeeds = async (init = false) => {
    if (init) setNeedsLoading(true);

    try {
      const res = await API.get("/marketplace/needs/");
      const data = sortByNewest(
        (res.data || []).filter((n) => n.status !== "COMPLETED"),
      );
      setNeeds(data);
    } catch (err) {
      console.error("Failed to load needs", err);
    } finally {
      if (init) setNeedsLoading(false);
      setLastUpdated(Date.now());
    }
  };

  const loadAlerts = async (init = false) => {
    if (init) setAlertsLoading(true);

    try {
      const res = await API.get("/marketplace/needs/alerts");
      const data = sortByNewest(res.data || []);
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load alerts", err);
    } finally {
      if (init) setAlertsLoading(false);
      setLastUpdated(Date.now());
    }
  };

  const claimAlert = async (id) => {
    try {
      setClaimingId(id);

      await API.post(`/marketplace/needs/alerts/${id}/convert`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));

      const res = await API.get("/marketplace/needs/");
      const updated = sortByNewest(res.data || []);
      setNeeds(updated);

      if (updated.length > 0) {
        setNewNeedId(updated[0].id);
        setTimeout(() => setNewNeedId(null), 1000);
      }

      setLastUpdated(Date.now());
    } catch (err) {
      console.error(err);
      alert("Failed to claim alert");
    } finally {
      setClaimingId(null);
    }
  };

  useEffect(() => {
    loadNeeds(true);
    loadAlerts(true);

    const interval = setInterval(() => {
      loadNeeds();
      loadAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const urgencyBorder = (u) => {
    if (u === "HIGH") return "border-red-500/70";
    if (u === "MEDIUM") return "border-yellow-400/70";
    return "border-blue-400/70";
  };

  const filteredNeeds = needs.filter((n) =>
    filter === "ALL" ? true : n.status === filter,
  );

  const timeAgo = () => {
    const seconds = Math.max(0, Math.floor((Date.now() - lastUpdated) / 1000));
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="grid grid-cols-12 gap-6 xl:gap-8">
      {/* LEFT */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* HEADER */}
        <div className="rounded-2xl border border-white/10 bg-surface_high/90 backdrop-blur-sm p-6 shadow-lg shadow-black/10">
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.28em]">
            Operations Overview
          </p>

          <div className="mt-3 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold">Marketplace</h1>
              <div className="mt-2 flex items-center gap-2 text-sm opacity-75">
                <span>Live donor intelligence</span>
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs">{timeAgo()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/dispatches")}
                className="rounded-xl border border-white/10 bg-surface px-4 py-2 text-sm transition hover:bg-white/5"
              >
                Dispatch History
              </button>

              <button
                onClick={() => navigate("/marketplace-stats")}
                className="rounded-xl border border-white/10 bg-surface px-4 py-2 text-sm transition hover:bg-white/5"
              >
                Stats
              </button>
            </div>
          </div>
        </div>

        {/* ALERTS */}
        <div className="rounded-2xl border border-white/10 bg-surface_high/90 backdrop-blur-sm p-6 shadow-lg shadow-black/10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Live Alerts</h3>
              <p className="mt-1 text-sm opacity-70">
                New requests that can be converted into active needs.
              </p>
            </div>

            <button
              onClick={() => navigate("/alerts")}
              className="text-xs text-primary transition hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {(alertsLoading
              ? Array.from({ length: MIN_ALERTS })
              : alerts.slice(0, MIN_ALERTS)
            ).map((a, i) =>
              !a ? (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-xl border border-white/5 bg-surface p-4"
                >
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-36" />
                    <div className="flex justify-end">
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-surface p-4 transition hover:bg-white/5 animate-fadeIn"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide">
                      <span className="font-bold text-primary">Alert</span>
                      <span className="opacity-60">
                        {new Date(a.created_at).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="break-words text-sm leading-snug">
                      {a.message_body}
                    </p>

                    {a.donor_name && (
                      <p className="text-[11px] opacity-60">
                        👤 {a.donor_name}
                      </p>
                    )}
                  </div>

                  <button
                    disabled={claimingId === a.id}
                    onClick={() => claimAlert(a.id)}
                    className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {claimingId === a.id ? "..." : "Claim"}
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="col-span-12 lg:col-span-4">
        <div className="rounded-2xl border border-white/10 bg-surface_high/90 backdrop-blur-sm p-6 shadow-lg shadow-black/10 lg:sticky lg:top-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Active Needs</h3>
              <p className="mt-1 text-sm opacity-70">
                Monitor open needs and dispatch volunteers fast.
              </p>
            </div>

            <button
              onClick={() => navigate("/needs")}
              className="text-xs text-primary transition hover:underline"
            >
              View All →
            </button>
          </div>

          {/* FILTER */}
          <div className="mb-4 flex gap-2 text-xs">
            {["OPEN", "DISPATCHED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 transition ${
                  filter === f
                    ? "bg-primary text-white"
                    : "border border-white/10 bg-surface hover:bg-white/5"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {(needsLoading
              ? Array.from({ length: MIN_NEEDS })
              : filteredNeeds.slice(0, MIN_NEEDS)
            ).map((n, i) =>
              !n ? (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-2xl border border-white/5 bg-surface p-4"
                >
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={n.id}
                  className={`flex h-[122px] flex-col justify-between rounded-2xl border bg-surface p-4 transition hover:bg-white/5 animate-fadeIn
                    ${urgencyBorder(n.urgency)}
                    ${newNeedId === n.id ? "scale-[1.02] bg-white/10" : ""}
                  `}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      {n.type} • {n.quantity}
                    </p>
                    <p className="line-clamp-2 text-xs opacity-70">
                      {n.description}
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <span className="text-xs opacity-60">
                      📍 {n.pickup_address}
                    </span>

                    {n.status === "OPEN" ? (
                      <button
                        onClick={() =>
                          setDispatchModal({
                            open: true,
                            needId: n.id,
                          })
                        }
                        className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                      >
                        Dispatch
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-lg bg-gray-500/30 px-2 py-1 text-xs text-gray-300">
                        Dispatched
                      </span>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <DispatchVolunteersModal
        open={dispatchModal.open}
        needId={dispatchModal.needId}
        sidebarOpen={sidebarOpen}
        onClose={() => setDispatchModal({ open: false, needId: null })}
        onSuccess={loadNeeds}
      />
    </div>
  );
};

export default Marketplace;
