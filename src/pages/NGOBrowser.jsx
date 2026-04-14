import { useState, useEffect } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "../components/Skeleton";

const NGOBrowser = () => {
    const [organizations, setOrganizations] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

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
            setTimeout(() => setLoading(false), 800);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const hasActiveEngagement = myRequests.some(r => r.status === "PENDING" || r.status === "APPROVED");
    const myCurrentNGO = myRequests.find(r => r.status === "APPROVED");

    const handleApply = async (orgId) => {
        try {
            setActionLoading(true);
            const res = await API.post("/volunteers/join-requests/", { org_id: orgId });
            setMyRequests([...myRequests, res.data]);
            alert("Join request sent successfully!");
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to send request");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async (requestId) => {
        if (!confirm("Are you sure you want to cancel this request?")) return;
        try {
            setActionLoading(true);
            await API.delete(`/volunteers/join-requests/${requestId}`);
            setMyRequests(myRequests.filter(r => r.id !== requestId));
            alert("Request cancelled.");
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to cancel request");
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeave = async () => {
        if (!confirm("Are you sure you want to leave this organization? You will need to apply again to re-join.")) return;
        try {
            setActionLoading(true);
            await API.post("/volunteers/join-requests/leave");
            setMyRequests(myRequests.filter(r => r.status !== "APPROVED"));
            alert("You have left the organization.");
            // Refresh to ensure all states are synced
            fetchData();
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to leave NGO");
        } finally {
            setActionLoading(false);
        }
    };

    const getOrgRequest = (orgId) => {
        return myRequests.find(r => r.org_id === orgId);
    };

    if (loading) {
        return (
            <div className="space-y-8 p-4 md:p-8">
                <header className="max-w-4xl space-y-4">
                    <Skeleton className="h-10 w-64" variant="text" />
                    <Skeleton className="h-4 w-96" variant="text" />
                </header>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-surface_lowest p-8 rounded-[2rem] shadow-soft border border-white space-y-6">
                            <div className="flex justify-between items-center">
                                <Skeleton className="w-14 h-14" variant="circle" />
                                <Skeleton className="w-24 h-6 rounded-full" />
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-3/4" variant="text" />
                                <Skeleton className="h-4 w-full" variant="text" />
                                <Skeleton className="h-4 w-5/6" variant="text" />
                            </div>
                            <Skeleton className="h-12 w-full rounded-2xl" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 md:p-8">
            <header className="max-w-4xl">
                <h1 className="text-4xl font-outfit font-extrabold text-on_surface tracking-tight">Browse Organizations</h1>
                <p className="text-on_surface_variant mt-3 text-lg">
                    {myCurrentNGO 
                        ? `You are currently a proud member of ${myCurrentNGO.org_name}.` 
                        : "Find an NGO that matches your skills and passions to start making an impact."}
                </p>
            </header>

            {myCurrentNGO && (
                <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in shadow-soft">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <span className="material-symbols-outlined text-3xl">verified_user</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-primary">Active Membership</h3>
                            <p className="text-on_surface_variant">Official volunteer at <strong>{myCurrentNGO.org_name}</strong></p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLeave}
                        disabled={actionLoading}
                        className="px-8 py-3 bg-white text-error border border-error/30 font-bold rounded-xl hover:bg-error hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        {actionLoading ? "Processing..." : "Leave NGO"}
                    </button>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {organizations.map((org, index) => {
                        const request = getOrgRequest(org.id);
                        const isPrimaryNGO = myCurrentNGO && myCurrentNGO.org_id === org.id;
                        
                        return (
                            <motion.div
                                key={org.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className={`
                                    bg-surface_lowest p-8 rounded-3xl shadow-soft border  transition-all duration-300
                                    ${isPrimaryNGO ? "border-primary/40 ring-4 ring-primary/5" : "border-white hover:border-primary/20 hover:shadow-xl"}
                                    flex flex-col justify-between relative overflow-hidden group
                                `}
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 bg-surface_high group-hover:bg-primary/10 rounded-2xl flex items-center justify-center transition-colors">
                                            <span className="material-symbols-outlined text-primary text-2xl">volunteer_activism</span>
                                        </div>
                                        {request?.status === "PENDING" && (
                                            <span className="px-3 py-1 bg-warning/10 text-warning text-xs font-bold rounded-full border border-warning/20">
                                                Pending Waitlist
                                            </span>
                                        )}
                                        {isPrimaryNGO && (
                                            <span className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full border border-success/20">
                                                My Organization
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-outfit font-extrabold text-xl text-on_surface mb-3 group-hover:text-primary transition-colors">{org.name}</h3>
                                        <p className="text-sm text-on_surface_variant leading-relaxed line-clamp-4">
                                            {org.about || "Join us in our journey to create sustainable impact. This organization is dedicated to community service and field-level support."}
                                        </p>
                                    </div>

                                    {org.website_url && (
                                        <a 
                                            href={org.website_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-xs font-bold text-primary_high hover:underline"
                                        >
                                            <span className="material-symbols-outlined text-sm">public</span>
                                            Official Domain
                                        </a>
                                    )}
                                </div>

                                <div className="mt-10">
                                    {request?.status === "PENDING" ? (
                                        <button 
                                            onClick={() => handleCancel(request.id)}
                                            disabled={actionLoading}
                                            className="w-full py-4 bg-error/5 text-error font-bold rounded-2xl hover:bg-error/10 transition-all border border-dashed border-error/30"
                                        >
                                            {actionLoading ? "Processing..." : "Cancel Request"}
                                        </button>
                                    ) : isPrimaryNGO ? (
                                        <div className="py-4 text-center cursor-default bg-success/5 rounded-2xl border border-success/20">
                                            <span className="text-success font-black tracking-widest text-xs uppercase">Official Member</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleApply(org.id)}
                                            disabled={actionLoading || hasActiveEngagement}
                                            className={`
                                                w-full py-4 font-bold rounded-2xl shadow-soft transition-all active:scale-95
                                                ${hasActiveEngagement 
                                                    ? "bg-surface_high text-on_surface_variant cursor-not-allowed grayscale" 
                                                    : "bg-primaryGradient text-white hover:shadow-lg hover:scale-[1.02]"}
                                            `}
                                        >
                                            {actionLoading ? "Connecting..." : "Join Team"}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
            
            {organizations.length === 0 && (
                <div className="text-center py-32 bg-surface_lowest rounded-[40px] border border-dashed border-primary/20">
                    <div className="w-24 h-24 bg-surface_high rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-5xl text-gray-300">public_off</span>
                    </div>
                    <h3 className="text-xl font-bold text-on_surface">No Organizations Active</h3>
                    <p className="text-on_surface_variant mt-2">Check back later or invite an NGO to join the platform.</p>
                </div>
            )}
        </div>
    );
};

export default NGOBrowser;
