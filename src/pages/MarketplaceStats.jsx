import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

const MarketplaceStatsPage = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH ----------------
  const fetchData = async () => {
    try {
      setLoading(true);
      // Correcting the endpoint to hit the Marketplace Inventory Stats
      const [invRes, statsRes] = await Promise.all([
        API.get("/marketplace/inventory/"),
        API.get("/marketplace/inventory/stats"),
      ]);

      setItems(invRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalQuantity = items.reduce((a, b) => a + b.quantity, 0);
  const latest = items.slice(0, 5);
  
  // Calculate relative distribution for the visual meter
  const breakdownEntries = Object.entries(stats?.item_breakdown || {});
  const maxCount = Math.max(...breakdownEntries.map(([, count]) => count), 1);

  return (
    <div className="space-y-10 animate-[fadeIn_0.5s_ease]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <button
             onClick={() => navigate("/marketplace")}
             className="w-10 h-10 flex items-center justify-center bg-surface_high rounded-2xl border border-white/5 hover:bg-surface_highest transition-all"
           >
             <span className="material-symbols-outlined text-on_surface_variant">arrow_back</span>
           </button>
           <div>
             <h1 className="text-3xl font-outfit font-black tracking-tight">Recovery Analytics</h1>
             <p className="text-sm text-on_surface_variant">Data-driven insights from the global donation marketplace.</p>
           </div>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-3xl flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined">analytics</span>
            </div>
            <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-primary">System Health</p>
                <p className="text-lg font-black text-on_surface">Operational</p>
            </div>
        </div>
      </div>

      {/* ================= KEY METRICS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             [1,2,3].map(i => <div key={i} className="h-32 bg-surface_high rounded-[2rem] animate-pulse" />)
        ) : (
            <>
                <StatCard 
                    label="Total Recoveries" 
                    value={stats?.total_items_recovered || 0} 
                    sub="Items retrieved from marketplace"
                    icon="package_2"
                />
                <StatCard 
                    label="Volume Moved" 
                    value={totalQuantity.toFixed(0)} 
                    sub="Total units currently in recovery depot"
                    icon="equalizer"
                    highlight
                />
                <StatCard 
                    label="Category Reach" 
                    value={breakdownEntries.length} 
                    sub="Unique product types handled"
                    icon="category"
                />
            </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ================= VISUAL BREAKDOWN ================= */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-outfit font-black tracking-tight flex items-center gap-2">
                    <span className="w-2 h-6 bg-primary rounded-full"></span>
                    Inventory Distribution
                </h2>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-surface_highest shadow-soft space-y-6">
                {loading ? (
                    <div className="space-y-4">
                        <div className="h-10 bg-surface_high rounded-xl animate-pulse" />
                        <div className="h-10 bg-surface_high rounded-xl animate-pulse" />
                    </div>
                ) : breakdownEntries.length === 0 ? (
                    <div className="py-10 text-center text-on_surface_variant italic text-sm">No data available for distribution analysis.</div>
                ) : (
                    breakdownEntries.map(([name, count]) => (
                        <div key={name} className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-on_surface uppercase tracking-tight">{name}</span>
                                <span className="text-xs font-black text-on_surface_variant">{count} hits</span>
                            </div>
                            <div className="h-3 w-full bg-surface_highest rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(count / maxCount) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-primary to-primary_light rounded-full"
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
          </section>

          {/* ================= RECENT MINI LIST ================= */}
          <section className="lg:col-span-5 space-y-6">
            <h2 className="text-xl font-outfit font-black tracking-tight flex items-center gap-2">
                <span className="w-2 h-6 bg-secondary rounded-full"></span>
                Fresh Inbound
            </h2>

            <div className="bg-surface_high/50 p-2 rounded-[2.5rem] border border-surface_highest space-y-2">
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-16 bg-surface_high rounded-2xl animate-pulse" />)
                ) : latest.length === 0 ? (
                    <div className="p-8 text-center text-sm text-on_surface_variant">No recent recoveries.</div>
                ) : (
                    latest.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-surface_highest transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                                    <span className="material-symbols-outlined text-sm">shopping_basket</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-on_surface">{item.item_name}</p>
                                    <p className="text-[10px] text-on_surface_variant">{new Date(item.collected_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-on_surface">{item.quantity} {item.unit}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-gradient-to-br from-primary to-primary_dark p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary/20">
                <h3 className="text-lg font-black mb-1">Weekly Goal</h3>
                <p className="text-xs text-white/70 mb-4">You are at 84% of your recovery target for this week.</p>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-white rounded-full w-[84%]" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Next Target: 1,200 Units</p>
            </div>
          </section>
      </div>
    </div>
  );
};

// ---------------- COMPONENT ----------------
const StatCard = ({ label, value, sub, icon, highlight }) => (
  <div
    className={`p-8 rounded-[2.5rem] relative overflow-hidden group transition-all hover:translate-y-[-4px] ${
      highlight ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-white border border-surface_highest shadow-soft"
    }`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 ${highlight ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
        <span className="material-symbols-outlined">{icon}</span>
    </div>
    <p className={`text-4xl font-outfit font-black mb-1 ${highlight ? 'text-white' : 'text-on_surface'}`}>{value}</p>
    <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${highlight ? 'text-white/60' : 'text-on_surface_variant'}`}>{label}</p>
    <p className={`text-[10px] ${highlight ? 'text-white/40' : 'text-on_surface_variant/60'}`}>{sub}</p>
    
    {/* Decorative flare */}
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 blur-2xl ${highlight ? 'bg-white' : 'bg-primary'}`} />
  </div>
);

export default MarketplaceStatsPage;
