const nodemailer = require("nodemailer");

/**
 * Configure Transporter
 * Using Gmail by default as configured for Demo Inquiries.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Base Email Template Wrapper
 * Provides a professional, consistent layout for all system emails.
 */
const baseEmailTemplate = (title, content, footerText = "NovaTech LMS - Empowering Modern Education") => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">${title}</h1>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 30px; line-height: 1.6; color: #334155;">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 600;">${footerText}</p>
      <div style="margin-top: 15px; font-size: 11px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} NovaTech LMS. All rights reserved.
      </div>
    </div>
  </div>
`;

/**
 * Send OTP for Password Recovery
 */
exports.sendOTP = async (email, otp) => {
  const content = `
    <p style="font-size: 16px; margin-bottom: 24px;">Hello,</p>
    <p style="font-size: 16px; margin-bottom: 24px;">We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
    <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #4f46e5;">${otp}</span>
    </div>
    <p style="font-size: 14px; color: #64748b;">This OTP will expire in 10 minutes. If you did not request this, please ignore this email.</p>
  `;

  const mailOptions = {
    from: `"NovaTech Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password - Verification Code",
    html: baseEmailTemplate("Verify Your Identity", content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent to", email);
  } catch (err) {
    console.error("Error sending OTP email:", err);
    throw new Error("Could not send verification email");
  }
};

/**
 * Send Demo Inquiry to Admin
 */
exports.sendDemoInquiryEmail = async (inquiryData) => {
  const { name, email, phone, instituteName, plan, message } = inquiryData;
  const adminEmail = "devatyagi940@gmail.com";

  const content = `
    <p style="font-size: 16px; margin-bottom: 24px;">A new demo request has been submitted through the portal.</p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 20px; background-color: #f1f5f9; font-weight: 700; width: 35%; font-size: 13px; color: #475569; text-transform: uppercase;">Full Name</td>
          <td style="padding: 12px 20px; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 20px; background-color: #f1f5f9; font-weight: 700; font-size: 13px; color: #475569; text-transform: uppercase;">Email</td>
          <td style="padding: 12px 20px; font-size: 14px; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 12px 20px; background-color: #f1f5f9; font-weight: 700; font-size: 13px; color: #475569; text-transform: uppercase;">Phone</td>
          <td style="padding: 12px 20px; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${phone}</td>
        </tr>
        <tr>
          <td style="padding: 12px 20px; background-color: #f1f5f9; font-weight: 700; font-size: 13px; color: #475569; text-transform: uppercase;">Institute</td>
          <td style="padding: 12px 20px; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${instituteName || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 12px 20px; background-color: #f1f5f9; font-weight: 700; font-size: 13px; color: #475569; text-transform: uppercase;">Plan Interested</td>
          <td style="padding: 12px 20px; font-size: 14px; border-bottom: 1px solid #f1f5f9; text-transform: capitalize; font-weight: 600; color: #4f46e5;">${plan}</td>
        </tr>
      </table>
    </div>
    <div style="margin-top: 24px;">
      <p style="font-weight: 700; font-size: 13px; color: #475569; text-transform: uppercase; margin-bottom: 8px;">Message:</p>
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; font-size: 14px; font-style: italic; color: #475569;">
        "${message || 'No specific message provided.'}"
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"NovaTech System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `[LEAD] New Demo Request: ${name}`,
    html: baseEmailTemplate("New Demo Inquiry", content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Demo inquiry email sent to", adminEmail);
  } catch (err) {
    console.error("Error sending demo inquiry email:", err);
  }
};

/**
 * Send Note Assigned Notification to Student
 * Replaces old sendEmailNotification from email.service.js
 */
exports.sendEmailNotification = async (toEmail, subject, message) => {
  const content = `
    <p style="font-size: 16px; margin-bottom: 24px;">Hello Student,</p>
    <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 24px; background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 20px;">
      <div style="flex: 1;">
        <h3 style="margin: 0 0 8px 0; color: #5b21b6; font-size: 18px;">📚 New Study Materials</h3>
        <p style="margin: 0; font-size: 15px; color: #4c1d95; line-height: 1.5;">${message}</p>
      </div>
    </div>
    <div style="text-align: center; margin-top: 30px;">
      <a href="#" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; transition: background-color 0.2s;">
        Access Your Dashboard →
      </a>
    </div>
    <p style="margin-top: 30px; font-size: 13px; color: #94a3b8; text-align: center;">
      You can view and download all your assigned notes in the 'My Notes' section of your student portal.
    </p>
  `;

  const mailOptions = {
    from: `"NovaTech Education" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: subject,
    html: baseEmailTemplate("Learning Update", content),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Note notification sent to ${toEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email Service] Error sending note notification:', error.message);
    throw error;
  }
};
