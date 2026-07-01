const Student = require("../models/Student");
const Score = require("../models/Score");
const Schedule = require("../models/Schedule");
const Material = require("../models/Material");

/**
 * Get student profile by userId
 * @param {String} userId 
 */
const getProfile = async (userId) => {
  const student = await Student.findOne({ userId }).populate("classId", "className grade");
  if (!student) {
    throw new Error("Student profile not found");
  }
  return student;
};

/**
 * Get student scores
 * @param {String} studentId - ObjectId of the Student
 */
const getScores = async (studentId) => {
  const scores = await Score.find({ studentId })
    .populate("subjectId", "subjectCode subjectName credit")
    .populate("teacherId", "fullName");
  return scores;
};

/**
 * Get student schedule by classId
 * @param {String} classId - ObjectId of the Class
 */
const getSchedule = async (classId) => {
  const schedule = await Schedule.find({ classId })
    .populate("subjectId", "subjectCode subjectName")
    .populate("teacherId", "fullName");
  return schedule;
};

/**
 * Get student materials by classId
 * @param {String} classId - ObjectId of the Class
 */
const getMaterials = async (classId) => {
  const materials = await Material.find({ classId })
    .populate("subjectId", "subjectName")
    .populate("teacherId", "fullName")
    .sort({ uploadDate: -1 });
  return materials;
};

module.exports = {
  getProfile,
  getScores,
  getSchedule,
  getMaterials
};
