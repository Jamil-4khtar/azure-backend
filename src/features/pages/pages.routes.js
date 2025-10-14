import { Router } from 'express';
import { listPages, createNewPage } from './pages.controller.js';
import { isAuthenticated } from '../../middleware/index.js';

const router = Router();

// Both routes require the user to be logged in
router.get('/', isAuthenticated, listPages);
router.post('/', isAuthenticated, createNewPage);

export default router;