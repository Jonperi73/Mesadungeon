import DiceBox from "https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/dice-box.es.min.js";

const OVERLAY_ID = "dice-overlay-box";
const ASSET_ORIGIN = new URL("./", window.location.href).href;
let diceBox = null;
let readyPromise = null;

const getOverlay = () => document.getElementById(OVERLAY_ID);

const setOverlayVisible = (visible) => {
  const overlay = getOverlay();
  if (!overlay) return;
  overlay.classList.toggle("is-rolling", visible);
};

const flattenResults = (results) => {
  if (!Array.isArray(results)) return [];
  return results
    .map(result => Number(result && result.value))
    .filter(value => Number.isFinite(value));
};

const playClatter = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    [0, 0.08, 0.17, 0.29].forEach((offset, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(120 + Math.random() * 90, now + offset);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.05 - index * 0.007, now + offset + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.12);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.14);
    });

    setTimeout(() => ctx.close(), 650);
  } catch (error) {
    console.warn("No se pudo reproducir sonido de dados:", error);
  }
};

const ensureDiceBox = async () => {
  if (diceBox) return diceBox;
  if (readyPromise) return readyPromise;

  const overlay = getOverlay();
  if (!overlay) {
    throw new Error("No existe el overlay transparente para DiceBox.");
  }

  diceBox = new DiceBox({
    container: `#${OVERLAY_ID}`,
    assetPath: "dice-box/",
    origin: ASSET_ORIGIN,
    gravity: 1,
    mass: 1,
    friction: 0.8,
    restitution: 0.15,
    angularDamping: 0.38,
    linearDamping: 0.42,
    settleTimeout: 5000,
    theme: "default",
    themeColor: "#C9A84C",
    scale: 6,
    enableShadows: true,
    shadowTransparency: 0.55,
    lightIntensity: 1.15,
    offscreen: false,
  });

  readyPromise = diceBox.init().then(() => {
    window._diceBox = diceBox;
    window.dispatchEvent(new Event("dicebox-ready"));
    return diceBox;
  }).catch(error => {
    console.error("Error iniciando DiceBox:", error);
    diceBox = null;
    readyPromise = null;
    throw error;
  });

  return readyPromise;
};

const roll3D = async (formula) => {
  const box = await ensureDiceBox();
  setOverlayVisible(true);
  playClatter();

  try {
    const results = await box.roll(formula);
    setTimeout(() => {
      if (box.clear) box.clear();
      setOverlayVisible(false);
    }, 1600);
    return flattenResults(results);
  } catch (error) {
    setOverlayVisible(false);
    console.warn("Animacion DiceBox fallo:", error);
    throw error;
  }
};

window.MesaDice3D = {
  ensure: ensureDiceBox,
  roll: roll3D,
  isReady: () => !!diceBox,
};

window.roll3D = roll3D;
