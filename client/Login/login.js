import {
  getDatabase,
  ref,
  get,
  child,
  update,
  getAuth,
  signInWithEmailAndPassword,
} from "../firebase.js";

const db = getDatabase();
let email,
  password,
  userDetails = {};
const paymentForm = document.getElementById("loginBoxes");

paymentForm.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
  event.preventDefault();
  getCredentials();
  signInUser();
}

function getCredentials() {
  email = document.getElementById("loginEmail").value;
  password = document.getElementById("loginPassword").value;
}

function signInUser() {
  if (email && password) {
    const auth = getAuth();
    showLoader(true);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        fetchUserData(userCredential.user.uid);
      })
      .catch((error) => {
        showLoader(false);
        alert(error);
      });
  }
}

function fetchUserData(userId) {
  const dbRef = ref(db);
  get(child(dbRef, `UsersDetails/${userId}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        processUserData(snapshot.val());
      }
    })
    .catch(handleError);
}

function processUserData(user) {
  const currentAddressBook = user.AddressBook.find(
    (AddressBook) => AddressBook.switch
  );

  userDetails = {
    AccountType: user.AccountType,
    email: user.email,
    name: `${currentAddressBook[`firstName`]} ${
      currentAddressBook[`lastName`]
    }`,
    hostel: currentAddressBook[`hostel`],
    first: currentAddressBook[`firstName`],
    gender: currentAddressBook[`gender`],
    phone: currentAddressBook[`phone`],
    login: "yes",
    key: user.id,
  };
  localStorage.setItem("details", JSON.stringify(userDetails));
  loadCartData(user);
}

function uploadCartData(newCart, user) {
  if (newCart && newCart.length > 0) {
    update(ref(db, `UsersDetails/${user.id}`), { cart: newCart })
      .then(() => {
        localStorage.setItem("cart", JSON.stringify(newCart));
        window.location = "../";
      })
      .catch(console.error);
  } else {
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.location = "../";
  }
}

function loadCartData(user) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const userCart = user.cart || [];

  const filteredUserCart = userCart.filter(
    (product) => !cartItems.some((item) => item.code === product.code)
  );

  const updatedCart = [...filteredUserCart, ...cartItems];

  uploadCartData(updatedCart, user);
}

function handleError(error) {
  if (error.message.includes("Client is offline")) {
    alert("Please Check Your Network Connection");
  } else {
    console.error(error);
  }
  showLoader(false);
}

function showLoader(show) {
  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");
  const loader = document.getElementById("loader");
  const loginButton = document.getElementById("loginSubmit");
  if (show) {
    loginButton.setAttribute("disabled", true);
    email.setAttribute("disabled", true);
    password.setAttribute("disabled", true);
    loader.classList.remove("d-none");
  } else {
    email.removeAttribute("disabled");
    password.removeAttribute("disabled");
    loginButton.removeAttribute("disabled");
    loader.classList.add("d-none");
  }
  document.getElementById("loader").style.display = show ? "block" : "none";
}

document.getElementById("loginToggle").onclick = () => {
  const passwordInput = document.getElementById("loginPassword");
  const toggleIcon = document.getElementById("loginToggleImg");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.src = "../images/ic_visibility_black.png";
  } else {
    passwordInput.type = "password";
    toggleIcon.src = "../images/ic_visibility_off_black.png";
  }
};
