const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/response");

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Access denied. No token provided.", null, 401);
    }

    const token = authHeader.split(" ")[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Token expired", null, 401);
    }
    return sendError(res, "Invalid token", null, 400);
  }
};

module.exports = {
  verifyToken
};
