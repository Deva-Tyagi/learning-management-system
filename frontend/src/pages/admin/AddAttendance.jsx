import { useState, useEffect } from "react";
import API_BASE_URL from "../../lib/utils";
import {
  Calendar, Users, CheckCircle, XCircle,
  Loader2, Save, Filter, ClipboardCheck,
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

export default function AddAttendance({ token }) {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  useEffect(() => {
    const fetchBatches = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/batches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setBatches(data);
        }
      } catch { toast.error("Failed to load batches"); }
      finally { setLoading(false); }
    };
    fetchBatches();
  }, [token]);

  const handleLoadStudents = async () => {
    if (!selectedBatch || !selectedDate) return toast.error("Please select batch and date");
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/students/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const batchStudents = data.filter(s => s.batch === selectedBatch);
        setStudents(batchStudents);
        const initial = {};
        batchStudents.forEach(s => (initial[s._id] = "Present"));
        setAttendance(initial);
      }
    } catch { toast.error("Failed to load students"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!token) return;
    try {
      setSubmitting(true);
      const records = students.map(s => ({
        studentId: s._id,
        date: selectedDate,
        status: attendance[s._id],
        course: s.course,
      }));
      const results = await Promise.all(
        records.map(r =>
          fetch(`${API_BASE_URL}/attendance/mark`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(r),
          })
        )
      );
      if (results.every(r => r.ok)) {
        toast.success("Attendance marked successfully");
        setStudents([]);
        setSelectedBatch("");
      } else {
        toast.error("Some attendance records failed to save");
      }
    } catch { toast.error("Error saving attendance"); }
    finally { setSubmitting(false); }
  };

  /* ── Style tokens ── */
  const inp = {
    width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 12, padding: "10px 14px 10px 40px", fontSize: 13,
    fontWeight: 500, color: "#334155", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", height: 46,
  };
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 600, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
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
          gap: 12, marginBottom: 24,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
              Mark Attendance
            </h1>
            <p style={{ margin: "5px 0 0", fontSize: 13, color: "#94a3b8" }}>
              Select batch and date to record student presence
            </p>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, background: "#ecfdf5", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ClipboardCheck size={20} color="#059669" />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>
                Registry Active
              </span>
            </div>
          )}
        </div>

        {/* ── FILTER BAR ── */}
        <div style={{
          background: "#f8fafc", border: "1px solid #f1f5f9",
          borderRadius: 16, padding: isMobile ? 14 : 22, marginBottom: 24,
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : isDesktop ? "1fr 1fr auto" : "1fr 1fr",
            gap: isMobile ? 14 : 16,
            alignItems: "end",
          }}>

            {/* Batch selector */}
            <div>
              <label style={lbl}>Select Batch</label>
              <div style={{ position: "relative" }}>
                <Users size={16} color="#cbd5e1" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={inp}>
                  <option value="">Choose Batch</option>
                  {batches.map(b => (
                    <option key={b._id} value={b.name}>
                      {b.name} ({b.startTime} - {b.endTime})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date picker */}
            <div>
              <label style={lbl}>Attendance Date</label>
              <div style={{ position: "relative" }}>
                <Calendar size={16} color="#cbd5e1" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={inp} />
              </div>
            </div>

            {/* Load button */}
            <button
              onClick={handleLoadStudents}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "#0f172a", color: "#fff", border: "none", borderRadius: 12,
                height: 46, padding: "0 24px", fontSize: 12, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer",
                opacity: loading ? 0.6 : 1, boxShadow: "0 4px 14px rgba(15,23,42,0.18)",
                width: isMobile || !isDesktop ? "100%" : "auto",
              }}
            >
              {loading
                ? <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} />
                : <Filter size={17} />}
              Find Students
            </button>
          </div>
        </div>

        {/* ── STUDENT LIST ── */}
        {students.length > 0 && (
          <div>
            {/* Mobile card layout */}
            {isMobile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {students.map(s => (
                  <div key={s._id} style={{
                    border: "1px solid #f1f5f9", borderRadius: 14,
                    padding: "14px 14px", background: "#fafafa",
                    display: "flex", flexDirection: "column", gap: 12,
                  }}>
                    {/* Student info row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, background: "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "#64748b", overflow: "hidden", flexShrink: 0,
                      }}>
                        {s.photo
                          ? <img src={`${API_BASE_URL.replace("/api", "")}${s.photo}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : s.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</p>
                        <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>#{s.rollNumber || "N/A"}</p>
                      </div>
                    </div>
                    {/* Present / Absent toggle */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {["Present", "Absent"].map(status => {
                        const isSelected = attendance[s._id] === status;
                        const isPresent = status === "Present";
                        return (
                          <label key={status}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                              padding: "10px 0", borderRadius: 10, cursor: "pointer", border: "1px solid",
                              fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em",
                              background: isSelected ? (isPresent ? "#ecfdf5" : "#fff1f2") : "#fff",
                              color: isSelected ? (isPresent ? "#059669" : "#e11d48") : "#cbd5e1",
                              borderColor: isSelected ? (isPresent ? "#a7f3d0" : "#fecdd3") : "#f1f5f9",
                              transition: "all 0.15s",
                            }}>
                            <input type="radio" style={{ display: "none" }}
                              checked={attendance[s._id] === status}
                              onChange={() => setAttendance({ ...attendance, [s._id]: status })} />
                            {isPresent ? <CheckCircle size={13} /> : <XCircle size={13} />}
                            {status}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Tablet / Desktop table */
              <div style={{ border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                    <tr>
                      {["Student Name", "Roll Number", "Status"].map((h, i) => (
                        <th key={i} style={{
                          padding: "13px 22px", fontSize: 11, fontWeight: 700, color: "#64748b",
                          textTransform: "uppercase", letterSpacing: "0.06em",
                          textAlign: i === 2 ? "center" : "left",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s._id} style={{ borderBottom: "1px solid #f8fafc" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(248,250,252,0.6)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                        {/* Name */}
                        <td style={{ padding: "13px 22px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 9, background: "#f1f5f9",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, fontWeight: 700, color: "#64748b", overflow: "hidden", flexShrink: 0,
                            }}>
                              {s.photo
                                ? <img src={`${API_BASE_URL.replace("/api", "")}${s.photo}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : s.name.charAt(0)}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{s.name}</span>
                          </div>
                        </td>

                        {/* Roll number */}
                        <td style={{ padding: "13px 22px" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>
                            #{s.rollNumber || "N/A"}
                          </span>
                        </td>

                        {/* Present / Absent */}
                        <td style={{ padding: "13px 22px" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                            {["Present", "Absent"].map(status => {
                              const isSelected = attendance[s._id] === status;
                              const isPresent = status === "Present";
                              return (
                                <label key={status}
                                  style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    padding: "6px 14px", borderRadius: 9, cursor: "pointer", border: "1px solid",
                                    fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em",
                                    background: isSelected ? (isPresent ? "#ecfdf5" : "#fff1f2") : "#fff",
                                    color: isSelected ? (isPresent ? "#059669" : "#e11d48") : "#cbd5e1",
                                    borderColor: isSelected ? (isPresent ? "#a7f3d0" : "#fecdd3") : "#f1f5f9",
                                    transition: "all 0.15s",
                                  }}>
                                  <input type="radio" style={{ display: "none" }}
                                    checked={attendance[s._id] === status}
                                    onChange={() => setAttendance({ ...attendance, [s._id]: status })} />
                                  {isPresent ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                  {status}
                                </label>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Save button */}
            <div style={{
              display: "flex", justifyContent: "flex-end",
              paddingTop: 16, borderTop: "1px solid #f1f5f9",
            }}>
              <button onClick={handleSubmit} disabled={submitting}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "#059669", color: "#fff", border: "none", borderRadius: 12,
                  padding: "12px 32px", fontSize: 12, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer",
                  opacity: submitting ? 0.6 : 1, boxShadow: "0 4px 14px rgba(5,150,105,0.2)",
                  width: isMobile ? "100%" : "auto",
                }}>
                {submitting
                  ? <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} />
                  : <Save size={17} />}
                Save Attendance
              </button>
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!students.length && !loading && (
          <div style={{ padding: "64px 24px", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, background: "#f8fafc", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Users size={30} color="#cbd5e1" />
            </div>
            <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Awaiting Selection
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#94a3b8" }}>
              Select a batch from the filters above to load the student list
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}