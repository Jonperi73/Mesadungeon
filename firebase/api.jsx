// Firebase runtime helpers
// Loaded by index.html. Keep script order unless moving to a build step.

const fb = {
  ref: (path) => window._fbRef(window._fbDb, path),
  set: (path, val) => window._fbSet(window._fbRef(window._fbDb, path), val),
  get: async (path) => {
    const snap = await window._fbGet(window._fbRef(window._fbDb, path));
    return snap.exists() ? snap.val() : null;
  },
  update: (path, val) =>
    window._fbUpdate(window._fbRef(window._fbDb, path), val),
  listen: (path, cb) =>
    window._fbOnValue(
      window._fbRef(window._fbDb, path),
      (snap) => cb(snap.exists() ? snap.val() : null)
    ),
  push: (path, val) =>
    window._fbPush(window._fbRef(window._fbDb, path), val),
  remove: (path) => window._fbSet(window._fbRef(window._fbDb, path), null),
  increment: async (path) => {
    const snap = await window._fbGet(window._fbRef(window._fbDb, path));
    const val = (snap.exists() ? snap.val() : 0) + 1;
    await window._fbSet(window._fbRef(window._fbDb, path), val);
    return val;
  },
};

const authApi = {
  current: () => (window._fbAuth && window._fbAuth.currentUser) || null,
  listen: (cb) => window._fbOnAuthStateChanged(window._fbAuth, cb),

  signIn: (email, password) =>
    window._fbSignIn(window._fbAuth, email, password),

  signInAnonymously: () =>
    window._fbSignInAnonymously(window._fbAuth),

  register: async (email, password, displayName) => {
    try {
      const cred = await window._fbCreateUser(window._fbAuth, email, password);
      const user = cred.user;

      const snap = await window._fbGet(
        window._fbRef(window._fbDb, 'users')
      );
      const accounts = snap.exists() ? snap.val() : null;

      const isFirstUser =
        !accounts || Object.keys(accounts).length === 0;

      const role = isFirstUser ? "owner" : "dm";
      const status = isFirstUser ? "approved" : "pending";

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
  },

  signOut: () => window._fbSignOut(window._fbAuth),

  updateProfile: (user, data) =>
    window._fbUpdateProfile(user, data),

  sendVerification: (user) =>
    window._fbSendEmailVerification(user),
};

// ─── GLOBAL STYLES ───────────────────────────────────────────
