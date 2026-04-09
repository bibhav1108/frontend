import { useEffect, useState } from "react";
import API from "../services/api";

const DispatchVolunteersModal = ({
  open,
  onClose,
  needId,
  onSuccess,
  sidebarOpen,
}) => {
  const [volunteers, setVolunteers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) loadVolunteers();
  }, [open]);

  const loadVolunteers = async () => {
    try {
      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch {}
  };

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDispatch = async () => {
    if (selected.length === 0) {
      return alert("Select at least one volunteer");
    }

    try {
      setLoading(true);

      await API.post("/marketplace/dispatches/", {
        marketplace_need_id: needId,
        volunteer_ids: selected.map(Number),
      });

      onSuccess?.();
      onClose();
      setSelected([]);
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to dispatch");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const filtered = volunteers.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedVols = volunteers.filter((v) => selected.includes(v.id));

  return (
    <div
      className={`fixed z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm
    top-16 right-0 bottom-0
    ${sidebarOpen ? "md:left-64 left-0" : "left-0"}
  `}
      onClick={onClose}
    >
      <div
        className="bg-surface_high w-full max-w-4xl rounded-2xl p-6 flex gap-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT SIDE */}
        <div className="flex-1 flex flex-col">
          {/* SEARCH */}
          <input
            placeholder="Search volunteers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 px-4 py-2 rounded bg-surface"
          />

          {/* LIST */}
          <div className="overflow-y-auto max-h-[400px] space-y-2 pr-2">
            {filtered.map((v) => {
              const isSelected = selected.includes(v.id);

              return (
                <div
                  key={v.id}
                  onClick={() => toggle(v.id)}
                  className={`p-3 rounded-lg cursor-pointer flex justify-between items-center border ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-surface border-white/10 hover:bg-white/5"
                  }`}
                >
                  <span>{v.name}</span>
                  {isSelected && <span>✔</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-64 flex flex-col">
          <h3 className="font-semibold mb-3">Selected</h3>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {selectedVols.length === 0 ? (
              <p className="text-sm opacity-60">No volunteers selected</p>
            ) : (
              selectedVols.map((v) => (
                <div
                  key={v.id}
                  className="bg-primary/10 px-3 py-2 rounded text-sm"
                >
                  {v.name}
                </div>
              ))
            )}
          </div>

          {/* ACTION */}
          <button
            onClick={handleDispatch}
            disabled={loading}
            className={`mt-4 py-2 rounded text-sm ${
              loading
                ? "bg-gray-400 text-white"
                : "bg-primary text-white hover:opacity-90"
            }`}
          >
            {loading ? "Dispatching..." : "Dispatch"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispatchVolunteersModal;
