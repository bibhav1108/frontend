import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const Marketplace = () => {
  const [alerts, setAlerts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  // 🔥 Load alerts (UPDATED API)
  const loadAlerts = async () => {
    try {
      const res = await API.get("/marketplace/needs/alerts");
      setAlerts(res.data || []);
    } catch (err) {
      console.error("Failed to load alerts", err);
      setError("Failed to load alerts");
    }
  };

  useEffect(() => {
    loadAlerts();

    const interval = setInterval(loadAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 Claim → convert to Need (UPDATED API)
  const claimAlert = async (id) => {
    try {
      setLoadingId(id);
      setError("");

      await API.post(`/marketplace/needs/alerts/${id}/convert`);

      // remove instantly for smooth UX
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to claim alert", err);
      setError(err?.response?.data?.detail || "Failed to claim alert");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Marketplace</h2>

      {/* 🔥 Error message */}
      {error && (
        <div className="mb-4 text-red-500 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {alerts.length === 0 ? (
        <p className="text-gray-500">No donor alerts</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((a) => (
            <div
              key={a.id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
            >
              <h3 className="font-semibold text-purple-600">Donor Alert</h3>

              <p className="text-sm mt-2 text-gray-700">{a.message_body}</p>

              {a.donor_name && (
                <p className="text-xs text-gray-500 mt-1">👤 {a.donor_name}</p>
              )}

              <p className="text-[10px] text-gray-400 mt-2">
                {new Date(a.created_at).toLocaleString()}
              </p>

              {/* 🔥 Claim Button */}
              <div className="mt-3">
                <button
                  disabled={loadingId === a.id}
                  className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => claimAlert(a.id)}
                >
                  {loadingId === a.id ? "Processing..." : "Claim"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Marketplace;
