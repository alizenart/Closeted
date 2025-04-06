import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// Replace these values with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhyMT1x78TVTcl_yt0Nb7HPVhcP2ZEKJw",
  authDomain: "outfitted-15775.firebaseapp.com",
  projectId: "outfitted-15775",
  storageBucket: "outfitted-15775.firebasestorage.app",
  messagingSenderId: "354827153823",
  appId: "1:354827153823:web:f0bf27764ece0f1300cdaa",
  measurementId: "G-C4VNXP4J44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);