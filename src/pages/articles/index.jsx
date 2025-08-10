// src/pages/articles/index.jsx
import React,{useEffect,useState} from "react";
import Navbar from "../../../components/Navbar";

export default function Articles(){
  const [arts,setArts]=useState([]);
  useEffect(()=>{ fetch("/api/articles").then(r=>r.ok? r.json().then(j=>setArts(j)): setArts([])).catch(()=>{}); },[]);
  return (
    <>
      <Navbar />
      <div style={{ maxWidth:1200, margin:"18px auto" }}>
        <h2>المقالات</h2>
        <div className="card">
          <div style={{ display:"grid", gap:12 }}>
            {arts.map(a=>(
              <div key={a.id} className="article-card">
                <img src={a.poster||"/logo.png"} alt={a.title} />
                <div>
                  <h4 style={{ margin:0 }}>{a.title}</h4>
                  <div className="small-muted">{a.author} • {a.createdAt || a.date}</div>
                  <p className="small-muted">{a.excerpt}</p>
                  <div style={{ marginTop:8 }}><a className="btn" href={`/articles/${a.id}`}>اقرأ</a></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
