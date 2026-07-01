const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token
 * @param {Object} payload - Data to be embedded in the token ({ id, role })
 * @returns {String} JWT Token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d" // Token expires in 1 day
  });
};

module.exports = {
  generateToken
};
