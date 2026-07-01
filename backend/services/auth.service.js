const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt");

/**
 * Handle user login
 * @param {String} username
 * @param {String} password
 * @returns {Object} { user, token }
 */
const login = async (username, password) => {
  // Find user by username
  const user = await User.findOne({ username, isActive: true })
    .select("+password")
    .populate("referenceId"); // In case password is not selected by default

  if (!user) {
    throw new Error("Invalid username or password");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid username or password");
  }

  // Generate JWT token
  const token = generateToken({ id: user._id, role: user.role });

  // Return user info without password
  const userResponse = {
    _id: user._id,
    id: user.referenceId?._id || user.referenceId || user._id,
    username: user.username,
    role: user.role,
    referenceId: user.referenceId,
  };

  return {
    user: userResponse,
    token,
  };
};

module.exports = {
  login,
};
