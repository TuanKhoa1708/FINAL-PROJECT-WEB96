const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  email: { type: String },
  phone: { type: String },
  specialization: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model("Teacher", teacherSchema);
