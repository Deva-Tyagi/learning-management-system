import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import Sidebar from "./Sidebar";
import ExamsSection from "./Exams";
import LiveClassesSection from "./LiveClasses";
import ResultsSection from "./Results";
import CertificatesSection from "./Certificates";
import StudentIdCardSection from "./StudentIdCard";
import FeesSection from "./Fees";
import NotesSection from "./Notes";

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

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [studentData, setStudentData] = useState(null);

  const width = useWindowWidth();
  const isDesktop = width >= 1024; // lg breakpoint

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    const student = localStorage.getItem("studentData");
    if (!token || !student) {
      navigate("/student/login");
      return;
    }
    setStudentData(JSON.parse(student));
  }, [navigate]);

  // Close drawer when resizing to desktop
  useEffect(() => {
    if (isDesktop) setShowMobileSidebar(false);
  }, [isDesktop]);

  const closeMobileSidebar = () => setShowMobileSidebar(false);

  const renderSection = () => {
    const props = { studentData };
    switch (activeSection) {
      case "dashboard":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Student Overview
            </h1>
            <div style={{
              display: "grid",
              gridTemplateColumns: width < 640 ? "1fr" : width < 1024 ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
              gap: 16,
            }}>
              {[
                { label: "Course", value: studentData?.course },
                { label: "Batch", value: studentData?.batch },
                { label: "Roll Number", value: studentData?.rollNumber },
                { label: "Registration", value: studentData?.registrationNo || "N/A" },
              ].map((item) => (
                <div key={item.label} style={{ padding: 24, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{item.value}</p>
                </div>
              ))}
            </div>
            <ExamsSection {...props} />
          </div>
        );
      case "exams":         return <ExamsSection {...props} />;
      case "live-classes":  return <LiveClassesSection {...props} />;
      case "results":       return <ResultsSection {...props} />;
      case "certificates":  return <CertificatesSection {...props} />;
      case "id-card":       return <StudentIdCardSection {...props} />;
      case "fees":          return <FeesSection {...props} />;
      case "notes":         return <NotesSection {...props} />;
      default:              return <ExamsSection {...props} />;
    }
  };

  if (!studentData)
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "sans-serif" }}>
        Loading Portal...
      </div>
    );

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8fafc", overflow: "hidden", fontFamily: "sans-serif" }}>

      {/* ── DESKTOP: Permanent sidebar (visible on lg+) ── */}
      {isDesktop && (
        <div style={{ width: 256, flexShrink: 0, borderRight: "1px solid #e2e8f0", overflowY: "auto" }}>
          <Sidebar
            activeSection={activeSection}
            setActiveSection={(section) => {
              setActiveSection(section);
            }}
            studentData={studentData}
          />
        </div>
      )}

      {/* ── MOBILE/TABLET: Drawer overlay (visible below lg) ── */}
      {!isDesktop && showMobileSidebar && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50 }}
          onClick={closeMobileSidebar}
        >
          {/* Backdrop */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />

          {/* Drawer panel */}
          <div
            style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: width < 640 ? 288 : 320, background: "#020617", overflowY: "auto", boxShadow: "4px 0 24px rgba(0,0,0,0.3)", transform: "translateX(0)", transition: "transform 0.3s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: 16, borderBottom: "1px solid #1e293b" }}>
              <button
                onClick={closeMobileSidebar}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}
                aria-label="Close sidebar"
              >
                <X size={26} />
              </button>
            </div>

            <Sidebar
              activeSection={activeSection}
              setActiveSection={(section) => {
                setActiveSection(section);
                closeMobileSidebar();
              }}
              studentData={studentData}
              mobile={true}
              onClose={closeMobileSidebar}
            />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Mobile/Tablet header with hamburger (only shown below lg) */}
        {!isDesktop && (
          <header style={{ position: "sticky", top: 0, zIndex: 40, background: "#fff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>Student Portal</span>
            <button
              onClick={() => setShowMobileSidebar(true)}
              style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}
              aria-label="Open sidebar"
            >
              <Menu size={26} />
            </button>
          </header>
        )}

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", padding: width < 640 ? 16 : width < 1024 ? 24 : 32 }}>
          <div style={{ maxWidth: 1700, margin: "0 auto", minHeight: "100%" }}>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}