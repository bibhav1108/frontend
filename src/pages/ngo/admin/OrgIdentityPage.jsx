import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../services/api";
import { useToast } from "../../../context/ToastContext";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";
import ActionInput from "../../../components/shared/ActionInput";

const STEPS = {
    BASIC: 1,
    LEGAL: 2,
    ADMIN: 3,
    MANDATORY_DOCS: 4,
    OPTIONAL_DOCS: 5,
    REVIEW: 6
};

const OrgIdentityPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(STEPS.BASIC);
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        ngo_type: "TRUST",
        registration_number: "",
        pan_number: "",
        ngo_darpan_id: "",
        office_address: "",
        about: "",
        website_url: "",
        admin_phone: "",
        id_proof_type: "AADHAAR",
        id_proof_number: ""
    });

    const [documents, setDocuments] = useState([]); // [{type, name, file, url, isMandatory}]

    useEffect(() => {
        fetchOrg();
    }, []);

    const fetchOrg = async () => {
        try {
            const res = await API.get("/organizations/me");
            setOrg(res.data);
            if (res.data.status === "DRAFT" || res.data.status === "REJECTED") {
                setIsOnboarding(true);
                // Pre-fill if some data exists
                setFormData(prev => ({
                    ...prev,
                    name: res.data.name || "",
                    phone: res.data.contact_phone || "",
                    email: res.data.contact_email || "",
                    about: res.data.about || "",
                    website_url: res.data.website_url || ""
                }));
            } else {
                setIsOnboarding(false);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setIsOnboarding(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, docType, isMandatory = true) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("document_type", docType);
        uploadData.append("is_mandatory", isMandatory);

        setSaving(true);
        try {
            const res = await API.post("/ngo-admin/documents/upload", uploadData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            addToast(`${docType} uploaded successfully`, "success");
            setDocuments(prev => [...prev.filter(d => d.type !== docType), {
                type: docType,
                name: file.name,
                url: res.data.url,
                isMandatory
            }]);
        } catch (err) {
            addToast("Upload failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const saveOnboardingDraft = async (quiet = false) => {
        if (!formData.name || !formData.phone || !formData.email) {
            if (!quiet) addToast("Please fill basic NGO details", "error");
            return false;
        }

        if (!quiet) setSaving(true);
        try {
            const res = await API.post("/ngo-admin/onboard", {
                org_name: formData.name,
                org_phone: formData.phone,
                org_email: formData.email,
                ngo_type: formData.ngo_type,
                registration_number: formData.registration_number,
                pan_number: formData.pan_number,
                ngo_darpan_id: formData.ngo_darpan_id,
                office_address: formData.office_address,
                about: formData.about,
                website_url: formData.website_url,
                admin_phone: formData.admin_phone,
                id_proof_type: formData.id_proof_type,
                id_proof_number: formData.id_proof_number
            });
            
            if (!quiet) addToast("Progress saved", "success");
            
            // Re-fetch to get the new org_id into local state for document uploads
            await fetchOrg();
            return true;
        } catch (err) {
            if (!quiet) addToast(err.response?.data?.detail || "Failed to save draft", "error");
            return false;
        } finally {
            if (!quiet) setSaving(false);
        }
    };

    const handleFinalSubmit = async () => {
        setSaving(true);
        try {
            await API.post("/ngo-admin/submit-verification");
            addToast("Verification request submitted successfully!", "success");
            await fetchOrg();
        } catch (err) {
            addToast(err.response?.data?.detail || "Submission failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleNextStep = async () => {
        // Auto-save when leaving Step 3 to ensure org exists for Step 4 uploads
        if (step === STEPS.ADMIN) {
            const success = await saveOnboardingDraft();
            if (!success) return;
        }
        setStep(step + 1);
    };

    if (loading) return <SkeletonStructure layout={[{type: 'rect', height: 400, className: "rounded-[3rem]"}]} />;

    if (!isOnboarding && org) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-on_surface">Organization Identity</h1>
                    <p className="text-on_surface_variant">Status: <span className="font-bold text-primary">{org.status}</span></p>
                </div>
                
                <div className="p-8 bg-white rounded-3xl border border-on_surface/5 shadow-sm space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <InfoCard label="NGO TYPE" value={org.ngo_type || "N/A"} />
                        <InfoCard label="REGISTRATION #" value={org.registration_number || "N/A"} />
                        <InfoCard label="PAN NUMBER" value={org.pan_number || "N/A"} />
                        <InfoCard label="DARPAN ID" value={org.ngo_darpan_id || "N/A"} />
                    </div>
                    <InfoCard label="OFFICE ADDRESS" value={org.office_address || "N/A"} />
                    <InfoCard label="WEBSITE" value={org.website_url || "N/A"} />
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/50 ml-1">ABOUT THE NGO</span>
                        <div className="bg-surface_high p-6 rounded-2xl font-medium text-sm text-on_surface_variant/80 border border-on_surface/5 shadow-sm italic leading-relaxed">
                            "{org.about || "No description provided."}"
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-on_surface/5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 mb-4">Verification Status</h4>
                        <div className={`p-6 rounded-2xl flex items-center gap-4 ${org.status === 'APPROVED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                            <span className="material-symbols-outlined text-2xl">{org.status === 'APPROVED' ? 'verified' : 'hourglass_empty'}</span>
                            <p className="text-sm font-bold">
                                {org.status === 'APPROVED' 
                                    ? "Your identity record is globally verified." 
                                    : "Verification is in progress. Our team usually reviews documents within 24 hours."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-on_surface tracking-tight">Onboarding Wizard</h1>
                <p className="text-on_surface_variant mt-2 font-medium">Complete these steps to activate your NGO profile</p>
                
                {/* Progress Bar */}
                <div className="mt-8 flex items-center justify-center gap-2">
                    {Object.values(STEPS).map(s => (
                        <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-12 bg-primary' : 'w-4 bg-on_surface/10'}`} />
                    ))}
                </div>
            </div>

            {/* Wizard Content */}
            <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-on_surface/5 shadow-xl relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === STEPS.BASIC && (
                        <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-black text-on_surface mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg font-black">1</span>
                                NGO Fundamentals
                            </h2>
                            <ActionInput label="Organization Legal Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Helping Hands Foundation" />
                            <div className="grid grid-cols-2 gap-6">
                                <ActionInput label="Contact Email" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} placeholder="admin@org.org" />
                                <ActionInput label="Contact Phone" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} placeholder="+91..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-4">NGO Type</label>
                                <select 
                                    className="w-full px-6 py-4 bg-surface_high text-sm font-bold border-2 border-transparent focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none rounded-2xl appearance-none"
                                    value={formData.ngo_type}
                                    onChange={e => setFormData({...formData, ngo_type: e.target.value})}
                                >
                                    <option value="TRUST">Trust</option>
                                    <option value="SOCIETY">Society</option>
                                    <option value="SECTION_8">Section 8 Company</option>
                                </select>
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.LEGAL && (
                        <motion.div key="legal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-black text-on_surface mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg font-black">2</span>
                                Legal Identity
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <ActionInput label="Registration Number" value={formData.registration_number} onChange={v => setFormData({...formData, registration_number: v})} placeholder="REG/..." />
                                <ActionInput label="NGO PAN Number" value={formData.pan_number} onChange={v => setFormData({...formData, pan_number: v})} placeholder="ABCDE1234F" />
                            </div>
                            <ActionInput label="NGO Darpan ID" value={formData.ngo_darpan_id} onChange={v => setFormData({...formData, ngo_darpan_id: v})} placeholder="KA/..." />
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-4">Registered Office Address</label>
                                <textarea 
                                    className="w-full px-6 py-4 bg-surface_high text-sm font-bold border-2 border-transparent focus:border-primary/20 focus:outline-none rounded-2xl min-h-[100px]"
                                    value={formData.office_address}
                                    onChange={e => setFormData({...formData, office_address: e.target.value})}
                                    placeholder="Complete address as per registration docs..."
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.ADMIN && (
                        <motion.div key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-black text-on_surface mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg font-black">3</span>
                                Admin Verification
                            </h2>
                            <ActionInput label="Admin Personal Phone" value={formData.admin_phone} onChange={v => setFormData({...formData, admin_phone: v})} placeholder="+91..." />
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-4">ID Proof Type</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-surface_high text-sm font-bold border-2 border-transparent focus:border-primary/20 outline-none rounded-2xl appearance-none"
                                        value={formData.id_proof_type}
                                        onChange={e => setFormData({...formData, id_proof_type: e.target.value})}
                                    >
                                        <option value="AADHAAR">Aadhaar Card</option>
                                        <option value="PAN">PAN Card</option>
                                        <option value="PASSPORT">Passport</option>
                                        <option value="VOTER_ID">Voter ID</option>
                                    </select>
                                </div>
                                <ActionInput label="ID Proof Number" value={formData.id_proof_number} onChange={v => setFormData({...formData, id_proof_number: v})} placeholder="XXXX-XXXX-XXXX" />
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.MANDATORY_DOCS && (
                        <motion.div key="docs-m" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                             <h2 className="text-2xl font-black text-on_surface mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg font-black">4</span>
                                Mandatory Proofs
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <UploadCard title="Registration Certificate" type="REG_CERT" onUpload={handleFileUpload} isMandatory documents={documents} />
                                <UploadCard title="NGO PAN Card" type="NGO_PAN" onUpload={handleFileUpload} isMandatory documents={documents} />
                                <UploadCard title="Type Proof (Deed/Certificate)" type="TYPE_PROOF" onUpload={handleFileUpload} isMandatory documents={documents} />
                                <UploadCard title="Admin ID Proof" type="ADMIN_ID" onUpload={handleFileUpload} isMandatory documents={documents} />
                                <UploadCard title="Office Address Proof" type="ADD_PROOF" onUpload={handleFileUpload} isMandatory documents={documents} />
                                <UploadCard title="Darpan ID Screenshot" type="DARPAN_PROOF" onUpload={handleFileUpload} isMandatory documents={documents} />
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.OPTIONAL_DOCS && (
                        <motion.div key="docs-o" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                             <h2 className="text-2xl font-black text-on_surface mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg font-black">5</span>
                                High-Trust Documents
                            </h2>
                            <p className="text-xs text-on_surface_variant font-medium -mt-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                Optional: These documents increase your trust level and eligibility for corporate funding (CSR).
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <UploadCard title="12A Certificate" type="12A" onUpload={handleFileUpload} isMandatory={false} documents={documents} />
                                <UploadCard title="80G Certificate" type="80G" onUpload={handleFileUpload} isMandatory={false} documents={documents} />
                                <UploadCard title="FCRA Certificate" type="FCRA" onUpload={handleFileUpload} isMandatory={false} documents={documents} />
                                <UploadCard title="Cancelled Cheque" type="CHEQUE" onUpload={handleFileUpload} isMandatory={false} documents={documents} />
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.REVIEW && (
                        <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-black text-on_surface mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg font-black">6</span>
                                Final Review
                            </h2>
                            <div className="p-6 bg-surface_high rounded-3xl border border-on_surface/5 space-y-4">
                                <div className="flex justify-between items-center bg-white p-4 rounded-2xl">
                                    <span className="text-xs font-bold text-on_surface_variant uppercase">Organization</span>
                                    <span className="text-sm font-black text-on_surface">{formData.name}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-4 rounded-2xl">
                                    <span className="text-xs font-bold text-on_surface_variant uppercase">Reg #</span>
                                    <span className="text-sm font-black text-on_surface">{formData.registration_number}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-4 rounded-2xl">
                                    <span className="text-xs font-bold text-on_surface_variant uppercase">Documents Uploaded</span>
                                    <span className="text-sm font-black text-primary">{documents.length} Files</span>
                                </div>
                            </div>
                            
                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                                <span className="material-symbols-outlined text-amber-600">report</span>
                                <p className="text-xs font-medium text-amber-800 leading-relaxed">
                                    By submitting, you declare that all information and documents provided are genuine. 
                                    Any mismatch found during manual verification may lead to account suspension.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Actions */}
                <div className="mt-12 pt-8 border-t border-on_surface/5 flex justify-between items-center">
                    <button 
                        disabled={step === 1 || saving}
                        onClick={() => setStep(step - 1)}
                        className="px-8 py-3 text-xs font-black uppercase tracking-widest text-on_surface_variant hover:text-primary transition-colors disabled:opacity-30 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back
                    </button>

                    {step < STEPS.REVIEW ? (
                        <button 
                            disabled={saving}
                            onClick={handleNextStep}
                            className="px-10 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            Continue
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    ) : (
                        <button 
                            disabled={saving}
                            onClick={handleFinalSubmit}
                            className="px-12 py-4 bg-primaryGradient text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {saving ? "Processing..." : "Submit for Verification"}
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoCard = ({ label, value }) => (
    <div className="space-y-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/50 ml-1">{label}</span>
        <div className="bg-surface_high p-4 rounded-2xl font-bold text-sm text-on_surface border border-on_surface/5 shadow-sm">
            {value}
        </div>
    </div>
);

const UploadCard = ({ title, type, onUpload, isMandatory, documents }) => {
    const doc = documents.find(d => d.type === type);
    return (
        <div className={`p-5 rounded-2xl border-2 transition-all group ${doc ? 'bg-green-50/50 border-green-200' : 'bg-surface_high border-dashed border-on_surface/10 hover:border-primary/30'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <h4 className="text-xs font-black text-on_surface uppercase">{title}</h4>
                    {isMandatory && !doc && <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">Required*</span>}
                    {doc && <span className="text-[9px] font-bold text-green-600 uppercase flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">check_circle</span> Uploaded</span>}
                </div>
                {doc && (
                    <a href={doc.url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-on_surface_variant hover:text-primary transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                    </a>
                )}
            </div>
            
            <label className={`
                w-full py-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
                ${doc ? 'bg-white/80' : 'bg-white group-hover:bg-primary/5'}
            `}>
                <span className={`material-symbols-outlined text-sm ${doc ? 'text-green-500' : 'text-on_surface_variant opacity-50 group-hover:text-primary group-hover:opacity-100'}`}>
                    {doc ? 'published_with_changes' : 'cloud_upload'}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                    {doc ? 'Change File' : 'Upload Proof'}
                </span>
                <input type="file" className="hidden" onChange={e => onUpload(e, type, isMandatory)} accept=".pdf,image/*" />
            </label>
        </div>
    );
};

export default OrgIdentityPage;
