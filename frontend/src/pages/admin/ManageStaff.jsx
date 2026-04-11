import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { toast } from 'sonner';
import { 
  Users, UserPlus, ClipboardCheck, Calendar, IndianRupee, 
  Search, Edit3, Trash2, X, Bell, Loader2, Save
} from 'lucide-react';

/* ─── Hook: real window width ─── */
function useWindowWidth() {
  const [width, setWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

/* ── UI Helpers ── */
const th = { padding: "14px 16px", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", borderBottom: "1px solid #f1f5f9" };
const td = { padding: "16px", fontSize: 13, fontWeight: 600, color: "#334155", borderBottom: "1px solid #f1f5f9" };
const inpField = { width: "100%", padding: "12px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#1e293b", outline: "none", boxSizing: "border-box" };
const lbl = { display: "block", fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, marginLeft: 4 };

export default function ManageStaff({ token, activeSection }) {
  const width = useWindowWidth();
  const isMobile = width < 640;

  if (activeSection === "manage-staff") return <StaffDirectory token={token} isMobile={isMobile} />;
  if (activeSection === "staff-attendance") return <StaffAttendance token={token} isMobile={isMobile} />;
  if (activeSection === "institute-holidays") return <Holidays token={token} isMobile={isMobile} />;
  if (activeSection === "staff-payroll") return <StaffPayroll token={token} isMobile={isMobile} />;
  return <StaffDirectory token={token} isMobile={isMobile} />;
}

/* =========================================
   1. STAFF DIRECTORY
=========================================== */
function StaffDirectory({ token, isMobile }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'Teacher', specialization: '', baseSalary: 0, password: '' });

  const fetchStaff = async () => {
    try {
      const { data } = await axios.get('/staff', { headers: { Authorization: `Bearer ${token}` } });
      setStaff(data);
    } catch { toast.error("Error fetching staff"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`/staff/update/${editing._id}`, form, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Staff updated");
      } else {
        await axios.post('/staff/add', form, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Staff added");
      }
      fetchStaff();
      setShowModal(false);
      setEditing(null);
    } catch (e) { toast.error(e.response?.data?.msg || "Error saving"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete staff member?")) return;
    try {
      await axios.delete(`/staff/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Staff deleted");
      fetchStaff();
    } catch { toast.error("Error deleting"); }
  };

  return (
    <div>
      <div style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", 
        alignItems: isMobile ? "flex-start" : "center", 
        gap: 16,
        marginBottom: 24 
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 900, color: "#0f172a" }}>Staff Directory</h2>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Manage Teachers, Managers, and Receptionists.</p>
        </div>
        <button 
          onClick={() => { 
            setEditing(null); 
            setForm({ name: '', email: '', phone: '', role: 'Teacher', specialization: '', baseSalary: 0, password: '' }); 
            setShowModal(true); 
          }} 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 8, 
            background: "#0f172a", 
            color: "#fff", 
            border: "none", 
            padding: "12px 24px", 
            borderRadius: 12, 
            fontSize: 12, 
            fontWeight: 700, 
            cursor: "pointer",
            width: isMobile ? "100%" : "auto"
          }}
        >
          <UserPlus size={16} /> Add Staff
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <Loader2 style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : isMobile ? (
          /* Mobile: Card Layout */
          <div style={{ padding: 16 }}>
            {staff.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>No staff added yet.</div>
            ) : (
              staff.map(s => (
                <div key={s._id} style={{ 
                  padding: 16, 
                  background: "#f8fafc", 
                  borderRadius: 16, 
                  border: "1px solid #e2e8f0", 
                  marginBottom: 12 
                }}>
                  <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{s.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ padding: "4px 10px", background: s.role === 'Teacher' ? "#eff6ff" : "#f5f3ff", color: s.role === 'Teacher' ? "#3b82f6" : "#8b5cf6", borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>
                      {s.role}
                    </span>
                    <span style={{ fontSize: 12, color: "#10b981" }}>₹{s.baseSalary.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                    {s.email}<br/>{s.phone}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button 
                      onClick={() => { setEditing(s); setForm(s); setShowModal(true); }} 
                      style={{ flex: 1, padding: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12, fontWeight: 700 }}
                    >
                      <Edit3 size={14} style={{ marginRight: 6 }} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(s._id)} 
                      style={{ flex: 1, padding: "10px", background: "#fee2e2", color: "#ef4444", border: "1px solid #ffe4e6", borderRadius: 10, fontSize: 12, fontWeight: 700 }}
                    >
                      <Trash2 size={14} style={{ marginRight: 6 }} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Desktop: Table */
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Role</th>
                <th style={th}>Contact</th>
                <th style={th}>Base Salary</th>
                <th style={th}>Status</th>
                <th style={{...th, textAlign: "right"}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s._id} style={{ transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ ...td, color: "#0f172a", fontWeight: 700 }}>{s.name}</td>
                  <td style={td}>
                    <span style={{ padding: "4px 8px", background: s.role === 'Teacher' ? "#eff6ff" : "#f5f3ff", color: s.role === 'Teacher' ? "#3b82f6" : "#8b5cf6", borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{s.role}</span>
                  </td>
                  <td style={td}>
                    <div style={{ fontSize: 12 }}>{s.email}<br/><span style={{ color: "#94a3b8" }}>{s.phone}</span>
                    </div>
                  </td>
                  <td style={td}>₹{s.baseSalary.toLocaleString('en-IN')} /mo</td>
                  <td style={td}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, color: s.isActive ? "#10b981" : "#ef4444" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.isActive ? "#10b981" : "#ef4444" }}/>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button onClick={() => { setEditing(s); setForm(s); setShowModal(true); }} style={{ width: 32, height: 32, borderRadius: 8, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Edit3 size={14}/>
                      </button>
                      <button onClick={() => handleDelete(s._id)} style={{ width: 32, height: 32, borderRadius: 8, background: "#fff1f2", color: "#ef4444", border: "1px solid #ffe4e6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && <tr><td colSpan="6" style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>No staff added yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 500, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#0f172a" }}>{editing ? 'Edit Staff' : 'Add Staff Member'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20}/></button>
            </div>
            <div style={{ padding: 24 }}>
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
                <div><label style={lbl}>Full Name *</label><input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} style={inpField} /></div>
                
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                  <div><label style={lbl}>Role *</label>
                    <select required value={form.role} onChange={e=>setForm({...form, role:e.target.value})} style={inpField}>
                      <option value="Teacher">Teacher</option>
                      <option value="Manager">Manager</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Institute Admin">Institute Admin</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Base Salary (Monthly) *</label>
                    <input type="number" required value={form.baseSalary} onChange={e=>setForm({...form, baseSalary:Number(e.target.value)})} style={inpField} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                  <div><label style={lbl}>Email (Login) *</label><input type="email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} style={inpField} /></div>
                  <div><label style={lbl}>Phone *</label><input required value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={inpField} /></div>
                </div>

                {!editing && <div><label style={lbl}>Password (Login) *</label><input required type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} style={inpField} /></div>}
                
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
                  <button type="button" onClick={()=>setShowModal(false)} style={{ padding: "12px 20px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", width: isMobile ? "100%" : "auto" }}>Cancel</button>
                  <button type="submit" style={{ padding: "12px 24px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", width: isMobile ? "100%" : "auto" }}>
                    {editing ? 'Save Changes' : 'Add Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================
   2. STAFF ATTENDANCE
=========================================== */
function StaffAttendance({ token, isMobile }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stRes, attRes] = await Promise.all([
        axios.get('/staff', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/staff/attendance?month=${date.substring(0,7)}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStaff(stRes.data);
      const todayAtt = attRes.data.filter(a => a.date === date);
      setAttendance(todayAtt);
    } catch { toast.error("Error loading"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [date]);

  const handleStatusChange = (staffId, status) => {
    setAttendance(prev => {
      const idx = prev.findIndex(p => p.staffId === staffId);
      if (idx >= 0) {
        const n = [...prev];
        n[idx].status = status;
        return n;
      }
      return [...prev, { staffId, status }];
    });
  };

  const getStatus = (id) => {
    const r = attendance.find(a => a.staffId === id || a.staffId?._id === id);
    return r ? r.status : 'Present';
  };

  const saveAttendance = async () => {
    try {
      const list = staff.map(s => ({ staffId: s._id, status: getStatus(s._id) }));
      await axios.post('/staff/attendance', { date, attendanceList: list }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Attendance saved successfully");
    } catch { toast.error("Failed to save"); }
  };

  return (
    <div>
      <div style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", 
        alignItems: isMobile ? "flex-start" : "center", 
        gap: 16,
        marginBottom: 24 
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 900, color: "#0f172a" }}>Daily Attendance</h2>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Mark presence for staff members.</p>
        </div>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, width: isMobile ? "100%" : "auto" }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inpField, width: isMobile ? "100%" : "auto" }} />
          <button 
            onClick={saveAttendance} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              background: "#3b82f6", 
              color: "#fff", 
              border: "none", 
              padding: "12px 24px", 
              borderRadius: 12, 
              fontSize: 12, 
              fontWeight: 700, 
              cursor: "pointer",
              width: isMobile ? "100%" : "auto"
            }}
          >
            <Save size={16} /> Save Register
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}><Loader2 style={{ animation: "spin 1s linear infinite" }} /></div>
        ) : isMobile ? (
          /* Mobile Cards */
          <div style={{ padding: 16 }}>
            {staff.map(s => (
              <div key={s._id} style={{ padding: 16, background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0", marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>{s.role}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {['Present', 'Absent', 'Half Day', 'Leave'].map(st => (
                    <button 
                      key={st} 
                      onClick={() => handleStatusChange(s._id, st)} 
                      style={{ 
                        padding: "8px 14px", 
                        border: "none", 
                        borderRadius: 8, 
                        fontSize: 11, 
                        fontWeight: 800, 
                        cursor: "pointer",
                        background: getStatus(s._id) === st ? (st==='Present' ? '#10b981' : st==='Absent' ? '#ef4444' : st==='Half Day' ? '#f59e0b' : '#3b82f6') : "#f1f5f9",
                        color: getStatus(s._id) === st ? "#fff" : "#64748b"
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table */
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Staff Name</th>
                <th style={th}>Role</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s._id}>
                  <td style={td}>{s.name}</td>
                  <td style={td}>{s.role}</td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {['Present', 'Absent', 'Half Day', 'Leave'].map(st => (
                        <button 
                          key={st} 
                          onClick={() => handleStatusChange(s._id, st)} 
                          style={{ 
                            padding: "6px 12px", 
                            border: "none", 
                            borderRadius: 8, 
                            fontSize: 11, 
                            fontWeight: 800, 
                            cursor: "pointer", 
                            background: getStatus(s._id) === st ? (st==='Present'?'#10b981':st==='Absent'?'#ef4444':st==='Half Day'?'#f59e0b':'#3b82f6') : "#f1f5f9", 
                            color: getStatus(s._id) === st ? "#fff" : "#64748b" 
                          }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* =========================================
   3. HOLIDAYS
=========================================== */
function Holidays({ token, isMobile }) {
  const [holidays, setHolidays] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [form, setForm] = useState({ title: '', date: '' });

  const fetchHolidays = async () => {
    try {
      const { data } = await axios.get(`/staff/holidays?month=${month}`, { headers: { Authorization: `Bearer ${token}` } });
      setHolidays(data);
    } catch { toast.error("Error fetching holidays"); }
  };

  useEffect(() => { fetchHolidays(); }, [month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/staff/holidays', form, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Holiday announced!");
      setForm({ title: '', date: '' });
      fetchHolidays();
    } catch (e) { toast.error(e.response?.data?.msg || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove holiday?")) return;
    try {
      await axios.delete(`/staff/holidays/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Removed");
      fetchHolidays();
    } catch { toast.error("Error"); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: 24 }}>
      <div style={{ background: "#fff", padding: isMobile ? 20 : 24, borderRadius: 16, border: "1px solid #e2e8f0", height: "fit-content" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 900 }}>Announce Holiday</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div><label style={lbl}>Holiday Title</label><input required value={form.title} onChange={e=>setForm({...form, title: e.target.value})} style={inpField} placeholder="e.g. Diwali Break" /></div>
          <div><label style={lbl}>Date</label><input required type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} style={inpField} /></div>
          <button type="submit" style={{ padding: "12px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Bell size={16}/> Announce
          </button>
        </form>
      </div>

      <div style={{ background: "#fff", padding: isMobile ? 20 : 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: 12, marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Holidays List</h3>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{...inpField, width: isMobile ? "100%" : "auto", padding: "8px 12px"}} />
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {holidays.length === 0 ? (
            <p style={{ fontSize: 13, color: "#94a3b8", padding: 32, textAlign: "center" }}>No holidays found in {month}.</p>
          ) : (
            holidays.map(h => (
              <div key={h._id} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", padding: 16, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Calendar size={18}/>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#1e293b" }}>{h.title}</h4>
                    <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 700, color: "#64748b" }}>{h.date}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(h._id)} style={{ padding: 8, background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 8, cursor: "pointer", alignSelf: isMobile ? "flex-end" : "center" }}>
                  <Trash2 size={16}/>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================
   4. STAFF PAYROLL
=========================================== */
function StaffPayroll({ token, isMobile }) {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [calc, setCalc] = useState(null);
  const [form, setForm] = useState({ amountPaid: '', remarks: '' });
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    axios.get('/staff', { headers: { Authorization: `Bearer ${token}` } }).then(r => setStaff(r.data));
  }, [token]);

  useEffect(() => {
    if (selectedStaff) {
      axios.get(`/staff/salary/calculate?staffId=${selectedStaff}&month=${month}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setCalc(r.data)).catch(() => setCalc(null));
        
      axios.get(`/staff/salary/ledger?staffId=${selectedStaff}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setLedger(r.data));
    }
  }, [selectedStaff, month, token]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!calc) return;
    try {
      await axios.post('/staff/salary/pay', {
        staffId: selectedStaff, month, baseSalary: calc.baseSalary, extraLeaves: calc.extraLeaves,
        deductions: calc.deductions, amountPaid: Number(form.amountPaid), remarks: form.remarks
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Payment recorded");
      setForm({ amountPaid: '', remarks: '' });
      const r = await axios.get(`/staff/salary/ledger?staffId=${selectedStaff}`, { headers: { Authorization: `Bearer ${token}` } });
      setLedger(r.data);
    } catch { toast.error("Error saving payment"); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: 24 }}>
      <div>
        <div style={{ background: "#fff", padding: isMobile ? 20 : 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 900 }}>Select Payroll Target</h3>
          <div style={{ display: "grid", gap: 16 }}>
            <div><label style={lbl}>Target Month</label><input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={inpField} /></div>
            <div><label style={lbl}>Staff Member</label>
              <select value={selectedStaff} onChange={e=>setSelectedStaff(e.target.value)} style={inpField}>
                <option value="">-- Select --</option>
                {staff.map(s => <option key={s._id} value={s._id}>{s.name} ({s.role})</option>)}
              </select>
            </div>
          </div>
        </div>

        {calc && (
          <form onSubmit={handlePay} style={{ background: "#fff", padding: isMobile ? 20 : 24, borderRadius: 16, border: "1px solid #e2e8f0", marginTop: 24 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 900 }}>Dynamic Calculation</h3>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>Base Salary:</span>
              <span style={{ fontSize: 13, fontWeight: 900 }}>₹{calc.baseSalary.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>Extra Leaves (Net):</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#ef4444" }}>{calc.extraLeaves} (-₹{calc.deductions.toLocaleString('en-IN')})</span>
            </div>
            <div style={{ borderTop: "1px dashed #e2e8f0", margin: "16px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 14, color: "#0f172a", fontWeight: 900 }}>Final Calculated:</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#10b981" }}>₹{calc.calculatedSalary.toLocaleString('en-IN')}</span>
            </div>

            <div><label style={lbl}>Amount Releasing Now (₹)</label>
              <input required type="number" max={calc.calculatedSalary} value={form.amountPaid} onChange={e=>setForm({...form, amountPaid: e.target.value})} style={inpField} />
            </div>
            <div style={{ marginTop: 12 }}><label style={lbl}>Remarks</label>
              <input value={form.remarks} onChange={e=>setForm({...form, remarks: e.target.value})} style={inpField} placeholder="..." />
            </div>
            
            <button type="submit" style={{ width: "100%", padding: "12px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, marginTop: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <IndianRupee size={16}/> Record Payment
            </button>
          </form>
        )}
      </div>

      <div style={{ background: "#fff", padding: isMobile ? 20 : 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 900 }}>Payment Ledger</h3>
        {!selectedStaff ? (
          <p style={{ fontSize: 13, color: "#94a3b8", padding: 32, textAlign: "center" }}>Select a staff member to view ledger.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Date</th>
                <th style={th}>Month Logged</th>
                <th style={th}>Leaves / Deductions</th>
                <th style={th}>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map(l => (
                <tr key={l._id}>
                  <td style={td}>{new Date(l.paymentDate).toLocaleDateString()}</td>
                  <td style={td}>{l.month}</td>
                  <td style={td}><span style={{ color: "#ef4444" }}>{l.extraLeaves} leaves (₹{l.deductions})</span></td>
                  <td style={{ ...td, color: "#10b981", fontWeight: 900 }}>₹{l.amountPaid.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {ledger.length === 0 && <tr><td colSpan="4" style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>No payments logged yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}