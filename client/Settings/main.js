import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBYxeN5MYVPDLNO2rmAd4ac1Bm3CzJhcpM",
  authDomain: "quickmarkert.firebaseapp.com",
  databaseURL: "https://quickmarkert-default-rtdb.firebaseio.com",
  projectId: "quickmarkert",
  storageBucket: "quickmarkert.appspot.com",
  messagingSenderId: "204278904584",
  appId: "1:204278904584:web:9000c97e001e7104a4debd",
  measurementId: "G-VKQ30K962R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";
import getThemeColor from "../Utilities/ColorTheme.js";

window.onload = function () {
  getThemeColor();
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme) {
    const radio = document.querySelector(
      `input[name="theme"][value="${currentTheme}"]`
    );
    if (radio) {
      radio.checked = true;
    }
  }

  var cart_listnum = JSON.parse(localStorage.getItem("cart"));
  if (cart_listnum !== null && cart_listnum.length !== 0) {
    document.getElementById("cart_num").textContent = cart_listnum.length;
  } else {
    document.getElementById("cart_num").textContent = 0;
  }
  var details = JSON.parse(localStorage.getItem("details"));
  const auth = getAuth();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById("login").textContent = "Logout";
      document.getElementById("loginrequest").textContent = details["email"];
      document.getElementById("username").textContent = details["first"];
    } else {
      var anchr = document.createElement("a");
      anchr.href = "../Login";
      anchr.appendChild(document.getElementById("login"));
      document.getElementById("div3").appendChild(anchr);
    }
  });
};

document.getElementById("login").onclick = function () {
  if (document.getElementById("login").textContent === "Login") {
  } else {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        document.getElementById("login").textContent = "Login";
        document.getElementById("loginrequest").textContent =
          "Please Login to your Account";
        document.getElementById("username").textContent = "";
        localStorage.removeItem("details");
        var anchr = document.createElement("a");
        anchr.href = "../Login";
        anchr.appendChild(document.getElementById("login"));
        document.getElementById("div3").appendChild(anchr);
      })
      .catch((error) => {
        // An error happened.
        alert(error);
      });
  }
};

document
  .getElementById("displayMode")
  .addEventListener("click", openThemeModal);
document.getElementById("close").addEventListener("click", closeThemeModal);

function openThemeModal() {
  document.getElementById("themeModal").style.display = "block";
}

function closeThemeModal() {
  document.getElementById("themeModal").style.display = "none";
}

const themeOptions = document.getElementById("themeOptions");

themeOptions.addEventListener("change", function (event) {
  if (event.target.name === "theme") {
    handleThemeChange(event.target.value);
  }
});

function handleThemeChange(selectedTheme) {
  localStorage.setItem("theme", selectedTheme);
  // window.location.reload();
  getThemeColor()
}
