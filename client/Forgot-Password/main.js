import { getAuth, sendPasswordResetEmail } from "../firebase.js";
import getThemeColor from "../Utilities/ColorTheme.js";

var email;

const paymentForm = document.getElementById("boxes");
paymentForm.addEventListener("submit", submit, false);

function submit(e) {
  e.preventDefault();
  email = document.getElementById("email").value;
  send_email();
  document.getElementById("loader").setAttribute("style", "display:block");
}

onload = () => {
  getThemeColor();
};

function send_email() {
  const auth = getAuth();
  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert(
        "We've sent a reset link to your email. Check your inbox (and spam folder) if you don't see it."
      );
      window.history.back();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      document.getElementById("loader").setAttribute("style", "display:none");
      alert(errorMessage);
    });
}
