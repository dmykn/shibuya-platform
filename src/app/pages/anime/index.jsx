// src/pages/anime/index.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";

export default function Animes(){
  const [animes,setAnimes] = useState([]);
  useEffect(()=>{ fetch("/api/animes").then(r=>r.ok? r.json().then(j=>setAnimes(j)): setAnimes([])).catch(()=>{}); },[]);
  return (
    <>
      <Navbar />
      <div style={{ maxWidth:1200, margin:"18px auto" }}>
        <h2>الأنميات</h2>
        <div className="card">
          <div className="grid">
            {animes.map(a=>(
              <div key={a.id} className="anime-card card">
                <img src={a.poster||"/logo.png"} alt={a.title} />
                <div style={{ padding:10 }}>
                  <h4 style={{ margin:0 }}>{a.title}</h4>
                  <div className="small-muted">{a.description?.slice(0,100)}</div>
                  <div style={{ marginTop:8 }}>
                    <a className="btn" href={`/anime/${a.id}`}>فتح</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
