import jwt from 'jsonwebtoken';
import config from '../config/env.js';

// Function to generate a JWT
export function generateAuthToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn, // Token expires in 7 days
  });
}