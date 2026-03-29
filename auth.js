import { auth, googleProvider } from "./firebase.js";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

async function loginWithGoogle() {
  try {
    if (isMobile()) {
      await signInWithRedirect(auth, googleProvider);
      return;
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  } catch (error) {
    console.error("Erro no login com Google:", error);
    alert("Não foi possível entrar com Google.");
  }
}

async function handleRedirectLogin() {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log("Login via redirect concluído:", result.user);
    }
  } catch (error) {
    console.error("Erro ao processar redirect:", error);
  }
}

function updateUI(user) {
  const loginBtn = document.getElementById("loginBtn");
  const userName = document.getElementById("userName");
  const userPhoto = document.getElementById("userPhoto");
  const profileArea = document.getElementById("profileArea");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (profileArea) profileArea.style.display = "flex";
    if (userName) userName.textContent = user.displayName || "Usuário";
    if (userPhoto) userPhoto.src = user.photoURL || "";
  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (profileArea) profileArea.style.display = "none";
  }
}

onAuthStateChanged(auth, (user) => {
  console.log("Estado do usuário:", user);
  updateUI(user);
});

handleRedirectLogin();

window.loginWithGoogle = loginWithGoogle;

window.logoutGoogle = async function () {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao sair:", error);
  }
};