// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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
submit.addEventListener("click", function (event) {
    event.preventDefault();

    // Inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;

            // Send user data to the backend
            fetch("http://localhost:3000/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: user.uid,
                    name: "test for now change later from login script",
                    email: user.email,
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        alert("User successfully created in Prisma.");
                        window.location.href = "/index.html";
                    } else {
                        return response.json().then((error) => {
                            throw new Error(error.message);
                        });
                    }
                })
                .catch((error) => {
                    alert("Error creating user in Prisma: " + error.message);
                });
        })
        .catch((error) => {
            // Handle errors
            const errorMessage = error.message;
            alert(errorMessage);
        });
});
