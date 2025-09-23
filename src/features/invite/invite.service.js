import crypto from "crypto";
import prisma from "../../config/db.js";
import { sendMail } from "../../services/mail.service.js";
import { createInviteEmail } from "./invite.email.js";

/**
 * Creates an invitation token and sends an invite email.
 * @param {string} email - The email of the user to invite.
 * @param {('ADMIN'|'EDITOR'|'VIEWER')} role - The role to assign to the new user.
 * @param {object} invitedBy - The user object of the admin sending the invite.
 */
export const createInvitation = async (email, role, invitedBy) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  const inviteToken = await prisma.inviteToken.create({
    data: {
      email: email.toLowerCase(),
      role,
      token,
      expiresAt,
      createdBy: invitedBy.id,
    },
  });

  // Get the base URL from environment variables
  const inviteLink = `${process.env.DASHBOARD_URL}/register?invite=${token}`;

  const emailHtml = createInviteEmail(inviteLink);

  await sendMail(email, "You are invited to join the CMS", emailHtml);

  return inviteToken;
};
