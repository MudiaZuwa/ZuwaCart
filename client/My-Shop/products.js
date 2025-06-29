import {
  get,
  getDatabase,
  set,
  update,
  child,
  ref,
  remove,
} from "../firebase.js";

get(child(dbref, "ProductsDetails/"))
  .then((snapshot) => {
    if (snapshot.exists()) {
      const products = snapshot.val();
      const vendorItems = Object.values(products).filter(
        (product) => product.vendorID === vendorId
      );
      vendorItems.forEach((product, index) => {
        const myURL = new URL(
          window.location.protocol + "//" + window.location.host + "/Product"
        );
        myURL.searchParams.append("product", product["code"]);
        document.getElementById("items").innerHTML += `
                   <div class="item-view col" >
            <a href=${myURL}
              ><div class="flex" id="item-view1">
                <img
                  class="item-image"
                  src=${product["url"][0]}/>
                <div style="padding: 8px">
                  <p class="item-name">${product["name"]}</p>
                  <p class="item-price">${product["price"]}</p>
                </div>
              </div></a
            >
            <div class="controls flex">
              <div id= 'remove${index}' class="remove">
                <img src="../images/ic_delete_black.png" />
                <p>Remove</p>
              </div>
              <div class="flex"></div>
              <p style =" margin-right: 3px">Avaialble: </p>
              <p id="itemnum1">${
                product["quantity"] !== "" ? product["quantity"] : "?"
              }</p>
            </div>
          </div>`;

        handleProductRemove(index, product.key);
      });
      document.getElementById("no_items").style.display =
        vendorItems.length === 0 ? "block" : "none";
    } else {
      document.getElementById("no_items").style.display = "block";
    }
  })
  .catch((error) => console.log(error));

const uploadForm = document.getElementById("upload-item");
uploadForm.addEventListener("submit", uploadCheckdata, false);

function uploadCheckdata(e) {
  e.preventDefault();
  name = document.getElementById("name").value;
  price = document.getElementById("price").value;
  description = document.getElementById("description").value;
  quantity = document.getElementById("quantity").value;
  category = document.getElementById("category").value;
  pickupTime = document.getElementById("pickup-time").value;

  price = price.replace(/,/g, "");

  if (
    category !== " Select Category" &&
    pickupTime !== "time" &&
    ItemImgs.length > 0
  ) {
    document.getElementById("uploadLoader").style.display = "block";
    uploadFile(ItemImgs[0], "ProductImage", 0);
  }
}

function uploadProduct() {
  var key = "-";
  for (let i = 0; i < 19; i++) {
    key = key + generateRandomLetter();
  }

  var itemCode = generateRandomLetter();
  for (let i = 0; i < 11; i++) {
    itemCode += generateRandomLetter();
  }

  const productDetails = {
    category,
    code: itemCode,
    description,
    key,
    name,
    num: ItemImgsUrl.length,
    pickupTime,
    price,
    quantity,
    vendorID: vendorId,
    url: [],
  };

  ItemImgsUrl.forEach((url, index) => (productDetails["url"][index] = url));

  set(ref(db, "ProductsDetails/" + key), productDetails)
    .then(() => {
      update(ref(db, `VendorsDetails/${userID}`), {
        products: [...(RegisteredItems || []), itemCode],
      })
        .then(() => {
          ItemImgs = [];
          ItemImgsUrl = [];
          ItemImgs = [];
          ItemImgsUrl = [];
          document.getElementById("upload-item").style.display = "none";
          document.getElementById("uploadLoader").style.display = "none";
          getShopData();
        })
        .catch((error) =>
          console.error("Error updating vendor products:", error)
        );
    })
    .catch((error) => {
      console.log(error);
    });
}

function handleProductRemove(index, productKey) {
  document.getElementById(`remove${index}`).addEventListener("click", () => {
    const newRegisteredItems = RegisteredItems.splice(index, 1);
    update(ref(db, `VendorsDetails/${userID}`), {
      products: newRegisteredItems,
    })
      .then(() => deleteProduct(productKey))
      .catch((error) => console.log(error));
  });
}

function deleteProduct(productKey) {
  const db = getDatabase();
  const nodeRef = ref(db, `ProductsDetails/${productKey}`);

  remove(nodeRef)
    .then(() => getShopData())
    .catch((error) => {
      console.error("Error removing node:", error);
    });
}
