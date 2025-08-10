// src/pages/team.jsx
import React from "react";
import Navbar from "../components/Navbar";

export default function Team(){
  const members = [
    { name: "فريق شيبويا", role: "المحرر العام" },
    { name: "بدر", role: "المدير التقني" },
    { name: "رضا", role: "الكاتب" }
  ];
  return (
    <>
      <Navbar />
      <div style={{ maxWidth:900, margin:"18px auto" }}>
        <div className="card">
          <h2>فريق شيبويا</h2>
          <div style={{ display:"grid", gap:12 }}>
            {members.map(m => <div key={m.name}><strong>{m.name}</strong><div className="small-muted">{m.role}</div></div>)}
          </div>
        </div>
      </div>
    </>
  );
}
