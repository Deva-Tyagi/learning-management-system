import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import axios from "../../lib/axios";
import AddStudentModal from "../../components/AddStudentModal";
import BulkUploadModal from "../../components/BulkUploadModal";
import ViewRegistrationModal from "../../components/ViewRegistrationModal";
import ViewFeeStructureModal from "../../components/ViewFeeStructureModal";
import { CSVLink } from "react-csv";
import {
  Users, GraduationCap, CreditCard, BookOpen, Search,
  Download, UserPlus, Calendar, Trophy, Trash2, Edit3,
  Activity, Upload, Eye, Printer, DollarSign, ChevronDown, BarChart2
} from "lucide-react";
import API_BASE_URL from "../../lib/utils";

/* ─── Window Width ─── */
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

/* ─── Status dot badge ─── */
const STATUS_CFG = {
  Active:    { color: "#16a34a", dot: "#16a34a" },
  Completed: { color: "#2563eb", dot: "#2563eb" },
  "On Hold": { color: "#d97706", dot: "#f59e0b" },
  Inactive:  { color: "#d97706", dot: "#f59e0b" },
};
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG["On Hold"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: cfg.color, whiteSpace: "nowrap" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {status || "Active"}
    </span>
  );
};

/* ─── Avatar ─── */
const Avatar = React.memo(({ student }) => {
  const fallback = (n) => `https://ui-avatars.com/api/?name=${encodeURIComponent(n || "U")}&background=random&color=fff&size=80`;
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (student?.photo) {
      setSrc(student.photo.startsWith("http") ? student.photo : `${API_BASE_URL}${student.photo}`);
    } else {
      setSrc(fallback(student?.name));
    }
  }, [student?.photo, student?.name]);

  return (
    <img 
      src={src || fallback(student?.name)} 
      alt={student?.name || "User"} 
      onError={() => setSrc(fallback(student?.name))}
      style={{ width: 36, height: 36, borderRadius: 9, objectFit: "cover", border: "2px solid #e2e8f0", flexShrink: 0, display: "block" }} 
    />
  );
});

/* ─── Tiny action icon button ─── */
const Btn = ({ title, onClick, hoverColor, hoverBg, children }) => {
  const [h, setH] = useState(false);
  return (
    <button title={title} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 28, height: 28, border: "none", borderRadius: 7, cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: h ? hoverBg : "transparent",
        color: h ? hoverColor : "#94a3b8",
        transition: "all 0.12s", flexShrink: 0,
      }}>
      {children}
    </button>
  );
};

