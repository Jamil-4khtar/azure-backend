import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import config from "../config/env.js";
import { AuthenticationError, AuthorizationError, asyncHandler } from '../utils/index.js'

export const isAdmin = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new AuthenticationError("Access denied. No token provided.");
  }

  const decoded = jwt.verify(token, config.jwt.secret);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user || user.role !== "ADMIN") {
    throw new AuthorizationError("Access denied. Admins only.");
  }

  req.user = user; // Attach user to the request object
  next();
});
