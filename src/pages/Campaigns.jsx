import { useEffect, useState } from "react";
import API from "../services/api";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [volunteers, setVolunteers] = useState(2);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const res = await API.get("/campaigns/");
      setCampaigns(res.data || []);
    } catch (err) {
      console.error(err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!name) return alert("Name required");

    try {
      setCreating(true);

      await API.post("/campaigns/", {
        name,
        description,
        volunteers_required: volunteers,
        location_address: location || null,
        start_time: startTime || null,
        end_time: endTime || null,
      });

      setShowForm(false);

      setTimeout(() => {
        loadCampaigns();
      }, 300);

      setName("");
      setDescription("");
      setLocation("");
      setStartTime("");
      setEndTime("");
      setVolunteers(2);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const completeCampaign = async (id) => {
    try {
      setCompletingId(id);
      await API.post(`/campaigns/${id}/complete`);
      loadCampaigns();
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingId(null);
    }
  };

  const getStatusColor = (status) => {
    if (status === "COMPLETED") return "bg-green-100 text-green-700";
    if (status === "ACTIVE") return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Mission Control</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition text-white px-4 py-2 rounded"
        >
          + Start Campaign
        </button>
      </div>

      {/* 🔥 MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 animate-fade-in flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded shadow space-y-4 animate-slide-in">
            <div className="flex justify-between">
              <h2 className="font-semibold text-lg">Create Campaign</h2>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Campaign Name"
              className="border p-2 w-full rounded"
            />

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="border p-2 w-full rounded"
            />

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="border p-2 w-full rounded"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border p-2 rounded"
              />

              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <input
              type="number"
              value={volunteers}
              onChange={(e) => setVolunteers(Number(e.target.value))}
              className="border p-2 w-full rounded"
            />

            <button
              onClick={createCampaign}
              disabled={creating}
              className={`w-full py-2 rounded text-white flex items-center justify-center gap-2 ${
                creating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {creating && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {creating ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </div>
      )}

      {/* 🔥 TABLE */}
      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center space-y-2">
            <div className="animate-pulse text-slate-400">
              Loading campaigns...
            </div>
            <div className="h-1 bg-slate-200 rounded overflow-hidden">
              <div className="h-full bg-indigo-500 animate-progress"></div>
            </div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No campaigns yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Location</th>
                <th>Volunteers</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {campaigns.map((c) => (
                <>
                  <tr
                    key={c.id}
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                    className="border-t hover:bg-slate-50 transition cursor-pointer animate-slide-in"
                  >
                    <td className="p-3 font-medium">{c.name}</td>

                    <td className="max-w-xs truncate">{c.description}</td>

                    <td>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          c.status,
                        )}`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td>{c.location_address || "-"}</td>

                    <td>{c.volunteers_required}</td>

                    <td>
                      {c.status !== "COMPLETED" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            completeCampaign(c.id);
                          }}
                          className="text-green-600 hover:underline"
                        >
                          {completingId === c.id ? "Completing..." : "Complete"}
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* 🔥 EXPANDED DETAILS */}
                  {expanded === c.id && (
                    <tr className="bg-slate-50">
                      <td colSpan="6" className="p-4 text-sm space-y-1">
                        <p>
                          📅 Start:{" "}
                          {c.start_time
                            ? new Date(c.start_time).toLocaleString()
                            : "-"}
                        </p>
                        <p>
                          ⏳ End:{" "}
                          {c.end_time
                            ? new Date(c.end_time).toLocaleString()
                            : "-"}
                        </p>
                        <p>
                          🕒 Created: {new Date(c.created_at).toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
