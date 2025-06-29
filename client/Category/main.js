import { getDatabase, ref, get, child } from "../firebase.js";
import getThemeColor from "../Utilities/ColorTheme.js";

const database = getDatabase();
let productData = null;
let totalProducts = 0;
const numberFormat = new Intl.NumberFormat("en-US");
let primaryColor, secondaryColor;

window.onload = () => {
  ({ mainColor: primaryColor, subColor: secondaryColor } = getThemeColor());
  fetchProductData();
};

function fetchProductsByCategory(selectedCategory, viewIndex) {
  if (productData) {
    resetCategoryStyles();

    document.getElementById(
      `category_select${viewIndex}`
    ).style.backgroundColor = secondaryColor;

    const categoryBody = document.getElementById("category_body");
    categoryBody.innerHTML = "";

    Object.entries(productData).forEach(([key, product]) => {
      if (
        product.category.toLowerCase().includes(selectedCategory.toLowerCase())
      ) {
        const productElement = createProductElement(product);
        categoryBody.append(productElement);
      }
    });
  }
}

function fetchProductData() {
  const databaseRef = ref(database);
  get(child(databaseRef, "ProductsDetails/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        document.getElementById("loader").style.display = "none";
        productData = snapshot.val();
        totalProducts = Object.keys(productData).length;
        fetchProductsByCategory("phone accessories", 1);
      }
    })
    .catch(fetchProductData);
}

function resetCategoryStyles() {
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`category_select${i}`).style.backgroundColor =
      primaryColor;
  }
}

function createProductElement(product) {
  const productURL = new URL(
    `${window.location.protocol}//${window.location.host}/Product`
  );
  productURL.searchParams.append("product", product.code);

  const productLink = document.createElement("a");
  productLink.href = productURL;
  productLink.classList.add(
    "items_view",
    "col-xs-6",
    "col-sm-4",
    "col-lg-3",
    "col-md-4"
  );

  const productImage = document.createElement("img");
  productImage.classList.add("items_image");
  productImage.src = product.url[0];
  productLink.appendChild(productImage);

  const productName = document.createElement("p");
  productName.classList.add("item_name");
  productName.textContent = product.name;
  productLink.appendChild(productName);

  const productPrice = document.createElement("p");
  productPrice.classList.add("item_price");
  productPrice.textContent = `₦${numberFormat.format(product.price)}`;
  productPrice.style.color = "#000137";
  productLink.appendChild(productPrice);

  return productLink;
}

const categoryButtons = [
  { id: "category_view1", category: "phone accessories", viewIndex: 1 },
  { id: "category_view2", category: "clothing", viewIndex: 2 },
  { id: "category_view3", category: "perfumes & oil", viewIndex: 3 },
  { id: "category_view4", category: "shoes", viewIndex: 4 },
  { id: "category_view5", category: "food & catering", viewIndex: 5 },
];

categoryButtons.forEach(({ id, category, viewIndex }) => {
  document.getElementById(id).onclick = () =>
    fetchProductsByCategory(category, viewIndex);
});
