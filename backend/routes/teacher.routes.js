const express = require("express");
// const teacherController = require("../controllers/teacher.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

const router = express.Router();

// Teammate will implement these routes. 
// Example:
// router.use(verifyToken);
// router.use(verifyRole("teacher"));
// router.put("/scores/:scoreId", teacherController.updateScore);

module.exports = router;
