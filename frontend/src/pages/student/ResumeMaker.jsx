import React, { useState, useEffect } from "react";
import axios from "../../lib/axios";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
  Font,
} from "@react-pdf/renderer";
import {
  Save,
  Download,
  Plus,
  Trash2,
  Layout,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

// --- PDF STYLES ---
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#333",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  name: { fontSize: 24, fontWeight: "bold", color: "#000", marginBottom: 10 },
  contact: {
    fontSize: 10,
    color: "#666",
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  section: { marginTop: 15 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
    borderBottom: 1,
    borderBottomColor: "#ccc",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  itemTitle: { fontSize: 11, fontWeight: "bold", color: "#000" },
  itemSubtitle: { fontSize: 10, fontStyle: "italic", color: "#444" },
  itemDate: { fontSize: 10, color: "#666" },
  bullet: { marginLeft: 10, fontSize: 10, marginBottom: 2 },
  summary: { fontSize: 10, textAlign: "justify" },
  skillContainer: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  skill: {
    fontSize: 10,
    backgroundColor: "#f0f0f0",
    padding: "2 5",
    borderRadius: 3,
  },
});

// --- TEMPLATES (Memoized to prevent unnecessary re-renders) ---
const ATS_Template = React.memo(({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.profile?.name || "Your Name"}</Text>
        <View style={styles.contact}>
          <Text>{data.profile?.email}</Text>
          <Text>|</Text>
          <Text>{data.profile?.phone}</Text>
          <Text>|</Text>
          <Text>
            {data.profile?.city}, {data.profile?.state}
          </Text>
        </View>
      </View>

      {/* Summary */}
      {data.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{data.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Experience</Text>
          {data.experience.map((exp, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{exp.role}</Text>
                <Text style={styles.itemDate}>{exp.duration}</Text>
              </View>
              <Text style={styles.itemSubtitle}>{exp.company}</Text>
              <Text style={styles.summary}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{edu.degree}</Text>
                <Text style={styles.itemDate}>
                  {edu.startYear} - {edu.endYear}
                </Text>
              </View>
              <Text style={styles.itemSubtitle}>{edu.institution}</Text>
              {edu.percentage && (
                <Text style={styles.summary}>Grade: {edu.percentage}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {data.skills?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
          <View>
            {data.skills.map((skill, i) => (
              <View key={i} style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={{ fontWeight: "bold", width: 100 }}>
                  {skill.category}:{" "}
                </Text>
                <Text style={{ flex: 1 }}>{skill.list}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Projects</Text>
          {data.projects.map((proj, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <Text style={styles.itemTitle}>{proj.title}</Text>
              <Text style={styles.summary}>{proj.description}</Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
));

const Modern_Template = React.memo(({ data }) => (
  <Document>
    <Page size="A4" style={[styles.page, { backgroundColor: "#fff" }]}>
      {/* Sidebar-style Layout */}
      <View style={{ flexDirection: "row", gap: 20 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: "#2563eb" }]}>
            {data.profile?.name}
          </Text>
          <Text style={[styles.itemSubtitle, { marginBottom: 15 }]}>
            {data.profile?.email} | {data.profile?.phone}
          </Text>

          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { borderBottomColor: "#2563eb", color: "#2563eb" },
              ]}
            >
              Experience
            </Text>
            {data.experience?.map((exp, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Text style={styles.itemTitle}>{exp.role}</Text>
                <Text style={styles.itemSubtitle}>
                  {exp.company} ({exp.duration})
                </Text>
                <Text style={styles.summary}>{exp.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ width: 150 }}>
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { borderBottomColor: "#2563eb", color: "#2563eb" },
              ]}
            >
              Skills
            </Text>
            {data.skills?.map((skill, i) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <Text style={{ fontWeight: "bold", fontSize: 9 }}>
                  {skill.category}:
                </Text>
                <Text style={{ fontSize: 9 }}>{skill.list}</Text>
              </View>
            ))}
          </View>
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { borderBottomColor: "#2563eb", color: "#2563eb" },
              ]}
            >
              Education
            </Text>
            {data.education?.map((edu, i) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <Text style={[styles.itemTitle, { fontSize: 9 }]}>
                  {edu.degree}
                </Text>
                <Text style={{ fontSize: 8 }}>{edu.institution}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Page>
  </Document>
));

const Classic_Template = React.memo(({ data }) => (
  <Document>
    <Page size="A4" style={[styles.page, { fontFamily: "Times-Roman" }]}>
      <View
        style={{
          textAlign: "center",
          borderBottom: 1,
          paddingBottom: 10,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          {(data.profile?.name || "").toUpperCase()}
        </Text>
        <Text style={{ fontSize: 10 }}>
          {data.profile?.address || ""} | {data.profile?.phone || ""} |{" "}
          {data.profile?.email || ""}
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "bold",
            borderBottom: 1,
            marginBottom: 5,
          }}
        >
          EXPERIENCE
        </Text>
        {data.experience?.map((exp, i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontWeight: "bold" }}>{exp.company}</Text>
              <Text>{exp.duration}</Text>
            </View>
            <Text style={{ fontStyle: "italic" }}>{exp.role}</Text>
            <Text style={{ fontSize: 10 }}>{exp.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "bold",
            borderBottom: 1,
            marginBottom: 5,
          }}
        >
          EDUCATION
        </Text>
        {data.education?.map((edu, i) => (
          <View key={i} style={{ marginBottom: 5 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontWeight: "bold" }}>{edu.institution}</Text>
              <Text>{edu.endYear}</Text>
            </View>
            <Text>
              {edu.degree} - {edu.percentage}
            </Text>
          </View>
        ))}
      </View>

      {/* Added Skills and Projects to Classic */}
      {data.skills?.length > 0 && (
        <View style={styles.section}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              borderBottom: 1,
              marginBottom: 5,
            }}
          >
            SKILLS
          </Text>
          {data.skills.map((skill, i) => (
            <Text key={i} style={{ fontSize: 10, marginBottom: 2 }}>
              <Text style={{ fontWeight: "bold" }}>{skill.category}: </Text>
              {skill.list}
            </Text>
          ))}
        </View>
      )}

      {data.projects?.length > 0 && (
        <View style={styles.section}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              borderBottom: 1,
              marginBottom: 5,
            }}
          >
            PROJECTS
          </Text>
          {data.projects.map((proj, i) => (
            <View key={i} style={{ marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>{proj.title}</Text>
              <Text style={{ fontSize: 10 }}>{proj.description}</Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
));

const Premium_Template = React.memo(({ data }) => (
  <Document>
    <Page
      size="A4"
      style={[
        styles.page,
        { fontFamily: "Times-Roman", padding: "40 50", fontSize: 10 },
      ]}
    >
      {/* Centered Header */}
      <View style={{ textAlign: "center", marginBottom: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>
          {data.profile?.name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 12,
            fontSize: 9,
            color: "#444",
          }}
        >
          <Text>{data.profile?.phone}</Text>
          <Text>|</Text>
          <Text>{data.profile?.email}</Text>
          {data.profile?.city && (
            <>
              <Text>|</Text>
              <Text>
                {data.profile?.city}, {data.profile?.state}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Summary */}
      {data.summary && (
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "bold",
              borderBottom: 1,
              paddingBottom: 2,
              marginBottom: 5,
            }}
          >
            Professional Summary
          </Text>
          <Text style={{ textAlign: "justify", lineHeight: 1.4 }}>
            {data.summary}
          </Text>
        </View>
      )}

      {/* Skills */}
      {data.skills?.length > 0 && (
        <View style={{ marginTop: 15 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "bold",
              borderBottom: 1,
              paddingBottom: 2,
              marginBottom: 5,
            }}
          >
            Technical Skills
          </Text>
          {data.skills.map((skill, i) => (
            <View key={i} style={{ flexDirection: "row", marginBottom: 3 }}>
              <Text style={{ fontWeight: "bold", minWidth: 90 }}>
                {skill.category}:{" "}
              </Text>
              <Text style={{ flex: 1, textAlign: "justify" }}>
                {skill.list}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <View style={{ marginTop: 15 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "bold",
              borderBottom: 1,
              paddingBottom: 2,
              marginBottom: 5,
            }}
          >
            Experience
          </Text>
          {data.experience.map((exp, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                }}
              >
                <Text style={{ fontSize: 11 }}>{exp.company}</Text>
                <Text>{exp.duration}</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontStyle: "italic",
                  marginTop: 1,
                }}
              >
                <Text>{exp.role}</Text>
                <Text style={{ fontSize: 9, color: "#666" }}>
                  {data.profile?.city || "Remote"}
                </Text>
              </View>
              <View style={{ marginTop: 4, marginLeft: 10 }}>
                <Text style={{ lineHeight: 1.3 }}>• {exp.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <View style={{ marginTop: 15 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "bold",
              borderBottom: 1,
              paddingBottom: 2,
              marginBottom: 5,
            }}
          >
            Projects
          </Text>
          {data.projects.map((proj, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>{proj.title}</Text>
                <Text style={{ fontSize: 9, fontStyle: "italic" }}>
                  Personal Project
                </Text>
              </View>
              <View style={{ marginTop: 2, marginLeft: 10 }}>
                <Text style={{ lineHeight: 1.3 }}>• {proj.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <View style={{ marginTop: 15 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "bold",
              borderBottom: 1,
              paddingBottom: 2,
              marginBottom: 5,
            }}
          >
            Education
          </Text>
          {data.education.map((edu, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                }}
              >
                <Text>{edu.institution}</Text>
                <Text>{edu.endYear}</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontStyle: "italic",
                }}
              >
                <Text>{edu.degree}</Text>
                <Text style={{ fontSize: 9, color: "#666" }}>
                  {edu.percentage && `Grade: ${edu.percentage}`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
));

// --- PREVIEW COMPONENT (To isolate PDF rendering) ---
const ResumePreview = React.memo(({ data, templateId }) => {
  const document = React.useMemo(() => {
    if (templateId === "modern") return <Modern_Template data={data} />;
    if (templateId === "classic") return <Classic_Template data={data} />;
    if (templateId === "premium") return <Premium_Template data={data} />;
    return <ATS_Template data={data} />;
  }, [data, templateId]);

  return (
    <PDFViewer
      width="100%"
      height="100%"
      className="border-none"
      showToolbar={false}
    >
      {document}
    </PDFViewer>
  );
});

// --- MAIN COMPONENT ---
export default function ResumeMaker({ studentData }) {
  const [data, setData] = useState({
    profile: {
      name: studentData?.name || "",
      email: studentData?.email || "",
      phone: studentData?.phone || "",
      city: studentData?.city || "",
      state: studentData?.state || "",
    },
    summary: "",
    education: [],
    experience: [],
    skills: [],
    projects: [],
    templateId: "ats-standard",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [newSkillCategory, setNewSkillCategory] = useState("");
  const [newSkillList, setNewSkillList] = useState("");

  // --- Debounce State for PDF Preview ---
  const [debouncedData, setDebouncedData] = useState(data);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedData(data);
    }, 800); // Delay PDF re-render to prevent blinking
    return () => clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      const res = await axios.get("/resume", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.resume) {
        setData(res.data.resume);
      } else if (res.data.studentProfile) {
        setData((prev) => ({
          ...prev,
          profile: res.data.studentProfile,
        }));
      }
    } catch (error) {
      console.error("Fetch resume error:", error);
      if (error.response?.status !== 401) {
        toast.error("Failed to load resume details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("studentToken");
      await axios.post("/resume", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Resume saved successfully");
    } catch (error) {
      toast.error("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field, structure) => {
    setData({ ...data, [field]: [...data[field], structure] });
  };

  const removeItem = (field, index) => {
    const list = [...data[field]];
    list.splice(index, 1);
    setData({ ...data, [field]: list });
  };

  const updateItem = (field, index, subField, value) => {
    const list = [...data[field]];
    list[index][subField] = value;
    setData({ ...data, [field]: list });
  };

  const handleAddSkill = () => {
    if (newSkillCategory.trim() && newSkillList.trim()) {
      setData({
        ...data,
        skills: [
          ...data.skills,
          { category: newSkillCategory.trim(), list: newSkillList.trim() },
        ],
      });
      setNewSkillCategory("");
      setNewSkillList("");
    } else {
      toast.error("Please fill both Category and Skills");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        Loading Resume Builder...
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" /> Professional Resume Builder
          </h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Generate High-Probability ATS-Friendly Resumes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
            {[
              {
                id: "ats-standard",
                label: "ATS",
                icon: <FileText size={14} />,
              },
              {
                id: "premium",
                label: "Premium",
                icon: <FileText size={14} className="text-amber-500" />,
              },
              { id: "modern", label: "Modern", icon: <Layout size={14} /> },
              { id: "classic", label: "Classic", icon: <FileText size={14} /> },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setData({ ...data, templateId: t.id })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${data.templateId === t.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${saving ? "bg-slate-200" : "bg-slate-800 text-white hover:bg-black shadow-lg shadow-slate-200"}`}
          >
            <Save size={16} /> {saving ? "Saving..." : "Save Progress"}
          </button>

          <PDFDownloadLink
            document={
              data.templateId === "modern" ? (
                <Modern_Template data={debouncedData} />
              ) : data.templateId === "classic" ? (
                <Classic_Template data={debouncedData} />
              ) : data.templateId === "premium" ? (
                <Premium_Template data={debouncedData} />
              ) : (
                <ATS_Template data={debouncedData} />
              )
            }
            fileName={`${data.profile.name.replace(/\s+/g, "_")}_Resume.pdf`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            {({ loading }) => (
              <>
                <Download size={16} />{" "}
                {loading ? "Preparing..." : "Download ATS Resume"}
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Editor */}
        <div className="w-[450px] bg-white border-r overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {/* Section: Profile */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Code size={14} className="rotate-180" /> Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Full Name"
                className="col-span-2 p-2.5 border rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={data.profile.name}
                onChange={(e) =>
                  setData({
                    ...data,
                    profile: { ...data.profile, name: e.target.value },
                  })
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="p-2.5 border rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-100 outline-none"
                value={data.profile.email}
                onChange={(e) =>
                  setData({
                    ...data,
                    profile: { ...data.profile, email: e.target.value },
                  })
                }
              />
              <input
                type="tel"
                placeholder="Phone"
                className="p-2.5 border rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-100 outline-none"
                value={data.profile.phone}
                onChange={(e) =>
                  setData({
                    ...data,
                    profile: { ...data.profile, phone: e.target.value },
                  })
                }
              />
              <input
                type="text"
                placeholder="City"
                className="p-2.5 border rounded-lg text-sm bg-slate-50"
                value={data.profile.city}
                onChange={(e) =>
                  setData({
                    ...data,
                    profile: { ...data.profile, city: e.target.value },
                  })
                }
              />
              <input
                type="text"
                placeholder="State"
                className="p-2.5 border rounded-lg text-sm bg-slate-50"
                value={data.profile.state}
                onChange={(e) =>
                  setData({
                    ...data,
                    profile: { ...data.profile, state: e.target.value },
                  })
                }
              />
            </div>
          </section>

          {/* Section: Summary */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText size={14} /> Professional Summary
            </h2>
            <textarea
              rows={4}
              placeholder="Briefly describe your highlights and career goals..."
              className="w-full p-3 border rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              value={data.summary}
              onChange={(e) => setData({ ...data, summary: e.target.value })}
            />
          </section>

          {/* Section: Experience */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Briefcase size={14} /> Experience
              </h2>
              <button
                onClick={() =>
                  addItem("experience", {
                    company: "",
                    role: "",
                    duration: "",
                    description: "",
                  })
                }
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Add Experience"
              >
                <Plus size={20} />
              </button>
            </div>
            {data.experience.map((exp, i) => (
              <div
                key={i}
                className="p-4 border rounded-xl bg-slate-50/50 space-y-3 relative group"
              >
                <button
                  onClick={() => removeItem("experience", i)}
                  className="absolute -top-2 -right-2 p-1.5 bg-white border shadow-sm text-slate-400 hover:text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={12} />
                </button>
                <input
                  type="text"
                  placeholder="Role / Job Title"
                  className="w-full p-2 border rounded-lg text-xs bg-white"
                  value={exp.role}
                  onChange={(e) =>
                    updateItem("experience", i, "role", e.target.value)
                  }
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Company"
                    className="flex-1 p-2 border rounded-lg text-xs bg-white"
                    value={exp.company}
                    onChange={(e) =>
                      updateItem("experience", i, "company", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Jan 2020 - Present"
                    className="w-1/3 p-2 border rounded-lg text-xs bg-white"
                    value={exp.duration}
                    onChange={(e) =>
                      updateItem("experience", i, "duration", e.target.value)
                    }
                  />
                </div>
                <textarea
                  placeholder="Key accomplishments..."
                  className="w-full p-2 border rounded-lg text-xs bg-white resize-none"
                  rows={3}
                  value={exp.description}
                  onChange={(e) =>
                    updateItem("experience", i, "description", e.target.value)
                  }
                />
              </div>
            ))}
          </section>

          {/* Section: Education */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <GraduationCap size={14} /> Education
              </h2>
              <button
                onClick={() =>
                  addItem("education", {
                    institution: "",
                    degree: "",
                    startYear: "",
                    endYear: "",
                    percentage: "",
                  })
                }
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            {data.education.map((edu, i) => (
              <div
                key={i}
                className="p-4 border rounded-xl bg-slate-50/50 space-y-3 relative group"
              >
                <button
                  onClick={() => removeItem("education", i)}
                  className="absolute -top-2 -right-2 p-1.5 bg-white border shadow-sm text-slate-400 hover:text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={12} />
                </button>
                <input
                  type="text"
                  placeholder="Degree / Course"
                  className="w-full p-2 border rounded-lg text-xs bg-white"
                  value={edu.degree}
                  onChange={(e) =>
                    updateItem("education", i, "degree", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Institution / University"
                  className="w-full p-2 border rounded-lg text-xs bg-white"
                  value={edu.institution}
                  onChange={(e) =>
                    updateItem("education", i, "institution", e.target.value)
                  }
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Start Year"
                    className="flex-1 p-2 border rounded-lg text-xs bg-white"
                    value={edu.startYear}
                    onChange={(e) =>
                      updateItem("education", i, "startYear", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="End Year"
                    className="flex-1 p-2 border rounded-lg text-xs bg-white"
                    value={edu.endYear}
                    onChange={(e) =>
                      updateItem("education", i, "endYear", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="CGPA/ %"
                    className="w-1/4 p-2 border rounded-lg text-xs bg-white"
                    value={edu.percentage}
                    onChange={(e) =>
                      updateItem("education", i, "percentage", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Section: Skills */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Code size={14} /> Technical Skills
              </h2>
            </div>

            <div className="p-4 border rounded-xl bg-slate-50 space-y-3">
              <input
                type="text"
                placeholder="Category (e.g. Languages)"
                className="w-full p-2 border rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-blue-100"
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
              />
              <textarea
                placeholder="Skills (e.g. Java, Python, C++)"
                className="w-full p-2 border rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                rows={2}
                value={newSkillList}
                onChange={(e) => setNewSkillList(e.target.value)}
              />
              <button
                onClick={handleAddSkill}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Add Skill Category
              </button>
            </div>

            <div className="space-y-2">
              {data.skills.map((skill, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between p-3 border rounded-lg bg-white group"
                >
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-slate-800">
                      {skill.category}:
                    </p>
                    <p className="text-[10px] text-slate-500">{skill.list}</p>
                  </div>
                  <button
                    onClick={() => removeItem("skills", i)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Projects */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Globe size={14} /> Projects
              </h2>
              <button
                onClick={() =>
                  addItem("projects", { title: "", link: "", description: "" })
                }
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Add Project"
              >
                <Plus size={20} />
              </button>
            </div>
            {data.projects.map((proj, i) => (
              <div
                key={i}
                className="p-4 border rounded-xl bg-slate-50/50 space-y-3 relative group"
              >
                <button
                  onClick={() => removeItem("projects", i)}
                  className="absolute -top-2 -right-2 p-1.5 bg-white border shadow-sm text-slate-400 hover:text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={12} />
                </button>
                <input
                  type="text"
                  placeholder="Project Title"
                  className="w-full p-2 border rounded-lg text-xs bg-white"
                  value={proj.title}
                  onChange={(e) =>
                    updateItem("projects", i, "title", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Project Link (Github/Live)"
                  className="w-full p-2 border rounded-lg text-xs bg-white"
                  value={proj.link}
                  onChange={(e) =>
                    updateItem("projects", i, "link", e.target.value)
                  }
                />
                <textarea
                  placeholder="Key features and tech stack..."
                  className="w-full p-2 border rounded-lg text-xs bg-white resize-none"
                  rows={3}
                  value={proj.description}
                  onChange={(e) =>
                    updateItem("projects", i, "description", e.target.value)
                  }
                />
              </div>
            ))}
          </section>
        </div>

        {/* Right Side: Preview */}
        <div className="flex-1 bg-slate-100 p-4 md:p-8 flex flex-col items-center overflow-hidden">
          <div className="bg-white shadow-2xl rounded-lg w-full h-full flex flex-col max-w-[900px]">
            <div className="bg-slate-900 px-4 py-2 text-white text-[10px] font-bold flex items-center justify-between uppercase tracking-widest rounded-t-lg">
              <span className="flex items-center gap-2">
                <Layout size={12} className="text-blue-400" /> Live ATS Preview
              </span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              </div>
            </div>
            <div className="flex-1 bg-slate-500 overflow-hidden relative">
              <ResumePreview
                data={debouncedData}
                templateId={data.templateId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
