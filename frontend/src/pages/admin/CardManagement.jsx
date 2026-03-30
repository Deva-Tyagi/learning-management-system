import { useState, useEffect, useMemo, useRef } from "react";
import API_BASE_URL from "../../lib/utils";
import {
  CreditCard,
  Layout,
  Printer,
  Plus,
  Save,
  Trash2,
  Image as ImageIcon,
  Move,
  XCircle,
  Copy,
  ChevronRight,
  Database,
  Users,
  Award,
  FileText,
  Loader2,
  Search,
  ZoomIn,
  ZoomOut,
  Type,
  Maximize2,
  Minimize2,
  Italic,
  Bold,
  Layers,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

/* ─── Hook: real window width ─── */
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

const CARD_TYPES = [
  { key: "id-card", label: "ID Card", icon: CreditCard },
  { key: "certificate", label: "Certificate", icon: Award },
  { key: "admit-card", label: "Admit Card", icon: FileText },
  { key: "marksheet", label: "Marksheet", icon: FileText },
];

const PLACEHOLDERS = [
  { key: "student_name", label: "+ Student Name" },
  { key: "student_photo", label: "+ Student Photo" },
  { key: "guardian_name", label: "+ Guardian Name" },
  { key: "registration_no", label: "+ Registration No" },
  { key: "roll_no", label: "+ Roll No" },
  { key: "course", label: "+ Course" },
  { key: "phone_no", label: "+ Phone No" },
  { key: "batch", label: "+ Batch" },
  { key: "qr_code", label: "+ QR Code" },
  { key: "date_of_birth", label: "+ Date of Birth" },
  { key: "address", label: "+ Address" },
  { key: "email", label: "+ Email" },
];

export default function CardManagement({ token }) {
  const [selectedCard, setSelectedCard] = useState("id-card");
  const [activeTab, setActiveTab] = useState("template");
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);
  const [course, setCourse] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    orientation: "portrait",
    fontSize: 14,
    fontColor: "#000000",
    fontFamily: "Arial",
    templateText: "",
    backgroundImage: "",
  });
  const [templateElements, setTemplateElements] = useState([]);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState("");
  const dragData = useRef(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [showMockData, setShowMockData] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cloning, setCloning] = useState(false);

  const MOCK_DATA = {
    student_name: "Deva Tyagi",
    student_photo: "https://via.placeholder.com/150",
    guardian_name: "Mr. B.R. Tyagi",
    registration_no: "REG-2024-001",
    roll_no: "123456",
    course: "Advance Web Development",
    phone_no: "+91 9876543210",
    batch: "Morning Batch (09:00 - 11:00)",
    qr_code: "QR_MOCK_DATA",
    date_of_birth: "15/08/2000",
    address: "123, Civil Lines, Meerut, UP, 250001",
    email: "devatyagi@example.com"
  };

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  const courseOptions = useMemo(() => {
    const unique = new Set(students.map((s) => s.course).filter(Boolean));
    return Array.from(unique);
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!course) return [];
    return students.filter((s) => s.course === course);
  }, [students, course]);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [stRes, tplRes] = await Promise.all([
        fetch(`${API_BASE_URL}/students/get`, { headers }),
        fetch(`${API_BASE_URL}/templates?type=${selectedCard}`, { headers }),
      ]);
      if (stRes.ok && tplRes.ok) {
        setStudents(await stRes.json());
        setTemplates(await tplRes.json());
      }
    } catch {
      toast.error("Failed to load management data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, selectedCard]);

  const refreshTemplates = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/templates?type=${selectedCard}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) setTemplates(await res.json());
    } catch {
      toast.error("Failed to refresh templates");
    }
  };

  const handleAddPlaceholder = (key) => {
    const placeholder = PLACEHOLDERS.find((ph) => ph.key === key);
    const label = placeholder ? placeholder.label.replace("+ ", "") : key;
    setTemplateElements((prev) => [
      ...prev,
      { 
        id: Date.now() + Math.random(), 
        token: key, 
        label, 
        x: 30, 
        y: 30,
        fontSize: templateForm.fontSize,
        fontColor: templateForm.fontColor,
        fontWeight: "normal",
        width: key === 'student_photo' ? 80 : (key === 'qr_code' ? 60 : undefined),
        height: key === 'student_photo' ? 100 : (key === 'qr_code' ? 60 : undefined),
      },
    ]);
  };

  const updateElement = (id, updates) => {
    setTemplateElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  useEffect(() => {
    if (!backgroundFile) {
      setBackgroundPreview("");
      return;
    }
    const url = URL.createObjectURL(backgroundFile);
    setBackgroundPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [backgroundFile]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragData.current) return;
      const { id, offsetX, offsetY } = dragData.current;
      const previewRect = document
        .getElementById("preview-box")
        ?.getBoundingClientRect();
      if (!previewRect) return;
      const x = (e.clientX - previewRect.left) / zoom - offsetX;
      const y = (e.clientY - previewRect.top) / zoom - offsetY;
      setTemplateElements((prev) =>
        prev.map((el) =>
          el.id === id
            ? {
                ...el,
                x: Math.max(0, Math.min(previewRect.width / zoom - 50, x)),
                y: Math.max(0, Math.min(previewRect.height / zoom - 20, y)),
              }
            : el,
        ),
      );
    };
    const handleMouseUp = () => {
      dragData.current = null;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [zoom]);

  const onDragStart = (item, e) => {
    e.preventDefault();
    const previewRect = document
      .getElementById("preview-box")
      ?.getBoundingClientRect();
    if (!previewRect) return;
    dragData.current = {
      id: item.id,
      offsetX: (e.clientX - previewRect.left) / zoom - item.x,
      offsetY: (e.clientY - previewRect.top) / zoom - item.y,
    };
  };

  const saveTemplate = async (e) => {
    e.preventDefault();
    if (!templateForm.name) return toast.error("Template name is required");
    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries({ ...templateForm, type: selectedCard }).forEach(
        ([k, v]) => {
          if (v !== undefined && v !== null) payload.append(k, v);
        },
      );
      payload.append("elements", JSON.stringify(templateElements));
      
      if (editingTemplateId) {
        payload.append("id", editingTemplateId);
      }

      if (backgroundFile) payload.append("backgroundImage", backgroundFile);
      const response = await fetch(`${API_BASE_URL}/templates`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      if (response.ok) {
        toast.success("Template saved successfully");
        if (!editingTemplateId) {
            setTemplateForm({
              name: "",
              orientation: "portrait",
              fontSize: 14,
              fontColor: "#000000",
              fontFamily: "Arial",
              templateText: "",
              backgroundImage: "",
            });
            setTemplateElements([]);
            setBackgroundFile(null);
        }
        setEditingTemplateId(null);
        refreshTemplates();
      } else {
        const err = await response.json();
        toast.error(err.msg || "Failed to save template");
      }
    } catch {
      toast.error("Error saving template");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success("Template deleted");
        refreshTemplates();
      }
    } catch {
      toast.error("Failed to delete template");
    }
  };

  const duplicateTemplate = async (t) => {
    setCloning(true);
    try {
      const payload = {
        name: `${t.name} (Copy)`,
        type: t.type,
        orientation: t.orientation,
        fontSize: t.fontSize,
        fontColor: t.fontColor,
        fontFamily: t.fontFamily,
        backgroundImage: t.backgroundImage,
        elements: t.elements
      };
      
      const response = await fetch(`${API_BASE_URL}/templates/duplicate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        toast.success("Template duplicated successfully");
        refreshTemplates();
      } else {
        // Fallback to standard POST if dedicated /duplicate doesn't exist
        const response2 = await fetch(`${API_BASE_URL}/templates`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(payload),
          });
          if (response2.ok) {
            toast.success("Template duplicated successfully");
            refreshTemplates();
          } else {
            toast.error("Failed to duplicate template");
          }
      }
    } catch {
      toast.error("Error duplicating template");
    } finally {
      setCloning(false);
    }
  };

  const toggleStudentSelect = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleGenerate = async () => {
    if (!course) return toast.error("Please select a course");
    if (!selectedTemplate) return toast.error("Please select a template");
    if (!selectedStudentIds.length)
      return toast.error("Please select at least one student");
    setSubmitting(true);
    const endpointMapping = {
      "id-card": "/id-cards/bulk-issue",
      certificate: "/certificates/bulk-issue",
      "admit-card": "/admit-cards/bulk-issue",
      marksheet: "/marksheets/bulk-issue",
    };
    try {
      const response = await fetch(
        `${API_BASE_URL}${endpointMapping[selectedCard]}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentIds: selectedStudentIds,
            course,
            templateId: selectedTemplate,
          }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(data.msg || "Bulk issuance successful");
        setSelectedStudentIds([]);
      } else toast.error(data.msg || "Issuance failed");
    } catch {
      toast.error("Error during bulk issuance");
    } finally {
      setSubmitting(false);
    }
  };

  const loadTemplate = (t) => {
    setEditingTemplateId(t._id);
    setTemplateForm({
      name: t.name || "",
      orientation: t.orientation || "portrait",
      fontSize: t.fontSize || 14,
      fontColor: t.fontColor || "#000000",
      fontFamily: t.fontFamily || "Arial",
      templateText: t.templateText || "",
      backgroundImage: t.backgroundImage || "",
    });
    setTemplateElements(t.elements || []);
    toast.info(`Template "${t.name}" loaded for editing`);
  };

  const previewBackground =
    backgroundPreview ||
    (templateForm.backgroundImage
      ? templateForm.backgroundImage.startsWith("http")
        ? templateForm.backgroundImage
        : `${API_BASE_URL.replace("/api", "")}${templateForm.backgroundImage}`
      : "");

  /* ── Style tokens ── */
  const inp = {
    width: "100%",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "9px 14px",
    fontSize: 13,
    fontWeight: 500,
    color: "#334155",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };
  const lbl = {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 5,
  };
  const card = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    overflow: "hidden",
  };
  const g2 = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: 16,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        fontFamily: "sans-serif",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: 16,
          background: "#fff",
          padding: isMobile ? 16 : 20,
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            <CreditCard size={22} />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 17 : 22,
                fontWeight: 900,
                color: "#1e293b",
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
              }}
            >
              Design Cards
            </h1>
            <p
              style={{
                margin: "5px 0 0",
                fontSize: 10,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Layout size={10} color="#3b82f6" /> Template Designer & Bulk
              Issuance
            </p>
          </div>
        </div>
      </div>

      {/* ── CARD TYPE SELECTOR ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
          gap: isMobile ? 10 : 16,
          marginTop: 8,
        }}
      >
        {CARD_TYPES.map((type) => (
          <button
            key={type.key}
            onClick={() => {
              setSelectedCard(type.key);
              setSelectedTemplate("");
              setCourse("");
              setActiveTab("template");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isMobile ? 6 : 10,
              padding: isMobile ? "12px 8px" : "14px 16px",
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              cursor: "pointer",
              border: "1px solid",
              transition: "all 0.2s",
              background: selectedCard === type.key ? "#0f172a" : "#fff",
              color: selectedCard === type.key ? "#fff" : "#64748b",
              borderColor: selectedCard === type.key ? "#0f172a" : "#e2e8f0",
              boxShadow:
                selectedCard === type.key
                  ? "0 4px 14px rgba(15,23,42,0.2)"
                  : "none",
            }}
          >
            <type.icon size={16} />
            {!isMobile || width > 400 ? type.label : null}
          </button>
        ))}
      </div>

      {/* ── TABS ── */}
      <div
        style={{
          display: "flex",
          background: "#f1f5f9",
          padding: 4,
          borderRadius: 14,
          border: "1px solid #e2e8f0",
        }}
      >
        {["template", "generate"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              cursor: "pointer",
              border: "none",
              transition: "all 0.2s",
              background: activeTab === tab ? "#fff" : "transparent",
              color: activeTab === tab ? "#0f172a" : "#64748b",
              boxShadow:
                activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab === "template" ? "Designer" : "Bulk Issue"}
          </button>
        ))}
      </div>

      {/* ── TEMPLATE DESIGNER TAB ── */}
      {activeTab === "template" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
            gap: isDesktop ? 32 : 20,
          }}
        >
          {/* ── Form Side ── */}
          <div
            style={{
              ...card,
              padding: isMobile ? 18 : 28,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Layout size={18} color="#3b82f6" />
              <h3
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#1e293b",
                }}
              >
                Template Settings
              </h3>
            </div>

            {/* Template Name */}
            <div>
              <label style={lbl}>Template Name</label>
              <input
                style={inp}
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Standard ID Card 2024"
              />
            </div>

            {/* Orientation + Font Size */}
            <div style={g2}>
              <div>
                <label style={lbl}>Orientation</label>
                <select
                  style={inp}
                  value={templateForm.orientation}
                  onChange={(e) =>
                    setTemplateForm((p) => ({
                      ...p,
                      orientation: e.target.value,
                    }))
                  }
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Font Size</label>
                <input
                  type="number"
                  style={inp}
                  value={templateForm.fontSize}
                  onChange={(e) =>
                    setTemplateForm((p) => ({
                      ...p,
                      fontSize: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            {/* Font Color + Font Family */}
            <div style={g2}>
              <div>
                <label style={lbl}>Font Color</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "8px 12px",
                  }}
                >
                  <input
                    type="color"
                    value={templateForm.fontColor}
                    onChange={(e) =>
                      setTemplateForm((p) => ({
                        ...p,
                        fontColor: e.target.value,
                      }))
                    }
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#94a3b8",
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                    }}
                  >
                    {templateForm.fontColor}
                  </span>
                </div>
              </div>
              <div>
                <label style={lbl}>Font Family</label>
                <input
                  style={inp}
                  value={templateForm.fontFamily}
                  onChange={(e) =>
                    setTemplateForm((p) => ({
                      ...p,
                      fontFamily: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Background Image */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
              <label style={lbl}>Background Image</label>
              <div
                style={{
                  position: "relative",
                  border: "2px dashed #e2e8f0",
                  borderRadius: 16,
                  padding: 24,
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#f8fafc",
                }}
              >
                <input
                  type="file"
                  onChange={(e) =>
                    setBackgroundFile(e.target.files?.[0] || null)
                  }
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                />
                <ImageIcon
                  size={28}
                  color={backgroundFile ? "#3b82f6" : "#cbd5e1"}
                  style={{ margin: "0 auto 8px" }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 900,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {backgroundFile
                    ? backgroundFile.name
                    : "Upload Background Image"}
                </p>
              </div>
            </div>

            {/* Placeholders */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
              <label style={lbl}>Add Student Details</label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                {PLACEHOLDERS.map((ph) => (
                  <button
                    key={ph.key}
                    type="button"
                    onClick={() => handleAddPlaceholder(ph.key)}
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      color: "#475569",
                      padding: "5px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#0f172a";
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.borderColor = "#0f172a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.color = "#475569";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                  >
                    {ph.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save */}
            <button
              onClick={saveTemplate}
              disabled={submitting}
              style={{
                width: "100%",
                background: "#0f172a",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                height: 46,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: submitting ? 0.6 : 1,
                boxShadow: "0 4px 14px rgba(15,23,42,0.2)",
              }}
            >
              {submitting ? (
                <Loader2
                  size={17}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Save size={17} />
              )}
              {editingTemplateId ? "Update Template" : "Save Template"}
            </button>
          </div>

          {/* ── Preview + Template List Side ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Preview Box */}
            <div style={{ ...card, padding: isMobile ? 16 : 22 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Move size={15} color="#3b82f6" />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#94a3b8",
                    }}
                  >
                    Design Preview
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f1f5f9", padding: "2px 8px", borderRadius: 8 }}>
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><ZoomOut size={14}/></button>
                    <span style={{ fontSize: 9, fontWeight: 900, color: '#475569', minWidth: 25, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><ZoomIn size={14}/></button>
                  </div>
                  <button 
                    onClick={() => setShowMockData(!showMockData)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8,
                      fontSize: 9, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer',
                      background: showMockData ? '#0f172a' : '#fff',
                      color: showMockData ? '#fff' : '#64748b',
                      border: '1px solid', borderColor: showMockData ? '#0f172a' : '#e2e8f0',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Sparkles size={12} /> {showMockData ? "Live View" : "Draft View"}
                  </button>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#cbd5e1",
                      textTransform: "uppercase",
                    }}
                  >
                    Drag to position
                  </span>
                </div>
              </div>

              <div
                id="preview-box"
                style={{
                  position: "relative",
                  border: "2px solid #f1f5f9",
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "#f8fafc",
                  aspectRatio:
                    templateForm.orientation === "portrait" ? "3/4" : "4/3",
                  maxHeight: isMobile ? 280 : 500,
                  backgroundImage: previewBackground
                    ? `url(${previewBackground})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                  transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
                onClick={() => setSelectedElementId(null)}
              >
                {!previewBackground && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(255,255,255,0.4)",
                    }}
                  />
                )}
                {templateElements.length === 0 && !previewBackground && (
                  <div style={{ textAlign: "center", opacity: 0.25 }}>
                    <Database size={44} style={{ margin: "0 auto 8px" }} />
                    <p
                      style={{
                        margin: 0,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Empty Canvas
                    </p>
                  </div>
                )}
                {templateElements.map((el) => {
                  const isSelected = selectedElementId === el.id;
                  const isPhoto = el.token === 'student_photo';
                  const isQR = el.token === 'qr_code';
                  
                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setSelectedElementId(el.id);
                        onDragStart(el, e);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        left: el.x,
                        top: el.y,
                        padding: isPhoto || isQR ? 0 : "4px 10px",
                        background: isPhoto || isQR ? "transparent" : (isSelected ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.8)"),
                        backdropFilter: "blur(4px)",
                        border: isSelected ? "2px solid #3b82f6" : "1px solid rgba(226, 232, 240, 0.5)",
                        borderRadius: isPhoto || isQR ? 4 : 8,
                        boxShadow: isSelected ? "0 4px 12px rgba(59,130,246,0.3)" : "0 2px 6px rgba(0,0,0,0.05)",
                        cursor: "move",
                        userSelect: "none",
                        color: el.fontColor || templateForm.fontColor,
                        fontSize: el.fontSize || templateForm.fontSize,
                        fontFamily: templateForm.fontFamily,
                        fontWeight: el.fontWeight || "normal",
                        width: el.width,
                        height: el.height,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: isSelected ? 50 : 10,
                        transition: "border 0.2s, box-shadow 0.2s",
                      }}
                    >
                      {isPhoto ? (
                        <div style={{ width: '100%', height: '100%', border: '2px dashed #94a3b8', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', overflow: 'hidden' }}>
                          {showMockData ? <img src={MOCK_DATA.student_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={20} color="#94a3b8" />}
                        </div>
                      ) : isQR ? (
                        <div style={{ width: '100%', height: '100%', border: '2px dashed #94a3b8', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                          <Database size={20} color="#94a3b8" />
                        </div>
                      ) : (
                        showMockData ? (MOCK_DATA[el.token] || `{{${el.label}}}`) : `{{${el.label}}}`
                      )}

                      {/* Element Actions */}
                      {isSelected && (
                        <button
                          style={{
                            position: "absolute",
                            top: -10,
                            right: -10,
                            width: 20,
                            height: 20,
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            padding: 0,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            zIndex: 60
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTemplateElements((prev) =>
                              prev.filter((x) => x.id !== el.id),
                            );
                            setSelectedElementId(null);
                          }}
                        >
                          <XCircle size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Contextual Toolbar for Element Styling */}
              {activeTab === "template" && selectedElementId && (
                <div style={{
                  position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
                  background: '#0f172a', borderRadius: 20, padding: '10px 24px',
                  display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                  zIndex: 1000, border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: 24 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Type size={16} color="#3b82f6" />
                    </div>
                    <div>
                      <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', display: 'block', letterSpacing: '0.05em' }}>
                        {templateElements.find(el => el.id === selectedElementId)?.label}
                      </span>
                      <span style={{ color: '#64748b', fontSize: 8, fontWeight: 700, textTransform: 'uppercase' }}>Styling active</span>
                    </div>
                  </div>
                  
                  {/* Font Size */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => updateElement(selectedElementId, { fontSize: (templateElements.find(el => el.id === selectedElementId)?.fontSize || 14) - 1 })} style={{ border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                    <span style={{ color: '#fff', fontSize: 14, fontWeight: 900, minWidth: 24, textAlign: 'center' }}>{templateElements.find(el => el.id === selectedElementId)?.fontSize || 14}</span>
                    <button onClick={() => updateElement(selectedElementId, { fontSize: (templateElements.find(el => el.id === selectedElementId)?.fontSize || 14) + 1 })} style={{ border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>

                  {/* Font Weight */}
                  <button 
                    onClick={() => updateElement(selectedElementId, { fontWeight: templateElements.find(el => el.id === selectedElementId)?.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    style={{
                      border: 'none', background: templateElements.find(el => el.id === selectedElementId)?.fontWeight === 'bold' ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                      color: '#fff', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 900, transition: 'all 0.2s'
                    }}
                  >
                    <Bold size={14} /> BOLD
                  </button>

                  {/* Color Picker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ position: 'relative', width: 28, height: 28, borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }}>
                      <input 
                        type="color" 
                        value={templateElements.find(el => el.id === selectedElementId)?.fontColor || templateForm.fontColor}
                        onChange={(e) => updateElement(selectedElementId, { fontColor: e.target.value })}
                        style={{ position: 'absolute', top: -10, left: -10, width: 50, height: 50, cursor: 'pointer', border: 'none', background: 'none' }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedElementId(null)}
                    style={{ border: 'none', background: 'rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 900 }}
                  >
                    <XCircle size={16} /> CLOSE
                  </button>
                </div>
              )}
            </div>

            {/* Saved Templates List */}
            <div style={{ ...card, padding: isMobile ? 16 : 22 }}>
              <h4
                style={{
                  margin: "0 0 18px",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#94a3b8",
                }}
              >
                Saved Templates
              </h4>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {templates.map((t) => (
                  <div
                    key={t._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: "#f8fafc",
                      borderRadius: 12,
                      border: "1px solid #f1f5f9",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "#cbd5e1")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "#f1f5f9")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#94a3b8",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                          flexShrink: 0,
                        }}
                      >
                        <FileText size={18} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#1e293b",
                            textTransform: "uppercase",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.name}
                        </p>
                        <p
                          style={{
                            margin: "3px 0 0",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {t.orientation} |{" "}
                          {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      <button
                        onClick={() => duplicateTemplate(t)}
                        disabled={cloning}
                        style={{
                          padding: 7,
                          background: "none",
                          border: "none",
                          borderRadius: 8,
                          color: "#10b981",
                          cursor: "pointer",
                          opacity: cloning ? 0.5 : 1
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#ecfdf5")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "none")
                        }
                        title="Duplicate Template"
                      >
                        {cloning ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }}/> : <Copy size={15} />}
                      </button>
                      <button
                        onClick={() => loadTemplate(t)}
                        style={{
                          padding: 7,
                          background: "none",
                          border: "none",
                          borderRadius: 8,
                          color: "#2563eb",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#eff6ff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "none")
                        }
                        title="Load Template"
                      >
                        <ExternalLink size={15} />
                      </button>
                      <button
                        onClick={() => deleteTemplate(t._id)}
                        style={{
                          padding: 7,
                          background: "none",
                          border: "none",
                          borderRadius: 8,
                          color: "#e11d48",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#fff1f2")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "none")
                        }
                        title="Delete Template"
                      >
                        <Trash2 size={15} />
                      </button>
                      <ChevronRight size={16} color="#cbd5e1" />
                    </div>
                  </div>
                ))}
                {templates.length === 0 && (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "32px 0",
                      color: "#94a3b8",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    No templates created yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BULK ISSUE TAB ── */}
      {activeTab === "generate" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Course + Template + Generate */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : isDesktop
                  ? "1fr 1fr auto"
                  : "1fr 1fr",
              gap: 16,
              alignItems: "end",
            }}
          >
            <div style={{ ...card, padding: 20 }}>
              <label style={lbl}>Target Course</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                style={inp}
              >
                <option value="">Select Course</option>
                {courseOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ ...card, padding: 20 }}>
              <label style={lbl}>Issuance Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                style={inp}
              >
                <option value="">Select Template</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={submitting || loading}
              style={{
                background: "#0f172a",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "14px 28px",
                fontWeight: 700,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: submitting || loading ? 0.5 : 1,
                boxShadow: "0 4px 14px rgba(15,23,42,0.2)",
                width: isMobile || isTablet ? "100%" : "auto",
                height: isMobile || isTablet ? 46 : "auto",
              }}
            >
              {submitting ? (
                <Loader2
                  size={18}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Printer size={18} />
              )}
              Generate Cards
            </button>
          </div>

          {/* Student Selection */}
          <div style={{ ...card }}>
            {/* Header */}
            <div
              style={{
                padding: isMobile ? "14px 16px" : "16px 22px",
                background: "#f8fafc",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Users size={18} color="#94a3b8" />
                <h3
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#1e293b",
                  }}
                >
                  Student Selection
                </h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {selectedStudentIds.length > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#2563eb",
                      background: "#eff6ff",
                      padding: "3px 12px",
                      borderRadius: 999,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {selectedStudentIds.length} Selected
                  </span>
                )}
                <button
                  onClick={() =>
                    setSelectedStudentIds(filteredStudents.map((s) => s._id))
                  }
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#94a3b8",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#0f172a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#94a3b8")
                  }
                >
                  Select All
                </button>
              </div>
            </div>

            {/* Table (tablet+) or Cards (mobile) */}
            {isMobile ? (
              /* Mobile card list */
              <div>
                {filteredStudents.length === 0 ? (
                  <div
                    style={{
                      padding: "48px 20px",
                      textAlign: "center",
                      color: "#94a3b8",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Please select a course to view students
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <div
                      key={student._id}
                      onClick={() => toggleStudentSelect(student._id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "13px 16px",
                        borderBottom: "1px solid #f8fafc",
                        cursor: "pointer",
                        background: selectedStudentIds.includes(student._id)
                          ? "#eff6ff"
                          : "transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        readOnly
                        checked={selectedStudentIds.includes(student._id)}
                        style={{
                          width: 16,
                          height: 16,
                          flexShrink: 0,
                          cursor: "pointer",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#1e293b",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {student.name}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                            marginTop: 5,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#2563eb",
                              fontFamily: "monospace",
                            }}
                          >
                            #{student.rollNumber || "N/A"}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#64748b",
                              background: "#f1f5f9",
                              padding: "1px 8px",
                              borderRadius: 999,
                              textTransform: "uppercase",
                            }}
                          >
                            {student.batch || "General"}
                          </span>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          padding: "4px 10px",
                          borderRadius: 8,
                          border: "1px solid",
                          background: selectedStudentIds.includes(student._id)
                            ? "#2563eb"
                            : "#fff",
                          color: selectedStudentIds.includes(student._id)
                            ? "#fff"
                            : "#94a3b8",
                          borderColor: selectedStudentIds.includes(student._id)
                            ? "#2563eb"
                            : "#e2e8f0",
                          flexShrink: 0,
                        }}
                      >
                        {selectedStudentIds.includes(student._id)
                          ? "✓"
                          : "Select"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Tablet / Desktop table */
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      {[
                        null,
                        "Student Name",
                        "Roll Number",
                        "Batch",
                        "Selection",
                      ].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "12px 24px",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            textAlign: i === 4 ? "right" : "left",
                          }}
                        >
                          {i === 0 ? (
                            <input
                              type="checkbox"
                              onChange={(e) =>
                                setSelectedStudentIds(
                                  e.target.checked
                                    ? filteredStudents.map((s) => s._id)
                                    : [],
                                )
                              }
                              checked={
                                selectedStudentIds.length ===
                                  filteredStudents.length &&
                                filteredStudents.length > 0
                              }
                              style={{ cursor: "pointer" }}
                            />
                          ) : (
                            h
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "60px 24px",
                            textAlign: "center",
                            color: "#94a3b8",
                            fontWeight: 700,
                          }}
                        >
                          Please select a course to view students
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr
                          key={student._id}
                          style={{ borderBottom: "1px solid #f8fafc" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#f8fafc")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td style={{ padding: "12px 24px" }}>
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.includes(student._id)}
                              onChange={() => toggleStudentSelect(student._id)}
                              style={{ cursor: "pointer" }}
                            />
                          </td>
                          <td style={{ padding: "12px 24px" }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#1e293b",
                              }}
                            >
                              {student.name}
                            </p>
                          </td>
                          <td style={{ padding: "12px 24px" }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontFamily: "monospace",
                                fontWeight: 700,
                                color: "#2563eb",
                              }}
                            >
                              #{student.rollNumber || "N/A"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 24px" }}>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#64748b",
                                background: "#f1f5f9",
                                padding: "3px 10px",
                                borderRadius: 999,
                                textTransform: "uppercase",
                              }}
                            >
                              {student.batch || "General"}
                            </span>
                          </td>
                          <td
                            style={{ padding: "12px 24px", textAlign: "right" }}
                          >
                            <button
                              onClick={() => toggleStudentSelect(student._id)}
                              style={{
                                fontSize: 9,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                padding: "5px 14px",
                                borderRadius: 8,
                                border: "1px solid",
                                cursor: "pointer",
                                background: selectedStudentIds.includes(
                                  student._id,
                                )
                                  ? "#2563eb"
                                  : "#fff",
                                color: selectedStudentIds.includes(student._id)
                                  ? "#fff"
                                  : "#94a3b8",
                                borderColor: selectedStudentIds.includes(
                                  student._id,
                                )
                                  ? "#2563eb"
                                  : "#e2e8f0",
                              }}
                            >
                              {selectedStudentIds.includes(student._id)
                                ? "Selected"
                                : "Select"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
