import { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Input, Typography, Space, Tag, Avatar } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, TeamOutlined } from "@ant-design/icons";
import { useToast } from "../../components/ToastContext";

const { Title, Text } = Typography;
const API = "https://mindx-mockup-server.vercel.app/api/resources/teachers?apiKey=69ca789b3bb225ca08190764";

const SUBJECT_COLORS = { Math: "blue", English: "green", Physics: "purple", Chemistry: "orange", History: "red", Literature: "cyan", Biology: "lime" };

function ManageTeachers() {
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [search, setSearch]           = useState("");
  const showToast = useToast();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setUsers(data.data.data);
    } catch {
      showToast("Failed to load teachers.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() =>
    users.filter(u =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.subject?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    ), [users, search]
  );

  const handleDelete = (_id) => {
    Modal.confirm({
      title: "Remove Teacher",
      content: "Are you sure you want to remove this teacher from the system?",
      okText: "Remove", okType: "danger", cancelText: "Cancel", centered: true,
      onOk: async () => {
        try {
          await fetch(`https://mindx-mockup-server.vercel.app/api/resources/teachers/${_id}?apiKey=69ca789b3bb225ca08190764`, { method: "DELETE" });
          setUsers(users.filter(u => u._id !== _id));
          showToast("Teacher removed successfully.", "success");
        } catch {
          showToast("Failed to remove teacher.", "error");
        }
      },
    });
  };

  const handleSave = async () => {
    if (!editingUser.name?.trim()) { showToast("Name is required.", "warning"); return; }
    setSaving(true);
    try {
      if (editingUser._id) {
        await fetch(`https://mindx-mockup-server.vercel.app/api/resources/teachers/${editingUser._id}?apiKey=69ca789b3bb225ca08190764`,
          { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingUser) });
        setUsers(users.map(u => u._id === editingUser._id ? editingUser : u));
        showToast("Teacher details updated.", "success");
      } else {
        const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingUser) });
        const data = await res.json();
        setUsers([...users, data.data]);
        showToast("New teacher added.", "success");
      }
      setEditingUser(null);
    } catch {
      showToast("Failed to save teacher.", "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Teacher",
      dataIndex: "name",
      sorter: (a, b) => a.name?.localeCompare(b.name),
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar style={{ background: "linear-gradient(135deg, #10B981, #059669)", fontWeight: 600 }}>
            {text?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{text || "—"}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{record.email || "No email"}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      sorter: (a, b) => (a.subject || "").localeCompare(b.subject || ""),
      filters: [...new Set(users.map(u => u.subject).filter(Boolean))].map(s => ({ text: s, value: s })),
      onFilter: (val, rec) => rec.subject === val,
      render: (text) => text
        ? <Tag color={SUBJECT_COLORS[text] || "default"} style={{ fontWeight: 600, borderRadius: 6 }}>{text}</Tag>
        : <span style={{ color: "var(--color-text-muted)" }}>—</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (t) => <span style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>{t || "—"}</span>,
    },
    {
      title: "Status",
      render: () => (
        <Tag style={{ background: "var(--color-success-bg)", color: "#15803D", border: "1px solid #BBF7D0", borderRadius: 20, fontWeight: 600 }}>
          ✓ Active
        </Tag>
      ),
    },
    {
      title: "Actions", align: "right",
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} style={{ color: "var(--color-primary)", fontWeight: 500 }} onClick={() => setEditingUser(record)}>Edit</Button>
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)}>Remove</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">Manage Teachers</Title>
          <Text style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>{users.length} teachers registered</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setEditingUser({ name: "", subject: "", email: "" })} style={{ borderRadius: 10, fontWeight: 600 }}>
          Add Teacher
        </Button>
      </div>

      <div className="premium-card">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: 12 }}>
          <Input placeholder="Search by name, subject or email..." prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
            value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 320, borderRadius: 8 }} />
        </div>
        <Table
          dataSource={filtered} rowKey="_id" loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} teachers` }}
          scroll={{ y: 480 }} columns={columns}
          locale={{ emptyText: (
            <div className="empty-state">
              <div className="empty-icon">👩‍🏫</div>
              <div className="empty-text">No teachers found</div>
              <div className="empty-sub">{search ? "Try a different search" : "Add your first teacher"}</div>
            </div>
          )}}
        />
      </div>

      <Modal open={!!editingUser} onCancel={() => setEditingUser(null)} onOk={handleSave} confirmLoading={saving}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "#F0FDF4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
              <TeamOutlined />
            </div>
            {editingUser?._id ? "Edit Teacher" : "Add New Teacher"}
          </div>
        }
        okText={saving ? "Saving..." : editingUser?._id ? "Save Changes" : "Add Teacher"} centered width={440}
      >
        {editingUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
            {[
              { label: "Full Name", key: "name", placeholder: "e.g. Nguyen Thi B" },
              { label: "Subject", key: "subject", placeholder: "e.g. Mathematics" },
              { label: "Email", key: "email", placeholder: "e.g. teacher@akademi.edu" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>{label}</label>
                <Input size="large" placeholder={placeholder} value={editingUser[key]} onChange={e => setEditingUser({ ...editingUser, [key]: e.target.value })} />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ManageTeachers;