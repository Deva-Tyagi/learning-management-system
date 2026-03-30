import { useState, useEffect } from "react";
import API_BASE_URL from "../../lib/utils";
import {
  Download, Filter, FileText,
  CheckCircle2, XCircle, Loader2,
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

export default function AttendanceReport({ token }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  useEffect(() => {
    const fetchBatches = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/batches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBatches(data);
        }
      } catch {}
    };
    fetchBatches();
  }, [token]);

  const handleGenerate = async () => {
    if (!selectedBatch || !startDate || !endDate)
      return toast.error("Please select batch and date range");
    try {
      setLoading(true);
      const [attendRes, studentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/attendance/?startDate=${startDate}&endDate=${endDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/students/get`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const attendData = await attendRes.json();
      const studentData = await studentRes.json();
      if (attendRes.ok && studentRes.ok) {
        const batchStudents = studentData.filter(s => s.batch === selectedBatch);
        const report = batchStudents.map(student => {
          const studentAttend = attendData.filter(r => r.studentId?._id === student._id);
          const attendanceByDate = {};
          studentAttend.forEach(r => {
            attendanceByDate[new Date(r.date).toISOString().split("T")[0]] = r.status;
          });
          return {
            ...student,
            attendanceByDate,
            totalPresent: studentAttend.filter(r => r.status === "Present").length,
            totalDays: studentAttend.length,
          };
        });
        setReportData(report);
        toast.success("Report generated");
      }
    } catch { toast.error("Failed to generate report"); }
    finally { setLoading(false); }
  };

  const dateRange = (() => {
    if (!startDate || !endDate) return [];
    const dates = [];
    let current = new Date(startDate);
    const last = new Date(endDate);
    while (current <= last) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  })();

  const exportCSV = () => {
    if (!reportData.length) return;
    const header = ["Student", "Roll#", "Attendance %", ...dateRange];
    const rows = reportData.map(s => {
      const pct = s.totalDays > 0 ? ((s.totalPresent / s.totalDays) * 100).toFixed(1) : 0;
      return [s.name, s.rollNumber || "N/A", pct + "%", ...dateRange.map(d => s.attendanceByDate[d] || "-")];
    });
    const csvContent = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${selectedBatch}.csv`;
    a.click();
  };

  /* ── Style tokens ── */
  const inp = {
    width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 500,
    color: "#334155", outline: "none", boxSizing: "border-box",
    fontFamily: "inherit", height: 46,
  };
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 600, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
  };
  const thBase = {
    padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{
        background: "#fff", border: "1px solid #e2e8f0",
        borderRadius: 20, padding: isMobile ? 16 : 28, marginTop: 8,
      }}>

        {/* ── HEADER ── */}
        <div style={{
          display: "flex", flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
          gap: 14, marginBottom: 24,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
              Attendance Report
            </h1>
            <p style={{ margin: "5px 0 0", fontSize: 13, color: "#94a3b8" }}>
              View and download attendance records
            </p>
          </div>
          {reportData.length > 0 && (
            <button onClick={exportCSV}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#2563eb", color: "#fff", border: "none",
                borderRadius: 12, padding: "10px 20px", fontSize: 13,
                fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
                width: isMobile ? "100%" : "auto", justifyContent: "center",
              }}>
              <Download size={16} /> Export CSV
            </button>
          )}
        </div>

        {/* ── FILTER BAR ── */}
        <div style={{
          background: "#f8fafc", border: "1px solid #f1f5f9",
          borderRadius: 16, padding: isMobile ? 14 : 22, marginBottom: 24,
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : isDesktop ? "1fr 1fr 1fr auto" : "1fr 1fr",
            gap: isMobile ? 14 : 16,
            alignItems: "end",
          }}>
            {/* Batch */}
            <div>
              <label style={lbl}>Select Batch</label>
              <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={inp}>
                <option value="">Choose Batch</option>
                {batches.map(b => (
                  <option key={b._id} value={b.name}>
                    {b.name} ({b.startTime} - {b.endTime})
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label style={lbl}>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inp} />
            </div>

            {/* End Date */}
            <div>
              <label style={lbl}>End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inp} />
            </div>

            {/* Generate button */}
            <button onClick={handleGenerate} disabled={loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "#0f172a", color: "#fff", border: "none", borderRadius: 12,
                height: 46, padding: "0 24px", fontSize: 12, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer",
                opacity: loading ? 0.6 : 1, boxShadow: "0 4px 14px rgba(15,23,42,0.18)",
                width: isMobile || !isDesktop ? "100%" : "auto",
                gridColumn: !isDesktop && !isMobile ? "span 2" : "auto",
              }}>
              {loading
                ? <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} />
                : <Filter size={17} />}
              Generate Report
            </button>
          </div>
        </div>

        {/* ── REPORT TABLE ── */}
        {reportData.length > 0 && (
          <>
            {/* Mobile: card list with % badge + scrollable date dots */}
            {isMobile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {reportData.map(s => {
                  const pct = s.totalDays > 0 ? ((s.totalPresent / s.totalDays) * 100).toFixed(1) : 0;
                  const good = parseFloat(pct) >= 75;
                  return (
                    <div key={s._id} style={{ border: "1px solid #f1f5f9", borderRadius: 14, padding: "14px 16px", background: "#fafafa" }}>
                      {/* Name + % badge */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{s.name}</p>
                          <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 700, color: "#94a3b8", fontFamily: "monospace" }}>#{s.rollNumber || "N/A"}</p>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 900, textTransform: "uppercase",
                          padding: "4px 10px", borderRadius: 8,
                          background: good ? "#ecfdf5" : "#fff1f2",
                          color: good ? "#059669" : "#e11d48",
                        }}>
                          {pct}%
                        </span>
                      </div>
                      {/* Date dots row — horizontally scrollable */}
                      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
                        <div style={{ display: "flex", gap: 6, minWidth: "max-content" }}>
                          {dateRange.map(d => {
                            const status = s.attendanceByDate[d];
                            return (
                              <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                                <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", whiteSpace: "nowrap" }}>
                                  {new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                </span>
                                {status === "Present"
                                  ? <CheckCircle2 size={14} color="#10b981" />
                                  : status === "Absent"
                                  ? <XCircle size={14} color="#f43f5e" />
                                  : <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700 }}>—</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Tablet / Desktop — horizontally scrollable table */
              <div style={{ border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                    <thead style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                      <tr>
                        <th style={{ ...thBase, position: "sticky", left: 0, background: "#f8fafc", zIndex: 10, borderRight: "1px solid #f1f5f9" }}>
                          Student
                        </th>
                        <th style={{ ...thBase, textAlign: "center" }}>% Rate</th>
                        {dateRange.map(d => (
                          <th key={d} style={{ ...thBase, textAlign: "center", borderLeft: "1px solid #e2e8f0", padding: "12px 10px" }}>
                            {new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map(s => {
                        const pct = s.totalDays > 0 ? ((s.totalPresent / s.totalDays) * 100).toFixed(1) : 0;
                        const good = parseFloat(pct) >= 75;
                        return (
                          <tr key={s._id} style={{ borderBottom: "1px solid #f8fafc" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(248,250,252,0.6)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "13px 18px", position: "sticky", left: 0, background: "#fff", zIndex: 5, borderRight: "1px solid #f1f5f9" }}>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{s.name}</p>
                              <p style={{ margin: "2px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", fontFamily: "monospace" }}>#{s.rollNumber || "N/A"}</p>
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "center" }}>
                              <span style={{
                                fontSize: 10, fontWeight: 900, textTransform: "uppercase",
                                padding: "3px 8px", borderRadius: 6,
                                background: good ? "#ecfdf5" : "#fff1f2",
                                color: good ? "#059669" : "#e11d48",
                              }}>
                                {pct}%
                              </span>
                            </td>
                            {dateRange.map(d => (
                              <td key={d} style={{ padding: "13px 10px", textAlign: "center", borderLeft: "1px solid #f8fafc" }}>
                                {s.attendanceByDate[d] === "Present"
                                  ? <CheckCircle2 size={15} color="#10b981" style={{ margin: "0 auto" }} />
                                  : s.attendanceByDate[d] === "Absent"
                                  ? <XCircle size={15} color="#f43f5e" style={{ margin: "0 auto" }} />
                                  : <span style={{ color: "#e2e8f0", fontWeight: 700 }}>—</span>}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── EMPTY STATE ── */}
        {!reportData.length && !loading && (
          <div style={{ padding: "64px 24px", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, background: "#f8fafc", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <FileText size={30} color="#cbd5e1" />
            </div>
            <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Select Options
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#94a3b8" }}>
              Choose a batch and date to see attendance
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}