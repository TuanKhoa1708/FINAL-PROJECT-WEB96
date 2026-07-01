const express = require("express");
const adminController = require("../controllers/admin.controller");
const upload = require("../config/multer");

const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(verifyToken);
router.use(verifyRole("admin"));

// Routes for Students
router.get("/students", adminController.getStudents);
router.get("/students/:studentId/scores", adminController.getStudentScores);

// Routes for Teachers
router.get("/teachers", adminController.getTeachers);
router.post("/teachers/upload", upload.single("file"), adminController.uploadTeachers);

// Routes for Schedules
router.post("/schedules", adminController.createSchedule);

module.exports = router;
