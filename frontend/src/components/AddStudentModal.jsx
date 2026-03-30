import React, { useState, useEffect } from "react";
import axios from "../lib/axios";
import { Loader2, X, User, BookOpen, Users, Upload, ChevronDown } from "lucide-react";

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

/* ─── Shared Style Tokens ─── */
const INP_BASE = {
  width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0",
  borderRadius: 10, padding: "9px 13px", fontSize: 13, fontWeight: 500,
  color: "#334155", outline: "none", height: 40, boxSizing: "border-box",
  fontFamily: "inherit",
};
const SEL_INP = { ...INP_BASE, paddingRight: 32, appearance: "none", cursor: "pointer" };
const LBL_STYLE = {
  display: "block", fontSize: 11, fontWeight: 700, color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5,
};

/* ─── Modal Sub-components (outside to prevent focus loss) ─── */
const Field = React.memo(({ label, required, children, span, isMobile }) => (
  <div style={{ gridColumn: span ? (isMobile ? "1" : span) : "auto" }}>
    <label style={LBL_STYLE}>{label} {required && <span style={{ color: "#f43f5e" }}>*</span>}</label>
    {children}
  </div>
));

const SelectField = React.memo(({ name, value, onChange, children }) => (
  <div style={{ position: "relative" }}>
    <select name={name} value={value} onChange={onChange} style={SEL_INP}>{children}</select>
    <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
  </div>
));

const SectionHeader = React.memo(({ icon: Icon, color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 10, borderBottom: "1px solid #f1f5f9", marginBottom: 16 }}>
    <Icon size={15} color={color} />
    <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</h3>
  </div>
));

const INITIAL_FORM = {
  franchise: "", registrationNo: "", admissionDate: "", course: "", batch: "",
  rollNumber: "", name: "", dob: "", gender: "",
  bloodGroup: "", phone: "", email: "", address: "", state: "", district: "",
  city: "", pincode: "", username: "", password: "", referralCode: "",
  totalFees: "", feesPaid: "", feeStatus: "unpaid", fatherName: "",
  motherName: "", guardianPhone: "", guardianAddress: "", status: "Active",
};

