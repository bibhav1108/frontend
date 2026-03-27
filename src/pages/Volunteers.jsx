import { useState, useEffect } from "react";
import API from "../services/api";

const Volunteers = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("");
  const [skills, setSkills] = useState("");

  const [volunteers, setVolunteers] = useState([]);
  const [error, setError] = useState("");

  const loadVolunteers = async () => {
    try {
      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadVolunteers();
    const interval = setInterval(loadVolunteers, 5000);
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

      loadVolunteers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to add volunteer");
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

  return (
    <div className="space-y-6">
      {/* FORM */}
      <div className="max-w-xl rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6">
        <h2 className="text-lg font-semibold mb-4">Register Volunteer</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Phone (+91...)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Zone (optional)"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Skills (comma separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />

          {error && <div className="text-sm text-red-500">{error}</div>}

          <button className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-[0.98]">
            Add Volunteer
          </button>
        </form>
      </div>

      {/* GRID */}
      {volunteers.length === 0 ? (
        <div className="text-sm text-slate-500">No volunteers yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {volunteers.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl p-4 shadow-[0_8px_20px_rgba(0,0,0,0.05)] transition hover:shadow-md"
            >
              <h3 className="font-semibold text-[#191c1e]">{v.name}</h3>

              <p className="text-sm text-slate-500">{v.phone_number}</p>

              <p className="text-xs text-slate-400 mt-1">
                Zone: {v.zone || "-"}
              </p>

              {/* STATS */}
              <div className="text-xs mt-3 text-slate-500">
                ✔ Completed: {v.completions} <br />❌ No-shows: {v.no_shows}
              </div>

              {/* TRUST BADGE */}
              <span className="mt-3 inline-block text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                {v.trust_tier}
              </span>

              {/* TELEGRAM */}
              <p className="text-xs mt-2">
                {v.telegram_active ? (
                  <span className="text-green-600 font-medium">
                    Telegram Connected
                  </span>
                ) : (
                  <span className="text-red-500">Telegram Not Connected</span>
                )}
              </p>

              {!v.telegram_active && (
                <a
                  href="https://t.me/sahyog_setu_bot"
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-2 text-center rounded-lg bg-blue-500 py-1.5 text-xs text-white hover:bg-blue-600 transition"
                >
                  Connect Telegram
                </a>
              )}

              {/* ACTIONS */}
              <div className="mt-3 flex gap-2">
                <button
                  className="flex-1 rounded-lg bg-green-500 py-1.5 text-xs text-white hover:opacity-90"
                  onClick={() => updateTrust(v.id, "FIELD_VERIFIED")}
                >
                  Verify
                </button>

                <button
                  className="flex-1 rounded-lg bg-yellow-500 py-1.5 text-xs text-white hover:opacity-90"
                  onClick={() => updateTrust(v.id, "ID_VERIFIED")}
                >
                  ID Check
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Volunteers;
