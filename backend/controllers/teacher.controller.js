const teacherService = require("../services/teacher.service");
const { sendSuccess, sendError } = require("../utils/response");
const asyncHandler = require("../middlewares/asyncHandler");

const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const stats = await teacherService.getDashboardStats(req.user.id);
    return sendSuccess(
      res,
      stats,
      "Teacher dashboard statistics retrieved successfully",
    );
  } catch (error) {
    return sendError(res, error.message, null, 404);
  }
});

const getStudents = asyncHandler(async (req, res) => {
  try {
    const students = await teacherService.getStudents(req.user.id);
    return sendSuccess(
      res,
      students,
      "Teacher students retrieved successfully",
    );
  } catch (error) {
    return sendError(res, error.message, null, 404);
  }
});

const getSchedule = asyncHandler(async (req, res) => {
  try {
    const schedule = await teacherService.getSchedule(req.user.id);
    return sendSuccess(
      res,
      schedule,
      "Teacher schedule retrieved successfully",
    );
  } catch (error) {
    return sendError(res, error.message, null, 404);
  }
});

const getScores = asyncHandler(async (req, res) => {
  try {
    const scores = await teacherService.getScores(req.user.id);
    return sendSuccess(res, scores, "Teacher scores retrieved successfully");
  } catch (error) {
    return sendError(res, error.message, null, 404);
  }
});

const upsertScore = asyncHandler(async (req, res) => {
  try {
    const score = await teacherService.upsertScore(
      req.user.id,
      req.body,
      req.params.scoreId,
    );
    return sendSuccess(
      res,
      score,
      req.params.scoreId
        ? "Score updated successfully"
        : "Score created successfully",
      req.params.scoreId ? 200 : 201,
    );
  } catch (error) {
    return sendError(res, error.message, null, 400);
  }
});

const getMaterials = asyncHandler(async (req, res) => {
  try {
    const materials = await teacherService.getMaterials(req.user.id);
    return sendSuccess(
      res,
      materials,
      "Teacher materials retrieved successfully",
    );
  } catch (error) {
    return sendError(res, error.message, null, 404);
  }
});

const saveMaterial = asyncHandler(async (req, res) => {
  try {
    const material = await teacherService.saveMaterial(
      req.user.id,
      req.body,
      req.params.materialId,
    );
    return sendSuccess(
      res,
      material,
      req.params.materialId
        ? "Material updated successfully"
        : "Material created successfully",
      req.params.materialId ? 200 : 201,
    );
  } catch (error) {
    return sendError(res, error.message, null, 400);
  }
});

const deleteMaterial = asyncHandler(async (req, res) => {
  try {
    const material = await teacherService.deleteMaterial(
      req.user.id,
      req.params.materialId,
    );
    return sendSuccess(res, material, "Material deleted successfully");
  } catch (error) {
    return sendError(res, error.message, null, 404);
  }
});

module.exports = {
  getDashboardStats,
  getStudents,
  getSchedule,
  getScores,
  upsertScore,
  getMaterials,
  saveMaterial,
  deleteMaterial,
};
