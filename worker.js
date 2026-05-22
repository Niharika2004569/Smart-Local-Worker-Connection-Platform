import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Workers() {
  const [workers, setWorkers] = useState([]);
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5001/api/workers";

  const fetchWorkers = async () => {
    try {
      const res = await axios.get(API_BASE);
      setWorkers(res.data);
    } catch (err) {
      console.error("Error fetching workers:", err);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API_BASE}/search?skill=${skill}&location=${location}`);
      setWorkers(res.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#1e293b" }}>Find Professional Workers</h2>
      
      {/* Search Section */}
      <div style={{ marginBottom: "30px", display: "flex", gap: "10px" }}>
        <input placeholder="Skill" value={skill} onChange={(e) => setSkill(e.target.value)} style={{ padding: "12px", flex: 1, borderRadius: "10px", border: "1px solid #ddd" }} />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={{ padding: "12px", flex: 1, borderRadius: "10px", border: "1px solid #ddd" }} />
        <button onClick={handleSearch} style={{ padding: "10px 20px", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>Search</button>
      </div>

      {/* Workers Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
        {workers.map((w) => (
          <div 
            key={w._id} 
            onClick={() => navigate(`/worker/${w._id}`)} 
            style={{ 
              position: "relative", 
              border: "1px solid #f1f5f9", 
              padding: "25px 15px", 
              cursor: "pointer", 
              borderRadius: "20px", 
              backgroundColor: "#fff", 
              textAlign: "center",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
            }}
          >
            {/* Pro Worker Badge */}
            <span style={{ position: "absolute", top: "12px", left: "12px", fontSize: "9px", backgroundColor: "#6366f1", color: "white", padding: "2px 8px", borderRadius: "20px", fontWeight: "bold", textTransform: "uppercase" }}>
              Pro Worker
            </span>

            <div style={{ fontSize: "40px", marginBottom: "10px", color: "#e2e8f0" }}>👤</div>
            <h3 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "16px" }}>{w.name}</h3>
            
            <p style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: "13px" }}>
              {Array.isArray(w.skills) && w.skills.length > 0 ? w.skills.join(", ") : (w.skill || "Professional")}
            </p>

            {/* Price Display */}
            <p style={{ margin: 0, color: "#6366f1", fontWeight: "bold", fontSize: "15px" }}>
              ₹{w.serviceCost || "299"} <span style={{ fontSize: "11px", fontWeight: "normal", color: "#94a3b8" }}>/ job</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Workers;
