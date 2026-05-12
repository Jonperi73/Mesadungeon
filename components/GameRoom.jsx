// Room UI, chat and game controls
// Loaded by index.html. Keep script order unless moving to a build step.

const GameRoom = ({ roomData, character, playerId, authUid, updateRoom, playerName, onSave, aiLoading, callAI, notify, levelUpPlayer }) => {
  const [chatInput,setChatInput]=useState("");
  const [activeTab,setActiveTab]=useState("sheet");
  const [dmInput,setDmInput]=useState("");
  const [showDM,setShowDM]=useState(false);
  const [showCharModal,setShowCharModal]=useState(false);
  const [showStock,setShowStock]=useState(false);
  const [showPlayerAdmin,setShowPlayerAdmin]=useState(false);
  const [stockTargetId,setStockTargetId]=useState("");
  const [adminTargetId,setAdminTargetId]=useState("");
  const [stockItemId,setStockItemId]=useState(()=>Object.keys(ITEMS)[0]||"");
  const [stockQty,setStockQty]=useState("1");
  const [coinType,setCoinType]=useState("gold");
  const [coinAmount,setCoinAmount]=useState("10");
  const [hpAmount,setHpAmount]=useState("");
  const [levelHpGain,setLevelHpGain]=useState("");
  const chatEnd=useRef();
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem("tutorial_game_done"));
  const effectiveCharacter = character || (roomData&&roomData.players&&roomData.players[playerId]&&roomData.players[playerId].character) || null;
  const playersList=Object.values((roomData&&roomData.players)||{});
  const isHost=roomData&&roomData.hostId===playerId;
  const isDM=!!((roomData&&roomData.dmUid&&authUid&&roomData.dmUid===authUid)||isHost);
  const canRoll=!!effectiveCharacter&&(isDM||!!(roomData&&roomData.diceEnabled));
  const dmStock=(roomData&&roomData.dmStock)||{items:{},coins:normalizeWallet()};
  const stockEntries=Object.entries(dmStock.items||{})
    .filter(([,qty])=>qty>0)
    .sort((a,b)=>{
      const ia=ITEMS[a[0]],ib=ITEMS[b[0]];
      const ta=getItemTypeLabel(ia),tb=getItemTypeLabel(ib);
      return ta.localeCompare(tb,"es")||(((ia&&ia.n)||a[0]).localeCompare((ib&&ib.n)||b[0],"es"));
    });
  const stockCatalog=Object.values(ITEMS).sort((a,b)=>{
    const ta=getItemTypeLabel(a),tb=getItemTypeLabel(b);
    return ta.localeCompare(tb,"es")||a.n.localeCompare(b.n,"es");
  });
  const sideTabs=[["sheet","Ficha"],["dice","Dados"],["char","Personaje"]];
  const panelTitle=(sideTabs.find(([id])=>id===activeTab)||[])[1]||"Panel";
  const selectedItem=ITEMS[stockItemId];
  const selectedItemStock=selectedItem?((dmStock.items&&dmStock.items[stockItemId])||0):0;

useEffect(()=>{
  const candidates=playersList.filter(p=>p.character);

  if(candidates.some(p=>p.id===stockTargetId))return;

  const next=
    (candidates[0]&&candidates[0].id)||
    "";

  setStockTargetId(next);
},[playersList,playerId,stockTargetId]);

