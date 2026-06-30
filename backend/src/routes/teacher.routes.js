const express = require("express");

const router = express.Router();

const teacherController = require("../controllers/teacher.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

router.get(
    "/schedule",
    authMiddleware,
    roleMiddleware("teacher"),
    teacherController.getSchedule
);

module.exports = router;