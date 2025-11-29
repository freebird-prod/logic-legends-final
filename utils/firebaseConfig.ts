// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCLOJncCsDPC8SZgfC5JG1U9epIcrCabrg",
    authDomain: "voice-digest-vt.firebaseapp.com",
    projectId: "voice-digest-vt",
    storageBucket: "voice-digest-vt.firebasestorage.app",
    messagingSenderId: "453620742933",
    appId: "1:453620742933:web:e67e63eadc6e1ddf9d471c"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };