import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';


const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "outfitted-15775.firebaseapp.com",
  projectId: "outfitted-15775",
  storageBucket: "outfitted-15775.firebasestorage.app",
  messagingSenderId: "354827153823",
  appId: "1:354827153823:web:f0bf27764ece0f1300cdaa",
  measurementId: "G-C4VNXP4J44",
  databaseURL: "https://outfitted-15775-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

export { app, auth, db, storage, rtdb };