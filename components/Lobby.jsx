// Lobby and room selection UI
// Loaded by index.html. Keep script order unless moving to a build step.

const Lobby = ({ onCreateRoom, onJoinRoom, sessions, lastRoom, initialName, authReady, authUser, account, ownerExists, canCreateRoom, onAuthLogin, onAuthRegister, onAuthLogout, onClaimOwner, onRequestDM, onResendVerification, showOwnerPanel, ownerAccount, pendingDMs, approvedDMs, onApproveDm, onRevokeDm, onPlayerLogin, onPlayerRegister, totalVisits }) => {
  const [pname,setPname]=useState(initialName||"");
  const [code,setCode]=useState("");
  const [roomName,setRoomName]=useState("");
  const [dmMode,setDmMode]=useState("ai");
  const [tab,setTab]=useState("create");
  const [firebaseOk,setFirebaseOk]=useState(!!window._firebaseReady);
  const [search,setSearch]=useState("");
  const [muted, setMuted] = useState(false);
  const [roleScreen, setRoleScreen] = useState("choose");
  const [started, setStarted] = useState(false);
  const audioRef = useRef(null);
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem("tutorial_lobby_done"));

  useEffect(()=>{
    const h=()=>setFirebaseOk(true);
    window.addEventListener("firebase-ready",h);
    return()=>window.removeEventListener("firebase-ready",h);
  },[]);

  useEffect(()=>{setPname(initialName||"");},[initialName]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const handleStart = () => {
    const audio = new Audio("https://soundimage.org/wp-content/uploads/2014/08/RPG-Theme.mp3");
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    audio.play().catch(() => {});
    setStarted(true);
  };

  const filteredSessions=(sessions||[]).filter(s=>{
    const q=search.trim().toLowerCase();
    if(!q)return true;
    return (s.name||"").toLowerCase().includes(q)||(s.code||s.id||"").toLowerCase().includes(q);
  });


  if (!started) return (
    <div style={{minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
      <style>{CSS}</style>
      <h1 style={{fontFamily:"Cinzel,serif", fontSize:40, color:"var(--gold)", marginBottom:8}}>⚔ MESA DUNGEON</h1>
      <div style={{fontFamily:"Cinzel,serif", fontSize:12, color:"var(--muted)", marginBottom:32}}>Mesa de Rol Online</div>
      <button className="btn btn-r" style={{padding:"16px 48px", fontSize:18}} onClick={handleStart}>
        Comenzar Aventura
      </button>
    </div>
  );

  if (roleScreen === "choose") return (
    <div style={{minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20}}>
      <style>{CSS}</style>
      {showTutorial && <Tutorial
  steps={TUTORIAL_STEPS_LOBBY}
  onClose={()=>{setShowTutorial(false);localStorage.setItem("tutorial_lobby_done","1");}}
/>}
      <button className="btn btn-sm" onClick={() => setMuted(m => !m)} style={{position:"fixed", top:12, right:12, zIndex:999}}>
        {muted ? "🔇" : "🔊"}
      </button>
      <div style={{textAlign:"center", marginBottom:40}}>
        <div style={{fontSize:11, color:"var(--muted)", fontFamily:"Cinzel,serif", letterSpacing:".3em", textTransform:"uppercase", marginBottom:8}}>✦ Mesa de Rol Online ✦</div>
        <h1 style={{fontFamily:"Cinzel,serif", fontSize:36, fontWeight:700, color:"var(--gold)", marginBottom:8}}>{APP_TITLE}</h1>
        <div style={{fontSize:13, color:"var(--muted)", fontFamily:"Cinzel,serif"}}>¿Cómo vas a jugar hoy?</div>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, width:"100%", maxWidth:560}}>
        <div className="card" style={{padding:28, textAlign:"center", cursor:"pointer", border:"1px solid var(--gold-dim)"}}
          onClick={() => setRoleScreen("dm")}
          onMouseOver={e => e.currentTarget.style.borderColor="var(--gold)"}
          onMouseOut={e => e.currentTarget.style.borderColor="var(--gold-dim)"}>
          <div style={{fontSize:48, marginBottom:12}}>🎭</div>
          <div style={{fontFamily:"Cinzel,serif", fontSize:16, color:"var(--gold)", marginBottom:8}}>Owner / DM</div>
          <div style={{fontSize:12, color:"var(--muted)", lineHeight:1.5}}>Crear y gestionar partidas. Narrar la aventura.</div>
        </div>
        <div className="card" style={{padding:28, textAlign:"center", cursor:"pointer", border:"1px solid var(--gold-dim)"}}
          onClick={() => setRoleScreen("player")}
          onMouseOver={e => e.currentTarget.style.borderColor="var(--gold)"}
          onMouseOut={e => e.currentTarget.style.borderColor="var(--gold-dim)"}>
          <div style={{fontSize:48, marginBottom:12}}>⚔</div>
          <div style={{fontFamily:"Cinzel,serif", fontSize:16, color:"var(--gold)", marginBottom:8}}>Jugador</div>
          <div style={{fontSize:12, color:"var(--muted)", lineHeight:1.5}}>Unirse a una aventura. Crear tu personaje.</div>
        </div>
      </div>
      <div style={{marginTop:16, fontSize:11, color:"var(--muted)", fontFamily:"Cinzel,serif"}}>
        {firebaseOk ? <><span className="online-dot"/>Firebase conectado</> : <span style={{color:"#E24B4A"}}>⏳ Conectando...</span>}
      </div>
    </div>
  );

  if (roleScreen === "player") return (
    <div style={{minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20}}>
      <style>{CSS}</style>
      <button className="btn btn-sm" onClick={() => setMuted(m => !m)} style={{position:"fixed", top:12, right:12, zIndex:999}}>
        {muted ? "🔇" : "🔊"}
      </button>
      <button className="btn btn-sm" onClick={() => setRoleScreen("choose")} style={{position:"fixed", top:12, left:12, zIndex:999}}>
        ← Volver
      </button>
      <div style={{textAlign:"center", marginBottom:24}}>
        <h1 style={{fontFamily:"Cinzel,serif", fontSize:32, color:"var(--gold)", marginBottom:4}}>⚔ Jugadores</h1>
        <div style={{fontSize:12, color:"var(--muted)", fontFamily:"Cinzel,serif"}}>Uníte a la aventura</div>
      </div>
      <div style={{width:"100%", maxWidth:480}}>
        <PlayerAuthCard
          authUser={authUser}
          account={account}
          onLogin={onPlayerLogin}
          onRegister={onPlayerRegister}
          onLogout={onAuthLogout}
          onResendVerification={onResendVerification}
        />
        <div style={{marginBottom:14}}>
          <label style={{fontFamily:"Cinzel,serif", fontSize:11, color:"var(--muted)", letterSpacing:".1em", textTransform:"uppercase", display:"block", marginBottom:6}}>Tu Nombre</label>
          <input className="inp" placeholder="¿Cómo te llaman, aventurero?" value={pname} onChange={e=>setPname(e.target.value)} style={{fontSize:15}}/>
        </div>
        <div style={{display:"flex", background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:3, marginBottom:14, padding:2}}>
          {[["join","Unirse con código"],["resume","Continuar partida"]].map(([id,l])=>(
            <button key={id} className={`tab${tab===id?" act":""}`} style={{flex:1}} onClick={()=>setTab(id)}>{l}</button>
          ))}
        </div>
        {tab==="join"&&<div className="card" style={{padding:18}}>
          <label style={{fontFamily:"Cinzel,serif", fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:6}}>Código de Sala</label>
          <input className="inp" placeholder="Código de 6 letras (ej: X7KP2A)" value={code}
            onChange={e=>setCode(e.target.value.toUpperCase())} style={{fontSize:15,letterSpacing:".15em",textAlign:"center",textTransform:"uppercase",marginBottom:12}}/>
          <button className="btn btn-r" style={{width:"100%",padding:"11px",fontSize:14}}
            disabled={!pname.trim()||!code.trim()||!firebaseOk} onClick={()=>onJoinRoom(pname,code)}>🚪 Unirse a la Aventura</button>
        </div>}
        {tab==="resume"&&<div className="card" style={{padding:18}}>
          <input className="inp" placeholder="Nombre de partida o código..." value={search} onChange={e=>setSearch(e.target.value)} style={{fontSize:15,marginBottom:12}}/>
          {lastRoom&&lastRoom.id&&<div style={{background:"rgba(201,168,76,.06)",border:"1px solid var(--gold-dim)",borderRadius:3,padding:10,marginBottom:12}}>
            <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:"var(--gold)",marginBottom:4}}>Última partida usada</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
              <div>
                <div style={{fontSize:13,color:"var(--text)"}}>{lastRoom.name||"Partida sin nombre"}</div>
                <div style={{fontSize:11,color:"var(--muted)"}}>Código: {lastRoom.id}</div>
              </div>
              <button className="btn btn-sm btn-r" disabled={!pname.trim()||!firebaseOk} onClick={()=>onJoinRoom(pname,lastRoom.id)}>Volver</button>
            </div>
          </div>}
          <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:280,overflowY:"auto"}}>
            {filteredSessions.length===0
              ? <div style={{fontSize:12,color:"var(--muted)",textAlign:"center",padding:"18px 0"}}>No encontré partidas.</div>
              : filteredSessions.map(session=>(
                <div key={session.id} className="itm" style={{padding:"10px 12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                    <div style={{minWidth:0}}>
                      <div style={{fontFamily:"Cinzel,serif",fontSize:13,color:"var(--gold)"}}>{session.name||"Partida sin nombre"}</div>
                      <div style={{fontSize:11,color:"var(--muted)"}}>Código: {session.code||session.id} · {session.playerCount||0} jugadores</div>
                    </div>
                    <button className="btn btn-sm btn-r" disabled={!pname.trim()||!firebaseOk} onClick={()=>onJoinRoom(pname,session.code||session.id)}>Entrar</button>
                  </div>
                </div>
              ))}
          </div>
        </div>}
        <div className="footer-sign">
           © Lord Jonrick · <span style={{color:"var(--gold)"}}>⚔ {totalVisits}</span> aventureros han cruzado estas puertas
        </div>
     </div>
   </div>
  );

 

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{CSS}</style>
      <button className="btn btn-sm" onClick={() => setRoleScreen("choose")} style={{position:"fixed", top:12, left:12, zIndex:999}}>
  ← Volver
