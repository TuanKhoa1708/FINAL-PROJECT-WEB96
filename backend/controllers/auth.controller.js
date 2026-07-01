const authService = require("../services/auth.service");
const { sendSuccess, sendError } = require("../utils/response");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Controller for user login
 */
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return sendError(res, "Please provide username and password", null, 400);
  }

  try {
    const result = await authService.login(username, password);
    return sendSuccess(res, result, "Login successful");
  } catch (error) {
    return sendError(res, error.message, null, 401);
  }
});

module.exports = {
  login
};
