// src/app/api/_lib/auth.js
import { verifyIdToken, getUserRole } from "../../../../lib/firebaseAdmin";

/** read bearer token from request headers (Request object in app router) */
export async function getTokenFromReq(req) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length === 2 && (parts[0] === "Bearer" || parts[0] === "bearer")) return parts[1];
  return null;
}

/** return decoded token or null */
export async function requireAuth(req) {
  const token = await getTokenFromReq(req);
  if (!token) return null;
  const decoded = await verifyIdToken(token);
  if (!decoded) return null;
  return decoded;
}

/** return {ok:true, decoded, role} or {ok:false, code, message} */
export async function requireAdmin(req) {
  const decoded = await requireAuth(req);
  if (!decoded) return { ok: false, code: 401, message: "Unauthorized" };
  const role = await getUserRole(decoded.uid);
  if (!role) return { ok: false, code: 403, message: "No role" };
  if (["admin", "founder", "editor"].includes(role)) return { ok: true, decoded, role };
  return { ok: false, code: 403, message: "Forbidden" };
}
