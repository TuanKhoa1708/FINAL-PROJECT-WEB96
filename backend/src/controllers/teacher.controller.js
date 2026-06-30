const teacherService = require("../services/teacher.service");

const getSchedule = async (req, res) => {
    try {
        const schedules = await teacherService.getSchedule(req.user.id);

        return res.status(200).json({
            message: "Get teaching schedule successfully",
            data: schedules,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    getSchedule,
};