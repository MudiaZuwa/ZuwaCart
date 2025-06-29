import {
  storageRef,
  getDownloadURL,
  storage,
  uploadBytes,
} from "../firebase.js";

function uploadFile(file, folder, index) {
  const storagePath =
    folder === "VendorLogo"
      ? `${folder}/${name}/${file.name}`
      : `${folder}/${vendorDetails["vendorName"]}/${name}/${file.name} `;
  const storagePathRef = storageRef(storage, storagePath);

  uploadBytes(storagePathRef, file)
    .then((snapshot) => {
      getDownloadURL(snapshot.ref)
        .then((downloadURL) => {
          if (folder === "VendorLogo") {
            logoImgUrl = downloadURL;
            RegisterVendor();
          } else {
            ItemImgsUrl.push(downloadURL);
            const fileList = document.getElementsByClassName("file-list")[0];
            fileList.removeChild(fileList.children[0]);
            if (index + 1 === ItemImgs.length) {
              uploadProduct();
            } else {
              uploadFile(ItemImgs[index + 1], "ProductImage", index + 1);
            }
          }
        })
        .catch((error) => {
          console.error("Failed to get download URL:", error);
        });
    })
    .catch((error) => {
      console.error("Upload error:", error);
    });
}

// Get drop area element
const dropArea = document.getElementsByClassName("drop-area");
const fileButton = document.getElementsByClassName("fileButton");

// Prevent default drag behaviors
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  Object.values(dropArea).forEach((element) =>
    element.addEventListener(eventName, preventDefaults, false)
  );
  document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area when item is dragged over it
["dragenter", "dragover"].forEach((eventName) => {
  Object.values(dropArea).forEach((element, index) =>
    element.addEventListener(
      eventName,
      () => {
        element.classList.add("highlight");
      },
      false
    )
  );
});

// Remove highlight when item is dragged out of the drop area
["dragleave", "drop"].forEach((eventName) => {
  Object.values(dropArea).forEach((element, index) =>
    element.addEventListener(
      eventName,
      () => {
        element.classList.remove("highlight");
      },
      false
    )
  );
});

Object.values(fileButton).forEach((element, index) => {
  element.addEventListener("click", () => {
    const fileInput = document.getElementsByClassName("file-input")[index];
    fileInput.click();
  });
});

// Handle dropped files
Object.values(dropArea).forEach((element, index) =>
  element.addEventListener(
    "drop",
    (e) => {
      const files = e.dataTransfer.files;
      handleFiles(files, index);
    },
    false
  )
);

// Prevent default behavior
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Handle selected files
function handleFiles(files, index) {
  // Show selected files in the file list
  for (const file of files) {
    if (file.type.includes("image")) {
      const listItem = document.createElement("li");
      listItem.textContent = file.name;
      if (index === 0) {
        document
          .getElementsByClassName("file-list")
          [index].appendChild(listItem);

        ItemImgs.push(file);
      } else if (index === 1) {
        document.getElementsByClassName("file-list")[index].innerHTML =
          listItem;
        logoImg = file;
      }

      // uploadFile(file);
    }
  }
}

// Handle file input change
const file_input = document.getElementsByClassName("file-input");
Object.values(file_input).forEach((element, index) => {
  element.addEventListener("change", function () {
    const files = this.files;
    handleFiles(files, index);
  });
});
