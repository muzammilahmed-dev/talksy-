import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import * as firebase from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAT6ZJP3Xg43Ju6dR8xeI2hTKIVHPTN3H0",
  authDomain: "talksy-c9fb4.firebaseapp.com",
  projectId: "talksy-c9fb4",
  storageBucket: "talksy-c9fb4.firebasestorage.app",
  messagingSenderId: "258094312766",
  appId: "1:258094312766:web:0fe154402c6064b22b106f",
};

const app = firebase.initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
auth.languageCode = "en";

export function signIn(event) {
  event.preventDefault();
  let email = document.getElementById("email-verify").value;
  let password = document.getElementById("password-verify").value;

  console.log("Button clicked! Email:" + email);
  console.log("Button clicked! Password:" + password);

  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log("Signed In successfully:", user);

      const docRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(docRef);
      console.log(snapshot.data(), doc.id);

      window.location.href = `/home/home.html?userId=${user.uid}`; // Redirect after success
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error creating user:", errorMessage);
    });
}

export function signUp(event) {
  event.preventDefault();
  let name = document.getElementById("name-verify").value;
  let email = document.getElementById("email-verify").value;
  let password = document.getElementById("password-verify").value;

  console.log("Button clicked Name" + name);
  console.log("Button clicked! Email:" + email);
  console.log("Button clicked! Password:" + password);

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed up
      const user = userCredential.user;
      console.log("User created successfully:", user);

      try {
        // Add user to Firestore with custom ID
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          password: password,
          createdAt: new Date().toISOString(),
          userId: user.uid,
        });

        console.log("User data added to Firestore");
        window.location.href = `/home/home.html?userId=${user.uid}`; // Redirect after success
      } catch (error) {
        console.error("Error adding user data to Firestore:", error);
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error creating user:", errorMessage);
    });
}

// Make signIn globally available
window.signIn = signIn;
window.signUp = signUp;
