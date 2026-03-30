import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import {
  CreditCard, Download, Trash2, Plus, Activity,
  Users, CheckCircle2, Database, Fingerprint, Loader2,
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

export default function IdCardsSection({ token }) {
  const [students, setStudents] = useState([]);
  const [idCards, setIdCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [issueLoading, setIssueLoading] = useState({});

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

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
    } catch { toast.error('Failed to sync identity data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [token]);

  const getCard = (studentId) =>
    idCards.find(card =>
      card.studentId &&
      (card.studentId._id === studentId || card.studentId === studentId) &&
      card.status === 'active'
    );

  const handleIssue = async (student) => {
    setIssueLoading(l => ({ ...l, [student._id]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/id-cards/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId: student._id }),
      });
      const data = await res.json();
      if (res.ok) { toast.success('ID Card issued successfully'); fetchData(); }
      else toast.error(data.msg || 'Issuance failed');
    } catch { toast.error('Server error during issuance'); }
    finally { setIssueLoading(l => ({ ...l, [student._id]: false })); }
  };

  const handleDownload = async (card) => {
    try {
      const res = await fetch(`${API_BASE_URL}/id-cards/${card._id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('PDF Generation Error');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IDCard-${card.studentId.name ? card.studentId.name.replace(/\s/g, '') : 'Student'}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Failed to download ID card PDF'); }
  };

  const handleRevoke = async (card) => {
    if (!window.confirm('Are you sure you want to revoke this ID card?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/id-cards/${card._id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { toast.success('ID Card revoked successfully'); fetchData(); }
      else toast.error('Failed to revoke card');
    } catch { toast.error('Error revoking card'); }
  };

  /* ── Style tokens ── */
  const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' };
  const thSt = { padding: '12px 14px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' };

  /* responsive column visibility */
  const showPhoto = !isMobile;
  const showBatch = !isMobile;
  const showRoll = isDesktop || !isMobile;
  const colSpan = [true, showRoll, showPhoto, showBatch, true, true].filter(Boolean).length;

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
            <Fingerprint size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 16 : 19, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1 }}>
              ID Card Management
            </h1>
            <p style={{ margin: '5px 0 0', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Database size={10} color="#3b82f6" /> ID Card List
            </p>
          </div>
        </div>

        {/* Stats badges */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '8px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, flex: isMobile ? '1' : 'none' }}>
            <Users size={16} color="#94a3b8" />
            <div>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>Total Students</p>
              <p style={{ margin: '3px 0 0', fontSize: 14, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>{students.length}</p>
            </div>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, flex: isMobile ? '1' : 'none' }}>
            <CheckCircle2 size={16} color="#22c55e" />
            <div>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>Active Cards</p>
              <p style={{ margin: '3px 0 0', fontSize: 14, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>{idCards.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLE / CARDS ── */}
      <div style={card}>
        <div style={{ padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Card List</h3>
        </div>

        {isMobile ? (
          /* ── Mobile card list ── */
          <div style={{ background: '#fff' }}>
            {loading && students.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <Loader2 size={28} color="#3b82f6" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Loading Records...</p>
              </div>
            ) : students.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                No Student Records Found
              </div>
            ) : students.map(stu => {
              const card = getCard(stu._id);
              return (
                <div key={stu._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid #f8fafc' }}>
                  {/* Photo */}
                  <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stu.photo
                      ? <img src={stu.photo.startsWith('http') ? stu.photo : `${API_BASE_URL.replace('/api', '')}${stu.photo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Users size={16} color="#cbd5e1" />}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stu.name}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 5 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#2563eb', fontFamily: 'monospace', textTransform: 'uppercase' }}>#{stu.rollNumber || 'N/A'}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: card ? '#059669' : '#94a3b8', background: card ? '#ecfdf5' : '#f8fafc', border: `1px solid ${card ? '#a7f3d0' : '#f1f5f9'}`, padding: '1px 7px', borderRadius: 6, textTransform: 'uppercase' }}>
                        {card ? 'Issued' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {card ? (
                      <>
                        <button onClick={() => handleDownload(card)}
                          style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #bfdbfe', borderRadius: 9, color: '#2563eb', cursor: 'pointer' }}>
                          <Download size={14} />
                        </button>
                        <button onClick={() => handleRevoke(card)}
                          style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #fecdd3', borderRadius: 9, color: '#e11d48', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleIssue(stu)} disabled={issueLoading[stu._id]}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 9, padding: '7px 12px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', opacity: issueLoading[stu._id] ? 0.6 : 1 }}>
                        {issueLoading[stu._id] ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={11} />}
                        Issue
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Tablet / Desktop table ── */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#fff', borderBottom: '1px solid #f8fafc' }}>
                <tr>
                  <th style={thSt}>Student Name</th>
                  {showRoll && <th style={thSt}>Roll Number</th>}
                  {showPhoto && <th style={{ ...thSt, textAlign: 'center' }}>Photo</th>}
                  {showBatch && <th style={thSt}>Batch</th>}
                  <th style={{ ...thSt, textAlign: 'center' }}>Status</th>
                  <th style={{ ...thSt, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && students.length === 0 ? (
                  <tr><td colSpan={colSpan} style={{ padding: '56px 16px', textAlign: 'center' }}>
                    <Loader2 size={28} color="#3b82f6" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Loading Records...</p>
                  </td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={colSpan} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    No Student Records Found
                  </td></tr>
                ) : students.map(stu => {
                  const cardItem = getCard(stu._id);
                  return (
                    <tr key={stu._id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,250,252,0.6)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '13px 14px' }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' }}>{stu.name}</p>
                      </td>
                      {showRoll && (
                        <td style={{ padding: '13px 14px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', fontFamily: 'monospace', textTransform: 'uppercase' }}>#{stu.rollNumber || 'N/A'}</span>
                        </td>
                      )}
                      {showPhoto && (
                        <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f1f5f9', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {stu.photo
                              ? <img src={stu.photo.startsWith('http') ? stu.photo : `${API_BASE_URL.replace('/api', '')}${stu.photo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <Users size={16} color="#cbd5e1" />}
                          </div>
                        </td>
                      )}
                      {showBatch && (
                        <td style={{ padding: '13px 14px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', background: '#f8fafc', border: '1px solid #f1f5f9', padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase' }}>
                            {stu.batch || 'GENERAL'}
                          </span>
                        </td>
                      )}
                      <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: 9, fontWeight: 900, padding: '3px 10px', borderRadius: 8,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          background: cardItem ? '#ecfdf5' : '#f8fafc',
                          color: cardItem ? '#059669' : '#94a3b8',
                          border: `1px solid ${cardItem ? '#a7f3d0' : '#f1f5f9'}`,
                        }}>
                          {cardItem ? 'Issued' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                          {cardItem ? (
                            <>
                              <button onClick={() => handleDownload(cardItem)}
                                style={{ padding: 7, background: '#fff', border: '1px solid #bfdbfe', borderRadius: 9, color: '#2563eb', cursor: 'pointer', display: 'flex' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                title="Download PDF">
                                <Download size={15} />
                              </button>
                              <button onClick={() => handleRevoke(cardItem)}
                                style={{ padding: 7, background: '#fff', border: '1px solid #fecdd3', borderRadius: 9, color: '#e11d48', cursor: 'pointer', display: 'flex' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                title="Revoke Card">
                                <Trash2 size={15} />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => handleIssue(stu)} disabled={issueLoading[stu._id]}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 9, padding: '7px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', opacity: issueLoading[stu._id] ? 0.6 : 1, boxShadow: '0 2px 8px rgba(15,23,42,0.15)' }}>
                              {issueLoading[stu._id] ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={12} />}
                              Issue Card
                            </button>
                          )}
                        </div>
                      </td>
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