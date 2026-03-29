import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDHMuEZVIzlQ9xSDM2nThZUB75EthZZ46Y",
  authDomain: "lhsmen.vercel.app",
  projectId: "lhs-men",
  storageBucket: "lhs-men.firebasestorage.app",
  messagingSenderId: "1046262755270",
  appId: "1:1046262755270:web:97b7f07c2dca01d6b20cc7"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account"
});

async function initAuthPersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.error("Erro ao configurar persistência do auth:", error);
  }
}

export { app, db, auth, provider, initAuthPersistence };