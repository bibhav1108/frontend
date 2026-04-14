import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_ngos: 0,
    pending_ngos: 0,
    active_ngos: 0,
    total_volunteers: 0
  });
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ngosRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/organizations?status_filter=pending")
      ]);
      setStats(statsRes.data);
      setPendingNGOs(ngosRes.data);
    } catch (err) {
      setError("Failed to fetch admin data. Check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await API.post(`/admin/organizations/${id}/approve`);
      // Update local state instead of refetching everything
      setPendingNGOs(prev => prev.filter(ngo => ngo.id !== id));
      setStats(prev => ({
        ...prev,
        pending_ngos: prev.pending_ngos - 1,
        active_ngos: prev.active_ngos + 1
      }));
    } catch (err) {
      alert("Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Are you sure you want to reject this organization? it will be deleted.")) return;
    setActionLoading(id);
    try {
      await API.post(`/admin/organizations/${id}/reject`);
      setPendingNGOs(prev => prev.filter(ngo => ngo.id !== id));
      setStats(prev => ({
        ...prev,
        pending_ngos: prev.pending_ngos - 1,
        total_ngos: prev.total_ngos - 1
      }));
    } catch (err) {
      alert("Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-[fadeIn_0.4s_ease]">
      {/* 📊 STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total NGOs" value={stats.total_ngos} icon="corporate_fare" color="bg-blue-500" />
        <StatCard title="Pending" value={stats.pending_ngos} icon="pending_actions" color="bg-amber-500" pulse />
        <StatCard title="Active NGOs" value={stats.active_ngos} icon="verified" color="bg-green-500" />
        <StatCard title="Volunteers" value={stats.total_volunteers} icon="groups" color="bg-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 🏢 PENDING NGOS LIST (Quick Actions) */}
        <section className="lg:col-span-2 bg-white rounded-3xl shadow-soft border border-surface_highest overflow-hidden">
          <div className="p-8 border-b border-surface_highest flex items-center justify-between bg-surface_lowest/50">
            <div>
              <h2 className="text-xl font-outfit font-black mb-1">Pending Approvals</h2>
              <p className="text-xs text-on_surface_variant">Recent organization registration requests</p>
            </div>
            <Link to="/admin/organizations" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface_lowest text-[10px] uppercase font-black tracking-widest text-on_surface_variant">
                <tr>
                  <th className="px-8 py-4">Organization</th>
                  <th className="px-8 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface_highest">
                <AnimatePresence>
                  {pendingNGOs.slice(0, 5).map((ngo) => (
                    <motion.tr 
                      key={ngo.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="hover:bg-surface_lowest transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="font-bold text-on_surface text-md">{ngo.name}</div>
                        <div className="text-[10px] text-on_surface_variant flex items-center gap-1">
                           {ngo.contact_email}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            disabled={actionLoading === ngo.id}
                            onClick={() => handleApprove(ngo.id)}
                            className="h-8 px-4 rounded-lg bg-green-500 text-white text-[10px] font-bold hover:bg-green-600 transition-all shadow-md shadow-green-200 disabled:opacity-50"
                          >
                            {actionLoading === ngo.id ? "..." : "Approve"}
                          </button>
                          <button 
                            disabled={actionLoading === ngo.id}
                            onClick={() => handleReject(ngo.id)}
                            className="h-8 px-4 rounded-lg bg-red-50 text-red-500 text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                          >
                            {actionLoading === ngo.id ? "..." : "Reject"}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {pendingNGOs.length === 0 && (
                  <tr>
                    <td colSpan="2" className="px-8 py-12 text-center">
                      <h3 className="text-sm font-bold text-on_surface">No Pending Requests</h3>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 🚀 QUICK TOOLS */}
        <section className="space-y-6">
           <div className="bg-primaryGradient p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-lg font-black mb-2 italic">Broadcast System</h3>
                <p className="text-xs text-white/80 mb-6">Send urgent messages to all registered NGO coordinators.</p>
                <button className="w-full py-3 bg-white text-primary text-xs font-black rounded-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                   Manage Broadcasts
                </button>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">campaign</span>
           </div>

           <div className="bg-white p-6 rounded-3xl border border-surface_highest shadow-soft">
              <h4 className="text-xs font-black uppercase tracking-widest text-on_surface_variant mb-4">System Status</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Core API</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">Healthy</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Telegram Bot</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">Online</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database (Neon)</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">Optimal</span>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, pulse = false }) => (
  <div className="bg-white p-6 rounded-3xl shadow-soft border border-surface_highest flex items-center gap-4 group hover:shadow-lg transition-all duration-300">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${color.split('-')[1]}-200 group-hover:scale-110 transition-transform`}>
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
    <div>
      <p className="text-xs font-black text-on_surface_variant uppercase tracking-widest">{title}</p>
      <div className="flex items-center gap-2">
         <h4 className="text-3xl font-outfit font-black">{value}</h4>
         {pulse && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>}
      </div>
    </div>
  </div>
);

export default AdminDashboard;
