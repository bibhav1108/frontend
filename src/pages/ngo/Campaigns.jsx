import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import ActionInput from "../../components/shared/ActionInput";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const TYPE_OPTIONS = [
  "HEALTH",
  "EDUCATION",
  "BASIC_NEEDS",
  "AWARENESS",
  "EMERGENCY",
  "ENVIRONMENT",
  "SKILLS",
  "OTHER",
];

const STATUS_ORDER = {
  ACTIVE: 0,
  PLANNED: 1,
  COMPLETED: 2,
};

const MIN_CAMPAIGNS = 6;
const MIN_READINESS = 4;

const Campaigns = () => {
  // --- STATE ---
  const [campaigns, setCampaigns] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [pool, setPool] = useState([]);
  const [loadingPool, setLoadingPool] = useState(false);

  const [readiness, setReadiness] = useState([]);
  const [loadingReadiness, setLoadingReadiness] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("OTHER");
  const [targetQuantity, setTargetQuantity] = useState("");
  const [items, setItems] = useState([{ key: "", value: "" }]);
  const [volunteersRequired, setVolunteersRequired] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [formError, setFormError] = useState("");

  // --- API METHODS ---
  const loadCampaigns = async () => {
    try {
      const res = await API.get("/campaigns/");
      const data = res.data || [];
      setCampaigns(data);
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const loadInventory = async () => {
    try {
      const res = await API.get("/inventory/");
      setInventory(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadVolunteerReadiness = async (campaignData = null) => {
    try {
      setLoadingReadiness(true);
      const source = campaignData ?? campaigns;
      const ongoingCampaigns = source.filter((c) => c.status === "PLANNED");

      const rows = await Promise.all(
        ongoingCampaigns.map(async (campaign) => {
          try {
            const res = await API.get(`/campaigns/${campaign.id}/pool`);
            const normalizeStatus = (s) => {
              if (!s) return "";
              if (typeof s === "string") return s;
              if (s.value) return s.value;
              return String(s);
            };

            const approvedVolunteers = (res.data || []).filter(
              (v) => normalizeStatus(v.status) === "APPROVED",
            );

            return { campaign, approvedVolunteers };
          } catch (err) {
            console.error(err);
            return { campaign, approvedVolunteers: [] };
          }
        }),
      );

      setReadiness(rows.filter((row) => row.approvedVolunteers.length > 0));
    } catch (err) {
      console.error(err);
      setReadiness([]);
    } finally {
      setLoadingReadiness(false);
    }
  };

  const refreshDashboard = async () => {
    const campaignData = await loadCampaigns();
    await loadVolunteerReadiness(campaignData);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [campaignData] = await Promise.all([
        loadCampaigns(),
        loadInventory(),
      ]);
      await loadVolunteerReadiness(campaignData);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm]);

  // --- ACTIONS & HANDLERS ---
  const resetForm = () => {
    setName("");
    setDescription("");
    setTargetQuantity("");
    setItems([{ key: "", value: "" }]);
    setVolunteersRequired("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setSkills("");
    setType("OTHER");
    setFormError("");
  };

  const triggerBroadcast = async (campaignId) => {
    try {
      setActionLoadingId(`broadcast-${campaignId}`);
      await API.post(`/campaigns/${campaignId}/broadcast`);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const normalizeDateTimeLocal = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      if (typeof value === "string") return value.slice(0, 16);
      return "";
    }
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    try {
      setLoadingAI(true);
      const res = await API.post("/campaigns/draft", { prompt: aiPrompt });
      const data = res.data || {};
      setName(data.name || "");
      setDescription(data.description || "");
      setType(data.type || "OTHER");
      setTargetQuantity(String(data.target_quantity ?? ""));
      setShowAIModal(false);
      setShowForm(true);
    } catch (err) {
      console.error("AI ERROR:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  const createCampaign = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || !description.trim()) return;

    const formattedItems = {};
    items.forEach((i) => {
      if (i.key && i.value) formattedItems[i.key] = Number(i.value);
    });

    try {
      setCreating(true);
      await API.post("/campaigns/", {
        name: trimmedName,
        description: description.trim(),
        type,
        target_quantity: targetQuantity,
        items: formattedItems,
        volunteers_required: Number(volunteersRequired) || 0,
        start_time: startTime || null,
        end_time: endTime || null,
        location_address: location || null,
        required_skills: skills ? skills.split(",").map((s) => s.trim()) : [],
      });
      setShowForm(false);
      resetForm();
      await refreshDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const openDetails = async (campaign) => {
    setSelectedCampaign(campaign);
    try {
      setLoadingPool(true);
      const res = await API.get(`/campaigns/${campaign.id}/pool`);
      setPool(res.data || []);
    } catch {
      setPool([]);
    } finally {
      setLoadingPool(false);
    }
  };

  const completeCampaign = async (id) => {
    try {
      setActionLoadingId(`complete-${id}`);
      await API.post(`/campaigns/${id}/complete`);
      setSelectedCampaign(null);
      await refreshDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- MEMOIZED DATA ---
  const campaignList = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return [...campaigns]
      .filter((c) => c.status === "ACTIVE" || c.status === "PLANNED")
      .filter((c) => filterType === "ALL" || c.type === filterType)
      .filter((c) => (c.name + c.description).toLowerCase().includes(q))
      .sort((a, b) => (STATUS_ORDER[a.status] || 0) - (STATUS_ORDER[b.status] || 0));
  }, [campaigns, filterType, searchTerm]);

  const stats = useMemo(() => {
    const active = campaigns.filter((c) => c.status === "ACTIVE").length;
    const planned = campaigns.filter((c) => c.status === "PLANNED").length;
    const completed = campaigns.filter((c) => c.status === "COMPLETED").length;
    return { active, planned, completed, total: campaigns.length };
  }, [campaigns]);

  const ITEMS_PER_PAGE = 6;
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return campaignList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [campaignList, currentPage]);

  const totalPages = Math.ceil(campaignList.length / ITEMS_PER_PAGE);

  const campaignSkeletonLayout = [
    { type: 'row', cols: [{ type: 'text', width: 200 }, { type: 'rect', width: 100, height: 40 }] },
    { type: 'stack', gap: 4, items: Array(4).fill({ type: 'rect', height: 100, className: "rounded-2xl" }) }
  ];

  return (
    <>
    <div className="space-y-8 selection:bg-primary/10 animate-fadeIn">
      {/* HEADER: Mission Control */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Strategic Operations</p>
          <h1 className="text-4xl font-outfit font-black text-on_surface tracking-tight">Mission Control</h1>
          <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Deploying resources and coordinating volunteer movements.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/campaign-history" className="px-5 py-2.5 bg-surface_high hover:bg-surface_highest rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Past Missions</Link>
          <button onClick={() => setShowAIModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/20">
            <span className="material-symbols-outlined text-sm">magic_button</span> AI Draft
          </button>
          <button onClick={() => setShowForm(true)} className="px-6 py-2.5 bg-primaryGradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">Launch Mission</button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <MetricCard label="Total Ops" value={stats.total} icon="rocket_launch" />
        <MetricCard label="Active" value={stats.active} icon="play_circle" />
        <MetricCard label="Planned" value={stats.planned} icon="event_upcoming" />
        <MetricCard label="Success" value={stats.completed} icon="check_circle" />
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* LEFT: Campaigns Registry */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <ContentSection title="Active & Planned Deployments" icon="list_alt">
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-30">search</span>
                    <input
                        placeholder="Filter missions by name or type..."
                        className="w-full bg-white border border-on_surface/5 pl-10 pr-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full sm:w-48 bg-white border border-on_surface/5 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <option value="ALL">All Sectors</option>
                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {loading ? (
                <SkeletonStructure layout={campaignSkeletonLayout} />
            ) : campaignList.length === 0 ? (
                <div className="text-center py-20 bg-surface_high/30 rounded-3xl border border-dashed border-white/20">
                    <span className="material-symbols-outlined text-5xl opacity-10 mb-2">dashboard_customize</span>
                    <p className="text-sm font-bold opacity-30">No active operations in sector</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {paginatedCampaigns.map((c, i) => (
                        <motion.div 
                            key={c.id}
                            layout
                            onClick={() => openDetails(c)}
                            className={`group p-6 rounded-3xl border transition-all cursor-pointer ${
                                selectedCampaign?.id === c.id ? "bg-white border-primary shadow-xl ring-1 ring-primary/50" : "bg-white/60 border-on_surface/5 hover:bg-white hover:border-on_surface/20 hover:-translate-y-1"
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest ${
                                            c.status === 'ACTIVE' ? "bg-green-500 text-white" : "bg-primary text-white"
                                        }`}>{c.status}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{c.type}</span>
                                    </div>
                                    <h3 className="text-xl font-outfit font-black text-on_surface tracking-tight group-hover:text-primary transition-colors">{c.name}</h3>
                                    <p className="text-xs text-on_surface_variant line-clamp-1 opacity-70">{c.description}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1">Launch Date</p>
                                    <p className="text-sm font-black text-on_surface">
                                        {c.start_time ? new Date(c.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
          </ContentSection>
        </div>

        {/* RIGHT: Readiness Tracking */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
            <ContentSection title="Personnel Readiness" icon="verified_user">
                <p className="text-[10px] font-bold text-on_surface_variant/60 mb-6 leading-relaxed">Intelligence on approved volunteers for upcoming deployments.</p>
                <div className="space-y-3">
                    {loadingReadiness ? (
                        <SkeletonStructure layout={Array(3).fill({ type: 'rect', height: 80, className: "rounded-2xl" })} />
                    ) : readiness.length === 0 ? (
                        <div className="text-center py-10 opacity-20"><p className="text-xs font-bold">No active readiness stream</p></div>
                    ) : (
                        readiness.map(r => (
                            <div key={r.campaign.id} className="p-4 bg-surface_high/40 rounded-2xl border border-white/50">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-3 truncate">{r.campaign.name}</p>
                                <div className="flex flex-wrap gap-2">
                                    {r.approvedVolunteers.slice(0, 4).map(v => (
                                        <span key={v.volunteer_id} className="px-2 py-1 bg-green-500/10 text-green-600 border border-green-500/10 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            {v.volunteer_name.split(' ')[0]}
                                        </span>
                                    ))}
                                    {r.approvedVolunteers.length > 4 && <span className="text-[9px] font-black opacity-30">+{r.approvedVolunteers.length - 4} More</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ContentSection>

            {/* Quick Actions */}
            <div className="grid gap-3">
                <Link to="/inventory" className="flex items-center justify-between p-4 bg-on_surface text-white rounded-2xl group hover:-translate-x-1 transition-all">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm">inventory_2</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Inventory</span>
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-30 group-hover:opacity-100">arrow_forward</span>
                </Link>
                <Link to="/volunteers" className="flex items-center justify-between p-4 bg-surface_high hover:bg-surface_highest rounded-2xl group hover:-translate-x-1 transition-all border border-white/20">
                    <div className="flex items-center gap-3 text-on_surface">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Team Portal</span>
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-30 group-hover:opacity-100">arrow_forward</span>
                </Link>
            </div>
        </div>
      </div>

      {/* AI GENERATE MODAL */}
      <AnimatePresence>
        {showAIModal && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAIModal(false)} />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-surface_high w-full max-w-xl p-8 rounded-[3rem] border border-white/20 relative shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-primaryGradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <span className="material-symbols-outlined text-2xl">magic_button</span>
                        </div>
                        <div>
                            <h2 className="font-outfit font-black text-2xl text-on_surface tracking-tight leading-none">AI Intelligence</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Campaign Strategy Engine</p>
                        </div>
                    </div>
                    
                    <p className="text-xs font-bold text-on_surface_variant/60 mb-6">Describe your mission objectives in plain text. Our AI will draft a complete campaign strategy including resource targeting and timelines.</p>
                    
                    <textarea 
                        className="w-full h-32 bg-white border border-on_surface/5 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="e.g. We need to collect 500 blankets for the winter relief drive in Delhi next week..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                    />

                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowAIModal(false)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest opacity-40">Cancel</button>
                        <button 
                            disabled={loadingAI || !aiPrompt.trim()}
                            onClick={handleAIGenerate}
                            className="flex-[2] py-4 bg-on_surface text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loadingAI ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">rocket_launch</span>}
                            {loadingAI ? "Calculating..." : "Generate Strategy"}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* NEW CAMPAIGN FORM MODAL */}
      <AnimatePresence>
        {showForm && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setShowForm(false); resetForm(); }} />
                <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-surface_high w-full max-w-2xl p-8 rounded-[3rem] border border-white/20 relative shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                    <h2 className="font-outfit font-black text-3xl text-on_surface tracking-tight mb-8">Mission Briefing</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <ActionInput label="Mission Name" placeholder="e.g. Winter Shield 2024" value={name} onChange={setName} />
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/60">Objective Description</label>
                                <textarea className="w-full h-24 bg-white border border-on_surface/5 rounded-xl p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/60">Mission Sector</label>
                                <select className="w-full bg-white border border-on_surface/5 px-3 py-2.5 rounded-xl text-xs font-bold" value={type} onChange={(e) => setType(e.target.value)}>
                                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <ActionInput label="Deploy Location" placeholder="e.g. Sector 5, Gateway" value={location} onChange={setLocation} />
                            <div className="grid grid-cols-2 gap-4">
                                <ActionInput label="Launch" type="datetime-local" value={startTime} onChange={setStartTime} />
                                <ActionInput label="Terminal" type="datetime-local" value={endTime} onChange={setEndTime} />
                            </div>
                            <ActionInput label="Personnel Count" type="number" placeholder="50" value={volunteersRequired} onChange={setVolunteersRequired} />
                        </div>
                    </div>

                    <div className="mt-8 border-t border-on_surface/5 pt-8">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant mb-4">Target Resource Assets</p>
                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <input placeholder="Resource Name..." className="flex-1 bg-white border border-on_surface/5 px-4 py-2 rounded-xl text-xs font-bold" value={item.key} onChange={(e) => {
                                        const n = [...items]; n[idx].key = e.target.value; setItems(n);
                                    }} />
                                    <input placeholder="Qty" type="number" className="w-24 bg-white border border-on_surface/5 px-4 py-2 rounded-xl text-xs font-bold" value={item.value} onChange={(e) => {
                                        const n = [...items]; n[idx].value = e.target.value; setItems(n);
                                    }} />
                                    {items.length > 1 && <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-500 hover:scale-110 transition-transform"><span className="material-symbols-outlined">delete</span></button>}
                                </div>
                            ))}
                            <button onClick={() => setItems([...items, { key: "", value: "" }])} className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">+ Map New Asset</button>
                        </div>
                    </div>

                    <button onClick={createCampaign} disabled={creating} className="w-full mt-10 py-5 bg-on_surface text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl hover:-translate-y-1 transition-all">
                        {creating ? "Launching Mission..." : "Confirm Deployment"}
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
      {selectedCampaign &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
            onClick={() => {
              setSelectedCampaign(null);
              setPool([]);
            }}
          >
            <div
              className="relative w-full max-w-5xl max-h-[95vh] flex flex-col rounded-3xl border border-white/10 bg-surface shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setSelectedCampaign(null);
                  setPool([]);
                }}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="overflow-y-auto p-6 md:p-8">
                <div className="mb-6 pr-10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Mission Details
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-on_surface">
                    {selectedCampaign.name}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm text-on_surface_variant opacity-80">
                    {selectedCampaign.description}
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-5">
                    <div className="rounded-2xl bg-surface_high/50 p-5 border border-white/5">
                      <div className="flex flex-wrap items-center gap-2 mb-5">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusStyle(selectedCampaign.status)}`}
                        >
                          {selectedCampaign.status}
                        </span>
                        <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                          {selectedCampaign.type || "OTHER"}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                            Location
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {selectedCampaign.location_address || "No location"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                            Goal
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {selectedCampaign.target_quantity || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                            Required Personnel
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {selectedCampaign.volunteers_required || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                            Required Skills
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {selectedCampaign?.required_skills?.length
                              ? selectedCampaign.required_skills.join(", ")
                              : "General"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-surface_high/50 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-bold">Inventory Requirements</h3>
                        <span className="text-xs opacity-50">
                          {selectedCampaign.items
                            ? Object.keys(selectedCampaign.items).length
                            : 0}{" "}
                          entries
                        </span>
                      </div>

                      {selectedCampaign.items &&
                      Object.keys(selectedCampaign.items).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(selectedCampaign.items).map(
                            ([k, v]) => (
                              <div
                                key={k}
                                className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 border border-white/5"
                              >
                                <span className="text-sm font-medium">{k}</span>
                                <span className="text-sm font-bold text-primary">
                                  {v}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="text-sm opacity-50">
                          No items specified.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-2xl border border-white/5 bg-surface_high/50 p-5 min-h-[300px]">
                      <div className="mb-5 flex items-center justify-between">
                        <h3 className="font-bold">Volunteer Pool</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                          {loadingPool
                            ? "Syncing..."
                            : `${pendingCount} pending • ${approvedCount} approved`}
                        </span>
                      </div>

                      {loadingPool ? (
                        <div className="space-y-3">
                          <Skeleton className="h-16 w-full rounded-2xl" />
                          <Skeleton className="h-16 w-full rounded-2xl" />
                        </div>
                      ) : pool.length === 0 ? (
                        <div className="rounded-xl bg-surface p-8 text-center border border-white/5">
                          <p className="text-sm opacity-50">
                            No volunteers matched or applied yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {pool.map((v) => (
                            <div
                              key={v.volunteer_id}
                              className="rounded-xl border border-white/5 bg-white/5 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate font-semibold">
                                    {v.volunteer_name}
                                  </p>
                                  <p className="mt-1 text-xs opacity-60">
                                    {v.skills?.length
                                      ? v.skills.join(", ")
                                      : "No skills"}
                                  </p>
                                  <span
                                    className={`mt-2 inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                                      v.status === "APPROVED"
                                        ? "bg-green-500/10 text-green-400"
                                        : v.status === "REJECTED"
                                          ? "bg-red-500/10 text-red-400"
                                          : "bg-amber-500/10 text-amber-400"
                                    }`}
                                  >
                                    {v.status}
                                  </span>
                                </div>

                                {v.status === "PENDING" && (
                                  <button
                                    onClick={() =>
                                      approve(
                                        selectedCampaign.id,
                                        v.volunteer_id,
                                      )
                                    }
                                    className="shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-500"
                                  >
                                    Approve
                                  </button>
                                )}
                              </div>

                              {v.match_score != null && (
                                <div className="mt-4">
                                  <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-50">
                                    <span>Match score</span>
                                    <span>{v.match_score}%</span>
                                  </div>
                                  <div className="h-1 rounded-full bg-white/10">
                                    <div
                                      className="h-1 rounded-full bg-primary"
                                      style={{
                                        width: `${Math.max(0, Math.min(100, v.match_score))}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* AI DRAFT MODAL */}
      {showAIModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
            onClick={() => {
              setShowAIModal(false);
              setFormError("");
            }}
          >
            <div
              className="relative w-full max-w-3xl max-h-[95vh] flex flex-col rounded-3xl border border-white/10 bg-surface shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setFormError("");
                }}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="overflow-y-auto p-6 md:p-8">
                <div className="mb-6 pr-10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Intelligence Assistant
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-on_surface">
                    Generate Blueprint
                  </h2>
                  <p className="mt-2 text-sm text-on_surface_variant opacity-80">
                    Describe the operation. The AI will parse requirements and
                    prefill the form.
                  </p>
                </div>

                {formError && (
                  <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    {formError}
                  </div>
                )}

                <textarea
                  className="min-h-[180px] w-full rounded-2xl border border-on_surface/10 bg-surface_low px-4 py-3 text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  placeholder="Example: Distribute 100 food packets in Varanasi this Sunday. Need 5 volunteers for 2 hours..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />

                <div className="mt-5 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAIGenerate}
                    disabled={loadingAI}
                    className="flex-1 rounded-2xl bg-primaryGradient py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loadingAI && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {loadingAI ? "Generating Draft..." : "Compose Mission"}
                  </motion.button>
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="rounded-xl border border-on_surface/10 bg-surface_high px-6 py-3 text-sm font-semibold transition hover:bg-surface_highest text-on_surface"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* CREATE FORM MODAL */}
      {showForm &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
            onClick={() => {
              setShowForm(false);
              setFormError("");
            }}
          >
            <div
              className="relative w-full max-w-4xl max-h-[95vh] flex flex-col rounded-3xl border border-white/10 bg-surface shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="overflow-y-auto p-6 md:p-8">
                <div className="mb-6 pr-10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Mission Blueprint
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-on_surface">
                    Create Campaign
                  </h2>
                  <p className="mt-2 text-sm text-on_surface_variant opacity-80">
                    Define scope, timeline, inventory limits, and personnel
                    requirements.
                  </p>
                </div>

                {formError && (
                  <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    {formError}
                  </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <Field label="Name">
                      <input
                        className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. Community Meal Drive"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Field>

                    <Field label="Description">
                      <textarea
                        className="min-h-[120px] w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                        placeholder="Brief description of operations..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Type">
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                          {TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Target Goal">
                        <input
                          className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. 100 meals"
                          value={targetQuantity}
                          onChange={(e) => setTargetQuantity(e.target.value)}
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Start Time">
                        <input
                          type="datetime-local"
                          className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </Field>

                      <Field label="End Time">
                        <input
                          type="datetime-local"
                          className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </Field>
                    </div>

                    <Field label="Location">
                      <input
                        className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. Ward 12, City Hospital"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Required Skills (CSV)">
                        <input
                          className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                          placeholder="medical, logistics"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                        />
                      </Field>

                      <Field label="Personnel Needed">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. 5"
                          value={volunteersRequired}
                          onChange={(e) =>
                            setVolunteersRequired(e.target.value)
                          }
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-surface_high/50 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-bold">Item Loadout</h3>
                        <button
                          onClick={() =>
                            setItems([...items, { key: "", value: "" }])
                          }
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          + ADD ITEM
                        </button>
                      </div>

                      <div className="space-y-3">
                        {items.map((item, idx) => (
                          <div key={idx} className="grid gap-3 md:grid-cols-2">
                            <select
                              value={item.key}
                              onChange={(e) =>
                                updateItem(idx, "key", e.target.value)
                              }
                              className="w-full rounded-xl border border-on_surface/10 bg-surface px-4 py-3 text-sm text-on_surface shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                            >
                              <option value="">Select inventory...</option>
                              {inventory.map((inv) => (
                                <option key={inv.id} value={inv.item_name}>
                                  {inv.item_name} ({inv.quantity} {inv.unit})
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              placeholder="Quantity"
                              value={item.value}
                              onChange={(e) =>
                                updateItem(idx, "value", e.target.value)
                              }
                              className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={createCampaign}
                        disabled={creating}
                        className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {creating && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {creating ? "Processing..." : "Deploy Campaign"}
                      </motion.button>
                      <button
                        onClick={() => setShowForm(false)}
                        className="rounded-xl border border-on_surface/10 bg-surface_high px-6 py-3 text-sm font-semibold transition hover:bg-surface_highest text-on_surface"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

// UI Sub-components
const StatCard = ({ label, value, icon }) => (
  <div className="rounded-2xl border border-on_surface/5 bg-surface_high p-5 shadow-soft transition hover:scale-[1.02]">
    <div className="mb-4 flex items-center justify-between">
      <div className="rounded-xl bg-primary/10 p-2.5 text-primary border border-primary/10">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
    </div>
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on_surface_variant">
      {label}
    </p>
    <p className="mt-1 text-3xl font-black text-on_surface">{value}</p>
  </div>
);

const Field = ({ label, children }) => (
  <label className="block space-y-2">
    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on_surface_variant ml-1">
      {label}
    </span>
    {children}
  </label>
);

export default Campaigns;
