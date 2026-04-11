import React from 'react';
import { 
  MessageSquare, Users, Clock, Zap, ShieldCheck, 
  Search, Filter, ArrowUpRight, Loader2, Globe, Heart
} from 'lucide-react';

export default function LiveChats() {
  const stats = [
    { label: 'Active Sessions', value: '0', icon: Zap, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Avg. Response', value: '1.2m', icon: Clock, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Missed Calls', value: '0', icon: ShieldCheck, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Total Visitors', value: '142', icon: Globe, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
            <MessageSquare size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Live Engagement</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Communication Matrix
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 transition-all hover:bg-white hover:border-slate-300">
            <Filter size={14} /> Analysis Settings
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95">
            <Zap size={14} /> Initialize Socket
          </button>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-bl-[4rem] opacity-30 -mr-8 -mt-8 group-hover:scale-110 transition-transform`} />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 ${s.bg} rounded-xl`}>
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-[9px] font-black text-slate-400 rounded-md border border-slate-100 uppercase tracking-tighter">
                  Sync <div className="w-1 h-1 rounded-full bg-emerald-400" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-800">{s.value}</h3>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- MAIN ENAGEMENT AREA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat List Placeholder */}
        <div className="lg:col-span-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden h-[500px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Channels</h3>
            <span className="px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-md">0</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-200">
              <Users size={32} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">No active sessions</p>
              <p className="text-[10px] text-slate-400 font-medium px-4 mt-2">Connecting to gateway server to listen for incoming engagement packets...</p>
            </div>
          </div>
        </div>

        {/* Chat View Placeholder */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[2rem] shadow-2xl shadow-blue-900/10 flex flex-col overflow-hidden h-[500px] border border-slate-800 relative">
          
          {/* Overlay Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="p-6 bg-slate-800/40 border-b border-slate-800 backdrop-blur-md flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                <zap size={20} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-white text-xs font-black uppercase tracking-widest">Communication Terminal</h4>
                <p className="text-slate-500 text-[9px] font-bold">Encrypted End-to-End Tunnel</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-5 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 -m-10" />
              <Loader2 size={48} className="text-blue-500 animate-spin relative z-10" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Awaiting Handshake</p>
              <p className="text-[11px] text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                Primary data bus is active. Securely waiting for incoming student or visitor WebSocket handshakes to initialize visual interface.
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-slate-800 flex gap-3 relative z-10">
             <div className="flex-1 h-12 bg-slate-800/50 rounded-xl border border-slate-700/50" />
             <div className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-700/50" />
          </div>

        </div>
      </div>

    </div>
  );
}
