// Inventory, equipment and item helpers
// Loaded by index.html. Keep script order unless moving to a build step.

const ITEMS = {
  longsword:{id:"longsword",n:"Espada Larga",e:"⚔️",t:"weapon",slot:"mainhand",dmg:"1d8",dt:"tajo",w:3,minStr:10,val:15,rar:"c",desc:"Hoja larga de filo doble."},
  shortsword:{id:"shortsword",n:"Espada Corta",e:"🗡️",t:"weapon",slot:"mainhand",dmg:"1d6",dt:"perforante",w:2,val:10,rar:"c",desc:"Ágil y veloz, favorita de pícaros."},
  staff:{id:"staff",n:"Bastón Arcano",e:"🪄",t:"weapon",slot:"mainhand",dmg:"1d6",dt:"contundente",w:4,minInt:8,val:5,rar:"c",desc:"Imbuido de energía arcana."},
  dagger:{id:"dagger",n:"Daga",e:"🔪",t:"weapon",slot:"mainhand",dmg:"1d4",dt:"perforante",w:1,val:2,rar:"c",desc:"Pequeña pero letal."},
  greataxe:{id:"greataxe",n:"Hacha Grande",e:"🪓",t:"weapon",slot:"mainhand",dmg:"1d12",dt:"tajo",w:7,minStr:15,val:30,rar:"c",desc:"Devastadora."},
  longbow:{id:"longbow",n:"Arco Largo",e:"🏹",t:"weapon",slot:"mainhand",dmg:"1d8",dt:"perforante",w:2,ranged:true,val:50,rar:"c",desc:"Alcance 150/600ft."},
  handaxe:{id:"handaxe",n:"Hacha de Mano",e:"🪃",t:"weapon",slot:"mainhand",dmg:"1d6",dt:"tajo",w:2,val:5,rar:"c",desc:"Ligera, puede lanzarse."},
  mace:{id:"mace",n:"Maza",e:"🔨",t:"weapon",slot:"mainhand",dmg:"1d6",dt:"contundente",w:4,val:5,rar:"c",desc:"Efectiva contra no-muertos."},
  quarterstaff:{id:"quarterstaff",n:"Bastón",e:"🪵",t:"weapon",slot:"mainhand",dmg:"1d6",dt:"contundente",w:4,val:2,rar:"c",desc:"Simple y versátil."},
  flamesword:{id:"flamesword",n:"Espada Llameante",e:"🔥",t:"weapon",slot:"mainhand",dmg:"1d8+1d6",dt:"fuego",w:3,minStr:12,minLevel:5,val:800,rar:"r",magical:true,desc:"+1d6 daño de fuego.",bonus:{str:0}},
  katana:{id:"katana",n:"Katana Lunar",e:"🌙",t:"weapon",slot:"mainhand",dmg:"1d8",dt:"tajo",w:2,val:25,rar:"u",desc:"Hoja curva de duelo."},
  chainmail:{id:"chainmail",n:"Cota de Malla",e:"🛡️",t:"armor",slot:"body",ac:16,w:55,minStr:13,val:75,rar:"c",stealthDisadv:true,desc:"Anillos metálicos entrelazados."},
  leather:{id:"leather",n:"Armadura Cuero",e:"🥋",t:"armor",slot:"body",ac:11,acDex:true,w:10,val:10,rar:"c",desc:"Ligera y silenciosa."},
  robes:{id:"robes",n:"Túnica de Mago",e:"👘",t:"armor",slot:"body",ac:11,acDex:true,w:4,val:10,rar:"c",desc:"Protección arcana."},
  platemail:{id:"platemail",n:"Armadura Placas",e:"🦺",t:"armor",slot:"body",ac:18,w:65,minStr:15,val:1500,rar:"u",stealthDisadv:true,desc:"Protección máxima."},
  scalemail:{id:"scalemail",n:"Armadura Escamas",e:"🐍",t:"armor",slot:"body",ac:14,acDex:true,maxDex:2,w:45,minStr:11,val:50,rar:"c",desc:"Escamas de metal."},
  shield:{id:"shield",n:"Escudo",e:"🛡",t:"armor",slot:"offhand",ac:2,w:6,val:10,rar:"c",desc:"Madera con refuerzo de acero."},
  towershield:{id:"towershield",n:"Escudo Torre",e:"🏰",t:"armor",slot:"offhand",ac:3,w:15,minStr:14,val:30,rar:"c",desc:"Gran protección, pesado."},
  cloak:{id:"cloak",n:"Capa del Viajero",e:"🧥",t:"armor",slot:"cape",w:1,val:5,rar:"c",desc:"Lana gruesa para el viaje."},
  redscarf:{id:"redscarf",n:"Bufanda Escarlata",e:"🧣",t:"armor",slot:"cape",w:0.3,val:8,rar:"c",desc:"Flamea al correr."},
  cloakprotection:{id:"cloakprotection",n:"Capa Protección",e:"✨",t:"armor",slot:"cape",ac:1,w:1,val:500,rar:"u",magical:true,saveMod:1,desc:"+1 CA y salvaciones."},
  elvishcloak:{id:"elvishcloak",n:"Capa Élfica",e:"🌿",t:"armor",slot:"cape",w:0.5,val:400,rar:"u",magical:true,bonus:{dex:1},desc:"Ventaja en Sigilo."},
  helm:{id:"helm",n:"Yelmo de Hierro",e:"⛑️",t:"armor",slot:"head",w:3,val:10,rar:"c",desc:"Protección básica."},
  adventurerhood:{id:"adventurerhood",n:"Capucha Aventurero",e:"🪖",t:"armor",slot:"head",w:0.5,val:8,rar:"c",desc:"Aire misterioso y viajero."},
  hairribbon:{id:"hairribbon",n:"Lazo Heroico",e:"🎀",t:"armor",slot:"head",w:0.1,val:4,rar:"c",desc:"Energía protagonista."},
  wizardhat:{id:"wizardhat",n:"Sombrero de Mago",e:"🎩",t:"armor",slot:"head",w:0.5,val:50,rar:"u",magical:true,bonus:{int:1},classOnly:["wizard","sorcerer","warlock"],desc:"+1 INT."},
  crownvalor:{id:"crownvalor",n:"Corona del Valor",e:"👑",t:"armor",slot:"head",w:0.8,val:800,rar:"r",magical:true,bonus:{cha:2},desc:"+2 CAR. Presencia imponente.",minLevel:5},
  spellbook:{id:"spellbook",n:"Grimorio",e:"📖",t:"acc",slot:"acc",val:50,rar:"u",classOnly:["wizard","warlock"],desc:"Fórmulas arcanas."},
  mooncharm:{id:"mooncharm",n:"Amuleto Lunar",e:"🌙",t:"acc",slot:"acc",val:20,rar:"c",desc:"Colgante plateado."},
  amuletHealth:{id:"amuletHealth",n:"Amuleto Salud",e:"💚",t:"acc",slot:"acc",val:500,rar:"u",magical:true,bonus:{con:2},desc:"+2 CON."},
  ringProtection:{id:"ringProtection",n:"Anillo Protección",e:"💍",t:"acc",slot:"acc",val:750,rar:"r",magical:true,ac:1,saveMod:1,desc:"+1 CA y salvaciones."},
  healingpotion:{id:"healingpotion",n:"Poción Curativa",e:"🧪",t:"consumable",val:50,rar:"c",w:0.5,desc:"Al beberla recupera 2d4 + 2 puntos de golpe."},
  greaterhealingpotion:{id:"greaterhealingpotion",n:"Poción Curativa Mayor",e:"🧴",t:"consumable",val:150,rar:"u",w:0.5,desc:"Una versión reforzada para emergencias serias."},
  antitoxin:{id:"antitoxin",n:"Antitoxina",e:"🧬",t:"consumable",val:50,rar:"c",w:0.5,desc:"Ayuda a resistir venenos y toxinas."},
  rations:{id:"rations",n:"Raciones de Viaje",e:"🥖",t:"misc",val:1,rar:"c",w:2,desc:"Comida seca para seguir la aventura."},
  rope:{id:"rope",n:"Cuerda de Cáñamo",e:"🪢",t:"misc",val:1,rar:"c",w:10,desc:"50 pies de cuerda resistente."},
};
const CLASS_ITEMS={fighter:["longsword","chainmail","shield"],wizard:["staff","robes","spellbook"],rogue:["shortsword","dagger","leather"],cleric:["mace","chainmail","shield"],barbarian:["greataxe","leather"],bard:["shortsword","leather"],druid:["quarterstaff","leather","cloak"],paladin:["longsword","chainmail","shield"],ranger:["longbow","leather","handaxe"],sorcerer:["dagger","robes"],warlock:["dagger","robes","spellbook"],monk:["quarterstaff"]};
const STYLE_LOADOUTS={all:["cloak","redscarf","mooncharm"],fighter:["katana","helm","handaxe"],wizard:["dagger","adventurerhood","wizardhat"],rogue:["katana","hairribbon","cloak"],cleric:["quarterstaff","helm","mooncharm"],barbarian:["handaxe","katana","adventurerhood"],bard:["dagger","hairribbon","redscarf"],druid:["dagger","adventurerhood","mooncharm"],paladin:["katana","helm","cloak"],ranger:["shortsword","adventurerhood","redscarf"],sorcerer:["staff","hairribbon","wizardhat"],warlock:["staff","adventurerhood","wizardhat"],monk:["dagger","hairribbon","redscarf"]};

