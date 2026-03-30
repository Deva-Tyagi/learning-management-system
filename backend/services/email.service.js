const nodemailer = require('nodemailer');

async function sendEmailNotification(toEmail, subject, text) {
  try {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;

    // Check if email credentials are configured
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS || 
        EMAIL_HOST === 'REPLACE_ME' || EMAIL_USER === 'REPLACE_ME') {
      console.warn('[Email Service] Email credentials not configured. Skipping real send.');
      console.log(`[Email Service] Would have sent to: ${toEmail} | Subject: ${subject}`);
      return { success: false, message: 'Email credentials not set in .env' };
    }

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT) || 587,
      secure: parseInt(EMAIL_PORT) === 465, // true for port 465, false for others
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"MICC Institute" <${EMAIL_FROM || EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      text: text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-bottom: 12px;">📚 New Study Note Available</h2>
          <p style="color: #374151; font-size: 16px;">${text}</p>
          <p style="color: #374151; margin-top: 20px;">You can access it through your student dashboard.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">MICC Institute – Empowering Students.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email sent successfully to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('[Email Service] Error sending email to', toEmail, ':', error.message);
    throw error;
  }
}

module.exports = { sendEmailNotification };
