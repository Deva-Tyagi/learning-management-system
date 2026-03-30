import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const useCounter = (target, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const stepVal = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current++;
      setCount(Math.min(Math.round(stepVal * current), target));
      if (current >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
};

const StatCard = ({ value, suffix = "+", label, color }) => {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="relative group flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 hover:-translate-y-1">
      <p className={`text-4xl font-bold mb-2 text-${color}-400`}>{count}{suffix}</p>
      <p className="text-slate-400 text-sm font-medium text-center">{label}</p>
    </div>
  );
};

const FeatureChip = ({ text }) => (
  <span className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 px-4 py-2 rounded-full border border-white/10">
    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
    {text}
  </span>
);

const TestimonialCard = ({ name, role, quote, avatar }) => (
  <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1">
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
    <p className="text-slate-300 text-sm leading-relaxed">"{quote}"</p>
    <div className="flex items-center gap-3 mt-auto">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
        {avatar}
      </div>
      <div>
        <p className="text-white text-sm font-semibold">{name}</p>
        <p className="text-slate-500 text-xs">{role}</p>
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const features = [
    "Smart Student Management", "AI-Powered Analytics", "Live Class Streaming",
    "Automated Attendance", "Exam & Assessment Tools", "Certificate Generation",
    "Payment Gateway Integration", "Mobile-First Design", "Multi-Branch Support",
    "Real-Time Notifications", "Course Builder", "Dynamic ID Cards",
  ];

  const testimonials = [
    { name: "Priya Sharma", role: "Institute Director, Delhi", quote: "Novatech LMS transformed how we manage our 500+ students. The analytics dashboard alone saved us 20 hours per week.", avatar: "P" },
    { name: "Rajesh Kumar", role: "Principal, Hyderabad", quote: "The attendance automation and exam module are incredible. Our administrative work reduced by 60% in just the first month.", avatar: "R" },
    { name: "Sneha Patil", role: "Training Head, Pune", quote: "Student engagement went through the roof with the live streaming and interactive assignments. Highly recommend!", avatar: "S" },
    { name: "Amandeep Singh", role: "Franchise Owner, Chandigarh", quote: "Managing multiple branches was a nightmare before Novatech. Now everything is on one single dashboard.", avatar: "A" },
    { name: "Deepika Nair", role: "Coordinator, Kochi", quote: "The certificate generation feature is a game changer. Students love the instant digital certificates.", avatar: "D" },
    { name: "Vikram Mehta", role: "CEO, EduTech Pvt Ltd", quote: "Best LMS investment we made. ROI was visible within 3 months of deployment. Outstanding support team.", avatar: "V" },
  ];

  return (
    <div className="bg-[#080d1a] min-h-screen text-white font-sans">
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute bottom-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            India's Premier Learning Management System
          </div>

          <h1 className="text-5xl md:text-4xl sm:text-3xl font-bold leading-tight mb-6 tracking-tight">
            Power Your
            <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Institute's Future
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed md:text-base">
            Novatech LMS is the all-in-one platform built for modern training institutes.
            Manage students, courses, attendance, exams, and analytics — all from one elegant dashboard.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16 md:flex-col md:items-stretch md:max-w-xs md:mx-auto">
            <Link
              to="/contact"
              className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-xl shadow-violet-500/30 hover:-translate-y-0.5 text-center"
            >
              Start Free Trial →
            </Link>
            <Link
              to="/features"
              className="px-8 py-4 text-base font-semibold text-slate-300 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/5 transition-all duration-200 hover:-translate-y-0.5 text-center"
            >
              Explore Features
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {features.map((f) => <FeatureChip key={f} text={f} />)}
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-2xl font-bold text-white mb-4">Trusted by Institutes Nationwide</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Numbers that reflect our commitment to transforming education</p>
          </div>
          {/* Desktop: 4 cols | Mobile: 2 cols */}
          <div className="grid grid-cols-4 md:grid-cols-2 gap-6">
            <StatCard value={500} suffix="+" label="Partner Institutes" color="violet" />
            <StatCard value={50000} suffix="+" label="Students Enrolled" color="indigo" />
            <StatCard value={99} suffix="%" label="Uptime Guarantee" color="blue" />
            <StatCard value={4} suffix="/5★" label="Average Rating" color="amber" />
          </div>
        </div>
      </section>

      {/* ─── Why Novatech Section ─── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop: 2 cols | Mobile: 1 col */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 uppercase tracking-wider">
                Why Choose Us
              </div>
              <h2 className="text-3xl md:text-2xl font-bold text-white mb-6 leading-tight">
                Built specifically for<br />
                <span className="text-indigo-400">Training Institutes</span>
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Unlike generic CRMs, Novatech LMS was designed ground-up for the unique needs of coaching centers, training academies, and educational institutes.
              </p>
              {/* Desktop: 2 cols | Mobile: 1 col */}
              <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                {[
                  { icon: "⚡", title: "Lightning Fast", desc: "Set up in under 2 hours" },
                  { icon: "🛡", title: "Secure & Private", desc: "Bank-grade data encryption" },
                  { icon: "📱", title: "Mobile Ready", desc: "Works on all devices" },
                  { icon: "🔄", title: "Always Updated", desc: "New features every month" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/8 hover:border-white/15 transition-all duration-200">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative md:hidden">
              {/* Dashboard mockup — hide on mobile to save space */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="bg-[#111827] p-4 border-b border-white/10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                </div>
                <div className="bg-[#0f1729] p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <div>
                      <p className="text-slate-400 text-xs">Total Students</p>
                      <p className="text-white text-2xl font-bold">1,248</p>
                    </div>
                    <span className="text-violet-400 text-3xl">👥</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <p className="text-slate-400 text-xs">Active Courses</p>
                      <p className="text-white text-xl font-bold">34</p>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-slate-400 text-xs">Attendance</p>
                      <p className="text-white text-xl font-bold">92%</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-slate-400 text-xs font-medium">Revenue Progress</p>
                      <p className="text-green-400 text-xs font-semibold">+18% this month</p>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full" style={{ width: "72%" }} />
                    </div>
                    <p className="text-white text-sm font-semibold mt-2">₹4,32,000 / ₹6,00,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-6 uppercase tracking-wider">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-2xl font-bold text-white mb-4">What Our Partners Say</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Real feedback from real institute directors and educators</p>
          </div>
          {/* Desktop: 3 cols | Tablet: 2 cols | Mobile: 1 col */}
          <div className="grid grid-cols-3 md:grid-cols-1 sm:grid-cols-1 gap-6">
            {testimonials.map((t) => <TestimonialCard key={t.name} {...t} />)}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="relative p-12 md:p-8 rounded-3xl bg-gradient-to-br from-violet-900/40 via-indigo-900/40 to-[#0a0f1e] border border-violet-500/20 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-2xl font-bold text-white mb-6 leading-tight">
                Ready to Transform<br />
                <span className="text-transparent bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text">Your Institute?</span>
              </h2>
              <p className="text-slate-400 mb-10 text-lg md:text-base leading-relaxed max-w-xl mx-auto">
                Join 500+ institutes already using Novatech LMS to streamline operations, boost student outcomes, and grow revenue.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:flex-col md:items-stretch md:max-w-xs md:mx-auto">
                <Link to="/contact" className="px-8 py-4 font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-xl shadow-violet-500/30 hover:-translate-y-0.5 text-center">
                  Book a Free Demo →
                </Link>
                <Link to="/pricing" className="px-8 py-4 font-semibold text-slate-300 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/5 transition-all duration-200 hover:-translate-y-0.5 text-center">
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
