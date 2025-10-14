import nodemailer from 'nodemailer';
import config from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
});

/**
 * Sends an email.
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Email subject.
 * @param {string} html - HTML body of the email.
 */
export const sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: config.smtp.from || '"Your App Name" <noreply@example.com>',
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};