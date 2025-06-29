import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "../firebase.js";
import getThemeColor from "../Utilities/ColorTheme.js";

let email, password, confirmPass, newPassword;

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
  confirmPass = document.getElementById("confirmPass").value;
  newPassword = document.getElementById("newPassword").value;
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
      changePassword(); // Call function to update password after reauth
    })
    .catch((error) => {
      console.error("Reauthentication failed:", error);
      alert("Reauthentication failed. Please check your credentials.");
      document.getElementById("loader").setAttribute("style", "display:none");
    });
};

const changePassword = () => {
  if (newPassword !== confirmPass) {
    alert("Passwords do not match!");
    document.getElementById("loader").setAttribute("style", "display:none");
    return;
  }
  const user = auth.currentUser;

  updatePassword(user, newPassword)
    .then(() => {
      alert("Password changed successfully!");
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
