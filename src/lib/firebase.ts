
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "uniceltest-8322e.firebaseapp.com",
  projectId: "uniceltest-8322e",
  storageBucket: "uniceltest-8322e.appspot.com",
  messagingSenderId: "640674384361",
  appId: "1:640674384361:web:0420e61ffdd9f5f0272378"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
