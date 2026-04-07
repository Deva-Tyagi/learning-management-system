import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import axios from '../../lib/axios';
import { ChevronRight, BookOpen, ArrowRight, Clock } from 'lucide-react';

const getFee = (c) => {
  if (!c) return 0;
  if (c.totalFee > 0) return c.totalFee;
  if (c.fees > 0) return c.fees;
  if (c.monthlyFee > 0 && c.durationMonths > 0) return c.monthlyFee * c.durationMonths;
  return 0;
};

/* ─── Hook: real window width ─── */
function useWindowWidth() {
  const [width, setWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

/* ─── Hex → RGB helper ─── */
function hexToRgb(hex = '#000000') {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/* ─── Section label ─── */
function Label({ children, color, light = false }) {
  return (
    <p style={{
      margin: '0 0 12px',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.18em',
      color: light ? `rgba(255,255,255,0.5)` : color,
    }}>
      {children}
    </p>
  );
}

export default function WhiteLabelHome() {
  const { siteData, primaryColor } = useOutletContext();
  const [courses, setCourses] = useState([]);
  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;
  const rgb = hexToRgb(primaryColor);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const adminId = siteData.adminId?._id || siteData.adminId;
        const res = await axios.get(`/website/courses/${adminId}`);
        if (res.data.success) setCourses(res.data.courses.slice(0, 3));
      } catch (err) { console.error(err); }
    };
    if (siteData) fetchCourses();
  }, [siteData]);

  if (!siteData) return null;

  const { homePage } = siteData;
  const dn = siteData.domainName;

  const container = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: isMobile ? '0 20px' : isDesktop ? '0 64px' : '0 40px',
  };

  const sectionPad = { padding: isMobile ? '72px 0' : '112px 0' };

  return (
    <div style={{ width: '100%', background: '#fafaf9', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes heroFadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }
        .hero-badge { animation: heroFadeUp 0.6s ease both; }
        .hero-title { animation: heroFadeUp 0.7s 0.1s ease both; }
        .hero-sub { animation: heroFadeUp 0.7s 0.2s ease both; }
        .hero-ctas { animation: heroFadeUp 0.7s 0.3s ease both; }
      `}</style>

      {/* ══ 1. HERO ══════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        minHeight: isMobile ? '85vh' : '92vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#0d0d0d',
      }}>
        {/* Background image */}
        {homePage.banner.backgroundImage && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${homePage.banner.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
          }} />
        )}

        {/* Grain texture */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.045, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
          <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        {/* Primary glow — top right */}
        <div style={{
          position: 'absolute', top: -100, right: isMobile ? -100 : -40,
          width: isMobile ? 360 : 560, height: isMobile ? 360 : 560,
          borderRadius: '50%',
          background: `rgba(${rgb}, 0.2)`,
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }} />
        {/* Secondary glow — bottom left */}
        <div style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 320, height: 320,
          borderRadius: '50%',
          background: `rgba(${rgb}, 0.1)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />

        {/* Diagonal decorative line */}
        <svg style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: isMobile ? 80 : 160, opacity: 0.06, pointerEvents: 'none' }} preserveAspectRatio="none" viewBox="0 0 160 800" xmlns="http://www.w3.org/2000/svg">
          <line x1="160" y1="0" x2="0" y2="800" stroke="white" strokeWidth="1" />
          <line x1="140" y1="0" x2="-20" y2="800" stroke="white" strokeWidth="0.5" />
        </svg>

        {/* Bottom rule */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, rgba(${rgb},0.7), transparent)`,
        }} />

        <div style={{ ...container, position: 'relative', zIndex: 2, width: '100%', paddingTop: isMobile ? 80 : 0, paddingBottom: isMobile ? 80 : 0 }}>
          <div style={{ maxWidth: 740 }}>

            {/* Badge */}
            <div className="hero-badge" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginBottom: 28,
              padding: '6px 14px',
              borderRadius: 999,
              border: `1px solid rgba(${rgb}, 0.45)`,
              background: `rgba(${rgb}, 0.12)`,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: primaryColor, animation: 'pulse-dot 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: primaryColor }}>
                Admissions Open
              </span>
            </div>

            {/* Headline */}
            <h1 className="hero-title" style={{
              margin: '0 0 24px',
              fontSize: isMobile ? 38 : isTablet ? 56 : 72,
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'italic',
              fontWeight: 400,
              color: '#ffffff',
              lineHeight: 1.07,
              letterSpacing: '-0.01em',
              maxWidth: 680,
            }}>
              {homePage.banner.title}
            </h1>

            {/* Subtitle */}
            <p className="hero-sub" style={{
              margin: '0 0 48px',
              fontSize: isMobile ? 16 : 19,
              color: 'rgba(255,255,255,0.52)',
              lineHeight: 1.75,
              maxWidth: 500,
              fontWeight: 400,
            }}>
              {homePage.banner.subtitle}
            </p>

            {/* CTAs */}
            <div className="hero-ctas" style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 14,
              alignItems: isMobile ? 'flex-start' : 'center',
            }}>
              <Link
                to={`/site/${dn}/courses`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: isMobile ? '14px 28px' : '15px 32px',
                  borderRadius: 999,
                  background: primaryColor,
                  color: '#fff',
                  fontWeight: 700, fontSize: 15,
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                  transition: 'opacity 0.2s, transform 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {homePage.banner.ctaText} <ArrowRight size={17} />
              </Link>

              <Link
                to={`/site/${dn}/about`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: isMobile ? '14px 28px' : '15px 32px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.75)',
                  fontWeight: 500, fontSize: 15,
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
              >
                Our Story <ChevronRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 2. TECHNOLOGIES ══════════════════════════════════════════════ */}
      {homePage.technologies?.items?.length > 0 && (
        <section style={{ ...sectionPad, background: '#ffffff', borderBottom: '1px solid #ebebea' }}>
          <div style={container}>

            {/* Header */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: 16, marginBottom: isMobile ? 48 : 72 }}>
              <div>
                <Label color={primaryColor}>Skills & Tools</Label>
                <h2 style={{ margin: 0, fontSize: isMobile ? 28 : 42, fontFamily: "'DM Serif Display', serif", fontWeight: 400, color: '#111', lineHeight: 1.15 }}>
                  {homePage.technologies.heading}
                </h2>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#aaa', maxWidth: 260, textAlign: isMobile ? 'left' : 'right', lineHeight: 1.6 }}>
                Industry-relevant technologies taught by experts.
              </p>
            </div>

            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
              gap: isMobile ? 12 : 16,
            }}>
              {homePage.technologies.items.map((tech, i) => (
                <div
                  key={i}
                  style={{
                    padding: isMobile ? '20px 16px' : '28px 24px',
                    borderRadius: 16,
                    border: '1px solid #ebebea',
                    background: '#fafaf9',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 10,
                    transition: 'border-color 0.2s, transform 0.2s',
                    cursor: 'default',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = `rgba(${rgb},0.4)`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#ebebea'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: isMobile ? 32 : 40, lineHeight: 1 }}>{tech.icon}</div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111' }}>{tech.name}</p>
                  {tech.description && (
                    <p style={{ margin: 0, fontSize: 12, color: '#999', lineHeight: 1.55 }}>{tech.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ 3. WHY CHOOSE US ═════════════════════════════════════════════ */}
      {homePage.whyChooseUs?.items?.length > 0 && (
        <section style={{ ...sectionPad, background: '#fafaf9' }}>
          <div style={container}>

            {/* Header */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: 16, marginBottom: isMobile ? 48 : 72 }}>
              <div>
                <Label color={primaryColor}>Our Advantage</Label>
                <h2 style={{ margin: 0, fontSize: isMobile ? 28 : 42, fontFamily: "'DM Serif Display', serif", fontWeight: 400, color: '#111', lineHeight: 1.15 }}>
                  {homePage.whyChooseUs.heading}
                </h2>
              </div>
              <Link
                to={`/site/${dn}/about`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: primaryColor, textDecoration: 'none', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                Full Story <ArrowRight size={14} />
              </Link>
            </div>

            {/* Cards — alternating size layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? 16 : 20,
            }}>
              {homePage.whyChooseUs.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: isMobile ? '24px 20px' : '36px 32px',
                    borderRadius: 20,
                    border: '1px solid #ebebea',
                    background: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s, transform 0.2s',
                    cursor: 'default',
                    /* First card spans 2 cols on desktop for visual interest */
                    gridColumn: (!isMobile && isDesktop && i === 0 && homePage.whyChooseUs.items.length >= 3) ? 'span 2' : 'span 1',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = `rgba(${rgb},0.35)`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#ebebea'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {/* Accent dot top-right */}
                  <div style={{ position: 'absolute', top: 20, right: 20, width: 8, height: 8, borderRadius: '50%', background: `rgba(${rgb},0.25)` }} />

                  <div style={{ fontSize: isMobile ? 32 : 40, marginBottom: 20, lineHeight: 1 }}>{item.icon}</div>
                  <h3 style={{ margin: '0 0 12px', fontSize: isMobile ? 17 : 20, fontWeight: 700, color: '#111', lineHeight: 1.3 }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: 14, color: '#777', lineHeight: 1.7 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ 4. FEATURED COURSES ══════════════════════════════════════════ */}
      <section style={{ ...sectionPad, background: '#ffffff', borderTop: '1px solid #ebebea', borderBottom: '1px solid #ebebea' }}>
        <div style={container}>

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: 16, marginBottom: isMobile ? 48 : 72 }}>
            <div>
              <Label color={primaryColor}>Learn Something New</Label>
              <h2 style={{ margin: 0, fontSize: isMobile ? 28 : 42, fontFamily: "'DM Serif Display', serif", fontWeight: 400, color: '#111', lineHeight: 1.15 }}>
                Featured Courses
              </h2>
            </div>
            {!isMobile && (
              <Link
                to={`/site/${dn}/courses`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: primaryColor, textDecoration: 'none', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                View All <ChevronRight size={15} />
              </Link>
            )}
          </div>

          {/* Empty state */}
          {courses.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 24px',
              border: '1px dashed #ddd', borderRadius: 20,
              background: '#fafaf9',
            }}>
              <BookOpen size={40} color="#ccc" style={{ margin: '0 auto 14px', display: 'block' }} />
              <p style={{ margin: 0, fontWeight: 600, color: '#bbb', fontSize: 14 }}>No courses published yet.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? 20 : 24,
            }}>
              {courses.map((course) => {
                const fee = getFee(course);
                return (
                  <Link
                    key={course._id}
                    to={`/site/${dn}/courses/${course._id}`}
                    style={{ textDecoration: 'none', display: 'flex' }}
                  >
                    <div
                      style={{
                        width: '100%',
                        background: '#fafaf9',
                        borderRadius: 20,
                        border: '1px solid #ebebea',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'border-color 0.2s, transform 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = `rgba(${rgb},0.4)`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = '#ebebea'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Thumbnail */}
                      <div style={{ height: 196, background: `rgba(${rgb},0.08)`, position: 'relative', overflow: 'hidden' }}>
                        {course.image
                          ? <img src={course.image} alt={course.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <BookOpen size={48} color={`rgba(${rgb},0.25)`} />
                            </div>
                        }
                        {/* Level badge */}
                        {course.level && (
                          <span style={{
                            position: 'absolute', top: 12, left: 12,
                            background: 'rgba(0,0,0,0.55)', color: '#fff',
                            fontSize: 10, fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                            padding: '4px 10px', borderRadius: 999,
                          }}>
                            {course.level}
                          </span>
                        )}
                        {/* Category pill */}
                        <span style={{
                          position: 'absolute', bottom: 12, left: 12,
                          background: `rgba(${rgb},0.9)`, color: '#fff',
                          fontSize: 10, fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                          padding: '4px 10px', borderRadius: 999,
                        }}>
                          {course.category || 'General'}
                        </span>
                      </div>

                      {/* Body */}
                      <div style={{ padding: isMobile ? '18px 18px 22px' : '22px 24px 28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h3 style={{
                          margin: '0 0 8px', fontSize: 16, fontWeight: 700,
                          color: '#111', lineHeight: 1.35,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {course.name}
                        </h3>

                        {/* Duration */}
                        {course.duration && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <Clock size={12} color="#bbb" />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#bbb', letterSpacing: '0.03em' }}>{course.duration}</span>
                          </div>
                        )}

                        <p style={{
                          margin: '0 0 auto', fontSize: 13, color: '#888', lineHeight: 1.6, flex: 1,
                          paddingBottom: 16,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {course.shortDescription || 'Click to view full course details.'}
                        </p>

                        {/* Price + CTA */}
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: 16,
                          borderTop: '1px solid #ebebea',
                          marginTop: 16,
                        }}>
                          <div>
                            <span style={{ fontSize: 20, fontWeight: 900, color: '#111', letterSpacing: '-0.02em' }}>
                              {fee > 0 ? `₹${fee.toLocaleString()}` : 'Free'}
                            </span>
                            {course.monthlyFee > 0 && course.durationMonths > 0 && (
                              <span style={{ fontSize: 11, color: '#bbb', display: 'block', fontWeight: 500 }}>
                                ₹{course.monthlyFee.toLocaleString()}/mo × {course.durationMonths}mo
                              </span>
                            )}
                          </div>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '9px 16px', borderRadius: 999,
                            background: primaryColor, color: '#fff',
                            fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
                          }}>
                            Details <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Mobile "View All" */}
          {isMobile && courses.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <Link
                to={`/site/${dn}/courses`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14, color: primaryColor, textDecoration: 'none' }}
              >
                View All Courses <ChevronRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ══ 5. FEATURES ══════════════════════════════════════════════════ */}
      {homePage.features?.items?.length > 0 && (
        <section style={{ ...sectionPad, background: '#fafaf9' }}>
          <div style={container}>

            {/* Header — centered */}
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 56 : 88 }}>
              <Label color={primaryColor}>Our Strengths</Label>
              <h2 style={{
                margin: '0 auto',
                fontSize: isMobile ? 28 : 44,
                fontFamily: "'DM Serif Display', serif",
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#111',
                lineHeight: 1.15,
                maxWidth: 560,
              }}>
                {homePage.features.heading}
              </h2>
            </div>

            {/* Alternating rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 60 : 100 }}>
              {homePage.features.items.map((feature, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                      gap: isMobile ? 32 : 80,
                      alignItems: 'center',
                      direction: (!isMobile && !isEven) ? 'rtl' : 'ltr',
                    }}
                  >
                    {/* Text */}
                    <div style={{ direction: 'ltr' }}>
                      {/* Row number */}
                      <p style={{
                        margin: '0 0 20px',
                        fontSize: 11, fontWeight: 700,
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        color: `rgba(${rgb},0.5)`,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      {/* Accent line */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
                        <div style={{ height: 2, width: 40, background: primaryColor, borderRadius: 2 }} />
                        <div style={{ height: 1, width: 64, background: `rgba(${rgb},0.3)`, borderRadius: 2 }} />
                      </div>
                      <h3 style={{
                        margin: '0 0 16px',
                        fontSize: isMobile ? 22 : 30,
                        fontFamily: "'DM Serif Display', serif",
                        fontWeight: 400, color: '#111', lineHeight: 1.2,
                      }}>
                        {feature.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: isMobile ? 15 : 17, color: '#777', lineHeight: 1.75 }}>
                        {feature.description}
                      </p>
                    </div>

                    {/* Image */}
                    <div style={{ direction: 'ltr', position: 'relative' }}>
                      {/* Decorative frame */}
                      <div style={{
                        position: 'absolute',
                        top: 14, left: 14, right: -14, bottom: -14,
                        borderRadius: 18,
                        border: `1.5px solid rgba(${rgb},0.2)`,
                        pointerEvents: 'none',
                      }} />
                      {feature.imageUrl
                        ? <img
                            src={feature.imageUrl}
                            alt={feature.title}
                            style={{
                              position: 'relative', zIndex: 1,
                              width: '100%',
                              height: isMobile ? 220 : 320,
                              objectFit: 'cover',
                              borderRadius: 18,
                              display: 'block',
                            }}
                          />
                        : <div style={{
                            position: 'relative', zIndex: 1,
                            width: '100%', height: isMobile ? 220 : 320,
                            borderRadius: 18,
                            background: `linear-gradient(135deg, rgba(${rgb},0.08), rgba(${rgb},0.03))`,
                            border: '1px solid #ebebea',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 64,
                          }}>
                            📚
                          </div>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══ 6. BOTTOM CTA STRIP ══════════════════════════════════════════ */}
      <section style={{
        padding: isMobile ? '72px 0' : '100px 0',
        background: '#0d0d0d',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 240,
          borderRadius: '50%',
          background: `rgba(${rgb}, 0.15)`,
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }} />

        <div style={{ ...container, position: 'relative', zIndex: 2 }}>
          <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: `rgba(${rgb},0.7)` }}>
            Start Learning Today
          </p>
          <h2 style={{
            margin: '0 auto 40px',
            fontSize: isMobile ? 28 : 48,
            fontFamily: "'DM Serif Display', serif",
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.1,
            maxWidth: 580,
          }}>
            Your future begins with the right course.
          </h2>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 14, justifyContent: 'center', alignItems: 'center' }}>
            <Link
              to={`/site/${dn}/courses`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '15px 36px', borderRadius: 999,
                background: primaryColor, color: '#fff',
                fontWeight: 700, fontSize: 15,
                textDecoration: 'none', letterSpacing: '0.01em',
                transition: 'opacity 0.2s, transform 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Browse Courses <ArrowRight size={17} />
            </Link>
            <Link
              to={`/site/${dn}/about`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '15px 28px', borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 500, fontSize: 15,
                textDecoration: 'none',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
              onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            >
              Learn About Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}