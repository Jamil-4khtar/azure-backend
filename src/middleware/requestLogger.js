import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID middleware - adds unique ID to each request
 */
export function requestId(req, res, next) {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
}

/**
 * HTTP request logging middleware
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log incoming request (only in debug mode to avoid spam)
  logger.debug(`Incoming request`, {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
  });

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    // Log completed request
    logger.logRequest(req, res, duration);
    
    // Call original end method
    originalEnd.call(res, chunk, encoding);
  };

  next();
}

/**
 * Error logging middleware
 */
export function errorLogger(err, req, res, next) {
  // Log the error with request context
  logger.logError(err, req, {
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });

  next(err);
}
