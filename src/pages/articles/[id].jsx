// src/pages/articles/[id].jsx
import React,{useEffect,useState} from "react";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";

export default function ArticleDetail(){
  const router = useRouter(); const { id } = router.query;
  const [article,setArticle]=useState(null); const [loading,setLoading]=useState(true);

  useEffect(()=>{
    if(!id) return;
    (async ()=>{
      try{
        const r = await fetch(`/api/articles?id=${id}`);
        if(!r.ok){ setArticle(null); setLoading(false); return; }
        setArticle(await r.json());
      }catch(e){ console.error(e); }
      setLoading(false);
    })();
  },[id]);

  if(loading) return (<><Navbar /><div className="card" style={{maxWidth:1000,margin:"18px auto"}}>جارِ التحميل...</div></>);
  if(!article) return (<><Navbar /><div className="card" style={{maxWidth:1000,margin:"18px auto"}}>المقال غير موجود.</div></>);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth:900, margin:"18px auto" }}>
        <div className="card">
          <h1 style={{ marginTop:0 }}>{article.title}</h1>
          <div className="small-muted">{article.author} • {article.createdAt || article.date}</div>
          <div style={{ marginTop:12 }} dangerouslySetInnerHTML={{ __html: article.content || `<p>${article.excerpt}</p>` }} />
        </div>
      </div>
    </>
  );
}
