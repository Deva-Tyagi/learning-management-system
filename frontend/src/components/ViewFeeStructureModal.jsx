import React, { useEffect, useState } from "react";
import axios from "../lib/axios";
import { X, DollarSign, CheckCircle, Clock, AlertTriangle, Calendar, TrendingDown, TrendingUp } from "lucide-react";

const STATUS_CONFIG = {
  PAID:     { label: "Paid",     color: "#16a34a", bg: "#dcfce7", icon: CheckCircle },
  DUE:      { label: "Due",      color: "#2563eb", bg: "#dbeafe", icon: Clock },
  OVERDUE:  { label: "Overdue",  color: "#dc2626", bg: "#fef2f2", icon: AlertTriangle },
  PARTIAL:  { label: "Partial",  color: "#d97706", bg: "#fef3c7", icon: TrendingUp },
};

export default function ViewFeeStructureModal({ student, onClose }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(`/fees/schedule/by-student/${student._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSchedules(res.data?.schedules || []);
      } catch (err) {
        setError("Could not load fee schedule.");
      } finally {
        setLoading(false);
      }
    };
    if (student._id) fetchSchedules();
  }, [student._id]);

  const totalScheduled = schedules.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const totalPaid = schedules.filter(s => s.status === "PAID").reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const outstanding = totalScheduled - totalPaid;
  const overdue = schedules.filter(s => s.status === "OVERDUE").length;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "flex-start", zIndex: 200, padding: 16, overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", width: "100%", maxWidth: 680, margin: "24px 0", fontFamily: "inherit" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", borderRadius: "18px 18px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <DollarSign size={17} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e293b", textTransform: "uppercase" }}>Fee Structure</h2>
              <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>{student.name} • {student.feeScheme || "Standard"}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, background: "#f1f5f9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>
            <X size={16} />
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
          {[
            { label: "Total Fee", value: `₹${Number(student.totalFees || 0).toLocaleString("en-IN")}`, color: "#1e293b", bg: "#f8fafc" },
            { label: "Paid", value: `₹${totalPaid.toLocaleString("en-IN")}`, color: "#16a34a", bg: "#f0fdf4" },
            { label: "Outstanding", value: `₹${(Number(student.totalFees || 0) - Number(student.feesPaid || 0)).toLocaleString("en-IN")}`, color: "#dc2626", bg: "#fff1f2" },
            { label: "Overdue", value: `${overdue} installment${overdue !== 1 ? "s" : ""}`, color: overdue > 0 ? "#dc2626" : "#16a34a", bg: overdue > 0 ? "#fff1f2" : "#f0fdf4" },
          ].map((c, i) => (
            <div key={i} style={{ background: c.bg, borderRadius: 12, padding: "12px 14px" }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{c.label}</p>
              <p style={{ margin: "5px 0 0", fontSize: 16, fontWeight: 900, color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ padding: "20px 24px", maxHeight: 400, overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
              <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#0f172a", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
              Loading schedule...
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: 40, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>{error}</div>
          ) : schedules.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <DollarSign size={36} color="#e2e8f0" style={{ margin: "0 auto 10px", display: "block" }} />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>No fee schedule found.</p>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "#cbd5e1" }}>A fee scheme wasn't set during admission, or this student uses a simple fee structure.</p>
              {/* Fallback: show total / paid from student record */}
              <div style={{ marginTop: 20, display: "inline-flex", flexDirection: "column", gap: 8, textAlign: "left", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 20px", minWidth: 280 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Total Course Fee</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>₹{Number(student.totalFees || 0).toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Fees Paid</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#16a34a" }}>₹{Number(student.feesPaid || 0).toLocaleString("en-IN")}</span>
                </div>
                <div style={{ height: 1, background: "#e2e8f0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Outstanding</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#dc2626" }}>₹{(Number(student.totalFees || 0) - Number(student.feesPaid || 0)).toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Status</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: student.feeStatus === "paid" ? "#16a34a" : student.feeStatus === "partial" ? "#d97706" : "#dc2626", textTransform: "uppercase" }}>{student.feeStatus}</span>
                </div>
                {student.registrationFee > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Registration Fee</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>₹{student.registrationFee}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {schedules.map((sch, i) => {
                const cfg = STATUS_CONFIG[sch.status] || STATUS_CONFIG.DUE;
                const Icon = cfg.icon;
                const isOverdue = sch.status === "OVERDUE";
                return (
                  <div key={sch._id || i} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: isOverdue ? "#fff5f5" : "#fafafa",
                    border: `1px solid ${isOverdue ? "#fecaca" : "#f1f5f9"}`,
                    borderRadius: 12, padding: "12px 16px",
                    transition: "all 0.15s",
                  }}>
                    {/* Sequence Badge */}
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={15} color={cfg.color} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{sch.label || `Installment ${sch.sequence}`}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                        <Calendar size={10} />
                        Due: {new Date(sch.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        {sch.paidAt && ` • Paid: ${new Date(sch.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`}
                      </p>
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#1e293b" }}>₹{Number(sch.amount).toLocaleString("en-IN")}</p>
                      <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: cfg.color, background: cfg.bg, padding: "2px 7px", borderRadius: 99 }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {!loading && !error && (student.totalFees > 0) && (
          <div style={{ padding: "0 24px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Payment Progress</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#1e293b" }}>
                {Math.min(100, Math.round((Number(student.feesPaid || 0) / Number(student.totalFees)) * 100))}% Paid
              </span>
            </div>
            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, Math.round((Number(student.feesPaid || 0) / Number(student.totalFees)) * 100))}%`,
                background: "linear-gradient(90deg, #16a34a, #22c55e)",
                borderRadius: 99,
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
