import { auth, googleProvider } from "./firebase.js";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
    || window.innerWidth <= 768;
}

export async function loginWithGoogle() {
  try {
    if (isMobile()) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    const result = await signInWithPopup(auth, googleProvider);
    return result?.user || null;
  } catch (error) {
    console.error("Erro no login com Google:", error);
    alert("Não foi possível entrar com Google.");
    return null;
  }
}

export async function handleRedirectLogin() {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error("Erro ao processar redirect:", error);
    return null;
  }
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