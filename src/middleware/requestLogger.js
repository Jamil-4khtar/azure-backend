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
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  logger.debug("Incoming request", {
    requestId: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    contentType: req.get("content-type"),
    contentLength: req.get("content-length"),
    params: req.params,
    query: req.query,
  });

  const originalEnd = res.end;

  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;
    
    // Log BEFORE ending response
    logger.logRequest(req, res, duration);
    
    // Restore and call original
    res.end = originalEnd;
    res.end(chunk, encoding);
  };

  next();
};
