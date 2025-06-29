import { get, child, getDatabase, ref } from "../firebase.js";
import getThemeColor from "../Utilities/ColorTheme.js";

let vendorId;
const db = getDatabase();
const numberFormatter = new Intl.NumberFormat("en-US");
const recentItems = JSON.parse(localStorage.getItem("recent")) || [];

window.onload = () => {
  getThemeColor();
  updateCartCount();

  vendorId = new URLSearchParams(window.location.search).get("vendor");
  if (vendorId === null) window.location = "index.html";
  else fetchVendorDetails();
};

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
          document.getElementById("vendorName").textContent = vendor.vendorName;
          document.getElementById("vendorIcon").src =
            vendor.LogoUrl || "../images/PngItem_248631.png";
          document.getElementById("title").textContent = vendor.vendorName;
          fetchVendorProducts(vendorId);
        } else window.location = "index.html";
      }
    })
    .catch(console.error);
}

const updateCartCount = () => {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cartItems.length;

  document.getElementById("cart_num").textContent = cartCount;
  document.getElementById("cart_num2").textContent = cartCount;
};

const fetchVendorProducts = (searchQuery) => {
  const dbRef = ref(db);

  get(child(dbRef, "ProductsDetails/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        document.getElementById("loader").style.display = "none";
        document.getElementById("body").style.display = "block";

        const products = snapshot.val();
        const productKeys = Object.keys(products);

        productKeys.reverse().forEach((key) => {
          const product = products[key];
          const productVendor = product["vendorID"];
          console.log(productVendor, searchQuery);

          if (productVendor === searchQuery) {
            console.log(product);
            displayProduct(product);
          }
        });
        if (document.getElementById("list").innerHTML === "") {
          document.getElementById("no_items").style.display = "block";
          document.getElementById("listBody").style.display = "none";
        }
        displayRecentItems(products);
      }
    })
    .catch((error) => console.error(error));
};

const displayProduct = (product) => {
  const productURL = new URL(
    `${window.location.protocol}//${window.location.host}/Product/`
  );
  productURL.searchParams.append("product", product["code"]);

  const productHTML = `
    <a href="${productURL}" class="col-sm-6 col-lg-4 items_view d-sm-inline-flex">
      <img class="item_image" src="${product["url"][0]}" >
      <div>
        <div class="item_name">${product["name"]}</div>
        <div class="item_price">₦${numberFormatter.format(
          product["price"]
        )}</div>
      </div>
    </a>
  `;

  document.getElementById("list").innerHTML += productHTML;
  console.log(document.getElementById("list").innerHTML);
};

const handleSearch = () => {
  const searchQuery = document.getElementById("div2").value;
  const searchURL = new URL(
    `${window.location.protocol}//${window.location.host}/Search/`
  );
  searchURL.searchParams.append("search", searchQuery);
  window.location = searchURL;
};

function displayRecentItems(products) {
  if (Object.values(recentItems).length > 0) {
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
            <p class="rec_price">₦${numberFormatter.format(
              recentProduct.price
            )}</p>
          </a>
        `;
          document.getElementById("recent").innerHTML += recentHTML;
        }
      });
  } else document.getElementById("rec").style.display = "none";
}

document.getElementById("div2").addEventListener("search", handleSearch);
