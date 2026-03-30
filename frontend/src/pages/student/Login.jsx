import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../lib/utils';
import { Lock, Mail, GraduationCap, Loader2 } from 'lucide-react';
import { usePlatform } from "../../context/PlatformContext";

export default function StudentLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { platformName } = usePlatform();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/student-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('studentToken', data.token);
        localStorage.setItem('studentData', JSON.stringify(data.student));
        navigate('/student/dashboard');
      } else {
        setError(data.msg || 'Login failed');
      }
    } catch (error) {
        setError('Connection error. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden font-sans antialiased text-slate-900">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[60vh] h-[60vh] bg-indigo-100/40 rounded-full blur-[100px] -mr-[20vh] -mt-[20vh] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[50vh] h-[50vh] bg-violet-100/30 rounded-full blur-[100px] -ml-[15vh] -mb-[15vh]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-10 md:p-16 border border-white/50">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-200 transform hover:scale-110 transition-transform duration-500 hover:rotate-3">
              <GraduationCap className="text-white" size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-4">Student Portal</h2>
            <p className="text-slate-500 font-medium text-lg">Sign in to your learning dashboard</p>
          </div>

          {error && (
            <div className="mb-10 p-5 bg-rose-50/50 backdrop-blur-sm text-rose-600 rounded-[1.5rem] text-sm font-bold border border-rose-100 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
               <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
               {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Student Email</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={22} />
                </div>
                <input 
                  type="email" name="email" onChange={handleChange} required
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                  placeholder="name@university.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Secure Password</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={22} />
                </div>
                <input 
                  type="password" name="password" onChange={handleChange} required
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-[2rem] font-black text-lg tracking-widest shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 group overflow-hidden relative"
            >
              {loading ? (
                <><Loader2 className="animate-spin" /> Authorizing...</>
              ) : (
                <>
                  <span>ENTER PORTAL</span>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full group-hover:scale-[10] transition-transform duration-700 absolute -right-4 top-1/2 -translate-y-1/2 blur-lg" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Default Access:</p>
                <span className="text-xs font-mono font-black text-indigo-600">student123</span>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-50">
          © 2026 {platformName} ACADEMIC INFRASTRUCTURE
        </p>
      </div>
    </div>
  );
}
