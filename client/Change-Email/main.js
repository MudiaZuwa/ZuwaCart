import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateEmail,
} from "../firebase.js";
import getThemeColor from "../Utilities/ColorTheme.js";

let email, password, newEmail;

const form = document.getElementById("boxes");
form.addEventListener("submit", submit, false);

function submit(e) {
  e.preventDefault();
  getInputValues();
  Reauthenticateuser();
  document.getElementById("loader").setAttribute("style", "display:block");
}

const getInputValues = () => {
  email = document.getElementById("email").value;
  password = document.getElementById("password").value;
  newEmail = document.getElementById("newEmail").value;
};

const auth = getAuth();

const Reauthenticateuser = () => {
  const user = auth.currentUser;
  if (!user) {
    alert("No user is signed in!");
    return;
  }

  const credential = EmailAuthProvider.credential(email, password);

  reauthenticateWithCredential(user, credential)
    .then(() => {
      changeEmail();
    })
    .catch((error) => {
      console.error("Reauthentication failed:", error);
      alert("Reauthentication failed. Please check your credentials.");
      document.getElementById("loader").setAttribute("style", "display:none");
    });
};

const changeEmail = () => {
  const user = auth.currentUser;

  updateEmail(user, newEmail)
    .then(() => {
      alert("Email changed successfully!");
      window.history.back();
    })
    .catch((error) => {
      console.error("Failed to change password:", error);
      alert("Failed to change password. Try again.");
      document.getElementById("loader").setAttribute("style", "display:none");
    });
};

onload = () => {
  getThemeColor();
};
