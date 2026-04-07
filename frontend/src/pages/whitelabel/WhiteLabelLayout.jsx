import React, { useEffect, useState } from 'react';
import { Outlet, useParams, Link, useLocation } from 'react-router-dom';
import axios from '../../lib/axios';
import { Menu, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

/* ─── Hook: real window width ─── */
function useWindowWidth() {
  const [width, setWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export default function WhiteLabelLayout() {
  const { domainName } = useParams();
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 768; // md breakpoint for nav

  // Close mobile menu on resize to desktop
  React.useEffect(() => {
    if (isDesktop) setMobileMenuOpen(false);
  }, [isDesktop]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const res = await axios.get(`/website/resolve/${domainName}`);
        if (res.data.success) {
          setSiteData(res.data.website);
          document.documentElement.style.setProperty('--primary-color', res.data.website.theme.primaryColor || '#2563eb');
        } else setError(true);
      } catch { setError(true); }
      finally { setLoading(false); }
    };
    fetchSiteData();
    return () => document.documentElement.style.removeProperty('--primary-color');
  }, [domainName]);

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <div style={{ width: 48, height: 48, border: "4px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Error / 404 ── */
  if (error || !siteData) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f9fafb", textAlign: "center", padding: isMobile ? "24px 20px" : 32 }}>
      <div style={{ fontSize: isMobile ? 72 : 96, fontWeight: 900, color: "#f1f5f9", marginBottom: 16 }}>404</div>
      <h1 style={{ margin: "0 0 12px", fontSize: isMobile ? 22 : 28, fontWeight: 900, color: "#1f2937" }}>Storefront Not Found</h1>
      <p style={{ margin: "0 0 28px", color: "#6b7280", maxWidth: 360, fontSize: 14 }}>
        This academy website doesn't exist or has been disabled by the administrator.
      </p>
      <Link
        to="/"
        style={{ padding: "12px 32px", background: "#2563eb", color: "#fff", fontWeight: 700, borderRadius: 16, textDecoration: "none", fontSize: 14, transition: "background 0.2s" }}
        onMouseOver={e => e.currentTarget.style.background = "#1d4ed8"}
        onMouseOut={e => e.currentTarget.style.background = "#2563eb"}
      >
        Return to Novara Edu
      </Link>
    </div>
  );

  const primaryColor = siteData.theme.primaryColor || '#2563eb';
  const dn = siteData.domainName;

  const navLinks = [
    { name: 'Home',     path: `/site/${dn}` },
    { name: 'About Us', path: `/site/${dn}/about` },
    { name: 'Courses',  path: `/site/${dn}/courses` },
    { name: 'Contact',  path: `/site/${dn}/contact` },
  ];

  const isActive = (path) => {
    if (path === `/site/${dn}`) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif", color: "#111827" }}>
      <Helmet>
        <title>{siteData.instituteName}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" />
      </Helmet>

      {/* ═══ NAVBAR ══════════════════════════════════════════════════ */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: isDesktop ? "0 64px" : "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>

            {/* Logo */}
            <Link to={`/site/${dn}`} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              {siteData.theme.logoUrl ? (
                <img src={siteData.theme.logoUrl} alt={siteData.instituteName} style={{ height: 44, maxWidth: 140, objectFit: "contain" }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18, flexShrink: 0, background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`, boxShadow: `0 4px 14px ${primaryColor}40`, transition: "transform 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.transform = "scale(1.06)"}
                  onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  {siteData.instituteName.charAt(0)}
                </div>
              )}
              <span style={{ fontWeight: 900, fontSize: 19, color: "#111827", letterSpacing: "-0.01em", lineHeight: 1 }}>
                {siteData.instituteName}
              </span>
            </Link>

            {/* Desktop Nav Links */}
            {isDesktop && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {navLinks.map(link => (
                  <Link
                    key={link.name} to={link.path}
                    style={{
                      padding: "8px 16px", borderRadius: 12, fontWeight: 700, fontSize: 14,
                      textDecoration: "none", transition: "all 0.2s",
                      ...(isActive(link.path)
                        ? { background: primaryColor, color: "#fff", boxShadow: `0 4px 12px ${primaryColor}40` }
                        : { color: "#6b7280" }),
                    }}
                    onMouseOver={e => { if (!isActive(link.path)) { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#f9fafb"; } }}
                    onMouseOut={e => { if (!isActive(link.path)) { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.background = "transparent"; } }}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Desktop CTA Buttons */}
            {isDesktop && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Link to="/student/login"
                  style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", padding: "8px 12px", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.color = "#111827"}
                  onMouseOut={e => e.currentTarget.style.color = "#6b7280"}
                >
                  Student Login
                </Link>
                <Link to="/admin/login"
                  style={{ padding: "10px 20px", color: "#fff", fontWeight: 900, fontSize: 13, borderRadius: 12, textDecoration: "none", background: primaryColor, boxShadow: `0 4px 14px ${primaryColor}40`, transition: "opacity 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.opacity = "0.88"}
                  onMouseOut={e => e.currentTarget.style.opacity = "1"}
                >
                  Admin Login
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            {!isDesktop && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ width: 40, height: 40, borderRadius: 12, background: "#f9fafb", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", cursor: "pointer", transition: "background 0.2s" }}
                onMouseOver={e => e.currentTarget.style.background = "#f1f5f9"}
                onMouseOut={e => e.currentTarget.style.background = "#f9fafb"}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {!isDesktop && mobileMenuOpen && (
          <div style={{ position: "absolute", width: "100%", left: 0, background: "#fff", borderTop: "1px solid #f1f5f9", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", zIndex: 50 }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
              {navLinks.map(link => (
                <Link
                  key={link.name} to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: "block", padding: "12px 16px", borderRadius: 12,
                    fontWeight: 700, fontSize: 14, textDecoration: "none", transition: "all 0.2s",
                    ...(isActive(link.path)
                      ? { background: primaryColor, color: "#fff" }
                      : { color: "#374151" }),
                  }}
                  onMouseOver={e => { if (!isActive(link.path)) e.currentTarget.style.background = "#f9fafb"; }}
                  onMouseOut={e => { if (!isActive(link.path)) e.currentTarget.style.background = "transparent"; }}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Auth Buttons */}
              <div style={{ display: "flex", gap: 10, paddingTop: 10, marginTop: 6, borderTop: "1px solid #f1f5f9" }}>
                <Link to="/student/login"
                  style={{ flex: 1, textAlign: "center", padding: "10px 0", fontWeight: 700, fontSize: 13, color: "#475569", border: "1px solid #e5e7eb", borderRadius: 12, textDecoration: "none", background: "#fff" }}>
                  Student Login
                </Link>
                <Link to="/admin/login"
                  style={{ flex: 1, textAlign: "center", padding: "10px 0", fontWeight: 700, fontSize: 13, color: "#fff", borderRadius: 12, textDecoration: "none", background: primaryColor }}>
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ PAGE CONTENT ════════════════════════════════════════════ */}
      <main style={{ flex: 1 }}>
        <Outlet context={{ siteData, primaryColor }} />
      </main>

      {/* ═══ FOOTER ══════════════════════════════════════════════════ */}
      <footer style={{ background: "#030712", color: "#9ca3af" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: isDesktop ? "64px 64px" : isMobile ? "48px 20px" : "56px 32px" }}>

          {/* Footer grid */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 36 : 48, paddingBottom: 40, borderBottom: "1px solid #1f2937" }}>

            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                {siteData.theme.logoUrl
                  ? <img src={siteData.theme.logoUrl} alt={siteData.instituteName} style={{ height: 40, objectFit: "contain", filter: "brightness(1.5)" }} />
                  : <div style={{ width: 40, height: 40, borderRadius: 12, background: primaryColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 17 }}>
                      {siteData.instituteName.charAt(0)}
                    </div>
                }
                <span style={{ fontWeight: 900, color: "#fff", fontSize: 17 }}>{siteData.instituteName}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#6b7280" }}>
                {siteData.footer?.tagline || 'Empowering students through world-class education.'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <p style={{ margin: "0 0 18px", fontSize: 11, fontWeight: 900, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>Quick Links</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {navLinks.map(l => (
                  <li key={l.name}>
                    <Link to={l.path}
                      style={{ fontSize: 13, fontWeight: 500, color: "#9ca3af", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseOver={e => e.currentTarget.style.color = "#fff"}
                      onMouseOut={e => e.currentTarget.style.color = "#9ca3af"}
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p style={{ margin: "0 0 18px", fontSize: 11, fontWeight: 900, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>Contact</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                {siteData.footer?.phone && (
                  <p style={{ margin: 0, fontWeight: 500, color: "#9ca3af" }}>{siteData.footer.phone}</p>
                )}
                {siteData.footer?.email && (
                  <a href={`mailto:${siteData.footer.email}`}
                    style={{ fontWeight: 500, color: "#9ca3af", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseOver={e => e.currentTarget.style.color = "#fff"}
                    onMouseOut={e => e.currentTarget.style.color = "#9ca3af"}
                  >
                    {siteData.footer.email}
                  </a>
                )}
                {siteData.footer?.address && (
                  <p style={{ margin: 0, fontWeight: 500, color: "#9ca3af", lineHeight: 1.6 }}>{siteData.footer.address}</p>
                )}
              </div>

              {/* Social Links */}
              {siteData.footer?.socialLinks?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
                  {siteData.footer.socialLinks.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noreferrer"
                      style={{ padding: "5px 12px", fontSize: 11, fontWeight: 700, borderRadius: 8, background: "#1f2937", color: "#9ca3af", textDecoration: "none", transition: "all 0.2s" }}
                      onMouseOver={e => { e.currentTarget.style.background = "#374151"; e.currentTarget.style.color = "#fff"; }}
                      onMouseOut={e => { e.currentTarget.style.background = "#1f2937"; e.currentTarget.style.color = "#9ca3af"; }}
                    >
                      {s.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ paddingTop: 28, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "center" : "center", gap: 10, textAlign: isMobile ? "center" : "left" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#374151", fontWeight: 500 }}>
              © {new Date().getFullYear()} {siteData.instituteName}. All rights reserved.
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#374151", fontWeight: 500 }}>
              Powered by <span style={{ color: "#6b7280" }}>Novara Edu</span>
            </p>
          </div>
        </div>
      </footer>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}