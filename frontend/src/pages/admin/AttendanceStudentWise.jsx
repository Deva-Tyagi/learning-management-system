import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import {
  User, BookOpen, Search,
  Calendar, CheckCircle2, XCircle, Loader2,
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

export default function AttendanceStudentWise({ token }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [sRes, cRes] = await Promise.all([
          fetch(`${API_BASE_URL}/students/get`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/courses/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (sRes.ok && cRes.ok) {
          setStudents(await sRes.json());
          setCourses(await cRes.json());
        }
      } catch { toast.error('Failed to load data'); }
    };
    fetchData();
  }, [token]);

  const handleFilter = async () => {
    if (!selectedStudent || !selectedCourse)
      return toast.error('Please select both course and student');
    try {
      setLoading(true);
      const student = students.find(s => s._id === selectedStudent);
      setStudentData(student);
      const res = await fetch(
        `${API_BASE_URL}/attendance/?studentId=${selectedStudent}&course=${selectedCourse}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setAttendanceHistory(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch { toast.error('Failed to load attendance history'); }
    finally { setLoading(false); }
  };

  const stats = (() => {
    const total = attendanceHistory.length;
    const present = attendanceHistory.filter(r => r.status === 'Present').length;
    return { total, present, absent: total - present, pct: total > 0 ? (present / total * 100).toFixed(1) : 0 };
  })();

  /* ── Style tokens ── */
  const inp = {
    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 12, padding: '10px 14px 10px 40px', fontSize: 13,
    fontWeight: 500, color: '#334155', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', height: 46,
  };
  const lbl = {
    display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
  };

  const STAT_CARDS = [
    { label: 'Present', val: stats.present, color: '#059669', bg: '#ecfdf5' },
    { label: 'Absent', val: stats.absent, color: '#e11d48', bg: '#fff1f2' },
    { label: 'Total Days', val: stats.total, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Percent', val: `${stats.pct}%`, color: '#0f172a', bg: '#f1f5f9' },
  ];

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 20, padding: isMobile ? 16 : 28, marginTop: 8,
      }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
            Student Attendance Trace
          </h1>
          <p style={{ margin: '5px 0 0', fontSize: 13, color: '#94a3b8' }}>
            Review detailed attendance logs for an individual student
          </p>
        </div>

        {/* ── FILTER BAR ── */}
        <div style={{
          background: '#f8fafc', border: '1px solid #f1f5f9',
          borderRadius: 16, padding: isMobile ? 14 : 22, marginBottom: 24,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isDesktop ? '1fr 1fr auto' : '1fr 1fr',
            gap: isMobile ? 14 : 16,
            alignItems: 'end',
          }}>

            {/* Course */}
            <div>
              <label style={lbl}>Select Course</label>
              <div style={{ position: 'relative' }}>
                <BookOpen size={16} color="#cbd5e1" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
                <select value={selectedCourse}
                  onChange={e => { setSelectedCourse(e.target.value); setSelectedStudent(''); setStudentData(null); setAttendanceHistory([]); }}
                  style={inp}>
                  <option value="">Choose Course</option>
                  {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Student */}
            <div>
              <label style={lbl}>Select Student</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#cbd5e1" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
                <select value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                  disabled={!selectedCourse}
                  style={{ ...inp, background: !selectedCourse ? '#f1f5f9' : '#f8fafc', cursor: !selectedCourse ? 'not-allowed' : 'default' }}>
                  <option value="">Choose Student</option>
                  {students.filter(s => s.course === selectedCourse).map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* View History button */}
            <button onClick={handleFilter} disabled={loading || !selectedStudent}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12,
                height: 46, padding: '0 24px', fontSize: 12, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
                opacity: (loading || !selectedStudent) ? 0.5 : 1,
                boxShadow: '0 4px 14px rgba(15,23,42,0.18)',
                width: isMobile || !isDesktop ? '100%' : 'auto',
                gridColumn: !isDesktop && !isMobile ? 'span 2' : 'auto',
              }}>
              {loading
                ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                : <Search size={17} />}
              View History
            </button>
          </div>
        </div>

        {/* ── STUDENT PROFILE + HISTORY ── */}
        {studentData && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '300px 1fr' : '1fr',
            gap: isMobile ? 16 : 24,
          }}>

            {/* ── Profile Card ── */}
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 18, padding: isMobile ? 18 : 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', textAlign: 'center' }}>
              {/* Avatar */}
              <div style={{
                width: isMobile ? 72 : 90, height: isMobile ? 72 : 90,
                borderRadius: '50%', border: '4px solid #f1f5f9',
                margin: '0 auto 14px', overflow: 'hidden',
                background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {studentData.photo
                  ? <img src={`${API_BASE_URL.replace('/api', '')}${studentData.photo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <User size={36} color="#cbd5e1" />}
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{studentData.name}</h3>
              <p style={{ margin: '5px 0 0', fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Roll# {studentData.rollNumber}
              </p>

              {/* Stat mini-grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20,
              }}>
                {STAT_CARDS.map(st => (
                  <div key={st.label} style={{ background: st.bg, borderRadius: 12, padding: '10px 8px', border: '1px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{st.label}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 900, color: st.color }}>{st.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Attendance Log ── */}
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              {/* Log header */}
              <div style={{ padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} color="#94a3b8" />
                <h4 style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Attendance Logs
                </h4>
              </div>

              {/* Log rows */}
              <div style={{ maxHeight: 460, overflowY: 'auto' }}>
                {attendanceHistory.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No records found for this course
                  </div>
                ) : attendanceHistory.map(r => {
                  const isPresent = r.status === 'Present';
                  return (
                    <div key={r._id}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '12px 16px' : '13px 20px', borderBottom: '1px solid #f8fafc' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,250,252,0.6)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {isPresent
                          ? <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0 }} />
                          : <XCircle size={15} color="#f43f5e" style={{ flexShrink: 0 }} />}
                        <p style={{ margin: 0, fontSize: isMobile ? 12 : 13, fontWeight: 600, color: '#1e293b' }}>
                          {new Date(r.date).toLocaleDateString(undefined, {
                            weekday: isMobile ? 'short' : 'long',
                            year: 'numeric', month: isMobile ? 'short' : 'long', day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                        padding: '4px 12px', borderRadius: 8,
                        background: isPresent ? '#ecfdf5' : '#fff1f2',
                        color: isPresent ? '#059669' : '#e11d48',
                        flexShrink: 0,
                      }}>
                        {r.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!studentData && !loading && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, background: '#f8fafc', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <User size={30} color="#cbd5e1" />
            </div>
            <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Awaiting Selection
            </h3>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94a3b8' }}>
              Select a course and student to view the performance trace
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}