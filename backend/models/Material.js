const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  title: String,

  description: String,

  fileUrl: String,

  className: String,

  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Material", materialSchema);