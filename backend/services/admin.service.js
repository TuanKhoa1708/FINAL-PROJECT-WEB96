const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const User = require("../models/User");
const Schedule = require("../models/Schedule");
const Score = require("../models/Score");
const { parseExcel } = require("../utils/excelParser");
const bcrypt = require("bcrypt");

/**
 * Get a list of all students with optional filters and pagination
 */
const getStudents = async (query = {}) => {
  const { page = 1, limit = 10, ...filters } = query;
  const skip = (page - 1) * limit;

  const students = await Student.find(filters)
    .skip(skip)
    .limit(Number(limit))
    .populate("classId", "className grade");
  
  const total = await Student.countDocuments(filters);

  return {
    students,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Get a list of all teachers with optional filters and pagination
 */
const getTeachers = async (query = {}) => {
  const { page = 1, limit = 10, ...filters } = query;
  const skip = (page - 1) * limit;

  const teachers = await Teacher.find(filters)
    .skip(skip)
    .limit(Number(limit));
  
  const total = await Teacher.countDocuments(filters);

  return {
    teachers,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Import teachers from an Excel file
 * Creates a User account (default pass: 123456) and a Teacher record.
 */
const importTeachersFromExcel = async (fileBuffer) => {
  const data = parseExcel(fileBuffer);
  const defaultPassword = await bcrypt.hash("123456", 10);
  
  const createdTeachers = [];
  const errors = [];

  for (const [index, row] of data.entries()) {
    try {
      // Validate required fields based on schema expectations
      if (!row.teacherId || !row.fullName) {
        errors.push(`Row ${index + 2}: Missing required fields (teacherId or fullName).`);
        continue;
      }

      // Check if teacher already exists
      const existingTeacher = await Teacher.findOne({ teacherId: row.teacherId });
      if (existingTeacher) {
        errors.push(`Row ${index + 2}: Teacher with ID ${row.teacherId} already exists.`);
        continue;
      }

      // 1. Create User account for Teacher
      const user = new User({
        username: row.teacherId, // Using teacherId as username by default
        password: defaultPassword,
        role: "teacher"
      });
      await user.save();

      // 2. Create Teacher record
      const teacher = new Teacher({
        teacherId: row.teacherId,
        fullName: row.fullName,
        gender: row.gender,
        email: row.email,
        phone: row.phone,
        specialization: row.specialization,
        userId: user._id
      });
      await teacher.save();

      // 3. Update User referenceId
      user.referenceId = teacher._id;
      await user.save();

      createdTeachers.push(teacher);
    } catch (error) {
      errors.push(`Row ${index + 2}: Failed to process. ${error.message}`);
    }
  }

  return {
    totalProcessed: data.length,
    successCount: createdTeachers.length,
    errorCount: errors.length,
    errors
  };
};

/**
 * Create a new teaching schedule
 */
const createSchedule = async (scheduleData) => {
  const schedule = new Schedule(scheduleData);
  await schedule.save();
  return schedule;
};

/**
 * Get scores for a specific student
 */
const getStudentScores = async (studentId) => {
  // studentId here is the ObjectId of the Student
  const scores = await Score.find({ studentId })
    .populate("subjectId", "subjectCode subjectName credit")
    .populate("teacherId", "fullName");
  return scores;
};

module.exports = {
  getStudents,
  getTeachers,
  importTeachersFromExcel,
  createSchedule,
  getStudentScores
};
