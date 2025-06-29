import { getDatabase, ref, get, child } from "../firebase.js";
import getThemeColor from "../Utilities/ColorTheme.js";

let savedItems, products, totalProducts, productValue;
let cartItems = [];
const numberFormatter = new Intl.NumberFormat("en-US");

const createProductElement = (product, savedItemIndex) => {
  const {
    code: productCode,
    price: productPrice,
    name: productName,
    url: productImages,
  } = product;

  const cartItem = cartItems.find((item) => item.code === productCode);
  const cartIndex = cartItems.findIndex((item) => item.code === productCode);

  document.getElementById("loader").style.display = "none";
  document.getElementById("page_body").style.display = "block";
  document.getElementById("item_list").style.display = "block";

  const itemList = document.getElementById("item_list");

  const productContainer = document.createElement("div");
  productContainer.classList.add("item-view");

  const productImageElement = createImageElement(
    "item-image",
    productImages[0]
  );
  const productNameElement = createTextElement("item-name", productName);
  const productPriceElement = createTextElement(
    "item-price",
    `₦${numberFormatter.format(productPrice)}`
  );

  const productLink = createProductLink(productCode);
  const productFlexContainer = createFlexContainer(
    productImageElement,
    productNameElement,
    productPriceElement
  );

  productLink.appendChild(productFlexContainer);
  productContainer.appendChild(productLink);

  const controlsContainer = createControls(cartItem, cartIndex, savedItemIndex);
  productContainer.appendChild(controlsContainer);

  itemList.appendChild(productContainer);
  if (!cartItem)
    attachAddToCartHandler(`add${savedItemIndex}`, productCode, savedItemIndex);
  attachRemoveFavoriteHandler(`remove${savedItemIndex}`, savedItemIndex);
};

const loadSavedItems = () => {
  toggleLoader(true);

  savedItems = JSON.parse(localStorage.getItem("saved_items")) || [];
  cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const itemList = document.getElementById("item_list");
  itemList.innerHTML = "";

  if (savedItems && savedItems.length > 0) {
    const db = getDatabase();
    const dbRef = ref(db);

    get(child(dbRef, "ProductsDetails/"))
      .then((snapshot) => {
        if (snapshot.exists()) {
          products = snapshot.val();
          totalProducts = Object.keys(products).length;

          savedItems.forEach((item, index) => {
            const productValue = Object.values(products).find(
              (product) => product.code === item.code
            );

            if (productValue) createProductElement(productValue, index);
          });
        }
        displayRecentItems();
      })
      .catch((error) => console.error(error));
  } else {
    toggleLoader(false, "no_items");
  }
};

const toggleLoader = (showLoader, elementToShow = null) => {
  document.getElementById("loader").style.display = showLoader
    ? "block"
    : "none";
  document.getElementById("page_body").style.display = showLoader
    ? "none"
    : "block";
  if (elementToShow) {
    document.getElementById(elementToShow).style.display = showLoader
      ? "none"
      : "block";
  }
};

const attachAddToCartHandler = (buttonId, productCode, savedItemIndex) => {
  document.getElementById(buttonId).onclick = () => {
    const updatedCartItems = [...cartItems, { code: productCode, amount: 1 }];
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
    cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    switchCartControls(savedItemIndex, "add");
  };
};

const attachRemoveFavoriteHandler = (buttonId, savedItemIndex) => {
  document.getElementById(buttonId).onclick = () => {
    savedItems.splice(savedItemIndex, 1);
    localStorage.setItem("saved_items", JSON.stringify(savedItems));
    loadSavedItems();
  };
};

const displayRecentItems = () => {
  const recentItems = JSON.parse(localStorage.getItem("recent"));

  if (recentItems || recentItems.length > 0) {
    const recentContainer = document.getElementById("recent");
    recentContainer.innerHTML = "";

    recentItems.forEach((recentItem) => {
      Object.entries(products).forEach(([key, product]) => {
        if (product.code === recentItem.code) {
          const recentLink = createProductLink(product.code);
          recentLink.classList.add("rec_view");
          const recentImageElement = createImageElement(
            "rec_image",
            product.url[0]
          );
          const recentPriceElement = createTextElement(
            "rec_price",
            `₦${numberFormatter.format(product.price)}`
          );

          recentLink.appendChild(recentImageElement);
          recentLink.appendChild(recentPriceElement);
          recentContainer.appendChild(recentLink);
        }
      });
    });
  } else {
    document.getElementById("rec").style.display = "none";
  }
};

const createImageElement = (className, src) => {
  const img = document.createElement("img");
  img.classList.add(className);
  img.src = src;
  return img;
};

const createTextElement = (className, text) => {
  const textElement = document.createElement("p");
  textElement.classList.add(className);
  textElement.textContent = text;
  return textElement;
};

