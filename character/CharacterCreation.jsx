// Character creation flow
// Loaded by index.html. Keep script order unless moving to a build step.

const CharacterCreation = ({ onComplete, playerName }) => {
  const [step,setStep]=useState(0);
  const [name,setName]=useState(playerName||"");
  const [race,setRace]=useState(null);
  const [bodyType,setBodyType]=useState("male");
  const [cls,setCls]=useState(null);
  const [stats,setStats]=useState({str:15,dex:14,con:13,int:12,wis:10,cha:8});
  const [assigns,setAssigns]=useState({});
  const [pool]=useState([...STANDARD]);
  const [used,setUsed]=useState([]);
  const [statMethod,setStatMethod]=useState(null);
  const [rolledPool,setRolledPool]=useState([]);
  const [rolling,setRolling]=useState(false);
  const [rollsLeft, setRollsLeft] = useState(3);
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem("tutorial_char_done"));

  const rollAllStats=()=>{
  if(rollsLeft<=0)return;
  setRolling(true);
  setTimeout(()=>{
    const rolled=Array.from({length:6},()=>{
      const dice=Array.from({length:4},()=>Math.floor(Math.random()*6)+1);
      dice.sort((a,b)=>a-b);
      return dice.slice(1).reduce((a,b)=>a+b,0);
    }).sort((a,b)=>b-a);
    setRolledPool(rolled);
    setRolling(false);
    setRollsLeft(r=>r-1);
  },800);
};

