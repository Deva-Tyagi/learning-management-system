import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import {
  Plus, Upload, Trash2, Filter, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Search, BookOpen, HelpCircle,
  Edit3, Activity, Layers, Settings2, Database, Scale,
  Check, Loader2,
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

export default function ManageQuestions({ token }) {
  const [questions, setQuestions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('view');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ groupId: '', course: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [manualQuestion, setManualQuestion] = useState({
    type: 'mcq', question: '', options: ['', '', '', ''],
    correctAnswer: '', marks: 1, groupId: '', course: '',
  });
  const [csvPreview, setCsvPreview] = useState([]);
  const [bulkMeta, setBulkMeta] = useState({ groupId: '', course: '' });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

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
        setCourses(await coursesRes.json());
        setGroups(await groupsRes.json());
      }
      await fetchQuestions(1);
    } catch { toast.error('Loading Error'); }
    finally { setLoading(false); }
  };

  const fetchQuestions = async (page = 1) => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({ ...filters, page, limit: 10, search: searchQuery });
      const res = await fetch(`${API_BASE_URL}/questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch { toast.error('Fetching Error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualQuestion.question || !manualQuestion.course)
      return toast.error('Error: Please fill all fields');
    try {
      setLoading(true);
      const payload = {
        ...manualQuestion,
        options: manualQuestion.type === 'mcq' ? manualQuestion.options.filter(o => o.trim()) : [],
      };
      const res = await fetch(`${API_BASE_URL}/questions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Added Successfully');
        setManualQuestion({ type: 'mcq', question: '', options: ['', '', '', ''], correctAnswer: '', marks: 1, groupId: '', course: '' });
        fetchQuestions(1);
        setActiveTab('view');
      } else {
        const data = await res.json();
        toast.error(data.msg || 'Saving Failed');
      }
    } catch { toast.error('Connection Error'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/questions/${editingQuestion._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingQuestion),
      });
      if (res.ok) {
        toast.success('Updated Successfully');
        setShowEditModal(false);
        setEditingQuestion(null);
        fetchQuestions(pagination.page);
      } else toast.error('Update Failed');
    } catch { toast.error('Saving Error'); }
    finally { setLoading(false); }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const lines = event.target.result.split('\n');
      const parsed = lines.slice(1).filter(line => line.trim()).map(line => {
        const v = line.split(',');
        return {
          type: v[0]?.trim() || 'mcq', question: v[1]?.trim() || '',
          options: v.slice(2, 6).map(opt => opt?.trim()).filter(opt => opt),
          correctAnswer: v[6]?.trim() || '', marks: parseInt(v[7]) || 1,
        };
      });
      setCsvPreview(parsed);
      toast.info(`File Checked: ${parsed.length} questions found`);
    };
    reader.readAsText(file);
  };

  const submitBulk = async () => {
    if (!bulkMeta.course) return toast.error('Error: Please select a course');
    if (csvPreview.length === 0) return toast.error('Error: Data is empty');
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/questions/bulk-add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questions: csvPreview, ...bulkMeta }),
      });
      if (res.ok) { toast.success('Upload Finished'); setCsvPreview([]); setActiveTab('view'); fetchQuestions(); }
      else toast.error('Upload Failed');
    } catch { toast.error('Upload Error'); }
    finally { setLoading(false); }
  };

  const downloadSampleCSV = () => {
    const headers = "type,question,option1,option2,option3,option4,correctAnswer,marks";
    const samples = [
      'mcq,"What is the capital of France?",Paris,London,Berlin,Madrid,0,1',
      'mcq,"Which planet is known as the Red Planet?",Earth,Mars,Jupiter,Venus,1,1',
      'mcq,"What is 2 + 2?",3,4,5,6,1,1',
      'descriptive,"Explain the process of photosynthesis.",,,,,Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll.,5',
      'short-answer,"What is the chemical symbol for water?",,,,,H2O,2'
    ];
    const csvContent = headers + "\n" + samples.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "bulk_questions_sample.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteQuestion = async (id) => {
    if (!confirm('Permanent deletion confirmed?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { toast.success('Record Deleted'); fetchQuestions(); }
    } catch { toast.error('Delete Failed'); }
    finally { setLoading(false); }
  };

  /* ── Style tokens ── */
  const inp = {
    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 12, padding: '10px 14px', fontSize: 11, fontWeight: 900,
    color: '#334155', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', textTransform: 'uppercase',
  };
  const lbl = {
    display: 'block', fontSize: 9, fontWeight: 900, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6,
  };
  const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' };
  const darkHdr = {
    background: '#0f172a', padding: '13px 18px', borderBottom: '1px solid #1e293b',
    display: 'flex', alignItems: 'center', gap: 8,
  };
  const hdrTxt = { margin: 0, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em' };
  const thSt = { padding: '12px 16px', fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em', whiteSpace: 'nowrap' };
  const g2 = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 14 : 20 };
  const g3 = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isDesktop ? '1fr 1fr 1fr' : '1fr 1fr', gap: isMobile ? 14 : 18 };

  const TABS = [
    { id: 'add', label: 'Add Question', icon: Plus },
    { id: 'bulk', label: 'Bulk Upload', icon: Upload },
    { id: 'view', label: 'Question List', icon: BookOpen },
  ];

  return (
    <div style={{ paddingBottom: 48, marginTop: 20, fontFamily: 'sans-serif' }}>

      {/* ── HEADER + TABS ── */}
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
        background: '#fff', padding: isMobile ? 14 : 18,
        borderRadius: 18, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', gap: 14, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
            <Database size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 16 : 20, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Question Bank
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Activity size={9} color="#3b82f6" /> Manage Questions and Assessments
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', background: '#f1f5f9', padding: 5,
          borderRadius: 14, border: '1px solid #e2e8f0',
          width: isMobile ? '100%' : 'auto', overflowX: 'auto',
        }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: isMobile ? '8px 12px' : '8px 18px',
                borderRadius: 10, fontSize: 10, fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: activeTab === tab.id ? '#fff' : 'transparent',
                color: activeTab === tab.id ? '#0f172a' : '#64748b',
                boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                whiteSpace: 'nowrap', flex: isMobile ? '1' : 'none', justifyContent: 'center',
              }}>
              <tab.icon size={11} />
              {!isMobile || width > 400 ? tab.label : null}
            </button>
          ))}
        </div>
      </div>

      {/* ── ADD QUESTION TAB ── */}
      {activeTab === 'add' && (
        <div style={card}>
          <div style={darkHdr}>
            <Settings2 size={13} color="#60a5fa" />
            <h3 style={{ ...hdrTxt, color: '#fff' }}>Question Details</h3>
          </div>
          <form onSubmit={handleManualSubmit} style={{ padding: isMobile ? 16 : 24, display: 'flex', flexDirection: 'column', gap: 20, background: '#fff' }}>
            {/* Type + Course + Group */}
            <div style={g3}>
              <div>
                <label style={lbl}>Question Type</label>
                <select style={inp} value={manualQuestion.type}
                  onChange={e => setManualQuestion({ ...manualQuestion, type: e.target.value })}>
                  <option value="mcq">Multiple Choice</option>
                  <option value="descriptive">Long Answer</option>
                  <option value="short-answer">Short Answer</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Domain Target (Course)</label>
                <select style={inp} value={manualQuestion.course} required
                  onChange={e => setManualQuestion({ ...manualQuestion, course: e.target.value })}>
                  <option value="">SELECT_DOMAIN</option>
                  {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Question Group</label>
                <select style={inp} value={manualQuestion.groupId}
                  onChange={e => setManualQuestion({ ...manualQuestion, groupId: e.target.value })}>
                  <option value="">UNCATEGORIZED</option>
                  {groups.filter(g => !manualQuestion.course || g.course === manualQuestion.course).map(g => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label style={lbl}>Question Text</label>
              <textarea style={{ ...inp, minHeight: 130, resize: 'vertical', textTransform: 'none', fontWeight: 700, lineHeight: 1.6 }}
                placeholder="Enter your question here..."
                value={manualQuestion.question} required
                onChange={e => setManualQuestion({ ...manualQuestion, question: e.target.value })} />
            </div>

            {/* MCQ Options */}
            {manualQuestion.type === 'mcq' && (
              <div>
                <label style={lbl}>Response Map Configuration</label>
                <div style={g2}>
                  {manualQuestion.options.map((opt, i) => {
                    const isCorrect = manualQuestion.correctAnswer === i.toString();
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                        borderRadius: 12, border: `1px solid ${isCorrect ? '#bfdbfe' : '#f1f5f9'}`,
                        background: isCorrect ? '#eff6ff' : '#f8fafc', transition: 'all 0.15s',
                      }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <input type="radio" name="correct" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: 20, height: 20, zIndex: 10 }}
                            checked={isCorrect}
                            onChange={() => setManualQuestion({ ...manualQuestion, correctAnswer: i.toString() })} />
                          <div style={{
                            width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isCorrect ? '#2563eb' : '#cbd5e1'}`,
                            background: isCorrect ? '#2563eb' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isCorrect && <Check size={11} color="#fff" />}
                          </div>
                        </div>
                        <input type="text" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 11, fontWeight: 900, color: '#334155', textTransform: 'uppercase', fontFamily: 'inherit' }}
                          placeholder={`Option ${i + 1}`} value={opt}
                          onChange={e => {
                            const newOpts = [...manualQuestion.options];
                            newOpts[i] = e.target.value;
                            setManualQuestion({ ...manualQuestion, options: newOpts });
                          }} />
                        {isCorrect && <span style={{ fontSize: 8, fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.14em', whiteSpace: 'nowrap' }}>Correct</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Non-MCQ Answer */}
            {manualQuestion.type !== 'mcq' && (
              <div>
                <label style={lbl}>Correct Answer / Key</label>
                <textarea style={{ ...inp, minHeight: 90, resize: 'vertical', textTransform: 'none', fontWeight: 700 }}
                  placeholder="Provide the correct answer for grading..."
                  value={manualQuestion.correctAnswer}
                  onChange={e => setManualQuestion({ ...manualQuestion, correctAnswer: e.target.value })} />
              </div>
            )}

            {/* Marks + Submit */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: 14, paddingTop: 16, borderTop: '1px solid #f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', padding: '10px 16px', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                <div style={{ padding: 8, background: '#dbeafe', borderRadius: 8 }}>
                  <Scale size={13} color="#2563eb" />
                </div>
                <div>
                  <label style={lbl}>Question Marks</label>
                  <input type="number" value={manualQuestion.marks}
                    onChange={e => setManualQuestion({ ...manualQuestion, marks: parseInt(e.target.value) })}
                    style={{ width: 48, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, fontWeight: 900, color: '#0f172a', fontFamily: 'inherit', padding: 0 }} />
                </div>
              </div>
              <button type="submit" disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12,
                  padding: '12px 32px', fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                  letterSpacing: '0.16em', cursor: 'pointer', opacity: loading ? 0.6 : 1,
                  boxShadow: '0 4px 14px rgba(15,23,42,0.15)',
                  width: isMobile ? '100%' : 'auto',
                }}>
                {loading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                {loading ? 'SAVING...' : 'Save Question'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── BULK UPLOAD TAB ── */}
      {activeTab === 'bulk' && (
        <div style={card}>
          <div style={darkHdr}>
            <Layers size={13} color="#60a5fa" />
            <h3 style={{ ...hdrTxt, color: '#fff' }}>Bulk Questions Upload</h3>
          </div>
          <div style={{ padding: isMobile ? 16 : 24, display: 'flex', flexDirection: 'column', gap: 20, background: '#fff' }}>
            <div style={g3}>
              <div>
                <label style={lbl}>Target Course</label>
                <select style={inp} value={bulkMeta.course}
                  onChange={e => setBulkMeta({ ...bulkMeta, course: e.target.value })}>
                  <option value="">SELECT_DOMAIN</option>
                  {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Question Group</label>
                <select style={inp} value={bulkMeta.groupId}
                  onChange={e => setBulkMeta({ ...bulkMeta, groupId: e.target.value })}>
                  <option value="">UNCATEGORIZED</option>
                  {groups.filter(g => !bulkMeta.course || g.course === bulkMeta.course).map(g => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={downloadSampleCSV}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 12,
                    background: '#f1f5f9', border: '1px solid #e2e8f0',
                    color: '#475569', fontSize: 10, fontWeight: 900,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    cursor: 'pointer', transition: 'all 0.15s',
                    width: '100%', justifyContent: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
                  <Upload size={13} style={{ transform: 'rotate(180deg)' }} />
                  Download Sample CSV
                </button>
              </div>
            </div>

            {/* CSV drop zone */}
            <div style={{ position: 'relative' }}>
              <input type="file" accept=".csv" onChange={handleCsvUpload}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 50 }} />
              <div style={{ border: '2px dashed #e2e8f0', borderRadius: 16, padding: isMobile ? '32px 16px' : '56px 24px', textAlign: 'center', background: '#f8fafc', transition: 'all 0.2s' }}>
                <div style={{ width: 60, height: 60, background: '#f1f5f9', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Upload size={28} color="#94a3b8" />
                </div>
                <h4 style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Upload CSV File</h4>
                <p style={{ margin: '6px 0 0', fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Max limit: 5,000 questions per file</p>
              </div>
            </div>

            {/* CSV Preview */}
            {csvPreview.length > 0 && (
              <div>
                {/* Confirm bar */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 14, background: '#0f172a', padding: '16px 20px', borderRadius: 14, color: '#fff', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={20} color="#34d399" />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{csvPreview.length} Questions Validated</p>
                      <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Ready to import into course</p>
                    </div>
                  </div>
                  <button onClick={submitBulk} disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', opacity: loading ? 0.6 : 1, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                    {loading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                    {loading ? 'UPLOADING...' : 'Confirm Upload'}
                  </button>
                </div>

                {/* Preview table */}
                <div style={{ ...card }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <tr>
                          {['Type', 'Question Text', 'Marks'].map((h, i) => (
                            <th key={i} style={{ ...thSt, textAlign: i === 2 ? 'center' : 'left' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.slice(0, 5).map((q, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '11px 16px' }}>
                              <span style={{ fontSize: 8, fontWeight: 900, padding: '3px 7px', borderRadius: 6, background: '#f1f5f9', color: '#64748b', textTransform: 'uppercase' }}>{q.type}</span>
                            </td>
                            <td style={{ padding: '11px 16px', fontSize: 10, fontWeight: 900, color: '#334155', textTransform: 'uppercase', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</td>
                            <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: 10, fontWeight: 900, color: '#2563eb' }}>{q.marks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvPreview.length > 5 && (
                    <div style={{ padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        ... Plus {csvPreview.length - 5} more questions
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VIEW QUESTIONS TAB ── */}
      {activeTab === 'view' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Filters bar */}
          <div style={{
            background: '#fff', padding: isMobile ? 14 : 18,
            borderRadius: 16, border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap', gap: 12, alignItems: isMobile ? 'stretch' : 'center',
          }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : 240 }}>
              <Search size={15} color="#cbd5e1" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search questions..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchQuestions(1)}
                style={{ ...inp, paddingLeft: 38, fontSize: 10, letterSpacing: '0.06em' }} />
            </div>
            {/* Filter selects */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select value={filters.course}
                onChange={e => { setFilters({ ...filters, course: e.target.value, groupId: '' }); fetchQuestions(1); }}
                style={{ ...inp, width: 'auto', fontSize: 9, letterSpacing: '0.08em', padding: '8px 12px' }}>
                <option value="">ALL_COURSES</option>
                {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
              <select value={filters.groupId}
                onChange={e => { setFilters({ ...filters, groupId: e.target.value }); fetchQuestions(1); }}
                style={{ ...inp, width: 'auto', fontSize: 9, letterSpacing: '0.08em', padding: '8px 12px' }}>
                <option value="">ALL_GROUPS</option>
                {groups.filter(g => !filters.course || g.course === filters.course).map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
              <button onClick={() => { setFilters({ groupId: '', course: '', type: '' }); setSearchQuery(''); fetchQuestions(1); }}
                style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10, color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Reset Filters">
                <Activity size={15} />
              </button>
            </div>
          </div>

          {/* Questions table */}
          <div style={card}>
            {/* Mobile: card list */}
            {isMobile ? (
              <div style={{ background: '#fff' }}>
                {loading && questions.length === 0 ? (
                  <div style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ width: 36, height: 36, border: '4px solid #f1f5f9', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                    <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Synchronizing Records...</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', opacity: 0.25 }}>
                      <HelpCircle size={32} color="#94a3b8" />
                    </div>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Zero Records Detected</p>
                  </div>
                ) : questions.map(q => (
                  <div key={q._id} style={{ padding: '13px 16px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{q.question}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
                        <span style={{ fontSize: 8, fontWeight: 900, padding: '2px 7px', borderRadius: 5, background: q.type === 'mcq' ? '#eef2ff' : '#fffbeb', color: q.type === 'mcq' ? '#4f46e5' : '#d97706', textTransform: 'uppercase' }}>{q.type}</span>
                        <span style={{ fontSize: 8, fontWeight: 900, padding: '2px 7px', borderRadius: 5, background: '#f1f5f9', color: '#475569', textTransform: 'uppercase' }}>{q.course}</span>
                        <span style={{ fontSize: 8, fontWeight: 900, padding: '2px 7px', borderRadius: 5, background: '#f1f5f9', color: '#2563eb', textTransform: 'uppercase' }}>{q.marks} MK</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => { setEditingQuestion({ ...q }); setShowEditModal(true); }}
                        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid #f1f5f9', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => deleteQuestion(q._id)}
                        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid #f1f5f9', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Tablet / Desktop table */
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
                    <tr>
                      {['Question', 'Course', 'Marks', 'Actions'].map((h, i) => (
                        <th key={i} style={{ ...thSt, textAlign: i >= 2 ? 'center' : 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody style={{ background: '#fff' }}>
                    {loading && questions.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '60px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, border: '4px solid #f1f5f9', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Synchronizing Records...</p>
                        </div>
                      </td></tr>
                    ) : questions.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '60px 16px', textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', opacity: 0.2 }}>
                          <HelpCircle size={36} color="#94a3b8" />
                        </div>
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Zero Records Detected in Search Range</p>
                      </td></tr>
                    ) : questions.map(q => (
                      <tr key={q._id} style={{ borderBottom: '1px solid #f8fafc' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px 16px', maxWidth: 360 }}>
                          <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{q.question}</p>
                          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                            <span style={{ fontSize: 8, fontWeight: 900, padding: '2px 7px', borderRadius: 5, background: q.type === 'mcq' ? '#eef2ff' : '#fffbeb', color: q.type === 'mcq' ? '#4f46e5' : '#d97706', textTransform: 'uppercase' }}>{q.type}</span>
                            {q.groupId && (
                              <span style={{ fontSize: 8, fontWeight: 900, padding: '2px 7px', borderRadius: 5, background: '#f1f5f9', color: '#64748b', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <Layers size={7} /> {groups.find(g => g._id === q.groupId)?.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 6px rgba(59,130,246,0.5)', flexShrink: 0 }} />
                            <span style={{ fontSize: 10, fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{q.course}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 900, color: '#0f172a', background: '#f1f5f9', padding: '4px 10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>{q.marks}</span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                            <button onClick={() => { setEditingQuestion({ ...q }); setShowEditModal(true); }}
                              style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid transparent', borderRadius: 10, color: '#94a3b8', cursor: 'pointer' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}>
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => deleteQuestion(q._id)}
                              style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid transparent', borderRadius: 10, color: '#94a3b8', cursor: 'pointer' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#e11d48'; e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.borderColor = '#fecdd3'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: 12, padding: '8px 4px' }}>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                Page {pagination.page} of {pagination.totalPages} | Total {pagination.total} Questions
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button disabled={pagination.page <= 1} onClick={() => fetchQuestions(pagination.page - 1)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flex: isMobile ? '1' : 'none', padding: '9px 18px', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', opacity: pagination.page <= 1 ? 0.3 : 1 }}>
                  <ChevronLeft size={13} /> Previous
                </button>
                <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchQuestions(pagination.page + 1)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flex: isMobile ? '1' : 'none', padding: '9px 18px', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', background: '#0f172a', border: 'none', borderRadius: 10, cursor: 'pointer', opacity: pagination.page >= pagination.totalPages ? 0.3 : 1, boxShadow: '0 3px 10px rgba(15,23,42,0.15)' }}>
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {showEditModal && editingQuestion && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? 12 : 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 680, boxShadow: '0 32px 64px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '92vh', display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9' }}>
            {/* Modal header */}
            <div style={{ background: '#0f172a', padding: isMobile ? '14px 16px' : '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Edit Question</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ID: {editingQuestion._id}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)}
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleUpdate} style={{ padding: isMobile ? 16 : 28, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={lbl}>Question Text</label>
                <textarea style={{ ...inp, minHeight: 130, resize: 'vertical', textTransform: 'none', fontWeight: 700, lineHeight: 1.6 }}
                  value={editingQuestion.question} required
                  onChange={e => setEditingQuestion({ ...editingQuestion, question: e.target.value })} />
              </div>
              <div style={g2}>
                <div>
                  <label style={lbl}>Question Marks</label>
                  <input type="number" style={{ ...inp, color: '#2563eb', fontWeight: 900 }}
                    value={editingQuestion.marks}
                    onChange={e => setEditingQuestion({ ...editingQuestion, marks: e.target.value })} />
                </div>
                <div>
                  <label style={lbl}>Question Type</label>
                  <select style={inp} value={editingQuestion.type}
                    onChange={e => setEditingQuestion({ ...editingQuestion, type: e.target.value })}>
                    <option value="mcq">MCQ_STRUCTURE</option>
                    <option value="descriptive">THEORY_DOMINANT</option>
                    <option value="short-answer">COMPACT_LITERAL</option>
                  </select>
                </div>
              </div>

              {editingQuestion.type === 'mcq' && (
                <div style={{ paddingTop: 14, borderTop: '1px solid #f8fafc' }}>
                  <label style={lbl}>Multiple Choice Options</label>
                  <div style={g2}>
                    {editingQuestion.options.map((opt, i) => {
                      const isCorrect = editingQuestion.correctAnswer === i.toString();
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, border: `1px solid ${isCorrect ? '#bfdbfe' : '#f1f5f9'}`, background: isCorrect ? '#eff6ff' : '#f8fafc', transition: 'all 0.15s' }}>
                          <input type="radio" name="edit-correct"
                            style={{ width: 18, height: 18, accentColor: '#2563eb', cursor: 'pointer', flexShrink: 0 }}
                            checked={isCorrect}
                            onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: i.toString() })} />
                          <input type="text" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 10, fontWeight: 900, color: '#334155', textTransform: 'uppercase', fontFamily: 'inherit' }}
                            value={opt}
                            onChange={e => {
                              const newOpts = [...editingQuestion.options];
                              newOpts[i] = e.target.value;
                              setEditingQuestion({ ...editingQuestion, options: newOpts });
                            }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: '1px solid #f8fafc' }}>
                <button type="button" onClick={() => setShowEditModal(false)}
                  style={{ padding: '10px 24px', borderRadius: 10, fontSize: 10, fontWeight: 900, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', width: isMobile ? '100%' : 'auto' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 28px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 4px 14px rgba(15,23,42,0.15)', width: isMobile ? '100%' : 'auto' }}>
                  {loading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                  {loading ? 'SAVING...' : 'Update Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}