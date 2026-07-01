const express = require("express");
const studentController = require("../controllers/student.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

const router = express.Router();

// Apply auth middleware to all student routes
router.use(verifyToken);
router.use(verifyRole("student"));

// GET /api/student/profile
router.get("/profile", studentController.getProfile);

// GET /api/student/scores
router.get("/scores", studentController.getScores);

// GET /api/student/schedule
router.get("/schedule", studentController.getSchedule);

// GET /api/student/materials
router.get("/materials", studentController.getMaterials);

module.exports = router;
