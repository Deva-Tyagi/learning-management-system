import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import API_BASE_URL from "../../lib/utils";

export default function SuperAdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("superAdminToken", data.token);
        toast.success("Welcome, Superadmin!");
        navigate("/superadmin/dashboard");
      } else {
        toast.error(data.msg || "Login failed");
      }
    } catch (err) {
      toast.error("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-2">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Superadmin Portal</h1>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Platform Management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Superadmin Email"
                  className="w-full pl-12 pr-4 py-4 bg-[#1e293b] border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="Secret Password"
                  className="w-full pl-12 pr-4 py-4 bg-[#1e293b] border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold tracking-widest uppercase transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Authorize Entry"}
            </button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Reserved for Platform Administrators</p>
          </div>
        </div>
      </div>
    </div>
  );
}
