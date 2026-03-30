import React, { useState } from "react";

export default function SchemeSelector({ courseDefaults = {}, onConfirm }) {
  const [scheme, setScheme] = useState("MONTHLY");
  const [doj, setDoj] = useState("");
  const [monthlyFee, setMonthlyFee] = useState(courseDefaults.monthlyFee || 0);
  const [durationMonths, setDurationMonths] = useState(courseDefaults.durationMonths || 0);
  const [totalFee, setTotalFee] = useState(courseDefaults.totalFee || 0);
  const [installments, setInstallments] = useState(2);

  const handleSubmit = () => {
    const customize = { totalFee, monthlyFee, durationMonths };
    const payload = { doj, scheme, customize };
    if (scheme === "Standard") payload.installments = installments; // Updated condition for installments
    if (typeof onConfirm === "function") onConfirm(payload);
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
      <div className="flex flex-wrap gap-4">
        {['Standard', 'Scholarship', 'Corporate'].map(s => (
            <label key={s} className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all border ${scheme === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}>
                <input type="radio" className="hidden" checked={scheme === s} onChange={() => setScheme(s)} />
                <span className="text-[10px] font-black uppercase tracking-widest">{s} Paradigm</span>
            </label>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date of Joining</label>
            <input type="date" value={doj} onChange={(e) => setDoj(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold" />
          </div>

          {scheme === 'Corporate' ? (
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Capital Value (₹)</label>
                <input type="number" value={totalFee} onChange={(e) => setTotalFee(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-black text-indigo-600" />
              </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recurring Fee (₹)</label>
                <input type="number" value={monthlyFee} onChange={(e) => setMonthlyFee(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-black text-indigo-600" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration Span (Months)</label>
                <input type="number" value={durationMonths} onChange={(e) => setDurationMonths(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold" />
              </div>
            </>
          )}

          {scheme === 'Scholarship' && (
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Capital Value (₹)</label>
                <input type="number" value={totalFee} onChange={(e) => setTotalFee(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-black text-indigo-600" />
            </div>
          )}

          {scheme === 'Standard' && (
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Installment Divisions</label>
                <input type="number" value={installments} onChange={(e) => setInstallments(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold" />
            </div>
          )}
      </div>

      <button onClick={handleSubmit} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Validate & Deploy Scheme</button>
    </div>
  );
}
