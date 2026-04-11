import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import {
  Calendar, Clock, Layers, Database, Activity,
  ChevronRight, Save, Loader2, Settings2,
  Zap, Trophy, ShieldCheck, User, Users, Search
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

export default function ScheduleExam({ token }) {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    title: '', description: '', course: '', batch: 'ALL_BATCHES',
    examDate: '', startTime: '', endTime: '', duration: '',
    passingPercentage: 40, totalExamMarks: 0,
    instructions: ['Read all questions carefully.', 'No negative marking.'],
    allowLateSubmission: false, showResultsImmediately: true, randomizeQuestions: true,
    automaticSerialization: true,
  });
  const [groupId, setGroupId] = useState('');
  const [fetchedQuestions, setFetchedQuestions] = useState([]);
  
  const [schedulingType, setSchedulingType] = useState('batch'); // 'batch' | 'student'
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  const groupTotalMarks = fetchedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const totalMarks = scheduleData.totalExamMarks > 0 ? scheduleData.totalExamMarks : groupTotalMarks;
  const passingMarks = Math.ceil((totalMarks * (scheduleData.passingPercentage || 0)) / 100);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const [coursesRes, batchesRes, groupsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/courses`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/batches`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/question-groups`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const coursesData = await coursesRes.json();
        const batchesData = await batchesRes.json();
        const groupsData = await groupsRes.json();
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setGroups(Array.isArray(groupsData) ? groupsData : []);
        setBatches(Array.isArray(batchesData) ? batchesData : []);
      } catch { toast.error('Data Sync Failure'); }
      finally { setLoading(false); }
    };
    fetchMetadata();
  }, [token]);
 
  useEffect(() => {
    const fetchStudents = async () => {
      if (!token || schedulingType !== 'student') return;
      try {
        const res = await fetch(`${API_BASE_URL}/students/get`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setAllStudents(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to fetch students');
      }
    };
    fetchStudents();
  }, [token, schedulingType]);

  useEffect(() => {
    if (groupId && token) {
      const fetchQuestions = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/questions?groupId=${groupId}&limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setFetchedQuestions(data.questions || []);
          if (data.questions?.length > 0)
            toast.info(`${data.questions.length} Question Vectors Synchronized`);
        } catch { toast.error('Inquiry Fetch Failure'); }
      };
      fetchQuestions();
    } else {
      setFetchedQuestions([]);
    }
  }, [groupId, token]);

  const handleInputChange = (field, value) =>
    setScheduleData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isBatchValid = schedulingType === 'batch' && scheduleData.batch;
    const isStudentValid = schedulingType === 'student' && selectedStudents.length > 0;

    if (!scheduleData.title || !scheduleData.course || (!isBatchValid && !isStudentValid) || !scheduleData.examDate || !scheduleData.startTime || !scheduleData.endTime)
      return toast.error('PROTOCOL_ERROR: Required Fields Missing');
    if (fetchedQuestions.length === 0)
      return toast.error('PROTOCOL_ERROR: Question Array Empty');
    try {
      setSubmitting(true);
      const payload = {
        ...scheduleData, 
        totalMarks, 
        passingMarks,
        batch: schedulingType === 'batch' ? scheduleData.batch : '',
        assignedStudents: schedulingType === 'student' ? selectedStudents : [],
        questions: fetchedQuestions.map(q => ({
          type: q.type, question: q.question,
          options: q.options, correctAnswer: q.correctAnswer, marks: q.marks,
        })),
      };
      const res = await fetch(`${API_BASE_URL}/exams/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Assessment Scheduled Successfully');
        toast.info('Manifest Decrypted: Admit Cards Issued Automatically');
        setScheduleData({
          title: '', description: '', course: '', batch: 'ALL_BATCHES', examDate: '',
          startTime: '', endTime: '', duration: '', passingPercentage: 40, totalExamMarks: 0,
          instructions: ['Read all questions carefully.', 'No negative marking.'],
          allowLateSubmission: false, showResultsImmediately: true, randomizeQuestions: true,
          automaticSerialization: true,
        });
        setGroupId(''); 
        setFetchedQuestions([]);
        setSelectedStudents([]);
      } else {
        const data = await res.json();
        toast.error(data.msg || 'Scheduling Operation Failed');
      }
    } catch { toast.error('Transmission Protocol Error'); }
    finally { setSubmitting(false); }
  };

  /* ── Style tokens ── */
  const inp = {
    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 12, padding: '10px 14px', fontSize: 12, fontWeight: 700,
    color: '#334155', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', textTransform: 'uppercase',
  };
  const lbl = {
    display: 'block', fontSize: 9, fontWeight: 900, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6,
  };
  const sectionCard = {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 16, overflow: 'hidden',
  };
  const darkHeader = {
    background: '#0f172a', padding: '14px 20px',
    borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 8,
  };
  const lightHeader = {
    background: '#f8fafc', padding: '14px 20px',
    borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8,
  };
  const headerText = { margin: 0, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.16em' };
  const g2 = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 14 : 20 };
  const g4 = { display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : isDesktop ? '1fr 1fr 1fr 1fr' : '1fr 1fr', gap: isMobile ? 12 : 16 };

  return (
    <div style={{ paddingBottom: 60, marginTop: 20, fontFamily: 'sans-serif', userSelect: 'none' }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
        background: '#fff', padding: isMobile ? 16 : 22,
        borderRadius: 20, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', gap: 14, marginBottom: 22,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: isMobile ? 44 : 54, height: isMobile ? 44 : 54, borderRadius: 14,
            background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 8px 20px rgba(37,99,235,0.25)', flexShrink: 0,
          }}>
            <Calendar size={isMobile ? 20 : 26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 21, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Schedule Exam
            </h1>
            <p style={{ margin: '5px 0 0', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Activity size={9} color="#3b82f6" /> Assessment Scheduling Module
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12 }}>
          <ShieldCheck size={14} color="#10b981" />
          <span style={{ fontSize: 10, fontWeight: 900, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status: OPERATIONAL</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── MAIN GRID: left/center + right sidebar ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '1fr 1fr 340px' : '1fr',
          gap: isMobile ? 16 : 20,
          alignItems: 'start',
        }}>

          {/* ── EXAM CONFIGURATION ── */}
          <div style={{ ...sectionCard, gridColumn: isDesktop ? 'span 2' : '1' }}>
            <div style={darkHeader}>
              <Settings2 size={13} color="#60a5fa" />
              <h3 style={{ ...headerText, color: '#fff' }}>Exam Configuration</h3>
            </div>
            <div style={{ padding: isMobile ? 16 : 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Title */}
              <div>
                <label style={lbl}>Exam Title</label>
                <input type="text" style={inp} placeholder="Enter Exam Title..."
                  value={scheduleData.title}
                  onChange={e => handleInputChange('title', e.target.value)} />
              </div>
              {/* Selection Type Toggle */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => setSchedulingType('batch')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 12, fontSize: 10, fontWeight: 900,
                    textTransform: 'uppercase', cursor: 'pointer',
                    background: schedulingType === 'batch' ? '#0f172a' : '#f1f5f9',
                    color: schedulingType === 'batch' ? '#fff' : '#64748b',
                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  <Users size={14} /> Batch Wise
                </button>
                <button
                  type="button"
                  onClick={() => setSchedulingType('student')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 12, fontSize: 10, fontWeight: 900,
                    textTransform: 'uppercase', cursor: 'pointer',
                    background: schedulingType === 'student' ? '#0f172a' : '#f1f5f9',
                    color: schedulingType === 'student' ? '#fff' : '#64748b',
                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  <User size={14} /> Student Wise
                </button>
              </div>

              {/* Course + Batch/Student Selection */}
              <div style={g2}>
                <div>
                  <label style={lbl}>Select Course</label>
                  <select style={inp} value={scheduleData.course}
                    onChange={e => handleInputChange('course', e.target.value)}>
                    <option value="">SELECT_COURSE</option>
                    {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                
                {schedulingType === 'batch' ? (
                  <div>
                    <label style={lbl}>Select Batch</label>
                    <select style={inp} value={scheduleData.batch}
                      onChange={e => handleInputChange('batch', e.target.value)}>
                      <option value="ALL_BATCHES">ALL_BATCHES</option>
                      {batches.map(b => (
                        <option key={b._id} value={b.name}>
                          {b.name} ({b.startTime} - {b.endTime})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label style={lbl}>Search Students</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        style={{ ...inp, paddingLeft: 34 }} 
                        placeholder="SEARCH BY NAME/EMAIL..."
                        value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                      />
                      <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Student Selection List (only in student mode) */}
              {schedulingType === 'student' && (
                <div style={{ marginTop: 10 }}>
                  <label style={lbl}>Select Students ({selectedStudents.length} selected)</label>
                  <div style={{ 
                    maxHeight: 200, overflowY: 'auto', border: '1px solid #e2e8f0', 
                    borderRadius: 12, padding: 8, background: '#f8fafc' 
                  }}>
                    {allStudents
                      .filter(s => 
                        (!scheduleData.course || s.course === scheduleData.course) &&
                        (!studentSearch || 
                          s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.email.toLowerCase().includes(studentSearch.toLowerCase()))
                      )
                      .map(student => (
                        <div 
                          key={student._id} 
                          onClick={() => {
                            if (selectedStudents.includes(student._id)) {
                              setSelectedStudents(selectedStudents.filter(id => id !== student._id));
                            } else {
                              setSelectedStudents([...selectedStudents, student._id]);
                            }
                          }}
                          style={{
                            padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 10, fontSize: 11,
                            background: selectedStudents.includes(student._id) ? '#dbeafe' : 'transparent',
                            marginBottom: 4, transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ 
                            width: 16, height: 16, borderRadius: 4, border: '2px solid #2563eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: selectedStudents.includes(student._id) ? '#2563eb' : 'transparent'
                          }}>
                            {selectedStudents.includes(student._id) && <ChevronRight size={10} color="#fff" />}
                          </div>
                          <div>
                            <span style={{ fontWeight: 800, color: '#1e293b' }}>{student.name}</span>
                            <span style={{ marginLeft: 8, color: '#64748b', fontSize: 9 }}>{student.email}</span>
                          </div>
                        </div>
                      ))}
                    {allStudents.length === 0 && (
                      <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 10, fontWeight: 700 }}>
                        NO STUDENTS FOUND
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Description */}
              <div>
                <label style={lbl}>Context / Description</label>
                <textarea style={{ ...inp, minHeight: 80, resize: 'vertical', fontWeight: 600, textTransform: 'none', lineHeight: 1.6 }}
                  placeholder="Provide high-level context for the assessment cohort..."
                  value={scheduleData.description}
                  onChange={e => handleInputChange('description', e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── QUESTION VECTOR (sidebar on desktop, full width on mobile/tablet) ── */}
          <div style={{ ...sectionCard, gridColumn: isDesktop ? '3' : '1', gridRow: isDesktop ? 'span 2' : 'auto' }}>
            <div style={darkHeader}>
              <Layers size={13} color="#60a5fa" />
              <h3 style={{ ...headerText, color: '#fff' }}>Select Questions</h3>
            </div>
            <div style={{ padding: isMobile ? 16 : 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Group selector */}
              <div>
                <label style={lbl}>Question Group</label>
                <select style={{ ...inp, background: !scheduleData.course ? '#f1f5f9' : '#f8fafc', cursor: !scheduleData.course ? 'not-allowed' : 'default' }}
                  value={groupId} onChange={e => setGroupId(e.target.value)}
                  disabled={!scheduleData.course}>
                  <option value="">SELECT_GROUP</option>
                  {groups.filter(g => !scheduleData.course || g.course === scheduleData.course).map(g => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Questions status box */}
              <div style={{
                background: '#f8fafc', borderRadius: 14, padding: 20,
                border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                minHeight: 160,
              }}>
                {fetchedQuestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.15)' }}>
                      <Zap size={26} color="#059669" />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase' }}>
                        {groupId ? groups.find(g => g._id === groupId)?.name : 'NONE'}
                      </p>
                      <p style={{ margin: '3px 0 0', fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                        Questions Found: {fetchedQuestions.length}
                      </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ margin: 0, fontSize: 8, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>Pool Weight</p>
                        <p style={{ margin: '3px 0 0', fontSize: 14, fontWeight: 900, color: '#1e293b' }}>{groupTotalMarks} MK</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: 8, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>Available</p>
                        <p style={{ margin: '3px 0 0', fontSize: 14, fontWeight: 900, color: '#1e293b' }}>
                          {fetchedQuestions.length} Q
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ opacity: 0.4 }}>
                    <Database size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                    <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No Vectors Loaded</p>
                  </div>
                )}
              </div>

              {/* Advanced Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Allow Late Entry', field: 'allowLateSubmission' },
                  { label: 'Show Results Instantly', field: 'showResultsImmediately' },
                  { label: 'Randomize Order', field: 'randomizeQuestions' },
                  { label: 'Serial Admission', field: 'automaticSerialization' },
                ].map(toggle => (
                  <div key={toggle.field} 
                    onClick={() => handleInputChange(toggle.field, !scheduleData[toggle.field])}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 12, background: '#f8fafc',
                      border: '1px solid #f1f5f9', cursor: 'pointer'
                    }}>
                    <span style={{ fontSize: 9, fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>{toggle.label}</span>
                    <div style={{
                      width: 28, height: 16, borderRadius: 20, background: scheduleData[toggle.field] ? '#2563eb' : '#cbd5e1',
                      position: 'relative', transition: 'all 0.2s'
                    }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3, left: scheduleData[toggle.field] ? 15 : 3,
                        transition: 'all 0.2s'
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Marks Override */}
              <div>
                <label style={lbl}>Target Exam Marks (Goal)</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" style={{ ...inp, paddingLeft: 34, color: '#2563eb' }} 
                    placeholder="SET TOTAL MARKS..."
                    value={scheduleData.totalExamMarks || ''}
                    onChange={e => handleInputChange('totalExamMarks', parseInt(e.target.value) || 0)}
                  />
                  <Trophy size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 8, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  {scheduleData.totalExamMarks > 0 ? 'SYSTEM WILL AUTO-PICK QUESTIONS TO MATCH GOAL' : 'USING FULL GROUP WEIGHT'}
                </p>
              </div>

              {/* Passing threshold slider */}
              <div style={{ background: '#2563eb', borderRadius: 14, padding: 18, color: '#fff', boxShadow: '0 8px 20px rgba(37,99,235,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                  <span>Passing Threshold</span>
                  <span style={{ color: '#bfdbfe' }}>{scheduleData.passingPercentage}%</span>
                </div>
                <input type="range" min="0" max="100" step="5"
                  value={scheduleData.passingPercentage}
                  onChange={e => handleInputChange('passingPercentage', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#fff', height: 4 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 10 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 8, fontWeight: 900, color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pass Score</p>
                    <p style={{ margin: '3px 0 0', fontSize: 18, fontWeight: 900, lineHeight: 1 }}>
                      {passingMarks} <span style={{ fontSize: 10 }}>MK</span>
                    </p>
                  </div>
                  <Trophy size={18} color="#bfdbfe" />
                </div>
              </div>
            </div>
          </div>

          {/* ── DATE & TIME ── */}
          <div style={{ ...sectionCard, gridColumn: isDesktop ? 'span 2' : '1' }}>
            <div style={lightHeader}>
              <Clock size={13} color="#2563eb" />
              <h3 style={{ ...headerText, color: '#0f172a' }}>Date & Time Settings</h3>
            </div>
            <div style={{ padding: isMobile ? 16 : 24 }}>
              <div style={g4}>
                {[
                  { label: 'Exam Date', field: 'examDate', type: 'date' },
                  { label: 'Start Point', field: 'startTime', type: 'time' },
                  { label: 'End Point', field: 'endTime', type: 'time' },
                  { label: 'Duration (Min)', field: 'duration', type: 'number', placeholder: '000' },
                ].map(f => (
                  <div key={f.field}>
                    <label style={lbl}>{f.label}</label>
                    <input type={f.type} required={f.type !== 'number'}
                      value={scheduleData[f.field]}
                      onChange={e => handleInputChange(f.field, e.target.value)}
                      placeholder={f.placeholder}
                      style={{ ...inp, textTransform: f.type === 'number' ? 'none' : 'uppercase', textAlign: f.type === 'number' ? 'center' : 'left' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── SUBMIT ── */}
        <div style={{ marginTop: 20 }}>
          <button type="submit" disabled={submitting}
            style={{
              width: '100%', background: '#2563eb', color: '#fff', border: 'none',
              borderRadius: 16, padding: isMobile ? '16px 0' : '18px 0',
              fontSize: 12, fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '0.2em', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              opacity: submitting ? 0.5 : 1,
              boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
            }}>
            {submitting
              ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
              : <ChevronRight size={17} />}
            {submitting ? 'PROCESSING...' : 'Schedule Exam'}
          </button>
          <p style={{ margin: '12px 0 0', fontSize: 8, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.1em' }}>
            Standard encryption protocols and audit logs will be generated upon confirmation
          </p>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}