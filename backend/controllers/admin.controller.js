const adminService = require("../services/admin.service");
const { sendSuccess, sendError } = require("../utils/response");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Controller to get list of students
 */
const getStudents = asyncHandler(async (req, res) => {
  const result = await adminService.getStudents(req.query);
  return sendSuccess(res, result, "Students retrieved successfully");
});

/**
 * Controller to get list of teachers
 */
const getTeachers = asyncHandler(async (req, res) => {
  const result = await adminService.getTeachers(req.query);
  return sendSuccess(res, result, "Teachers retrieved successfully");
});

/**
 * Controller to upload and import teachers via Excel
 */
const uploadTeachers = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, "No file uploaded. Please upload an Excel file.", null, 400);
  }

  const result = await adminService.importTeachersFromExcel(req.file.buffer);
  
  if (result.errorCount > 0 && result.successCount === 0) {
    return sendError(res, "Failed to import teachers", result.errors, 400);
  }

  return sendSuccess(res, result, "Teachers imported process completed");
});

/**
 * Controller to create a schedule
 */
const createSchedule = asyncHandler(async (req, res) => {
  // Add simple validation
  const { classId, teacherId, subjectId, day, startPeriod, endPeriod, room, semester, schoolYear } = req.body;
  if (!classId || !teacherId || !subjectId || !day || !startPeriod || !endPeriod || !room || !semester || !schoolYear) {
    return sendError(res, "Please provide all required schedule fields", null, 400);
  }

  const schedule = await adminService.createSchedule(req.body);
  return sendSuccess(res, schedule, "Schedule created successfully", 201);
});

/**
 * Controller to view student scores
 */
const getStudentScores = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const scores = await adminService.getStudentScores(studentId);
  return sendSuccess(res, scores, "Student scores retrieved successfully");
});

module.exports = {
  getStudents,
  getTeachers,
  uploadTeachers,
  createSchedule,
  getStudentScores
};
