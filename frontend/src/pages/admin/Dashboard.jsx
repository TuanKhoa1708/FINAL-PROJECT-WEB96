import { useEffect, useState } from "react";
import { Row, Col, Spin, Typography, Tag } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  TrophyOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { apiFetch } from "../../utils/api";

const { Title, Text } = Typography;

const MONTH_DATA = [
  { month: "Jan", students: 42 },
  { month: "Feb", students: 58 },
  { month: "Mar", students: 71 },
  { month: "Apr", students: 65 },
  { month: "May", students: 83 },
  { month: "Jun", students: 90 },
];

const GRADE_DIST = [
  { name: "A (9–10)", value: 28, color: "#22C55E" },
  { name: "B (7–8.9)", value: 42, color: "#3B82F6" },
  { name: "C (5–6.9)", value: 20, color: "#F59E0B" },
  { name: "D (<5)", value: 10, color: "#EF4444" },
];

const ACTIVITIES = [
  {
    text: "New student Nguyen Van A enrolled in 10A1",
    time: "2h ago",
    type: "student",
  },
  {
    text: "Teacher Le C uploaded Math materials",
    time: "3h ago",
    type: "teacher",
  },
  { text: "Scores for English 11A1 updated", time: "5h ago", type: "score" },
  {
    text: "Schedule assigned: Physics — Class 10A2",
    time: "Yesterday",
    type: "schedule",
  },
  {
    text: "New teacher Tran B added to system",
    time: "2d ago",
    type: "teacher",
  },
];

const ACTIVITY_COLORS = {
  student: "#3B82F6",
  teacher: "#10B981",
  score: "#F59E0B",
  schedule: "#6366F1",
};
const ACTIVITY_ICONS = {
  student: <UserOutlined />,
  teacher: <TeamOutlined />,
  score: <TrophyOutlined />,
  schedule: <CalendarOutlined />,
};

function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    schedule: 0,
    avgGpa: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch("/admin/dashboard/stats");
        const result = await res.json();
        const data = result?.data || {};

        setStats({
          students: data.totalStudents || 0,
          teachers: data.totalTeachers || 0,
          schedule: data.totalSchedules || 0,
          avgGpa: data.avgGpa || "N/A",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 400,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">
            Dashboard Overview
          </Title>
          <Text style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
            Welcome back, Admin — here's what's happening today.
          </Text>
        </div>
        <Tag
          color="processing"
          style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20 }}
        >
          Live Data
        </Tag>
      </div>

      {/* Stat Cards */}
      <Row gutter={[20, 20]}>
        {[
          {
            title: "Total Students",
            value: stats.students,
            icon: <UserOutlined />,
            color: "#1E40AF",
            bg: "#EFF6FF",
            trend: "+12 this month",
          },
          {
            title: "Total Teachers",
            value: stats.teachers,
            icon: <TeamOutlined />,
            color: "#10B981",
            bg: "#F0FDF4",
            trend: "+2 this semester",
          },
          {
            title: "Active Classes",
            value: stats.schedule,
            icon: <CalendarOutlined />,
            color: "#6366F1",
            bg: "#EEF2FF",
            trend: "On track",
          },
          {
            title: "Average GPA",
            value: stats.avgGpa,
            icon: <TrophyOutlined />,
            color: "#F59E0B",
            bg: "#FFFBEB",
            trend: "Across all subjects",
          },
        ].map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <StatCard {...card} />
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        {/* Bar Chart */}
        <Col xs={24} lg={14}>
          <div className="premium-card" style={{ padding: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "var(--color-text-primary)",
                  }}
                >
                  Student Enrollment
                </div>
                <div
                  style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
                >
                  Monthly growth trend
                </div>
              </div>
              <Tag color="blue">2024</Tag>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTH_DATA} barSize={32}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F1F5F9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "none",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                  cursor={{ fill: "#F8FAFC" }}
                />
                <Bar
                  dataKey="students"
                  fill="url(#barGrad)"
                  radius={[6, 6, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>

        {/* Pie Chart */}
        <Col xs={24} lg={10}>
          <div className="premium-card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
              Grade Distribution
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--color-text-secondary)",
                marginBottom: 16,
              }}
            >
              Performance across all classes
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={GRADE_DIST}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {GRADE_DIST.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "none",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        {/* Line Chart */}
        <Col xs={24} lg={14}>
          <div className="premium-card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
              Score Trend
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--color-text-secondary)",
                marginBottom: 20,
              }}
            >
              Average class scores over time
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={[
                  { month: "Jan", avg: 6.8 },
                  { month: "Feb", avg: 7.1 },
                  { month: "Mar", avg: 7.5 },
                  { month: "Apr", avg: 7.2 },
                  { month: "May", avg: 7.8 },
                  { month: "Jun", avg: 8.1 },
                ]}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F1F5F9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                  domain={[5, 10]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "none",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={{ fill: "#6366F1", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Col>

        {/* Activity Feed */}
        <Col xs={24} lg={10}>
          <div className="premium-card" style={{ padding: 24, height: "100%" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
              Recent Activity
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {ACTIVITIES.map((item, i) => (
                <ActivityItem key={i} {...item} />
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg, trend }) {
  return (
    <div className="stat-card">
      <div
        style={{
          position: "absolute",
          top: -10,
          right: -10,
          opacity: 0.08,
          fontSize: 100,
          color,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          fontSize: 20,
          marginBottom: 14,
        }}
      >
        {icon}
      </div>
      <div className="stat-label">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-trend">
        <ArrowUpOutlined style={{ fontSize: 11 }} />
        {trend}
      </div>
    </div>
  );
}

function ActivityItem({ text, time, type }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: `${ACTIVITY_COLORS[type]}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ACTIVITY_COLORS[type],
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {ACTIVITY_ICONS[type]}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            lineHeight: 1.4,
          }}
        >
          {text}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            marginTop: 3,
          }}
        >
          {time}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
