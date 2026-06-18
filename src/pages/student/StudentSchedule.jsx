import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Typography, Tag, Spin, Tooltip } from "antd";

const { Title, Text } = Typography;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [
  { id: 1, label: "Period 1", time: "07:00 – 08:30" },
  { id: 2, label: "Period 2", time: "08:45 – 10:15" },
  { id: 3, label: "Period 3", time: "10:30 – 12:00" },
  { id: 4, label: "Period 4", time: "13:00 – 14:30" },
  { id: 5, label: "Period 5", time: "14:45 – 16:15" },
];

const SUBJECT_PALETTE = [
  { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" }, // blue
  { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" }, // green
  { bg: "#FAF5FF", text: "#7C3AED", border: "#DDD6FE" }, // purple
  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" }, // orange
  { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" }, // red/pink
  { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" }, // sky
  { bg: "#F7FEE7", text: "#3F6212", border: "#D9F99D" }, // lime
  { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" }, // amber
];

function StudentSchedule() {
  const { user } = useOutletContext();
  const [schedule, setSchedule] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resStudents, resTeachers, resSchedule] = await Promise.all([
          fetch("https://mindx-mockup-server.vercel.app/api/resources/students?apiKey=69ca789b3bb225ca08190764"),
          fetch("https://mindx-mockup-server.vercel.app/api/resources/teachers?apiKey=69ca789b3bb225ca08190764"),
          fetch("https://mindx-mockup-server.vercel.app/api/resources/schedule?apiKey=69ca789b3bb225ca08190764"),
        ]);
        const [dataStudents, dataTeachers, dataSchedule] = await Promise.all([
          resStudents.json(), resTeachers.json(), resSchedule.json(),
        ]);

        const students = dataStudents.data.data || [];
        const allTeachers = dataTeachers.data.data || [];
        const allSchedule = dataSchedule.data.data || [];

        const currentStudent = students.find(s => Number(s.id) === Number(user?.studentId || user?.id));
        const classSchedule = currentStudent?.class
          ? allSchedule.filter(item => item.class === currentStudent.class)
          : allSchedule;

        setTeachers(allTeachers);
        setSchedule(classSchedule);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Build subject→color map
  const subjectColorMap = {};
  const subjects = [...new Set(schedule.map(s => s.subject))];
  subjects.forEach((subject, i) => {
    subjectColorMap[subject] = SUBJECT_PALETTE[i % SUBJECT_PALETTE.length];
  });

  const getTeacherName = (teacherId) => {
    const t = teachers.find(x => Number(x.id) === Number(teacherId));
    return t?.name || "—";
  };

  const getCellItems = (day, periodId) => {
    return schedule.filter(s => {
      const dayMatch = s.day === day;
      const period = PERIODS.find(p => p.id === periodId);
      const timeMatch = s.time?.includes(periodId.toString()) ||
        s.time?.includes(period?.label) ||
        s.time?.includes(period?.time);
      return dayMatch && timeMatch;
    });
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">My Weekly Schedule</Title>
          <Text style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
            {schedule.length} classes · {subjects.length} subjects
          </Text>
        </div>
        {/* Subject legend */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {subjects.map(subject => {
            const c = subjectColorMap[subject];
            return (
              <Tag key={subject} style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: 600, borderRadius: 6 }}>
                {subject}
              </Tag>
            );
          })}
        </div>
      </div>

      {schedule.length === 0 ? (
        <div className="premium-card" style={{ padding: 60 }}>
          <div className="empty-state">
            <div style={{ fontSize: 64 }}>📅</div>
            <div className="empty-text">No schedule available</div>
            <div className="empty-sub">Your timetable hasn't been set up yet. Check back later.</div>
          </div>
        </div>
      ) : (
        <div className="premium-card" style={{ padding: 20 }}>
          <div className="timetable-wrapper" style={{ boxShadow: "none", border: "none" }}>
            <table className="timetable-grid" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Time</th>
                  {DAYS.map(day => <th key={day}>{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(period => (
                  <tr key={period.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{period.label}</div>
                      <div style={{ fontSize: 10, color: "#94A3B8" }}>{period.time}</div>
                    </td>
                    {DAYS.map(day => {
                      const items = getCellItems(day, period.id);
                      return (
                        <td key={day} style={{ padding: 6 }}>
                          {items.length === 0 ? (
                            <div style={{ height: 68, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <div style={{ width: "100%", height: 4, background: "#F1F5F9", borderRadius: 2 }} />
                            </div>
                          ) : (
                            items.map(item => {
                              const c = subjectColorMap[item.subject] || SUBJECT_PALETTE[0];
                              const teacherName = getTeacherName(item.teacherId);
                              return (
                                <Tooltip key={item._id} title={
                                  <div style={{ fontSize: 12 }}>
                                    <div><b>Subject:</b> {item.subject}</div>
                                    <div><b>Teacher:</b> {teacherName}</div>
                                    <div><b>Room:</b> {item.room || "TBD"}</div>
                                    <div><b>Time:</b> {period.time}</div>
                                  </div>
                                }>
                                  <div className="timetable-cell" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                                    <div className="subject-name">{item.subject}</div>
                                    <div className="teacher-name">{teacherName}</div>
                                    <div className="room-name">{item.room || "Room TBD"}</div>
                                  </div>
                                </Tooltip>
                              );
                            })
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick summary cards */}
      {schedule.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
          {subjects.map(subject => {
            const c = subjectColorMap[subject];
            const classes = schedule.filter(s => s.subject === subject);
            const teacher = getTeacherName(classes[0]?.teacherId);
            return (
              <div key={subject} className="premium-card" style={{ flex: 1, padding: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.text, marginBottom: 8 }} />
                <div style={{ fontWeight: 700, fontSize: 14, color: c.text, marginBottom: 4 }}>{subject}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>👨‍🏫 {teacher}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                  {classes.length} session{classes.length !== 1 ? "s" : ""}/week
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentSchedule;