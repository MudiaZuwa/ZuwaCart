import {
  getDatabase,
  ref,
  get,
  child,
  getAuth,
  onAuthStateChanged,
} from "../firebase.js";
import getThemeColor from "../Utilities/ColorTheme.js";
import uploadAdminOrder from "./requestConfirmation.js";

const db = getDatabase();
let cartItems = [];
let totalPrice = 0;
let products = {};
const formatter = new Intl.NumberFormat("en-US");
const userDetails = JSON.parse(localStorage.getItem("details"));

window.onload = () => {
  getThemeColor();
  fetchProductDetails();
};

function fetchProductDetails() {
  document.getElementById("loader").style.display = "block";
  document.getElementById("cart_body").style.display = "none";
  const dbref = ref(db);
  get(child(dbref, "ProductsDetails/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        products = snapshot.val();
        const cartData = JSON.parse(localStorage.getItem("cart"));
        if (cartData && cartData.length > 0) {
          cartItems = cartData;
          renderCartItems();
        } else {
          toggleEmptyCartView(true);
        }
        renderRecentItems();
      }
    })
    .catch((error) => console.error(error));
}

function renderCartItems() {
  const cartContainer = document.getElementById("cart");
  cartContainer.textContent = "";
  totalPrice = 0;

  cartItems.forEach((cartItem, index) => {
    const product = Object.values(products).find(
      (p) => p.code === cartItem.code
    );
    if (product) {
      const { name, price, url } = product;
      const { amount } = cartItem;
      totalPrice += price * amount;
      createCartItemView(
        cartContainer,
        name,
        price,
        url[0],
        amount,
        index,
        cartItem.code
      );
    }
  });

  document.getElementById("total").textContent = `₦${formatter.format(
    totalPrice
  )}`;
  toggleEmptyCartView(false);
}

function createCartItemView(
  container,
  name,
  price,
  imageUrl,
  quantity,
  index,
  code
) {
  const view = document.createElement("div");
  view.classList.add("cart-view");

  const productLink = document.createElement("a");
  productLink.href = `/Product/?product=${code}`;

  const detailsFlexContainer = document.createElement("div");
  detailsFlexContainer.classList.add("flex");

  const detailsContainer = document.createElement("div");
  detailsContainer.style.padding = "8px";

  const image = document.createElement("img");
  image.classList.add("item-image");
  image.src = imageUrl;

  const itemName = document.createElement("p");
  itemName.classList.add("item-name");
  itemName.textContent = name;

  const itemPrice = document.createElement("p");
  itemPrice.classList.add("item-price");
  itemPrice.textContent = `₦${formatter.format(price)}`;

  const cartNum = document.createElement("p");
  cartNum.id = `cartnum${index}`;
  cartNum.textContent = quantity;

  const addBtn = createButton("add", `add${index}`, () =>
    updateCartQuantity(index, 1)
  );
  const minusBtn = createButton("minus", `minus${index}`, () =>
    updateCartQuantity(index, -1)
  );
  const removeBtn = createButton("remove", `remove${index}`, () =>
    removeCartItem(index)
  );
  const removeText = document.createElement("p");
  removeText.textContent = "Remove";

  const removeBtnFlexContainer = document.createElement("div");
  removeBtnFlexContainer.classList.add("remove");

  const controlsFlex = document.createElement("div");
  controlsFlex.classList.add("flex");

  detailsContainer.append(itemName, itemPrice);
  detailsFlexContainer.append(image, detailsContainer);
  productLink.append(detailsFlexContainer);

  removeBtnFlexContainer.append(removeBtn, removeText);

  const controls = document.createElement("div");
  controls.classList.add("controls", "flex");
  controls.append(
    removeBtnFlexContainer,
    controlsFlex,
    minusBtn,
    cartNum,
    addBtn
  );

  view.append(productLink, controls);
  container.append(view);
}

