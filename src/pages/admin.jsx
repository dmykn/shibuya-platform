// src/pages/admin.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../app/globals.css";
import app, { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "../components/toast.jsx";

/**
 * Admin page with tabs:
 * - Dashboard
 * - Animes (CRUD)
 * - Characters (CRUD)
 * - Articles (CRUD)
 * - Banner
 * - Sponsors
 * - Badwords
 * - Founders (manage admins by email)
 *
 * All admin actions call /api/* endpoints built earlier and attach Authorization header with idToken.
 */

function TabButton({ active, onClick, children }) {
  return <button className={`link-btn ${active ? "active" : ""}`} style={{ background: active ? "linear-gradient(90deg,var(--accent),var(--accent-2))" : "transparent", color: active ? "#fff" : undefined }} onClick={onClick}>{children}</button>;
}

export default function AdminPage(){
  const [allowed, setAllowed] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const toast = useToast();

  useEffect(()=>{
    async function load(){
      try{
        const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
        const res = await fetch("/api/admin", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (res.ok) {
          const j = await res.json();
          setAllowed(true);
          setStats(j.stats || null);
        } else {
          setAllowed(false);
        }
      }catch(e){ console.error(e); setAllowed(false); }
      setLoading(false);
    }
    const unsub = onAuthStateChanged(auth, () => load());
    load();
    return () => unsub();
  },[]);

  if (loading) return (<><Navbar /><div className="card" style={{ maxWidth:900, margin:"18px auto" }}>جارِ التحقق...</div></>);
  if (!allowed) return (<><Navbar /><div className="card" style={{ maxWidth:900, margin:"18px auto" }}>هذه الصفحة للأدمن فقط.</div></>);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth:1200, margin:"18px auto" }}>
        <h2>لوحة إدارة شيبويا</h2>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
          <TabButton active={tab==="dashboard"} onClick={()=>setTab("dashboard")}>Dashboard</TabButton>
          <TabButton active={tab==="animes"} onClick={()=>setTab("animes")}>Animes</TabButton>
          <TabButton active={tab==="characters"} onClick={()=>setTab("characters")}>Characters</TabButton>
          <TabButton active={tab==="articles"} onClick={()=>setTab("articles")}>Articles</TabButton>
          <TabButton active={tab==="banner"} onClick={()=>setTab("banner")}>Banner</TabButton>
          <TabButton active={tab==="sponsors"} onClick={()=>setTab("sponsors")}>Sponsors</TabButton>
          <TabButton active={tab==="badwords"} onClick={()=>setTab("badwords")}>Badwords</TabButton>
          <TabButton active={tab==="founders"} onClick={()=>setTab("founders")}>Founders</TabButton>
        </div>

        <div className="card">
          {tab==="dashboard" && <AdminDashboard stats={stats} />}
          {tab==="animes" && <AdminAnimes toast={toast} />}
          {tab==="characters" && <AdminCharacters toast={toast} />}
          {tab==="articles" && <AdminArticles toast={toast} />}
          {tab==="banner" && <AdminBanner toast={toast} />}
          {tab==="sponsors" && <AdminSponsors toast={toast} />}
          {tab==="badwords" && <AdminBadwords toast={toast} />}
          {tab==="founders" && <AdminFounders toast={toast} />}
        </div>
      </div>
    </>
  );
}

/* ====== Small components for admin tabs (each uses fetch /api/* with token) ====== */

function AdminDashboard({stats}) {
  return (
    <div>
      <h3>إحصائيات الموقع</h3>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:12 }}>
        <div className="card" style={{ minWidth:160 }}><strong>المستخدمين</strong><div className="small-muted">{stats?.users ?? "—"}</div></div>
        <div className="card" style={{ minWidth:160 }}><strong>الأنميات</strong><div className="small-muted">{stats?.animes ?? "—"}</div></div>
        <div className="card" style={{ minWidth:160 }}><strong>المقالات</strong><div className="small-muted">{stats?.articles ?? "—"}</div></div>
        <div className="card" style={{ minWidth:160 }}><strong>الشخصيات</strong><div className="small-muted">{stats?.characters ?? "—"}</div></div>
      </div>
    </div>
  );
}

