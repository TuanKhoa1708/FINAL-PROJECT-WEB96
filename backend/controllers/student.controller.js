const studentService = require("../services/student.service");
const { sendSuccess, sendError } = require("../utils/response");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Controller to get student profile
 */
const getProfile = asyncHandler(async (req, res) => {
  try {
    const student = await studentService.getProfile(req.user.id);
    return sendSuccess(res, student, "Student profile retrieved successfully");
  } catch (error) {
    return sendError(res, error.message, null, 404);
  }
});

/**
 * Controller to get student scores
 */
const getScores = asyncHandler(async (req, res) => {
  try {
    const student = await studentService.getProfile(req.user.id);
    const scores = await studentService.getScores(student._id);
    return sendSuccess(res, scores, "Student scores retrieved successfully");
  } catch (error) {
    return sendError(res, error.message, null, 404);
  }
});

/**
 * Controller to get student schedule
 */
const getSchedule = asyncHandler(async (req, res) => {
  try {
    const student = await studentService.getProfile(req.user.id);
    if (!student.classId) {
      return sendError(res, "Student is not assigned to any class", null, 400);
    }
    const schedule = await studentService.getSchedule(student.classId);
    return sendSuccess(res, schedule, "Student schedule retrieved successfully");
  } catch (error) {
    return sendError(res, error.message, null, 404);
  }
});

/**
 * Controller to get student materials
 */
const getMaterials = asyncHandler(async (req, res) => {
  try {
    const student = await studentService.getProfile(req.user.id);
    if (!student.classId) {
      return sendError(res, "Student is not assigned to any class", null, 400);
    }
    const materials = await studentService.getMaterials(student.classId);
    return sendSuccess(res, materials, "Student materials retrieved successfully");
  } catch (error) {
    return sendError(res, error.message, null, 404);
  }
});

module.exports = {
  getProfile,
  getScores,
  getSchedule,
  getMaterials
};
