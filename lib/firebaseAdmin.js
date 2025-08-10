// src/lib/firebaseAdmin.js
import firebaseAdmin from "firebase-admin";
import fs from "fs";
import path from "path";

function initAdmin() {
  if (firebaseAdmin.apps && firebaseAdmin.apps.length) return firebaseAdmin;
  
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    firebaseAdmin.initializeApp();
    return firebaseAdmin;
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const cred = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(cred) });
    return firebaseAdmin;
  }

  // fallback to src/app/secrets JSON
  const secretsDir = path.resolve(process.cwd(), "src", "app", "secrets");
  if (fs.existsSync(secretsDir)) {
    const files = fs.readdirSync(secretsDir);
    const jf = files.find(f => f.endsWith(".json"));
    if (jf) {
      const content = JSON.parse(fs.readFileSync(path.join(secretsDir, jf), "utf8"));
      firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(content) });
      return firebaseAdmin;
    }
  }

  throw new Error(
    "Firebase Admin not configured. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT or place JSON in src/app/secrets/"
  );
}

const adminApp = initAdmin();

export const adminInstance = adminApp;
export const adminAuth = adminApp.auth();
export const adminDb = adminApp.firestore();

export async function verifyIdToken(idToken) {
  try {
    return await adminAuth.verifyIdToken(idToken);
  } catch (e) {
    console.error("verifyIdToken", e);
    return null;
  }
}

export async function getUserRole(uid) {
  try {
    const snap = await adminDb.collection("users").doc(uid).get();
    if (!snap.exists) return null;
    return snap.data()?.role || null;
  } catch (e) {
    console.error("getUserRole", e);
    return null;
  }
}
