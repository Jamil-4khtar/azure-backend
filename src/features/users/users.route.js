import express from 'express';
import * as userController from './users.controller.js';
import { isAdmin } from '../../middleware/isAdmin.js';
// import { authenticateToken, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.use(isAdmin);

// Get all users (with pagination and filtering)
router.get('/', userController.getAllUsers);

// Get user statistics
router.get('/stats', userController.getUserStats);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create new user
router.post('/', userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

// Toggle user status
router.patch('/:id/toggle-status', userController.toggleUserStatus);

export default router;
