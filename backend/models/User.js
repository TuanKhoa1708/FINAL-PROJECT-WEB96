const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'roleRef' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.virtual('roleRef').get(function() {
  if (this.role === 'teacher') return 'Teacher';
  if (this.role === 'student') return 'Student';
  return null; // admin doesn't necessarily have a reference, or could be 'Admin'
});

module.exports = mongoose.model("User", userSchema);
