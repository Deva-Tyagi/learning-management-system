import React, { useState } from "react";
import { Link } from "react-router-dom";

const FeatureCard = ({ icon, title, desc, badge }) => (
  <div className="group flex flex-col gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center text-2xl group-hover:bg-violet-500/25 transition-colors duration-300">
        {icon}
      </div>
      {badge && (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
          {badge}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-white font-bold text-base mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const categories = [
  { id: "all", label: "All Features" },
  { id: "student", label: "Student Management" },
  { id: "course", label: "Course & Content" },
  { id: "analytics", label: "Analytics" },
  { id: "communication", label: "Communication" },
  { id: "admin", label: "Administration" },
];

const allFeatures = [
  { icon: "👥", title: "Smart Student Profiles", desc: "Complete student lifecycle management — enrolment, documents, batch assignment, fee tracking, and academic history in one profile.", category: "student" },
  { icon: "📋", title: "Automated Attendance", desc: "QR-based and manual attendance marking with real-time alerts to parents for absences. Daily/monthly reports at a click.", category: "student", badge: "Popular" },
  { icon: "🪪", title: "Dynamic ID Cards", desc: "Auto-generate pixel-perfect digital ID cards, admit cards, and marksheets using custom drag-and-drop templates.", category: "student", badge: "New" },
  { icon: "💻", title: "Student Self-Service Portal", desc: "Empower students with a dedicated portal to take live exams, track test results, and download study notes.", category: "student" },
  { icon: "⚡", title: "Bulk Learner Actions", desc: "Import hundreds of students via CSV, process batch enrolments, and execute massive data updates dynamically.", category: "student", badge: "New" },
  { icon: "📄", title: "Resume Builder", desc: "Built-in tool for students to create professional resumes directly inside their portal for placement opportunities.", category: "student", badge: "New" },
  { icon: "📚", title: "Course Builder", desc: "Create structured courses with modules, lessons, videos, PDFs, and assignments. Set prerequisites and completion criteria.", category: "course" },
  { icon: "🎥", title: "Live Class Streaming", desc: "Host live sessions directly within the LMS. Record and archive classes for students who miss them.", category: "course", badge: "New" },
  { icon: "📝", title: "Exam & Assessment Engine", desc: "Build MCQ, descriptive, and mixed-format exams with auto-grading. Schedule exams, set timers, and prevent cheating.", category: "course", badge: "Popular" },
  { icon: "📅", title: "Advanced Scheduling", desc: "Coordinate timelines for live classes and exams with overlap-detection and automated time-zone handling.", category: "course" },
  { icon: "🏅", title: "Certificate Generator", desc: "Auto-generate branded digital certificates upon course completion. Shareable LinkedIn and PDF-ready credentials.", category: "course" },
  { icon: "📦", title: "Batch Management", desc: "Organize students into batches with custom schedules, instructors, and rooms. Handle batch transfers effortlessly.", category: "course" },
  { icon: "📊", title: "AI-Powered Dashboard", desc: "Instant insights into enrolments, revenue, attendance trends, exam scores, and placement rates — all in one visual dashboard.", category: "analytics", badge: "AI" },
  { icon: "📈", title: "Revenue Analytics", desc: "Track fee collections, pending dues, refunds, and revenue forecasts. Identify top-performing courses and batches.", category: "analytics" },
  { icon: "🔍", title: "Student Performance Reports", desc: "Detailed individual and batch-level academic reports. Identify at-risk students early and intervene proactively.", category: "analytics" },
  { icon: "📉", title: "Leaderboards", desc: "Motivate students with gamified performance leaderboards by score, attendance, and assignment completion.", category: "analytics" },
  { icon: "📣", title: "Push Notifications", desc: "Send targeted announcements, reminders, and alerts via app, SMS, and email to students, parents, and staff.", category: "communication" },
  { icon: "💬", title: "In-App Messaging", desc: "Secure messaging between students and instructors. Broadcast announcements to specific batches or the entire institute.", category: "communication" },
  { icon: "📱", title: "Student Mobile App", desc: "Branded student-facing app with timetable, attendance, exam results, and course content — accessible on the go.", category: "communication", badge: "New" },
  { icon: "💳", title: "Fee Management", desc: "Multi-mode payment collection (online/offline), automated receipts, EMI tracking, and due-date reminders.", category: "admin", badge: "Popular" },
  { icon: "🏢", title: "Multi-Branch Management", desc: "Single dashboard to manage unlimited branches. Transfer students, share resources, and consolidate reports.", category: "admin" },
  { icon: "🏢", title: "Franchise Management", desc: "Expand your reach by creating B2B sub-centers and managing franchise networks under your main institute tier.", category: "admin", badge: "New" },
  { icon: "👩‍💼", title: "Staff & Instructor Portal", desc: "Role-based access for admin, instructors, and coordinators. Track instructor attendance and manage payroll.", category: "admin" },
  { icon: "🔐", title: "Role-Based Access Control", desc: "Granular permissions ensure staff only see what's relevant. Fully auditable action logs for compliance.", category: "admin" },
  { icon: "🧾", title: "Audit & Activity Logs", desc: "Track system-wide modifications and access logs with detailed trails for full regulatory compliance.", category: "admin" },
  { icon: "🌐", title: "White-labeled Domains", desc: "Run your learning management system entirely on a custom domain without any external branding visible.", category: "admin", badge: "New" },
  { icon: "🌐", title: "Website Integration", desc: "Embed enrolment forms, course catalogs, and enquiry widgets directly on your institute's website.", category: "admin" },
  { icon: "☁️", title: "Cloud & Data Security", desc: "99.9% uptime on enterprise-grade cloud. Daily backups, SOC 2 compliant, end-to-end encrypted data.", category: "admin" },
];

const FeaturesPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const filtered = activeCategory === "all" ? allFeatures : allFeatures.filter((f) => f.category === activeCategory);

  return (
    <div className="bg-[#080d1a] min-h-screen text-white font-sans">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-violet-600/8 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-6 uppercase tracking-wider">
            Platform Features
          </div>
          <h1 className="text-5xl md:text-3xl font-bold text-white mb-6 leading-tight">
            Everything Your Institute
            <span className="block text-transparent bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text">Needs to Thrive</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-base leading-relaxed max-w-2xl mx-auto mb-8">
            22+ powerful features designed by educators, for educators. No bloat. No complexity. Just tools that work.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            {[
              { count: "22+", label: "Features" },
              { count: "0", label: "Setup Fees" },
              { count: "24/7", label: "Support" },
              { count: "14-day", label: "Free Trial" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-violet-400 font-bold text-base">{s.count}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 border-t border-white/5 sticky top-[73px] z-40 bg-[#080d1a]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeCategory === c.id
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-white/10"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid — Desktop: 3 cols | Mobile: 1 col */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-1 gap-6">
            {filtered.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-xl font-bold text-white mb-4">Integrates With Your Favorite Tools</h2>
            <p className="text-slate-400">Novatech LMS connects seamlessly with tools you already use</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {["Razorpay", "Google Meet", "Zoom", "WhatsApp Business", "Google Analytics", "Zapier", "Gmail", "Slack"].map((t) => (
              <div key={t} className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:border-violet-500/30 hover:text-white transition-all duration-200">
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-2xl font-bold text-white mb-6">Ready to Experience the Difference?</h2>
          <p className="text-slate-400 mb-8">Start your 14-day free trial — no credit card required.</p>
          <div className="flex flex-wrap gap-4 justify-center md:flex-col md:items-stretch md:max-w-xs md:mx-auto">
            <Link to="/contact" className="px-8 py-4 font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-xl shadow-violet-500/30 hover:-translate-y-0.5 text-center">
              Start Free Trial →
            </Link>
            <Link to="/pricing" className="px-8 py-4 font-semibold text-slate-300 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/5 transition-all duration-200 hover:-translate-y-0.5 text-center">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
