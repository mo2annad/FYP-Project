// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth,  createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCahvvOdB20Ry9KzWZwIGT6slGujZL8m2Q",
    authDomain: "login-da5e5.firebaseapp.com",
    projectId: "login-da5e5",
    storageBucket: "login-da5e5.firebasestorage.app",
    messagingSenderId: "385495379836",
    appId: "1:385495379836:web:a48385252297624e2fbef9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

//submit button
const submit = document.getElementById('submit');
submit.addEventListener("click", function (event) {
    event.preventDefault()

    //inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        
        return updateProfile(user, {
            displayName: username
        }).then(() => {
            return fetch("http://localhost:3000/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: user.uid,
                    name: username,
                    email: user.email,
                }),
            });
        });
    })
    .then((response) => {
        if (response.ok) {
            alert("User successfully created!");
            window.location.href = "/index.html";
        } else {
            return response.json().then((error) => {
                throw new Error(error.message);
            });
        }
    })
    .catch((error) => {
        alert(error.message);
    });
})

onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem("currentUserId", user.uid); // Save to localStorage
      console.log("User signed in with UID:", user.displayName);
    } else {
      localStorage.removeItem("currentUserId"); // Remove from localStorage
      console.log("User is signed out");
    }
  });