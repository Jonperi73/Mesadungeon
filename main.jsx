// React entrypoint
// Loaded by index.html. Keep script order unless moving to a build step.

const startMesaDungeonApp = () => {
  console.log("Firebase listo, iniciando app");
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
};

if (window._firebaseReady) {
  startMesaDungeonApp();
} else {
  window.addEventListener("firebase-ready", startMesaDungeonApp, { once: true });
}
