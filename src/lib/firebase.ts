import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Firebase configuration loaded from project setup
const firebaseConfig = {
  projectId: firebaseConfigJson.projectId || 'gen-lang-client-0923013696',
  appId: firebaseConfigJson.appId || '1:559229903618:web:cdded5ce973515e396581b',
  apiKey: firebaseConfigJson.apiKey || 'AIzaSyCqs7cNhJHuryv3xaR3OnejSVJ2lznKD8M',
  authDomain: firebaseConfigJson.authDomain || 'gen-lang-client-0923013696.firebaseapp.com',
  storageBucket: firebaseConfigJson.storageBucket || 'gen-lang-client-0923013696.firebasestorage.app',
  messagingSenderId: firebaseConfigJson.messagingSenderId || '559229903618',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get Firestore instance (with custom database ID support if configured)
export const db: Firestore = firebaseConfigJson.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

export default app;
