const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  subject: {
    type: String,
    required: true,
  },

  score15m: {
    type: Number,
    default: 0,
  },

  scoreMid: {
    type: Number,
    default: 0,
  },

  scoreFinal: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Score", scoreSchema);