import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import DispatchVolunteersModal from "../components/DispatchVolunteersModal";

const ActiveNeeds = ({ sidebarOpen }) => {
  const navigate = useNavigate();

  const [needs, setNeeds] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [dispatchModal, setDispatchModal] = useState({
    open: false,
    needId: null,
  });

  const load = async (init = false) => {
    try {
      if (init) setInitialLoading(true);

      const res = await API.get("/marketplace/needs/");
      setNeeds((res.data || []).filter((x) => x.status !== "COMPLETED"));
    } catch {
      setError("Failed to load data");
    } finally {
      if (init) setInitialLoading(false);
    }
  };

  useEffect(() => {
    load(true);
    const i = setInterval(() => load(), 5000);
    return () => clearInterval(i);
  }, []);

  const filtered = needs
    .filter((n) => {
      if (filter === "OPEN") return n.status === "OPEN";
      if (filter === "IN_PROGRESS") return n.status === "DISPATCHED";
      return true;
    })
    .sort((a, b) => {
      const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return order[b.urgency] - order[a.urgency];
    });

  const urgencyBorder = (u) => {
    if (u === "HIGH") return "border-red-500";
    if (u === "MEDIUM") return "border-yellow-400";
    return "border-blue-400";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        {/* 🔙 BACK BUTTON */}
        <button
          onClick={() => navigate("/marketplace")}
          className="px-3 py-1 rounded bg-surface_high hover:bg-white/5 text-sm"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold">Active Needs</h1>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 text-sm p-3 rounded">
          {error}
        </div>
      )}

      {/* FILTER */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "OPEN", "IN_PROGRESS"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs ${
              filter === f
                ? "bg-primary text-white"
                : "bg-surface_high hover:bg-white/5"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {initialLoading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No needs</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`border-l-4 ${urgencyBorder(
                n.urgency,
              )} bg-surface_high p-4 rounded-xl`}
            >
              {/* INFO */}
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    {n.type} • {n.quantity}
                  </p>
                  <p className="text-sm">{n.description}</p>
                  <p className="text-xs text-on_surface_variant">
                    📍 {n.pickup_address}
                  </p>
                </div>

                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-bold h-fit inline-flex items-center justify-center shadow-sm ${
                    n.status === "OPEN"
                      ? "bg-green-200 text-green-900 border border-green-300"
                      : "bg-gray-300 text-gray-900 border border-gray-400"
                  }`}
                >
                  {n.status === "OPEN"
                    ? "Open"
                    : n.status === "DISPATCHED"
                      ? "Dispatched"
                      : n.status}
                </span>
              </div>

              {/* ACTION */}
              {n.status === "OPEN" && (
                <button
                  onClick={() =>
                    setDispatchModal({
                      open: true,
                      needId: n.id,
                    })
                  }
                  className="mt-3 text-xs px-4 py-2 rounded bg-primary text-white hover:opacity-90"
                >
                  Dispatch Volunteers
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 🔥 MODAL */}
      <DispatchVolunteersModal
        open={dispatchModal.open}
        needId={dispatchModal.needId}
        sidebarOpen={sidebarOpen}
        onClose={() => setDispatchModal({ open: false, needId: null })}
        onSuccess={load}
      />
    </div>
  );
};

export default ActiveNeeds;
