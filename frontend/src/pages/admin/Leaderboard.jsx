import React, { useState, useEffect, useMemo } from "react";
import {
  Trophy, Medal, Target, TrendingUp, Search,
  Filter, Download, Share2, Award, Star, Users,
} from "lucide-react";
import axios from "../../lib/axios";
import API_BASE_URL from "../../lib/utils";

const IMAGE_BASE_URL = API_BASE_URL.replace("/api", "");

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

/* ─── RankBadge ─── */
const RankBadge = ({ rank }) => {
  const base = { width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
  if (rank === 1) return <div style={{ ...base, background: "#fef3c7", border: "2px solid #fcd34d", color: "#d97706" }}><Trophy size={18} /></div>;
  if (rank === 2) return <div style={{ ...base, background: "#f1f5f9", border: "2px solid #cbd5e1", color: "#64748b" }}><Medal size={18} /></div>;
  if (rank === 3) return <div style={{ ...base, background: "#fff7ed", border: "2px solid #fed7aa", color: "#ea580c" }}><Medal size={18} /></div>;
  return <div style={{ ...base, background: "#f8fafc", border: "1px solid #f1f5f9", color: "#94a3b8", fontSize: 12, fontWeight: 900 }}>{rank}</div>;
};

export default function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (s.rollNumber && String(s.rollNumber).toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCourse = selectedCourse === "All" || s.course === selectedCourse;
      return matchesSearch && matchesCourse;
    });
  }, [students, searchTerm, selectedCourse]);

  const courses = useMemo(() => {
    const list = students.map(s => s.course).filter(Boolean);
    return ["All", ...new Set(list)];
  }, [students]);

  const handleExport = () => {
    if (!filteredStudents.length) return;
    const rows = [
      ["Performance Leaderboard", new Date().toLocaleString()], [],
      ["Rank", "Name", "Roll Number", "Course", "Avg Score", "Total Exams"],
      ...filteredStudents.map((s, i) => [i + 1, s.name, s.rollNumber || "N/A", s.course, `${Math.round(s.avgScore)}%`, s.totalExams]),
    ];
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leaderboard_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("/analytics/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16, fontFamily: "sans-serif" }}>
      <div style={{ width: 44, height: 44, border: "4px solid #0f172a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em" }}>Syncing Performance Matrix...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Style tokens ── */
  const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" };
  const thSt = { padding: "13px 14px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap" };
  const iconBtn = { padding: 7, background: "none", border: "none", borderRadius: 9, color: "#94a3b8", cursor: "pointer" };

  /* responsive table columns */
  const showDomain = !isMobile;
  const showEngagement = isDesktop;
  const showActions = isDesktop;
  const colSpan = [true, true, showDomain, true, showEngagement, showActions].filter(Boolean).length;

  const STAR_COLORS = ["#f59e0b", "#94a3b8", "#ea580c"];

  return (
    <div style={{ fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── HEADER ── */}
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between", gap: 14,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? 19 : 23, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 10 }}>
            <Trophy size={isMobile ? 20 : 24} color="#f59e0b" /> Leaderboard
          </h2>
          <p style={{ margin: "5px 0 0", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Real-time ranking based on academic yield</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: isMobile ? "1" : "none" }}>
            <Search size={13} color="#94a3b8" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="text" placeholder="Locate Identity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 30, paddingRight: 14, paddingTop: 8, paddingBottom: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", outline: "none", width: isMobile ? "100%" : 180, boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
          <button onClick={handleExport}
            style={{ ...iconBtn, border: "1px solid #e2e8f0", background: "#fff", padding: "8px 10px" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#334155"; e.currentTarget.style.background = "#f8fafc"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "#fff"; }}>
            <Download size={16} />
          </button>
          <div style={{ position: "relative" }}>
            <button style={{ ...iconBtn, border: "1px solid #e2e8f0", background: selectedCourse !== "All" ? "#eef2ff" : "#fff", padding: "8px 10px", color: selectedCourse !== "All" ? "#4f46e5" : "#94a3b8" }}
              onClick={() => setShowFilter(!showFilter)}
              onMouseEnter={e => { if (selectedCourse === "All") { e.currentTarget.style.color = "#334155"; e.currentTarget.style.background = "#f8fafc"; } }}
              onMouseLeave={e => { if (selectedCourse === "All") { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "#fff"; } }}>
              <Filter size={16} />
            </button>
            {showFilter && (
              <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.1)", zIndex: 50, minWidth: 140, overflow: "hidden" }}>
                {courses.map(c => (
                  <div key={c}
                    onClick={() => { setSelectedCourse(c); setShowFilter(false); }}
                    style={{ padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", background: selectedCourse === c ? "#f8fafc" : "#fff", color: selectedCourse === c ? "#2563eb" : "#475569", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = selectedCourse === c ? "#f8fafc" : "#fff"}
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TOP 3 SPOTLIGHT ── */}
      {filteredStudents.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
          gap: isMobile ? 10 : 16,
          marginBottom: 4,
        }}>
          {filteredStudents.slice(0, isMobile ? 1 : 3).map((student, i) => (
            <div key={student._id} style={{ ...card, padding: isMobile ? "16px 16px" : "22px 20px", display: "flex", flexDirection: isMobile ? "row" : "column", alignItems: "center", gap: isMobile ? 16 : 0, textAlign: isMobile ? "left" : "center", position: "relative" }}>
              {/* Star */}
              <div style={{ position: "absolute", top: 12, right: 12 }}>
                <Star size={isMobile ? 16 : 22} color={STAR_COLORS[i]} fill={STAR_COLORS[i]} />
              </div>

              {/* Avatar + badge */}
              <div style={{ position: "relative", marginBottom: isMobile ? 0 : 14, flexShrink: 0 }}>
                <img
                  src={student.photo ? (student.photo.startsWith('http') ? student.photo : `${IMAGE_BASE_URL}${student.photo}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&color=fff`}
                  style={{ width: isMobile ? 52 : 88, height: isMobile ? 52 : 88, borderRadius: isMobile ? 12 : 20, objectFit: "cover", border: "4px solid #fff", boxShadow: "0 6px 18px rgba(0,0,0,0.1)", display: "block" }}
                  alt=""
                />
                <div style={{ position: "absolute", bottom: -4, right: -4 }}>
                  <RankBadge rank={i + 1} />
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: isMobile ? 14 : 16, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.name}</h3>
                <p style={{ margin: "4px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{student.course}</p>
                <div style={{ display: "flex", gap: 8, marginTop: isMobile ? 8 : 16, justifyContent: isMobile ? "flex-start" : "center", width: "100%" }}>
                  {[
                    { label: "Avg Score", val: `${Math.round(student.avgScore)}%` },
                    { label: "Rank", val: `#${i + 1}` },
                  ].map((stat, si) => (
                    <div key={si} style={{ padding: isMobile ? "6px 12px" : "10px 12px", borderRadius: 12, background: "#f8fafc", border: "1px solid #f1f5f9", flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{stat.label}</p>
                      <p style={{ margin: "3px 0 0", fontSize: isMobile ? 14 : 17, fontWeight: 900, color: "#1e293b" }}>{stat.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FULL RANKING TABLE / CARDS ── */}
      <div style={card}>
        {isMobile ? (
          /* Mobile list */
          <div style={{ background: "#fff" }}>
            {filteredStudents.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <Users size={40} color="#e2e8f0" style={{ margin: "0 auto 10px" }} />
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>No Performance Data Aggregated Yet</p>
              </div>
            ) : filteredStudents.map((student, idx) => (
              <div key={student._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #f8fafc" }}>
                <RankBadge rank={idx + 1} />
                <img
                  src={student.photo ? (student.photo.startsWith('http') ? student.photo : `${IMAGE_BASE_URL}${student.photo}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&color=fff`}
                  style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", border: "1px solid #e2e8f0", flexShrink: 0 }}
                  alt=""
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>ID: {student.rollNumber || "NO-ID"}</p>
                </div>
                {/* Score bar */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, gap: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: "#1e293b" }}>{Math.round(student.avgScore)}%</span>
                  <div style={{ width: 56, height: 4, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "#3b82f6", width: `${student.avgScore}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tablet / Desktop table */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13, whiteSpace: "nowrap" }}>
              <thead style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}>
                <tr>
                  <th style={thSt}>Rank Matrix</th>
                  <th style={thSt}>Entity Persona</th>
                  {showDomain && <th style={thSt}>Domain</th>}
                  <th style={thSt}>Yield Factor</th>
                  {showEngagement && <th style={thSt}>Engagement</th>}
                  {showActions && <th style={{ ...thSt, textAlign: "right" }}>Matrix Status</th>}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={colSpan} style={{ padding: "48px 16px", textAlign: "center" }}>
                    <Users size={40} color="#e2e8f0" style={{ margin: "0 auto 10px" }} />
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>No Performance Data Aggregated Yet</p>
                  </td></tr>
                ) : filteredStudents.map((student, idx) => (
                  <tr key={student._id} style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 14px" }}><RankBadge rank={idx + 1} /></td>
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img
                          src={student.photo ? (student.photo.startsWith('http') ? student.photo : `${IMAGE_BASE_URL}${student.photo}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&color=fff`}
                          style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", border: "1px solid #e2e8f0", flexShrink: 0 }}
                          alt=""
                        />
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: 13 }}>{student.name}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>ID: {student.rollNumber || "NO-ID"}</p>
                        </div>
                      </div>
                    </td>
                    {showDomain && (
                      <td style={{ padding: "13px 14px", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>{student.course}</td>
                    )}
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 80, height: 5, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", flexShrink: 0 }}>
                          <div style={{ height: "100%", background: "#3b82f6", width: `${student.avgScore}%` }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 900, color: "#1e293b" }}>{Math.round(student.avgScore)}%</span>
                      </div>
                    </td>
                    {showEngagement && (
                      <td style={{ padding: "13px 14px" }}>
                        <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#4f46e5", background: "#eef2ff", padding: "3px 9px", borderRadius: 7, border: "1px solid #c7d2fe", display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <Award size={11} /> {student.totalExams} Exams
                        </span>
                      </td>
                    )}
                    {showActions && (
                      <td style={{ padding: "13px 14px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 5 }}>
                          <button style={iconBtn}
                            onMouseEnter={e => { e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "none"; }}>
                            <Target size={15} />
                          </button>
                          <button style={iconBtn}
                            onMouseEnter={e => { e.currentTarget.style.color = "#4f46e5"; e.currentTarget.style.background = "#eef2ff"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "none"; }}>
                            <Share2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}