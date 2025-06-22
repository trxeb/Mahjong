import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use

const firebaseConfig = {
  apiKey: "AIzaSyBY4UDW7SKFIrnR0c8lmdGuVJddabwiwW4",
  authDomain: "tai-ny-calculator.firebaseapp.com",
  projectId: "tai-ny-calculator",
  storageBucket: "tai-ny-calculator.firebasestorage.app",
  messagingSenderId: "72955735396",
  appId: "1:72955735396:web:4fd05599f2bbef5e345e71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services you'll use in your React components
export const auth = getAuth(app);
export const db = getFirestore(app); // Export db if you need Firestore access
// You can add and export other initialized Firebase services here (e.g., getStorage, getFunctions)