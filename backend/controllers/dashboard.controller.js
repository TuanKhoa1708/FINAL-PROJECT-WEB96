const dashboardService = require("../services/dashboard.service");
const { sendSuccess } = require("../utils/response");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Controller to get dashboard statistics
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();
  return sendSuccess(res, stats, "Dashboard statistics retrieved successfully");
});

module.exports = {
  getDashboardStats
};
