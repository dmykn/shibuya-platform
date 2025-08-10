// src/app/api/characters/route.js
import { NextResponse } from "next/server";
import { adminInstance, adminDb } from "../../../../lib/firebaseAdmin";
import { requireAdmin } from "../_lib/auth";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (id) {
      const doc = await adminDb.collection("characters").doc(id).get();
      if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ id: doc.id, ...doc.data() });
    }
    const snap = await adminDb.collection("characters").orderBy("createdAt", "desc").limit(500).get();
    return NextResponse.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.code });

  try {
    const body = await req.json();
    const docRef = await adminDb.collection("characters").add({
      name: body.name || "شخصية جديدة",
      bio: body.bio || "",
      avatar: body.avatar || "",
      role: body.role || "",
      animeIds: body.animeIds || [],
      createdAt: adminInstance.firestore.FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PUT(req) {
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.code });

  try {
    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await adminDb.collection("characters").doc(id).set({ ...data, updatedAt: adminInstance.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.code });

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await adminDb.collection("characters").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
