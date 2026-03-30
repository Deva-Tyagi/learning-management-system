import { useState, useEffect } from "react";
import API_BASE_URL from "../../lib/utils";
import {
  Calendar, Clock, Search, Trash2, Eye,
  ShieldCheck, ShieldAlert, Activity, Database,
  CheckCircle2, RefreshCcw, Hash, Layers,
  AlertCircle, X, Terminal, Cpu, FileText,
  Trophy, Loader2,
} from "lucide-react";
import { toast } from "sonner";

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

export default function ManageExams({ token }) {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [examToView, setExamToView] = useState(null);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [examsRes, coursesRes, studentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/exams`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/courses`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/students/get`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (examsRes.ok && coursesRes.ok && studentsRes.ok) {
        const examsData = await examsRes.json();
        const coursesData = await coursesRes.json();
        const studentsData = await studentsRes.json();
        setExams(Array.isArray(examsData) ? examsData : []);
        setFilteredExams(Array.isArray(examsData) ? examsData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setBatches([...new Set(studentsData.map(s => s.batch))].filter(Boolean));
      } else toast.error("REGISTRY_ERR: One or more data streams failed");
    } catch { toast.error("REGISTRY_ERR: Sync failure detected"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [token]);

  useEffect(() => {
    let filtered = exams || [];
    if (selectedCourse) filtered = filtered.filter(e => e.course === selectedCourse);
    if (selectedBatch) filtered = filtered.filter(e => e.batch === selectedBatch);
    if (statusFilter !== "all") filtered = filtered.filter(e => statusFilter === "active" ? e.isActive : !e.isActive);
    setFilteredExams(filtered);
  }, [exams, selectedCourse, selectedBatch, statusFilter]);

  const handleToggleStatus = async (examId, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/exams/${examId}/toggle-status`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setExams(prev => prev.map(e => e._id === examId ? { ...e, isActive: !currentStatus } : e));
        toast.success(`MANIFEST_${currentStatus ? "DEACTIVATED" : "ACTIVATED"}`);
      } else toast.error("PROTOCOL_ERR: Status mutation rejected");
    } catch { toast.error("SYSTEM_FATAL: Update sequence terminated"); }
  };

  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    try {
      const res = await fetch(`${API_BASE_URL}/exams/${examToDelete._id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setExams(prev => prev.filter(e => e._id !== examToDelete._id));
        toast.success("ENTITY_PURGED: Record erased from mainframe");
        setShowDeleteModal(false); setExamToDelete(null);
      } else toast.error("PURGE_ERR: Entity resilient to deletion");
    } catch { toast.error("SYSTEM_FATAL: Purge sequence interrupted"); }
  };

  const handleViewExam = async (examId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { setExamToView(await res.json()); setShowViewModal(true); }
      else toast.error("DECRYPTION_ERR: Manifest payload corrupt");
    } catch { toast.error("SYSTEM_FATAL: Context retrieval failed"); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => { try { return d ? new Date(d).toLocaleDateString() : "N/A"; } catch { return "N/A"; } };
  const formatTime = (t) => { try { return t ? new Date(`2000-01-01T${t}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"; } catch { return t || "N/A"; } };

  /* ── Style tokens ── */
  const selInp = {
    width: "100%", background: "#f1f5f9", border: "none",
    borderRadius: 14, padding: "12px 18px", fontSize: 11, fontWeight: 900,
    color: "#334155", outline: "none", textTransform: "uppercase",
    letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit",
    boxSizing: "border-box", appearance: "none",
  };
  const lbl = {
    display: "block", fontSize: 10, fontWeight: 900, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6,
  };
  const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" };
  const thSt = { padding: "14px 16px", fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.16em", whiteSpace: "nowrap" };
  const actionBtn = (color) => ({
    width: 38, height: 38, borderRadius: 10, background: "#fff",
    border: "1px solid #e2e8f0", display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", color: "#94a3b8",
    transition: "all 0.15s",
  });

  /* columns visible per breakpoint */
  const showBatch = !isMobile;
  const showDate = isDesktop;
  const showStatus = !isMobile;
  const colSpan = [true, showBatch, showDate, showStatus, true].filter(Boolean).length;

  return (
    <div style={{ paddingBottom: 60, marginTop: 20, fontFamily: "sans-serif", userSelect: "none", color: "#0f172a" }}>

      {/* ── HEADER ── */}
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
        background: "#fff", padding: isMobile ? 16 : 24,
        borderRadius: 24, border: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)", gap: 14, marginBottom: 20,
        position: "relative", overflow: "hidden",
      }}>
        {/* bg icon watermark */}
        <Terminal size={110} color="#0f172a" style={{ position: "absolute", top: -10, right: -10, opacity: 0.03, transform: "rotate(12deg)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 1 }}>
          <div style={{ width: isMobile ? 44 : 56, height: isMobile ? 44 : 56, borderRadius: 18, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 8px 20px rgba(15,23,42,0.2)", flexShrink: 0 }}>
            <Cpu size={isMobile ? 20 : 28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 21, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "-0.02em" }}>Manage Exams</h1>
            <p style={{ margin: "5px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 5 }}>
              <Activity size={9} color="#3b82f6" /> Active Assessment Controller
            </p>
          </div>
        </div>

        <button onClick={fetchData}
          style={{ ...actionBtn(), position: "relative", zIndex: 1, padding: 14, width: "auto", height: "auto", borderRadius: 14, background: "#f8fafc" }}>
          <RefreshCcw size={18} style={loading && !examToView ? { animation: "spin 1s linear infinite" } : {}} />
        </button>
      </div>

      {/* ── FILTER MATRIX ── */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ padding: isMobile ? 14 : 22 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : isDesktop ? "1fr 1fr 1fr auto" : "1fr 1fr",
            gap: isMobile ? 12 : 16,
            alignItems: "end",
          }}>
            <div>
              <label style={lbl}>Course Filter</label>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={selInp}>
                <option value="">All Courses</option>
                {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Batch Filter</label>
              <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={selInp}>
                <option value="">All Batches</option>
                {batches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: isMobile ? "span 2" : "auto" }}>
              <label style={lbl}>Status Filter</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selInp}>
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button onClick={() => { setSelectedCourse(""); setSelectedBatch(""); setStatusFilter("all"); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#0f172a", color: "#fff", border: "none", borderRadius: 14, padding: "13px 0", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", cursor: "pointer", boxShadow: "0 4px 14px rgba(15,23,42,0.18)", gridColumn: isMobile ? "span 2" : "auto" }}>
              <RefreshCcw size={14} color="#60a5fa" /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── EXAMS TABLE (tablet+) / CARDS (mobile) ── */}
      <div style={card}>
        {isMobile ? (
          /* Mobile card list */
          <div style={{ background: "#fff" }}>
            {loading && !examToView ? (
              <div style={{ padding: 48, textAlign: "center" }}>
                <Activity size={28} color="#3b82f6" style={{ margin: "0 auto 10px", animation: "spin 1s linear infinite" }} />
              </div>
            ) : (filteredExams || []).length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <Search size={40} color="#e2e8f0" style={{ margin: "0 auto 12px" }} />
                <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.16em" }}>NO_RECORDS_FOUND</p>
              </div>
            ) : (filteredExams || []).map(exam => (
              <div key={exam._id} style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", display: "flex", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exam?.title || "UNTITLED"}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
                    <span style={{ fontSize: 9, fontWeight: 900, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "2px 7px", borderRadius: 6, textTransform: "uppercase" }}>{exam?.course || "GENERAL"}</span>
                    <span style={{ fontSize: 9, fontWeight: 900, color: exam?.isActive ? "#2563eb" : "#94a3b8", background: exam?.isActive ? "#eff6ff" : "#f8fafc", padding: "2px 7px", borderRadius: 6, textTransform: "uppercase" }}>
                      {exam?.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{formatDate(exam?.examDate)}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => exam?._id && handleViewExam(exam._id)} style={{ ...actionBtn(), width: 32, height: 32 }}>
                    <Eye size={13} />
                  </button>
                  <button onClick={() => exam?._id && handleToggleStatus(exam._id, exam.isActive)}
                    style={{ ...actionBtn(), width: 32, height: 32, color: exam?.isActive ? "#f59e0b" : "#10b981" }}>
                    {exam?.isActive ? <ShieldAlert size={13} /> : <ShieldCheck size={13} />}
                  </button>
                  <button onClick={() => { if (exam?._id) { setExamToDelete(exam); setShowDeleteModal(true); } }}
                    style={{ ...actionBtn(), width: 32, height: 32 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tablet / Desktop table */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                <tr>
                  <th style={thSt}>Exam Title</th>
                  {showBatch && <th style={{ ...thSt, textAlign: "center" }}>Course / Batch</th>}
                  {showDate && <th style={{ ...thSt, textAlign: "center" }}>Exam Date</th>}
                  {showStatus && <th style={{ ...thSt, textAlign: "center" }}>Status</th>}
                  <th style={{ ...thSt, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && !examToView ? (
                  <tr><td colSpan={colSpan} style={{ padding: "56px 16px", textAlign: "center" }}>
                    <Activity size={28} color="#3b82f6" style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
                  </td></tr>
                ) : (filteredExams || []).length === 0 ? (
                  <tr><td colSpan={colSpan} style={{ padding: "56px 16px", textAlign: "center" }}>
                    <Search size={40} color="#e2e8f0" style={{ margin: "0 auto 12px" }} />
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em" }}>NO_RECORDS_PURIFIED_FROM_QUERY</p>
                  </td></tr>
                ) : (filteredExams || []).map(exam => (
                  <tr key={exam?._id || Math.random()} style={{ borderBottom: "1px solid #f8fafc" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(248,250,252,0.8)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    {/* Title */}
                    <td style={{ padding: "16px 16px" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.02em" }}>{exam?.title || "UNTITLED"}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 9, color: "#94a3b8", fontFamily: "monospace", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{exam?.description || "NO_ANNOTATIONS"}</p>
                    </td>
                    {/* Course / Batch */}
                    {showBatch && (
                      <td style={{ padding: "16px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 9, fontWeight: 900, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "3px 9px", borderRadius: 7, textTransform: "uppercase", letterSpacing: "0.08em" }}>{exam?.course || "GENERAL"}</span>
                          <span style={{ fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{exam?.batch || "ALL_BATCHES"}</span>
                        </div>
                      </td>
                    )}
                    {/* Date */}
                    {showDate && (
                      <td style={{ padding: "16px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Calendar size={11} color="#94a3b8" />
                            <span style={{ fontSize: 11, fontWeight: 900, color: "#334155", textTransform: "uppercase" }}>{formatDate(exam?.examDate)}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Clock size={11} color="#94a3b8" />
                            <span style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>{formatTime(exam?.startTime)} – {formatTime(exam?.endTime)}</span>
                          </div>
                        </div>
                      </td>
                    )}
                    {/* Status */}
                    {showStatus && (
                      <td style={{ padding: "16px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ height: 5, width: 44, background: "#0f172a", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: exam?.isActive ? "100%" : "18%", background: exam?.isActive ? "#3b82f6" : "#475569", transition: "width 0.4s", boxShadow: exam?.isActive ? "0 0 8px rgba(59,130,246,0.5)" : "none" }} />
                          </div>
                          <span style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: exam?.isActive ? "#3b82f6" : "#64748b" }}>
                            {exam?.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>
                      </td>
                    )}
                    {/* Actions */}
                    <td style={{ padding: "16px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <button onClick={() => exam?._id && handleViewExam(exam._id)}
                          style={actionBtn()}
                          onMouseEnter={e => { e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(37,99,235,0.12)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
                          <Eye size={16} />
                        </button>
                        <button onClick={() => exam?._id && handleToggleStatus(exam._id, exam.isActive)}
                          style={{ ...actionBtn(), color: exam?.isActive ? "#f59e0b" : "#10b981" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = exam?.isActive ? "#fde68a" : "#a7f3d0"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.06)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
                          {exam?.isActive ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                        </button>
                        <button onClick={() => { if (exam?._id) { setExamToDelete(exam); setShowDeleteModal(true); } }}
                          style={actionBtn()}
                          onMouseEnter={e => { e.currentTarget.style.color = "#e11d48"; e.currentTarget.style.borderColor = "#fecdd3"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(225,29,72,0.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── VIEW MODAL ── */}
      {showViewModal && examToView && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.65)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: isMobile ? 10 : 20 }}>
          <div style={{ background: "#fff", borderRadius: isMobile ? 20 : 28, boxShadow: "0 32px 64px rgba(0,0,0,0.25)", width: "100%", maxWidth: 860, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* Modal header */}
            <div style={{ padding: isMobile ? "14px 16px" : "20px 28px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: isMobile ? 14 : 17, fontWeight: 900, color: "#0f172a", textTransform: "uppercase", letterSpacing: "-0.01em" }}>Exam Details</h3>
                  <p style={{ margin: "3px 0 0", fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "monospace" }}>ID: {examToView?._id || "N/A"}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)}
                style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "28px", display: "flex", flexDirection: "column", gap: 28 }}>
              {/* Summary */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: isMobile ? 12 : 20 }}>
                {[
                  { label: "Exam Title", value: examToView?.title || "N/A", icon: Hash },
                  { label: "Course", value: examToView?.course || "N/A", icon: Layers },
                  { label: "Batch", value: examToView?.batch || "N/A", icon: Database },
                  { label: "Marks", value: `${examToView?.totalMarks ?? 0} / PASS: ${examToView?.passingMarks ?? 0}`, icon: Trophy },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <item.icon size={12} color="#3b82f6" />
                      <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>{item.label}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.02em" }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Questions */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #f1f5f9", paddingBottom: 14, marginBottom: 18 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Activity size={16} color="#2563eb" />
                  </div>
                  <h4 style={{ margin: 0, fontSize: 12, fontWeight: 900, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Questions ({examToView?.questions?.length || 0})
                  </h4>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 18 }}>
                  {examToView?.questions?.map((q, i) => (
                    <div key={i} style={{ background: "#f8fafc", padding: isMobile ? 14 : 20, borderRadius: 16, border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ width: 26, height: 26, borderRadius: 8, background: "#0f172a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 9, fontWeight: 900, color: "#94a3b8", background: "#fff", padding: "3px 10px", borderRadius: 8, border: "1px solid #f1f5f9", textTransform: "uppercase" }}>
                          {q?.marks || 1} marks
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", lineHeight: 1.5, letterSpacing: "0.02em" }}>
                        {q?.question || "No question text"}
                      </p>
                      {q?.type === "mcq" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {q?.options?.map((opt, oi) => {
                            const isCorrect = q?.correctAnswer === oi.toString();
                            return (
                              <div key={oi} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 10, border: `1px solid ${isCorrect ? "#a7f3d0" : "#e2e8f0"}`, background: isCorrect ? "#ecfdf5" : "#fff" }}>
                                <span style={{ fontSize: 11, fontWeight: 900, color: isCorrect ? "#059669" : "#475569", textTransform: "uppercase" }}>
                                  {String.fromCharCode(65 + oi)}. {opt}
                                </span>
                                {isCorrect && <CheckCircle2 size={12} color="#10b981" />}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ padding: "10px 14px", background: "rgba(238,242,255,0.5)", borderRadius: 12, border: "1px solid #c7d2fe" }}>
                          <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 900, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.1em" }}>Correct Answer</p>
                          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#4338ca", lineHeight: 1.5 }}>{q?.correctAnswer || "No answer provided"}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && examToDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: isMobile ? 14 : 24 }}>
          <div style={{ background: "#fff", borderRadius: isMobile ? 20 : 28, boxShadow: "0 32px 64px rgba(0,0,0,0.2)", maxWidth: 420, width: "100%", padding: isMobile ? 24 : 36, textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 20px rgba(225,29,72,0.15)" }}>
              <AlertCircle size={34} color="#e11d48" />
            </div>
            <h3 style={{ margin: "0 0 10px", fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0f172a", textTransform: "uppercase", letterSpacing: "-0.01em" }}>Confirm Deletion</h3>
            <p style={{ margin: "0 0 28px", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1.6 }}>
              Delete "{examToDelete?.title || "this exam"}"? This action cannot be undone and removes all associated data.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button onClick={() => setShowDeleteModal(false)}
                style={{ padding: "13px 0", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 14, fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleDeleteExam} disabled={loading}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "13px 0", background: "#dc2626", color: "#fff", border: "none", borderRadius: 14, fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", opacity: loading ? 0.6 : 1, boxShadow: "0 4px 14px rgba(220,38,38,0.25)" }}>
                {loading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={13} />}
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}