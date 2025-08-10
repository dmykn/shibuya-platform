// src/app/api/ratings/route.js
import { NextResponse } from "next/server";
import { adminInstance, adminDb } from "../../../../lib/firebaseAdmin";
import { requireAuth } from "../_lib/auth";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const animeId = url.searchParams.get("animeId");
    const mine = url.searchParams.get("mine");
    if (!animeId) return NextResponse.json({ error: "animeId required" }, { status: 400 });

    const snap = await adminDb.collection("ratings").where("animeId", "==", animeId).get();
    const ratings = snap.docs.map((d) => d.data().rating || 0);
    const avg = ratings.length ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) : 0;

    if (mine) {
      const decoded = await requireAuth(req);
      if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const q = await adminDb.collection("ratings").where("animeId", "==", animeId).where("uid", "==", decoded.uid).limit(1).get();
      if (!q.empty) return NextResponse.json({ myRating: q.docs[0].data().rating, avg });
      return NextResponse.json({ myRating: 0, avg });
    }

    return NextResponse.json({ avg });
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
    const animeId = body.animeId;
    const charId = body.characterId || null;
    const rating = Number(body.rating) || 0;
    if (!animeId || rating < 1 || rating > 5) return NextResponse.json({ error: "Invalid" }, { status: 400 });

    const q = await adminDb.collection("ratings").where("animeId", "==", animeId).where("uid", "==", decoded.uid).limit(1).get();
    if (!q.empty) {
      await adminDb.collection("ratings").doc(q.docs[0].id).update({ rating, characterId: charId, updatedAt: adminInstance.firestore.FieldValue.serverTimestamp() });
      return NextResponse.json({ ok: true });
    } else {
      await adminDb.collection("ratings").add({
        uid: decoded.uid,
        animeId,
        characterId: charId,
        rating,
        createdAt: adminInstance.firestore.FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true }, { status: 201 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
