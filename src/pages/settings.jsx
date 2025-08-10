// src/pages/settings.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import "../app/globals.css";
import app, { auth } from "../../../lib/firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "../../components/toast.jsx";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ username: "", bio: "", avatar: "" });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) {
        try {
          const res = await fetch(`/api/users?id=${u.uid}`);
          if (res.ok) {
            const data = await res.json();
            setProfile({ username: data.username || "", bio: data.bio || "", avatar: data.avatar || "" });
          }
        } catch (e) { console.error(e); }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function save() {
    if (!user) return toast.show("سجل دخول", "error");
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ uid: user.uid, username: profile.username, bio: profile.bio, avatar: profile.avatar, email: user.email }) });
      toast.show("تم الحفظ", "success");
    } catch (e) { console.error(e); toast.show("فشل الحفظ","error"); }
  }

  if (loading) return (<><Navbar /><div className="card" style={{ maxWidth: 900, margin: "18px auto" }}>جارِ التحميل...</div></>);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth:900, margin:"18px auto" }}>
        <div className="card">
          <h3>إعدادات الحساب</h3>
          {!user ? <div>سجل الدخول أولًا.</div> : (
            <div style={{ display:"grid", gap:12 }}>
              <label>الاسم</label>
              <input className="input" value={profile.username} onChange={e=>setProfile({...profile, username: e.target.value})} />
              <label>نبذة</label>
              <textarea className="input" value={profile.bio} onChange={e=>setProfile({...profile, bio: e.target.value})} />
              <label>اختيار الصورة (رابط أو مسار في public)</label>
              <input className="input" value={profile.avatar} onChange={e=>setProfile({...profile, avatar: e.target.value})} placeholder="/1.png" />
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn" onClick={save}>حفظ</button>
                <button className="btn-ghost" onClick={()=>{ setProfile({ username:"", bio:"", avatar:"" }); }}>إعادة</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
