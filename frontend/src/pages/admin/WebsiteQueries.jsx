import React, { useState, useEffect } from "react";
import axios from "../../lib/axios";
import { toast } from "sonner";
import { Search, Loader2, MessageSquare, CheckCircle, Clock } from "lucide-react";

export default function WebsiteQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("/website/admin/queries", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueries(res.data.queries || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch website queries");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(`/website/admin/queries/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Query status updated");
      setQueries(queries.map(q => q._id === id ? { ...q, status: newStatus } : q));
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <MessageSquare size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Website Queries</h2>
          <p className="text-sm text-slate-500">Messages sent from your public storefront Contact page.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {queries.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
            <p>No queries found yet.</p>
          </div>
        ) : (
          queries.map((q) => (
            <div key={q._id} className="p-5 border border-slate-100 bg-slate-50 rounded-xl flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-slate-800">{q.name}</h3>
                  <span className="text-xs text-slate-400">•</span>
                  <a href={`mailto:${q.email}`} className="text-blue-500 text-sm hover:underline">{q.email}</a>
                  {q.phone && (
                    <>
                      <span className="text-xs text-slate-400">•</span>
                      <a href={`tel:${q.phone}`} className="text-slate-500 text-sm hover:underline">{q.phone}</a>
                    </>
                  )}
                </div>
                {q.subject && <p className="font-bold text-[13px] text-slate-700 mb-1">Subject: {q.subject}</p>}
                <p className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 mt-2 whitespace-pre-wrap">{q.message}</p>
                <div className="text-xs text-slate-400 mt-3">
                  Received: {new Date(q.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="w-48 flex flex-col justify-start items-end border-l border-slate-200 pl-4">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Status</p>
                <div className="flex flex-col gap-2 w-full">
                  <button 
                    onClick={() => updateStatus(q._id, 'Pending')}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border transition-all ${q.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-slate-500'}`}
                  >
                    <Clock size={14} /> Pending
                  </button>
                  <button 
                    onClick={() => updateStatus(q._id, 'Resolved')}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border transition-all ${q.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-500'}`}
                  >
                    <CheckCircle size={14} /> Resolved
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
