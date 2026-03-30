import React, { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "sonner";

export default function AddPaymentModal({ onClose, onAdded }) {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [course, setCourse] = useState("");
  const [date, setDate] = useState("");

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
      if (selectedStudent) {
        if (selectedStudent.course) setCourse(selectedStudent.course);
        if (selectedStudent.feeStatus === 'paid') {
           alert("This student has already paid their full fees.");
        }
      }
    }
  }, [studentId, students]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "/fee/add",
        { studentId, course, amount, date },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Payment recorded");
      onAdded();
      onClose();
    } catch (err) {
      console.error("Error adding payment", err);
      toast.error(err.response?.data?.error || "Failed to add payment");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-bold">
      <div className="bg-white rounded-[2rem] p-8 shadow-2xl w-full max-w-md border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">
          Initialize Payment
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-800 text-sm"
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.rollNumber})
              </option>
            ))}
          </select>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">
              Course
            </label>
            <input
              type="text"
              placeholder="Course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-800 text-sm"
              required
            />
          </div>
          <input
            type="number"
            placeholder="Amount (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-black text-blue-600 text-sm"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-600 text-sm"
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 text-slate-500 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest"
            >
              Commit Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
