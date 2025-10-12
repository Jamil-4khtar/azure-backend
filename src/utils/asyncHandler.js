/**
 * Async handler utility that wraps async functions to catch errors
 * and pass them to Express error handling middleware
 * 
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - Express middleware function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Alternative name for those who prefer this syntax
 */
export const catchAsync = asyncHandler;

export default asyncHandler;
