import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import {
  Calendar, Clock, Layers, List, Trash2, CheckCircle2,
  HelpCircle, Type, Hash, Save, Layout, Activity,
  Plus, Minus, Settings, Zap,
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

export default function CreateExam({ token }) {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examData, setExamData] = useState({
    title: '', description: '', course: '', batch: 'ALL_BATCHES', examDate: '',
    startTime: '', endTime: '', duration: '', totalMarks: '', passingMarks: '',
    instructions: [''], allowLateSubmission: false,
    showResultsImmediately: false, randomizeQuestions: false,
  });
  const [questions, setQuestions] = useState([{
    type: 'mcq', question: '', options: ['', '', '', ''], correctAnswer: '', marks: 1,
  }]);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, studentsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/courses/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/students/get`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const coursesData = await coursesRes.json();
        const studentsData = await studentsRes.json();
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setBatches([...new Set(studentsData.map(s => s.batch))].filter(Boolean));
      } catch { toast.error('Registry Synchronization Error'); }
    };
    if (token) fetchData();
  }, [token]);

  const handleExamDataChange = (field, value) =>
    setExamData(prev => ({ ...prev, [field]: value }));

  const handleInstructionChange = (index, value) => {
    const n = [...examData.instructions]; n[index] = value;
    setExamData(prev => ({ ...prev, instructions: n }));
  };
  const addInstruction = () => setExamData(prev => ({ ...prev, instructions: [...prev.instructions, ''] }));
  const removeInstruction = (index) => setExamData(prev => ({ ...prev, instructions: prev.instructions.filter((_, i) => i !== index) }));

  const handleQuestionChange = (index, field, value) => {
    const n = [...questions]; n[index] = { ...n[index], [field]: value }; setQuestions(n);
  };
  const handleOptionChange = (qi, oi, value) => {
    const n = [...questions]; n[qi].options[oi] = value; setQuestions(n);
  };
  const addQuestion = () => setQuestions([...questions, { type: 'mcq', question: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 }]);
  const removeQuestion = (index) => setQuestions(questions.filter((_, i) => i !== index));
  const addOption = (qi) => { const n = [...questions]; n[qi].options.push(''); setQuestions(n); };
  const removeOption = (qi, oi) => { const n = [...questions]; n[qi].options.splice(oi, 1); setQuestions(n); };
  const calculateTotalMarks = () => questions.reduce((t, q) => t + parseInt(q.marks || 0), 0);

  const handleSubmitExam = async () => {
    if (!examData.title || !examData.course || !examData.batch || !examData.examDate)
      return toast.error('Incomplete Parameters: Mandatory fields missing');
    if (questions.length === 0)
      return toast.error('Logical Error: Must contain at least one question');
    try {
      setLoading(true);
      const payload = {
        ...examData, totalMarks: calculateTotalMarks(),
        questions: questions.map((q, i) => ({ ...q, order: i + 1, options: q.type === 'mcq' ? q.options.filter(o => o.trim()) : [] })),
        instructions: examData.instructions.filter(i => i.trim()),
      };
      const res = await fetch(`${API_BASE_URL}/exams/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Protocol Successful: Exam entity deployed');
        setExamData({ title: '', description: '', course: '', batch: 'ALL_BATCHES', examDate: '', startTime: '', endTime: '', duration: '', totalMarks: '', passingMarks: '', instructions: [''], allowLateSubmission: false, showResultsImmediately: false, randomizeQuestions: false });
        setQuestions([{ type: 'mcq', question: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 }]);
      } else toast.error('Deployment Failed: Mainframe rejected payload');
    } catch { toast.error('System Error: Communication pipeline broken'); }
    finally { setLoading(false); }
  };

  /* ── Style tokens ── */
  const inp = {
    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 12, padding: '9px 14px', fontSize: 12, fontWeight: 600,
    color: '#334155', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', textTransform: 'uppercase',
  };
  const lbl = {
    display: 'block', fontSize: 10, fontWeight: 900, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5,
  };
  const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' };
  const lightHdr = {
    padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  };
  const darkHdr = {
    padding: '12px 18px', background: '#0f172a',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  };
  const hdrTxt = { margin: 0, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em' };
  const g2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };

  const TOGGLE_OPTS = [
    { label: 'Late Entry', key: 'allowLateSubmission' },
    { label: 'Instant Result', key: 'showResultsImmediately' },
    { label: 'Random Order', key: 'randomizeQuestions' },
  ];

  return (
    <div style={{ paddingBottom: 60, fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
        background: '#fff', padding: isMobile ? 14 : 18,
        borderRadius: 18, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
            <Layout size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 16 : 20, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Entity Architect</h1>
            <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Plus size={9} color="#3b82f6" /> Administrative Protocol / Full Manifest Builder
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          paddingLeft: isMobile ? 0 : 20,
          borderLeft: isMobile ? 'none' : '1px solid #f1f5f9',
          borderTop: isMobile ? '1px solid #f1f5f9' : 'none',
          paddingTop: isMobile ? 12 : 0, marginTop: isMobile ? 4 : 0,
          width: isMobile ? '100%' : 'auto',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Total Payload</p>
            <p style={{ margin: '3px 0 0', fontSize: 15, fontWeight: 900, color: '#0f172a' }}>{calculateTotalMarks()} Units</p>
          </div>
          <button onClick={handleSubmitExam} disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, background: '#0f172a', color: '#fff',
              border: 'none', borderRadius: 12, padding: '10px 18px', fontSize: 10, fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer',
              opacity: loading ? 0.6 : 1, boxShadow: '0 4px 14px rgba(15,23,42,0.2)',
              flex: isMobile ? '1' : 'none', justifyContent: 'center',
            }}>
            {loading ? <Activity size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />}
            {loading ? 'ARCHIVING...' : 'COMMIT_DEPLOYMENT'}
          </button>
        </div>
      </div>

      {/* ── INFRASTRUCTURE SPECIFICATION ── */}
      <div style={card}>
        <div style={lightHdr}>
          <h3 style={{ ...hdrTxt, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={13} color="#3b82f6" /> Infrastructure Specification
          </h3>
        </div>
        <div style={{ padding: isMobile ? 14 : 22 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1fr 1fr 1fr' : '1fr',
            gap: isDesktop ? 0 : 20,
          }}>

            {/* Layer 01: Identification */}
            {[
              {
                num: '01', label: 'Identification Layer',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={lbl}>Manifest Designation</label>
                      <input type="text" style={inp} placeholder="e.g. SEMESTER_III_CORE"
                        value={examData.title} onChange={e => handleExamDataChange('title', e.target.value)} />
                    </div>
                    <div>
                      <label style={lbl}>Annotation (Desc)</label>
                      <textarea style={{ ...inp, minHeight: 80, resize: 'vertical', textTransform: 'none', fontWeight: 500 }}
                        placeholder="System notes..."
                        value={examData.description} onChange={e => handleExamDataChange('description', e.target.value)} />
                    </div>
                  </div>
                ),
              },
              {
                num: '02', label: 'Parameter Matrix',
                border: true,
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={lbl}>Target Domain</label>
                      <select style={inp} value={examData.course} onChange={e => handleExamDataChange('course', e.target.value)}>
                        <option value="">DOMAIN_NULL</option>
                        {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Sequence (Batch)</label>
                      <select style={inp} value={examData.batch} onChange={e => handleExamDataChange('batch', e.target.value)}>
                        <option value="ALL_BATCHES">ALL_BATCHES</option>
                        {batches.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div style={g2}>
                      <div>
                        <label style={lbl}>Duration (M)</label>
                        <input type="number" style={{ ...inp, textAlign: 'center' }} placeholder="0"
                          value={examData.duration} onChange={e => handleExamDataChange('duration', e.target.value)} />
                      </div>
                      <div>
                        <label style={lbl}>Threshold (%)</label>
                        <input type="number" style={{ ...inp, textAlign: 'center' }} placeholder="40"
                          value={examData.passingMarks} onChange={e => handleExamDataChange('passingMarks', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                num: '03', label: 'Temporal Window',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={lbl}>Deployment Date</label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={11} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="date" style={{ ...inp, paddingLeft: 30 }}
                          value={examData.examDate} onChange={e => handleExamDataChange('examDate', e.target.value)} />
                      </div>
                    </div>
                    <div style={g2}>
                      <div>
                        <label style={lbl}>Activation</label>
                        <div style={{ position: 'relative' }}>
                          <Clock size={11} color="#94a3b8" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                          <input type="time" style={{ ...inp, paddingLeft: 28 }}
                            value={examData.startTime} onChange={e => handleExamDataChange('startTime', e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label style={lbl}>Termination</label>
                        <div style={{ position: 'relative' }}>
                          <Clock size={11} color="#94a3b8" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                          <input type="time" style={{ ...inp, paddingLeft: 28 }}
                            value={examData.endTime} onChange={e => handleExamDataChange('endTime', e.target.value)} />
                        </div>
                      </div>
                    </div>
                    {/* Toggle options */}
                    <div style={{ background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe', padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <Zap size={10} color="#3b82f6" />
                        <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Automatic Serialization</p>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {TOGGLE_OPTS.map(opt => (
                          <button key={opt.key} type="button"
                            onClick={() => handleExamDataChange(opt.key, !examData[opt.key])}
                            style={{ fontSize: 9, fontWeight: 900, padding: '3px 9px', borderRadius: 7, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s', textTransform: 'uppercase', background: examData[opt.key] ? '#2563eb' : '#fff', color: examData[opt.key] ? '#fff' : '#93c5fd', borderColor: examData[opt.key] ? '#2563eb' : '#bfdbfe' }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              },
            ].map((layer, li) => (
              <div key={li} style={{
                padding: isDesktop ? '0 24px' : '0',
                borderLeft: isDesktop && li > 0 ? '1px solid #f1f5f9' : 'none',
                borderTop: !isDesktop && li > 0 ? '1px solid #f1f5f9' : 'none',
                paddingTop: !isDesktop && li > 0 ? 20 : 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, flexShrink: 0 }}>{layer.num}</span>
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{layer.label}</span>
                </div>
                {layer.content}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INSTRUCTIONS ── */}
      <div style={card}>
        <div style={lightHdr}>
          <h3 style={{ ...hdrTxt, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <List size={13} color="#6366f1" /> Administrative Directives
          </h3>
          <button onClick={addInstruction}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a', padding: '5px 12px', borderRadius: 8, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>
            <Plus size={9} /> Append Directive
          </button>
        </div>
        <div style={{ padding: isMobile ? 14 : 20 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isDesktop ? '1fr 1fr 1fr' : '1fr 1fr',
            gap: 12,
          }}>
            {examData.instructions.map((inst, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 9, fontWeight: 900, color: '#cbd5e1' }}>#{i + 1}</span>
                  <input type="text" value={inst} onChange={e => handleInstructionChange(i, e.target.value)}
                    placeholder="Enter directive..."
                    style={{ ...inp, paddingLeft: 30, textTransform: 'none', fontSize: 11, fontWeight: 500 }} />
                </div>
                <button onClick={() => removeInstruction(i)}
                  style={{ width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid #f1f5f9', borderRadius: 10, color: '#cbd5e1', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#e11d48'; e.currentTarget.style.background = '#fff1f2'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'none'; }}>
                  <Minus size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── QUESTIONS ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Curriculum Blueprint</h3>
              <p style={{ margin: '3px 0 0', fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{questions.length} Logical nodes registered</p>
            </div>
          </div>
          <button onClick={addQuestion}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 18px', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
            <Plus size={13} /> Register Node
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {questions.map((question, qi) => (
            <div key={qi} style={card}>
              {/* Question card dark header */}
              <div style={{ ...darkHdr }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900 }}>{qi + 1}</span>
                  <span style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Logic Node Specification</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1e293b', padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Hash size={9} color="#60a5fa" />
                    <input type="number" value={question.marks} min="1"
                      onChange={e => handleQuestionChange(qi, 'marks', parseInt(e.target.value) || 1)}
                      style={{ background: 'transparent', border: 'none', fontSize: 10, fontWeight: 900, color: '#fff', width: 30, outline: 'none', padding: 0, fontFamily: 'inherit' }} />
                    <span style={{ fontSize: 8, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Weight</span>
                  </div>
                  <button onClick={() => removeQuestion(qi)}
                    style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 4 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                    onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ padding: isMobile ? 14 : 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Question text + type selector */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Type size={11} color="#3b82f6" />
                      <label style={lbl}>Question String Domain</label>
                    </div>
                    <select value={question.type} onChange={e => handleQuestionChange(qi, 'type', e.target.value)}
                      style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 10px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <option value="mcq">LOGIC_MCQ</option>
                      <option value="descriptive">LOGIC_DESCRIPTIVE</option>
                      <option value="short-answer">LOGIC_SHORT</option>
                    </select>
                  </div>
                  <textarea value={question.question} onChange={e => handleQuestionChange(qi, 'question', e.target.value)}
                    placeholder="Specify the inquiry logic..."
                    style={{ ...inp, minHeight: 90, resize: 'vertical', fontSize: 14, fontWeight: 700, textTransform: 'none', letterSpacing: 0 }} />
                </div>

                <div style={{ height: 1, background: '#f1f5f9' }} />

                {/* MCQ Options */}
                {question.type === 'mcq' ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <CheckCircle2 size={11} color="#10b981" />
                        <label style={lbl}>Solution Matrix</label>
                      </div>
                      <button onClick={() => addOption(qi)}
                        style={{ fontSize: 9, fontWeight: 900, color: '#2563eb', background: '#eff6ff', border: 'none', padding: '4px 10px', borderRadius: 7, cursor: 'pointer', textTransform: 'uppercase' }}>
                        + Register Result Node
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                      {question.options.map((opt, oi) => {
                        const isCorrect = question.correctAnswer === oi.toString();
                        return (
                          <div key={oi} style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '4px 0 0 4px', background: isCorrect ? '#10b981' : '#e2e8f0', transition: 'background 0.15s' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', borderRadius: 12, border: `1px solid ${isCorrect ? '#a7f3d0' : '#f1f5f9'}`, padding: '10px 12px', paddingLeft: 18, transition: 'border-color 0.15s' }}>
                              <input type="radio" name={`correct-${qi}`}
                                checked={isCorrect}
                                onChange={() => handleQuestionChange(qi, 'correctAnswer', oi.toString())}
                                style={{ width: 16, height: 16, accentColor: '#10b981', flexShrink: 0, cursor: 'pointer' }} />
                              <input type="text" value={opt} onChange={e => handleOptionChange(qi, oi, e.target.value)}
                                placeholder={`Result Node 0${oi + 1}`}
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontWeight: 700, color: '#334155', fontFamily: 'inherit', minWidth: 0 }} />
                              {question.options.length > 2 && (
                                <button onClick={() => removeOption(qi, oi)}
                                  style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', flexShrink: 0 }}
                                  onMouseEnter={e => e.currentTarget.style.color = '#e11d48'}
                                  onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                                  <Minus size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                      <HelpCircle size={11} color="#6366f1" />
                      <label style={lbl}>Solution Reference (Internal)</label>
                    </div>
                    <textarea value={question.correctAnswer || ''} onChange={e => handleQuestionChange(qi, 'correctAnswer', e.target.value)}
                      placeholder="Specify the expected logical result for evaluator reference..."
                      style={{ ...inp, minHeight: 80, resize: 'vertical', background: 'rgba(238,242,255,0.5)', borderColor: '#c7d2fe', fontSize: 11, fontWeight: 500, textTransform: 'none' }} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add node footer */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
            <button onClick={addQuestion}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'none'; }}>
                <Plus size={22} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Append architectural node</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}