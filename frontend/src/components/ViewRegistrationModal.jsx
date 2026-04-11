import React, { useEffect, useRef } from "react";
import { X, Printer, User, BookOpen, Users, MapPin, CreditCard, Phone, Mail, Calendar, Hash } from "lucide-react";
import API_BASE_URL from "../lib/utils";

const Row = ({ label, value }) => (
  value ? (
    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", minWidth: 130 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", flex: 1 }}>{value}</span>
    </div>
  ) : null
);

const Section = ({ title, icon: Icon, color, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: "1px solid #f1f5f9", marginBottom: 12 }}>
      <Icon size={14} color={color} />
      <h3 style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>{title}</h3>
    </div>
    {children}
  </div>
);

export default function ViewRegistrationModal({ student, onClose, autoPrint }) {
  const printRef = useRef(null);

  const getFallback = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=0f172a&color=fff&size=100`;

  const photoSrc = student.photo
    ? student.photo.startsWith("http") ? student.photo : `${API_BASE_URL}${student.photo}`
    : getFallback(student.name);

  const statusColor = student.status === "Active" ? "#16a34a" : student.status === "Completed" ? "#2563eb" : "#d97706";
  const statusBg = student.status === "Active" ? "#dcfce7" : student.status === "Completed" ? "#dbeafe" : "#fef3c7";

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Student Registration — ${student.name}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', sans-serif; color: #1e293b; background: #fff; padding: 24px; font-size: 13px; }
            .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; max-width: 760px; margin: 0 auto; }
            .header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #0f172a; }
            .photo { width: 90px; height: 90px; border-radius: 12px; object-fit: cover; border: 2px solid #e2e8f0; }
            h1 { font-size: 20px; font-weight: 900; margin-bottom: 4px; }
            .badge { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:800; text-transform:uppercase; padding:3px 10px; border-radius:99px; }
            .section-title { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:#64748b; border-bottom:1px solid #f1f5f9; padding-bottom:6px; margin:16px 0 10px; }
            .grid { display:grid; grid-template-columns:1fr 1fr; gap:6px 20px; }
            .row { display:flex; gap:8px; margin-bottom:4px; }
            .row-label { font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.07em; min-width:120px; }
            .row-value { font-size:12px; font-weight:600; color:#1e293b; }
            @media print { body { padding:8px; } }
          </style>
        </head>
        <body>
          <div class="card">${content}</div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  useEffect(() => {
    if (autoPrint) {
      setTimeout(handlePrint, 200);
    }
  }, [autoPrint]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "flex-start", zIndex: 200, padding: 16, overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", width: "100%", maxWidth: 760, margin: "24px 0", border: "1px solid #f1f5f9", fontFamily: "inherit" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", borderRadius: "18px 18px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <User size={17} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: "-0.01em" }}>Student Registration</h2>
              <p style={{ margin: "2px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Full Details</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handlePrint}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 11, fontWeight: 700, color: "#fff", background: "#0f172a", border: "none", borderRadius: 10, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <Printer size={13} /> Print
            </button>
            <button onClick={onClose}
              style={{ width: 34, height: 34, borderRadius: 10, background: "#f1f5f9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={printRef} style={{ padding: "24px 28px" }}>

          {/* Profile Header */}
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 24, paddingBottom: 20, borderBottom: "2px solid #0f172a" }}>
            <img src={photoSrc} alt={student.name} style={{ width: 90, height: 90, borderRadius: 14, objectFit: "cover", border: "2px solid #e2e8f0", flexShrink: 0 }} onError={e => e.target.src = getFallback(student.name)} />
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "#1e293b" }}>{student.name}</h1>
              <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                {student.rollNumber && `Roll No: ${student.rollNumber}`}
                {student.rollNumber && student.registrationNo && " • "}
                {student.registrationNo && `Reg: ${student.registrationNo}`}
              </p>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: statusColor, background: statusBg, padding: "3px 10px", borderRadius: 99 }}>
                ● {student.status || "Active"}
              </span>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Admission Date</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 800, color: "#1e293b" }}>
                {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
            <div>
              <Section title="Academic Details" icon={BookOpen} color="#3b82f6">
                <Row label="Course" value={student.course} />
                <Row label="Batch" value={student.batch} />
                <Row label="Branch" value={student.franchise || "Main Campus"} />
                <Row label="Roll Number" value={student.rollNumber} />
                <Row label="Registration No" value={student.registrationNo} />
                <Row label="Joined On" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString("en-IN") : null} />
              </Section>

              <Section title="Contact Info" icon={Phone} color="#059669">
                <Row label="Phone" value={student.phone} />
                <Row label="Email" value={student.email} />
                <Row label="Address" value={student.address} />
                <Row label="City" value={student.city} />
                <Row label="District" value={student.district} />
                <Row label="State" value={student.state} />
                <Row label="Pincode" value={student.pincode} />
              </Section>
            </div>
            <div>
              <Section title="Personal Details" icon={User} color="#4f46e5">
                <Row label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString("en-IN") : null} />
                <Row label="Gender" value={student.gender} />
                <Row label="Blood Group" value={student.bloodGroup} />
                <Row label="Religion" value={student.religion} />
                <Row label="Caste" value={student.caste} />
                <Row label="Username" value={student.username} />
              </Section>

              <Section title="Guardian Details" icon={Users} color="#059669">
                <Row label="Father's Name" value={student.fatherName} />
                <Row label="Mother's Name" value={student.motherName} />
                <Row label="Guardian Phone" value={student.guardianPhone} />
                <Row label="Guardian Address" value={student.guardianAddress} />
              </Section>

              <Section title="Fee Details" icon={CreditCard} color="#d97706">
                <Row label="Total Fees" value={student.totalFees ? `₹${Number(student.totalFees).toLocaleString("en-IN")}` : null} />
                <Row label="Fees Paid" value={student.feesPaid ? `₹${Number(student.feesPaid).toLocaleString("en-IN")}` : null} />
                <Row label="Outstanding" value={student.totalFees ? `₹${(Number(student.totalFees || 0) - Number(student.feesPaid || 0)).toLocaleString("en-IN")}` : null} />
                <Row label="Fee Status" value={student.feeStatus} />
                <Row label="Fee Scheme" value={student.feeScheme} />
                <Row label="Reg. Fee" value={student.registrationFee ? `₹${student.registrationFee}` : null} />
              </Section>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
