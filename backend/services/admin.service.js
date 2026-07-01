const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const User = require("../models/User");
const Schedule = require("../models/Schedule");
const Score = require("../models/Score");
const Subject = require("../models/Subject");
const { parseExcel } = require("../utils/excelParser");
const bcrypt = require("bcrypt");

const DEFAULT_PASSWORD = "123456";
const ACCOUNT_ROLES = ["admin", "teacher", "student"];

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  return fallback;
};

const sanitizeAccount = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    referenceId: user.referenceId || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const generateUniqueId = (prefix) =>
  `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;

const getDefaultPasswordHash = async () => bcrypt.hash(DEFAULT_PASSWORD, 10);

const extractClassGrade = (className) => {
  const match = normalizeString(className).match(/\d{1,2}/);
  return match ? Number(match[0]) : 10;
};

const findOrCreateClass = async (className) => {
  const normalizedClassName = normalizeString(className);
  if (!normalizedClassName) {
    throw new Error("Class is required");
  }

  let classDoc = await Class.findOne({ className: normalizedClassName });
  if (!classDoc) {
    classDoc = await Class.create({
      className: normalizedClassName,
      grade: extractClassGrade(normalizedClassName),
    });
  }

  return classDoc;
};

const findStudent = async (studentId) =>
  Student.findOne({ $or: [{ _id: studentId }, { studentId }] }).populate(
    "classId",
    "className grade",
  );

const findTeacher = async (teacherId) =>
  Teacher.findOne({ $or: [{ _id: teacherId }, { teacherId }] });

const findSubject = async (subjectValue) => {
  const normalized = normalizeString(subjectValue);
  if (!normalized) {
    throw new Error("Subject is required");
  }

  const subject = await Subject.findOne({
    $or: [
      {
        subjectName: new RegExp(
          `^${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i",
        ),
      },
      {
        subjectCode: new RegExp(
          `^${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i",
        ),
      },
    ],
  });

  if (!subject) {
    throw new Error(`Subject not found for "${normalized}"`);
  }

  return subject;
};

const normalizeSchedule = (schedule) => ({
  _id: schedule._id,
  classId: schedule.classId?._id || schedule.classId,
  teacherId: schedule.teacherId?._id || schedule.teacherId,
  subjectId: schedule.subjectId?._id || schedule.subjectId,
  class: schedule.classId?.className || schedule.class || "",
  subject:
    schedule.subjectId?.subjectName ||
    schedule.subjectId?.subjectCode ||
    schedule.subject ||
    "",
  day: schedule.day,
  startPeriod: schedule.startPeriod,
  endPeriod: schedule.endPeriod,
  time:
    schedule.time ||
    `Period ${schedule.startPeriod} (${schedule.startPeriod} - ${schedule.endPeriod})`,
  room: schedule.room || "",
  semester: schedule.semester,
  schoolYear: schedule.schoolYear,
});

const parsePeriodFromTime = (timeValue) => {
  if (!timeValue) return null;
  const match = String(timeValue).match(/Period\s*(\d+)/i);
  return match ? Number(match[1]) : null;
};

const getSchedules = async () => {
  const schedules = await Schedule.find()
    .populate("classId", "className grade")
    .populate("teacherId", "fullName teacherId specialization")
    .populate("subjectId", "subjectName subjectCode")
    .sort({ day: 1, startPeriod: 1 });

  return schedules.map(normalizeSchedule);
};

const createOrUpdateSchedulePayload = async (scheduleData = {}) => {
  const className = normalizeString(
    scheduleData.class || scheduleData.className,
  );
  const teacherId = normalizeString(
    scheduleData.teacherId || scheduleData.teacher,
  );
  const subjectValue = normalizeString(
    scheduleData.subject ||
      scheduleData.subjectName ||
      scheduleData.subjectCode,
  );
  const day = normalizeString(scheduleData.day);
  const room = normalizeString(scheduleData.room);

  if (!className) throw new Error("Class is required");
  if (!teacherId) throw new Error("Teacher is required");
  if (!day) throw new Error("Day is required");
  if (!room) throw new Error("Room is required");

  const period =
    parsePeriodFromTime(scheduleData.time) ||
    Number(scheduleData.startPeriod) ||
    1;
  const classDoc = await findOrCreateClass(className);
  const teacherDoc = await findTeacher(teacherId);
  if (!teacherDoc) {
    throw new Error("Teacher not found");
  }
  const subjectDoc = await findSubject(subjectValue);

  return {
    classId: classDoc._id,
    teacherId: teacherDoc._id,
    subjectId: subjectDoc._id,
    day,
    startPeriod: period,
    endPeriod: Number(scheduleData.endPeriod) || period,
    room,
    semester: Number(scheduleData.semester) || 1,
    schoolYear:
      normalizeString(scheduleData.schoolYear) ||
      `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  };
};

