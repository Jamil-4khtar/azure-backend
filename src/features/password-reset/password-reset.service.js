import crypto from "crypto";
import prisma from "../../config/db.js";
import { sendMail } from "../../services/mail.service.js";
import { createResetPasswordEmail } from "./password-reset.email.js";
import { findUserByEmail } from "../auth/auth.service.js";
import bcrypt from "bcryptjs";



// --- CONFIGURATION ---
// These values can be moved to a config file or .env file
const COOLDOWN_SECONDS = 60;
const TOKEN_TTL_MINUTES = 60;
const ROTATE_AFTER_MINUTES = 15;

const ms = (seconds) => seconds * 1000;
const minutes = (mins) => mins * 60 * 1000;

/**
 * Creates a password reset token and sends the reset email.
 * @param {string} email - The user's email address.
 */

export const requestPasswordReset = async (email) => {
  const user = await findUserByEmail(email);

  // IMPORTANT: To prevent user enumeration attacks, we don't throw an error if the user is not found.
  // The function will complete silently, and the controller will always send a generic success message.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + minutes(TOKEN_TTL_MINUTES)); // Token expires in 1 hour

    // Prisma's `upsert` is perfect here. It creates a token if one doesn't exist for the user,
    // or updates the existing one with a new token and expiration date.
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: {
        token,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetLink = `${process.env.DASHBOARD_URL}/reset-password?token=${token}`;
    const emailHtml = createResetPasswordEmail(resetLink);

    await sendMail(email, "Reset Your Password", emailHtml);
  }
  // No return value is needed as we always respond with success.
};

// --- NEW FUNCTION: RESEND RESET EMAIL ---
/**
 * Handles the logic for resending a password reset email, including cooldowns.
 * @param {string} email - The user's email address.
 * @returns {Promise<{resent: boolean, cooldownMsLeft: number}>}
 */
export const resendResetEmail = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) {
    // Silently succeed to prevent user enumeration
    return { resent: true, cooldownMsLeft: 0 };
  }

  let tokenRow = await prisma.passwordResetToken.findUnique({
    where: { userId: user.id },
  });

  const now = new Date();

  // If no token exists or it's expired, create a new one
  if (!tokenRow || tokenRow.expiresAt < now) {
    await requestPasswordReset(email);
    return { resent: true, cooldownMsLeft: ms(COOLDOWN_SECONDS) };
  }

  const msSinceLastSend =
    now.getTime() - new Date(tokenRow.createdAt).getTime();
  const cooldownMs = ms(COOLDOWN_SECONDS);

  // If still in cooldown period, do not resend
  if (msSinceLastSend < cooldownMs) {
    return { resent: false, cooldownMsLeft: cooldownMs - msSinceLastSend };
  }

  // Resend email and update the `createdAt` to reset the cooldown timer
  await prisma.passwordResetToken.update({
    where: { id: tokenRow.id },
    data: { createdAt: now },
  });

  const resetLink = `${process.env.DASHBOARD_URL}/reset-password?token=${tokenRow.token}`;
  const emailHtml = createResetPasswordEmail(resetLink);
  await sendMail(email, "Reset Your Password", emailHtml);

  return { resent: true, cooldownMsLeft: cooldownMs };
};

// --- NEW FUNCTION: RESET PASSWORD ---
/**
 * Verifies a token and updates the user's password.
 * @param {string} token - The password reset token.
 * @param {string} password - The new password.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
export const resetPassword = async (token, password) => {
  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!tokenRecord || new Date(tokenRecord.expiresAt) < new Date()) {
    // Token is invalid or expired
    return false;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Use a transaction to ensure both operations succeed or fail together
  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.delete({
      where: { token },
    }),
  ]);

  return true;
};
