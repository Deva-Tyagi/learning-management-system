import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import {
  Plus, Users, CheckCircle2, Database,
  Loader2, ShieldCheck, CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Hook: real window width ─── */
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

export default function CreateIdCardSection({ token }) {
  const [students, setStudents] = useState([]);
  const [idCards, setIdCards] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const width = useWindowWidth();
  const isMobile = width < 640;

  const fetchData = async () => {
    if (!token) return;
    try {
      setDataLoading(true);
      const [studentsRes, cardsRes, templatesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/students/get`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/id-cards/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/templates?type=id-card`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (studentsRes.ok && cardsRes.ok && templatesRes.ok) {
        setStudents(await studentsRes.json());
        setIdCards(await cardsRes.json());
        setTemplates(await templatesRes.json());
      }
    } catch { toast.error('Failed to sync student data'); }
    finally { setDataLoading(false); }
  };

  useEffect(() => { fetchData(); }, [token]);

  const eligibleStudents = students.filter(stu =>
    !idCards.find(card =>
      card.studentId &&
      String(card.studentId._id || card.studentId) === String(stu._id) &&
      card.status === 'active'
    )
  );

  const handleCreate = async () => {
    if (!selectedTemplate) return toast.error('Please select an ID Card template');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/id-cards/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId: selectedId, templateId: selectedTemplate }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('ID Card issued successfully');
        setSelectedId('');
        fetchData();
      } else toast.error(data.msg || 'Failed to issue ID card');
    } catch { toast.error('Server error during issuance'); }
    finally { setLoading(false); }
  };

  /* ── Style tokens ── */
  const selInp = {
    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 12, padding: '13px 44px 13px 16px', fontSize: 13,
    fontWeight: 600, color: '#334155', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', appearance: 'none',
    cursor: 'pointer',
  };
  const lbl = {
    display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7,
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 560, margin: '0 auto', padding: isMobile ? '16px 0' : '24px 0' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 60, height: 60, background: '#0f172a', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 14px', boxShadow: '0 8px 20px rgba(15,23,42,0.2)' }}>
          <Plus size={22} />
        </div>
        <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
          Issue New ID Card
        </h1>
        <p style={{ margin: '7px 0 0', fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
          Generate a digital identity card for an eligible student
        </p>
      </div>

      {/* ── CARD ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: isMobile ? 18 : 32, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

        {dataLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 14 }}>
            <Loader2 size={26} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#cbd5e1' }}>Loading Student Registry...</span>
          </div>

        ) : eligibleStudents.length === 0 ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: isMobile ? '28px 18px' : '40px 28px', textAlign: 'center' }}>
            <ShieldCheck size={38} color="#22c55e" style={{ margin: '0 auto 14px' }} />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#14532d', textTransform: 'uppercase', letterSpacing: '0.06em' }}>System Synchronized</p>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#16a34a', fontWeight: 600 }}>All active students already have issued ID cards.</p>
          </div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Student selector */}
            <div>
              <label style={lbl}>Select Student</label>
              <div style={{ position: 'relative' }}>
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={selInp}>
                  <option value="">Choosing Student Profile</option>
                  {eligibleStudents.map(stu => (
                    <option key={stu._id} value={stu._id}>
                      {stu.name} | {stu.rollNumber} | {stu.batch || 'DEFAULT'}
                    </option>
                  ))}
                </select>
                <Users size={16} color="#94a3b8" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Template selector */}
            <div>
              <label style={lbl}>Select Custom Template</label>
              <div style={{ position: 'relative' }}>
                <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} style={selInp}>
                  <option value="">Choosing ID Card Design</option>
                  {templates.map(tpl => (
                    <option key={tpl._id} value={tpl._id}>{tpl.name}</option>
                  ))}
                </select>
                <ShieldCheck size={16} color="#94a3b8" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Issue button */}
            <button onClick={handleCreate} disabled={loading || !selectedId}
              style={{
                width: '100%', background: '#0f172a', color: '#fff', border: 'none',
                borderRadius: 12, height: 52, fontSize: 12, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.16em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: (loading || !selectedId) ? 0.5 : 1,
                boxShadow: '0 4px 14px rgba(15,23,42,0.18)', transition: 'all 0.15s',
              }}>
              {loading
                ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                : <CreditCard size={18} />}
              Issue Identity Card
            </button>

            {/* Info note */}
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <ShieldCheck size={13} color="#22c55e" />
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#334155' }}>Verification Protocol</span>
              </div>
              <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', lineHeight: 1.7, fontWeight: 600 }}>
                Once issued, the student can access their digital ID card via the student portal. You can also export or print it from the management dashboard.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}