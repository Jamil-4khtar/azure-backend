import { Router } from 'express';
import { register, login, getProfile } from './auth.controller.js';
import { isAuthenticated } from '../../middleware/isAuthenticated.js';
import { loginHourlyLimiter, loginLimiter, registerLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, loginHourlyLimiter, login);
router.get("/me", isAuthenticated, getProfile)

export default router;	