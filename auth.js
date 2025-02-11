import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCahvvOdB20Ry9KzWZwIGT6slGujZL8m2Q",
  authDomain: "login-da5e5.firebaseapp.com",
  projectId: "login-da5e5",
  storageBucket: "login-da5e5.appspot.com",
  messagingSenderId: "385495379836",
  appId: "1:385495379836:web:a48385252297624e2fbef9"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


export let currentUserId = null;


onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem("currentUserId", user.uid); // Save to localStorage
      console.log("User signed in with UID:", user.displayName);
    } else {
      localStorage.removeItem("currentUserId"); // Remove from localStorage
      console.log("User is signed out");
    }
  });




