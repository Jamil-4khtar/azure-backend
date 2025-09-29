import prisma from "../../config/db.js";
import bcrypt from "bcryptjs";

/* 
Get all users
*/
export const getAllUsers = async (page = 1, limit = 10, filters = {}) => {
  const skip = (page - 1) * limit;
  const { search, role, status } = filters;

  const whereClause = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      role ? { role: role } : {},
      status !== undefined ? { isActive: status === "active" } : {},
    ].filter((condition) => Object.keys(condition).length > 0),
  };

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users,
    totalUsers,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

// Get user by ID
export const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};


// Create new user
export const createUser = async (userData) => {
  const { email, password, name, role = 'EDITOR' } = userData;
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Create user
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });
  
  return newUser;
};

// Update user
export const updateUser = async (id, updateData) => {
  const { password, ...otherData } = updateData;
  
  // Prepare update object
  const dataToUpdate = { ...otherData };
  
  // If password is being updated, hash it
  if (password) {
    dataToUpdate.password = await bcrypt.hash(password, 12);
  }
  
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });
    
    return updatedUser;
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // User not found
    }
    throw error;
  }
};


// Delete user
export const deleteUser = async (id) => {
  try {
    await prisma.user.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    if (error.code === 'P2025') {
      return false; // User not found
    }
    throw error;
  }
};

// Toggle user status
export const toggleUserStatus = async (id) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { isActive: true }
    });
    
    if (!user) return null;
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
				role: true,
        isActive: true,
        updatedAt: true,
				createdAt: true
      }
    });
    
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

// Get user statistics
export const getUserStats = async () => {
  const [totalUsers, activeUsers, inactiveUsers, adminUsers, editorUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'EDITOR' } })
  ]);
  
  // Get recent users (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: sevenDaysAgo
      }
    }
  });
  
  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    adminUsers,
    editorUsers,
    recentUsers
  };
};