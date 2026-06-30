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

const getClasses = async (req, res) => {
    try {
        const classes = await teacherService.getClasses(req.user.id);

        return res.status(200).json({
            message: "Get teaching classes successfully",
            data: classes,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

const updateScores = async (req, res) => {
    try {
        const scores = await teacherService.updateScores(req.user.id, req.body);

        return res.status(200).json({
            message: "Scores updated successfully",
            data: scores,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

const uploadStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const { classId } = req.params;
        const addedCount = await teacherService.uploadStudents(classId, req.file.buffer);

        return res.status(200).json({
            message: "Students uploaded successfully",
            data: { addedCount },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

const uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const material = await teacherService.uploadMaterial(req.user.id, req.body, req.file);

        return res.status(200).json({
            message: "Material uploaded successfully",
            data: material,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    getSchedule,
    getClasses,
    updateScores,
    uploadStudents,
    uploadMaterial,
};