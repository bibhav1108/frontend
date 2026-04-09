import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

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
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* BACK BUTTON */}
          <button
            onClick={() => navigate("/marketplace")}
            className="px-3 py-2 text-sm bg-surface_high rounded-lg border border-white/10 hover:opacity-80"
          >
            ← Back
          </button>

          <div>
            <h1 className="text-3xl font-outfit font-bold">
              Marketplace Alerts
            </h1>
            <p className="text-sm text-on_surface_variant">
              Live donor signals → convert into needs instantly
            </p>
          </div>
        </div>

        <button
          onClick={() => loadAlerts(false)}
          className="px-4 py-2 text-sm bg-surface_high rounded-lg border border-white/10 hover:opacity-80"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 text-sm p-3 rounded">
          {error}
        </div>
      )}

      {/* LOADING */}
      {initialLoading ? (
        <div className="text-center p-16 text-on_surface_variant">
          Fetching live alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center p-16 text-on_surface_variant">
          No active alerts right now
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* ALERT LIST */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Alert Feed</h3>

              <span className="text-xs text-on_surface_variant">
                Auto-refresh every 5s
              </span>
            </div>

            {alerts.map((a) => (
              <div
                key={a.id}
                className="bg-surface_high p-5 rounded-xl border border-white/5 hover:scale-[1.01] transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-primary tracking-wide">
                    DONOR SIGNAL
                  </span>

                  <span className="text-[10px] text-on_surface_variant">
                    {new Date(a.created_at).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-sm font-medium leading-relaxed">
                  {a.message_body}
                </p>

                {a.donor_name && (
                  <div className="mt-3 text-xs text-on_surface_variant flex items-center gap-1">
                    <span>👤</span>
                    <span>{a.donor_name}</span>
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    disabled={loadingId === a.id}
                    onClick={() => claimAlert(a.id)}
                    className={`px-4 py-2 rounded-lg text-sm transition ${
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

          <div className="col-span-12 lg:col-span-4">
            <div className="bg-surface_high rounded-xl p-5 h-full min-h-[400px]">
              <h3 className="font-semibold mb-4">Insights</h3>

              <div className="space-y-3 text-sm text-on_surface_variant">
                <p>• Incoming donor trends</p>
                <p>• Most requested resources</p>
                <p>• Conversion efficiency</p>
              </div>

              <div className="mt-10 text-xs text-on_surface_variant text-center">
                (analytics coming soon)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceAlerts;
