import dotenv from "dotenv";
dotenv.config();

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API,
  authDomain: "poliverse-backend.firebaseapp.com",
  projectId: "poliverse-backend",
  storageBucket: "poliverse-backend.appspot.com",
  messagingSenderId: "100775381345",
  appId: "1:100775381345:web:bad005283a2025c53f5d20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);