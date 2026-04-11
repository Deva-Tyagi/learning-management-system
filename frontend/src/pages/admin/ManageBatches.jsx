import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { 
  Clock, Plus, Trash2, Edit3, X, Save, 
  Calendar, CheckCircle2, AlertCircle, Loader2, Users
} from 'lucide-react';
import { toast } from 'sonner';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

const statusColors = {
  Active: { bg: '#ecfdf5', color: '#059669', dot: '#10b981' },
  Completed: { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  Inactive: { bg: '#fff1f2', color: '#e11d48', dot: '#f43f5e' }
};

export default function ManageBatches({ token }) {
  const width = useWindowWidth();
  const isMobile = width < 640;
  
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', course: '', inCharge: '', startTime: '08:00 AM', endTime: '09:00 AM',
    days: [], capacity: 50, status: 'Active'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [batchRes, courseRes, teacherRes] = await Promise.all([
        axios.get('/batches', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/courses/get', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/staff?role=Teacher', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setBatches(Array.isArray(batchRes.data) ? batchRes.data : []);
      setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
      setTeachers(Array.isArray(teacherRes.data) ? teacherRes.data : []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  // Auto-generate batch name when course or times change
  useEffect(() => {
    if (!editingBatch && formData.course && formData.startTime) {
      const selectedCourse = courses.find(c => c._id === formData.course);
      if (selectedCourse) {
        setFormData(prev => ({
          ...prev,
          name: `${selectedCourse.name} - ${prev.startTime} to ${prev.endTime}`
        }));
      }
    }
  }, [formData.course, formData.startTime, formData.endTime, courses, editingBatch]);

  const handleToggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.course || !formData.startTime || !formData.endTime) {
      return toast.error("Please fill in all required fields.");
    }
    
    const payload = { ...formData, scheduleDays: formData.days };
    delete payload.days;

    try {
      if (editingBatch) {
        await axios.put(`/batches/update/${editingBatch._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Batch updated successfully');
      } else {
        await axios.post('/batches/add', payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Batch added successfully');
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await axios.delete(`/batches/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Batch deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      course: batch.course?._id || batch.course,
      inCharge: batch.inCharge?._id || batch.inCharge || '',
      startTime: batch.startTime,
      endTime: batch.endTime,
      days: batch.scheduleDays || batch.days || [],
      capacity: batch.capacity || 50,
      status: batch.status || 'Active'
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBatch(null);
    setFormData({ name: '', course: '', inCharge: '', startTime: '08:00 AM', endTime: '09:00 AM', days: [], capacity: 50, status: 'Active' });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16 }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>Loading Batches...</p>
      </div>
    );
  }

  const inpField = { width: "100%", padding: "12px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#1e293b", outline: "none", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, marginLeft: 4 };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? 16 : "0 10px", fontFamily: "Inter, sans-serif" }}>
      {/* HEADER */}
      <div style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row", 
        justifyContent: "space-between", 
        alignItems: isMobile ? "flex-start" : "center", 
        gap: 16, 
        background: "#fff", 
        padding: isMobile ? 16 : 20, 
        borderRadius: 16, 
        border: "1px solid #e2e8f0", 
        marginBottom: 24 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <Clock size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "-0.02em" }}>Batch Management</h1>
            <p style={{ margin: "5px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 5 }}>
              <Calendar size={10} color="#3b82f6" /> Configure Teaching Slots & Instructors
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
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
          <Plus size={16} /> Create New Batch
        </button>
      </div>

      {/* BATCH LIST */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {isMobile ? (
          /* Mobile Card View */
          <div style={{ padding: 16 }}>
            {batches.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>No batches found. Create one above.</div>
            ) : (
              batches.map(b => {
                const st = statusColors[b.status] || statusColors.Active;
                const isFull = (b.currentEnrollment || 0) >= b.capacity;
                return (
                  <div key={b._id} style={{ 
                    padding: 16, 
                    background: "#f8fafc", 
                    borderRadius: 16, 
                    border: "1px solid #e2e8f0", 
                    marginBottom: 16 
                  }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{b.name}</div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>Course</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{b.course?.name || "—"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: "#64748b" }}>Capacity</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isFull ? "#ef4444" : "#10b981" }}>
                          {b.currentEnrollment || 0}/{b.capacity}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Schedule</div>
                      <div style={{ fontSize: 13 }}>{b.startTime} - {b.endTime}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                        {(b.scheduleDays || b.days || []).map(d => (
                          <span key={d} style={{ background: "#3b82f6", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 800, textTransform: "uppercase" }}>
                            {d.substring(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>In-Charge</div>
                        <div style={{ fontSize: 13 }}>{b.inCharge?.name || "Unassigned"}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button 
                          onClick={() => handleEdit(b)} 
                          style={{ width: 36, height: 36, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(b._id)} 
                          style={{ width: 36, height: 36, borderRadius: 8, background: "#fee2e2", border: "1px solid #ffe4e6", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <span style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: 6, 
                        padding: "4px 10px", 
                        background: st.bg, 
                        color: st.color, 
                        borderRadius: 99, 
                        fontSize: 10, 
                        fontWeight: 800, 
                        textTransform: "uppercase" 
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }}></span> 
                        {b.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Desktop Table */
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr>
                <th style={th}>Batch Name</th>
                <th style={th}>Course</th>
                <th style={th}>Schedule</th>
                <th style={th}>In-Charge</th>
                <th style={th}>Capacity</th>
                <th style={th}>Status</th>
                <th style={{...th, textAlign: "right"}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>No batches found. Create one above.</td></tr>
              ) : batches.map(b => {
                const st = statusColors[b.status] || statusColors.Active;
                const isFull = (b.currentEnrollment || 0) >= b.capacity;
                return (
                  <tr key={b._id} style={{ transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ ...td, color: "#0f172a", fontWeight: 700 }}>{b.name}</td>
                    <td style={td}>{b.course?.name || "—"}</td>
                    <td style={td}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 13 }}>{b.startTime} - {b.endTime}</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                          {(b.scheduleDays || b.days || []).map(d => (
                            <span key={d} style={{ background: "#3b82f6", color: "#fff", padding: "2px 5px", borderRadius: 4, fontSize: 9, fontWeight: 800, textTransform: "uppercase" }}>{d.substring(0,3)}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td style={td}>
                      {b.inCharge ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}><Users size={12}/></div>
                          {b.inCharge.name}
                        </div>
                      ) : <span style={{ color: "#94a3b8" }}>Unassigned</span>}
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3, position: "relative", overflow: "hidden", minWidth: 50 }}>
                          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${Math.min(100, ((b.currentEnrollment||0)/b.capacity)*100)}%`, background: isFull ? "#ef4444" : "#10b981", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: isFull ? "#ef4444" : "#64748b" }}>{b.currentEnrollment || 0}/{b.capacity}</span>
                      </div>
                    </td>
                    <td style={td}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: st.bg, color: st.color, borderRadius: 99, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }}></span> {b.status}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <button onClick={() => handleEdit(b)} style={{ width: 32, height: 32, borderRadius: 8, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Edit3 size={14}/></button>
                        <button onClick={() => handleDelete(b._id)} style={{ width: 32, height: 32, borderRadius: 8, background: "#fff1f2", color: "#ef4444", border: "1px solid #ffe4e6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 640, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, background: "#f8fafc", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a" }}><Calendar size={20}/></div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#0f172a" }}>{editingBatch ? 'Edit Batch' : 'Create New Batch'}</h2>
              </div>
              <button onClick={handleCloseModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={24}/></button>
            </div>
            
            <div style={{ padding: 32, maxHeight: "75vh", overflowY: "auto" }}>
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
                  <div>
                    <label style={lbl}>Target Course *</label>
                    <select required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} style={inpField}>
                      <option value="">-- Select Course --</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Batch Name *</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inpField} placeholder="e.g. React - 9:00 AM" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
                  <div>
                    <label style={lbl}>Start Time *</label>
                    <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} style={inpField} />
                  </div>
                  <div>
                    <label style={lbl}>End Time *</label>
                    <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} style={inpField} />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Schedule Days *</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 12, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    {DAYS_OF_WEEK.map(day => {
                      const isActive = formData.days.includes(day);
                      return (
                        <button 
                          key={day} 
                          type="button" 
                          onClick={() => handleToggleDay(day)} 
                          style={{ 
                            padding: "8px 16px", 
                            borderRadius: 8, 
                            fontSize: 11, 
                            fontWeight: 800, 
                            textTransform: "uppercase", 
                            cursor: "pointer", 
                            border: `1px solid ${isActive ? '#3b82f6' : '#cbd5e1'}`, 
                            background: isActive ? '#3b82f6' : '#fff', 
                            color: isActive ? '#fff' : '#64748b' 
                          }}
                        >
                          {day.substring(0, 3)}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20 }}>
                  <div>
                    <label style={lbl}>Batch In-Charge</label>
                    <select value={formData.inCharge} onChange={e => setFormData({...formData, inCharge: e.target.value})} style={inpField}>
                      <option value="">-- Unassigned --</option>
                      {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Max Capacity *</label>
                    <input required type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)||0})} style={inpField} />
                  </div>
                  <div>
                    <label style={lbl}>Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={inpField}>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
                  <button 
                    type="button" 
                    onClick={handleCloseModal} 
                    style={{ 
                      padding: "14px 24px", 
                      background: "#f1f5f9", 
                      color: "#64748b", 
                      border: "none", 
                      borderRadius: 12, 
                      fontSize: 12, 
                      fontWeight: 800, 
                      cursor: "pointer",
                      width: isMobile ? "100%" : "auto"
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={{ 
                      padding: "14px 32px", 
                      background: "#0f172a", 
                      color: "#fff", 
                      border: "none", 
                      borderRadius: 12, 
                      fontSize: 12, 
                      fontWeight: 800, 
                      cursor: "pointer",
                      width: isMobile ? "100%" : "auto"
                    }}
                  >
                    {editingBatch ? 'Save Changes' : 'Create Batch'}
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