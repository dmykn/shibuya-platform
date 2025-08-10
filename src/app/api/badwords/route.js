// src/app/api/badwords/route.js
import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";
import { requireAdmin } from "../_lib/auth";

export async function GET() {
  try {
    const snap = await adminDb.collection("badwords").orderBy("word").get();
    return NextResponse.json(snap.docs.map((d) => d.data().word));
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.code });
  try {
    const { word } = await req.json();
    if (!word) return NextResponse.json({ error: "Missing word" }, { status: 400 });
    await adminDb.collection("badwords").add({ word });
    return NextResponse.json({ ok: true });
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
    const word = url.searchParams.get("word");
    if (!word) return NextResponse.json({ error: "Missing word" }, { status: 400 });
    const snap = await adminDb.collection("badwords").where("word", "==", word).get();
    for (const d of snap.docs) await adminDb.collection("badwords").doc(d.id).delete();
    const newList = (await adminDb.collection("badwords").orderBy("word").get()).docs.map((d) => d.data().word);
    return NextResponse.json(newList);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
