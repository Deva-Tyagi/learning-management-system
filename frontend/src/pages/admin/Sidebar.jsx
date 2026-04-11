import { useState } from "react";
import { usePlatform } from "../../context/PlatformContext";
import {
  Users,
  BookOpen,
  CreditCard,
  StickyNote,
  FileText,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Building2,
  LayoutDashboard,
  LogOut,
  UserCircle,
  Video,
  Trophy,
  Clock,
  Globe,
  MessageSquare,
  BarChart2,
  UserPlus,
  List,
  FilePlus2,
  BookMarked,
} from "lucide-react";

export default function Sidebar({
  activeSection,
  setActiveSection,
  mobile = false,
  onClose = () => {},
}) {
  const [openMenus, setOpenMenus] = useState({
    attendance: false,
    exams: false,
    idCards: false,
    franchise: false,
    engagement: false,
    students: false,
    courses: false,
    staff: false,
  });
  const { platformName, primaryColor } = usePlatform();
  const userRole = localStorage.getItem("adminRole") || "Admin";

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const hasAccess = (section) => {
    if (userRole === "Admin") return true;

    const rolePermissions = {
      "Institute Admin": [
        "analytics",
        "students",
        "courses",
        "batches",
        "fee",
        "attendance",
        "exams",
        "idCards",
        "live-classes",
        "profile",
        "leaderboard",
        "engagement",
        "franchise",
        "website-queries",
      ],
      Manager: [
        "students",
        "fee",
        "attendance",
        "attendance-report",
        "attendance-student-wise",
        "profile",
        "leaderboard",
        "engagement",
      ],
      Teacher: [
        "attendance",
        "exams",
        "courses-materials",
        "profile",
        "leaderboard",
      ],
      Receptionist: ["students-add", "fee", "idCards", "profile"],
    };

    const allowed = rolePermissions[userRole] || [];

    // Check if directly allowed or if it's a sub-section of an allowed parent
    if (allowed.includes(section)) return true;

    // Dropdown parents
    if (
      section === "students-dropdown" &&
      (allowed.includes("students") || allowed.includes("students-add"))
    )
      return true;
    if (
      section === "courses-dropdown" &&
      (allowed.includes("courses") || allowed.includes("courses-materials"))
    )
      return true;
    if (section === "attendance-dropdown" && allowed.includes("attendance"))
      return true;
    if (section === "exams-dropdown" && allowed.includes("exams")) return true;
    if (section === "idCards-dropdown" && allowed.includes("idCards"))
      return true;
    if (section === "staff-dropdown" && allowed.includes("staff")) return true;

    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  const handleItemClick = (key) => {
    setActiveSection(key);
    if (mobile) onClose();
  };

  const navItemClass = (key) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
      activeSection === key
        ? "text-white shadow-lg shadow-blue-900/40"
        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
    }`;

  const dropdownHeaderClass = (items) =>
    `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-slate-400 hover:bg-slate-800/50 hover:text-white ${
      items.some((i) => activeSection === i.key || activeSection === i.k)
        ? "text-slate-100 bg-slate-800/80"
        : ""
    }`;

  // Student subsections for dropdown detection
  const studentSubsections = [
    { k: "students-list" },
    { k: "students-add" },
    { k: "students-reports" },
  ];

  // Course subsections
  const courseSubsections = [
    { k: "courses-all" },
    { k: "courses-add" },
    { k: "courses-subjects" },
    { k: "courses-materials" },
  ];

  return (
    <div className="h-full bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800">
      {/* Brand Header */}
      <div className={`${mobile ? "p-5" : "p-6"}`}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20"
            style={{ backgroundColor: primaryColor }}
          >
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white leading-none">
              {platformName} Admin
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Management System
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 sidebar-scroll">
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 mt-4">
          Quick Reports
        </p>

        {hasAccess("analytics") && (
          <div
            onClick={() => handleItemClick("analytics")}
            className={navItemClass("analytics")}
            style={
              activeSection === "analytics"
                ? { backgroundColor: primaryColor }
                : {}
            }
          >
            <LayoutDashboard size={18} /> <span>Statistics</span>
          </div>
        )}

        {hasAccess("leaderboard") && (
          <div
            onClick={() => handleItemClick("leaderboard")}
            className={navItemClass("leaderboard")}
            style={
              activeSection === "leaderboard"
                ? { backgroundColor: primaryColor }
                : {}
            }
          >
            <Trophy size={18} /> <span>Leaderboard</span>
          </div>
        )}

        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 mt-6">
          Management
        </p>

        {/* ── Students Dropdown ── */}
        {hasAccess("students-dropdown") && (
          <div className="space-y-1">
            <div
              onClick={() => toggleMenu("students")}
              className={dropdownHeaderClass(studentSubsections)}
            >
              <div className="flex items-center gap-3">
                <Users size={18} /> <span>Students</span>
              </div>
              {openMenus.students ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>
            {openMenus.students && (
              <div className="pl-4 space-y-1 mt-1">
                {[
                  { k: "students-list", t: "View All Students" },
                  { k: "students-add", t: "New Admission" },
                  { k: "students-reports", t: "Student Reports" },
                ].map((item) => {
                  if (!hasAccess(item.k)) return null;
                  return (
                    <div
                      key={item.k}
                      onClick={() => handleItemClick(item.k)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeSection === item.k
                          ? "text-blue-400 bg-blue-400/10"
                          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"
                      }`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${activeSection === item.k ? "bg-blue-400" : "bg-slate-600"}`}
                      />
                      {item.t}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Courses Dropdown ── */}
        {hasAccess("courses-dropdown") && (
          <div className="space-y-1">
            <div
              onClick={() => toggleMenu("courses")}
              className={dropdownHeaderClass(courseSubsections)}
            >
              <div className="flex items-center gap-3">
                <BookOpen size={18} /> <span>Courses</span>
              </div>
              {openMenus.courses ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>
            {openMenus.courses && (
              <div className="pl-4 space-y-1 mt-1">
                {[
                  { k: "courses-all", t: "All Courses" },
                  { k: "courses-add", t: "Add / Edit Course" },
                  { k: "courses-subjects", t: "Subjects" },
                  { k: "courses-materials", t: "Study Materials" },
                ].map((item) => {
                  if (!hasAccess(item.k)) return null;
                  return (
                    <div
                      key={item.k}
                      onClick={() => handleItemClick(item.k)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeSection === item.k
                          ? "text-blue-400 bg-blue-400/10"
                          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"
                      }`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${activeSection === item.k ? "bg-blue-400" : "bg-slate-600"}`}
                      />
                      {item.t}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {hasAccess("live-classes") && (
          <div
            onClick={() => handleItemClick("live-classes")}
            className={navItemClass("live-classes")}
          >
            <Video size={18} /> <span>Live Classes</span>
          </div>
        )}

        {hasAccess("batches") && (
          <div
            onClick={() => handleItemClick("manage-batches")}
            className={navItemClass("manage-batches")}
          >
            <Clock size={18} /> <span>Batches</span>
          </div>
        )}

        {hasAccess("engagement") && (
          <div
            onClick={() => handleItemClick("card-management")}
            className={navItemClass("card-management")}
          >
            <CreditCard size={18} /> <span>Design Cards</span>
          </div>
        )}

        {hasAccess("notes") && (
          <div
            onClick={() => handleItemClick("notes")}
            className={navItemClass("notes")}
          >
            <StickyNote size={18} /> <span>Notes</span>
          </div>
        )}

        {hasAccess("fee") && (
          <div
            onClick={() => handleItemClick("fees")}
            className={navItemClass("fees")}
          >
            <FileText size={18} /> <span>Fees</span>
          </div>
        )}

        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 mt-6">
          Sections
        </p>

        {/* Engagement Dropdown */}
        <div className="space-y-1">
          <div
            onClick={() => toggleMenu("engagement")}
            className={dropdownHeaderClass([
              { key: "chats" },
              { key: "website-queries" },
            ])}
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={18} /> <span>Engagement</span>
            </div>
            {openMenus.engagement ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </div>
          {openMenus.engagement && (
            <div className="pl-4 space-y-1 mt-1">
              {[
                { k: "chats", t: "Live Chats" },
                { k: "website-queries", t: "Website Queries" },
              ].map((item) => (
                <div
                  key={item.k}
                  onClick={() => handleItemClick(item.k)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeSection === item.k
                      ? "text-blue-400 bg-blue-400/10"
                      : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"
                  }`}
                >
                  <div
                    className={`w-1 h-1 rounded-full ${activeSection === item.k ? "bg-blue-400" : "bg-slate-600"}`}
                  />
                  {item.t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance Dropdown */}
        {hasAccess("attendance-dropdown") && (
          <div className="space-y-1">
            <div
              onClick={() => toggleMenu("attendance")}
              className={dropdownHeaderClass([
                { key: "add-attendance" },
                { key: "attendance-report" },
                { key: "attendance-student-wise" },
              ])}
            >
              <div className="flex items-center gap-3">
                <ClipboardCheck size={18} /> <span>Attendance</span>
              </div>
              {openMenus.attendance ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>
            {openMenus.attendance && (
              <div className="pl-4 space-y-1 mt-1">
                {[
                  { k: "scan-attendance", t: "Scan QR" },
                  { k: "add-attendance", t: "Manual Entry" },
                  { k: "attendance-report", t: "Daily Report" },
                  { k: "attendance-student-wise", t: "Student Wise" },
                ].map((item) => {
                  if (!hasAccess(item.k)) return null;
                  return (
                    <div
                      key={item.k}
                      onClick={() => handleItemClick(item.k)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeSection === item.k
                          ? "bg-blue-400/10"
                          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"
                      }`}
                      style={
                        activeSection === item.k ? { color: primaryColor } : {}
                      }
                    >
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{
                          backgroundColor:
                            activeSection === item.k ? primaryColor : "#475569",
                        }}
                      />
                      {item.t}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Examinations Dropdown */}
        {hasAccess("exams-dropdown") && (
          <div className="space-y-1">
            <div
              onClick={() => toggleMenu("exams")}
              className={dropdownHeaderClass([
                { key: "schedule-exam" },
                { key: "create-exam" },
                { key: "manage-exams" },
                { key: "manage-question-groups" },
                { key: "manage-questions" },
              ])}
            >
              <div className="flex items-center gap-3">
                <Calendar size={18} /> <span>Exams</span>
              </div>
              {openMenus.exams ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>
            {openMenus.exams && (
              <div className="pl-4 space-y-1 mt-1">
                {[
                  { k: "schedule-exam", t: "Quick Schedule" },
                  { k: "manage-question-groups", t: "Topic Folders" },
                  { k: "manage-questions", t: "All Questions" },
                  { k: "manage-exams", t: "Manage Exams" },
                  { k: "create-exam", t: "New Exam" },
                  { k: "exam-results", t: "Exam Scores" },
                  { k: "exam-reports", t: "Performance Reports" },
                ].map((item) => {
                  if (!hasAccess(item.k)) return null;
                  return (
                    <div
                      key={item.k}
                      onClick={() => handleItemClick(item.k)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeSection === item.k
                          ? "text-blue-400 bg-blue-400/10"
                          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"
                      }`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${activeSection === item.k ? "bg-blue-400" : "bg-slate-600"}`}
                      />
                      {item.t}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ID Cards Dropdown */}
        {hasAccess("idCards-dropdown") && (
          <div className="space-y-1">
            <div
              onClick={() => toggleMenu("idCards")}
              className={dropdownHeaderClass([
                { key: "create-id-card" },
                { key: "manage-id-cards" },
                { key: "see-all-id-cards" },
              ])}
            >
              <div className="flex items-center gap-3">
                <CreditCard size={18} /> <span>ID Cards</span>
              </div>
              {openMenus.idCards ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>
            {openMenus.idCards && (
              <div className="pl-4 space-y-1 mt-1">
                {[
                  { k: "create-id-card", t: "Create New Card" },
                  { k: "id-cards", t: "My Card List" },
                  { k: "see-all-id-cards", t: "Archive" },
                ].map((item) => {
                  if (!hasAccess(item.k)) return null;
                  return (
                    <div
                      key={item.k}
                      onClick={() => handleItemClick(item.k)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeSection === item.k
                          ? "text-blue-400 bg-blue-400/10"
                          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"
                      }`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${activeSection === item.k ? "bg-blue-400" : "bg-slate-600"}`}
                      />
                      {item.t}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Staff / Teacher Management Dropdown */}
        {hasAccess("staff-dropdown") && (
          <div className="space-y-1">
            <div
              onClick={() => toggleMenu("staff")}
              className={dropdownHeaderClass([
                { key: "manage-staff" },
                { key: "staff-attendance" },
                { key: "staff-payroll" },
                { key: "institute-holidays" },
              ])}
            >
              <div className="flex items-center gap-3">
                <Users size={18} /> <span>Staff &amp; Teachers</span>
              </div>
              {openMenus.staff ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>
            {openMenus.staff && (
              <div className="pl-4 space-y-1 mt-1">
                {[
                  { k: "manage-staff", t: "Staff Directory" },
                  { k: "staff-attendance", t: "Attendance" },
                  { k: "staff-payroll", t: "Payroll & Salary" },
                  { k: "institute-holidays", t: "Announce Holidays" },
                ].map((item) => {
                  if (!hasAccess(item.k)) return null;
                  return (
                    <div
                      key={item.k}
                      onClick={() => handleItemClick(item.k)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeSection === item.k
                          ? "bg-blue-400/10"
                          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"
                      }`}
                      style={
                        activeSection === item.k ? { color: primaryColor } : {}
                      }
                    >
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{
                          backgroundColor:
                            activeSection === item.k ? primaryColor : "#475569",
                        }}
                      />
                      {item.t}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Franchise Dropdown */}
        <div className="space-y-1">
          <div
            onClick={() => toggleMenu("franchise")}
            className={dropdownHeaderClass([{ key: "franchise-management" }])}
          >
            <div className="flex items-center gap-3">
              <Building2 size={18} /> <span>Branches</span>
            </div>
            {openMenus.franchise ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </div>
          {openMenus.franchise && (
            <div className="pl-4 space-y-1 mt-1">
              {[{ k: "franchise-management", t: "Manage All" }].map((item) => (
                <div
                  key={item.k}
                  onClick={() => handleItemClick(item.k)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeSection === item.k
                      ? "text-blue-400 bg-blue-400/10"
                      : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"
                  }`}
                >
                  <div
                    className={`w-1 h-1 rounded-full ${activeSection === item.k ? "bg-blue-400" : "bg-slate-600"}`}
                  />
                  {item.t}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div
        className={`${mobile ? "p-3" : "p-4"} border-t border-slate-800 bg-slate-800/20`}
      >
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition-all cursor-pointer group">
          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400 border border-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
            <UserCircle size={20} />
          </div>
          <div
            className="flex-1 min-w-0"
            onClick={() => handleItemClick("profile")}
          >
            <p className="text-[13px] font-bold text-slate-200 truncate">
              My Profile
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
              Manage Account
            </p>
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
