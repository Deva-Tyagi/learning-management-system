import React, { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Users, DollarSign, GraduationCap,
  Filter, Download, Calendar, BarChart3, PieChart, Activity,
  Crown, Zap, AlertTriangle, ShieldCheck
} from "lucide-react";
import API_BASE_URL from "../../lib/utils";
import axios from "../../lib/axios";

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

/* ─── StatCard ─── */
const THEME_MAP = {
  blue:    { bg: "#eff6ff", text: "#2563eb", circle: "rgba(59,130,246,0.05)" },
  emerald: { bg: "#ecfdf5", text: "#059669", circle: "rgba(16,185,129,0.05)" },
  indigo:  { bg: "#eef2ff", text: "#4f46e5", circle: "rgba(99,102,241,0.05)" },
  amber:   { bg: "#fffbeb", text: "#d97706", circle: "rgba(245,158,11,0.05)" },
};

const StatCard = ({ title, value, change, trend, icon: Icon, color, isMobile }) => {
  const theme = THEME_MAP[color] || THEME_MAP.blue;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: isMobile ? "14px 14px" : "20px 20px", position: "relative", overflow: "hidden" }}>
      {/* decorative circle */}
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: theme.circle }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>{title}</p>
          <h3 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" }}>{value}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <span style={{ display: "flex", alignItems: "center", fontSize: 10, fontWeight: 700, background: trend === "up" ? "#ecfdf5" : "#fff1f2", color: trend === "up" ? "#059669" : "#e11d48", padding: "2px 8px", borderRadius: 999, gap: 3 }}>
              {trend === "up" ? <TrendingUp size={10} strokeWidth={3} /> : <TrendingDown size={10} strokeWidth={3} />} {change}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>vs last month</span>
          </div>
        </div>
        <div style={{ padding: 10, borderRadius: 14, background: theme.bg, color: theme.text, flexShrink: 0 }}>
          <Icon size={isMobile ? 20 : 24} />
        </div>
      </div>
    </div>
  );
};

/* ─── SimpleBarChart ─── */
const SimpleBarChart = ({ data, color }) => {
  if (!data || data.length === 0) return (
    <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
      No Data Found
    </div>
  );
  const width = 400, height = 150, padding = 20, gap = 15;
  const maxValue = Math.max(...data.map(d => d.count || d.amount)) * 1.1 || 1;
  const barWidth = (width - 2 * padding - (data.length - 1) * gap) / data.length;

  return (
    <div style={{ position: "relative", height: 160, width: "100%" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%" }}>
        {data.map((d, i) => {
          const val = d.count || d.amount;
          const barHeight = (val / maxValue) * (height - 2 * padding);
          const x = padding + i * (barWidth + gap);
          const y = height - padding - barHeight;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barHeight} fill={color} fillOpacity="0.2" rx="4" />
              <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 4)} fill={color} rx="4" />
            </g>
          );
        })}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />
      </svg>
    </div>
  );
};

