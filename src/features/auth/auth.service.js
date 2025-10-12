import prisma from "../../config/db.js";
import bcrypt from "bcryptjs";
import { generateAuthToken } from "../../utils/tokens.js";
import { AuthenticationError } from "../../utils/errors.js";

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
};

export const registerUserWithInvite = async ({ token, name, password }) => {
  // 1. Find the invitation token
  const inviteToken = await prisma.inviteToken.findUnique({
    where: { token },
  });

  // 2. Validate the token
  if (!inviteToken) {
    throw new AuthenticationError("Invalid or expired invitation token.");
  }

  if (new Date() > new Date(inviteToken.expiresAt)) {
    // Clean up expired token
    await prisma.inviteToken.delete({ where: { id: inviteToken.id } });
    throw new AuthenticationError("Invalid or expired invitation token.");
  }

  // 3. Check if a user with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: inviteToken.email },
  });

  if (existingUser) {
    // If the user exists, the token is invalid and should be deleted
    await prisma.inviteToken.delete({ where: { id: inviteToken.id } });
    throw new AuthenticationError("A user with this email already exists.");
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

export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AuthenticationError("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AuthenticationError("Invalid email or password");
  }

  // Exclude password from the returned user object
  const { password: _, ...userWithoutPassword } = user;

  const token = generateAuthToken(userWithoutPassword);

  return { user: userWithoutPassword, token };
};
