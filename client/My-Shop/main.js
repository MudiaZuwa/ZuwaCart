import {
  get,
  getAuth,
  getDatabase,
  set,
  update,
  child,
  ref,
  onAuthStateChanged,
} from "../firebase.js";
import getThemeColor from "../Utilities/ColorTheme.js";
import { getVendorOrders } from "./order.js";

const db = getDatabase();

var details = JSON.parse(localStorage.getItem("details")),
  categories = [
    "Shoes",
    "Phone Accessories",
    "Clothing",
    "Food and Catering",
    "Perfume and Oil",
  ],
  SelectedIndexes = [],
  SelectedCategories = [],
  name,
  phone,
  address,
  logoImg = "",
  logoImgUrl = "",
  vendorDetails,
  primaryColor,
  secondaryColor,
  userID;

onload = () => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userID = user.uid;
      checkAccountType();
      ({ mainColor: primaryColor, subColor: secondaryColor } = getThemeColor());
    } else {
      window.location.replace("../Login");
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
        switch (AccountType) {
          case "user":
            document.getElementById("register").style.display = "flex";
            break;
          case "vendor":
            getShopData();
            break;
        }
      }
    })
    .catch((error) => console.log(error));
}

export function getShopData() {
  document.getElementById("loader").style.display = "block";
  document.getElementById("item_body").style.display = "none";
  document.getElementById("no_items").style.display = "none";
  document.getElementById("items").innerHTML = "";
  const dbref = ref(db);
  get(child(dbref, "VendorsDetails/" + userID))
    .then((snapshot) => {
      vendorDetails = snapshot.val();
      const vendorCat = vendorDetails["vendorCat"].join(", ");

      document.getElementById("business-icon").src =
        vendorDetails["vendorLogo"] !== ""
          ? vendorDetails["vendorLogo"]
          : "../images/PngItem_248631.png";

      document.getElementById("vendor-name").innerText =
        vendorDetails["vendorName"];
      document.getElementById("vendor-phone").innerText =
        vendorDetails["addPhoneNo"] || "";
      document.getElementById("vendor-address").innerText =
        vendorDetails["vendorAddress"] || "";
      document.getElementById("vendor-categories").innerText = vendorCat || "";

      vendorName = vendorDetails["vendorName"];
      vendorId = vendorDetails["vendorId"];
      RegisteredItems = vendorDetails.products;
      getVendorOrders(vendorDetails, primaryColor, secondaryColor);

      document.getElementById("loader").style.display = "none";
      document.getElementById("item_body").style.display = "block";
    })
    .catch((error) => console.log(error));
}

//Handle Registration Categories Selection
function regCategoriesSelect() {
  const regCategories = document.getElementsByClassName("category");
  Object.values(regCategories).forEach((category, index) => {
    category.addEventListener("click", () => {
      if (SelectedIndexes.includes(index)) {
        SelectedIndexes = SelectedIndexes.filter((i) => i !== index);
        category.dataset.selected = "false";
      } else {
        SelectedIndexes.push(index);
        category.dataset.selected = "true";
      }
    });
  });
}

const registerform = document.getElementById("register-form");
registerform.addEventListener("submit", reg_Checkdata, false);
regCategoriesSelect();

function reg_Checkdata(e) {
  e.preventDefault();
  name = document.getElementById("business-name").value;
  address = document.getElementById("business-address").value;
  phone = document.getElementById("phone").value;

  if (SelectedIndexes.length > 0) {
    document.getElementById("registerLoader").style.display = "block";
    name = name === "" ? details["name"] : name;
    SelectedIndexes.forEach((index) =>
      SelectedCategories.push(categories[index])
    );
    logoImg !== "" ? uploadFile(logoImg, "VendorLogo") : RegisterVendor();
  } else {
  }
}

function RegisterVendor() {
  var id = generateRandomLetter();
  for (let i = 0; i < 8; i++) {
    id += generateRandomLetter();
  }
  set(ref(db, "VendorsDetails/" + userID), {
    vendorName: name,
    vendorId: id,
    addPhoneNo: phone,
    vendorAddress: address,
    vendorLogo: logoImgUrl,
    vendorCat: SelectedCategories,
  })
    .then(() => {
      update(ref(db, `UsersDetails/${userID}`), {
        AccountType: "vendor",
      })
        .then(() => {
          details["AccountType"] = "vendor";
          localStorage.setItem("details", JSON.stringify(details));
          details = JSON.parse(localStorage.getItem("details"));
          document.getElementById("register").style.display = "none";
          document.getElementById("registerLoader").style.display = "none";
          getShopData();
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
}

function generateRandomLetter() {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

const closeBtn = document.getElementsByClassName("btn-close");
Object.values(closeBtn).forEach((btn, index) => {
  btn.addEventListener("click", () => {
    if (index === 0) {
      document.getElementsByClassName("floating-body")[index].style.display =
        "none";
    } else {
      window.location.href = "../Settings";
    }
  });
});

[
  document.getElementById("floating-btn"),
  document.getElementById("continue"),
].forEach((element) =>
  element.addEventListener("click", () => {
    document.getElementById("upload-item").style.display = "flex";
  })
);

const itemPrice = document.getElementById("price");
itemPrice.addEventListener("input", () => {
  var value = itemPrice.value.replace(/,/g, "");
  // Format the value with commas
  var formattedValue = Number(value).toLocaleString("en");
  // Set the formatted value back to the itemPrice field
  itemPrice.value = formattedValue;
});
