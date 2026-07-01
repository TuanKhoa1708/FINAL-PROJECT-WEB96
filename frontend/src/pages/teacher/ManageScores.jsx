import { useEffect, useState } from "react";
import {
  Select,
  Button,
  Table,
  Input,
  Typography,
  Tag,
  Space,
  Spin,
} from "antd";
import { SaveOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useOutletContext } from "react-router-dom";
import { useToast } from "../../components/ToastContext";
import { apiFetch } from "../../utils/api";

const { Title, Text } = Typography;
const { Option } = Select;

function ManageScores() {
  const { user } = useOutletContext();
  const showToast = useToast();

  const [allStudents, setAllStudents] = useState([]);
  const [allScores, setAllScores] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const subject = user?.subject || "Math";

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingData(true);
      try {
        const [scRes, stRes, schRes] = await Promise.all([
          apiFetch("/teacher/scores"),
          apiFetch("/teacher/students"),
          apiFetch("/teacher/schedule"),
        ]);
        const [sc, st, sch] = await Promise.all([
          scRes.json(),
          stRes.json(),
          schRes.json(),
        ]);

        const scores = sc.data || [];
        const students = st.data || [];
        const schedule = sch.data || [];

        setAllStudents(students);
        setAllScores(scores);

        // Get classes this teacher teaches
        const teacherClasses = [
          ...new Set(
            schedule
              .filter((s) => String(s.teacherId) === String(user?.id))
              .map((s) => s.class),
          ),
        ];

        // Fallback: get all classes from students if no schedule data
        const allClasses = teacherClasses.length
          ? teacherClasses
          : [...new Set(students.map((s) => s.class).filter(Boolean))];

        setClasses(allClasses);
      } catch {
        showToast("Failed to load data.", "error");
      } finally {
        setLoadingData(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Build editable table when class selected
  useEffect(() => {
    if (!selectedClass) return;
    const classStudents = allStudents.filter((s) => s.class === selectedClass);
    const rows = classStudents.map((student) => {
      const existing = allScores.find(
        (sc) =>
          String(sc.studentId) === String(student.id) && sc.subject === subject,
      );
      const mid = existing?.midterm ?? existing?.score ?? "";
      const fin = existing?.final ?? "";
      const assign = existing?.assignment ?? "";
      return {
        _scoreId: existing?._id || null,
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        midterm: mid,
        final: fin,
        assignment: assign,
        _changed: false,
      };
    });
    setTableData(rows);
  }, [selectedClass, allStudents, allScores, subject]);

  const updateRow = (studentId, field, value) => {
    setTableData((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? { ...r, [field]: value, _changed: true }
          : r,
      ),
    );
  };

  const calcAvg = (row) => {
    const vals = [row.midterm, row.final, row.assignment]
      .map(Number)
      .filter((v) => !isNaN(v) && v !== 0);
    if (!vals.length) return "—";
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const validateScore = (v) => {
    if (v === "" || v === undefined) return true;
    const n = Number(v);
    return !isNaN(n) && n >= 0 && n <= 10;
  };

  const handleSaveAll = async () => {
    const changed = tableData.filter((r) => r._changed);
    if (!changed.length) {
      showToast("No changes to save.", "info");
      return;
    }

    // Validate
    for (const row of changed) {
      if (
        !validateScore(row.midterm) ||
        !validateScore(row.final) ||
        !validateScore(row.assignment)
      ) {
        showToast("Scores must be between 0 and 10.", "warning");
        return;
      }
    }

    setSaving(true);
    let success = 0,
      failed = 0;
    try {
      for (const row of changed) {
        const avg = calcAvg(row);
        const payload = {
          studentId: row.studentId,
          subject,
          score: avg !== "—" ? Number(avg) : "",
          midterm: row.midterm !== "" ? Number(row.midterm) : undefined,
          final: row.final !== "" ? Number(row.final) : undefined,
          assignment:
            row.assignment !== "" ? Number(row.assignment) : undefined,
        };

        try {
          if (row._scoreId) {
            await apiFetch(`/teacher/scores/${row._scoreId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          } else {
            const res = await apiFetch("/teacher/scores", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const data = await res.json();
            setAllScores((prev) => [...prev, data.data]);
          }
          success++;
        } catch {
          failed++;
        }
      }
      setTableData((prev) => prev.map((r) => ({ ...r, _changed: false })));
      showToast(
        `${success} scores saved${failed ? `, ${failed} failed` : ""}.`,
        success > 0 ? "success" : "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "#",
      key: "idx",
      width: 50,
      render: (_, __, i) => (
        <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>
          {i + 1}
        </span>
      ),
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      width: 180,
      render: (t, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1E40AF, #6366F1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            {t?.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{t}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              ID: {r.studentId}
            </div>
          </div>
        </div>
      ),
    },
    ...["midterm", "final", "assignment"].map((field) => ({
      title: field.charAt(0).toUpperCase() + field.slice(1),
      dataIndex: field,
      width: 120,
      render: (val, row) => (
        <div style={{ position: "relative" }}>
          <input
            type="number"
            min="0"
            max="10"
            step="0.5"
            value={val}
            onChange={(e) => updateRow(row.studentId, field, e.target.value)}
            placeholder="0–10"
            style={{
              width: 80,
              padding: "6px 10px",
              border: `1.5px solid ${!validateScore(val) ? "#EF4444" : row._changed ? "#3B82F6" : "#E2E8F0"}`,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              outline: "none",
              background: row._changed ? "#EFF6FF" : "transparent",
              transition: "all 0.15s",
              color: "var(--color-text-primary)",
            }}
          />
          {!validateScore(val) && (
            <div style={{ fontSize: 10, color: "#EF4444", marginTop: 2 }}>
              0–10
            </div>
          )}
        </div>
      ),
    })),
    {
      title: "Average",
      key: "avg",
      width: 100,
      render: (_, row) => {
        const avg = calcAvg(row);
        const n = Number(avg);
        const color = isNaN(n)
          ? "#94A3B8"
          : n >= 8
            ? "#22C55E"
            : n >= 5
              ? "#3B82F6"
              : "#EF4444";
        return (
          <span style={{ fontWeight: 800, fontSize: 16, color }}>{avg}</span>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_, row) => {
        const avg = Number(calcAvg(row));
        if (isNaN(avg))
          return (
            <span style={{ color: "#94A3B8", fontSize: 12 }}>No data</span>
          );
        return avg >= 5 ? (
          <span className="score-status-passed">✓ Passed</span>
        ) : (
          <span className="score-status-failed">✗ Failed</span>
        );
      },
    },
    {
      title: "",
      key: "changed",
      width: 40,
      render: (_, row) =>
        row._changed ? (
          <span
            title="Unsaved changes"
            style={{ color: "#F59E0B", fontSize: 16 }}
          >
            ●
          </span>
        ) : null,
    },
  ];

  if (loadingData)
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

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">
            Manage Scores
          </Title>
          <Text style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
            Subject:{" "}
            <Tag color="blue" style={{ fontWeight: 600 }}>
              {subject}
            </Tag>
          </Text>
        </div>
      </div>

      {/* Step 1 & 2: Select class */}
      <div className="premium-card" style={{ padding: 24, marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "0 0 280px" }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                fontSize: 13,
                color: "var(--color-text-primary)",
              }}
            >
              Step 1 — Select Subject
            </label>
            <Select
              size="large"
              style={{ width: "100%" }}
              value={subject}
              disabled
            >
              <Option value={subject}>{subject}</Option>
            </Select>
          </div>
          <div style={{ flex: "0 0 280px" }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                fontSize: 13,
                color: "var(--color-text-primary)",
              }}
            >
              Step 2 — Select Class
            </label>
            <Select
              size="large"
              style={{ width: "100%" }}
              placeholder="Choose a class..."
              value={selectedClass}
              onChange={(v) => setSelectedClass(v)}
            >
              {classes.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </div>
          {selectedClass && (
            <div
              style={{
                color: "var(--color-text-muted)",
                fontSize: 13,
                paddingBottom: 6,
              }}
            >
              <CheckCircleOutlined
                style={{ color: "var(--color-success)", marginRight: 6 }}
              />
              {tableData.length} students loaded
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Editable table */}
      {selectedClass && (
        <div className="premium-card">
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                Class {selectedClass}
              </span>
              <span
                style={{
                  color: "var(--color-text-muted)",
                  marginLeft: 12,
                  fontSize: 13,
                }}
              >
                {tableData.filter((r) => r._changed).length} unsaved changes
              </span>
            </div>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSaveAll}
              style={{
                borderRadius: 10,
                fontWeight: 600,
                background: "linear-gradient(135deg, #1E40AF, #3B82F6)",
                border: "none",
              }}
            >
              {saving ? "Saving..." : "Save All"}
            </Button>
          </div>

          <Table
            dataSource={tableData}
            rowKey="studentId"
            columns={columns}
            pagination={false}
            className="inline-edit-table"
            scroll={{ y: 480 }}
            locale={{
              emptyText: (
                <div className="empty-state">
                  <div className="empty-icon">👨‍🎓</div>
                  <div className="empty-text">No students in this class</div>
                </div>
              ),
            }}
            rowClassName={(r) => (r._changed ? "ant-table-row-selected" : "")}
          />
        </div>
      )}

      {!selectedClass && (
        <div className="premium-card" style={{ padding: 60 }}>
          <div className="empty-state">
            <div style={{ fontSize: 64 }}>📋</div>
            <div className="empty-text">Select a class to view students</div>
            <div className="empty-sub">
              Students will be automatically loaded once you choose a class
              above.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageScores;
