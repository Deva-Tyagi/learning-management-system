import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import {
  Users, CheckCircle2, XCircle, Database,
  Search, Loader2,
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

export default function AllIdCardsSection({ token }) {
  const [students, setStudents] = useState([]);
  const [idCards, setIdCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const [studentsRes, cardsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/students/get`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/id-cards/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (studentsRes.ok && cardsRes.ok) {
          setStudents(await studentsRes.json());
          setIdCards(await cardsRes.json());
        }
      } catch { toast.error('Failed to sync identity registry'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [token]);

  const getCard = (studentId) =>
    idCards.find(card =>
      card.studentId &&
      (card.studentId._id === studentId || card.studentId === studentId) &&
      card.status === 'active'
    );

  const filteredStudents = students.filter(stu =>
    stu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stu.rollNumber && stu.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  /* ── Style tokens ── */
  const cardBox = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' };
  const thSt = { padding: '12px 14px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' };

  /* responsive columns */
  const showBatch = !isMobile;
  const showPhoto = !isMobile;
  const showValidity = isDesktop;
  const colSpan = [true, showBatch, showPhoto, true, showValidity].filter(Boolean).length;

  return (
    <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
        background: '#fff', padding: isMobile ? 14 : 20,
        borderRadius: 18, border: '1px solid #f1f5f9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', gap: 14, marginTop: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(15,23,42,0.2)', flexShrink: 0 }}>
            <Database size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 16 : 19, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1 }}>
              Identity Registry
            </h1>
            <p style={{ margin: '5px 0 0', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Users size={10} color="#3b82f6" /> {students.length} Total Identity Nodes
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: isMobile ? '100%' : 260 }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
              background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12,
              fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase',
              outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* ── TABLE / MOBILE CARDS ── */}
      <div style={cardBox}>
        {isMobile ? (
          /* Mobile card list */
          <div style={{ background: '#fff' }}>
            {loading ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <Loader2 size={28} color="#e2e8f0" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Syncing Registry...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                No students found matching your search
              </div>
            ) : filteredStudents.map(stu => {
              const card = getCard(stu._id);
              return (
                <div key={stu._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid #f8fafc' }}>
                  {/* Photo */}
                  <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', border: '2px solid #f1f5f9', background: '#f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stu.photo
                      ? <img src={stu.photo.startsWith('http') ? stu.photo : `${API_BASE_URL.replace('/api', '')}${stu.photo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Users size={16} color="#cbd5e1" />}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stu.name}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 10, fontWeight: 700, color: '#2563eb', fontFamily: 'monospace', textTransform: 'uppercase' }}>#{stu.rollNumber || 'NO_ROLL'}</p>
                  </div>
                  {/* Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0, opacity: card ? 1 : 0.4 }}>
                    {card
                      ? <CheckCircle2 size={16} color="#22c55e" />
                      : <XCircle size={16} color="#cbd5e1" />}
                    <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', color: card ? '#059669' : '#94a3b8' }}>
                      {card ? 'Active' : 'None'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Tablet / Desktop table */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <tr>
                  <th style={thSt}>Student Profile</th>
                  {showBatch && <th style={thSt}>Batch Logic</th>}
                  {showPhoto && <th style={{ ...thSt, textAlign: 'center' }}>Visual ID</th>}
                  <th style={{ ...thSt, textAlign: 'center' }}>Status</th>
                  {showValidity && <th style={{ ...thSt, textAlign: 'right' }}>Validity</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={colSpan} style={{ padding: '56px 16px', textAlign: 'center' }}>
                    <Loader2 size={28} color="#e2e8f0" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Syncing Registry...</p>
                  </td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan={colSpan} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    No students found matching your search
                  </td></tr>
                ) : filteredStudents.map(stu => {
                  const card = getCard(stu._id);
                  return (
                    <tr key={stu._id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,250,252,0.6)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {/* Name + roll */}
                      <td style={{ padding: '14px 14px' }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', lineHeight: 1, marginBottom: 5 }}>{stu.name}</p>
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#2563eb', fontFamily: 'monospace', textTransform: 'uppercase' }}>#{stu.rollNumber || 'NO_ROLL'}</p>
                      </td>
                      {/* Batch */}
                      {showBatch && (
                        <td style={{ padding: '14px 14px' }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase' }}>
                            {stu.batch || 'DEFAULT'}
                          </span>
                        </td>
                      )}
                      {/* Photo */}
                      {showPhoto && (
                        <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, overflow: 'hidden', border: '2px solid #f1f5f9', background: '#f1f5f9', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                            {stu.photo
                              ? <img src={stu.photo.startsWith('http') ? stu.photo : `${API_BASE_URL.replace('/api', '')}${stu.photo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <Users size={16} color="#cbd5e1" />}
                          </div>
                        </td>
                      )}
                      {/* Status */}
                      <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, opacity: card ? 1 : 0.4 }}>
                          {card ? <CheckCircle2 size={15} color="#22c55e" /> : <XCircle size={15} color="#cbd5e1" />}
                          <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', color: card ? '#059669' : '#94a3b8' }}>
                            {card ? 'Active' : 'None'}
                          </span>
                        </div>
                      </td>
                      {/* Validity */}
                      {showValidity && (
                        <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#1e293b' }}>
                            {card?.validThrough
                              ? new Date(card.validThrough).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                              : '--------'}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: 8, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expiry Date</p>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}