import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '1025', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
});

/**
 * Sends an email.
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Email subject.
 * @param {string} html - HTML body of the email.
 */
export const sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || '"Your App Name" <noreply@example.com>',
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};