const AddStudentModal = ({ student, isEditing, onClose, onStudentAdded, onStudentUpdated }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [photo, setPhoto] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  useEffect(() => {
    if (isEditing && student) {
      console.log("[DEBUG] Modal useEffect triggered. Student ID:", student._id || student.id || "MISSING");
      setFormData({
        franchise: student.franchise || "", registrationNo: student.registrationNo || "",
        admissionDate: student.admissionDate ? student.admissionDate.substr(0, 10) : "",
        course: student.course || "", batch: student.batch || "",
        rollNumber: student.rollNumber || "", name: student.name || "",
        dob: student.dob ? student.dob.substr(0, 10) : "", gender: student.gender || "",
        bloodGroup: student.bloodGroup || "", phone: student.phone || "",
        email: student.email || "", address: student.address || "",
        state: student.state || "", district: student.district || "",
        city: student.city || "", pincode: student.pincode || "",
        username: student.username || "", password: "",
        referralCode: student.referralCode || "", totalFees: student.totalFees || "",
        feesPaid: student.feesPaid || "", feeStatus: student.feeStatus || "unpaid",
        fatherName: student.fatherName || "", motherName: student.motherName || "",
        guardianPhone: student.guardianPhone || "", guardianAddress: student.guardianAddress || "",
        status: student.status || "Active",
      });
    }
  }, [isEditing, student]);

  useEffect(() => {
    if (isEditing) return;
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) return;
        const { data } = await axios.get("/students/preview-registration", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled && data?.registrationNo) {
          setFormData(prev => ({ ...prev, registrationNo: data.registrationNo }));
        }
      } catch (err) {
        console.error("Could not load registration preview", err);
      }
    })();
    return () => { cancelled = true; };
  }, [isEditing]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}` };
        const [coursesRes, franchisesRes, batchesRes] = await Promise.all([
          axios.get("/courses/get", { headers }),
          axios.get("/franchises", { headers }),
          axios.get("/batches", { headers }),
        ]);
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        setFranchises(Array.isArray(franchisesRes.data) ? franchisesRes.data : []);
        setBatches(Array.isArray(batchesRes.data) ? batchesRes.data : []);
      } catch (err) { console.error("Error loading options", err); }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Authentication failed. Please log in again.");
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== "" && formData[key] !== null && formData[key] !== undefined) {
          if (isEditing && key === "password" && formData[key] === "") return;
          payload.append(key, formData[key]);
        }
      });
      if (photo) payload.append("photo", photo);
      if (documentFile) payload.append("document", documentFile);
      if (signatureFile) payload.append("signature", signatureFile);

      if (isEditing) {
        console.log("[DEBUG] handleSubmit starting for student:", student?._id);
        const studentId = student?._id || student?.id;
        
        if (!studentId || studentId === 'undefined') {
          console.error("[CRITICAL] student._id is missing in handleSubmit!", {
              propStudent: student,
              isEditing: isEditing
          });
          throw new Error("Form submission blocked: Missing Student ID. Please refresh.");
        }

        const res = await axios.put(`/students/update/${studentId}`, payload, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });

        console.log("[DEBUG] Update response arrived:", res.data);
        const updatedStudent = res.data.student || res.data;
        // CRITICAL: Ensure the updated object still has an ID
        if (updatedStudent && typeof updatedStudent === 'object') {
          if (!updatedStudent._id && !updatedStudent.id) {
             updatedStudent._id = studentId;
          }
        }
        if (onStudentUpdated) onStudentUpdated(updatedStudent);
      } else {
        const res = await axios.post("/students/add", payload, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        if (onStudentAdded) onStudentAdded(res.data.student || res.data);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || err.message || "An error occurred. Please try again.";
      setError(msg);
    } finally { setLoading(false); }
  };

  const g2 = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 16 };
  const g3 = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : isDesktop ? "1fr 1fr 1fr" : "1fr 1fr", gap: isMobile ? 12 : 16 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "flex-start", zIndex: 100, padding: isMobile ? 8 : 16, overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", width: "100%", maxWidth: 860, margin: isMobile ? "8px 0" : "24px 0", border: "1px solid #f1f5f9", fontFamily: "sans-serif" }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "14px 16px" : "18px 28px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", borderRadius: "18px 18px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 3px 10px rgba(15,23,42,0.2)", flexShrink: 0 }}>
              <User size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 1 }}>
                {isEditing ? "Edit Student Record" : "New Student Admission"}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Fill all required fields marked with *
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: 10, background: "#f1f5f9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#e11d48"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: isMobile ? 14 : 28, display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Error */}
          {error && (
            <div style={{ padding: "12px 16px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 10, color: "#be123c", fontSize: 13, fontWeight: 700 }}>
              {error}
            </div>
          )}

          {/* ── SECTION 1: Academic Details ── */}
          <div>
            <SectionHeader icon={BookOpen} color="#3b82f6" label="Academic Details" />
            <div style={g3}>
              <Field label="Franchise" isMobile={isMobile}>
                <SelectField name="franchise" value={formData.franchise} onChange={handleChange}>
                  <option value="">Select Franchise</option>
                  {franchises.map(fr => <option key={fr._id || fr.centerCode} value={fr.centerName || fr.centerCode}>{fr.centerName || fr.centerCode}</option>)}
                </SelectField>
              </Field>
              <Field label="Registration No" isMobile={isMobile}>
                <input
                  name="registrationNo"
                  value={formData.registrationNo}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  title={!isEditing ? "Auto-generated for each new student (unique per admission)." : ""}
                  style={{
                    ...INP_BASE,
                    ...(!isEditing ? { background: "#f1f5f9", color: "#334155", cursor: "default" } : {}),
                  }}
                  placeholder={!isEditing ? "Loading…" : "REG-XXXXX"}
                />
              </Field>
              <Field label="Admission Date" isMobile={isMobile}><input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} style={INP_BASE} /></Field>
              <Field label="Roll Number" isMobile={isMobile}><input name="rollNumber" value={formData.rollNumber} onChange={handleChange} style={INP_BASE} placeholder="ROLL-XXX" /></Field>
              <Field label="Course" required isMobile={isMobile}>
                <SelectField name="course" value={formData.course} onChange={handleChange}>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c._id || c.name} value={c.name || c.title}>{c.name || c.title}</option>)}
                </SelectField>
              </Field>
              <Field label="Batch" required isMobile={isMobile}>
                <SelectField name="batch" value={formData.batch} onChange={handleChange}>
                  <option value="">Select Batch</option>
                  {batches.map(batch => (
                    <option key={batch._id} value={batch.name}>
                      {batch.name} ({batch.startTime} - {batch.endTime})
                    </option>
                  ))}
                </SelectField>
              </Field>
              <Field label="Total Fees (₹)" isMobile={isMobile}><input type="number" name="totalFees" value={formData.totalFees} onChange={handleChange} style={INP_BASE} placeholder="0" min="0" /></Field>
              <Field label="Fees Paid (₹)" isMobile={isMobile}><input type="number" name="feesPaid" value={formData.feesPaid} onChange={handleChange} style={INP_BASE} placeholder="0" min="0" /></Field>
              <Field label="Fee Status" isMobile={isMobile}>
                <SelectField name="feeStatus" value={formData.feeStatus} onChange={handleChange}>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </SelectField>
              </Field>
            </div>
          </div>

          {/* ── SECTION 2: Student Personal Details ── */}
          <div>
            <SectionHeader icon={User} color="#4f46e5" label="Student Details" />
            <div style={g3}>
              <Field label="Full Name" required isMobile={isMobile}><input name="name" value={formData.name} onChange={handleChange} required style={INP_BASE} placeholder="Student full name" /></Field>
              <Field label="Date of Birth" isMobile={isMobile}><input type="date" name="dob" value={formData.dob} onChange={handleChange} style={INP_BASE} /></Field>
              <Field label="Gender" isMobile={isMobile}>
                <SelectField name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </SelectField>
              </Field>

              <Field label="Blood Group" isMobile={isMobile}><input name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={INP_BASE} placeholder="e.g. O+, A-" /></Field>
              <Field label="Phone" required isMobile={isMobile}><input name="phone" value={formData.phone} onChange={handleChange} required style={INP_BASE} placeholder="10-digit mobile" /></Field>
              <Field label="Email" required isMobile={isMobile}><input type="email" name="email" value={formData.email} onChange={handleChange} required style={INP_BASE} placeholder="student@email.com" /></Field>
              <Field label="Referral Code" isMobile={isMobile}><input name="referralCode" value={formData.referralCode} onChange={handleChange} style={INP_BASE} placeholder="REF-XXXX" /></Field>

              {/* Address — full width */}
              <div style={{ gridColumn: isMobile ? "1" : isDesktop ? "span 3" : "span 2" }}>
                <label style={LBL_STYLE}>Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={2}
                  style={{ ...INP_BASE, height: "auto", resize: "none", paddingTop: 10, paddingBottom: 10 }}
                  placeholder="Full residential address" />
              </div>

              <Field label="State" isMobile={isMobile}><input name="state" value={formData.state} onChange={handleChange} style={INP_BASE} placeholder="State" /></Field>
              <Field label="District" isMobile={isMobile}><input name="district" value={formData.district} onChange={handleChange} style={INP_BASE} placeholder="District" /></Field>
              <Field label="City" isMobile={isMobile}><input name="city" value={formData.city} onChange={handleChange} style={INP_BASE} placeholder="City" /></Field>
              <Field label="Pincode" isMobile={isMobile}><input name="pincode" value={formData.pincode} onChange={handleChange} style={INP_BASE} placeholder="6-digit pincode" maxLength={6} /></Field>
              <Field label="Username" required isMobile={isMobile}><input name="username" value={formData.username} onChange={handleChange} required style={INP_BASE} placeholder="Login username" /></Field>
              <Field label={isEditing ? "Password (leave blank)" : "Password"} required={!isEditing} isMobile={isMobile}>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required={!isEditing}
                  style={INP_BASE} placeholder={isEditing ? "Leave blank to keep current" : "Set initial password"} />
              </Field>
            </div>
          </div>

          {/* ── SECTION 3: Guardian Details ── */}
          <div>
            <SectionHeader icon={Users} color="#059669" label="Guardian Details" />
            <div style={g3}>
              <Field label="Father's Name" isMobile={isMobile}><input name="fatherName" value={formData.fatherName} onChange={handleChange} style={INP_BASE} placeholder="Father's full name" /></Field>
              <Field label="Mother's Name" isMobile={isMobile}><input name="motherName" value={formData.motherName} onChange={handleChange} style={INP_BASE} placeholder="Mother's full name" /></Field>
              <Field label="Guardian Phone" isMobile={isMobile}><input name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} style={INP_BASE} placeholder="Guardian contact" /></Field>

              {/* Guardian Address — spans 2 */}
              <div style={{ gridColumn: isMobile ? "1" : isDesktop ? "span 2" : "span 2" }}>
                <label style={LBL_STYLE}>Guardian Address</label>
                <input name="guardianAddress" value={formData.guardianAddress} onChange={handleChange} style={INP_BASE} placeholder="Guardian's full address" />
              </div>

              <Field label="Student Status" isMobile={isMobile}>
                <SelectField name="status" value={formData.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </SelectField>
              </Field>
            </div>
          </div>

          {/* ── SECTION 4: File Uploads ── */}
          <div>
            <SectionHeader icon={Upload} color="#d97706" label="Document Uploads" />
            <div style={g3}>
              {[
                { label: "Student Photo", state: photo, setter: setPhoto, accept: "image/*" },
                { label: "Identity Document", state: documentFile, setter: setDocumentFile, accept: "image/*,.pdf,.doc,.docx" },
                { label: "Signature", state: signatureFile, setter: setSignatureFile, accept: "image/*" },
              ].map(f => (
                <div key={f.label}>
                  <label style={LBL_STYLE}>{f.label}</label>
                  <div style={{ border: "2px dashed #e2e8f0", borderRadius: 12, padding: "12px 14px", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "rgba(239,246,255,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "transparent"; }}>
                    <input type="file" accept={f.accept} onChange={e => f.setter(e.target.files[0])}
                      style={{ display: "block", width: "100%", fontSize: 12, color: "#64748b", boxSizing: "border-box" }} />
                    {f.state && (
                      <p style={{ margin: "6px 0 0", fontSize: 10, fontWeight: 700, color: "#2563eb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>✓ {f.state.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── ACTIONS ── */}
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "flex-end", gap: 10, paddingTop: 18, borderTop: "1px solid #f1f5f9" }}>
            <button type="button" onClick={onClose} disabled={loading}
              style={{ padding: "10px 22px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.5 : 1, width: isMobile ? "100%" : "auto" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 28px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 4px 14px rgba(15,23,42,0.18)", width: isMobile ? "100%" : "auto" }}>
              {loading ? (
                <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> {isEditing ? "Updating..." : "Adding Student..."}</>
              ) : (
                isEditing ? "Update Student" : "Add Student"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AddStudentModal;