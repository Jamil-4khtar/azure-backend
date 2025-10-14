import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import config from '../config/env.js';

export const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ error: 'Access denied. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};