/* ─── Stat Card ─── */
const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 0 }}>
    <div style={{ minWidth: 0, flex: 1 }}>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      <p style={{ margin: "5px 0 0", fontSize: 20, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</p>
    </div>
    <div style={{ width: 42, height: 42, borderRadius: 11, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0, marginLeft: 10 }}>
      <Icon size={19} strokeWidth={2.5} />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   GLOBAL STYLES injected once — fixes scrollbar visibility
   ══════════════════════════════════════════════════════ */
const GLOBAL_STYLE = `
  .sd-scroll::-webkit-scrollbar        { height: 8px; }
  .sd-scroll::-webkit-scrollbar-track  { background: #f1f5f9; border-radius: 99px; }
  .sd-scroll::-webkit-scrollbar-thumb  { background: #94a3b8; border-radius: 99px; }
  .sd-scroll::-webkit-scrollbar-thumb:hover { background: #64748b; }
  .sd-scroll { scrollbar-width: thin; scrollbar-color: #94a3b8 #f1f5f9; }
  @keyframes sd-spin { to { transform: rotate(360deg); } }
  .sd-tr:hover td { background: #f0f9ff !important; }
`;

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function StudentDetails({ setActiveSection, openAddModal }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [batchFilter, setBatchFilter]   = useState("");

  const [showAddModal, setShowAddModal]     = useState(false);
  const [showBulkModal, setShowBulkModal]   = useState(false);
  const [editStudent, setEditStudent]       = useState(null);
  const [viewRegStudent, setViewRegStudent] = useState(null);
  const [viewFeeStudent, setViewFeeStudent] = useState(null);

  const openAddRef = useRef(false);
  const width = useWindowWidth();
  const isMobile = width < 640;

  /* ── fetch ── */
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Not authenticated");
      const res = await axios.get("/students/get", { headers: { Authorization: `Bearer ${token}` } });
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.message || "Failed to load students");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    if (openAddModal && !openAddRef.current) {
      openAddRef.current = true;
      setEditStudent(null);
      setShowAddModal(true);
    }
  }, [openAddModal]);

  const courseOptions = useMemo(() => [...new Set(students.map(s => s.course).filter(Boolean))], [students]);
  const batchOptions  = useMemo(() => [...new Set(students.map(s => s.batch).filter(Boolean))], [students]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(s => {
      if (search && !s.name?.toLowerCase().includes(q) && !s.rollNumber?.toLowerCase().includes(q) && !s.phone?.includes(q)) return false;
      if (statusFilter && s.status !== statusFilter && !(statusFilter === "On Hold" && s.status === "Inactive")) return false;
      if (courseFilter && s.course !== courseFilter) return false;
      if (batchFilter  && s.batch  !== batchFilter)  return false;
      return true;
    });
  }, [students, search, statusFilter, courseFilter, batchFilter]);

  const stats = useMemo(() => {
    const fees = students.reduce((acc, s) => acc + Number(s.feesPaid || 0), 0);
    return [
      { label: "Total Students", value: students.length,                                              icon: Users,        color: "#2563eb", bg: "#eff6ff" },
      { label: "Total Branches", value: new Set(students.map(s=>s.franchise).filter(Boolean)).size,   icon: Activity,     color: "#059669", bg: "#ecfdf5" },
      { label: "Total Courses",  value: new Set(students.map(s=>s.course).filter(Boolean)).size,      icon: GraduationCap,color: "#4f46e5", bg: "#eef2ff" },
      { label: "Total Fees",     value: `₹${fees.toLocaleString("en-IN")}`,                           icon: CreditCard,   color: "#d97706", bg: "#fffbeb" },
    ];
  }, [students]);

  /* ── Handlers ── */
  const handleEdit   = useCallback((s) => { setEditStudent(s); setShowAddModal(true); }, []);
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this student? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`/students/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setStudents(prev => prev.filter(s => s._id !== id));
    } catch { alert("Delete failed."); }
  }, []);
  const handleUpdate = useCallback((updated) => {
    const data = updated.student || updated;
    const id   = data._id || data.id;
    const eid  = editStudent?._id || editStudent?.id;
    if (id && eid) setStudents(prev => prev.map(s => (s._id === eid || s.id === eid) ? data : s));
    setShowAddModal(false); setEditStudent(null);
  }, [editStudent]);
  const handleAdded  = useCallback((n) => {
    const actual = n.student || n;
    if (actual) setStudents(prev => [actual, ...prev]);
    setShowAddModal(false); setEditStudent(null);
  }, []);
  const handlePrint   = useCallback((s) => setViewRegStudent({ ...s, _print: true }), []);
  const handleIdCard  = useCallback(() => { if (setActiveSection) setActiveSection("id-cards"); }, [setActiveSection]);

  /* ── Table styles ── */
  const TH = (extra = {}) => ({
    padding: "11px 14px", fontSize: 10, fontWeight: 800, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "left",
    whiteSpace: "nowrap", borderBottom: "1px solid #f1f5f9", background: "#fff",
    ...extra,
  });
  const TD = (extra = {}) => ({
    padding: "12px 14px", verticalAlign: "middle",
    whiteSpace: "nowrap", borderBottom: "1px solid #f8fafc", background: "#fff",
    ...extra,
  });
  /* Frozen left offsets: col1=64, col2=64+220=284, col3=284+140=424 */
  const L1 = 0, L2 = 64, L3 = 284;

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 14 }}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ width: 40, height: 40, border: "4px solid #e2e8f0", borderTopColor: "#0f172a", borderRadius: "50%", animation: "sd-spin 0.85s linear infinite" }} />
      <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Loading Students…</p>
    </div>
  );

  return (
    <>
      <style>{GLOBAL_STYLE}</style>

      {/*
        OUTER WRAPPER
        - width: 100% + minWidth: 0 → prevents flex-child overflow (right bleed)
        - NO overflow:hidden here → table's horizontal scroll must not be clipped
      */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", minWidth: 0 }}>

        {/* ══ HEADER ══ */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          padding: "14px 20px",
          display: "flex", flexWrap: "wrap", alignItems: "center",
          justifyContent: "space-between", gap: 12,
          /* width stays within parent — no fixed/min-width overrides */
          boxSizing: "border-box",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: "1 1 200px" }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              <Users size={19} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Students Management
              </h1>
              <p style={{ margin: "3px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 4 }}>
                <Activity size={9} color="#3b82f6" /> Manage Student Records
              </p>
            </div>
          </div>

          {/* Buttons wrap naturally — no overflow */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
            <CSVLink data={filtered} filename={`students-${new Date().toISOString().split("T")[0]}.csv`} style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 11, fontWeight: 700, color: "#475569", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9, cursor: "pointer", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                <Download size={13} /> Export
              </button>
            </CSVLink>
            <button onClick={() => setShowBulkModal(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 11, fontWeight: 700, color: "#fff", background: "#4f46e5", border: "none", borderRadius: 9, cursor: "pointer", textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 3px 10px rgba(79,70,229,0.22)" }}>
              <Upload size={13} /> Import CSV
            </button>
            <button onClick={() => { setEditStudent(null); setShowAddModal(true); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 11, fontWeight: 700, color: "#fff", background: "#0f172a", border: "none", borderRadius: 9, cursor: "pointer", textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 3px 10px rgba(15,23,42,0.18)" }}>
              <UserPlus size={13} /> + New Admission
            </button>
          </div>
        </div>

        {/* ══ STAT CARDS ══ */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12 }}>
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* ══ FILTER BAR ══ */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
          padding: "11px 14px", display: "flex", alignItems: "center",
          flexWrap: "wrap", gap: 10, boxSizing: "border-box",
        }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 180px", minWidth: 150 }}>
            <Search size={14} color="#94a3b8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="text" placeholder="Search by name, roll no, phone..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9, paddingLeft: 32, paddingRight: 10, paddingTop: 8, paddingBottom: 8, fontSize: 13, fontWeight: 500, color: "#334155", outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Status pills */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {[
              { key: "",          label: "All" },
              { key: "Active",    label: "Active" },
              { key: "On Hold",   label: "On Hold" },
              { key: "Completed", label: "Completed" },
            ].map(pill => {
              const active = statusFilter === pill.key;
              return (
                <button key={pill.key} onClick={() => setStatusFilter(pill.key)}
                  style={{ padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", transition: "all 0.13s", background: active ? "#0f172a" : "#f1f5f9", color: active ? "#fff" : "#64748b", whiteSpace: "nowrap" }}>
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Course */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
              style={{ appearance: "none", WebkitAppearance: "none", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 26px 7px 11px", fontSize: 12, fontWeight: 600, color: "#334155", cursor: "pointer", outline: "none" }}>
              <option value="">Course ▾</option>
              {courseOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={11} color="#94a3b8" style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>

          {/* Batch */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
              style={{ appearance: "none", WebkitAppearance: "none", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 26px 7px 11px", fontSize: 12, fontWeight: 600, color: "#334155", cursor: "pointer", outline: "none" }}>
              <option value="">Batch ▾</option>
              {batchOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={11} color="#94a3b8" style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        </div>

        {/* ══ TABLE CARD ══
            CRITICAL: the card itself must NOT have overflow:hidden
            or it will clip the scrollbar inside. Instead use borderRadius
            on inner elements.
        */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16 }}>

          {error && (
            <div style={{ padding: "11px 16px", background: "#fff1f2", borderBottom: "1px solid #fecdd3", fontSize: 12, fontWeight: 700, color: "#be123c", borderRadius: "16px 16px 0 0" }}>
              ⚠ {error}
            </div>
          )}

          {isMobile ? (
            /* ─── MOBILE CARDS ─── */
            <div>
              {filtered.length === 0 ? (
                <div style={{ padding: "50px 20px", textAlign: "center" }}>
                  <Users size={36} color="#e2e8f0" style={{ margin: "0 auto 10px", display: "block" }} />
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>No students found</p>
                </div>
              ) : filtered.map(s => (
                <div key={s._id} style={{ display: "flex", gap: 12, padding: "13px 14px", borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}>
                  <Avatar student={s} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>{s.rollNumber || "—"} · {s.phone}</p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
                      {s.course && <span style={{ fontSize: 10, fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "2px 8px", borderRadius: 6 }}>{s.course}</span>}
                      {s.batch && <span style={{ fontSize: 10, fontWeight: 700, color: "#475569", background: "#f1f5f9", padding: "2px 8px", borderRadius: 6 }}>{s.batch}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 2, marginTop: 8 }}>
                      <Btn title="View Registration" onClick={() => setViewRegStudent(s)} hoverColor="#2563eb" hoverBg="#eff6ff"><Eye size={13} /></Btn>
                      <Btn title="Print" onClick={() => handlePrint(s)} hoverColor="#059669" hoverBg="#ecfdf5"><Printer size={13} /></Btn>
                      <Btn title="Edit" onClick={() => handleEdit(s)} hoverColor="#4f46e5" hoverBg="#eef2ff"><Edit3 size={13} /></Btn>
                      <Btn title="ID Card" onClick={handleIdCard} hoverColor="#7c3aed" hoverBg="#f5f3ff"><CreditCard size={13} /></Btn>
                      <Btn title="Fee Structure" onClick={() => setViewFeeStudent(s)} hoverColor="#d97706" hoverBg="#fffbeb"><DollarSign size={13} /></Btn>
                      <Btn title="Delete" onClick={() => handleDelete(s._id)} hoverColor="#dc2626" hoverBg="#fef2f2"><Trash2 size={13} /></Btn>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /*
              ─── DESKTOP: TABLE with horizontal scroll ───
              .sd-scroll gives it the styled scrollbar from GLOBAL_STYLE.
              overflow-x: scroll (not auto) → always renders the bar.
              The table has a fixed minWidth that exceeds any viewport,
              forcing the scroll.
            */
            <div
              className="sd-scroll"
              style={{
                overflowX: "scroll",
                overflowY: "visible",
                borderRadius: "0 0 16px 16px",
                /* scrollbar-gutter keeps layout stable */
                scrollbarGutter: "stable",
              }}
            >
              <table style={{
                borderCollapse: "collapse",
                tableLayout: "fixed",
                /* 64+220+140+200+130+140+120+130+110+210 = 1464px */
                minWidth: 1464,
                width: "100%",
              }}>
                <colgroup>
                  <col style={{ width: 64 }} />    {/* # */}
                  <col style={{ width: 220 }} />   {/* STUDENT */}
                  <col style={{ width: 140 }} />   {/* PHONE */}
                  <col style={{ width: 200 }} />   {/* EMAIL */}
                  <col style={{ width: 130 }} />   {/* BRANCH */}
                  <col style={{ width: 140 }} />   {/* COURSE */}
                  <col style={{ width: 120 }} />   {/* BATCH */}
                  <col style={{ width: 130 }} />   {/* DATE JOINED */}
                  <col style={{ width: 110 }} />   {/* STATUS */}
                  <col style={{ width: 210 }} />   {/* ACTIONS */}
                </colgroup>

                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    <th style={TH({ position: "sticky", left: L1, zIndex: 4, boxShadow: "inset -1px 0 0 #f1f5f9" })}>#</th>
                    <th style={TH({ position: "sticky", left: L2, zIndex: 4, boxShadow: "inset -1px 0 0 #f1f5f9" })}>Student</th>
                    <th style={TH({ position: "sticky", left: L3, zIndex: 4, boxShadow: "2px 0 6px rgba(0,0,0,0.07)" })}>Phone</th>
                    <th style={TH()}>Email Address</th>
                    <th style={TH()}>Branch</th>
                    <th style={TH()}>Course Name</th>
                    <th style={TH()}>Batch Name</th>
                    <th style={TH()}>Date Joined</th>
                    <th style={TH()}>Status</th>
                    <th style={TH({ textAlign: "right" })}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: "56px 20px", textAlign: "center" }}>
                        <Users size={36} color="#e2e8f0" style={{ margin: "0 auto 10px", display: "block" }} />
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>No students found</p>
                      </td>
                    </tr>
                  ) : filtered.map((s, idx) => (
                    <tr key={s._id} className="sd-tr">
                      {/* FROZEN: # */}
                      <td style={TD({ position: "sticky", left: L1, zIndex: 2, boxShadow: "inset -1px 0 0 #f1f5f9" })}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>#{String(idx + 1).padStart(3, "0")}</span>
                      </td>

                      {/* FROZEN: STUDENT */}
                      <td style={TD({ position: "sticky", left: L2, zIndex: 2, boxShadow: "inset -1px 0 0 #f1f5f9" })}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar student={s} />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 148 }}>{s.name}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}>
                              <Trophy size={8} color="#3b82f6" />{s.rollNumber || "NO-ID"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* FROZEN: PHONE — right shadow marks freeze boundary */}
                      <td style={TD({ position: "sticky", left: L3, zIndex: 2, boxShadow: "2px 0 6px rgba(0,0,0,0.06)" })}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{s.phone || "—"}</span>
                      </td>

                      {/* EMAIL */}
                      <td style={TD()}>
                        <span style={{ fontSize: 12, color: "#64748b", display: "block", maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis" }}>{s.email || "—"}</span>
                      </td>

                      {/* BRANCH */}
                      <td style={TD()}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#ecfdf5", padding: "3px 9px", borderRadius: 6 }}>
                          {s.franchise || "Main Branch"}
                        </span>
                      </td>

                      {/* COURSE */}
                      <td style={TD()}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: "#4f46e5", background: "#eef2ff", border: "1px solid #c7d2fe", padding: "3px 9px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4, textTransform: "uppercase" }}>
                          <BookOpen size={8} />{s.course}
                        </span>
                      </td>

                      {/* BATCH */}
                      <td style={TD()}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", background: "#f1f5f9", padding: "3px 9px", borderRadius: 6 }}>
                          {s.batch || "—"}
                        </span>
                      </td>

                      {/* DATE JOINED */}
                      <td style={TD()}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b" }}>
                          <Calendar size={12} />
                          <span style={{ fontSize: 12 }}>
                            {s.admissionDate
                              ? new Date(s.admissionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                              : "—"}
                          </span>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td style={TD()}><StatusBadge status={s.status} /></td>

                      {/* ACTIONS */}
                      <td style={TD({ textAlign: "right" })}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                          <Btn title="View Registration"  onClick={() => setViewRegStudent(s)} hoverColor="#2563eb" hoverBg="#eff6ff"><Eye size={13} /></Btn>
                          <Btn title="Print Registration" onClick={() => handlePrint(s)}        hoverColor="#059669" hoverBg="#ecfdf5"><Printer size={13} /></Btn>
                          <Btn title="Edit Student"       onClick={() => handleEdit(s)}          hoverColor="#4f46e5" hoverBg="#eef2ff"><Edit3 size={13} /></Btn>
                          <Btn title="View ID Card"       onClick={handleIdCard}                 hoverColor="#7c3aed" hoverBg="#f5f3ff"><CreditCard size={13} /></Btn>
                          <Btn title="Fee Structure"      onClick={() => setViewFeeStudent(s)}   hoverColor="#d97706" hoverBg="#fffbeb"><DollarSign size={13} /></Btn>
                          <Btn title="Delete Student"     onClick={() => handleDelete(s._id)}    hoverColor="#dc2626" hoverBg="#fef2f2"><Trash2 size={13} /></Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: "11px 18px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Showing {filtered.length} of {students.length} students{statusFilter ? ` · ${statusFilter}` : ""}
            </p>
            {setActiveSection && (
              <button onClick={() => setActiveSection("students-reports")}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#2563eb", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <BarChart2 size={12} /> View Reports →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ MODALS ══ */}
      {showAddModal && (
        <AddStudentModal
          student={editStudent} isEditing={!!editStudent}
          onClose={() => { setShowAddModal(false); setEditStudent(null); }}
          onStudentAdded={handleAdded}
          onStudentUpdated={handleUpdate}
          onRefresh={fetchStudents}
        />
      )}
      {showBulkModal && (
        <BulkUploadModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => { fetchStudents(); setShowBulkModal(false); }}
        />
      )}
      {viewRegStudent && (
        <ViewRegistrationModal
          student={viewRegStudent}
          onClose={() => setViewRegStudent(null)}
          autoPrint={!!viewRegStudent._print}
        />
      )}
      {viewFeeStudent && (
        <ViewFeeStructureModal
          student={viewFeeStudent}
          onClose={() => setViewFeeStudent(null)}
        />
      )}
    </>
  );
}