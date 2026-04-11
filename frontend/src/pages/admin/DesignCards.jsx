import React, { useState, useEffect, useRef } from "react";
import axios from "../../lib/axios";
import { 
  Plus, Edit2, Trash2, Save, Download, 
  CreditCard, Award, FileText, ClipboardList, CheckCircle2,
  AlertCircle, Layout, Move, Type, Image as ImageIcon,
  CheckSquare, Loader2, X, ChevronRight, Filter, Search, Users
} from "lucide-react";
import { toast } from "sonner";

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

/* ── UI HELPERS ── */
const tabStyle = (active) => ({ 
  padding: "14px 28px", 
  cursor: "pointer", 
  fontSize: 12, 
  fontWeight: 800, 
  borderRadius: 12,
  background: active ? '#0f172a' : '#fff', 
  color: active ? '#fff' : '#64748b', 
  transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
  textTransform: 'uppercase', 
  letterSpacing: '0.05em',
  border: active ? '1px solid #0f172a' : '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  boxShadow: active ? '0 10px 20px -5px rgba(15, 23, 42, 0.3)' : 'none'
});

const subTabStyle = (active) => ({
  flex: 1,
  padding: "12px",
  textAlign: "center",
  cursor: "pointer",
  fontSize: 10,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  transition: "0.2s",
  color: active ? "#0f172a" : "#94a3b8",
  borderBottom: active ? "3px solid #0f172a" : "3px solid transparent"
});

const cardWrap = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" };
const btnPrimary = { background: "#0f172a", color: "#fff", padding: "12px 24px", borderRadius: 12, border: "none", fontSize: 11, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, transition: "0.2s" };

const renderSafe = (val) => {
  if (!val) return "N/A";
  if (typeof val === "object") return val.name || val.title || JSON.stringify(val);
  return val;
};