const buildStarterLoadout=(cls)=>{
  const equipment={},owned=[],seen=new Set();
  const add=(id)=>{if(!ITEMS[id]||seen.has(id))return;seen.add(id);owned.push(id);};
  (CLASS_ITEMS[cls]||[]).forEach(id=>{const it=ITEMS[id];if(!it)return;if(!equipment[it.slot])equipment[it.slot]=id;add(id);});
  [...(STYLE_LOADOUTS.all||[]),...(STYLE_LOADOUTS[cls]||[])].forEach(add);
  return{equipment,inventory:owned};
};

const COIN_TYPES=[
  {type:"gold",icon:"🪙",label:"Oro",color:"#C9A84C"},
  {type:"silver",icon:"🥈",label:"Plata",color:"#A8A8B8"},
  {type:"copper",icon:"🟤",label:"Cobre",color:"#B87040"},
];
const EQUIP_SLOTS=new Set(["head","mainhand","body","offhand","cape","acc"]);
const SLOT_LABELS={head:"Cabeza",mainhand:"Mano principal",body:"Cuerpo",offhand:"Mano secundaria",cape:"Capa",acc:"Accesorio"};
const ITEM_TYPE_LABELS={weapon:"Arma",armor:"Armadura",acc:"Accesorio",consumable:"Consumible",misc:"Objeto"};
const EMPTY_WALLET={gold:0,silver:0,copper:0};
const canEquipItem=item=>!!item&&item.slot&&EQUIP_SLOTS.has(item.slot);
const getItemTypeLabel=item=>ITEM_TYPE_LABELS[item&&item.t]||"Objeto";
const getItemMetaLabel=item=>canEquipItem(item)?(SLOT_LABELS[item.slot]||item.slot):getItemTypeLabel(item);
const normalizeWallet=wallet=>({...EMPTY_WALLET,...(wallet||{})});
const normalizeCharacter=char=>char?{
  ...char,
  equipment:{...(char.equipment||{})},
  inventory:[...(char.inventory||[])],
  wallet:normalizeWallet(char.wallet),
  appearance:{...(char.appearance||{})},
  stats:{...(char.stats||{})},
  currentHP:char.currentHP??char.maxHP??10,
  maxHP:char.maxHP??10,
  ac:char.ac??10,
  level:char.level??1,
  name:char.name||"Aventurero",
  race:char.race||"human",
  class:char.class||"fighter",
}:char;
