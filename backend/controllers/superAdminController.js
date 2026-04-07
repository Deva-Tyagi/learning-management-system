const SuperAdmin = require("../models/SuperAdmin");
const Admin = require("../models/Admin");
const ActivityLog = require("../models/ActivityLog");
const GlobalSetting = require("../models/GlobalSetting");
const DemoInquiry = require("../models/DemoInquiry");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendDemoInquiryEmail } = require("../services/emailService");

// ✅ Register SuperAdmin (Postman only)
exports.registerSuperAdmin = async (req, res) => {
  const { name, email: rawEmail, password } = req.body;
  const email = (rawEmail || '').toLowerCase().trim();
  try {
    let superAdmin = await SuperAdmin.findOne({ email });
    if (superAdmin) return res.status(400).json({ msg: "SuperAdmin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    superAdmin = new SuperAdmin({ name, email, password: hashedPassword });
    await superAdmin.save();

    res.status(201).json({ msg: "SuperAdmin registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ✅ Get Public (Branding) Settings
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await GlobalSetting.findOne();
    if (!settings) {
      return res.json({
        platformName: "MICC CRM",
        supportEmail: "support@micc.com",
        supportPhone: "+91 00000 00000",
        primaryColor: "#2563eb",
        prices: { basic: 999, professional: 2499, enterprise: 4999 }
      });
    }
    res.json({
      platformName: settings.platformName,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      primaryColor: settings.primaryColor,
      prices: settings.prices
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ✅ Login SuperAdmin
exports.loginSuperAdmin = async (req, res) => {
  const { email: rawEmail, password } = req.body;
  const email = (rawEmail || '').toLowerCase().trim();
  try {
    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign(
      { id: superAdmin._id, isSuperAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ✅ Manage Clients (Institutes)
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Admin.find().select("-password");
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.createClient = async (req, res) => {
  const { name, instituteName, field, email: rawEmail, mobile, password, plan, planDuration } = req.body;
  const email = (rawEmail || '').toLowerCase().trim();
  try {
    let client = await Admin.findOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);
    const planExpiryDate = new Date();
    planExpiryDate.setDate(planExpiryDate.getDate() + (planDuration || 30));

    client = new Admin({
      name,
      instituteName,
      field,
      email,
      mobile,
      password: hashedPassword,
      plan: plan || "Basic",
      planDuration: planDuration || 30,
      planExpiryDate,
      isTemporaryPassword: true,
    });

    await client.save();
    res.status(201).json({ msg: "Client registered successfully", client });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.updateClientSubscription = async (req, res) => {
  const { clientId } = req.params;
  const { plan, planDuration, isActive } = req.body;
  try {
    const updateData = {};
    if (plan) updateData.plan = plan;
    if (planDuration) {
      updateData.planDuration = planDuration;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + planDuration);
      updateData.planExpiryDate = expiry;
    }
    if (isActive !== undefined) updateData.isActive = isActive;

    const client = await Admin.findByIdAndUpdate(
      clientId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!client) return res.status(404).json({ msg: "Client not found" });

    // ✅ Log the subscription update
    if (plan || planDuration) {
      const log = new ActivityLog({
        adminId: client._id,
        action: "Subscription Updated",
        details: `Plan: ${plan || client.plan}, Duration: ${planDuration || 'Existing'} days`,
        ip: req.ip || "System"
      });
      await log.save();
    }

    res.json({ msg: "Subscription updated successfully", client });
  } catch (err) {
    console.error("ERROR UPDATING SUBSCRIPTION:", err.message);
    res.status(500).json({ msg: "Internal Server Error", error: err.message });
  }
};

exports.deleteClient = async (req, res) => {
  const { clientId } = req.params;
  try {
    const client = await Admin.findByIdAndDelete(clientId);
    if (!client) return res.status(404).json({ msg: "Client not found" });

    // ✅ Log the deletion
    const log = new ActivityLog({
      adminId: clientId, // Even if deleted, we log the ID
      action: "Client Deleted",
      details: `Institute: ${client.instituteName}, Email: ${client.email}`,
      ip: req.ip || "System"
    });
    await log.save();

    res.json({ msg: "Client deleted successfully" });
  } catch (err) {
    console.error("ERROR DELETING CLIENT:", err.message);
    res.status(500).json({ msg: "Internal Server Error", error: err.message });
  }
};

exports.getClientStats = async (req, res) => {
  try {
    const totalClients = await Admin.countDocuments();
    const activeClients = await Admin.countDocuments({ isActive: true });
    const premiumClients = await Admin.countDocuments({ plan: "Premium" });
    const enterpriseClients = await Admin.countDocuments({ plan: "Enterprise" });

    res.json({
      totalClients,
      activeClients,
      premiumClients,
      enterpriseClients
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching superadmin stats" });
  }
};

exports.getClientActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("adminId", "instituteName email")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ✅ Global Platform Settings
exports.getGlobalSettings = async (req, res) => {
  try {
    let settings = await GlobalSetting.findOne();
    if (!settings) {
      settings = new GlobalSetting();
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching global settings" });
  }
};

exports.updateGlobalSettings = async (req, res) => {
  try {
    const update = req.body;
    let settings = await GlobalSetting.findOne();
    if (!settings) settings = new GlobalSetting();

    Object.assign(settings, update);
    await settings.save();
    
    // Log the update
    const log = new ActivityLog({
      adminId: req.user.id,
      action: "Platform Config Updated",
      details: "Global parameters modified by master admin",
      ip: req.ip || "System"
    });
    await log.save();

    res.json({ msg: "Global settings updated successfully", settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error updating global settings" });
  }
};

// ✅ Demo Inquiries
exports.submitDemoInquiry = async (req, res) => {
  try {
    const { name, email, phone, instituteName, plan, message } = req.body;
    
    if (!name || !email || !phone) {
      return res.status(400).json({ msg: "Name, email and phone are required" });
    }

    const newInquiry = new DemoInquiry({
      name,
      email,
      phone,
      instituteName,
      plan,
      message,
    });

    await newInquiry.save();

    // Send styled email
    await sendDemoInquiryEmail({ name, email, phone, instituteName, plan, message });

    res.status(201).json({ msg: "Inquiry submitted successfully" });
  } catch (err) {
    console.error("Error submitting demo inquiry:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.getDemoInquiries = async (req, res) => {
  try {
    const inquiries = await DemoInquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    console.error("Error fetching demo inquiries:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.updateDemoInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const inquiry = await DemoInquiry.findByIdAndUpdate(id, { status }, { new: true });
    if (!inquiry) return res.status(404).json({ msg: "Inquiry not found" });
    res.json(inquiry);
  } catch (err) {
    console.error("Error updating inquiry status:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};
