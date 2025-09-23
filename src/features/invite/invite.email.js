export const createInviteEmail = (inviteLink) => {
  return `
    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
      <h2>You're Invited!</h2>
      <p>You have been invited to join the CMS. Click the button below to accept your invitation and create an account.</p>
      <a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Accept Invite</a>
      <p style="margin-top: 20px; font-size: 12px; color: #888;">If you cannot click the button, copy and paste this link into your browser:</p>
      <p style="font-size: 12px; color: #888; word-break: break-all;">${inviteLink}</p>
    </div>
  `;
};