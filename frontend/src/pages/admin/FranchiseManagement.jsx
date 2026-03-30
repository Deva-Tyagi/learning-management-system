import { useEffect, useMemo, useState, useCallback } from 'react';
import axios from '../../lib/axios';
import {
  Plus, List, Trash2, Edit, AlertCircle, CheckCircle2, Loader2,
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

const initialForm = {
  centerName: '', centerCode: '', directorName: '', phone: '', altPhone: '',
  email: '', address: '', state: '', district: '', city: '', pincode: '',
  noOfComputer: '', noOfTeacher: '', noOfRoom: '', spaceSqFeet: '',
  regDate: '', fees: '', validity: '', validityMonthYear: '', remarks: '',
  username: '', password: '', status: 'Active',
  directorPhoto: null, signature: null, centerPhoto: null,
  otherDocument: null, aadharCard: null,
};

const TEXT_FIELDS = [
  { name: 'centerName', label: 'Center Name', type: 'text', required: true },
  { name: 'centerCode', label: 'Center Code', type: 'text', required: true },
  { name: 'directorName', label: 'Director Name', type: 'text' },
  { name: 'phone', label: 'Phone No', type: 'text' },
  { name: 'altPhone', label: 'Alt Phone No', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'address', label: 'Address', type: 'text' },
  { name: 'state', label: 'State', type: 'text' },
  { name: 'district', label: 'District', type: 'text' },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'pincode', label: 'Pincode', type: 'text' },
  { name: 'noOfComputer', label: 'No of Computers', type: 'number' },
  { name: 'noOfTeacher', label: 'No of Teachers', type: 'number' },
  { name: 'noOfRoom', label: 'No of Rooms', type: 'number' },
  { name: 'spaceSqFeet', label: 'Space (Sq Ft)', type: 'number' },
  { name: 'regDate', label: 'Registration Date', type: 'date' },
  { name: 'fees', label: 'Fees', type: 'number' },
  { name: 'validity', label: 'Validity', type: 'text' },
  { name: 'validityMonthYear', label: 'Validity Month/Year', type: 'text' },
  { name: 'remarks', label: 'Remarks', type: 'text' },
  { name: 'username', label: 'System Username', type: 'text' },
  { name: 'password', label: 'System Password', type: 'password' },
];

const FILE_FIELDS = [
  { name: 'directorPhoto', label: 'Director Photo' },
  { name: 'signature', label: 'Signature' },
  { name: 'centerPhoto', label: 'Center Photo' },
  { name: 'otherDocument', label: 'Other Document' },
  { name: 'aadharCard', label: 'Aadhar Card' },
];

