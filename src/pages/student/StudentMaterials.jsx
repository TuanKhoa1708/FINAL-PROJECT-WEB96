import { useEffect, useState } from "react";
import { Card } from "antd";

function StudentMaterials() {
  const [materials, setMaterials] = useState([]);

  const API =
    "https://mindx-mockup-server.vercel.app/api/resources/materials?apiKey=69ca789b3bb225ca08190764";

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await fetch(API);
        const data = await res.json();
        setMaterials(data.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMaterials();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2 className="section-title">Learning Materials</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {materials.map((item) => (
          <Card
            key={item._id}
            title={item.title}
            style={{
              width: 300,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <p>{item.description}</p>

            {item.fileUrl && (
              <a href={item.fileUrl} target="_blank" rel="noreferrer">
                📎 View File
              </a>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default StudentMaterials;