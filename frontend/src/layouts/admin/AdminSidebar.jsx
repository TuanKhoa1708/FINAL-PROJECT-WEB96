import { Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  ReadOutlined,
  TrophyOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      type: "divider",
    },
    {
      key: "people",
      label: (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          People
        </span>
      ),
      type: "group",
      children: [
        { key: "/admin/accounts", icon: <UserOutlined />, label: "Accounts" },
        { key: "/admin/students", icon: <UserOutlined />, label: "Students" },
        { key: "/admin/teachers", icon: <TeamOutlined />, label: "Teachers" },
      ],
    },
    {
      key: "academics",
      label: (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Academics
        </span>
      ),
      type: "group",
      children: [
        {
          key: "/admin/schedule",
          icon: <CalendarOutlined />,
          label: "Schedule",
        },
        {
          key: "/admin/grades",
          icon: <TrophyOutlined />,
          label: "Grade Monitor",
        },
      ],
    },
    {
      key: "tools",
      label: (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Tools
        </span>
      ),
      type: "group",
      children: [
        {
          key: "/admin/upload-teachers",
          icon: <UploadOutlined />,
          label: "Upload Teachers",
        },
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
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
          padding: "0 20px",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background:
              "linear-gradient(135deg, var(--color-primary), #6366F1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 4px 12px rgba(30,64,175,0.35)",
          }}
        >
          <ReadOutlined style={{ fontSize: 18 }} />
        </div>
        <div>
          <h1
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 20,
              fontWeight: 800,
              color: "var(--color-text-primary)",
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Akademi
          </h1>
          <div
            style={{
              fontSize: 10,
              color: "var(--color-text-muted)",
              fontWeight: 500,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Admin Portal
          </div>
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
        style={{
          borderRight: "none",
          flex: 1,
          paddingLeft: 8,
          paddingRight: 8,
        }}
        theme="light"
      />
    </div>
  );
}

export default AdminSidebar;
