import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const Surplus = () => {
  const [alerts, setAlerts] = useState([]);

  // 🔥 Load alerts
  const loadAlerts = async () => {
    try {
      const res = await API.get("/needs/surplus-alerts");
      setAlerts(res.data || []);
    } catch (err) {
      console.error("Failed to load alerts", err);
    }
  };

  useEffect(() => {
    loadAlerts();

    const interval = setInterval(loadAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 Claim (mark processed)
  const claimAlert = async (id) => {
    try {
      await API.patch(`/needs/surplus-alerts/${id}/processed`);
      loadAlerts(); // refresh list
    } catch (err) {
      console.error("Failed to claim alert", err);
      alert("Failed to claim alert");
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Surplus Alerts</h2>

      {alerts.length === 0 ? (
        <p className="text-gray-500">No surplus alerts</p>
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

              {a.phone_number && (
                <p className="text-xs text-gray-500">📞 {a.phone_number}</p>
              )}

              <p className="text-[10px] text-gray-400 mt-2">
                {new Date(a.created_at).toLocaleString()}
              </p>

              {/* 🔥 Claim Button */}
              <div className="mt-3">
                <button
                  className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 text-sm"
                  onClick={() => claimAlert(a.id)}
                >
                  Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Surplus;
