// src/pages/login.jsx
import React, { useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import "../app/globals.css";
import app, { auth } from "../../../lib/firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { useToast } from "../../components/toast.jsx";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleEmail(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        toast.show("تم تسجيل الدخول", "success");
        window.location.href = "/home";
      } else {
        const userCr = await createUserWithEmailAndPassword(auth, email, password);
        // create profile
        const token = await auth.currentUser.getIdToken();
        await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ uid: userCr.user.uid, username: name, email }) });
        toast.show("تم إنشاء الحساب", "success");
        window.location.href = "/home";
      }
    } catch (e) {
      console.error(e);
      toast.show(e.message || "خطأ", "error");
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.show("تم تسجيل الدخول عبر Google", "success");
      window.location.href = "/home";
    } catch (e) { console.error(e); toast.show("فشل Google", "error"); }
    finally { setLoading(false); }
  }

  async function forgotPassword() {
    if (!email) return toast.show("أدخل البريد أولًا", "error");
    try { await sendPasswordResetEmail(auth, email); toast.show("أُرسلت تعليمات إعادة تعيين", "success"); } catch (e) { console.error(e); toast.show("فشل الإرسال","error"); }
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth:640, margin:"28px auto" }}>
        <div className="card">
          <h2>{mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}</h2>

          <form onSubmit={handleEmail} style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {mode === "signup" && (<input className="input" placeholder="الاسم (ظاهر في البروفايل)" value={name} onChange={e => setName(e.target.value)} />)}
            <input className="input" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="input" placeholder="كلمة المرور" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" type="submit" disabled={loading}>{mode === "login" ? "دخول" : "إنشاء"}</button>
              <button type="button" className="btn-ghost" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "إنشاء حساب" : "لدي حساب بالفعل"}</button>
            </div>
          </form>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button className="link-btn" onClick={handleGoogle}>تسجيل عبر Google</button>
            <button className="link-btn" onClick={forgotPassword}>هل نسيت كلمة السر؟</button>
          </div>
        </div>
      </div>
    </>
  );
}
