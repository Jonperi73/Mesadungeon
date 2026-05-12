// Character sheet summary
// Loaded by index.html. Keep script order unless moving to a build step.

const CharSheet = ({ char, onUpdateHP }) => {
  const [hpDelta,setHpDelta]=useState("");
  const [slots,setSlots]=useState(null);
  useEffect(()=>{
    if(char&&CLASSES[char.class]&&caster&&char.level<=5){
      const SPELL_SLOTS={1:[2,0,0,0,0],2:[3,0,0,0,0],3:[4,2,0,0,0],4:[4,3,0,0,0],5:[4,3,2,0,0]};
      setSlots(SPELL_SLOTS[char.level]||null);
    }
  },[char]);
  if(!char)return<div style={{color:"var(--muted)",fontStyle:"italic",padding:16,fontSize:14}}>No hay personaje.</div>;
  const race=RACES[char.race],cls=CLASSES[char.class];
  const prof=profBonus(char.level),bonuses=calcBonuses(char),ac=calcAC(char);
  const hpPct=(char.currentHP/char.maxHP)*100,hpColor=hpPct>60?"#4CAF50":hpPct>25?"#FFC107":"#E24B4A";
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"Cinzel,serif",fontSize:16,color:"var(--gold)"}}>{char.name}</div>
        <div style={{fontSize:12,color:"var(--muted)"}}>{race&&race.n} {cls&&cls.n} · Nv{char.level}</div>
      </div>
      <div className="card" style={{padding:10}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontFamily:"Cinzel,serif",fontSize:10,color:"var(--muted)"}}>HP</span>
          <span style={{fontFamily:"Cinzel,serif",fontSize:13,color:hpColor,fontWeight:700}}>{char.currentHP}/{char.maxHP}</span>
        </div>
        <div className="hp-bar"><div className="hp-fill" style={{width:`${hpPct}%`,background:hpColor}}/></div>
        <div style={{display:"flex",gap:5,marginTop:7}}>
          <input className="inp" placeholder="±HP" value={hpDelta} onChange={e=>setHpDelta(e.target.value)} style={{fontSize:13}}
            onKeyDown={e=>e.key==="Enter"&&hpDelta&&(onUpdateHP(char.currentHP+parseInt(hpDelta)||0),setHpDelta(""))}/>
          <button className="btn btn-sm btn-r" onClick={()=>hpDelta&&(onUpdateHP(char.currentHP+parseInt(hpDelta)||0),setHpDelta(""))}>OK</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>
        {[["CA",ac],["Prof",`+${prof}`],["Vel",`${race&&spd}ft`]].map(([l,v])=>(
          <div key={l} className="stat-b">
            <div style={{fontSize:9,color:"var(--muted)",fontFamily:"Cinzel,serif"}}>{l}</div>
            <div style={{fontFamily:"Cinzel,serif",fontSize:16,fontWeight:700,color:"var(--gold)"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>
        {STATS.map(s=>{const base=char.stats[s],bonus=bonuses[s]||0,total=base+bonus;return(
          <div key={s} className="stat-b">
            <div style={{fontSize:9,color:"var(--muted)",fontFamily:"Cinzel,serif"}}>{STAT_N[s]}</div>
            <div style={{fontFamily:"Cinzel,serif",fontSize:16,fontWeight:700,color:bonus>0?"var(--gold)":"var(--text)"}}>{total}{bonus>0&&<span style={{fontSize:9,color:"#5cb85c"}}>+{bonus}</span>}</div>
            <div style={{fontSize:11,color:"var(--muted)"}}>{modStr(total)}</div>
          </div>
        );})}
      </div>
      {cls&&caster&&slots&&<div className="card" style={{padding:10}}>
        <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:"var(--muted)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>Espacios de Hechizo</div>
        {slots.map((total,i)=>total>0&&<div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
          <span style={{fontSize:11,color:"var(--muted)",width:36}}>Nv.{i+1}</span>
          {Array.from({length:total},(_,j)=><span key={j} className="spell-slot avail">◆</span>)}
        </div>)}
      </div>}
      <div className="card" style={{padding:10}}>
        <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:"var(--muted)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:5}}>Rasgos</div>
        {race&&traits.map(t=><div key={t} style={{fontSize:12,padding:"1px 0"}}>◈ {t}</div>)}
      </div>
    </div>
  );
};

// ─── GAME ROOM ────────────────────────────────────────────────
