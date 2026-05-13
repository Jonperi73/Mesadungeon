// Dice system
// Loaded by index.html. Keep script order unless moving to a build step.
const DicePanel = ({ char, updateRoom, playerId, canRoll, isDM, diceEnabled }) => {

  const diceRef = useRef(null);

  const [sel,setSel]=useState(20);
  const [cnt,setCnt]=useState(1);
  const [rolling,setRolling]=useState(false);
  const [result,setResult]=useState(null);
  const [hist,setHist]=useState([]);
  const [advMode,setAdvMode]=useState("normal");
  const [key,setKey]=useState(0);

  useEffect(()=>{

    if(window._diceBox && diceRef.current){

      try{
        window._diceBox.bind(diceRef.current);
      }catch(e){
        console.warn("No se pudo bindear DiceBox",e);
      }
    }

  },[]);

  const roll=async(sides=sel,count=cnt,label="",adv=advMode)=>{

    if(!canRoll||rolling)return;

    setRolling(true);

    setTimeout(async()=>{

      let rolls,total,special=null;

      if(window.roll3D){

        if(adv==="adv"||adv==="dis"){

          const formula = adv==="adv"
            ? "2d20kh1"
            : "2d20kl1";

          const r = await window.roll3D(formula);

          rolls = r.rolls || [];
          total = r.total || 0;

          special = adv==="adv"
            ? `Ventaja: [${rolls.join(",")}] →`
            : `Desventaja: [${rolls.join(",")}] →`;

        }else{

          const formula = `${count}d${sides}`;

          const r = await window.roll3D(formula);

          rolls = r.rolls || [];
          total = r.total || 0;
        }

      }else{

        if(adv==="adv"||adv==="dis"){

          const r1=Math.floor(Math.random()*20)+1;
          const r2=Math.floor(Math.random()*20)+1;

          rolls=[r1,r2];

          total=adv==="adv"
            ? Math.max(r1,r2)
            : Math.min(r1,r2);

          special=adv==="adv"
            ? `Ventaja: [${r1},${r2}] →`
            : `Desventaja: [${r1},${r2}] →`;

        } else {

          rolls=Array.from(
            {length:count},
            ()=>Math.floor(Math.random()*sides)+1
          );

          total=rolls.reduce((a,b)=>a+b,0);
        }
      }

      const r={
        sides,
        count,
        rolls,
        total,
        label,
        special,
        ts:Date.now()
      };

      setResult(r);

      setKey(k=>k+1);

      setHist(h=>[r,...h].slice(0,12));

      setRolling(false);

      if(char&&updateRoom){

        const txt=special
          ? `🎲 ${special} **${total}**${label?` (${label})`:""}`
          : `🎲 Tiró ${count}d${sides}${label?` (${label})`:""}: [${rolls.join(",")}] = **${total}**`;

        await updateRoom(d=>({
          ...d,
          messages:[
            ...(d.messages||[]),
            {
              id:Date.now(),
              t:"roll",
              text:txt,
              senderName:char.name,
              ts:Date.now()
            }
          ]
        }));
      }

    },650);
  };

  const getColor=(total,sides)=>{
    const p=total/sides;

    return p>0.8
      ? "#C9A84C"
      : p>0.5
      ? "#5BA3E0"
      : p<0.25
      ? "#E24B4A"
      : "#F0E6D3";
  };

  const quickRolls=char?[
    {
      label:"Iniciativa",
      fn:()=>roll(20,1,"Iniciativa","normal")
    },
    {
      label:"Ataque",
      fn:()=>roll(
        20,
        1,
        `Ataque +${mod(char.stats[CLASSES[char.class]&&pstat||"str"])+profBonus(char.level)}`
      )
    },
    {
      label:"Percepción",
      fn:()=>roll(
        20,
        1,
        `Percep ${modStr(char.stats.wis)}`
      )
    },
    {
      label:"Sigilo",
      fn:()=>roll(
        20,
        1,
        `Sigilo ${modStr(char.stats.dex)}`
      )
    },
  ]:[];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>

      <div
        ref={diceRef}
        style={{
          width:"100%",
          height:220,
          border:"1px solid #3A2A12",
          borderRadius:8,
          overflow:"hidden",
          background:"#120B07",
          marginBottom:6
        }}
      />

      {!isDM&&!canRoll&&
        <div className="card" style={{
          padding:12,
          fontSize:13,
          lineHeight:1.5,
          color:"var(--muted)"
        }}>
          🎲 El DM todavía no habilitó las tiradas para los jugadores.
        </div>
      }

      {!isDM&&canRoll&&diceEnabled&&
        <div style={{
          fontSize:11,
          color:"var(--gold)",
          fontFamily:"Cinzel,serif",
          letterSpacing:".08em",
          textTransform:"uppercase"
        }}>
          Tiradas habilitadas por el DM
        </div>
      }

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(7,1fr)",
        gap:4
      }}>
        {[4,6,8,10,12,20,100].map(d=>
          <button
            key={d}
            className={`dice-btn${sel===d?" sel":""}`}
            onClick={()=>setSel(d)}
            disabled={!canRoll||rolling}
          >
            d{d}
          </button>
        )}
      </div>

      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <span style={{
          fontSize:12,
          color:"var(--muted)",
          fontFamily:"Cinzel,serif"
        }}>
          Cant:
        </span>

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

      {sel===20&&
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
        style={{
          width:"100%",
          padding:"11px",
          fontSize:13
        }}
      >
        {rolling
          ? "⏳ Tirando..."
          : "🎲 Tirar "+`${cnt>1?cnt+"d"+sel:"d"+sel}`
        }
      </button>

      {result&&
        <div
          key={key}
          className="card"
          style={{
            padding:14,
            textAlign:"center"
          }}
        >

          <div style={{
            fontSize:11,
            color:"var(--muted)",
            fontFamily:"Cinzel,serif",
            marginBottom:3
          }}>
            {result.special||`${result.count}d${result.sides} → [${result.rolls.join(", ")}]`}
          </div>

          <div
            className="roll-a"
            style={{
              fontSize:46,
              fontFamily:"Cinzel,serif",
              fontWeight:700,
              color:getColor(result.total,result.sides),
              lineHeight:1
            }}
          >
            {result.total}
          </div>

          {result.label&&
            <div style={{
              fontSize:11,
              color:"var(--muted)",
              marginTop:3
            }}>
              {result.label}
            </div>
          }

          {result.total===20&&result.sides===20&&
            <div style={{
              color:"#C9A84C",
              fontFamily:"Cinzel,serif",
              fontSize:12,
              marginTop:4
            }}>
              ✦ ¡CRÍTICO!
            </div>
          }

          {result.total===1&&result.sides===20&&
            <div style={{
              color:"#E24B4A",
              fontFamily:"Cinzel,serif",
              fontSize:12,
              marginTop:4
            }}>
              ☠ Pifia total
            </div>
          }

        </div>
      }

      {quickRolls.length>0&&<>
        <div style={{
          fontSize:10,
          color:"var(--muted)",
          fontFamily:"Cinzel,serif",
          letterSpacing:".1em",
          textTransform:"uppercase"
        }}>
          Tiradas rápidas
        </div>

        <div style={{
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          gap:5
        }}>

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

// ─── CHAR SHEET ───────────────────────────────────────────────
