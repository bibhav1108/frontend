import { useState, useEffect } from "react";
import API from "../services/api";
import Skeleton from "../components/Skeleton";
import VerificationBadge from "../components/VerificationBadge";
import { resolveProfileImage } from "../utils/imageUtils";

const Volunteers = () => {
  const [activeTab, setActiveTab] = useState("members"); // "members" or "requests"
  const [volunteers, setVolunteers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const [seenIds, setSeenIds] = useState(new Set());

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    zone: "",
    skills: "",
  });

  useEffect(() => {
    if (activeTab === "members") {
      loadVolunteers(true);
    } else {
      loadRequests();
    }
  }, [activeTab]);

  const loadVolunteers = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch {
    } finally {
      if (initial) setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await API.get("/volunteers/join-requests/incoming");
      setRequests(res.data || []);
    } catch {
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      await API.patch(`/volunteers/join-requests/${requestId}`, { status });
      alert(`Request ${status === "APPROVED" ? "approved" : "rejected"} successfully!`);
      loadRequests();
      if (status === "APPROVED") loadVolunteers(false);
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
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

      setForm({ name: "", phone_number: "", zone: "", skills: "" });
      setShowForm(false);
      loadVolunteers(false);
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to create volunteer");
    } finally {
      setCreating(false);
    }
  };

  const filtered = volunteers.filter((v) =>
    (v.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* TABS */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("members")}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "members"
              ? "bg-primary text-white shadow-soft"
              : "bg-surface_high text-on_surface_variant hover:bg-surface_highest"
          }`}
        >
          Team Members
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "requests"
              ? "bg-primary text-white shadow-soft"
              : "bg-surface_high text-on_surface_variant hover:bg-surface_highest"
          }`}
        >
          Join Requests
          {requests.length > 0 && activeTab !== "requests" && (
             <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

      {activeTab === "members" ? (
        <div className="space-y-6">
          {/* MEMBERS VIEW */}
          <div className="rounded-2xl border border-white/10 bg-surface_high/80 backdrop-blur p-6 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-on_surface">Volunteer Force</h1>
              <p className="text-sm text-on_surface_variant">Manage and deploy your human network</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold text-on_surface">{volunteers.length}</p>
                <p className="text-xs text-on_surface_variant">Active Volunteers</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90"
              >
                + Add
              </button>
            </div>
          </div>

          <input
            placeholder="Search volunteers..."
            className="w-full max-w-md px-4 py-3 rounded-xl bg-surface_high border border-white/10 text-on_surface placeholder:text-on_surface_variant focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="rounded-2xl border border-white/10 bg-surface_high/80 backdrop-blur p-2 space-y-2">
            <div className="grid grid-cols-12 px-4 py-2 text-xs text-on_surface_variant">
              <div className="col-span-5">Name</div>
              <div className="col-span-4">Phone</div>
              <div className="col-span-3 text-right">Status</div>
            </div>

            {loading ? (
               <Skeleton count={5} height={50} />
            ) : filtered.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelected(v)}
                className="grid grid-cols-12 items-center px-4 py-3 cursor-pointer transition rounded-lg border border-white/10 hover:bg-white/5"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/10 shadow-sm">
                    <img 
                      src={resolveProfileImage(v.profile_image_url)} 
                      alt={v.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium text-sm text-on_surface">{v.name}</span>
                  <VerificationBadge trustTier={v.trust_tier} telegramActive={v.telegram_active} />
                </div>
                <div className="col-span-4 text-sm text-on_surface_variant">{v.phone_number}</div>
                <div className="col-span-3 text-right">
                   <span className={`text-[10px] px-2 py-0.5 rounded-full ${v.telegram_active ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}`}>
                     {v.telegram_active ? "Online" : "Offline"}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* REQUESTS VIEW */}
          <div className="rounded-2xl border border-white/10 bg-surface_high/80 backdrop-blur p-6">
             <h2 className="text-xl font-bold text-on_surface">Pending Applications</h2>
             <p className="text-sm text-on_surface_variant">Volunteers waiting to join your team.</p>
          </div>

          <div className="grid gap-4">
             {requestsLoading ? (
               <Skeleton count={3} height={80} />
             ) : requests.length > 0 ? (
               requests.map((req) => (
                 <div key={req.id} className="bg-surface_lowest p-5 rounded-2xl border border-white/10 shadow-soft flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/10 shadow-soft">
                            <img 
                                src={resolveProfileImage(req.profile_image_url)} 
                                alt={req.volunteer_name} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 font-bold text-on_surface">
                                <h3>{req.volunteer_name}</h3>
                                <VerificationBadge trustTier={req.trust_tier} telegramActive={req.telegram_active} />
                            </div>
                            <p className="text-xs text-on_surface_variant">Applied on {new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleRequestAction(req.id, "REJECTED")}
                            className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                            Decline
                        </button>
                        <button 
                            onClick={() => handleRequestAction(req.id, "APPROVED")}
                            className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:shadow-lg transition-all"
                        >
                            Approve
                        </button>
                    </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-20 bg-surface_lowest rounded-3xl border border-dashed border-gray-200">
                  <span className="material-symbols-outlined text-4xl text-on_surface_variant mb-2">inbox</span>
                  <p className="text-on_surface_variant">No pending join requests</p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* MODALS ... (re-using the ones from original Volunteers.jsx) */}
      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <div className="bg-surface_high w-full max-w-md p-6 rounded-2xl space-y-4 border border-white/10 relative" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-xl text-on_surface">Add Volunteer</h2>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface border border-white/10 text-on_surface" />
            <input placeholder="Phone Number" value={form.phone_number} onChange={(e) => setForm({...form, phone_number: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface border border-white/10 text-on_surface" />
            <button onClick={handleCreate} className="w-full py-2.5 rounded-lg bg-primary text-white font-medium">{creating ? "Creating..." : "Create Volunteer"}</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="bg-surface_high w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-white/10 relative" onClick={(e) => e.stopPropagation()}>
             <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <img 
                        src={resolveProfileImage(selected.profile_image_url)} 
                        alt={selected.name} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-on_surface">{selected.name}</h2>
                        <VerificationBadge trustTier={selected.trust_tier} telegramActive={selected.telegram_active} />
                    </div>
                    <p className="text-on_surface_variant text-sm">{selected.phone_number}</p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-surface p-4 rounded-xl">
                    <span className="text-xs text-on_surface_variant block mb-1 uppercase tracking-wider">Status</span>
                    <span className={`text-sm font-bold ${selected.telegram_active ? "text-green-500" : "text-gray-500"}`}>{selected.telegram_active ? "Online" : "Offline"}</span>
                 </div>
                 <div className="bg-surface p-4 rounded-xl">
                    <span className="text-xs text-on_surface_variant block mb-1 uppercase tracking-wider">Trust Tier</span>
                    <span className="text-sm font-bold text-primary">{selected.trust_tier}</span>
                 </div>
             </div>
             <button onClick={() => setSelected(null)} className="mt-8 w-full py-3 bg-surface_high text-on_surface font-bold rounded-xl border border-white/10">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Volunteers;
