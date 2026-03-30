import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import { Award, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

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

export default function StudentCertificates({ studentData }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [qrUrl, setQrUrl] = useState('');

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  // Grid columns: 1 on mobile, 2 on tablet, 3 on desktop
  const gridCols = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr";

  useEffect(() => {
    if (studentData) {
      const studentId = studentData._id || studentData.id;
      QRCode.toDataURL(studentId, { width: 150, margin: 1 }, (err, url) => {
        if (!err) setQrUrl(url);
      });
    }
  }, [studentData]);

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token || !studentData) return;
    const studentId = studentData.id || studentData._id;
    if (!studentId) return;

    fetch(`${API_BASE_URL}/certificates/student/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCertificates(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load certificates'))
      .finally(() => setLoading(false));
  }, [studentData]);

  const handleDownload = async (cert) => {
    if (cert.template && typeof cert.template === 'object') {
      setDownloading(cert._id);
      try {
        const element = document.getElementById(`cert-render-${cert._id}`);
        if (!element) throw new Error("Template element not rendered in DOM");
        await new Promise(r => setTimeout(r, 300));
        const canvas = await html2canvas(element, { scale: 3, useCORS: true, allowTaint: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: cert.template.orientation || 'landscape',
          unit: 'px',
          format: [element.offsetWidth, element.offsetHeight]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, element.offsetWidth, element.offsetHeight);
        pdf.save(`Certificate-${cert.certificateNumber || cert._id}.pdf`);
        toast.success('Certificate Downloaded successfully');
      } catch (error) {
        console.error(error);
        toast.error('PDF Generation Failed');
      } finally {
        setDownloading(null);
      }
      return;
    }

    // Legacy Backend Fallback
    const token = localStorage.getItem('studentToken');
    setDownloading(cert._id);
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/${cert._id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('PDF Generation Protocol Failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate-${cert.certificateNumber || cert._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate Manifest Downloaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "4px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>
          Loading Certificates...
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1e293b", padding: "0 4px" }}>
        My Certificates
      </h2>

      {/* ── Certificates Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 20 }}>
        {certificates.length > 0 ? (
          certificates.map(cert => (
            <div
              key={cert._id}
              style={{
                background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16,
                padding: isMobile ? 18 : 24, display: "flex", flexDirection: "column",
                transition: "border-color 0.2s",
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = "#e2e8f0"}
              onMouseOut={e => e.currentTarget.style.borderColor = "#f1f5f9"}
            >
              {/* Icon */}
              <div style={{ width: 48, height: 48, background: "#f8fafc", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", marginBottom: 16, flexShrink: 0 }}>
                <Award size={24} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1e293b", lineHeight: 1.3 }}>
                  {cert.title || 'Course Certificate'}
                </h3>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {cert.courseName}
                </p>
                <p style={{ margin: "8px 0 0", fontSize: 10, fontWeight: 700, color: "#64748b" }}>
                  Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                </p>
              </div>

              {/* Download button */}
              <button
                onClick={() => handleDownload(cert)}
                disabled={downloading === cert._id}
                style={{
                  marginTop: 20, width: "100%", padding: "10px 0",
                  background: "#f1f5f9", border: "none", borderRadius: 10,
                  fontWeight: 700, fontSize: 12, color: "#475569",
                  cursor: downloading === cert._id ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  opacity: downloading === cert._id ? 0.5 : 1,
                  transition: "background 0.2s",
                }}
                onMouseOver={e => { if (downloading !== cert._id) e.currentTarget.style.background = "#e2e8f0"; }}
                onMouseOut={e => { e.currentTarget.style.background = "#f1f5f9"; }}
              >
                {downloading === cert._id
                  ? <div style={{ width: 14, height: 14, border: "2px solid #94a3b8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  : <Download size={14} />
                }
                Download Certificate
              </button>
            </div>
          ))
        ) : (
          /* Empty state — spans all columns */
          <div style={{ gridColumn: "1 / -1", padding: "64px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 12 }}>
            <div style={{ width: 64, height: 64, background: "#f8fafc", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#e2e8f0" }}>
              <Award size={32} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em" }}>
                No certificates issued yet
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 500, color: "#cbd5e1" }}>
                Check back after completing your course.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Hidden render container for html2canvas ── */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
        {certificates.filter(c => c.template && typeof c.template === 'object').map(cert => (
          <div
            key={cert._id}
            id={`cert-render-${cert._id}`}
            style={{
              position: 'relative', overflow: 'hidden', background: '#fff',
              width: cert.template.orientation === 'portrait' ? '350px' : '550px',
              height: cert.template.orientation === 'portrait' ? '466px' : '400px',
              backgroundImage: cert.template.backgroundImage
                ? `url(${cert.template.backgroundImage.startsWith('http') ? cert.template.backgroundImage : `${API_BASE_URL.replace('/api', '')}${cert.template.backgroundImage}`})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {cert.template.elements?.map(el => {
              let content = '';
              const stu = cert.studentId || studentData || {};
              switch (el.token) {
                case 'student_name': content = stu.name; break;
                case 'student_photo':
                  content = stu.photo
                    ? <img src={`${API_BASE_URL.replace('/api', '')}${stu.photo}`} crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }} alt="Student" />
                    : <div style={{ width: "100%", height: "100%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#94a3b8", fontWeight: 700, border: "2px solid #fff", borderRadius: 8 }}>PHOTO</div>;
                  break;
                case 'guardian_name': content = stu.guardianName || stu.fatherName || 'N/A'; break;
                case 'roll_no': content = stu.rollNumber; break;
                case 'registration_no': content = stu.registrationNo || stu.rollNumber; break;
                case 'course': content = cert.course || stu.course; break;
                case 'phone_no': content = stu.phone; break;
                case 'batch': content = stu.batch; break;
                case 'qr_code':
                  content = qrUrl
                    ? <img src={qrUrl} crossOrigin="anonymous" style={{ width: "100%", height: "100%", mixBlendMode: "multiply" }} alt="QR Code" />
                    : 'QR CODE';
                  break;
                case 'date_of_birth': content = stu.dob ? new Date(stu.dob).toLocaleDateString() : 'N/A'; break;
                default: content = cert[el.token] || stu[el.token] || '';
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
                    color: cert.template.fontColor,
                    fontSize: isImageToken ? '12px' : `${cert.template.fontSize}px`,
                    fontFamily: cert.template.fontFamily,
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
        ))}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}