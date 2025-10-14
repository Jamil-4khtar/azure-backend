import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import config from "../config/env.js";
import { AuthenticationError } from "../utils/errors.js";
import asyncHandler from "../utils/asyncHandler.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new AuthenticationError("Access denied. No token provided.");
  }

  const decoded = jwt.verify(token, config.jwt.secret);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user) {
    throw new AuthenticationError("Access denied. User not found.");
  }

  req.user = user;
  next();
});
