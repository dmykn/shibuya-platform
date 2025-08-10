// src/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC2K6x9gA5kFipHAjp73DOTuWF9tQc6iZA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "shonen-aarabic.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "shonen-aarabic",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "shonen-aarabic.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1061230503821",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1061230503821:web:d495c42f8dab937d133fc4",
};

const app = !getApps().length ? initializeApp(clientConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}
export async function doSignOut() {
  return await signOut(auth);
}
export async function getIdToken() {
  if (!auth || !auth.currentUser) return null;
  return await auth.currentUser.getIdToken(true);
}
export default app;
