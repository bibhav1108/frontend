import { useState, useEffect } from "react";
import API from "../services/api";

const Volunteers = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("");
  const [skills, setSkills] = useState("");

  const [volunteers, setVolunteers] = useState([]);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadVolunteers = async (isInitial = false) => {
    try {
      if (isInitial) setInitialLoading(true);

      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteers(true);

    const interval = setInterval(() => {
      loadVolunteers();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !phone) {
      setError("Name and phone are required");
      return;
    }

    try {
      setAdding(true);

      await API.post("/volunteers", {
        name,
        phone_number: phone,
        zone,
        skills: skills ? skills.split(",") : [],
      });

      setName("");
      setPhone("");
      setZone("");
      setSkills("");

      setShowForm(false);
      loadVolunteers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to add volunteer");
    } finally {
      setAdding(false);
    }
  };

  const updateTrust = async (id, tier) => {
    try {
      await API.patch(`/volunteers/${id}/trust`, {
        trust_tier: tier,
      });
      loadVolunteers();
    } catch (err) {
      console.error(err);
    }
  };

  const trustColor = (tier) => {
    if (tier === "FIELD_VERIFIED") return "bg-green-100 text-green-700";
    if (tier === "ID_VERIFIED") return "bg-yellow-100 text-yellow-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Volunteers</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition text-white px-4 py-2 rounded"
        >
          + Add Volunteer
        </button>
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 animate-fade-in flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow space-y-4 animate-slide-in">
            <div className="flex justify-between">
              <h2 className="font-semibold">Register Volunteer</h2>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Zone"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
              />
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                disabled={adding}
                className={`w-full py-2 rounded text-white flex items-center justify-center gap-2 ${
                  adding ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {adding && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {adding ? "Adding..." : "Add Volunteer"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {initialLoading ? (
          <div className="p-6 text-center space-y-2">
            <div className="animate-pulse text-slate-400">
              Loading volunteers...
            </div>
            <div className="h-1 bg-slate-200 rounded overflow-hidden">
              <div className="h-full bg-indigo-500 animate-progress"></div>
            </div>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No volunteers yet
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th>Zone</th>
                <th>Stats</th>
                <th>Trust</th>
                <th>Telegram</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {volunteers.map((v) => (
                <tr
                  key={v.id}
                  className="border-t hover:bg-slate-50 transition animate-slide-in"
                >
                  <td className="p-3">
                    <p className="font-medium">{v.name}</p>
                    <p className="text-xs text-slate-500">{v.phone_number}</p>
                  </td>

                  <td>{v.zone || "-"}</td>

                  <td className="text-xs text-slate-500">
                    ✔ {v.completions} | ❌ {v.no_shows}
                  </td>

                  <td>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${trustColor(v.trust_tier)}`}
                    >
                      {v.trust_tier}
                    </span>
                  </td>

                  <td>
                    {v.telegram_active ? (
                      <span className="text-green-600 text-xs">Connected</span>
                    ) : (
                      <span className="text-red-500 text-xs">
                        Not Connected
                      </span>
                    )}
                  </td>

                  <td className="space-x-2">
                    <button
                      className="text-green-600 hover:underline text-xs"
                      onClick={() => updateTrust(v.id, "FIELD_VERIFIED")}
                    >
                      Verify
                    </button>

                    <button
                      className="text-yellow-600 hover:underline text-xs"
                      onClick={() => updateTrust(v.id, "ID_VERIFIED")}
                    >
                      ID Check
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Volunteers;
