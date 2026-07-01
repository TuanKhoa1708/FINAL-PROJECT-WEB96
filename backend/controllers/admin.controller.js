const adminService = require("../services/admin.service");
const { sendSuccess, sendError } = require("../utils/response");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Controller to get list of accounts
 */
const getAccounts = asyncHandler(async (req, res) => {
  const result = await adminService.getAccounts(req.query);
  return sendSuccess(res, result, "Accounts retrieved successfully");
});

/**
 * Controller to create an account
 */
const createAccount = asyncHandler(async (req, res) => {
  const result = await adminService.createAccount(req.body);
  return sendSuccess(res, result, "Account created successfully", 201);
});

/**
 * Controller to update an account
 */
const updateAccount = asyncHandler(async (req, res) => {
  const { accountId } = req.params;
  const result = await adminService.updateAccount(accountId, req.body);
  return sendSuccess(res, result, "Account updated successfully");
});

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
 * Controller to create a student
 */
const createStudent = asyncHandler(async (req, res) => {
  const result = await adminService.createStudent(req.body);
  return sendSuccess(res, result, "Student created successfully", 201);
});

/**
 * Controller to update a student
 */
const updateStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const result = await adminService.updateStudent(studentId, req.body);
  return sendSuccess(res, result, "Student updated successfully");
});

/**
 * Controller to delete a student
 */
const deleteStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const result = await adminService.deleteStudent(studentId);
  return sendSuccess(res, result, "Student deleted successfully");
});

/**
 * Controller to create a teacher
 */
const createTeacher = asyncHandler(async (req, res) => {
  const result = await adminService.createTeacher(req.body);
  return sendSuccess(res, result, "Teacher created successfully", 201);
});

/**
 * Controller to update a teacher
 */
const updateTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const result = await adminService.updateTeacher(teacherId, req.body);
  return sendSuccess(res, result, "Teacher updated successfully");
});

/**
 * Controller to delete a teacher
 */
const deleteTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const result = await adminService.deleteTeacher(teacherId);
  return sendSuccess(res, result, "Teacher deleted successfully");
});

/**
 * Controller to upload and import teachers via Excel
 */
const uploadTeachers = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(
      res,
      "No file uploaded. Please upload an Excel file.",
      null,
      400,
    );
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
  const {
    classId,
    teacherId,
    subjectId,
    day,
    startPeriod,
    endPeriod,
    room,
    semester,
    schoolYear,
  } = req.body;
  if (
    !classId ||
    !teacherId ||
    !subjectId ||
    !day ||
    !startPeriod ||
    !endPeriod ||
    !room ||
    !semester ||
    !schoolYear
  ) {
    return sendError(
      res,
      "Please provide all required schedule fields",
      null,
      400,
    );
  }

  const schedule = await adminService.createSchedule(req.body);
  return sendSuccess(res, schedule, "Schedule created successfully", 201);
});

/**
 * Controller to get all schedules
 */
const getSchedules = asyncHandler(async (req, res) => {
  const schedules = await adminService.getSchedules();
  return sendSuccess(res, schedules, "Schedules retrieved successfully");
});

/**
 * Controller to update a schedule
 */
const updateSchedule = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;
  const schedule = await adminService.updateSchedule(scheduleId, req.body);
  return sendSuccess(res, schedule, "Schedule updated successfully");
});

/**
 * Controller to delete a schedule
 */
const deleteSchedule = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;
  const schedule = await adminService.deleteSchedule(scheduleId);
  return sendSuccess(res, schedule, "Schedule deleted successfully");
});

/**
 * Controller to get grade monitoring data
 */
const getGradeMonitoringData = asyncHandler(async (req, res) => {
  const result = await adminService.getGradeMonitoringData();
  return sendSuccess(
    res,
    result,
    "Grade monitoring data retrieved successfully",
  );
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
  getAccounts,
  createAccount,
  updateAccount,
  getStudents,
  getTeachers,
  createStudent,
  updateStudent,
  deleteStudent,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  uploadTeachers,
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
  getGradeMonitoringData,
  getStudentScores,
};
