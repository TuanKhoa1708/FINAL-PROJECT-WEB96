import { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Input, Typography, Space, Tag, Avatar, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ExportOutlined } from "@ant-design/icons";
import { useToast } from "../../components/ToastContext";

const { Title, Text } = Typography;

const API = "https://mindx-mockup-server.vercel.app/api/resources/students?apiKey=69ca789b3bb225ca08190764";

const CLASS_COLORS = { "10A1": "blue", "10A2": "geekblue", "11A1": "purple", "11A2": "violet", "12A1": "cyan" };

function ManageStudents() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState("");
  const showToast = useToast();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setUsers(data.data.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load students.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() =>
    users.filter(u =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.class?.toLowerCase().includes(search.toLowerCase())
    ), [users, search]
  );

  const handleDelete = (_id) => {
    Modal.confirm({
      title: "Delete Student",
      content: "Are you sure you want to remove this student? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          await fetch(
            `https://mindx-mockup-server.vercel.app/api/resources/students/${_id}?apiKey=69ca789b3bb225ca08190764`,
            { method: "DELETE" }
          );
          setUsers(users.filter((u) => u._id !== _id));
          showToast("Student removed successfully.", "success");
        } catch {
          showToast("Failed to delete student.", "error");
        }
      },
    });
  };

  const handleSave = async () => {
    if (!editingUser.name?.trim()) {
      showToast("Student name is required.", "warning");
      return;
    }
    setSaving(true);
    try {
      if (editingUser._id) {
        await fetch(
          `https://mindx-mockup-server.vercel.app/api/resources/students/${editingUser._id}?apiKey=69ca789b3bb225ca08190764`,
          { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingUser) }
        );
        setUsers(users.map((u) => u._id === editingUser._id ? editingUser : u));
        showToast("Student details saved.", "success");
      } else {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingUser),
        });
        const data = await res.json();
        setUsers([...users, data.data]);
        showToast("New student added successfully.", "success");
      }
      setEditingUser(null);
    } catch {
      showToast("Failed to save student.", "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Student",
      dataIndex: "name",
      sorter: (a, b) => a.name?.localeCompare(b.name),
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar style={{ background: "linear-gradient(135deg, #1E40AF, #6366F1)", fontWeight: 600, flexShrink: 0 }}>
            {text?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: 14 }}>{text || "—"}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{record.email || "No email"}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Class",
      dataIndex: "class",
      sorter: (a, b) => (a.class || "").localeCompare(b.class || ""),
      filters: [...new Set(users.map(u => u.class).filter(Boolean))].map(c => ({ text: c, value: c })),
      onFilter: (val, rec) => rec.class === val,
      render: (text) => text
        ? <Tag color={CLASS_COLORS[text] || "default"} style={{ fontWeight: 600, borderRadius: 6 }}>{text}</Tag>
        : <span style={{ color: "var(--color-text-muted)" }}>—</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (text) => <span style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>{text || "—"}</span>,
    },
    {
      title: "Status",
      key: "status",
      render: () => (
        <Tag style={{
          background: "var(--color-success-bg)", color: "#15803D",
          border: "1px solid #BBF7D0", borderRadius: 20, fontWeight: 600, fontSize: 12
        }}>
          ✓ Active
        </Tag>
      ),
    },
    {
      title: "Actions",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text" size="small" icon={<EditOutlined />}
            onClick={() => setEditingUser(record)}
            style={{ color: "var(--color-primary)", fontWeight: 500 }}
          >Edit</Button>
          <Button
            type="text" size="small" danger icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">Manage Students</Title>
          <Text style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
            {users.length} students total
          </Text>
        </div>
        <Button
          type="primary" icon={<PlusOutlined />} size="large"
          onClick={() => setEditingUser({ name: "", class: "", email: "" })}
          style={{ borderRadius: 10, fontWeight: 600 }}
        >
          Add Student
        </Button>
      </div>

      <div className="premium-card">
        {/* Toolbar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: 12, alignItems: "center" }}>
          <Input
            placeholder="Search by name, class or email..."
            prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 300, borderRadius: 8 }}
          />
          <div style={{ flex: 1 }} />
          <Button icon={<ExportOutlined />} style={{ borderRadius: 8 }}>Export</Button>
        </div>

        <Table
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `${total} students` }}
          scroll={{ y: 480 }}
          columns={columns}
          locale={{
            emptyText: (
              <div className="empty-state">
                <div className="empty-icon">👨‍🎓</div>
                <div className="empty-text">No students found</div>
                <div className="empty-sub">{search ? "Try a different search term" : "Add your first student to get started"}</div>
              </div>
            )
          }}
          rowClassName="ant-table-row-hover"
        />
      </div>

      {/* Modal */}
      <Modal
        open={!!editingUser}
        onCancel={() => setEditingUser(null)}
        onOk={handleSave}
        confirmLoading={saving}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "#EFF6FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
              <UserOutlined />
            </div>
            {editingUser?._id ? "Edit Student" : "Add New Student"}
          </div>
        }
        okText={saving ? "Saving..." : editingUser?._id ? "Save Changes" : "Add Student"}
        centered
        width={480}
      >
        {editingUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
            {[
              { label: "Full Name", key: "name", placeholder: "e.g. Nguyen Van A" },
              { label: "Class", key: "class", placeholder: "e.g. 10A1" },
              { label: "Email", key: "email", placeholder: "e.g. student@akademi.edu" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>{label}</label>
                <Input
                  placeholder={placeholder}
                  value={editingUser[key]}
                  onChange={(e) => setEditingUser({ ...editingUser, [key]: e.target.value })}
                  size="large"
                />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function UserOutlined2() { return <UserOutlined />; }

export default ManageStudents;