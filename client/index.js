import { getDatabase, ref, get, child } from "./firebase.js";
import getThemeColor from "./Utilities/ColorTheme.js";

const db = getDatabase();
const itemCodes = [];
let products;

function searchItem() {
  const searchItemValue = document.getElementById("div2").value;
  const myURL = new URL(
    `${window.location.protocol}//${window.location.host}/Search/`
  );
  myURL.searchParams.append("search", searchItemValue);
  window.location = myURL;
}

function setItem(item) {
  const myURL = new URL(
    `${window.location.protocol}//${window.location.host}/Product/`
  );
  myURL.searchParams.append("product", item.code);

  const productLink = document.createElement("a");
  productLink.href = myURL;
  productLink.classList.add(
    "items_view",
    "col-xs-6",
    "col-sm-4",
    "col-lg-3",
    "col-md-4"
  );

  const image = document.createElement("img");
  image.classList.add("items_image");
  image.src = item.url[0];
  productLink.appendChild(image);

  const name = document.createElement("p");
  name.classList.add("item_name");
  name.textContent = item.name;
  productLink.appendChild(name);

  const price = document.createElement("p");
  price.classList.add("item_price");
  const formattedPrice = new Intl.NumberFormat("en-US").format(item.price);
  price.textContent = `₦${formattedPrice}`;
  price.style.color = "#000137";
  productLink.appendChild(price);

  document.getElementById("items_body").appendChild(productLink);
  itemCodes.push(item.code);
}

function updateCartCount() {
  const cartList = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cartList.length || 0;
  // document.getElementById("cart_num").textContent = cartCount;
  document.getElementById("cart_num2").textContent = cartCount;
}

function fetchProducts() {
  document.getElementById("main__menu").style.display = "none";
  document.getElementById("loader").style.display = "block";
  document.getElementById("title").textContent = window.location.host;

  const dbref = ref(db);
  get(child(dbref, "ProductsDetails/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        document.getElementById("main__menu").style.display = "flex";
        document.getElementById("loader").style.display = "none";

        products = Object.values(snapshot.val());
        let filteredProducts = [...products];

        while (filteredProducts.length) {
          const randomIndex = Math.floor(
            Math.random() * filteredProducts.length
          );
          const product = filteredProducts.splice(randomIndex, 1)[0];
          setItem(product);
        }
      }
    })
    .catch(console.error);
}

function inputSearch() {
  const searchItemValue = document.getElementById("div2").value.toLowerCase();
  const datalist = document.getElementById("history");
  datalist.textContent = "";

  const matchingItems = Object.values(products).filter((item) =>
    item.name.toLowerCase().includes(searchItemValue)
  );

  if (matchingItems.length > 0) {
    matchingItems.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.name;
      datalist.appendChild(option);
    });
  } else {
    getHistory(searchItemValue);
  }
}

function getHistory() {
  const historyArray = JSON.parse(localStorage.getItem("history")) || [];
  const datalist = document.getElementById("history");

  historyArray.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.name;
    datalist.appendChild(option);
  });
}

document.getElementById("div2").addEventListener("input", inputSearch);
document.getElementById("div2").addEventListener("search", searchItem);

window.onload = function () {
  updateCartCount();
  fetchProducts();
  getThemeColor();
};

