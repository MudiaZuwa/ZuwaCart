import { getDatabase, ref, get, child } from "../firebase.js";
import getThemeColor from "../Utilities/ColorTheme.js";

const db = getDatabase();
const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
const savedItems = JSON.parse(localStorage.getItem("saved_items")) || [];
const recentItems = JSON.parse(localStorage.getItem("recent")) || [];
const internationalNumberFormat = new Intl.NumberFormat("en-US");
let currentProduct = {};
let vendorId = "";
let products = {};

const addButton = document.getElementById("plus-box");
const minusButton = document.getElementById("minus-box");
const cartButton = document.getElementById("add-box");
const saveButton = document.getElementById("save");

window.onload = () => {
  getThemeColor();
  updateCartCount();
  loadProductDetails();
};

function updateCartCount() {
  const cartCount = cartItems.length;
  document.getElementById("cart_num").textContent = cartCount || 0;
}

function loadProductDetails() {
  const searchParams = new URLSearchParams(window.location.search);
  const productId = searchParams.get("product");

  if (!productId) {
    window.location.replace("../");
    return;
  }

  const dbRef = ref(db);
  get(child(dbRef, "ProductsDetails/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        products = snapshot.val();
        currentProduct = Object.values(products).find(
          (product) => product.code === productId
        );

        if (currentProduct) {
          displayProductDetails();
          setupEventListeners(productId);
          vendorId = currentProduct.vendorID;
          fetchVendorDetails();
          addToRecentItems();
          displayRecommendedProducts();
          updateSaveButton(productId);
        } else {
          showNoProductFound();
        }
        displayRecentItems();
      }
    })
    .catch(console.error);
}

function displayProductDetails() {
  const productDescriptionURL = new URL(
    `${window.location.protocol}//${window.location.host}/Product-Description/?product=${currentProduct.code}`
  );

  document.getElementById("title").textContent = currentProduct.name;
  document.getElementById("item_name").textContent = currentProduct.name;

  document.getElementById(
    "item_price"
  ).textContent = `₦${internationalNumberFormat.format(currentProduct.price)}`;
  document.getElementById("des_img").href = productDescriptionURL;
  document.getElementById("item_description").textContent =
    currentProduct.description;
  document.getElementById("1").src = currentProduct.url[0];

  if (currentProduct.pickupTime) {
    const pickup = Number(currentProduct.pickupTime);
    const minDelivery = pickup + 2;
    const maxDelivery = pickup + 3;
    document.getElementById(
      "deliveryEstimate"
    ).textContent = `${minDelivery}-${maxDelivery} `;
  } else {
    document.getElementById("deliveryText").style.display = "none";
  }

  // Create Image Slider using template literals
  const slidercontainer = document.getElementById("slidercontainer");
  currentProduct.url.slice(1).forEach((url) => {
    const slideHTML = `
      <div class="carousel-item">
        <div class="img_container">
          <img class="item_images d-block w-100" src="${url}">
        </div>
      </div>
    `;
    slidercontainer.innerHTML += slideHTML;
  });

  showContent("body");
  showContent("rec");
}

function setupEventListeners(productId) {
  getCartItem(productId);
  updateSaveButton(productId);

  saveButton.addEventListener("click", () => toggleSaveItem(productId));
  cartButton.addEventListener("click", handleCartClick);
  addButton.addEventListener("click", increaseCartItem);
  minusButton.addEventListener("click", decreaseCartItem);
}

function showNoProductFound() {
  showContent("no_items");
  showContent("rec");
}

function showContent(elementId) {
  document.getElementById("loader").style.display = "none";
  document.getElementById(elementId).style.display = "block";
}

function getCartItem(productId) {
  const cartItem = cartItems.find((item) => item.code === productId);
  if (cartItem) {
    displayCartItem(cartItem);
  } else {
    resetCartButton();
  }
}

function displayCartItem(cartItem) {
  cartButton.textContent = cartItem.amount;
  cartButton.style = "background-color: white; color: black; box-shadow: none;";
  addButton.style.display = "flex";
  minusButton.style.display = "flex";
}

function resetCartButton() {
  cartButton.textContent = "Add to cart";
  cartButton.style =
    "background-color: #000137; color: white; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19);";
  addButton.style.display = "none";
  minusButton.style.display = "none";
}

function handleCartClick() {
  const productId = currentProduct.code;

  if (!cartItems.some((item) => item.code === productId)) {
    cartItems.push({ code: productId, amount: 1, vendor: vendorId });
    updateCartCount();
    localStorage.setItem("cart", JSON.stringify(cartItems));
    displayCartItem({ code: productId, amount: 1 });
  }
}

function increaseCartItem() {
  const cartItem = cartItems.find((item) => item.code === currentProduct.code);
  if (cartItem) {
    cartItem.amount += 1;
    cartButton.textContent = cartItem.amount;
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }
}

