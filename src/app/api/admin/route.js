// src/app/api/admin/route.js
import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";
import { requireAdmin } from "../_lib/auth";

export async function GET(req) {
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.code });

  try {
    const counts = {};
    const colNames = ["users", "animes", "articles", "characters", "comments"];
    await Promise.all(colNames.map(async (c) => {
      const snap = await adminDb.collection(c).get();
      counts[c] = snap.size;
    }));
    return NextResponse.json({ stats: counts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
