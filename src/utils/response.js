import logger from './logger.js';

/**
 * Success response helper
 */
export function successResponse(res, data = null, message = 'Success', statusCode = 200) {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    requestId: res.req?.id,
    ...(data && { data })
  };
  
  // Log successful responses in debug mode
  logger.debug('Success response sent', {
    statusCode,
    message,
    requestId: res.req?.id,
    dataKeys: data ? Object.keys(data) : null
  });
  
  return res.status(statusCode).json(response);
}

/**
 * Created response helper (201)
 */
export function createdResponse(res, data = null, message = 'Created successfully') {
  return successResponse(res, data, message, 201);
}

/**
 * No content response helper (204)
 */
export function noContentResponse(res) {
  logger.debug('No content response sent', {
    requestId: res.req?.id
  });
  
  return res.status(204).send();
}

/**
 * Paginated response helper
 */
export function paginatedResponse(res, data, pagination, message = 'Success') {
	
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    requestId: res.req?.id,
    data,
		pagination
  };
  
  logger.debug('Paginated response sent', {
    requestId: res.req?.id,
    pagination: response.pagination
  });
  
  return res.status(200).json(response);
}

/**
 * Error response helper (for manual error responses)
 */
export function errorResponse(res, message = 'Error occurred', statusCode = 500, code = 'ERROR') {
  const response = {
    success: false,
    error: {
      message,
      code,
      statusCode,
      timestamp: new Date().toISOString(),
      requestId: res.req?.id
    }
  };
  
  logger.warn('Manual error response sent', {
    message,
    statusCode,
    code,
    requestId: res.req?.id
  });
  
  return res.status(statusCode).json(response);
}
