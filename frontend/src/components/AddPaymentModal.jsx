import React, { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "sonner";

export default function AddPaymentModal({ onClose, onAdded }) {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [course, setCourse] = useState("");
  const [date, setDate] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [scheduleId, setScheduleId] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("/students/get", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data);
      } catch (err) {
        console.error("Failed to load students", err);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (studentId) {
      const selectedStudent = students.find((s) => s._id === studentId);
      if (selectedStudent && selectedStudent.course) setCourse(selectedStudent.course);

      const fetchTimeline = async () => {
        try {
          const token = localStorage.getItem("adminToken");
          const res = await axios.get(`/fee/timeline/${studentId}`, { headers: { Authorization: `Bearer ${token}` } });
          setSchedules(res.data.schedule || []);
        } catch {}
      };
      fetchTimeline();
    }
  }, [studentId, students]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "/fee/add",
        { studentId, course, amount, date, scheduleId, remarks },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Payment recorded");
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add payment");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-10 -mt-10" />
        
        <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Collect Payment</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Financial Ledger Entry</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Student Selection</label>
             <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="w-full bg-slate-50 border-2 border-slate-50 focus:border-blue-500 rounded-2xl px-5 py-4 font-bold text-slate-800 text-sm outline-none transition-all"
            >
              <option value="">Search Student...</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Select Installment</label>
              <select
                value={scheduleId}
                onChange={(e) => {
                  setScheduleId(e.target.value);
                  const selected = schedules.find(sh => sh._id === e.target.value);
                  if (selected) setAmount(selected.remainingAmount || selected.amount);
                }}
                required
                className="w-full bg-slate-50 border-2 border-slate-50 focus:border-blue-500 rounded-2xl px-5 py-4 font-bold text-slate-800 text-sm outline-none"
              >
                <option value="">Choose Record...</option>
                {schedules.map((sh) => (
                  <option key={sh._id} value={sh._id} disabled={sh.status === 'PAID'}>
                    {sh.label} (₹{sh.remainingAmount || sh.amount}) {sh.status === 'PAID' ? '✓' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Amount (₹)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 focus:border-blue-500 rounded-2xl px-5 py-4 font-black text-blue-600 text-sm outline-none" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Date</label>
               <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 focus:border-blue-500 rounded-2xl px-5 py-4 font-bold text-slate-800 text-sm outline-none" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Remarks</label>
              <input type="text" placeholder="Internal note..." value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 focus:border-blue-500 rounded-2xl px-5 py-4 font-bold text-slate-800 text-sm outline-none" />
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-slate-50">
            <button type="button" onClick={onClose} className="text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase text-xs tracking-widest">Discard</button>
            <button type="submit" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95">Commit Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
}
