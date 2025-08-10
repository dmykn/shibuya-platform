// src/app/api/comments/route.js
import { NextResponse } from "next/server";
import { adminInstance, adminDb } from "../../../../lib/firebaseAdmin";
import { requireAuth } from "../_lib/auth";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const animeId = url.searchParams.get("animeId");
    const articleId = url.searchParams.get("articleId");
    const target = animeId ? { field: "animeId", value: animeId } : articleId ? { field: "articleId", value: articleId } : null;

    if (!target) return NextResponse.json([], { status: 200 });
    const snap = await adminDb.collection("comments").where(target.field, "==", target.value).orderBy("createdAt", "desc").limit(500).get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  const decoded = await requireAuth(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const payload = {
      uid: decoded.uid,
      username: body.username || decoded.email?.split("@")[0] || "مستخدم",
      avatar: body.avatar || null,
      text: (body.text || "").slice(0, 2000),
      animeId: body.animeId || null,
      articleId: body.articleId || null,
      createdAt: adminInstance.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await adminDb.collection("comments").add(payload);
    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
