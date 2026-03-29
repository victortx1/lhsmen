import { db } from "./firebase.js";
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  loginWithGoogle,
  handleRedirectLogin,
  monitorAuth,
  prepareAuth
} from "./auth.js";

const STORAGE_KEY = "lhsmen_products";
const CART_KEY = "lhsmen_cart";
const FAVORITES_KEY = "lhsmen_favorites";
const WELCOME_POPUP_KEY = "lhsmen_welcome_popup_seen";
const OWNER_EMAILS = ["victoj796@gmail.com"];

const defaultProducts = [
  {
    id: 1,
    name: "Essential Black Tee",
    category: "camisetas",
    price: 119.9,
    oldPrice: 149.9,
    sale: "-20%",
    description: "Peça premium com visual sofisticado, masculino e contemporâneo.",
    image: "",
    featured: true,
    bestseller: true
  },
  {
    id: 2,
    name: "Urban White Tee",
    category: "camisetas",
    price: 129.9,
    oldPrice: 159.9,
    sale: "-18%",
    description: "Camiseta branca premium com estética minimalista e elegante.",
    image: "",
    featured: true,
    bestseller: false
  },
  {
    id: 3,
    name: "Tailored Night Pants",
    category: "calcas",
    price: 229.9,
    oldPrice: 279.9,
    sale: "-18%",
    description: "Calça sofisticada com caimento urbano e acabamento refinado.",
    image: "",
    featured: true,
    bestseller: true
  },
  {
    id: 4,
    name: "Monochrome Bermuda",
    category: "bermudas",
    price: 149.9,
    oldPrice: 189.9,
    sale: "-21%",
    description: "Bermuda premium para combinações leves e modernas.",
    image: "",
    featured: false,
    bestseller: false
  },
  {
    id: 5,
    name: "Signature Black Jacket",
    category: "jaquetas",
    price: 329.9,
    oldPrice: 399.9,
    sale: "-17%",
    description: "Jaqueta premium com presença forte e acabamento refinado.",
    image: "",
    featured: true,
    bestseller: true
  },
  {
    id: 6,
    name: "Minimal Chain Premium",
    category: "acessorios",
    price: 89.9,
    oldPrice: 119.9,
    sale: "-25%",
    description: "Acessório moderno para elevar o visual com discrição.",
    image: "",
    featured: false,
    bestseller: false
  },
  {
    id: 7,
    name: "LHS White Sneaker",
    category: "tenis",
    price: 299.9,
    oldPrice: 359.9,
    sale: "-16%",
    description: "Tênis clean com identidade premium e visual versátil.",
    image: "",
    featured: true,
    bestseller: true
  },
  {
    id: 8,
    name: "Heavy Cotton Tee",
    category: "camisetas",
    price: 139.9,
    oldPrice: 169.9,
    sale: "-18%",
    description: "Camiseta encorpada com toque premium e ótimo caimento.",
    image: "",
    featured: false,
    bestseller: false
  },
  {
    id: 9,
    name: "Executive Urban Pants",
    category: "calcas",
    price: 249.9,
    oldPrice: 299.9,
    sale: "-17%",
    description: "Calça urbana elegante para looks sofisticados.",
    image: "",
    featured: false,
    bestseller: true
  },
  {
    id: 10,
    name: "Summer Street Bermuda",
    category: "bermudas",
    price: 159.9,
    oldPrice: 199.9,
    sale: "-20%",
    description: "Bermuda com visual leve, atual e masculino.",
    image: "",
    featured: false,
    bestseller: false
  },
  {
    id: 11,
    name: "Leather Touch Jacket",
    category: "jaquetas",
    price: 349.9,
    oldPrice: 429.9,
    sale: "-18%",
    description: "Jaqueta marcante com toque sofisticado e premium.",
    image: "",
    featured: true,
    bestseller: false
  },
  {
    id: 12,
    name: "Premium Cap Black",
    category: "acessorios",
    price: 79.9,
    oldPrice: 99.9,
    sale: "-20%",
    description: "Boné premium com estética urbana minimalista.",
    image: "",
    featured: false,
    bestseller: true
  }
];