useEffect(()=>{
  const candidates=playersList.filter(p=>p.character);

  if(candidates.some(p=>p.id===adminTargetId))return;

  const next=
    (candidates[0]&&candidates[0].id)||
    "";

  setAdminTargetId(next);
},[playersList,playerId,adminTargetId]);

  const parseAmount=(value,fallback=1)=>Math.max(1,parseInt(value,10)||fallback);
  const parsePositiveAmount=(value)=> {
    const amount=parseInt(value,10);
    return Number.isFinite(amount)&&amount>0?amount:null;
  };
  const coinLabel=(type)=>{const coin=COIN_TYPES.find(c=>c.type===type);return (coin&&coin.label)||type;};
  const openMobilePanel=(tab)=>{setActiveTab(tab);setShowCharModal(true);};

  const send=async()=>{
    if(!chatInput.trim())return;
    const msg={id:Date.now(),t:"player",text:chatInput,senderId:playerId,senderName:(character&&character.name)||playerName,ts:Date.now()};
    const action=chatInput;setChatInput("");
    await updateRoom(d=>({...d,messages:[...(d.messages||[]),msg]}));
    if(roomData&&roomData.dmMode==="ai")callAI(`${(character&&character.name)||playerName} (${(character&&RACES[character.race]&&RACES[character.race].n)||""} ${(character&&CLASSES[character.class]&&CLASSES[character.class].n)||""}) dice/hace: "${action}"`);
  };

  const sendDM=async()=>{
    if(!dmInput.trim())return;
    await updateRoom(d=>({...d,messages:[...(d.messages||[]),{id:Date.now(),t:"dm",text:dmInput,senderName:"🎭 Dungeon Master",ts:Date.now()}]}));
    setDmInput("");
  };

  const toggleDiceAccess=async()=>{
    if(!isDM)return;
    const next=!(roomData&&roomData.diceEnabled);
    await updateRoom(d=>({
      ...d,
      diceEnabled:next,
      messages:[...(d.messages||[]),{id:Date.now(),t:"sys",text:next?"🎲 El DM habilitó las tiradas para los jugadores.":"⛔ El DM bloqueó las tiradas para los jugadores.",ts:Date.now()}]
    }));
    notify&&(next?"Tiradas habilitadas para jugadores":"Tiradas bloqueadas para jugadores");
  };

  const handleEquip=async(itemId,slot,force=false)=>{
    if(!character)return;
    const item=ITEMS[itemId];
    const newEq={...(character.equipment||{})};
    if(itemId===null){delete newEq[slot];}else newEq[slot]=itemId;
    const newChar={...character,equipment:newEq,ac:calcAC({...character,equipment:newEq})};
    const safeChar = JSON.parse(JSON.stringify(newChar));
    await updateRoom(d=>({
      ...d,
      players:{...(d.players||{}),[playerId]:{...((d.players&&d.players[playerId])||{}),character:newChar}},
      messages:force&&item?[...(d.messages||[]),{id:Date.now(),t:"sys",text:`⚠ ${character.name} intenta usar ${item.n} sin los requisitos...`,ts:Date.now()}]:(d.messages||[])
    }));
    if(force&&roomData&&roomData.dmMode==="ai")callAI(`${character.name} intentó equipar ${item.n} sin cumplir los requisitos. Narra las consecuencias.`);
  };

  const handleUpdateHP=async(newHP)=>{
    if(!character)return;
    const hp=Math.max(0,Math.min(newHP,character.maxHP));
    const newChar={...character,currentHP:hp};
    const safeChar = JSON.parse(JSON.stringify(newChar));
    await updateRoom(d=>({...d,players:{...(d.players||{}),[playerId]:{...((d.players&&d.players[playerId])||{}),character:newChar}}}));
  };

  const handleUpdateWallet=async(newWallet)=>{
    if(!character)return;
    const newChar={...character,wallet:normalizeWallet(newWallet)};
    const safeChar = JSON.parse(JSON.stringify(newChar));
    await updateRoom(d=>({...d,players:{...(d.players||{}),[playerId]:{...((d.players&&d.players[playerId])||{}),character:newChar}}}));
  };

  const adjustStockItem=async(direction=1)=>{
    if(!isDM||!selectedItem)return;
    const amount=parseAmount(stockQty,1);
    await updateRoom(d=>{
      const current=(d.dmStock.items&&d.dmStock.items[stockItemId])||0;
      const next=Math.max(0,current+(direction*amount));
      const items={...(d.dmStock.items||{})};
      if(next>0)items[stockItemId]=next;else delete items[stockItemId];
      return {...d,dmStock:{...d.dmStock,items}};
    });
    notify&&(`${direction>0?"Stock cargado":"Stock ajustado"}: ${selectedItem.n} x${amount}`);
  };

  const giveStockItem=async()=>{
    if(!isDM||!selectedItem)return;
    if(!stockTargetId){notify&&("Elegí un jugador para entregar el item");return;}
    const amount=parseAmount(stockQty,1);
    let delivered=false;
    let reason="No se pudo entregar el item";
    await updateRoom(d=>{
      const available=(d.dmStock.items&&d.dmStock.items[stockItemId])||0;
      const targetPlayer=d.players&&d.players[stockTargetId];
      const targetChar=targetPlayer&&targetPlayer.character;
      if(!targetChar){reason="Ese jugador todavía no creó su personaje";return d;}
      if(available<amount){reason="No hay suficiente stock para esa entrega";return d;}
      const items={...(d.dmStock.items||{})};
      const nextCount=available-amount;
      if(nextCount>0)items[stockItemId]=nextCount;else delete items[stockItemId];
      delivered=true;
      return{
        ...d,
        dmStock:{...d.dmStock,items},
        players:{
          ...(d.players||{}),
          [stockTargetId]:{
            ...targetPlayer,
            character: JSON.parse(JSON.stringify({
              ...targetChar,
              inventory:[...(targetChar.inventory||[]),...Array.from({length:amount},()=>stockItemId)],
            })) 
          }
        },
        messages:[...(d.messages||[]),{id:Date.now(),t:"sys",text:`🎁 El DM entregó ${amount}x ${selectedItem.n} a ${targetChar.name}.`,ts:Date.now()}]
      };
    });
    if(!delivered){notify&&(reason);return;}
    notify&&(`Entregaste ${selectedItem.n} x${amount}`);
  };

  const adjustStockCoins=async(direction=1)=>{
    if(!isDM)return;
    const amount=parseAmount(coinAmount,1);
    await updateRoom(d=>{
      const current=(d.dmStock.coins&&d.dmStock.coins[coinType])||0;
      const next=Math.max(0,current+(direction*amount));
      return{
        ...d,
        dmStock:{
          ...d.dmStock,
          coins:{...(d.dmStock.coins||EMPTY_WALLET),[coinType]:next}
        }
      };
    });
    notify&&(`${direction>0?"Tesoro cargado":"Tesoro ajustado"}: ${coinLabel(coinType)} ${amount}`);
  };

  const giveStockCoins=async()=>{
    if(!isDM)return;
    if(!stockTargetId){notify&&("Elegí un jugador para entregar monedas");return;}
    const amount=parseAmount(coinAmount,1);
    let delivered=false;
    let reason="No se pudieron entregar las monedas";
    await updateRoom(d=>{
      const available=(d.dmStock.coins&&d.dmStock.coins[coinType])||0;
      const targetPlayer=d.players&&d.players[stockTargetId];
      const targetChar=targetPlayer&&targetPlayer.character;
      if(!targetChar){reason="Ese jugador todavía no creó su personaje";return d;}
      if(available<amount){reason="No hay suficiente tesoro en stock";return d;}
      const targetWallet=normalizeWallet(targetChar.wallet);
      delivered=true;
      return{
        ...d,
        dmStock:{
          ...d.dmStock,
          coins:{...(d.dmStock.coins||EMPTY_WALLET),[coinType]:available-amount}
        },
        players:{
          ...(d.players||{}),
          [stockTargetId]:{
            ...targetPlayer,
            character: JSON.parse(JSON.stringify({
              ...targetChar,
              wallet:{...targetWallet,[coinType]:(targetWallet[coinType]||0)+amount},
            }))
          }
        },
        messages:[...(d.messages||[]),{id:Date.now(),t:"sys",text:`🪙 El DM entregó ${amount} ${coinLabel(coinType).toLowerCase()} a ${targetChar.name}.`,ts:Date.now()}]
      };
    });
    if(!delivered){notify&&(reason);return;}
    notify&&(`Entregaste ${amount} ${coinLabel(coinType).toLowerCase()}`);
  };

  const modifyPlayerStat=async(targetPlayerId,patch)=>{
    if(!isDM)return;
    await updateRoom(d=>{
      const targetPlayer=d.players&&d.players[targetPlayerId];
      const targetChar=targetPlayer&&targetPlayer.character;
      if(!targetChar)return d;
      return{
        ...d,
        players:{
          ...(d.players||{}),
          [targetPlayerId]:{
            ...targetPlayer,
            character: JSON.parse(JSON.stringify({
              ...targetChar,
              ...patch
            }))
          }
        }
      };
    });
  };

  const adjustPlayerHP=async(targetPlayerId,direction=1)=>{
    const amount=parsePositiveAmount(hpAmount);
    if(!amount){notify&&("Ingresa el HP que salio en los dados.");return;}
    const target=playersList.find(p=>p.id===targetPlayerId);
    const c=target&&target.character;
    if(!c)return;
    await modifyPlayerStat(targetPlayerId,{
      currentHP:Math.max(0,Math.min(c.maxHP,(c.currentHP||0)+(direction*amount)))
    });
    notify&&(`${direction>0?"Curacion":"Danio"} aplicado: ${amount} HP`);
  };

  const renderSidePanel=()=>(
    activeTab==="sheet"
      ? <CharSheet char={character} onUpdateHP={handleUpdateHP}/>
      : activeTab==="dice"
        ? <DicePanel char={character} updateRoom={updateRoom} playerId={playerId} canRoll={canRoll} isDM={isDM} diceEnabled={!!(roomData&&roomData.diceEnabled)}/>
        : <L2CharacterPanel char={character} onEquip={handleEquip} onUpdateHP={handleUpdateHP} onUpdateWallet={handleUpdateWallet}/>
  );

  const msgColor=(t)=>t==="dm"?"#E8C9A0":t==="roll"?"#7BAED4":t==="sys"?"#9A8A72":"var(--text)";

  return(
    <div className="game-wrap">
      <style>{CSS}</style>
      {showTutorial && <Tutorial
  steps={isDM ? TUTORIAL_STEPS_GAME_DM : TUTORIAL_STEPS_GAME_PLAYER}
  onClose={()=>{
    const key = "tutorial_game_done";
    setShowTutorial(false);
    localStorage.setItem(key,"1");
  }}
/>}

      {/* Header */}
      <div style={{background:"var(--bg1)",borderBottom:"1px solid var(--border)",padding:"9px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
          <span style={{fontFamily:"Cinzel,serif",fontSize:15,color:"var(--gold)",whiteSpace:"nowrap"}}>⚔ {roomData&&roomData.name}</span>
          <span style={{fontSize:10,color:"var(--muted)",fontFamily:"Cinzel,serif",padding:"2px 7px",border:"1px solid var(--border)",borderRadius:2,whiteSpace:"nowrap"}}>{roomData&&roomData.id}</span>
          <span className="online-dot"/><span style={{fontSize:10,color:"#4CAF50",fontFamily:"Cinzel,serif"}}>Online</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:10,color:"var(--muted)"}}>{playersList.length}/10</span>
          {isDM&&<button className="btn btn-sm" onClick={()=>setShowDM(!showDM)} style={{fontSize:10}}>🎭 DM</button>}
          <button className="btn btn-sm" onClick={()=>setShowTutorial(true)} style={{fontSize:10}}>?</button>
          <button className="btn btn-sm" onClick={onSave} style={{fontSize:10}}>💾</button>
        </div>
      </div>

      {/* DM Panel */}
{showDM&&isDM&&<div className="dm-panel" style={{background:"rgba(139,26,26,.12)",borderBottom:"1px solid rgba(139,26,26,.3)",padding:"9px 14px",display:"flex",flexDirection:"column",gap:8}}>
  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
    <span style={{fontFamily:"Cinzel,serif",fontSize:10,color:"var(--crimson2)",textTransform:"uppercase",whiteSpace:"nowrap"}}>
      DM →
    </span>

    <input
      className="inp"
      placeholder="Narración..."
      value={dmInput}
      onChange={e=>setDmInput(e.target.value)}
      onKeyDown={e=>e.key==="Enter"&&sendDM()}
      style={{flex:1,minWidth:180,fontSize:13}}
    />

    <button
      className="btn btn-r btn-sm"
      onClick={sendDM}
    >
      Narrar
    </button>
  </div>

  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>

    <button
      className={`btn btn-sm${roomData&&roomData.diceEnabled?" btn-g":""}`}
      onClick={toggleDiceAccess}
    >
      {roomData&&roomData.diceEnabled
        ?"⛔ Bloquear tiradas"
        :"🎲 Habilitar tiradas"}
    </button>

    <button
      className="btn btn-sm"
      onClick={()=>setShowStock(true)}
    >
      🎁 Stock del DM
    </button>

    <button
      className="btn btn-sm"
      onClick={()=>setShowPlayerAdmin(true)}
    >
      🎭 Jugadores
    </button>

    <span style={{fontSize:11,color:"var(--muted)"}}>
      {roomData&&roomData.diceEnabled
        ?"Los jugadores ya pueden tirar dados."
        :"Los jugadores tienen los dados bloqueados."}
    </span>

  </div>
</div>}

      {/* Players bar */}
<div style={{background:"var(--bg2)",borderBottom:"1px solid var(--border)",padding:"5px 14px",display:"flex",gap:10,overflowX:"auto",flexShrink:0}}>
  {playersList.map(p=>{
    const c=p.character;
    const hp=c?(c.currentHP/c.maxHP)*100:null;
    const hC=hp>60?"#4CAF50":hp>25?"#FFC107":"#E24B4A";
    const playerIsDM=(p.authUid&&roomData&&p.authUid===roomData.dmUid)||(roomData&&p.id===roomData.hostId);

    return(
      <div
        key={p.id}
        style={{
          display:"flex",
          alignItems:"center",
          gap:7,
          padding:"3px 9px",
          background:"rgba(0,0,0,.3)",
          border:`1px solid ${p.id===playerId?"var(--gold)":"var(--border)"}`,
          borderRadius:3,
          flexShrink:0
        }}
      >
        <span className={p.connected?"online-dot":"offline-dot"}/>

        <span
          style={{
            fontFamily:"Cinzel,serif",
            fontSize:11,
            color:p.id===playerId?"var(--gold)":"var(--text)",
            whiteSpace:"nowrap"
          }}
        >
          {playerIsDM?"🎭":"⚔"} {c?c.name:p.name}
        </span>

        {c&&(
          <span
            style={{
              fontSize:11,
              color:hC,
              fontFamily:"Cinzel,serif"
            }}
          >
            Lv.{c.level||1} • {c.currentHP}/{c.maxHP}
          </span>
        )}

        {isDM && c && p.id!==playerId && (
          <button
            className="btn"
            onClick={()=>levelUpPlayer(p.id)}
            style={{
              fontSize:10,
              padding:"2px 6px",
              marginLeft:4,
              minHeight:"unset"
            }}
          >
            ⬆️
          </button>
        )}
      </div>
    );
  })}
</div>

      {/* Body */}
      <div className="game-body">
        {/* Chat */}
        <div className="chat-col">
          <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:7}}>
            {((roomData&&roomData.messages)||[]).map(msg=>(
              <div key={msg.id} className={`msg-${msg.t}`} style={{borderRadius:2}}>
                {msg.t!=="sys"&&<div style={{fontSize:10,color:"var(--muted)",fontFamily:"Cinzel,serif",marginBottom:2}}>
                  {msg.senderName} · {new Date(msg.ts||msg.id).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}
                </div>}
                <div style={{fontSize:14,color:msgColor(msg.t),lineHeight:1.55}}
                  dangerouslySetInnerHTML={{__html:msg.text.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\[([^\]]+)\]/g,"<em style='color:#C9A84C'>[$1]</em>")}}>
                </div>
              </div>
            ))}
            {aiLoading&&<div className="msg-dm">
              <div style={{fontSize:10,color:"var(--muted)",fontFamily:"Cinzel,serif",marginBottom:3}}>🎲 Dungeon Master · escribiendo...</div>
              <div style={{display:"flex",gap:4}}>
                {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"var(--crimson2)",animation:`pulse 1.2s infinite ${i*0.3}s`}}/>)}
              </div>
            </div>}
            <div ref={chatEnd}/>
          </div>
          <div style={{padding:10,background:"var(--bg1)",borderTop:"1px solid var(--border)"}}>
            <div className="mobile-quickbar">
              <button className="btn btn-sm" onClick={()=>openMobilePanel("sheet")}>📜 Ficha</button>
              <button className={`btn btn-sm${activeTab==="dice"?" btn-g":""}`} onClick={()=>openMobilePanel("dice")}>
                {!isDM&&!(roomData&&roomData.diceEnabled)?"🎲 Dados 🔒":"🎲 Dados"}
              </button>
              <button className="btn btn-sm" onClick={()=>openMobilePanel("char")}>🎒 Equipo</button>
            </div>
            <div style={{display:"flex",gap:8}}>
             <input className="inp" placeholder={effectiveCharacter?"¿Qué hace tu personaje?":"Crea tu personaje primero..."}
                value={chatInput} onChange={e=>setChatInput(e.target.value)}
               onKeyDown={e=>e.key==="Enter"&&send()} disabled={!effectiveCharacter} style={{flex:1,fontSize:14}}/>
             <button className="btn btn-r" onClick={send} disabled={!effectiveCharacter||!chatInput.trim()}>Enviar</button>
           </div>
          </div>
        </div>

        {/* Right panel — desktop only */}
        <div className="right-col">
          <div style={{display:"flex",borderBottom:"1px solid var(--border)",flexShrink:0}}>
            {sideTabs.map(([id,label])=>(
              <button key={id} className={`tab${activeTab===id?" act":""}`} style={{flex:1}} onClick={()=>setActiveTab(id)}>{label}</button>
            ))}
          </div>
          <div style={{flex:1,overflowY:"auto",padding:12}}>
            {renderSidePanel()}
          </div>
        </div>
      </div>

      {/* Mobile adventure modal */}
      {showCharModal&&(
        <div className="overlay" onClick={()=>setShowCharModal(false)}>
          <div className="l2-modal" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid var(--border)"}}>
              <span style={{fontFamily:"Cinzel,serif",color:"var(--gold)",fontSize:15}}>⚔ {panelTitle}</span>
              <button className="btn btn-sm" onClick={()=>setShowCharModal(false)}>✕ Cerrar</button>
            </div>
            <div style={{display:"flex",borderBottom:"1px solid var(--border)"}}>
              {sideTabs.map(([id,label])=>(
                <button key={id} className={`tab${activeTab===id?" act":""}`} style={{flex:1}} onClick={()=>setActiveTab(id)}>{label}</button>
              ))}
            </div>
            <div style={{padding:activeTab==="char"?0:14,maxHeight:"calc(94vh - 112px)",overflowY:"auto"}}>
              {renderSidePanel()}
            </div>
          </div>
        </div>
      )}

      {/* DM stock modal */}
      {showStock&&isDM&&(
        <div className="overlay" onClick={()=>setShowStock(false)}>
          <div className="modal" style={{maxWidth:640}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontFamily:"Cinzel,serif",fontSize:18,color:"var(--gold)"}}>🎁 Stock del DM</div>
                <div style={{fontSize:12,color:"var(--muted)"}}>Armá tesoro de campaña y repartilo cuando haga falta.</div>
              </div>
              <button className="btn btn-sm" onClick={()=>setShowStock(false)}>Cerrar</button>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:14}}>
              <div className="card" style={{padding:12}}>
                <div style={{fontFamily:"Cinzel,serif",fontSize:11,color:"var(--muted)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:8}}>Items</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <select className="sel" value={stockItemId} onChange={e=>setStockItemId(e.target.value)} style={{width:"100%"}}>
                    {stockCatalog.map(item=>(
                      <option key={item.id} value={item.id}>{getItemTypeLabel(item)} · {item.n}</option>
                    ))}
                  </select>
                  <input className="inp" value={stockQty} onChange={e=>setStockQty(e.target.value)} inputMode="numeric" placeholder="Cantidad" />
                  <div style={{fontSize:12,color:"var(--muted)"}}>
                    Disponible: <span style={{color:"var(--gold)"}}>{selectedItemStock}</span>{selectedItem?` · ${selectedItem.n}`:""}
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <button className="btn btn-sm btn-g" onClick={()=>adjustStockItem(1)}>Cargar stock</button>
                    <button className="btn btn-sm" onClick={()=>adjustStockItem(-1)}>Quitar stock</button>
                    <button className="btn btn-sm btn-r" onClick={giveStockItem} disabled={!stockTargetId||!selectedItemStock}>Entregar</button>
                  </div>
                </div>
              </div>

              <div className="card" style={{padding:12}}>
                <div style={{fontFamily:"Cinzel,serif",fontSize:11,color:"var(--muted)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:8}}>Destino y monedas</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <select className="sel" value={stockTargetId} onChange={e=>setStockTargetId(e.target.value)} style={{width:"100%"}}>
                    <option value="">Elegir jugador...</option>
                    {playersList.filter(p=>p.character).map(p=>(
                      <option key={p.id} value={p.id}>{(p.character&&p.character.name)||p.name}</option>
                    ))}
                  </select>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    <select className="sel" value={coinType} onChange={e=>setCoinType(e.target.value)} style={{width:"100%"}}>
                      {COIN_TYPES.map(coin=><option key={coin.type} value={coin.type}>{coin.label}</option>)}
                    </select>
                    <input className="inp" value={coinAmount} onChange={e=>setCoinAmount(e.target.value)} inputMode="numeric" placeholder="Monto" />
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <button className="btn btn-sm btn-g" onClick={()=>adjustStockCoins(1)}>Cargar tesoro</button>
                    <button className="btn btn-sm" onClick={()=>adjustStockCoins(-1)}>Quitar tesoro</button>
                    <button className="btn btn-sm btn-r" onClick={giveStockCoins} disabled={!stockTargetId||((dmStock.coins&&dmStock.coins[coinType])||0)<=0}>Dar monedas</button>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
                    {COIN_TYPES.map(({type,icon,label,color})=>(
                      <div key={type} style={{flex:"1 1 30%",minWidth:70,background:"rgba(0,0,0,.25)",border:`1px solid ${color}44`,borderRadius:4,padding:"8px 6px",textAlign:"center"}}>
                        <div style={{fontSize:16}}>{icon}</div>
                        <div style={{fontFamily:"Cinzel,serif",fontSize:13,color}}>{(dmStock.coins&&dmStock.coins[type])||0}</div>
                        <div style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase"}}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{fontFamily:"Cinzel,serif",fontSize:11,color:"var(--muted)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:8}}>Stock cargado</div>
            {stockEntries.length===0
              ? <div className="card" style={{padding:12,fontSize:13,color:"var(--muted)"}}>Todavía no hay ítems en el stock del DM.</div>
              : <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:240,overflowY:"auto"}}>
                  {stockEntries.map(([itemId,qty])=>{
                    const item=ITEMS[itemId];
                    if(!item)return null;
                    return(
                      <div key={itemId} className="card" style={{padding:"8px 10px",display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:20}}>{item.e}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,color:"var(--text)"}}>{item.n}</div>
                          <div style={{fontSize:10,color:"var(--muted)"}}>{getItemTypeLabel(item)} · {qty} en stock</div>
                        </div>
                        <button className="btn btn-sm" onClick={()=>{setStockItemId(itemId);setStockQty("1");}}>Usar</button>
                      </div>
                    );
                  })}
                </div>}
          </div>
        </div>
      )}
      
      {/* Player Admin Modal */}
      {showPlayerAdmin&&isDM&&(
        <div className="overlay" onClick={()=>setShowPlayerAdmin(false)}>
          <div
            className="modal"
            style={{maxWidth:520}}
            onClick={e=>e.stopPropagation()}
          >

            <div style={{
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center",
              marginBottom:14
            }}>
              <div>
                <div style={{
                  fontFamily:"Cinzel,serif",
                  fontSize:18,
                  color:"var(--gold)"
                }}>
                  🎭 Administrar jugador
                </div>

                <div style={{
                  fontSize:12,
                  color:"var(--muted)"
                }}>
                  Controlá HP y niveles de los personajes.
                </div>
              </div>

              <button
                className="btn btn-sm"
                onClick={()=>setShowPlayerAdmin(false)}
              >
                Cerrar
              </button>
            </div>

            <div style={{
              display:"flex",
              flexDirection:"column",
              gap:12
            }}>

              <select
                className="sel"
                value={adminTargetId}
                onChange={e=>setAdminTargetId(e.target.value)}
                style={{width:"100%"}}
              >
                {playersList
                  .filter(p=>p.character)
                  .map(p=>(
                    <option key={p.id} value={p.id}>
                      {(p.character&&p.character.name)||p.name}
                    </option>
                  ))
                }
              </select>

              {(()=>{
                const target=
                  playersList.find(p=>p.id===adminTargetId);

                const c=target&&character;

                if(!c)return null;

                return(
                  <div style={{
                    display:"flex",
                    flexDirection:"column",
                    gap:12
                  }}>

                    <div className="card" style={{
                      padding:12,
                      display:"flex",
                      flexDirection:"column",
                      gap:6
                    }}>
                      <div style={{fontSize:14}}>
                        <b>Jugador:</b> {c.name}
                      </div>

                      <div style={{fontSize:14}}>
                        <b>Nivel:</b> {c.level||1}
                      </div>

                      <div style={{fontSize:14}}>
                        <b>HP:</b> {c.currentHP}/{c.maxHP}
                      </div>
                    </div>

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <input
                        className="inp"
                        value={levelHpGain}
                        onChange={e=>setLevelHpGain(e.target.value)}
                        inputMode="numeric"
                        placeholder="HP al subir nivel"
                        style={{fontSize:13}}
                      />
                      <input
                        className="inp"
                        value={hpAmount}
                        onChange={e=>setHpAmount(e.target.value)}
                        inputMode="numeric"
                        placeholder="HP por dados"
                        style={{fontSize:13}}
                      />
                    </div>

                    <div style={{
                      display:"flex",
                      gap:8,
                      flexWrap:"wrap"
                    }}>

                      <button
                        className="btn btn-sm"
                        onClick={()=>{levelUpPlayer(target.id,levelHpGain);setLevelHpGain("");}}
                        style={{fontSize:0}}
                      >
                        <span style={{fontSize:11}}>Subir nivel</span>
                        
                      </button>

                      <button
                        className="btn btn-sm btn-g"
                        onClick={()=>adjustPlayerHP(target.id,1)}
                        style={{fontSize:0}}
                      >
                        <span style={{fontSize:11}}>Curar HP</span>
                        
                      </button>

                      <button
                        className="btn btn-sm"
                        onClick={()=>adjustPlayerHP(target.id,-1)}
                        style={{fontSize:0}}
                      >
                        <span style={{fontSize:11}}>Quitar HP</span>
                        
                      </button>

                    </div>

                  </div>
                );
              })()}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// ─── CHARACTER CREATION ───────────────────────────────────────
