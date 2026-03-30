import { useState, useEffect } from "react";
import { StickyNote, Download } from "lucide-react";
import API_BASE_URL from "../../lib/utils";
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

export default function StudentNotesSection() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) return;
    fetchNotes(token);
  }, []);

  const fetchNotes = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notes/get-for-student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setNotes(await response.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (noteId, fileName) => {
  try {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/notes/download/${noteId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`.trim(),   // ← trim any extra spaces
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Download failed:", res.status, errorText);
      throw new Error(`Server returned ${res.status}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "note.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Download started");
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to download note");
  }
};

  if (loading) {
    return (
      <div style={{ height: 256, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "4px solid #4f46e5", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>
          Loading your notes...
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1e293b" }}>
        Study Notes
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr",
          gap: 20,
        }}
      >
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note._id}
              style={{
                border: "1px solid #f1f5f9",
                padding: isMobile ? 16 : 20,
                borderRadius: 14,
                background: "#fff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <StickyNote size={20} color="#818cf8" />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    color: "#cbd5e1",
                    background: "#f8fafc",
                    padding: "4px 10px",
                    borderRadius: 999,
                  }}
                >
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h4 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 900, color: "#1e293b" }}>
                {note.title}
              </h4>

              <p
                style={{
                  margin: "0 0 20px",
                  fontSize: 12,
                  color: "#94a3b8",
                  lineHeight: 1.6,
                  flex: 1,
                  fontStyle: "italic",
                }}
              >
                Resource: {note.fileName}
              </p>

              {note.fileUrl && (
                <button
                  onClick={() => handleDownload(note._id, note.fileName)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#4f46e5",
                    fontWeight: 700,
                    fontSize: 13,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <Download size={16} /> Get Resource
                </button>
              )}
            </div>
          ))
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "48px 24px",
              textAlign: "center",
              background: "rgba(248,250,252,0.5)",
              borderRadius: 14,
            }}
          >
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#cbd5e1" }}>
              No study notes shared yet
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}