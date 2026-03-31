import { useEffect, useState } from "react";
import API from "../services/api";

const ActiveNeeds = () => {
  const [needs, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVol, setSelectedVol] = useState({});
  const [filter, setFilter] = useState("ALL");
  const [assigningId, setAssigningId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const n = await API.get("/marketplace/needs/");
        const v = await API.get("/volunteers");

        setNeeds((n.data || []).filter((x) => x.status !== "COMPLETED"));
        setVolunteers(v.data || []);
      } catch {}

      setInitialLoading(false);
    };

    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, []);

  const handleDispatch = async (needId) => {
    const volunteerId = selectedVol[needId];
    if (!volunteerId) return alert("Select volunteer");

    try {
      setAssigningId(needId);

      await API.post("/marketplace/dispatches/", {
        marketplace_need_id: needId,
        volunteer_id: Number(volunteerId),
      });
    } catch {}
    setAssigningId(null);
  };

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
      <div>
        <h1 className="text-2xl font-bold">Active Needs</h1>
        <p className="text-sm text-on_surface_variant">
          Assign volunteers & manage dispatch
        </p>
      </div>

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

      {/* CARDS */}
      {initialLoading ? (
        <p className="text-sm text-on_surface_variant">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-on_surface_variant">No needs</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((n) => {
            const isOpen = n.status === "OPEN";

            return (
              <div
                key={n.id}
                className={`border-l-4 ${urgencyBorder(
                  n.urgency,
                )} bg-surface_high p-4 rounded-xl transition hover:scale-[1.01]`}
              >
                {/* TOP */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {n.quantity} • {n.description}
                    </p>
                    <p className="text-xs text-on_surface_variant">
                      {n.pickup_address}
                    </p>
                  </div>

                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {n.status}
                  </span>
                </div>

                {/* ACTION */}
                {isOpen && (
                  <div className="mt-4 flex gap-2 items-center">
                    <select
                      value={selectedVol[n.id] || ""}
                      onChange={(e) =>
                        setSelectedVol((p) => ({
                          ...p,
                          [n.id]: e.target.value,
                        }))
                      }
                      className="text-xs px-2 py-1 rounded bg-surface"
                    >
                      <option value="">Select Volunteer</option>
                      {volunteers.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleDispatch(n.id)}
                      className="text-xs px-3 py-1 bg-primary text-white rounded"
                    >
                      {assigningId === n.id ? "..." : "Assign"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveNeeds;
