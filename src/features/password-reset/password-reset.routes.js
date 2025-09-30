import { Router } from 'express';
import { 
  handlePasswordResetRequest, 
  handleResendRequest, 
  handleResetPassword 
} from './password-reset.controller.js';
import { passwordResetConfirmLimiter, passwordResetLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/forgot-password', passwordResetLimiter, handlePasswordResetRequest);
router.post('/forgot-password/resend', passwordResetLimiter , handleResendRequest);
router.post('/reset-password',passwordResetConfirmLimiter , handleResetPassword);

export default router;