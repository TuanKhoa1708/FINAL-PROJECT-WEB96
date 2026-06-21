import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

function StudentProfile() {
  const { user } = useOutletContext();

  const [student, setStudent] = useState(null);
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const resStudents = await fetch(
        "https://mindx-mockup-server.vercel.app/api/resources/students?apiKey=69ca789b3bb225ca08190764"
      );
      const dataStudents = await resStudents.json();
      const students = dataStudents?.data?.data || [];

      const currentStudent = students.find(
        (s) => Number(s.id) === Number(user?.studentId)
      );

      setStudent(currentStudent);

      const resTeachers = await fetch(
        "https://mindx-mockup-server.vercel.app/api/resources/teachers?apiKey=69ca789b3bb225ca08190764"
      );
      const dataTeachers = await resTeachers.json();
      const teachers = dataTeachers?.data?.data || [];

      const homeroomTeacher = teachers.find(
        (t) => Number(t.id) === Number(currentStudent?.homeroomTeacherId)
      );

      setTeacher(homeroomTeacher);
    };

    fetchData();
  }, [user]);

  return (
    <div>
      {/* TITLE */}
      <h1 className="section-title">My Profile</h1>

      {/* CARD */}
      <div
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", gap: 24 }}>

     
          <div
            style={{
              width: 250,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #34d399, #10b981)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                fontWeight: "600",
                border: "6px solid #fff",
                boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
              }}
            >
              {student?.name?.charAt(0)}
            </div>
          </div>


          <div style={{ flex: 1, marginTop: 60, }}>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>
              {student?.name || "N/A"}
            </h2>

            <div
              style={{
                marginTop: 16,
                color: "#666",
                lineHeight: 2,
                fontSize: 15,
              }}
            >
              <div>Class: {student?.class || "N/A"}</div>
              <div>Email: {student?.email || "N/A"}</div>
              <div>
                Homeroom Teacher: {teacher?.name || "N/A"}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default StudentProfile;