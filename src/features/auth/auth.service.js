import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';
import { generateAuthToken } from '../../utils/tokens.js';

/**
 * Finds a user by their email address.
 * @param {string} email - The user's email.
 * @returns {Promise<User|null>} The user object or null if not found.
 */
export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
};

/**
 * Creates a new user in the database.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {string} name - The user's name.
 * @returns {Promise<User>} The created user object.
 */
export const createUser = async (email, password, name) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      // You can set default values like role here if needed
      // role: 'EDITOR' 
    },
  });
};

/**
 * Attempts to log in a user with email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<{user: object, token: string}|null>} An object with user data and a token, or null if login fails.
 */
export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    return null; // User not found
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null; // Invalid password
  }

  // Exclude password from the returned user object
  const { password: _, ...userWithoutPassword } = user;
  
  const token = generateAuthToken(userWithoutPassword);

  return { user: userWithoutPassword, token };
};