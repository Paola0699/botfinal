import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB_x8SH7Ly_b1Vs5x8ooTGmNDB9wClqLcM",
  authDomain: "mejorabot.firebaseapp.com",
  projectId: "mejorabot",
  storageBucket: "mejorabot.firebasestorage.app",
  messagingSenderId: "152371923466",
  appId: "1:152371923466:web:fc356f4474e65465c9edf3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
