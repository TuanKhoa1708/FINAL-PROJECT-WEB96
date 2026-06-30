const Schedule = require("../models/Schedule");
const User = require("../models/User");

const getSchedule = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const schedules = await Schedule.find({
        teacherId: user.referenceId,
    })
        .populate("classId")
        .populate("subjectId")
        .sort({
            day: 1,
            startPeriod: 1,
        });

    return schedules;
};