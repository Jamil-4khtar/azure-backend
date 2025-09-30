import rateLimit from 'express-rate-limit';

// Global rate limiter - applies to all routes
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for login attempts
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 login attempts per minute per IP
  message: {
    error: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Secondary login limiter (hourly)
export const loginHourlyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 login attempts per hour per IP
  message: {
    error: 'Too many login attempts, please try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Register limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour per IP
  message: {
    error: 'Too many registration attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset request limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour per IP
  message: {
    error: 'Too many password reset requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset confirm limiter
export const passwordResetConfirmLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 password reset confirmations per hour per IP
  message: {
    error: 'Too many password reset attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
