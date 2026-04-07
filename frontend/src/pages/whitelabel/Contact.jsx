import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from '../../lib/axios';
import { toast } from 'sonner';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

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

function hexToRgb(hex = '#000000') {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export default function WhiteLabelContact() {
  const { siteData, primaryColor } = useOutletContext();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState('');

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;
  const rgb = hexToRgb(primaryColor);

  if (!siteData) return null;
  const { contactPage } = siteData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Please fill all required fields.');
    setSending(true);
    try {
      const adminId = siteData.adminId?._id || siteData.adminId;
      await axios.post(`/website/query/${adminId}`, form);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch { toast.error('Failed to send message. Please try again.'); }
    finally { setSending(false); }
  };

  const container = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: isMobile ? '0 20px' : isDesktop ? '0 64px' : '0 40px',
  };

  /* ── Input base style ── */
  const inputBase = (key) => ({
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 16px',
    border: `1px solid ${focused === key ? `rgba(${rgb},0.5)` : '#ebebea'}`,
    borderRadius: 12,
    background: focused === key ? '#fff' : '#fafaf9',
    fontSize: 14,
    fontWeight: 400,
    color: '#111',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    boxShadow: focused === key ? `0 0 0 3px rgba(${rgb},0.1)` : 'none',
  });

  const label = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: '#bbb',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: 7,
  };

  return (
    <div style={{ width: '100%', background: '#fafaf9', fontFamily: "'DM Sans', sans-serif" }}>

      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ══ BANNER ═══════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        padding: isMobile ? '80px 0 64px' : '120px 0 80px',
        overflow: 'hidden',
        background: '#0d0d0d',
      }}>
        {/* Grain */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.045, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
          <filter id="grain4"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /></filter>
          <rect width="100%" height="100%" filter="url(#grain4)" opacity="0.5" />
        </svg>

        {/* Glow */}
        <div style={{ position: 'absolute', top: -60, right: isMobile ? -60 : 80, width: 440, height: 340, borderRadius: '50%', background: `rgba(${rgb},0.18)`, filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 260, height: 260, borderRadius: '50%', background: `rgba(${rgb},0.08)`, filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Bottom rule */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, rgba(${rgb},0.6), transparent)` }} />

        <div style={{ ...container, position: 'relative', zIndex: 2 }}>
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginBottom: 24, padding: '6px 14px', borderRadius: 999,
            border: `1px solid rgba(${rgb},0.4)`,
            background: `rgba(${rgb},0.12)`,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: primaryColor }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: primaryColor }}>
              Reach Out
            </span>
          </div>

          <h1 style={{
            margin: '0 0 18px',
            fontSize: isMobile ? 36 : 60,
            fontFamily: "'DM Serif Display', serif",
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.07,
            letterSpacing: '-0.01em',
            maxWidth: 580,
          }}>
            {contactPage.banner.title}
          </h1>

          <p style={{
            margin: 0,
            fontSize: isMobile ? 15 : 18,
            color: 'rgba(255,255,255,0.5)',
            maxWidth: 460,
            lineHeight: 1.75,
          }}>
            {contactPage.banner.subtitle}
          </p>
        </div>
      </section>

      {/* ══ CONTACT BODY ═════════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '56px 0 80px' : '88px 0 112px' }}>
        <div style={container}>
          <div style={{
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
            gap: isMobile ? 36 : 56,
            alignItems: 'flex-start',
          }}>

            {/* ── Left: Info sidebar ── */}
            <div style={{ width: isDesktop ? 340 : '100%', flexShrink: 0 }}>

              <div style={{ marginBottom: 36 }}>
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: primaryColor }}>
                  Visit & Contact
                </p>
                <h2 style={{
                  margin: 0,
                  fontSize: isMobile ? 26 : 34,
                  fontFamily: "'DM Serif Display', serif",
                  fontWeight: 400, color: '#111', lineHeight: 1.2,
                }}>
                  Let's Connect
                </h2>
              </div>

              {/* Contact cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {contactPage.address?.phone && (
                  <ContactInfoCard rgb={rgb} primaryColor={primaryColor} icon={<Phone size={16} color={primaryColor} />} label="Phone">
                    <a href={`tel:${contactPage.address.phone}`}
                      style={{ fontWeight: 600, color: '#222', textDecoration: 'none', fontSize: 14 }}
                      onMouseOver={e => e.currentTarget.style.color = primaryColor}
                      onMouseOut={e => e.currentTarget.style.color = '#222'}>
                      {contactPage.address.phone}
                    </a>
                  </ContactInfoCard>
                )}

                {contactPage.address?.email && (
                  <ContactInfoCard rgb={rgb} primaryColor={primaryColor} icon={<Mail size={16} color={primaryColor} />} label="Email">
                    <a href={`mailto:${contactPage.address.email}`}
                      style={{ fontWeight: 600, color: '#222', textDecoration: 'none', fontSize: 14, wordBreak: 'break-all' }}
                      onMouseOver={e => e.currentTarget.style.color = primaryColor}
                      onMouseOut={e => e.currentTarget.style.color = '#222'}>
                      {contactPage.address.email}
                    </a>
                  </ContactInfoCard>
                )}

                {contactPage.address?.fullAddress && (
                  <ContactInfoCard rgb={rgb} primaryColor={primaryColor} icon={<MapPin size={16} color={primaryColor} />} label="Address">
                    <p style={{ margin: 0, fontWeight: 500, color: '#555', lineHeight: 1.6, fontSize: 14 }}>
                      {contactPage.address.fullAddress}
                    </p>
                  </ContactInfoCard>
                )}
              </div>

              {/* Map embed */}
              {contactPage.address?.mapEmbedUrl && (
                <div style={{
                  borderRadius: 16, overflow: 'hidden',
                  border: '1px solid #ebebea',
                  height: 200,
                  position: 'relative',
                }}>
                  {/* Decorative frame offset */}
                  <div style={{
                    position: 'absolute', top: 8, left: 8, right: -8, bottom: -8,
                    borderRadius: 16,
                    border: `1.5px solid rgba(${rgb},0.2)`,
                    pointerEvents: 'none', zIndex: 0,
                  }} />
                  <iframe
                    src={contactPage.address.mapEmbedUrl}
                    style={{ width: '100%', height: '100%', border: 0, display: 'block', position: 'relative', zIndex: 1 }}
                    allowFullScreen loading="lazy" title="Location Map"
                  />
                </div>
              )}
            </div>

            {/* ── Right: Form ── */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                background: '#fff',
                borderRadius: 20,
                border: '1px solid #ebebea',
                padding: isMobile ? '24px 20px' : '36px 40px',
              }}>
                {/* Form header */}
                <div style={{ marginBottom: 32 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: primaryColor }}>
                    Get in Touch
                  </p>
                  <h3 style={{
                    margin: 0, fontSize: isMobile ? 22 : 28,
                    fontFamily: "'DM Serif Display', serif",
                    fontStyle: 'italic', fontWeight: 400, color: '#111',
                    lineHeight: 1.2,
                  }}>
                    Send Us a Message
                  </h3>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* 2-col grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '18px 20px',
                    marginBottom: 18,
                  }}>
                    {[
                      { label: 'Your Name *',    key: 'name',    type: 'text',  req: true  },
                      { label: 'Email Address *', key: 'email',   type: 'email', req: true  },
                      { label: 'Phone Number',   key: 'phone',   type: 'tel',   req: false },
                      { label: 'Subject',        key: 'subject', type: 'text',  req: false },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={label}>{f.label}</label>
                        <input
                          type={f.type}
                          required={f.req}
                          value={form[f.key]}
                          onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                          onFocus={() => setFocused(f.key)}
                          onBlur={() => setFocused('')}
                          style={inputBase(f.key)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Message */}
                  <div style={{ marginBottom: 28 }}>
                    <label style={label}>Your Message *</label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      onFocus={() => setFocused('message')}
                      onBlur={() => setFocused('')}
                      style={{ ...inputBase('message'), resize: 'none', lineHeight: 1.7 }}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={sending}
                    style={{
                      width: '100%',
                      padding: '15px 0',
                      background: primaryColor,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 15,
                      borderRadius: 999,
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      cursor: sending ? 'not-allowed' : 'pointer',
                      opacity: sending ? 0.65 : 1,
                      fontFamily: 'inherit',
                      letterSpacing: '0.01em',
                      transition: 'opacity 0.2s, transform 0.15s',
                    }}
                    onMouseOver={e => { if (!sending) { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                    onMouseOut={e => { e.currentTarget.style.opacity = sending ? '0.65' : '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {sending
                      ? <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      : <ArrowRight size={17} />
                    }
                    {sending ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

/* ─── Info card sub-component ─── */
function ContactInfoCard({ rgb, primaryColor, icon, label, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '16px 18px',
      background: '#fff',
      borderRadius: 14,
      border: '1px solid #ebebea',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `rgba(${rgb},0.1)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: '0 0 3px', fontSize: 10, fontWeight: 700, color: '#ccc', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}