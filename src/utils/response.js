import { handlePrismaError } from "./errors.js";
import logger from "./logger.js";

/**
 * Success response helper
 */
export function successResponse(
  res,
  data = null,
  message = "Success",
  statusCode = 200
) {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    requestId: res.req?.id,
    ...(data && { data }),
  };

  // Log successful responses in debug mode
  logger.debug("Success response sent", {
    statusCode,
    message,
    requestId: res.req?.id,
    dataKeys: data ? Object.keys(data) : null,
  });

  return res.status(statusCode).json(response);
}

/**
 * Created response helper (201)
 */
export function createdResponse(
  res,
  data = null,
  message = "Created successfully"
) {
  return successResponse(res, data, message, 201);
}

/**
 * No content response helper (204)
 */
export function noContentResponse(res) {
  logger.debug("No content response sent", {
    requestId: res.req?.id,
  });

  return res.status(204).send();
}


export function globalDevErrorResponse(
  res,
  error,
  { timestamp, requestId, originalError }
) {
  // Prisma error mapping step
  let handledError = error;
  if (
    error.code &&
    (error.constructor?.name?.startsWith("Prisma") ||
      typeof error.code === "string")
  ) {
    handledError = handlePrismaError(error);
  }
  const responsePayload = {
    success: false,
    error: {
      message: handledError.message,
      code: handledError.code || "INTERNAL_ERROR",
      statusCode: handledError.statusCode || 500,
      timestamp,
      requestId,
      stack: handledError.stack || originalError?.stack,
      details: handledError.details,
    },
  };
  res.status(responsePayload.error.statusCode).json(responsePayload);
}

export function globalProdErrorResponse(
  res,
  error,
  { timestamp, requestId, originalError }
) {
  const responsePayload = {
    success: false,
    error: {
      message: error.message,
      code: error.code || "INTERNAL_ERROR",
      statusCode: error.statusCode || 500,
      timestamp,
      requestId,
    },
  };

  res.status(responsePayload.error.statusCode).json(responsePayload);
}
