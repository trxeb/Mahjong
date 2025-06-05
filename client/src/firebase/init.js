// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCstTWdQO6k_Cp8TchUgrG4pzA52hdPCMs",
  authDomain: "mahjong-8c580.firebaseapp.com",
  projectId: "mahjong-8c580",
  storageBucket: "mahjong-8c580.firebasestorage.app",
  messagingSenderId: "747084442511",
  appId: "1:747084442511:web:26d1a803b8b4899e2b79fa",
  measurementId: "G-C6HG706PC6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);