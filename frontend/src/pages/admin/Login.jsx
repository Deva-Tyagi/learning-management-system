import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../lib/utils';
import { Eye, EyeOff, Lock, Mail, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePlatform } from "../../context/PlatformContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { platformName } = usePlatform();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('isAdminTempPassword', data.isTemporaryPassword);
        localStorage.setItem('adminEmail', formData.email);
        toast.success('Successfully authenticated');
        navigate('/admin/dashboard');
      } else {
        toast.error(data.msg || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Logo/Brand Area */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-200">
            <Shield className="text-blue-500" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Admin Access</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Management Portal Gateway</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-10 shadow-2xl shadow-slate-200 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Identity Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  name="email" 
                  onChange={handleChange} 
                  required
                  className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-300 uppercase"
                  placeholder="admin@enterprise.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  onChange={handleChange} 
                  required
                  className="w-full pl-12 pr-12 h-14 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-300"
                  placeholder="••••••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-xl font-bold uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Authorize Session'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <p className="text-center mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Protected by {platformName} enterprise encryption &copy; 2026
        </p>
      </div>
    </div>
  );
}
