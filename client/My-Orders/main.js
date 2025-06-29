import {
  getDatabase,
  ref,
  get,
  child,
  getAuth,
  onAuthStateChanged,
} from "../firebase.js";
import getThemeColor from "../Utilities/ColorTheme.js";

const userDetails = JSON.parse(localStorage.getItem("details"));
const db = getDatabase();

window.onload = () => {
  getThemeColor();
  const auth = getAuth();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchUserOrders(user.uid);
    } else {
      window.location.replace("../Login");
    }
  });
};

function fetchUserOrders(userId) {
  const dbRef = ref(db);
  get(child(dbRef, `UsersDetails/${userId}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const userOrders = userData.orders;
        if (userOrders && userOrders.length > 0) {
          userOrders.forEach((order) => {
            displayOrderDetails(userData, order);
          });
        } else {
          displayEmptyOrders();
        }
        fetchProductDetails();
      }
    })
    .catch((error) => console.error("Error fetching orders:", error));
}

const fetchProductDetails = () => {
  const dbRef = ref(db);

  get(child(dbRef, "ProductsDetails/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        document.getElementById("loader").style.display = "none";
        document.getElementById("body").style.display = "block";

        const products = snapshot.val();

        displayRecentItems(products);
      }
    })
    .catch((error) => console.error(error));
};

function displayOrderDetails(userData, order) {
  const orderView = document.createElement("div");
  const orderInfo = document.createElement("div");
  const orderNumber = document.createElement("div");
  const orderDate = document.createElement("div");
  const orderStatus = document.createElement("div");
  const orderPrice = document.createElement("div");
  const orderImage = document.createElement("img");
  const orderDetailsWrapper = document.createElement("div");
  const productsLink = document.createElement("a");
  const productURL = new URL(
    `${window.location.protocol}//${window.location.host}/My-Orders/Products/`
  );
  productURL.searchParams.append("order", order.orderId);

  orderView.classList.add("order_view");
  orderInfo.classList.add("order_txt");
  orderNumber.classList.add("order_no");
  orderImage.classList.add("order_img");
  orderDate.classList.add("order_date");
  orderStatus.classList.add("order_status");
  orderPrice.classList.add("order_price");

  const formatter = new Intl.NumberFormat("en-US");
  orderInfo.textContent = "Order";
  orderNumber.textContent = order.orderId;
  orderImage.src = "../cart.png";
  orderDate.textContent = formatDate(order.date);
  orderStatus.textContent = order.status;
  orderPrice.textContent = `₦${formatter.format(order.total)}`;
  productsLink.href = productURL;

  const infoWrapper = document.createElement("div");
  infoWrapper.classList.add("flex");
  infoWrapper.appendChild(orderInfo);
  infoWrapper.appendChild(orderNumber);
  productsLink.appendChild(infoWrapper);

  const priceWrapper = document.createElement("div");
  priceWrapper.classList.add("flex");
  const viewFooter = document.createElement("div");
  viewFooter.classList.add("flex");
  viewFooter.appendChild(orderPrice);
  viewFooter.appendChild(orderDate);
  orderDetailsWrapper.appendChild(orderImage);
  priceWrapper.appendChild(orderDetailsWrapper);
  priceWrapper.appendChild(orderStatus);
  productsLink.appendChild(priceWrapper);
  productsLink.appendChild(viewFooter);
  orderView.appendChild(productsLink);

  const body = document.getElementById("orders");
  body.appendChild(orderView);
}

function displayEmptyOrders() {
  document.getElementById("body").style.display = "block";
  document.getElementById("no_items").style.display = "block";
  document.getElementById("loader").style.display = "none";
}

function displayRecentItems(products) {
  const recentItems = JSON.parse(localStorage.getItem("recent")) || [];
  const numberFormatter = new Intl.NumberFormat("en-US");
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

function formatDate(timestamp) {
  const date = new Date(timestamp);

  const padToTwoDigits = (num) => num.toString().padStart(2, "0");

  const formattedDate = `${padToTwoDigits(date.getHours())}:${padToTwoDigits(
    date.getMinutes()
  )}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  return formattedDate;
}
