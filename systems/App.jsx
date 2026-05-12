// Application controller
// Loaded by index.html. Keep script order unless moving to a build step.

function App() {
  const [screen,setScreen]=useState("lobby");
  const [playerId, setPlayerId]=useState(()=>storageGet(STORAGE_KEYS.playerId)||genId(12));
  const [playerName,setPlayerName]=useState(()=>storageGet(STORAGE_KEYS.playerName)||"");
  const [roomId,setRoomId]=useState(null);
  const [roomData,setRoomData]=useState(null);
  const [character,setCharacter]=useState(null);
  const [notif,setNotif]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [sessions,setSessions]=useState([]);
  const [authReady,setAuthReady]=useState(false);
  const [authUser,setAuthUser]=useState(null);
  const [accounts,setAccounts]=useState(null);
  const [systemInfo,setSystemInfo]=useState(null);
  const [lastRoom,setLastRoom]=useState(()=>{
    const id=storageGet(STORAGE_KEYS.lastRoomId);
    const name=storageGet(STORAGE_KEYS.lastRoomName);
    return id?{id,name}:null;
  });
  const unsubRef=useRef(null);
  const [totalVisits, setTotalVisits] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);

  const notify=(msg,ms=3500)=>{setNotif(msg);setTimeout(()=>setNotif(""),ms);};
  const controlReady=authReady&&accounts!==null&&systemInfo!==null;
  const ownerUid=(systemInfo&&systemInfo.ownerUid)||null;
  const ownerExists=!!ownerUid;
  const account=authUser&&accounts?accounts[authUser.uid]||null:null;
  const isOwner=isApprovedRole(account,OWNER_ROLE);
  const isApprovedDm=isApprovedRole(account,DM_ROLE);
  const canCreateRoom=isOwner||isApprovedDm;
 const safeAccounts = Object.values(accounts || {}).filter(Boolean);

const pendingDMs = safeAccounts.filter(
  acc => acc.role === DM_ROLE && acc.status === STATUS_PENDING
);
const approvedDMs = safeAccounts.filter(
  acc => acc.role === DM_ROLE && acc.status === STATUS_APPROVED
);
  const syncSessionIndex=async(room)=>{
    if(!room||!room.id)return;
    try{await fb.set(`sessions/${room.id}`,buildSessionRecord(room));}
    catch(e){console.error("syncSessionIndex error",e);}
  };

useEffect(()=>{storageSet(STORAGE_KEYS.playerId,playerId);},[playerId]);
useEffect(()=>{storageSet(STORAGE_KEYS.playerName,playerName);},[playerName]);
useEffect(()=>{
  let unsub=null;
  const start=()=>{
    unsub=authApi.listen(user=>{
      setAuthUser(user);
      setAuthReady(true);
      fb.increment("system/stats/totalVisits").catch(() => {});
      if(user&&user.uid){
        setPlayerId(user.uid);
        storageSet(STORAGE_KEYS.playerId,user.uid);
      }
    });
  };
  if(window._firebaseReady)start();
  else{
    const onReady=()=>start();
    window.addEventListener("firebase-ready",onReady,{once:true});
  }
  return()=>{
    if(typeof unsub==="function")unsub();
  };
},[]);
  
useEffect(() => {
  if (!authReady) return;
  if (!authUser) {
    setAccounts({});
    return;
  }
  let unsub = null;
  const start = () => {
    unsub = fb.listen("users", (data) => {
      setAccounts(data || {});
    });
  };
  if (window._firebaseReady) {
    start();
  } else {
    const onReady = () => start();
    window.addEventListener("firebase-ready", onReady, { once: true });
  }
  return () => {
    if (typeof unsub === "function") unsub();
  };
}, [authReady, authUser]);

const authUid = authUser ? authUser.uid : null;

