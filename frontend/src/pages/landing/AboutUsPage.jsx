import React from "react";
import { Link } from "react-router-dom";

const ValueCard = ({ icon, title, desc }) => (
  <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 group">
    <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center text-2xl group-hover:bg-violet-500/25 transition-colors duration-300">
      {icon}
    </div>
    <div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const TeamCard = ({ name, role, initials, gradient }) => (
  <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 text-center">
    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
      {initials}
    </div>
    <div>
      <p className="text-white font-bold">{name}</p>
      <p className="text-slate-400 text-sm mt-1">{role}</p>
    </div>
  </div>
);

const AboutUsPage = () => {
  const values = [
    { icon: "🎯", title: "Mission-Driven", desc: "We exist to make quality education management accessible to every institute, regardless of size." },
    { icon: "🔬", title: "Innovation First", desc: "We continuously research and integrate the latest in EdTech — AI analytics, real-time tracking, and automation." },
    { icon: "🤝", title: "Partner-Centric", desc: "We treat every institute as a long-term partner. Our support team is available 24/7." },
    { icon: "🌱", title: "Student Success", desc: "Everything we build is in service of students. Better managed institutes produce better-prepared graduates." },
    { icon: "🔒", title: "Trust & Security", desc: "Your data is protected with bank-grade encryption, daily backups, and zero-knowledge architecture." },
    { icon: "⚡", title: "Speed & Reliability", desc: "99.9% uptime guarantee backed by redundant cloud infrastructure. Always there when you need us." },
  ];

  const milestones = [
    { year: "2019", title: "Founded", desc: "Novatech LMS was born from a simple vision — make institute management effortless." },
    { year: "2020", title: "First 50 Institutes", desc: "Rapid adoption across coaching centers in Delhi NCR and Maharashtra." },
    { year: "2021", title: "Product 2.0 Launch", desc: "Introduced live streaming, AI analytics, and multi-branch management." },
    { year: "2022", title: "Pan-India Expansion", desc: "Reached 200+ institutes across 15 states with dedicated regional support." },
    { year: "2023", title: "50,000 Students Managed", desc: "A landmark milestone demonstrating real-world impact at scale." },
    { year: "2024", title: "Award-Winning Platform", desc: "Recognized as India's Best EdTech Product at the National Education Summit." },
  ];

  const team = [
    { name: "Sahil Singh Rajput", role: "Co-Founder & CEO", initials: "SSR", gradient: "from-violet-500 to-purple-700" },
    { name: "Mayank Tomar", role: "Co-Founder & CTO", initials: "MT", gradient: "from-indigo-500 to-blue-700" },
    { name: "Deva Tyagi", role: "Head of Product", initials: "DT", gradient: "from-blue-500 to-cyan-700" },
    { name: "Rohit Prajapati", role: "Head of Customer Success", initials: "RP", gradient: "from-pink-500 to-rose-700" },
  ];

  return (
    <div className="bg-[#080d1a] min-h-screen text-white font-sans">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-600/8 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-6 uppercase tracking-wider">
            Our Story
          </div>
          <h1 className="text-5xl md:text-3xl font-bold text-white mb-6 leading-tight">
            Empowering Institutes to
            <span className="block text-transparent bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text">Focus on What Matters</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-base leading-relaxed max-w-2xl mx-auto">
            We started Novatech LMS because we saw how much time educators were spending on administration instead of teaching.
          </p>
        </div>
      </section>

      {/* Mission & Vision — Desktop: 2 cols | Mobile: 1 col */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-violet-900/30 to-[#0a0f1e] border border-violet-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-2xl mb-6">🚀</div>
                <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                <p className="text-slate-300 leading-relaxed">
                  To empower every educational institute in India with intelligent, affordable, and intuitive management tools — enabling educators to spend less time on administration and more time changing lives through learning.
                </p>
              </div>
            </div>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/30 to-[#0a0f1e] border border-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl mb-6">🌟</div>
                <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
                <p className="text-slate-300 leading-relaxed">
                  A future where every student in India has access to a well-organized, data-driven learning environment — regardless of whether their institute is in a metro city or a tier-3 town.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values — Desktop: 3 cols | Mobile: 1 col */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 uppercase tracking-wider">Core Values</div>
            <h2 className="text-3xl md:text-2xl font-bold text-white mb-4">What Drives Us Every Day</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Principles that shape every product decision and every customer interaction</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-1 gap-6">
            {values.map((v) => <ValueCard key={v.title} {...v} />)}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-6 uppercase tracking-wider">Timeline</div>
            <h2 className="text-3xl md:text-2xl font-bold text-white mb-4">Our Journey</h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-indigo-500/30 to-transparent" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={i} className="relative flex gap-6 pl-16">
                  <div className="absolute left-0 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-xs font-bold flex-shrink-0">
                    {m.year}
                  </div>
                  <div className="flex-1 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/20 transition-all duration-200">
                    <h3 className="text-white font-bold mb-1">{m.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team — Desktop: 4 cols | Mobile: 2 cols */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-6 uppercase tracking-wider">The Team</div>
            <h2 className="text-3xl md:text-2xl font-bold text-white mb-4">Meet the Founders</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Educators, engineers, and entrepreneurs united by one goal</p>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-2 gap-6">
            {team.map((t) => <TeamCard key={t.name} {...t} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-2xl font-bold text-white mb-6">Be Part of the Novatech Story</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">Join hundreds of institutes that have already transformed their operations with Novatech LMS.</p>
          <Link to="/contact" className="inline-flex px-8 py-4 font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-xl shadow-violet-500/30 hover:-translate-y-0.5">
            Get in Touch →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
