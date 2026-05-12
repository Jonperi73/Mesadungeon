// Equipment UI
// Loaded by index.html. Keep script order unless moving to a build step.

const SLOT_LAYOUT = [
  { id:"head",    label:"Cabeza",    icon:"⛑️",  pos:{top:0, left:"50%", transform:"translateX(-50%)"} },
  { id:"mainhand",label:"Arma",      icon:"⚔️",  pos:{top:60, left:4} },
  { id:"body",    label:"Cuerpo",    icon:"🛡️",  pos:{top:60, left:"50%", transform:"translateX(-50%)"} },
  { id:"offhand", label:"Escudo",    icon:"🛡",   pos:{top:60, right:4} },
  { id:"cape",    label:"Capa",      icon:"🧥",  pos:{top:130, left:4} },
  { id:"acc",     label:"Accesorio", icon:"💍",  pos:{top:130, left:"50%", transform:"translateX(-50%)"} },
];

const rarBadgeColor = {c:"#888",u:"#5cb85c",r:"#5ba3e0"};

const EquipSlot = ({ slotId, char, onEquip }) => {
  const eq = (char&&char.equipment) || {};
  const itemId = eq[slotId];
  const item = ITEMS[itemId];
  const slotDef = SLOT_LAYOUT.find(s=>s.id===slotId);

  return (
    <div
      className={`l2-slot${item?" filled":""}`}
      style={slotDef&&slotDef.pos ? {...slotDef.pos, position:"absolute"} : {}}
      onClick={() => item && onEquip(null, slotId)}
      title={item ? `${item.n} — click para desequipar` : slotDef&&slotDef.label}
    >
      {item ? <>
        <span className="slot-icon">{item.e}</span>
        <span className="slot-name" style={{maxWidth:36,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.n.split(" ")[0]}</span>
        <span className="slot-rarity" style={{color:rarBadgeColor[item.rar]||"#888"}}>●</span>
      </> : <>
        <span style={{fontSize:14,opacity:.4}}>{slotDef&&slotDef.icon}</span>
        <span className="slot-label">{slotDef&&slotDef.label}</span>
      </>}
    </div>
  );
};

// ─── L2 CHARACTER MODAL CONTENT ──────────────────────────────
const L2CharacterPanel = ({ char, onEquip, onUpdateHP, onUpdateWallet }) => {
  const [activeTab, setActiveTab] = useState("equipment");
  const [hpDelta, setHpDelta] = useState("");
  const [showItemDetail, setShowItemDetail] = useState(null);
  const [showReq, setShowReq] = useState(null);

  if (!char) return <div style={{padding:24,color:"var(--muted)",textAlign:"center",fontStyle:"italic"}}>No hay personaje cargado.</div>;

  const wallet = normalizeWallet(char.wallet);
  const inv = char.inventory || [];
  const eq = char.equipment || {};
  const hpPct = (char.currentHP / char.maxHP) * 100;
  const hpColor = hpPct > 60 ? "#4CAF50" : hpPct > 25 ? "#FFC107" : "#E24B4A";
  const bonuses = calcBonuses(char);
  const ac = calcAC(char);
  const prof = profBonus(char.level);
  const equipableInventory = inv
    .map((itemId, idx) => ({ itemId, idx, item: ITEMS[itemId] }))
    .filter(({ item }) => item && canEquipItem(item));
  const nonEquipableCount = inv.filter(itemId => {
    const item = ITEMS[itemId];
    return item && !canEquipItem(item);
  }).length;

  const tryEquip = (itemId, slot) => {
    const item = ITEMS[itemId];
    if (!item || !canEquipItem(item)) return;
    const {ok, issues} = checkItem(char, item);
    if (!ok) { setShowReq({item,issues,slot,itemId}); return; }
    onEquip(itemId, slot);
  };

  const addCoin = (type, amount) => {
    const newWallet = {...wallet, [type]: Math.max(0, (wallet[type]||0) + amount)};
    onUpdateWallet(newWallet);
  };

  // All items for inventory grid — fill to multiple of 6
  const gridItems = [...inv];
  while (gridItems.length % 6 !== 0 || gridItems.length < 12) gridItems.push(null);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      {/* Character header */}
      <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Cinzel,serif",fontSize:18,color:"var(--gold)"}}>{char.name}</div>
          <div style={{fontSize:12,color:"var(--muted)"}}>{RACES[char.race]&&RACES[char.race].n} {CLASSES[char.class]&&CLASSES[char.class].n} · Nivel {char.level}</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <div style={{textAlign:"center",background:"rgba(0,0,0,.3)",border:"1px solid var(--border)",borderRadius:3,padding:"4px 10px"}}>
            <div style={{fontSize:10,color:"var(--muted)",fontFamily:"Cinzel,serif"}}>HP</div>
            <div style={{fontFamily:"Cinzel,serif",fontSize:15,fontWeight:700,color:hpColor}}>{char.currentHP}/{char.maxHP}</div>
          </div>
          <div style={{textAlign:"center",background:"rgba(0,0,0,.3)",border:"1px solid var(--border)",borderRadius:3,padding:"4px 10px"}}>
            <div style={{fontSize:10,color:"var(--muted)",fontFamily:"Cinzel,serif"}}>CA</div>
            <div style={{fontFamily:"Cinzel,serif",fontSize:15,fontWeight:700,color:"var(--gold)"}}>{ac}</div>
          </div>
        </div>
      </div>

      {/* HP bar */}
      <div style={{height:4,background:"rgba(0,0,0,.3)"}}>
        <div style={{height:"100%",width:`${hpPct}%`,background:hpColor,transition:"width .4s"}}/>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid var(--border)"}}>
        {[["equipment","Equipo"],["inventory","Mochila"],["stats","Stats"],["wallet","Monedero"]].map(([id,label])=>(
          <button key={id} className={`tab${activeTab===id?" act":""}`} style={{flex:1,fontSize:10}} onClick={()=>setActiveTab(id)}>{label}</button>
        ))}
      </div>

      <div style={{padding:14,overflowY:"auto",maxHeight:"calc(90vh - 200px)"}}>
        {/* ── EQUIPMENT TAB ── */}
        {activeTab==="equipment" && (
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {/* Portrait + slots */}
            <div style={{flex:"0 0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
              {/* Lineage 2 layout: slots around portrait */}
              <div style={{position:"relative",width:220,height:220}}>
                {/* Portrait center */}
                <div style={{position:"absolute",top:30,left:60,width:100,height:160}}>
                  <CharSVG char={char}/>
                </div>
                {/* HEAD slot — top center */}
                <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)"}}>
                  <EquipSlot slotId="head" char={char} onEquip={onEquip}/>
                </div>
                {/* MAINHAND — left */}
                <div style={{position:"absolute",top:65,left:0}}>
                  <EquipSlot slotId="mainhand" char={char} onEquip={onEquip}/>
                </div>
                {/* BODY — center below head */}
                <div style={{position:"absolute",top:65,left:"50%",transform:"translateX(-50%)"}}>
                  <EquipSlot slotId="body" char={char} onEquip={onEquip}/>
                </div>
                {/* OFFHAND — right */}
                <div style={{position:"absolute",top:65,right:0}}>
                  <EquipSlot slotId="offhand" char={char} onEquip={onEquip}/>
                </div>
                {/* CAPE — bottom left */}
                <div style={{position:"absolute",top:140,left:0}}>
                  <EquipSlot slotId="cape" char={char} onEquip={onEquip}/>
                </div>
                {/* ACC — bottom center */}
                <div style={{position:"absolute",top:140,left:"50%",transform:"translateX(-50%)"}}>
                  <EquipSlot slotId="acc" char={char} onEquip={onEquip}/>
                </div>
              </div>
              <div style={{fontSize:11,color:"var(--muted)",textAlign:"center",lineHeight:1.4}}>
                Click en slot equipado para desequipar.<br/>
                <span style={{color:"var(--gold)"}}>Mochila → click item para equipar.</span>
              </div>
            </div>

            {/* Item list for equipping */}
            <div style={{flex:1,minWidth:160}}>
              <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:"var(--muted)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>Inventario para equipar</div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {equipableInventory.map(({itemId,idx,item})=>{
                  const {ok}=checkItem(char,item);
                  const equipped=eq[item.slot]===itemId;
                  return(
                    <div key={`${itemId}-${idx}`} className="itm" style={{padding:"6px 10px"}} onClick={()=>tryEquip(itemId,item.slot)}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:16}}>{item.e}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,color:ok?"var(--text)":"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.n}</div>
                          <div style={{fontSize:10,color:"var(--muted)"}}>{getItemMetaLabel(item)} {item.dmg&&`· ${item.dmg}`}</div>
                        </div>
                        {equipped&&<span className="badge badge-l" style={{fontSize:8}}>EQ</span>}
                        <span style={{width:5,height:5,borderRadius:"50%",background:rarBadgeColor[item.rar],flexShrink:0,display:"inline-block"}}/>
                      </div>
                      {!ok&&<div style={{fontSize:10,color:"#E24B4A",marginTop:2}}>⚠ Sin requisitos</div>}
                    </div>
                  );
                })}
              </div>
              {nonEquipableCount>0&&<div style={{marginTop:8,fontSize:11,color:"var(--muted)"}}>Consumibles y objetos especiales quedan guardados en la mochila.</div>}
            </div>
          </div>
        )}

        {/* ── INVENTORY (GRID) TAB ── */}
        {activeTab==="inventory" && (
          <div>
            <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:"var(--muted)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>
              Mochila · {(char.inventory||[]).length} objetos
            </div>
            <div className="inv-grid">
              {gridItems.map((itemId,i)=>{
                if(!itemId) return <div key={i} className="inv-cell empty"><span style={{fontSize:10,color:"rgba(255,255,255,.1)"}}>·</span></div>;
                const item=ITEMS[itemId];
                if(!item)return<div key={i} className="inv-cell empty"/>;
                const equipped=Object.values(eq).includes(itemId);
                return(
                  <div key={i} className={`inv-cell${equipped?" equipped":""}`}
                    onClick={()=>setShowItemDetail(item)}
                    title={item.n}>
                    <span style={{fontSize:20}}>{item.e}</span>
                    <span className="cell-name">{item.n.split(" ")[0]}</span>
                    <span className={`cell-dot ${item.rar}`}/>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:8,fontSize:11,color:"var(--muted)"}}>Click en un item para ver detalles y equipar.</div>
          </div>
        )}

        {/* ── STATS TAB ── */}
        {activeTab==="stats" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {/* HP control */}
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:3,padding:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontFamily:"Cinzel,serif",fontSize:11,color:"var(--muted)"}}>Puntos de Golpe</span>
                <span style={{fontFamily:"Cinzel,serif",color:hpColor,fontWeight:700}}>{char.currentHP}/{char.maxHP}</span>
              </div>
              <div className="hp-bar"><div className="hp-fill" style={{width:`${hpPct}%`,background:hpColor}}/></div>
              <div style={{display:"flex",gap:6,marginTop:8}}>
                <input className="inp" style={{fontSize:13}} placeholder="±HP" value={hpDelta} onChange={e=>setHpDelta(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&hpDelta&&(onUpdateHP(char.currentHP+parseInt(hpDelta)||0),setHpDelta(""))}/>
                <button className="btn btn-sm btn-r" onClick={()=>hpDelta&&(onUpdateHP(char.currentHP+parseInt(hpDelta)||0),setHpDelta(""))}>OK</button>
              </div>
            </div>
            {/* Stat grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>
              {STATS.map(s=>{
                const base=char.stats[s],bonus=bonuses[s]||0,total=base+bonus;
                return(
                  <div key={s} className="stat-b">
                    <div style={{fontSize:9,color:"var(--muted)",fontFamily:"Cinzel,serif"}}>{STAT_N[s]}</div>
                    <div style={{fontFamily:"Cinzel,serif",fontSize:18,fontWeight:700,color:bonus>0?"var(--gold)":"var(--text)"}}>{total}</div>
                    <div style={{fontSize:11,color:"var(--muted)"}}>{modStr(total)}</div>
                  </div>
                );
              })}
            </div>
            {/* Key combat */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>
              {[["CA",ac],["Prof",`+${prof}`],["Vel",`${RACES[char.race]&&spd}ft`]].map(([l,v])=>(
                <div key={l} className="stat-b">
                  <div style={{fontSize:9,color:"var(--muted)",fontFamily:"Cinzel,serif"}}>{l}</div>
                  <div style={{fontFamily:"Cinzel,serif",fontSize:16,fontWeight:700,color:"var(--gold)"}}>{v}</div>
                </div>
              ))}
            </div>
            {/* Saves */}
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:3,padding:10}}>
              <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:"var(--muted)",marginBottom:6,textTransform:"uppercase",letterSpacing:".08em"}}>Tiradas de Salvación</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2}}>
                {STATS.map(s=>{
                  const proficient=CLASSES[char.class]&&saves.includes(s);
                  const total=mod(char.stats[s])+(bonuses[s]||0)+(proficient?prof:0);
                  return(
                    <div key={s} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"2px 4px"}}>
                      <span style={{color:proficient?"var(--gold)":"var(--muted)"}}>{proficient?"◆":"◇"} {STAT_N[s]}</span>
                      <span style={{fontFamily:"Cinzel,serif"}}>{total>=0?"+":""}{total}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── WALLET TAB ── */}
        {activeTab==="wallet" && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:"var(--muted)",letterSpacing:".1em",textTransform:"uppercase"}}>Monedero del Aventurero</div>
            <div className="wallet">
              {COIN_TYPES.map(({type,icon,label,color})=>(
                <div key={type} className="coin-box" style={{borderColor:`${color}44`}}>
                  <div className="coin-icon">{icon}</div>
                  <div className="coin-amt" style={{color}}>{wallet[type]||0}</div>
                  <div className="coin-label">{label}</div>
                  <div style={{display:"flex",gap:4,justifyContent:"center",marginTop:6}}>
                    <button className="btn btn-sm" style={{fontSize:10,padding:"3px 8px"}} onClick={()=>addCoin(type,-1)}>−1</button>
                    <button className="btn btn-sm btn-g" style={{fontSize:10,padding:"3px 8px"}} onClick={()=>addCoin(type,1)}>+1</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:3,padding:12}}>
              <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:"var(--muted)",marginBottom:8}}>Ajuste rápido</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                {[["gold","+5 oro",5],["gold","+10 oro",10],["gold","-5 oro",-5],["silver","+10 plata",10],["copper","+20 cobre",20],["gold","+50 oro",50]].map(([type,label,amt],i)=>(
                  <button key={i} className="btn btn-sm" style={{fontSize:10}} onClick={()=>addCoin(type,amt)}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{background:"rgba(201,168,76,.06)",border:"1px solid var(--gold-dim)",borderRadius:3,padding:10}}>
              <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:"var(--gold)",marginBottom:4}}>Conversión estándar</div>
              <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>1 po = 10 pp = 100 pc</div>
            </div>
          </div>
        )}
      </div>

      {/* Item detail modal */}
      {showItemDetail && (
        <div className="overlay" onClick={()=>setShowItemDetail(null)}>
          <div className="modal" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                <span style={{fontSize:36}}>{showItemDetail.e}</span>
                <div>
                  <div style={{fontFamily:"Cinzel,serif",fontSize:16,color:"var(--gold)"}}>{showItemDetail.n}</div>
                  <div style={{fontSize:12,color:"var(--muted)"}}>
                    {canEquipItem(showItemDetail) ? `Slot: ${getItemMetaLabel(showItemDetail)}` : `Tipo: ${getItemTypeLabel(showItemDetail)}`}
                    <span className={`badge badge-${showItemDetail.rar}`} style={{marginLeft:8}}>
                      {showItemDetail.rar==="c"?"Común":showItemDetail.rar==="u"?"Infrecuente":"Raro"}
                    </span>
                  {showItemDetail.magical && <span className="badge badge-l" style={{marginLeft:4}}>✦ Mágico</span>}
                </div>
              </div>
            </div>
            <div style={{fontSize:14,color:"var(--text)",marginBottom:10,lineHeight:1.5}}>{showItemDetail.desc}</div>
            {showItemDetail.dmg && <div style={{fontSize:13,color:"var(--gold)",marginBottom:6}}>⚔ Daño: {showItemDetail.dmg} {showItemDetail.dt}</div>}
            {showItemDetail.ac && <div style={{fontSize:13,color:"var(--gold)",marginBottom:6}}>🛡 CA: {showItemDetail.ac}{showItemDetail.acDex?" + DES":""}</div>}
            {showItemDetail.bonus && <div style={{fontSize:13,color:"#5cb85c",marginBottom:6}}>
              {Object.entries(showItemDetail.bonus).map(([k,v])=>`+${v} ${STAT_N[k]}`).join(", ")}
            </div>}
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:14}}>Valor: {showItemDetail.val} po · Peso: {showItemDetail.w} lb</div>
            <div style={{display:"flex",gap:8}}>
              {canEquipItem(showItemDetail)&&<button className="btn btn-r" style={{flex:1}} onClick={()=>{tryEquip(showItemDetail.id,showItemDetail.slot);setShowItemDetail(null);}}>
                Equipar
              </button>}
              <button className="btn" style={{flex:1}} onClick={()=>setShowItemDetail(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Req warning */}
      {showReq && (
        <div className="overlay" onClick={()=>setShowReq(null)}>
          <div className="modal" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"Cinzel,serif",fontSize:16,color:"#E24B4A",marginBottom:10}}>⚠ Requisitos no cumplidos</div>
            <div style={{fontSize:14,color:"var(--gold)",marginBottom:6}}>{showReq.item.n}</div>
            {showReq.issues.map(i=><div key={i} style={{color:"#E24B4A",fontSize:13,marginBottom:3}}>✗ {i}</div>)}
            <div style={{fontSize:13,color:"var(--muted)",margin:"12px 0"}}>Podés intentarlo igual con penalizaciones.</div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-r" style={{flex:1}} onClick={()=>{onEquip(showReq.itemId,showReq.slot,true);setShowReq(null);}}>⚠ Intentar igual</button>
              <button className="btn" style={{flex:1}} onClick={()=>setShowReq(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── DICE PANEL ──────────────────────────────────────────────
