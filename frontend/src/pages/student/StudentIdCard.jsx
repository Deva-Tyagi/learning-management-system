import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import { Fingerprint, Download, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

export default function StudentIdCardSection({ studentData }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const width = useWindowWidth();
  const isMobile = width < 640;

  useEffect(() => {
    if (studentData) {
      const studentId = studentData._id || studentData.id;
      QRCode.toDataURL(studentId, { width: 150, margin: 1 }, (err, url) => {
        if (!err) setQrUrl(url);
      });
    }
  }, [studentData]);

  useEffect(() => {
    if (!studentData) return;
    const fetchCard = async () => {
      const token = localStorage.getItem('studentToken');
      const studentId = studentData._id || studentData.id;
      try {
        let res = await fetch(`${API_BASE_URL}/id-cards/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        let list = await res.json();

        if (!Array.isArray(list) || list.length === 0) {
          res = await fetch(`${API_BASE_URL}/id-cards/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          list = await res.json();
        }

        const myCard = Array.isArray(list)
          ? list.find(card =>
              card.studentId &&
              String(card.studentId._id || card.studentId) === String(studentId) &&
              card.status === 'active'
            )
          : null;
        setCard(myCard || null);
      } catch {
        toast.error('Failed to load ID card');
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [studentData]);

  const handleDownload = async () => {
    if (!card) return;

    if (card.template && typeof card.template === 'object') {
      setDownloading(true);
      try {
        const element = document.getElementById('digital-id-card-view');
        await new Promise(r => setTimeout(r, 300));
        const canvas = await html2canvas(element, { scale: 3, useCORS: true, allowTaint: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: card.template.orientation || 'portrait',
          unit: 'px',
          format: [element.offsetWidth, element.offsetHeight]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, element.offsetWidth, element.offsetHeight);
        pdf.save(`IDCard-${studentData.name.replace(/\s/g, '')}.pdf`);
        toast.success('ID Card Downloaded');
      } catch (error) {
        console.error(error);
        toast.error('PDF Generation Failed');
      } finally {
        setDownloading(false);
      }
      return;
    }

    // Legacy Backend PDF
    setDownloading(true);
    const token = localStorage.getItem('studentToken');
    try {
      const res = await fetch(`${API_BASE_URL}/id-cards/${card._id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('PDF Generation Protocol Failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IDCard-${studentData.name.replace(/\s/g, '')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('ID Card Downloaded');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDownloading(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "4px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>
          Loading ID Card...
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b", padding: "0 4px" }}>
        My ID Card
      </h2>

      {/* ── Card Not Issued ── */}
      {!card ? (
        <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: isMobile ? 24 : 32, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, background: "#f8fafc", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1" }}>
            <Fingerprint size={24} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Card Not Issued</h3>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 500, color: "#64748b", maxWidth: 280 }}>
              Your digital ID card hasn't been generated yet. Please contact the administrative office.
            </p>
          </div>
        </div>

      /* ── Template-based ID Card ── */
      ) : card.template && typeof card.template === 'object' ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>

          {/* ID Card visual — scales down on mobile */}
          <div style={{ width: "100%", display: "flex", justifyContent: "center", overflowX: "auto" }}>
            <div
              id="digital-id-card-view"
              style={{
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                width: card.template.orientation === 'portrait' ? '350px' : '450px',
                height: card.template.orientation === 'portrait' ? '466px' : '337px',
                backgroundImage: card.template.backgroundImage
                  ? `url(${card.template.backgroundImage.startsWith('http')
                      ? card.template.backgroundImage
                      : `${API_BASE_URL.replace('/api', '')}${card.template.backgroundImage}`})`
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#ffffff',
                // Scale down smoothly on small screens
                transform: isMobile
                  ? `scale(${Math.min(1, (width - 32) / (card.template.orientation === 'portrait' ? 350 : 450))})`
                  : 'scale(1)',
                transformOrigin: 'top center',
              }}
            >
              {card.template.elements?.map(el => {
                let content = '';
                const stu = card.studentId || studentData;
                switch (el.token) {
                  case 'student_name': content = stu.name; break;
                   case 'student_photo':
                    content = stu.photo
                      ? <img src={stu.photo.startsWith('http') ? stu.photo : `${API_BASE_URL.replace('/api', '')}${stu.photo}`} crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }} alt="Student" />
                      : <div style={{ width: "100%", height: "100%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#94a3b8", fontWeight: 700, border: "2px solid #fff", borderRadius: 8 }}>PHOTO</div>;
                    break;
                  case 'guardian_name': content = stu.guardianName || stu.fatherName || 'N/A'; break;
                  case 'roll_no': content = stu.rollNumber; break;
                  case 'registration_no': content = stu.registrationNo || stu.rollNumber; break;
                  case 'course': content = stu.course; break;
                  case 'phone_no': content = stu.phone; break;
                  case 'batch': content = stu.batch; break;
                  case 'qr_code':
                    content = qrUrl
                      ? <img src={qrUrl} crossOrigin="anonymous" style={{ width: "100%", height: "100%", mixBlendMode: "multiply" }} alt="QR Code" />
                      : 'QR CODE';
                    break;
                  case 'date_of_birth': content = stu.dob ? new Date(stu.dob).toLocaleDateString() : 'N/A'; break;
                  default: content = stu[el.token] || '';
                }

                if (!content) content = '-';
                const isImageToken = el.token === 'student_photo' || el.token === 'qr_code';

                return (
                  <div
                    key={el.id}
                    style={{
                      position: 'absolute',
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      color: card.template.fontColor,
                      fontSize: isImageToken ? '12px' : `${card.template.fontSize}px`,
                      fontFamily: card.template.fontFamily,
                      fontWeight: 'bold',
                      width: isImageToken ? (el.token === 'qr_code' ? '70px' : '85px') : 'auto',
                      height: isImageToken ? (el.token === 'qr_code' ? '70px' : '100px') : 'auto',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isImageToken ? (
                      content
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {el.label && el.token !== 'student_name' && (
                          <span style={{ opacity: 0.8, fontWeight: 'normal' }}>{el.label}:</span>
                        )}
                        <span>{content}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Adjust container height on mobile to account for scaled card */}
          {isMobile && (
            <div style={{
              height: Math.max(0,
                (card.template.orientation === 'portrait' ? 466 : 337) *
                Math.min(1, (width - 32) / (card.template.orientation === 'portrait' ? 350 : 450)) - 
                (card.template.orientation === 'portrait' ? 466 : 337)
              )
            }} />
          )}

          {/* Download button */}
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#0f172a", color: "#fff", border: "none",
                padding: isMobile ? "12px 24px" : "14px 32px",
                borderRadius: 12, fontWeight: 700, fontSize: 13,
                textTransform: "uppercase", letterSpacing: "0.08em",
                cursor: downloading ? "not-allowed" : "pointer",
                opacity: downloading ? 0.5 : 1,
                boxShadow: "0 8px 24px rgba(15,23,42,0.2)",
                transition: "background 0.2s",
                width: isMobile ? "100%" : "auto",
                justifyContent: "center",
              }}
              onMouseOver={e => { if (!downloading) e.currentTarget.style.background = "#000"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#0f172a"; }}
            >
              {downloading
                ? <div style={{ width: 18, height: 18, border: "3px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                : <Download size={18} />
              }
              Download Digital ID
            </button>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Pixel Perfect Quality
            </p>
          </div>
        </div>

      /* ── Legacy card fallback ── */
      ) : (
        <div style={{ padding: isMobile ? "48px 24px" : "80px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 64, height: 64, background: "#fff1f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#f43f5e" }}>
            <ShieldCheck size={32} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1e293b" }}>Legacy Card Detected</h3>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", maxWidth: 320 }}>
              Please contact administration to issue a new digital identity card using the updated template system.
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}