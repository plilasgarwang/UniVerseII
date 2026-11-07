// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8rL7bz7rZh84VCZM9-GJo4c_MxotlGJc",
  authDomain: "universehub-41041.firebaseapp.com",
  projectId: "universehub-41041",
  storageBucket: "universehub-41041.firebasestorage.app",
  messagingSenderId: "350957917183",
  appId: "1:350957917183:web:29bd6f31d47ab8fd910dca",
  measurementId: "G-YHT436SBV5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);