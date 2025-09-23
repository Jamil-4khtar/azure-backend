import { createInvitation } from './invite.service.js';

export const inviteUser = async (req, res) => {
  try {
    const { email, role = 'EDITOR' } = req.body;
    const invitedBy = req.user; // Attached by the isAdmin middleware

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    await createInvitation(email, role, invitedBy);

    res.status(200).json({ message: 'Invitation sent successfully.' });
  } catch (error) {
    // Handle potential Prisma error for unique email constraint if needed
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return res.status(409).json({ error: 'An active invitation for this email already exists.' });
    }
    console.error('Invite Error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};