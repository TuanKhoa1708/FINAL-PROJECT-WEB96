import { useEffect, useState } from "react";
import { Table, Button, Modal, Input } from "antd";

function ManageMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  const API =
    "https://mindx-mockup-server.vercel.app/api/resources/materials?apiKey=69ca789b3bb225ca08190764";

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setMaterials(data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingItem),
      });

      const data = await res.json();

      setMaterials([...materials, data.data]);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    try {
      await fetch(
        `https://mindx-mockup-server.vercel.app/api/resources/materials/${editingItem._id}?apiKey=69ca789b3bb225ca08190764`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingItem),
        }
      );

      const updatedList = materials.map((item) =>
        item._id === editingItem._id ? editingItem : item
      );

      setMaterials(updatedList);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (_id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this material?"))
        return;

      await fetch(
        `https://mindx-mockup-server.vercel.app/api/resources/materials/${_id}?apiKey=69ca789b3bb225ca08190764`,
        {
          method: "DELETE",
        }
      );

      setMaterials(materials.filter((item) => item._id !== _id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2 className="section-title">Manage Materials</h2>

      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Button
          type="primary"
          style={{
            marginBottom: 16,
            backgroundColor: "#20c997",
            borderColor: "#20c997",
          }}
          onClick={() =>
            setEditingItem({
              title: "",
              description: "",
              fileUrl: "",
            })
          }
        >
          Add Material
        </Button>

        <Table
          dataSource={materials}
          rowKey="_id"
          columns={[
            { title: "Title", dataIndex: "title" },
            { title: "Description", dataIndex: "description" },
            { title: "File URL", dataIndex: "fileUrl" },
            {
              title: "Actions",
              render: (_, record) => (
                <>
                  <Button
                    style={{ color: "#20c997", borderColor: "#20c997" }}
                    onClick={() => setEditingItem(record)}
                  >
                    Edit
                  </Button>
                  <Button
                    danger
                    style={{ marginLeft: 8 }}
                    onClick={() => handleDelete(record._id)}
                  >
                    Delete
                  </Button>
                </>
              ),
            },
          ]}
        />

        <Modal
          open={!!editingItem}
          onCancel={() => setEditingItem(null)}
          onOk={() => {
            if (editingItem._id) {
              handleUpdate();
            } else {
              handleAdd();
            }
          }}
          title={editingItem?._id ? "Edit Material" : "Add Material"}
        >
          {editingItem && (
            <>
              <Input
                placeholder="Title"
                value={editingItem.title || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, title: e.target.value })
                }
                style={{ marginBottom: 8 }}
              />

              <Input
                placeholder="Description"
                value={editingItem.description || ""}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    description: e.target.value,
                  })
                }
                style={{ marginBottom: 8 }}
              />

              <Input
                placeholder="File URL"
                value={editingItem.fileUrl || ""}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    fileUrl: e.target.value,
                  })
                }
              />
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default ManageMaterials;