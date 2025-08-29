import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
  setDoc,
  onSnapshot,
  query,
  where,
  arrayUnion,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import {
  getDatabase,
  set,
  get,
  ref,
  push,
  onChildAdded,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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
const rtdb = getDatabase(app);
const urlParams = new URLSearchParams(window.location.search);

// Global variables
const userId = urlParams.get("userId"); // "Muzammil"
let selectedGroupId = "";
let currentMessageListener = null;
let groupIdMap = new Map();

async function fetchGroupsOneUser(userId) {
  const ref = collection(db, "groups");
  const q = query(ref, where("users", "array-contains", userId));
  const querySnapshot = await getDocs(q);
  let groups = ``;
  querySnapshot.forEach((doc) => {
    const groupId = doc.id;
    const { groupName, lastMessage, code } = doc.data();
    groupIdMap.set(groupId, { groupName, code });

    const groupHtml = `<div class="block" onclick="openGroupHistory('${groupId}')">
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

  console.log(groupIdMap);

  const chatListDiv = document.getElementById("chatList");
  chatListDiv.innerHTML = groups;
}

fetchGroupsOneUser(userId);

// Join Group Code
const openJoinGroup = document.getElementById("openJoinGroup");
const modelJoinGroup = document.getElementById("modelJoinGroup");
const joinGroupViaCode = document.getElementById("joinGroupViaCode");
const joinGroupClose = document.getElementById("joinGroupClose");

joinGroupClose.addEventListener("click", () => {
  document.getElementById("joinGroupCode").value = "";
  modelJoinGroup.classList.remove("show");
});
openJoinGroup.addEventListener("click", async () => {
  modelJoinGroup.classList.add("show");
});

joinGroupViaCode.addEventListener("click", async () => {
  let groupCode = document.getElementById("joinGroupCode").value;
  if (!groupCode) {
    alert("Please enter a group code");
    return;
  }

  const ref = collection(db, "groups");
  const q = query(ref, where("code", "==", groupCode));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(async (groupDoc) => {
    console.log(groupDoc.id, "=>", groupDoc.data());

    const groupRef = doc(db, "groups", groupDoc.id);
    await updateDoc(groupRef, {
      users: arrayUnion(userId),
    });
  });

  // const docRef = await addDoc(collection(db, "groups"))
  console.log(groupCode);
  modelJoinGroup.classList.remove("show");
});

// Create Group
const open = document.getElementById("open");
const modelCreateGroup = document.getElementById("modelCreateGroup");
const close = document.getElementById("close");
const createGroupClose = document.getElementById("createGroupClose");

createGroupClose.addEventListener("click", () => {
  document.getElementById("createGroup").value = "";
  modelCreateGroup.classList.remove("show");
});
open.addEventListener("click", async () => {
  modelCreateGroup.classList.add("show");
});

close.addEventListener("click", async () => {
  let name = document.getElementById("createGroup").value;
  if (!name) {
    alert("Please enter a group name");
    return;
  }
  const docRef = await addDoc(collection(db, "groups"), {
    groupName: name,
    lastMessage: "",
    lastTimeStamp: 0,
    createdAt: new Date().toISOString(),
    users: [userId],
    code: generateGroupCode(),
  });
  console.log(name);
  modelCreateGroup.classList.remove("show");
  fetchGroupsOneUser(userId);
});

const generateGroupCode = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

async function addMessageToTheGroup(groupId, message) {
  if (!groupId) return;
  if (!message) return;

  // Create a reference to "users"
  const groupRef = ref(rtdb, `groups/${groupId}`);

  // Push creates a unique ID
  const newMessageRef = push(groupRef);

  await set(newMessageRef, {
    userId: userId,
    message: message,
    createdAt: new Date().toISOString(),
  });
}

// send message
const btnSendMessage = document.getElementById("btnSendMessage");
btnSendMessage.addEventListener("click", async () => {
  const inputElement = document.getElementById("inputSendMessage");
  const message = inputElement.value;

  if (message.trim()) {
    await addMessageToTheGroup(selectedGroupId, message);
    inputElement.value = "";
  }
});

// open group chat history
async function openGroupHistory(groupId) {
  selectedGroupId = groupId;
  const group = groupIdMap.get(groupId);
  console.log(`selectedGroupId: ${groupId}`, group);

  document.getElementById(
    "selectedGroupName"
  ).innerHTML = `${group.groupName} <br /><span>${group.code}</span>`;
  // Clear previous messages from the UI
  document.getElementById("chatContainer").innerHTML = "";

  // Remove previous message listener if exists
  if (currentMessageListener) {
    currentMessageListener();
  }

  const groupRef = ref(rtdb, `groups/${groupId}`);

  // Listen for new messages
  currentMessageListener = onChildAdded(groupRef, (snapshot) => {
    const messageData = snapshot.val();

    const { message, createdAt } = messageData;

    // Format the timestamp
    const messageTime = new Date(createdAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const messageHTML = `<div class="message ${
      messageData.userId === userId ? "my_message" : "frnd_message"
    }">
            <p>${message}<br /><span>${messageTime}</span></p>
          </div>`;
    //clear previous messages

    const chatContainer = document.getElementById("chatContainer");
    chatContainer.insertAdjacentHTML("beforeend", messageHTML);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });
}

// Make globally available
window.openGroupHistory = openGroupHistory;
