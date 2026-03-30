import { useState, useEffect, useRef } from "react";
import API_BASE_URL from "../../lib/utils";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  Calendar,
  Users,
  QrCode,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

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

export default function ScanAttendance({ token }) {
  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedStudents, setScannedStudents] = useState([]);
  const scannerRef = useRef(null);

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchSelectData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/students/get`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const uniqueBatches = [
            ...new Set(data.map((student) => student.batch)),
          ].filter(Boolean);
          const uniqueCourses = [
            ...new Set(data.map((student) => student.course)),
          ].filter(Boolean);
          setBatches(uniqueBatches);
          setCourses(uniqueCourses);
        }
      } catch (error) {
        toast.error("Failed to load batch data");
      } finally {
        setLoading(false);
      }
    };
    fetchSelectData();
  }, [token]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    if (!selectedCourse && !selectedBatch) {
      return toast.error("Please select a course or batch first");
    }

    setScanning(true);

    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const cameraId = devices.length > 1 ? devices[1].id : devices[0].id;

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          },
          async (decodedText) => {
            if (scannerRef.current?.getState() === 2) {
              scannerRef.current.pause();
              await stopScanner();
              await handleScan(decodedText);
            }
          },
          (error) => {}
        );
      } else {
        toast.error("No camera found on this device.");
        setScanning(false);
      }
    } catch (err) {
      console.error("Camera start error:", err);
      toast.error("Please grant camera permissions in your browser.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScan = async (studentId) => {
    try {
      if (scannedStudents.some((s) => s.id === studentId)) {
        toast.info("Student already scanned today");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/attendance/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId,
          date: selectedDate,
          course: selectedCourse || selectedBatch,
        }),
      });

      const data = await res.json();

      if (res.ok || res.status === 200 || res.status === 201) {
        toast.success(`${data.studentName} marked Present`);

        setScannedStudents((prev) => [
          {
            id: studentId,
            name: data.studentName,
            rollNumber: data.rollNumber,
            photo: data.photo,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...prev,
        ]);

        const audio = new Audio(
          "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
        );
        audio.volume = 0.2;
        audio.play().catch(() => {});
      } else {
        toast.error(data.msg || "Invalid QR Code");
      }
    } catch (error) {
      toast.error("Network error while scanning");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 24 : isTablet ? 32 : 40,
        paddingBottom: isMobile ? 60 : isTablet ? 80 : 100,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          padding: isMobile ? 24 : isTablet ? 32 : 40,
          marginTop: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: isMobile ? 32 : 40,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 20 : 0,
          }}
        >
          <div style={{ textAlign: isMobile ? "center" : "left" }}>
            <h1
              style={{
                fontSize: isMobile ? 28 : isTablet ? 32 : 36,
                fontWeight: 700,
                color: "#1e293b",
                textTransform: "uppercase",
                letterSpacing: "-0.025em",
                marginBottom: 4,
              }}
            >
              QR Attendance Scanner
            </h1>
            <p
              style={{
                fontSize: isMobile ? 14 : isTablet ? 15 : 16,
                color: "#64748b",
              }}
            >
              Scan student ID cards to instantly mark them present
            </p>
          </div>

          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "#f0f9ff",
                  color: "#7c3aed",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <QrCode size={20} />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#64748b",
                }}
              >
                Scanner Ready
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "7fr 5fr",
            gap: isMobile ? 32 : isTablet ? 40 : 48,
          }}
        >
          {/* Left column: Setup + Scanner */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                background: "#f8fafc",
                padding: isMobile ? 24 : 32,
                borderRadius: 16,
                border: "1px solid #f1f5f9",
              }}
            >
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1e293b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 16,
                  paddingBottom: 8,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                Session Settings
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      paddingBottom: 4,
                    }}
                  >
                    Date
                  </label>
                  <div style={{ position: "relative" }}>
                    <Calendar
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#cbd5e1",
                      }}
                      size={18}
                    />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      disabled={scanning}
                      style={{
                        width: "100%",
                        height: 44,
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        paddingLeft: 44,
                        paddingRight: 16,
                        fontSize: 14,
                        fontWeight: 500,
                        outline: "none",
                        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      paddingBottom: 4,
                    }}
                  >
                    Select Course
                  </label>
                  <div style={{ position: "relative" }}>
                    <BookOpen
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#cbd5e1",
                      }}
                      size={18}
                    />
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      disabled={scanning}
                      style={{
                        width: "100%",
                        height: 44,
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        paddingLeft: 44,
                        paddingRight: 16,
                        fontSize: 14,
                        fontWeight: 500,
                        outline: "none",
                        appearance: "none",
                        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      <option value="">Choose Course</option>
                      {courses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {!scanning ? (
                <button
                  onClick={startScanner}
                  style={{
                    width: "100%",
                    height: 48,
                    background: "#7c3aed",
                    color: "white",
                    borderRadius: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 10px 15px -3px rgba(124,58,237,0.2)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Camera size={18} />
                  Start Camera Scanner
                </button>
              ) : (
                <button
                  onClick={stopScanner}
                  style={{
                    width: "100%",
                    height: 48,
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    borderRadius: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <XCircle size={18} />
                  Stop Scanner
                </button>
              )}
            </div>

            <div
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 16,
                border: scanning ? "2px solid #7c3aed" : "2px solid #f1f5f9",
                boxShadow: scanning ? "0 0 0 4px rgba(124,58,237,0.1)" : "none",
                background: scanning ? "transparent" : "#f8fafc",
                transition: "all 0.3s",
              }}
            >
              {!scanning && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    padding: 24,
                    textAlign: "center",
                    background: "#f8fafc",
                    zIndex: 10,
                  }}
                >
                  <QrCode size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                  <h3 style={{ fontWeight: 700, color: "#475569" }}>
                    Camera Offline
                  </h3>
                  <p style={{ fontSize: 14, marginTop: 4 }}>
                    Configure session settings and click Start Camera to begin
                    scanning student QR cards.
                  </p>
                </div>
              )}

              <div id="reader" style={{ width: "100%", minHeight: 300 }} />
            </div>
          </div>

          {/* Right column: Scan Log */}
          <div>
            <div
              style={{
                background: "white",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                height: "100%",
                maxHeight: 600,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  padding: 20,
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f8fafc",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1e293b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CheckCircle size={16} style={{ color: "#10b981" }} />
                  Scanned Today
                </h3>
                <span
                  style={{
                    background: "#e2e8f0",
                    color: "#475569",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 8px",
                    borderRadius: 6,
                  }}
                >
                  {scannedStudents.length} Total
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {scannedStudents.length === 0 ? (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                      gap: 12,
                      padding: 40,
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <Users size={24} style={{ color: "#cbd5e1" }} />
                    </div>
                    <p style={{ fontSize: 14 }}>No students scanned yet</p>
                  </div>
                ) : (
                  scannedStudents.map((student, idx) => (
                    <div
                      key={student.id + idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 12,
                        borderRadius: 12,
                        border: "1px solid #d1fae5",
                        background: "rgba(209,250,229,0.3)",
                        animation: "slideIn 0.3s ease-out",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: "#d1fae5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#065f46",
                            overflow: "hidden",
                            border: "1px solid #a7f3d0",
                          }}
                        >
                          {student.photo ? (
                            <img
                              src={student.photo.startsWith("http") ? student.photo : `${API_BASE_URL.replace("/api", "")}${student.photo}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              alt=""
                            />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4
                            style={{
                              fontWeight: 700,
                              color: "#1e293b",
                              fontSize: 14,
                              lineHeight: 1.2,
                            }}
                          >
                            {student.name}
                          </h4>
                          <span
                            style={{
                              fontSize: 12,
                              fontFamily: "monospace",
                              color: "#64748b",
                            }}
                          >
                            #{student.rollNumber || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#10b981",
                            background: "#d1fae5",
                            padding: "4px 8px",
                            borderRadius: 6,
                            display: "inline-block",
                            marginBottom: 4,
                          }}
                        >
                          Present
                        </span>
                        <p
                          style={{
                            fontSize: 10,
                            color: "#64748b",
                            fontWeight: 500,
                          }}
                        >
                          {student.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}