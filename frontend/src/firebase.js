// Firebase References

// Firebase Authentication
// Documentation: https://firebase.google.com/docs/auth
// JavaScript SDK: https://firebase.google.com/docs/auth/web/start
// Methods used in code: createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail

// Firebase Firestore
// Documentation: https://firebase.google.com/docs/firestore
// JavaScript SDK: https://firebase.google.com/docs/firestore/quickstart
// Methods used in code: collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query


// Firebase React Hooks

// Documentation: https://github.com/CSFrequency/react-firebase-hooks

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// https://firebase.google.com/docs/web/setup#available-libraries

// Web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDT3yRvJzSRgM_pDn_sDW-n47kdBPR7_Ng",
  authDomain: "userapp-db271.firebaseapp.com",
  projectId: "userapp-db271",
  storageBucket: "userapp-db271.appspot.com",
  messagingSenderId: "829397928616",
  appId: "1:829397928616:web:0da65c1b324d78b6a0109d",
  measurementId: "G-M4SBX0225C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Export the auth and db variables so they can be imported in other files
export { auth, db };