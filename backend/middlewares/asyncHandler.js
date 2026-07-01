/**
 * Async handler to wrap controller functions and catch errors automatically
 * @param {Function} fn - Controller function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
