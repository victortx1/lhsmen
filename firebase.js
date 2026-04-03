import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDHMuEZVIzlQ9xSDM2nThZUB75EthZZ46Y",
  authDomain: "lhs-men.firebaseapp.com",
  projectId: "lhs-men",
  storageBucket: "lhs-men.firebasestorage.app",
  messagingSenderId: "1046262755270",
  appId: "1:1046262755270:web:97b7f07c2dca01d6b20cc7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);