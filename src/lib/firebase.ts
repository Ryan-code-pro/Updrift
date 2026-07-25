import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  collection,
  query,
  where
} from 'firebase/firestore';
import rawFirebaseConfig from '../../firebase-applet-config.json';

const firebaseConfig: any = rawFirebaseConfig || {};

let app: any = null;
let auth: any = null;
let db: any = null;

try {
  if (firebaseConfig && (firebaseConfig.apiKey || firebaseConfig.projectId)) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    try {
      auth = getAuth(app);
    } catch (authErr) {
      console.warn("Firebase Auth init warning:", authErr);
    }

    try {
      if (firebaseConfig.firestoreDatabaseId) {
        db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      } else {
        db = getFirestore(app);
      }
    } catch (dbErr) {
      console.warn("Custom Firestore DB init warning, falling back to default DB:", dbErr);
      try {
        db = getFirestore(app);
      } catch (fallbackErr) {
        console.warn("Firestore fallback init failed:", fallbackErr);
      }
    }
  }
} catch (err) {
  console.warn("Firebase initialization warning:", err);
}

export const googleProvider = new GoogleAuthProvider();

export {
  app,
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where
};
export type { User };

