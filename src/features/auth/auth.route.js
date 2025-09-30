import { Router } from 'express';
import { register, login, getProfile } from './auth.controller.js';
import { isAuthenticated } from '../../middleware/isAuthenticated.js';
import { loginHourlyLimiter, loginLimiter, registerLimiter } from '../../middleware/rateLimiter.js';
import { loginSchema, registerSchema, validate } from '../../middleware/validation.js';

const router = Router();

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, loginHourlyLimiter, validate(loginSchema), login);
router.get("/me", isAuthenticated, getProfile)

export default router;	