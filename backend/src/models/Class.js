const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
    {
        className: {
            type: String,
            required: true,
        },

        grade: {
            type: Number,
            required: true,
        },

        homeroomTeacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
        },

        totalStudents: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Class", classSchema);