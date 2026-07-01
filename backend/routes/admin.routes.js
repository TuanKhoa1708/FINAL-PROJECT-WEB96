const express = require("express");
const adminController = require("../controllers/admin.controller");
const upload = require("../config/multer");

const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(verifyToken);
router.use(verifyRole("admin"));

// Routes for Accounts
router.get("/accounts", adminController.getAccounts);
router.post("/accounts", adminController.createAccount);
router.put("/accounts/:accountId", adminController.updateAccount);

// Routes for Students
router.get("/students", adminController.getStudents);
router.get("/students/:studentId/scores", adminController.getStudentScores);
router.post("/students", adminController.createStudent);
router.put("/students/:studentId", adminController.updateStudent);
router.delete("/students/:studentId", adminController.deleteStudent);

// Routes for Teachers
router.get("/teachers", adminController.getTeachers);
router.post("/teachers", adminController.createTeacher);
router.put("/teachers/:teacherId", adminController.updateTeacher);
router.delete("/teachers/:teacherId", adminController.deleteTeacher);
router.post(
  "/teachers/upload",
  upload.single("file"),
  adminController.uploadTeachers,
);

// Routes for Schedules
router.get("/schedules", adminController.getSchedules);
router.post("/schedules", adminController.createSchedule);
router.put("/schedules/:scheduleId", adminController.updateSchedule);
router.delete("/schedules/:scheduleId", adminController.deleteSchedule);

// Routes for Grade Monitoring
router.get("/grade-monitoring", adminController.getGradeMonitoringData);

module.exports = router;
