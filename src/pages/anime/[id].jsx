// src/pages/anime/[id].jsx
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import app, { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

function parseDate(d){ if(!d) return ""; if(typeof d==="string") return new Date(d).toLocaleString(); if(d._seconds) return new Date(d._seconds*1000).toLocaleString(); return new Date(d).toLocaleString(); }

export default function AnimeDetail(){
  const router = useRouter();
  const { id } = router.query;
  const [anime,setAnime]=useState(null);
  const [loading,setLoading]=useState(true);
  const [user,setUser]=useState(null);
  const [avg,setAvg]=useState(0);
  const [myRating,setMyRating]=useState(0);
  const [comments,setComments]=useState([]);
  const [text,setText]=useState("");

  useEffect(()=>{ const unsub = onAuthStateChanged(auth,u=>setUser(u)); return ()=>unsub(); },[]);

  useEffect(()=>{
    if(!id) return;
    setLoading(true);
    (async ()=>{
      try{
        const r = await fetch(`/api/animes?id=${id}`);
        if(!r.ok){ setAnime(null); setLoading(false); return; }
        const j = await r.json(); setAnime(j);
        const ra = await fetch(`/api/ratings?animeId=${id}`); if(ra.ok) { const ja=await ra.json(); setAvg(ja.avg||0); }
        const rc = await fetch(`/api/comments?animeId=${id}`); if(rc.ok) setComments(await rc.json());
        if(auth.currentUser){
          const token = await auth.currentUser.getIdToken();
          const rm = await fetch(`/api/ratings?animeId=${id}&mine=1`, { headers:{ Authorization:`Bearer ${token}` }});
          if(rm.ok){ const jm = await rm.json(); if(jm.myRating) setMyRating(jm.myRating); }
        }
      }catch(e){ console.error(e); }
      setLoading(false);
    })();
  },[id]);

  async function submitRating(v, characterId=null){
    if(!user) return alert("سجل دخول");
    try{
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/ratings", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify({ animeId:id, rating:v, characterId }) });
      if(res.ok){ setMyRating(v); const r2 = await fetch(`/api/ratings?animeId=${id}`); if(r2.ok){ const j=await r2.json(); setAvg(j.avg||0); } }
      else alert("فشل");
    }catch(e){ console.error(e); alert("فشل"); }
  }

  async function postComment(){
    if(!user) return alert("سجل دخول");
    if(!text.trim()) return;
    try{
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/comments", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify({ animeId:id, text })});
      if(res.ok){ setText(""); const rc = await fetch(`/api/comments?animeId=${id}`); if(rc.ok) setComments(await rc.json()); }
    }catch(e){ console.error(e); alert("فشل"); }
  }

  if(loading) return (<><Navbar /><div className="card" style={{maxWidth:1000,margin:"18px auto"}}>جارِ التحميل...</div></>);
  if(!anime) return (<><Navbar /><div className="card" style={{maxWidth:1000,margin:"18px auto"}}>لم يتم العثور على الأنمي (404).</div></>);

  return (
    <>
    <Navbar />
    <div style={{ maxWidth:1100, margin:"18px auto" }}>
      <div className="card" style={{ display:"flex", gap:18 }}>
        <img src={anime.poster||"/logo.png"} alt={anime.title} style={{ width:320,height:440,objectFit:"cover",borderRadius:8 }} />
        <div style={{ flex:1 }}>
          <h1 style={{ marginTop:0 }}>{anime.title}</h1>
          <div className="small-muted">{(anime.genres || []).join(" • ")} • {parseDate(anime.createdAt||anime.date)}</div>
          <p style={{ marginTop:12 }}>{anime.description}</p>
          <div style={{ marginTop:12 }}>
            <div>متوسط المستخدمين: <strong>{avg}</strong></div>
            <div className="stars" style={{ marginTop:8 }}>
              {[1,2,3,4,5].map(i=> (<span key={i} className={`star ${i<=myRating?"filled":""}`} onClick={()=>submitRating(i)}>★</span> ))}
            </div>
          </div>
        </div>
      </div>

      {Array.isArray(anime.characters) && anime.characters.length>0 && (
        <div className="card" style={{ marginTop:12 }}>
          <h3>الشخصيات</h3>
          <div style={{ display:"grid", gap:12 }}>
            {anime.characters.map(ch=>(
              <div key={ch.id} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <img src={ch.avatar||"/1.png"} alt={ch.name} style={{ width:84,height:84,objectFit:"cover",borderRadius:8 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800 }}>{ch.name}</div>
                  <div className="small-muted">{ch.role}</div>
                </div>
                <div className="stars">
                  {[1,2,3,4,5].map(i=> <span key={i} className="star" onClick={()=>submitRating(i, ch.id)}>★</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop:12 }}>
        <h3>التعليقات ({comments.length})</h3>
        <div style={{ marginTop:10 }}>
          {comments.map(c=>(
            <div key={c.id} className="comment">
              <img className="avatar" src={c.avatar||"/1.png"} alt="av" />
              <div>
                <div><strong>{c.username}</strong> <span className="small-muted"> • {parseDate(c.createdAt)}</span></div>
                <div style={{ marginTop:6 }}>{c.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:12 }}>
          <textarea className="input" placeholder="اكتب تعليقك..." value={text} onChange={e=>setText(e.target.value)} style={{ minHeight:96 }} />
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <button className="btn" onClick={postComment}>نشر</button>
            <button className="btn-ghost" onClick={()=>setText("")}>مسح</button>
          </div>
        </div>
      </div>

    </div>
    </>
  );
}