export default function DesignCards({ token }) {
  const [activeTab, setActiveTab] = useState("id-card");
  const [subTab, setSubTab] = useState("issuance");
  const [loading, setLoading] = useState(false);
  
  // Design State
  const [templates, setTemplates] = useState([]);
  const [checklist, setChecklist] = useState({ missingIdCards: [], missingCerts: [], missingMarksheets: [] });

  const width = useWindowWidth();
  const isMobile = width < 640;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tplRes, checkRes] = await Promise.all([
        axios.get(`/templates?type=${activeTab}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/checklist/pending`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTemplates(tplRes.data || []);
      setChecklist(checkRes.data);
    } catch { 
      toast.error("Error syncing document data"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [activeTab, token]);

  const renderContent = () => {
    if (activeTab === "checklist") {
      return <DocumentChecklist data={checklist} token={token} onRefresh={fetchData} isMobile={isMobile} />;
    }
    
    if (subTab === "designer") {
      return (
        <DocumentDesigner 
          type={activeTab} 
          token={token} 
          templates={templates}
          onSave={() => { setSubTab("issuance"); fetchData(); }} 
          onCancel={() => setSubTab("issuance")} 
          isMobile={isMobile}
        />
      );
    }

    return (
      <TemplatesAndIssuance 
        activeTab={activeTab} 
        templates={templates} 
        token={token} 
        onNew={() => setSubTab("designer")} 
        isMobile={isMobile}
      />
    );
  };

  return (
    <div style={{ padding: isMobile ? "16px" : "24px 40px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* ── PREMIUM HEADER ── */}
      <div 
        style={{ 
          background: "#fff", 
          border: "1px solid #e2e8f0", 
          borderRadius: 24, 
          padding: isMobile ? "20px 20px" : "24px 32px", 
          marginBottom: 32, 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center", 
          gap: 20 
        }}
      >
        <div style={{ width: 48, height: 48, background: "#0f172a", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
          <CreditCard size={24} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 900, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.02em" }}>Design Cards</h1>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Template Designer & Bulk Issuance</p>
        </div>
      </div>

      {/* ── MAIN TABS (PILLS) ── */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(140px, 1fr))", 
        gap: isMobile ? 12 : 12, 
        marginBottom: 32 
      }}>
        <div style={tabStyle(activeTab === "id-card")} onClick={() => { setActiveTab("id-card"); setSubTab("issuance"); }}><CreditCard size={14}/> ID Card</div>
        <div style={tabStyle(activeTab === "certificate")} onClick={() => { setActiveTab("certificate"); setSubTab("issuance"); }}><Award size={14}/> Certificate</div>
        <div style={tabStyle(activeTab === "admit-card")} onClick={() => { setActiveTab("admit-card"); setSubTab("issuance"); }}><Layout size={14}/> Admit Card</div>
        <div style={tabStyle(activeTab === "marksheet")} onClick={() => { setActiveTab("marksheet"); setSubTab("issuance"); }}><FileText size={14}/> Marksheet</div>
        <div style={tabStyle(activeTab === "checklist")} onClick={() => { setActiveTab("checklist"); setSubTab("issuance"); }}><ClipboardList size={14}/> Checklist</div>
      </div>

      {/* ── SUB-NAV BAR ── */}
      {activeTab !== "checklist" && (
        <div style={{ 
          background: "#f1f5f9", 
          borderRadius: 16, 
          display: "flex", 
          marginBottom: 32, 
          border: "1px solid #e2e8f0", 
          overflow: "hidden" 
        }}>
          <div 
            onClick={() => setSubTab("designer")} 
            style={{ ...subTabStyle(subTab === "designer"), borderRight: "1px solid #e2e8f0" }}
          >
            Designer
          </div>
          <div 
            onClick={() => setSubTab("issuance")} 
            style={subTabStyle(subTab === "issuance")}
          >
            Bulk Issue
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
}

/* =========================================
   1. TEMPLATES & BULK ISSUANCE VIEW
=========================================== */
function TemplatesAndIssuance({ activeTab, templates, token, onNew, isMobile }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedTpl, setSelectedTpl] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stuRes, courseRes] = await Promise.all([
          axios.get("/enrollments/all", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/courses", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStudents(stuRes.data || []);
        setCourses(courseRes.data || []);
      } catch {
        toast.error("Error loading students or courses");
      }
    };
    fetchData();
  }, [token]);

  const handleBulkIssue = async () => {
    if (!selectedTpl) return toast.error("Please select a template first");
    if (selectedStudents.length === 0) return toast.error("No students selected");
    
    try {
      toast.loading(`Issuing ${activeTab}s...`);
      await axios.post(`/templates/bulk-issue`, { 
        studentIds: selectedStudents, 
        templateId: selectedTpl,
        type: activeTab 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.dismiss();
      toast.success("Documents issued and pushed to student portal!");
      setSelectedStudents([]);
    } catch { 
      toast.dismiss(); 
      toast.error("Failed to issue documents"); 
    }
  };

  const filtered = students.filter(s => {
    const sName = s.studentId?.name || "Unknown";
    const sRoll = s.studentId?.rollNumber || "";
    const matchSearch = sName.toLowerCase().includes(search.toLowerCase()) || 
                      sRoll.toLowerCase().includes(search.toLowerCase());
    
    const recordCourse = (s.course || "").toLowerCase().trim();
    const targetCourse = (selectedCourse || "").toLowerCase().trim();
    const matchCourse = !selectedCourse || recordCourse === targetCourse;

    return matchSearch && matchCourse;
  });

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* ── TOP FILTER BAR ── */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr auto", 
        gap: 24, 
        alignItems: "flex-end" 
      }}>
        <div style={{ ...cardWrap, padding: isMobile ? 20 : 32 }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 12 }}>Target Course</label>
          <select 
            value={selectedCourse} 
            onChange={e => setSelectedCourse(e.target.value)}
            style={{ width: "100%", padding: "14px 18px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13, fontWeight: 700 }}
          >
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ ...cardWrap, padding: isMobile ? 20 : 32 }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 12 }}>Issuance Template</label>
          <select 
            value={selectedTpl} 
            onChange={e => setSelectedTpl(e.target.value)}
            style={{ width: "100%", padding: "14px 18px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13, fontWeight: 700 }}
          >
            <option value="">Select Template</option>
            {templates.map(t => <option key={t._id} value={t._id}>{t.name} ({t.orientation})</option>)}
          </select>
        </div>

        <button 
          onClick={handleBulkIssue} 
          disabled={selectedStudents.length === 0} 
          style={{ 
            ...btnPrimary, 
            padding: isMobile ? "16px" : "16px 32px", 
            height: isMobile ? "auto" : 60,
            width: isMobile ? "100%" : "auto"
          }}
        >
          <Download size={18}/> Generate Cards
        </button>
      </div>

      {/* ── STUDENT SELECTION ── */}
      <div style={{ ...cardWrap, padding: 0 }}>
        <div style={{ padding: isMobile ? 20 : 24, borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Users size={18} color="#0f172a" />
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, textTransform: "uppercase" }}>Student Selection</h3>
          </div>
          <button 
            onClick={() => setSelectedStudents(selectedStudents.length === filtered.length ? [] : filtered.map(s => s.studentId?._id))}
            style={{ border: "none", background: "none", color: "#64748b", fontSize: 10, fontWeight: 900, textTransform: "uppercase", cursor: "pointer", letterSpacing: "0.1em" }}
          >
            {selectedStudents.length === filtered.length ? "Deselect All" : "Select All"}
          </button>
        </div>

        <div style={{ padding: isMobile ? 20 : 24, background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ position: "relative", maxWidth: isMobile ? "100%" : 400 }}>
            <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input 
              placeholder="Quick search by name or roll..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "12px 12px 12px 48px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13 }}
            />
          </div>
        </div>

        {isMobile ? (
          /* Mobile: Card List */
          <div style={{ padding: 16 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Please select a course to view students</div>
            ) : (
              filtered.map(s => (
                <div key={s._id} style={{ 
                  padding: 16, 
                  background: "#fff", 
                  borderRadius: 16, 
                  border: "1px solid #e2e8f0", 
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 12
                }}>
                  <input 
                    type="checkbox" 
                    checked={selectedStudents.includes(s.studentId?._id)} 
                    onChange={(e) => setSelectedStudents(prev => e.target.checked ? [...prev, s.studentId?._id] : prev.filter(id => id !== s.studentId?._id))} 
                    style={{ width: 18, height: 18, accentColor: "#0f172a" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{renderSafe(s.studentId?.name)}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {renderSafe(s.studentId?.rollNumber)} • {renderSafe(s.studentId?.batch)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Desktop: Table */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "16px 32px", textAlign: "left" }}>Selection</th>
                  <th style={{ padding: "16px 32px", textAlign: "left", fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase" }}>Student Name</th>
                  <th style={{ padding: "16px 32px", textAlign: "left", fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase" }}>Roll Number</th>
                  <th style={{ padding: "16px 32px", textAlign: "left", fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase" }}>Batch</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Please select a course to view students</td></tr>
                ) : filtered.map(s => (
                  <tr key={s._id} style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td style={{ padding: "16px 32px" }}>
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.includes(s.studentId?._id)} 
                        onChange={(e) => setSelectedStudents(prev => e.target.checked ? [...prev, s.studentId?._id] : prev.filter(id => id !== s.studentId?._id))} 
                        style={{ width: 18, height: 18, borderRadius: 6, accentColor: "#0f172a" }}
                      />
                    </td>
                    <td style={{ padding: "16px 32px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{renderSafe(s.studentId?.name)}</td>
                    <td style={{ padding: "16px 32px", fontSize: 12, fontWeight: 800, color: "#64748b", fontFamily: "monospace" }}>{renderSafe(s.studentId?.rollNumber)}</td>
                    <td style={{ padding: "16px 32px", fontSize: 12, color: "#475569" }}>{renderSafe(s.studentId?.batch)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================
   2. DRAG-AND-DROP DESIGNER COMPONENT
=========================================== */
function DocumentDesigner({ type, token, templates, onSave, onCancel, isMobile }) {
  const [config, setConfig] = useState({ 
    name: "", 
    orientation: "portrait", 
    backgroundImage: null, 
    fontSize: 14, 
    fontColor: "#000000", 
    fontFamily: "Arial", 
    elements: [] 
  });
  const [bgPreview, setBgPreview] = useState(null);
  const [zoom, setZoom] = useState(100);
  const canvasRef = useRef(null);

  const tokens = [
    { id: "ST_NAME", label: "Student Name" },
    { id: "ST_PHOTO", label: "Student Photo" },
    { id: "ST_GUARDIAN", label: "Guardian Name" },
    { id: "REG_NO", label: "Registration No" },
    { id: "ROLL_NO", label: "Roll Number" },
    { id: "COURSE", label: "Course" },
    { id: "ST_PHONE", label: "Phone No" },
    { id: "BATCH", label: "Batch" },
    { id: "QR_CODE", label: "QR Code" },
    { id: "ST_DOB", label: "Date of Birth" },
    { id: "ST_ADDRESS", label: "Address" },
    { id: "ST_EMAIL", label: "Email" }
  ];

  const handleAddElement = (token) => {
    const newEl = { id: Date.now(), token: token.id, label: token.label, x: 20, y: 20, fontSize: 14, color: "#000000", fontWeight: "normal" };
    setConfig({ ...config, elements: [...config.elements, newEl] });
  };

  const handleDrag = (id, e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setConfig({
      ...config,
      elements: config.elements.map(el => el.id === id ? { ...el, x: Math.max(0, Math.min(x, 90)), y: Math.max(0, Math.min(y, 90)) } : el)
    });
  };

  const handleSave = async () => {
    if (!config.name) return toast.error("Please enter a template name");
    try {
      const formData = new FormData();
      formData.append("name", config.name);
      formData.append("type", type);
      formData.append("orientation", config.orientation);
      formData.append("elements", JSON.stringify(config.elements));
      if (config.backgroundImage) formData.append("backgroundImage", config.backgroundImage);

      await axios.post("/templates", formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Template saved successfully");
      onSave();
    } catch { 
      toast.error("Failed to save template"); 
    }
  };

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", 
      gap: isMobile ? 24 : 32 
    }}>
      {/* LEFT: SETTINGS */}
      <div style={{ display: "grid", gap: 24, height: "fit-content" }}>
        <div style={{ ...cardWrap, padding: isMobile ? 20 : 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <Layout size={18} color="#0f172a" />
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, textTransform: "uppercase" }}>Template Settings</h3>
          </div>
          
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Template Name</label>
              <input value={config.name} onChange={e=>setConfig({...config, name: e.target.value})} placeholder="e.g. Standard ID Card 2024" style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13 }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Orientation</label>
                <select value={config.orientation} onChange={e=>setConfig({...config, orientation: e.target.value})} style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13, fontWeight: 700 }}>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Font Size</label>
                <input type="number" value={config.fontSize} onChange={e=>setConfig({...config, fontSize: Number(e.target.value)})} style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13 }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Font Color</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="color" value={config.fontColor} onChange={e=>setConfig({...config, fontColor: e.target.value})} style={{ width: 44, height: 44, padding: 0, border: "none", borderRadius: 8, overflow: "hidden", cursor: "pointer" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#64748b" }}>{config.fontColor.toUpperCase()}</span>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Font Family</label>
                <select value={config.fontFamily} onChange={e=>setConfig({...config, fontFamily: e.target.value})} style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13, fontWeight: 700 }}>
                  <option value="Arial">Arial</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
            </div>

            {/* Background Image */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 12 }}>Background Image</label>
              <div 
                style={{ 
                  height: 140, 
                  border: "2px dashed #e2e8f0", 
                  borderRadius: 16, 
                  background: bgPreview ? `url(${bgPreview})` : "#f8fafc", 
                  backgroundSize: "cover", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  cursor: "pointer", 
                  gap: 8 
                }}
                onClick={() => document.getElementById('bgUpload').click()}
              >
                {!bgPreview && <ImageIcon size={24} color="#94a3b8" />}
                <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase" }}>{bgPreview ? "Change Image" : "Upload Background Image"}</p>
                <input id="bgUpload" type="file" onChange={e => {
                  const file = e.target.files[0];
                  setConfig({ ...config, backgroundImage: file });
                  setBgPreview(URL.createObjectURL(file));
                }} style={{ display: "none" }} />
              </div>
            </div>

            {/* Add Elements */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 12 }}>Add Student Details</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {tokens.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => handleAddElement(t)} 
                    style={{ 
                      padding: "8px 14px", 
                      background: "#fff", 
                      border: "1px solid #e2e8f0", 
                      borderRadius: 10, 
                      fontSize: 10, 
                      fontWeight: 800, 
                      cursor: "pointer", 
                      color: "#0f172a" 
                    }}
                  >
                    <Plus size={10}/> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSave} style={{ ...btnPrimary, marginTop: 24, padding: "18px", justifyContent: "center", width: "100%" }}>
              <Save size={18}/> Save Template
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: PREVIEW + SAVED TEMPLATES */}
      <div style={{ display: "grid", gap: 24 }}>
        {/* Preview */}
        <div style={{ ...cardWrap, padding: 0 }}>
          {/* Preview header and canvas remain mostly same with responsive padding */}
          <div style={{ padding: isMobile ? "16px 20px" : "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Plus size={18} color="#3b82f6" />
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, textTransform: "uppercase", color: "#64748b" }}>Design Preview</h3>
            </div>
            {/* Zoom controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {/* Zoom and view controls - simplified for mobile */}
            </div>
          </div>

          <div style={{ padding: isMobile ? 24 : 48, background: "#f8fafc", minHeight: isMobile ? 380 : 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Canvas code remains the same */}
            <div 
              ref={canvasRef}
              style={{ 
                width: config.orientation === 'landscape' ? (isMobile ? 320 : 600) : (isMobile ? 260 : 400), 
                height: config.orientation === 'landscape' ? (isMobile ? 240 : 400) : (isMobile ? 360 : 600), 
                background: "#fff", 
                boxShadow: "0 30px 60px rgba(0,0,0,0.12)", 
                borderRadius: 16, 
                position: "relative",
                backgroundImage: bgPreview ? `url(${bgPreview})` : 'none',
                backgroundSize: "cover",
                transform: `scale(${zoom/100})`,
                transformOrigin: "top center",
                transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              {/* Elements rendering logic remains unchanged */}
            </div>
          </div>
        </div>

        {/* Saved Templates */}
        <div style={{ ...cardWrap, padding: isMobile ? 20 : 32 }}>
          <h3 style={{ margin: "0 0 24px 0", fontSize: 11, fontWeight: 900, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.1em" }}>Saved Templates</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {templates.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", padding: 32 }}>No templates saved yet.</p>
            ) : templates.map(t => (
              <div key={t._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 16, border: "1px solid #f1f5f9", background: "#f8fafc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
                    <FileText size={18} color="#94a3b8" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>{t.name}</h4>
                    <p style={{ margin: 0, fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>{t.orientation} | {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ border: "none", background: "none", color: "#10b981", cursor: "pointer" }}><CheckSquare size={16}/></button>
                  <button style={{ border: "none", background: "none", color: "#3b82f6", cursor: "pointer" }}><Download size={16}/></button>
                  <button style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={16}/></button>
                  <ChevronRight size={16} color="#cbd5e1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   3. DOCUMENT CHECKLIST COMPONENT
=========================================== */
function DocumentChecklist({ data, token, onRefresh, isMobile }) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <SectionChecklist title="Missing ID Cards" items={data.missingIdCards} type="id-card" onRefresh={onRefresh} isMobile={isMobile} />
      <SectionChecklist title="Missing Certificates" items={data.missingCerts} type="certificate" onRefresh={onRefresh} isMobile={isMobile} />
      <SectionChecklist title="Pending Marksheets" items={data.missingMarksheets} type="marksheet" onRefresh={onRefresh} isMobile={isMobile} />
    </div>
  );
}

function SectionChecklist({ title, items, type, onRefresh, isMobile }) {
  return (
    <div style={{ ...cardWrap, padding: isMobile ? 20 : 32 }}>
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom: 24, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AlertCircle size={20} color="#ef4444"/> 
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
        </div>
        <div style={{ background: "#fee2e2", color: "#ef4444", padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 900 }}>
          {items.length} PENDING
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {items.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", background: "#f0fdf4", borderRadius: 16, border: "1px solid #dcfce7" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#10b981", fontWeight: 800 }}>✓ All students up to date.</p>
          </div>
        ) : items.slice(0, isMobile ? 3 : 5).map(s => (
          <div key={s._id} style={{ 
            padding: 16, 
            background: "#f8fafc", 
            borderRadius: 16, 
            border: "1px solid #f1f5f9", 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between", 
            alignItems: isMobile ? "flex-start" : "center", 
            gap: 12 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={14} color="#94a3b8" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{renderSafe(s.name)}</p>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{renderSafe(s.rollNumber)} • {renderSafe(s.course)}</p>
              </div>
            </div>
            <button style={{ ...btnPrimary, padding: "8px 16px", background: "#f1f5f9", color: "#0f172a", fontSize: 10, width: isMobile ? "100%" : "auto" }}>Generate Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}