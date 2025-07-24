import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration - Hardcoded to ensure availability in App Hosting
const firebaseConfig = {
  projectId: "mobileserve-b7xuu",
  appId: "1:365463007520:web:18341b888adcef6756a745",
  storageBucket: "mobileserve-b7xuu.firebasestorage.app",
  apiKey: "AIzaSyDQlLCaUAlp4IG44Ms0Ta-PEeYAlJiF1kc",
  authDomain: "mobileserve-b7xuu.firebaseapp.com",
  messagingSenderId: "365463007520"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };