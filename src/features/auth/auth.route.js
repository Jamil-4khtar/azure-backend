import { Router } from 'express';
import { register, login, getProfile } from './auth.controller.js';
import { isAuthenticated } from '../../middleware/isAuthenticated.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get("/me", isAuthenticated, getProfile)

export default router;	