import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { Avatar, Dropdown } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined, BellOutlined } from "@ant-design/icons";

function AdminLayout({ setUser }) {
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
      <AdminSidebar />

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
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>Admin User</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Administrator</div>
                </div>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: "var(--color-primary)" }} />
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          <div className="layout-content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;