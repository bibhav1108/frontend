import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const CampaignHistory = () => {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [view, setView] = useState("day");

  const loadCampaigns = async () => {
    try {
      setLoading(true);

      const res = await API.get("/campaigns/");
      const completed = (res.data || [])
        .filter((c) => c.status === "COMPLETED")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setCampaigns(completed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  // -------- GROUPING --------
  const groupCampaigns = () => {
    const groups = {};

    campaigns.forEach((c) => {
      const date = new Date(c.created_at);

      let key;
      if (view === "day") key = date.toDateString();
      else if (view === "month")
        key = `${date.toLocaleString("default", {
          month: "long",
        })} ${date.getFullYear()}`;
      else key = `${date.getFullYear()}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });

    return groups;
  };

  const grouped = groupCampaigns();
  const groupKeys = Object.keys(grouped);

  // -------- GROUP CONTROLS --------
  const toggleGroup = (key) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const collapseAll = () => {
    const all = {};
    groupKeys.forEach((k) => (all[k] = true));
    setCollapsedGroups(all);
  };

  const expandAll = () => {
    setCollapsedGroups({});
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="rounded-2xl border p-6 bg-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/campaigns")}
              className="px-3 py-2 text-sm rounded-xl border hover:bg-slate-100"
            >
              ← Back
            </button>

            <div>
              <h1 className="text-2xl font-bold">Campaign Timeline</h1>
              <p className="text-sm text-slate-500">
                Completed campaigns history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* VIEW TOGGLE */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              {["day", "month", "year"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 text-xs rounded-lg capitalize transition ${
                    view === v
                      ? "bg-black text-white"
                      : "text-slate-500 hover:text-black"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* NEW CONTROLS */}
            <button
              onClick={expandAll}
              className="text-xs px-3 py-1 rounded-lg border hover:bg-slate-100"
            >
              Expand All
            </button>

            <button
              onClick={collapseAll}
              className="text-xs px-3 py-1 rounded-lg border hover:bg-slate-100"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="pl-10 space-y-3 animate-pulse">
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="h-20 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <p className="text-center p-10 text-slate-500">
          No completed campaigns
        </p>
      ) : (
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-slate-200" />

          <div className="space-y-8">
            {groupKeys.map((group) => {
              const items = grouped[group];
              const collapsed = collapsedGroups[group];

              return (
                <div key={group} className="space-y-3">
                  {/* GROUP HEADER */}
                  <div
                    onClick={() => toggleGroup(group)}
                    className="pl-10 flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-slate-600">
                      {group}
                    </span>

                    <span className="text-xs text-slate-400">
                      {collapsed ? "▶" : "▼"}
                    </span>
                  </div>

                  {!collapsed &&
                    items.map((c) => (
                      <div key={c.id} className="relative pl-10">
                        <div className="absolute left-[2px] top-3 w-3 h-3 bg-black rounded-full" />

                        <div
                          onClick={() =>
                            setExpanded(expanded === c.id ? null : c.id)
                          }
                          className="bg-white p-5 rounded-xl border cursor-pointer hover:shadow-md transition"
                        >
                          <div className="flex justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-semibold line-clamp-2">
                                {c.name}
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                {c.type} • {c.location_address || "No location"}
                              </p>
                            </div>

                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                              Completed
                            </span>
                          </div>

                          <div className="mt-3 flex gap-4 text-xs text-slate-500">
                            <span>
                              🕒 {new Date(c.created_at).toLocaleString()}
                            </span>
                            <span>👥 {c.volunteers_required}</span>
                            <span>🎯 {c.target_quantity}</span>
                          </div>

                          {expanded === c.id && (
                            <div className="mt-4 pt-4 border-t space-y-3 text-sm">
                              <p>📍 {c.location_address || "N/A"}</p>
                              <p>
                                🧠 {c.required_skills?.join(", ") || "General"}
                              </p>

                              {c.description && (
                                <p className="text-slate-600">
                                  📝 {c.description}
                                </p>
                              )}

                              {c.items && (
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(c.items).map(([k, v]) => (
                                    <div
                                      key={k}
                                      className="flex justify-between text-xs bg-slate-50 px-3 py-2 rounded-lg border"
                                    >
                                      <span>{k}</span>
                                      <span className="font-medium">{v}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;
