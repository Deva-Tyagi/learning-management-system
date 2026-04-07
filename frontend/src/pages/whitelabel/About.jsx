import React from 'react';
import { useOutletContext } from 'react-router-dom';

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
function Label({ children, color }) {
  return (
    <p style={{
      margin: '0 0 12px',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.18em',
      color,
    }}>
      {children}
    </p>
  );
}

export default function WhiteLabelAbout() {
  const { siteData, primaryColor } = useOutletContext();
  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;
  const rgb = hexToRgb(primaryColor);

  if (!siteData) return null;
  const { aboutPage } = siteData;

  /* ── Shared tokens ── */
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

      {/* ══ 1. HERO ══════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        minHeight: isMobile ? 480 : 600,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#0d0d0d',
      }}>
        {/* Background image layer */}
        {aboutPage.banner.backgroundImage && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${aboutPage.banner.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.18,
          }} />
        )}

        {/* Noise grain texture */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }} xmlns="http://www.w3.org/2000/svg">
          <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>

        {/* Accent blob */}
        <div style={{
          position: 'absolute', right: isMobile ? -120 : -60, top: -80,
          width: isMobile ? 300 : 500, height: isMobile ? 300 : 500,
          borderRadius: '50%',
          background: `rgba(${rgb}, 0.18)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />

        {/* Thin horizontal rule */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, rgba(${rgb}, 0.6), transparent)`,
        }} />

        <div style={{ ...container, position: 'relative', zIndex: 2, width: '100%' }}>
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginBottom: 28,
            padding: '6px 14px',
            borderRadius: 999,
            border: `1px solid rgba(${rgb}, 0.4)`,
            background: `rgba(${rgb}, 0.12)`,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: primaryColor }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: primaryColor }}>
              Who We Are
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            margin: '0 0 24px',
            fontSize: isMobile ? 38 : 64,
            fontWeight: 300,
            fontFamily: "'DM Serif Display', serif",
            fontStyle: 'italic',
            color: '#ffffff',
            lineHeight: 1.08,
            maxWidth: 700,
            letterSpacing: '-0.01em',
          }}>
            {aboutPage.banner.title}
          </h1>

          <p style={{
            margin: 0,
            fontSize: isMobile ? 16 : 18,
            color: 'rgba(255,255,255,0.52)',
            maxWidth: 480,
            lineHeight: 1.7,
            fontWeight: 400,
          }}>
            {aboutPage.banner.subtitle}
          </p>
        </div>
      </section>

      {/* ══ 2. IMPACT STATS ══════════════════════════════════════════════ */}
      {aboutPage.impact?.stats?.length > 0 && (
        <section style={{ ...sectionPad, background: '#ffffff', borderBottom: '1px solid #ebebea' }}>
          <div style={container}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 48 : 80 }}>

              {/* Left: heading block */}
              <div style={{ flexShrink: 0, maxWidth: isMobile ? '100%' : 260 }}>
                <Label color={primaryColor}>By The Numbers</Label>
                <h2 style={{
                  margin: 0,
                  fontSize: isMobile ? 28 : 36,
                  fontFamily: "'DM Serif Display', serif",
                  fontWeight: 400,
                  color: '#111',
                  lineHeight: 1.2,
                }}>
                  {aboutPage.impact.heading}
                </h2>
              </div>

              {/* Right: stats grid */}
              <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : `repeat(${Math.min(aboutPage.impact.stats.length, 4)}, 1fr)`,
                gap: isMobile ? 24 : 0,
              }}>
                {aboutPage.impact.stats.map((stat, i) => (
                  <div key={i} style={{
                    padding: isMobile ? '0' : '0 32px',
                    borderLeft: (!isMobile && i > 0) ? '1px solid #ebebea' : 'none',
                  }}>
                    <p style={{
                      margin: '0 0 4px',
                      fontSize: isMobile ? 40 : 52,
                      fontWeight: 900,
                      color: primaryColor,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      fontVariantNumeric: 'tabular-nums',
                    }}>{stat.number}</p>
                    <p style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#999',
                    }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ 3. WHAT SETS US APART ════════════════════════════════════════ */}
      {aboutPage.whatSetsUsApart?.points?.length > 0 && (
        <section style={{ ...sectionPad, background: '#fafaf9' }}>
          <div style={container}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
              gap: isMobile ? 48 : 80,
              alignItems: 'start',
            }}>

              {/* Left: sticky heading */}
              <div style={{ position: isDesktop ? 'sticky' : 'static', top: 80 }}>
                <Label color={primaryColor}>Our Difference</Label>
                <h2 style={{
                  margin: '0 0 24px',
                  fontSize: isMobile ? 30 : 42,
                  fontFamily: "'DM Serif Display', serif",
                  fontWeight: 400,
                  color: '#111',
                  lineHeight: 1.15,
                }}>
                  {aboutPage.whatSetsUsApart.heading}
                </h2>
                <p style={{ margin: 0, color: '#777', lineHeight: 1.7 }}>
                  Every point below is a commitment — not a marketing line.
                </p>

                {/* Decorative rule */}
                <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ height: 2, width: 48, background: primaryColor, borderRadius: 2 }} />
                  <div style={{ height: 1, marginTop: 6, width: 80, background: `rgba(${rgb}, 0.3)`, borderRadius: 2 }} />
                  <div style={{ height: 1, marginTop: 4, width: 120, background: `rgba(${rgb}, 0.12)`, borderRadius: 2 }} />
                </div>
              </div>

              {/* Right: numbered list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {aboutPage.whatSetsUsApart.points.map((point, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: 24,
                    padding: '28px 0',
                    borderBottom: i < aboutPage.whatSetsUsApart.points.length - 1 ? '1px solid #ebebea' : 'none',
                  }}>
                    <span style={{
                      flexShrink: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      color: `rgba(${rgb}, 0.5)`,
                      paddingTop: 2,
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '0.05em',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 500,
                      color: '#222',
                      lineHeight: 1.65,
                    }}>
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ 4. MISSION ═══════════════════════════════════════════════════ */}
      {aboutPage.mission && (
        <section style={{
          ...sectionPad,
          background: `rgba(${rgb}, 0.05)`,
          borderTop: '1px solid #ebebea',
          borderBottom: '1px solid #ebebea',
        }}>
          <div style={container}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
              gap: isMobile ? 48 : 80,
              alignItems: 'center',
            }}>

              {/* Left text */}
              <div>
                <Label color={primaryColor}>Mission Statement</Label>
                <h2 style={{
                  margin: '0 0 32px',
                  fontSize: isMobile ? 30 : 44,
                  fontFamily: "'DM Serif Display', serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#111',
                  lineHeight: 1.15,
                }}>
                  "{aboutPage.mission.heading}"
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: isMobile ? 16 : 18,
                  color: '#555',
                  lineHeight: 1.8,
                  fontWeight: 400,
                }}>
                  {aboutPage.mission.text}
                </p>
              </div>

              {/* Right image */}
              <div style={{ position: 'relative' }}>
                {/* Decorative frame offset */}
                <div style={{
                  position: 'absolute',
                  top: 16, left: 16, right: -16, bottom: -16,
                  borderRadius: 20,
                  border: `2px solid rgba(${rgb}, 0.25)`,
                  pointerEvents: 'none',
                }} />
                {aboutPage.mission.imageUrl
                  ? (
                    <img
                      src={aboutPage.mission.imageUrl}
                      alt="Our Mission"
                      style={{
                        position: 'relative', zIndex: 1,
                        width: '100%',
                        height: isMobile ? 260 : 380,
                        objectFit: 'cover',
                        borderRadius: 20,
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div style={{
                      position: 'relative', zIndex: 1,
                      width: '100%',
                      height: isMobile ? 260 : 380,
                      borderRadius: 20,
                      background: `linear-gradient(135deg, rgba(${rgb},0.12), rgba(${rgb},0.04))`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 80,
                    }}>
                      🎯
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ 5. FACULTY ═══════════════════════════════════════════════════ */}
      {aboutPage.faculty?.length > 0 && (
        <section style={{ ...sectionPad, background: '#ffffff' }}>
          <div style={container}>

            {/* Section header */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'flex-end',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: isMobile ? 48 : 72,
            }}>
              <div>
                <Label color={primaryColor}>The Team</Label>
                <h2 style={{
                  margin: 0,
                  fontSize: isMobile ? 30 : 44,
                  fontFamily: "'DM Serif Display', serif",
                  fontWeight: 400,
                  color: '#111',
                  lineHeight: 1.15,
                }}>
                  Meet Our Faculty
                </h2>
              </div>
              <p style={{ margin: 0, color: '#999', fontSize: 14, maxWidth: 280, textAlign: isMobile ? 'left' : 'right', lineHeight: 1.6 }}>
                Experienced educators dedicated to student success.
              </p>
            </div>

            {/* Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr'
                : width >= 1200
                  ? 'repeat(4, 1fr)'
                  : width >= 900
                    ? 'repeat(3, 1fr)'
                    : 'repeat(2, 1fr)',
              gap: isMobile ? 24 : 28,
            }}>
              {aboutPage.faculty.map((member, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fafaf9',
                    borderRadius: 16,
                    border: '1px solid #ebebea',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s, transform 0.2s',
                    cursor: 'default',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = `rgba(${rgb}, 0.4)`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = '#ebebea';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Photo */}
                  <div style={{ position: 'relative', height: 200, background: `rgba(${rgb}, 0.08)`, overflow: 'hidden' }}>
                    {member.photoUrl
                      ? <img
                          src={member.photoUrl}
                          alt={member.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      : <div style={{
                          width: '100%', height: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 64,
                          fontFamily: "'DM Serif Display', serif",
                          fontWeight: 400,
                          color: `rgba(${rgb}, 0.35)`,
                        }}>
                          {member.name?.charAt(0) ?? '?'}
                        </div>
                    }
                    {/* Bottom fade */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: 48,
                      background: 'linear-gradient(to bottom, transparent, #fafaf9)',
                    }} />
                  </div>

                  {/* Info */}
                  <div style={{ padding: '20px 22px 24px' }}>
                    <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 700, color: '#111' }}>{member.name}</p>
                    <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: primaryColor }}>{member.role}</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#777', lineHeight: 1.6 }}>{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ 6. FOOTER CTA STRIP ══════════════════════════════════════════ */}
      <section style={{
        padding: isMobile ? '60px 0' : '80px 0',
        background: '#0d0d0d',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500, height: 200,
          borderRadius: '50%',
          background: `rgba(${rgb}, 0.15)`,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />
        <div style={{ ...container, position: 'relative', zIndex: 2 }}>
          <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: `rgba(${rgb}, 0.7)` }}>
            Join Our Community
          </p>
          <h2 style={{
            margin: '0 auto 32px',
            fontSize: isMobile ? 28 : 42,
            fontFamily: "'DM Serif Display', serif",
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.15,
            maxWidth: 560,
          }}>
            Ready to start your journey with us?
          </h2>
          <a
            href="#enroll"
            style={{
              display: 'inline-block',
              padding: '14px 36px',
              borderRadius: 999,
              background: primaryColor,
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '0.02em',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            Get Started Today
          </a>
        </div>
      </section>

    </div>
  );
}