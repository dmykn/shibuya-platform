// src/pages/home.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Home() {
  const [banner, setBanner] = useState(null);
  const [animes, setAnimes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [ba, ra, rc, rb] = await Promise.all([
          fetch("/api/banner").then(r=> r.ok ? r.json() : null).catch(()=>null),
          fetch("/api/animes").then(r=> r.ok ? r.json() : []),
          fetch("/api/characters").then(r=> r.ok ? r.json() : []),
          fetch("/api/articles").then(r=> r.ok ? r.json() : [])
        ]);
        setBanner(ba);
        setAnimes(ra || []);
        setCharacters(rc || []);
        setArticles(rb || []);
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth:1200, margin:"18px auto", padding:12 }}>
        {banner && (
          <div className="card" style={{ display:"flex", gap:18, alignItems:"center", padding:18 }}>
            <img src={banner.image || "/logo.png"} style={{ width:220,height:120,objectFit:"cover",borderRadius:8 }} />
            <div style={{ flex:1 }}>
              <h2 style={{ margin:0 }}>{banner.title}</h2>
              <p className="small-muted">{banner.subtitle}</p>
              <div style={{ marginTop:10 }}>
                <a className="btn" href={banner.link || "#"}>عرض الحدث</a>
              </div>
            </div>
          </div>
        )}

        <div className="main-content" style={{ marginTop:18 }}>
          <section>
            <div className="card">
              <h3>الأحدث في الأنميات</h3>
              <div className="grid" style={{ marginTop:12 }}>
                {animes.slice(0,8).map(a=>(
                  <article key={a.id} className="anime-card card">
                    <img src={a.poster || "/logo.png"} alt={a.title} />
                    <div style={{ padding:12 }}>
                      <h4 style={{ margin:0 }}>{a.title}</h4>
                      <div className="small-muted" style={{ marginTop:8 }}>{a.description?.slice(0,120)}</div>
                      <div style={{ marginTop:10, display:"flex", gap:8 }}>
                        <a className="btn" href={`/anime/${a.id}`}>تفاصيل</a>
                        <a className="link-btn" href={a.links?.official||"#"} target="_blank">شاهد رسمي</a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginTop:18 }}>
              <h3>مقالات مختارة</h3>
              <div style={{ display:"grid",gap:12,marginTop:12 }}>
                {articles.slice(0,5).map(ar=>(
                  <div key={ar.id} className="article-card">
                    <img src={ar.poster || "/logo.png"} alt={ar.title} />
                    <div>
                      <h4 style={{ margin:0 }}>{ar.title}</h4>
                      <div className="small-muted">{ar.excerpt}</div>
                      <div style={{ marginTop:8 }}>
                        <a className="btn" href={`/article/${ar.id}`}>اقرأ</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside>
            <div className="card">
              <h4>آخر الشخصيات المضافة</h4>
              <div style={{ marginTop:8 }}>
                {characters.slice(0,6).map(c=>(
                  <div key={c.id} style={{ display:"flex",gap:8,alignItems:"center",marginBottom:8 }}>
                    <img src={c.avatar||"/1.png"} style={{ width:56,height:56,borderRadius:8,objectFit:"cover" }} />
                    <div><strong>{c.name}</strong><div className="small-muted">{(c.animeIds||[]).length} أنميات</div></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginTop:12 }}>
              <h4>الرعاة</h4>
              <div className="small-muted">Crunchyroll • Netflix</div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
