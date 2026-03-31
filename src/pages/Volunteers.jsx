import { useState, useEffect } from "react";
import API from "../services/api";

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadVolunteers();
    const i = setInterval(loadVolunteers, 5000);
    return () => clearInterval(i);
  }, []);

  const loadVolunteers = async () => {
    try {
      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch {}
  };

  const getReliability = (v) => {
    const total = v.completions + v.no_shows;
    if (total === 0) return 0;
    return Math.round((v.completions / total) * 100);
  };

  // 🔥 FILTER + SORT
  const filtered = [...volunteers]
    .filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      // active first
      if (a.telegram_active !== b.telegram_active) {
        return b.telegram_active - a.telegram_active;
      }

      // reliability next
      return getReliability(b) - getReliability(a);
    });

  const trustMap = {
    FIELD_VERIFIED: "bg-indigo-100 text-indigo-700",
    ID_VERIFIED: "bg-yellow-100 text-yellow-700",
    UNVERIFIED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-8">
      {/* 🔥 HERO */}
      <div className="bg-primary text-white rounded-2xl p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Volunteer Force</h1>
          <p className="text-sm opacity-80">
            Manage and deploy your human network
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold">{volunteers.length}</p>
          <p className="text-xs opacity-70">Active Volunteers</p>
        </div>
      </div>

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
              {/* AVATAR */}
              <div className="w-14 h-14 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                {v.name?.[0]}
              </div>

              <div className="flex-1">
                {/* TOP */}
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

                {/* STATS */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <Stat label="Missions" value={v.completions} />
                  <Stat label="No Shows" value={v.no_shows} />
                  <Stat label="Reliability" value={`${getReliability(v)}%`} />
                </div>

                {/* SKILLS */}
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
