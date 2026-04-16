import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../../../services/api";

// Shared UI Components
import MetricCard from "../../../components/shared/MetricCard";
import ContentSection from "../../../components/shared/ContentSection";
import DataRow from "../../../components/shared/DataRow";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";

const MarketplaceStatsPage = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
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
  const breakdownEntries = Object.entries(stats?.item_breakdown || {});
  const maxCount = Math.max(...breakdownEntries.map(([, count]) => count), 1);

  const skeletonLayout = [
    { type: 'row', gap: 6, cols: Array(3).fill({type: 'rect', height: 160, className: "rounded-[2.5rem]"}) },
    { type: 'row', gap: 8, cols: [
        { type: 'rect', height: 400, className: "rounded-[3rem]" },
        { type: 'rect', height: 400, className: "rounded-[3rem]" }
    ]}
  ];

  if (loading) return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
        <SkeletonStructure layout={skeletonLayout} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 pb-32 selection:bg-primary/10 animate-fadeIn">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Global Marketplace Intelligence</p>
            <h1 className="text-5xl font-outfit font-black text-on_surface tracking-tight">Recovery Analytics</h1>
            <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Real-time telemetry from asset acquisition and mission theaters.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2rem] border border-on_surface/5 shadow-sm">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                <span className="material-symbols-outlined font-black">satellite_alt</span>
            </div>
            <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-on_surface_variant/40">Network Status</p>
                <p className="text-sm font-black text-on_surface">UPLINK ACTIVE</p>
            </div>
        </div>
      </div>

      {/* KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MetricCard label="Total Recoveries" value={stats?.total_items_recovered || 0} icon="package_2" variant="primary" />
        <MetricCard label="Volume Capacity" value={totalQuantity.toFixed(0)} icon="equalizer" />
        <MetricCard label="Tactical Range" value={breakdownEntries.length} icon="category" />
      </div>

      {/* ANALYSIS GRID */}
      <div className="grid grid-cols-12 gap-10">
        {/* DISTRIBUTION */}
        <div className="col-span-12 lg:col-span-7">
            <ContentSection title="Inventory Distribution Matrix" icon="data_exploration">
                <div className="space-y-8 py-4">
                    {breakdownEntries.length === 0 ? (
                        <div className="py-20 text-center text-on_surface_variant/40 italic text-[10px] font-black uppercase tracking-widest">No Sector Data Available</div>
                    ) : (
                        breakdownEntries.map(([name, count]) => (
                            <div key={name} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-on_surface uppercase tracking-widest">{name}</span>
                                    <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">{count} units</span>
                                </div>
                                <div className="h-4 w-full bg-surface_high rounded-full overflow-hidden p-1 shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(count / maxCount) * 100}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="h-full bg-primaryGradient rounded-full border border-white/20"
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ContentSection>
        </div>

        {/* FEED & GOALS */}
        <div className="col-span-12 lg:col-span-5 space-y-10">
            <ContentSection title="Inbound Signals" icon="sensors">
                <div className="space-y-3">
                    {latest.length === 0 ? (
                        <p className="text-[10px] font-black uppercase tracking-widest text-center opacity-20 py-10">Silence on the line</p>
                    ) : (
                        latest.map((item) => (
                            <div key={item.id} className="group bg-white/60 p-5 rounded-3xl flex items-center justify-between border border-transparent hover:border-primary/20 hover:bg-white transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-surface_high group-hover:bg-primaryGradient group-hover:text-white rounded-xl flex items-center justify-center transition-all duration-500">
                                        <span className="material-symbols-outlined text-sm">shopping_basket</span>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-on_surface uppercase tracking-tight">{item.item_name}</p>
                                        <p className="text-[9px] font-bold text-on_surface_variant/40 tracking-widest">{new Date(item.collected_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] font-black text-primary uppercase">{item.quantity} {item.unit}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ContentSection>

            <div className="bg-on_surface p-12 rounded-[3.5rem] text-white shadow-2xl shadow-on_surface/20 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary opacity-20 blur-[80px] group-hover:opacity-40 transition-opacity" />
                <div className="relative z-10 space-y-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Operational Quota</p>
                        <h3 className="text-3xl font-outfit font-black tracking-tight mb-2">Weekly Objective</h3>
                        <p className="text-xs font-bold text-white/40">Achieved 84% of your current recovery target for the specific sector.</p>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="h-5 w-full bg-white/5 rounded-full overflow-hidden p-1 shadow-inner border border-white/5">
                            <div className="h-full bg-white rounded-full w-[84%] shadow-lg shadow-white/20" />
                        </div>
                        <div className="flex justify-between items-center opacity-30">
                            <span className="text-[9px] font-black uppercase tracking-widest">Target Metrika</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">1,200 Assets</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceStatsPage;