useEffect(()=>{
  let unsub=null;
  const start=()=>{
    unsub=fb.listen("system",data=>setSystemInfo(data||{}));
  };
  if(window._firebaseReady)start();
  else{
    const onReady=()=>start();
    window.addEventListener("firebase-ready",onReady,{once:true});
  }
  return()=>{
    if(typeof unsub==="function")unsub();
  };
},[]);

useEffect(()=>{
  const unsub = fb.listen("system/stats/totalVisits", data=>{
    setTotalVisits(data||0);
  });
  return()=>{ if(typeof unsub==="function")unsub(); };
},[]);

useEffect(()=>{
  if(!roomId || !(roomData && roomData.name)) return;
  const latest={id:roomId,name:roomData.name};
  setLastRoom(latest);
  storageSet(STORAGE_KEYS.lastRoomId,latest.id);
  storageSet(STORAGE_KEYS.lastRoomName,latest.name);
},[roomId, roomData && roomData.name]);

const handleAuthLogin=async({email,password})=>{
  try{
    await authApi.signIn(email,password);
    notify("Sesión iniciada");
  }catch(e){
    notify(friendlyAuthError(e));
  }
};

const handleAuthRegister=async({displayName,email,password})=>{
  try{
    const cred=await authApi.register(email,password,displayName.trim());
    await authApi.sendVerification(cred.user);
    if(displayName.trim()){
      await authApi.updateProfile(cred.user,{displayName:displayName.trim()});
    }
    notify("Cuenta creada. Revisá tu email para verificar antes de continuar.");
  }catch(e){
    notify(friendlyAuthError(e));
  }
};

  const handlePlayerLogin = async ({ email, password }) => {
  try {
    await authApi.signIn(email, password);
    notify("Sesión iniciada");
  } catch(e) {
    notify(friendlyAuthError(e));
  }
};

const handlePlayerRegister = async ({ displayName, email, password }) => {
  try {
    const cred = await window._fbCreateUser(window._fbAuth, email, password);
    const user = cred.user;
    await authApi.sendVerification(user);
    if (displayName.trim()) {
      await window._fbUpdateProfile(user, { displayName: displayName.trim() });
    }
    await window._fbSet(window._fbRef(window._fbDb, `users/${user.uid}`), {
      uid: user.uid,
      email: user.email,
      displayName: displayName.trim() || "",
      role: "player",
      status: "approved",
      requestedAt: Date.now(),
      approvedAt: Date.now(),
    });
    setPlayerName(displayName.trim());
    notify("¡Cuenta creada! Revisá tu email y hacé click en el link para verificar tu cuenta.");
  } catch(e) {
    notify(friendlyAuthError(e));
  }
};

