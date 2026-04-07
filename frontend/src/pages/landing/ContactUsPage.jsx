import React, { useState } from "react";
import API_BASE_URL from "../../lib/utils";
import { toast } from "sonner";

const ContactInfoCard = ({ icon, label, value, sub }) => (
  <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all duration-300">
    <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center text-xl flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-white font-semibold text-sm">{value}</p>
      {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
);

const ContactUsPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    institute: "",
    message: "",
    plan: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/public/demo-inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          instituteName: form.institute,
          plan: form.plan,
          message: form.message,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success("Demo request submitted successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.msg || "Failed to submit request. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#080d1a] min-h-screen text-white font-sans">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-violet-600/8 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-6 uppercase tracking-wider">
            Get in Touch
          </div>
          <h1 className="text-5xl md:text-3xl font-bold text-white mb-6 leading-tight">
            Let's Start Your
            <span className="block text-transparent bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text">
              LMS Journey
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-base leading-relaxed max-w-xl mx-auto">
            Book a free demo, ask questions, or just say hello. Our team
            responds within 2 business hours.
          </p>
        </div>
      </section>

      {/* Main Content — Desktop: 2 cols | Mobile: 1 col */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-16 md:gap-10 items-start">
            {/* Left: Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Talk to Our Team
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  Whether you're a small coaching center or a large franchise
                  network, our solutions experts are ready to craft the perfect
                  plan for you.
                </p>
              </div>

              <div className="space-y-4">
                <ContactInfoCard
                  icon="📧"
                  label="Email"
                  value="hello@novatechlms.com"
                  sub="We reply within 2 hours"
                />
                <ContactInfoCard
                  icon="📞"
                  label="Phone"
                  value="+91 9718269561"
                  sub="Mon–Sat, 9AM–7PM IST"
                />
                <ContactInfoCard
                  icon="💬"
                  label="WhatsApp"
                  value="+91 9718269561"
                  sub="Chat with us directly"
                />
                <ContactInfoCard
                  icon="📍"
                  label="Headquarters"
                  value="Gaur City 2, Greater Noida West, India"
                  sub="India"
                />
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-900/30 to-indigo-900/30 border border-violet-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⚡</span>
                  <h3 className="text-white font-bold">
                    Lightning-Fast Response
                  </h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Our typical first response time is under 2 hours during
                  business hours. For enterprise inquiries, a dedicated
                  solutions architect is assigned within 30 minutes.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "The Novatech team responded within 30 minutes and had our
                  entire institute set up within a day. Best onboarding
                  experience ever."
                </p>
                <p className="text-slate-500 text-xs mt-3 font-medium">
                  — Meera Krishnan, Institute Head, Bengaluru
                </p>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div>
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-white/5 border border-white/10 min-h-[400px]">
                  <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center text-4xl mb-6">
                    ✅
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Message Sent!
                  </h3>
                  <p className="text-slate-400 leading-relaxed max-w-xs">
                    Thank you for reaching out! Our team will contact you within
                    2 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        email: "",
                        phone: "",
                        institute: "",
                        message: "",
                        plan: "",
                      });
                    }}
                    className="mt-6 px-6 py-2.5 text-sm font-medium text-violet-300 border border-violet-500/30 rounded-xl hover:bg-violet-500/10 transition-all duration-200"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 p-8 md:p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <h3 className="text-xl font-bold text-white mb-6">
                    Book a Free Demo or Send Enquiry
                  </h3>

                  {/* Desktop: 2 cols | Mobile: 1 col */}
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Ramesh Kumar"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="you@institute.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Desktop: 2 cols | Mobile: 1 col */}
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        placeholder="+91 9718269561"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Institute Name
                      </label>
                      <input
                        type="text"
                        name="institute"
                        value={form.institute}
                        onChange={handleChange}
                        placeholder="Your Institute Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Plan Interested In
                    </label>
                    <select
                      name="plan"
                      value={form.plan}
                      onChange={handleChange}
                      className="w-full bg-[#0f1729] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all duration-200 text-slate-300"
                    >
                      <option value="" className="bg-[#0f1729]">
                        Select a plan...
                      </option>
                      <option value="starter" className="bg-[#0f1729]">
                        Starter — ₹1,500/month
                      </option>
                      <option value="professional" className="bg-[#0f1729]">
                        Growth (Pro) — ₹2,000/month
                      </option>
                      <option value="enterprise" className="bg-[#0f1729]">
                        Elite (Enterprise) — ₹3,000/month
                      </option>
                      <option value="trial" className="bg-[#0f1729]">
                        Just a Free Trial
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about your institute — number of students, branches, specific needs..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all duration-200 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-xl shadow-violet-500/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      "Send Message & Book Demo →"
                    )}
                  </button>

                  <p className="text-slate-600 text-xs text-center">
                    By submitting, you agree to our Privacy Policy. We never
                    share your data.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations — Desktop: 4 cols | Mobile: 2 cols */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-xl font-bold text-white mb-4">
              Our Offices
            </h2>
            <p className="text-slate-400">Find us across India</p>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-2 gap-6">
            {[
              {
                city: "Noida (HQ)",
                address: "Building 7, Tech Park, Sector 62",
                flag: "🏢",
              },
              {
                city: "Mumbai",
                address: "1204, BKC Business Tower, Bandra Kurla",
                flag: "🌊",
              },
              {
                city: "Bengaluru",
                address: "WeWork, 3rd Floor, Koramangala",
                flag: "🌿",
              },
              {
                city: "Hyderabad",
                address: "HITEC City, Cyber Towers, Floor 2",
                flag: "🔷",
              },
            ].map((office) => (
              <div
                key={office.city}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <span className="text-3xl mb-3 block">{office.flag}</span>
                <h3 className="text-white font-bold mb-1">{office.city}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {office.address}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsPage;
