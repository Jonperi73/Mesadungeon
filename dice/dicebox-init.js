import DiceBox from "https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/dice-box.es.min.js";

const diceBox = new DiceBox({
  assetPath: "./dice-box/",
  origin: window.location.origin + "/Mesadungeon",
  gravity: 1,
  mass: 1,
  friction: 0.8,
  restitution: 0,
  angularDamping: 0.4,
  linearDamping: 0.4,
  settleTimeout: 5000,
  theme: "default",
});

async function initDiceBox(){
  try{
    await diceBox.init();

    console.log("DiceBox listo");

    window._diceBox = diceBox;

    window.roll3D = async(formula)=>{
      const result = await diceBox.roll(formula);

      const values = [];

      if(result && result.rolls){
        result.rolls.forEach(r=>{
          if(typeof r.value !== "undefined"){
            values.push(r.value);
          }
        });
      }

      const total =
        typeof result.total !== "undefined"
          ? result.total
          : values.reduce((a,b)=>a+b,0);

      return {
        raw: result,
        total,
        rolls: values
      };
    };

    window.dispatchEvent(new Event("dicebox-ready"));

  }catch(err){
    console.error("Error iniciando DiceBox:", err);
  }
}

initDiceBox();
