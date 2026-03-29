import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { auth, provider, initAuthPersistence } from "./firebase.js";

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

function saveUserToLocal(user) {
  if (!user) return;

  const userData = {
    uid: user.uid,
    name: user.displayName || "",
    email: user.email || "",
    photo: user.photoURL || ""
  };

  localStorage.setItem("lhsmen_user", JSON.stringify(userData));
}

function removeUserFromLocal() {
  localStorage.removeItem("lhsmen_user");
}

function updateUIForLoggedUser(user) {
  const loginToggle = document.getElementById("loginToggle");
  const mobileLoginToggle = document.getElementById("mobileLoginToggle");
  const userNameEls = document.querySelectorAll("[data-user-name]");
  const userPhotoEls = document.querySelectorAll("[data-user-photo]");

  if (user) {
    saveUserToLocal(user);

    if (loginToggle) {
      loginToggle.setAttribute("data-logged", "true");
      loginToggle.textContent = "Meu Perfil";
    }

    if (mobileLoginToggle) {
      mobileLoginToggle.setAttribute("data-logged", "true");
      mobileLoginToggle.textContent = "Meu Perfil";
    }

    userNameEls.forEach((el) => {
      el.textContent = user.displayName || "Cliente";
    });

    userPhotoEls.forEach((el) => {
      if ("src" in el && user.photoURL) {
        el.src = user.photoURL;
      }
    });
  } else {
    removeUserFromLocal();

    if (loginToggle) {
      loginToggle.removeAttribute("data-logged");
      loginToggle.textContent = "Entrar";
    }

    if (mobileLoginToggle) {
      mobileLoginToggle.removeAttribute("data-logged");
      mobileLoginToggle.textContent = "Entrar";
    }

    userNameEls.forEach((el) => {
      el.textContent = "Visitante";
    });

    userPhotoEls.forEach((el) => {
      if ("src" in el) {
        el.src = "";
      }
    });
  }
}

export async function loginWithGoogle() {
  try {
    await initAuthPersistence();

    if (isMobileDevice()) {
      await signInWithRedirect(auth, provider);
      return;
    }

    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Erro no login com Google:", error);
    alert("Não foi possível entrar com Google.");
  }
}

export async function handleRedirectLogin() {
  try {
    await initAuthPersistence();
    const result = await getRedirectResult(auth);

    if (result?.user) {
      saveUserToLocal(result.user);
    }
  } catch (error) {
    console.error("Erro ao finalizar login por redirecionamento:", error);
  }
}

export function monitorAuth() {
  onAuthStateChanged(auth, (user) => {
    updateUIForLoggedUser(user);
  });
}

export async function logoutUser() {
  try {
    await signOut(auth);
    removeUserFromLocal();
    window.location.href = "index.html";
  } catch (error) {
    console.error("Erro ao sair da conta:", error);
  }
}