const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
        subjectCode: {
            type: String,
            required: true,
        },

        subjectName: {
            type: String,
            required: true,
        },

        credit: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Subject", subjectSchema);