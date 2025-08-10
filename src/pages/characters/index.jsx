// src/pages/characters/index.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

export default function Characters(){
  const [chars,setChars]=useState([]);
  useEffect(()=>{ fetch("/api/characters").then(r=>r.ok? r.json().then(j=>setChars(j)): setChars([])).catch(()=>{}); },[]);
  return (
    <>
      <Navbar />
      <div style={{ maxWidth:1200, margin:"18px auto" }}>
        <h2>شخصيات</h2>
        <div className="card">
          <div className="grid">
            {chars.map(c=>(
              <div key={c.id} className="card" style={{ padding:8 }}>
                <img src={c.avatar||"/1.png"} style={{ width:"100%",height:180,objectFit:"cover",borderRadius:8 }} />
                <div style={{ padding:10 }}>
                  <h4 style={{ margin:0 }}>{c.name}</h4>
                  <div className="small-muted">{c.bio?.slice(0,100)}</div>
                  <div style={{ marginTop:8 }}><a className="btn" href={`/characters/${c.id}`}>عرض</a></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
