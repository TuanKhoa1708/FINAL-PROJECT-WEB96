import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Typography,
  Space,
  Tag,
  Select,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useToast } from "../../components/ToastContext";
import { apiFetch } from "../../utils/api";

const { Title, Text } = Typography;
const API = "/admin/accounts";
const ROLES = ["admin", "teacher", "student"];

const ROLE_COLORS = {
  admin: "gold",
  teacher: "green",
  student: "blue",
};

function ManageAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const showToast = useToast();

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(API);
      const data = await res.json();
      const items = data.data?.accounts || data.data || [];
      setAccounts(items);
    } catch (err) {
      console.error(err);
      showToast("Failed to load accounts.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const filtered = useMemo(
    () =>
      accounts.filter(
        (account) =>
          !search ||
          account.username?.toLowerCase().includes(search.toLowerCase()) ||
          account.role?.toLowerCase().includes(search.toLowerCase()),
      ),
    [accounts, search],
  );

  const handleSave = async () => {
    const isCreate = !editingAccount?._id;
    const username = (editingAccount?.username || "").trim();
    const password = (editingAccount?.password || "").trim();
    const role = (editingAccount?.role || "").trim();

    if (isCreate && !username) {
      showToast("Username is required.", "warning");
      return;
    }
    if (isCreate && !password) {
      showToast("Password is required.", "warning");
      return;
    }
    if (!ROLES.includes(role)) {
      showToast("Please choose a valid role.", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        role,
        isActive: editingAccount?.isActive ?? true,
      };

      if (isCreate) {
        payload.username = username;
        payload.password = password;
      } else if (password) {
        payload.password = password;
      }

      const res = await apiFetch(
        isCreate ? API : `${API}/${editingAccount._id}`,
        {
          method: isCreate ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to save account.");
      }

      const saved = data.data || {};

      if (isCreate) {
        setAccounts([saved, ...accounts]);
        showToast("New account added successfully.", "success");
      } else {
        setAccounts(
          accounts.map((account) =>
            account._id === editingAccount._id
              ? { ...account, ...saved }
              : account,
          ),
        );
        showToast("Account updated successfully.", "success");
      }

      setEditingAccount(null);
    } catch (err) {
      showToast(err?.message || "Failed to save account.", "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      sorter: (a, b) => a.username?.localeCompare(b.username),
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #1E40AF, #6366F1)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            {text?.charAt(0)?.toUpperCase() || <UserOutlined />}
          </div>
          <div>
            <div
              style={{ fontWeight: 600, color: "var(--color-text-primary)" }}
            >
              {text || "—"}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Login account
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      filters: ROLES.map((role) => ({ text: role, value: role })),
      onFilter: (value, record) => record.role === value,
      render: (role) => (
        <Tag color={ROLE_COLORS[role] || "default"} style={{ fontWeight: 600 }}>
          {role || "—"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (isActive) => (
        <Tag
          style={{
            background: isActive ? "var(--color-success-bg)" : "#FEE2E2",
            color: isActive ? "#15803D" : "#B91C1C",
            border: `1px solid ${isActive ? "#BBF7D0" : "#FCA5A5"}`,
            borderRadius: 20,
            fontWeight: 600,
          }}
        >
          {isActive ? "✓ Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (value) => (
        <span style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
          {value ? new Date(value).toLocaleString() : "—"}
        </span>
      ),
    },
    {
      title: "Actions",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            style={{ color: "var(--color-primary)", fontWeight: 500 }}
            onClick={() =>
              setEditingAccount({
                ...record,
                password: "",
              })
            }
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">
            Manage Accounts
          </Title>
          <Text style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
            {accounts.length} accounts total
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() =>
            setEditingAccount({
              username: "",
              password: "",
              role: "student",
              isActive: true,
            })
          }
          style={{ borderRadius: 10, fontWeight: 600 }}
        >
          Add Account
        </Button>
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
            placeholder="Search by username or role..."
            prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 320, borderRadius: 8 }}
          />
        </div>

        <Table
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `${total} accounts`,
          }}
          scroll={{ y: 480 }}
          columns={columns}
          locale={{
            emptyText: (
              <div className="empty-state">
                <div className="empty-icon">🔐</div>
                <div className="empty-text">No accounts found</div>
                <div className="empty-sub">
                  {search
                    ? "Try a different search term"
                    : "Add your first account to get started"}
                </div>
              </div>
            ),
          }}
          rowClassName="ant-table-row-hover"
        />
      </div>

      <Modal
        open={!!editingAccount}
        onCancel={() => setEditingAccount(null)}
        onOk={handleSave}
        confirmLoading={saving}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "#EFF6FF",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary)",
              }}
            >
              <UserOutlined />
            </div>
            {editingAccount?._id ? "Edit Account" : "Add New Account"}
          </div>
        }
        okText={
          saving
            ? "Saving..."
            : editingAccount?._id
              ? "Save Changes"
              : "Add Account"
        }
        centered
        width={480}
      >
        {editingAccount && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              marginTop: 20,
            }}
          >
            {editingAccount?._id ? (
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--color-text-primary)",
                  }}
                >
                  Username
                </label>
                <Input size="large" value={editingAccount.username} disabled />
              </div>
            ) : (
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--color-text-primary)",
                  }}
                >
                  Username
                </label>
                <Input
                  size="large"
                  placeholder="e.g. admin01"
                  value={editingAccount.username}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      username: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  color: "var(--color-text-primary)",
                }}
              >
                Password{" "}
                {editingAccount?._id ? "(leave blank to keep current)" : ""}
              </label>
              <Input.Password
                size="large"
                placeholder={
                  editingAccount?._id ? "Enter new password" : "Enter password"
                }
                value={editingAccount.password}
                onChange={(e) =>
                  setEditingAccount({
                    ...editingAccount,
                    password: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  color: "var(--color-text-primary)",
                }}
              >
                Role
              </label>
              <Select
                size="large"
                value={editingAccount.role}
                onChange={(value) =>
                  setEditingAccount({ ...editingAccount, role: value })
                }
                options={ROLES.map((role) => ({ label: role, value: role }))}
                style={{ width: "100%" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  Active account
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                  New accounts default to active.
                </div>
              </div>
              <Switch
                checked={!!editingAccount.isActive}
                onChange={(checked) =>
                  setEditingAccount({ ...editingAccount, isActive: checked })
                }
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ManageAccounts;
