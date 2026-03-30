import { useState, useEffect } from "react";
import API_BASE_URL from "../../lib/utils";
import { Eye, Clock, Award, CheckCircle2, XCircle, ChevronRight, FileSearch } from "lucide-react";

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

export default function StudentResultsSection() {
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) return;
    fetchResults(token);
  }, []);

  const fetchResults = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/student-exams/my-results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setExamResults(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (resultId) => {
    const token = localStorage.getItem("studentToken");
    setFetchingDetail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/student-exams/result/${resultId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setSelectedResult(await response.json());
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetchingDetail(false);
    }
  };

  if (loading) return (
    <div style={{ height: 256, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: "4px solid #4f46e5", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>
        Loading your results...
      </p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: isMobile ? 20 : 24, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" }}>
          Academic Performance
        </h2>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>
          Detailed assessment history and statistics
        </p>
      </div>

      {/* ── Results Table (desktop) / Cards (mobile) ── */}
      {isMobile ? (
        /* ── MOBILE: Card layout ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {examResults.length > 0 ? examResults.map(res => (
            <div key={res._id} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: res.isPassed ? "#f0fdf4" : "#fff1f2", color: res.isPassed ? "#16a34a" : "#e11d48" }}>
                  <Award size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 900, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {res.examId?.title || "Exam"}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Clock size={10} color="#94a3b8" />
                    <span style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {res.submitTime ? new Date(res.submitTime).toLocaleDateString() : "No Date"}
                    </span>
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", background: res.isPassed ? "#10b981" : "#f43f5e", color: "#fff", flexShrink: 0 }}>
                  {res.isPassed ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                  {res.isPassed ? "PASSED" : "FAILED"}
                </span>
              </div>

              {/* Score + Action */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#f8fafc", borderRadius: 10 }}>
                  <span style={{ fontSize: 17, fontWeight: 900, color: "#1e293b" }}>{res.marksObtained}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>/ {res.totalMarks}</span>
                  <div style={{ width: 1, height: 12, background: "#e2e8f0" }} />
                  <span style={{ fontSize: 10, fontWeight: 900, color: res.isPassed ? "#16a34a" : "#e11d48" }}>{res.percentage}%</span>
                </div>
                <button
                  onClick={() => viewDetails(res._id)}
                  disabled={fetchingDetail}
                  style={{ width: 38, height: 38, background: "#eef2ff", color: "#4f46e5", border: "none", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseOver={e => { e.currentTarget.style.background = "#4f46e5"; e.currentTarget.style.color = "#fff"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.color = "#4f46e5"; }}
                >
                  {fetchingDetail
                    ? <div style={{ width: 18, height: 18, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    : <Eye size={18} />
                  }
                </button>
              </div>
            </div>
          )) : (
            <div style={{ padding: "60px 24px", textAlign: "center", background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16 }}>
              <FileSearch size={40} color="#e2e8f0" style={{ margin: "0 auto 12px" }} />
              <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                No examination records found
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ── TABLET / DESKTOP: Table layout ── */
        <div style={{ overflow: "hidden", border: "1px solid #f1f5f9", borderRadius: 24, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead style={{ background: "rgba(248,250,252,0.5)", borderBottom: "1px solid #f1f5f9" }}>
                <tr>
                  {["Exam Details", "Score Matrix", "Status", "Action"].map((h, i) => (
                    <th key={h} style={{ padding: "18px 28px", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", textAlign: i === 1 ? "center" : i === 2 ? "center" : i === 3 ? "right" : "left" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {examResults.length > 0 ? examResults.map(res => (
                  <tr key={res._id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.2s" }}
                    onMouseOver={e => e.currentTarget.style.background = "rgba(248,250,252,0.5)"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Exam Details */}
                    <td style={{ padding: "20px 28px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: res.isPassed ? "#f0fdf4" : "#fff1f2", color: res.isPassed ? "#16a34a" : "#e11d48" }}>
                          <Award size={22} />
                        </div>
                        <div>
                          <span style={{ display: "block", fontWeight: 900, color: "#1e293b", fontSize: 16, lineHeight: 1.2 }}>
                            {res.examId?.title || "Exam"}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                            <Clock size={10} color="#94a3b8" />
                            <span style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                              {res.submitTime ? new Date(res.submitTime).toLocaleDateString() : "No Date"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Score */}
                    <td style={{ padding: "20px 28px", textAlign: "center" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#f8fafc", borderRadius: 12 }}>
                        <span style={{ fontSize: 17, fontWeight: 900, color: "#1e293b" }}>{res.marksObtained}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>/ {res.totalMarks}</span>
                        <div style={{ width: 1, height: 12, background: "#e2e8f0", margin: "0 4px" }} />
                        <span style={{ fontSize: 10, fontWeight: 900, color: res.isPassed ? "#16a34a" : "#e11d48" }}>{res.percentage}%</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "20px 28px", textAlign: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 999, fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", color: "#fff", background: res.isPassed ? "#10b981" : "#f43f5e", boxShadow: res.isPassed ? "0 4px 12px rgba(16,185,129,0.25)" : "0 4px 12px rgba(244,63,94,0.25)" }}>
                        {res.isPassed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {res.isPassed ? "PASSED" : "FAILED"}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: "20px 28px", textAlign: "right" }}>
                      <button
                        onClick={() => viewDetails(res._id)}
                        disabled={fetchingDetail}
                        style={{ width: 40, height: 40, background: "#eef2ff", color: "#4f46e5", border: "none", borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseOver={e => { e.currentTarget.style.background = "#4f46e5"; e.currentTarget.style.color = "#fff"; }}
                        onMouseOut={e => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.color = "#4f46e5"; }}
                      >
                        {fetchingDetail
                          ? <div style={{ width: 18, height: 18, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                          : <Eye size={18} />
                        }
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{ padding: "60px 28px", textAlign: "center" }}>
                      <FileSearch size={44} color="#e2e8f0" style={{ margin: "0 auto 12px" }} />
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        No examination records found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── RESULT DETAIL MODAL ── */}
      {isModalOpen && selectedResult && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 12 : 24 }}>
          {/* Backdrop */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }} onClick={() => setIsModalOpen(false)} />

          {/* Modal panel */}
          <div style={{ position: "relative", width: "100%", maxWidth: 900, maxHeight: "90vh", background: "#fff", borderRadius: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Modal Header */}
            <div style={{ padding: isMobile ? "18px 20px" : "22px 32px", background: "#0f172a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: isMobile ? 16 : 19, fontWeight: 900, letterSpacing: "-0.01em" }}>
                  {selectedResult.exam?.title}
                </h3>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Detailed Assessment Analysis
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ width: 40, height: 40, background: "#1e293b", border: "none", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "background 0.2s" }}
                onMouseOver={e => e.currentTarget.style.background = "#334155"}
                onMouseOut={e => e.currentTarget.style.background = "#1e293b"}
              >
                <ChevronRight size={20} style={{ transform: "rotate(90deg)" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : 32, display: "flex", flexDirection: "column", gap: 28 }}>

              {/* Summary stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Total Score", val: selectedResult.marksObtained,  sub: `out of ${selectedResult.totalMarks}`, color: "#2563eb" },
                  { label: "Percentage",  val: `${selectedResult.percentage}%`, sub: "Overall Avg",     color: "#4f46e5" },
                  { label: "Accuracy",    val: `${selectedResult.detailedAnswers.filter(a => a.isCorrect).length}/${selectedResult.detailedAnswers.length}`, sub: "Correct Answers", color: "#10b981" },
                  { label: "Result",      val: selectedResult.isPassed ? "PASSED" : "FAILED", sub: "Status Flag", color: selectedResult.isPassed ? "#10b981" : "#f43f5e" },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: 16, background: "#f8fafc", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                    <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</p>
                    <p style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.val}</p>
                    <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Question breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
                  <FileSearch size={13} /> Question Breakdown
                </h4>

                {selectedResult.detailedAnswers.map((ans, idx) => (
                  <div key={idx} style={{ padding: isMobile ? 14 : 22, background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "border-color 0.2s" }}
                    onMouseOver={e => e.currentTarget.style.borderColor = "#e0e7ff"}
                    onMouseOut={e => e.currentTarget.style.borderColor = "#f1f5f9"}
                  >
                    {/* Question header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
                        <span style={{ width: 30, height: 30, borderRadius: 10, background: "#0f172a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, flexShrink: 0 }}>
                          {idx + 1}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <p style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: 13, lineHeight: 1.5 }}>{ans.questionText}</p>
                          <span style={{ display: "inline-block", padding: "2px 8px", background: "#f1f5f9", color: "#64748b", borderRadius: 4, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", width: "fit-content" }}>
                            {ans.type}
                          </span>
                        </div>
                      </div>
                      <span style={{ flexShrink: 0, padding: "4px 12px", borderRadius: 8, fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", background: ans.isCorrect ? "#f0fdf4" : "#fff1f2", color: ans.isCorrect ? "#16a34a" : "#e11d48" }}>
                        {ans.isCorrect ? "CORRECT" : "INCORRECT"}
                      </span>
                    </div>

                    {/* MCQ options */}
                    {ans.type === "mcq" && ans.options && (
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8, paddingLeft: isMobile ? 0 : 42 }}>
                        {ans.options.map((opt, i) => {
                          const isUserAnswer    = i.toString() === ans.answer;
                          const isCorrectAnswer = i.toString() === ans.correctAnswer;
                          const optStyle =
                            isCorrectAnswer                    ? { border: "2px solid #10b981", background: "#f0fdf4", color: "#065f46" } :
                            isUserAnswer && !isCorrectAnswer   ? { border: "2px solid #f43f5e", background: "#fff1f2", color: "#9f1239" } :
                                                                 { border: "2px solid #f1f5f9", background: "#fff",    color: "#475569" };
                          return (
                            <div key={i} style={{ padding: "10px 14px", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, ...optStyle }}>
                              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>{opt}</p>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                {isUserAnswer && !isCorrectAnswer && <span style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", color: "#f43f5e" }}>Your Ans</span>}
                                {isCorrectAnswer && <span style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", color: "#10b981" }}>Correct</span>}
                                {isCorrectAnswer && <CheckCircle2 size={12} color="#10b981" />}
                                {isUserAnswer && !isCorrectAnswer && <XCircle size={12} color="#f43f5e" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Non-MCQ wrong answer */}
                    {!ans.isCorrect && ans.type !== "mcq" && (
                      <div style={{ marginLeft: isMobile ? 0 : 42, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12 }}>
                        <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 900, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.08em" }}>Correct Answer</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#065f46", fontWeight: 500 }}>{ans.correctAnswer}</p>
                      </div>
                    )}

                    {/* Skipped */}
                    {ans.answer === "" && (
                      <div style={{ marginLeft: isMobile ? 0 : 42, padding: "10px 14px", background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 12, fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                        Question skipped by student.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: isMobile ? "14px 16px" : "16px 32px", borderTop: "1px solid #f1f5f9", background: "rgba(248,250,252,0.5)", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ padding: isMobile ? "12px 24px" : "12px 32px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 16, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", transition: "background 0.2s", width: isMobile ? "100%" : "auto" }}
                onMouseOver={e => e.currentTarget.style.background = "#000"}
                onMouseOut={e => e.currentTarget.style.background = "#0f172a"}
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}