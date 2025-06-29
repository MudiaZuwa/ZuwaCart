import {
  ref,
  set,
  get,
  child,
  update,
  getDatabase,
  getAuth,
} from "../firebase.js";
import {
  userOrderConfirmation,
  vendorOrderNotification,
  adminOrderNotification,
} from "../Utilities/mailTemplates.js";

let userId,
  cartList,
  products,
  totalPrice,
  userEmail,
  vendorsDetails = [],
  userProductDetails = [],
  adminEmail;
const auth = getAuth();

let userOrder = {};
let userDetails = JSON.parse(localStorage.getItem("details"));

const db = getDatabase();

function addUserOrder(orderId) {
  const dbRef = ref(db);
  get(child(dbRef, `UsersDetails/${userId}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const user = snapshot.val();
        const userOrders = user.orders || [];
        userEmail = user.email;

        const orders = [];

        cartList.forEach((item) => {
          const productData = Object.values(products).find(
            (product) => product.code === item.code
          );
          userProductDetails.push(getProductDetails(productData, item));

          orders.push({
            ...item,
            vendor: productData.vendorID,
            status: "Confirming Request",
          });
        });

        const date = Date.now();
        // const formattedDate = `${date.getHours()}:${date.getMinutes()}, ${date.getDate()}/${
        //   date.getMonth() + 1
        // }/${date.getFullYear()}`;

        userOrder = [
          ...userOrders,
          {
            orderId: orderId,
            status: "Confirming Request",
            date: date,
            orders,
            total: totalPrice,
          },
        ];

        uploadUserOrder(orderId);
      }
    })
    .catch((error) => console.error("Error fetching user details:", error));
}

function uploadUserOrder(orderId) {
  update(ref(db, `UsersDetails/${userId}`), { orders: userOrder })
    .then(() => {
      sendEmails(orderId);
    })
    .catch((error) => console.error("Error uploading user order:", error));
}

function uploadAdminOrder(accountId, productList, totalCost) {
  cartList = JSON.parse(localStorage.getItem("cart"));
  totalPrice = totalCost;
  userId = accountId;
  products = productList;

  const orderId = generateRandomId(7);

  const date = Date.now();
  // const formattedDate = `${date.getHours()}:${date.getMinutes()}, ${date.getDate()}/${
  //   date.getMonth() + 1
  // }/${date.getFullYear()}`;

  const orders = [];

  cartList.forEach((item) => {
    const productData = Object.values(products).find(
      (product) => product.code === item.code
    );

    orders.push({
      ...item,
      vendor: productData.vendorID,
      status: "Confirming Request",
    });
  });

  const adminOrderDetails = {
    name: userDetails["name"],
    hostel: userDetails["hostel"],
    userId: accountId,
    phone: userDetails["phone"],
    orderId: orderId,
    status: "Confirming Request",
    date: date,
    orders,
    total: totalPrice,
  };

  // const orderKey = generateRandomId(19);
  set(ref(db, `UsersOrders/${orderId}`), adminOrderDetails)
    .then(() => uploadVendorOrder(orderId))
    .catch((error) => console.error("Error uploading admin order:", error));
}

