import { useState, useEffect } from "react";
import API from "../services/api";

const Volunteers = () => {
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

  // ESC to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowForm(false);
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

  const getReliability = (v) => {
    const total = v.completions + v.no_shows;
    if (total === 0) return 0;
    return Math.round((v.completions / total) * 100);
  };

  const filtered = [...volunteers]
    .filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.telegram_active !== b.telegram_active) {
        return b.telegram_active - a.telegram_active;
      }
      return getReliability(b) - getReliability(a);
    });

  const trustMap = {
    FIELD_VERIFIED: "bg-indigo-100 text-indigo-700",
    ID_VERIFIED: "bg-yellow-100 text-yellow-700",
    UNVERIFIED: "bg-gray-100 text-gray-600",
  };

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

      {/* 🔥 MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-surface_high w-full max-w-md p-6 rounded-2xl space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Add Volunteer</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-sm opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            {/* FORM */}
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
              placeholder="Zone (optional)"
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
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {filtered.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelected(v)}
              className="bg-surface_high p-5 rounded-xl flex gap-5 cursor-pointer hover:scale-[1.01] transition"
            >
              <div className="w-14 h-14 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                {v.name?.[0]}
              </div>

              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold">{v.name}</p>
                    <p className="text-xs text-on_surface_variant">
                      {v.phone_number}
                    </p>

                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${trustMap[v.trust_tier]}`}
                      >
                        {v.trust_tier}
                      </span>

                      <span className="text-xs bg-surface px-2 py-1 rounded">
                        📍 {v.zone || "No Zone"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      v.telegram_active
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {v.telegram_active ? "Available" : "Offline"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <Stat label="Missions" value={v.completions} />
                  <Stat label="No Shows" value={v.no_shows} />
                  <Stat label="Reliability" value={`${getReliability(v)}%`} />
                </div>

                <div className="mt-3 flex gap-2 flex-wrap">
                  {v.skills?.slice(0, 4).map((s, i) => (
                    <span
                      key={i}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-12 lg:col-span-4">
          {selected ? (
            <div className="bg-surface_high p-6 rounded-xl sticky top-10">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-primary text-white rounded-xl flex items-center justify-center text-xl font-bold">
                  {selected.name?.[0]}
                </div>

                <h2 className="mt-3 font-bold">{selected.name}</h2>
                <p className="text-sm text-on_surface_variant">
                  {selected.phone_number}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <Stat label="Missions" value={selected.completions} />
                <Stat label="No Shows" value={selected.no_shows} />
                <Stat
                  label="Reliability"
                  value={`${getReliability(selected)}%`}
                />

                <div>
                  <p className="text-sm font-semibold mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.skills?.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs bg-primary/10 px-2 py-1 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-sm">
                  Status:{" "}
                  <span className="font-semibold">
                    {selected.telegram_active ? "Available" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-on_surface_variant mt-20">
              Select a volunteer
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="bg-surface p-3 rounded-lg">
    <p className="text-xs text-on_surface_variant">{label}</p>
    <p className="font-bold">{value}</p>
  </div>
);

export default Volunteers;
