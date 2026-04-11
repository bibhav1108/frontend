import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Skeleton from "../components/Skeleton";

const MarketplaceAlerts = () => {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = async (init = false, silent = false) => {
    try {
      if (init) setInitialLoading(true);
      if (!init && !silent) setRefreshing(true);

      const res = await API.get("/marketplace/needs/alerts");
      setAlerts(res.data || []);
      setError("");
    } catch {
      setError("Failed to load alerts");
    } finally {
      if (init) setInitialLoading(false);
      if (!init) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts(true);

    const interval = setInterval(() => {
      loadAlerts(false, true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const claimAlert = async (id) => {
    try {
      setLoadingId(id);
      await API.post(`/marketplace/needs/alerts/${id}/convert`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to claim alert");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-2xl border border-white/10 bg-surface_high/90 p-6 shadow-lg shadow-black/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/marketplace")}
              className="rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm transition hover:bg-white/5"
            >
              ← Back
            </button>

            <div>
              <h1 className="text-3xl font-outfit font-bold">
                Marketplace Alerts
              </h1>
              <p className="mt-1 text-sm text-on_surface_variant">
                Live donor signals → convert into needs instantly
              </p>
            </div>
          </div>

          <button
            onClick={() => loadAlerts(false)}
            className="rounded-xl border border-white/10 bg-surface px-4 py-2 text-sm transition hover:bg-white/5"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* CONTENT */}
      {initialLoading ? (
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SKELETON FEED */}
          <div className="col-span-12 space-y-4 lg:col-span-8">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>

            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border border-white/5 bg-surface_high p-5"
              >
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-shimmer pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>

                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />

                  <div className="flex items-center gap-2 pt-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-28" />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Skeleton className="h-10 w-36 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SKELETON INSIGHTS */}
          <div className="col-span-12 lg:col-span-4">
            <div className="relative h-full min-h-[400px] overflow-hidden rounded-2xl border border-white/5 bg-surface_high p-5">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-shimmer pointer-events-none" />

              <div className="space-y-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-40" />

                <div className="space-y-3 pt-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-4/5" />
                </div>

                <div className="pt-8">
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-surface_high/90 p-16 text-center text-on_surface_variant shadow-lg shadow-black/10">
          No active alerts right now
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* ALERT LIST */}
          <div className="col-span-12 space-y-4 lg:col-span-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Alert Feed</h3>
                <p className="mt-1 text-sm text-on_surface_variant">
                  Incoming donor signals ready to convert
                </p>
              </div>

              <span className="text-xs text-on_surface_variant">
                Auto-refresh every 5s
              </span>
            </div>

            {alerts.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-white/5 bg-surface_high p-5 shadow-lg shadow-black/5 transition hover:-translate-y-0.5 hover:bg-white/5"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold tracking-[0.24em] text-primary">
                    DONOR SIGNAL
                  </span>

                  <span className="text-[10px] text-on_surface_variant">
                    {new Date(a.created_at).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-on_surface">
                  {a.message_body}
                </p>

                {a.donor_name && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-on_surface_variant">
                    <span>👤</span>
                    <span>{a.donor_name}</span>
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    disabled={loadingId === a.id}
                    onClick={() => claimAlert(a.id)}
                    className={`rounded-xl px-4 py-2 text-sm transition ${
                      loadingId === a.id
                        ? "bg-gray-400 text-white"
                        : "bg-primary text-white hover:opacity-90"
                    }`}
                  >
                    {loadingId === a.id ? "Converting..." : "Convert to Need →"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* INSIGHTS */}
          <div className="col-span-12 lg:col-span-4">
            <div className="rounded-2xl border border-white/10 bg-surface_high p-5 shadow-lg shadow-black/10">
              <h3 className="text-lg font-semibold">Insights</h3>
              <p className="mt-1 text-sm text-on_surface_variant">
                A quick view of what is coming in.
              </p>

              <div className="mt-6 space-y-3 text-sm text-on_surface_variant">
                <p>• Incoming donor trends</p>
                <p>• Most requested resources</p>
                <p>• Conversion efficiency</p>
              </div>

              <div className="mt-10 rounded-2xl border border-white/5 bg-surface p-4 text-center text-xs text-on_surface_variant">
                analytics coming soon
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceAlerts;
