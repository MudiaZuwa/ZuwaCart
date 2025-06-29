import {
  get,
  child,
  getDatabase,
  ref,
  onAuthStateChanged,
  getAuth,
} from "../../firebase.js";

const db = getDatabase();
const numberFormatter = new Intl.NumberFormat("en-US");
const recentItems = JSON.parse(localStorage.getItem("recent")) || [];
let userID, orders;

window.onload = () => {
  const auth = getAuth();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userID = user.uid;
      checkAccountType();
    } else {
      window.location.replace("../../Login");
    }
  });
};

function checkAccountType() {
  const dbref = ref(db);
  get(child(dbref, `UsersDetails/${userID}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userDetails = snapshot.val();

        const AccountType = userDetails["AccountType"];
        if (AccountType === "admin") {
          const searchQuery = new URLSearchParams(window.location.search).get(
            "search"
          );
          document.getElementById("div2").value = searchQuery;
          document.getElementById("title").textContent = searchQuery;

          fetchUsersOrders(searchQuery);
        } else {
          window.location.replace("../../");
        }
      }
    })
    .catch((error) => console.log(error));
}

const fetchUsersOrders = (searchQuery) => {
  const dbRef = ref(db);

  get(child(dbRef, "UsersOrders/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        document.getElementById("loader").style.display = "none";
        document.getElementById("body").style.display = "block";

        orders = snapshot.val();
        const orderKeys = Object.keys(orders);

        orderKeys.reverse().forEach((key) => {
          const order = orders[key];

          displayOrderDetails(order);

          if (document.getElementById("list").innerHTML === "") {
            document.getElementById("no_items").style.display = "block";
            document.getElementById("listBody").style.display = "none";
          }
        });
      }
    })
    .catch((error) => console.error(error));
};

function displayOrderDetails(order) {
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
  orderImage.src = "../../cart.png";
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

  const body = document.getElementById("list");
  body.appendChild(orderView);
}

const handleSearch = () => {
  const searchQuery = document.getElementById("div2").value;
  const filteredOrders = Object.values(orders).filter((order) => {
    return (
      order.orderId.includes(searchQuery) || order.userId.includes(searchQuery)
    );
  });

  const orderValues = Object.values(filteredOrders);
  document.getElementById("list").innerHTML = "";

  orderValues.reverse().forEach((order) => {
    displayOrderDetails(order);

    if (document.getElementById("list").innerHTML === "") {
      document.getElementById("no_items").style.display = "block";
      document.getElementById("listBody").style.display = "none";
    }
  });
};

function formatDate(timestamp) {
  const date = new Date(timestamp);

  const padToTwoDigits = (num) => num.toString().padStart(2, "0");

  const formattedDate = `${padToTwoDigits(date.getHours())}:${padToTwoDigits(
    date.getMinutes()
  )}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  return formattedDate;
}

const applyFilters = () => {
  const statuses = [];
  ["Pending", "Confirmed", "Shipped", "Delivered"].forEach((status) => {
    const id = "status" + status;
    const checkbox = document.getElementById(id);
    if (checkbox.checked) {
      switch (status) {
        case "Pending":
          statuses.push("Confirming Request");
          break;
        case "Confirmed":
          statuses.push("Request confirmed");
          break;
        case "Shipped":
          statuses.push("Shipped");
          break;
        case "Delivered":
          statuses.push("Delivered");
          break;
      }
      statuses.push(status);
    }
  });

  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const startTimestamp = new Date(startDate).getTime() || 0;
  const endTimestamp = new Date(endDate).getTime() || Infinity;

  const filteredOrders = Object.values(orders).filter((order) => {
    const orderDate = new Date(order.date).getTime();
    const isStatusMatch =
      statuses.length === 0 || statuses.includes(order.status);
    const isDateMatch =
      orderDate >= startTimestamp && orderDate <= endTimestamp;
    return isStatusMatch && isDateMatch;
  });

  const orderValues = Object.values(filteredOrders);
  document.getElementById("list").innerHTML = "";

  orderValues.reverse().forEach((order) => {
    displayOrderDetails(order);

    if (document.getElementById("list").innerHTML === "") {
      document.getElementById("no_items").style.display = "block";
      document.getElementById("listBody").style.display = "none";
    }
  });
};

document.getElementById("div2").addEventListener("input", handleSearch);
document.getElementById("applyFilters").addEventListener("click", applyFilters);
