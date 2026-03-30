import { useState, useEffect } from "react";
import API_BASE_URL from "../../lib/utils";

export default function StudentFeesSection({ studentData }) {
  const [feeSchedule, setFeeSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token || !studentData?.id) return;
    fetchSchedule(token, studentData.id);
  }, [studentData]);

  const fetchSchedule = async (token, id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/fees/schedule/by-student/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFeeSchedule(data.schedules || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading your fees...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Installment Registry</h2>
      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Component</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Due State</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-slate-700">
            {feeSchedule.length > 0 ? feeSchedule.map(fee => (
              <tr key={fee._id} className="hover:bg-slate-50/10 transition-colors">
                <td className="px-6 py-4 font-bold">{fee.label}</td>
                <td className="px-6 py-4 font-black text-base">₹{fee.amount.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-slate-400 text-xs">{new Date(fee.dueDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className={`inline-block px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest ${
                    fee.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {fee.status}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                  No fee schedule found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
