const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

/**
 * Get dashboard statistics
 * @returns {Object} { totalStudents, totalTeachers }
 */
const getDashboardStats = async () => {
  const [totalStudents, totalTeachers] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments()
  ]);

  return {
    totalStudents,
    totalTeachers
  };
};

module.exports = {
  getDashboardStats
};
