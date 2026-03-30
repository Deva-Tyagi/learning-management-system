import React, { useEffect, useMemo, useState } from "react";
import axios from "../../lib/axios";
import { CSVLink } from "react-csv";
import {
  enroll, getReportSummary, getUpcomingDues, getOverdueDues,
} from "../../lib/fees";
import {
  Plus, Search, FileDown, RefreshCcw, AlertCircle,
  Calendar, Loader2, X, TrendingUp, Clock, DollarSign, Activity,
} from "lucide-react";
import { toast } from "sonner";
import AddPaymentModal from "../../components/AddPaymentModal";

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

/* ─── SchemeSelector ─── */
const SchemeSelector = ({ courseDefaults, onConfirm, isMobile }) => {
  const [scheme, setScheme] = useState("MONTHLY");
  const [doj, setDoj] = useState("");
  const [customize, setCustomize] = useState({
    monthlyFee: courseDefaults.monthlyFee || 0,
    durationMonths: courseDefaults.durationMonths || 0,
    totalFee: courseDefaults.totalFee || 0,
  });
  const [installments, setInstallments] = useState(2);

  useEffect(() => {
    setCustomize({
      monthlyFee: courseDefaults.monthlyFee || 0,
      durationMonths: courseDefaults.durationMonths || 0,
      totalFee: courseDefaults.totalFee || 0,
    });
  }, [courseDefaults]);

  const handleMonthlyFeeChange = (val) => {
    const num = Number(val);
    const updated = { ...customize, monthlyFee: num };
    if (scheme === "MONTHLY" && num > 0) {
      updated.durationMonths = Math.ceil(updated.totalFee / num);
    } else if (scheme === "INSTALLMENT" && num > 0) {
      setInstallments(Math.ceil(updated.totalFee / num));
    }
    setCustomize(updated);
  };

  const handleTotalFeeChange = (val) => {
    const num = Number(val);
    const updated = { ...customize, totalFee: num };
    if (scheme === "MONTHLY" && updated.monthlyFee > 0) {
      updated.durationMonths = Math.ceil(num / updated.monthlyFee);
    } else if (scheme === "INSTALLMENT" && updated.monthlyFee > 0) {
      setInstallments(Math.ceil(num / updated.monthlyFee));
    }
    setCustomize(updated);
  };

  const inp = {
    width: "100%", background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 10, padding: "8px 12px", fontSize: 13, color: "#334155",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
  const lbl = {
    display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        <div>
          <label style={lbl}>Payment Scheme</label>
          <select style={inp} value={scheme} onChange={e => setScheme(e.target.value)}>
            <option value="MONTHLY">Monthly Dues</option>
            <option value="FULL">Full Payment</option>
            <option value="INSTALLMENT">Installments</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Date of Joining</label>
          <input type="date" style={inp} value={doj} onChange={e => setDoj(e.target.value)} required />
        </div>
      </div>

      <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 12, padding: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>Monthly Fee</label>
            <input type="number" style={{ ...inp, background: "#fff" }}
              value={customize.monthlyFee}
              onChange={e => handleMonthlyFeeChange(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>{scheme === "INSTALLMENT" ? "Installments" : "Months"}</label>
            <input type="number" style={{ ...inp, background: "#f1f5f9" }}
              value={scheme === "INSTALLMENT" ? installments : customize.durationMonths}
              readOnly />
          </div>
          <div>
            <label style={lbl}>Total Fee</label>
            <input type="number" style={{ ...inp, background: "#fff" }}
              value={customize.totalFee}
              onChange={e => handleTotalFeeChange(e.target.value)} />
          </div>
        </div>
      </div>

      <button
        onClick={() => onConfirm({ scheme, doj, customize, installments })}
        style={{ width: "100%", background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
        Confirm Enrollment
      </button>
    </div>
  );
};

export default function FeeDetails({ token }) {
  const [fees, setFees] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState({ totalDue: 0, totalPaid: 0, pending: 0, overdue: 0, upcoming: 0 });
  const [showEnroll, setShowEnroll] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courseDefaults, setCourseDefaults] = useState({});
  const [upcoming, setUpcoming] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  const fetchFees = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get("/fee/all", {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate },
      });
      setFees(res.data.fees || []);
    } catch { toast.error("Error fetching fee records"); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    if (!token) return;
    try {
      const [s, u, o] = await Promise.all([
        getReportSummary(token),
        getUpcomingDues(14, token),
        getOverdueDues(token),
      ]);
      setSummary(s.data.summary || { totalDue: 0, totalPaid: 0, pending: 0, overdue: 0, upcoming: 0 });
      setUpcoming(u.data.upcoming || []);
      setOverdue(o.data.overdue || []);
    } catch {}
  };

  const bootstrapEnrollment = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [sRes, cRes] = await Promise.all([
        axios.get("/students/get", { headers }),
        axios.get("/courses/get", { headers }),
      ]);
      setStudents(Array.isArray(sRes.data) ? sRes.data : sRes.data?.students || []);
      setCourses(Array.isArray(cRes.data) ? cRes.data : cRes.data?.courses || []);
    } catch { toast.error("Failed to load enrollment data"); }
  };

  const handleEditPayment = async (paymentId, currentAmount) => {
    const newAmount = window.prompt("Enter new amount (₹):", currentAmount);
    if (newAmount === null || newAmount === "") return;
    if (isNaN(newAmount)) return toast.error("Invalid amount");

    try {
      setLoading(true);
      await axios.put(`/fee/update/${paymentId}`, { amount: Number(newAmount) }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Payment updated");
      fetchFees(); fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally { setLoading(false); }
  };

  const restoreData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      await axios.post("/admin/fix-data", {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("System integrity verified. Records restored.");
      fetchFees(); fetchStats();
    } catch { toast.error("Verification failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFees(); fetchStats(); }, [token]);

  useEffect(() => {
    const selected = courses.find(c => c._id === courseId);
    if (selected) setCourseDefaults({ monthlyFee: selected.monthlyFee || 0, durationMonths: selected.durationMonths || 0, totalFee: selected.totalFee || 0 });
  }, [courseId, courses]);

  const groupedFees = useMemo(() => {
    return fees.reduce((acc, fee) => {
      const sid = fee.studentId?._id;
      if (!sid) return acc;
      if (!acc[sid]) acc[sid] = { student: fee.studentId, course: fee.course, totalPaid: 0, paymentDates: new Set() };
      acc[sid].totalPaid += Number(fee.amount);
      acc[sid].paymentDates.add(new Date(fee.date).toLocaleDateString("en-IN"));
      return acc;
    }, {});
  }, [fees]);

  const filteredStudents = Object.values(groupedFees).filter(({ student }) =>
    student.name?.toLowerCase().includes(search.toLowerCase())
  );

  const { totalPaidLegacy, totalCourseFeesLegacy, totalBalanceLegacy } = useMemo(() => {
    const paid = filteredStudents.reduce((sum, s) => sum + s.totalPaid, 0);
    const totalFees = filteredStudents.reduce((sum, s) => sum + (s.student?.totalFees || 0), 0);
    return { totalPaidLegacy: paid, totalCourseFeesLegacy: totalFees, totalBalanceLegacy: totalFees - paid };
  }, [filteredStudents]);

  const csvData = filteredStudents.map((s, index) => ({
    "#": index + 1, "Student Name": s.student.name, "Course Name": s.course,
    "Total Course Fees": s.student.totalFees?.toFixed(2), "Fees Paid": s.totalPaid?.toFixed(2),
    "Fees Balance": (s.student.totalFees - s.totalPaid)?.toFixed(2),
    "Payment Dates": Array.from(s.paymentDates).join(", "),
  }));

  const onConfirmEnrollment = async (payload) => {
    try {
      if (!studentId || !courseId) return toast.error("Select student and course");
      if (!payload.doj) return toast.error("Select DOJ");
      await enroll({ studentId, courseId, doj: payload.doj, scheme: payload.scheme, customize: payload.customize, installments: payload.installments }, token);
      toast.success("Admission successful");
      setShowEnroll(false); setStudentId(""); setCourseId("");
      fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || "Admission failed"); }
  };

  /* ── Style tokens ── */
  const inp = {
    width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 10, padding: "8px 13px", fontSize: 13, fontWeight: 500,
    color: "#334155", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
  const lbl = {
    display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
  };
  const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" };

  const STATS = [
    { label: "Collected", val: summary.totalPaid, color: "#059669", bg: "#ecfdf5" },
    { label: "Pending", val: summary.pending, color: "#2563eb", bg: "#eff6ff" },
    { label: "Overdue", val: summary.overdue, color: "#e11d48", bg: "#fff1f2" },
    { label: "Upcoming", val: summary.upcoming, color: "#d97706", bg: "#fffbeb" },
  ];

  /* table columns visible on mobile */
  const showCourse = !isMobile;
  const showTotalFee = !isMobile;
  const showDates = isDesktop;

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: isMobile ? 16 : 28, marginTop: 8 }}>

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
              <DollarSign size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 22, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Fee Management
              </h1>
              <p style={{ margin: "5px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 5 }}>
                <Activity size={10} color="#3b82f6" /> Financial Tracking & Student Enrollment
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, width: isMobile ? "100%" : "auto" }}>
            <button onClick={() => setShowAddPayment(true)}
              style={{ display: "flex", alignItems: "center", gap: 7, background: "#059669", color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 11, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 10px rgba(5,150,105,0.25)", flex: isMobile ? "1" : "none", justifyContent: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <Plus size={15} /> Add Payment
            </button>
            <button onClick={async () => { await bootstrapEnrollment(); setShowEnroll(true); }}
              style={{ display: "flex", alignItems: "center", gap: 7, background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 11, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 10px rgba(37,99,235,0.25)", flex: isMobile ? "1" : "none", justifyContent: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <TrendingUp size={15} /> New Enrollment
            </button>
            {!isMobile && (
              <button onClick={() => { fetchFees(); fetchStats(); }}
                style={{ padding: "9px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <RefreshCcw size={17} style={loading ? { animation: "spin 1s linear infinite" } : {}} />
              </button>
            )}
          </div>
        </div>

        {/* ── STATS GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: isMobile ? 10 : 16, marginBottom: 24 }}>
          {STATS.map((stat, i) => (
            <div key={i} style={{ background: stat.bg, borderRadius: 16, padding: isMobile ? "14px 14px" : "20px 20px", border: "1px solid #fff" }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</p>
              <p style={{ margin: "6px 0 0", fontSize: isMobile ? 17 : 20, fontWeight: 900, color: stat.color }}>₹{stat.val?.toLocaleString() || "0"}</p>
            </div>
          ))}
        </div>

        {/* ── OVERDUE + UPCOMING ── */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 14 : 20, marginBottom: 24 }}>
          {[
            { title: "Late Fees", icon: AlertCircle, color: "#e11d48", bg: "#fff1f2", badge: `${overdue.length} STUDENTS`, data: overdue, emptyMsg: "No Late Fees Found", amtColor: "#e11d48", subLabel: "Action Required", subColor: "#fda4af" },
            { title: "Upcoming Fees", icon: Clock, color: "#059669", bg: "#ecfdf5", badge: `${upcoming.length} REMINDERS`, data: upcoming, emptyMsg: "No Upcoming Fees Found", amtColor: "#059669", subLabel: "Pending Money", subColor: "#6ee7b7" },
          ].map((panel, pi) => (
            <div key={pi} style={{ ...card, borderLeft: `4px solid ${panel.color}` }}>
              <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#1e293b", display: "flex", alignItems: "center", gap: 7 }}>
                  <panel.icon size={13} color={panel.color} /> {panel.title}
                </h3>
                <span style={{ fontSize: 9, fontWeight: 900, color: panel.color, background: panel.bg, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>{panel.badge}</span>
              </div>
              <div style={{ padding: 12, maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {panel.data.length > 0 ? panel.data.map(item => (
                  <div key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: "#1e293b", textTransform: "uppercase" }}>{item.label}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Due: {new Date(item.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: panel.amtColor }}>₹{item.amount?.toLocaleString()}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 9, fontWeight: 700, color: panel.subColor, textTransform: "uppercase" }}>{panel.subLabel}</p>
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: "32px 0", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.08em" }}>{panel.emptyMsg}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTERS ── */}
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", flexWrap: "wrap", gap: 12, alignItems: isMobile ? "stretch" : "center", background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 12, padding: isMobile ? 14 : 16, marginBottom: 22 }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", gap: 8, flex: 1 }}>
            <Calendar size={15} color="#94a3b8" style={{ flexShrink: 0, display: isMobile ? "none" : "block" }} />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              style={{ ...inp, width: isMobile ? "100%" : 160 }} />
            <span style={{ color: "#cbd5e1", textAlign: "center", fontSize: 12 }}>to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              style={{ ...inp, width: isMobile ? "100%" : 160 }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchFees}
              style={{ padding: "9px 18px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer", flex: isMobile ? "1" : "none" }}>
              Apply Filter
            </button>
            <CSVLink data={csvData} filename="fee-records.csv" style={{ textDecoration: "none", flex: isMobile ? "1" : "none" }}>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "9px 16px", background: "#fff", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer", width: "100%" }}>
                <FileDown size={13} /> Export CSV
              </button>
            </CSVLink>
          </div>
        </div>

        {/* ── LEGACY SUMMARY CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 10 : 14, marginBottom: 22 }}>
          {[
            { label: "Total Collected", val: totalPaidLegacy, icon: TrendingUp, color: "#059669", iconBg: "#d1fae5", bg: "rgba(236,253,245,0.5)", border: "#a7f3d0" },
            { label: "Total Balance", val: totalBalanceLegacy, icon: AlertCircle, color: "#e11d48", iconBg: "#fee2e2", bg: "rgba(255,241,242,0.5)", border: "#fecdd3" },
            { label: "Overall Fees", val: totalCourseFeesLegacy, icon: DollarSign, color: "#60a5fa", iconBg: "#1e293b", bg: "#0f172a", border: "#1e293b", dark: true },
          ].map((item, i) => (
            <div key={i} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: item.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <item.icon size={18} color={item.color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: item.dark ? "#64748b" : item.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: isMobile ? 16 : 18, fontWeight: 900, color: item.dark ? "#fff" : item.color === "#059669" ? "#065f46" : "#9f1239" }}>₹{item.val?.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── SEARCH ── */}
        <div style={{ position: "relative", marginBottom: 18 }}>
          <Search size={15} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Search student name..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inp, paddingLeft: 36, fontWeight: 700, height: 42 }} />
        </div>

        {/* ── TABLE (tablet+) / CARDS (mobile) ── */}
        {isMobile ? (
          /* Mobile card list */
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <Loader2 size={22} color="#e2e8f0" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No records found</div>
            ) : filteredStudents.map((s, idx) => (
              <div key={idx} style={{ border: "1px solid #f1f5f9", borderRadius: 14, padding: "14px 16px", background: "#fafafa" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{s.student.name}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>{s.course}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Total Fee", val: `₹${s.student.totalFees?.toLocaleString()}`, color: "#475569" },
                    { label: "Paid", val: `₹${s.totalPaid?.toLocaleString()}`, color: "#059669" },
                    { label: "Balance", val: `₹${(s.student.totalFees - s.totalPaid)?.toLocaleString()}`, color: "#e11d48" },
                  ].map((cell, ci) => (
                    <div key={ci} style={{ textAlign: "center", background: "#fff", border: "1px solid #f1f5f9", borderRadius: 8, padding: "8px 4px" }}>
                      <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{cell.label}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 900, color: cell.color }}>{cell.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tablet / Desktop table */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead style={{ background: "rgba(248,250,252,0.5)" }}>
                <tr>
                  {["Student", showCourse && "Course", showTotalFee && "Total Fee", "Paid", "Balance", showDates && "Dates"].filter(Boolean).map((h, i) => (
                    <th key={i} style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={[true, showCourse, showTotalFee, true, true, showDates].filter(Boolean).length} style={{ padding: "40px 16px", textAlign: "center", color: "#cbd5e1" }}>Loading records...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan={[true, showCourse, showTotalFee, true, true, showDates].filter(Boolean).length} style={{ padding: "40px 16px", textAlign: "center", color: "#94a3b8" }}>No records found</td></tr>
                ) : filteredStudents.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f8fafc" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(248,250,252,0.5)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{s.student.name}</span>
                    </td>
                    {showCourse && <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{s.course}</td>}
                    {showTotalFee && <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#334155" }}>₹{s.student.totalFees?.toLocaleString()}</td>}
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#059669" }}>₹{s.totalPaid?.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#e11d48" }}>₹{(s.student.totalFees - s.totalPaid)?.toLocaleString()}</td>
                    {showDates && <td style={{ padding: "12px 16px", fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{Array.from(s.paymentDates).join(", ")}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PAYMENT HISTORY (New Section) ── */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={16} color="#d97706" /> Recent Transaction History
            </h2>
          </div>
          <div style={{ ...card }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 12 }}>
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    {["Ref ID", "Student", "Amount", "Date", "Status", "Actions"].map((h, i) => (
                      <th key={i} style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fees.slice(0, 10).map((fee, fi) => (
                    <tr key={fee._id || fi} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "#64748b" }}>#{(fee._id || "").slice(-6).toUpperCase()}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "#1e293b" }}>{fee.studentId?.name || "N/A"}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 900, color: "#059669" }}>₹{fee.amount?.toLocaleString()}</td>
                      <td style={{ padding: "12px 16px", color: "#64748b" }}>{new Date(fee.date).toLocaleDateString("en-IN")}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 9, fontWeight: 900, background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase" }}>Completed</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => handleEditPayment(fee._id, fee.amount)}
                          style={{ padding: "6px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#64748b", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {fees.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No recent transactions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── ENROLLMENT MODAL ── */}
      {showEnroll && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: isMobile ? 12 : 24 }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 600, borderRadius: 20, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", padding: isMobile ? 18 : 28, maxHeight: "92vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>New Registration</h3>
              <button onClick={() => setShowEnroll(false)}
                style={{ padding: 6, background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Select Student</label>
                <select value={studentId} onChange={e => setStudentId(e.target.value)}
                  style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "9px 13px", fontSize: 13, color: "#334155", outline: "none", boxSizing: "border-box" }}>
                  <option value="">Choose Student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Select Course</label>
                <select value={courseId} onChange={e => setCourseId(e.target.value)}
                  style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "9px 13px", fontSize: 13, color: "#334155", outline: "none", boxSizing: "border-box" }}>
                  <option value="">Choose Course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <SchemeSelector courseDefaults={courseDefaults} onConfirm={onConfirmEnrollment} isMobile={isMobile} />
          </div>
        </div>
      )}

      {showAddPayment && (
        <AddPaymentModal onClose={() => setShowAddPayment(false)} onAdded={() => { fetchFees(); fetchStats(); }} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}