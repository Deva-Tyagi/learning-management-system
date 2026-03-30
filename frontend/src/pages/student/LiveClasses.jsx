import { useState, useEffect } from "react";
import { Video, Calendar, Clock, User, RefreshCw, CheckCircle } from "lucide-react";
import API_BASE_URL from "../../lib/utils";

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

export default function StudentLiveClassesSection({ studentData }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  // 1 col mobile, 2 col tablet, 3 col desktop
  const gridCols = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr";

  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem("studentToken");
      if (!token || !studentData?.course) { setLoading(false); return; }
      try {
        const res = await fetch(
          `${API_BASE_URL}/live-classes/student?course=${encodeURIComponent(studentData.course)}&batch=${encodeURIComponent(studentData.batch)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) setClasses(await res.json());
      } catch (error) {
        console.error("Failed to fetch live classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [studentData]);

  if (loading) return (
    <div style={{ height: 256, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: "4px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>
        Loading your schedule...
      </p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1e293b", padding: "0 4px", display: "flex", alignItems: "center", gap: 10 }}>
        <Video size={22} color="#6366f1" /> Scheduled Live Classes
      </h2>

      {classes.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 24 }}>
          {classes.map(cls => {
            const isJoinable = cls.status === "Ongoing" || cls.status === "Scheduled";

            /* ── Color bar ── */
            const barColor =
              cls.status === "Ongoing"   ? "#10b981" :
              cls.status === "Completed" ? "#cbd5e1"  : "#6366f1";

            /* ── Platform badge ── */
            const platformBadge =
              cls.platform === "Zoom"        ? { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" } :
              cls.platform === "Google Meet" ? { bg: "#fffbeb", color: "#d97706", border: "#fde68a" } :
                                               { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };

            return (
              <div
                key={cls._id}
                style={{
                  background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16,
                  padding: isMobile ? 18 : 24, display: "flex", flexDirection: "column",
                  position: "relative", overflow: "hidden",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "#e0e7ff"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,102,241,0.1)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Left color bar */}
                <div style={{
                  position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                  background: barColor,
                  ...(cls.status === "Ongoing" ? { animation: "pulse 2s ease-in-out infinite" } : {}),
                }} />

                {/* Platform badge + title */}
                <div style={{ marginBottom: 16, paddingLeft: 8 }}>
                  <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, background: platformBadge.bg, color: platformBadge.color, border: `1px solid ${platformBadge.border}` }}>
                    {cls.platform}
                  </span>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1e293b", lineHeight: 1.3 }}>
                    {cls.title}
                  </h3>
                </div>

                {/* Description */}
                {cls.description && (
                  <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b", lineHeight: 1.6, paddingLeft: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {cls.description}
                  </p>
                )}

                {/* Meta info */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto", marginBottom: 20, paddingLeft: 8 }}>
                  {[
                    { icon: Calendar, text: new Date(cls.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) },
                    { icon: Clock,    text: `${cls.time} (${cls.duration} mins)` },
                    { icon: User,     text: cls.instructor?.name || "Instructor" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, fontWeight: 500, color: "#475569" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", flexShrink: 0 }}>
                        <Icon size={14} />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>

                {/* Join / Status button */}
                {isJoinable ? (
                  <a
                    href={cls.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", background: "#4f46e5", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 14px rgba(79,70,229,0.25)", transition: "background 0.2s, transform 0.2s", boxSizing: "border-box" }}
                    onMouseOver={e => { e.currentTarget.style.background = "#4338ca"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseOut={e => { e.currentTarget.style.background = "#4f46e5"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <Video size={16} /> Join {cls.platform}
                  </a>
                ) : (
                  <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", background: "#f8fafc", color: "#94a3b8", borderRadius: 12, fontWeight: 700, fontSize: 14, border: "1px solid #f1f5f9", boxSizing: "border-box" }}>
                    <CheckCircle size={16} /> {cls.status}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 16, background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ width: 80, height: 80, background: "#eef2ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#a5b4fc" }}>
            <Video size={40} />
          </div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            No Live Classes Scheduled
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
            Your upcoming live sessions will appear here.
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}