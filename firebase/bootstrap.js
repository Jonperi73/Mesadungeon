import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, signOut, updateProfile, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCUUVrMyx61eBorRU-K2nd7lOf7zI5_mwQ",
  authDomain: "dyd-online.firebaseapp.com",
  databaseURL: "https://dyd-online-default-rtdb.firebaseio.com",
  projectId: "dyd-online",
  storageBucket: "dyd-online.firebasestorage.app",
  messagingSenderId: "954551330824",
  appId: "1:954551330824:web:9109c63b9b4c834e9689bd",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .catch(err => console.warn("Auth persistence warning", err))
  .finally(() => {
    // Expose Firebase DB/Auth helpers globally for React
    window._fbDb = db;
    window._fbAuth = auth;
    window._fbRef = ref;
    window._fbSet = set;
    window._fbGet = get;
    window._fbOnValue = onValue;
    window._fbUpdate = update;
    window._fbPush = push;
    window._fbOnAuthStateChanged = onAuthStateChanged;
    window._fbCreateUser = createUserWithEmailAndPassword;
    window._fbSignIn = signInWithEmailAndPassword;
    window._fbSignOut = signOut;
    window._fbUpdateProfile = updateProfile;
    window._fbSendEmailVerification = sendEmailVerification;
    window._fbSignInAnonymously = signInAnonymously;
    window._firebaseReady = true;
    window.dispatchEvent(new Event("firebase-ready"));
  });
  // 🔥 REGISTRO CON OWNER AUTOMÁTICO
window._registerUser = async (email, password, displayName) => {
  try {
const cred = await window._fbCreateUser(window._fbAuth, email, password);
const user = cred.user;

// 🔍 Verificar si ya hay usuarios
const snap = await window._fbGet(
 window._fbRef(window._fbDb, "users")
);
const accounts = snap.exists() ? snap.val() : null;

const isFirstUser = !accounts || Object.keys(accounts).length === 0;

// 🧠 Definir rol
const role = isFirstUser ? "owner" : "dm";
const status = isFirstUser ? "approved" : "pending";

// 💾 Guardar usuario con rol
await window._fbSet(
  window._fbRef(window._fbDb, `users/${user.uid}`),
  {
    uid: user.uid,
    email: user.email,
    displayName: displayName || "",
    role,
    status,
    requestedAt: Date.now(),
    approvedAt: isFirstUser ? Date.now() : null,
  }
);

return user;
  } catch (err) {
console.error("Error en registro:", err);
throw err;
  }
}
