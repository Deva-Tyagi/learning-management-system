import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "../../lib/axios";
import AddStudentModal from "../../components/AddStudentModal";
import BulkUploadModal from "../../components/BulkUploadModal";
import { CSVLink } from "react-csv";
import {
  Users, GraduationCap, CreditCard, BookOpen, Search,
  Download, UserPlus, Calendar, Trophy, Trash2, Edit3, Activity, Upload
} from "lucide-react";
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

const StudentAvatar = React.memo(({ student }) => {
  const getFallbackAvatar = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random&color=fff`;

  const [imgSrc, setImgSrc] = useState(
    student.photo
      ? student.photo.startsWith("http")
        ? student.photo
        : `${API_BASE_URL}${student.photo}`
      : getFallbackAvatar(student.name)
  );

  const handleImageError = useCallback(() => {
    setImgSrc(getFallbackAvatar(student.name));
  }, [student.name]);

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <img
        src={imgSrc}
        style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "block" }}
        alt={`${student.name}'s profile`}
        onError={handleImageError}
      />
    </div>
  );
});

export default function StudentDetails() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Authentication failed");
      const res = await axios.get("/students/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setStudents(data);
    } catch (err) {
      setError(err.message || "Failed to fetch student records");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() =>
    students.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase())
    ), [students, search]);

  const stats = useMemo(() => {
    const fees = students.reduce((sum, s) => sum + Number(s.feesPaid || s.totalPaid || s.paid || 0), 0);
    const courses = new Set(students.map(s => s.course).filter(Boolean)).size;
    const franchises = new Set(students.map(s => s.franchise).filter(Boolean)).size;
    return [
      { label: "Total Students", value: students.length, icon: Users, color: "#2563eb", bg: "#eff6ff" },
      { label: "Total Branches", value: franchises, icon: Activity, color: "#059669", bg: "#ecfdf5" },
      { label: "Total Courses", value: courses, icon: GraduationCap, color: "#4f46e5", bg: "#eef2ff" },
      { label: "Total Fees", value: `₹${fees.toLocaleString()}`, icon: CreditCard, color: "#d97706", bg: "#fffbeb" },
    ];
  }, [students]);

  const handleEdit = useCallback((student) => { 
    console.log("[DEBUG] handleEdit triggered!", {
        incomingStudent: student,
        hasID: !!student?._id
    });
    if (!student?._id) {
        console.error("[CRITICAL] handleEdit received student WITHOUT _id", student);
    }
    setEditingStudent(student); 
    setShowModal(true); 
  }, []);
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete student record? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`/students/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setStudents(prev => prev.filter(s => s._id !== id));
    } catch { alert("Delete failed."); }
  }, []);
  const handleUpdate = (updated) => {
    // Ensure we are getting the actual student object and not a wrapper
    const studentData = updated.student || updated;
    const studentId = studentData._id || studentData.id;
    const editingId = editingStudent?._id || editingStudent?.id;

    if (!studentId || !editingId) {
        console.error("Update failed: Missing ID", { studentData, editingStudent });
        return;
    }

    setStudents(prev => prev.map(s => (s._id === editingId || s.id === editingId) ? studentData : s));
    handleModalClose();
  };
  const handleModalClose = useCallback(() => { setShowModal(false); setEditingStudent(null); }, []);
  const handleStudentAdded = useCallback((newStudent) => {
    const actualStudent = newStudent.student || newStudent;
    if (actualStudent) setStudents(prev => [...prev, actualStudent]);
    handleModalClose();
  }, [handleModalClose]);

  /* ── Style tokens ── */
  const lbl = { margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" };
  const thStyle = { padding: "14px 20px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", whiteSpace: "nowrap" };

  /* ── Columns visible per breakpoint ── */
  // Mobile: Name + Course + Ops
  // Tablet: + Franchise + Batch
  // Desktop: all
  const showFranchise = !isMobile;
  const showBatch = !isMobile;
  const showDate = isDesktop;
  const showId = isDesktop;

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16 }}>
        <div style={{ width: 44, height: 44, border: "4px solid #0f172a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ ...lbl, letterSpacing: "0.12em" }}>Loading Students...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
        gap: 16, background: "#fff", padding: isMobile ? 16 : 20,
        borderRadius: 16, border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <Users size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 22, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              Students Management
            </h1>
            <p style={{ margin: "5px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 5 }}>
              <Activity size={10} color="#3b82f6" /> Manage Student Records
            </p>
          </div>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : isDesktop ? "1fr 1fr 1fr 1fr" : "1fr 1fr",
        gap: isMobile ? 10 : 16,
      }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: isMobile ? "14px 16px" : "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={lbl}>{stat.label}</p>
              <p style={{ margin: "6px 0 0", fontSize: isMobile ? 20 : 24, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" }}>{stat.value}</p>
            </div>
            <div style={{ padding: isMobile ? 10 : 12, borderRadius: 12, background: stat.bg, color: stat.color, flexShrink: 0 }}>
              <stat.icon size={isMobile ? 20 : 24} strokeWidth={2.5} />
            </div>
          </div>
        ))}
      </div>

      {/* ── TOOLBAR ── */}
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between", gap: 12,
        background: "#fff", padding: isMobile ? 14 : 16,
        borderRadius: 14, border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: isDesktop ? 400 : "100%" }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search students (Name, Roll No)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, paddingLeft: 36, paddingRight: 16, paddingTop: 9, paddingBottom: 9, fontSize: 13, fontWeight: 500, color: "#334155", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
          <CSVLink
            data={students}
            filename={`students-${new Date().toISOString().split("T")[0]}.csv`}
            style={{ textDecoration: "none" }}
          >
            <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 18px", fontSize: 11, fontWeight: 700, color: "#475569", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", width: isMobile ? "100%" : "auto" }}>
              <Download size={13} /> Export List
            </button>
          </CSVLink>
          <button
            onClick={() => setShowBulkModal(true)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 18px", fontSize: 11, fontWeight: 700, color: "#fff", background: "#4f46e5", border: "none", borderRadius: 10, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", boxShadow: "0 4px 14px rgba(79,70,229,0.2)", width: isMobile ? "100%" : "auto" }}
          >
            <Upload size={13} /> Import CSV
          </button>
          <button
            onClick={() => { setEditingStudent(null); setShowModal(true); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 22px", fontSize: 11, fontWeight: 700, color: "#fff", background: "#0f172a", border: "none", borderRadius: 10, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", boxShadow: "0 4px 14px rgba(15,23,42,0.15)", width: isMobile ? "100%" : "auto" }}
          >
            <UserPlus size={13} /> New Admission
          </button>
        </div>
      </div>

      {/* ── TABLE (desktop/tablet) / CARDS (mobile) ── */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>

        {isMobile ? (
          /* ── MOBILE CARD LIST ── */
          <div>
            {filteredStudents.length === 0 ? (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <Users size={40} color="#e2e8f0" style={{ margin: "0 auto 10px" }} />
                <p style={{ ...lbl, display: "block" }}>No Students Found</p>
              </div>
            ) : (
              filteredStudents.map((student, idx) => (
                <div key={student._id} style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <StudentAvatar student={student} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.name}</p>
                        <p style={{ margin: "3px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                          <Trophy size={9} color="#3b82f6" /> {student.rollNumber || "NO-ID"}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                        <button onClick={() => handleEdit(student)}
                          style={{ padding: 7, background: "none", border: "none", borderRadius: 8, color: "#94a3b8", cursor: "pointer" }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(student._id)}
                          style={{ padding: 7, background: "none", border: "none", borderRadius: 8, color: "#94a3b8", cursor: "pointer" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#4f46e5", background: "#eef2ff", border: "1px solid #c7d2fe", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                        <BookOpen size={9} /> {student.course}
                      </span>
                      {student.franchise && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                          {student.franchise}
                        </span>
                      )}
                      {student.batch && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#475569", background: "#f1f5f9", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                          {student.batch}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* ── TABLET / DESKTOP TABLE ── */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}>
                <tr>
                  {showId && <th style={thStyle}>#</th>}
                  <th style={thStyle}>Student Name</th>
                  {showFranchise && <th style={thStyle}>Branch</th>}
                  <th style={thStyle}>Course Name</th>
                  {showBatch && <th style={thStyle}>Batch Name</th>}
                  {showDate && <th style={thStyle}>Date Joined</th>}
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={[showId, true, showFranchise, true, showBatch, showDate, true].filter(Boolean).length}
                      style={{ padding: "48px 24px", textAlign: "center", color: "#94a3b8" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                        <Users size={40} color="#e2e8f0" />
                        <p style={{ ...lbl, display: "block" }}>No Registry Entries Identified</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => (
                    <tr key={student._id}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {showId && (
                        <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>#{String(idx + 1).padStart(3, "0")}</span>
                        </td>
                      )}
                      <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <StudentAvatar student={student} />
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: 13 }}>{student.name}</p>
                            <p style={{ margin: "3px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                              <Trophy size={9} color="#3b82f6" /> {student.rollNumber || "NO-ID"}
                            </p>
                          </div>
                        </div>
                      </td>
                      {showFranchise && (
                        <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Activity size={13} color="#10b981" />
                            <span style={{ fontWeight: 700, color: "#475569", fontSize: 12 }}>{student.franchise || "Main Campus"}</span>
                          </div>
                        </td>
                      )}
                      <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#4f46e5", background: "#eef2ff", padding: "3px 9px", borderRadius: 6, border: "1px solid #c7d2fe", display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <BookOpen size={9} /> {student.course}
                        </span>
                      </td>
                      {showBatch && (
                        <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#475569", background: "#f1f5f9", padding: "3px 9px", borderRadius: 6 }}>
                            {student.batch}
                          </span>
                        </td>
                      )}
                      {showDate && (
                        <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#94a3b8" }}>
                            <Calendar size={13} />
                            <span style={{ fontSize: 12, fontWeight: 500 }}>
                              {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "N/A"}
                            </span>
                          </div>
                        </td>
                      )}
                      <td style={{ padding: "14px 20px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                          <button onClick={() => handleEdit(student)}
                            style={{ padding: 7, background: "none", border: "none", borderRadius: 8, color: "#94a3b8", cursor: "pointer" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "none"; }}
                            title="Edit Record">
                            <Edit3 size={15} />
                          </button>
                          <button onClick={() => handleDelete(student._id)}
                            style={{ padding: 7, background: "none", border: "none", borderRadius: 8, color: "#94a3b8", cursor: "pointer" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "#fef2f2"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "none"; }}
                            title="Purge Record">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{
          background: "#f8fafc", padding: isMobile ? "10px 16px" : "12px 20px",
          borderTop: "1px solid #f1f5f9", display: "flex",
          justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
        }}>
          <p style={{ ...lbl, margin: 0 }}>
            List Summary • {filteredStudents.length} Students Total
          </p>
          {search && (
            <p style={{ ...lbl, margin: 0, color: "#3b82f6" }}>
              Filtered Search Results
            </p>
          )}
        </div>
      </div>

      {showModal && (
        <AddStudentModal
          student={editingStudent}
          isEditing={!!editingStudent}
          onClose={handleModalClose}
          onStudentAdded={handleStudentAdded}
          onStudentUpdated={handleUpdate}
        />
      )}
      
      {showBulkModal && (
        <BulkUploadModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            fetchStudents();
          }}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}