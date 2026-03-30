import React, { useState } from "react";
import { Link } from "react-router-dom";

const CheckIcon = () => (
  <svg className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const plans = [
  {
    id: "starter",
    name: "Starter Pack",
    tagline: "Perfect for single-branch institutes just getting started",
    price: 1000,
    color: "blue",
    gradient: "from-blue-600 to-cyan-600",
    features: [
      { label: "Up to 100 students", included: true },
      { label: "1 Branch", included: true },
      { label: "Student management", included: true },
      { label: "Attendance tracking", included: true },
      { label: "Fee management", included: true },
      { label: "Basic reports", included: true },
      { label: "Email support", included: true },
      { label: "Live class streaming", included: false },
      { label: "AI analytics dashboard", included: false },
      { label: "Multi-branch management", included: false },
      { label: "Certificate generator", included: false },
      { label: "Mobile app (branded)", included: false },
    ],
  },
  {
    id: "professional",
    name: "Growth (Pro)",
    tagline: "The ideal plan for growing institutes with advanced needs",
    price: 1500,
    color: "violet",
    gradient: "from-violet-600 to-indigo-600",
    isPopular: true,
    features: [
      { label: "Up to 200 students", included: true },
      { label: "Up to 3 Branches", included: true },
      { label: "Student management", included: true },
      { label: "Attendance tracking", included: true },
      { label: "Fee management", included: true },
      { label: "Advanced reports & analytics", included: true },
      { label: "Priority support (24/7)", included: true },
      { label: "Live class streaming", included: true },
      { label: "AI analytics dashboard", included: true },
      { label: "Multi-branch management", included: true },
      { label: "Certificate generator", included: true },
      { label: "Mobile app (branded)", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Elite (Enterprise)",
    tagline: "For large institutes and franchise networks at scale",
    price: 2000,
    color: "indigo",
    gradient: "from-indigo-600 to-purple-600",
    features: [
      { label: "Up to 500 students", included: true },
      { label: "Up to 5 Branches", included: true },
      { label: "Student management", included: true },
      { label: "Attendance tracking", included: true },
      { label: "Fee management", included: true },
      { label: "Custom reporting suite", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "Live class streaming", included: true },
      { label: "AI analytics dashboard", included: true },
      { label: "Multi-branch management", included: true },
      { label: "Certificate generator", included: true },
      { label: "Mobile app (branded)", included: true },
    ],
  },
];

const comparisonRows = [
  { label: "Students", starter: "200", professional: "500", enterprise: "Unlimited" },
  { label: "Branches", starter: "1", professional: "5", enterprise: "8" },
  { label: "Student Management", starter: true, professional: true, enterprise: true },
  { label: "Attendance Tracking", starter: true, professional: true, enterprise: true },
  { label: "Fee & Payment Management", starter: true, professional: true, enterprise: true },
  { label: "Exam & Assessments", starter: false, professional: true, enterprise: true },
  { label: "Live Class Streaming", starter: false, professional: true, enterprise: true },
  { label: "AI Analytics Dashboard", starter: false, professional: true, enterprise: true },
  { label: "Certificate Generator", starter: false, professional: true, enterprise: true },
  { label: "Multi-Branch Dashboard", starter: false, professional: true, enterprise: true },
  { label: "Branded Mobile App", starter: false, professional: false, enterprise: true },
  { label: "API Access", starter: false, professional: false, enterprise: true },
  { label: "Dedicated Account Manager", starter: false, professional: false, enterprise: true },
  { label: "Support", starter: "Email", professional: "24/7 Priority", enterprise: "Dedicated" },
];

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const getPrice = (monthly) => {
    if (!monthly) return null;
    return isAnnual ? Math.round(monthly * 0.8) : monthly;
  };

  const CellVal = ({ val }) => {
    if (typeof val === "boolean") return val ? <CheckIcon /> : <XIcon />;
    return <span className="text-slate-300 text-sm">{val}</span>;
  };

  return (
    <div className="bg-[#080d1a] min-h-screen text-white font-sans">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-violet-600/8 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-6 uppercase tracking-wider">
            Simple Pricing
          </div>
          <h1 className="text-5xl md:text-3xl font-bold text-white mb-6 leading-tight">
            Transparent Plans,
            <span className="block text-transparent bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text">No Hidden Costs</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-base leading-relaxed max-w-xl mx-auto mb-8">
            Start free for 14 days. No credit card needed. Upgrade only when you're ready.
          </p>
          {/* Toggle */}
          <div className="inline-flex items-center gap-4 p-1 rounded-full bg-white/5 border border-white/10">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${!isAnnual ? "bg-violet-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2 ${isAnnual ? "bg-violet-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
            >
              Annual
              <span className="px-1.5 py-0.5 text-xs font-bold rounded bg-green-500/20 text-green-300 border border-green-500/20">-20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans — Desktop: 3 cols | Mobile: 1 col */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-1 gap-8 md:gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border transition-all duration-300 ${
                  plan.isPopular
                    ? "bg-gradient-to-b from-violet-900/40 to-[#0a0f1e] border-violet-500/40 shadow-2xl shadow-violet-500/10"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/30">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-8 md:p-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                    <span className="text-white font-bold text-sm">{plan.name[0]}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">{plan.tagline}</p>
                  <div className="mb-6">
                    {plan.price ? (
                      <div className="flex items-end gap-1">
                        <span className="text-slate-400 text-lg">₹</span>
                        <span className="text-4xl font-bold text-white">{getPrice(plan.price).toLocaleString()}</span>
                        <span className="text-slate-400 text-sm mb-1">/month</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-white">Custom</span>
                        <p className="text-slate-400 text-sm mt-1">Contact us for a quote</p>
                      </div>
                    )}
                    {isAnnual && plan.price && (
                      <p className="text-green-400 text-xs mt-1 font-medium">Save ₹{Math.round(plan.price * 12 * 0.2).toLocaleString()}/year</p>
                    )}
                  </div>
                  <Link
                    to="/contact"
                    className={`block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      plan.isPopular
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/30"
                        : "border border-white/15 text-slate-300 hover:text-white hover:border-white/30 hover:bg-white/5"
                    }`}
                  >
                    {plan.price ? "Get Started Free" : "Contact Sales"}
                  </Link>
                </div>
                <div className="px-8 md:px-6 pb-8 border-t border-white/8 pt-6">
                  <p className="text-slate-500 text-xs font-semibold mb-4 uppercase tracking-wider">What's included</p>
                  <div className="space-y-3">
                    {plan.features.map((f) => (
                      <div key={f.label} className="flex items-start gap-3">
                        {f.included ? <CheckIcon /> : <XIcon />}
                        <span className={`text-sm ${f.included ? "text-slate-300" : "text-slate-600"}`}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-xl font-bold text-white mb-4">Full Plan Comparison</h2>
            <p className="text-slate-400">See exactly what's included in each plan</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-6 py-4 text-slate-400 font-medium w-1/2">Feature</th>
                  {["Starter", "Professional", "Enterprise"].map((p) => (
                    <th key={p} className={`px-6 py-4 text-center font-bold ${p === "Professional" ? "text-violet-400" : "text-white"}`}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.label} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/2"} hover:bg-white/5 transition-colors duration-150`}>
                    <td className="px-6 py-4 text-slate-300">{row.label}</td>
                    <td className="px-6 py-4 text-center"><div className="flex justify-center"><CellVal val={row.starter} /></div></td>
                    <td className="px-6 py-4 text-center bg-violet-500/5"><div className="flex justify-center"><CellVal val={row.professional} /></div></td>
                    <td className="px-6 py-4 text-center"><div className="flex justify-center"><CellVal val={row.enterprise} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Is there a free trial?", a: "Yes! Every plan comes with a 14-day free trial. No credit card needed to get started." },
              { q: "Can I upgrade or downgrade my plan anytime?", a: "Absolutely. You can upgrade to a higher plan at any time and the difference is prorated. Downgrades take effect at the next billing cycle." },
              { q: "Is there a setup fee?", a: "No setup fee, ever. We also provide free onboarding and training for all plans." },
              { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI, net banking, and NEFT/RTGS for enterprise clients." },
              { q: "Is my data safe?", a: "Your data is encrypted at rest and in transit. We take daily backups and host on enterprise-grade infrastructure with 99.9% uptime." },
              { q: "Do you offer discounts for NGOs or government institutes?", a: "Yes, we offer special pricing for educational NGOs, government-registered schools, and non-profit training centers. Contact our sales team." },
            ].map((faq) => (
              <details key={faq.q} className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer">
                <summary className="flex items-center justify-between text-white font-semibold text-sm list-none">
                  {faq.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200">▾</span>
                </summary>
                <p className="mt-3 text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-2xl font-bold text-white mb-6">Start Your Free Trial Today</h2>
          <p className="text-slate-400 mb-8">No credit card required. Full access for 14 days. Cancel anytime.</p>
          <Link to="/contact" className="inline-flex px-8 py-4 font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-xl shadow-violet-500/30 hover:-translate-y-0.5">
            Get Started for Free →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
