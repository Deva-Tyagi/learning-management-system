import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import {
  Users, CheckCircle2, Activity, TrendingUp, Award, Target,
  Download, Search, Filter, ClipboardCheck, Save, Loader2,
  X, ChevronRight, ArrowUpRight, Eye, Zap, Skull, Trophy,
  ShieldCheck, FileText, Settings2, Edit3, User, Scale, BarChart3,
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

export default function ExamResults({ token }) {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [examResults, setExamResults] = useState([]);
  const [examDetails, setExamDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [resultToGrade, setResultToGrade] = useState(null);
  const [gradingData, setGradingData] = useState({});

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  useEffect(() => {
    const fetchExams = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/exams`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          const now = new Date();
          setExams(data.filter(e => e.isActive && new Date(e.examDate) <= now));
        }
      } catch { toast.error('Mainframe Sync Failure'); }
    };
    fetchExams();
  }, [token]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedExam || !token) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/exam-results/exam/${selectedExam}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) { setExamResults(data.results || []); setExamDetails(data.exam || null); }
        else { setExamResults([]); setExamDetails(null); }
      } catch { toast.error('Extraction Failure'); }
      finally { setLoading(false); }
    };
    fetchResults();
  }, [selectedExam, token]);

  const handleGradeResult = (result) => {
    setResultToGrade(result);
    const init = {};
    result.answers.forEach(a => {
      init[a.questionId] = { marksObtained: a.marksObtained || 0, remarks: a.remarks || '' };
    });
    setGradingData(init);
    setShowGradingModal(true);
  };

  const handleSubmitGrades = async () => {
    if (!resultToGrade || !token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/exam-results/${resultToGrade._id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ gradingData }),
      });
      if (res.ok) {
        toast.success('Audit Matrix Updated');
        setShowGradingModal(false);
        const rr = await fetch(`${API_BASE_URL}/exam-results/exam/${selectedExam}`, { headers: { Authorization: `Bearer ${token}` } });
        const rd = await rr.json();
        if (rr.ok) setExamResults(rd.results || []);
      } else toast.error('Audit Commitment Failed');
    } catch { toast.error('Transmission Failure'); }
    finally { setLoading(false); }
  };

  const stats = (() => {
    if (!examResults.length) return null;
    const total = examResults.length;
    const passed = examResults.filter(r => r.isPassed).length;
    const marks = examResults.map(r => r.marksObtained);
    return {
      total, passed, failed: total - passed,
      passRate: ((passed / total) * 100).toFixed(1),
      avgMarks: marks.length ? (marks.reduce((s, m) => s + (m || 0), 0) / total).toFixed(1) : 0,
      high: marks.length ? Math.max(...marks.filter(m => m != null)) : 0,
      low: marks.length ? Math.min(...marks.filter(m => m != null)) : 0,
    };
  })();

  const exportToCSV = () => {
    if (!examResults.length) return;
    const headers = ['Student', 'Roll#', 'Course', 'Batch', 'Marks', 'Total', '%', 'Grade', 'Status', 'Time'];
    const rows = examResults.map(r => [
      r.studentId?.name || 'N/A', r.studentId?.rollNumber || 'N/A', r.studentId?.course || 'N/A',
      r.studentId?.batch || 'N/A', r.marksObtained || 0, r.totalMarks || 0,
      (r.percentage || 0) + '%', r.grade || 'N/A', r.isPassed ? 'Passed' : 'Failed',
      new Date(r.submitTime || Date.now()).toLocaleString(),
    ]);
    const content = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VANTAGE_REPORT_${examDetails?.title || 'EXAM'}_${Date.now()}.csv`;
    a.click();
  };

  /* ── Style tokens ── */
  const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' };
  const thSt = { padding: '13px 14px', fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.16em', whiteSpace: 'nowrap' };
  const inp = {
    width: '100%', background: '#f8fafc', border: '2px solid #f1f5f9',
    borderRadius: 14, padding: '11px 16px', fontSize: 11, fontWeight: 900,
    color: '#334155', outline: 'none', textTransform: 'uppercase',
    letterSpacing: '0.08em', fontFamily: 'inherit', boxSizing: 'border-box', appearance: 'none',
  };

  /* responsive table cols */
  const showBatchCol = !isMobile;
  const showCourseCol = isDesktop;
  const showMarksBar = !isMobile;
  const colSpan = [true, showBatchCol, showCourseCol, true, showMarksBar, true, true].filter(Boolean).length;

  const STAT_CARDS = stats ? [
    { label: 'ENROLLMENT_COUNT', value: stats.total, icon: Users, color: '#2563eb', bg: '#eff6ff' },
    { label: 'SUCCESS_THRESHOLD', value: `${stats.passRate}%`, icon: Trophy, color: '#059669', bg: '#ecfdf5' },
    { label: 'MEAN_PERFORMANCE', value: stats.avgMarks, icon: Activity, color: '#4f46e5', bg: '#eef2ff' },
    { label: 'PEAK_AMPLITUDE', value: `${stats.high}/${stats.low}`, icon: Zap, color: '#d97706', bg: '#fffbeb' },
  ] : [];

  return (
    <div style={{ paddingBottom: 60, marginTop: 20, fontFamily: 'sans-serif', userSelect: 'none', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
        background: '#fff', padding: isMobile ? 16 : 22,
        borderRadius: 22, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: isMobile ? 44 : 52, height: isMobile ? 44 : 52, borderRadius: 16, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 6px 18px rgba(79,70,229,0.25)', flexShrink: 0 }}>
            <Activity size={isMobile ? 20 : 26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 21, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Exam Results</h1>
            <p style={{ margin: '5px 0 0', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Activity size={9} color="#3b82f6" /> Performance Analysis Terminal
            </p>
          </div>
        </div>

        {/* Exam selector + export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: isMobile ? '100%' : 'auto', minWidth: isMobile ? 'auto' : 360 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}
              style={{ ...inp, paddingLeft: 38 }}>
              <option value="">IDENTIFY_EXAMINATION_MANIFEST</option>
              {exams.map(e => (
                <option key={e._id} value={e._id}>{e.title} [{new Date(e.examDate).toLocaleDateString()}]</option>
              ))}
            </select>
            <ChevronRight size={14} color="#94a3b8" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
          </div>
          {selectedExam && examResults.length > 0 && (
            <button onClick={exportToCSV}
              style={{ width: 44, height: 44, flexShrink: 0, background: '#fff', border: '2px solid #f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#f1f5f9'; }}>
              <Download size={18} />
            </button>
          )}
        </div>
      </div>

      {selectedExam ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── STAT CARDS ── */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : isDesktop ? '1fr 1fr 1fr 1fr' : '1fr 1fr',
              gap: isMobile ? 10 : 16,
            }}>
              {STAT_CARDS.map((s, i) => (
                <div key={i} style={{ background: '#fff', padding: isMobile ? '14px 12px' : '20px 18px', borderRadius: 18, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: s.bg, opacity: 0.6 }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <s.icon size={15} color={s.color} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 8, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#f8fafc', padding: '3px 7px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                        <ShieldCheck size={8} color={s.color} /> Validated
                      </div>
                    </div>
                    <h4 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{s.value}</h4>
                    <p style={{ margin: '6px 0 0', fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── RESULTS TABLE / CARDS ── */}
          <div style={card}>
            <div style={{ background: '#0f172a', padding: '12px 18px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.16em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={13} color="#60a5fa" /> Student Results List
              </h3>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{examResults.length} Units Found</span>
            </div>

            {isMobile ? (
              /* Mobile card list */
              <div style={{ background: '#fff' }}>
                {loading ? (
                  <div style={{ padding: 48, textAlign: 'center' }}>
                    <Loader2 size={28} color="#818cf8" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : examResults.length === 0 ? (
                  <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <Skull size={40} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.16em' }}>No_Data_Packets_Detected</p>
                  </div>
                ) : examResults.map(r => (
                  <div key={r._id} style={{ padding: '13px 16px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#0f172a', border: '2px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: 13, fontWeight: 900, flexShrink: 0 }}>
                      {r.studentId?.name?.charAt(0) || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.studentId?.name || 'Unknown'}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        ID_{r.studentId?.rollNumber || 'NULL'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>{r.marksObtained}<span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>/{r.totalMarks}</span></span>
                        <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 999, border: '1px solid', textTransform: 'uppercase', background: r.isPassed ? '#ecfdf5' : '#fff1f2', color: r.isPassed ? '#059669' : '#e11d48', borderColor: r.isPassed ? '#a7f3d0' : '#fecdd3' }}>
                          {r.isPassed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleGradeResult(r)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 9, padding: '7px 12px', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', flexShrink: 0 }}>
                      <Edit3 size={11} color="#60a5fa" /> Grade
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* Tablet / Desktop table */
              <div style={{ overflowX: 'auto', background: '#fff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(248,250,252,0.5)', borderBottom: '1px solid #f1f5f9' }}>
                    <tr>
                      <th style={thSt}>Student Name</th>
                      {showBatchCol && <th style={{ ...thSt, textAlign: 'center' }}>Batch</th>}
                      {showCourseCol && <th style={{ ...thSt, textAlign: 'center' }}>Course</th>}
                      <th style={{ ...thSt, textAlign: 'center' }}>Marks</th>
                      {showMarksBar && <th style={{ ...thSt, textAlign: 'center' }}>Result %</th>}
                      <th style={{ ...thSt, textAlign: 'center' }}>Status</th>
                      <th style={{ ...thSt, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={colSpan} style={{ padding: '56px 16px', textAlign: 'center' }}>
                        <Loader2 size={28} color="#818cf8" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                      </td></tr>
                    ) : examResults.length === 0 ? (
                      <tr><td colSpan={colSpan} style={{ padding: '56px 16px', textAlign: 'center' }}>
                        <Skull size={40} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>No_Data_Packets_Detected</p>
                      </td></tr>
                    ) : examResults.map(r => (
                      <tr key={r._id} style={{ borderBottom: '1px solid #f8fafc', borderLeft: '3px solid transparent', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(238,242,255,0.2)'; e.currentTarget.style.borderLeftColor = '#4f46e5'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}>
                        <td style={{ padding: '14px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#0f172a', border: '2px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>
                              {r.studentId?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: '#1e293b' }}>{r.studentId?.name || 'Unknown'}</p>
                              <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ID_{r.studentId?.rollNumber || 'NULL'}</p>
                            </div>
                          </div>
                        </td>
                        {showBatchCol && (
                          <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                              <span style={{ fontSize: 10, fontWeight: 900, color: '#334155', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4f46e5' }} />
                                {r.studentId?.course || 'N/A'}
                              </span>
                              <span style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Batch_{r.studentId?.batch || 'N/A'}</span>
                            </div>
                          </td>
                        )}
                        {showCourseCol && (
                          <td style={{ padding: '14px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#475569' }}>{r.studentId?.course || 'N/A'}</td>
                        )}
                        <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                          <span style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>{r.marksObtained}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}> / {r.totalMarks}</span>
                        </td>
                        {showMarksBar && (
                          <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                              <span style={{ fontSize: 12, fontWeight: 900, color: '#1e293b' }}>{r.percentage}%</span>
                              <div style={{ width: 60, height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#4f46e5', width: `${r.percentage}%` }} />
                              </div>
                            </div>
                          </td>
                        )}
                        <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                          <span style={{ fontSize: 9, fontWeight: 900, padding: '4px 10px', borderRadius: 999, border: '2px solid', textTransform: 'uppercase', letterSpacing: '0.1em', background: r.isPassed ? '#ecfdf5' : '#fff1f2', color: r.isPassed ? '#059669' : '#e11d48', borderColor: r.isPassed ? '#a7f3d0' : '#fecdd3' }}>
                            {r.isPassed ? 'PASS_ACK' : 'FAIL_ERR'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                          <button onClick={() => handleGradeResult(r)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 3px 10px rgba(15,23,42,0.15)' }}>
                            <Edit3 size={11} color="#60a5fa" /> Grade
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
      ) : (
        /* ── EMPTY STATE ── */
        <div style={{ background: '#fff', padding: isMobile ? '48px 20px' : '80px 40px', textAlign: 'center', borderRadius: isMobile ? 16 : 22, border: '2px dashed #e2e8f0' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#f8fafc', border: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
            <Search size={32} color="#e2e8f0" style={{ animation: 'pulse 2s infinite' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: isMobile ? 14 : 18, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Awaiting_Selection</h3>
          <p style={{ margin: '12px auto 0', fontSize: 11, color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.7, maxWidth: 360 }}>
            Initialize examination manifest from the control module to fetch performance telemetry
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 22 }}>
            {[1, 2, 3].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#e2e8f0' }} />)}
          </div>
        </div>
      )}

      {/* ── GRADING MODAL ── */}
      {showGradingModal && resultToGrade && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: isMobile ? 10 : 20, fontFamily: 'sans-serif' }}>
          <div style={{ background: '#fff', borderRadius: isMobile ? 18 : 26, boxShadow: '0 32px 64px rgba(0,0,0,0.25)', width: '100%', maxWidth: 900, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Modal header */}
            <div style={{ background: '#0f172a', padding: isMobile ? '14px 16px' : '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: isMobile ? 40 : 52, height: isMobile ? 40 : 52, borderRadius: 16, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(79,70,229,0.35)', flexShrink: 0 }}>
                  <FileText size={isMobile ? 18 : 26} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: isMobile ? 13 : 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ANS_SHEET_AUDIT</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
                    {[`VECTOR_${resultToGrade.studentId?.name || 'N/A'}`, `CLUSTER_${resultToGrade.studentId?.batch || 'N/A'}`].map((label, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#818cf8' }} />
                        <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowGradingModal(false)}
                style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 14 : 28, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {resultToGrade.answers.map((answer, index) => {
                const question = examDetails?.questions.find(q => q._id === answer.questionId);
                if (!question) return null;
                return (
                  <div key={answer.questionId} style={{ background: '#fff', padding: isMobile ? 14 : 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', position: 'relative' }}>
                    {/* Node label */}
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 56, height: 44, background: '#f8fafc', borderRadius: '0 16px 0 14px', border: '0 0 1px 1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>
                      #{index + 1}
                    </div>

                    {/* Question */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <CheckCircle2 size={11} color="#10b981" />
                        <span style={{ fontSize: 9, fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Correct Answer</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: '#1e293b', lineHeight: 1.5, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{question.question}</p>
                    </div>

                    {/* Student answer + Reference */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 20, marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <User size={11} color="#4f46e5" />
                          <span style={{ fontSize: 9, fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Student Answer</span>
                        </div>
                        <div style={{ padding: '12px 16px', background: '#0f172a', color: '#fff', borderRadius: 12, fontSize: 13, fontWeight: 700, lineHeight: 1.6, minHeight: 56, borderBottom: '4px solid #e11d48' }}>
                          {answer.answer || <span style={{ opacity: 0.3, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Transmission_Null</span>}
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <ShieldCheck size={11} color="#10b981" />
                          <span style={{ fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Reference Logic Key</span>
                        </div>
                        <div style={{ padding: '12px 16px', background: '#fff', border: '2px solid #a7f3d0', borderRadius: 12, fontSize: 13, fontWeight: 900, color: '#065f46', lineHeight: 1.6, minHeight: 56, borderBottom: '4px solid #10b981' }}>
                          {question.type === 'mcq' ? (question.options[parseInt(question.correctAnswer)] || 'NULL') : (question.correctAnswer || 'REF_INTERNAL')}
                        </div>
                      </div>
                    </div>

                    {/* Marks + remarks */}
                    <div style={{ background: '#f8fafc', padding: isMobile ? '12px 14px' : '14px 18px', borderRadius: 12, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Scale size={16} color="#94a3b8" />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Marks Obtained</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="number" max={question?.marks}
                              value={gradingData[answer.questionId]?.marksObtained || 0}
                              onChange={e => setGradingData(prev => ({ ...prev, [answer.questionId]: { ...prev[answer.questionId], marksObtained: parseFloat(e.target.value) || 0 } }))}
                              style={{ width: 52, background: 'transparent', border: 'none', outline: 'none', fontSize: 20, fontWeight: 900, color: '#0f172a', fontFamily: 'inherit', padding: 0 }} />
                            <span style={{ fontSize: 13, fontWeight: 900, color: '#cbd5e1' }}>/ {question?.marks}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ width: isMobile ? '100%' : '60%' }}>
                        <p style={{ margin: '0 0 5px', fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Audit Annotation</p>
                        <input type="text"
                          value={gradingData[answer.questionId]?.remarks || ''}
                          onChange={e => setGradingData(prev => ({ ...prev, [answer.questionId]: { ...prev[answer.questionId], remarks: e.target.value } }))}
                          placeholder="Enter audit observations..."
                          style={{ width: '100%', background: '#fff', border: '2px solid #f1f5f9', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#334155', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal footer */}
            <div style={{ padding: isMobile ? '14px 16px' : '18px 28px', background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end', alignItems: isMobile ? 'stretch' : 'center', gap: 12 }}>
              {!isMobile && <p style={{ margin: '0 auto 0 0', fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Confirming audit updates overwrites previous telemetry</p>}
              <button onClick={() => setShowGradingModal(false)}
                style={{ padding: '11px 22px', borderRadius: 12, fontSize: 11, fontWeight: 900, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', order: isMobile ? 2 : 0 }}>
                Cancel
              </button>
              <button onClick={handleSubmitGrades} disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12, padding: '11px 28px', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 4px 14px rgba(15,23,42,0.15)', order: isMobile ? 1 : 0 }}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} color="#818cf8" /> : <Save size={16} />}
                COMMIT_RESULT_SET
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}