const assignStat=(stat,idx)=>{
  if(used.includes(idx)&&assigns[stat]!==idx)return;
  const activePool=statMethod==="roll"?rolledPool:pool;
  const na={...assigns},nu=used.filter(u=>u!==assigns[stat]);
  na[stat]=idx;nu.push(idx);setAssigns(na);setUsed(nu);
  const ns={...stats};Object.entries(na).forEach(([s,i])=>{ns[s]=activePool[i];});setStats(ns);
};

  const finalize=()=>{
    if(!name.trim()||!race||!cls)return;
    const raceBonus=RACES[race].bonus,finalStats={...stats};
    Object.entries(raceBonus).forEach(([s,v])=>{finalStats[s]=(finalStats[s]||10)+v;});
    const level=1,hp=maxHP(cls,level,finalStats.con);
    const{equipment,inventory}=buildStarterLoadout(cls);
    const char={name:name.trim(),race,class:cls,level,stats:finalStats,currentHP:hp,maxHP:hp,ac:0,equipment,inventory,appearance:{bodyType},wallet:{gold:10,silver:5,copper:20}};
    char.ac=calcAC(char);
    onComplete(char);
  };

  const steps=["Raza","Clase","Atributos","Resumen"];
  const starterLoadout=cls?buildStarterLoadout(cls):{equipment:{},inventory:[]};
  const preview=race&&cls?{race,class:cls,stats,equipment:starterLoadout.equipment,appearance:{bodyType}}:null;

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{CSS}</style>
      {showTutorial && <Tutorial
  steps={TUTORIAL_STEPS_CHAR}
  onClose={()=>{setShowTutorial(false);localStorage.setItem("tutorial_char_done","1");}}
/>}
      {/* Progress */}
      <div style={{display:"flex",gap:0,marginBottom:28,background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:3,padding:2}}>
        {steps.map((s,i)=>(
          <div key={i} style={{padding:"6px 14px",fontFamily:"Cinzel,serif",fontSize:11,letterSpacing:".08em",textTransform:"uppercase",
            background:i===step?"rgba(201,168,76,.18)":"transparent",color:i===step?"var(--gold)":i<step?"#5cb85c":"var(--muted)",
            borderRight:i<steps.length-1?"1px solid var(--border)":"none",cursor:i<step?"pointer":"default"}}
            onClick={()=>i<step&&setStep(i)}>{i<step?"✓ ":""}{s}</div>
        ))}
      </div>
      <div style={{width:"100%",maxWidth:760}}>
        {/* STEP 0 */}
        {step===0&&<div>
          <h2 style={{fontFamily:"Cinzel,serif",color:"var(--gold)",textAlign:"center",marginBottom:20,fontSize:22}}>Nombre y Raza</h2>
          <input className="inp" placeholder="Nombre del personaje..." value={name} onChange={e=>setName(e.target.value)} style={{marginBottom:16,fontSize:17,textAlign:"center"}}/>
          <div style={{display:"flex",gap:8,marginBottom:16,justifyContent:"center"}}>
            {[{id:"male",label:"⚔ Varón"},{id:"female",label:"✨ Mujer"}].map(opt=>(
              <button key={opt.id} className={`btn${bodyType===opt.id?" btn-g":""}`} onClick={()=>setBodyType(opt.id)}>{opt.label}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:8}}>
            {Object.entries(RACES).map(([id,r])=>(
              <div key={id} className={`rc${race===id?" sel":""}`} onClick={()=>setRace(id)}>
                <div style={{fontSize:22,marginBottom:4}}>{r.e}</div>
                <div style={{fontFamily:"Cinzel,serif",fontSize:13,color:"var(--gold)",marginBottom:2}}>{r.n}</div>
                <div style={{fontSize:11,color:"var(--muted)",marginBottom:5,lineHeight:1.4}}>{r.desc}</div>
                <div style={{fontSize:10,color:"#5cb85c"}}>{Object.entries(r.bonus).map(([s,v])=>`${STAT_N[s]} +${v}`).join(" · ")}</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:18}}>
            <button className="btn btn-r" disabled={!name.trim()||!race} onClick={()=>setStep(1)} style={{padding:"11px 40px",fontSize:14}}>Continuar →</button>
          </div>
        </div>}

        {/* STEP 1 */}
        {step===1&&<div>
          <h2 style={{fontFamily:"Cinzel,serif",color:"var(--gold)",textAlign:"center",marginBottom:20,fontSize:22}}>Elige tu Clase</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:8}}>
            {Object.entries(CLASSES).map(([id,c])=>(
              <div key={id} className={`rc${cls===id?" sel":""}`} onClick={()=>setCls(id)}>
                <div style={{fontSize:20,marginBottom:3}}>{c.e}</div>
                <div style={{fontFamily:"Cinzel,serif",fontSize:13,color:"var(--gold)",marginBottom:2}}>{c.n}</div>
                <div style={{fontSize:11,color:"var(--muted)",marginBottom:4,lineHeight:1.4}}>{c.desc}</div>
                <div style={{fontSize:10,color:"var(--muted)"}}>d{c.hd} · {c.armorProf}</div>
                {c.caster&&<div style={{fontSize:10,color:"#7BAED4",marginTop:2}}>✦ Lanzador</div>}
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:18,display:"flex",gap:10,justifyContent:"center"}}>
            <button className="btn" onClick={()=>setStep(0)}>← Volver</button>
            <button className="btn btn-r" disabled={!cls} onClick={()=>setStep(2)} style={{padding:"11px 40px",fontSize:14}}>Continuar →</button>
          </div>
        </div>}

        {/* STEP 2 */}
       {step===2&&<div>
  <h2 style={{fontFamily:"Cinzel,serif",color:"var(--gold)",textAlign:"center",marginBottom:20,fontSize:22}}>Atributos</h2>

  {/* Elección de método */}
  {!statMethod&&<div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:24,flexWrap:"wrap"}}>
    <div className="card" style={{padding:20,textAlign:"center",cursor:"pointer",maxWidth:220}}
      onClick={()=>setStatMethod("standard")}>
      <div style={{fontSize:28,marginBottom:8}}>📋</div>
      <div style={{fontFamily:"Cinzel,serif",fontSize:14,color:"var(--gold)",marginBottom:6}}>Array Estándar</div>
      <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5}}>Valores fijos: 15, 14, 13, 12, 10, 8. Balanceado y predecible.</div>
    </div>
    <div className="card" style={{padding:20,textAlign:"center",cursor:"pointer",maxWidth:220}}
      onClick={()=>{setStatMethod("roll");rollAllStats();}}>
      <div style={{fontSize:28,marginBottom:8}}>🎲</div>
      <div style={{fontFamily:"Cinzel,serif",fontSize:14,color:"var(--gold)",marginBottom:6}}>Tirar Dados</div>
      <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5}}>4d6 descarta el menor × 6. Emocionante pero impredecible.</div>
    </div>
  </div>}

  {statMethod&&<div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
    <div style={{flex:1,minWidth:260}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <p style={{color:"var(--muted)",fontSize:13,lineHeight:1.5}}>
          {statMethod==="standard"?"Array estándar — asigná los valores a tus atributos.":"Tiraste dados (4d6 drop lowest) — asigná los resultados."}
        </p>
        <button className="btn btn-sm" onClick={()=>{setStatMethod(null);setAssigns({});setUsed([]);setRolledPool([]);setRollsLeft(3);}}>
          Cambiar método
        </button>
      </div>

      {statMethod==="roll"&&<div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        {rolling
          ? <span style={{fontSize:13,color:"var(--gold)",fontFamily:"Cinzel,serif"}}>🎲 Tirando dados...</span>
          : rolledPool.map((v,i)=>(
            <div key={i} style={{padding:"5px 11px",fontFamily:"Cinzel,serif",fontSize:15,fontWeight:700,
              background:used.includes(i)?"rgba(0,0,0,.3)":"rgba(201,168,76,.15)",
              border:`1px solid ${used.includes(i)?"var(--border)":"var(--gold)"}`,
              color:used.includes(i)?"var(--muted)":"var(--gold)",borderRadius:2,opacity:used.includes(i)?0.5:1}}>{v}</div>
          ))
        }
        {!rolling&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
          <button className="btn btn-sm" disabled={rollsLeft<=0} onClick={()=>{rollAllStats();setAssigns({});setUsed([]);}}>
            ↺ Volver a tirar
          </button>
          <span style={{fontSize:11,color:rollsLeft>0?"var(--muted)":"#E24B4A",fontFamily:"Cinzel,serif"}}>
            {rollsLeft>0?`${rollsLeft} tirada${rollsLeft>1?"s":""} restante${rollsLeft>1?"s":""}`:
            "⚠ Sin tiradas — aceptá estos valores o cambiá al array estándar"}
          </span>
        </div>}
      </div>}

      {statMethod==="standard"&&<div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>
        {STANDARD.map((v,i)=>(
          <div key={i} style={{padding:"5px 11px",fontFamily:"Cinzel,serif",fontSize:15,fontWeight:700,
            background:used.includes(i)?"rgba(0,0,0,.3)":"rgba(201,168,76,.15)",
            border:`1px solid ${used.includes(i)?"var(--border)":"var(--gold)"}`,
            color:used.includes(i)?"var(--muted)":"var(--gold)",borderRadius:2,opacity:used.includes(i)?0.5:1}}>{v}</div>
        ))}
      </div>}

      {!rolling&&<div style={{display:"flex",flexDirection:"column",gap:7}}>
        {STATS.map(s=>{
          const activePool=statMethod==="roll"?rolledPool:pool;
          const rb=(RACES[race]&&RACES[race].bonus&&RACES[race].bonus[s])||0,base=stats[s],total=base+rb;
          return(
            <div key={s} style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:36,fontFamily:"Cinzel,serif",fontSize:12,color:"var(--muted)",textTransform:"uppercase"}}>{STAT_N[s]}</div>
              <select className="sel" value={assigns[s]??""} onChange={e=>e.target.value!==""&&assignStat(s,parseInt(e.target.value))} style={{flex:1}}>
                <option value="">— elegir —</option>
                {activePool.map((v,i)=>(!used.includes(i)||assigns[s]===i)&&<option key={i} value={i}>{v}</option>)}
              </select>
              <div style={{width:70,textAlign:"right",fontFamily:"Cinzel,serif",fontSize:14,fontWeight:700,color:"var(--gold)"}}>
                {total}{rb>0&&<span style={{fontSize:10,color:"#5cb85c"}}>(+{rb})</span>}
                <span style={{fontSize:11,color:"var(--muted)",marginLeft:3}}>{modStr(total)}</span>
              </div>
            </div>
          );
        })}
      </div>}
    </div>

    {preview&&<div style={{width:150,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
      <div style={{width:120,height:160}}><CharSVG char={preview}/></div>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"Cinzel,serif",fontSize:12,color:"var(--gold)"}}>{RACES[race]&&RACES[race].n}</div>
        <div style={{fontFamily:"Cinzel,serif",fontSize:12,color:"var(--text)"}}>{CLASSES[cls]&&CLASSES[cls].n}</div>
        <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>HP est: {maxHP(cls,1,stats.con+((RACES[race]&&RACES[race].bonus&&RACES[race].bonus.con)||0))}</div>
      </div>
    </div>}
  </div>}

  <div style={{textAlign:"center",marginTop:18,display:"flex",gap:10,justifyContent:"center"}}>
    <button className="btn" onClick={()=>setStep(1)}>← Volver</button>
    <button className="btn btn-r" disabled={!statMethod||rolling||used.length<6} onClick={()=>setStep(3)} style={{padding:"11px 40px",fontSize:14}}>Ver resumen →</button>
  </div>
