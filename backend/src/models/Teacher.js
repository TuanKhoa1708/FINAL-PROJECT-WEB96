const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  teacherCode: {
    type: String,
    required: true,
  },

  fullName: {
    type: String,
    required: true,
  },

  email: String,
});

module.exports = mongoose.model("Teacher", teacherSchema);