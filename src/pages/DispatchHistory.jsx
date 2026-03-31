import { useEffect, useState } from "react";
import API from "../services/api";

const DispatchHistory = () => {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const loadDispatches = async () => {
    try {
      setLoading(true);

      const res = await API.get("/marketplace/dispatches/");
      const completed = (res.data || []).filter(
        (d) => d.status === "COMPLETED",
      );

      setDispatches(completed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispatches();
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Dispatch History</h1>
        <p className="text-sm text-slate-500">
          Completed deliveries and records
        </p>
      </div>

      {/* 🔥 TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center space-y-2">
            <div className="animate-pulse text-slate-400">
              Loading dispatch history...
            </div>
            <div className="h-1 bg-slate-200 rounded overflow-hidden">
              <div className="h-full bg-indigo-500 animate-progress"></div>
            </div>
          </div>
        ) : dispatches.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No completed dispatches yet
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              {/* HEADER */}
              <thead className="bg-slate-50 text-slate-500 text-xs sticky top-0 z-10">
                <tr>
                  <th className="text-left px-4 py-3">Description</th>
                  <th className="text-left px-4 py-3">Volunteer</th>
                  <th className="text-left px-4 py-3">Pickup</th>
                  <th className="text-left px-4 py-3">Time</th>
                  <th className="text-left px-4 py-3">OTP</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {dispatches.map((d) => (
                  <>
                    {/* MAIN ROW */}
                    <tr
                      key={d.id}
                      onClick={() =>
                        setExpanded(expanded === d.id ? null : d.id)
                      }
                      className="hover:bg-slate-50 transition cursor-pointer animate-slide-in"
                    >
                      <td className="px-4 py-3 max-w-[250px]">
                        <p className="font-medium truncate">
                          {d.description ||
                            `${d.item_type} • ${d.item_quantity}`}
                        </p>
                        <p className="text-xs text-slate-500">#{d.id}</p>
                      </td>

                      <td className="px-4 py-3">{d.volunteer_name}</td>

                      <td className="px-4 py-3 max-w-[200px] truncate text-slate-500">
                        {d.pickup_address}
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {new Date(d.created_at).toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            d.otp_used
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {d.otp_used ? "Used" : "Not Used"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                          Completed
                        </span>
                      </td>
                    </tr>

                    {/* 🔥 EXPANDED DETAILS */}
                    {expanded === d.id && (
                      <tr className="bg-slate-50">
                        <td colSpan="6" className="px-4 py-3 text-sm space-y-1">
                          <p>
                            📦 Item: {d.item_type} ({d.item_quantity})
                          </p>
                          <p>📍 Pickup: {d.pickup_address}</p>
                          <p>
                            🕒 Created:{" "}
                            {new Date(d.created_at).toLocaleString()}
                          </p>
                          {d.description && <p>📝 Notes: {d.description}</p>}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DispatchHistory;
