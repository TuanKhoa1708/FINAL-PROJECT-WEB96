import { useState } from "react";
import {
  Upload,
  Button,
  Table,
  Progress,
  Typography,
  Tag,
  Space,
  Result,
} from "antd";
import {
  InboxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useToast } from "../../components/ToastContext";
import { apiFetch } from "../../utils/api";

const { Title, Text } = Typography;
const { Dragger } = Upload;

function UploadTeachers() {
  const [stage, setStage] = useState("upload"); // upload | preview | importing | done
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState({ success: 0, failed: 0 });
  const showToast = useToast();

  const validateRow = (row) => {
    const errs = [];
    if (!row.name?.toString().trim()) errs.push("Name is required");
    if (!row.subject?.toString().trim()) errs.push("Subject is required");
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))
      errs.push("Invalid email format");
    return errs;
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (data.length === 0) {
          showToast("No data found in the file.", "warning");
          return;
        }

        const processed = data.map((row, idx) => {
          const errs = validateRow(row);
          return {
            key: idx,
            name: row.name || row.Name || row.NAME || "",
            subject: row.subject || row.Subject || row.SUBJECT || "",
            email: row.email || row.Email || row.EMAIL || "",
            _errors: errs,
            _valid: errs.length === 0,
          };
        });

        const allErrors = processed.filter((r) => !r._valid);
        setRows(processed);
        setErrors(allErrors);
        setStage("preview");
      } catch {
        showToast("Failed to parse file. Please check the format.", "error");
      }
    };
    reader.readAsBinaryString(file);
    return false; // prevent default upload
  };

  const handleImport = async () => {
    const validRows = rows.filter((r) => r._valid);
    if (validRows.length === 0) {
      showToast("No valid rows to import.", "warning");
      return;
    }

    setStage("importing");
    setProgress(0);

    let success = 0,
      failed = 0;
    for (let i = 0; i < validRows.length; i++) {
      try {
        await apiFetch("/admin/teachers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: validRows[i].name,
            subject: validRows[i].subject,
            email: validRows[i].email,
          }),
        });
        success++;
      } catch {
        failed++;
      }
      setProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setResults({ success, failed });
    setStage("done");
    showToast(
      `Import complete: ${success} added, ${failed} failed.`,
      success > 0 ? "success" : "error",
    );
  };

  const reset = () => {
    setStage("upload");
    setRows([]);
    setErrors([]);
    setProgress(0);
    setResults({ success: 0, failed: 0 });
  };

  const previewColumns = [
    { title: "#", key: "idx", render: (_, __, i) => i + 1, width: 50 },
    {
      title: "Name",
      dataIndex: "name",
      render: (t, r) => (
        <span
          style={{ fontWeight: 600, color: r._valid ? "inherit" : "#EF4444" }}
        >
          {t || "—"}
        </span>
      ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      render: (t) =>
        t ? (
          <Tag color="blue">{t}</Tag>
        ) : (
          <span style={{ color: "#94A3B8" }}>Missing</span>
        ),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (t) => (
        <span style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
          {t || "—"}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) =>
        r._valid ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Valid
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            {r._errors.join(", ")}
          </Tag>
        ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">
            Upload Teachers via Excel
          </Title>
          <Text style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
            Bulk import teachers from an Excel spreadsheet
          </Text>
        </div>
        {stage !== "upload" && (
          <Button
            onClick={reset}
            icon={<DeleteOutlined />}
            style={{ borderRadius: 10 }}
          >
            Start Over
          </Button>
        )}
      </div>

      {/* Step indicator */}
      <div className="step-indicator" style={{ marginBottom: 28 }}>
        {[
          { label: "Upload File", step: 1 },
          { label: "Preview & Validate", step: 2 },
          { label: "Importing", step: 3 },
          { label: "Done", step: 4 },
        ].map((s, idx) => {
          const stageIdx = { upload: 1, preview: 2, importing: 3, done: 4 }[
            stage
          ];
          const status =
            stageIdx > s.step
              ? "done"
              : stageIdx === s.step
                ? "active"
                : "pending";
          return (
            <div key={s.step} className="step-item">
              <div className={`step-circle ${status}`}>
                {status === "done" ? "✓" : s.step}
              </div>
              <div className={`step-label ${status}`}>{s.label}</div>
              {idx < 3 && (
                <div
                  className={`step-line ${stageIdx > s.step ? "done" : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Upload stage */}
      {stage === "upload" && (
        <div className="premium-card" style={{ padding: 40 }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div className="upload-dragger-custom">
              <Dragger
                beforeUpload={handleFile}
                accept=".xlsx,.xls"
                showUploadList={false}
                style={{ padding: "20px 0" }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined
                    style={{ fontSize: 48, color: "var(--color-primary)" }}
                  />
                </p>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: 8,
                  }}
                >
                  Drag & drop your Excel file here
                </p>
                <p
                  style={{ fontSize: 14, color: "var(--color-text-secondary)" }}
                >
                  or click to browse — Accepts <Tag>.xlsx</Tag> <Tag>.xls</Tag>
                </p>
              </Dragger>
            </div>
            <div
              style={{
                marginTop: 24,
                background: "#F8FAFC",
                borderRadius: 10,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  marginBottom: 8,
                  color: "var(--color-text-primary)",
                }}
              >
                📋 Required columns in your Excel file:
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { name: "name", required: true },
                  { name: "subject", required: true },
                  { name: "email", required: false },
                ].map((col) => (
                  <Tag
                    key={col.name}
                    color={col.required ? "blue" : "default"}
                    style={{ borderRadius: 6 }}
                  >
                    {col.name} {col.required ? "*" : "(optional)"}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview stage */}
      {stage === "preview" && (
        <div>
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div
              className="premium-card"
              style={{
                flex: 1,
                padding: 16,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 24 }}>📄</div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Total Rows
                </div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>
                  {rows.length}
                </div>
              </div>
            </div>
            <div
              className="premium-card"
              style={{
                flex: 1,
                padding: 16,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 24 }}>✅</div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Valid
                </div>
                <div
                  style={{ fontSize: 24, fontWeight: 800, color: "#22C55E" }}
                >
                  {rows.filter((r) => r._valid).length}
                </div>
              </div>
            </div>
            <div
              className="premium-card"
              style={{
                flex: 1,
                padding: 16,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 24 }}>❌</div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Errors
                </div>
                <div
                  style={{ fontSize: 24, fontWeight: 800, color: "#EF4444" }}
                >
                  {errors.length}
                </div>
              </div>
            </div>
          </div>

          <div className="premium-card">
            <Table
              dataSource={rows}
              columns={previewColumns}
              rowKey="key"
              pagination={{ pageSize: 10, showTotal: (t) => `${t} rows` }}
              rowClassName={(r) => (r._valid ? "" : "ant-table-row-danger")}
              scroll={{ y: 400 }}
            />
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <Button onClick={reset} style={{ borderRadius: 10 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handleImport}
              disabled={rows.filter((r) => r._valid).length === 0}
              style={{ borderRadius: 10, fontWeight: 600 }}
            >
              Import {rows.filter((r) => r._valid).length} Valid Teachers
            </Button>
          </div>
        </div>
      )}

      {/* Importing stage */}
      {stage === "importing" && (
        <div
          className="premium-card"
          style={{ padding: 60, textAlign: "center" }}
        >
          <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Importing Teachers...
          </div>
          <div
            style={{ color: "var(--color-text-secondary)", marginBottom: 28 }}
          >
            Please wait while we upload the data.
          </div>
          <Progress
            percent={progress}
            status="active"
            strokeColor={{ from: "#1E40AF", to: "#6366F1" }}
            style={{ maxWidth: 400, margin: "0 auto" }}
          />
          <div
            style={{
              marginTop: 12,
              color: "var(--color-text-muted)",
              fontSize: 14,
            }}
          >
            {progress}% complete
          </div>
        </div>
      )}

      {/* Done stage */}
      {stage === "done" && (
        <div className="premium-card" style={{ padding: 40 }}>
          <Result
            status={results.failed === 0 ? "success" : "warning"}
            title={`Import Complete`}
            subTitle={`${results.success} teachers added successfully${results.failed > 0 ? `, ${results.failed} failed` : ""}.`}
            extra={[
              <Button
                type="primary"
                key="restart"
                onClick={reset}
                style={{ borderRadius: 10 }}
              >
                Upload Another File
              </Button>,
            ]}
          />
        </div>
      )}
    </div>
  );
}

export default UploadTeachers;
