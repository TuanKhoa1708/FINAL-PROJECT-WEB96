import { useEffect, useState } from "react";
import { Typography, Tag, Spin, Radio, Table, Tooltip } from "antd";
import { CalendarOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useOutletContext } from "react-router-dom";

const { Title, Text } = Typography;

const PERIODS = [
  { id: 1, label: "Period 1", time: "07:00 – 08:30" },
  { id: 2, label: "Period 2", time: "08:45 – 10:15" },
  { id: 3, label: "Period 3", time: "10:30 – 12:00" },
  { id: 4, label: "Period 4", time: "13:00 – 14:30" },
  { id: 5, label: "Period 5", time: "14:45 – 16:15" },
];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SUBJECT_COLORS = {
  Math:       { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  English:    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  Physics:    { bg: "#FAF5FF", text: "#7C3AED", border: "#DDD6FE" },
  Chemistry:  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  History:    { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  Literature: { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  Biology:    { bg: "#F7FEE7", text: "#3F6212", border: "#D9F99D" },
};

function TeacherSchedule() {
  const { user } = useOutletContext();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState("calendar");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://mindx-mockup-server.vercel.app/api/resources/schedule?apiKey=69ca789b3bb225ca08190764");
        const data = await res.json();
        const all = data.data.data || [];
        // Filter for this teacher's classes
        const mine = all.filter(s => String(s.teacherId) === String(user?.id));
        setSchedule(mine);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getCellItems = (day, periodId) =>
    schedule.filter(s => s.day === day && (s.time?.includes(periodId.toString()) || s.time?.includes(PERIODS.find(p => p.id === periodId)?.label)));

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">My Teaching Schedule</Title>
          <Text style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
            {schedule.length} classes assigned
            {user?.subject && (
              <> — Subject: <Tag color="blue" style={{ fontWeight: 600 }}>{user.subject}</Tag></>
            )}
          </Text>
        </div>
        <Radio.Group value={view} onChange={e => setView(e.target.value)} buttonStyle="solid" size="middle">
          <Radio.Button value="calendar"><CalendarOutlined /> Calendar</Radio.Button>
          <Radio.Button value="table"><UnorderedListOutlined /> Table</Radio.Button>
        </Radio.Group>
      </div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Classes", value: schedule.length, icon: "📚" },
          { label: "Days Active", value: [...new Set(schedule.map(s => s.day))].length, icon: "📅" },
          { label: "Unique Classes", value: [...new Set(schedule.map(s => s.class))].length, icon: "🏫" },
        ].map(card => (
          <div key={card.label} className="premium-card" style={{ flex: 1, padding: "16px 20px", display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ fontSize: 30 }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1.2 }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="premium-card" style={{ padding: 20 }}>
          {schedule.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <div className="empty-text">No schedule assigned</div>
              <div className="empty-sub">Ask your administrator to assign you to classes.</div>
            </div>
          ) : (
            <div className="timetable-wrapper" style={{ boxShadow: "none", border: "none" }}>
              <table className="timetable-grid">
                <thead>
                  <tr>
                    <th>Time</th>
                    {DAYS.map(d => <th key={d}>{d}</th>)}
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
                              <div style={{ height: 60 }} />
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {items.map(item => {
                                  const c = SUBJECT_COLORS[item.subject] || { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" };
                                  return (
                                    <Tooltip key={item._id} title={<div style={{ fontSize: 12 }}>
                                      <div><b>Class:</b> {item.class}</div>
                                      <div><b>Room:</b> {item.room || "TBD"}</div>
                                    </div>}>
                                      <div className="timetable-cell" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                                        <div className="subject-name">{item.subject || user?.subject}</div>
                                        <div className="teacher-name">{item.class}</div>
                                        <div className="room-name">{item.room || "Room TBD"}</div>
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
          )}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="premium-card">
          <Table
            dataSource={schedule} rowKey="_id"
            pagination={{ pageSize: 10, showTotal: t => `${t} classes` }}
            locale={{ emptyText: (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <div className="empty-text">No schedule assigned</div>
              </div>
            )}}
            columns={[
              { title: "Class", dataIndex: "class", render: t => <Tag color="geekblue" style={{ fontWeight: 700 }}>{t}</Tag> },
              { title: "Subject", dataIndex: "subject", render: t => { const c = SUBJECT_COLORS[t]; return <Tag style={c ? { background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: 600 } : {}}>{t || user?.subject}</Tag>; } },
              { title: "Day", dataIndex: "day", sorter: (a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) },
              { title: "Time", dataIndex: "time" },
              { title: "Room", dataIndex: "room", render: t => t || <span style={{ color: "#94A3B8" }}>TBD</span> },
            ]}
          />
        </div>
      )}
    </div>
  );
}

export default TeacherSchedule;
