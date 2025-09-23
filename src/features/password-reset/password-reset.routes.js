import { Router } from 'express';
import { 
  handlePasswordResetRequest, 
  handleResendRequest, 
  handleResetPassword 
} from './password-reset.controller.js';

const router = Router();

router.post('/forgot-password', handlePasswordResetRequest);
router.post('/forgot-password/resend', handleResendRequest);
router.post('/reset-password', handleResetPassword);

export default router;