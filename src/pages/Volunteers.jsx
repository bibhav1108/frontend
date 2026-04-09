import { useState, useEffect } from "react";
import API from "../services/api";

const Volunteers = ({ sidebarOpen }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    zone: "",
    skills: "",
  });

  useEffect(() => {
    loadVolunteers();
    const i = setInterval(loadVolunteers, 5000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowForm(false);
        setSelected(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const loadVolunteers = async () => {
    try {
      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch {}
  };

  const handleCreate = async () => {
    if (!form.name || !form.phone_number) {
      return alert("Name and phone required");
    }

    try {
      setCreating(true);

      await API.post("/volunteers", {
        name: form.name,
        phone_number: form.phone_number,
        zone: form.zone || null,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()) : [],
      });

      setForm({
        name: "",
        phone_number: "",
        zone: "",
        skills: "",
      });

      setShowForm(false);
      loadVolunteers();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to create volunteer");
    } finally {
      setCreating(false);
    }
  };

  const getSuccessRate = (v) => {
    const c = Number(v.completions || 0);
    const n = Number(v.no_shows || 0);
    const total = c + n;
    if (total === 0) return 0;
    return Math.round(((c - n) / total) * 100);
  };

  const filtered = [...volunteers]
    .filter((v) => (v.name || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return (
    <div className="space-y-8">
      {/* HERO */}
      <div className="bg-primary text-white rounded-2xl p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Volunteer Force</h1>
          <p className="text-sm opacity-80">
            Manage and deploy your human network
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-bold">{volunteers.length}</p>
            <p className="text-xs opacity-70">Active Volunteers</p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-semibold"
          >
            + Add
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showForm && (
        <div
          className={`fixed top-[calc(4rem+1px)] bottom-0 right-0 ${
            sidebarOpen ? "md:left-64 left-0" : "left-0"
          } z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm`}
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-surface_high w-full max-w-md p-6 rounded-2xl space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Add Volunteer</h2>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 rounded bg-surface"
            />

            <input
              placeholder="Phone Number"
              value={form.phone_number}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  phone_number: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded bg-surface"
            />

            <input
              placeholder="Zone"
              value={form.zone}
              onChange={(e) => setForm((p) => ({ ...p, zone: e.target.value }))}
              className="w-full px-3 py-2 rounded bg-surface"
            />

            <input
              placeholder="Skills (comma separated)"
              value={form.skills}
              onChange={(e) =>
                setForm((p) => ({ ...p, skills: e.target.value }))
              }
              className="w-full px-3 py-2 rounded bg-surface"
            />

            <button
              onClick={handleCreate}
              disabled={creating}
              className={`w-full py-2 rounded text-sm ${
                creating
                  ? "bg-gray-400 text-white"
                  : "bg-primary text-white hover:opacity-90"
              }`}
            >
              {creating ? "Creating..." : "Create Volunteer"}
            </button>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <input
        placeholder="Search volunteers..."
        className="w-full max-w-md px-4 py-3 rounded-xl bg-surface_high"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* LIST */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 px-4 py-2 text-xs text-on_surface_variant">
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Phone</div>
          <div className="col-span-2">Zone</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Success Rate</div>
        </div>

        {filtered.map((v) => {
          const rate = getSuccessRate(v);

          return (
            <div
              key={v.id}
              onClick={() => setSelected(v)}
              className={`grid grid-cols-12 items-center px-4 py-3 rounded-lg cursor-pointer transition ${
                selected?.id === v.id
                  ? "bg-surface ring-1 ring-primary/30"
                  : "bg-surface_high hover:bg-surface"
              }`}
            >
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  {(v.name || "?")[0]?.toUpperCase()}
                </div>
                <span className="font-medium text-sm truncate">{v.name}</span>
              </div>

              <div className="col-span-3 text-sm truncate">
                {v.phone_number}
              </div>

              <div className="col-span-2 text-sm truncate">{v.zone || "—"}</div>

              <div className="col-span-1">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    v.telegram_active
                      ? "bg-green-200 text-green-900"
                      : "bg-gray-300 text-gray-800"
                  }`}
                >
                  {v.telegram_active ? "Online" : "Offline"}
                </span>
              </div>

              <div className="col-span-2 text-right text-sm font-semibold">
                {rate > 0 ? `+${rate}` : rate}%
              </div>
            </div>
          );
        })}
      </div>

      {/* DRAWER */}
      {selected && (
        <div
          className={`fixed top-[calc(4rem+1px)] bottom-0 right-0 ${
            sidebarOpen ? "md:left-64 left-0" : "left-0"
          } z-[1500]`}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setSelected(null)}
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-surface_high shadow-2xl p-6 overflow-y-auto transition-transform duration-300 translate-x-0">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold">Volunteer</h2>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                {(selected.name || "?")[0]?.toUpperCase()}
              </div>

              <h2 className="mt-3 font-bold text-lg">{selected.name}</h2>
              <p className="text-sm opacity-70">{selected.phone_number}</p>
            </div>

            <div className="mt-6 space-y-4">
              <Stat label="Missions" value={selected.completions || 0} />
              <Stat label="No Shows" value={selected.no_shows || 0} />
              <Stat
                label="Success Rate"
                value={`${getSuccessRate(selected)}%`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="bg-surface p-3 rounded-lg">
    <p className="text-xs opacity-70">{label}</p>
    <p className="font-bold">{value}</p>
  </div>
);

export default Volunteers;
