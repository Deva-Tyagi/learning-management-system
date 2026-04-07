import React, { useEffect, useState } from 'react';
import { useOutletContext, useParams, Link } from 'react-router-dom';
import axios from '../../lib/axios';
import {
  Clock, BarChart2, CheckCircle, BookOpen, Award,
  Briefcase, ChevronDown, ChevronUp, ArrowLeft, Tag, Wrench
} from 'lucide-react';

function useWindowWidth() {
  const [w, setW] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  React.useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

function hexToRgb(hex = '#000000') {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

const getFee = (c) => {
  if (!c) return 0;
  if (c.totalFee > 0) return c.totalFee;
  if (c.fees > 0) return c.fees;
  if (c.monthlyFee > 0 && c.durationMonths > 0) return c.monthlyFee * c.durationMonths;
  return 0;
};

/* ─── Section card wrapper ─── */
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      border: '1px solid #ebebea',
      padding: '28px 32px',
      marginBottom: 20,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Section heading ─── */
function SectionHeading({ icon, children, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
      {icon && (
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `rgba(${color}, 0.1)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      )}
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111', fontFamily: "'DM Sans', sans-serif" }}>
        {children}
      </h2>
    </div>
  );
}

export default function CoursePage() {
  const { courseId, domainName } = useParams();
  const { siteData, primaryColor } = useOutletContext();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState({});

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;
  const rgb = hexToRgb(primaryColor);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`/website/course/${courseId}`);
        if (res.data.success) setCourse(res.data.course);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchCourse();
  }, [courseId]);

  const toggleModule = (i) => setOpenModules(prev => ({ ...prev, [i]: !prev[i] }));

  const container = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: isMobile ? '0 20px' : isDesktop ? '0 64px' : '0 40px',
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9' }}>
      <div style={{
        width: 36, height: 36,
        border: `2.5px solid rgba(${rgb},0.2)`,
        borderTopColor: primaryColor,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Not found ── */
  if (!course) return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, background: '#fafaf9', fontFamily: "'DM Sans', sans-serif" }}>
      <BookOpen size={48} color="#ddd" style={{ marginBottom: 16 }} />
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#333', margin: '0 0 8px' }}>Course Not Found</h2>
      <p style={{ margin: '0 0 20px', color: '#aaa', fontSize: 14 }}>This course may have been removed or the link is incorrect.</p>
      <Link to={`/site/${domainName}/courses`} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '10px 22px', borderRadius: 999,
        background: primaryColor, color: '#fff',
        fontWeight: 700, fontSize: 14, textDecoration: 'none',
      }}>
        <ArrowLeft size={14} /> Back to Courses
      </Link>
    </div>
  );

  const fee = getFee(course);

  return (
    <div style={{ width: '100%', background: '#fafaf9', fontFamily: "'DM Sans', sans-serif" }}>

      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ══ HERO BANNER ══════════════════════════════════════════════════ */}
      <section style={{
        background: '#0d0d0d',
        padding: isMobile ? '56px 0 48px' : '80px 0 64px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grain */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
          <filter id="grain3"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /></filter>
          <rect width="100%" height="100%" filter="url(#grain3)" opacity="0.4" />
        </svg>

        {/* Background image */}
        {course.image && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${course.image})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.1,
          }} />
        )}

        {/* Glow */}
        <div style={{
          position: 'absolute', top: -60, right: isMobile ? -60 : 40,
          width: 400, height: 400, borderRadius: '50%',
          background: `rgba(${rgb},0.2)`, filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />

        {/* Bottom rule */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, rgba(${rgb},0.6), transparent)` }} />

        <div style={{ ...container, position: 'relative', zIndex: 2 }}>

          {/* Back link */}
          <Link
            to={`/site/${domainName}/courses`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', marginBottom: 28,
              transition: 'color 0.2s', letterSpacing: '0.01em',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#fff'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
          >
            <ArrowLeft size={14} /> All Courses
          </Link>

          <div style={{
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
            gap: isMobile ? 32 : 56,
            alignItems: isDesktop ? 'flex-start' : 'flex-start',
          }}>

            {/* ── Left: text ── */}
            <div style={{ flex: 1, animation: 'fadeUp 0.5s ease both' }}>

              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {course.category && (
                  <span style={{
                    padding: '5px 14px', borderRadius: 999,
                    background: `rgba(${rgb},0.22)`,
                    border: `1px solid rgba(${rgb},0.4)`,
                    color: primaryColor,
                    fontSize: 11, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>
                    {course.category}
                  </span>
                )}
                {course.level && (
                  <span style={{
                    padding: '5px 14px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 11, fontWeight: 600,
                  }}>
                    {course.level}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 style={{
                margin: '0 0 18px',
                fontSize: isMobile ? 28 : 46,
                fontFamily: "'DM Serif Display', serif",
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#fff',
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                maxWidth: 620,
              }}>
                {course.name}
              </h1>

              {/* Description */}
              <p style={{
                margin: '0 0 32px',
                fontSize: isMobile ? 15 : 17,
                color: 'rgba(255,255,255,0.52)',
                lineHeight: 1.75,
                maxWidth: 560,
              }}>
                {course.shortDescription || course.fullDescription}
              </p>

              {/* Stats row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                {course.duration && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Clock size={14} color={primaryColor} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{course.duration}</span>
                  </div>
                )}
                {course.durationMonths > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Clock size={14} color={primaryColor} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{course.durationMonths} Months</span>
                  </div>
                )}
                {course.level && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <BarChart2 size={14} color={primaryColor} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{course.level}</span>
                  </div>
                )}
                {course.certificateProvided && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Award size={14} color={primaryColor} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>Certificate Included</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Enrollment card ── */}
            <div style={{
              width: isDesktop ? 340 : '100%',
              flexShrink: 0,
              background: '#fff',
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
            }}>
              {/* Thumbnail */}
              {course.image && (
                <div style={{ height: 176, overflow: 'hidden' }}>
                  <img src={course.image} alt={course.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}

              <div style={{ padding: '24px 26px' }}>
                {/* Price */}
                <p style={{ margin: '0 0 2px', fontSize: 32, fontWeight: 900, color: '#111', letterSpacing: '-0.02em' }}>
                  {fee > 0 ? `₹${fee.toLocaleString()}` : 'Free'}
                </p>
                {course.monthlyFee > 0 && course.durationMonths > 0 && (
                  <p style={{ margin: '0 0 20px', fontSize: 12, color: '#bbb', fontWeight: 500 }}>
                    ₹{course.monthlyFee.toLocaleString()}/month × {course.durationMonths} months
                  </p>
                )}
                {!(course.monthlyFee > 0 && course.durationMonths > 0) && (
                  <div style={{ marginBottom: 20 }} />
                )}

                {/* Enroll CTA */}
                <Link
                  to="/student/login"
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '14px 0',
                    background: primaryColor, color: '#fff',
                    fontWeight: 700, fontSize: 15,
                    borderRadius: 999,
                    textDecoration: 'none',
                    letterSpacing: '0.01em',
                    transition: 'opacity 0.2s',
                    marginBottom: 10,
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                  Enroll Now
                </Link>
                <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: '#ccc', fontWeight: 400 }}>
                  Log in or sign up to enroll
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ BODY ═════════════════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '48px 0 72px' : '72px 0 100px' }}>
        <div style={{
          ...container,
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          gap: isMobile ? 24 : 36,
          alignItems: 'flex-start',
        }}>

          {/* ── Main Column ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* About */}
            {course.fullDescription && (
              <Card>
                <SectionHeading icon={<BookOpen size={15} color={primaryColor} />} color={rgb}>
                  About This Course
                </SectionHeading>
                <p style={{ margin: 0, fontSize: 15, color: '#666', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {course.fullDescription}
                </p>
              </Card>
            )}

            {/* Learning Outcomes */}
            {course.learningOutcomes?.length > 0 && (
              <Card>
                <SectionHeading icon={<CheckCircle size={15} color={primaryColor} />} color={rgb}>
                  What You'll Learn
                </SectionHeading>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: 12,
                }}>
                  {course.learningOutcomes.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: `rgba(${rgb},0.1)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 1,
                      }}>
                        <CheckCircle size={11} color={primaryColor} />
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: '#444', lineHeight: 1.55, fontWeight: 500 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Curriculum */}
            {course.curriculum?.length > 0 && (
              <Card>
                <SectionHeading icon={<BookOpen size={15} color={primaryColor} />} color={rgb}>
                  Course Curriculum
                </SectionHeading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {course.curriculum.map((mod, i) => (
                    <div key={i} style={{
                      border: `1px solid ${openModules[i] ? `rgba(${rgb},0.3)` : '#ebebea'}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                      transition: 'border-color 0.2s',
                    }}>
                      {/* Module header */}
                      <button
                        onClick={() => toggleModule(i)}
                        style={{
                          width: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 18px',
                          background: openModules[i] ? `rgba(${rgb},0.05)` : '#fafaf9',
                          border: 'none', cursor: 'pointer', textAlign: 'left',
                          transition: 'background 0.2s',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                          {/* Number */}
                          <span style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: openModules[i] ? primaryColor : `rgba(${rgb},0.12)`,
                            color: openModules[i] ? '#fff' : primaryColor,
                            fontSize: 12, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.2s',
                          }}>
                            {i + 1}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#111', flex: 1, minWidth: 0 }}>{mod.module}</span>
                          {mod.duration && (
                            <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600, whiteSpace: 'nowrap' }}>{mod.duration}</span>
                          )}
                        </div>
                        {openModules[i]
                          ? <ChevronUp size={15} color="#bbb" />
                          : <ChevronDown size={15} color="#bbb" />
                        }
                      </button>

                      {/* Topics */}
                      {openModules[i] && mod.topics?.length > 0 && (
                        <div style={{ padding: '8px 18px 16px 56px', background: `rgba(${rgb},0.02)` }}>
                          {mod.topics.map((t, j) => (
                            <div key={j} style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '8px 0',
                              borderBottom: j < mod.topics.length - 1 ? '1px solid #f1f1f0' : 'none',
                            }}>
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: `rgba(${rgb},0.4)`, flexShrink: 0 }} />
                              <p style={{ margin: 0, fontSize: 13, color: '#666', fontWeight: 500, lineHeight: 1.5 }}>{t}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Why This Course */}
            {course.whyThisCourse?.length > 0 && (
              <Card>
                <SectionHeading color={rgb}>Why This Course?</SectionHeading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {course.whyThisCourse.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      padding: '14px 16px',
                      background: `rgba(${rgb},0.04)`,
                      borderRadius: 12,
                      border: `1px solid rgba(${rgb},0.1)`,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: `rgba(${rgb},0.12)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 14 }}>💡</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: '#444', fontWeight: 500, lineHeight: 1.6 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Career Opportunities */}
            {course.careerOpportunities?.length > 0 && (
              <Card style={{ marginBottom: 0 }}>
                <SectionHeading icon={<Briefcase size={15} color={primaryColor} />} color={rgb}>
                  Career Opportunities
                </SectionHeading>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {course.careerOpportunities.map((item, i) => (
                    <span key={i} style={{
                      padding: '7px 16px',
                      background: '#fafaf9',
                      border: '1px solid #ebebea',
                      borderRadius: 999,
                      fontSize: 13, fontWeight: 600, color: '#444',
                    }}>
                      {item}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div style={{ width: isDesktop ? 300 : '100%', flexShrink: 0 }}>
            <div style={{
              background: '#fff',
              borderRadius: 20,
              border: '1px solid #ebebea',
              overflow: 'hidden',
              position: isDesktop ? 'sticky' : 'static',
              top: 88,
            }}>
              {/* Header */}
              <div style={{
                padding: '18px 22px',
                borderBottom: '1px solid #ebebea',
                background: `rgba(${rgb},0.04)`,
              }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: primaryColor }}>
                  Course Info
                </p>
              </div>

              <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Info rows */}
                {[
                  course.duration && { icon: <Clock size={14} color={primaryColor} />, label: 'Duration', value: course.duration },
                  course.durationMonths > 0 && { icon: <Clock size={14} color={primaryColor} />, label: 'Duration', value: `${course.durationMonths} Months` },
                  course.level && { icon: <BarChart2 size={14} color={primaryColor} />, label: 'Level', value: course.level },
                  course.certificateProvided && { icon: <Award size={14} color={primaryColor} />, label: 'Certificate', value: 'On Completion' },
                  course.category && { icon: <Tag size={14} color={primaryColor} />, label: 'Category', value: course.category },
                ].filter(Boolean).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: `rgba(${rgb},0.08)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#ccc', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#222' }}>{item.value}</p>
                    </div>
                  </div>
                ))}

                {/* Divider */}
                {(course.toolsUsed?.length > 0 || course.prerequisites?.length > 0) && (
                  <div style={{ height: 1, background: '#ebebea', margin: '4px 0' }} />
                )}

                {/* Tools */}
                {course.toolsUsed?.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <Wrench size={13} color="#bbb" />
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tools Used</p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {course.toolsUsed.map((t, i) => (
                        <span key={i} style={{
                          padding: '4px 10px',
                          background: '#fafaf9',
                          border: '1px solid #ebebea',
                          fontSize: 12, fontWeight: 600,
                          borderRadius: 8, color: '#555',
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prerequisites */}
                {course.prerequisites?.length > 0 && (
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prerequisites</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {course.prerequisites.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: `rgba(${rgb},0.4)`, flexShrink: 0, marginTop: 6 }} />
                          <p style={{ margin: 0, fontSize: 13, color: '#666', fontWeight: 500, lineHeight: 1.5 }}>{p}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enroll CTA */}
                <div style={{ paddingTop: 4 }}>
                  <Link
                    to="/student/login"
                    style={{
                      display: 'block', textAlign: 'center',
                      padding: '13px 0',
                      background: primaryColor, color: '#fff',
                      fontWeight: 700, fontSize: 14,
                      borderRadius: 999,
                      textDecoration: 'none',
                      letterSpacing: '0.01em',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >
                    Enroll — {fee > 0 ? `₹${fee.toLocaleString()}` : 'Free'}
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}