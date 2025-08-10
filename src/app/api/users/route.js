// src/app/api/users/route.js
import { NextResponse } from "next/server";
import { adminInstance, adminDb, adminAuth } from "../../../../lib/firebaseAdmin";
import { getTokenFromReq, requireAuth } from "../_lib/auth";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (id) {
      const doc = await adminDb.collection("users").doc(id).get();
      if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ id: doc.id, ...doc.data() });
    }

    // listing users is admin-only
    const token = await getTokenFromReq(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await requireAuth(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const roleDoc = await adminDb.collection("users").doc(decoded.uid).get();
    const role = roleDoc.exists ? roleDoc.data()?.role : null;
    if (!["admin", "founder"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const snap = await adminDb.collection("users").orderBy("updatedAt", "desc").limit(500).get();
    return NextResponse.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  // upsert profile (user can upsert their own; admin can upsert any)
  try {
    const decoded = await requireAuth(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    // if upserting other user, require admin
    if (body.uid && body.uid !== decoded.uid) {
      const r = await adminDb.collection("users").doc(decoded.uid).get();
      const role = r.exists ? r.data()?.role : null;
      if (!["admin", "founder"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const uid = body.uid || decoded.uid;
    const docRef = adminDb.collection("users").doc(uid);
    await docRef.set(
      {
        username: body.username || null,
        bio: body.bio || null,
        avatar: body.avatar || null,
        email: body.email || decoded.email || null,
        role: body.role || undefined,
        updatedAt: adminInstance.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
