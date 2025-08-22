import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAT6ZJP3Xg43Ju6dR8xeI2hTKIVHPTN3H0",
  authDomain: "talksy-c9fb4.firebaseapp.com",
  projectId: "talksy-c9fb4",
  storageBucket: "talksy-c9fb4.firebasestorage.app",
  messagingSenderId: "258094312766",
  appId: "1:258094312766:web:0fe154402c6064b22b106f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const urlParams = new URLSearchParams(window.location.search);

// Get a single query parameter
const userId = urlParams.get("userId"); // "Muzammil"

// console.log(userId);

async function fetchGroupsOneUser(userId) {
  const ref = collection(db, "groups");
  const q = query(ref, where("users", "array-contains", userId));
  const querySnapshot = await getDocs(q);

  let groups = ``;
  querySnapshot.forEach((doc) => {
    const { groupName, lastMessage } = doc.data();
    const groupHtml = `<div class="block">
            <div class="imgbx">
              <img src="image1.jpg" class="cover" />
            </div>
            <div class="details">
              <div class="listHead">
                <h4>${groupName}</h4>
                <p class="time">10:24</p>
              </div>
              <div class="message-p">
                <p>${lastMessage}</p>
              </div>
            </div>
          </div>`;

    groups += groupHtml;

    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
  });

  const chatListDiv = document.getElementById("chatList");
  chatListDiv.innerHTML = groups;
}

fetchGroupsOneUser(userId);
