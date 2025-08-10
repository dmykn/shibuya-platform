// src/lib/firebaseAdmin.js
import firebaseAdmin from "firebase-admin";

function initAdmin() {
  // إذا التطبيق مهيأ مسبقًا، نعيده مباشرة
  if (firebaseAdmin.apps && firebaseAdmin.apps.length) return firebaseAdmin;

  // الاعتماد على متغير البيئة FIREBASE_SERVICE_ACCOUNT كنص JSON
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const cred = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      // المفتاح يحتوي أسطر \n مخزنة كنص، لازم نستبدلهم بأسطر جديدة فعلية
      if (cred.private_key) {
        cred.private_key = cred.private_key.replace(/\\n/g, '\n');
      }
      firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(cred) });
      return firebaseAdmin;
    } catch (error) {
      throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable: " + error.message);
    }
  }

  // يمكن لو حاب تستخدم GOOGLE_APPLICATION_CREDENTIALS (مسار لملف JSON)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    firebaseAdmin.initializeApp();
    return firebaseAdmin;
  }
  
  throw new Error(
    "Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT (preferred) or GOOGLE_APPLICATION_CREDENTIALS."
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
