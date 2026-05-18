// Dice system
// Loaded by index.html. Keep script order unless moving to a build step.
const DicePanel = ({ char, updateRoom, playerId, canRoll, isDM, diceEnabled }) => {
  const [sel,setSel]=useState(20);
  const [cnt,setCnt]=useState(1);
  const [pool,setPool]=useState([]);
  const [rolling,setRolling]=useState(false);
  const [result,setResult]=useState(null);
  const [hist,setHist]=useState([]);
  const [advMode,setAdvMode]=useState("normal");
  const [key,setKey]=useState(0);
  const [diceReady,setDiceReady]=useState(()=>!!(window.MesaDice3D&&window.MesaDice3D.isReady&&window.MesaDice3D.isReady()));

  useEffect(()=>{
    if(window.MesaDice3D&&window.MesaDice3D.isReady&&window.MesaDice3D.isReady()){
      setDiceReady(true);
      return;
    }
    const handleReady=()=>setDiceReady(true);
    window.addEventListener("dicebox-ready",handleReady);
    return()=>window.removeEventListener("dicebox-ready",handleReady);
  },[]);

  const randomRolls=(sides,count)=>Array.from(
    {length:count},
    ()=>Math.floor(Math.random()*sides)+1
  );

  const poolLabel=(dice=pool)=>dice.map(s=>`d${s}`).join(" + ");
  const poolMax=(dice=pool)=>dice.reduce((sum,s)=>sum+s,0);
  const addToPool=()=>setPool(dice=>[
    ...dice,
    ...Array.from({length:cnt},()=>sel)
  ].slice(0,12));
  const removeFromPool=(index)=>setPool(dice=>dice.filter((_,i)=>i!==index));
  const clearPool=()=>setPool([]);
  const diceShape=(sides)=>{
    const shapes={
      4:"polygon(50% 7%, 8% 88%, 92% 88%)",
      6:"polygon(12% 12%, 88% 12%, 88% 88%, 12% 88%)",
      8:"polygon(50% 4%, 92% 50%, 50% 96%, 8% 50%)",
      10:"polygon(50% 3%, 91% 32%, 76% 92%, 24% 92%, 9% 32%)",
      12:"polygon(50% 2%, 85% 15%, 98% 50%, 85% 85%, 50% 98%, 15% 85%, 2% 50%, 15% 15%)",
      20:"polygon(50% 2%, 76% 10%, 94% 31%, 94% 69%, 76% 90%, 50% 98%, 24% 90%, 6% 69%, 6% 31%, 24% 10%)",
      100:"polygon(18% 8%, 82% 8%, 96% 50%, 82% 92%, 18% 92%, 4% 50%)"
    };
    return shapes[sides]||shapes[20];
  };
  const diceButtonStyle=(sides)=>({
    width:"100%",
    minWidth:0,
    height:50,
    clipPath:diceShape(sides),
    borderRadius:0
  });

  const roll=async(sides=sel,count=cnt,label="",adv=advMode,usePool=true)=>{
    if(!canRoll||rolling)return;
    setRolling(true);

    try{
      const mixedDice=usePool&&pool.length>0?pool:[];
      const isMixed=mixedDice.length>0;
      const formula=adv==="adv"||adv==="dis"
        ?"2d20"
        :isMixed
          ?mixedDice.map(s=>({sides:s,qty:1}))
          :`${count}d${sides}`;
      let animatedRolls=[];

      if(window.MesaDice3D&&window.MesaDice3D.roll){
        try{
          animatedRolls=await window.MesaDice3D.roll(formula);
          setDiceReady(true);
        }catch(error){
          console.warn("DiceBox no pudo tirar, usando tirada simple:",error);
        }
      }

      let rolls,total,special=null;
      let notation=isMixed?poolLabel(mixedDice):`${count}d${sides}`;
      let max=isMixed?poolMax(mixedDice):sides;
      let crit=false;
      let fumble=false;

      if(isMixed){
        rolls=animatedRolls.length>=mixedDice.length
          ? animatedRolls.slice(0,mixedDice.length)
          : mixedDice.map(dieSides=>randomRolls(dieSides,1)[0]);
        total=rolls.reduce((a,b)=>a+b,0);
        label=label||notation;
        crit=mixedDice.some((dieSides,index)=>dieSides===20&&rolls[index]===20);
        fumble=mixedDice.some((dieSides,index)=>dieSides===20&&rolls[index]===1);
      }else if(adv==="adv"||adv==="dis"){
        const [r1,r2]=animatedRolls.length>=2
          ? animatedRolls.slice(0,2)
          : randomRolls(20,2);
        rolls=[r1,r2];
        total=adv==="adv"?Math.max(r1,r2):Math.min(r1,r2);
        notation="2d20";
        max=20;
        crit=total===20;
        fumble=total===1;
        special=adv==="adv"
          ? `Ventaja: [${r1},${r2}] ->`
          : `Desventaja: [${r1},${r2}] ->`;
      }else{
        rolls=animatedRolls.length>=count
          ? animatedRolls.slice(0,count)
          : randomRolls(sides,count);
        total=rolls.reduce((a,b)=>a+b,0);
        crit=sides===20&&rolls.includes(20);
        fumble=sides===20&&rolls.includes(1);
      }

      const r={sides:isMixed?"mix":sides,count:isMixed?mixedDice.length:count,rolls,total,label,special,max,notation,crit,fumble,ts:Date.now()};
      setResult(r);
      setKey(k=>k+1);
      setHist(h=>[r,...h].slice(0,12));

      if(char&&updateRoom){
        const txt=special
          ? `🎲 ${special} **${total}**${label?` (${label})`:""}${crit?" **✦ CRITICO NATURAL**":fumble?" **PIFIA NATURAL**":""}`
          : `🎲 Tiro ${notation}${label?` (${label})`:""}: [${rolls.join(",")}] = **${total}**${crit?" **✦ CRITICO NATURAL**":fumble?" **PIFIA NATURAL**":""}`;

        await updateRoom(d=>({
          ...d,
          messages:[
            ...(d.messages||[]),
            {id:Date.now(),t:"roll",text:txt,senderName:char.name,ts:Date.now()}
          ]
        }));
      }
    }finally{
      setRolling(false);
    }
  };

  const getColor=(total,max)=>{
    const p=total/(Number.isFinite(max)&&max>0?max:20);
    return p>0.8
      ? "#C9A84C"
      : p>0.5
      ? "#5BA3E0"
      : p<0.25
      ? "#E24B4A"
      : "#F0E6D3";
  };

  const primaryStat=(char&&CLASSES[char.class]&&CLASSES[char.class].pstat)||"str";
  const quickRolls=char?[
    {label:"Iniciativa",fn:()=>roll(20,1,"Iniciativa","normal",false)},
    {label:"Ataque",fn:()=>roll(20,1,`Ataque +${mod(char.stats[primaryStat])+profBonus(char.level)}`,"normal",false)},
    {label:"Percepcion",fn:()=>roll(20,1,`Percep ${modStr(char.stats.wis)}`,"normal",false)},
    {label:"Sigilo",fn:()=>roll(20,1,`Sigilo ${modStr(char.stats.dex)}`,"normal",false)},
  ]:[];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {!isDM&&!canRoll&&
        <div className="card" style={{padding:12,fontSize:13,lineHeight:1.5,color:"var(--muted)"}}>
          El DM todavia no habilito las tiradas para los jugadores.
        </div>
      }

      <div className="card" style={{padding:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
        <span style={{fontSize:11,color:"var(--muted)",fontFamily:"Cinzel,serif",letterSpacing:".08em",textTransform:"uppercase"}}>
          Dados sobre pantalla
        </span>
        <span style={{fontSize:11,color:diceReady?"var(--gold)":"var(--muted)"}}>
          {diceReady?"3D listo":"3D al tirar"}
        </span>
      </div>

      {!isDM&&canRoll&&diceEnabled&&
        <div style={{fontSize:11,color:"var(--gold)",fontFamily:"Cinzel,serif",letterSpacing:".08em",textTransform:"uppercase"}}>
          Tiradas habilitadas por el DM
        </div>
      }

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:6}}>
        {[4,6,8,10,12,20,100].map(d=>
          <button
            key={d}
            className={`dice-btn${sel===d?" sel":""}`}
            onClick={()=>setSel(d)}
            disabled={!canRoll||rolling}
            style={diceButtonStyle(d)}
          >
            d{d}
          </button>
        )}
      </div>

      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <span style={{fontSize:12,color:"var(--muted)",fontFamily:"Cinzel,serif"}}>Cant:</span>
        {[1,2,3,4].map(n=>
          <button
            key={n}
            className={`btn btn-sm${cnt===n?" btn-g":""}`}
            onClick={()=>setCnt(n)}
            disabled={!canRoll||rolling}
          >
            {n}
          </button>
        )}
      </div>

      <div style={{display:"flex",gap:6}}>
        <button
          className="btn btn-sm"
          onClick={addToPool}
          disabled={!canRoll||rolling}
          style={{flex:1,fontSize:10}}
        >
          Agregar {cnt>1?`${cnt}d${sel}`:`d${sel}`}
        </button>
        <button
          className="btn btn-sm"
          onClick={clearPool}
          disabled={!pool.length||rolling}
          style={{fontSize:10}}
        >
          Limpiar
        </button>
      </div>

      {pool.length>0&&
        <div className="card" style={{padding:9}}>
          <div style={{fontSize:10,color:"var(--muted)",fontFamily:"Cinzel,serif",letterSpacing:".08em",textTransform:"uppercase",marginBottom:7}}>
            Tirada armada
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {pool.map((s,i)=>(
              <button
                key={`${s}-${i}`}
                className="btn btn-sm"
                onClick={()=>removeFromPool(i)}
                disabled={rolling}
                style={{padding:"4px 8px",fontSize:10,color:"var(--gold)"}}
                title="Quitar dado"
              >
                d{s}
              </button>
            ))}
          </div>
        </div>
      }

      {sel===20&&pool.length===0&&
        <div style={{display:"flex",gap:4}}>
          {[["normal","Normal"],["adv","Ventaja"],["dis","Desventaja"]].map(([v,l])=>(
            <button
              key={v}
              className={`btn btn-sm${advMode===v?" btn-g":""}`}
              onClick={()=>setAdvMode(v)}
              style={{flex:1,fontSize:10}}
              disabled={!canRoll||rolling}
            >
              {l}
            </button>
          ))}
        </div>
      }

      <button
        className="btn btn-r"
        onClick={()=>roll()}
        disabled={!canRoll||rolling}
        style={{width:"100%",padding:"11px",fontSize:13}}
      >
        {rolling
          ? "Tirando..."
          : "Tirar "+`${pool.length?poolLabel():cnt>1?cnt+"d"+sel:"d"+sel}`
        }
      </button>

      {result&&
        <div
          key={key}
          className="card"
          style={{
            padding:14,
            textAlign:"center",
            borderColor:result.crit?"#C9A84C":result.fumble?"#E24B4A":"var(--border)",
            background:result.crit
              ?"linear-gradient(180deg, rgba(201,168,76,.18), var(--bg1))"
              :result.fumble
                ?"linear-gradient(180deg, rgba(139,26,26,.28), var(--bg1))"
                :"var(--bg1)",
            boxShadow:result.crit
              ?"0 0 22px rgba(201,168,76,.22)"
              :result.fumble
                ?"0 0 18px rgba(226,75,74,.18)"
                :"none"
          }}
        >
          <div style={{fontSize:11,color:"var(--muted)",fontFamily:"Cinzel,serif",marginBottom:3}}>
            {result.special||`${result.notation} -> [${result.rolls.join(", ")}]`}
          </div>

          <div
            className="roll-a"
            style={{fontSize:46,fontFamily:"Cinzel,serif",fontWeight:700,color:getColor(result.total,result.max),lineHeight:1}}
          >
            {result.total}
          </div>

          {result.label&&
            <div style={{fontSize:11,color:"var(--muted)",marginTop:3}}>
              {result.label}
            </div>
          }

          {result.crit&&
            <div style={{
              color:"#FFE08A",
              fontFamily:"Cinzel,serif",
              fontSize:13,
              marginTop:7,
              letterSpacing:".12em",
              textTransform:"uppercase",
              textShadow:"0 0 12px rgba(201,168,76,.65)"
            }}>
              ✦ Critico natural ✦
            </div>
          }

          {result.fumble&&
            <div style={{
              color:"#FF7A78",
              fontFamily:"Cinzel,serif",
              fontSize:13,
              marginTop:7,
              letterSpacing:".12em",
              textTransform:"uppercase",
              textShadow:"0 0 10px rgba(226,75,74,.55)"
            }}>
              Pifia natural
            </div>
          }
        </div>
      }

      {quickRolls.length>0&&<>
        <div style={{fontSize:10,color:"var(--muted)",fontFamily:"Cinzel,serif",letterSpacing:".1em",textTransform:"uppercase"}}>
          Tiradas rapidas
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
          {quickRolls.map(q=>
            <button
              key={q.label}
              className="btn btn-sm"
              onClick={q.fn}
              style={{fontSize:10}}
              disabled={!canRoll||rolling}
            >
              {q.label}
            </button>
          )}
        </div>
      </>}
    </div>
  );
};