/**
 * Get a list of all students with optional filters and pagination
 */
const getStudents = async (query = {}) => {
  const { page = 1, limit = 10, ...filters } = query;
  const skip = (page - 1) * limit;

  const students = await Student.find(filters)
    .skip(skip)
    .limit(Number(limit))
    .populate("classId", "className grade");

  const total = await Student.countDocuments(filters);

  return {
    students,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get a list of all teachers with optional filters and pagination
 */
const getTeachers = async (query = {}) => {
  const { page = 1, limit = 10, ...filters } = query;
  const skip = (page - 1) * limit;

  const teachers = await Teacher.find(filters).skip(skip).limit(Number(limit));

  const total = await Teacher.countDocuments(filters);

  return {
    teachers,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get a list of all accounts with optional filters and pagination
 */
const getAccounts = async (query = {}) => {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const accounts = await User.find({})
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments({});

  return {
    accounts: accounts.map(sanitizeAccount),
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Create a new account for admin management
 */
const createAccount = async (accountData = {}) => {
  const username = normalizeString(accountData.username);
  const password = normalizeString(accountData.password);
  const role = normalizeString(accountData.role).toLowerCase();
  const email = normalizeString(accountData.email);
  const fullName = normalizeString(accountData.fullName || accountData.name);
  const specialization = normalizeString(
    accountData.specialization || accountData.subject,
  );

  if (!username) {
    throw new Error("Username is required");
  }

  if (!password) {
    throw new Error("Password is required");
  }

  if (!ACCOUNT_ROLES.includes(role)) {
    throw new Error("Role is required");
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error(`Account with username ${username} already exists`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const account = await User.create({
    username,
    password: hashedPassword,
    role,
    isActive: parseBoolean(accountData.isActive, true),
  });

  if (role === "teacher") {
    const teacher = await Teacher.create({
      teacherId: accountData.teacherId || username,
      fullName: fullName || username,
      email,
      specialization: specialization || "Math",
      userId: account._id,
    });

    account.referenceId = teacher._id;
    await account.save();
  }

  return sanitizeAccount(account);
};

/**
 * Update an existing account without allowing username changes
 */
const updateAccount = async (accountId, accountData = {}) => {
  const account = await User.findById(accountId);
  if (!account) {
    throw new Error("Account not found");
  }

  if (accountData.username !== undefined) {
    const nextUsername = normalizeString(accountData.username);
    if (nextUsername && nextUsername !== account.username) {
      throw new Error("Username cannot be changed");
    }
  }

  if (accountData.password !== undefined) {
    const nextPassword = normalizeString(accountData.password);
    if (nextPassword) {
      account.password = await bcrypt.hash(nextPassword, 10);
    }
  }

  if (accountData.role !== undefined) {
    const nextRole = normalizeString(accountData.role).toLowerCase();
    if (!ACCOUNT_ROLES.includes(nextRole)) {
      throw new Error("Role is required");
    }
    account.role = nextRole;
  }

  if (accountData.isActive !== undefined) {
    account.isActive = parseBoolean(accountData.isActive, account.isActive);
  }

  if (account.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: account._id });
    if (teacher) {
      const nextSpecialization = normalizeString(
        accountData.specialization || accountData.subject,
      );
      const nextFullName = normalizeString(
        accountData.fullName || accountData.name,
      );
      const nextEmail = normalizeString(accountData.email);

      if (nextFullName) {
        teacher.fullName = nextFullName;
      }
      if (nextSpecialization) {
        teacher.specialization = nextSpecialization;
      }
      if (accountData.email !== undefined) {
        teacher.email = nextEmail;
      }

      await teacher.save();
      account.referenceId = teacher._id;
    }
  }

  await account.save();
  return sanitizeAccount(account);
};

/**
 * Import teachers from an Excel file
 * Creates a User account (default pass: 123456) and a Teacher record.
 */
const importTeachersFromExcel = async (fileBuffer) => {
  const data = parseExcel(fileBuffer);
  const defaultPassword = await bcrypt.hash("123456", 10);

  const createdTeachers = [];
  const errors = [];

  for (const [index, row] of data.entries()) {
    try {
      // Validate required fields based on schema expectations
      if (!row.teacherId || !row.fullName) {
        errors.push(
          `Row ${index + 2}: Missing required fields (teacherId or fullName).`,
        );
        continue;
      }

      // Check if teacher already exists
      const existingTeacher = await Teacher.findOne({
        teacherId: row.teacherId,
      });
      if (existingTeacher) {
        errors.push(
          `Row ${index + 2}: Teacher with ID ${row.teacherId} already exists.`,
        );
        continue;
      }

      // 1. Create User account for Teacher
      const user = new User({
        username: row.teacherId, // Using teacherId as username by default
        password: defaultPassword,
        role: "teacher",
      });
      await user.save();

      // 2. Create Teacher record
      const teacher = new Teacher({
        teacherId: row.teacherId,
        fullName: row.fullName,
        gender: row.gender,
        email: row.email,
        phone: row.phone,
        specialization: row.specialization,
        userId: user._id,
      });
      await teacher.save();

      // 3. Update User referenceId
      user.referenceId = teacher._id;
      await user.save();

      createdTeachers.push(teacher);
    } catch (error) {
      errors.push(`Row ${index + 2}: Failed to process. ${error.message}`);
    }
  }

  return {
    totalProcessed: data.length,
    successCount: createdTeachers.length,
    errorCount: errors.length,
    errors,
  };
};

const createStudent = async (studentData = {}) => {
  const fullName = normalizeString(studentData.fullName || studentData.name);
  const className = normalizeString(studentData.class || studentData.className);
  const email = normalizeString(studentData.email);

  if (!fullName) {
    throw new Error("Student name is required");
  }

  if (!className) {
    throw new Error("Class is required");
  }

  const studentId =
    normalizeString(studentData.studentId) || generateUniqueId("STU");
  const existingStudent = await Student.findOne({ studentId });
  if (existingStudent) {
    throw new Error(`Student with ID ${studentId} already exists`);
  }

  const classDoc = await findOrCreateClass(className);
  const password = await getDefaultPasswordHash();

  const user = await User.create({
    username: studentId,
    password,
    role: "student",
  });

  const student = await Student.create({
    studentId,
    fullName,
    gender: studentData.gender,
    dob: studentData.dob || undefined,
    email,
    phone: studentData.phone,
    classId: classDoc._id,
    userId: user._id,
  });

  user.referenceId = student._id;
  await user.save();

  return Student.findById(student._id).populate("classId", "className grade");
};

const updateStudent = async (studentId, studentData = {}) => {
  const student = await findStudent(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  if (studentData.name !== undefined || studentData.fullName !== undefined) {
    const fullName = normalizeString(studentData.fullName || studentData.name);
    if (fullName) student.fullName = fullName;
  }

  if (studentData.email !== undefined) {
    student.email = normalizeString(studentData.email);
  }

  if (studentData.phone !== undefined) {
    student.phone = normalizeString(studentData.phone);
  }

  if (studentData.gender !== undefined) {
    student.gender = normalizeString(studentData.gender) || studentData.gender;
  }

  if (studentData.dob !== undefined) {
    student.dob = studentData.dob || undefined;
  }

  const className = normalizeString(studentData.class || studentData.className);
  if (className) {
    const classDoc = await findOrCreateClass(className);
    student.classId = classDoc._id;
  }

  await student.save();
  return Student.findById(student._id).populate("classId", "className grade");
};

const deleteStudent = async (studentId) => {
  const student = await findStudent(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  if (student.userId) {
    await User.findByIdAndDelete(student.userId);
  }

  await Student.findByIdAndDelete(student._id);
  return student;
};

const createTeacher = async (teacherData = {}) => {
  const fullName = normalizeString(teacherData.fullName || teacherData.name);
  const specialization = normalizeString(
    teacherData.specialization || teacherData.subject,
  );
  const email = normalizeString(teacherData.email);

  if (!fullName) {
    throw new Error("Teacher name is required");
  }

  if (!specialization) {
    throw new Error("Subject is required");
  }

  const teacherId =
    normalizeString(teacherData.teacherId) || generateUniqueId("TCH");
  const existingTeacher = await Teacher.findOne({ teacherId });
  if (existingTeacher) {
    throw new Error(`Teacher with ID ${teacherId} already exists`);
  }

  const password = await getDefaultPasswordHash();
  const user = await User.create({
    username: teacherId,
    password,
    role: "teacher",
  });

  const teacher = await Teacher.create({
    teacherId,
    fullName,
    gender: teacherData.gender,
    email,
    phone: teacherData.phone,
    specialization,
    userId: user._id,
  });

  user.referenceId = teacher._id;
  await user.save();

  return teacher;
};

const updateTeacher = async (teacherId, teacherData = {}) => {
  const teacher = await findTeacher(teacherId);
  if (!teacher) {
    throw new Error("Teacher not found");
  }

  if (teacherData.name !== undefined || teacherData.fullName !== undefined) {
    const fullName = normalizeString(teacherData.fullName || teacherData.name);
    if (fullName) teacher.fullName = fullName;
  }

  if (
    teacherData.subject !== undefined ||
    teacherData.specialization !== undefined
  ) {
    const specialization = normalizeString(
      teacherData.specialization || teacherData.subject,
    );
    if (specialization) teacher.specialization = specialization;
  }

  if (teacherData.email !== undefined) {
    teacher.email = normalizeString(teacherData.email);
  }

  if (teacherData.phone !== undefined) {
    teacher.phone = normalizeString(teacherData.phone);
  }

  if (teacherData.gender !== undefined) {
    teacher.gender = normalizeString(teacherData.gender) || teacherData.gender;
  }

  await teacher.save();
  return teacher;
};

const deleteTeacher = async (teacherId) => {
  const teacher = await findTeacher(teacherId);
  if (!teacher) {
    throw new Error("Teacher not found");
  }

  if (teacher.userId) {
    await User.findByIdAndDelete(teacher.userId);
  }

  await Teacher.findByIdAndDelete(teacher._id);
  return teacher;
};

/**
 * Create a new teaching schedule
 */
const createSchedule = async (scheduleData) => {
  const payload = await createOrUpdateSchedulePayload(scheduleData);
  const schedule = await Schedule.create(payload);
  const populated = await Schedule.findById(schedule._id)
    .populate("classId", "className grade")
    .populate("teacherId", "fullName teacherId specialization")
    .populate("subjectId", "subjectName subjectCode");
  return normalizeSchedule(populated);
};

const updateSchedule = async (scheduleId, scheduleData = {}) => {
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throw new Error("Schedule not found");
  }

  const payload = await createOrUpdateSchedulePayload({
    ...schedule.toObject(),
    ...scheduleData,
  });

  schedule.classId = payload.classId;
  schedule.teacherId = payload.teacherId;
  schedule.subjectId = payload.subjectId;
  schedule.day = payload.day;
  schedule.startPeriod = payload.startPeriod;
  schedule.endPeriod = payload.endPeriod;
  schedule.room = payload.room;
  schedule.semester = payload.semester;
  schedule.schoolYear = payload.schoolYear;
  await schedule.save();

  const populated = await Schedule.findById(schedule._id)
    .populate("classId", "className grade")
    .populate("teacherId", "fullName teacherId specialization")
    .populate("subjectId", "subjectName subjectCode");
  return normalizeSchedule(populated);
};

const deleteSchedule = async (scheduleId) => {
  const schedule = await Schedule.findByIdAndDelete(scheduleId);
  if (!schedule) {
    throw new Error("Schedule not found");
  }
  return normalizeSchedule(schedule);
};

const getGradeMonitoringData = async () => {
  const [students, scores] = await Promise.all([
    Student.find().populate("classId", "className grade"),
    Score.find()
      .populate({
        path: "studentId",
        select: "fullName studentId classId",
        populate: { path: "classId", select: "className grade" },
      })
      .populate("subjectId", "subjectName subjectCode")
      .populate("teacherId", "fullName teacherId"),
  ]);

  return {
    students: students.map((student) => ({
      _id: student._id,
      id: student._id,
      name: student.fullName,
      class: student.classId?.className || "",
      email: student.email || "",
    })),
    scores: scores.map((score) => ({
      _id: score._id,
      studentId: score.studentId?._id || score.studentId,
      studentName: score.studentId?.fullName || "",
      class: score.studentId?.classId?.className || "",
      subject:
        score.subjectId?.subjectName || score.subjectId?.subjectCode || "",
      score: score.average ?? score.score ?? "",
      semester: score.semester,
      schoolYear: score.schoolYear,
    })),
  };
};

/**
 * Get scores for a specific student
 */
const getStudentScores = async (studentId) => {
  // studentId here is the ObjectId of the Student
  const scores = await Score.find({ studentId })
    .populate("subjectId", "subjectCode subjectName credit")
    .populate("teacherId", "fullName");
  return scores;
};

module.exports = {
  getAccounts,
  createAccount,
  updateAccount,
  getStudents,
  getTeachers,
  importTeachersFromExcel,
  createStudent,
  updateStudent,
  deleteStudent,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getGradeMonitoringData,
  getStudentScores,
};
