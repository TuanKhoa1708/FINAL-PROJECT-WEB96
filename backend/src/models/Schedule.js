const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  className: String,

  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },

  subject: String,

  room: String,

  day: String,

  startTime: String,

  endTime: String,
});

module.exports = mongoose.model("Schedule", scheduleSchema);