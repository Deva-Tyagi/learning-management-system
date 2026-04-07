import { useEffect, useState } from "react";
import API_BASE_URL from "../../lib/utils";
import {
  FileText, Upload, Trash2, Download,
  Loader2, FolderOpen,
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

export default function Notes({ token }) {
  const [notes, setNotes] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [batchesList, setBatchesList] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignedTo, setAssignedTo] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sendEmail, setSendEmail] = useState(false);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  const fetchNotes = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/notes/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotes(await res.json());
    } catch { toast.error("Failed to load notes"); }
    finally { setLoading(false); }
  };

  const fetchMetadata = async () => {
    if (!token) return;
    try {
      const [coursesRes, studentsRes, batchesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/get`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/students/get`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/batches`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (batchesRes.ok) setBatchesList(await batchesRes.json());
    } catch {}
  };

  useEffect(() => { fetchNotes(); fetchMetadata(); }, [token]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) return toast.error("Title and PDF file are required");
    setUploadLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());
    formData.append("assignedTo", assignedTo);
    if (assignedTo === "course") formData.append("course", selectedCourse);
    if (assignedTo === "batch") formData.append("batch", selectedBatch);
    if (assignedTo === "student") formData.append("assignedStudents", JSON.stringify(selectedStudents));
    formData.append("sendEmail", sendEmail);
    try {
      const res = await fetch(`${API_BASE_URL}/notes/upload`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (res.ok) {
        toast.success("Study material uploaded successfully");
        setTitle(""); setFile(null); setSelectedStudents([]);
        fetchNotes();
      } else toast.error("Upload failed");
    } catch { toast.error("Error during upload"); }
    finally { setUploadLoading(false); }
  };

  const handleDownload = async (noteId, fileName) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notes/download/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download Error');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'note.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error('Failed to download note');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notes/delete/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { toast.success("Note deleted"); fetchNotes(); }
    } catch { toast.error("Error deleting note"); }
  };

  /* ── Style tokens ── */
  const inp = {
    width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 12, padding: "9px 14px", fontSize: 13, fontWeight: 500,
    color: "#334155", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 600, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5,
  };
  const section = {
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 20, padding: isMobile ? 18 : 28,
    marginTop: 8,
  };
  const g2 = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: isMobile ? 14 : 20,
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={section}>

        {/* ── HEADER ── */}
        <div style={{
          display: "flex", flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
          gap: 16, background: "#fff", padding: isMobile ? 14 : 20,
          borderRadius: 16, border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              <FileText size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 22, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Notes Management
              </h1>
              <p style={{ margin: "5px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 5 }}>
                <FolderOpen size={10} color="#3b82f6" /> Study Material & Digital Resources
              </p>
            </div>
          </div>
        </div>

        {/* ── Upload Form ── */}
        <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 16, padding: isMobile ? 16 : 24, marginBottom: 28 }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 12, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Upload New Material
          </h3>

          <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Title + Assign To */}
            <div style={g2}>
              <div>
                <label style={lbl}>Document Title</label>
                <input type="text" value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Unit 1: Introduction to Logic"
                  style={inp} required />
              </div>
              <div>
                <label style={lbl}>Assign To</label>
                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} style={inp}>
                  <option value="all">All Students</option>
                  <option value="course">Course Wise</option>
                  <option value="batch">Batch Wise</option>
                  <option value="student">Selected Students</option>
                </select>
              </div>
            </div>

            {/* Conditional: Course */}
            {assignedTo === "course" && (
              <div>
                <label style={lbl}>Select Course</label>
                <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={inp} required>
                  <option value="">Choose Course</option>
                  {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            )}

            {/* Conditional: Batch */}
            {assignedTo === "batch" && (
              <div>
                <label style={lbl}>Select Batch</label>
                <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={inp} required>
                  <option value="">Choose Batch</option>
                  {batchesList.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
            )}

            {/* Conditional: Students */}
            {assignedTo === "student" && (
              <div>
                <label style={lbl}>Select Students</label>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 10, maxHeight: 200, overflowY: "auto", background: "#fff", display: "flex", flexDirection: "column", gap: 2 }}>
                  {students.length === 0 ? (
                    <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", padding: "8px 0" }}>No students found</p>
                  ) : students.map(s => (
                    <label key={s._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", borderRadius: 8, cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <input type="checkbox" checked={selectedStudents.includes(s._id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedStudents([...selectedStudents, s._id]);
                          else setSelectedStudents(selectedStudents.filter(id => id !== s._id));
                        }}
                        style={{ width: 15, height: 15, cursor: "pointer", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>
                        {s.name}{" "}
                        <span style={{ color: "#94a3b8" }}>({s.course} - {s.rollNumber})</span>
                      </span>
                    </label>
                  ))}
                </div>
                {selectedStudents.length > 0 && (
                  <p style={{ margin: "6px 0 0", fontSize: 10, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {selectedStudents.length} student(s) selected
                  </p>
                )}
              </div>
            )}

            {/* PDF Upload */}
            <div>
              <label style={lbl}>PDF File</label>
              <div style={{ position: "relative" }}>
                <input type="file" accept="application/pdf"
                  onChange={e => setFile(e.target.files[0])}
                  style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10 }}
                  required />
                <div style={{ border: "2px dashed #e2e8f0", background: "#fff", borderRadius: 14, padding: "22px 16px", textAlign: "center", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "#eff6ff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#fff"; }}>
                  <Upload size={22} color={file ? "#3b82f6" : "#cbd5e1"} style={{ margin: "0 auto 8px" }} />
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: file ? "#2563eb" : "#64748b" }}>
                    {file ? file.name : "Select PDF Resource"}
                  </p>
                </div>
              </div>
            </div>

            {/* Email toggle + Submit */}
            <div style={{
              display: "flex", flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
              justifyContent: "space-between", gap: 14,
              paddingTop: 16, borderTop: "1px solid #e2e8f0",
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)}
                  style={{ width: 17, height: 17, cursor: "pointer" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Send Email Notification
                </span>
              </label>
              <button type="submit" disabled={uploadLoading}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "#2563eb", color: "#fff", border: "none", borderRadius: 12,
                  padding: "11px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  opacity: uploadLoading ? 0.6 : 1, boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
                  width: isMobile ? "100%" : "auto",
                }}>
                {uploadLoading
                  ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Uploading...</>
                  : <><Upload size={16} /> Upload Document</>}
              </button>
            </div>
          </form>
        </div>

        {/* ── Document Repository ── */}
        <div>
          <h3 style={{ margin: "0 0 18px", fontSize: 12, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 8 }}>
            <FolderOpen size={16} color="#3b82f6" /> All Documents
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : isDesktop ? "1fr 1fr 1fr" : "1fr 1fr",
            gap: isMobile ? 12 : 18,
          }}>
            {loading ? (
              <div style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center" }}>
                <Loader2 size={24} color="#e2e8f0" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : notes.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>
                No study material found
              </div>
            ) : notes.map(note => (
              <div key={note._id} style={{
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 16, padding: isMobile ? 16 : 20,
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                position: "relative", overflow: "hidden",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#bfdbfe"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
              >
                {/* Top row: icon + delete */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ padding: 10, background: "#eff6ff", borderRadius: 12 }}>
                    <FileText size={20} color="#2563eb" />
                  </div>
                  <button onClick={() => handleDelete(note._id)}
                    style={{ padding: 7, background: "none", border: "none", borderRadius: 8, color: "#cbd5e1", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#e11d48"; e.currentTarget.style.background = "#fff1f2"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#cbd5e1"; e.currentTarget.style.background = "none"; }}>
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Title + date + view */}
                <div>
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {note.title}
                  </h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {new Date(note.uploadDate).toLocaleDateString()}
                    </span>
                    <button onClick={() => handleDownload(note._id, note.fileName)}
                      style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: "#2563eb", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em", padding: 0 }}>
                      <Download size={11} /> Download PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}