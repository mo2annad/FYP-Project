// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth,  createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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
        // Signed up 
        const user = userCredential.user;

        // Send user data to the backend
        fetch("http://localhost:3000/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: user.uid,
                name: username,
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
        // ...
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage)
        // ..
    });
})