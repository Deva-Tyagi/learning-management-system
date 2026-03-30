import React, { useState, useEffect, useMemo } from 'react';
import axios from '../../lib/axios';
import { 
  Clock, Plus, Trash2, Edit3, X, Save, 
  Calendar, CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

/* ─── Hook: real window width ─── */
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export default function ManageBatches({ token }) {
  const width = useWindowWidth();
  const isMobile = width < 640;
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '08:00 AM',
    endTime: '09:00 AM',
    days: []
  });

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/batches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBatches(res.data);
    } catch (error) {
      toast.error('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBatches();
  }, [token]);

  const handleToggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBatch) {
        await axios.put(`/batches/update/${editingBatch._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Batch updated successfully');
      } else {
        await axios.post('/batches/add', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Batch added successfully');
      }
      fetchBatches();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await axios.delete(`/batches/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Batch deleted successfully');
      fetchBatches();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      startTime: batch.startTime,
      endTime: batch.endTime,
      days: batch.days || []
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBatch(null);
    setFormData({
      name: '',
      startTime: '08:00 AM',
      endTime: '09:00 AM',
      days: []
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Batches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto" style={{ fontFamily: "sans-serif" }}>
      {/* ── HEADER ── */}
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
        gap: 16, background: "#fff", padding: isMobile ? 16 : 20,
        borderRadius: 16, border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <Clock size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 22, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              Batch Management
            </h1>
            <p style={{ margin: "5px 0 0", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 5 }}>
              <Calendar size={10} color="#3b82f6" /> Configure Teaching Slots & Schedules
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#0f172a", color: "#fff", border: "none",
            padding: "12px 24px",
            borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(15,23,42,0.2)",
            width: isMobile ? "100%" : "auto", justifyContent: "center",
            textTransform: "uppercase", letterSpacing: "0.05em"
          }}
        >
          <Plus size={16} /> Create New Batch
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
              <Clock size={32} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No batches created yet</p>
          </div>
        ) : (
          batches.map((batch) => (
            <div key={batch._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Calendar size={18} />
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(batch)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(batch._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{batch.name}</h3>
              <div className="flex items-center gap-2 text-slate-500 font-medium text-sm mb-4">
                <Clock size={14} />
                <span>{batch.startTime} - {batch.endTime}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {DAYS_OF_WEEK.map(day => {
                  const isActive = batch.days?.includes(day);
                  return (
                    <span 
                      key={day}
                      className={`text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md border ${
                        isActive 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-slate-50 text-slate-300 border-slate-100'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </span>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <Clock size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingBatch ? 'Edit Batch' : 'New Batch'}
                  </h2>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full flex items-center justify-center transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch Name</label>
                  <input 
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-slate-900 transition-all font-semibold text-slate-800 text-sm"
                    placeholder="e.g. Afternoon Special"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                    <input 
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-slate-900 transition-all font-semibold text-slate-800 text-sm"
                      placeholder="08:00 AM"
                      value={formData.startTime}
                      onChange={e => setFormData({...formData, startTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                    <input 
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-slate-900 transition-all font-semibold text-slate-800 text-sm"
                      placeholder="09:00 AM"
                      value={formData.endTime}
                      onChange={e => setFormData({...formData, endTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Schedule Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
                          formData.days.includes(day)
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20 active:scale-95"
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
