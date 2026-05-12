// Races, classes and D&D data
// Loaded by index.html. Keep script order unless moving to a build step.

const RACES = {
  human:{n:"Humano",e:"👤",spd:30,sz:"Med",bonus:{str:1,dex:1,con:1,int:1,wis:1,cha:1},traits:["Versátil (+1 todos stats)","Habilidad extra"],desc:"Adaptables y ambiciosos."},
  elf:{n:"Elfo",e:"🧝",spd:30,sz:"Med",bonus:{dex:2,int:1},traits:["Visión penumbra 60ft","Sentidos agudizados","Trance (4h)"],desc:"Gracia y magia milenaria."},
  dwarf:{n:"Enano",e:"⛏️",spd:25,sz:"Med",bonus:{con:2,wis:1},traits:["Visión penumbra 60ft","Resistencia veneno","Comp. herramientas"],desc:"Valientes, forjados en las profundidades."},
  halfling:{n:"Mediano",e:"🍀",spd:25,sz:"Peq",bonus:{dex:2,cha:1},traits:["Afortunado (reroll 1s)","Valentía vs miedo"],desc:"Suerte extraordinaria."},
  gnome:{n:"Gnomo",e:"🔮",spd:25,sz:"Peq",bonus:{int:2,con:1},traits:["Visión penumbra","Astucia gnómica","Ilusión menor"],desc:"Inventores curiosos."},
  halforc:{n:"Semiorco",e:"💀",spd:30,sz:"Med",bonus:{str:2,con:1},traits:["Visión penumbra","Amenazador","Resistencia implacable"],desc:"Fuerza bruta incomparable."},
  tiefling:{n:"Tiefling",e:"😈",spd:30,sz:"Med",bonus:{int:1,cha:2},traits:["Resistencia fuego","Oscuridad nv3","Llama infernal nv5"],desc:"Linaje infernal."},
  dragonborn:{n:"Dracónido",e:"🐉",spd:30,sz:"Med",bonus:{str:2,cha:1},traits:["Ascendencia dracónica","Aliento 2d6","Resistencia ancestral"],desc:"Poder de los dragones."},
};
const CLASSES = {
  fighter:{n:"Guerrero",e:"⚔️",hd:10,pstat:"str",saves:["str","con"],caster:false,armorProf:"Todas",desc:"Maestro del combate.",features:["Segunda oportunidad (2/desc.)","Estilo de combate","Habilidades adicionales"]},
  wizard:{n:"Mago",e:"🧙",hd:6,pstat:"int",saves:["int","wis"],caster:true,spellStat:"int",armorProf:"Ninguna",desc:"Domina la magia arcana.",features:["Recuperar hechizos arcanos","Tradición arcana","Dominar hechizo"]},
  rogue:{n:"Pícaro",e:"🗡️",hd:8,pstat:"dex",saves:["dex","int"],caster:false,armorProf:"Ligera",desc:"Sigilo y ataque preciso.",features:["Experto (doble prof.)","Ataque furtivo","Acción astuciosa"]},
  cleric:{n:"Clérigo",e:"✝️",hd:8,pstat:"wis",saves:["wis","cha"],caster:true,spellStat:"wis",armorProf:"Ligera+media",desc:"Poder divino.",features:["Dominio divino","Canalizar divinidad","Intervención divina nv10"]},
  barbarian:{n:"Bárbaro",e:"🪓",hd:12,pstat:"str",saves:["str","con"],caster:false,armorProf:"Ligera+media",desc:"Furia devastadora.",features:["Furia (2/desc.largo)","Defensa sin armadura","Sentido del peligro"]},
  bard:{n:"Bardo",e:"🎵",hd:8,pstat:"cha",saves:["dex","cha"],caster:true,spellStat:"cha",armorProf:"Ligera",desc:"Magia del arte.",features:["Inspiración bárdica","Jack of All Trades","Secretos bárdicos"]},
  druid:{n:"Druida",e:"🌿",hd:8,pstat:"wis",saves:["int","wis"],caster:true,spellStat:"wis",armorProf:"Ligera+media",desc:"Guardián de la naturaleza.",features:["Forma salvaje (2/desc.)","Círculo druídico","Recuperación natural"]},
  paladin:{n:"Paladín",e:"⚜️",hd:10,pstat:"cha",saves:["wis","cha"],caster:true,spellStat:"cha",armorProf:"Todas",desc:"Guerrero sagrado.",features:["Imposición de manos","Sentido divino","Aura de protección nv6"]},
  ranger:{n:"Guardabosques",e:"🏹",hd:10,pstat:"dex",saves:["str","dex"],caster:true,spellStat:"wis",armorProf:"Ligera+media",desc:"Explorador y cazador.",features:["Enemigo predilecto","Explorador natural","Compañero animal nv3"]},
  sorcerer:{n:"Hechicero",e:"✨",hd:6,pstat:"cha",saves:["con","cha"],caster:true,spellStat:"cha",armorProf:"Ninguna",desc:"Magia innata.",features:["Origen de hechicero","Puntos de hechicería","Metamagia"]},
  warlock:{n:"Brujo",e:"🌑",hd:8,pstat:"cha",saves:["wis","cha"],caster:true,spellStat:"cha",armorProf:"Ligera",desc:"Pacto con entidades.",features:["Patrón sobrenatural","Invocaciones espectrales","Magia de pacto"]},
  monk:{n:"Monje",e:"☯️",hd:8,pstat:"dex",saves:["str","dex"],caster:false,armorProf:"Ninguna",desc:"Artes marciales y ki.",features:["Artes marciales","Defensa sin armadura","Puntos ki nv2"]},
};
const STATS=["str","dex","con","int","wis","cha"];
const STAT_N={str:"FUE",dex:"DES",con:"CON",int:"INT",wis:"SAB",cha:"CAR"};
const STANDARD=[15,14,13,12,10,8];
const mod=s=>Math.floor((s-10)/2);
const modStr=s=>{const m=mod(s);return m>=0?`+${m}`:`${m}`;};
const profBonus=lv=>Math.ceil(lv/4)+1;
const maxHP=(cls,lv,con)=>{const hd=(CLASSES[cls]&&CLASSES[cls].hd)||8;return hd+mod(con)+(lv-1)*(Math.floor(hd/2)+1+mod(con));};