function uploadVendorOrder(orderId) {
  const dbRef = ref(db);
  get(child(dbRef, "VendorsDetails/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const vendors = snapshot.val();
        const vendorOrders = {};

        cartList.forEach((item) => {
          const vendorKey = Object.keys(vendors).find((vendor) => {
            if (!vendors[vendor].products) return false;
            return vendors[vendor].products.includes(item.code);
          });

          if (!vendorKey) return;

          // Initialize vendor order if it does not exist
          if (!vendorOrders[vendorKey]) {
            vendorOrders[vendorKey] = [];
          }

          vendorOrders[vendorKey].push(item);

          // Check if the vendor already exists in the vendorsDetails array
          let vendorDetail = vendorsDetails.find(
            (vendor) => vendor.email === vendors[vendorKey].email
          );

          // If the vendor is not in the array, add them
          if (!vendorDetail) {
            vendorDetail = {
              email: vendors[vendorKey].email,
              products: [], // Initialize the products array for this vendor
            };
            vendorsDetails.push(vendorDetail);
          }

          // Collect vendor product details
          const productKey = Object.keys(products).find(
            (key) => products[key]["code"] === item["code"]
          );
          if (productKey) {
            const product = products[productKey];
            vendorDetail.products.push(getProductDetails(product, item)); // Add the product details to the vendor
          }
        });

        if (Object.keys(vendorOrders).length > 0) {
          const updatePromises = [];

          Object.keys(vendorOrders).forEach((vendorId) => {
            const vendorOrder = vendorOrders[vendorId];
            const previousOrders = vendors[vendorId].orders || [];
            let vendorTotalPrice = 0;

            vendorOrder.forEach((item) => {
              const productKey = Object.keys(products).find(
                (key) => products[key]["code"] === item["code"]
              );
              if (productKey) {
                const product = products[productKey];
                const itemPrice = product["price"];
                const itemQuantity = item["amount"];
                vendorTotalPrice += itemPrice * itemQuantity;
              }
            });

            const vendorOrderDetails = {
              orders: [
                ...previousOrders,
                {
                  date: Date.now(),
                  orderId: orderId,
                  orders: vendorOrder,
                  total: vendorTotalPrice,
                  status: "Confirming Request",
                  userId: userId,
                },
              ],
            };

            const updatePromise = update(
              ref(db, `VendorsDetails/${vendorId}`),
              vendorOrderDetails
            );
            updatePromises.push(updatePromise);
          });

          // Wait for all updates to complete, then add user order
          Promise.all(updatePromises)
            .then(() => {
              addUserOrder(orderId);
            })
            .catch((error) => {
              console.error("Error updating one or more vendor orders:", error);
            });
        }
      }
    })
    .catch((error) => console.error("Error fetching vendor details:", error));
}

function generateRandomId(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  return Array.from(
    { length },
    () => characters[Math.floor(Math.random() * characters.length)]
  ).join("");
}

const sendEmails = async (orderId) => {
  const userHtml = userOrderConfirmation(userProductDetails, orderId);
  const adminHtml = adminOrderNotification(userProductDetails, orderId);

  // Create an array of all email requests
  const emailRequests = [
    // Email to user
    fetch("https://zuwacart-server.vercel.app/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        subject: `ZuwaCart – Order #${orderId} Confirmed!`,
        message: userHtml,
      }),
    }),

    // Email to each vendor
    ...vendorsDetails.map((vendor) => {
      const vendorHtml = vendorOrderNotification(vendor.products, orderId);
      fetch("https://zuwacart-server.vercel.app/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: vendor.email,
          subject: `ZuwaCart New Order #${orderId} Awaiting Confirmation`,
          message: vendorHtml,
        }),
      });
    }),

    // Email to admin
    fetch("https://zuwacart-server.vercel.app/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "mudiaosazuwa@gmail.com",
        subject: `ZuwaCart New Order Placed: #${orderId}`,
        message: adminHtml,
      }),
    }),
  ];

  // Send all email requests in parallel
  try {
    await Promise.all(emailRequests);
    localStorage.removeItem("cart");
    window.location = "../";
  } catch (error) {
    console.error("Error sending emails:", error);
  }
};

const getProductDetails = (product, item) => {
  const itemPrice = product["price"];
  const itemQuantity = item["amount"];
  const totalItemPrice = itemPrice * itemQuantity;
  const myURL = new URL(
    `${window.location.protocol}//${window.location.host}/Product/`
  );
  myURL.searchParams.append("product", product.code);

  return {
    name: product["name"],
    imageUrl: product["url"][0],
    quantity: itemQuantity,
    totalPrice: totalItemPrice,
    productLink: myURL,
  };
};

export default uploadAdminOrder;
