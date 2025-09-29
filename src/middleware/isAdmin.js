import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

	// console.log("Is there token", token)

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    req.user = user; // Attach user to the request object
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};