import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Lock } from "lucide-react";
import { toast } from "sonner";
import API_BASE_URL from "../../lib/utils";

import Sidebar from "./Sidebar";
import StudentsSection from "./StudentDetails";
import StudentReports from "./StudentReports";
import CourseDetails from "./CourseDetails";
import NotesSection from "./Notes";
import FeesSection from "./Fees";
import IdCardsSection from "./IdCards";
import CreateIdCardSection from "./CreateIdCard";
import ManageIdCardsSection from "./ManageIdCards";
import AllIdCardsSection from "./AllIdCards";
import AddAttendanceSection from "./AddAttendance";
import ScanAttendanceSection from "./ScanAttendance";
import AttendanceReportSection from "./AttendanceReport";
import AttendanceStudentWiseSection from "./AttendanceStudentWise";
import CreateExamSection from "./CreateExam";
import ManageExamsSection from "./ManageExams";
import ExamResultsSection from "./ExamResults";
import ExamReportsSection from "./ExamReports";
import ManageQuestionGroups from "./ManageQuestionGroups";
import ManageQuestions from "./ManageQuestions";
import ScheduleExam from "./ScheduleExam";
import CertificatesSection from "./Certificates";
import FranchiseManagement from "./FranchiseManagement";
import CardManagement from "./CardManagement";
import LiveClassesSection from "./LiveClasses";
import AnalyticsSection from "./Analytics";
import LiveChats from "./LiveChats"; // NEW
import LeaderboardSection from "./Leaderboard";
import ManageBatches from "./ManageBatches";
import ManageStaff from "./ManageStaff";
import DesignCards from "./DesignCards"; // NEW
import ProfileSection from "./Profile";
import WebsiteQueries from "./WebsiteQueries";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("analytics");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [token, setToken] = useState("");
  const [isTempPassword, setIsTempPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resetData, setResetData] = useState({ otp: "", newPassword: "" });

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole") || "Admin";
    const isTemp = localStorage.getItem("isAdminTempPassword") === "true";

    if (!storedToken) {
      navigate("/admin/login");
      return;
    }

    // Set default section based on role if it was still "analytics"
    if (activeSection === "analytics") {
      if (role === "Teacher") setActiveSection("staff-attendance");
      else if (role === "Receptionist") setActiveSection("students-add");
      else setActiveSection("analytics");
    }

    setToken(storedToken);
    setIsTempPassword(isTemp);
  }, [navigate]);

  const handleRequestOtp = async () => {
    const email = localStorage.getItem("adminEmail");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setOtpSent(true);
        toast.success("OTP sent to your email");
      }
    } catch (err) {
      toast.error("Failed to send OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("adminEmail");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/update-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: resetData.otp,
          newPassword: resetData.newPassword,
        }),
      });
      if (res.ok) {
        toast.success("Password updated successfully");
        setIsTempPassword(false);
        localStorage.setItem("isAdminTempPassword", "false");
      } else {
        const data = await res.json();
        toast.error(data.msg || "Reset failed");
      }
    } catch (err) {
      toast.error("Server Error");
    }
  };

  const closeMobileSidebar = () => setShowMobileSidebar(false);

  const renderSection = () => {
    const props = { token };
    switch (activeSection) {
      // Students subsections
      case "students":
      case "students-list":
        return (
          <StudentsSection {...props} setActiveSection={setActiveSection} />
        );
      case "students-add":
        return (
          <StudentsSection
            {...props}
            setActiveSection={setActiveSection}
            openAddModal
          />
        );
      case "students-reports":
        return <StudentReports {...props} />;
      case "courses-all":
      case "courses-add":
      case "courses-subjects":
      case "courses-materials":
      case "courses":
        return (
          <CourseDetails
            {...props}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        );
      case "notes":
        return <NotesSection {...props} />;
      case "fees":
        return <FeesSection {...props} />;
      case "add-attendance":
        return <AddAttendanceSection {...props} />;
      case "scan-attendance":
        return <ScanAttendanceSection {...props} />;
      case "attendance-report":
        return <AttendanceReportSection {...props} />;
      case "attendance-student-wise":
        return <AttendanceStudentWiseSection {...props} />;
      case "schedule-exam":
        return <ScheduleExam {...props} />;
      case "create-exam":
        return <CreateExamSection {...props} />;
      case "manage-exams":
        return <ManageExamsSection {...props} />;
      case "manage-question-groups":
        return <ManageQuestionGroups {...props} />;
      case "manage-questions":
        return <ManageQuestions {...props} />;
      case "exam-results":
        return <ExamResultsSection {...props} />;
      case "exam-reports":
        return <ExamReportsSection {...props} />;
      case "card-management":
      case "design-cards":
        return <DesignCards {...props} />;
      case "certificates":
        return <CertificatesSection {...props} />;
      case "website-queries":
        return <WebsiteQueries {...props} />;
      case "franchise-management":
        return <FranchiseManagement {...props} />;
      case "id-cards":
        return <IdCardsSection {...props} />;
      case "create-id-card":
        return <CreateIdCardSection {...props} />;
      case "manage-id-cards":
        return <ManageIdCardsSection {...props} />;
      case "see-all-id-cards":
        return <AllIdCardsSection {...props} />;
      case "live-classes":
        return <LiveClassesSection {...props} />;
      case "batches":
      case "manage-batches":
        return <ManageBatches {...props} />;
      case "manage-staff":
      case "staff-attendance":
      case "staff-payroll":
      case "institute-holidays":
        return <ManageStaff {...props} activeSection={activeSection} />;
      case "analytics":
        return <AnalyticsSection {...props} />;
      case "chats":
        return <LiveChats {...props} />;
      case "leaderboard":
        return <LeaderboardSection {...props} />;
      case "profile":
        return <ProfileSection {...props} />;
      default:
        return <AnalyticsSection {...props} />;
    }
  };

  if (isTempPassword) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Security Update Required
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              You are using a temporary password. Please set a new secure
              password to continue.
            </p>
          </div>

          {!otpSent ? (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest leading-relaxed">
                  An OTP will be sent to your registered email:{" "}
                  {localStorage.getItem("adminEmail")}
                </p>
              </div>
              <button
                onClick={handleRequestOtp}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold tracking-widest uppercase transition-all shadow-lg active:scale-95"
              >
                Send OTP Code
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  6-Digit OTP
                </label>
                <input
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all font-semibold text-slate-800 text-sm"
                  placeholder="Enter code"
                  value={resetData.otp}
                  onChange={(e) =>
                    setResetData({ ...resetData, otp: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  New Secure Password
                </label>
                <input
                  required
                  type="password"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all font-semibold text-slate-800 text-sm"
                  placeholder="Min 8 characters"
                  value={resetData.newPassword}
                  onChange={(e) =>
                    setResetData({ ...resetData, newPassword: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold tracking-widest uppercase transition-all shadow-xl active:scale-95"
              >
                Update Secret Key
              </button>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Resend Code
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* REVERSE: this block now behaves like MOBILE sidebar */}
      {/* (always visible on small screens, hidden + toggle on large) */}
      <div className="lg:hidden flex w-64 flex-shrink-0 border-r border-slate-200">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>

      {/* REVERSE: this block now behaves like DESKTOP sidebar */}
      {/* (overlay drawer shown only when toggled on large screens) */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-50 hidden lg:block"
          onClick={closeMobileSidebar}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute inset-y-0 left-0 w-72 sm:w-80 bg-slate-950 transform transition-transform duration-300 ease-in-out translate-x-0 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-4 border-b border-slate-800">
              <button
                onClick={closeMobileSidebar}
                className="text-slate-300 hover:text-white"
                aria-label="Close sidebar"
              >
                <X size={28} />
              </button>
            </div>
            <Sidebar
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              mobile={true}
              onClose={closeMobileSidebar}
            />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col transition-all duration-300 min-w-0 overflow-x-hidden">
        {/* REVERSE: mobile-style header now appears on LARGE screens */}
        <header className="hidden lg:flex sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-4 py-3 items-center justify-between">
          <span className="text-lg font-bold text-slate-800">Admin Panel</span>
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="text-slate-700 hover:text-slate-900"
            aria-label="Open sidebar"
          >
            <Menu size={28} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-[1700px] mx-auto min-h-full min-w-0">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
