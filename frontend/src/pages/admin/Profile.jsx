import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import {
  User, Mail, Phone, Building2, BookOpen, ShieldCheck,
  KeyRound, Save, Send, CheckCircle2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Hook: real window width ─── */
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export default function Profile({ token }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({ name: '', instituteName: '', mobile: '', field: '' });
  const [passwordData, setPasswordData] = useState({ otp: '', newPassword: '', confirmPassword: '' });

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdmin(data);
        setFormData({ name: data.name || '', instituteName: data.instituteName || '', mobile: data.mobile || '', field: data.field || '' });
      }
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) fetchProfile(); }, [token]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) { toast.success('Profile updated successfully'); setAdmin(await res.json()); }
      else toast.error('Failed to update profile');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleRequestOtp = async () => {
    try {
      setOtpLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: admin.email })
      });
      if (res.ok) { toast.success('OTP sent to your email'); setStep(2); }
      else toast.error('Failed to send OTP');
    } catch { toast.error('Request failed'); }
    finally { setOtpLoading(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error('Passwords do not match');
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/admin/update-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: admin.email, otp: passwordData.otp, newPassword: passwordData.newPassword })
      });
      if (res.ok) { toast.success('Password updated successfully'); setStep(1); setPasswordData({ otp: '', newPassword: '', confirmPassword: '' }); }
      else { const data = await res.json(); toast.error(data.msg || 'Update failed'); }
    } catch { toast.error('Connection error'); }
    finally { setSaving(false); }
  };

  /* ── Shared style tokens ── */
  const inp = {
    width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 12, padding: "12px 16px", fontSize: 13, fontWeight: 600,
    color: "#334155", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
    transition: "all 0.2s",
  };
  const lbl = {
    display: "block", fontSize: 10, fontWeight: 900, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, paddingLeft: 4,
  };
  const card = {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24,
    overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  };

  if (loading) return (
    <div style={{ height: 256, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: "4px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>
        Synchronizing Identity...
      </p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 1024, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Header Card ── */}
      <div style={{ ...card, padding: isMobile ? 20 : 32, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "center" : "center", gap: isMobile ? 16 : 28, textAlign: isMobile ? "center" : "left" }}>
        {/* Avatar */}
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", border: "4px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", flexShrink: 0 }}>
          <User size={40} />
        </div>

        {/* Name + badges */}
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: "0 0 10px", fontSize: isMobile ? 22 : 28, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" }}>
            {admin.name}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#475569", background: "#f1f5f9", padding: "6px 14px", borderRadius: 999 }}>
              <Building2 size={13} /> {admin.instituteName}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "6px 14px", borderRadius: 999 }}>
              <ShieldCheck size={13} /> {admin.plan} Plan
            </span>
          </div>
        </div>

        {/* Status */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-end", flexShrink: 0 }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Status</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", fontWeight: 900, fontSize: 13, textTransform: "uppercase", fontStyle: "italic" }}>
            <CheckCircle2 size={16} /> Active Member
          </div>
        </div>
      </div>

      {/* ── Main Grid: Profile Form + Security ── */}
      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr", gap: 24 }}>

        {/* Profile Form — spans 2 cols on desktop */}
        <div style={{ gridColumn: isDesktop ? "span 2" : "span 1", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={card}>
            {/* Card header */}
            <div style={{ padding: isMobile ? "16px 20px" : "20px 28px", borderBottom: "1px solid #f1f5f9", background: "rgba(248,250,252,0.5)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ padding: 8, background: "#4f46e5", borderRadius: 10, color: "#fff", display: "flex" }}>
                <User size={17} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.04em" }}>General Information</h3>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Basic identity credentials</p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} style={{ padding: isMobile ? 20 : 28, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>

                {/* Full Name */}
                <div>
                  <label style={lbl}>Full Name</label>
                  <input type="text" required value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={inp}
                    onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08)"; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; }}
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label style={lbl}>Email Address (Read Only)</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={15} color="#cbd5e1" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                    <input type="email" value={admin.email} disabled
                      style={{ ...inp, paddingLeft: 38, background: "rgba(241,245,249,0.5)", cursor: "not-allowed", color: "#94a3b8" }} />
                  </div>
                </div>

                {/* Institute Name */}
                <div>
                  <label style={lbl}>Institute Name</label>
                  <input type="text" required value={formData.instituteName}
                    onChange={e => setFormData({ ...formData, instituteName: e.target.value })}
                    style={inp}
                    onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08)"; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; }}
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label style={lbl}>Mobile Number</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={15} color="#cbd5e1" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                    <input type="text" required value={formData.mobile}
                      onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                      style={{ ...inp, paddingLeft: 38 }}
                      onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08)"; e.target.style.background = "#fff"; }}
                      onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; }}
                    />
                  </div>
                </div>

                {/* Field */}
                <div>
                  <label style={lbl}>Industry Field</label>
                  <input type="text" required value={formData.field}
                    onChange={e => setFormData({ ...formData, field: e.target.value })}
                    style={inp}
                    onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08)"; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; }}
                  />
                </div>
              </div>

              {/* Save button */}
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
                <button type="submit" disabled={saving}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 16, fontWeight: 900, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.5 : 1, boxShadow: "0 4px 14px rgba(79,70,229,0.25)", transition: "background 0.2s", width: isMobile ? "100%" : "auto", justifyContent: "center" }}
                  onMouseOver={e => { if (!saving) e.currentTarget.style.background = "#4338ca"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "#4f46e5"; }}
                >
                  {saving
                    ? <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    : <Save size={14} />
                  }
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={card}>
            {/* Dark header */}
            <div style={{ padding: isMobile ? "16px 20px" : "20px 24px", background: "#0f172a", color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ padding: 8, background: "#4f46e5", borderRadius: 10, display: "flex" }}>
                <KeyRound size={17} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em" }}>Security</h3>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Master credentials</p>
              </div>
            </div>

            <div style={{ padding: isMobile ? 18 : 24 }}>
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ padding: 14, background: "#eef2ff", borderRadius: 14, border: "1px solid #c7d2fe", display: "flex", gap: 12 }}>
                    <AlertCircle size={17} color="#4f46e5" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#3730a3", lineHeight: 1.6 }}>
                      To change your password, we'll send a 6-digit OTP to your registered email address for verification.
                    </p>
                  </div>
                  <button onClick={handleRequestOtp} disabled={otpLoading}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 0", background: "#0f172a", color: "#fff", border: "none", borderRadius: 16, fontWeight: 900, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", cursor: otpLoading ? "not-allowed" : "pointer", opacity: otpLoading ? 0.5 : 1, boxShadow: "0 6px 20px rgba(15,23,42,0.15)", transition: "background 0.2s" }}
                    onMouseOver={e => { if (!otpLoading) e.currentTarget.style.background = "#000"; }}
                    onMouseOut={e => { e.currentTarget.style.background = "#0f172a"; }}
                  >
                    {otpLoading
                      ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      : <Send size={15} />
                    }
                    Request Password OTP
                  </button>
                </div>
              )}

              {step >= 2 && (
                <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={lbl}>6-Digit OTP</label>
                    <input type="text" maxLength="6" placeholder="Enter OTP" required
                      value={passwordData.otp}
                      onChange={e => setPasswordData({ ...passwordData, otp: e.target.value })}
                      style={{ ...inp, textAlign: "center", letterSpacing: "0.5em", fontSize: 20 }}
                      onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "#fff"; }}
                      onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; }}
                    />
                  </div>
                  <div>
                    <label style={lbl}>New Password</label>
                    <input type="password" placeholder="••••••••" required
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      style={inp}
                      onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "#fff"; }}
                      onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; }}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Confirm New Password</label>
                    <input type="password" placeholder="••••••••" required
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      style={inp}
                      onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "#fff"; }}
                      onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; }}
                    />
                  </div>
                  <div style={{ paddingTop: 4, display: "flex", flexDirection: "column", gap: 10 }}>
                    <button type="submit" disabled={saving}
                      style={{ width: "100%", padding: "14px 0", background: "#10b981", color: "#fff", border: "none", borderRadius: 16, fontWeight: 900, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.5 : 1, boxShadow: "0 4px 14px rgba(16,185,129,0.25)", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                      onMouseOver={e => { if (!saving) e.currentTarget.style.background = "#059669"; }}
                      onMouseOut={e => { e.currentTarget.style.background = "#10b981"; }}
                    >
                      {saving
                        ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                        : "Confirm & Update"
                      }
                    </button>
                    <button type="button" onClick={() => setStep(1)}
                      style={{ width: "100%", padding: "12px 0", background: "#f8fafc", color: "#64748b", border: "none", borderRadius: 12, fontWeight: 900, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", transition: "background 0.2s" }}
                      onMouseOver={e => e.currentTarget.style.background = "#f1f5f9"}
                      onMouseOut={e => e.currentTarget.style.background = "#f8fafc"}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Support Card */}
          <div style={{ background: "#4f46e5", borderRadius: 24, padding: isMobile ? 20 : 28, color: "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 900, letterSpacing: "-0.01em" }}>Support System</h4>
              <p style={{ margin: 0, fontSize: 12, color: "#c7d2fe", lineHeight: 1.6, fontWeight: 700 }}>
                Need help with your account or having trouble with OTP? Contact our support team for immediate assistance.
              </p>
            </div>
            <BookOpen size={110} color="rgba(99,102,241,0.3)" style={{ position: "absolute", right: -10, bottom: -10 }} />
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}