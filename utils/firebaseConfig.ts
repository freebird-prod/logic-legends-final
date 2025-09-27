// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC-aFUvTSUzpSEq4hdrhRAza5pIG6Ltr7s",
    authDomain: "smart-customer-automization.firebaseapp.com",
    projectId: "smart-customer-automization",
    storageBucket: "smart-customer-automization.firebasestorage.app",
    messagingSenderId: "163269034381",
    appId: "1:163269034381:web:f39256a781c4f3f513bdc4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };