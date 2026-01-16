
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCpTyTEeMvX9eDPEu3whUU5-0Fojg886Fs",
  authDomain: "revo-7904e.firebaseapp.com",
  databaseURL: "https://revo-7904e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "revo-7904e",
  storageBucket: "revo-7904e.firebasestorage.app",
  messagingSenderId: "121851170164",
  appId: "1:121851170164:web:bd724eb0647e40ab893021",
  measurementId: "G-JGP9R201ML"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
