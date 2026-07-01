const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const User = require("../models/User");
const Schedule = require("../models/Schedule");
const Material = require("../models/Material");
const Score = require("../models/Score");
const Subject = require("../models/Subject");

const DAY_ORDER = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

const DEFAULT_SEMESTER = 1;

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const formatTime = (scheduleItem) => {
  const start = Number(scheduleItem.startPeriod);
  const end = Number(scheduleItem.endPeriod);
  if (!Number.isNaN(start) && !Number.isNaN(end)) {
    return `Period ${start} - ${end}`;
  }
  return "—";
};

const findTeacherByUserId = async (userId) => {
  const teacher = await Teacher.findOne({ userId });
  if (teacher) {
    return teacher;
  }

  const user = await User.findById(userId).select("username role referenceId");
  if (!user) {
    throw new Error("Teacher profile not found");
  }

  return {
    _id: user._id,
    userId: user._id,
    teacherId: user.username,
    fullName: user.username,
    specialization: "Math",
    email: "",
    phone: "",
    gender: undefined,
    _fallbackProfile: true,
  };
};

const findTeacherSubject = async (teacher, preferredValue = "") => {
  const queryValue = String(
    preferredValue || teacher?.specialization || "",
  ).trim();
  if (!queryValue) {
    throw new Error("Teacher subject is not configured");
  }

  const subject = await Subject.findOne({
    $or: [
      { subjectName: new RegExp(`^${escapeRegExp(queryValue)}$`, "i") },
      { subjectCode: new RegExp(`^${escapeRegExp(queryValue)}$`, "i") },
    ],
  });

  if (!subject) {
    throw new Error(`Subject not found for "${queryValue}"`);
  }

  return subject;
};

const getTeacherSchedules = async (teacherId) =>
  Schedule.find({ teacherId })
    .populate("classId", "className grade")
    .populate("subjectId", "subjectName subjectCode")
    .sort({ day: 1, startPeriod: 1 });

const normalizeSchedule = (item) => ({
  _id: item._id,
  teacherId: item.teacherId?._id || item.teacherId,
  classId: item.classId?._id || item.classId,
  subjectId: item.subjectId?._id || item.subjectId,
  class: item.classId?.className || item.class || "",
  subject:
    item.subjectId?.subjectName ||
    item.subjectId?.subjectCode ||
    item.subject ||
    "",
  day: item.day,
  time: formatTime(item),
  room: item.room || "",
  startPeriod: item.startPeriod,
  endPeriod: item.endPeriod,
});

const normalizeStudent = (student) => ({
  _id: student._id,
  id: student._id,
  studentId: student.studentId,
  name: student.fullName || student.name || "",
  classId: student.classId?._id || student.classId,
  class: student.classId?.className || student.class || "",
  email: student.email || "",
  phone: student.phone || "",
});

const normalizeScore = (score) => ({
  _id: score._id,
  studentId: score.studentId?._id || score.studentId,
  studentName: score.studentId?.fullName || score.studentName || "",
  class:
    score.studentId?.classId?.className ||
    score.class ||
    score.studentClass ||
    "",
  subject:
    score.subjectId?.subjectName ||
    score.subjectId?.subjectCode ||
    score.subject ||
    "",
  assignment: score.assignment ?? "",
  midterm: score.midterm ?? "",
  final: score.final ?? "",
  score: score.average ?? score.score ?? "",
  semester: score.semester,
  schoolYear: score.schoolYear,
});

const normalizeMaterial = (material) => ({
  _id: material._id,
  title: material.title,
  description: material.description || "",
  fileUrl: material.fileUrl,
  class: material.classId?.className || material.class || "",
  subject:
    material.subjectId?.subjectName ||
    material.subjectId?.subjectCode ||
    material.subject ||
    "",
  teacherName: material.teacherId?.fullName || "",
});

const getDashboardStats = async (userId) => {
  const teacher = await findTeacherByUserId(userId);
  const teacherSchedules = await getTeacherSchedules(teacher._id);

  const [totalStudents, materials, scores] = await Promise.all([
    Student.countDocuments(),
    Material.countDocuments({ teacherId: teacher._id }),
    Score.countDocuments({ teacherId: teacher._id }),
  ]);

  const uniqueClassIds = new Set(
    teacherSchedules.map((item) => String(item.classId?._id || item.classId)),
  );

  const upcomingClasses = teacherSchedules.slice(0, 3).map(normalizeSchedule);

  return {
    students: totalStudents,
    scores,
    materials,
    classes: uniqueClassIds.size,
    upcomingClasses,
  };
};

const getStudents = async (userId) => {
  const teacher = await findTeacherByUserId(userId);
  const teacherSchedules = await getTeacherSchedules(teacher._id);
  const classIds = [
    ...new Set(
      teacherSchedules
        .map((item) => String(item.classId?._id || item.classId))
        .filter(Boolean),
    ),
  ];

  const query = classIds.length ? { classId: { $in: classIds } } : {};
  const students = await Student.find(query).populate(
    "classId",
    "className grade",
  );
  return students.map(normalizeStudent);
};

const getSchedule = async (userId) => {
  const teacher = await findTeacherByUserId(userId);
  const schedules = await getTeacherSchedules(teacher._id);
  return schedules.map(normalizeSchedule);
};