const handleResendVerification=async()=>{
  const user=authApi.current();
  if(!user)return notify("Primero inicia sesion.");
  if(user.emailVerified)return notify("Tu email ya esta verificado.");
  try{
    await authApi.sendVerification(user);
    notify("Email de verificacion reenviado. Revisa tu bandeja de entrada.");
  }catch(e){
    notify(friendlyAuthError(e));
  }
};

  

  const handleAuthLogout=async()=>{
    try{
      await authApi.signOut();
      setScreen("lobby");
      notify("Sesión cerrada");
    }catch(e){notify("No se pudo cerrar la sesión");}
  };

  const handleClaimOwner=async()=>{
    if(!authUser)return notify("Primero iniciá sesión.");
    if(ownerExists&&ownerUid!==authUser.uid)return notify("Ya existe un Owner global.");
    try{
      const record=buildAccountRecord(authUser,{
        displayName:authUser.displayName||((authUser.email&&authUser.email.split("@")[0])||"Owner"),
        role:OWNER_ROLE,
        status:STATUS_APPROVED,
        approvedAt:Date.now(),
        approvedBy:authUser.uid,
      });
      await fb.set(`users/${authUser.uid}`,record);
      await fb.set("system",{ownerUid:authUser.uid,ownerName:record.displayName,updatedAt:Date.now()});
      notify("Owner global configurado");
    }catch(e){notify("No se pudo reclamar el rol Owner.");}
  };

  const handleRequestDm=async({displayName})=>{
    if(!authUser)return notify("Primero iniciá sesión.");
    try{
      if(displayName.trim()&&(authUser.displayName||"")!==displayName.trim()){
        await authApi.updateProfile(authUser,{displayName:displayName.trim()});
      }
      const record=buildAccountRecord(authUser,{
        displayName:displayName.trim(),
        role:DM_ROLE,
        status:STATUS_PENDING,
        requestedAt:Date.now(),
      });
      await fb.set(`users/${authUser.uid}`,record);
      notify("Solicitud DM enviada al Owner");
    }catch(e){notify(friendlyAuthError(e));}
  };

  const handleApproveDm=async(uid)=>{
    if(!isOwner)return notify("Solo el Owner puede aprobar DMs.");
    const current=accounts&&accounts[uid];
    if(!current)return notify("No encontré esa solicitud.");
    try{
      await fb.set(`users/${uid}`,{
        ...current,
        role:DM_ROLE,
        status:STATUS_APPROVED,
        approvedAt:Date.now(),
        approvedBy:authUser.uid,
        revokedAt:null,
        revokedBy:null,
      });
      notify(`DM aprobado: ${current.displayName||current.email}`);
    }catch(e){notify("No se pudo aprobar ese DM.");}
  };

  const handleRevokeDm=async(uid)=>{
    if(!isOwner)return notify("Solo el Owner puede revocar DMs.");
    const current=accounts&&accounts[uid];
    if(!current)return notify("No encontré esa cuenta.");
    try{
      await fb.set(`users/${uid}`,{
        ...current,
        role:DM_ROLE,
        status:STATUS_REVOKED,
        revokedAt:Date.now(),
        revokedBy:authUser.uid,
      });
      notify(`Acceso revocado: ${current.displayName||current.email}`);
    }catch(e){notify("No se pudo revocar ese DM.");}
  };

  // ── Firebase room listener ──
  useEffect(()=>{
    if(!roomId)return;

    if(unsubRef.current)unsubRef.current();

    unsubRef.current=fb.listen(`rooms/${roomId}`,(data)=>{
      if(!data)return;

      const normalized=normalizeRoom(data);

      setRoomData(normalized);

      const me=normalized.players&&normalized.players[playerId];

      setCharacter((me&&me.character)||null);
    });

    return()=>{
      if(unsubRef.current)unsubRef.current();
    };
  },[roomId,playerId]);

  const updateRoom=async(updater)=>{
    try{

      const curRaw=await fb.get(`rooms/${roomId}`);

      const cur=normalizeRoom(curRaw||roomData);

      const updated=normalizeRoom({
        ...updater(cur),
        lastActivityAt:Date.now()
      });

      await fb.set(`rooms/${roomId}`, JSON.parse(JSON.stringify(updated)));

      syncSessionIndex(updated);

      setRoomData(updated);

      const me=updated&&updated.players&&updated.players[playerId];

      setCharacter((me&&me.character)||null);

      return updated;

    }catch(e){

      console.error("updateRoom error",e);
    }
  };

  const levelUpPlayer=async(targetPlayerId,hpGainInput=null)=>{

    console.log("LEVEL UP", targetPlayerId);

    let parsedHpGain=parseInt(hpGainInput,10);

    if(!Number.isFinite(parsedHpGain)){

      const promptValue=window.prompt(
        "HP ganado al subir de nivel (tirada de dados + CON):",
        ""
      );

      if(promptValue===null)return;

      parsedHpGain=parseInt(promptValue,10);
    }

    if(!Number.isFinite(parsedHpGain)||parsedHpGain<1){

      notify("Ingresa un HP ganado valido para subir nivel.");

      return;
    }

    await updateRoom(d=>{

      const targetPlayer=d.players&&d.players[targetPlayerId];

      console.log("PLAYER", targetPlayer);

      const char=targetPlayer&&targetPlayer.character;

      if(!char)return d;

      const newLevel=(char.level||1)+1;

      const newMaxHP=(char.maxHP||1)+parsedHpGain;

      const newCurrentHP=Math.min(
        newMaxHP,
        (char.currentHP||0)+parsedHpGain
      );

      return{
        ...d,

        players:{
          ...(d.players||{}),

          [targetPlayerId]:{
            ...targetPlayer,

            character:{
              ...char,
              level:newLevel,
              maxHP:newMaxHP,
              currentHP:newCurrentHP
            }
          }
        },

        messages:[
          ...(d.messages||[]),

          {
            id:Date.now(),
            t:"sys",
            text:`🔥 ${char.name} alcanzó el nivel ${newLevel}`,
            ts:Date.now()
          }
        ]
      };
    });

    notify(`Nivel aumentado (+${parsedHpGain} HP)`);
  };

  const callAI=async(prompt,secret=false)=>{

    setAiLoading(true);

    try{

      const players=Object.values((roomData&&roomData.players)||{})
        .filter(p=>p.character)
        .map(
          p=>
            `${p.name}: ${(RACES[p.character.race]&&RACES[p.character.race].n)||""} ${(CLASSES[p.character.class]&&CLASSES[p.character.class].n)||""} Nv${p.character.level} HP:${p.character.currentHP}/${p.character.maxHP}`
        )
        .join(", ")||"ninguno aún";

      const history=((roomData&&roomData.messages)||[])
        .slice(-8)
        .map(m=>`${m.senderName||"Sistema"}: ${m.text}`)
        .join("\n");

      const sys=`Eres el Dungeon Master de una partida de D&D 5e en español. Grupo: ${players}. Historial reciente:\n${history}\n\nSé épico, narrativo y aplica las reglas D&D 5e con precisión. Responde en español. Máximo 3 párrafos.`;

      const res=await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({
            model:"claude-sonnet-4-20250514",
            max_tokens:1000,
            system:sys,
            messages:[
              {
                role:"user",
                content:prompt
              }
            ]
          })
        }
      );

      const data=await res.json();

      const text=(data.content&&data.content[0]&&data.content[0].text)||
        "El DM contempla en silencio...";

      if(!secret){

        await updateRoom(d=>({
          ...d,

          messages:[
            ...(d.messages||[]),

            {
              id:Date.now(),
              t:"dm",
              text,
              senderName:"🎲 Dungeon Master",
              ts:Date.now()
            }
          ]
        }));
      }

      setAiLoading(false);

      return text;

    }catch(e){

      setAiLoading(false);

      notify("Error conectando con el DM IA");
    }
  };

  const createRoom=async(name,dmMode,roomName)=>{

    if(!canCreateRoom||!authUser){

      notify("Solo el Owner o un DM aprobado pueden crear partidas.");

      return;
    }

    if(!authUser.emailVerified){

      notify("Verificá tu email antes de crear una sala.");

      return;
    }

    const activeManagedRooms=sessions.filter(
      s=>
        s.dmUid===authUser.uid &&
        (s.lifecycleStatus||"active")==="active"
    );

    if(activeManagedRooms.length>=ACTIVE_ROOM_LIMIT){

      notify(
        `Límite alcanzado: ${ACTIVE_ROOM_LIMIT} partidas activas por DM.`
      );

      return;
    }

    const id=genId(6);

    const safeName=name.trim();

    const title=(roomName&&roomName.trim())||`Sala de ${safeName}`;

    const dmDisplayName=
      (account&&account.displayName)||
      authUser.displayName||
      safeName;

    const room=normalizeRoom({

      id,
      name:title,

      hostId:playerId,

      owner:authUser.uid,

      dmUid:authUser.uid,

      dmName:dmDisplayName,

      createdByUid:authUser.uid,

      dmMode,

      dmPlayerId:playerId,

      diceEnabled:false,

      dmStock:{
        items:{},
        coins:normalizeWallet()
      },

      players:{
        [playerId]:{
          id:playerId,
          authUid:authUser.uid,
          name:safeName,
          isHost:true,
          isDM:true,
          character:null,
          connected:true
        }
      },

      messages:[
        {
          id:Date.now(),
          t:"sys",
          text:`🏰 Sala creada. Código: ${id}`,
          ts:Date.now()
        }
      ],

      gameState:"lobby",

      createdAt:Date.now(),

      lastActivityAt:Date.now(),

      lifecycleStatus:"active",
    });

    await fb.set(`rooms/${id}`,room);

    await syncSessionIndex(room);

    setRoomId(id);

    setRoomData(room);

    setPlayerName(safeName);

    setScreen("character");

    notify(`✦ Partida creada: ${title} · Código: ${id}`);
  };

  const joinRoom=async(name,code)=>{

  if(!authUser){
    notify("Tenés que iniciar sesión para unirte a una sala.");
    return;
  }
  if(!authUser.emailVerified){
    notify("Verificá tu email antes de unirte a una sala. Revisá tu bandeja de entrada.");
    return;
  }

  const safeName=name.trim();
  const c=code.trim().toUpperCase();
  try{

      const data=normalizeRoom(await fb.get(`rooms/${c}`));

      if(!data){

        notify("Sala no encontrada");

        return;
      }

      const players=data.players||{};

      const existing=players[playerId];

      if(existing){

        await syncSessionIndex(data);

        setRoomId(c);

        setRoomData(data);

        setPlayerName(safeName);

        if(existing.character){

          setCharacter(existing.character);

          setScreen("game");

        }else{

          setScreen("character");
        }

        return;
      }

      const sameAuthEntry=authUser
        ? Object.entries(players).find(
            ([id,p])=>
              id!==playerId &&
              p.authUid===authUser.uid
          )
        : null;

      const sameNameEntry=Object.entries(players).find(
        ([id,p])=>
          id!==playerId &&
          nameKey(p.name)===nameKey(safeName)
      );

      const recoveredEntry=sameAuthEntry||sameNameEntry;

      if(recoveredEntry){

        const [oldId,oldPlayer]=recoveredEntry;

        await fb.set(`rooms/${c}/players/${playerId}`, {
  ...oldPlayer,
  id: playerId,
  name: safeName,
  authUid:
    oldPlayer.authUid ||
    (authUser && authUser.uid) ||
    null,
  character: oldPlayer.character || null,  // ✅ preserva el personaje
  connected: true
});

        await fb.remove(`rooms/${c}/players/${oldId}`);

        await fb.set(
          `rooms/${c}/lastActivityAt`,
          Date.now()
        );

        const reclaimed=normalizeRoom(
          await fb.get(`rooms/${c}`)
        );

        await syncSessionIndex(reclaimed);

        setRoomId(c);

        setRoomData(reclaimed);

        setPlayerName(safeName);

        if(reclaimed.players&&reclaimed.players[playerId]&&reclaimed.players[playerId].character){

          setCharacter(
            reclaimed.players[playerId].character
          );

          setScreen("game");

        }else{

          setScreen("character");
        }

        notify("Recuperaste tu lugar en la partida");

        return;
      }

      if(Object.keys(players).length>=10){

        notify("Sala llena (máx. 10)");

        return;
      }

      await fb.set(`rooms/${c}/players/${playerId}`,{
        id:playerId,
        authUid:(authUser && authUser.uid)||null,
        name:safeName,
        isHost:false,
        isDM:false,
        character:(await fb.get(`rooms/${c}/players/${playerId}`))&&character || null,
        connected:true
      });

      await fb.set(
        `rooms/${c}/lastActivityAt`,
        Date.now()
      );

      const updated=normalizeRoom(
        await fb.get(`rooms/${c}`)
      );

      await syncSessionIndex(updated);

      setRoomId(c);

      setRoomData(updated);

      setPlayerName(safeName);

      setScreen("character");

    }catch(e){

      console.error(e);

      notify("Error al unirse. Verificá el código.");
    }
  };

  const completeCharacter=async(char)=>{
  
    const safeChar = JSON.parse(JSON.stringify(char));
    setCharacter(safeChar);
    await updateRoom(d=>({
      ...d,
      players:{
        ...(d.players||{}),
        [playerId]:{
          ...((d.players && d.players[playerId]) || {}),
          character:safeChar
        }
      },

      messages:[
        ...(d.messages||[]),

        {
          id:Date.now(),
          t:"sys",
          text:`🎭 ${playerName} entró como ${(RACES[char.race]&&RACES[char.race].n)||""} ${(CLASSES[char.class]&&CLASSES[char.class].n)||""}: ${char.name}.`,
          ts:Date.now()
        }
      ]
    }));

    setScreen("game");

    if(
      roomData&&roomData.dmMode==="ai"||
      roomData&&roomData.dmMode==="hybrid"
    ){

      setTimeout(()=>{

        callAI(
         `${playerName} creó su personaje: ${char.name}, ${(RACES[char.race]&&RACES[char.race].n)||""} ${(CLASSES[char.class]&&CLASSES[char.class].n)||""} nivel 1. HP:${char.maxHP} CA:${char.ac}. Dale una bienvenida épica (2 párrafos).`
        );

      },800);
    }
  };

  const saveSession=async()=>{

    try{

      await syncSessionIndex(roomData);

      notify("💾 Sesión guardada en Firebase");

    }catch(e){

      notify("Error guardando sesión");
    }
  };

  return(
  <>
    {notif&&<div className="notif">{notif}</div>}

    {screen==="lobby"&&<Lobby
      onCreateRoom={createRoom}
      onJoinRoom={joinRoom}
      sessions={sessions}
      lastRoom={lastRoom}
      initialName={playerName||(authUser&&authUser.displayName)||""}
      authReady={controlReady}
      authUser={authUser}
      account={account}
      ownerExists={ownerExists}
      canCreateRoom={canCreateRoom}
      onAuthLogin={handleAuthLogin}
      onAuthRegister={handleAuthRegister}
      onAuthLogout={handleAuthLogout}
      onClaimOwner={handleClaimOwner}
      onRequestDM={handleRequestDm}
      onResendVerification={handleResendVerification}
      showOwnerPanel={isOwner}
      ownerAccount={account}
      pendingDMs={pendingDMs}
      approvedDMs={approvedDMs}
      onApproveDm={handleApproveDm}
      onRevokeDm={handleRevokeDm}
      onPlayerLogin={handlePlayerLogin}
      onPlayerRegister={handlePlayerRegister}
      totalVisits={totalVisits}
    />}

    {screen==="character"&&(
      <CharacterCreation 
        onComplete={completeCharacter} 
        playerName={playerName}
      />
    )}

    {screen==="game"&&roomData&&(
      <>
        <GameRoom 
          roomData={roomData} 
          character={character} 
          playerId={playerId} 
          authUid={(authUser && authUser.uid)||null} 
          updateRoom={updateRoom} 
          playerName={playerName} 
          onSave={saveSession} 
          aiLoading={aiLoading} 
          callAI={callAI} 
          notify={notify}
          levelUpPlayer={levelUpPlayer}
        />

        {/* 🔥 SOLICITUDES DM */}
        {pendingDMs.length > 0 && (
          <div style={{marginTop:20, padding:10, border:"1px solid gray"}}>
            <h3>Solicitudes DM</h3>

            {pendingDMs.map((dm,i) => (
              <div key={i} style={{marginBottom:8}}>
                <div>{dm.email}</div>
                <div>Estado: pendiente</div>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </>
);
}
