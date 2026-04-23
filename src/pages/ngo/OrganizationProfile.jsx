import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import VerificationBadge from "../../components/shared/VerificationBadge";
import { useToast } from "../../context/ToastContext";
import { resolveProfileImage } from "../../utils/imageUtils";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import ActionInput from "../../components/shared/ActionInput";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const OrganizationProfile = () => {
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ about: "", website_url: "" });
    const { addToast } = useToast();
    const [saving, setSaving] = useState(false);

    const uploadLogo = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await API.post("/organizations/me/logo", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setOrg({ ...org, logo_url: res.data.logo_url });
            addToast("Logo updated successfully!", "success");
        } catch (err) {
            addToast("Failed to upload logo", "error");
        }
    };

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                setLoading(true);
                const res = await API.get("/organizations/me");
                setOrg(res.data);
                setEditData({
                    about: res.data.about || "",
                    website_url: res.data.website_url || "",
                    ngo_type: res.data.ngo_type || "TRUST",
                    office_address: res.data.office_address || "",
                    contact_phone: res.data.contact_phone || ""
                });
            } catch (err) {
                console.error("Failed to load org profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrg();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await API.patch("/organizations/me", editData);
            setOrg(res.data);
            setIsEditing(false);
            addToast("Proflie updated successfully!", "success");
        } catch (err) {
            addToast("Failed to save changes", "error");
        } finally {
            setSaving(false);
        }
    };

    const skeletonLayout = [
        { type: 'rect', height: 220, className: "rounded-[3rem] mb-8" },
        { type: 'row', cols: [
            { type: 'stack', width: '66%', gap: 4, items: [{ type: 'rect', height: 400, className: "rounded-[3rem]" }] },
            { type: 'stack', width: '33%', gap: 4, items: [
                { type: 'rect', height: 250, className: "rounded-[2.5rem]" },
                { type: 'rect', height: 120, className: "rounded-[2.5rem]" }
            ]}
        ]}
    ];

    if (loading) return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <SkeletonStructure layout={skeletonLayout} />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 pb-32 selection:bg-primary/10 animate-fadeIn">
            {/* HERO BRANDING */}
            <div className="relative overflow-hidden rounded-[4rem] bg-surface_high border border-white p-10 md:p-14 shadow-2xl flex flex-col md:flex-row items-center gap-10">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primaryGradient opacity-5 blur-[100px] -mr-32" />
                
                {/* LOGO UPLOAD SECTION */}
                <div className="group relative">
                    <div 
                        onClick={() => document.getElementById("logo-upload").click()}
                        className="w-40 h-40 rounded-[3rem] bg-white flex items-center justify-center shadow-2xl border-4 border-white overflow-hidden relative cursor-pointer ring-4 ring-primary/5 group-hover:ring-primary/20 transition-all duration-500"
                    >
                        {org?.logo_url ? (
                            <img src={resolveProfileImage(org.logo_url)} alt="logo" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-primary text-[80px] font-black">corporate_fare</span>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-primary/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <span className="material-symbols-outlined text-3xl mb-1">add_a_photo</span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-center px-4">Change Profile Picture</p>
                        </div>
                    </div>
                    <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={(e) => uploadLogo(e.target.files[0])} />
                    
                    {/* Status Pip */}
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-xl">verified</span>
                    </div>
                </div>

                <div className="text-center md:text-left flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row items-center md:items-baseline gap-4">
                        <h1 className="text-4xl md:text-5xl font-outfit font-black text-on_surface tracking-tight leading-none">
                            {org?.name}
                        </h1>
                        <VerificationBadge status={org?.status} />
                    </div>
                    <p className="text-sm font-bold text-on_surface_variant/60 max-w-xl">
                        Official organization profile. Keep your information updated to maintain trust with volunteers.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-on_surface text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all active:scale-95 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">edit_note</span>
                            Edit Public Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                             <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-primaryGradient text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 flex items-center gap-2"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button 
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditData({
                                        about: org.about || "",
                                        website_url: org.website_url || "",
                                        ngo_type: org.ngo_type || "TRUST",
                                        office_address: org.office_address || "",
                                        contact_phone: org.contact_phone || ""
                                    });
                                }}
                                className="bg-surface_high text-error px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-error/10"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-12 lg:col-span-8 space-y-10">
                    <ContentSection title="Public Information" icon="public" noPadding>
                        <div className="p-10 space-y-12">
                            {/* Mission / Bio */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Mission Statement & About</p>
                                {isEditing ? (
                                    <textarea
                                        value={editData.about}
                                        onChange={(e) => setEditData({...editData, about: e.target.value})}
                                        className="w-full min-h-[160px] p-6 bg-surface_high border-2 border-transparent focus:border-primary/20 rounded-[2.5rem] text-sm font-medium outline-none transition-all shadow-inner"
                                        placeholder="Describe your organization's mission and impact..."
                                    />
                                ) : (
                                    <p className="text-lg font-bold text-on_surface_variant leading-relaxed">
                                        {org?.about || "Enter your organization's mission to help volunteers understand your cause."}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-on_surface/5">
                                {/* Website */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40">Website</p>
                                    {isEditing ? (
                                        <ActionInput 
                                            placeholder="https://yourwebsite.org" 
                                            value={editData.website_url} 
                                            onChange={(val) => setEditData({...editData, website_url: val})} 
                                        />
                                    ) : (
                                        <a href={org?.website_url} target="_blank" rel="noreferrer" className="text-sm font-black text-primary hover:underline flex items-center gap-2">
                                            <span className="material-symbols-outlined text-xs">link</span>
                                            {org?.website_url || "Not listed"}
                                        </a>
                                    )}
                                </div>

                                {/* NGO Type */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40">Organization Category</p>
                                    {isEditing ? (
                                        <select 
                                            value={editData.ngo_type}
                                            onChange={(e) => setEditData({...editData, ngo_type: e.target.value})}
                                            className="w-full p-4 bg-surface_high border-2 border-transparent focus:border-primary/20 rounded-2xl text-sm font-bold outline-none"
                                        >
                                            <option value="TRUST">Trust</option>
                                            <option value="SOCIETY">Society</option>
                                            <option value="SECTION_8">Section 8 Company</option>
                                        </select>
                                    ) : (
                                        <p className="text-sm font-black text-on_surface uppercase">{org?.ngo_type || "N/A"}</p>
                                    )}
                                </div>

                                {/* Office Address */}
                                <div className="space-y-4 md:col-span-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40">Registered Office Address</p>
                                    {isEditing ? (
                                        <input 
                                            type="text"
                                            value={editData.office_address}
                                            onChange={(e) => setEditData({...editData, office_address: e.target.value})}
                                            className="w-full p-4 bg-surface_high border-2 border-transparent focus:border-primary/20 rounded-2xl text-sm font-bold outline-none"
                                            placeholder="Enter complete office address"
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-on_surface leading-relaxed">
                                            {org?.office_address || "No address provided"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ContentSection>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-10">
                    {/* PRIVATE RECORDS (Read Only except phone maybe) */}
                    <ContentSection title="Administrative Records" icon="shield_lock">
                        <div className="space-y-8">
                             {/* Phone */}
                             <div className="space-y-3 p-4 bg-white/40 rounded-3xl border border-white/60">
                                <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40">Public Contact Line</p>
                                {isEditing ? (
                                    <input 
                                        type="tel"
                                        value={editData.contact_phone}
                                        onChange={(e) => setEditData({...editData, contact_phone: e.target.value})}
                                        className="w-full p-2 bg-transparent border-b-2 border-primary/20 text-sm font-black outline-none"
                                    />
                                ) : (
                                    <p className="text-sm font-black text-on_surface">{org?.contact_phone}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1 px-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40">Registration Email</p>
                                <p className="text-sm font-bold text-on_surface/60 italic">{org?.contact_email}</p>
                                <p className="text-[8px] font-bold text-error/40 uppercase">Locked Contact Identifier</p>
                            </div>

                            {/* Reg Num */}
                            <div className="space-y-1 px-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40">NGO Registration Num</p>
                                <p className="text-sm font-bold text-on_surface/60">{org?.registration_number || "Awaiting Verification"}</p>
                            </div>

                             {/* pan */}
                             <div className="space-y-1 px-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40">PAN Identifier</p>
                                <p className="text-sm font-bold text-on_surface/60">{org?.pan_number || "Sensitive Data"}</p>
                            </div>
                        </div>
                    </ContentSection>

                    {/* STATUS CARD */}
                    <div className="bg-on_surface rounded-[2.5rem] p-10 text-white text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primaryGradient opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-2">Registry Token</p>
                        <h4 className="text-4xl font-outfit font-black italic tracking-tighter uppercase mb-6">UNIT-V2</h4>
                        <div className="inline-block px-6 py-2.5 bg-white/5 rounded-2xl text-[10px] font-black tracking-widest border border-white/10">
                            ID: {String(org?.id || 0).padStart(5, '0')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationProfile;
