import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBnuBS1zXfs9hkXdEiKFoFbwOJlxIVaSLA",
  authDomain: "diversified-34735.firebaseapp.com",
  projectId: "diversified-34735",
  storageBucket: "diversified-34735.firebasestorage.app",
  messagingSenderId: "358706935950",
  appId: "1:358706935950:web:3d65ec76a8263e45ffb1df",
  measurementId: "G-P2PD16JTPB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => firebaseSignOut(auth);
