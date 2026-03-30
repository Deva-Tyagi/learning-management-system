import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import {
  Trash2, BookOpen, Layers, Activity,
  HelpCircle, Settings2, Box, Clock, Loader2,
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

export default function ManageQuestionGroups({ token }) {
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', course: '' });

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [coursesRes, groupsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/question-groups`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (coursesRes.ok && groupsRes.ok) {
        const coursesData = await coursesRes.json();
        const groupsData = await groupsRes.json();
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } else toast.error('Data acquisition failure');
    } catch { toast.error('Inventory Synchronization Error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name || !newGroup.course)
      return toast.error('PROTOCOL_ERROR: Registry Parameters Undefined');
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/question-groups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newGroup),
      });
      if (res.ok) {
        toast.success('Taxonomy Registry Established Successfully');
        setNewGroup({ name: '', course: '' });
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.msg || 'Registry Operation Aborted');
      }
    } catch { toast.error('Critical Database Synchronization Error'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteGroup = async (id) => {
    if (!confirm('Permanent deletion confirmed?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/question-groups/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { toast.success('Record Successfully Purged'); fetchData(); }
      else { const e = await res.json(); toast.error(e.msg || 'Purge Protocol Failed'); }
    } catch { toast.error('Purge Protocol Failed'); }
    finally { setLoading(false); }
  };

  /* ── Style tokens ── */
  const inp = {
    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 12, padding: '10px 14px', fontSize: 11, fontWeight: 900,
    color: '#334155', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.04em',
  };
  const lbl = {
    display: 'block', fontSize: 9, fontWeight: 900, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6,
  };
  const card = {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 16, overflow: 'hidden',
  };
  const thStyle = {
    padding: '13px 18px', fontSize: 9, fontWeight: 900, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.16em', whiteSpace: 'nowrap',
  };

  /* on tablet/mobile, hide Created Date column */
  const showDate = isDesktop;

  return (
    <div style={{ paddingBottom: 48, marginTop: 20, fontFamily: 'sans-serif' }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
        background: '#fff', padding: isMobile ? 16 : 20,
        borderRadius: 18, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', gap: 14, marginBottom: 22,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12, background: '#0f172a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 12px rgba(15,23,42,0.2)', flexShrink: 0,
          }}>
            <Layers size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 21, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Question Groups
            </h1>
            <p style={{ margin: '5px 0 0', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Activity size={9} color="#3b82f6" /> Manage Question Categorization
            </p>
          </div>
        </div>

        {/* Active segments counter — always visible */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          paddingLeft: isMobile ? 0 : 24,
          borderLeft: isMobile ? 'none' : '1px solid #f1f5f9',
          borderTop: isMobile ? '1px solid #f1f5f9' : 'none',
          paddingTop: isMobile ? 12 : 0, marginTop: isMobile ? 4 : 0,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Active Segments</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{groups.length}</p>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box size={18} color="#cbd5e1" />
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isDesktop ? '320px 1fr' : '1fr',
        gap: isMobile ? 16 : 22,
        alignItems: 'start',
      }}>

        {/* ── CREATE FORM ── */}
        <div style={card}>
          <div style={{ background: '#0f172a', padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #1e293b' }}>
            <Settings2 size={13} color="#60a5fa" />
            <h3 style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              Create New Group
            </h3>
          </div>
          <form onSubmit={handleCreateGroup} style={{ padding: isMobile ? 16 : 22, display: 'flex', flexDirection: 'column', gap: 18, background: '#fff' }}>
            <div>
              <label style={lbl}>Group Name</label>
              <input type="text" placeholder="e.g. CORE_MODULE_ADCA" style={inp}
                value={newGroup.name}
                onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Select Course</label>
              <select style={inp} value={newGroup.course}
                onChange={e => setNewGroup({ ...newGroup, course: e.target.value })}>
                <option value="">SELECT_COURSE</option>
                {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <button type="submit" disabled={submitting}
              style={{
                width: '100%', background: '#0f172a', color: '#fff', border: 'none',
                borderRadius: 12, padding: '13px 0', fontSize: 10, fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: submitting ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(15,23,42,0.15)',
              }}>
              {submitting && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
              {submitting ? 'SAVING...' : 'Create Question Group'}
            </button>
          </form>
        </div>

        {/* ── GROUPS LIST ── */}
        <div style={card}>
          <div style={{ padding: '13px 18px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              All Question Groups
            </h3>
          </div>

          {/* Mobile: card list */}
          {isMobile ? (
            <div style={{ background: '#fff' }}>
              {loading && groups.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <Activity size={28} color="#3b82f6" style={{ margin: '0 auto 10px', animation: 'pulse 1.5s infinite' }} />
                  <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Querying Architecture...</p>
                </div>
              ) : groups.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', opacity: 0.3 }}>
                    <HelpCircle size={32} color="#94a3b8" />
                  </div>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Registry Underpopulated</p>
                </div>
              ) : groups.map(group => (
                <div key={group._id}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {/* Initials avatar */}
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', flexShrink: 0 }}>
                    {group.name?.slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</p>
                    <span style={{ fontSize: 9, fontWeight: 900, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <BookOpen size={10} /> {group.course}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteGroup(group._id)}
                    style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid #f1f5f9', borderRadius: 10, color: '#cbd5e1', cursor: 'pointer', flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#e11d48'; e.currentTarget.style.borderColor = '#fecdd3'; e.currentTarget.style.background = '#fff1f2'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = 'none'; }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Tablet / Desktop table */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
                  <tr>
                    <th style={thStyle}>Group Name</th>
                    <th style={thStyle}>Course Name</th>
                    {showDate && <th style={thStyle}>Created Date</th>}
                    <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ background: '#fff' }}>
                  {loading && groups.length === 0 ? (
                    <tr>
                      <td colSpan={showDate ? 4 : 3} style={{ padding: '40px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                          <Activity size={28} color="#3b82f6" style={{ animation: 'pulse 1.5s infinite' }} />
                          <span style={{ fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Querying Architecture...</span>
                        </div>
                      </td>
                    </tr>
                  ) : groups.length === 0 ? (
                    <tr>
                      <td colSpan={showDate ? 4 : 3} style={{ padding: '48px 18px', textAlign: 'center', color: '#cbd5e1' }}>
                        <div style={{ width: 56, height: 56, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', opacity: 0.25 }}>
                          <HelpCircle size={36} color="#94a3b8" />
                        </div>
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Registry Underpopulated</p>
                      </td>
                    </tr>
                  ) : groups.map(group => (
                    <tr key={group._id}
                      style={{ borderBottom: '1px solid #f8fafc' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {/* Group name */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#1e293b', border: '1px solid #e2e8f0', textTransform: 'uppercase', flexShrink: 0 }}>
                            {group.name?.slice(0, 2)}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{group.name}</span>
                        </div>
                      </td>
                      {/* Course badge */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 5, letterSpacing: '0.06em' }}>
                          <BookOpen size={10} /> {group.course}
                        </span>
                      </td>
                      {/* Date (desktop only) */}
                      {showDate && (
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#94a3b8' }}>
                            <Clock size={11} color="#cbd5e1" />
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              {new Date(group.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                      )}
                      {/* Delete */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button onClick={() => handleDeleteGroup(group._id)}
                          style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid transparent', borderRadius: 10, color: '#cbd5e1', cursor: 'pointer', marginLeft: 'auto' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#e11d48'; e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.borderColor = '#fecdd3'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}
                          title="Purge Node">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}