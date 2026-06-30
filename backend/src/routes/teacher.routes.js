const express = require("express");

const router = express.Router();

const teacherController = require("../controllers/teacher.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { uploadExcel, uploadMaterial } = require("../middleware/upload.middleware");

router.get(
    "/schedule",
    authMiddleware,
    roleMiddleware("teacher"),
    teacherController.getSchedule
);

router.get(
    "/classes",
    authMiddleware,
    roleMiddleware("teacher"),
    teacherController.getClasses
);

router.post(
    "/scores",
    authMiddleware,
    roleMiddleware("teacher"),
    teacherController.updateScores
);

router.post(
    "/classes/:classId/students/upload",
    authMiddleware,
    roleMiddleware("teacher"),
    uploadExcel.single("file"),
    teacherController.uploadStudents
);

router.post(
    "/materials",
    authMiddleware,
    roleMiddleware("teacher"),
    uploadMaterial.single("file"),
    teacherController.uploadMaterial
);

module.exports = router;