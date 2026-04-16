import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import SkeletonStructure from "../../components/shared/SkeletonStructure";
import { useToast } from "../../context/ToastContext";

const MarketplaceInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transferringId, setTransferringId] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [selectedTargetId, setSelectedTargetId] = useState(null);
    const [transferStatus, setTransferStatus] = useState({ loading: false, error: null });
    const { addToast } = useToast();

    const fetchRecoveries = async () => {
        try {
            setLoading(true);
            const res = await API.get("/marketplace-inventory/");
            setItems(res.data || []);
        } catch (err) {
            console.error("Failed to fetch recovery items", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecoveries();
    }, []);

    const openTransferModal = async (item) => {
        setTransferringId(item.id);
        setLoadingSuggestions(true);
        setSelectedTargetId(null);
        setTransferStatus({ loading: false, error: null });
        try {
            const res = await API.get(`/marketplace-inventory/${item.id}/suggestions`);
            setSuggestions(res.data || []);
            if (res.data && res.data.length > 0) {
                if (res.data[0].score > 0.8) {
                    setSelectedTargetId(res.data[0].id);
                }
            }
        } catch (err) {
            console.error("Failed to fetch suggestions", err);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleTransfer = async () => {
        if (!transferringId) return;
        setTransferStatus({ loading: true, error: null });
        try {
            await API.post(`/marketplace-inventory/${transferringId}/transfer`, {
                inventory_id: selectedTargetId
            });
            addToast("Asset successfully integrated into stock! 📦", "success");
            setTransferringId(null);
            fetchRecoveries();
        } catch (err) {
            setTransferStatus({ 
                loading: false, 
                error: err.response?.data?.detail || "Transfer protocol breach. Please retry." 
            });
            addToast("Failed to sort inventory asset", "error");
        }
    };

    const selectedItem = items.find(i => i.id === transferringId);

    const skeletonLayout = [
        { type: 'stack', gap: 6, items: Array(6).fill({ type: 'rect', height: 200, className: "rounded-[2.5rem]" }) }
    ];

    return (
        <div className="space-y-8 selection:bg-primary/10 animate-fadeIn">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Post-Mission Logistics</p>
                    <h1 className="text-4xl font-outfit font-black text-on_surface tracking-tight">Recovery Hub</h1>
                    <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Sorting assets collected from marketplace theaters onto verified stock.</p>
                </div>
                <div className="flex gap-4">
                    <MetricCard label="Pending Sorting" value={items.length} icon="inventory_2" variant="primary" />
                </div>
            </div>

            {loading ? (
                <SkeletonStructure layout={skeletonLayout} />
            ) : items.length === 0 ? (
                <div className="text-center py-40 bg-surface_high/30 rounded-[3.5rem] border-2 border-dashed border-white/20">
                    <span className="material-symbols-outlined text-6xl opacity-10 mb-4">move_to_inbox</span>
                    <p className="text-sm font-bold opacity-30 uppercase tracking-widest">Registry Clear: No new recoveries detected</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {items.map((item, i) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="group bg-white/60 backdrop-blur-md p-10 rounded-[3.5rem] border border-on_surface/5 hover:bg-white hover:border-primary/20 hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-16 h-16 bg-surface_high group-hover:bg-primaryGradient group-hover:text-white rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-sm">
                                        <span className="material-symbols-outlined text-3xl">package_2</span>
                                    </div>
                                    <span className="px-4 py-1.5 bg-surface_highest text-[9px] font-black uppercase tracking-widest rounded-full border border-on_surface/5 opacity-50 group-hover:opacity-100 transition-opacity">
                                        REC #{item.id}
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl font-outfit font-black text-on_surface mb-1 group-hover:text-primary transition-colors tracking-tight">{item.item_name}</h3>
                                <p className="text-sm font-black text-primary mb-6">{item.quantity} {item.unit}</p>
                                
                                <div className="space-y-2 mb-10 opacity-60">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Collected {new Date(item.collected_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openTransferModal(item)}
                                    className="w-full py-5 bg-on_surface text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl group-hover:bg-primary transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
                                >
                                    <span className="material-symbols-outlined text-lg">swap_horiz</span>
                                    Sort into Main Stock
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Transfer Modal */}
            <AnimatePresence>
                {transferringId && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-on_surface/20 backdrop-blur-xl"
                            onClick={() => !transferStatus.loading && setTransferringId(null)}
                        />
                        <motion.div
                            initial={{ y: 100, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 100, opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl overflow-hidden p-12"
                        >
                            <div className="flex items-center gap-4 mb-2">
                                <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                                <h2 className="text-3xl font-outfit font-black tracking-tight">Intelligence Sorting</h2>
                            </div>
                            <p className="text-sm font-bold text-on_surface_variant/60 mb-10 ml-1">Define merge parameters for "{selectedItem?.item_name}" into tactical inventory.</p>

                            <div className="space-y-10">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 block ml-1">Smart Merge Suggestions</label>
                                    {loadingSuggestions ? (
                                        <div className="space-y-3">
                                            <SkeletonStructure layout={[{type: 'stack', gap: 3, items: Array(2).fill({type: 'rect', height: 80, className: "rounded-3xl"})}]} />
                                        </div>
                                    ) : suggestions.length === 0 ? (
                                        <div className="p-10 bg-surface_high/30 rounded-[2.5rem] text-center border-2 border-dashed border-on_surface/5">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">No similar identifiers in current stock registry</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                            {suggestions.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setSelectedTargetId(s.id)}
                                                    className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 ${
                                                        selectedTargetId === s.id
                                                            ? "border-primary bg-primary/5 shadow-xl ring-2 ring-primary/20"
                                                            : "border-on_surface/5 bg-white hover:border-primary/40"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedTargetId === s.id ? 'bg-primary text-white' : 'bg-surface_high text-on_surface_variant/40'}`}>
                                                            <span className="material-symbols-outlined">inventory_2</span>
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="text-sm font-black text-on_surface uppercase">{s.item_name}</div>
                                                            <div className="text-[10px] font-bold text-primary tracking-widest">Similarity Probability: {Math.round(s.score * 100)}%</div>
                                                        </div>
                                                    </div>
                                                    {selectedTargetId === s.id && <span className="material-symbols-outlined text-primary font-black">check_circle</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setSelectedTargetId(null)}
                                    className={`w-full flex items-center gap-5 p-6 rounded-3xl border transition-all duration-300 ${
                                        selectedTargetId === null
                                            ? "border-primary bg-primary/5 shadow-xl ring-2 ring-primary/20"
                                            : "border-on_surface/5 bg-white hover:border-primary/40"
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedTargetId === null ? 'bg-primary text-white' : 'bg-surface_high text-on_surface_variant/40'}`}>
                                        <span className="material-symbols-outlined">add_box</span>
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="text-sm font-black text-on_surface uppercase">Tactical Deployment as New Product</div>
                                        <div className="text-[10px] font-bold text-on_surface_variant/40 tracking-widest">Initialize separate registry entry for this asset</div>
                                    </div>
                                    {selectedTargetId === null && <span className="material-symbols-outlined text-primary font-black">check_circle</span>}
                                </button>

                                {transferStatus.error && (
                                    <div className="p-5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-3xl border border-red-100 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-sm font-black">error</span>
                                        Protocol Breach: {transferStatus.error}
                                    </div>
                                )}

                                <div className="flex gap-6 pt-6">
                                    <button
                                        disabled={transferStatus.loading}
                                        onClick={() => setTransferringId(null)}
                                        className="flex-1 py-5 bg-surface_high text-on_surface text-[10px] font-black uppercase tracking-widest rounded-[2rem] hover:bg-on_surface hover:text-white transition-all"
                                    >
                                        Abort Sort
                                    </button>
                                    <button
                                        disabled={transferStatus.loading}
                                        onClick={handleTransfer}
                                        className="flex-1 py-5 bg-on_surface text-white text-[10px] font-black uppercase tracking-widest rounded-[2rem] hover:shadow-2xl shadow-on_surface/20 transition-all flex items-center justify-center gap-3 hover:bg-primary"
                                    >
                                        {transferStatus.loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-lg">check</span>
                                                Authorize Stock Integration
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MarketplaceInventory;
