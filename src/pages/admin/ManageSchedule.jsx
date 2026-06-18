import { useEffect, useState } from "react";
import { Table, Button, Modal, Input, Select, Tag, Typography, Space, Radio, Tooltip } from "antd";
import { PlusOutlined, CalendarOutlined, UnorderedListOutlined, DeleteOutlined, EditOutlined, WarningOutlined } from "@ant-design/icons";
import { useToast } from "../../components/ToastContext";

const { Title, Text } = Typography;
const { Option } = Select;

const API = "https://mindx-mockup-server.vercel.app/api/resources/schedule?apiKey=69ca789b3bb225ca08190764";

const DAYS    = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [
  { id: 1, label: "Period 1", time: "07:00 – 08:30" },
  { id: 2, label: "Period 2", time: "08:45 – 10:15" },
  { id: 3, label: "Period 3", time: "10:30 – 12:00" },
  { id: 4, label: "Period 4", time: "13:00 – 14:30" },
  { id: 5, label: "Period 5", time: "14:45 – 16:15" },
];
const SUBJECT_COLORS = {
  Math:       { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  English:    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  Physics:    { bg: "#FAF5FF", text: "#7C3AED", border: "#DDD6FE" },
  Chemistry:  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  History:    { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  Literature: { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  Biology:    { bg: "#F7FEE7", text: "#3F6212", border: "#D9F99D" },
};
const SUBJECTS = Object.keys(SUBJECT_COLORS);
const DAY_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat"];

function ManageSchedule() {
  const [schedule, setSchedule]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [view, setView]           = useState("calendar");
  const [teachers, setTeachers]   = useState([]);
  const showToast = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [schedRes, teachRes] = await Promise.all([
        fetch(API),
        fetch("https://mindx-mockup-server.vercel.app/api/resources/teachers?apiKey=69ca789b3bb225ca08190764"),
      ]);
      const [sd, td] = await Promise.all([schedRes.json(), teachRes.json()]);
      setSchedule(sd.data.data || []);
      setTeachers(td.data.data || []);
    } catch {
      showToast("Failed to load schedule.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getTeacherName = (id) => teachers.find(t => String(t.id) === String(id))?.name || `Teacher #${id}`;

  const checkOverlap = (item) => {
    return schedule.some(s =>
      s._id !== item._id &&
      s.day === item.day &&
      s.time === item.time &&
      (s.teacherId === item.teacherId || s.class === item.class)
    );
  };

  const handleSave = async () => {
    if (!editingItem.class || !editingItem.subject || !editingItem.day || !editingItem.time) {
      showToast("Please fill in all required fields.", "warning"); return;
    }
    if (checkOverlap(editingItem)) {
      Modal.confirm({
        title: <span><WarningOutlined style={{ color: "#F59E0B", marginRight: 8 }} />Scheduling Conflict Detected</span>,
        content: "This teacher or class already has a slot at the same time. Do you want to continue anyway?",
        okText: "Save Anyway", cancelText: "Go Back", centered: true,
        onOk: () => doSave(),
      });
      return;
    }
    doSave();
  };

  const doSave = async () => {
    setSaving(true);
    try {
      if (editingItem._id) {
        await fetch(`https://mindx-mockup-server.vercel.app/api/resources/schedule/${editingItem._id}?apiKey=69ca789b3bb225ca08190764`,
          { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingItem) });
        setSchedule(schedule.map(s => s._id === editingItem._id ? editingItem : s));
        showToast("Schedule updated.", "success");
      } else {
        const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingItem) });
        const data = await res.json();
        setSchedule([...schedule, data.data]);
        showToast("Schedule entry added.", "success");
      }
      setEditingItem(null);
    } catch {
      showToast("Failed to save schedule.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (_id) => {
    Modal.confirm({
      title: "Delete Schedule Entry", okText: "Delete", okType: "danger", cancelText: "Cancel", centered: true,
      content: "Remove this class from the schedule?",
      onOk: async () => {
        try {
          await fetch(`https://mindx-mockup-server.vercel.app/api/resources/schedule/${_id}?apiKey=69ca789b3bb225ca08190764`, { method: "DELETE" });
          setSchedule(schedule.filter(s => s._id !== _id));
          showToast("Schedule entry removed.", "success");
        } catch { showToast("Failed to delete.", "error"); }
      },
    });
  };

  // Build calendar grid
  const calendarMap = {};
  schedule.forEach(item => {
    const period = PERIODS.find(p => p.time === item.time || p.label === item.time || item.time?.includes(p.id.toString()));
    const periodKey = period ? period.id : item.time;
    const key = `${item.day}__${periodKey}`;
    if (!calendarMap[key]) calendarMap[key] = [];
    calendarMap[key].push(item);
  });

  const getCellItems = (day, periodId) => {
    const key = `${day}__${periodId}`;
    return calendarMap[key] || [];
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">Schedule Management</Title>
          <Text style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>{schedule.length} classes scheduled</Text>
        </div>
        <Space>
          <Radio.Group value={view} onChange={e => setView(e.target.value)} buttonStyle="solid" size="middle">
            <Radio.Button value="calendar"><CalendarOutlined /> Calendar</Radio.Button>
            <Radio.Button value="table"><UnorderedListOutlined /> Table</Radio.Button>
          </Radio.Group>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setEditingItem({ class: "", subject: "", teacherId: "", day: "", time: "", room: "" })} style={{ borderRadius: 10, fontWeight: 600 }}>
            Add Class
          </Button>
        </Space>
      </div>

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="premium-card" style={{ padding: 20 }}>
          <div className="timetable-wrapper" style={{ boxShadow: "none", border: "none" }}>
            <table className="timetable-grid" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Time</th>
                  {DAYS.map((d, i) => <th key={d}>{d}<div style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>{DAY_SHORT[i]}</div></th>)}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(period => (
                  <tr key={period.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{period.label}</div>
                      <div style={{ fontSize: 10, color: "#94A3B8" }}>{period.time}</div>
                    </td>
                    {DAYS.map(day => {
                      const items = getCellItems(day, period.id);
                      return (
                        <td key={day} style={{ padding: 6 }}>
                          {items.length === 0 ? (
                            <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <button
                                onClick={() => setEditingItem({ class: "", subject: "", teacherId: "", day, time: `${period.label} (${period.time})`, room: "" })}
                                style={{ background: "none", border: "1.5px dashed #E2E8F0", borderRadius: 8, width: "100%", height: 50, cursor: "pointer", color: "#CBD5E1", fontSize: 18, transition: "all 0.15s" }}
                                onMouseEnter={e => { e.target.style.borderColor = "#94A3B8"; e.target.style.color = "#94A3B8"; }}
                                onMouseLeave={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.color = "#CBD5E1"; }}
                              >+</button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {items.map(item => {
                                const c = SUBJECT_COLORS[item.subject] || { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" };
                                return (
                                  <Tooltip key={item._id} title={
                                    <div style={{ fontSize: 12 }}>
                                      <div><b>Class:</b> {item.class}</div>
                                      <div><b>Teacher:</b> {getTeacherName(item.teacherId)}</div>
                                      <div><b>Room:</b> {item.room || "TBD"}</div>
                                    </div>
                                  }>
                                    <div
                                      className="timetable-cell"
                                      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
                                      onClick={() => setEditingItem({ ...item })}
                                    >
                                      <div className="subject-name">{item.subject}</div>
                                      <div className="teacher-name">{item.class}</div>
                                      <div className="room-name">{item.room || "Room TBD"}</div>
                                      <button
                                        style={{ position: "absolute", top: 4, right: 4, background: "none", border: "none", cursor: "pointer", color: c.text, opacity: 0.5, padding: 0, fontSize: 12, lineHeight: 1 }}
                                        onClick={e => { e.stopPropagation(); handleDelete(item._id); }}
                                      >×</button>
                                    </div>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="premium-card">
          <Table
            dataSource={schedule} rowKey="_id" loading={loading}
            pagination={{ pageSize: 12, showTotal: t => `${t} entries` }}
            columns={[
              { title: "Class", dataIndex: "class", sorter: (a,b) => a.class?.localeCompare(b.class), render: t => <Tag color="blue" style={{ fontWeight: 600 }}>{t}</Tag> },
              { title: "Subject", dataIndex: "subject", render: t => { const c = SUBJECT_COLORS[t]; return <Tag style={c ? { background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: 600 } : {}}>{t}</Tag>; } },
              { title: "Teacher", dataIndex: "teacherId", render: id => getTeacherName(id) },
              { title: "Day", dataIndex: "day" },
              { title: "Time", dataIndex: "time" },
              { title: "Room", dataIndex: "room", render: t => t || <span style={{ color: "#94A3B8" }}>TBD</span> },
              {
                title: "Actions", align: "right", render: (_, r) => (
                  <Space>
                    <Button type="text" size="small" icon={<EditOutlined />} style={{ color: "var(--color-primary)" }} onClick={() => setEditingItem({ ...r })}>Edit</Button>
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r._id)}>Delete</Button>
                  </Space>
                )
              },
            ]}
          />
        </div>
      )}

      {/* Modal */}
      <Modal open={!!editingItem} onCancel={() => setEditingItem(null)} onOk={handleSave} confirmLoading={saving}
        title={editingItem?._id ? "Edit Schedule Entry" : "Add New Class"} okText="Save" centered width={480}
      >
        {editingItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
            {[
              { label: "Class", key: "class", placeholder: "e.g. 10A1" },
              { label: "Room", key: "room", placeholder: "e.g. Room 201" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>{label}</label>
                <Input size="large" placeholder={placeholder} value={editingItem[key]} onChange={e => setEditingItem({ ...editingItem, [key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Subject</label>
              <Select size="large" style={{ width: "100%" }} value={editingItem.subject || undefined} placeholder="Select subject" onChange={v => setEditingItem({ ...editingItem, subject: v })}>
                {SUBJECTS.map(s => <Option key={s} value={s}>{s}</Option>)}
              </Select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Teacher</label>
              <Select size="large" style={{ width: "100%" }} value={editingItem.teacherId || undefined} placeholder="Select teacher" onChange={v => setEditingItem({ ...editingItem, teacherId: v })}>
                {teachers.map(t => <Option key={t._id} value={String(t.id)}>{t.name} — {t.subject}</Option>)}
              </Select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Day</label>
              <Select size="large" style={{ width: "100%" }} value={editingItem.day || undefined} placeholder="Select day" onChange={v => setEditingItem({ ...editingItem, day: v })}>
                {DAYS.map(d => <Option key={d} value={d}>{d}</Option>)}
              </Select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Time Slot</label>
              <Select size="large" style={{ width: "100%" }} value={editingItem.time || undefined} placeholder="Select period" onChange={v => setEditingItem({ ...editingItem, time: v })}>
                {PERIODS.map(p => <Option key={p.id} value={`${p.label} (${p.time})`}>{p.label} — {p.time}</Option>)}
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ManageSchedule;