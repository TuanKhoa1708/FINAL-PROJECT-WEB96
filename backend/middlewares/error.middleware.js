const { sendError } = require("../utils/response");

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    return sendError(res, "Validation Error", errors, 400);
  }
  
  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, `Duplicate field value entered for ${field}`, null, 400);
  }

  // Handle default errors
  return sendError(res, "Internal Server Error", err.message, 500);
};

module.exports = errorHandler;
