import config from "../config/env.js";
import {
  logger,
  AppError,
  isOperationalError,
  globalDevErrorResponse,
  globalProdErrorResponse,
} from "../utils/index.js";

/**
 * Global error handling middleware
 */
export function globalErrorHandler(error, req, res, next) {
  const timestamp = new Date().toISOString();

  // Set default error properties
  let err = { ...error };
  err.statusCode = error.statusCode || 500;
  err.message = error.message || "Internal Server Error";

  // Log the error
  logger.logError(error, req, {
    requestId: req.id,
    timestamp,
    isOperational: isOperationalError(error),
  });

  // Send error response
  config.server.nodeEnv === "development"
    ? globalDevErrorResponse(res, err, {
        timestamp,
        requestId: req.id,
        originalError: error,
      })
    : globalProdErrorResponse(res, err, {
        timestamp,
        requestId: req.id,
        originalError: error,
      });
}

/**
 * Handle 404 errors
 */
export function notFoundHandler(req, res, next) {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    true,
    "ROUTE_NOT_FOUND"
  );

  next(error);
}

/**
 * Handle unhandled promise rejections
 */
export function handleUnhandledRejection() {
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Promise Rejection", {
      reason: reason.message || reason,
      stack: reason.stack,
      promise,
    });

    // Close server gracefully
    process.exit(1);
  });
}

/**
 * Handle uncaught exceptions
 */
export function handleUncaughtException() {
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", {
      message: error.message,
      stack: error.stack,
    });

    // Close server gracefully
    process.exit(1);
  });
}
