import { auth, googleProvider } from "./firebase.js";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export async function prepareAuth() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.error("Erro ao configurar persistência:", error);
  }
}

export async function loginWithGoogle() {
  try {
    await prepareAuth();
    const result = await signInWithPopup(auth, googleProvider);
    return result?.user || null;
  } catch (error) {
    console.error("Erro no login com Google:", error);
    alert("Não foi possível entrar com Google.");
    return null;
  }
}

export async function handleRedirectLogin() {
  return null;
}

export function monitorAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (typeof callback === "function") {
      callback(user);
    }
  });
}

export async function logoutGoogle() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao sair:", error);
    alert("Não foi possível sair da conta.");
  }
}