import React, { useState, useEffect, useCallback } from "react";
import axios from "../lib/axios";
import {
  Loader2, X, User, BookOpen, Users, Upload, ChevronDown,
  DollarSign, Plus, Trash2, AlertTriangle, CheckCircle
} from "lucide-react";

/* ─── Window Width Hook ─── */
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
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

/* ─── Sub-components ─── */
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
  registrationFee: "500", feeScheme: "",
};

const SCHEME_OPTIONS = [
  {
    id: "Monthly",
    label: "Scheme 1 — Monthly Recurring",
    desc: "Auto-generates monthly due dates from joining date",
    color: "#2563eb", bg: "#eff6ff",
  },
  {
    id: "Installments",
    label: "Scheme 2 — Installments",
    desc: "Admin defines number of installments and amounts",
    color: "#4f46e5", bg: "#eef2ff",
  },
  {
    id: "Lump Sum",
    label: "Scheme 3 — Lump Sum",
    desc: "Full course fee due within 2-3 days of joining",
    color: "#059669", bg: "#ecfdf5",
  },
];

const AddStudentModal = ({ student, isEditing, onClose, onStudentAdded, onStudentUpdated, onRefresh }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [photo, setPhoto] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [batches, setBatches] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [batchCapacityWarning, setBatchCapacityWarning] = useState(null);

  // Fee scheme state
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [installmentCount, setInstallmentCount] = useState(3);
  const [installments, setInstallments] = useState([
    { amount: "", dueDate: "" },
    { amount: "", dueDate: "" },
    { amount: "", dueDate: "" },
  ]);
  const [monthlyDuration, setMonthlyDuration] = useState(12);
  const [lumpSumDueDate, setLumpSumDueDate] = useState("");
  const [feeScheduleSaving, setFeeScheduleSaving] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [selectedCourseType, setSelectedCourseType] = useState("");

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  /* ── Load student data when editing ── */
  useEffect(() => {
    if (isEditing && student) {
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
        registrationFee: student.registrationFee || "500",
        feeScheme: student.feeScheme || "",
      });
    }
  }, [isEditing, student]);

  /* ── Auto registration number ── */
  useEffect(() => {
    if (isEditing) return;
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) return;
        const { data } = await axios.get("/students/preview-registration", { headers: { Authorization: `Bearer ${token}` } });
        if (!cancelled && data?.registrationNo) {
          setFormData(prev => ({ ...prev, registrationNo: data.registrationNo }));
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [isEditing]);

  /* ── Load courses, franchises, batches ── */
  useEffect(() => {
    (async () => {
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
        const b = Array.isArray(batchesRes.data) ? batchesRes.data : [];
        setAllBatches(b);
        setBatches(b);
      } catch (err) { console.error("Error loading options", err); }
    })();
  }, []);

  // Logic: Calculate Pending Amount
  useEffect(() => {
    const total = Number(formData.totalFees || 0);
    const paid = Number(formData.feesPaid || 0);
    setPendingAmount(Math.max(0, total - paid));
  }, [formData.totalFees, formData.feesPaid]);

  // Logic: Auto-distribute Monthly Amount
  useEffect(() => {
    if (formData.feeScheme === "Monthly" && pendingAmount > 0) {
      const amt = Math.round(pendingAmount / (monthlyDuration || 1));
      setMonthlyAmount(amt.toString());
    }
  }, [formData.feeScheme, pendingAmount, monthlyDuration]);

  // Logic: Auto-distribute Installments
  useEffect(() => {
    if (formData.feeScheme === "Installments" && pendingAmount > 0) {
      const perInstallment = Math.floor(pendingAmount / (installmentCount || 1));
      const remainder = pendingAmount % (installmentCount || 1);
      
      const base = formData.admissionDate ? new Date(formData.admissionDate) : new Date();
      
      setInstallments(Array.from({ length: installmentCount }, (_, i) => {
        const d = new Date(base);
        d.setMonth(d.getMonth() + i);
        // Add remainder to the last installment to ensure total matches exactly
        const finalAmt = i === installmentCount - 1 ? perInstallment + remainder : perInstallment;
        return { 
          amount: finalAmt.toString(), 
          dueDate: d.toISOString().split("T")[0] 
        };
      }));
    }
  }, [formData.feeScheme, pendingAmount, installmentCount, formData.admissionDate]);

  /* ── Filter batches by course & Auto-fill Fees ── */
  useEffect(() => {
    if (formData.course) {
      // Filter Batches
      const filtered = allBatches.filter(b => !b.course || b.course === formData.course || b.courseName === formData.course);
      setBatches(filtered.length > 0 ? filtered : allBatches);

      // Auto-fill Fees from selected course
      const selectedCourse = courses.find(c => c.name === formData.course || c.title === formData.course);
      if (selectedCourse) {
        setSelectedCourseType(selectedCourse.feeType); // ALWAYS store the type for locking logic
        
        if (!isEditing) {
          const totalFee = selectedCourse.totalFee || selectedCourse.fees || 0;
          setFormData(prev => ({ 
            ...prev, 
            totalFees: totalFee.toString(),
            // Auto-select correct scheme if current one is invalid
            feeScheme: selectedCourse.feeType === "Monthly" ? "Monthly" : (prev.feeScheme === "Monthly" ? "Lump Sum" : prev.feeScheme) 
          }));
          
          if (selectedCourse.feeType === "Monthly") {
            setMonthlyDuration(selectedCourse.durationMonths || 12);
          } else if (selectedCourse.feeType === "Fixed" && selectedCourse.defaultInstallments) {
            setInstallmentCount(selectedCourse.defaultInstallments);
          }
        } else {
          // If editing, still ensure current feeScheme is valid for the course type
          setFormData(prev => {
            const isInvalid = (selectedCourse.feeType === "Monthly" && prev.feeScheme !== "Monthly") || 
                              (selectedCourse.feeType === "Fixed" && prev.feeScheme === "Monthly");
            
            if (isInvalid) {
              return { 
                ...prev, 
                feeScheme: selectedCourse.feeType === "Monthly" ? "Monthly" : "Lump Sum" 
              };
            }
            return prev;
          });
        }
      }
    } else {
      setBatches(allBatches);
    }
  }, [formData.course, allBatches, courses, isEditing]);

  /* ── Check batch capacity ── */
  useEffect(() => {
    if (!formData.batch) { setBatchCapacityWarning(null); return; }
    const selectedBatch = allBatches.find(b => b.name === formData.batch);
    if (selectedBatch && selectedBatch.capacity && selectedBatch.currentEnrollment >= selectedBatch.capacity) {
      setBatchCapacityWarning(`Batch "${formData.batch}" is at full capacity (${selectedBatch.currentEnrollment}/${selectedBatch.capacity} students). Proceeding will override the limit.`);
    } else {
      setBatchCapacityWarning(null);
    }
  }, [formData.batch, allBatches]);

  /* Removed manual auto-fill effect - handled by the smart distributor above */

  /* ── Lump sum default due date ── */
  useEffect(() => {
    if (formData.feeScheme === "Lump Sum" && formData.admissionDate && !lumpSumDueDate) {
      const d = new Date(formData.admissionDate);
      d.setDate(d.getDate() + 3);
      setLumpSumDueDate(d.toISOString().split("T")[0]);
    }
  }, [formData.feeScheme, formData.admissionDate]);

  const installmentTotal = installments.reduce((s, i) => s + Number(i.amount || 0), 0);
  const installmentMismatch = formData.feeScheme === "Installments" && pendingAmount > 0 && installmentTotal !== pendingAmount;

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

      let savedStudentId;

      if (isEditing) {
        const studentId = student?._id || student?.id;
        if (!studentId || studentId === "undefined") throw new Error("Missing Student ID. Please refresh.");
        const res = await axios.put(`/students/update/${studentId}`, payload, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        const updatedStudent = res.data.student || res.data;
        if (updatedStudent && typeof updatedStudent === "object" && !updatedStudent._id && !updatedStudent.id) {
          updatedStudent._id = studentId;
        }
        if (onStudentUpdated) onStudentUpdated(updatedStudent);
        savedStudentId = studentId;
      } else {
        const res = await axios.post("/students/add", payload, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        const newStudent = res.data.student || res.data;
        if (onStudentAdded) onStudentAdded(newStudent);
        savedStudentId = newStudent?._id || newStudent?.id;
      }

      // Generate fee schedule if a scheme was selected
      if (formData.feeScheme && savedStudentId) {
        try {
          setFeeScheduleSaving(true);
          await axios.post("/students/generate-fee-schedule", {
            studentId: savedStudentId,
            scheme: formData.feeScheme,
            joiningDate: formData.admissionDate,
            courseFee: formData.totalFees,
            monthlyAmount,
            monthlyDuration,
            installments: formData.feeScheme === "Installments" ? installments : [],
            lumpSumDueDate,
            registrationFee: formData.registrationFee,
          }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (feeErr) {
          console.warn("Fee schedule generation failed:", feeErr.message);
          // Don't block the main save — schedule can be set later
        } finally {
          setFeeScheduleSaving(false);
        }
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "flex-start", zIndex: 100, padding: isMobile ? 8 : 16, overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", width: "100%", maxWidth: 900, margin: isMobile ? "8px 0" : "24px 0", border: "1px solid #f1f5f9", fontFamily: "inherit" }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "14px 16px" : "18px 28px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", borderRadius: "18px 18px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
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

          {error && (
            <div style={{ padding: "12px 16px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 10, color: "#be123c", fontSize: 13, fontWeight: 700 }}>
              {error}
            </div>
          )}

          {/* ── SECTION 1: Academic ── */}
          <div>
            <SectionHeader icon={BookOpen} color="#3b82f6" label="Academic Details" />
            <div style={g3}>
              <Field label="Branch" isMobile={isMobile}>
                <SelectField name="franchise" value={formData.franchise} onChange={handleChange}>
                  <option value="">Select Branch</option>
                  {franchises.map(fr => <option key={fr._id || fr.centerCode} value={fr.centerName || fr.centerCode}>{fr.centerName || fr.centerCode}</option>)}
                </SelectField>
              </Field>
              <Field label="Registration No" isMobile={isMobile}>
                <input name="registrationNo" value={formData.registrationNo} onChange={handleChange} readOnly={!isEditing}
                  style={{ ...INP_BASE, ...(!isEditing ? { background: "#f1f5f9", cursor: "default" } : {}) }}
                  placeholder={!isEditing ? "Loading…" : "REG-XXXXX"} />
              </Field>
              <Field label="Admission Date" isMobile={isMobile}>
                <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} style={INP_BASE} />
              </Field>
              <Field label="Roll Number" isMobile={isMobile}>
                <input name="rollNumber" value={formData.rollNumber} onChange={handleChange} style={INP_BASE} placeholder="ROLL-XXX" />
              </Field>
              <Field label="Course" required isMobile={isMobile}>
                <SelectField name="course" value={formData.course} onChange={handleChange}>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c._id || c.name} value={c.name || c.title}>{c.name || c.title}</option>)}
                </SelectField>
              </Field>
              <Field label="Batch" required isMobile={isMobile}>
                <SelectField name="batch" value={formData.batch} onChange={handleChange}>
                  <option value="">Select Batch</option>
                  {batches.map(b => <option key={b._id} value={b.name}>{b.name} ({b.startTime} - {b.endTime})</option>)}
                </SelectField>
              </Field>
              <Field label="Total Fees (₹)" isMobile={isMobile}>
                <input type="number" name="totalFees" value={formData.totalFees} onChange={handleChange} style={INP_BASE} placeholder="0" min="0" />
              </Field>
              <Field label="Fees Paid (₹)" isMobile={isMobile}>
                <input type="number" name="feesPaid" value={formData.feesPaid} onChange={handleChange} style={INP_BASE} placeholder="0" min="0" />
              </Field>
              <Field label="Fee Status" isMobile={isMobile}>
                <SelectField name="feeStatus" value={formData.feeStatus} onChange={handleChange}>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </SelectField>
              </Field>
            </div>

            {/* Batch capacity warning */}
            {batchCapacityWarning && (
              <div style={{ marginTop: 12, display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10 }}>
                <AlertTriangle size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#92400e" }}>{batchCapacityWarning}</p>
              </div>
            )}
          </div>

          {/* ── SECTION 2: Personal ── */}
          <div>
            <SectionHeader icon={User} color="#4f46e5" label="Student Details" />
            <div style={g3}>
              <Field label="Full Name" required isMobile={isMobile}>
                <input name="name" value={formData.name} onChange={handleChange} required style={INP_BASE} placeholder="Student full name" />
              </Field>
              <Field label="Date of Birth" isMobile={isMobile}>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} style={INP_BASE} />
              </Field>
              <Field label="Gender" isMobile={isMobile}>
                <SelectField name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </SelectField>
              </Field>
              <Field label="Blood Group" isMobile={isMobile}>
                <input name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={INP_BASE} placeholder="e.g. O+, A-" />
              </Field>
              <Field label="Phone" required isMobile={isMobile}>
                <input name="phone" value={formData.phone} onChange={handleChange} required style={INP_BASE} placeholder="10-digit mobile" />
              </Field>
              <Field label="Email" required isMobile={isMobile}>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required style={INP_BASE} placeholder="student@email.com" />
              </Field>
              <Field label="Referral Code" isMobile={isMobile}>
                <input name="referralCode" value={formData.referralCode} onChange={handleChange} style={INP_BASE} placeholder="REF-XXXX" />
              </Field>
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

          {/* ── SECTION 3: Guardian ── */}
          <div>
            <SectionHeader icon={Users} color="#059669" label="Guardian Details" />
            <div style={g3}>
              <Field label="Father's Name" isMobile={isMobile}><input name="fatherName" value={formData.fatherName} onChange={handleChange} style={INP_BASE} placeholder="Father's full name" /></Field>
              <Field label="Mother's Name" isMobile={isMobile}><input name="motherName" value={formData.motherName} onChange={handleChange} style={INP_BASE} placeholder="Mother's full name" /></Field>
              <Field label="Guardian Phone" isMobile={isMobile}><input name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} style={INP_BASE} placeholder="Guardian contact" /></Field>
              <div style={{ gridColumn: isMobile ? "1" : isDesktop ? "span 2" : "span 2" }}>
                <label style={LBL_STYLE}>Guardian Address</label>
                <input name="guardianAddress" value={formData.guardianAddress} onChange={handleChange} style={INP_BASE} placeholder="Guardian's full address" />
              </div>
              <Field label="Student Status" isMobile={isMobile}>
                <SelectField name="status" value={formData.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </SelectField>
              </Field>
            </div>
          </div>

          {/* ── SECTION 4: Fee Scheme ── */}
          <div>
            <SectionHeader icon={DollarSign} color="#d97706" label="Fee Scheme" />

            {/* Registration Fee */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
              <Field label="Registration Fee (₹)" isMobile={isMobile}>
                <input type="number" name="registrationFee" value={formData.registrationFee} onChange={handleChange} style={INP_BASE} placeholder="500" min="0" />
              </Field>
              <div style={{ gridColumn: isMobile ? "1" : "span 2", display: "flex", alignItems: "flex-end" }}>
                <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                  💡 Registration fee is collected upfront at enrollment. Other scheme fees are generated as installment schedules.
                </p>
              </div>
            </div>

            {/* Scheme Selection */}
            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em" }}>Select Fee Scheme (optional)</p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {SCHEME_OPTIONS.map(opt => {
                const isDisabled = (selectedCourseType === "Monthly" && opt.id !== "Monthly") || 
                                   (selectedCourseType === "Fixed" && opt.id === "Monthly");
                
                return (
                  <div
                    key={opt.id}
                    onClick={() => !isDisabled && setFormData(prev => ({ ...prev, feeScheme: prev.feeScheme === opt.id ? "" : opt.id }))}
                    style={{
                      border: `2px solid ${formData.feeScheme === opt.id ? opt.color : "#e2e8f0"}`,
                      borderRadius: 12, padding: "14px 16px", 
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      background: formData.feeScheme === opt.id ? opt.bg : (isDisabled ? "#f1f5f9" : "#fafafa"),
                      opacity: isDisabled ? 0.5 : 1,
                      transition: "all 0.15s",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: formData.feeScheme === opt.id ? opt.color : "#1e293b" }}>{opt.label}</p>
                      {formData.feeScheme === opt.id && <CheckCircle size={15} color={opt.color} />}
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
                      {isDisabled ? `Not available for ${selectedCourseType} courses` : opt.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Scheme 1: Monthly */}
            {formData.feeScheme === "Monthly" && (
              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: "16px 20px" }}>
                <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: "#0369a1", textTransform: "uppercase" }}>Monthly Recurring Details</p>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr", gap: 12 }}>
                  <div>
                    <label style={LBL_STYLE}>Select Duration (Months)</label>
                    <SelectField value={monthlyDuration} onChange={e => setMonthlyDuration(Number(e.target.value))}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map(m => (
                        <option key={m} value={m}>{m} Months</option>
                      ))}
                    </SelectField>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", background: "#fff", padding: "8px 12px", borderRadius: 10, border: "1px solid #e0f2fe" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#0369a1" }}>
                      ₹{Number(monthlyAmount).toLocaleString('en-IN')}<span style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}> / month</span>
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: "#0369a1", fontWeight: 600 }}>
                      Calculated from ₹{pendingAmount.toLocaleString('en-IN')} pending balance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scheme 2: Installments */}
            {formData.feeScheme === "Installments" && (
              <div style={{ background: "#f5f3ff", border: "1px solid #c4b5fd", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#5b21b6", textTransform: "uppercase" }}>Installment Details</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#5b21b6" }}>No. of Installments:</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button type="button" onClick={() => setInstallmentCount(Math.max(1, installmentCount - 1))}
                        style={{ width: 28, height: 28, borderRadius: 8, background: "#ede9fe", border: "1px solid #c4b5fd", cursor: "pointer", fontWeight: 800, color: "#5b21b6", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 900, color: "#1e293b", minWidth: 20, textAlign: "center" }}>{installmentCount}</span>
                      <button type="button" onClick={() => setInstallmentCount(Math.min(24, installmentCount + 1))}
                        style={{ width: 28, height: 28, borderRadius: 8, background: "#ede9fe", border: "1px solid #c4b5fd", cursor: "pointer", fontWeight: 800, color: "#5b21b6", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                  </div>
                </div>

                {/* Installment table */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                  {installments.map((inst, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "30px 1fr 1fr", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#5b21b6", textAlign: "center" }}>{i + 1}</span>
                      <div>
                        <input type="number" value={inst.amount} onChange={e => setInstallments(prev => prev.map((it, idx) => idx === i ? { ...it, amount: e.target.value } : it))}
                          style={{ ...INP_BASE, height: 36, fontSize: 12 }} placeholder={`₹ Amount`} min="0" />
                      </div>
                      <div>
                        <input type="date" value={inst.dueDate} onChange={e => setInstallments(prev => prev.map((it, idx) => idx === i ? { ...it, dueDate: e.target.value } : it))}
                          style={{ ...INP_BASE, height: 36, fontSize: 12 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total validation */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Total: ₹{installmentTotal.toLocaleString("en-IN")}</span>
                  {pendingAmount > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: installmentMismatch ? "#dc2626" : "#16a34a", display: "flex", alignItems: "center", gap: 4 }}>
                      {installmentMismatch ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                      {installmentMismatch ? `Mismatch! Pending balance: ₹${pendingAmount.toLocaleString("en-IN")}` : "Matches pending balance ✓"}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Scheme 3: Lump Sum */}
            {formData.feeScheme === "Lump Sum" && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "16px 20px" }}>
                <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: "#065f46", textTransform: "uppercase" }}>Lump Sum Payment</p>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={LBL_STYLE}>Due Date</label>
                    <input type="date" value={lumpSumDueDate} onChange={e => setLumpSumDueDate(e.target.value)} style={INP_BASE} />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <p style={{ margin: 0, fontSize: 11, color: "#065f46", fontWeight: 600 }}>
                      Full course fee (₹{Number(formData.totalFees || 0).toLocaleString("en-IN")}) will be due on this date. This serves as a reminder.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── SECTION 5: Uploads ── */}
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
                    {f.state && <p style={{ margin: "6px 0 0", fontSize: 10, fontWeight: 700, color: "#2563eb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>✓ {f.state.name}</p>}
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
            <button type="submit" disabled={loading || (formData.feeScheme === "Installments" && installmentMismatch && pendingAmount > 0)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 28px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: (loading || (formData.feeScheme === "Installments" && installmentMismatch && pendingAmount > 0)) ? 0.6 : 1, boxShadow: "0 4px 14px rgba(15,23,42,0.18)", width: isMobile ? "100%" : "auto" }}>
              {loading || feeScheduleSaving ? (
                <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> {feeScheduleSaving ? "Generating Schedule..." : isEditing ? "Updating..." : "Adding Student..."}</>
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