import logger from '../utils/logger.js';
import { AppError, isOperationalError } from '../utils/errors.js';

/**
 * Global error handling middleware
 */
export function globalErrorHandler(error, req, res, next) {
  const timestamp = new Date().toISOString();
  
  // Set default error properties
  let err = { ...error };
  err.statusCode = error.statusCode || 500;
  err.message = error.message || 'Internal Server Error';
  
  // Log the error
  logger.logError(error, req, {
    requestId: req.id,
    timestamp,
    isOperational: isOperationalError(error)
  });
  
  // Handle specific error types in development
  if (process.env.NODE_ENV === 'development') {
    err = handleDevelopmentError(error);
  } else {
    err = handleProductionError(error);
  }
  
  // Send error response
  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      code: err.code || 'INTERNAL_ERROR',
      statusCode: err.statusCode,
      timestamp,
      requestId: req.id,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: err.details
      })
    }
  });
}

/**
 * Handle errors in development environment
 */
function handleDevelopmentError(error) {
  return {
    statusCode: error.statusCode || 500,
    message: error.message,
    code: error.code,
    details: error.details,
    stack: error.stack
  };
}

/**
 * Handle errors in production environment
 */
function handleProductionError(error) {
  // Operational, trusted error: send message to client
  if (isOperationalError(error)) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  // Programming or other unknown error: don't leak error details
  return {
    statusCode: 500,
    message: 'Something went wrong!',
    code: 'INTERNAL_ERROR'
  };
}

/**
 * Handle async errors (wrap async functions)
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Handle 404 errors
 */
export function notFoundHandler(req, res, next) {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    true,
    'ROUTE_NOT_FOUND'
  );
  
  next(error);
}

/**
 * Handle unhandled promise rejections
 */
export function handleUnhandledRejection() {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason.message || reason,
      stack: reason.stack,
      promise
    });
    
    // Close server gracefully
    process.exit(1);
  });
}

/**
 * Handle uncaught exceptions
 */
export function handleUncaughtException() {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      message: error.message,
      stack: error.stack
    });
    
    // Close server gracefully
    process.exit(1);
  });
}