const getScores = async (userId) => {
  const teacher = await findTeacherByUserId(userId);
  const scores = await Score.find({ teacherId: teacher._id })
    .populate({
      path: "studentId",
      select: "fullName studentId classId",
      populate: { path: "classId", select: "className grade" },
    })
    .populate("subjectId", "subjectName subjectCode");

  return scores.map(normalizeScore);
};

const upsertScore = async (userId, payload = {}, scoreId = null) => {
  const teacher = await findTeacherByUserId(userId);
  const studentId = payload.studentId;

  if (!studentId) {
    throw new Error("Student is required");
  }

  const student = await Student.findById(studentId).populate(
    "classId",
    "className grade",
  );
  if (!student) {
    throw new Error("Student not found");
  }

  const subject = await findTeacherSubject(teacher, payload.subject);

  const assignment =
    payload.assignment !== undefined && payload.assignment !== ""
      ? Number(payload.assignment)
      : undefined;
  const midterm =
    payload.midterm !== undefined && payload.midterm !== ""
      ? Number(payload.midterm)
      : undefined;
  const final =
    payload.final !== undefined && payload.final !== ""
      ? Number(payload.final)
      : undefined;
  const scoreValue =
    payload.score !== undefined && payload.score !== ""
      ? Number(payload.score)
      : undefined;

  let average = scoreValue;
  if (average === undefined) {
    const values = [assignment, midterm, final].filter(
      (value) => typeof value === "number" && !Number.isNaN(value),
    );
    if (values.length) {
      average = values.reduce((sum, value) => sum + value, 0) / values.length;
    }
  }

  let score = null;
  if (scoreId) {
    score = await Score.findOne({ _id: scoreId, teacherId: teacher._id });
  } else {
    score = await Score.findOne({
      teacherId: teacher._id,
      studentId: student._id,
      subjectId: subject._id,
    });
  }

  if (!score) {
    score = new Score({
      teacherId: teacher._id,
      studentId: student._id,
      subjectId: subject._id,
      semester: payload.semester || DEFAULT_SEMESTER,
      schoolYear:
        payload.schoolYear ||
        `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    });
  }

  score.teacherId = teacher._id;
  score.studentId = student._id;
  score.subjectId = subject._id;
  if (payload.semester !== undefined) score.semester = payload.semester;
  if (payload.schoolYear !== undefined) score.schoolYear = payload.schoolYear;
  if (assignment !== undefined) score.assignment = assignment;
  if (midterm !== undefined) score.midterm = midterm;
  if (final !== undefined) score.final = final;
  if (average !== undefined && !Number.isNaN(Number(average))) {
    score.average = Number(average);
  }

  await score.save();

  const saved = await Score.findById(score._id)
    .populate({
      path: "studentId",
      select: "fullName studentId classId",
      populate: { path: "classId", select: "className grade" },
    })
    .populate("subjectId", "subjectName subjectCode");

  return normalizeScore(saved);
};

const getMaterials = async (userId) => {
  const teacher = await findTeacherByUserId(userId);
  const materials = await Material.find({ teacherId: teacher._id })
    .populate("classId", "className grade")
    .populate("subjectId", "subjectName subjectCode")
    .populate("teacherId", "fullName")
    .sort({ uploadDate: -1 });

  return materials.map(normalizeMaterial);
};

const saveMaterial = async (userId, payload = {}, materialId = null) => {
  const teacher = await findTeacherByUserId(userId);
  const schedules = await getTeacherSchedules(teacher._id);
  const primarySchedule = schedules[0];
  const subject = await findTeacherSubject(teacher, payload.subject);
  const classId =
    payload.classId ||
    primarySchedule?.classId?._id ||
    primarySchedule?.classId;

  if (!classId) {
    throw new Error("Teacher has no assigned class for this material");
  }

  let material = null;
  if (materialId) {
    material = await Material.findOne({
      _id: materialId,
      teacherId: teacher._id,
    });
  }

  if (!material) {
    material = new Material({
      teacherId: teacher._id,
      classId,
      subjectId: subject._id,
    });
  }

  if (payload.title !== undefined) material.title = payload.title;
  if (payload.description !== undefined)
    material.description = payload.description;
  if (payload.fileUrl !== undefined) material.fileUrl = payload.fileUrl;
  material.teacherId = teacher._id;
  material.classId = classId;
  material.subjectId = subject._id;

  await material.save();

  const saved = await Material.findById(material._id)
    .populate("classId", "className grade")
    .populate("subjectId", "subjectName subjectCode")
    .populate("teacherId", "fullName");

  return normalizeMaterial(saved);
};

const deleteMaterial = async (userId, materialId) => {
  const teacher = await findTeacherByUserId(userId);
  const material = await Material.findOneAndDelete({
    _id: materialId,
    teacherId: teacher._id,
  });

  if (!material) {
    throw new Error("Material not found");
  }

  return normalizeMaterial(material);
};

module.exports = {
  getDashboardStats,
  getStudents,
  getSchedule,
  getScores,
  upsertScore,
  getMaterials,
  saveMaterial,
  deleteMaterial,
};
