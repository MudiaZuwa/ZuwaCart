import getThemeColor from "../../Utilities/ColorTheme";
import {
  getDatabase,
  ref,
  get,
  child,
  onAuthStateChanged,
  getAuth,
  update,
} from "/firebase.js";

const db = getDatabase();
let order = {};
let totalPrice = 0;
let products = {};
let userID, orderId;
let vendorDetails;
const formatter = new Intl.NumberFormat("en-US");
const recentItems = JSON.parse(localStorage.getItem("recent")) || [];

onload = () => {
  getThemeColor();
  const searchParams = new URLSearchParams(window.location.search);
  orderId = searchParams.get("order");
  const auth = getAuth();

  if (!orderId) {
    window.location.replace("../");
  } else {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        userID = user.uid;
        fetchUserOrders();
        document.getElementById("title").textContent = `Order: ${orderId}`;
      } else {
        window.location.replace("../Login");
      }
    });
  }
};

function fetchUserOrders() {
  const dbref = ref(db);
  get(child(dbref, `UsersDetails/${userID}`)).then((snapshot) => {
    if (snapshot.exists()) {
      vendorDetails = snapshot.val();
      const userOrders = vendorDetails.orders;
      order = userOrders.find((order) => order.orderId === orderId);
      fetchProductDetails();
    }
  });
}

function fetchProductDetails() {
  document.getElementById("loader").style.display = "block";
  document.getElementById("body").style.display = "none";
  const dbref = ref(db);
  get(child(dbref, "ProductsDetails/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        products = snapshot.val();
        if (order && products) {
          renderProducts();
          displayRecentItems(products);
        } else {
          toggleEmptyCartView(true);
        }
      }
    })
    .catch((error) => console.error(error));
}

function renderProducts() {
  const productContainer = document.getElementById("products");
  productContainer.textContent = "";
  totalPrice = 0;

  order.orders.forEach((product, index) => {
    const productDetails = Object.values(products).find(
      (item) => item.code === product.code
    );
    if (productDetails) {
      const { name, price, url, code } = productDetails;
      const { amount } = product;
      totalPrice += price * amount;
      createCartItemView(productContainer, name, price, url[0], amount, code);
    }
  });

  document.getElementById("total").textContent = `₦${formatter.format(
    totalPrice
  )}`;
  document.getElementById("status").textContent = order.status;
  if (productContainer.innerText === "") toggleEmptyCartView(true);
  else toggleEmptyCartView(false);
}

function createCartItemView(container, name, price, imageUrl, quantity, code) {
  const view = document.createElement("div");
  view.classList.add("item-view");

  const productURl = new URL(
    `${window.location.protocol}//${window.location.host}/Product/`
  );
  productURl.searchParams.append("product", code);

  const productLink = document.createElement("a");
  productLink.href = productURl;

  const detailsFlexContainer = document.createElement("div");
  detailsFlexContainer.classList.add("flex");

  const detailsContainer = document.createElement("div");
  detailsContainer.style.padding = "8px";

  const quantityFlexContainer = document.createElement("div");
  quantityFlexContainer.classList.add("flex", "quantityContainer");

  const image = document.createElement("img");
  image.classList.add("item-image");
  image.src = imageUrl;

  const itemName = document.createElement("p");
  itemName.classList.add("item-name");
  itemName.textContent = name;

  const itemPrice = document.createElement("p");
  itemPrice.classList.add("item-price");
  itemPrice.textContent = `₦${formatter.format(price)}`;

  const quantityText = document.createElement("p");
  quantityText.classList.add("quantity-text");
  quantityText.textContent = "Quantity: ";
  const itemQuantity = document.createElement("p");
  itemQuantity.classList.add("item-quantity");
  itemQuantity.textContent = quantity;

  detailsContainer.append(itemName, itemPrice);
  detailsFlexContainer.append(image, detailsContainer);
  quantityFlexContainer.append(quantityText, itemQuantity);
  productLink.append(detailsFlexContainer, quantityFlexContainer);

  view.append(productLink);
  container.append(view);
}

function toggleEmptyCartView(isEmpty) {
  document.getElementById("loader").style.display = "none";
  document.getElementById("body").style.display = "block";
  document.getElementById("products").style.display = isEmpty
    ? "none"
    : "block";
  document.getElementById("no_items").style.display = isEmpty
    ? "block"
    : "none";
  document.getElementById("info").style.display = isEmpty ? "none" : "block";
}

function displayRecentItems(products) {
  if (recentItems.length > 0) {
    Object.values(recentItems)
      .slice(0, 10)
      .forEach((item) => {
        const recentProduct = Object.values(products).find(
          (product) => product.code === item.code
        );
        if (recentProduct) {
          const productURl = new URL(
            `${window.location.protocol}//${window.location.host}/Product/`
          );
          productURl.searchParams.append("product", recentProduct.code);

          const recentHTML = `
          <a href="${productURl}" class="rec_view">
            <img class="rec_image" src="${recentProduct.url[0]}">
            <p class="rec_price">₦${formatter.format(recentProduct.price)}</p>
          </a>
        `;

          document.getElementById("recent").innerHTML += recentHTML;
        }
      });
  } else document.getElementById("rec").style.display = "none";
}
