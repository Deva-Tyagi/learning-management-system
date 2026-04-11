import React, { useEffect, useState, useCallback } from "react";
import axios from "../../lib/axios";
import {
  BarChart2, Users, TrendingUp, TrendingDown, DollarSign,
  Calendar, Filter, X, CheckCircle, Clock, RefreshCw, ChevronDown
} from "lucide-react";

const lbl = { margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" };

const StatCard = ({ label, value, sub, icon: Icon, color, bg }) => (
  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <p style={lbl}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" }}>{value}</p>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 600, color: "#64748b" }}>{sub}</p>}
    </div>
    <div style={{ padding: 13, borderRadius: 13, background: bg, color, flexShrink: 0 }}>
      <Icon size={22} strokeWidth={2.5} />
    </div>
  </div>
);

const FilterSelect = ({ label, value, onChange, children }) => (
  <div>
    <p style={{ ...lbl, marginBottom: 5 }}>{label}</p>
    <div style={{ position: "relative" }}>
      <select value={value} onChange={onChange} style={{ width: "100%", appearance: "none", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 28px 8px 12px", fontSize: 12, fontWeight: 600, color: "#334155", outline: "none", cursor: "pointer" }}>
        {children}
      </select>
      <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
    </div>
  </div>
);

export default function StudentReports({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [batch, setBatch] = useState("");
  const [status, setStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // For filter dropdowns — loaded from students
  const [courseOptions, setCourseOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const t = token || localStorage.getItem("adminToken");
      if (!t) throw new Error("Not authenticated");
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (course) params.append("course", course);
      if (branch) params.append("branch", branch);
      if (batch) params.append("batch", batch);
      if (status) params.append("status", status);

      const [reportRes, studentsRes] = await Promise.all([
        axios.get(`/students/reports?${params.toString()}`, { headers: { Authorization: `Bearer ${t}` } }),
        axios.get("/students/get", { headers: { Authorization: `Bearer ${t}` } }),
      ]);

      setData(reportRes.data);
      const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setCourseOptions([...new Set(students.map(s => s.course).filter(Boolean))]);
      setBatchOptions([...new Set(students.map(s => s.batch).filter(Boolean))]);
      setBranchOptions([...new Set(students.map(s => s.franchise).filter(Boolean))]);
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [token, dateFrom, dateTo, course, branch, batch, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const clearFilters = () => {
    setDateFrom(""); setDateTo(""); setCourse(""); setBranch(""); setBatch(""); setStatus("");
  };

  const hasFilters = dateFrom || dateTo || course || branch || batch || status;

  const s = data?.summary || {};

  /* ── Bar Chart Helper ── */
  const BarChart = ({ entries, colorFn }) => {
    const max = Math.max(...entries.map(e => e.count), 1);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.map(({ name, count }) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", minWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={name}>{name}</span>
            <div style={{ flex: 1, height: 10, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${Math.round((count / max) * 100)}%`,
                background: colorFn ? colorFn(name) : "linear-gradient(90deg,#2563eb,#60a5fa)",
                borderRadius: 99, transition: "width 0.6s ease",
              }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#1e293b", minWidth: 26, textAlign: "right" }}>{count}</span>
            <span style={{ fontSize: 10, color: "#94a3b8", minWidth: 38, textAlign: "right" }}>
              {s.total > 0 ? `${Math.round((count / s.total) * 100)}%` : "0%"}
            </span>
          </div>
        ))}
      </div>
    );
  };

  /* ── Monthly Trend Chart ── */
  const TrendChart = ({ trend }) => {
    const max = Math.max(...trend.map(t => t.count), 1);
    const BAR_ZONE = 110; // fixed pixel height for the bars only

    return (
      /*
        Two-zone layout:
        Zone 1 → bar area (fixed height, bars grow from bottom via flex-end)
        Zone 2 → labels row (always below, never overlapped)
      */
      <div style={{ display: "flex", gap: 6 }}>
        {trend.map((t, i) => {
          const barH = Math.max(6, Math.round((t.count / max) * BAR_ZONE));
          const isLast = i === trend.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>

              {/* Count label sits ABOVE the bar */}
              <span style={{
                fontSize: 11, fontWeight: 800, color: "#1e293b",
                marginBottom: 4, minHeight: 16, textAlign: "center",
                visibility: t.count === 0 ? "hidden" : "visible",
              }}>
                {t.count}
              </span>

              {/* Bar zone — fixed height, bar sticks to bottom */}
              <div style={{
                width: "100%", height: BAR_ZONE,
                display: "flex", alignItems: "flex-end",
              }}>
                <div style={{
                  width: "100%",
                  height: barH,
                  borderRadius: "5px 5px 0 0",
                  background: isLast
                    ? "linear-gradient(180deg,#0f172a,#334155)"
                    : "linear-gradient(180deg,#93c5fd,#bfdbfe)",
                  transition: "height 0.5s cubic-bezier(0.4,0,0.2,1)",
                  position: "relative",
                }}>
                  {/* Shimmer on hover via CSS — handled by inline opacity */}
                </div>
              </div>

              {/* Divider line */}
              <div style={{ width: "100%", height: 2, background: "#f1f5f9", borderRadius: 1 }} />

              {/* Month label BELOW the bar zone */}
              <span style={{
                fontSize: 10, fontWeight: 700, color: "#94a3b8",
                marginTop: 6, whiteSpace: "nowrap", textAlign: "center",
              }}>
                {t.month}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "inherit" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, background: "#fff", padding: "18px 24px", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <BarChart2 size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" }}>Student Reports</h1>
            <p style={{ margin: "4px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Analytics & Insights</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowFilters(p => !p)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", fontSize: 11, fontWeight: 700, color: showFilters ? "#2563eb" : "#475569", background: showFilters ? "#eff6ff" : "#f8fafc", border: `1px solid ${showFilters ? "#bfdbfe" : "#e2e8f0"}`, borderRadius: 10, cursor: "pointer", textTransform: "uppercase" }}>
            <Filter size={13} /> Filters {hasFilters ? `(On)` : ""}
          </button>
          <button onClick={fetchData}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", fontSize: 11, fontWeight: 700, color: "#fff", background: "#0f172a", border: "none", borderRadius: 10, cursor: "pointer", textTransform: "uppercase" }}>
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            <div>
              <p style={{ ...lbl, marginBottom: 5 }}>From Date</p>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#334155", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <p style={{ ...lbl, marginBottom: 5 }}>To Date</p>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#334155", outline: "none", boxSizing: "border-box" }} />
            </div>
            <FilterSelect label="Course" value={course} onChange={e => setCourse(e.target.value)}>
              <option value="">All Courses</option>
              {courseOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </FilterSelect>
            <FilterSelect label="Branch" value={branch} onChange={e => setBranch(e.target.value)}>
              <option value="">All Branches</option>
              {branchOptions.map(b => <option key={b} value={b}>{b}</option>)}
            </FilterSelect>
            <FilterSelect label="Batch" value={batch} onChange={e => setBatch(e.target.value)}>
              <option value="">All Batches</option>
              {batchOptions.map(b => <option key={b} value={b}>{b}</option>)}
            </FilterSelect>
            <FilterSelect label="Status" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </FilterSelect>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", fontSize: 11, fontWeight: 700, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 10, cursor: "pointer" }}>
              <X size={12} /> Clear All Filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 40, height: 40, border: "4px solid #e2e8f0", borderTopColor: "#0f172a", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 12px" }} />
            <p style={lbl}>Loading Reports...</p>
          </div>
        </div>
      ) : error ? (
        <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 14, padding: "20px 24px", color: "#be123c", fontSize: 13, fontWeight: 700 }}>⚠ {error}</div>
      ) : (
        <>
          {/* ── STAT CARDS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <StatCard label="Total Students" value={s.total || 0} icon={Users} color="#2563eb" bg="#eff6ff" />
            <StatCard label="New This Month" value={s.newThisMonth || 0} icon={TrendingUp} color="#059669" bg="#ecfdf5" sub="Admissions in current month" />
            <StatCard label="Active" value={s.active || 0} icon={CheckCircle} color="#16a34a" bg="#dcfce7" sub={`${s.total > 0 ? Math.round((s.active / s.total) * 100) : 0}% of total`} />
            <StatCard label="On Hold / Left" value={s.onHold || 0} icon={TrendingDown} color="#d97706" bg="#fef3c7" />
            <StatCard label="Completed" value={s.completed || 0} icon={CheckCircle} color="#2563eb" bg="#dbeafe" sub={`${s.completionRate || 0}% completion rate`} />
            <StatCard label="Total Collected" value={`₹${Number(s.totalCollected || 0).toLocaleString("en-IN")}`} icon={DollarSign} color="#059669" bg="#ecfdf5" />
            <StatCard label="Outstanding" value={`₹${Number(s.outstanding || 0).toLocaleString("en-IN")}`} icon={DollarSign} color="#dc2626" bg="#fff1f2" />
            <StatCard label="Completion Rate" value={`${s.completionRate || 0}%`} icon={BarChart2} color="#4f46e5" bg="#eef2ff" />
          </div>

          {/* ── CHARTS ROW ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Course-wise */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px 24px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 800, color: "#1e293b" }}>
                Course-wise Students
              </h3>
              {Object.keys(data?.courseCounts || {}).length === 0 ? (
                <p style={{ ...lbl, textAlign: "center", padding: 20 }}>No data</p>
              ) : (
                <BarChart
                  entries={Object.entries(data.courseCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)}
                  colorFn={() => "linear-gradient(90deg,#4f46e5,#818cf8)"}
                />
              )}
            </div>

            {/* Batch-wise */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px 24px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 800, color: "#1e293b" }}>
                Batch-wise Students
              </h3>
              {Object.keys(data?.batchCounts || {}).length === 0 ? (
                <p style={{ ...lbl, textAlign: "center", padding: 20 }}>No data</p>
              ) : (
                <BarChart
                  entries={Object.entries(data.batchCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)}
                  colorFn={() => "linear-gradient(90deg,#059669,#34d399)"}
                />
              )}
            </div>
          </div>

          {/* ── SECOND ROW ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Monthly Enrollment Trend */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px 24px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 800, color: "#1e293b" }}>Monthly Enrollment (Last 6 Months)</h3>
              {data?.monthlyTrend?.length > 0 ? (
                <TrendChart trend={data.monthlyTrend} />
              ) : (
                <p style={{ ...lbl, textAlign: "center", padding: 20 }}>No data</p>
              )}
            </div>

            {/* Fee Collection Summary */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px 24px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 800, color: "#1e293b" }}>Fee Collection Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Total bar */}
                {[
                  { label: "Total Fees", value: s.totalFees || 0, color: "#f1f5f9", fillColor: "#0f172a" },
                  { label: "Collected", value: s.totalCollected || 0, color: "#dcfce7", fillColor: "#16a34a" },
                  { label: "Outstanding", value: s.outstanding || 0, color: "#fef2f2", fillColor: "#dc2626" },
                ].map(item => {
                  const pct = (s.totalFees || 0) > 0 ? Math.min(100, Math.round((item.value / s.totalFees) * 100)) : 0;
                  return (
                    <div key={item.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>{item.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#1e293b" }}>₹{Number(item.value).toLocaleString("en-IN")}</span>
                      </div>
                      <div style={{ height: 10, background: item.color, borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: item.fillColor, borderRadius: 99, transition: "width 0.6s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Branch-wise table */}
          {Object.keys(data?.branchCounts || {}).length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px 24px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 800, color: "#1e293b" }}>Branch-wise Distribution</h3>
              <BarChart
                entries={Object.entries(data.branchCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)}
                colorFn={() => "linear-gradient(90deg,#d97706,#fbbf24)"}
              />
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
