// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail , onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCahvvOdB20Ry9KzWZwIGT6slGujZL8m2Q",
    authDomain: "login-da5e5.firebaseapp.com",
    projectId: "login-da5e5",
    storageBucket: "login-da5e5.firebasestorage.app",
    messagingSenderId: "385495379836",
    appId: "1:385495379836:web:a48385252297624e2fbef9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Submit button
const submit = document.getElementById('submit');
const forgotPassword = document.getElementById('forgotPassword');



submit.addEventListener("click", function (event) {
    event.preventDefault();

    // Inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            window.location.href = "/index.html";
          
        })
        .catch((error) => {
            // Handle errors
            const errorMessage = error.message;
            alert(errorMessage);
        });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem("currentUserId", user.uid); // Save to localStorage
      console.log("User signed in with UID:", user.displayName);
    } else {
      localStorage.removeItem("currentUserId"); // Remove from localStorage
      console.log("User is signed out");
    }
  });

forgotPassword.addEventListener("click", function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;

    console.log(email)
    sendPasswordResetEmail(auth, email)
  .then(() => {

    alert("Password reset email sent!");
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });
});
