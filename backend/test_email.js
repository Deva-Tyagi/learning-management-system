const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;
  
  console.log('Email Config:', { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_FROM });
  console.log('EMAIL_PASS set:', !!EMAIL_PASS);
  
  if (!EMAIL_USER || EMAIL_USER === 'REPLACE_ME') {
    console.error('EMAIL_USER not configured!');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✓ SMTP connection verified!');

    console.log('Sending test email to:', EMAIL_USER);
    const info = await transporter.sendMail({
      from: `"MICC Institute" <${EMAIL_FROM || EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: 'MICC - Email Notification Test',
      text: 'This is a test email from the MICC notification system. If you received this, email notifications are working!',
    });
    
    console.log('✓ Test email sent:', info.messageId);
    console.log('Check your inbox at:', EMAIL_USER);
  } catch (err) {
    console.error('✗ Email test FAILED:', err.message);
    if (err.code === 'EAUTH') {
      console.error('HINT: Gmail authentication failed. Make sure you are using a Gmail App Password, not your regular password.');
    }
  }
  process.exit(0);
}

testEmail();
