import { auth, googleProvider } from "./firebase.js";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

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

    if (isMobileDevice()) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    const result = await signInWithPopup(auth, googleProvider);
    return result?.user || null;
  } catch (error) {
    console.error("Erro no login com Google:", error);

    const code = error?.code || "";

    if (code === "auth/popup-blocked") {
      alert("O navegador bloqueou a janela de login. Permita pop-ups e tente novamente.");
      return null;
    }

    if (code === "auth/popup-closed-by-user") {
      alert("A janela de login foi fechada antes da conclusão.");
      return null;
    }

    if (code === "auth/cancelled-popup-request") {
      alert("A solicitação de login foi cancelada. Tente novamente.");
      return null;
    }

    if (code === "auth/unauthorized-domain") {
      alert("Este domínio não está autorizado no Firebase.");
      return null;
    }

    if (code === "auth/network-request-failed") {
      alert("Falha de conexão. Verifique sua internet e tente novamente.");
      return null;
    }

    alert("Não foi possível entrar com Google.");
    return null;
  }
}

export async function handleRedirectLogin() {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error("Erro no retorno do login por redirecionamento:", error);

    const code = error?.code || "";

    if (code === "auth/unauthorized-domain") {
      alert("Este domínio não está autorizado no Firebase.");
      return null;
    }

    if (code === "auth/network-request-failed") {
      alert("Falha de conexão no retorno do login.");
      return null;
    }

    return null;
  }
}

export function monitorAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (typeof callback === "function") {
      callback(user || null);
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