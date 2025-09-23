export const createResetPasswordEmail = (resetLink) => {
  return `
    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the button below to set a new password. This link will expire in 60 minutes.</p>
      <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Reset Password</a>
      <p style="margin-top: 20px; font-size: 12px; color: #888;">If you did not request a password reset, you can safely ignore this email.</p>
      <p style="font-size: 12px; color: #888; word-break: break-all;">${resetLink}</p>
    </div>
  `;
};