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
});

async function initDiceBox(){

  try{

    await diceBox.init();

    console.log("DiceBox listo");

    window._diceBox = diceBox;

    window.roll3D = async(formula)=>{

      const result = await diceBox.roll(formula,{
        target: document.getElementById("dice-box")
      });

      console.log("RESULTADO DICEBOX:",result);

      let rolls = [];
      let total = 0;

      if(Array.isArray(result)){

        rolls = result.map(r=>r.value || 0);

        total = rolls.reduce((a,b)=>a+b,0);

      }else if(result){

        if(result.rolls){
          rolls = result.rolls.map(r=>r.value || 0);
        }

        total =
          result.total ||
          rolls.reduce((a,b)=>a+b,0);
      }

      return {
        raw: result,
        total,
        rolls
      };
    };

    window.dispatchEvent(new Event("dicebox-ready"));

  }catch(err){

    console.error("Error iniciando DiceBox:", err);

  }
}

initDiceBox();
