import { useState } from "react";
import { Upload, Button, Table, Progress, Typography, Tag, Result } from "antd";
import { InboxOutlined, CheckCircleOutlined, CloseCircleOutlined, UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useToast } from "../../components/ToastContext";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const STUDENT_API = "https://mindx-mockup-server.vercel.app/api/resources/students?apiKey=69ca789b3bb225ca08190764";

function UploadStudents() {
  const [stage, setStage]       = useState("upload");
  const [rows, setRows]         = useState([]);
  const [progress, setProgress] = useState(0);
  const [results, setResults]   = useState({ success: 0, failed: 0 });
  const showToast = useToast();

  const validateRow = (row) => {
    const errs = [];
    if (!row.name?.toString().trim()) errs.push("Name required");
    if (!row.class?.toString().trim()) errs.push("Class required");
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errs.push("Invalid email");
    return errs;
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        if (!data.length) { showToast("File appears to be empty.", "warning"); return; }

        const processed = data.map((row, idx) => {
          const errs = validateRow(row);
          return {
            key: idx,
            name:  row.name  || row.Name  || row.NAME  || "",
            class: row.class || row.Class || row.CLASS || "",
            email: row.email || row.Email || row.EMAIL || "",
            homeroomTeacherId: row.homeroomTeacherId || row.teacherId || "",
            _errors: errs,
            _valid: errs.length === 0,
          };
        });
        setRows(processed);
        setStage("preview");
        showToast(`${processed.length} rows loaded, ${processed.filter(r => r._valid).length} valid.`, "info");
      } catch {
        showToast("Could not parse file. Use .xlsx or .xls format.", "error");
      }
    };
    reader.readAsBinaryString(file);
    return false;
  };

  const handleImport = async () => {
    const validRows = rows.filter(r => r._valid);
    if (!validRows.length) { showToast("No valid rows to import.", "warning"); return; }
    setStage("importing");
    let success = 0, failed = 0;
    for (let i = 0; i < validRows.length; i++) {
      try {
        await fetch(STUDENT_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: validRows[i].name, class: validRows[i].class,
            email: validRows[i].email, homeroomTeacherId: validRows[i].homeroomTeacherId,
          }),
        });
        success++;
      } catch { failed++; }
      setProgress(Math.round(((i + 1) / validRows.length) * 100));
    }
    setResults({ success, failed });
    setStage("done");
    showToast(`Import done: ${success} students added.`, success > 0 ? "success" : "error");
  };

  const reset = () => { setStage("upload"); setRows([]); setProgress(0); setResults({ success: 0, failed: 0 }); };

  const previewColumns = [
    { title: "#", key: "idx", render: (_, __, i) => i + 1, width: 50 },
    { title: "Name", dataIndex: "name", render: (t, r) => <span style={{ fontWeight: 600, color: r._valid ? "inherit" : "#EF4444" }}>{t || "—"}</span> },
    { title: "Class", dataIndex: "class", render: t => t ? <Tag color="geekblue">{t}</Tag> : <span style={{ color: "#94A3B8" }}>Missing</span> },
    { title: "Email", dataIndex: "email", render: t => <span style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>{t || "—"}</span> },
    { title: "Status", key: "status", render: (_, r) => r._valid
      ? <Tag icon={<CheckCircleOutlined />} color="success">Valid</Tag>
      : <Tag icon={<CloseCircleOutlined />} color="error">{r._errors.join(", ")}</Tag>
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">Upload Student List</Title>
          <Text style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Bulk import students from an Excel file</Text>
        </div>
        {stage !== "upload" && <Button onClick={reset} icon={<DeleteOutlined />} style={{ borderRadius: 10 }}>Start Over</Button>}
      </div>

      {/* Step indicator */}
      <div className="step-indicator" style={{ marginBottom: 28 }}>
        {["Upload File", "Preview & Validate", "Importing", "Done"].map((label, idx) => {
          const stageIdx = { upload: 1, preview: 2, importing: 3, done: 4 }[stage];
          const step = idx + 1;
          const status = stageIdx > step ? "done" : stageIdx === step ? "active" : "pending";
          return (
            <div key={label} className="step-item">
              <div className={`step-circle ${status}`}>{status === "done" ? "✓" : step}</div>
              <div className={`step-label ${status}`}>{label}</div>
              {idx < 3 && <div className={`step-line ${stageIdx > step ? "done" : ""}`} />}
            </div>
          );
        })}
      </div>

      {stage === "upload" && (
        <div className="premium-card" style={{ padding: 40 }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div className="upload-dragger-custom">
              <Dragger beforeUpload={handleFile} accept=".xlsx,.xls" showUploadList={false} style={{ padding: "20px 0" }}>
                <p className="ant-upload-drag-icon"><InboxOutlined style={{ fontSize: 48, color: "var(--color-primary)" }} /></p>
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 8 }}>Drag & drop your Excel file here</p>
                <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>or click to browse — <Tag>.xlsx</Tag> <Tag>.xls</Tag></p>
              </Dragger>
            </div>
            <div style={{ marginTop: 20, background: "#F8FAFC", borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>📋 Required columns:</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[{ n: "name", r: true }, { n: "class", r: true }, { n: "email", r: false }, { n: "homeroomTeacherId", r: false }].map(c => (
                  <Tag key={c.n} color={c.r ? "blue" : "default"}>{c.n} {c.r ? "*" : "(optional)"}</Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === "preview" && (
        <div>
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            {[
              { label: "Total Rows", value: rows.length, icon: "📄" },
              { label: "Valid", value: rows.filter(r => r._valid).length, icon: "✅", color: "#22C55E" },
              { label: "Errors", value: rows.filter(r => !r._valid).length, icon: "❌", color: "#EF4444" },
            ].map(card => (
              <div key={card.label} className="premium-card" style={{ flex: 1, padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 28 }}>{card.icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>{card.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: card.color || "var(--color-text-primary)" }}>{card.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="premium-card">
            <Table dataSource={rows} columns={previewColumns} rowKey="key" pagination={{ pageSize: 10 }} scroll={{ y: 400 }} />
          </div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button onClick={reset} style={{ borderRadius: 10 }}>Cancel</Button>
            <Button type="primary" icon={<UploadOutlined />} onClick={handleImport} disabled={!rows.filter(r => r._valid).length} style={{ borderRadius: 10, fontWeight: 600 }}>
              Import {rows.filter(r => r._valid).length} Students
            </Button>
          </div>
        </div>
      )}

      {stage === "importing" && (
        <div className="premium-card" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Importing Students...</div>
          <Progress percent={progress} status="active" strokeColor={{ from: "#6366F1", to: "#8B5CF6" }} style={{ maxWidth: 400, margin: "0 auto" }} />
        </div>
      )}

      {stage === "done" && (
        <div className="premium-card" style={{ padding: 40 }}>
          <Result
            status={results.failed === 0 ? "success" : "warning"}
            title="Import Complete"
            subTitle={`${results.success} students added successfully${results.failed ? `, ${results.failed} failed` : ""}.`}
            extra={<Button type="primary" onClick={reset} style={{ borderRadius: 10 }}>Upload Another File</Button>}
          />
        </div>
      )}
    </div>
  );
}

export default UploadStudents;
