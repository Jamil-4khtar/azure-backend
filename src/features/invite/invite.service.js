import crypto from "crypto";
import prisma from "../../config/db.js";
import { sendMail } from "../../services/mail.service.js";
import { createInviteEmail } from "./invite.email.js";
import config from "../../config/env.js";


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
  const inviteLink = `${config.cors.dashboardUrl}/register?invite=${token}`;

  const emailHtml = createInviteEmail(inviteLink);

  await sendMail(email, "You are invited to join the CMS", emailHtml);

  return inviteToken;
};
