import express from 'express';
import { isAdmin } from '../../middleware/index.js';
import { deleteUser, getAllUsers, getUserById, getUserStats, toggleUserStatus, updateUser } from './users.controller.js'

const router = express.Router();

router.use(isAdmin);

// Get all users (with pagination and filtering)
router.get('/', getAllUsers);

// Get user statistics
router.get('/stats', getUserStats);

// Get user by ID
router.get('/:id', getUserById);

// Update user
router.put('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

// Toggle user status
router.patch('/:id/toggle-status', toggleUserStatus);

export default router;
