import { get, child, getDatabase, ref } from "../firebase.js";
import getThemeColor from "../Utilities/ColorTheme.js";

const db = getDatabase();
const numberFormatter = new Intl.NumberFormat("en-US");
const recentItems = JSON.parse(localStorage.getItem("recent")) || [];
let page;

window.onload = () => {
  getThemeColor();
  updateCartCount();
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get("search");
  page = Number(params.get("page")) || 1;

  document.getElementById("div2").value = searchQuery;
  document.getElementById("title").textContent = searchQuery;

  if (searchQuery) fetchProductDetails(searchQuery);
  else window.location.href = "/";
};

const updateCartCount = () => {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cartItems.length;

  document.getElementById("cart_num2").textContent = cartCount;
};

const fetchProductDetails = (searchQuery) => {
  const dbRef = ref(db);

  get(child(dbRef, "ProductsDetails/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        document.getElementById("loader").style.display = "none";
        document.getElementById("body").style.display = "block";

        const products = snapshot.val();
        const productKeys = Object.keys(products).reverse();

        const filteredKeys = productKeys.filter((key) =>
          products[key]["name"]
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

        const searchResultLength = filteredKeys.length;
        const totalPages = Math.ceil(searchResultLength / 20);

        if (totalPages > 0 && page > totalPages)
          window.location.href = `/Search?search=${searchQuery}`;

        const itemsPerPage = 20;
        const startIdx = (page - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;

        // Get only the products for the current page
        const paginatedKeys = filteredKeys.slice(startIdx, endIdx);

        paginatedKeys.forEach((key) => {
          displayProduct(products[key]);
        });

        if (document.getElementById("list").innerHTML === "") {
          document.getElementById("no_items").style.display = "block";
          document.getElementById("listBody").style.display = "none";
          document.getElementById("paginationBody").style.display = "none";
        } else {
          addEventListeners();
          document.getElementById("paginationBody").style.display = "flex";
          setPaginationHref(parseInt(page), searchResultLength, searchQuery);
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
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItem = cartItems.find((item) => item.code === product["code"]);

  const productHTML = `
  <div class= "col-sm-6 col-lg-4 d-sm-inline-flex items_view p-0">
    <div class=" itemsInnerBody d-sm-inline-flex" id="${product["code"]}">
      <a href="${productURL}" class="d-sm-inline-flex text-decoration-none">
        <img class="item_image" src="${product["url"][0]}">
        <div>
          <div class="item_name">${product["name"]}</div>
          <div class="item_price">₦${numberFormatter.format(
            product["price"]
          )}</div>
        </div>
      </a>
      <div id="ctrlContainer" class="controls d-flex ms-auto align-items-center align-self-end">
        ${
          !cartItem
            ? `<button class="addBtn">Add to Cart</button>`
            : `
              <img id="minus0" class="minusBtn" src="../images/ic_remove_circle_black.png">
              <p id="cartnum0" class="cartNum">${cartItem.amount}</p>
              <img id="add0" class="plusBtn" src="../images/ic_add_circle_black.png">
            `
        }
      </div>
    </div>
    </div>
`;

  document.getElementById("list").innerHTML += productHTML;
};

const handleAddToCart = (index) => {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const product = document.getElementsByClassName("items_view")[index];
  const productCode = product.id;

  const productDetails = {
    code: productCode,
    amount: 1,
  };

  cartItems.push(productDetails);
  localStorage.setItem("cart", JSON.stringify(cartItems));
  updateCartCount();
  switchCartCtrl(index, "addBtn");
};

const addEventListeners = () => {
  Object.values(document.getElementsByClassName("addBtn")).forEach(
    (button, index) => {
      button.addEventListener("click", () => handleAddToCart(index));
    }
  );

  Object.values(document.getElementsByClassName("minusBtn")).forEach(
    (button, index) => {
      button.addEventListener("click", () => updateCartQuantity(index, -1));
    }
  );
  Object.values(document.getElementsByClassName("plusBtn")).forEach(
    (button, index) => {
      button.addEventListener("click", () => updateCartQuantity(index, 1));
    }
  );
};

const switchCartCtrl = (index, currentCtrl) => {
  const ctrlContainer = document.getElementsByClassName("controls")[index];
  ctrlContainer.innerHTML = "";
  switch (currentCtrl) {
    case "addBtn":
      ctrlContainer.innerHTML = `  
            <img id="minus0" class="minusBtn" src="../images/ic_remove_circle_black.png">
              <p id="cartnum0" class="cartNum">1</p>
              <img id="add0" class="plusBtn" src="../images/ic_add_circle_black.png">
          `;
      break;

    case "cartCtrl":
      ctrlContainer.innerHTML = `<button class="addBtn">Add to Cart</button>`;
      break;
  }
  addEventListeners();
};

const updateCartQuantity = (index, delta) => {
  const cartNumElem = document.getElementsByClassName("cartNum")[index];
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const product = document.getElementsByClassName("items_view")[index];
  const productCode = product.id;
  const cartItemIndex = cartItems.findIndex(
    (item) => item.code === productCode
  );

  let newQuantity = parseInt(cartNumElem.textContent) + delta;

  if (newQuantity < 1) {
    removeCartItem(index, cartItemIndex);
  } else {
    cartNumElem.textContent = newQuantity;
    cartItems[cartItemIndex].amount = newQuantity;
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }
};

const removeCartItem = (index, cartItemIndex) => {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  cartItems.splice(cartItemIndex, 1);
  localStorage.setItem("cart", JSON.stringify(cartItems));
  switchCartCtrl(index, "cartCtrl");
};

const handleSearch = () => {
  const searchQuery = document.getElementById("div2").value;
  const searchURL = new URL(
    `${window.location.protocol}//${window.location.host}/Search/`
  );
  searchURL.searchParams.append("search", searchQuery);

  window.location = searchURL;
};

const setPaginationHref = (currentPage, searchResultLength, searchParams) => {
  const pageLinks = document.getElementsByClassName("page-link");
  const totalPages = Math.ceil(searchResultLength / 20);

  if (pageLinks.length < 5) return;

  // First (Previous) and Last (Next) buttons
  pageLinks[0].href =
    currentPage > 1
      ? `/Search?search=${searchParams}&page=${currentPage - 1}`
      : "#";
  pageLinks[0].parentElement.classList.toggle("disabled", currentPage === 1);

  pageLinks[4].href =
    currentPage < totalPages
      ? `/Search?search=${searchParams}&page=${currentPage + 1}`
      : "#";
  pageLinks[4].parentElement.classList.toggle(
    "disabled",
    currentPage >= totalPages
  );

  // Middle 3 page numbers
  const setPageLink = (element, page, isVisible = true) => {
    element.href =
      page > 0 ? `/Search?search=${searchParams}&page=${page}` : "#";
    element.textContent = page > 0 ? page : "";
    element.style.display = isVisible ? "block" : "none";
    if (page === currentPage) element.parentElement.classList.add("active");
  };

  if (totalPages <= 3 || currentPage <= 2) {
    setPageLink(pageLinks[1], 1);
    setPageLink(pageLinks[2], totalPages >= 2 ? 2 : 0, totalPages >= 2);
    setPageLink(pageLinks[3], totalPages >= 3 ? 3 : 0, totalPages >= 3);
  } else if (currentPage >= totalPages - 1) {
    setPageLink(pageLinks[1], totalPages - 2);
    setPageLink(pageLinks[2], totalPages - 1);
    setPageLink(pageLinks[3], totalPages);
  } else {
    setPageLink(pageLinks[1], currentPage - 1);
    setPageLink(pageLinks[2], currentPage);
    setPageLink(pageLinks[3], currentPage + 1);
  }
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
