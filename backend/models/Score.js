const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  assignment: { type: Number },
  midterm: { type: Number },
  final: { type: Number },
  average: { type: Number },
  semester: { type: Number, required: true },
  schoolYear: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Score", scoreSchema);
