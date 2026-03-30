import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePlatform } from "../context/PlatformContext";

const LandingNavbar = () => {
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { platformName, primaryColor } = usePlatform();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Features", path: "/features" },
    { label: "Pricing", path: "/pricing" },
    { label: "Contact Us", path: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLoginMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0f1e]/95 backdrop-blur-xl shadow-2xl shadow-black/30 border-b border-white/5"
          : "bg-[#0a0f1e]/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-none tracking-tight">{platformName}</span>
              <span className="text-violet-400 text-[10px] font-semibold tracking-widest uppercase leading-none">Learning Management System</span>
            </div>
          </Link>

          {/* ── Desktop Nav Links — flex always, hidden on mobile (md:hidden) ── */}
          <div className="flex items-center gap-1 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(link.path) ? "text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {isActive(link.path) && (
                  <span className="absolute inset-0 bg-white/10 rounded-lg" />
                )}
                <span className="relative">{link.label}</span>
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-violet-400 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* ── Desktop Buttons — flex always, hidden on mobile (md:hidden) ── */}
          <div className="flex items-center gap-3 md:hidden">
            <div className="relative">
              <button
                onClick={() => setIsLoginMenuOpen(!isLoginMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200 hover:bg-white/5"
              >
                Login
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isLoginMenuOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLoginMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#111827] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <Link
                    to="/admin/login"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                    onClick={() => setIsLoginMenuOpen(false)}
                  >
                    <span className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">⚙</span>
                    Admin Login
                  </Link>
                  <div className="h-px bg-white/5" />
                  <Link
                    to="/student/login"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                    onClick={() => setIsLoginMenuOpen(false)}
                  >
                    <span className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">🎓</span>
                    Student Login
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/contact"
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-lg shadow-violet-500/25"
            >
              Get Started
            </Link>
          </div>

          {/* ── Hamburger — hidden on desktop, block on mobile (hidden + md:block) ── */}
          <button
            className="hidden md:block p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown — only on mobile (md breakpoint) ── */}
      {isMobileMenuOpen && (
        <div className="hidden md:block border-t border-white/5 bg-[#0d1424]">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive(link.path)
                    ? "text-white bg-white/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </Link>
            ))}

            <div className="h-px bg-white/5 my-2" />

            <Link
              to="/admin/login"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">⚙</span>
              Admin Login
            </Link>
            <Link
              to="/student/login"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs">🎓</span>
              Student Login
            </Link>

            <div className="pt-2">
              <Link
                to="/contact"
                className="flex items-center justify-center w-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
