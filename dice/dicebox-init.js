import DiceBox from "https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/dice-box.es.min.js";

const diceBox = new DiceBox({
  assetPath: "/Mesadungeon/dice-box/",
  origin: window.location.origin,
  gravity: 1,
  mass: 1,
  friction: 0.8,
  restitution: 0,
  angularDamping: 0.4,
  linearDamping: 0.4,
  settleTimeout: 5000,
  theme: "default",
  scale: 6,
  offscreen: false,
});

async function initDiceBox(){

  try{

    await diceBox.init();

    console.log("DiceBox listo");

    window._diceBox = diceBox;
    
    window.roll3D = async(formula)=>{

  try{

    await diceBox.roll(formula,{
      target: document.getElementById("dice-box")
    });

  }catch(e){

    console.warn("Animación DiceBox falló:",e);

  }

  return true;
};
    

    window.dispatchEvent(new Event("dicebox-ready"));

  }catch(err){

    console.error("Error iniciando DiceBox:", err);

  }
}

initDiceBox();
