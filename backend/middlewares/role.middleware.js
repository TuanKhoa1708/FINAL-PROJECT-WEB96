const { sendError } = require("../utils/response");

/**
 * Middleware to check if user has the required role(s)
 * @param  {...String} roles - Allowed roles (e.g., 'admin', 'student')
 */
const verifyRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, "Access denied. You do not have permission to access this resource.", null, 403);
    }
    next();
  };
};

module.exports = {
  verifyRole
};
