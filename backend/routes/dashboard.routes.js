const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

const router = express.Router();

// Apply auth middleware
router.use(verifyToken);
router.use(verifyRole("admin"));

// GET /api/admin/dashboard/stats
router.get("/stats", dashboardController.getDashboardStats);

module.exports = router;
