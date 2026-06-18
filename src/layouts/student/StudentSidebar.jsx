import { Menu } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  FileTextOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

function StudentSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: "account",
      label: <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>Account</span>,
      type: "group",
      children: [
        { key: "/student/profile", icon: <UserOutlined />, label: "My Profile" },
      ],
    },
    {
      key: "academics",
      label: <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>Academics</span>,
      type: "group",
      children: [
        { key: "/student/schedule",  icon: <CalendarOutlined />,  label: "My Schedule" },
        { key: "/student/scores",    icon: <FileTextOutlined />,  label: "My Grades" },
        { key: "/student/materials", icon: <BookOutlined />,      label: "Materials" },
      ],
    },
  ];

  return (
    <div
      style={{
        width: 260,
        background: "var(--color-surface)",
        padding: "20px 0",
        boxShadow: "var(--shadow-md)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, padding: "0 20px" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "white",
          boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
        }}>
          <ReadOutlined style={{ fontSize: 18 }} />
        </div>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--color-text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Akademi
          </h1>
          <div style={{ fontSize: 10, color: "var(--color-text-muted)", fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>Student Portal</div>
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: "none", flex: 1, paddingLeft: 8, paddingRight: 8 }}
        theme="light"
      />
    </div>
  );
}

export default StudentSidebar;