function safeReadArray(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Erro ao ler ${key}:`, error);
    return [];
  }
}

function saveArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function saveProducts(productsToSave) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productsToSave));
}

function loadProductsFromLocal() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    } catch (error) {
      console.error("Erro ao ler produtos salvos:", error);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
  return [...defaultProducts];
}

let products = loadProductsFromLocal();

const state = {
  filter: "all",
  search: "",
  cart: safeReadArray(CART_KEY),
  favorites: safeReadArray(FAVORITES_KEY)
};

const productGrid = document.getElementById("productGrid");
const bestSellerGrid = document.getElementById("bestSellerGrid");
const cartItems = document.getElementById("cartItems");
const favoriteItems = document.getElementById("favoriteItems");
const cartCount = document.getElementById("cartCount");
const favoriteCount = document.getElementById("favoriteCount");
const cartTotal = document.getElementById("cartTotal");
const overlay = document.getElementById("overlay");

const loginToggle = document.getElementById("loginToggle");
const profileIcon = document.getElementById("profileIcon");
const mobileLoginToggle = document.getElementById("mobileLoginToggle");
const adminLink = document.getElementById("adminLink");
const mobileNav = document.getElementById("mobileNav");
const loginPanel = document.getElementById("loginPanel");
const googleLoginArea = document.getElementById("googleLoginArea");
const welcomePopup = document.getElementById("welcomePopup");
const closeWelcomePopup = document.getElementById("closeWelcomePopup");
const welcomeLaterBtn = document.getElementById("welcomeLaterBtn");
const welcomeGoogleBtn = document.getElementById("welcomeGoogleBtn");

function saveCart() {
  saveArray(CART_KEY, state.cart);
}

function saveFavorites() {
  saveArray(FAVORITES_KEY, state.favorites);
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function getCategoryLabel(category) {
  const labels = {
    camisetas: "Camisetas",
    calcas: "Calças",
    bermudas: "Bermudas",
    jaquetas: "Jaquetas",
    acessorios: "Acessórios",
    tenis: "Tênis"
  };

  return labels[category] || category;
}

function getFilteredProducts() {
  return products.filter((product) => {
    const matchFilter = state.filter === "all" || product.category === state.filter;

    const searchText =
      `${product.name} ${product.category} ${product.description || ""}`.toLowerCase();

    const matchSearch = searchText.includes((state.search || "").toLowerCase());

    return matchFilter && matchSearch;
  });
}

function renderProductImage(product) {
  if (product.image && product.image.trim() !== "") {
    return `
      <div class="product-media has-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
    `;
  }

  return `
    <div class="product-media" data-category="${product.category}"></div>
  `;
}

function renderProducts() {
  if (!productGrid) return;

  const filtered = getFilteredProducts();

  if (!filtered.length) {
    productGrid.innerHTML = `<p class="empty-state">Nenhum produto encontrado com esse filtro ou busca.</p>`;
    return;
  }

  productGrid.innerHTML = filtered
    .map((product) => {
      const isFavorite = state.favorites.some((item) => item.id === product.id);

      return `
        <article class="product-card reveal visible">
          ${product.sale ? `<span class="sale-badge">${product.sale}</span>` : ""}
          ${renderProductImage(product)}
          <div class="product-top">
            <div>
              <small class="section-kicker" style="margin-bottom:0;">${getCategoryLabel(product.category)}</small>
              <h3>${product.name}</h3>
            </div>
          </div>
          <p>${product.description || "Peça premium com visual sofisticado, masculino e contemporâneo."}</p>
          <div class="product-price">
            <strong>${formatPrice(product.price)}</strong>
            ${product.oldPrice ? `<span>${formatPrice(product.oldPrice)}</span>` : ""}
          </div>
          <div class="product-actions">
            <button class="buy-btn" onclick="buyNow(${product.id})">Comprar</button>
            <button class="cart-btn" onclick="addToCart(${product.id})">Carrinho</button>
            <button class="favorite-btn ${isFavorite ? "active" : ""}" onclick="toggleFavorite(${product.id})">
              ${isFavorite ? "♥" : "♡"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderBestSellers() {
  if (!bestSellerGrid) return;

  const bestsellers = products
    .filter((product) => product.bestseller)
    .slice(0, 6);

  if (!bestsellers.length) {
    bestSellerGrid.innerHTML = `<p class="empty-state">Nenhum produto marcado como mais vendido ainda.</p>`;
    return;
  }

  bestSellerGrid.innerHTML = bestsellers
    .map((product) => `
      <article class="product-card reveal visible">
        ${renderProductImage(product)}
        <h3>${product.name}</h3>
        <p>${product.description || "Um dos mais vendidos da coleção LHS MEN."}</p>
        <div class="product-price">
          <strong>${formatPrice(product.price)}</strong>
          ${product.oldPrice ? `<span>${formatPrice(product.oldPrice)}</span>` : ""}
        </div>
        <div class="product-actions">
          <button class="buy-btn" onclick="buyNow(${product.id})">Comprar</button>
          <button class="cart-btn" onclick="addToCart(${product.id})">Carrinho</button>
        </div>
      </article>
    `)
    .join("");
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const existingItem = state.cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    state.cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();
  updateCart();
  openPanel("cartPanel");
}

function buyNow(productId) {
  addToCart(productId);
}

function toggleFavorite(productId) {
  const exists = state.favorites.some((item) => item.id === productId);

  if (exists) {
    state.favorites = state.favorites.filter((item) => item.id !== productId);
  } else {
    const product = products.find((item) => item.id === productId);
    if (product) {
      state.favorites.push(product);
    }
  }

  saveFavorites();
  updateFavorites();
  renderProducts();
}

function removeFromCart(productId) {
  const index = state.cart.findIndex((item) => item.id === productId);
  if (index === -1) return;

  const item = state.cart[index];

  if ((item.quantity || 1) > 1) {
    item.quantity -= 1;
  } else {
    state.cart.splice(index, 1);
  }

  saveCart();
  updateCart();
}

function removeFavorite(productId) {
  state.favorites = state.favorites.filter((item) => item.id !== productId);
  saveFavorites();
  updateFavorites();
  renderProducts();
}

function updateCart() {
  if (cartCount) {
    const totalItems = state.cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    cartCount.textContent = totalItems;
  }

  if (!cartItems || !cartTotal) return;

  if (!state.cart.length) {
    cartItems.innerHTML = `<p class="empty-state">Seu carrinho está vazio no momento.</p>`;
    cartTotal.textContent = formatPrice(0);
    return;
  }

  cartItems.innerHTML = state.cart
    .map((item) => `
      <div class="cart-item">
        <h4>${item.name}</h4>
        <p>${getCategoryLabel(item.category)}${item.price ? ` • ${formatPrice(item.price)}` : ""}</p>
        <div class="item-row">
          <strong>Qtd: ${item.quantity || 1}</strong>
          <button onclick="removeFromCart(${item.id})">Remover</button>
        </div>
      </div>
    `)
    .join("");

  const total = state.cart.reduce(
    (acc, item) => acc + (Number(item.price || 0) * (item.quantity || 1)),
    0
  );

  cartTotal.textContent = formatPrice(total);
}

function updateFavorites() {
  if (favoriteCount) {
    favoriteCount.textContent = state.favorites.length;
  }

  if (!favoriteItems) return;

  if (!state.favorites.length) {
    favoriteItems.innerHTML = `<p class="empty-state">Você ainda não adicionou favoritos.</p>`;
    return;
  }

  favoriteItems.innerHTML = state.favorites
    .map((item) => `
      <div class="favorite-item">
        <h4>${item.name}</h4>
        <p>${getCategoryLabel(item.category)} • ${formatPrice(item.price)}</p>
        <div class="item-row">
          <button onclick="addToCart(${item.id})">Adicionar ao carrinho</button>
          <button onclick="removeFavorite(${item.id})">Remover</button>
        </div>
      </div>
    `)
    .join("");
}

function openPanel(panelId) {
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.remove("open");
  });

  const panel = document.getElementById(panelId);

  if (panel) {
    panel.classList.add("open");
    overlay?.classList.add("show");
    document.body.classList.add("panel-open");
  }
}