</div>}
        {/* STEP 3 */}
        {step===3&&<div>
          <h2 style={{fontFamily:"Cinzel,serif",color:"var(--gold)",textAlign:"center",marginBottom:20,fontSize:22}}>Resumen</h2>
          <div style={{display:"flex",gap:24,flexWrap:"wrap",justifyContent:"center"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <div style={{width:130,height:174}}>
                <CharSVG char={{name:name.trim()||"Aventurero",race,class:cls,stats,equipment:starterLoadout.equipment,appearance:{bodyType}}}/>
              </div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:16,color:"var(--gold)"}}>{name}</div>
              <div style={{color:"var(--muted)",fontSize:12}}>{RACES[race]&&RACES[race].n} {CLASSES[cls]&&CLASSES[cls].n} · Nivel 1</div>
              <div style={{display:"flex",gap:8,fontSize:12,color:"var(--muted)"}}>
                <span>💰 10 po</span><span>🥈 5 pp</span><span>🟤 20 pc</span>
              </div>
            </div>
            <div style={{flex:1,minWidth:220}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                {STATS.map(s=>{const rb=(RACES[race]&&RACES[race].bonus&&RACES[race].bonus[s])||0,total=stats[s]+rb;return(
                  <div key={s} className="stat-b">
                    <div style={{fontSize:9,color:"var(--muted)",fontFamily:"Cinzel,serif"}}>{STAT_N[s]}</div>
                    <div style={{fontFamily:"Cinzel,serif",fontSize:18,fontWeight:700,color:"var(--gold)"}}>{total}</div>
                    <div style={{fontSize:11,color:"var(--muted)"}}>{modStr(total)}</div>
                  </div>
                );})}
              </div>
              <div className="card" style={{padding:10,marginBottom:10}}>
                <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:"var(--muted)",marginBottom:5,textTransform:"uppercase"}}>Equipo inicial</div>
                {starterLoadout.inventory.map(id=>{const it=ITEMS[id];if(!it)return null;
                  const eq=starterLoadout.equipment[it.slot]===id;
                  return<span key={id} className={`badge ${eq?"badge-l":"badge-c"}`} style={{marginRight:4,marginBottom:4}}>{it.e} {it.n}</span>;
                })}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn" onClick={()=>setStep(2)}>← Volver</button>
                <button className="btn btn-r" style={{flex:1,padding:"12px",fontSize:14}} onClick={finalize}>⚔ ¡Comenzar!</button>
              </div>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
};