const modalCartItem = (name, price, quantity) => {
  const parentDiv = document.createElement("div");
  parentDiv.classList.add(
    "d-flex",
    "align-items-center",
    "justify-content-between",
    "my-2"
  );

  const leftDiv = document.createElement("div");
  leftDiv.classList.add("d-flex", "align-items-center");

  const nameP = document.createElement("p");
  nameP.classList.add("me-2");
  nameP.textContent = name;

  const qtyP = document.createElement("p");
  qtyP.textContent = `×${quantity}`;

  leftDiv.appendChild(nameP);
  leftDiv.appendChild(qtyP);

  const rightDiv = document.createElement("div");
  rightDiv.textContent = `₦${formatter.format(price)}`;

  parentDiv.appendChild(leftDiv);
  parentDiv.appendChild(rightDiv);

  document.getElementById("modalItems").appendChild(parentDiv);
};

function updateCartQuantity(index, delta) {
  const cartNumElem = document.getElementById(`cartnum${index}`);
  let newQuantity = parseInt(cartNumElem.textContent) + delta;

  if (newQuantity < 1) {
    removeCartItem(index);
  } else {
    cartNumElem.textContent = newQuantity;
    cartItems[index].amount = newQuantity;
    localStorage.setItem("cart", JSON.stringify(cartItems));
    updateTotalPrice();
  }
}

function removeCartItem(index) {
  cartItems.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cartItems));
  fetchProductDetails();
}

function updateTotalPrice() {
  totalPrice = cartItems.reduce((sum, item) => {
    const product = Object.values(products).find((p) => p.code === item.code);
    return sum + product.price * item.amount;
  }, 0);
  document.getElementById("total").textContent = `₦${formatter.format(
    totalPrice
  )}`;
}

document.getElementById("continue").addEventListener("click", () => {
  cartItems.forEach((cartItem, index) => {
    const product = Object.values(products).find(
      (p) => p.code === cartItem.code
    );
    if (product) {
      const { name, price } = product;
      const { amount } = cartItem;
      modalCartItem(name, price, amount);
    }
  });
  document.getElementById("modalTotal").innerText = `₦${formatter.format(
    totalPrice
  )}`;
  document.getElementsByClassName("modal")[0].style.display = "block";
});

document.getElementById("modalConfirmBtn").addEventListener("click", () => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user && userDetails) {
      const userId = user.uid;
      if (userDetails.hostel === "None") {
        alert("Please set an address before proceeding.");
        window.location = "../Address-Book/";
      } else {
        uploadAdminOrder(userId, products, totalPrice);
      }
    } else {
      window.location.replace("../Login");
    }
  });
});

function createButton(type, id, onClick) {
  const button = document.createElement("img");
  button.id = id;
  button.src =
    type === "remove"
      ? `../images/ic_delete_black.png`
      : type === "add"
      ? "../images/ic_add_circle_black.png"
      : "../images/ic_remove_circle_black.png";
  button.onclick = onClick;
  return button;
}

function toggleEmptyCartView(isEmpty) {
  document.getElementById("loader").style.display = "none";
  document.getElementById("cart_body").style.display = "block";
  document.getElementById("cart").style.display = isEmpty ? "none" : "block";
  document.getElementById("info").style.display = isEmpty ? "none" : "block";
  document.getElementById("no_items").style.display = isEmpty
    ? "block"
    : "none";
}

function renderRecentItems() {
  const recentData = JSON.parse(localStorage.getItem("recent"));
  const recentContainer = document.getElementById("recent");
  recentContainer.innerHTML = "";

  if (recentData || recentData.length > 0) {
    recentData.forEach((recentItem) => {
      const product = Object.values(products).find(
        (p) => p.code === recentItem.code
      );
      if (product) {
        createRecentItemView(recentContainer, product);
      }
    });
  } else {
    document.getElementById("rec").style.display = "none";
  }
}

function createRecentItemView(container, product) {
  const { url, price, code } = product;
  const anchor = document.createElement("a");
  anchor.href = `/Product/?product=${code}`;
  anchor.classList.add("rec_view");

  const image = document.createElement("img");
  image.classList.add("rec_image");
  image.src = url[0];

  const priceElem = document.createElement("p");
  priceElem.classList.add("rec_price");
  priceElem.textContent = `₦${formatter.format(price)}`;

  anchor.append(image, priceElem);
  container.append(anchor);
}
