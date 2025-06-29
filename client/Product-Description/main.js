import { getDatabase, ref, get, child } from "../firebase.js";
import getThemeColor from "../Utilities/ColorTheme.js";

const db = getDatabase();
let products;
const recentItems = JSON.parse(localStorage.getItem("recent")) || [];
const internationalNumberFormat = new Intl.NumberFormat("en-US");

window.onload = () => {
  getThemeColor();
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cartItems.length;

  document.getElementById("cart_num2").textContent = cartCount;

  initializePage();
};

const initializePage = () => {
  const productCode = new URLSearchParams(window.location.search).get(
    "product"
  );

  if (!productCode) {
    window.location.replace("../");
    return;
  }

  const dbRef = ref(db);

  get(child(dbRef, "ProductsDetails/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        products = snapshot.val();
        const product = Object.values(products).find(
          (item) => item.code === productCode
        );

        if (product) {
          document.getElementById("productName").innerHTML = `${product.name}:`;
          document.getElementById("description").innerHTML =
            product.description;
          displayPage();
        } else {
          displayNoItems();
        }
        displayRecentItems();
      } else {
        displayNoItems();
      }
    })
    .catch((error) => console.error(error));
};

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
        <a href=${myURL} class="rec_view">
          <img class="rec_image" src=${recentProduct.url[0]}>
          <p class="rec_price">₦${internationalNumberFormat.format(
            recentProduct.price
          )}</p>
        </a>`;

        document.getElementById("recent").innerHTML += recentHTML;
      }
    });
}

const displayPage = () => {
  document.getElementById("loader").style.display = "none";
  document.getElementById("body").style.display = "block";
};

const displayNoItems = () => {
  document.getElementById("loader").style.display = "none";
  document.getElementById("no_items").style.display = "block";
};
