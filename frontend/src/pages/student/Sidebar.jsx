import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Video,
  Trophy,
  Award,
  CreditCard,
  FileText,
  StickyNote,
  LogOut,
  UserCircle,
} from "lucide-react";

export default function StudentSidebar({
  activeSection,
  setActiveSection,
  studentData,
  mobile = false,
  onClose = () => {},
}) {
  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentData");
    window.location.href = "/student/login";
  };

  const handleItemClick = (key) => {
    setActiveSection(key);
    if (mobile) onClose();
  };

  const navItemClass = (key) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
      activeSection === key
        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
    }`;

  return (
    <div className="h-full bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800">
      {/* Brand Header */}
      <div className={`${mobile ? "p-5" : "p-6"}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white leading-none">
              Student Portal
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Learning System
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 sidebar-scroll">
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 mt-4">
          Main Menu
        </p>

        <div onClick={() => handleItemClick("dashboard")} className={navItemClass("dashboard")}>
          <LayoutDashboard size={18} /> <span>Dashboard</span>
        </div>

        <div onClick={() => handleItemClick("exams")} className={navItemClass("exams")}>
          <Calendar size={18} /> <span>Available Exams</span>
        </div>

        <div onClick={() => handleItemClick("live-classes")} className={navItemClass("live-classes")}>
          <Video size={18} /> <span>Live Classes</span>
        </div>

        <div onClick={() => handleItemClick("results")} className={navItemClass("results")}>
          <Trophy size={18} /> <span>My Results</span>
        </div>

        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 mt-6">
          Resources
        </p>

        <div onClick={() => handleItemClick("certificates")} className={navItemClass("certificates")}>
          <Award size={18} /> <span>Certificates</span>
        </div>

        <div onClick={() => handleItemClick("id-card")} className={navItemClass("id-card")}>
          <CreditCard size={18} /> <span>My ID Card</span>
        </div>

        <div onClick={() => handleItemClick("fees")} className={navItemClass("fees")}>
          <FileText size={18} /> <span>My Fees</span>
        </div>

        <div onClick={() => handleItemClick("notes")} className={navItemClass("notes")}>
          <StickyNote size={18} /> <span>Study Notes</span>
        </div>
      </nav>

      {/* Footer */}
      <div className={`${mobile ? "p-3" : "p-4"} border-t border-slate-800 bg-slate-800/20`}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition-all cursor-pointer group">
          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400 border border-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
            <UserCircle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-200 truncate">{studentData?.name || "Student"}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{studentData?.rollNumber || "ID NO"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
