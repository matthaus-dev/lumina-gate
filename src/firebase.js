
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhOscz4koGuJCGqQdG83_vFTEp1jnQSok",
  authDomain: "lumina-gate.firebaseapp.com",
  projectId: "lumina-gate",
  storageBucket: "lumina-gate.firebasestorage.app",
  messagingSenderId: "917495283582",
  appId: "1:917495283582:web:599cdeb13d74b16e8f7d2f",
  measurementId: "G-QLXYCM4GNF"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
