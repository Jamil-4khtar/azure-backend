import { NotFoundError, paginatedResponse, successResponse, asyncHandler } from "../../utils/index.js";
import * as userService from "./users.service.js";

// Get all users with pagination and filtering
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, status } = req.query;
  const filters = { search, role, status };

  const result = await userService.getAllUsers(
    parseInt(page),
    parseInt(limit),
    filters
  );

  const pagination = {
    currentPage: parseInt(page),
    totalPages: result.totalPages,
    totalUsers: result.totalUsers,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev,
  };

  return paginatedResponse(res, result.users, pagination);
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }
  return successResponse(res, user);
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const updatedUser = await userService.updateUser(id, updateData);

  if (!updatedUser) {
    throw new NotFoundError("User not found");
  }

  return successResponse(res, updatedUser, "User updated successfully");
});

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// Toggle user status (active/inactive)
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedUser = await userService.toggleUserStatus(id);

  if (!updatedUser) {
    throw new NotFoundError("User not found");
  }

  return successResponse(
    res,
    updatedUser,
    `User ${updatedUser.isActive ? "activated" : "deactivated"} successfully`
  );
});

// Get user statistics
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats();

  return successResponse(res, stats);
});
