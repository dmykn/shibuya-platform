// src/app/api/founders/route.js
import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../../lib/firebaseAdmin";
import { requireAdmin } from "../_lib/auth";

export async function POST(req) {
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.code });

  try {
    const body = await req.json();
    const { action, email, role } = body;
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    try {
      const user = await adminAuth.getUserByEmail(email);
      const uid = user.uid;
      if (action === "addAdmin") {
        await adminDb.collection("users").doc(uid).set({ role: role || "admin" }, { merge: true });
        return NextResponse.json({ ok: true });
      } else if (action === "removeAdmin") {
        await adminDb.collection("users").doc(uid).set({ role: "user" }, { merge: true });
        return NextResponse.json({ ok: true });
      } else if (action === "setRole") {
        await adminDb.collection("users").doc(uid).set({ role: role || "user" }, { merge: true });
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err) {
      console.error("getUserByEmail error", err);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
