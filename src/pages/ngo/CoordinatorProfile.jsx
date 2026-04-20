import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { resolveProfileImage } from "../../utils/imageUtils";
import ProfileImageModal from "../../components/shared/ProfileImageModal";
import { useToast } from "../../context/ToastContext";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import DataRow from "../../components/shared/DataRow";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const CoordinatorProfile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total_campaigns: 0, total_inventory: 0, total_volunteers: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  // 📸 Image Flow States
  const [pfpModalOpen, setPfpModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [userRes, statsRes] = await Promise.all([
            API.get("/users/me"),
            API.get("/users/me/stats")
        ]);
        setUser(userRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to load profile or stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCropComplete = async (croppedBlob) => {
    setPfpModalOpen(false);
    const formData = new FormData();
    formData.append("file", croppedBlob, "profile.jpg");
    setSaving(true);

    try {
      const res = await API.post("/users/me/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser({ ...user, profile_image_url: res.data.profile_image_url });
      addToast("Profile parameters recalibrated! 📸", "success");
      window.dispatchEvent(new Event('user-profile-updated'));
    } catch (err) {
      addToast(err.response?.data?.detail || "Signal acquisition failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    setPfpModalOpen(false);
    setSaving(true);
    try {
      await API.delete("/users/me/image");
      setUser({ ...user, profile_image_url: null });
      addToast("Profile stealth mode activated. ✨", "success");
      window.dispatchEvent(new Event('user-profile-updated'));
    } catch (err) {
      addToast(err.response?.data?.detail || "Removal failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const skeletonLayout = [
    { type: 'rect', height: 260, className: "rounded-[3.5rem] mb-10" },
    { type: 'row', gap: 6, cols: [
        { type: 'rect', height: 140, className: "rounded-[2.5rem]" },
        { type: 'rect', height: 140, className: "rounded-[2.5rem]" },
        { type: 'rect', height: 140, className: "rounded-[2.5rem]" }
    ]},
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
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 pb-32 animate-fadeIn selection:bg-primary/10">
      {/* HEADER CARD */}
      <div className="relative overflow-hidden rounded-[4rem] bg-surface_high border border-white p-12 md:p-16 shadow-2xl group">
        <div className="absolute inset-0 bg-primaryGradient opacity-5" />
        <div className="relative flex flex-col md:flex-row items-center gap-12">
          <div 
            className="relative cursor-pointer group/pfp"
            onClick={() => setPfpModalOpen(true)}
          >
            <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl group-hover/pfp:brightness-50 transition-all duration-500 rotate-3 group-hover/pfp:rotate-0">
              <img 
                src={resolveProfileImage(user?.profile_image_url)} 
                alt="profile" 
                className="w-full h-full object-cover scale-110 group-hover/pfp:scale-100 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/pfp:opacity-100 transition-all pointer-events-none">
              <span className="material-symbols-outlined text-white text-4xl font-black">add_a_photo</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-on_surface text-white flex items-center justify-center shadow-2xl transition group-hover/pfp:scale-110 group-hover/pfp:bg-primary">
              <span className="material-symbols-outlined text-2xl">photo_camera</span>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2">Account Profile</p>
                <h1 className="text-5xl font-outfit font-black text-on_surface tracking-tight mb-1">{user?.full_name}</h1>
                <p className="text-sm font-bold text-on_surface_variant/60">{user?.email}</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-4">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl border border-on_surface/5 text-[10px] font-black uppercase tracking-widest text-on_surface shadow-sm">
                    <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
                    NGO Coordinator
                </span>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl border border-on_surface/5 text-[10px] font-black uppercase tracking-widest text-on_surface shadow-sm">
                    <span className="material-symbols-outlined text-primary text-sm">event</span>
                    Coordinator since {new Date(user?.created_at).getFullYear()}
                </span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <MetricCard label="Campaigns Managed" value={stats.total_campaigns} icon="rocket_launch" variant="primary" />
        <MetricCard label="Active Volunteers" value={stats.total_volunteers} icon="person_check" />
        <MetricCard label="Inventory Items" value={stats.total_inventory} icon="inventory_2" />
      </div>

      {/* DETAILS SECTION */}
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-6">
            <ContentSection title="Personal Information" icon="person">
                <div className="space-y-6">
                    <DataRow label="Full Name" value={user?.full_name} icon="id_card" />
                    <DataRow label="Email Address" value={user?.email} icon="alternate_email" />
                    <DataRow label="NGO Status" value={user?.org_id ? "Verified NGO Coordinator" : "Verification Pending"} icon="shield" />
                    
                    <button className="w-full mt-10 py-4 bg-on_surface text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all">
                        Edit Profile Details
                    </button>
                </div>
            </ContentSection>
        </div>

        <div className="col-span-12 lg:col-span-6">
            <ContentSection title="Security & Privacy" icon="security">
                <div className="space-y-6">
                    <DataRow label="Password" value="••••••••••••" icon="key" />
                    <DataRow label="Two-Factor Auth" value="Enabled" icon="check_circle" />
                    <DataRow label="Account Status" value="Active & Secure" icon="verified" />

                    <button className="w-full mt-10 py-4 bg-surface_high text-on_surface rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white hover:bg-on_surface hover:text-white transition-all">
                        Privacy Settings
                    </button>
                </div>
            </ContentSection>
        </div>
      </div>

      {pfpModalOpen && (
        <ProfileImageModal 
          currentImage={user?.profile_image_url} 
          onCropComplete={handleCropComplete} 
          onRemove={handleRemoveImage}
          onCancel={() => setPfpModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default CoordinatorProfile;
