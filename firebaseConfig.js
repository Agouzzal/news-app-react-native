import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "news-app-6dcbd.firebaseapp.com",
  projectId: "news-app-6dcbd",
  storageBucket: "news-app-6dcbd.firebasestorage.app",
  messagingSenderId: "956721260550",
  appId: "1:956721260550:web:72388e21388af9b7fcbb87",
  measurementId: "G-D5RCJWT5BZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);