</button>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:11,color:"var(--muted)",fontFamily:"Cinzel,serif",letterSpacing:".3em",textTransform:"uppercase",marginBottom:8}}>✦ Mesa de Rol Online ✦</div>
        <h1 style={{fontFamily:"Cinzel,serif",fontSize:40,fontWeight:700,color:"var(--gold)",lineHeight:1.1,marginBottom:5}}>{APP_TITLE}</h1>
        <div style={{fontSize:12,color:"var(--muted)",fontFamily:"Cinzel,serif",letterSpacing:".15em"}}>Multijugador · Firebase · Owner / DM / Jugadores</div>
        <div style={{marginTop:10,fontSize:11,fontFamily:"Cinzel,serif"}}>
          {firebaseOk
            ? <><span className="online-dot"/>Firebase conectado — multijugador real activo</>
            : <span style={{color:"#E24B4A"}}>⏳ Conectando con Firebase...</span>}
        </div>
        <button 
  className="btn btn-sm" 
  onClick={() => setMuted(m => !m)}
  style={{position:"fixed", top:12, right:12, zIndex:999}}
>
  {muted ? "🔇" : "🔊"}
</button>
      </div>

      <div style={{width:"100%",maxWidth:560}}>
        <AuthCard
          authReady={authReady}
          authUser={authUser}
          account={account}
          ownerExists={ownerExists}
          onLogin={onAuthLogin}
          onRegister={onAuthRegister}
          onLogout={onAuthLogout}
          onClaimOwner={onClaimOwner}
          onRequestDM={onRequestDM}
          onResendVerification={onResendVerification}
        />

        <div style={{marginBottom:18}}>
          <label style={{fontFamily:"Cinzel,serif",fontSize:11,color:"var(--muted)",letterSpacing:".1em",textTransform:"uppercase",display:"block",marginBottom:6}}>Tu Nombre</label>
          <input className="inp" placeholder="¿Cómo te llaman, aventurero?" value={pname} onChange={e=>setPname(e.target.value)} style={{fontSize:15}}/>
        </div>
        <div style={{display:"flex",background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:3,marginBottom:18,padding:2}}>
          {[["create","Crear Sala"],["join","Unirse"],["resume","Continuar"]].map(([id,l])=>(
            <button key={id} className={`tab${tab===id?" act":""}`} style={{flex:1}} onClick={()=>setTab(id)}>{l}</button>
          ))}
        </div>
        {tab==="create"&&<div className="card" style={{padding:18}}>
          <div style={{marginBottom:14}}>
            <label style={{fontFamily:"Cinzel,serif",fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:6}}>Nombre de la Partida</label>
            <input className="inp" placeholder="Ej: La Mina del Dragón" value={roomName} onChange={e=>setRoomName(e.target.value)} style={{fontSize:15}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontFamily:"Cinzel,serif",fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:6}}>Modo DM</label>
            <select className="sel" value={dmMode} onChange={e=>setDmMode(e.target.value)} style={{width:"100%"}}>
              <option value="ai">🤖 DM con Inteligencia Artificial</option>
              <option value="human">👤 DM Humano</option>
              <option value="hybrid">🤝 DM Humano + Asistente IA</option>
            </select>
          </div>
          <button className="btn btn-r" style={{width:"100%",padding:"11px",fontSize:14}} disabled={!pname.trim()||!firebaseOk||!canCreateRoom}
            onClick={()=>onCreateRoom(pname,dmMode,roomName)}>⚔ Crear Sala Nueva</button>
          {!canCreateRoom&&<div style={{fontSize:11,color:"var(--muted)",textAlign:"center",marginTop:10,lineHeight:1.5}}>
            Solo el Owner y los DMs aprobados pueden crear partidas.
          </div>}
          {!firebaseOk&&<div style={{fontSize:11,color:"var(--muted)",textAlign:"center",marginTop:8}}>Esperando conexión Firebase...</div>}
        </div>}
        {tab==="join"&&<div className="card" style={{padding:18}}>
          <div style={{marginBottom:14}}>
            <label style={{fontFamily:"Cinzel,serif",fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:6}}>Código de Sala</label>
            <input className="inp" placeholder="Código de 6 letras (ej: X7KP2A)" value={code}
              onChange={e=>setCode(e.target.value.toUpperCase())} style={{fontSize:15,letterSpacing:".15em",textAlign:"center",textTransform:"uppercase"}}/>
          </div>
          <button className="btn btn-r" style={{width:"100%",padding:"11px",fontSize:14}}
            disabled={!pname.trim()||!code.trim()||!firebaseOk} onClick={()=>onJoinRoom(pname,code)}>🚪 Unirse a la Aventura</button>
          <div style={{fontSize:11,color:"var(--muted)",textAlign:"center",marginTop:10,lineHeight:1.5}}>
            Usá el mismo nombre de jugador para recuperar tu personaje y tu rol al volver.
          </div>
        </div>}
        {tab==="resume"&&<div className="card" style={{padding:18}}>
          <div style={{marginBottom:14}}>
            <label style={{fontFamily:"Cinzel,serif",fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:6}}>Buscar Partida</label>
            <input className="inp" placeholder="Nombre de partida o código..." value={search} onChange={e=>setSearch(e.target.value)} style={{fontSize:15}}/>
          </div>
            {lastRoom&&lastRoom.id&&<div style={{background:"rgba(201,168,76,.06)",border:"1px solid var(--gold-dim)",borderRadius:3,padding:10,marginBottom:12}}>            <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:"var(--gold)",marginBottom:4}}>Última partida usada en este dispositivo</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13,color:"var(--text)"}}>{lastRoom.name||"Partida sin nombre"}</div>
                <div style={{fontSize:11,color:"var(--muted)"}}>Código: {lastRoom.id}</div>
              </div>
              <button className="btn btn-sm btn-r" disabled={!pname.trim()||!firebaseOk} onClick={()=>onJoinRoom(pname,lastRoom.id)}>Volver</button>
            </div>
          </div>}
          <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:280,overflowY:"auto"}}>
            {filteredSessions.length===0
              ? <div style={{fontSize:12,color:"var(--muted)",textAlign:"center",padding:"18px 0"}}>No encontré partidas con ese nombre o código.</div>
              : filteredSessions.map(session=>(
                  <div key={session.id} className="itm" style={{padding:"10px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                      <div style={{minWidth:0}}>
                        <div style={{fontFamily:"Cinzel,serif",fontSize:13,color:"var(--gold)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{session.name||"Partida sin nombre"}</div>
                        <div style={{fontSize:11,color:"var(--muted)"}}>Código: {session.code||session.id} · Jugadores: {session.playerCount||0}</div>
                        <div style={{fontSize:10,color:"var(--muted)"}}>Última actividad: {new Date(session.updatedAt||session.createdAt||Date.now()).toLocaleString("es-AR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</div>
                      </div>
                      <button className="btn btn-sm btn-r" disabled={!pname.trim()||!firebaseOk} onClick={()=>onJoinRoom(pname,session.code||session.id)}>Entrar</button>
                    </div>
                  </div>
                ))}
          </div>
          <div style={{fontSize:11,color:"var(--muted)",textAlign:"center",marginTop:12,lineHeight:1.5}}>
            Para volver a tu personaje, entrá con el mismo nombre que usaste la vez anterior.
          </div>
        </div>}

        {showOwnerPanel&&<OwnerPanel
          ownerAccount={ownerAccount}
          pendingDMs={pendingDMs}
          approvedDMs={approvedDMs}
          sessions={sessions}
          onApproveDm={onApproveDm}
          onRevokeDm={onRevokeDm}
        />}

        <div className="footer-sign">© Lord Jonrick · <span style={{color:"var(--gold)"}}>⚔ {totalVisits}</span> aventureros han cruzado estas puertas</div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────
