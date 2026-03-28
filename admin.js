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
    name: "Signature Black Jacket",
    category: "jaquetas",
    price: 329.9,
    oldPrice: 399.9,
    sale: "-17%",
    description: "Jaqueta premium com presença forte e acabamento refinado.",
    image: "",
    featured: true,
    bestseller: true
  }
];

function loadProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
  return [...defaultProducts];
}

let products = loadProducts();

const productForm = document.getElementById("productForm");
const productTableBody = document.getElementById("productTableBody");
const imageInput = document.getElementById("image");
const imageFileInput = document.getElementById("imageFile");
const imagePreview = document.getElementById("imagePreview");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const resetAllBtn = document.getElementById("resetAllBtn");
const formTitle = document.getElementById("formTitle");

const totalProducts = document.getElementById("totalProducts");
const totalFeatured = document.getElementById("totalFeatured");
const totalBestsellers = document.getElementById("totalBestsellers");
const totalSales = document.getElementById("totalSales");

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
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

function updateStats() {
  totalProducts.textContent = products.length;
  totalFeatured.textContent = products.filter((p) => p.featured).length;
  totalBestsellers.textContent = products.filter((p) => p.bestseller).length;
  totalSales.textContent = products.filter((p) => p.sale && p.sale.trim() !== "").length;
}

function renderPreview(url) {
  if (!url || !url.trim()) {
    imagePreview.innerHTML = "Sem imagem";
    return;
  }

  imagePreview.innerHTML = `<img src="${url}" alt="Prévia da imagem">`;
}

function renderTable() {
  if (!products.length) {
    productTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-row">Nenhum produto cadastrado ainda.</td>
      </tr>
    `;
    updateStats();
    return;
  }

  productTableBody.innerHTML = products
    .map((product) => `
      <tr>
        <td>
          <div class="thumb">
            ${product.image ? `<img src="${product.image}" alt="${product.name}">` : ""}
          </div>
        </td>
        <td>${product.name}</td>
        <td>${getCategoryLabel(product.category)}</td>
        <td>${formatPrice(product.price)}</td>
        <td>${product.sale || "-"}</td>
        <td>
          <span class="${product.featured ? "badge-yes" : "badge-no"}">
            ${product.featured ? "Sim" : "Não"}
          </span>
        </td>
        <td>
          <span class="${product.bestseller ? "badge-yes" : "badge-no"}">
            ${product.bestseller ? "Sim" : "Não"}
          </span>
        </td>
        <td>
          <div class="actions">
            <button class="edit-btn" onclick="editProduct(${product.id})">Editar</button>
            <button class="delete-btn" onclick="deleteProduct(${product.id})">Excluir</button>
          </div>
        </td>
      </tr>
    `)
    .join("");

  updateStats();
}

function resetForm() {
  productForm.reset();
  document.getElementById("productId").value = "";
  formTitle.textContent = "Cadastrar novo produto";
  imageInput.value = "";

  if (imageFileInput) {
    imageFileInput.value = "";
  }

  renderPreview("");
}

function editProduct(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  document.getElementById("productId").value = product.id;
  document.getElementById("name").value = product.name;
  document.getElementById("category").value = product.category;
  document.getElementById("price").value = product.price;
  document.getElementById("oldPrice").value = product.oldPrice || "";
  document.getElementById("sale").value = product.sale || "";
  document.getElementById("description").value = product.description || "";
  document.getElementById("image").value = product.image || "";
  document.getElementById("featured").checked = !!product.featured;
  document.getElementById("bestseller").checked = !!product.bestseller;

  if (imageFileInput) {
    imageFileInput.value = "";
  }

  formTitle.textContent = "Editando produto";
  renderPreview(product.image || "");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteProduct(id) {
  const confirmDelete = confirm("Tem certeza que deseja excluir este produto?");
  if (!confirmDelete) return;

  products = products.filter((product) => product.id !== id);
  saveProducts();
  renderTable();
  resetForm();
}

function getFormData() {
  return {
    id: Number(document.getElementById("productId").value) || Date.now(),
    name: document.getElementById("name").value.trim(),
    category: document.getElementById("category").value,
    price: parseFloat(document.getElementById("price").value || 0),
    oldPrice: document.getElementById("oldPrice").value
      ? parseFloat(document.getElementById("oldPrice").value)
      : null,
    sale: document.getElementById("sale").value.trim(),
    description: document.getElementById("description").value.trim(),
    image: document.getElementById("image").value.trim(),
    featured: document.getElementById("featured").checked,
    bestseller: document.getElementById("bestseller").checked
  };
}

if (productForm) {
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = getFormData();
    const existingIndex = products.findIndex((product) => product.id === data.id);

    if (existingIndex >= 0) {
      products[existingIndex] = data;
    } else {
      products.unshift(data);
    }

    saveProducts();
    renderTable();
    resetForm();
    alert("Produto salvo com sucesso.");
  });
}

if (imageFileInput) {
  imageFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Escolha apenas arquivos de imagem.");
      imageFileInput.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      const base64 = e.target.result;
      imageInput.value = base64;
      renderPreview(base64);
    };

    reader.onerror = function () {
      alert("Erro ao carregar a imagem.");
    };

    reader.readAsDataURL(file);
  });
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", resetForm);
}

if (resetAllBtn) {
  resetAllBtn.addEventListener("click", () => {
    const confirmed = confirm("Isso vai apagar todos os produtos salvos no painel. Deseja continuar?");
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    products = [...defaultProducts];
    saveProducts();
    renderTable();
    resetForm();
  });
}

renderTable();
renderPreview("");

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;