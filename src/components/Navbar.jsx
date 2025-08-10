// src/components/Navbar.jsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import app, { auth } from "../../lib/firebase.js"; // تأكد الملف lib/firebase.js موجود
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useToast } from "./toast.jsx";

const DEFAULT_AV = "/1.png";
const AVATARS = ["/1.png","/2.png","/3.png","/4.png"];

export default function Navbar() {
  const db = getFirestore(app);
  const ref = useRef(null);
  const dropRef = useRef(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatarModal, setAvatarModal] = useState(false);
  const [dropStyle, setDropStyle] = useState({});
  const toast = useToast();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfile(null);
      if (u) {
        try {
          const s = await getDoc(doc(db, "users", u.uid));
          if (s.exists()) setProfile({ id: s.id, ...s.data() });
        } catch (e) { console.error(e); }
      }
    });
    return () => unsub();
  }, [db]);

  // handle click outside
  useEffect(() => {
    function onClick(ev) {
      if (!ref.current) return;
      if (!ref.current.contains(ev.target)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    // compute dropdown position when open
    if (!open || !ref.current) return;
    const btn = ref.current.getBoundingClientRect();
    const width = Math.min(380, window.innerWidth - 24);
    const spaceRight = window.innerWidth - btn.right;
    const willGoLeft = spaceRight < width;
    const top = btn.bottom + 6;
    const left = willGoLeft ? Math.max(12, btn.right - width) : Math.max(12, btn.left);
    setDropStyle({ position: "fixed", top: top + "px", left: left + "px", width: width + "px" });
  }, [open]);

  async function handleLogout() {
    try {
      await signOut(auth);
      setOpen(false);
      toast.show("تم تسجيل الخروج", "success");
      window.location.href = "/login";
    } catch (e) { console.error(e); toast.show("فشل تسجيل الخروج", "error"); }
  }

  const avatarSrc = profile?.avatar || user?.photoURL || DEFAULT_AV;

  return (
    <header className="site-header container">
      <div className="header-left" style={{ alignItems: "center" }}>
        <div style={{ position: "relative" }} ref={ref}>
          <button onClick={() => { setOpen(v=>!v); }} style={{ border: 0, background: "transparent", padding: 0 }}>
            <img src={avatarSrc} alt="avatar" className="nav-avatar" />
          </button>

          {open && (
            <div className="avatar-dropdown" ref={dropRef} style={dropStyle}>
              <div className="avatar-head">
                <strong style={{ fontSize: 16 }}>{profile?.username || (user ? user.email.split("@")[0] : "زائر")}</strong>
                <div className="small-muted" style={{ marginTop: 6 }}>{profile?.bio || (user ? user.email : "مرحبًا في شيبويا")}</div>
              </div>
              <div className="avatar-list">
                {!user ? (
                  <>
                    <button className="link-btn" onClick={() => { window.location.href = "/login"; setOpen(false); }}>تسجيل / دخول</button>
                    <button className="link-btn" onClick={() => { window.location.href = "/login#signup"; setOpen(false); }}>إنشاء حساب</button>
                    <button className="link-btn" onClick={() => { window.location.href = "/settings"; setOpen(false); }}>الإعدادات</button>
                  </>
                ) : (
                  <>
                    <button className="link-btn" onClick={() => { setAvatarModal(true); setOpen(false); }}>اختيار صورة الحساب</button>
                    <button className="link-btn" onClick={() => { window.location.href = "/settings"; setOpen(false); }}>الإعدادات</button>
                    {(profile?.role === "admin" || profile?.role === "founder" || profile?.role === "editor") && (
                      <button className="link-btn" onClick={() => { window.location.href = "/admin"; setOpen(false); }}>لوحة الأدمن</button>
                    )}
                    <button className="link-btn" onClick={handleLogout}>تسجيل خروج</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="header-center">
        <div className="search-wrap">
          <input placeholder="ابحث عن أنمي، شخصية، مقال..." onKeyDown={(e)=>{ if(e.key==="Enter"){ const q=e.target.value.trim(); if(q) window.location.href=`/search?q=${encodeURIComponent(q)}` } }} />
        </div>
      </div>

      <div className="header-right" style={{ alignItems: "center" }}>
        <button className="link-btn" onClick={() => setDrawerOpen(v => !v)}>☰</button>
        <div className="brand" style={{ cursor: "pointer" }} onClick={()=>window.location.href="/home"}>
          <div className="brand-text"><div className="brand-ar">شيبويا</div><div className="brand-en">Shibuya</div></div>
          <div className="brand-logo"><img src="/logo.png" alt="logo" /></div>
        </div>
      </div>

      {drawerOpen && (
        <div style={{ position: "fixed", top: 0, right: 0, width: 320, height: "100%", background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4))", zIndex: 300, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>القائمة</strong>
            <button className="btn-ghost" onClick={() => setDrawerOpen(false)}>إغلاق</button>
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <a className="link-btn" onClick={()=>{ window.location.href="/home" }}>الرئيسية</a>
            <a className="link-btn" onClick={()=>{ window.location.href="/anime" }}>أنميات</a>
            <a className="link-btn" onClick={()=>{ window.location.href="/characters" }}>شخصيات</a>
            <a className="link-btn" onClick={()=>{ window.location.href="/articles" }}>مقالات</a>
            <a className="link-btn" href="https://discord.gg" target="_blank">مجتمع (Discord)</a>
            <a className="link-btn" onClick={()=>{ window.location.href="/events" }}>الأحداث</a>
            <a className="link-btn" onClick={()=>{ window.location.href="/settings" }}>الإعدادات</a>
            <a className="link-btn" onClick={()=>{ window.location.href="/admin" }}>لوحة الأدمن</a>
          </div>
        </div>
      )}

      {avatarModal && (
        <div className="avatar-modal-backdrop" onClick={()=>setAvatarModal(false)}>
          <div className="avatar-modal" onClick={(e)=>e.stopPropagation()}>
            <h3>اختَر صورة الحساب</h3>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              {AVATARS.map(a=>(
                <div key={a} style={{ width:96, textAlign:"center" }}>
                  <img src={a} style={{ width:96,height:96,objectFit:"cover",borderRadius:12,cursor:"pointer" }} onClick={async ()=>{
                    // save avatar to profile via API
                    try{
                      if(!user) return toast.show("سجّل الدخول أولاً","error");
                      const token = await auth.currentUser.getIdToken();
                      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify({ uid: user.uid, avatar: a }) });
                      if(res.ok){ setProfile(prev=> ({...prev, avatar: a})); toast.show("تم تغيير الصورة","success"); setAvatarModal(false); }
                      else { toast.show("فشل تغيير الصورة","error"); }
                    }catch(e){ console.error(e); toast.show("خطأ الشبكة","error"); }
                  }} alt="av" />
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <input placeholder="أدخل رابط الصورة (مثال: /my.png أو https://...)" className="input" id="avatarUrlInput" />
              <button className="btn" onClick={async ()=>{
                const val = document.getElementById("avatarUrlInput").value.trim();
                if(!val) return toast.show("أدخل رابط","error");
                try{
                  if(!user) return toast.show("سجّل الدخول أولاً","error");
                  const token = await auth.currentUser.getIdToken();
                  const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify({ uid: user.uid, avatar: val }) });
                  if(res.ok){ setProfile(prev=> ({...prev, avatar: val})); toast.show("تم تغيير الصورة","success"); setAvatarModal(false); }
                  else toast.show("فشل","error");
                }catch(e){ console.error(e); toast.show("خطأ","error"); }
              }}>حفظ</button>
            </div>
            <div style={{ marginTop:8, textAlign:"left" }}>
              <button className="btn-ghost" onClick={()=>setAvatarModal(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
