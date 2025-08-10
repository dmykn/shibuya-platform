// src/app/api/banner/route.js
import { NextResponse } from "next/server";
import { adminDb, adminInstance } from "../../../../lib/firebaseAdmin";
import { requireAdmin } from "../_lib/auth";

export async function GET() {
  try {
    const doc = await adminDb.collection("meta").doc("banner").get();
    if (!doc.exists) return NextResponse.json(null);
    return NextResponse.json(doc.data());
  } catch (e) {
    console.error(e);
    return NextResponse.json(null);
  }
}

export async function POST(req) {
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.code });

  try {
    const body = await req.json();
    await adminDb.collection("meta").doc("banner").set({
      title: body.title || "",
      subtitle: body.subtitle || "",
      image: body.image || "",
      link: body.link || "",
      updatedAt: adminInstance.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
