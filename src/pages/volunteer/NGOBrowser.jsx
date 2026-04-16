import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const NGOBrowser = () => {
    const [organizations, setOrganizations] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchData = async () => {
        try {
            const [orgsRes, requestsRes] = await Promise.all([
                API.get("/organizations/public"),
                API.get("/volunteers/join-requests/my")
            ]);
            setOrganizations(orgsRes.data || []);
            setMyRequests(requestsRes.data || []);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const hasActiveEngagement = myRequests.some(r => r.status === "PENDING" || r.status === "APPROVED");
    const myCurrentNGO = myRequests.find(r => r.status === "APPROVED");

    const handleApply = async (orgId) => {
        try {
            setActionLoading(orgId);
            const res = await API.post("/volunteers/join-requests/", { org_id: orgId });
            setMyRequests([...myRequests, res.data]);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (requestId) => {
        try {
            setActionLoading(`cancel-${requestId}`);
            await API.delete(`/volunteers/join-requests/${requestId}`);
            setMyRequests(myRequests.filter(r => r.id !== requestId));
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleLeave = async () => {
        if (!confirm("Confirm resignation from organization? Tactical re-deployment will require new authorization.")) return;
        try {
            setActionLoading("leave");
            await API.post("/volunteers/join-requests/leave");
            setMyRequests(myRequests.filter(r => r.status !== "APPROVED"));
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const getOrgRequest = (orgId) => {
        return myRequests.find(r => r.org_id === orgId);
    };

    const skeletonLayout = [
        { type: 'stack', gap: 4, items: Array(6).fill({ type: 'rect', height: 280, className: "rounded-[2.5rem]" }) }
    ];

    return (
        <div className="space-y-8 selection:bg-primary/10 animate-fadeIn p-4 md:p-8">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Network Discovery</p>
                    <h1 className="text-4xl font-outfit font-black text-on_surface tracking-tight">Browse Organizations</h1>
                    <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Identify and join high-impact tactical units in your sector.</p>
                </div>
                <div className="flex gap-4">
                    <MetricCard label="Active NGOs" value={organizations.length} icon="public" />
                    <MetricCard label="Engagements" value={myRequests.length} icon="handshake" />
                </div>
            </div>

            {/* ACTIVE MEMBERSHIP BANNER */}
            {myCurrentNGO && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border-2 border-primary/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/5"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primaryGradient rounded-3xl flex items-center justify-center text-white shadow-xl">
                            <span className="material-symbols-outlined text-3xl font-black">verified_user</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Tactical Membership Confirmed</p>
                            <h3 className="text-2xl font-outfit font-black text-on_surface tracking-tight">Official Personnel at {myCurrentNGO.org_name}</h3>
                        </div>
                    </div>
                    <button 
                        onClick={handleLeave}
                        disabled={actionLoading === "leave"}
                        className="px-10 py-4 bg-white text-on_surface text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-on_surface hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50"
                    >
                        {actionLoading === "leave" ? "Processing..." : "Resign Commission"}
                    </button>
                </motion.div>
            )}

            {/* GRID CONTENT */}
            <div>
                {loading ? (
                    <SkeletonStructure layout={skeletonLayout} />
                ) : organizations.length === 0 ? (
                    <div className="text-center py-40 bg-surface_high/30 rounded-[3.5rem] border-2 border-dashed border-white/20">
                        <span className="material-symbols-outlined text-6xl opacity-10 mb-4">public_off</span>
                        <p className="text-sm font-bold opacity-30 uppercase tracking-widest">No active organizations detected in this sector</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {organizations.map((org, i) => {
                                const request = getOrgRequest(org.id);
                                const isMember = myCurrentNGO && myCurrentNGO.org_id === org.id;
                                
                                return (
                                    <motion.div
                                        key={org.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`group bg-white/60 backdrop-blur-md p-10 rounded-[3.5rem] border transition-all duration-500 flex flex-col justify-between ${
                                            isMember ? "border-primary/40 ring-4 ring-primary/5 bg-white/80" : "border-on_surface/5 hover:bg-white hover:border-primary/20 hover:shadow-2xl"
                                        }`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="w-16 h-16 bg-surface_high group-hover:bg-primaryGradient group-hover:text-white rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-sm">
                                                    <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
                                                </div>
                                                {request?.status === "PENDING" && (
                                                    <span className="px-4 py-1.5 bg-yellow-500/10 text-yellow-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-yellow-500/20">Authorization Pending</span>
                                                )}
                                                {isMember && (
                                                    <span className="px-4 py-1.5 bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-500/20">Active Unit</span>
                                                )}
                                            </div>

                                            <h3 className="font-outfit font-black text-2xl text-on_surface mb-4 tracking-tight group-hover:text-primary transition-colors">{org.name}</h3>
                                            <p className="text-xs font-bold text-on_surface_variant/60 leading-relaxed line-clamp-4 mb-8">
                                                {org.about || "This organization operates at the intersection of community impact and tactical efficiency. Join their ranks to begin high-level field operations."}
                                            </p>

                                            {org.website_url && (
                                                <a href={org.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                                    <span className="material-symbols-outlined text-sm">public</span>
                                                    Operational Intelligence
                                                </a>
                                            )}
                                        </div>

                                        <div className="mt-12">
                                            {request?.status === "PENDING" ? (
                                                <button 
                                                    onClick={() => handleCancel(request.id)}
                                                    disabled={actionLoading === `cancel-${request.id}`}
                                                    className="w-full py-4 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-red-500/5 hover:bg-red-500/10 transition-all border border-dashed border-red-500/20"
                                                >
                                                    {actionLoading === `cancel-${request.id}` ? "Aborting..." : "Revoke Request"}
                                                </button>
                                            ) : isMember ? (
                                                <div className="py-4 text-center bg-green-500/10 rounded-2xl border border-green-500/20">
                                                    <span className="text-green-600 font-black tracking-widest text-[10px] uppercase">Identity Verified</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleApply(org.id)}
                                                    disabled={actionLoading === org.id || hasActiveEngagement}
                                                    className={`w-full py-5 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 ${
                                                        hasActiveEngagement 
                                                            ? "bg-surface_high text-on_surface_variant/40 cursor-not-allowed" 
                                                            : "bg-on_surface text-white group-hover:bg-primaryGradient hover:-translate-y-1"
                                                    }`}
                                                >
                                                    {actionLoading === org.id ? "Integrating..." : "Join Tactics Unit"}
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NGOBrowser;
