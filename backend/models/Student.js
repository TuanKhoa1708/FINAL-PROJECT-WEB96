const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentCode: {
    type: String,
    required: true,
  },

  fullName: {
    type: String,
    required: true,
  },

  email: String,

  className: String,
});

module.exports = mongoose.model("Student", studentSchema);