import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use

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

// Export Firebase services you'll use in your React components
export const auth = getAuth(app);
export const db = getFirestore(app); // Export db if you need Firestore access
// You can add and export other initialized Firebase services here (e.g., getStorage, getFunctions)