function decreaseCartItem() {
  const cartItem = cartItems.find((item) => item.code === currentProduct.code);
  if (cartItem && cartItem.amount > 1) {
    cartItem.amount -= 1;
    cartButton.textContent = cartItem.amount;
    localStorage.setItem("cart", JSON.stringify(cartItems));
  } else {
    removeCartItem();
  }
}

function removeCartItem() {
  const productId = currentProduct.code;
  const index = cartItems.findIndex((item) => item.code === productId);

  if (index !== -1) {
    cartItems.splice(index, 1);
    updateCartCount();
    localStorage.setItem("cart", JSON.stringify(cartItems));
    resetCartButton();
  }
}

function fetchVendorDetails() {
  const dbRef = ref(db);
  get(child(dbRef, "VendorsDetails/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const vendors = snapshot.val();
        const vendor = Object.values(vendors).find(
          (v) => v.vendorId === vendorId
        );

        if (vendor) {
          document.getElementById("vendorName").innerText = vendor.vendorName;
          document.getElementById("vendorIcon").src =
            vendor.LogoUrl || "../images/PngItem_248631.png";
          document.getElementById(
            "vendorStoreImg"
          ).href = `/Vendor-Shop/?vendor=${vendorId}`;
          displayVendorItems(vendorId);
        }
      }
    })
    .catch(console.error);
}

function displayVendorItems(vendorId) {
  const vendorProducts = Object.values(products).filter(
    (item) => item.vendorID === vendorId && currentProduct.code !== item.code
  );

  if (vendorProducts.length === 0)
    document.getElementById("vendorProdHead").style.display = "none";

  vendorProducts.forEach((product) => {
    const myURL = new URL(
      `${window.location.protocol}//${window.location.host}/Product/`
    );
    myURL.searchParams.append("product", product.code);

    const vendorItemsHTML = `
      <a href="${myURL}" class="items_view">
        <img class="rec_image" src="${product.url[0]}">
        <p class="item_name">${product.name}</p>
        <p class="item_price">₦${internationalNumberFormat.format(
          product.price
        )}</p>
      </a>
    `;

    document.getElementById("vendorItems").innerHTML += vendorItemsHTML;
  });
}

function displayRecentItems() {
  Object.values(recentItems)
    .slice(0, 10)
    .forEach((item) => {
      const recentProduct = Object.values(products).find(
        (product) => product.code === item.code
      );

      if (recentProduct) {
        const myURL = new URL(
          `${window.location.protocol}//${window.location.host}/Product/`
        );
        myURL.searchParams.append("product", recentProduct.code);

        const recentHTML = `
        <a href="${myURL}" class="rec_view">
          <img class="rec_image" src="${recentProduct.url[0]}">
          <p class="rec_price">₦${internationalNumberFormat.format(
            recentProduct.price
          )}</p>
        </a>
      `;

        document.getElementById("recent").innerHTML += recentHTML;
      }
    });
}

function displayRecommendedProducts() {
  const categoryProducts = Object.values(products).filter(
    (product) =>
      product.category === currentProduct.category &&
      product.code !== currentProduct.code
  );
  if (categoryProducts.length > 0) {
    categoryProducts.slice(0, 5).forEach((product) => {
      const myURL = new URL(
        `${window.location.protocol}//${window.location.host}/Product/`
      );
      myURL.searchParams.append("product", product.code);

      const recommendedHTML = `
      <a href="${myURL}" class="rec_view">
        <img class="rec_image" src="${product.url[0]}">
        <p class="rec_price">₦${internationalNumberFormat.format(
          product.price
        )}</p>
      </a>
    `;

      document.getElementById("recommended").innerHTML += recommendedHTML;
    });
  } else document.getElementById("recommendedBody").style.display = "none";
}

function addToRecentItems() {
  const productId = currentProduct.code;

  const alreadyExists = recentItems.some((item) => item.code === productId);

  if (!alreadyExists) {
    recentItems.unshift({ code: productId });
    if (recentItems.length > 10) {
      recentItems.pop();
    }
    localStorage.setItem("recent", JSON.stringify(recentItems));
  }
}

function updateSaveButton(productId) {
  const alreadySaved = savedItems.some((item) => item.code === productId);
  saveButton.src = alreadySaved
    ? "../images/heart-solid-24.png"
    : "../images/heart-regular-24.png";
}

function toggleSaveItem(productId) {
  const alreadySaved = savedItems.some((item) => item.code === productId);

  if (alreadySaved) {
    removeSavedItem(productId);
  } else {
    saveItem(productId);
  }
}

function saveItem(productId) {
  savedItems.unshift({ code: productId });
  localStorage.setItem("saved_items", JSON.stringify(savedItems));
  updateSaveButton(productId);
}

function removeSavedItem(productId) {
  const index = savedItems.findIndex((item) => item.code === productId);

  if (index !== -1) {
    savedItems.splice(index, 1);
    localStorage.setItem("saved_items", JSON.stringify(savedItems));
    updateSaveButton(productId);
  }
}
