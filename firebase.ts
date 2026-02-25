import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => firebaseSignOut(auth);

/**
 * Uploads a document to Firebase Storage.
 * Path: accreditation/{userId}/{docName}/{timestamp}_{filename}
 * @param userId  User ID (from auth or local demo id)
 * @param docName Document category (e.g. "Government ID")
 * @param file    The real File object selected by the user
 * @param onProgress  Callback with upload progress (0-100)
 * @returns Download URL of the uploaded file
 */
export const uploadDocument = (
  userId: string,
  docName: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const safeName = docName.replace(/\s+/g, '_');
    const timestamp = Date.now();
    const path = `accreditation/${userId}/${safeName}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      'state_changed',
      snapshot => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress(pct);
      },
      err => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
};
