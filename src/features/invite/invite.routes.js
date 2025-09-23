import { Router } from 'express';
import { inviteUser } from './invite.controller.js';
import { isAdmin } from '../../middleware/isAdmin.js';

const router = Router();

// This route is now protected and can only be accessed by admins
router.post('/', isAdmin, inviteUser);

export default router;