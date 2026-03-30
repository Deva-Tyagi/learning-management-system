import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../lib/utils";
import { toast } from "sonner";
import { Clock, AlertCircle, Save, CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // State for recording student answers: { questionId: { answer: string } }
  const [answers, setAnswers] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    const startExam = async () => {
      const token = localStorage.getItem("studentToken");
      if (!token) return navigate("/student/login");

      try {
        const res = await fetch(`${API_BASE_URL}/student-exams/${id}/start`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
           setExam(data.exam);
           // Calculate exact time left to prevent time-reset exploits
           const elapsedSeconds = Math.floor((Date.now() - new Date(data.startTime).getTime()) / 1000);
           const totalSeconds = data.exam.duration * 60;
           const remaining = totalSeconds - elapsedSeconds;
           setTimeLeft(remaining > 0 ? remaining : 0);
        } else {
           toast.error(data.msg || "Error accessing examination");
           navigate("/student/dashboard");
        }
      } catch (err) {
        toast.error("Network synchronization failed");
        navigate("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    startExam();
  }, [id, navigate]);

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (submitting) return;
    if (!isAutoSubmit && !window.confirm("Are you sure you want to submit your exam? You cannot modify answers after submission.")) return;

    setSubmitting(true);
    clearInterval(timerRef.current);
    
    const token = localStorage.getItem("studentToken");
    
    // Format payload for backend: [ { questionId, answer, timeTaken } ]
    const payloadAnswers = exam.questions.map(q => ({
      questionId: q._id,
      answer: answers[q._id]?.answer || "",
      timeTaken: 0 
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/student-exams/${id}/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
           answers: payloadAnswers,
           timeTaken: (exam.duration * 60) - (timeLeft > 0 ? timeLeft : 0)
        })
      });
      
      const data = await res.json();
      if (res.ok) {
         toast.success("Examination securely submitted!");
         navigate("/student/dashboard");
      } else {
         toast.error(data.msg || "Submission Error");
         setSubmitting(false);
      }
    } catch (err) {
      toast.error("Critical submission failure. Retrying...");
      setSubmitting(false);
    }
  }, [answers, exam, id, navigate, submitting, timeLeft]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, handleSubmit]);

  const handleOptionSelect = (qId, option) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: { answer: option }
    }));
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black bg-[#0f172a] text-white tracking-widest uppercase">Starting Your Exam...</div>;
  if (!exam) return null;

  const currentQ = exam.questions[currentIdx];
  const answeredCount = Object.keys(answers).filter(k => answers[k]?.answer).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col">
      {/* HEADER TOPBAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
              <AlertCircle size={20} />
           </div>
           <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{exam.title}</h1>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{exam.questions.length} Questions • {exam.totalMarks} Marks</span>
           </div>
        </div>

        <div className="flex items-center gap-6">
           {/* Timer Component */}
           <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-800 border-slate-200'}`}>
              <Clock size={18} />
              <span className="text-xl font-black font-mono tracking-wider">{formatTime(timeLeft)}</span>
           </div>
           
           <button 
             onClick={() => handleSubmit(false)}
             disabled={submitting}
             className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50"
           >
             {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
             Final Submit
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* LEFT SIDEBAR NAVIGATION */}
         <div className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-slate-50/50">
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Question List</h3>
               <p className="text-sm font-bold text-slate-800">{answeredCount} of {exam.questions.length} Answered</p>
               
               {/* Progress Bar */}
               <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${(answeredCount / exam.questions.length) * 100}%` }} />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-2 content-start">
               {exam.questions.map((q, idx) => {
                 const isAnswered = answers[q._id]?.answer;
                 const isActive = currentIdx === idx;
                 
                 return (
                   <button
                     key={q._id}
                     onClick={() => setCurrentIdx(idx)}
                     className={`h-12 w-full flex items-center justify-center rounded-lg text-sm font-black transition-all ${
                       isActive ? 'ring-2 ring-indigo-500 ring-offset-1 bg-indigo-600 text-white' :
                       isAnswered ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                       'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                     }`}
                   >
                     {idx + 1}
                   </button>
                 );
               })}
            </div>
         </div>

         {/* MAIN QUESTION AREA */}
         <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 md:p-12 relative">
            <div className="max-w-3xl mx-auto mb-24">
               {/* Question Header */}
               <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-indigo-600 font-black text-sm tracking-widest uppercase mb-2 block">Question {currentIdx + 1}</span>
                    <h2 className="text-2xl font-bold text-slate-900 leading-snug">{currentQ.question}</h2>
                  </div>
                  <div className="flex-shrink-0 bg-slate-100 px-4 py-2 rounded-lg text-slate-500 font-bold text-sm">
                     {currentQ.marks} Marks
                  </div>
               </div>

               {/* Options Area */}
               {currentQ.type === 'mcq' ? (
                 <div className="space-y-4">
                    {currentQ.options.map((option, oIdx) => {
                      const isSelected = answers[currentQ._id]?.answer === option;
                      return (
                        <div 
                          key={oIdx}
                          onClick={() => handleOptionSelect(currentQ._id, option)}
                          className={`w-full text-left p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-500 shadow-sm' 
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                             isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                           }`}>
                              {isSelected && <CheckCircle2 size={14} strokeWidth={4} />}
                           </div>
                           <span className={`text-base font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{option}</span>
                        </div>
                      )
                    })}
                 </div>
               ) : (
                 <textarea
                   className="w-full h-48 bg-white border border-slate-200 rounded-2xl p-5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y shadow-sm"
                   placeholder="Type your detailed answer here..."
                   value={answers[currentQ._id]?.answer || ""}
                   onChange={(e) => handleOptionSelect(currentQ._id, e.target.value)}
                 />
               )}
            </div>
            
            {/* FLOATING ACTION BAR */}
            <div className="fixed bottom-0 left-72 right-0 bg-white border-t border-slate-200 p-5 px-10 flex justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
               <button 
                 onClick={() => setCurrentIdx(prev => prev - 1)}
                 disabled={currentIdx === 0}
                 className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm flex items-center gap-2 hover:bg-slate-50 disabled:opacity-30 transition-all"
               >
                 <ChevronLeft size={18} /> Previous
               </button>
               
               {currentIdx < exam.questions.length - 1 ? (
                 <button 
                   onClick={() => setCurrentIdx(prev => prev + 1)}
                   className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-200"
                 >
                   Next Question <ChevronRight size={18} />
                 </button>
               ) : (
                 <button 
                   onClick={() => handleSubmit(false)}
                   className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-200"
                 >
                   Submit & Finish <CheckCircle2 size={16} />
                 </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
