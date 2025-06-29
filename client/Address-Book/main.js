import {
  getAuth,
  onAuthStateChanged,
  get,
  getDatabase,
  ref,
  child,
  update,
} from "../firebase.js";
import getThemeColor from "../Utilities/ColorTheme.js";

const db = getDatabase();
let details = JSON.parse(localStorage.getItem("details"));
let userDetails = {};
let editFormIndex = null;

window.onload = () => {
  getThemeColor();
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    user ? getAddress() : window.location.replace("../Login");
  });
};

function getAddress() {
  document.getElementById("loader").style.display = "block";
  console.log(details["key"]);
  get(child(ref(db), `UsersDetails/${details["key"]}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        document.getElementById("loader").style.display = "none";
        document.getElementById("body").innerHTML = "";
        userDetails = snapshot.val();
        displayAddresses();
      }
    })
    .catch((error) => console.error(error));
}

function displayAddresses() {
  if (userDetails) {
    userDetails["AddressBook"].forEach((address, i) => {
      const isChecked = address["switch"] ? "checked" : "";
      document.getElementById("body").innerHTML += `
        <div class="card-container" id="${i}">
          <input type="radio" name="selection" ${isChecked} hidden />
          <div class="card-content">
            <div class="header">
              <p class="edit-link">Edit</p>
            </div>
            <div class="card-details">
              ${formatAddress(address)}
            </div>
          </div>
        </div>`;
    });

    setupAddressClick(userDetails);
    setupEditClicks();
  }
}

function formatAddress(address) {
  return `
    <div class="info-item"><span class="title">First Name:</span><span class="info">${
      address.firstName
    }</span></div>
    <div class="info-item"><span class="title">Last Name:</span><span class="info">${
      address.lastName
    }</span></div>
    <div class="info-item"><span class="title">Phone:</span><span class="info">+234${
      address.phone
    }</span></div>
    <div class="info-item"><span class="title">Location:</span><span class="info">${
      address.location
    }</span></div>
${
  address.address !== ""
    ? `<div class="info-item"><span class="title">Address:</span><span class="info">${address.address}</span></div>`
    : ""
}

    <div class="info-item"><span class="title">Gender:</span><span class="info">${
      address.gender
    }</span></div>
  `;
}

function setupAddressClick(user) {
  const cardContainers = document.getElementsByClassName("card-container");
  Array.from(cardContainers).forEach((container, index) => {
    container.onclick = (e) => {
      e.preventDefault();
      if (user.AddressBook.length > 1 && !user.AddressBook[index]["switch"]) {
        toggleAddressSelection(index, user);
      }
    };
  });
}

function toggleAddressSelection(selectedIndex, user) {
  const updatedAddressBook = user.AddressBook.map((address, index) => ({
    ...address,
    switch: index === selectedIndex,
  }));

  update(ref(db, `UsersDetails/${details["key"]}`), {
    AddressBook: updatedAddressBook,
  })
    .then(() => {
      const firstName = user.AddressBook[selectedIndex].firstName;
      const lastName = user.AddressBook[selectedIndex].lastName;
      localStorage.setItem(
        "details",
        JSON.stringify({
          ...details,
          ...user.AddressBook[selectedIndex],
          name: `${firstName} ${lastName}`,
        })
      );
      getAddress();
    })
    .catch((error) => console.error(error));
}

function setupEditClicks() {
  const editButtons = document.getElementsByClassName("edit-link");
  Array.from(editButtons).forEach((btn, index) => {
    btn.addEventListener("click", () => openEditForm(index));
  });
}

function openEditForm(index) {
  const address = userDetails["AddressBook"][index];
  editFormIndex = index;
  document.getElementById("edit-first").value = address.firstName;
  document.getElementById("edit-last").value = address.lastName;
  document.getElementById("edit-phone").value = address.phone;
  document.getElementById("edit-location").value = address.location;
  document.getElementById("edit-gender").value = address.gender;

  const locationSelect = document.getElementById("edit-location");

  const locationIndex = Array.from(locationSelect.options).findIndex(
    (option) => option.value === address.location
  );
  handleAddressField(locationIndex);

  document.getElementById("edit-address").value = address.address;
  document.getElementById("edit-body").style.display = "flex";
  document.getElementById("edit-loader").style.display = "none";
  document.getElementById("formTitle").innerText = "Edit Address";
}

document.getElementById("close").addEventListener("click", () => {
  document.getElementById("edit-body").style.display = "none";
  clearFormFields();
});

document.getElementById("floating-btn").addEventListener("click", () => {
  clearFormFields();
  document.getElementById("formTitle").innerText = "Register New Address";
  document.getElementById("edit-body").style.display = "flex";
  document.getElementById("edit-loader").style.display = "none";
});

function clearFormFields() {
  [
    "edit-first",
    "edit-last",
    "edit-phone",
    "edit-location",
    "edit-gender",
    "edit-address",
  ].forEach((id) => {
    document.getElementById(id).value = "";
  });
}

document.getElementById("edit-form").addEventListener("submit", handleSubmit);

function handleSubmit(e) {
  e.preventDefault();
  const formValues = getFormValues();
  if (validateForm(formValues)) {
    document.getElementById("edit-loader").style.display = "block";
    updateAddress(formValues);
  } else {
    alert("Fill all fields");
  }
}

function getFormValues() {
  return {
    firstName: document.getElementById("edit-first").value,
    lastName: document.getElementById("edit-last").value,
    phone: document.getElementById("edit-phone").value,
    location: document.getElementById("edit-location").value,
    gender: document.getElementById("edit-gender").value,
    address: document.getElementById("edit-address").value,
  };
}

function validateForm({ firstName, lastName, phone, location, gender }) {
  return (
    firstName &&
    lastName &&
    phone &&
    location !== "General Location" &&
    gender !== "Gender"
  );
}

function updateAddress(formValues) {
  if (!editFormIndex)
    userDetails.AddressBook.push({
      ...formValues,
      switch: false,
    });
  else
    userDetails.AddressBook[editFormIndex] = {
      ...formValues,
      switch: userDetails.AddressBook[editFormIndex].switch,
    };

  update(ref(db, `UsersDetails/${details["key"]}`), {
    AddressBook: userDetails.AddressBook,
  })
    .then(() => {
      document.getElementById("edit-body").style.display = "none";
      editFormIndex = null;
      getAddress();
    })
    .catch((error) => console.error(error));
}

document.getElementById("edit-location").onchange = function () {
  const selectedIndex = this.selectedIndex;
  handleAddressField(selectedIndex);
};

function handleAddressField(selectedIndex) {
  const addressField = document.getElementById("edit-address");

  if (selectedIndex > 19) {
    addressField.style.display = "block";
    addressField.setAttribute("required", true);
  } else {
    addressField.style.display = "none";
    addressField.removeAttribute("required");
  }
}
