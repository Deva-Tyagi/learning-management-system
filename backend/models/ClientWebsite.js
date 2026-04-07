const mongoose = require('mongoose');

const clientWebsiteSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    unique: true,
  },
  domainName: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  instituteName: { type: String, required: true },

  // ─── GLOBAL THEME ───────────────────────────────────────
  theme: {
    primaryColor: { type: String, default: '#2563eb' },
    logoUrl: { type: String, default: '' },
  },

  // ─── SHARED FOOTER ──────────────────────────────────────
  footer: {
    tagline: { type: String, default: 'Empowering students through world-class education.' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    socialLinks: [{ platform: String, url: String }],
  },

  // ─── HOME PAGE ──────────────────────────────────────────
  homePage: {
    banner: {
      title: { type: String, default: 'Shape Your Future' },
      subtitle: { type: String, default: 'Join thousands of students learning with excellence.' },
      ctaText: { type: String, default: 'Explore Courses' },
      backgroundImage: { type: String, default: '' },
    },
    technologies: {
      heading: { type: String, default: 'Technologies We Teach' },
      items: [{
        icon: { type: String, default: '💻' },
        name: { type: String },
        description: { type: String },
      }],
    },
    whyChooseUs: {
      heading: { type: String, default: 'Why Choose Us' },
      items: [{
        icon: { type: String, default: '🎯' },
        title: { type: String },
        text: { type: String },
      }],
    },
    features: {
      heading: { type: String, default: 'What We Offer' },
      items: [{
        title: { type: String },
        description: { type: String },
        imageUrl: { type: String, default: '' },
      }],
    },
  },

  // ─── ABOUT PAGE ─────────────────────────────────────────
  aboutPage: {
    banner: {
      title: { type: String, default: 'About Us' },
      subtitle: { type: String, default: 'Learn more about our mission, team, and values.' },
      backgroundImage: { type: String, default: '' },
    },
    impact: {
      heading: { type: String, default: 'Our Impact in Numbers' },
      stats: [{
        number: { type: String, default: '1000+' },
        label: { type: String, default: 'Students' },
      }],
    },
    whatSetsUsApart: {
      heading: { type: String, default: 'What Sets Us Apart' },
      points: [{ type: String }],
    },
    faculty: [{
      name: { type: String },
      role: { type: String },
      bio: { type: String },
      photoUrl: { type: String, default: '' },
    }],
    mission: {
      heading: { type: String, default: 'Our Mission' },
      text: { type: String, default: 'To provide accessible, high-quality education to all.' },
      imageUrl: { type: String, default: '' },
    },
  },

  // ─── COURSES PAGE ───────────────────────────────────────
  coursesPage: {
    banner: {
      title: { type: String, default: 'Our Courses' },
      subtitle: { type: String, default: 'Browse all programs and start learning today.' },
    },
  },

  // ─── CONTACT PAGE ───────────────────────────────────────
  contactPage: {
    banner: {
      title: { type: String, default: 'Contact Us' },
      subtitle: { type: String, default: 'We\'d love to hear from you. Reach out anytime.' },
    },
    address: {
      fullAddress: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      mapEmbedUrl: { type: String, default: '' },
    },
  },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ClientWebsite', clientWebsiteSchema);
