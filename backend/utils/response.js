/**
 * Standardize successful API response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send back
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code
 */
const sendSuccess = (res, data = {}, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Standardize error API response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Object|String} error - Detailed error
 * @param {Number} statusCode - HTTP status code
 */
const sendError = (res, message = "Error", error = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || message
  });
};

module.exports = {
  sendSuccess,
  sendError
};
