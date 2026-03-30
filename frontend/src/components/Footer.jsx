import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Mail, ArrowRight } from "lucide-react";
import { usePlatform } from "../context/PlatformContext";

const Footer = () => {
  const { platformName, supportEmail, supportPhone } = usePlatform();

  return (
    <footer className="relative bg-[#060b17] border-t border-white/5 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Desktop: 4 cols — 2 for brand, 1 for links, 1 for newsletter | Mobile: 1 col */}
        <div className="grid grid-cols-4 md:grid-cols-1 gap-12 md:gap-8">
          {/* Brand — spans 2 cols on desktop */}
          <div className="col-span-2 md:col-span-1 space-y-6 pr-8 md:pr-0">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg leading-none tracking-tight">{platformName}</span>
                <span className="text-violet-400 text-[10px] font-semibold tracking-widest uppercase leading-none">Management System</span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              India's premier Learning Management System built for modern training institutes, coaching centers, and educational franchises. Streamline operations. Empower students. Grow faster.
            </p>

            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: "#", hover: "hover:bg-blue-600" },
                { Icon: Instagram, href: "#", hover: "hover:bg-pink-600" },
                { Icon: Linkedin, href: "#", hover: "hover:bg-blue-500" },
                { Icon: Twitter, href: "#", hover: "hover:bg-sky-500" },
              ].map(({ Icon, href, hover }) => (
                <a
                  key={hover}
                  href={href}
                  className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white ${hover} hover:border-transparent transition-all duration-200`}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5">Platform</h4>
            <ul className="space-y-3">
              {[
                { label: "Home", path: "/" },
                { label: "About Us", path: "/about" },
                { label: "Features", path: "/features" },
                { label: "Pricing", path: "/pricing" },
                { label: "Contact Us", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-violet-400 transition-all duration-200 overflow-hidden" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5">Stay Updated</h4>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Get product updates, tutorials, and EdTech insights in your inbox.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full pl-8 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-white transition-colors duration-200 flex-shrink-0"
              >
                <ArrowRight size={14} />
              </button>
            </form>
            <div className="mt-5 space-y-2">
              <p className="text-slate-400 text-xs flex items-center gap-2">
                <span className="text-violet-400">📞</span> {supportPhone}
              </p>
              <p className="text-slate-400 text-xs flex items-center gap-2">
                <span className="text-violet-400">📧</span> {supportEmail}
              </p>
              <p className="text-slate-400 text-xs flex items-center gap-2">
                <span className="text-violet-400">📍</span> India
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between md:flex-col md:items-start gap-4">
          <p className="text-slate-600 text-xs">
            © 2026 {platformName}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 md:gap-3">
            {[
              { label: "Privacy Policy", path: "/privacy" },
              { label: "Terms of Service", path: "/terms" },
              { label: "Admin Login", path: "/admin/login" },
              { label: "Student Login", path: "/student/login" },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-slate-600 hover:text-slate-400 text-xs transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
