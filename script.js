const STORAGE_KEY = "lhsmen_products";

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

function loadProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("Erro ao ler produtos salvos:", error);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
  return [...defaultProducts];
}

let products = loadProducts();

const state = {
  filter: "all",
  search: "",
  cart: [],
  favorites: []
};

const productGrid = document.getElementById("productGrid");
const bestSellerGrid = document.getElementById("bestSellerGrid");
const cartItems = document.getElementById("cartItems");
const favoriteItems = document.getElementById("favoriteItems");
const cartCount = document.getElementById("cartCount");
const favoriteCount = document.getElementById("favoriteCount");
const cartTotal = document.getElementById("cartTotal");
const overlay = document.getElementById("overlay");

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
    const matchFilter =
      state.filter === "all" || product.category === state.filter;

    const searchText =
      `${product.name} ${product.category} ${product.description || ""}`.toLowerCase();

    const matchSearch = searchText.includes(state.search.toLowerCase());

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
  const filtered = getFilteredProducts();

  if (!filtered.length) {
    productGrid.innerHTML =
      `<p class="empty-state">Nenhum produto encontrado com esse filtro ou busca.</p>`;
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
  const bestsellers = products
    .filter((product) => product.bestseller)
    .slice(0, 6);

  if (!bestsellers.length) {
    bestSellerGrid.innerHTML =
      `<p class="empty-state">Nenhum produto marcado como mais vendido ainda.</p>`;
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

  state.cart.push(product);
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
    if (product) state.favorites.push(product);
  }

  updateFavorites();
  renderProducts();
}

function removeFromCart(productId) {
  const index = state.cart.findIndex((item) => item.id === productId);
  if (index > -1) state.cart.splice(index, 1);
  updateCart();
}

function removeFavorite(productId) {
  state.favorites = state.favorites.filter((item) => item.id !== productId);
  updateFavorites();
  renderProducts();
}

function updateCart() {
  cartCount.textContent = state.cart.length;

  if (!state.cart.length) {
    cartItems.innerHTML =
      `<p class="empty-state">Seu carrinho está vazio no momento.</p>`;
    cartTotal.textContent = formatPrice(0);
    return;
  }

  cartItems.innerHTML = state.cart
    .map((item) => `
      <div class="cart-item">
        <h4>${item.name}</h4>
        <p>${getCategoryLabel(item.category)}${item.price ? ` • ${formatPrice(item.price)}` : ""}</p>
        <div class="item-row">
          <strong>${formatPrice(item.price)}</strong>
          <button onclick="removeFromCart(${item.id})">Remover</button>
        </div>
      </div>
    `)
    .join("");

  const total = state.cart.reduce((acc, item) => acc + Number(item.price || 0), 0);
  cartTotal.textContent = formatPrice(total);
}

function updateFavorites() {
  favoriteCount.textContent = state.favorites.length;

  if (!state.favorites.length) {
    favoriteItems.innerHTML =
      `<p class="empty-state">Você ainda não adicionou favoritos.</p>`;
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
    overlay.classList.add("show");
    document.body.classList.add("panel-open");
  }
}

function closePanels() {
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.remove("open");
  });

  overlay.classList.remove("show");
  document.body.classList.remove("panel-open");
}

document.getElementById("cartToggle")?.addEventListener("click", () => {
  openPanel("cartPanel");
});

document.getElementById("favoritesToggle")?.addEventListener("click", () => {
  openPanel("favoritesPanel");
});

document.getElementById("loginToggle")?.addEventListener("click", () => {
  openPanel("loginPanel");
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", closePanels);
});

overlay?.addEventListener("click", closePanels);

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

document.querySelectorAll(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab").forEach((t) => {
      t.classList.remove("active");
    });

    tab.classList.add("active");

    const authType = tab.dataset.auth;
    document.getElementById("loginForm")?.classList.toggle("hidden", authType !== "login");
    document.getElementById("registerForm")?.classList.toggle("hidden", authType !== "register");
  });
});

document.querySelectorAll(".auth-form").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Exemplo visual pronto. Agora você pode integrar com backend real.");
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
      price: 499.9
    };

    state.cart.push(lookProduct);
    updateCart();
    openPanel("cartPanel");
  });
});

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

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

window.addEventListener("mousemove", (e) => {
  const glow = document.querySelector(".cursor-glow");

  if (glow) {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  }
});

window.addEventListener("storage", () => {
  products = loadProducts();
  renderProducts();
  renderBestSellers();
});

renderProducts();
renderBestSellers();
updateCart();
updateFavorites();
revealOnScroll();

window.buyNow = buyNow;
window.addToCart = addToCart;
window.toggleFavorite = toggleFavorite;
window.removeFromCart = removeFromCart;
window.removeFavorite = removeFavorite;