import {
  requestPasswordReset,
  resendResetEmail,
  resetPassword,
} from "./password-reset.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/response.js";
import { AuthenticationError } from "../../utils/errors.js";

export const handlePasswordResetRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await requestPasswordReset(email);

  // Always send a success response to prevent attackers from guessing which emails are registered.
  return successResponse(
    res,
    null,
    "'If an account with that email exists, a password reset link has been sent.'"
  );
});

// --- NEW CONTROLLER: HANDLE RESEND ---
export const handleResendRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await resendResetEmail(email);

  return successResponse(res, result);
});

// --- NEW CONTROLLER: HANDLE PASSWORD RESET ---
export const handleResetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const success = await resetPassword(token, password);

  if (!success) {
    throw new AuthenticationError("Invalid or expired token.");
  }

  return successResponse(res, null, "Password has been reset successfully.");
});
