// Room, storage and account helpers
// Loaded by index.html. Keep script order unless moving to a build step.

const normalizeRoom=room=>{
  if(!room)return room;
  const players=Object.fromEntries(Object.entries(room.players||{}).map(([id,p])=>[
    id,
    {
      ...p,
      isHost:id===room.hostId||!!p.isHost,
      isDM:id===room.hostId,
      character:normalizeCharacter(p.character),
    }
  ]));
  return{
    ...room,
    dmPlayerId:room.hostId||room.dmPlayerId||null,
    dmUid:room.dmUid||null,
    dmName:room.dmName||"",
    createdByUid:room.createdByUid||room.dmUid||null,
    lifecycleStatus:room.lifecycleStatus||"active",
    lastActivityAt:room.lastActivityAt||room.createdAt||Date.now(),
    diceEnabled:!!room.diceEnabled,
    dmStock:{
      items:{...((room.dmStock&&room.dmStock.items)||{})},
      coins:normalizeWallet(room.dmStock&&room.dmStock.coins),
    },
    players,
  };
};
const STORAGE_KEYS={
  playerId:"dnd.firebase.playerId",
  playerName:"dnd.firebase.playerName",
  lastRoomId:"dnd.firebase.lastRoomId",
  lastRoomName:"dnd.firebase.lastRoomName",
};
const APP_TITLE="MESA DUNGEON";
const OWNER_ROLE="owner";
const DM_ROLE="dm";
const STATUS_PENDING="pending";
const STATUS_APPROVED="approved";
const STATUS_REVOKED="revoked";
const ACTIVE_ROOM_LIMIT=3;
const storageGet=(key,fallback="")=>{
  try{
    const value=localStorage.getItem(key);
    return value===null?fallback:value;
  }catch(_e){return fallback;}
};
const storageSet=(key,value)=>{
  try{
    if(value===undefined||value===null||value==="")localStorage.removeItem(key);
    else localStorage.setItem(key,String(value));
  }catch(_e){}
};
const nameKey=value=>(value||"").trim().toLowerCase();
const buildSessionRecord=room=>({
  id:(room&&room.id)||"",
  name:(room&&room.name)||"Partida sin nombre",
  code:(room&&room.id)||"",
  dmUid:(room&&room.dmUid)||"",
  dmName:(room&&room.dmName)||((room&&room.players&&room.hostId&&room.players[room.hostId]&&room.players[room.hostId].name)||""),
  hostId:(room&&room.hostId)||"",
  hostName:(room&&room.players&&room.hostId&&room.players[room.hostId]&&room.players[room.hostId].name)||"",
  playerCount:Object.keys((room&&room.players)||{}).length,
  players:Object.values((room&&room.players)||{}).map(p=>(p.character&&p.character.name)||p.name),
  gameState:(room&&room.gameState)||"lobby",
  lifecycleStatus:(room&&room.lifecycleStatus)||"active",
  createdAt:(room&&room.createdAt)||Date.now(),
  updatedAt:(room&&room.lastActivityAt)||Date.now(),
});
const roleBadgeMeta=account=>{
  if(!account)return{label:"Sin rol",cls:"badge-c"};
  if(account.role===OWNER_ROLE&&account.status===STATUS_APPROVED)return{label:"Owner",cls:"badge-l"};
  if(account.role===DM_ROLE&&account.status===STATUS_APPROVED)return{label:"DM",cls:"badge-r"};
  if(account.role===DM_ROLE&&account.status===STATUS_PENDING)return{label:"DM pendiente",cls:"badge-p"};
  if(account.status===STATUS_REVOKED)return{label:"Acceso revocado",cls:"badge-x"};
  return{label:"Sin rol",cls:"badge-c"};
};
const isApprovedRole=(account,role)=>account&&account.role===role&&account.status===STATUS_APPROVED;
const buildAccountRecord=(user,extra={})=>({
  uid:user.uid,
  email:user.email||"",
  displayName:extra.displayName||user.displayName||"",
  role:extra.role||DM_ROLE,
  status:extra.status||STATUS_PENDING,
  requestedAt:extra.requestedAt||Date.now(),
  approvedAt:extra.approvedAt||null,
  approvedBy:extra.approvedBy||null,
  revokedAt:extra.revokedAt||null,
  revokedBy:extra.revokedBy||null,
});
const friendlyAuthError=err=>{
  const code=(err&&err.code)||"";
  if(code.includes("invalid-email"))return"El email no es válido.";
  if(code.includes("email-already-in-use"))return"Ese email ya está registrado.";
  if(code.includes("weak-password"))return"La contraseña debe tener al menos 6 caracteres.";
  if(code.includes("invalid-credential")||code.includes("wrong-password")||code.includes("user-not-found"))return"Email o contraseña incorrectos.";
  if(code.includes("too-many-requests"))return"Demasiados intentos. Probá de nuevo en unos minutos.";
  return (err&&err.message)||"No se pudo completar la autenticación.";
};
