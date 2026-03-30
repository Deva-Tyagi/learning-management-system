const mongoose = require('mongoose');

const globalSettingSchema = new mongoose.Schema({
  // Pricing Strategy
  prices: {
    basic: { type: Number, default: 1000 },
    professional: { type: Number, default: 1500 },
    enterprise: { type: Number, default: 2000 }
  },
  // Operational Quotas
  quotas: {
    basicStudentLimit: { type: Number, default: 200 },
    professionalStudentLimit: { type: Number, default: 500 },
    enterpriseBranchLimit: { type: Number, default: 8 }
  },
  // System Status
  isMaintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: "Platform is currently undergoing scheduled optimization. We will be back shortly." },
  
  // Brand Identity & Support
  platformName: { type: String, default: "MICC CRM" },
  supportEmail: { type: String, default: "support@micc.com" },
  supportPhone: { type: String, default: "+91 00000 00000" },
  primaryColor: { type: String, default: "#2563eb" },

  // Tactical Outreach
  globalAdminAnnouncement: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSetting', globalSettingSchema);