/* AdminAnimes: list + add + edit + delete */
function AdminAnimes({ toast }){
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title:"", description:"", poster:"", links:{}, genres: "" });

  useEffect(()=>{ load(); }, []);

  async function load(){
    try{
      const r = await fetch("/api/animes");
      if(r.ok) setList(await r.json());
    }catch(e){ console.error(e); }
  }

  async function submit(){
    try{
      const token = await auth.currentUser.getIdToken();
      const body = { title: form.title, description: form.description, poster: form.poster, genres: form.genres.split(",").map(s=>s.trim()).filter(Boolean) };
      const r = await fetch("/api/animes", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify(body) });
      if(r.ok){ toast.show("تم إضافة الأنمي","success"); setForm({ title:"", description:"", poster:"", links:{}, genres:"" }); load(); }
      else { const j=await r.json(); toast.show(j.error||"فشل","error"); }
    }catch(e){ console.error(e); toast.show("خطأ","error"); }
  }

  async function remove(id){
    if(!confirm("تأكيد حذف الأنمي؟")) return;
    try{
      const token = await auth.currentUser.getIdToken();
      const r = await fetch(`/api/animes?id=${encodeURIComponent(id)}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
      if(r.ok){ toast.show("تم الحذف","success"); load(); } else toast.show("فشل","error");
    }catch(e){ console.error(e); toast.show("خطأ","error"); }
  }

  return (
    <div style={{ display:"grid", gap:12 }}>
      <h3>إدارة الأنميات</h3>

      <div style={{ display:"grid", gap:8 }}>
        <input className="input" placeholder="عنوان" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
        <input className="input" placeholder="رابط الصورة" value={form.poster} onChange={e=>setForm({...form, poster: e.target.value})} />
        <input className="input" placeholder="الأنواع (مفصولة بفاصلة)" value={form.genres} onChange={e=>setForm({...form, genres: e.target.value})} />
        <textarea className="input" placeholder="الوصف" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn" onClick={submit}>أضف الأنمي</button>
        </div>
      </div>

      <div>
        <h4>قائمة الأنميات</h4>
        <div style={{ marginTop:8 }}>
          {list.map(a=>(
            <div key={a.id} style={{ display:"flex", gap:12, alignItems:"center", marginBottom:8 }}>
              <img src={a.poster||"/logo.png"} style={{ width:84,height:84,objectFit:"cover",borderRadius:8 }} />
              <div style={{ flex:1 }}>
                <strong>{a.title}</strong>
                <div className="small-muted">{(a.genres||[]).join(", ")}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn" onClick={()=> window.location.href=`/anime/${a.id}`}>عرض</button>
                <button className="btn-ghost" onClick={()=> remove(a.id)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* AdminCharacters: add/edit/delete */
function AdminCharacters({ toast }){
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name:"", bio:"", avatar:"", animeIds:"" });

  useEffect(()=>{ load(); }, []);
  async function load(){
    try{ const r = await fetch("/api/characters"); if(r.ok) setList(await r.json()); }catch(e){ console.error(e); }
  }

  async function submit(){
    try{
      const token = await auth.currentUser.getIdToken();
      const body = { name: form.name, bio: form.bio, avatar: form.avatar, animeIds: form.animeIds.split(",").map(s=>s.trim()).filter(Boolean) };
      const r = await fetch("/api/characters", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify(body) });
      if(r.ok){ toast.show("تم إضافة شخصية","success"); setForm({ name:"", bio:"", avatar:"", animeIds:"" }); load(); } else toast.show("فشل","error");
    }catch(e){ console.error(e); toast.show("خطأ","error"); }
  }

  async function remove(id){
    if(!confirm("تأكيد حذف؟")) return;
    try{ const token = await auth.currentUser.getIdToken(); const r = await fetch(`/api/characters?id=${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } }); if(r.ok){ toast.show("تم الحذف","success"); load(); } }catch(e){ console.error(e); }
  }

  return (
    <div style={{ display:"grid", gap:12 }}>
      <h3>إدارة الشخصيات</h3>
      <div style={{ display:"grid", gap:8 }}>
        <input className="input" placeholder="الاسم" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
        <input className="input" placeholder="رابط الصورة" value={form.avatar} onChange={e=>setForm({...form, avatar: e.target.value})} />
        <input className="input" placeholder="الأنميات (IDs مفصولة بفاصلة)" value={form.animeIds} onChange={e=>setForm({...form, animeIds: e.target.value})} />
        <textarea className="input" placeholder="البيو" value={form.bio} onChange={e=>setForm({...form, bio: e.target.value})} />
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn" onClick={submit}>أضف شخصية</button>
        </div>
      </div>

      <div>
        <h4>قائمة الشخصيات</h4>
        {list.map(c=>(
          <div key={c.id} style={{ display:"flex", gap:12, alignItems:"center", marginBottom:8 }}>
            <img src={c.avatar||"/1.png"} style={{ width:84,height:84,objectFit:"cover",borderRadius:8 }} />
            <div style={{ flex:1 }}>
              <strong>{c.name}</strong>
              <div className="small-muted">{c.bio?.slice(0,100)}</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn" onClick={()=> window.location.href=`/character/${c.id}`}>عرض</button>
              <button className="btn-ghost" onClick={()=> remove(c.id)}>حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* AdminArticles: create/edit/delete with simple editor (textarea) */
function AdminArticles({ toast }){
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title:"", excerpt:"", content:"", poster:"" });

  useEffect(()=>{ load(); }, []);
  async function load(){ try{ const r = await fetch("/api/articles"); if(r.ok) setList(await r.json()); }catch(e){ console.error(e); } }

  async function submit(){
    try{
      const token = await auth.currentUser.getIdToken();
      const body = { title: form.title, excerpt: form.excerpt, content: form.content, poster: form.poster };
      const r = await fetch("/api/articles", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify(body) });
      if(r.ok){ toast.show("تم إضافة المقال","success"); setForm({ title:"", excerpt:"", content:"", poster:"" }); load(); } else { const j=await r.json(); toast.show(j.error||"فشل","error"); }
    }catch(e){ console.error(e); toast.show("خطأ","error"); }
  }

  async function remove(id){
    if(!confirm("تأكيد حذف المقال؟")) return;
    try{ const token = await auth.currentUser.getIdToken(); const r = await fetch(`/api/articles?id=${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } }); if(r.ok){ toast.show("تم الحذف","success"); load(); } }catch(e){ console.error(e); }
  }

  return (
    <div style={{ display:"grid", gap:12 }}>
      <h3>إدارة المقالات</h3>
      <div style={{ display:"grid", gap:8 }}>
        <input className="input" placeholder="العنوان" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
        <input className="input" placeholder="الوصف المختصر" value={form.excerpt} onChange={e=>setForm({...form, excerpt: e.target.value})} />
        <input className="input" placeholder="رابط صورة المقال" value={form.poster} onChange={e=>setForm({...form, poster: e.target.value})} />
        <textarea className="input" placeholder="محتوى المقال (نص، الأسطر تحوّل لفقرة عند العرض)" value={form.content} onChange={e=>setForm({...form, content: e.target.value})} />
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn" onClick={submit}>نشر المقال</button>
        </div>
      </div>

      <div>
        <h4>قائمة المقالات</h4>
        {list.map(a=>(
          <div key={a.id} style={{ display:"flex", gap:12, alignItems:"center", marginBottom:8 }}>
            <img src={a.poster||"/logo.png"} style={{ width:84,height:84,objectFit:"cover",borderRadius:8 }} />
            <div style={{ flex:1 }}>
              <strong>{a.title}</strong>
              <div className="small-muted">{a.excerpt}</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn" onClick={()=> window.location.href=`/article/${a.id}`}>عرض</button>
              <button className="btn-ghost" onClick={()=> remove(a.id)}>حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* AdminBanner (meta banner document) */
function AdminBanner({ toast }){
  const [banner, setBanner] = useState({ title:"", subtitle:"", image:"", link:"" });
  useEffect(()=>{ (async ()=>{ const r = await fetch("/api/banner"); if(r.ok){ const j = await r.json(); if(j) setBanner(j); } })(); }, []);

  async function save(){
    try{
      const token = await auth.currentUser.getIdToken();
      const r = await fetch("/api/banner", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify(banner) });
      if(r.ok) { toast.show("تم تحديث البانر","success"); }
    }catch(e){ console.error(e); toast.show("خطأ","error"); }
  }

  return (
    <div style={{ display:"grid", gap:8 }}>
      <h3>البانر الرئيسي</h3>
      <input className="input" placeholder="العنوان" value={banner.title} onChange={e=>setBanner({...banner, title: e.target.value})} />
      <input className="input" placeholder="العنوان الفرعي" value={banner.subtitle} onChange={e=>setBanner({...banner, subtitle: e.target.value})} />
      <input className="input" placeholder="رابط الصورة" value={banner.image} onChange={e=>setBanner({...banner, image: e.target.value})} />
      <input className="input" placeholder="رابط الزر" value={banner.link} onChange={e=>setBanner({...banner, link: e.target.value})} />
      <div style={{ display:"flex", gap:8 }}><button className="btn" onClick={save}>حفظ</button></div>
    </div>
  );
}

/* AdminSponsors */
function AdminSponsors({ toast }){
  const [list,setList] = useState([]);
  const [name,setName] = useState("");
  const [logo,setLogo] = useState("");
  const [link,setLink] = useState("");

  useEffect(()=>{ load(); }, []);
  async function load(){ try{ const r = await fetch("/api/sponsors"); if(r.ok) setList(await r.json()); }catch(e){ console.error(e); } }

  async function submit(){
    try{ const token = await auth.currentUser.getIdToken();
      const r = await fetch("/api/sponsors", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify({ name, logo, link })});
      if(r.ok){ setName(""); setLogo(""); setLink(""); load(); toast.show("تم الإضافة","success"); } else toast.show("فشل","error");
    }catch(e){ console.error(e); toast.show("خطأ","error"); }
  }

  async function remove(id){ if(!confirm("تأكيد حذف الراعي؟")) return; try{ const token = await auth.currentUser.getIdToken(); const r = await fetch(`/api/sponsors?id=${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } }); if(r.ok){ load(); toast.show("تم الحذف","success"); } }catch(e){ console.error(e); } }

  return (
    <div style={{ display:"grid", gap:8 }}>
      <h3>إدارة الرعاة</h3>
      <input className="input" placeholder="اسم الراعي" value={name} onChange={e=>setName(e.target.value)} />
      <input className="input" placeholder="شعار (رابط)" value={logo} onChange={e=>setLogo(e.target.value)} />
      <input className="input" placeholder="رابط" value={link} onChange={e=>setLink(e.target.value)} />
      <div style={{ display:"flex", gap:8 }}><button className="btn" onClick={submit}>أضف راعي</button></div>

      <div style={{ marginTop:12 }}>
        {list.map(s=>(
          <div key={s.id} style={{ display:"flex", gap:12, alignItems:"center", marginBottom:8 }}>
            <img src={s.logo||"/logo.png"} style={{ width:84,height:84,objectFit:"cover",borderRadius:8 }} />
            <div style={{ flex:1 }}>
              <strong>{s.name}</strong><div className="small-muted">{s.link}</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn-ghost" onClick={()=> remove(s.id)}>حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Badwords */
function AdminBadwords({ toast }){
  const [word, setWord] = useState("");
  const [list, setList] = useState([]);

  useEffect(()=>{ (async ()=>{ const r = await fetch("/api/badwords"); if(r.ok) setList(await r.json()); })(); }, []);

  async function add(){
    try{ const token = await auth.currentUser.getIdToken(); const r = await fetch("/api/badwords", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify({ word }) }); if(r.ok){ setWord(""); setList(await (await fetch("/api/badwords")).json()); toast.show("تم الإضافة","success"); } }catch(e){ console.error(e); toast.show("خطأ","error"); }
  }

  async function remove(w){ try{ const token = await auth.currentUser.getIdToken(); const r = await fetch(`/api/badwords?word=${encodeURIComponent(w)}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } }); if(r.ok){ setList(await (await fetch("/api/badwords")).json()); toast.show("تم الحذف","success"); } }catch(e){ console.error(e); }
  }

  return (
    <div style={{ display:"grid", gap:8 }}>
      <h3>الكلمات الممنوعة</h3>
      <div style={{ display:"flex", gap:8 }}>
        <input className="input" value={word} onChange={e=>setWord(e.target.value)} placeholder="كلمة" />
        <button className="btn" onClick={add}>أضف</button>
      </div>
      <div style={{ marginTop:12 }}>
        {list.map(w => <div key={w} style={{ display:"flex", justifyContent:"space-between", gap:8 }}><span>{w}</span><button className="btn-ghost" onClick={()=>remove(w)}>حذف</button></div>)}
      </div>
    </div>
  );
}

/* Founders (manage admins by email) */
function AdminFounders({ toast }){
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");

  async function submit(action){
    if(!email) return toast.show("ادخل البريد","error");
    try{
      const token = await auth.currentUser.getIdToken();
      const r = await fetch("/api/founders", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify({ action, email, role }) });
      if(r.ok) { toast.show("تم","success"); setEmail(""); } else { const j = await r.json(); toast.show(j.error||"فشل","error"); }
    }catch(e){ console.error(e); toast.show("خطأ","error"); }
  }

  return (
    <div style={{ display:"grid", gap:8 }}>
      <h3>إدارة الأدمنز / الفاوندرز</h3>
      <input className="input" placeholder="بريد المستخدم" value={email} onChange={e=>setEmail(e.target.value)} />
      <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
        <option value="admin">admin</option>
        <option value="editor">editor</option>
        <option value="founder">founder</option>
      </select>
      <div style={{ display:"flex", gap:8 }}>
        <button className="btn" onClick={()=>submit("addAdmin")}>أضف أدمن</button>
        <button className="btn-ghost" onClick={()=>submit("removeAdmin")}>أزل أدمن</button>
        <button className="btn-ghost" onClick={()=>submit("setRole")}>غيّر رتبة</button>
      </div>
    </div>
  );
}
