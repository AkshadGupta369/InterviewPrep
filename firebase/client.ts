// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyASgWcv0tKAg9C277FdiRkr5T5kCpBXELk",
  authDomain: "interviewprep-d9c00.firebaseapp.com",
  projectId: "interviewprep-d9c00",
  storageBucket: "interviewprep-d9c00.firebasestorage.app",
  messagingSenderId: "734184070452",
  appId: "1:734184070452:web:a4608a2a1d643ef5349961",
  measurementId: "G-QMZHCZ22HD"
};

// Initialize Firebase
const app = !getApps.length?initializeApp(firebaseConfig):getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);