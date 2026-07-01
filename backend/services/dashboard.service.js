const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Schedule = require("../models/Schedule");
const Score = require("../models/Score");

/**
 * Get dashboard statistics
 * @returns {Object} { totalStudents, totalTeachers, totalSchedules, avgGpa }
 */
const getDashboardStats = async () => {
  const [totalStudents, totalTeachers, totalSchedules, allScores] =
    await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Schedule.countDocuments(),
      Score.find({}, "score"),
    ]);

  const avgGpa = allScores.length
    ? (
        allScores.reduce((sum, item) => sum + (Number(item.score) || 0), 0) /
        allScores.length
      ).toFixed(1)
    : "N/A";

  return {
    totalStudents,
    totalTeachers,
    totalSchedules,
    avgGpa,
  };
};

module.exports = {
  getDashboardStats,
};
