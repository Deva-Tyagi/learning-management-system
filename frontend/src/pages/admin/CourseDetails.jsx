import React, { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { toast } from "sonner";
import {
  Plus, Edit3, Trash2, FilePlus2, BookMarked, FileText, X,
  Database, IndianRupee, FileDown, Upload, File
} from "lucide-react";

/* ─── Hook: real window width ─── */
function useWindowWidth() {
  const [width, setWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

/* ── Shared style tokens ── */
const lbl = { fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" };
const inp = { width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#334155", outline: "none", boxSizing: "border-box" };
const btnPrimary = { padding: "10px 20px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 };

/* ── DynamicList ── */
function DynamicList({ label, items, onChange, placeholder }) {
  const add = () => onChange([...items, ""]);
  const update = (i, val) => { const n = [...items]; n[i] = val; onChange(n); };
  const remove = i => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
      <label style={{ ...lbl, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {label}
        <button type="button" onClick={add} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", display: "flex" }}><Plus size={14} /></button>
      </label>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8 }}>
            <input value={item} onChange={e => update(i, e.target.value)} style={{ ...inp, flex: 1 }} placeholder={placeholder} />
            <button type="button" onClick={() => remove(i)} style={{ padding: "0 10px", background: "#fee2e2", border: "none", borderRadius: 8, color: "#ef4444", cursor: "pointer" }}><Trash2 size={14} /></button>
          </div>
        ))}
        {items.length === 0 && <div style={{ fontSize: 11, color: "#94a3b8" }}>No items added.</div>}
      </div>
    </div>
  );
}

/* ── CurriculumBuilder ── */
function CurriculumBuilder({ curriculum, onChange }) {
  const addModule = () => onChange([...curriculum, { module: "", topics: [""], duration: "" }]);
  const updateMod = (i, field, val) => { const n = [...curriculum]; n[i][field] = val; onChange(n); };
  const addTopic = (i) => { const n = [...curriculum]; n[i].topics.push(""); onChange(n); };
  const setTopic = (i, tIdx, val) => { const n = [...curriculum]; n[i].topics[tIdx] = val; onChange(n); };
  const remTopic = (i, tIdx) => { const n = [...curriculum]; n[i].topics.splice(tIdx, 1); onChange(n); };
  const remMod = i => onChange(curriculum.filter((_, idx) => idx !== i));

  return (
    <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
      <label style={{ ...lbl, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Curriculum Modules
        <button type="button" onClick={addModule} style={{ background: "#e0e7ff", padding: "4px 8px", borderRadius: 6, border: "none", color: "#4f46e5", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>+ Add Module</button>
      </label>
      <div style={{ display: "grid", gap: 16, marginTop: 10 }}>
        {curriculum.map((m, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: 12, borderRadius: 8 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <input value={m.module} onChange={e => updateMod(i, "module", e.target.value)} style={{ ...inp, flex: "2 1 160px" }} placeholder="Module Name (e.g. Basics of UI)" />
              <input value={m.duration} onChange={e => updateMod(i, "duration", e.target.value)} style={{ ...inp, flex: "1 1 120px" }} placeholder="Duration (e.g. 2 Weeks)" />
              <button type="button" onClick={() => remMod(i)} style={{ padding: "0 10px", background: "#fee2e2", border: "none", borderRadius: 8, color: "#ef4444", cursor: "pointer" }}><Trash2 size={14} /></button>
            </div>
            <div style={{ paddingLeft: 10, borderLeft: "2px solid #e2e8f0", display: "grid", gap: 8 }}>
              {m.topics.map((t, tIdx) => (
                <div key={tIdx} style={{ display: "flex", gap: 6 }}>
                  <input value={t} onChange={e => setTopic(i, tIdx, e.target.value)} style={{ ...inp, padding: "6px 10px", fontSize: 11 }} placeholder="Topic Name" />
                  <button type="button" onClick={() => remTopic(i, tIdx)} style={{ background: "none", color: "#94a3b8", border: "none", cursor: "pointer" }}><X size={14} /></button>
                </div>
              ))}
              <button type="button" onClick={() => addTopic(i)} style={{ justifySelf: "start", fontSize: 10, background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontWeight: 700 }}>+ Add Topic</button>
            </div>
          </div>
        ))}
        {curriculum.length === 0 && <div style={{ fontSize: 11, color: "#94a3b8" }}>No modules added.</div>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 * 1. ALL COURSES
 * ───────────────────────────────────────────────────── */
function AllCourses({ token, setActiveSection, setEditingCourseId }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const width = useWindowWidth();
  const isMobile = width < 640;

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get("/courses", { headers: { Authorization: `Bearer ${token}` } });
      setCourses(data);
    } catch { toast.error("Failed to load courses"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete course?")) return;
    try {
      await axios.delete(`/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Course deleted");
      fetchCourses();
    } catch { toast.error("Failed to delete"); }
  };

  const filtered = courses.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.courseCode?.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter && c.category !== catFilter) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: isMobile ? 16 : 24 }}>
      {/* Filters */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginBottom: 20 }}>
        <input type="text" placeholder="Search course name or code..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, flex: 1 }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ ...inp, width: isMobile ? "100%" : 200 }}>
          <option value="">All Categories</option>
          <option value="computerCourses">Computer Courses</option>
          <option value="englishCourses">English Speaking</option>
          <option value="distanceLearning">Distance Learning</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inp, width: isMobile ? "100%" : 150 }}>
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Mobile: card list / Desktop: table */}
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(c => (
            <div key={c._id} style={{ border: "1px solid #f1f5f9", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{c.courseCode || "N/A"}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { setEditingCourseId(c._id); setActiveSection("courses-add"); }} style={{ padding: 6, background: "none", border: "1px solid #e2e8f0", borderRadius: 8, color: "#64748b", cursor: "pointer" }}><Edit3 size={13} /></button>
                  <button onClick={() => handleDelete(c._id)} style={{ padding: 6, background: "none", border: "1px solid #fee2e2", borderRadius: 8, color: "#ef4444", cursor: "pointer" }}><Trash2 size={13} /></button>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{ background: "#eff6ff", color: "#2563eb", padding: "3px 8px", borderRadius: 6, fontSize: 10, textTransform: "uppercase", fontWeight: 700 }}>{c.category}</span>
                <span style={{ background: c.status === "Active" ? "#dcfce7" : c.status === "Completed" ? "#dbeafe" : "#f1f5f9", color: c.status === "Active" ? "#16a34a" : c.status === "Completed" ? "#2563eb" : "#64748b", padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{c.status || "Active"}</span>
                {(c.durationMonths || c.duration) && <span style={{ background: "#f8fafc", color: "#475569", padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>{c.durationMonths ? `${c.durationMonths} Months` : c.duration}</span>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", fontSize: 12, color: "#94a3b8" }}>No courses found.</div>}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                {["Course / Code", "Category", "Duration", "Desc", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c._id} style={{ borderBottom: "1px solid #f1f5f9" }}
                  onMouseOver={e => e.currentTarget.style.background = "#fafafa"}
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#1e293b" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{c.courseCode || "N/A"}</div>
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{ background: "#eff6ff", color: "#2563eb", padding: "4px 8px", borderRadius: 6, fontSize: 10, textTransform: "uppercase", fontWeight: 700 }}>{c.category}</span>
                  </td>
                  <td style={{ padding: 16, fontSize: 12, fontWeight: 600 }}>{c.durationMonths ? `${c.durationMonths} Months` : c.duration || "-"}</td>
                  <td style={{ padding: 16, fontSize: 11, color: "#64748b", maxWidth: 200, WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.shortDescription}</td>
                  <td style={{ padding: 16 }}>
                    <span style={{ background: c.status === "Active" ? "#dcfce7" : c.status === "Completed" ? "#dbeafe" : "#f1f5f9", color: c.status === "Active" ? "#16a34a" : c.status === "Completed" ? "#2563eb" : "#64748b", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{c.status || "Active"}</span>
                  </td>
                  <td style={{ padding: 16 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setEditingCourseId(c._id); setActiveSection("courses-add"); }} style={{ padding: 6, background: "none", border: "1px solid #e2e8f0", borderRadius: 8, color: "#64748b", cursor: "pointer" }}><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(c._id)} style={{ padding: 6, background: "none", border: "1px solid #fee2e2", borderRadius: 8, color: "#ef4444", cursor: "pointer" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 * 2. ADD / EDIT COURSE
 * ───────────────────────────────────────────────────── */
function AddCourse({ token, editingId, setEditingId, setActiveSection }) {
  const width = useWindowWidth();
  const isMobile = width < 640;

  const [form, setForm] = useState({
    name: "", courseCode: "", category: "computerCourses", durationMonths: "",
    totalFee: "", feeType: "Monthly", defaultInstallments: 3, level: "Beginner", status: "Active",
    shortDescription: "", fullDescription: "", subjects: [],
    learningOutcomes: [], whyThisCourse: [], prerequisites: [], toolsUsed: [], careerOpportunities: [], curriculum: []
  });
  const [image, setImage] = useState(null);
  const [subjectsList, setSubjectsList] = useState([]);

  useEffect(() => {
    axios.get("/subjects", { headers: { Authorization: `Bearer ${token}` } }).then(res => setSubjectsList(res.data)).catch(console.error);
    if (editingId) {
      axios.get(`/courses/${editingId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const c = res.data;
          const parseArr = v => Array.isArray(v) ? v : (typeof v === 'string' ? JSON.parse(v) : []);
          setForm({
            name: c.name || "", courseCode: c.courseCode || "", category: c.category || "computerCourses",
            durationMonths: c.durationMonths || "", totalFee: c.totalFee || "", feeType: c.feeType || "Monthly",
            defaultInstallments: c.defaultInstallments || 3,
            level: c.level || "Beginner", status: c.status || "Active", shortDescription: c.shortDescription || "",
            fullDescription: c.fullDescription || "", subjects: c.subjects || [],
            learningOutcomes: parseArr(c.learningOutcomes), whyThisCourse: parseArr(c.whyThisCourse),
            prerequisites: parseArr(c.prerequisites), toolsUsed: parseArr(c.toolsUsed),
            careerOpportunities: parseArr(c.careerOpportunities), curriculum: parseArr(c.curriculum),
          });
        })
        .catch(() => toast.error("Failed to fetch course details"));
    } else {
      setForm({
        name: "", courseCode: "", category: "computerCourses", durationMonths: "",
        totalFee: "", feeType: "Monthly", defaultInstallments: 3, level: "Beginner", status: "Active",
        shortDescription: "", fullDescription: "", subjects: [],
        learningOutcomes: [], whyThisCourse: [], prerequisites: [], toolsUsed: [], careerOpportunities: [], curriculum: []
      });
    }
  }, [editingId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Name is required");
    try {
      const fd = new FormData();
      const arrFields = ["subjects", "learningOutcomes", "whyThisCourse", "prerequisites", "toolsUsed", "careerOpportunities", "curriculum"];
      Object.entries(form).forEach(([k, v]) => fd.append(k, arrFields.includes(k) ? JSON.stringify(v) : v));
      if (image) fd.append("image", image);
      if (editingId) {
        await axios.put(`/courses/${editingId}`, fd, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Course updated successfully");
      } else {
        await axios.post("/courses/add", fd, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Course added successfully");
      }
      setEditingId(null);
      if (setActiveSection) setActiveSection("courses-all");
    } catch (err) { toast.error(err.response?.data?.msg || "Error saving course"); }
  };

  const toggleSubject = (id) => setForm(p => ({
    ...p, subjects: p.subjects.includes(id) ? p.subjects.filter(x => x !== id) : [...p.subjects, id]
  }));

  return (
    <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: isMobile ? 18 : 32, display: "grid", gap: 20 }}>

      {/* Basic fields grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
        <div><label style={lbl}>Course Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inp} /></div>
        <div><label style={lbl}>Course Code</label><input value={form.courseCode} onChange={e => setForm({ ...form, courseCode: e.target.value })} style={inp} /></div>
        <div><label style={lbl}>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}><option value="computerCourses">Computer Courses</option><option value="englishCourses">English Speaking</option><option value="distanceLearning">Distance Learning</option></select></div>
        <div><label style={lbl}>Fee Type</label><select value={form.feeType} onChange={e => setForm({ ...form, feeType: e.target.value })} style={inp}><option value="Monthly">Monthly Installments</option><option value="Fixed">Fixed / Lump Sum</option></select></div>
        <div><label style={lbl}>Total Fees (₹)</label><input type="number" value={form.totalFee} onChange={e => setForm({ ...form, totalFee: e.target.value })} style={inp} /></div>
        {form.feeType === "Monthly" ? (
          <div><label style={lbl}>Duration (Months)</label><input type="number" value={form.durationMonths} onChange={e => setForm({ ...form, durationMonths: e.target.value })} style={inp} /></div>
        ) : (
          <div><label style={lbl}>Default Installments</label><input type="number" value={form.defaultInstallments} onChange={e => setForm({ ...form, defaultInstallments: e.target.value })} style={inp} /></div>
        )}
        <div><label style={lbl}>Difficulty Level</label><select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} style={inp}><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select></div>
        <div><label style={lbl}>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inp}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
      </div>

      <div><label style={lbl}>Short Description</label><input value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} style={inp} /></div>
      <div><label style={lbl}>Course Image</label><input type="file" onChange={e => setImage(e.target.files[0])} style={{ ...inp, cursor: "pointer" }} /></div>

      {/* Dynamic arrays grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
        <DynamicList label="What Students Will Learn" items={form.learningOutcomes} onChange={v => setForm({ ...form, learningOutcomes: v })} placeholder="e.g. Build full-stack web apps" />
        <DynamicList label="Why This Course?" items={form.whyThisCourse} onChange={v => setForm({ ...form, whyThisCourse: v })} placeholder="e.g. Highest placement rate" />
        <DynamicList label="Prerequisites" items={form.prerequisites} onChange={v => setForm({ ...form, prerequisites: v })} placeholder="e.g. Basic understanding of HTML" />
        <DynamicList label="Tools Used" items={form.toolsUsed} onChange={v => setForm({ ...form, toolsUsed: v })} placeholder="e.g. React, Node.js" />
      </div>

      <DynamicList label="Career Opportunities" items={form.careerOpportunities} onChange={v => setForm({ ...form, careerOpportunities: v })} placeholder="e.g. Software Engineer" />
      <CurriculumBuilder curriculum={form.curriculum} onChange={v => setForm({ ...form, curriculum: v })} />

      {/* Subjects */}
      <div>
        <label style={lbl}>Included Subjects</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: 16, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          {subjectsList.length === 0 && <span style={{ fontSize: 12, color: "#94a3b8" }}>No subjects found. Create subjects first.</span>}
          {subjectsList.map(s => (
            <label key={s._id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "6px 12px", background: form.subjects.includes(s._id) ? "#dbeafe" : "#fff", border: `1px solid ${form.subjects.includes(s._id) ? "#3b82f6" : "#cbd5e1"}`, borderRadius: 8, cursor: "pointer", color: form.subjects.includes(s._id) ? "#1d4ed8" : "#475569" }}>
              <input type="checkbox" checked={form.subjects.includes(s._id)} onChange={() => toggleSubject(s._id)} style={{ margin: 0 }} />
              {s.name} ({s.code})
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setActiveSection("courses-all"); }} style={{ ...btnPrimary, background: "#f1f5f9", color: "#475569", width: isMobile ? "100%" : "auto", justifyContent: "center" }}>Cancel</button>
        )}
        <button type="submit" style={{ ...btnPrimary, width: isMobile ? "100%" : "auto", justifyContent: "center" }}><FilePlus2 size={16} /> {editingId ? "Update Course" : "Save Course"}</button>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────
 * 3. SUBJECTS
 * ───────────────────────────────────────────────────── */
function Subjects({ token }) {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", category: "computerCourses" });

  const width = useWindowWidth();
  const isMobile = width < 640;

  const fetchSubs = () => axios.get("/subjects", { headers: { Authorization: `Bearer ${token}` } }).then(res => setSubjects(res.data)).catch(console.error);
  useEffect(() => { fetchSubs(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/subjects/add", form, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Subject added");
      setForm({ name: "", code: "", category: "computerCourses" });
      fetchSubs();
    } catch { toast.error("Error adding subject"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete subject?")) return;
    await axios.delete(`/subjects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchSubs();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: 24, alignItems: "start" }}>
      <form onSubmit={handleAdd} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: isMobile ? 18 : 24, display: "grid", gap: 16 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Add New Subject</h3>
        <div><label style={lbl}>Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inp} placeholder="MS Word" /></div>
        <div><label style={lbl}>Code</label><input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} style={inp} placeholder="MSW" /></div>
        <div><label style={lbl}>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}><option value="computerCourses">Computer Courses</option><option value="englishCourses">English</option><option value="other">Other</option></select></div>
        <button type="submit" style={{ ...btnPrimary, width: "100%", justifyContent: "center" }}><Plus size={16} /> Add Subject</button>
      </form>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? 0 : 400 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: 16, textAlign: "left", fontSize: 11, color: "#64748b" }}>Code</th>
                <th style={{ padding: 16, textAlign: "left", fontSize: 11, color: "#64748b" }}>Name</th>
                {!isMobile && <th style={{ padding: 16, textAlign: "left", fontSize: 11, color: "#64748b" }}>Category</th>}
                <th style={{ padding: 16, textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: 16, fontWeight: 800, fontSize: 12 }}>{s.code}</td>
                  <td style={{ padding: 16, fontWeight: 600, fontSize: 13 }}>{s.name}</td>
                  {!isMobile && <td style={{ padding: 16, fontSize: 11 }}><span style={{ background: "#eff6ff", color: "#2563eb", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>{s.category}</span></td>}
                  <td style={{ padding: 16, textAlign: "right" }}>
                    <button onClick={() => handleDelete(s._id)} style={{ padding: 6, background: "none", border: "1px solid #fee2e2", borderRadius: 8, color: "#ef4444", cursor: "pointer" }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 * 4. STUDY MATERIALS
 * ───────────────────────────────────────────────────── */
function StudyMaterials({ token }) {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ title: "", subjectId: "", materialType: "Theoretical" });
  const [file, setFile] = useState(null);

  const width = useWindowWidth();
  const isMobile = width < 640;

  const fetchAll = () => {
    axios.get("/study-materials", { headers: { Authorization: `Bearer ${token}` } }).then(res => setMaterials(res.data));
    axios.get("/subjects", { headers: { Authorization: `Bearer ${token}` } }).then(res => setSubjects(res.data));
  };
  useEffect(() => { fetchAll(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("File required");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("file", file);
    try {
      await axios.post("/study-materials/upload", fd, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Uploaded!");
      setForm({ ...form, title: "" });
      setFile(null);
      document.getElementById("mat-file").value = "";
      fetchAll();
    } catch { toast.error("Upload failed"); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: 24, alignItems: "start" }}>
      <form onSubmit={handleUpload} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: isMobile ? 18 : 24, display: "grid", gap: 16 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Upload Material</h3>
        <div><label style={lbl}>Subject</label><select required value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} style={inp}><option value="">Select...</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
        <div><label style={lbl}>Type</label><select value={form.materialType} onChange={e => setForm({ ...form, materialType: e.target.value })} style={inp}><option value="Theoretical">Theoretical (Notes)</option><option value="Practical">Practical (Guides)</option></select></div>
        <div><label style={lbl}>Title</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inp} placeholder="C++ Chapter 1" /></div>
        <div><label style={lbl}>File (PDF, DOC)</label><input type="file" id="mat-file" required onChange={e => setFile(e.target.files[0])} style={inp} /></div>
        <button type="submit" style={{ ...btnPrimary, width: "100%", justifyContent: "center" }}><Upload size={16} /> Upload to Portal</button>
      </form>

      <div style={{ display: "grid", gap: 12 }}>
        {materials.map(m => (
          <div key={m._id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: isMobile ? 12 : 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
              <div style={{ background: "#eff6ff", color: "#2563eb", padding: 10, borderRadius: 10, flexShrink: 0 }}><File size={18} /></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: "#1e293b", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.title} <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>v{m.version}</span>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  <span style={{ background: "#f8fafc", padding: "2px 6px", borderRadius: 4 }}>{m.subjectId?.name || "Unknown"}</span>
                  <span style={{ background: m.materialType === "Practical" ? "#fef2f2" : "#ecfdf5", color: m.materialType === "Practical" ? "#ef4444" : "#10b981", padding: "2px 6px", borderRadius: 4 }}>{m.materialType}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ padding: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#475569", display: "flex" }}><FileDown size={14} /></a>}
              <button onClick={async () => { if (window.confirm("Delete?")) { await axios.delete(`/study-materials/${m._id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchAll(); } }} style={{ padding: 8, background: "none", border: "1px solid #fee2e2", borderRadius: 8, color: "#ef4444", cursor: "pointer" }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 * MAIN WRAPPER
 * ───────────────────────────────────────────────────── */
export default function CourseDetails({ token, activeSection = "courses-all", setActiveSection }) {
  const [editingCourseId, setEditingCourseId] = useState(null);

  const width = useWindowWidth();
  const isMobile = width < 640;

  useEffect(() => {
    if (activeSection !== "courses-add") setEditingCourseId(null);
  }, [activeSection]);

  const headerMap = {
    "courses-all":      { t: "All Courses",        sub: "Manage active courses",      icon: Database },
    "courses-add":      { t: "Add / Edit Course",   sub: "Create a new curriculum",    icon: FilePlus2 },
    "courses-subjects": { t: "Subjects Database",   sub: "Manage module subjects",     icon: BookMarked },
    "courses-materials":{ t: "Study Materials",     sub: "Upload student resources",   icon: FileText },
    "courses":          { t: "All Courses",          sub: "Manage active courses",      icon: Database },
  };

  const current = headerMap[activeSection] || headerMap["courses-all"];
  const Icon = current.icon;

  return (
    <div style={{ fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", padding: isMobile ? "16px 18px" : "22px 32px", borderRadius: 20, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: 22 }}>
        <div style={{ padding: isMobile ? 10 : 14, background: "#0f172a", color: "#fff", borderRadius: 14, flexShrink: 0 }}>
          <Icon size={isMobile ? 20 : 24} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 24, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" }}>{current.t}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>{current.sub}</p>
        </div>
      </div>

      {(activeSection === "courses-all" || activeSection === "courses") && (
        <AllCourses token={token} setActiveSection={setActiveSection} setEditingCourseId={setEditingCourseId} />
      )}
      {activeSection === "courses-add" && (
        <AddCourse token={token} editingId={editingCourseId} setEditingId={setEditingCourseId} setActiveSection={setActiveSection} />
      )}
      {activeSection === "courses-subjects" && <Subjects token={token} />}
      {activeSection === "courses-materials" && <StudyMaterials token={token} />}
    </div>
  );
}