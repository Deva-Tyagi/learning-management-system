import { useState, useEffect } from "react";
import {
  Video, Plus, Calendar, Clock, Link as LinkIcon,
  Users, Trash2, X, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import API_BASE_URL from "../../lib/utils";

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

export default function LiveClassesSection({ token }) {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", batch: "", date: "",
    time: "", duration: 60, meetingLink: "", platform: "Zoom",
  });

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const classesRes = await fetch(`${API_BASE_URL}/live-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (classesRes.ok) setClasses(await classesRes.json());

      const coursesRes = await fetch(`${API_BASE_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let courseNames = [];
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        if (Array.isArray(data)) courseNames = data.map(c => c.name);
      }

      const studentsRes = await fetch(`${API_BASE_URL}/students/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let studentBatches = [];
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        if (Array.isArray(data)) {
          const uniqueItems = new Set();
          data.forEach(s => {
            if (s.batch) uniqueItems.add(`${s.batch}`);
            if (s.course && !s.batch) uniqueItems.add(`${s.course}`);
            if (s.course && s.batch) uniqueItems.add(`${s.course} (${s.batch})`);
          });
          studentBatches = Array.from(uniqueItems);
        }
      }

      const finalOptions = Array.from(new Set([...courseNames, ...studentBatches])).sort();
      setCourses(finalOptions.length > 0 ? finalOptions : ["General Batch", "Default Course"]);
    } catch (err) {
      toast.error("Sync failed. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData, duration: Number(formData.duration) };
      const res = await fetch(`${API_BASE_URL}/live-classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const responseData = await res.json().catch(() => null);
      if (!res.ok) throw new Error(responseData?.msg || responseData?.message || "Failed to schedule live class");
      toast.success("Live class scheduled successfully!");
      setShowModal(false);
      setFormData({ title: "", description: "", batch: "", date: "", time: "", duration: 60, meetingLink: "", platform: "Zoom" });
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this live class?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/live-classes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete live class");
      toast.success("Live class cancelled");
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ── Style tokens ── */
  const inp = {
    width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 12, padding: "9px 14px", fontSize: 13, color: "#334155",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
  const lbl = {
    display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5,
  };
  const g2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
        gap: 16, background: "#fff", padding: isMobile ? 16 : 20,
        borderRadius: 16, border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <Video size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 22, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              Live Classes Management
            </h1>
            <p style={{ margin: "5px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 5 }}>
              <Plus size={10} color="#3b82f6" /> Schedule & Broadcast Virtual Sessions
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#2563eb", color: "#fff", border: "none",
            padding: "12px 24px",
            borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
            width: isMobile ? "100%" : "auto", justifyContent: "center",
            textTransform: "uppercase", letterSpacing: "0.05em"
          }}
        >
          <Plus size={16} /> Schedule Class
        </button>
      </div>

      {/* ── CONTENT ── */}
      {loading ? (
        <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RefreshCw size={30} color="#3b82f6" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : classes.length === 0 ? (
        <div style={{ padding: "64px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#fff", borderRadius: 18, border: "1px solid #f1f5f9" }}>
          <div style={{ width: 64, height: 64, background: "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Video size={30} color="#93c5fd" />
          </div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#64748b" }}>No live classes scheduled yet</p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#94a3b8" }}>Click "Schedule Class" to get started</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : isDesktop ? "1fr 1fr 1fr" : "1fr 1fr",
          gap: isMobile ? 12 : 20,
        }}>
          {classes.map(cls => (
            <div key={cls._id} style={{
              background: "#fff", borderRadius: 18, border: "1px solid #f1f5f9",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: 20,
              display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
            }}>
              {/* Left accent bar */}
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: cls.status === "Ongoing" ? "#22c55e" : "#3b82f6", borderRadius: "4px 0 0 4px" }} />

              {/* Card top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ flex: 1, minWidth: 0, paddingLeft: 8 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: 6 }}>
                      {cls.platform}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>
                      {cls.batch}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: 15, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {cls.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleDelete(cls._id)}
                  style={{ padding: 6, background: "none", border: "none", cursor: "pointer", color: "#94a3b8", flexShrink: 0, borderRadius: 8 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                  onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Meta info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
                  <Calendar size={13} color="#94a3b8" />
                  {new Date(cls.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
                  <Clock size={13} color="#94a3b8" />
                  {cls.time} • {cls.duration} mins
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
                  <Users size={13} color="#94a3b8" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {cls.instructor?.name || "Instructor"}
                  </span>
                </div>
              </div>

              {/* Join button */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                <a
                  href={cls.meetingLink} target="_blank" rel="noreferrer"
                  style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 0", borderRadius: 12, fontSize: 13, fontWeight: 700, background: "#f8fafc", color: "#475569", textDecoration: "none", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.borderColor = "#bfdbfe"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                >
                  <LinkIcon size={13} /> Join Meeting
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SCHEDULE MODAL ── */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)",
          padding: isMobile ? 12 : 24,
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, width: "100%",
            maxWidth: 520, boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
            overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column",
          }}>
            {/* Modal header */}
            <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Schedule Live Class</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: 6, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "50%", cursor: "pointer", color: "#64748b", display: "flex", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <form onSubmit={handleSubmit} style={{ padding: isMobile ? "16px 16px" : "18px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Title */}
              <div>
                <label style={lbl}>Class Topic</label>
                <input type="text" required value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Masterclass: Advanced React Hooks" style={inp} />
              </div>

              {/* Batch */}
              <div>
                <label style={lbl}>Target Batch (Course)</label>
                <select required value={formData.batch}
                  onChange={e => setFormData({ ...formData, batch: e.target.value })} style={inp}>
                  <option value="">Select a batch / course</option>
                  {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Date + Time */}
              <div style={g2}>
                <div>
                  <label style={lbl}>Date</label>
                  <input type="date" required value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Time</label>
                  <input type="time" required value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })} style={inp} />
                </div>
              </div>

              {/* Duration + Platform */}
              <div style={g2}>
                <div>
                  <label style={lbl}>Duration (mins)</label>
                  <input type="number" required min="15" step="15" value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Platform</label>
                  <select required value={formData.platform}
                    onChange={e => setFormData({ ...formData, platform: e.target.value })} style={inp}>
                    <option value="Zoom">Zoom</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Meeting URL + Description */}
              <div>
                <label style={lbl}>Meeting URL</label>
                <input type="url" required value={formData.meetingLink}
                  onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://zoom.us/j/..." style={inp} />
              </div>
              <div>
                <label style={lbl}>Description (Optional)</label>
                <input type="text" value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..." style={inp} />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "flex-end", gap: 10, paddingTop: 14, borderTop: "1px solid #f1f5f9", marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: "10px 22px", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", width: isMobile ? "100%" : "auto" }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{ padding: "10px 22px", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff", background: "#2563eb", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.25)", opacity: submitting ? 0.6 : 1, width: isMobile ? "100%" : "auto" }}>
                  {submitting ? "Scheduling..." : "Schedule Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}