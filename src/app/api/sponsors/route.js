// src/app/api/sponsors/route.js
import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";
import { requireAdmin } from "../_lib/auth";

export async function GET() {
  try {
    const snap = await adminDb.collection("sponsors").orderBy("priority", "desc").get();
    return NextResponse.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.code });
  try {
    const body = await req.json();
    const docRef = await adminDb.collection("sponsors").add({
      name: body.name || "راعي",
      logo: body.logo || "",
      link: body.link || "",
      priority: body.priority || 0,
      createdAt: adminInstance.firestore.FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.code });
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await adminDb.collection("sponsors").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
