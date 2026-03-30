import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import { 
    Award, 
    Plus, 
    Search, 
    Download, 
    Loader2,
    X
} from 'lucide-react';
import { toast } from 'sonner';

export default function CertificatesSection({ token }) {
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', course: '', grade: '', remarks: '' });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    if (!token) return;
    try {
      setDataLoading(true);
      const [certRes, stuRes] = await Promise.all([
        fetch(`${API_BASE_URL}/certificates`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/students/get`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (certRes.ok && stuRes.ok) {
        setCertificates(await certRes.json());
        setStudents(await stuRes.json());
      }
    } catch (error) {
      toast.error('Failed to fetch certificates');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Certificate issued successfully');
        setShowForm(false);
        setForm({ studentId: '', course: '', grade: '', remarks: '' });
        fetchData();
      } else {
        toast.error(data.msg || 'Failed to issue certificate');
      }
    } catch (error) {
      toast.error('Error issuing certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certId, certNumber) => {
    setDownloading(certId);
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/${certId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate-${certNumber || certId}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded');
    } catch (err) {
      toast.error(err.message);
    }
    setDownloading(null);
  };

  const filteredCerts = certificates.filter(cert => 
    (cert.studentId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cert.certificateNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "sans-serif" }}>
      {/* ── HEADER ── */}
      <div style={{
        display: "flex", flexDirection: "row",
        justifyContent: "space-between", alignItems: "center",
        gap: 16, background: "#fff", padding: "16px 20px",
        borderRadius: 16, border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginTop: 8
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <Award size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              Certificates Management
            </h1>
            <p style={{ margin: "5px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 5 }}>
              <Award size={10} color="#3b82f6" /> Verify & Issue Student Certifications
            </p>
          </div>
        </div>
      </div>

      <div className="admin-card p-8">
        <div className="flex justify-between items-center mb-6">
          <div /> {/* Spacer where H2 was */}
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search Name / Cert No..." 
                            className="admin-input pl-10 w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? 'Cancel' : 'Issue New Certificate'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8 animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">New Certificate Details</h3>
                    <form onSubmit={handleIssue} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Student *</label>
                            <select
                                required
                                className="admin-input"
                                value={form.studentId}
                                onChange={e => setForm({ ...form, studentId: e.target.value })}
                            >
                                <option value="">Select Student</option>
                                {students.map(s => (
                                    <option value={s._id} key={s._id}>{s.name} ({s.rollNumber})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Course *</label>
                            <input
                                type="text"
                                required
                                className="admin-input"
                                value={form.course}
                                onChange={e => setForm({ ...form, course: e.target.value })}
                                placeholder="Enter course name"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Grade</label>
                            <input
                                type="text"
                                className="admin-input"
                                value={form.grade}
                                onChange={e => setForm({ ...form, grade: e.target.value })}
                                placeholder="e.g. A+"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Remarks</label>
                            <input
                                type="text"
                                className="admin-input"
                                value={form.remarks}
                                onChange={e => setForm({ ...form, remarks: e.target.value })}
                                placeholder="Internal remarks"
                            />
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin" size={16} />}
                                {loading ? 'Issuing...' : 'Issue Certificate'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cert No</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {dataLoading ? (
                            <tr><td colSpan="6" className="p-10 text-center"><Loader2 size={24} className="animate-spin text-slate-300 mx-auto" /></td></tr>
                        ) : filteredCerts.length === 0 ? (
                            <tr><td colSpan="6" className="p-10 text-center text-slate-400">No certificates found</td></tr>
                        ) : (
                            filteredCerts.map(cert => (
                                <tr key={cert._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4 text-sm font-mono text-slate-600">{cert.certificateNumber}</td>
                                    <td className="px-4 py-4 text-sm font-medium text-slate-900">{cert.studentId?.name || '-'}</td>
                                    <td className="px-4 py-4 text-sm text-slate-500">{cert.course}</td>
                                    <td className="px-4 py-4 text-sm text-slate-500">{cert.grade || 'NA'}</td>
                                    <td className="px-4 py-4 text-sm text-slate-500">
                                        {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button 
                                            onClick={() => handleDownload(cert._id, cert.certificateNumber)} 
                                            disabled={downloading === cert._id}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold disabled:opacity-50"
                                        >
                                            {downloading === cert._id ? 'Downloading...' : 'Download PDF'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}
