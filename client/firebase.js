import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyB68-mLjoJ7auggXyXYurKe43K6KpEAGeI",
  authDomain: "uniben-53697.firebaseapp.com",
  databaseURL: "https://uniben-53697-default-rtdb.firebaseio.com",
  projectId: "uniben-53697",
  storageBucket: "uniben-53697.appspot.com",
  messagingSenderId: "934167761032",
  appId: "1:934167761032:web:1a1d2bae0a382bbaf60f3d",
  measurementId: "G-JENF9VMVR3",
};

// Initialize Firebase

import {
  getDatabase,
  ref,
  set,
  get,
  child,
  update,
  push,
  remove,
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-database.js";

import {
  getAuth,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  sendEmailVerification,
  updateEmail,
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-storage.js";

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export {
  getAuth,
  getDatabase,
  ref,
  set,
  get,
  child,
  update,
  remove,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  storageRef,
  getStorage,
  uploadBytes,
  getDownloadURL,
  storage,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
  sendEmailVerification,
  updateEmail,
};
