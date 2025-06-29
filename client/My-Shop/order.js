let primaryColor, secondaryColor;

const formatCurrency = (num) =>
  "₦" + new Intl.NumberFormat("en-US").format(num);

function toggleVisibility(element1Id, element2Id) {
  const el1 = document.getElementById(element1Id);
  const el2 = document.getElementById(element2Id);
  if (!el1.classList.contains("visible")) {
    el1.classList.toggle("visible");
    el2.classList.toggle("visible");
  }
}

// Set up event listeners for options
Object.values(document.getElementsByClassName("option_view")).forEach(
  (element, index) => {
    element.addEventListener("click", () => {
      Object.values(document.getElementsByClassName("option_select")).forEach(
        (select) => (select.style.backgroundColor = primaryColor)
      );
      document.getElementsByClassName("option_select")[
        index
      ].style.backgroundColor = secondaryColor;

      if (index === 0) toggleVisibility("itemList", "orderList");
      else if (index === 1) toggleVisibility("orderList", "itemList");
    });
  }
);

export function getVendorOrders(vendorDetails, mainColor, subColor) {
  primaryColor = mainColor;
  secondaryColor = subColor;
  const orderListEl = document.getElementById("orderList");
  if (!vendorDetails.orders) return;

  const vendorOrders = Object.values(vendorDetails.orders);
  if (vendorOrders.length > 0) {
    vendorOrders.forEach((order) => {
      const productURL = new URL(
        `${window.location.protocol}//${window.location.host}/My-Shop/Products/`
      );
      productURL.searchParams.append("order", order.orderId);

      orderListEl.innerHTML += `
        <div class="order_view" >
        <a href = ${productURL}>
         
          <div class="flex">
            <div><img class="order_img" src="../images/PngItem_212128 (2).png" /></div>
        <div class="flex">
            <div class="order_txt">Order</div>
            <div class="order_no">${order.orderId}</div>
          </div>
              <div class="order_status">
       
            </div>
          </div>
          <div class="flex">
            <div class="order_price">Total: ${formatCurrency(order.total)}</div>
          <div class="order_date">${formatDate(order.date)}</div>
          </div>
          </a>
        </div>`;
    });
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp);

  const padToTwoDigits = (num) => num.toString().padStart(2, "0");

  const formattedDate = `${padToTwoDigits(date.getHours())}:${padToTwoDigits(
    date.getMinutes()
  )}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  return formattedDate;
}
