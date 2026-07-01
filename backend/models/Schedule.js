const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  day: { type: String, required: true },
  startPeriod: { type: Number, required: true },
  endPeriod: { type: Number, required: true },
  room: { type: String, required: true },
  semester: { type: Number, required: true },
  schoolYear: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema);
