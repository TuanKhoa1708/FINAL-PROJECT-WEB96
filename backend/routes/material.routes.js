const express = require("express");
// const materialController = require("../controllers/material.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

const router = express.Router();

// Teammate will implement these routes. 
// Example:
// router.use(verifyToken);
// router.use(verifyRole("teacher"));
// router.post("/upload", upload.single("file"), materialController.uploadMaterial);

module.exports = router;
