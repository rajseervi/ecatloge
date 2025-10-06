import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyBStqBKRrQtVnEQJRB5f4xmyqhnMobCfuc",
  authDomain: "e-cat-master.firebaseapp.com",
  databaseURL: "https://e-cat-master-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "e-cat-master",
  storageBucket: "e-cat-master.firebasestorage.app",
  messagingSenderId: "234834533950",
  appId: "1:234834533950:web:8b66842e5b73b57e547b6f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);