/* ─── Main Component ─── */
export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  const handleExport = () => {
    if (!data) return;
    const rows = [
      ["Report", new Date().toLocaleString()], [],
      ["Metric", "Value"],
      ["Total Students", data.summary.totalStudents],
      ["Total Revenue", data.summary.totalRevenue],
      ["Total Courses", data.summary.totalCourses],
      ["Revenue Match", `${data.summary.revenueMatch}%`], [],
      ["Enrollment Flux"], ["Month", "Enrolled count"],
      ...(data?.enrollmentTrends?.map(d => [d.month, d.count || d.amount]) || []),
    ];
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem("adminToken");
      let url = `/analytics/dashboard?range=${timeRange}`;
      if (timeRange === "custom" && customDates.start && customDates.end) {
        url += `&startDate=${customDates.start}&endDate=${customDates.end}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
      alert("Dashboard updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Refresh failed. Please check your connection.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        let url = `/analytics/dashboard?range=${timeRange}`;
        if (timeRange === "custom" && customDates.start && customDates.end) {
          url += `&startDate=${customDates.start}&endDate=${customDates.end}`;
        }
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAnalytics();
  }, [timeRange, customDates]);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16, fontFamily: "sans-serif" }}>
      <div style={{ width: 44, height: 44, border: "4px solid #0f172a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em" }}>Loading Statistics...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── SUBSCRIPTION PROTOCOL (New) ── */}
      {data?.subscription && (
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: 20,
          padding: isMobile ? 20 : 28,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: 20,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Decorative background element */}
          <div style={{ position: "absolute", right: -50, top: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(37,99,235,0.05)" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative", zIndex: 1 }}>
            <div style={{
              width: 56, height: 56,
              background: data.subscription.plan === "Enterprise" ? "#faf5ff" : data.subscription.plan === "Premium" ? "#eef2ff" : "#eff6ff",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: data.subscription.plan === "Enterprise" ? "#7c3aed" : data.subscription.plan === "Premium" ? "#4f46e5" : "#2563eb",
              boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
            }}>
              {data.subscription.plan === "Enterprise" ? <Crown size={28} /> : <Zap size={28} />}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.01em" }}>{data.subscription.plan} Protocol</h3>
                <span style={{ 
                  fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                  padding: "4px 10px", borderRadius: 8,
                  background: data.subscription.isActive ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                  color: data.subscription.isActive ? "#34d399" : "#f87171",
                  border: `1px solid ${data.subscription.isActive ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`
                }}>
                  {data.subscription.isActive ? "Active System" : "Suspended"}
                </span>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>
                Limit: <span style={{ color: "#fff" }}>{data.subscription.plan === 'Enterprise' ? '8 Branches' : data.subscription.plan === 'Premium' ? '500 Students' : '200 Students'}</span> Capacity
              </p>
            </div>
          </div>

          <div style={{ 
            display: "flex", alignItems: "center", gap: isMobile ? 12 : 32, 
            width: isMobile ? "100%" : "auto", 
            borderTop: isMobile ? "1px solid rgba(255,255,255,0.1)" : "none",
            paddingTop: isMobile ? 16 : 0,
            position: "relative", zIndex: 1
          }}>
            <div style={{ textAlign: isMobile ? "left" : "right" }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>System Expiry</p>
              <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 900, color: "#fff" }}>
                {data.subscription.planExpiryDate ? new Date(data.subscription.planExpiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
              </p>
            </div>
            <div style={{ 
              padding: isMobile ? "10px 16px" : "12px 24px", 
              borderRadius: 14, 
              background: "rgba(255,255,255,0.05)", 
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <Calendar size={16} color="#3b82f6" />
              <span style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>
                {data.subscription.planExpiryDate ? Math.ceil((new Date(data.subscription.planExpiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0} Days Left
              </span>
            </div>
          </div>
        </div>
      )}
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between", gap: 14,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" }}>Statistics Dashboard</h2>
          <p style={{ margin: "5px 0 0", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Real-time data & performance metrics</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
          <div style={{ position: "relative", minWidth: 140 }}>
            <Calendar size={12} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                appearance: "none", padding: "10px 32px 10px 34px", fontSize: 11, fontWeight: 700, color: "#1e293b",
                background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, cursor: "pointer",
                width: "100%", outline: "none", transition: "all 0.2s"
              }}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {timeRange === "custom" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="date" value={customDates.start} onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                style={{ padding: "8px 12px", fontSize: 11, border: "1px solid #e2e8f0", borderRadius: 10, outline: "none" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>to</span>
              <input type="date" value={customDates.end} onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                style={{ padding: "8px 12px", fontSize: 11, border: "1px solid #e2e8f0", borderRadius: 10, outline: "none" }} />
            </div>
          )}

          <button onClick={handleExport}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: 11, fontWeight: 700, color: "#fff", background: "#0f172a", border: "none", borderRadius: 12, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", boxShadow: "0 4px 12px rgba(15,23,42,0.15)", flex: isMobile ? "1" : "none", justifyContent: "center" }}>
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : isDesktop ? "1fr 1fr 1fr 1fr" : "1fr 1fr",
        gap: isMobile ? 10 : 16,
      }}>
        {[
          { title: "Total Students", value: data?.summary.totalStudents || "00", change: "+12%", trend: "up", icon: Users, color: "blue" },
          { title: "Total Fees", value: `₹${(data?.summary.totalRevenue || 0).toLocaleString()}`, change: "+8%", trend: "up", icon: DollarSign, color: "emerald" },
          { title: "Total Courses", value: data?.summary.totalCourses || "00", change: "-2%", trend: "down", icon: GraduationCap, color: "indigo" },
          { title: "Fees Collected (%)", value: `${data?.summary.revenueMatch || 0}%`, change: "+15%", trend: "up", icon: Activity, color: "amber" },
        ].map((s, i) => (
          <StatCard key={i} {...s} isMobile={isMobile} />
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
        gap: isMobile ? 14 : 20,
      }}>

        {/* Enrollment Flux Chart */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: isMobile ? 16 : 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>New Students</p>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.01em" }}>Growth</h3>
            </div>
            <div style={{ padding: 10, borderRadius: 12, background: "#eff6ff", color: "#2563eb" }}>
              <BarChart3 size={18} />
            </div>
          </div>
          <SimpleBarChart data={data?.enrollmentTrends} color="#3b82f6" />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingLeft: 4, paddingRight: 4 }}>
            {data?.enrollmentTrends?.map(d => (
              <span key={d.month} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{d.month}</span>
            ))}
          </div>
        </div>

        {/* Intelligence Insights */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: isMobile ? 16 : 22, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Quick Updates</p>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.01em" }}>Automatic Reports</h3>
            </div>
              <div style={{ padding: 10, borderRadius: 12, background: "#eef2ff", color: "#4f46e5" }}>
                <PieChart size={18} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  icon: TrendingUp, iconColor: "#2563eb", iconBg: "#eff6ff",
                  title: "Revenue Uptick Detected",
                  desc: "Financial matrix indicates an 8% increase in subscription flow compared to last cycle.",
                  hover: "#bfdbfe",
                },
                {
                  icon: Activity, iconColor: "#059669", iconBg: "#ecfdf5",
                  title: "Performance Equilibrium",
                  desc: "Batch performance remains consistent with high engagement in core curriculums.",
                  hover: "#a7f3d0",
                },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 14px", borderRadius: 14, background: "#f8fafc", border: "1px solid #f1f5f9", transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = item.hover}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#f1f5f9"}>
                  <div style={{ padding: 8, borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0", color: item.iconColor, flexShrink: 0 }}>
                    <item.icon size={15} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.01em" }}>{item.title}</p>
                    <p style={{ margin: "5px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handleRefreshData}
            disabled={isRefreshing}
            style={{ 
              width: "100%", marginTop: 18, padding: "12px 0", border: "2px dashed #e2e8f0", 
              borderRadius: 14, fontSize: 10, fontWeight: 900, color: isRefreshing ? "#cbd5e1" : "#94a3b8", 
              background: "transparent", cursor: isRefreshing ? "not-allowed" : "pointer", 
              textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", 
              alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" 
            }}
            onMouseEnter={e => { if(!isRefreshing) { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; } }}
            onMouseLeave={e => { if(!isRefreshing) { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#94a3b8"; } }}>
            <Filter size={13} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} /> 
            {isRefreshing ? "Updating..." : "Refresh Data"}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}