// Character calculations
// Loaded by index.html. Keep script order unless moving to a build step.

const checkItem=(char,item)=>{
  const issues=[];
  if(item.minStr&&char.stats.str<item.minStr)issues.push(`Requiere FUE ${item.minStr}`);
  if(item.minInt&&char.stats.int<item.minInt)issues.push(`Requiere INT ${item.minInt}`);
  if(item.minLevel&&char.level<item.minLevel)issues.push(`Requiere nivel ${item.minLevel}`);
  if(item.classOnly&&!item.classOnly.includes(char.class))issues.push(`Solo para: ${item.classOnly.map(c=>(CLASSES[c]&&CLASSES[c].n)||c).join(", ")}`);
  return{ok:issues.length===0,issues};
};

const calcAC=(char)=>{
  const eq=char.equipment||{},dexMod=mod(char.stats.dex);
  let ac=10+dexMod;
  const body=ITEMS[eq.body];
  if(body)ac=body.ac+(body.acDex?Math.min(dexMod,body.maxDex!==undefined?body.maxDex:99):0);
  const off=ITEMS[eq.offhand];if(off&&off.t==="armor")ac+=off.ac||0;
  const cape=ITEMS[eq.cape];if(cape&&cape.ac)ac+=cape.ac;
  const acc=ITEMS[eq.acc];if(acc&&acc.ac)ac+=acc.ac;
  const head=ITEMS[eq.head];if(head&&head.ac)ac+=head.ac;
  if(char.class==="barbarian"&&!body)ac=10+dexMod+mod(char.stats.con);
  if(char.class==="monk"&&!body&&!eq.offhand)ac=10+dexMod+mod(char.stats.wis);
  return ac;
};

const calcBonuses=(char)=>{
  const eq=char.equipment||{},bonuses={};
  Object.values(eq).forEach(eid=>{const it=ITEMS[eid];if(it&&it.bonus)Object.entries(it.bonus).forEach(([k,v])=>{bonuses[k]=(bonuses[k]||0)+v;});});
  return bonuses;
};

const genId=(n=8)=>Math.random().toString(36).substring(2,2+n).toUpperCase();

// ─── LINEAGE 2 CHARACTER SVG ─────────────────────────────────