const createFlexContainer = (
  productImageElement,
  productNameElement,
  productPriceElement
) => {
  const flexContainer = document.createElement("div");
  flexContainer.classList.add("flex");
  const detailsContainer = document.createElement("div");
  detailsContainer.style.padding = "8px";

  detailsContainer.appendChild(productNameElement);
  detailsContainer.appendChild(productPriceElement);
  flexContainer.appendChild(productImageElement);
  flexContainer.appendChild(detailsContainer);
  return flexContainer;
};

const createProductLink = (productCode) => {
  const productLink = document.createElement("a");
  const productURL = new URL(
    `${window.location.protocol}//${window.location.host}/Product/`
  );
  productURL.searchParams.append("product", productCode);
  productLink.href = productURL;
  return productLink;
};

const createControls = (cartItem, cartIndex, index) => {
  const controlsContainer = document.createElement("div");
  controlsContainer.classList.add("controls", "flex");
  controlsContainer.id = "controlsContainer";
  const controlsFlex = document.createElement("div");
  controlsFlex.classList.add("flex");

  const removeButtonContainer = document.createElement("div");
  removeButtonContainer.classList.add("remove");
  removeButtonContainer.setAttribute("id", `remove${index}`);

  const removeIcon = createImageElement(null, "../images/ic_delete_black.png");
  const removeText = createTextElement(null, "Remove");

  removeButtonContainer.appendChild(removeIcon);
  removeButtonContainer.appendChild(removeText);

  controlsContainer.appendChild(removeButtonContainer);
  controlsContainer.appendChild(controlsFlex);
  if (!cartItem) {
    let addButtonContainer = document.createElement("div");
    let addButton = document.createElement("button");
    addButton.setAttribute("id", `add${index}`);
    addButton.innerText = "Add to Cart";
    addButtonContainer.appendChild(addButton);
    addButtonContainer.setAttribute("id", `addBtnContainer${index}`);
    controlsContainer.appendChild(addButtonContainer);
  } else {
    const cartNum = document.createElement("p");
    cartNum.id = `cartnum${index}`;
    cartNum.textContent = cartItem.amount;

    const addBtn = createButton("add", () => updateCartQuantity(cartIndex, 1));
    addBtn.id = `addBtn${index}`;
    const minusBtn = createButton("minus", () =>
      updateCartQuantity(cartIndex, -1, index)
    );
    minusBtn.id = `minusBtn${index}`;
    controlsContainer.appendChild(minusBtn);
    controlsContainer.appendChild(cartNum);
    controlsContainer.appendChild(addBtn);
  }
  return controlsContainer;
};

const switchCartControls = (savedItemIndex, currentCtrl, productCode) => {
  const controlsContainer = document.getElementById("controlsContainer");
  if (currentCtrl === "controls") {
    document.getElementById(`cartnum${savedItemIndex}`).remove();
    document.getElementById(`addBtn${savedItemIndex}`).remove();
    document.getElementById(`minusBtn${savedItemIndex}`).remove();

    let addButtonContainer = document.createElement("div");
    let addButton = document.createElement("button");
    addButton.setAttribute("id", `add${savedItemIndex}`);
    addButton.innerText = "Add to Cart";
    addButtonContainer.appendChild(addButton);
    addButtonContainer.setAttribute("id", `addBtnContainer${savedItemIndex}`);
    controlsContainer.appendChild(addButtonContainer);
    attachAddToCartHandler(`add${savedItemIndex}`, productCode, savedItemIndex);
  } else {
    const cartIndex = cartItems.length - 1;
    document.getElementById(`addBtnContainer${savedItemIndex}`).remove();

    const cartNum = document.createElement("p");
    cartNum.id = `cartnum${cartIndex}`;
    cartNum.textContent = 1;

    const addBtn = createButton("add", () => updateCartQuantity(cartIndex, 1));
    addBtn.id = `addBtn${savedItemIndex}`;
    const minusBtn = createButton("minus", () =>
      updateCartQuantity(cartIndex, -1, savedItemIndex)
    );
    minusBtn.id = `minusBtn${savedItemIndex}`;
    controlsContainer.appendChild(minusBtn);
    controlsContainer.appendChild(cartNum);
    controlsContainer.appendChild(addBtn);
  }
};

function updateCartQuantity(index, delta, savedItemIndex) {
  const cartNumElem = document.getElementById(`cartnum${index}`);
  let newQuantity = parseInt(cartNumElem.textContent) + delta;

  if (newQuantity < 1) {
    removeCartItem(index, savedItemIndex);
  } else {
    cartNumElem.textContent = newQuantity;
    cartItems[index].amount = newQuantity;
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }
}

function removeCartItem(index, savedItemIndex) {
  const productCode = cartItems[index].code;
  cartItems.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cartItems));
  cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  switchCartControls(savedItemIndex, "controls", productCode);
}

function createButton(type, onClick) {
  const button = document.createElement("img");
  button.src =
    type === "remove"
      ? `../images/ic_delete_black.png`
      : type === "add"
      ? "../images/ic_add_circle_black.png"
      : "../images/ic_remove_circle_black.png";
  button.onclick = onClick;
  return button;
}

window.onload = () => {
  getThemeColor();
  loadSavedItems();
};