function closePanels() {
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.remove("open");
  });

  overlay?.classList.remove("show");
  document.body.classList.remove("panel-open");
}

function abrirPainelLogin() {
  openPanel("loginPanel");
  mobileNav?.classList.remove("open");
}

function fecharPainelLogin() {
  closePanels();
  mobileNav?.classList.remove("open");
}

function irParaPerfil() {
  window.location.href = "perfil.html";
}

function mostrarWelcomePopup() {
  if (!welcomePopup) return;
  welcomePopup.classList.add("show");
  document.body.classList.add("panel-open");
}

function fecharWelcomePopup(salvar = true) {
  welcomePopup?.classList.remove("show");
  document.body.classList.remove("panel-open");

  if (salvar) {
    localStorage.setItem(WELCOME_POPUP_KEY, "true");
  }
}

function setLoggedUI(user) {
  const nome = user?.displayName || "Minha conta";
  const email = (user?.email || "").toLowerCase();
  const foto = user?.photoURL;
  const isOwner = OWNER_EMAILS.includes(email);

  if (loginToggle) {
    loginToggle.setAttribute("data-logged", "true");
    loginToggle.setAttribute("title", nome);
  }

  if (mobileLoginToggle) {
    mobileLoginToggle.textContent = nome;
    mobileLoginToggle.setAttribute("data-logged", "true");
  }

  if (profileIcon) {
    if (foto) {
      profileIcon.innerHTML = `<img src="${foto}" alt="${nome}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      profileIcon.textContent = nome.charAt(0).toUpperCase();
    }
  }

  if (adminLink) {
    adminLink.style.display = isOwner ? "inline-block" : "none";
  }

  localStorage.setItem(WELCOME_POPUP_KEY, "true");
  fecharWelcomePopup(false);
  fecharPainelLogin();
}

function setLoggedOutUI() {
  if (loginToggle) {
    loginToggle.removeAttribute("data-logged");
    loginToggle.setAttribute("title", "Entrar");
  }

  if (mobileLoginToggle) {
    mobileLoginToggle.textContent = "Entrar";
    mobileLoginToggle.removeAttribute("data-logged");
  }

  if (profileIcon) {
    profileIcon.textContent = "👤";
  }

  if (adminLink) {
    adminLink.style.display = "none";
  }

  const jaViuPopup = localStorage.getItem(WELCOME_POPUP_KEY);

  if (!jaViuPopup) {
    setTimeout(() => {
      mostrarWelcomePopup();
    }, 900);
  }
}

function revealOnScroll() {
  const elements = document.querySelectorAll(".reveal");

  elements.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    const isVisible = top < window.innerHeight - 80;

    if (isVisible) {
      el.classList.add("visible");
    }
  });
}

function normalizeProduct(raw, fallbackId = Date.now()) {
  return {
    id: Number(raw.id ?? fallbackId),
    name: raw.name || "Produto sem nome",
    category: raw.category || "camisetas",
    price: Number(raw.price || 0),
    oldPrice: raw.oldPrice !== undefined && raw.oldPrice !== null && raw.oldPrice !== ""
      ? Number(raw.oldPrice)
      : null,
    sale: raw.sale || "",
    description: raw.description || "Peça premium com visual sofisticado, masculino e contemporâneo.",
    image: raw.image || "",
    featured: Boolean(raw.featured),
    bestseller: Boolean(raw.bestseller)
  };
}

function listenProductsFromFirestore() {
  try {
    onSnapshot(
      collection(db, "produtos"),
      (snapshot) => {
        if (snapshot.empty) {
          products = loadProductsFromLocal();
        } else {
          const firestoreProducts = snapshot.docs
            .map((docSnap, index) => normalizeProduct(docSnap.data(), index + 1))
            .sort((a, b) => b.id - a.id);

          products = firestoreProducts;
          saveProducts(products);
        }

        renderProducts();
        renderBestSellers();
        revealOnScroll();
      },
      (error) => {
        console.error("Erro ao ouvir produtos do Firestore:", error);
        products = loadProductsFromLocal();
        renderProducts();
        renderBestSellers();
      }
    );
  } catch (error) {
    console.error("Erro ao iniciar listener do Firestore:", error);
    products = loadProductsFromLocal();
    renderProducts();
    renderBestSellers();
  }
}

document.getElementById("cartToggle")?.addEventListener("click", () => {
  openPanel("cartPanel");
});

document.getElementById("favoritesToggle")?.addEventListener("click", () => {
  openPanel("favoritesPanel");
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", closePanels);
});

overlay?.addEventListener("click", () => {
  closePanels();
  fecharWelcomePopup(false);
});

document.getElementById("searchToggle")?.addEventListener("click", () => {
  document.getElementById("searchBar")?.classList.toggle("open");
});

document.getElementById("menuToggle")?.addEventListener("click", () => {
  document.getElementById("mobileNav")?.classList.toggle("open");
});

document.getElementById("searchInput")?.addEventListener("input", (e) => {
  state.search = e.target.value;
  renderProducts();
});

document.getElementById("clearSearch")?.addEventListener("click", () => {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";
  state.search = "";
  renderProducts();
});

document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    state.filter = button.dataset.filter;
    renderProducts();
  });
});

document.querySelectorAll("[data-category-link]").forEach((link) => {
  link.addEventListener("click", () => {
    const category = link.dataset.categoryLink;
    state.filter = category;

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === category);
    });

    renderProducts();
  });
});

const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Mensagem enviada com sucesso! Exemplo visual pronto para integração.");
  });
}

document.querySelectorAll(".add-look").forEach((button) => {
  button.addEventListener("click", () => {
    const lookName = button.dataset.look;

    const lookProduct = {
      id: Date.now(),
      name: `Look: ${lookName}`,
      category: "look completo",
      price: 499.9,
      quantity: 1
    };

    state.cart.push(lookProduct);
    saveCart();
    updateCart();
    openPanel("cartPanel");
  });
});

loginToggle?.addEventListener("click", async () => {
  const isLogged = loginToggle.getAttribute("data-logged");

  if (isLogged) {
    irParaPerfil();
  } else {
    abrirPainelLogin();
  }
});

mobileLoginToggle?.addEventListener("click", async () => {
  const isLogged = mobileLoginToggle.getAttribute("data-logged");

  if (isLogged) {
    irParaPerfil();
  } else {
    abrirPainelLogin();
  }
});

function bindGoogleButtons() {
  if (googleLoginArea) {
    googleLoginArea.innerHTML = "";
    const btnGoogle = document.createElement("button");
    btnGoogle.innerText = "Entrar com Google";
    btnGoogle.className = "btn btn-light full";
    btnGoogle.type = "button";
    btnGoogle.addEventListener("click", async () => {
      await loginWithGoogle();
    });
    googleLoginArea.appendChild(btnGoogle);
  }

  welcomeGoogleBtn?.addEventListener("click", async () => {
    await loginWithGoogle();
  });

  closeWelcomePopup?.addEventListener("click", () => fecharWelcomePopup(true));
  welcomeLaterBtn?.addEventListener("click", () => fecharWelcomePopup(true));
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

window.addEventListener("mousemove", (e) => {
  const glow = document.querySelector(".cursor-glow");

  if (glow) {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === CART_KEY) {
    state.cart = safeReadArray(CART_KEY);
    updateCart();
  }

  if (event.key === FAVORITES_KEY) {
    state.favorites = safeReadArray(FAVORITES_KEY);
    updateFavorites();
    renderProducts();
  }

  if (event.key === STORAGE_KEY) {
    products = loadProductsFromLocal();
    renderProducts();
    renderBestSellers();
  }
});

async function init() {
  await prepareAuth();
  await handleRedirectLogin();

  monitorAuth((user) => {
    if (user) {
      setLoggedUI(user);
    } else {
      setLoggedOutUI();
    }
  });

  bindGoogleButtons();
  renderProducts();
  renderBestSellers();
  updateCart();
  updateFavorites();
  revealOnScroll();
  listenProductsFromFirestore();
}

init();

window.buyNow = buyNow;
window.addToCart = addToCart;
window.toggleFavorite = toggleFavorite;
window.removeFromCart = removeFromCart;
window.removeFavorite = removeFavorite;
window.openPanel = openPanel;
window.closePanels = closePanels;