import { useEffect, useState, useMemo, useCallback } from "react";
import { Table, Input, Select, Button, Tag, Typography, Space } from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useToast } from "../../components/ToastContext";
import { apiFetch } from "../../utils/api";

const { Title, Text } = Typography;
const { Option } = Select;

function GradeMonitoring() {
  const [scores, setScores] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState(null);
  const showToast = useToast();

  const fetchData = useCallback(async () => {
    try {
      const res = await apiFetch("/admin/grade-monitoring");
      const result = await res.json();
      const data = result.data || {};
      setScores(data.scores || []);
      setStudents(data.students || []);
    } catch {
      showToast("Failed to load grade data.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStudentName = useCallback(
    (id) =>
      students.find((s) => String(s.id) === String(id))?.name ||
      `Student #${id}`,
    [students],
  );
  const getStudentClass = useCallback(
    (id) => students.find((s) => String(s.id) === String(id))?.class || "—",
    [students],
  );

  const subjects = useMemo(
    () => [...new Set(scores.map((s) => s.subject).filter(Boolean))],
    [scores],
  );

  const filtered = useMemo(
    () =>
      scores.filter((s) => {
        const name = getStudentName(s.studentId).toLowerCase();
        const matchSearch =
          !search ||
          name.includes(search.toLowerCase()) ||
          s.subject?.toLowerCase().includes(search.toLowerCase());
        const matchSubject = !subjectFilter || s.subject === subjectFilter;
        return matchSearch && matchSubject;
      }),
    [scores, search, subjectFilter, getStudentName],
  );

  const exportCSV = () => {
    const rows = [["Student", "Class", "Subject", "Score", "Status"]];
    filtered.forEach((s) => {
      const score = Number(s.score);
      rows.push([
        getStudentName(s.studentId),
        getStudentClass(s.studentId),
        s.subject,
        score,
        score >= 5 ? "Passed" : "Failed",
      ]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grades_report.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Grades exported to CSV.", "success");
  };

  const avgScore = scores.length
    ? (
        scores.reduce((a, b) => a + (Number(b.score) || 0), 0) / scores.length
      ).toFixed(1)
    : "—";
  const passRate = scores.length
    ? Math.round(
        (scores.filter((s) => Number(s.score) >= 5).length / scores.length) *
          100,
      )
    : 0;

  const columns = [
    {
      title: "#",
      key: "idx",
      render: (_, __, i) => (
        <span
          style={{
            color: "var(--color-text-muted)",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {i + 1}
        </span>
      ),
      width: 50,
    },
    {
      title: "Student",
      key: "student",
      sorter: (a, b) =>
        getStudentName(a.studentId).localeCompare(getStudentName(b.studentId)),
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            {getStudentName(r.studentId)}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Class: {getStudentClass(r.studentId)}
          </div>
        </div>
      ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      sorter: (a, b) => a.subject?.localeCompare(b.subject),
      render: (t) => (
        <Tag color="blue" style={{ fontWeight: 600, borderRadius: 6 }}>
          {t}
        </Tag>
      ),
    },
    {
      title: "Score",
      dataIndex: "score",
      sorter: (a, b) => Number(a.score) - Number(b.score),
      render: (v) => {
        const n = Number(v);
        const color =
          n >= 8
            ? "#22C55E"
            : n >= 6
              ? "#3B82F6"
              : n >= 5
                ? "#F59E0B"
                : "#EF4444";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 80,
                height: 6,
                background: "#F1F5F9",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(n * 10, 100)}%`,
                  height: "100%",
                  background: color,
                  borderRadius: 3,
                  transition: "width 0.3s",
                }}
              />
            </div>
            <span style={{ fontWeight: 700, color, minWidth: 24 }}>{v}</span>
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      sorter: (a, b) => Number(a.score) - Number(b.score),
      render: (_, r) =>
        Number(r.score) >= 5 ? (
          <span className="score-status-passed">✓ Passed</span>
        ) : (
          <span className="score-status-failed">✗ Failed</span>
        ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">
            Grade Monitoring
          </Title>
          <Text style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
            Read-only — {scores.length} grade records
          </Text>
        </div>
        <Button
          icon={<DownloadOutlined />}
          size="large"
          onClick={exportCSV}
          style={{ borderRadius: 10, fontWeight: 600 }}
        >
          Export CSV
        </Button>
      </div>

      {/* Summary row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {[
          {
            label: "Total Records",
            value: scores.length,
            color: "#1E40AF",
            icon: "📊",
          },
          {
            label: "Average Score",
            value: avgScore,
            color: "#6366F1",
            icon: "🎯",
          },
          {
            label: "Pass Rate",
            value: `${passRate}%`,
            color: "#22C55E",
            icon: "✅",
          },
          {
            label: "Subjects Tracked",
            value: subjects.length,
            color: "#F59E0B",
            icon: "📚",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="premium-card"
            style={{
              flex: 1,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ fontSize: 28 }}>{card.icon}</div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: card.color,
                  lineHeight: 1.2,
                }}
              >
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="premium-card">
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <Input
            placeholder="Search student or subject..."
            prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 280, borderRadius: 8 }}
          />
          <Select
            placeholder="All Subjects"
            allowClear
            style={{ width: 180 }}
            value={subjectFilter}
            onChange={(v) => setSubjectFilter(v)}
          >
            {subjects.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>
          <div style={{ flex: 1 }} />
          <Text style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            <EyeOutlined /> View only — no editing allowed
          </Text>
        </div>

        <Table
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} records` }}
          scroll={{ y: 500 }}
          columns={columns}
          locale={{
            emptyText: (
              <div className="empty-state">
                <div className="empty-icon">
                  <TrophyOutlined />
                </div>
                <div className="empty-text">No grade records found</div>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}

export default GradeMonitoring;
