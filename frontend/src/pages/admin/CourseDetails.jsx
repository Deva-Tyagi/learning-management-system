import { useEffect, useState } from "react";
import API_BASE_URL from "../../lib/utils";
import {
  Plus, Trash2, Edit3, BookOpen, Clock, Layers, CheckCircle,
  XCircle, FilePlus, Loader2, ChevronDown, ChevronUp, ChevronRight,
  Database, Award, Activity, GraduationCap, Settings,
  Image as ImageIcon,
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

const INITIAL_COURSE = {
  name: "", category: "computerCourses", shortDescription: "",
  fullDescription: "", duration: "", fees: "", level: "Beginner",
  learningOutcomes: [""], whyThisCourse: [""],
  prerequisites: [""], toolsUsed: [""], careerOpportunities: [""],
  curriculum: [{ module: "", topics: [""], duration: "" }],
};

export default function CourseDetails({ token }) {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState(INITIAL_COURSE);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  const fetchCourses = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCourses(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load courses"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, [token]);

  const handleArrayChange = (field, index, value) =>
    setNewCourse(p => ({ ...p, [field]: p[field].map((x, i) => i === index ? value : x) }));
  const addArrayItem = (field) =>
    setNewCourse(p => ({ ...p, [field]: [...p[field], ""] }));
  const removeArrayItem = (field, index) =>
    setNewCourse(p => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }));

  const handleCurriculumChange = (modIdx, field, value) =>
    setNewCourse(p => ({ ...p, curriculum: p.curriculum.map((m, i) => i === modIdx ? { ...m, [field]: value } : m) }));
  const handleCurriculumTopicChange = (modIdx, topicIdx, value) =>
    setNewCourse(p => ({
      ...p, curriculum: p.curriculum.map((m, i) => i === modIdx
        ? { ...m, topics: m.topics.map((t, j) => j === topicIdx ? value : t) } : m)
    }));
  const addCurriculumModule = () =>
    setNewCourse(p => ({ ...p, curriculum: [...p.curriculum, { module: "", topics: [""], duration: "" }] }));
  const addCurriculumTopic = (modIdx) =>
    setNewCourse(p => ({ ...p, curriculum: p.curriculum.map((m, i) => i === modIdx ? { ...m, topics: [...m.topics, ""] } : m) }));
  const removeCurriculumModule = (index) =>
    setNewCourse(p => ({ ...p, curriculum: p.curriculum.filter((_, i) => i !== index) }));
  const removeCurriculumTopic = (modIdx, topicIdx) =>
    setNewCourse(p => ({
      ...p, curriculum: p.curriculum.map((m, i) => i === modIdx
        ? { ...m, topics: m.topics.filter((_, j) => j !== topicIdx) } : m)
    }));

  const handleAddCourse = async () => {
    if (!newCourse.name.trim()) return toast.error("Course name is required");
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(newCourse).forEach((key) => {
        if (Array.isArray(newCourse[key])) {
          const filtered = key === "curriculum"
            ? newCourse[key].filter(i => i.module.trim())
            : newCourse[key].filter(i => i.trim());
          formData.append(key, JSON.stringify(filtered));
        } else formData.append(key, newCourse[key]);
      });
      if (selectedImage) formData.append("image", selectedImage);
      const res = await fetch(`${API_BASE_URL}/courses/add`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (res.ok) { resetForm(); fetchCourses(); toast.success("Course added successfully"); }
      else { const data = await res.json(); toast.error(data.msg || "Failed to add course"); }
    } catch { toast.error("Error adding course"); }
    finally { setLoading(false); }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse?.name?.trim()) return toast.error("Course name is required");
    setLoading(true);
    try {
      const formData = new FormData();
      ["name","category","duration","fees","level","shortDescription","fullDescription"]
        .forEach(key => formData.append(key, editingCourse[key] ?? ""));
      const res = await fetch(`${API_BASE_URL}/courses/${editingCourse._id}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (res.ok) { toast.success("Course updated"); setEditingCourse(null); fetchCourses(); }
      else toast.error("Failed to update course");
    } catch { toast.error("Error updating course"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { toast.success("Course deleted"); fetchCourses(); }
    } catch { toast.error("Error deleting course"); }
  };

  const resetForm = () => { setNewCourse(INITIAL_COURSE); setSelectedImage(null); setShowAdvanced(false); };

  const CAT_LABEL = {
    computerCourses: "Computer Courses",
    englishCourses: "English Courses",
    distanceLearning: "Distance Learning",
  };

  const ADVANCED_SECTIONS = [
    { field: "learningOutcomes", label: "What Students Will Learn", icon: Award, color: "#f59e0b", placeholder: "e.g. Master web development..." },
    { field: "whyThisCourse", label: "Course Benefits", icon: Activity, color: "#10b981", placeholder: "e.g. Industrial training..." },
    { field: "prerequisites", label: "Course Requirements", icon: Layers, color: "#6366f1", placeholder: "e.g. Basic knowledge..." },
    { field: "careerOpportunities", label: "Career Paths", icon: GraduationCap, color: "#3b82f6", placeholder: "e.g. Web Developer..." },
  ];

  /* ── Shared style tokens ── */
  const inp = {
    width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 600,
    color: "#334155", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
  const lbl = {
    display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
  };
  const card = {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden",
  };
  const pad = isMobile ? 16 : isDesktop ? 32 : 24;

  /* ── Responsive grid via inline styles ── */
  const g2 = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 20 };
  const g3 = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 16 : 20 };
  const g4 = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : isDesktop ? "1fr 1fr 1fr 1fr" : "1fr 1fr", gap: 16 };

  return (
    <div style={{ paddingBottom: 48, fontFamily: "sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
        gap: 16, background: "#fff", padding: isMobile ? 16 : 20,
        borderRadius: 16, border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <Layers size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 22, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              Course Management
            </h1>
            <p style={{ margin: "5px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 5 }}>
              <Activity size={10} color="#3b82f6" /> Manage Your Courses
            </p>
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 28,
          borderTop: isMobile ? "1px solid #f1f5f9" : "none",
          borderLeft: isMobile ? "none" : "1px solid #f1f5f9",
          paddingTop: isMobile ? 12 : 0, paddingLeft: isMobile ? 0 : 28,
          marginTop: isMobile ? 4 : 0,
        }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Live Courses</p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 900, color: "#0f172a" }}>{courses.length}</p>
          </div>
          <div style={{ width: 1, height: 28, background: "#f1f5f9" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Status</p>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#10b981", fontWeight: 700, fontSize: 12, marginTop: 4 }}>
              <CheckCircle size={12} /> Active
            </div>
          </div>
        </div>
      </div>

      {/* ── ADD NEW COURSE ── */}
      {!editingCourse && (
        <div style={{ ...card, marginBottom: 32 }}>
          <div style={{ padding: isMobile ? "12px 16px" : "14px 24px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 10 }}>
              <FilePlus size={16} color="#2563eb" /> Add New Course
            </h2>
            {!isMobile && <span style={{ fontSize: 10, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.08em" }}>ID: {Math.random().toString(16).slice(2, 10).toUpperCase()}</span>}
          </div>

          <div style={{ padding: pad }}>

            {/* Name + Category + Image */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 16 : 24, marginBottom: 20 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={g2}>
                  <div>
                    <label style={lbl}>Course Name *</label>
                    <input type="text" value={newCourse.name}
                      onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                      placeholder="e.g. Graphic Design Masterclass" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Category</label>
                    <select value={newCourse.category}
                      onChange={e => setNewCourse({ ...newCourse, category: e.target.value })} style={inp}>
                      <option value="computerCourses">Computer Courses</option>
                      <option value="englishCourses">English Speaking</option>
                      <option value="distanceLearning">Distance Learning</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Short Description</label>
                  <textarea value={newCourse.shortDescription}
                    onChange={e => setNewCourse({ ...newCourse, shortDescription: e.target.value })}
                    placeholder="Brief course summary..."
                    style={{ ...inp, minHeight: 80, resize: "vertical", fontWeight: 500 }} />
                </div>
              </div>
              {/* Image upload */}
              <div style={{ width: isMobile ? "100%" : isDesktop ? 190 : 150, flexShrink: 0 }}>
                <label style={lbl}>Course Image</label>
                <div style={{ position: "relative", border: "2px dashed #e2e8f0", borderRadius: 14, background: "#f8fafc", minHeight: isMobile ? 90 : 158, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 16 }}>
                  <input type="file" accept="image/*" onChange={e => setSelectedImage(e.target.files[0])}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10 }} />
                  {selectedImage ? (
                    <div style={{ textAlign: "center" }}>
                      <CheckCircle size={28} color="#10b981" style={{ margin: "0 auto 8px" }} />
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", wordBreak: "break-all" }}>
                        {selectedImage.name.slice(0, 18)}...
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", opacity: 0.45 }}>
                      <ImageIcon size={28} color="#94a3b8" style={{ margin: "0 auto 8px" }} />
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>Upload Image</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Duration + Fees + Level */}
            <div style={{ ...g3, marginBottom: 20 }}>
              <div>
                <label style={lbl}>Duration</label>
                <div style={{ position: "relative" }}>
                  <Clock size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="text" value={newCourse.duration}
                    onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })}
                    placeholder="e.g. 3 Months" style={{ ...inp, paddingLeft: 34 }} />
                </div>
              </div>
              <div>
                <label style={lbl}>Course Fees</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "#94a3b8", fontSize: 13 }}>₹</span>
                  <input type="number" value={newCourse.fees}
                    onChange={e => setNewCourse({ ...newCourse, fees: e.target.value })}
                    style={{ ...inp, paddingLeft: 28, color: "#2563eb", fontWeight: 900 }} />
                </div>
              </div>
              <div>
                <label style={lbl}>Difficulty Level</label>
                <select value={newCourse.level}
                  onChange={e => setNewCourse({ ...newCourse, level: e.target.value })} style={inp}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Full Description */}
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Full Description</label>
              <textarea value={newCourse.fullDescription}
                onChange={e => setNewCourse({ ...newCourse, fullDescription: e.target.value })}
                placeholder="Detailed course description..."
                style={{ ...inp, minHeight: 120, resize: "vertical", fontWeight: 500 }} />
            </div>

            {/* Toggle */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "flex-end", gap: 14 }}>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", border: "none", background: showAdvanced ? "#0f172a" : "#f1f5f9", color: showAdvanced ? "#fff" : "#475569", width: isMobile ? "100%" : "auto", justifyContent: "center" }}>
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showAdvanced ? "Hide Extra Details" : "Show Extra Details"}
              </button>
            </div>

            {/* ── Advanced ── */}
            {showAdvanced && (
              <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 24, paddingTop: 28 }}>

                {ADVANCED_SECTIONS.map(section => (
                  <div key={section.field} style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8, marginBottom: 14 }}>
                      <h3 style={{ margin: 0, fontSize: 11, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 7 }}>
                        <section.icon size={13} color={section.color} /> {section.label}
                      </h3>
                      <button type="button" onClick={() => addArrayItem(section.field)}
                        style={{ padding: "4px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 10, fontWeight: 700, color: "#475569", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        + Add
                      </button>
                    </div>
                    <div style={g2}>
                      {newCourse[section.field].map((item, index) => (
                        <div key={index} style={{ display: "flex", gap: 8 }}>
                          <input type="text" value={item}
                            onChange={e => handleArrayChange(section.field, index, e.target.value)}
                            placeholder={section.placeholder}
                            style={{ ...inp, flex: 1 }} />
                          <button type="button" onClick={() => removeArrayItem(section.field, index)}
                            style={{ padding: "0 10px", background: "#fff", border: "1px solid #fee2e2", borderRadius: 10, color: "#fca5a5", cursor: "pointer", flexShrink: 0 }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Tools */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8, marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontSize: 11, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 7 }}>
                      <Settings size={13} color="#94a3b8" /> Software & Tools Used
                    </h3>
                    <button type="button" onClick={() => addArrayItem("toolsUsed")}
                      style={{ padding: "4px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 10, fontWeight: 700, color: "#475569", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      + Add Tool
                    </button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {newCourse.toolsUsed.map((tool, index) => (
                      <div key={index} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 999, paddingLeft: 14, paddingRight: 6, paddingTop: 4, paddingBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569" }}>{tool || "Info"}</span>
                        <button onClick={() => removeArrayItem("toolsUsed", index)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2, display: "flex" }}>
                          <XCircle size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input type="text" placeholder="Type a tool name and press Enter..."
                    style={{ ...inp, fontSize: 11 }}
                    onKeyDown={e => { if (e.key === "Enter") { addArrayItem("toolsUsed"); e.target.value = ""; } }} />
                </div>

                {/* Curriculum */}
                <div>
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 12, borderBottom: "2px solid #0f172a", paddingBottom: 12, marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 10 }}>
                      <Layers size={18} color="#2563eb" /> Course Syllabus
                    </h3>
                    <button type="button" onClick={addCurriculumModule}
                      style={{ padding: "10px 20px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 12, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, width: isMobile ? "100%" : "auto", justifyContent: "center" }}>
                      <Plus size={13} /> Add Module
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {newCourse.curriculum.map((mod, modIdx) => (
                      <div key={modIdx} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: isMobile ? 14 : 22, position: "relative" }}>
                        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 14, marginBottom: 16 }}>
                          <div style={{ flex: 1 }}>
                            <label style={lbl}>Module Name</label>
                            <input type="text" value={mod.module}
                              onChange={e => handleCurriculumChange(modIdx, "module", e.target.value)}
                              placeholder="e.g. Fundamental Logic Gates" style={inp} />
                          </div>
                          <div style={{ width: isMobile ? "100%" : 170 }}>
                            <label style={lbl}>Time Required</label>
                            <div style={{ position: "relative" }}>
                              <Clock size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                              <input type="text" value={mod.duration}
                                onChange={e => handleCurriculumChange(modIdx, "duration", e.target.value)}
                                placeholder="48 Hours" style={{ ...inp, paddingLeft: 34 }} />
                            </div>
                          </div>
                        </div>
                        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 5 }}>
                            <ChevronRight size={13} color="#3b82f6" /> Topics
                          </span>
                          <button type="button" onClick={() => addCurriculumTopic(modIdx)}
                            style={{ fontSize: 10, fontWeight: 900, color: "#2563eb", background: "#fff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                            <Plus size={11} /> Add Topic
                          </button>
                        </div>
                        <div style={g2}>
                          {mod.topics.map((topic, topicIdx) => (
                            <div key={topicIdx} style={{ display: "flex", gap: 8 }}>
                              <input type="text" value={topic}
                                onChange={e => handleCurriculumTopicChange(modIdx, topicIdx, e.target.value)}
                                placeholder="Enter topic..."
                                style={{ ...inp, flex: 1, fontSize: 12, fontWeight: 500 }} />
                              <button type="button" onClick={() => removeCurriculumTopic(modIdx, topicIdx)}
                                style={{ padding: "0 10px", background: "#fff", border: "1px solid #fee2e2", borderRadius: 10, color: "#fca5a5", cursor: "pointer", flexShrink: 0 }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => removeCurriculumModule(modIdx)}
                          style={{ position: "absolute", top: -12, right: -12, width: 28, height: 28, borderRadius: "50%", background: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", cursor: "pointer" }}>
                          <XCircle size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 28, paddingTop: 22, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "flex-end", gap: 12 }}>
              <button type="button" onClick={resetForm}
                style={{ padding: "12px 28px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 11, fontWeight: 900, color: "#94a3b8", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", width: isMobile ? "100%" : "auto" }}>
                Clear Form
              </button>
              <button onClick={handleAddCourse} disabled={loading}
                style={{ padding: "12px 36px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 12, fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: loading ? 0.5 : 1, boxShadow: "0 6px 20px rgba(15,23,42,0.14)", width: isMobile ? "100%" : "auto" }}>
                {loading ? <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> : <Database size={17} />}
                Save Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXISTING COURSES ── */}
      <div>
        <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 8 }}>
          <Database size={14} color="#3b82f6" /> Existing Courses
        </h3>

        {loading && courses.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <Loader2 size={24} color="#e2e8f0" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : courses.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", background: "#f8fafc", borderRadius: 16, border: "2px dashed #e2e8f0" }}>
            <BookOpen size={32} color="#e2e8f0" style={{ margin: "0 auto 10px" }} />
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>No courses found. Add one above.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {courses.map(course => (
              <div key={course._id} style={card}>
                {editingCourse && editingCourse._id === course._id ? (
                  <div style={{ padding: isMobile ? 14 : 22 }}>
                    <h4 style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Editing: {course.name}
                    </h4>
                    <div style={g4}>
                      {[
                        { key: "name", label: "Name", type: "text" },
                        { key: "duration", label: "Duration", type: "text" },
                        { key: "fees", label: "Fees (₹)", type: "number" },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={lbl}>{f.label}</label>
                          <input type={f.type} value={editingCourse[f.key] || ""}
                            onChange={e => setEditingCourse({ ...editingCourse, [f.key]: e.target.value })}
                            style={{ ...inp, fontSize: 12 }} />
                        </div>
                      ))}
                      <div>
                        <label style={lbl}>Category</label>
                        <select value={editingCourse.category}
                          onChange={e => setEditingCourse({ ...editingCourse, category: e.target.value })}
                          style={{ ...inp, fontSize: 12 }}>
                          <option value="computerCourses">Computer Courses</option>
                          <option value="englishCourses">English Courses</option>
                          <option value="distanceLearning">Distance Learning</option>
                        </select>
                      </div>
                      <div>
                        <label style={lbl}>Level</label>
                        <select value={editingCourse.level || "Beginner"}
                          onChange={e => setEditingCourse({ ...editingCourse, level: e.target.value })}
                          style={{ ...inp, fontSize: 12 }}>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: isMobile ? "1" : isDesktop ? "span 2" : "span 2" }}>
                        <label style={lbl}>Short Description</label>
                        <input type="text" value={editingCourse.shortDescription || ""}
                          onChange={e => setEditingCourse({ ...editingCourse, shortDescription: e.target.value })}
                          style={{ ...inp, fontSize: 12 }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "flex-end", gap: 10, marginTop: 18, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                      <button onClick={() => setEditingCourse(null)}
                        style={{ padding: "8px 20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12, fontWeight: 700, color: "#64748b", cursor: "pointer", width: isMobile ? "100%" : "auto" }}>
                        Cancel
                      </button>
                      <button onClick={handleUpdateCourse} disabled={loading}
                        style={{ padding: "8px 24px", background: "#059669", color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.5 : 1, width: isMobile ? "100%" : "auto" }}>
                        {loading && <Loader2 size={13} />} Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: isMobile ? 14 : 18, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: 14 }}>
                    <div style={{ width: 50, height: 50, background: "#f8fafc", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", overflow: "hidden", flexShrink: 0 }}>
                      {course.image
                        ? <img src={course.image.startsWith('http') ? course.image : `${API_BASE_URL.replace("/api", "")}${course.image}`} alt={course.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <BookOpen size={20} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 5 }}>
                        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.02em" }}>{course.name}</h4>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {[
                          { text: CAT_LABEL[course.category] || course.category, color: "#2563eb", bg: "#eff6ff" },
                          { text: course.level, color: "#64748b", bg: "#f8fafc" },
                          { text: `⏱ ${course.duration}`, color: "#475569", bg: "#f8fafc" },
                          { text: `₹${course.fees?.toLocaleString()}`, color: "#0f172a", bg: "#f8fafc" },
                        ].map((tag, i) => (
                          <span key={i} style={{ fontSize: 10, fontWeight: 700, color: tag.color, background: tag.bg, padding: "2px 8px", borderRadius: 6, textTransform: "uppercase" }}>{tag.text}</span>
                        ))}
                      </div>
                      {course.shortDescription && (
                        <p style={{ margin: "5px 0 0", fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.shortDescription}</p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0, alignSelf: isMobile ? "flex-end" : "auto" }}>
                      <button onClick={() => setEditingCourse({ ...course })}
                        style={{ padding: 8, background: "none", border: "none", borderRadius: 8, color: "#94a3b8", cursor: "pointer" }}>
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => handleDelete(course._id)}
                        style={{ padding: 8, background: "none", border: "none", borderRadius: 8, color: "#94a3b8", cursor: "pointer" }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}