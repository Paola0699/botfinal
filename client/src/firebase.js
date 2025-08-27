import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyC9mQbir4TJLUEiFiEPVMwmqHIESsRA9Ek",
  authDomain: "pickupworld-1893d.firebaseapp.com",
  projectId: "pickupworld-1893d",
  storageBucket: "pickupworld-1893d.firebasestorage.app",
  messagingSenderId: "811820342535",
  appId: "1:811820342535:web:e7e810275093d1eaf1b9a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
