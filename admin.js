import { db } from "./firebase.js";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

function saveProductsLocal(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadProductsLocal() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (error) {
      console.error("Erro ao carregar produtos do localStorage:", error);
    }
  }

  saveProductsLocal(defaultProducts);
  return [...defaultProducts];
}

let products = loadProductsLocal();

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
    .sort((a, b) => b.id - a.id)
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

async function deleteProduct(id) {
  const confirmDelete = confirm("Tem certeza que deseja excluir este produto?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "produtos", String(id)));
    products = products.filter((product) => product.id !== id);
    saveProductsLocal(products);
    renderTable();
    resetForm();
    alert("Produto excluído com sucesso.");
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    alert("Erro ao excluir produto no Firestore.");
  }
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

async function loadProductsFromFirestore() {
  try {
    const snapshot = await getDocs(collection(db, "produtos"));

    if (snapshot.empty) {
      products = loadProductsLocal();
      renderTable();
      return;
    }

    products = snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        return {
          id: Number(data.id),
          name: data.name || "Produto sem nome",
          category: data.category || "camisetas",
          price: Number(data.price || 0),
          oldPrice: data.oldPrice !== undefined && data.oldPrice !== null && data.oldPrice !== ""
            ? Number(data.oldPrice)
            : null,
          sale: data.sale || "",
          description: data.description || "",
          image: data.image || "",
          featured: !!data.featured,
          bestseller: !!data.bestseller
        };
      })
      .sort((a, b) => b.id - a.id);

    saveProductsLocal(products);
    renderTable();
  } catch (error) {
    console.error("Erro ao carregar Firestore:", error);
    products = loadProductsLocal();
    renderTable();
  }
}

if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = getFormData();

    if (!data.name || !data.category || !data.price) {
      alert("Preencha nome, categoria e preço.");
      return;
    }

    try {
      await setDoc(doc(db, "produtos", String(data.id)), data);

      const existingIndex = products.findIndex((product) => product.id === data.id);

      if (existingIndex >= 0) {
        products[existingIndex] = data;
      } else {
        products.unshift(data);
      }

      saveProductsLocal(products);
      renderTable();
      resetForm();
      alert("Produto salvo com sucesso.");
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto no Firestore.");
    }
  });
}

if (imageFileInput) {
  imageFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Escolha apenas arquivos de imagem.");
      imageFileInput.value = "";
      return;
    }

    if (file.size > 700 * 1024) {
      alert("A imagem está muito grande. Escolha uma imagem menor que 700KB.");
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
  resetAllBtn.addEventListener("click", async () => {
    const confirmed = confirm("Isso vai apagar todos os produtos salvos no painel. Deseja continuar?");
    if (!confirmed) return;

    try {
      const snapshot = await getDocs(collection(db, "produtos"));

      const promises = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "produtos", docSnap.id))
      );

      await Promise.all(promises);

      products = [...defaultProducts];

      const recreatePromises = products.map((product) =>
        setDoc(doc(db, "produtos", String(product.id)), product)
      );

      await Promise.all(recreatePromises);

      saveProductsLocal(products);
      renderTable();
      resetForm();
      alert("Produtos resetados com sucesso.");
    } catch (error) {
      console.error("Erro ao resetar produtos:", error);
      alert("Erro ao limpar os produtos no Firestore.");
    }
  });
}

renderPreview("");
loadProductsFromFirestore();

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;