import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Tag, Spin, Typography, Button } from "antd";
import {
  TeamOutlined, FileTextOutlined, BookOutlined, CalendarOutlined,
  TrophyOutlined, ArrowRightOutlined, ArrowUpOutlined
} from "@ant-design/icons";
import { useOutletContext } from "react-router-dom";

const { Title, Text } = Typography;

function TeacherDashboard() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [stats, setStats]   = useState({ students: 0, scores: 0, materials: 0, classes: 0 });
  const [loading, setLoading] = useState(true);
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studRes, matRes, scRes, schRes] = await Promise.all([
          fetch("https://mindx-mockup-server.vercel.app/api/resources/students?apiKey=69ca789b3bb225ca08190764"),
          fetch("https://mindx-mockup-server.vercel.app/api/resources/materials?apiKey=69ca789b3bb225ca08190764"),
          fetch("https://mindx-mockup-server.vercel.app/api/resources/scores?apiKey=69ca789b3bb225ca08190764"),
          fetch("https://mindx-mockup-server.vercel.app/api/resources/schedule?apiKey=69ca789b3bb225ca08190764"),
        ]);
        const [stud, mat, sc, sch] = await Promise.all([studRes.json(), matRes.json(), scRes.json(), schRes.json()]);

        const allScores   = sc.data.data   || [];
        const allSchedule = sch.data.data  || [];
        const myScores    = allScores.filter(s => s.subject === user?.subject);
        const myClasses   = allSchedule.filter(s => String(s.teacherId) === String(user?.id));
        const uniqueClasses = [...new Set(myClasses.map(c => c.class))];

        setStats({
          students:  stud.data.data?.length || 0,
          materials: mat.data.data?.length  || 0,
          scores:    myScores.length,
          classes:   uniqueClasses.length,
        });

        setUpcomingClasses(myClasses.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div>
      {/* Welcome header */}
      <div style={{
        background: "linear-gradient(135deg, #10B981, #059669)",
        borderRadius: 20, padding: "28px 32px", marginBottom: 28,
        color: "white", position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(16,185,129,0.3)"
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, opacity: 0.1, fontSize: 160 }}>
          <TeamOutlined />
        </div>
        <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 500, marginBottom: 4 }}>TEACHER PORTAL</div>
        <Title level={2} style={{ color: "white", margin: "0 0 8px", fontSize: 26, fontWeight: 800 }}>
          Welcome back, {user?.username || "Teacher"}! 👋
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 15 }}>
          Subject: <Tag color="white" style={{ color: "#059669", fontWeight: 700 }}>{user?.subject || "—"}</Tag>
          · {stats.classes} assigned class{stats.classes !== 1 ? "es" : ""}
        </Text>
      </div>

      {/* Stats */}
      <Row gutter={[20, 20]}>
        {[
          { label: "Total Students", value: stats.students, icon: <TeamOutlined />, color: "#10B981", bg: "#F0FDF4", trend: "School-wide" },
          { label: "Scores Entered", value: stats.scores,   icon: <TrophyOutlined />,  color: "#6366F1", bg: "#EEF2FF", trend: user?.subject },
          { label: "My Classes",     value: stats.classes,  icon: <CalendarOutlined />, color: "#F59E0B", bg: "#FFFBEB", trend: "Assigned by admin" },
          { label: "Materials",      value: stats.materials, icon: <BookOutlined />,    color: "#EF4444", bg: "#FEF2F2", trend: "Uploaded" },
        ].map(card => (
          <Col xs={24} sm={12} lg={6} key={card.label}>
            <div className="stat-card">
              <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.08, fontSize: 100, color: card.color }}>{card.icon}</div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, fontSize: 20, marginBottom: 14 }}>
                {card.icon}
              </div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-trend"><ArrowUpOutlined style={{ fontSize: 11 }} />{card.trend}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Quick Actions + Upcoming */}
      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <div className="premium-card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>⚡ Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Manage Scores",    sub: "View & update grades for your class", to: "/teacher/scores",   color: "#6366F1", bg: "#EEF2FF", icon: <FileTextOutlined /> },
                { label: "My Schedule",      sub: "View your weekly teaching timetable",  to: "/teacher/schedule", color: "#10B981", bg: "#F0FDF4", icon: <CalendarOutlined /> },
                { label: "Upload Students",  sub: "Import student list from Excel",        to: "/teacher/upload",   color: "#F59E0B", bg: "#FFFBEB", icon: <TeamOutlined /> },
                { label: "Manage Materials", sub: "Post learning materials for students",  to: "/teacher/materials",color: "#EF4444", bg: "#FEF2F2", icon: <BookOutlined /> },
              ].map(action => (
                <div key={action.to}
                  onClick={() => navigate(action.to)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                    borderRadius: 12, cursor: "pointer", border: "1px solid var(--color-border)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = action.bg; e.currentTarget.style.borderColor = action.color + "40"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: action.bg, display: "flex", alignItems: "center", justifyContent: "center", color: action.color, fontSize: 18, flexShrink: 0 }}>
                    {action.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>{action.label}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{action.sub}</div>
                  </div>
                  <ArrowRightOutlined style={{ color: "var(--color-text-muted)", fontSize: 12 }} />
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="premium-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>📅 Upcoming Classes</div>
              <Button type="link" size="small" onClick={() => navigate("/teacher/schedule")} style={{ fontSize: 13 }}>View All →</Button>
            </div>
            {upcomingClasses.length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}>
                <div className="empty-icon">📅</div>
                <div className="empty-text">No schedule assigned yet</div>
                <div className="empty-sub">Contact admin to be added to classes.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {upcomingClasses.map((cls, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "#F8FAFC", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Class {cls.class}</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{cls.subject || user?.subject} · {cls.day} · {cls.time}</div>
                    </div>
                    <Tag color="success" style={{ borderRadius: 20, fontWeight: 600 }}>Active</Tag>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default TeacherDashboard;