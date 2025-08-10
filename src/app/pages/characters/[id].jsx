// src/pages/characters/[id].jsx
import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import { useRouter } from "next/router";

export default function CharacterDetail(){
  const router = useRouter(); const { id } = router.query;
  const [char,setChar]=useState(null); const [loading,setLoading]=useState(true);

  useEffect(()=>{
    if(!id) return;
    (async ()=>{
      try{
        const r = await fetch(`/api/characters?id=${id}`);
        if(!r.ok){ setChar(null); setLoading(false); return; }
        setChar(await r.json());
      }catch(e){ console.error(e); }
      setLoading(false);
    })();
  },[id]);

  if(loading) return (<><Navbar /><div className="card" style={{maxWidth:1000,margin:"18px auto"}}>جارِ التحميل...</div></>);
  if(!char) return (<><Navbar /><div className="card" style={{maxWidth:1000,margin:"18px auto"}}>لم يتم العثور على الشخصية.</div></>);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth:1100, margin:"18px auto" }}>
        <div className="card" style={{ display:"flex", gap:18 }}>
          <img src={char.avatar||"/1.png"} style={{ width:320,height:420,objectFit:"cover",borderRadius:8 }} />
          <div style={{ flex:1 }}>
            <h1 style={{ marginTop:0 }}>{char.name}</h1>
            <div className="small-muted">{char.role || ""}</div>
            <p style={{ marginTop:12 }}>{char.bio}</p>
            <div style={{ marginTop:12 }}>
              <h4>الأنميات المرتبطة</h4>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {(char.animeIds||[]).map(aid => <a key={aid} className="link-btn" href={`/anime/${aid}`}>عرض الأنمي</a>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
