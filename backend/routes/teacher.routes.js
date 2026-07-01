const express = require("express");
const teacherController = require("../controllers/teacher.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

const router = express.Router();

// Apply auth middleware to teacher routes
router.use(verifyToken);
router.use(verifyRole("teacher"));

// GET /api/teacher/dashboard/stats
router.get("/dashboard/stats", teacherController.getDashboardStats);

// GET /api/teacher/students
router.get("/students", teacherController.getStudents);

// GET /api/teacher/schedule
router.get("/schedule", teacherController.getSchedule);

// GET /api/teacher/scores
router.get("/scores", teacherController.getScores);
router.post("/scores", teacherController.upsertScore);
router.put("/scores/:scoreId", teacherController.upsertScore);

// GET /api/teacher/materials
router.get("/materials", teacherController.getMaterials);
router.post("/materials", teacherController.saveMaterial);
router.put("/materials/:materialId", teacherController.saveMaterial);
router.delete("/materials/:materialId", teacherController.deleteMaterial);

module.exports = router;
