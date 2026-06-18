import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined, ReadOutlined } from "@ant-design/icons";
import { useToast } from "../../components/ToastContext";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake]     = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");
  const navigate = useNavigate();
  const showToast = useToast();

  // Allow Enter key to submit
  useEffect(() => {
    const handler = (e) => { if (e.key === "Enter" && !loading) handleLogin(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const triggerShake = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      triggerShake("Please enter your username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69ca789b3bb225ca08190764"
      );
      const result = await res.json();
      const users = Array.isArray(result) ? result : result.data.data;

      const foundUser = users.find(
        (u) => u.username === username.trim() && u.password === password.trim()
      );

      if (foundUser) {
        let finalUser = { ...foundUser };

        if (foundUser.role === "teacher") {
          if (foundUser.username === "teacher1") { finalUser.subject = "Math";    finalUser.id = 1; }
          if (foundUser.username === "teacher2") { finalUser.subject = "English"; finalUser.id = 2; }
        }

        if (foundUser.role === "student") {
          if (foundUser.username === "student1") finalUser.id = 1;
          if (foundUser.username === "student2") finalUser.id = 2;
          if (foundUser.username === "student3") finalUser.id = 3;
        }

        setUser(finalUser);
        localStorage.setItem("user", JSON.stringify(finalUser));

        // Show success overlay, then redirect
        setSuccess(true);
        showToast(`Welcome back, ${finalUser.username}!`, "success");
        setTimeout(() => navigate(`/${finalUser.role}`), 1400);
      } else {
        triggerShake("Incorrect username or password. Please try again.");
        showToast("Authentication failed. Please check your credentials.", "error");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      triggerShake("Network error. Please try again.");
      showToast("Unable to connect to server.", "error");
      setLoading(false);
    }
  };

  // Success full-screen overlay
  if (success) {
    return (
      <div className="login-success-overlay">
        <div className="check-circle">
          <svg viewBox="0 0 40 40" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 20 L17 29 L32 13" />
          </svg>
        </div>
        <h2 style={{ color: "white", margin: 0, fontSize: 22, fontWeight: 700 }}>Welcome back!</h2>
        <p>Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="login-bg">
      <div className="login-overlay">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%", maxWidth: 440, padding: "0 20px" }}>

          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #1E40AF, #6366F1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(30,64,175,0.4)"
            }}>
              <ReadOutlined style={{ fontSize: 22, color: "white" }} />
            </div>
            <span style={{ fontSize: 28, fontWeight: 800, color: "white", letterSpacing: -0.5 }}>Akademi</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: 0, textAlign: "center" }}>
            School Management System
          </p>

          {/* Card */}
          <div
            className={`login-card ${shake ? "shake" : ""}`}
            style={{
              width: "100%",
              borderRadius: 20,
              background: "rgba(255,255,255,0.97)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.25)",
              padding: "36px 32px",
              border: "1px solid rgba(255,255,255,0.8)"
            }}
          >
            <h2 style={{ textAlign: "center", marginBottom: 6, fontWeight: 700, fontSize: 22, color: "#0F172A" }}>
              Sign In
            </h2>
            <p style={{ textAlign: "center", color: "#64748B", fontSize: 14, marginBottom: 28 }}>
              Enter your credentials to continue
            </p>

            {error && (
              <div style={{
                background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8,
                padding: "10px 14px", marginBottom: 16, color: "#B91C1C",
                fontSize: 13, display: "flex", alignItems: "center", gap: 8
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <Form layout="vertical" style={{ marginBottom: 0 }}>
              <Form.Item label={<span style={{ fontWeight: 600, fontSize: 13 }}>Username</span>} style={{ marginBottom: 16 }}>
                <Input
                  prefix={<UserOutlined style={{ color: "#94A3B8" }} />}
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  size="large"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>

              <Form.Item label={<span style={{ fontWeight: 600, fontSize: 13 }}>Password</span>} style={{ marginBottom: 24 }}>
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#94A3B8" }} />}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  size="large"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>

              <Button
                type="primary"
                block
                size="large"
                disabled={loading}
                onClick={handleLogin}
                style={{
                  height: 48,
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  background: loading ? "#3B82F6" : "linear-gradient(135deg, #1E40AF, #3B82F6)",
                  border: "none",
                  boxShadow: "0 4px 16px rgba(30,64,175,0.35)",
                  letterSpacing: 0.3,
                }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span className="login-spinner" />
                    {username ? "Verifying credentials..." : "Signing In..."}
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </Form>

            <div style={{ textAlign: "center", marginTop: 20, color: "#94A3B8", fontSize: 12 }}>
              Demo: admin / teacher1 / student1
            </div>
          </div>

          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center" }}>
            © 2024 Akademi School Management Platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;