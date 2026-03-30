import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../lib/utils";
import { BookOpen, PlayCircle } from "lucide-react";

export default function StudentExamsSection() {
  const navigate = useNavigate();
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) return;
    fetchExams(token);
  }, []);

  const fetchExams = async (token) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/student-exams/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setAvailableExams(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading your exams...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4 px-1">Available Exams</h2>
      <div className="space-y-4">
        {availableExams.length > 0 ? [...availableExams].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map((exam, index) => {
          const now = new Date();
          const examDate = new Date(exam.examDate);
          const [startH, startM] = (exam.startTime || '00:00').split(':');
          const [endH, endM] = (exam.endTime || '23:59').split(':');
          
          const stTime = new Date(examDate);
          stTime.setHours(parseInt(startH), parseInt(startM), 0, 0);
          
          const enTime = new Date(examDate);
          enTime.setHours(parseInt(endH), parseInt(endM), 0, 0);

          const isUpcoming = now < stTime;
          const isMissed = now > enTime && !exam.isAlreadyTaken;
          const isActive = exam.canStart; // Already checked by backend

          return (
            <div key={exam._id} className={`border ${index === 0 ? 'border-indigo-400 bg-indigo-50/20 shadow-lg' : 'border-gray-100'} rounded-xl p-6 relative group hover:border-indigo-300 transition-colors`}>
              {index === 0 && (
                <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                  Newly Scheduled
                </div>
              )}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">{exam.title}</h3>
                    <p className="text-slate-500 font-medium mt-0.5 uppercase tracking-tighter text-xs">{exam.description || 'Access and complete your scheduled examination.'}</p>
                  </div>
                  <div className="flex gap-2">
                    {exam.isAlreadyTaken ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-black text-[9px] uppercase tracking-widest border border-emerald-100">Attempted</span>
                    ) : isMissed ? (
                      <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full font-black text-[9px] uppercase tracking-widest border border-rose-100">Missing</span>
                    ) : isUpcoming ? (
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full font-black text-[9px] uppercase tracking-widest border border-amber-100">Upcoming</span>
                    ) : isActive ? (
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-black text-[9px] uppercase tracking-widest border border-indigo-100 animate-pulse">Active Now</span>
                    ) : null}
                  </div>
                </div>
                
                <div className="space-y-1 text-slate-600 font-medium text-sm">
                  <p className="flex items-center gap-2">Date: <span className="text-slate-500">{new Date(exam.examDate).toLocaleDateString()}</span></p>
                  <p className="flex items-center gap-2">Window: <span className="text-slate-500 font-bold">{exam.startTime} - {exam.endTime}</span></p>
                  <p className="flex items-center gap-2">Total Marks: <span className="text-slate-500">{exam.totalMarks}</span></p>
                  <p className="flex items-center gap-2">Questions: <span className="text-slate-500">{exam.questionsCount || 1}</span></p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                {isActive && !exam.isAlreadyTaken ? (
                  <button 
                    onClick={() => navigate(`/student/exam/${exam._id}`)}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-3 w-fit"
                  >
                    <PlayCircle size={18} /> Enter Exam
                  </button>
                ) : (
                  <div className={`px-8 py-3 rounded-lg font-bold text-sm flex items-center gap-3 w-fit cursor-not-allowed ${
                    exam.isAlreadyTaken ? 'bg-emerald-50 text-emerald-400' : 
                    isMissed ? 'bg-rose-50 text-rose-300' : 'bg-slate-50 text-slate-300'
                  }`}>
                    <PlayCircle size={18} className="opacity-50" />
                    {exam.isAlreadyTaken ? 'Already Completed' : 
                     isMissed ? 'Exam Expired' : 'Locked (Wait for Time)'}
                  </div>
                )}
              </div>
            </div>
          );
        })
        : (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
              <BookOpen size={40} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">All caught up! No active exams.</p>
          </div>
        )}
      </div>
    </div>
  );
}
