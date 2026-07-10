const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendCouponEmail({ to, name, code, discount }) {
  const { generateEmailContent } = require('./coupon');
  const { subject, html } = generateEmailContent({ name, code, discount });

  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || 'Scratch Card'}" <${process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
    to,
    subject,
    html
  });

  console.log(`[EMAIL] Sent to ${to} — Message ID: ${info.messageId}`);
  return info;
}

module.exports = { sendCouponEmail };
