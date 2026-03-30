import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import {
  BarChart3, Calendar, Users, CheckCircle2, TrendingUp,
  Search, Loader2, Settings2, ArrowUpRight, Layers,
  Clock, FileText, Activity, Globe, Cpu, Database,
  DownloadCloud,
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

export default function ExamReports({ token }) {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [reportType, setReportType] = useState('exam-wise');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [examsRes, coursesRes, batchesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/exams`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/courses`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/batches`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (examsRes.ok && coursesRes.ok && batchesRes.ok) {
          setExams(await examsRes.json());
          setCourses(await coursesRes.json());
          setBatches(await batchesRes.json());
        }
      } catch { toast.error('Telemetry Sync Failure'); }
    };
    fetchData();
  }, [token]);

  const handleGenerateReport = async () => {
    if (!token) return;
    if (reportType === 'exam-wise' && !selectedExam) return toast.error('PROTOCOL_ERR: Identify Target Exam');
    if ((reportType === 'course-wise' || reportType === 'batch-wise') && (!selectedCourse && !selectedBatch)) return toast.error('PROTOCOL_ERR: Specify Filter Matrix');
    if (reportType === 'date-range' && (!dateRange.startDate || !dateRange.endDate)) return toast.error('PROTOCOL_ERR: Define Temporal Window');
    try {
      setLoading(true);
      let endpoint = '';
      const params = new URLSearchParams();
      switch (reportType) {
        case 'exam-wise': endpoint = `/exam-results/reports/exam-wise`; params.append('examId', selectedExam); break;
        case 'course-wise': endpoint = `/exam-results/reports/course-wise`; params.append('course', selectedCourse); if (selectedBatch) params.append('batch', selectedBatch); break;
        case 'batch-wise': endpoint = `/exam-results/reports/batch-wise`; params.append('batch', selectedBatch); if (selectedCourse) params.append('course', selectedCourse); break;
        case 'date-range': endpoint = `/exam-results/reports/date-range`; params.append('startDate', dateRange.startDate); params.append('endDate', dateRange.endDate); if (selectedCourse) params.append('course', selectedCourse); if (selectedBatch) params.append('batch', selectedBatch); break;
      }
      const res = await fetch(`${API_BASE_URL}${endpoint}?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) { setReportData(data); toast.success('ANALYTICS_CORE: Payload Processed'); }
      else toast.error(data.msg || 'ANALYTICS_ERR: Processing Rejected');
    } catch { toast.error('SYSTEM_FATAL: Communication Terminated'); }
    finally { setLoading(false); }
  };

  const exportReportToCSV = () => {
    if (!reportData) return;
    let csvContent = '';
    let fileName = '';
    if (reportType === 'exam-wise') {
      fileName = `EXAM_LOG_${reportData.exam?.title || 'MANIFEST'}.csv`;
      csvContent = [['Name', 'Roll#', 'Course', 'Batch', 'Marks', 'Total', '%', 'Grade', 'Status', 'Time'],
        ...reportData.results.map(r => [r.studentId?.name || 'N/A', r.studentId?.rollNumber || 'N/A', r.studentId?.course || 'N/A', r.studentId?.batch || 'N/A', r.marksObtained, r.totalMarks, r.percentage + '%', r.grade, r.isPassed ? 'Passed' : 'Failed', r.timeTaken || 0])]
        .map(row => row.join(',')).join('\n');
    } else {
      fileName = `DOMAIN_REPORTS_${reportType}_${Date.now()}.csv`;
      csvContent = [['Title', 'Date', 'Students', 'Passed', 'Failed', 'Rate', 'Avg', 'High', 'Low'],
        ...(Array.isArray(reportData) ? reportData : []).map(e => [e.examTitle, new Date(e.examDate).toLocaleDateString(), e.totalStudents, e.passedStudents, e.failedStudents, e.passRate + '%', e.averageScore, e.highestScore, e.lowestScore])]
        .map(row => row.join(',')).join('\n');
    }
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
  };

  /* ── Style tokens ── */
  const selInp = {
    width: '100%', background: '#f1f5f9', border: 'none',
    borderRadius: 14, padding: '12px 16px', fontSize: 11, fontWeight: 900,
    color: '#334155', outline: 'none', textTransform: 'uppercase',
    letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'inherit',
    boxSizing: 'border-box', appearance: 'none',
  };
  const selWithIcon = { ...selInp, paddingLeft: 40 };
  const lbl = {
    display: 'block', fontSize: 10, fontWeight: 900, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6,
  };
  const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' };
  const thSt = { padding: '14px 16px', fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em', whiteSpace: 'nowrap' };

  const isExamWise = reportType === 'exam-wise';

  /* responsive table cols */
  const showGrade = !isMobile;
  const showTime = isDesktop;
  const showEnrolled = !isMobile;
  const showAvg = !isMobile;
  const showApex = isDesktop;

  return (
    <div style={{ paddingBottom: 60, marginTop: 20, fontFamily: 'sans-serif', userSelect: 'none', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
        background: '#fff', padding: isMobile ? 16 : 24,
        borderRadius: 24, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', gap: 14,
        position: 'relative', overflow: 'hidden',
      }}>
        <Globe size={110} color="#0f172a" style={{ position: 'absolute', top: -10, right: -10, opacity: 0.03, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
          <div style={{ width: isMobile ? 44 : 56, height: isMobile ? 44 : 56, borderRadius: 18, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 20px rgba(15,23,42,0.2)', flexShrink: 0 }}>
            <Database size={isMobile ? 20 : 28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 21, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Exam Analytics</h1>
            <p style={{ margin: '5px 0 0', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Activity size={9} color="#3b82f6" /> Data Intelligence & Export Unit
            </p>
          </div>
        </div>

        {reportData && (
          <button onClick={exportReportToCSV}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 14,
              padding: '12px 22px', fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '0.16em', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.25)',
              position: 'relative', zIndex: 1,
              width: isMobile ? '100%' : 'auto',
            }}>
            <DownloadCloud size={16} /> EXPORT_EXTRACT
          </button>
        )}
      </div>

      {/* ── FILTER MATRIX ── */}
      <div style={card}>
        <div style={{ background: '#0f172a', padding: '12px 18px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings2 size={13} color="#60a5fa" />
          <h3 style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Filters & Configuration</h3>
        </div>

        <div style={{ padding: isMobile ? 14 : 22 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isExamWise
              ? (isMobile ? '1fr' : isDesktop ? '200px 1fr auto' : '1fr 1fr')
              : (isMobile ? '1fr' : isDesktop ? '1fr 1fr 1fr auto' : '1fr 1fr'),
            gap: isMobile ? 14 : 16,
            alignItems: 'end',
          }}>

            {/* Report Protocol */}
            <div>
              <label style={lbl}>REPORT_PROTOCOL</label>
              <div style={{ position: 'relative' }}>
                <Layers size={14} color="#94a3b8" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <select value={reportType}
                  onChange={e => { setReportType(e.target.value); setReportData(null); }}
                  style={selWithIcon}>
                  <option value="exam-wise">EXAM_TELEMETRY</option>
                  <option value="course-wise">DOMAIN_MAPPING</option>
                  <option value="batch-wise">BATCH_DYNAMICS</option>
                  <option value="date-range">TEMPORAL_WINDOW</option>
                </select>
              </div>
            </div>

            {/* Exam-wise: Target Identifier */}
            {isExamWise && (
              <div style={{ gridColumn: isMobile ? '1' : isDesktop ? '2' : '1 / -1' }}>
                <label style={lbl}>TARGET_IDENTIFIER</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} style={selWithIcon}>
                    <option value="">SCAN_FOR_MANIFEST</option>
                    {exams.map(e => <option key={e._id} value={e._id}>{e.title} // {e.course}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Non-exam-wise: Course + Batch */}
            {!isExamWise && (
              <>
                <div>
                  <label style={lbl}>Select Course</label>
                  <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={selInp}>
                    <option value="">ALL_COURSES</option>
                    {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Select Batch</label>
                  <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={selInp}>
                    <option value="">ALL_BATCHES</option>
                    {batches.map(b => (
                      <option key={b._id} value={b.name}>
                        {b.name} ({b.startTime} - {b.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Generate button */}
            <button onClick={handleGenerateReport} disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#0f172a', color: '#fff', border: 'none', borderRadius: 14,
                padding: '13px 22px', fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.14em', cursor: 'pointer', opacity: loading ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(15,23,42,0.2)',
                width: isMobile ? '100%' : 'auto',
                gridColumn: isMobile ? '1' : 'auto',
              }}>
              {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Cpu size={14} color="#818cf8" />}
              {loading ? 'SCANNING...' : 'Generate Report'}
            </button>
          </div>

          {/* Date range extra row */}
          {reportType === 'date-range' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? 14 : 16,
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid #f8fafc',
            }}>
              {[
                { label: 'TEMPORAL_START', key: 'startDate' },
                { label: 'TEMPORAL_END', key: 'endDate' },
              ].map(f => (
                <div key={f.key}>
                  <label style={lbl}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={13} color="#94a3b8" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type="date" value={dateRange[f.key]}
                      onChange={e => setDateRange(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={selWithIcon} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RESULTS ── */}
      {reportData && !loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Exam-wise: stat cards + results table */}
          {isExamWise ? (
            <>
              {/* Stats row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : isDesktop ? '1fr 1fr 1fr 1fr' : '1fr 1fr',
                gap: isMobile ? 10 : 16,
              }}>
                {[
                  { label: 'ENROLLMENT_UNIT', value: reportData.statistics.totalStudents, icon: Users, color: '#4f46e5', bg: '#eef2ff' },
                  { label: 'SUCCESS_VECTOR', value: `${reportData.statistics.passRate}%`, icon: CheckCircle2, color: '#059669', bg: '#ecfdf5' },
                  { label: 'MEAN_AMPLITUDE', value: reportData.statistics.averageScore, icon: TrendingUp, color: '#2563eb', bg: '#eff6ff' },
                  { label: 'TEMPORAL_STAMP', value: new Date(reportData.exam.examDate).toLocaleDateString(), icon: Clock, color: '#475569', bg: '#f8fafc' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#fff', padding: isMobile ? '16px 14px' : '22px 20px', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <s.icon size={16} color={s.color} />
                    </div>
                    <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{s.label}</p>
                    <h4 style={{ margin: '6px 0 0', fontSize: isMobile ? 20 : 24, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{s.value}</h4>
                  </div>
                ))}
              </div>

              {/* Results table / mobile cards */}
              <div style={card}>
                {isMobile ? (
                  <div>
                    {reportData.results.map(r => (
                      <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid #f8fafc' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: 13, fontWeight: 900, flexShrink: 0 }}>
                          {r.studentId?.name?.charAt(0) || '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.studentId?.name || 'Unknown'}</p>
                          <p style={{ margin: '3px 0 0', fontSize: 9, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace', textTransform: 'uppercase' }}>ID_{r.studentId?.rollNumber || 'NULL'}</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#0f172a' }}>{r.percentage}%</p>
                          <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 6, border: '1px solid', textTransform: 'uppercase', background: r.isPassed ? '#ecfdf5' : '#fff1f2', color: r.isPassed ? '#059669' : '#e11d48', borderColor: r.isPassed ? '#a7f3d0' : '#fecdd3' }}>
                            {r.isPassed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <tr>
                          <th style={thSt}>Entity_Identifier</th>
                          <th style={{ ...thSt, textAlign: 'center' }}>Magnitude</th>
                          {showGrade && <th style={{ ...thSt, textAlign: 'center' }}>Class_Vector</th>}
                          <th style={{ ...thSt, textAlign: 'center' }}>Status_Log</th>
                          {showTime && <th style={{ ...thSt, textAlign: 'right' }}>Time_Unit</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.results.map(r => (
                          <tr key={r._id} style={{ borderBottom: '1px solid #f8fafc' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(238,242,255,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#0f172a', border: '2px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>
                                  {r.studentId?.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: '#1e293b' }}>{r.studentId?.name || 'Unknown'}</p>
                                  <p style={{ margin: '2px 0 0', fontSize: 9, color: '#94a3b8', fontFamily: 'monospace', textTransform: 'uppercase' }}>ID_{r.studentId?.rollNumber || 'NULL'}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 17, fontWeight: 900, color: '#334155' }}>{r.percentage}%</td>
                            {showGrade && <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 900, color: '#4f46e5', letterSpacing: '0.1em' }}>{r.grade}</td>}
                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                              <span style={{ fontSize: 9, fontWeight: 900, padding: '3px 10px', borderRadius: 8, border: '1px solid', textTransform: 'uppercase', letterSpacing: '0.1em', background: r.isPassed ? '#ecfdf5' : '#fff1f2', color: r.isPassed ? '#059669' : '#e11d48', borderColor: r.isPassed ? '#a7f3d0' : '#fecdd3' }}>
                                {r.isPassed ? 'PASS' : 'FAIL'}
                              </span>
                            </td>
                            {showTime && <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 10, fontWeight: 900, color: '#94a3b8', letterSpacing: '0.08em' }}>{r.timeTaken || 0} MIN</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Non-exam-wise results table */
            <div style={card}>
              {isMobile ? (
                <div>
                  {(Array.isArray(reportData) ? reportData : []).map((exam, i) => (
                    <div key={i} style={{ padding: '13px 16px', borderBottom: '1px solid #f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.examTitle}</p>
                          <p style={{ margin: '3px 0 0', fontSize: 9, fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{new Date(exam.examDate).toLocaleDateString()}</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                          <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: '#059669' }}>{exam.passRate}%</p>
                          <p style={{ margin: '2px 0 0', fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>pass rate</p>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {[
                          { label: 'Students', val: `${exam.totalStudents} UNIT` },
                          { label: 'Avg Score', val: exam.averageScore },
                          { label: 'Highest', val: exam.highestScore },
                        ].map((cell, ci) => (
                          <div key={ci} style={{ background: '#f8fafc', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{cell.label}</p>
                            <p style={{ margin: '3px 0 0', fontSize: 12, fontWeight: 900, color: '#0f172a' }}>{cell.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      <tr>
                        <th style={thSt}>Manifest_Title</th>
                        {showEnrolled && <th style={{ ...thSt, textAlign: 'center' }}>Enrolled</th>}
                        <th style={{ ...thSt, textAlign: 'center' }}>Success_Rate</th>
                        {showAvg && <th style={{ ...thSt, textAlign: 'center' }}>Amplitude_Avg</th>}
                        {showApex && <th style={{ ...thSt, textAlign: 'right' }}>Apex_Unit</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(reportData) ? reportData : []).map((exam, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(238,242,255,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '14px 16px' }}>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{exam.examTitle}</p>
                            <p style={{ margin: '3px 0 0', fontSize: 9, fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{new Date(exam.examDate).toLocaleDateString()}</p>
                          </td>
                          {showEnrolled && <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 900, color: '#334155' }}>{exam.totalStudents} UNIT</td>}
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                              <span style={{ fontSize: 12, fontWeight: 900, color: '#059669', letterSpacing: '0.06em' }}>{exam.passRate}%</span>
                              <div style={{ width: 80, height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#10b981', width: `${exam.passRate}%` }} />
                              </div>
                            </div>
                          </td>
                          {showAvg && <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 17, fontWeight: 900, color: '#1e293b' }}>{exam.averageScore}</td>}
                          {showApex && (
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, color: '#4f46e5', fontWeight: 900, fontSize: 14 }}>
                                <ArrowUpRight size={14} /> {exam.highestScore}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ── EMPTY STATE ── */
        <div style={{
          background: '#fff', padding: isMobile ? '48px 20px' : '80px 40px',
          textAlign: 'center', borderRadius: isMobile ? 16 : 24,
          border: '3px dashed #f1f5f9',
        }}>
          <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 28px' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(79,70,229,0.05)', animation: 'ping 2s infinite' }} />
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f8fafc', border: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <BarChart3 size={36} color="#e2e8f0" />
            </div>
          </div>
          <h3 style={{ margin: 0, fontSize: isMobile ? 14 : 18, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.2em' }}>INIT_CORE_SCAN</h3>
          <p style={{ margin: '14px auto 0', fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', lineHeight: 1.7, maxWidth: 360 }}>
            Configure the temporal range and filter parameters to generate architecture telemetry
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 28 }}>
            {[1, 2, 3].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0' }} />)}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0; transform: scale(1.6); } }
      `}</style>
    </div>
  );
}