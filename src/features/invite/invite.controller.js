import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/response.js';
import { createInvitation } from './invite.service.js';

export const inviteUser = asyncHandler(async (req, res) => {
    const { email, role = 'EDITOR' } = req.body;
    const invitedBy = req.user; // Attached by the isAdmin middleware

    await createInvitation(email, role, invitedBy);

		return successResponse(res, null, "Invitation sent successfully.");
})