export default function FranchiseManagement({ token }) {
  const [activeTab, setActiveTab] = useState('add');
  const [form, setForm] = useState(initialForm);
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(false);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadFranchises = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/franchises', { headers });
      setFranchises(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load franchises');
    } finally { setLoading(false); }
  }, [headers]);

  useEffect(() => {
    if (activeTab === 'list' && token) loadFranchises();
  }, [activeTab, loadFranchises, token]);

  const handleInput = (e) => {
    const { name, value, type, files } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'file' ? (files[0] || null) : value }));
  };

  const resetForm = () => setForm(initialForm);

  const submitFranchise = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') payload.append(key, value);
      });
      await axios.post('/franchises', payload, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Franchise added successfully');
      resetForm();
      if (activeTab === 'list') await loadFranchises();
      else setActiveTab('list');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add franchise');
    } finally { setLoading(false); }
  };

  const removeFranchise = async (id) => {
    if (!window.confirm('Delete this franchise permanently?')) return;
    setLoading(true);
    try {
      await axios.delete(`/franchises/${id}`, { headers });
      setFranchises(prev => prev.filter(f => f._id !== id));
      toast.success('Franchise removed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete franchise');
    } finally { setLoading(false); }
  };

  /* ── Style tokens ── */
  const inp = {
    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 10, padding: '9px 13px', fontSize: 13, fontWeight: 500,
    color: '#334155', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const lbl = {
    display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b',
    marginBottom: 5,
  };
  const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' };
  const thSt = { padding: '12px 14px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' };

  const gridCols = isMobile ? '1fr' : isDesktop ? '1fr 1fr 1fr' : '1fr 1fr';

  /* responsive table cols */
  const showDirector = !isMobile;
  const showContact = isDesktop;
  const showLocation = isDesktop;
  const colSpan = [true, showDirector, showContact, showLocation, true, true].filter(Boolean).length;

  return (
    <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>

      {/* ── TABS ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { id: 'add', label: 'Add Franchise' },
          { id: 'list', label: 'Franchise List' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s',
              background: activeTab === tab.id ? '#2563eb' : '#fff',
              color: activeTab === tab.id ? '#fff' : '#475569',
              boxShadow: activeTab === tab.id ? '0 3px 10px rgba(37,99,235,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
              border: activeTab === tab.id ? 'none' : '1px solid #e2e8f0',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ADD FRANCHISE TAB ── */}
      {activeTab === 'add' && (
        <div style={{ ...card, padding: isMobile ? 16 : 28 }}>
          <h2 style={{ margin: '0 0 22px', fontSize: isMobile ? 17 : 20, fontWeight: 700, color: '#0f172a' }}>
            Register New Franchise
          </h2>
          <form onSubmit={submitFranchise} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Text fields grid */}
            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isMobile ? 14 : 18 }}>
              {TEXT_FIELDS.map(field => (
                <div key={field.name}>
                  <label style={lbl}>
                    {field.label}{field.required && <span style={{ color: '#f43f5e', marginLeft: 3 }}>*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    required={field.required}
                    onChange={handleInput}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    style={inp}
                  />
                </div>
              ))}
              {/* Status select */}
              <div>
                <label style={lbl}>Status</label>
                <select name="status" value={form.status} onChange={handleInput} style={inp}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Document uploads */}
            <div style={{ paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Document Uploads
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isMobile ? 14 : 18 }}>
                {FILE_FIELDS.map(fileField => (
                  <div key={fileField.name}>
                    <label style={lbl}>{fileField.label}</label>
                    <input
                      type="file"
                      name={fileField.name}
                      onChange={handleInput}
                      accept="image/*,application/pdf"
                      style={{ display: 'block', width: '100%', fontSize: 12, color: '#64748b', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div>
              <button type="submit" disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12,
                  padding: '12px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  opacity: loading ? 0.6 : 1, boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                  width: isMobile ? '100%' : 'auto', justifyContent: 'center',
                }}>
                {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {loading ? 'Processing...' : 'Save Franchise Registry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── FRANCHISE LIST TAB ── */}
      {activeTab === 'list' && (
        <div style={card}>
          <div style={{ padding: isMobile ? '14px 16px' : '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? 16 : 19, fontWeight: 700, color: '#0f172a' }}>Franchise Registry</h2>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{franchises.length} Total Centers</span>
          </div>

          {/* Mobile: card list */}
          {isMobile ? (
            <div style={{ background: '#fff' }}>
              {loading ? (
                <div style={{ padding: 48, textAlign: 'center' }}>
                  <Loader2 size={24} color="#cbd5e1" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : franchises.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No franchises found</div>
              ) : franchises.map(fr => (
                <div key={fr._id} style={{ padding: '14px 16px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fr.centerName || fr.name}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{fr.centerCode || fr.code}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
                      {fr.phone && <span style={{ fontSize: 11, color: '#475569' }}>{fr.phone}</span>}
                      <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', background: fr.status === 'Active' ? '#ecfdf5' : '#f8fafc', color: fr.status === 'Active' ? '#059669' : '#94a3b8' }}>
                        {fr.status || 'Active'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => window.alert('Edit feature not implemented.')}
                      style={{ padding: 7, background: 'none', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>
                      <Edit size={14} />
                    </button>
                    <button onClick={() => removeFranchise(fr._id)}
                      style={{ padding: 7, background: 'none', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Tablet / Desktop table */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={thSt}>Center</th>
                    {showDirector && <th style={thSt}>Director</th>}
                    {showContact && <th style={thSt}>Contact</th>}
                    {showLocation && <th style={thSt}>Location</th>}
                    <th style={thSt}>Status</th>
                    <th style={{ ...thSt, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={colSpan} style={{ padding: '40px 16px', textAlign: 'center' }}>
                      <Loader2 size={22} color="#cbd5e1" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                    </td></tr>
                  ) : franchises.length === 0 ? (
                    <tr><td colSpan={colSpan} style={{ padding: '36px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      No franchises found
                    </td></tr>
                  ) : franchises.map(fr => (
                    <tr key={fr._id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '13px 14px' }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{fr.centerName || fr.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{fr.centerCode || fr.code}</p>
                      </td>
                      {showDirector && (
                        <td style={{ padding: '13px 14px', fontSize: 13, fontWeight: 500, color: '#475569' }}>{fr.directorName}</td>
                      )}
                      {showContact && (
                        <td style={{ padding: '13px 14px' }}>
                          <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>{fr.phone}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{fr.email}</p>
                        </td>
                      )}
                      {showLocation && (
                        <td style={{ padding: '13px 14px', fontSize: 13, color: '#64748b' }}>{fr.city}, {fr.state}</td>
                      )}
                      <td style={{ padding: '13px 14px' }}>
                        <span style={{ fontSize: 10, fontWeight: 900, padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em', background: fr.status === 'Active' ? '#ecfdf5' : '#f8fafc', color: fr.status === 'Active' ? '#059669' : '#94a3b8' }}>
                          {fr.status || 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button onClick={() => window.alert('Edit feature not implemented.')}
                            style={{ padding: 7, background: 'none', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}>
                            <Edit size={15} />
                          </button>
                          <button onClick={() => removeFranchise(fr._id)}
                            style={{ padding: 7, background: 'none', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#e11d48'; e.currentTarget.style.background = '#fff1f2'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}>
                            <Trash2 size={15} />
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
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}