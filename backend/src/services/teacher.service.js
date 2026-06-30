const Schedule = require("../models/Schedule");
const User = require("../models/User");
const Score = require("../models/Score");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Material = require("../models/Material");
const xlsx = require("xlsx");

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

const getClasses = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const schedules = await Schedule.find({ teacherId: user.referenceId }).populate("classId").lean();
    
    const classMap = new Map();
    for (const schedule of schedules) {
        if (schedule.classId && !classMap.has(schedule.classId._id.toString())) {
            classMap.set(schedule.classId._id.toString(), schedule.classId);
        }
    }

    return Array.from(classMap.values());
};

const updateScores = async (userId, payload) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const { subjectId, semester, schoolYear, scores } = payload;
    const teacherId = user.referenceId;

    const updatedScores = [];

    for (const scoreData of scores) {
        const { studentId, assignment, midterm, final } = scoreData;

        const assignmentScore = parseFloat(assignment) || 0;
        const midtermScore = parseFloat(midterm) || 0;
        const finalScore = parseFloat(final) || 0;

        const average = (assignmentScore + midtermScore * 2 + finalScore * 3) / 6;

        const query = {
            studentId,
            subjectId,
            semester,
            schoolYear,
        };

        const update = {
            teacherId,
            assignment: assignmentScore,
            midterm: midtermScore,
            final: finalScore,
            average: parseFloat(average.toFixed(2)),
        };

        const updatedScore = await Score.findOneAndUpdate(query, update, {
            new: true,
            upsert: true,
        });

        updatedScores.push(updatedScore);
    }

    return updatedScores;
};

const uploadStudents = async (classId, fileBuffer) => {
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const studentsData = xlsx.utils.sheet_to_json(sheet);

    let addedCount = 0;

    for (const data of studentsData) {
        const studentIdStr = data.studentId || data.StudentId || data["Student ID"] || data["Mã HS"];
        if (!studentIdStr) continue;

        const fullName = data.fullName || data.FullName || data["Full Name"] || data["Họ và tên"] || "Unknown";
        
        const existingStudent = await Student.findOne({ studentId: studentIdStr });
        if (!existingStudent) {
            await Student.create({
                studentId: studentIdStr.toString(),
                fullName: fullName,
                gender: data.gender || data.Gender || data["Giới tính"],
                dob: data.dob || data.DOB || data["Ngày sinh"],
                email: data.email || data.Email || data["Email"],
                phone: data.phone || data.Phone || data["SĐT"],
                classId: classId,
            });
            addedCount++;
        }
    }

    if (addedCount > 0) {
        await Class.findByIdAndUpdate(classId, {
            $inc: { totalStudents: addedCount }
        });
    }

    return addedCount;
};

const uploadMaterial = async (userId, data, file) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const { title, description, classId, subjectId } = data;
    const fileUrl = `/uploads/materials/${file.filename}`;

    const material = await Material.create({
        title,
        description,
        subjectId,
        teacherId: user.referenceId,
        classId,
        fileUrl,
    });

    return material;
};

module.exports = {
    getSchedule,
    getClasses,
    updateScores,
    uploadStudents,
    uploadMaterial,
};