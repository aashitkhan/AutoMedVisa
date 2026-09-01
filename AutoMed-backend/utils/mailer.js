const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[mailer] SMTP_USER/SMTP_PASS not set — emails will be skipped.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return transporter;
}

async function sendVerificationEmail({ to, name, result }) {
  const t = getTransporter();
  if (!t) return { sent: false, reason: 'SMTP not configured' };

  const subject = result.isMatch
    ? 'AutoMed Visa — Your documents were verified'
    : `AutoMed Visa — Mismatch detected (Risk: ${result.riskLevel})`;

  const reasonsHtml = (result.mismatchReasons || []).map((r) => `<li style="margin-bottom:4px">${r}</li>`).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#16233a">AutoMed Visa</h2>
      <p>Hi ${name || 'there'},</p>
      <p>${result.isMatch ? 'Good news — your submitted job title matches your visa category.' : 'We found a mismatch between your job title and your visa category.'}</p>
      <p><strong>Risk score:</strong> ${result.riskScore}/100 (${result.riskLevel})</p>
      ${result.matchedVisaCategory ? `<p><strong>Visa category:</strong> ${result.matchedVisaCategory}</p>` : ''}
      ${reasonsHtml ? `<ul>${reasonsHtml}</ul>` : ''}
      <p style="color:#666;font-size:12px;margin-top:24px">This is an automated message from AutoMed Visa.</p>
    </div>`;

  try {
    await t.sendMail({ from: `"AutoMed Visa" <${process.env.SMTP_USER}>`, to, subject, html });
    return { sent: true };
  } catch (err) {
    console.error('[mailer] Failed to send email:', err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendVerificationEmail };