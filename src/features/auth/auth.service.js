import prisma from "../../config/db.js";
import bcrypt from "bcryptjs";
import { generateAuthToken } from "../../utils/tokens.js";

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
 * Creates a new user from an invitation token.
 * @param {string} token - The invitation token.
 * @param {string} name - The user's full name.
 * @param {string} password - The user's chosen password.
 * @returns {Promise<User>} The created user object.
 */
export const registerUserWithInvite = async ({ token, name, password }) => {
  // 1. Find the invitation token
  const inviteToken = await prisma.inviteToken.findUnique({
    where: { token },
  });

  // 2. Validate the token
  if (!inviteToken) {
    throw new Error("Invalid or expired invitation token.");
  }

  if (new Date() > new Date(inviteToken.expiresAt)) {
    // Clean up expired token
    await prisma.inviteToken.delete({ where: { id: inviteToken.id } });
    throw new Error("Invalid or expired invitation token.");
  }

  // 3. Check if a user with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: inviteToken.email },
  });

  if (existingUser) {
    // If the user exists, the token is invalid and should be deleted
    await prisma.inviteToken.delete({ where: { id: inviteToken.id } });
    throw new Error("A user with this email already exists.");
  }

  // 4. Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 5. Create user and delete token in a transaction
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: inviteToken.email,
        name,
        password: hashedPassword,
        role: inviteToken.role, // Assign role from the token
        emailVerified: new Date(), // Mark email as verified
      },
    });

    // Delete the token so it can't be used again
    await tx.inviteToken.delete({
      where: { id: inviteToken.id },
    });

    return user;
  });

  return newUser;
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
