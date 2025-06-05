// client/src/components/Login.js (example)
import { auth } from '../firebase-init';
import { signInWithEmailAndPassword } from 'firebase/auth';

const handleLogin = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in successfully!");
  } catch (error) {
    console.error("Error signing in:", error.message);
  }
};