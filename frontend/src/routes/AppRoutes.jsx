import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "../pages/landing/Landing";
import Login from "../pages/auth/Login";
import ProtectedRoute from "../components/ProtectedRoute";

import AdminLayout from "../layouts/admin/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import ManageAccounts from "../pages/admin/ManageAccounts";
import ManageStudents from "../pages/admin/ManageStudents";
import ManageTeachers from "../pages/admin/ManageTeachers";
import ManageSchedule from "../pages/admin/ManageSchedule";
import GradeMonitoring from "../pages/admin/GradeMonitoring";
import UploadTeachers from "../pages/admin/UploadTeachers";

import TeacherLayout from "../layouts/teacher/TeacherLayout";
import TeacherDashboard from "../pages/teacher/Dashboard";
import ManageScores from "../pages/teacher/ManageScores";
import ManageMaterials from "../pages/teacher/ManageMaterials";
import TeacherSchedule from "../pages/teacher/TeacherSchedule";
import UploadStudents from "../pages/teacher/UploadStudents";

import StudentLayout from "../layouts/student/StudentLayout";
import StudentProfile from "../pages/student/StudentProfile";
import StudentSchedule from "../pages/student/StudentSchedule";
import StudentScores from "../pages/student/StudentScores";
import StudentMaterials from "../pages/student/StudentMaterials";

function AppRoutes({ user, setUser }) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login setUser={setUser} />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} allowedRoles={["admin"]}>
              <AdminLayout setUser={setUser} user={user} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="accounts" element={<ManageAccounts />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="teachers" element={<ManageTeachers />} />
          <Route path="schedule" element={<ManageSchedule />} />
          <Route path="grades" element={<GradeMonitoring />} />
          <Route path="upload-teachers" element={<UploadTeachers />} />
        </Route>

        {/* TEACHER */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute user={user} allowedRoles={["teacher"]}>
              <TeacherLayout user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="scores" element={<ManageScores />} />
          <Route path="materials" element={<ManageMaterials />} />
          <Route path="schedule" element={<TeacherSchedule />} />
          <Route path="upload" element={<UploadStudents />} />
        </Route>

        {/* STUDENT */}
        <Route
          path="/student"
          element={
            <ProtectedRoute user={user} allowedRoles={["student"]}>
              <StudentLayout user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="scores" element={<StudentScores />} />
          <Route path="materials" element={<StudentMaterials />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
