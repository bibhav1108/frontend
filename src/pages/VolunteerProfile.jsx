import { useEffect, useState } from "react";
import API, { BACKEND_BASE_URL } from "../services/api";
import Skeleton from "../components/Skeleton";
import { resolveProfileImage } from "../utils/imageUtils";
import VerificationBadge from "../components/VerificationBadge";

const VolunteerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");

  // 📧 Email Flow States
  const [emailStep, setEmailStep] = useState(0); // 0: Idle, 1: Enter Email, 2: Enter OTP
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await API.get("/volunteers/profile/me");
      const data = res.data;

      setProfile(data);
      setForm({
        name: data.name || "",
        skills: data.skills?.join(", ") || "",
        zone: data.zone || "",
      });
    } catch (err) {
      setMsg("Failed to load profile");
    } finally {
      setTimeout(() => setLoading(false), 800); // Small delay for skeleton wow factor
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");

    try {
      const payload = {
        name: form.name,
        skills: form.skills.split(",").map((s) => s.trim()),
        zone: form.zone,
      };

      const res = await API.patch("/volunteers/profile/me", payload);
      setProfile(res.data);
      setEditing(false);

      setMsg("Profile updated successfully! 🚀");
    } catch (err) {
      setMsg(err.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!newEmail) return setEmailError("Email is required");
    setEmailLoading(true);
    setEmailError("");
    try {
      await API.post("/volunteers/profile/me/email/request-otp", { new_email: newEmail });
      setEmailStep(2);
    } catch (err) {
      setEmailError(err.response?.data?.detail || "Failed to send OTP");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return setEmailError("OTP is required");
    setEmailLoading(true);
    setEmailError("");
    try {
      await API.post("/volunteers/profile/me/email/verify", { otp });
      setMsg("Email verified successfully! 🎉");
      setEmailStep(0);
      setNewEmail("");
      setOtp("");
      await fetchProfile(); // Refresh
    } catch (err) {
      setEmailError(err.response?.data?.detail || "Verification failed");
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-10 selection:bg-primary/20">
      {/* 🔹 HEADER AREA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fadeIn">
        <div className="flex gap-6 items-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-primaryGradient rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img
                src={resolveProfileImage(profile.profile_image_url)}
                alt="profile"
                className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
          </div>

            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-outfit font-black text-on_surface">{profile.name}</h1>
                    <VerificationBadge trustTier={profile.trust_tier} telegramActive={profile.telegram_active} />
                </div>
                <p className="text-on_surface_variant flex items-center gap-2 mt-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {profile.zone || "Location not specified"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className={`
            px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2
            ${editing ? "bg-surface_high text-on_surface_variant" : "bg-primaryGradient text-white shadow-lg shadow-primary/25 hover:scale-105 active:scale-95"}
          `}
        >
          <span className="material-symbols-outlined text-sm">{editing ? "close" : "edit_square"}</span>
          {editing ? "Cancel Editing" : "Modify Profile"}
        </button>
      </div>

      {/* 🔹 STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Trust Score" value={profile.trust_score} icon="verified" delay="100ms" />
        <StatCard label="Rank Tier" value={profile.trust_tier} icon="military_tech" delay="200ms" />
        <StatCard label="Accomplishments" value={profile.completions} icon="task_alt" delay="300ms" />
        <StatCard label="Service Hours" value={profile.hours_served} icon="schedule" highlight delay="400ms" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          <SectionCard title="Identity & Verification" icon="badge" delay="500ms">
            <div className="space-y-4">
                <StatusRow
                    label="Email Proof"
                    status={profile.is_email_verified}
                    action={
                        !profile.is_email_verified && (
                        <button 
                            onClick={() => { setEmailStep(1); setNewEmail(profile.email); }}
                            className="text-[10px] bg-primary text-white px-3 py-1 rounded-lg font-bold hover:opacity-90 transition-all"
                        >
                            Verify Email
                        </button>
                        )
                    }
                />
                <StatusRow label="Identity Shield" status={profile.id_verified} />
                <StatusRow label="Active Status" status={profile.is_active} />
            </div>
          </SectionCard>

          <SectionCard title="Contact Channels" icon="alternate_email" delay="600ms">
            <div className="space-y-5">
                <div className="flex justify-between items-center group">
                    <div>
                        <p className="text-[10px] text-on_surface_variant uppercase font-black tracking-widest leading-none mb-1">E-Mail Address</p>
                        <p className="text-sm font-bold text-on_surface">{profile.email}</p>
                    </div>
                    <button 
                        onClick={() => setEmailStep(1)}
                        className="opacity-0 group-hover:opacity-100 transition-all px-3 py-1 bg-surface_high text-primary text-[10px] font-bold rounded-lg"
                    >
                        Update
                    </button>
                </div>
                
                <div>
                    <p className="text-[10px] text-on_surface_variant uppercase font-black tracking-widest leading-none mb-1">Secure Contact</p>
                    <p className="text-sm font-bold text-on_surface">{profile.phone_number}</p>
                </div>
            </div>
            
            {/* 📧 EMAIL UPDATE OVERLAY */}
            {emailStep > 0 && (
              <div className="mt-6 p-6 bg-surface_high rounded-2xl border-2 border-primary/20 animate-slide-up space-y-4">
                <div className="flex justify-between items-center font-outfit">
                  <span className="font-bold text-primary tracking-tight">
                    {emailStep === 1 ? "Update Email Profile" : "Validate Code"}
                  </span>
                  <button onClick={() => setEmailStep(0)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs shadow-sm hover:bg-error/10 hover:text-error transition-all">✕</button>
                </div>

                {emailStep === 1 ? (
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter new email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-white border-none rounded-xl focus:ring-2 focus:ring-primary shadow-sm"
                    />
                    <button
                      onClick={handleRequestOtp}
                      disabled={emailLoading}
                      className="w-full py-3 bg-primaryGradient text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {emailLoading ? "Sending Verification..." : "Request Security Code"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[10px] text-on_surface_variant leading-relaxed text-center">We've sent a code to <span className="font-bold text-primary">{newEmail}</span>.</p>
                    <input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-4 text-center text-2xl tracking-[1em] font-black bg-white border-none rounded-2xl focus:ring-2 focus:ring-primary shadow-sm"
                      maxLength={6}
                    />
                    <button
                      onClick={handleVerifyOtp}
                      disabled={emailLoading}
                      className="w-full py-4 bg-green-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-500/20"
                    >
                      {emailLoading ? "Validating..." : "Complete Verification"}
                    </button>
                  </div>
                )}
                
                {emailError && <p className="text-[10px] text-error text-center font-bold px-4 py-2 bg-error/10 rounded-lg">{emailError}</p>}
              </div>
            )}
          </SectionCard>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
            {!editing ? (
            <SectionCard title="Portfolio & Skills" icon="star" delay="700ms">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <DisplayInfo label="Primary Name" value={profile.name} />
                        <DisplayInfo label="Current Zone" value={profile.zone} />
                    </div>
                    <div>
                        <p className="text-[10px] text-on_surface_variant uppercase font-black tracking-widest leading-none mb-4">Competency Map</p>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.length > 0 ? profile.skills.map((s, i) => (
                                <span key={i} className="px-4 py-2 text-xs font-bold rounded-xl bg-surface_high text-primary border border-primary/5 transition-all hover:scale-105 active:scale-95">
                                    {s}
                                </span>
                            )) : (
                                <p className="text-xs text-on_surface_variant italic">No skills listed yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </SectionCard>
            ) : (
            <SectionCard title="Modify Your Profile" icon="edit_note" delay="0ms">
              <div className="space-y-6 max-w-2xl">
                <FormInput
                  label="Display Name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
                <FormInput
                  label="Skills (Comma separated)"
                  value={form.skills}
                  onChange={(v) => setForm({ ...form, skills: v })}
                  placeholder="Medical, Driving, Teaching..."
                />
                <FormInput
                  label="Operational Zone"
                  value={form.zone}
                  onChange={(v) => setForm({ ...form, zone: v })}
                  placeholder="e.g. Lucknow, Zone 4"
                />

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-4 bg-primaryGradient text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {saving ? "Saving Changes..." : "Commit Update"}
                    </button>
                    <button
                        onClick={() => setEditing(false)}
                        className="px-8 py-4 bg-surface_high text-on_surface_variant rounded-2xl font-bold hover:bg-surface_highest transition-all"
                    >
                        Discard
                    </button>
                </div>
              </div>
            </SectionCard>
            )}

            {/* RECENT ACTIVITY PLACEHOLDER (To match NGO dashboard density) */}
            <SectionCard title="Recent Mission Activity" icon="history" delay="800ms">
               <div className="py-12 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                    <span className="material-symbols-outlined text-4xl mb-4 text-on_surface_variant">hourglass_empty</span>
                    <p className="text-sm font-bold">Waiting for your first mission...</p>
                    <p className="text-[10px] uppercase tracking-widest mt-1">Assignments will appear here once approved by an NGO</p>
               </div>
            </SectionCard>
        </div>
      </div>

      {msg && (
        <div className="fixed bottom-10 right-10 animate-slide-up z-50">
            <div className="bg-primary text-white px-8 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3">
                <span className="material-symbols-outlined">info</span>
                {msg}
                <button onClick={() => setMsg("")} className="ml-4 opacity-50">✕</button>
            </div>
        </div>
      )}
    </div>
  );
};

/* 🔹 PREMIUM STYLED COMPONENTS */

const DashboardSkeleton = () => (
    <div className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-6 items-center w-full">
                <Skeleton className="w-24 h-24" variant="circle" />
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-8 w-64" variant="text" />
                    <Skeleton className="h-4 w-48" variant="text" />
                </div>
            </div>
            <Skeleton className="w-48 h-12" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] lg:col-span-2 w-full" />
        </div>
    </div>
);

const SectionCard = ({ title, icon, children, delay }) => (
  <div 
    className="bg-surface_lowest p-8 rounded-[2rem] border border-white shadow-soft space-y-6 animate-fadeIn"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl font-bold">{icon}</span>
        </div>
        <h3 className="font-outfit font-black text-on_surface tracking-tight uppercase text-xs">{title}</h3>
    </div>
    {children}
  </div>
);

const FormInput = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-2 group">
    <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant ml-1 group-focus-within:text-primary transition-colors">{label}</label>
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="px-5 py-3 rounded-2xl bg-surface_high border-2 border-transparent focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
    />
  </div>
);

const DisplayInfo = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-on_surface_variant uppercase font-black tracking-widest leading-none mb-1">{label}</p>
    <p className="text-lg font-outfit font-bold text-on_surface">{value || "-"}</p>
  </div>
);

const StatCard = ({ label, value, icon, highlight, delay }) => (
  <div
    className={`p-6 rounded-[2rem] flex flex-col items-center justify-center text-center border-2 border-white shadow-soft hover:scale-[1.03] transition-all cursor-default group animate-fadeIn ${
      highlight ? "bg-primaryGradient text-white shadow-lg shadow-primary/25 border-none" : "bg-surface_lowest"
    }`}
    style={{ animationDelay: delay }}
  >
    <div className={`w-10 h-10 rounded-2xl mb-4 flex items-center justify-center transition-all ${highlight ? "bg-white/20" : "bg-primary/5 group-hover:bg-primary group-hover:text-white"}`}>
        <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div className="text-3xl font-outfit font-black mb-1">{value}</div>
    <div className={`text-[10px] uppercase font-black tracking-[0.2em] ${highlight ? "opacity-70" : "text-on_surface_variant"}`}>{label}</div>
  </div>
);

const StatusRow = ({ label, status, action }) => (
  <div className="flex justify-between text-sm items-center p-4 bg-surface_high/30 rounded-2xl border border-white">
    <div className="flex items-center gap-3">
        <span className={`material-symbols-outlined text-sm ${status ? "text-green-500" : "text-on_surface_variant/30"}`}>
            {status ? "check_circle" : "cancel"}
        </span>
        <span className="font-bold text-on_surface opacity-80">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      <span
        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
          status
            ? "bg-green-500/10 text-green-600 border-green-500/20"
            : "bg-gray-500/10 text-gray-500 border-gray-500/20"
        }`}
      >
        {status ? "Verified" : "Pending"}
      </span>
      {action}
    </div>
  </div>
);

export default VolunteerProfile;
