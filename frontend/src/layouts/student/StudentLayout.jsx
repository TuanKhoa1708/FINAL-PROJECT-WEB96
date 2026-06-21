import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import { Avatar, Dropdown } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined, BellOutlined } from "@ant-design/icons";

function StudentLayout({ user, setUser }) {
  const handleLogout = () => {
    setUser(null);
    window.location.href = "/";
  };

  const userMenu = {
    items: [
      { key: "1", icon: <SettingOutlined />, label: "Settings" },
      { key: "2", icon: <LogoutOutlined />, label: "Logout", onClick: handleLogout, danger: true },
    ],
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--color-background)" }}>
      <StudentSidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {/* Floating Top Navbar */}
        <header className="glass-panel" style={{
          height: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <BellOutlined style={{ fontSize: 20, color: "var(--color-text-secondary)" }} />
              <span style={{
                position: "absolute", top: -2, right: -2, width: 8, height: 8,
                backgroundColor: "var(--color-danger)", borderRadius: "50%"
              }} />
            </div>
            
            <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
              <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{user?.username || "Student"}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Student</div>
                </div>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: "var(--color-info)" }} />
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          <div className="layout-content-wrapper">
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;