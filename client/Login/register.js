import {
  getDatabase,
  ref,
  set,
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "../firebase.js";

const db = getDatabase();

let userFormData = {
  first: "",
  last: "",
  email: "",
  password: "",
  re_password: "",
  phone: "",
  gender: "",
  location: "",
  address: "",
};

const auth = getAuth();

const paymentForm = document.getElementById("registerBoxes");
paymentForm.addEventListener("submit", handleSubmit, false);

function handleSubmit(event) {
  event.preventDefault();
  gatherFormData();

  const {
    first,
    last,
    email,
    password,
    re_password,
    phone,
    gender,
    location,
    address,
  } = userFormData;

  if (
    validateForm({
      first,
      last,
      email,
      password,
      phone,
      gender,
      location,
      address,
    })
  ) {
    if (password === re_password) {
      showLoader(true);
      signUpUser();
    } else {
      alert("Passwords do not match");
    }
  } else {
    alert("Please fill in all fields");
  }
}

function gatherFormData() {
  userFormData = {
    first: document.getElementById("registerFirstName").value,
    last: document.getElementById("registerLastName").value,
    email: document.getElementById("registerEmail").value,
    password: document.getElementById("registerPassword").value,
    re_password: document.getElementById("registerConfirmPass").value,
    phone: document.getElementById("registerPhone").value,
    gender: document.getElementById("registerGender").value,
    location: document.getElementById("registerHostel").value,
    address: document.getElementById("registerAddress").value,
  };
}

function validateForm({
  first,
  last,
  email,
  password,
  phone,
  gender,
  location,
  address,
}) {
  return (
    first &&
    last &&
    email &&
    password &&
    phone &&
    gender !== "Gender" &&
    location !== "General Location"
  );
}

function signUpUser() {
  const { email, password } = userFormData;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      insertUserData(user);
    })
    .catch((error) => {
      alert(error.message);
      showLoader(false);
    });
}

function insertUserData(user) {
  const cartList = JSON.parse(localStorage.getItem("cart")) || [];

  set(ref(db, `UsersDetails/${user.uid}`), {
    AccountType: "user",
    AddressBook: [
      {
        address: userFormData.address,
        firstName: userFormData.first,
        lastName: userFormData.last,
        gender: userFormData.gender,
        phone: userFormData.phone,
        location: userFormData.location,
        switch: true,
      },
    ],
    cart: cartList,
    email: userFormData.email,
    id: user.uid,
  })
    .then(() => {
      sendEmailVerification(auth.currentUser).then(() => {
        setUserInfo(user.uid);
      });
    })
    .catch((error) => {
      console.error(error);
      showLoader(false);
    });
}

function setUserInfo(userId) {
  const details = {
    AccountType: "user",
    address: userFormData.address,
    email: userFormData.email,
    first: userFormData.first,
    name: `${userFormData.first} ${userFormData.last}`,
    location: userFormData.location,
    gender: userFormData.gender,
    key: userId,
    phone: userFormData.phone,
    login: "yes",
  };

  showLoader(false);
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("authTabs").style.display = "none";
  document.getElementById("verificationMessage").classList.remove("d-none");
  document.getElementById("verificationMessageHead").classList.remove("d-none");
  document.getElementById("verificationMessage").style.display = "flex";
  document.getElementById("verificationMessageHead").style.display = "blocks";
  localStorage.setItem("details", JSON.stringify(details));
}

document.getElementById("registerHostel").onchange = function () {
  const selectedIndex = this.selectedIndex;
  const addressField = document.getElementById("registerAddress");

  if (selectedIndex > 19) {
    addressField.style.display = "block";
    addressField.setAttribute("required", true);
  } else {
    addressField.style.display = "none";
    addressField.removeAttribute("required");
  }
};

document.getElementById("registerToggle").onclick = function () {
  togglePasswordVisibility();
};

function togglePasswordVisibility() {
  const passwordField = document.getElementById("registerPassword");
  const rePasswordField = document.getElementById("registerConfirmPass");
  const toggleIcon = document.getElementById("registerToggleImg");

  const isPasswordVisible = passwordField.type === "password";

  passwordField.type = isPasswordVisible ? "text" : "password";
  rePasswordField.type = isPasswordVisible ? "text" : "password";
  toggleIcon.src = isPasswordVisible
    ? "../images/ic_visibility_black.png"
    : "../images/ic_visibility_off_black.png";
}

function showLoader(show) {
  const loader = document.getElementById("loader");
  loader.classList.remove("d-none");
  loader.style.display = show ? "block" : "none";

  const fields = [
    "registerFirstName",
    "registerLastName",
    "registerEmail",
    "registerPassword",
    "registerConfirmPass",
    "registerPhone",
    "registerGender",
    "registerHostel",
    "registerSubmit",
  ];
  fields.forEach((field) => {
    const element = document.getElementById(field);
    if (show) {
      element.setAttribute("disabled", true);
    } else {
      element.removeAttribute("disabled");
    }
  });
  if (show) {
    loader.removeAttribute("d-none");
  } else {
    loader.setAttribute("d-none", true);
  }
}
