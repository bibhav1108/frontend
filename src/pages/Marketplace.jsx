import { useState, useEffect } from "react";
import API from "../services/api";

const Marketplace = () => {
  const [alerts, setAlerts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  const loadAlerts = async (isInitial = false) => {
    try {
      if (isInitial) setInitialLoading(true);

      const res = await API.get("/marketplace/needs/alerts");
      setAlerts(res.data || []);
    } catch (err) {
      console.error("Failed to load alerts", err);
      setError("Failed to load alerts");
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts(true);

    const interval = setInterval(() => {
      loadAlerts(); // 🔥 silent refresh
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const claimAlert = async (id) => {
    try {
      setLoadingId(id);
      setError("");

      await API.post(`/marketplace/needs/alerts/${id}/convert`);

      // 🔥 instant UI removal
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to claim alert", err);
      setError(err?.response?.data?.detail || "Failed to claim alert");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Marketplace</h2>

      {/* 🔥 ERROR */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded">
          {error}
        </div>
      )}

      {/* 🔥 LOADING */}
      {initialLoading ? (
        <div className="p-6 text-center space-y-2">
          <div className="animate-pulse text-slate-400">Loading alerts...</div>

          <div className="h-1 bg-slate-200 rounded overflow-hidden">
            <div className="h-full bg-purple-500 animate-progress"></div>
          </div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center text-slate-500 p-6">
          No donor alerts right now
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((a) => (
            <div
              key={a.id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition animate-slide-in border-l-4 border-purple-500"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-purple-600">Donor Alert</h3>

                <span className="text-[10px] text-slate-400">
                  {new Date(a.created_at).toLocaleTimeString()}
                </span>
              </div>

              {/* MESSAGE */}
              <p className="text-sm mt-2 text-gray-700">{a.message_body}</p>

              {/* DONOR */}
              {a.donor_name && (
                <p className="text-xs text-gray-500 mt-2">👤 {a.donor_name}</p>
              )}

              {/* TIME */}
              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(a.created_at).toLocaleDateString()}
              </p>

              {/* ACTION */}
              <div className="mt-4">
                <button
                  disabled={loadingId === a.id}
                  onClick={() => claimAlert(a.id)}
                  className={`w-full py-2 rounded text-sm flex items-center justify-center gap-2 transition ${
                    loadingId === a.id
                      ? "bg-gray-400 text-white"
                      : "bg-purple-500 hover:bg-purple-600 text-white"
                  }`}
                >
                  {loadingId === a.id && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}

                  {loadingId === a.id ? "Processing..." : "Claim"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
