import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../services/api";
import { useToast } from "../../../context/ToastContext";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";
import DataRow from "../../../components/shared/DataRow";

const StaffControlPage = () => {
    const [org, setOrg] = useState(null);
    const [coordinators, setCoordinators] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showAdd, setShowAdd] = useState(false);
    const [newMember, setNewMember] = useState({ full_name: "", email: "", password: "" });
    const [adding, setAdding] = useState(false);

    const { addToast } = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const [orgRes, usersRes] = await Promise.all([
                    API.get("/organizations/me").catch(() => ({ data: null })),
                    API.get("/users/").catch(() => ({ data: [] }))
                ]);
                
                setOrg(orgRes.data);
                if (usersRes.data) {
                    setCoordinators(usersRes.data.filter(u => u.role === "NGO_COORDINATOR"));
                }
            } catch (err) {
                console.error("Staff load failed", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setAdding(true);
        try {
            await API.post("/ngo-admin/coordinators", newMember);
            addToast(`Personnel credential authorized for ${newMember.full_name}.`, "success");
            setShowAdd(false);
            setNewMember({ full_name: "", email: "", password: "" });
            
            const usersRes = await API.get("/users/");
            setCoordinators(usersRes.data.filter(u => u.role === "NGO_COORDINATOR"));
        } catch (err) {
            addToast(err.response?.data?.detail || "Credential authorization failed", "error");
        } finally {
            setAdding(false);
        }
    };

    if (loading) return <SkeletonStructure layout={[{type: 'rect', height: 400, className: "rounded-[3rem]"}]} />;

    const isLocked = org?.status !== 'APPROVED';

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black text-on_surface tracking-tight">Manage Your Team</h1>
                    <p className="text-on_surface_variant max-w-lg font-medium leading-relaxed">
                        Add and manage coordinators who can manage campaigns and field work.
                    </p>
                </div>

                {!isLocked && (
                    <button 
                        onClick={() => setShowAdd(true)}
                        className="px-6 py-3.5 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Add Coordinator
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {isLocked && (
                    <div className="p-12 rounded-[2.5rem] bg-amber-500/5 border border-dashed border-amber-500/20 text-center space-y-3">
                        <span className="material-symbols-outlined text-4xl text-amber-600 animate-pulse">lock</span>
                        <h3 className="text-lg font-bold text-on_surface">Verification Required</h3>
                        <p className="text-xs text-on_surface_variant max-w-sm mx-auto font-medium">
                            You can add coordinators once your organization has been verified by our admin team.
                        </p>
                    </div>
                )}

                {!isLocked && coordinators.length === 0 && (
                    <div className="py-24 text-center space-y-4 bg-white rounded-3xl border border-on_surface/5 shadow-inner">
                        <span className="material-symbols-outlined text-5xl text-on_surface_variant opacity-20">groups</span>
                        <div className="space-y-1">
                            <p className="text-lg font-bold text-on_surface">No coordinators found</p>
                            <p className="text-xs text-on_surface_variant font-medium">Click "Add Coordinator" to invite your first team member.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coordinators.map(c => (
                        <motion.div 
                            key={c.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 rounded-3xl bg-white border border-on_surface/5 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-xl bg-on_surface/5 flex items-center justify-center text-on_surface/20 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-2xl">person</span>
                                </div>
                                <div className="px-2 py-1 bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-lg">Active Member</div>
                            </div>
                            <h4 className="text-base font-bold text-on_surface truncate">{c.full_name}</h4>
                            <p className="text-[11px] text-on_surface_variant font-medium opacity-60 truncate">{c.email}</p>
                            <div className="mt-6 pt-6 border-t border-on_surface/5 flex justify-between items-center">
                                <span className="text-[9px] font-black text-on_surface_variant/40 uppercase tracking-widest">Coordinator</span>
                                <button className="text-red-500/40 hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ADD MEMBER MODAL (PORTAL) */}
            {createPortal(
                <AnimatePresence>
                    {showAdd && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAdd(false)}
                                className="absolute inset-0 bg-on_surface/80 backdrop-blur-2xl"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] custom-scrollbar"
                            >
                                <div className="absolute top-0 left-0 w-full h-32 bg-primaryGradient opacity-10 blur-3xl -z-10" />
                                
                                <button 
                                    onClick={() => setShowAdd(false)}
                                    className="absolute top-8 right-8 w-11 h-11 rounded-full bg-surface_high flex items-center justify-center text-on_surface_variant hover:bg-white hover:text-red-500 hover:shadow-lg transition-all z-10 group active:scale-90"
                                >
                                    <span className="material-symbols-outlined text-[24px] group-hover:rotate-90 transition-transform duration-300">close</span>
                                </button>

                                <div className="p-8 md:p-10">
                                    <header className="mb-10">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-primaryGradient text-white mb-8 shadow-lg shadow-primary/20">
                                            <span className="material-symbols-outlined text-4xl">add_moderator</span>
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-black text-on_surface tracking-tight leading-tight">Authorize Team</h2>
                                        <p className="text-on_surface_variant mt-3 text-sm font-medium opacity-60 leading-relaxed">
                                            Empower a new coordinator with mission management clearance and operational tools.
                                        </p>
                                    </header>

                                    <form onSubmit={handleAdd} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-4">Full Identity Name</label>
                                            <div className="relative group">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-on_surface_variant/30 group-focus-within:text-primary transition-colors">person</span>
                                                <input 
                                                    required
                                                    className="w-full pl-14 pr-6 py-5 bg-surface_high text-sm font-bold border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-[12px] focus:ring-primary/5 transition-all rounded-[1.5rem] outline-none"
                                                    value={newMember.full_name}
                                                    onChange={e => setNewMember({...newMember, full_name: e.target.value})}
                                                    placeholder="e.g. Rajesh Kumar"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-4">Institutional Email</label>
                                            <div className="relative group">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-on_surface_variant/30 group-focus-within:text-primary transition-colors">encrypted</span>
                                                <input 
                                                    required
                                                    type="email"
                                                    className="w-full pl-14 pr-6 py-5 bg-surface_high text-sm font-bold border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-[12px] focus:ring-primary/5 transition-all rounded-[1.5rem] outline-none"
                                                    value={newMember.email}
                                                    onChange={e => setNewMember({...newMember, email: e.target.value})}
                                                    placeholder="email@organization.org"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-4">Secure Password</label>
                                            <div className="relative group">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-on_surface_variant/30 group-focus-within:text-primary transition-colors">fingerprint</span>
                                                <input 
                                                    required
                                                    type="password"
                                                    className="w-full pl-14 pr-6 py-5 bg-surface_high text-sm font-bold border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-[12px] focus:ring-primary/5 transition-all rounded-[1.5rem] outline-none"
                                                    value={newMember.password}
                                                    onChange={e => setNewMember({...newMember, password: e.target.value})}
                                                    placeholder="Temporary security key"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-8">
                                            <button 
                                                disabled={adding}
                                                type="submit"
                                                className="w-full py-5.5 bg-primaryGradient text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-[1.5rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                            >
                                                {adding ? (
                                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        Authorize Credentials
                                                        <span className="material-symbols-outlined text-xl">verified</span>
                                                    </>
                                                )}
                                            </button>
                                            <div className="flex items-center justify-center gap-2 mt-6">
                                                <span className="material-symbols-outlined text-amber-500 text-sm">security</span>
                                                <p className="text-[9px] text-on_surface_variant/40 font-bold uppercase tracking-widest">
                                                    Granting Tier-2 Operational Clearance
                                                </p>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default StaffControlPage;
