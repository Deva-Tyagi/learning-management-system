import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import axios from '../../lib/axios';
import { Search, BookOpen, Clock, ArrowRight } from 'lucide-react';

function useWindowWidth() {
  const [width, setWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  React.useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return width;
}

function hexToRgb(hex = '#000000') {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

const getFee = (c) => {
  if (c.totalFee > 0) return c.totalFee;
  if (c.fees > 0) return c.fees;
  if (c.monthlyFee > 0 && c.durationMonths > 0) return c.monthlyFee * c.durationMonths;
  return 0;
};

export default function WhiteLabelCourses() {
  const { siteData, primaryColor } = useOutletContext();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

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
        if (res.data.success) setCourses(res.data.courses);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (siteData) fetchCourses();
  }, [siteData]);

  if (!siteData) return null;
  const { coursesPage } = siteData;
  const dn = siteData.domainName;

  const filtered = courses.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const container = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: isMobile ? '0 20px' : isDesktop ? '0 64px' : '0 40px',
  };

  return (
    <div style={{ width: '100%', background: '#fafaf9', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ══ BANNER ═══════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        padding: isMobile ? '80px 0 64px' : '120px 0 80px',
        overflow: 'hidden',
        background: '#0d0d0d',
      }}>
        {/* Grain */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.045, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
          <filter id="grain2"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#grain2)" />
        </svg>

        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: -80, left: '30%', width: 480, height: 300, borderRadius: '50%', background: `rgba(${rgb},0.18)`, filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: isMobile ? -80 : 0, width: 280, height: 280, borderRadius: '50%', background: `rgba(${rgb},0.1)`, filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Bottom rule */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, rgba(${rgb},0.6), transparent)` }} />

        <div style={{ ...container, position: 'relative', zIndex: 2, textAlign: 'center' }}>
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginBottom: 24,
            padding: '6px 14px', borderRadius: 999,
            border: `1px solid rgba(${rgb},0.4)`,
            background: `rgba(${rgb},0.12)`,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: primaryColor }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: primaryColor }}>
              Learn & Grow
            </span>
          </div>

          <h1 style={{
            margin: '0 auto 16px',
            fontSize: isMobile ? 36 : 60,
            fontFamily: "'DM Serif Display', serif",
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.07,
            letterSpacing: '-0.01em',
            maxWidth: 640,
            animation: 'fadeUp 0.6s 0.05s both ease',
          }}>
            {coursesPage.banner.title}
          </h1>

          <p style={{
            margin: '0 auto 44px',
            fontSize: isMobile ? 15 : 18,
            color: 'rgba(255,255,255,0.5)',
            maxWidth: 480,
            lineHeight: 1.75,
            animation: 'fadeUp 0.6s 0.15s both ease',
          }}>
            {coursesPage.banner.subtitle}
          </p>

          {/* Search bar */}
          <div style={{
            maxWidth: 520, margin: '0 auto',
            position: 'relative',
            animation: 'fadeUp 0.6s 0.25s both ease',
          }}>
            <Search
              size={16}
              color={searchFocused ? primaryColor : 'rgba(255,255,255,0.35)'}
              style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s', pointerEvents: 'none' }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search courses by name or category…"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                paddingLeft: 46, paddingRight: 20,
                paddingTop: 15, paddingBottom: 15,
                borderRadius: 999,
                border: `1px solid ${searchFocused ? `rgba(${rgb},0.6)` : 'rgba(255,255,255,0.12)'}`,
                background: searchFocused ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                fontSize: 14,
                fontWeight: 500,
                color: searchFocused ? '#111' : 'rgba(255,255,255,0.7)',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'all 0.25s',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#aaa', fontSize: 18, lineHeight: 1, padding: 0,
                }}
              >×</button>
            )}
          </div>
        </div>
      </section>

      {/* ══ COURSES GRID ═════════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '56px 0' : '88px 0' }}>
        <div style={container}>

          {loading ? (
            /* Spinner */
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <div style={{
                width: 36, height: 36,
                border: `2.5px solid rgba(${rgb},0.2)`,
                borderTopColor: primaryColor,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>

          ) : filtered.length === 0 ? (
            /* Empty state */
            <div style={{
              textAlign: 'center', padding: '80px 24px',
              border: '1px dashed #ddd', borderRadius: 20,
              background: '#fff',
            }}>
              <BookOpen size={40} color="#ddd" style={{ margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#333' }}>No Courses Found</h3>
              <p style={{ margin: 0, color: '#aaa', fontSize: 14 }}>
                {searchTerm ? `No results for "${searchTerm}" — try a different term.` : 'No courses published yet.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    marginTop: 20, padding: '10px 24px', borderRadius: 999,
                    background: primaryColor, color: '#fff',
                    border: 'none', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>

          ) : (
            <>
              {/* Count */}
              <p style={{
                margin: '0 0 36px',
                fontSize: 12, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                color: '#bbb',
              }}>
                {filtered.length} course{filtered.length !== 1 ? 's' : ''} available
              </p>

              {/* Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)',
                gap: isMobile ? 18 : 24,
              }}>
                {filtered.map((course) => {
                  const fee = getFee(course);
                  return (
                    <Link key={course._id} to={`/site/${dn}/courses/${course._id}`} style={{ textDecoration: 'none', display: 'flex' }}>
                      <div
                        style={{
                          width: '100%',
                          background: '#fff',
                          borderRadius: 20,
                          border: '1px solid #ebebea',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'border-color 0.2s, transform 0.2s',
                          cursor: 'pointer',
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = `rgba(${rgb},0.45)`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#ebebea'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        {/* Thumbnail */}
                        <div style={{ height: 196, background: `rgba(${rgb},0.07)`, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                          {course.image
                            ? <img src={course.image} alt={course.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BookOpen size={48} color={`rgba(${rgb},0.2)`} />
                              </div>
                          }
                          {/* Level badge */}
                          {course.level && (
                            <span style={{
                              position: 'absolute', top: 12, left: 12,
                              background: 'rgba(0,0,0,0.55)',
                              color: '#fff',
                              fontSize: 10, fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '0.08em',
                              padding: '4px 10px', borderRadius: 999,
                            }}>
                              {course.level}
                            </span>
                          )}
                          {/* Category pill — bottom */}
                          <span style={{
                            position: 'absolute', bottom: 12, left: 12,
                            background: `rgba(${rgb},0.88)`,
                            color: '#fff',
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
                            margin: '0 0 10px',
                            fontSize: 16, fontWeight: 700,
                            color: '#111', lineHeight: 1.35,
                            display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {course.name}
                          </h3>

                          {/* Duration */}
                          {course.duration && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                              <Clock size={12} color="#bbb" />
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#bbb', letterSpacing: '0.03em' }}>{course.duration}</span>
                            </div>
                          )}

                          <p style={{
                            margin: '0 0 auto',
                            fontSize: 13, color: '#999', lineHeight: 1.65,
                            paddingBottom: 16, flex: 1,
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
                                <span style={{ fontSize: 11, color: '#bbb', display: 'block', fontWeight: 500, marginTop: 1 }}>
                                  ₹{course.monthlyFee.toLocaleString()}/mo × {course.durationMonths}mo
                                </span>
                              )}
                            </div>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '9px 16px', borderRadius: 999,
                              background: primaryColor,
                              color: '#fff',
                              fontSize: 12, fontWeight: 700,
                              letterSpacing: '0.02em',
                            }}>
                              Details <ArrowRight size={12} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══ BOTTOM CTA ═══════════════════════════════════════════════════ */}
      <section style={{
        padding: isMobile ? '64px 0' : '88px 0',
        background: '#0d0d0d',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500, height: 180,
          borderRadius: '50%',
          background: `rgba(${rgb},0.15)`,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />
        <div style={{ ...container, position: 'relative', zIndex: 2 }}>
          <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: `rgba(${rgb},0.7)` }}>
            Not sure where to start?
          </p>
          <h2 style={{
            margin: '0 auto 32px',
            fontSize: isMobile ? 26 : 40,
            fontFamily: "'DM Serif Display', serif",
            fontStyle: 'italic',
            fontWeight: 400, color: '#fff',
            lineHeight: 1.15, maxWidth: 500,
          }}>
            Every expert was once a beginner.
          </h2>
          <Link
            to={`/site/${dn}/about`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 28px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 500, fontSize: 14,
              textDecoration: 'none',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          >
            Meet Our Faculty <ArrowRight size={15} />
          </Link>
        </div>
      </section>

    </div>
  );
}